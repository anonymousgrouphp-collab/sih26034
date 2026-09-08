"""Commodity Fact Extractor (SIH26034 - NyayaDrishti-LM)

Transforms raw OCR tokens into verified NormalizedCommodityFacts
conforming strictly to contracts/extraction/extraction_dto.py.
Integrates 2D spatial proximity graph linking, horizontal line clustering,
multi-line address block aggregation, and deterministic statutory parsing.
"""

import json
import logging
from pathlib import Path
import re
import sys
from typing import Any, Dict, List, Optional, Tuple, Union

# Ensure repository root is on sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from contracts.extraction.extraction_dto import (
    AddressValue,
    ConsumerCareValue,
    ExtractedFieldDTO,
    MRPValue,
    NetQuantityValue,
    NormalizedCommodityFacts,
    USPValue,
)

try:
    from contracts.calibration.calibration_dto import CalibrationDTO, CalibrationResult
except ImportError:
    CalibrationDTO = None  # type: ignore
    CalibrationResult = None  # type: ignore

try:
    from .parsers import StatutoryDeclarationParser
except ImportError:
    from parsers import StatutoryDeclarationParser

logger = logging.getLogger(__name__)


def _compute_union_bbox(bboxes: List[Any]) -> List[int]:
    """Computes enclosing bounding box [ymin, xmin, ymax, xmax] across multiple boxes."""
    valid = [b for b in bboxes if isinstance(b, (list, tuple)) and len(b) >= 4]
    if not valid:
        return [0, 0, 0, 0]
    ymins = [int(round(b[0])) for b in valid]
    xmins = [int(round(b[1])) for b in valid]
    ymaxs = [int(round(b[2])) for b in valid]
    xmaxs = [int(round(b[3])) for b in valid]
    return [min(ymins), min(xmins), max(ymaxs), max(xmaxs)]


class CommodityFactExtractor:
    """Deterministic Statutory Entity Extractor and 2D Spatial Proximity Graph Linker."""

    def __init__(self, line_y_tolerance: int = 15, horizontal_gap_threshold: int = 80):
        self.line_y_tolerance = line_y_tolerance
        self.horizontal_gap_threshold = horizontal_gap_threshold
        self.parser = StatutoryDeclarationParser

    def _resolve_calibration(
        self,
        ocr_data: Any,
        explicit_calibration: Optional[Any] = None
    ) -> Tuple[Optional[float], Optional[float]]:
        """Resolves (px_to_mm, calibration_confidence) from calibration object or embedded OCR payload.

        Seamlessly accepts Member 1's CalibrationResult, CalibrationDTO, dictionary, or raw float.
        """
        calib_obj = explicit_calibration
        if calib_obj is None:
            if isinstance(ocr_data, dict):
                calib_obj = ocr_data.get("calibration") or ocr_data.get("calibration_data")
            elif hasattr(ocr_data, "calibration"):
                calib_obj = getattr(ocr_data, "calibration", None)

        if calib_obj is None:
            if isinstance(ocr_data, dict) and "px_to_mm" in ocr_data:
                scale = ocr_data.get("px_to_mm")
                if isinstance(scale, (int, float)) and scale > 0:
                    return float(scale), 0.95
            return None, None

        # Numeric float or int
        if isinstance(calib_obj, (int, float)) and calib_obj > 0:
            return float(calib_obj), 0.95

        # CalibrationResult (from Member 1 contracts/calibration/calibration_dto.py)
        if hasattr(calib_obj, "is_calibrated") and hasattr(calib_obj, "calibration"):
            if not calib_obj.is_calibrated:
                return None, None
            inner = calib_obj.calibration
            px_to_mm = getattr(inner, "px_to_mm", None)
            conf = getattr(inner, "confidence", 0.95)
            if px_to_mm and px_to_mm > 0:
                return float(px_to_mm), float(conf) if conf is not None else 0.95
            return None, None

        # CalibrationDTO
        if hasattr(calib_obj, "px_to_mm"):
            method = getattr(calib_obj, "method", None)
            if method == "UNRESOLVED":
                return None, None
            px_to_mm = getattr(calib_obj, "px_to_mm", None)
            conf = getattr(calib_obj, "confidence", 0.95)
            if px_to_mm and px_to_mm > 0:
                return float(px_to_mm), float(conf) if conf is not None else 0.95
            return None, None

        # Dict representation
        if isinstance(calib_obj, dict):
            if calib_obj.get("is_calibrated") is False or calib_obj.get("method") == "UNRESOLVED":
                return None, None
            if "calibration" in calib_obj and isinstance(calib_obj["calibration"], dict):
                inner = calib_obj["calibration"]
                if inner.get("method") == "UNRESOLVED":
                    return None, None
                scale = inner.get("px_to_mm")
                conf = inner.get("confidence", 0.95)
                if scale and scale > 0:
                    return float(scale), float(conf) if conf is not None else 0.95
            scale = calib_obj.get("px_to_mm")
            conf = calib_obj.get("confidence", 0.95)
            if scale and scale > 0:
                return float(scale), float(conf) if conf is not None else 0.95

        return None, None

    def _normalize_tokens(self, ocr_data: Union[Dict[str, Any], Any]) -> Tuple[str, List[Dict[str, Any]], str]:
        """Extracts image_id, tokens list, and full_text from dict or DTO."""
        if hasattr(ocr_data, "model_dump"):
            data = ocr_data.model_dump()
        elif hasattr(ocr_data, "dict"):
            data = ocr_data.dict()
        elif isinstance(ocr_data, dict):
            data = ocr_data
        elif ocr_data is None:
            data = {}
        else:
            raise ValueError(f"Unsupported OCR input type: {type(ocr_data)}")

        image_id = data.get("image_id", "unknown_image")
        tokens = data.get("tokens", []) or []
        full_text = data.get("full_text", "")
        if not full_text and tokens:
            full_text = "\n".join(t.get("text", "") for t in tokens if t.get("text"))

        return image_id, tokens, full_text

    def _sort_tokens_reading_order(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sorts tokens into top-to-bottom, left-to-right 2D reading order."""
        if not tokens:
            return []

        # Sort primarily by vertical position ymin, then horizontal xmin
        return sorted(tokens, key=lambda t: (t.get("bounding_box", [0, 0, 0, 0])[0], t.get("bounding_box", [0, 0, 0, 0])[1]))

    def _cluster_horizontal_lines(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merges adjacent tokens on approximately the same vertical level into composite lines.

        Guards against multi-column layout contamination by enforcing a tight lower bound
        on negative x-gaps (-20 px max overlap), preventing distant adjacent columns from merging.
        """
        if not tokens:
            return []

        sorted_tokens = sorted(tokens, key=lambda t: (t.get("bounding_box", [0, 0, 0, 0])[0], t.get("bounding_box", [0, 0, 0, 0])[1]))
        lines: List[List[Dict[str, Any]]] = []

        for token in sorted_tokens:
            bbox = token.get("bounding_box", [0, 0, 0, 0])
            ymin, xmin, ymax, xmax = bbox[0], bbox[1], bbox[2], bbox[3]
            token_mid_y = (ymin + ymax) / 2.0

            placed = False
            for line in lines:
                prev_bbox = line[-1].get("bounding_box", [0, 0, 0, 0])
                prev_mid_y = (prev_bbox[0] + prev_bbox[2]) / 2.0
                y_diff = abs(token_mid_y - prev_mid_y)
                x_gap = xmin - prev_bbox[3]

                # Check vertical alignment and strict horizontal proximity (-20 <= x_gap <= gap_threshold)
                # Prevents merging text from different columns on the same horizontal level
                if y_diff <= self.line_y_tolerance and (-20 <= x_gap <= self.horizontal_gap_threshold):
                    line.append(token)
                    placed = True
                    break

            if not placed:
                lines.append([token])

        composite_lines: List[Dict[str, Any]] = []
        for line in lines:
            # Sort tokens horizontally within the line
            line_sorted = sorted(line, key=lambda t: t.get("bounding_box", [0, 0, 0, 0])[1])
            text = " ".join(t.get("text", "").strip() for t in line_sorted if t.get("text", "").strip())
            confidences = [t.get("confidence", 0.9) for t in line_sorted if t.get("confidence") is not None]
            mean_conf = sum(confidences) / len(confidences) if confidences else 0.9
            bboxes = [t.get("bounding_box", [0, 0, 0, 0]) for t in line_sorted]
            composite_bbox = _compute_union_bbox(bboxes)

            composite_lines.append({
                "text": text,
                "confidence": mean_conf,
                "bounding_box": composite_bbox,
                "source_tokens": line_sorted,
            })

        # Sort composite lines top-to-bottom
        composite_lines.sort(key=lambda cl: (cl["bounding_box"][0], cl["bounding_box"][1]))
        return composite_lines

    def _build_spatial_linked_candidates(
        self,
        composite_lines: List[Dict[str, Any]],
        tokens: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Generates candidate units from lines, tokens, and 2D linked label-value pairs."""
        candidates: List[Dict[str, Any]] = []

        # 1. Add all composite lines
        for cl in composite_lines:
            candidates.append(cl)

        # 2. Add individual tokens
        for t in tokens:
            candidates.append({
                "text": t.get("text", "").strip(),
                "confidence": t.get("confidence", 0.9),
                "bounding_box": t.get("bounding_box", [0, 0, 0, 0]),
                "source_tokens": [t],
            })

        # 3. 2D Spatial Linking: Horizontally adjacent token pairs/triplets
        # Optimized O(N) neighbor scan on horizontally ordered tokens per line band
        n_tok = len(tokens)
        for i in range(n_tok):
            t1 = tokens[i]
            b1 = t1.get("bounding_box", [0, 0, 0, 0])
            for j in range(i + 1, min(i + 4, n_tok)):
                t2 = tokens[j]
                b2 = t2.get("bounding_box", [0, 0, 0, 0])

                y_diff = abs(b1[0] - b2[0])
                x_gap = b2[1] - b1[3]
                if y_diff <= self.line_y_tolerance and 0 <= x_gap <= self.horizontal_gap_threshold:
                    linked_text = f"{t1.get('text', '').strip()} {t2.get('text', '').strip()}"
                    linked_conf = (t1.get("confidence", 0.9) + t2.get("confidence", 0.9)) / 2.0
                    linked_bbox = _compute_union_bbox([b1, b2])
                    candidates.append({
                        "text": linked_text,
                        "confidence": linked_conf,
                        "bounding_box": linked_bbox,
                        "source_tokens": [t1, t2],
                    })

                    # Triplet linking (t1 + t2 + t3)
                    for k in range(j + 1, min(j + 3, n_tok)):
                        t3 = tokens[k]
                        b3 = t3.get("bounding_box", [0, 0, 0, 0])
                        y_diff_3 = abs(b2[0] - b3[0])
                        x_gap_3 = b3[1] - b2[3]
                        if y_diff_3 <= self.line_y_tolerance and 0 <= x_gap_3 <= self.horizontal_gap_threshold:
                            triplet_text = f"{linked_text} {t3.get('text', '').strip()}"
                            triplet_conf = (t1.get("confidence", 0.9) + t2.get("confidence", 0.9) + t3.get("confidence", 0.9)) / 3.0
                            triplet_bbox = _compute_union_bbox([b1, b2, b3])
                            candidates.append({
                                "text": triplet_text,
                                "confidence": triplet_conf,
                                "bounding_box": triplet_bbox,
                                "source_tokens": [t1, t2, t3],
                            })

        # 4. 2D Spatial Linking: Vertically stacked label-value pairs (English & Hindi)
        label_keywords = [
            "net wt", "net qty", "net weight", "net quantity", "net content",
            "mrp", "m.r.p", "max retail price", "maximum retail price",
            "mfd", "mfd date", "mfg date", "date of mfg", "date of mfd",
            "pkd", "pkd date", "packed date", "packing date",
            "exp date", "expiry", "use by", "best before",
            "usp", "unit sale price", "country of origin", "made in",
            "generic name", "commodity",
            # Hindi statutory label keywords
            "शुद्ध मात्रा", "मात्रा", "शुद्ध भार", "अ.वि.मू.",
            "उत्पादन तिथि", "पैकिंग तिथि", "अवसान तिथि", "मूल देश"
        ]
        for i in range(n_tok):
            t_label = tokens[i]
            label_text = t_label.get("text", "").strip().lower()
            if any(lk in label_text for lk in label_keywords):
                b_label = t_label.get("bounding_box", [0, 0, 0, 0])
                for j in range(n_tok):
                    if i == j:
                        continue
                    t_val = tokens[j]
                    b_val = t_val.get("bounding_box", [0, 0, 0, 0])

                    # Check if t_val is vertically directly below t_label
                    y_gap = b_val[0] - b_label[2]
                    x_overlap = min(b_label[3], b_val[3]) - max(b_label[1], b_val[1])
                    if 0 <= y_gap <= 40 and (x_overlap > -20):
                        stacked_text = f"{t_label.get('text', '').strip()} {t_val.get('text', '').strip()}"
                        stacked_conf = (t_label.get("confidence", 0.9) + t_val.get("confidence", 0.9)) / 2.0
                        stacked_bbox = _compute_union_bbox([b_label, b_val])
                        candidates.append({
                            "text": stacked_text,
                            "confidence": stacked_conf,
                            "bounding_box": stacked_bbox,
                            "source_tokens": [t_label, t_val],
                        })

        return candidates

    def _aggregate_address_blocks(self, composite_lines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Aggregates vertically adjacent lines into coherent postal address blocks.

        Differentiates between MANUFACTURER, PACKER, IMPORTER, and joint MANUFACTURER_AND_PACKER.
        """
        address_starters = [
            "manufactured & packed by", "mfg & pkd by", "mfd & pkd by", "mfd. & pkd. by",
            "manufactured and packed by", "निर्माता एवं पैकर", "निर्माता व पैकर",
            "manufactured in india by", "manufactured in bharat by", "mfd in india by", "mfd. in india by",
            "packed in india by", "pkd in india by", "pkd. in india by",
            "manufactured by", "mfd by", "mfd. by", "mfg by", "mfg. by", "produced by",
            "packed by", "pkd by", "pkd. by", "packaging by", "pre-packed by",
            "imported by", "importer", "marketed by", "address", "registered office",
            "निर्माता", "पैकर", "निर्मित", "आयातकर्ता", "मार्केटेड"
        ]

        blocks: List[Dict[str, Any]] = []
        n = len(composite_lines)
        visited = [False] * n

        for i in range(n):
            if visited[i]:
                continue

            line_text = composite_lines[i]["text"].strip()
            line_lower = line_text.lower()

            # Skip lines that are customer care or complaints declarations
            if any(k in line_lower for k in ["complaint", "customer care", "consumer care", "helpline", "feedback", "care@"]):
                continue

            has_starter = any(starter in line_lower for starter in address_starters)

            # Also detect blocks starting directly with corporate entity names (e.g. "Parle Products Pvt. Ltd.")
            # followed by address / state / city / PIN in subsequent lines
            is_corp_starter = False
            if not has_starter and i + 1 < n:
                if re.search(r"\b(?:Pvt\.?\s*Ltd\.?|Private\s*Limited|Ltd\.?|Limited|LLP|Inc\.?|Corp\.?|उद्योग|लिमिटेड)\b", line_text, re.IGNORECASE):
                    for next_idx in range(i + 1, min(i + 4, n)):
                        nl_text = composite_lines[next_idx]["text"]
                        if (self.parser.parse_pin_code(nl_text) or
                            any(s.lower() in nl_text.lower() for s in [
                                "maharashtra", "delhi", "karnataka", "tamil nadu", "gujarat", "uttarakhand", "haryana",
                                "mumbai", "pune", "bengaluru", "chennai", "kolkata", "delhi", "road", "street", "plot",
                                "area", "crossing", "east", "west", "midc", "estate", "nagar"
                            ])):
                            is_corp_starter = True
                            break

            if has_starter or is_corp_starter:
                # Determine statutory entity role
                if any(k in line_lower for k in ["manufactured & packed", "mfg & pkd", "mfd & pkd", "manufactured and packed", "निर्माता एवं पैकर"]):
                    role = "MANUFACTURER_AND_PACKER"
                elif any(k in line_lower for k in ["pack", "pkd", "पैकर"]) and not any(m in line_lower for m in ["mfd", "mfg", "manufactur"]):
                    role = "PACKER"
                elif any(k in line_lower for k in ["import", "आयातकर्ता"]):
                    role = "IMPORTER"
                elif any(k in line_lower for k in ["marketed", "मार्केटेड"]):
                    role = "MARKETER"
                else:
                    role = "MANUFACTURER"

                block_lines = [composite_lines[i]]
                visited[i] = True

                # Lookahead to aggregate subsequent lines in the address block
                for j in range(i + 1, min(i + 5, n)):
                    next_text = composite_lines[j]["text"].strip()
                    next_lower = next_text.lower()

                    # Stop if a different major statutory declaration begins
                    if any(next_lower.startswith(k) for k in [
                        "mrp", "net wt", "net qty", "best before", "exp", "batch",
                        "consumer care", "generic name", "commodity", "शुद्ध", "अ.वि.मू.", "उत्पादन"
                    ]):
                        break
                    # Stop if another address block starts
                    if any(starter in next_lower for starter in address_starters):
                        break

                    # Check vertical gap between lines
                    prev_bbox = block_lines[-1]["bounding_box"]
                    curr_bbox = composite_lines[j]["bounding_box"]
                    vertical_gap = curr_bbox[0] - prev_bbox[2]

                    if vertical_gap <= 45:
                        block_lines.append(composite_lines[j])
                        visited[j] = True
                    else:
                        break

                combined_text = " ".join(bl["text"] for bl in block_lines)
                all_bboxes = [bl["bounding_box"] for bl in block_lines]
                union_bbox = _compute_union_bbox(all_bboxes)
                mean_conf = sum(bl["confidence"] for bl in block_lines) / len(block_lines)

                blocks.append({
                    "role": role,
                    "text": combined_text,
                    "confidence": mean_conf,
                    "bounding_box": union_bbox,
                    "lines": block_lines,
                })

        return blocks

    def extract(
        self,
        ocr_data: Union[Dict[str, Any], Any],
        calibration: Optional[Any] = None
    ) -> NormalizedCommodityFacts:
        """Processes OCR tokens to extract and normalize all statutory commodity declarations.

        Accepts optional Member 1 calibration results (CalibrationResult, CalibrationDTO, dict, or float)
        to accurately resolve physical mm font height and measurement confidence for downstream Rule Engine checks.
        """
        image_id, tokens, full_text = self._normalize_tokens(ocr_data)
        px_to_mm, calib_confidence = self._resolve_calibration(ocr_data, calibration)
        sorted_tokens = self._sort_tokens_reading_order(tokens)
        composite_lines = self._cluster_horizontal_lines(tokens)
        text_units = self._build_spatial_linked_candidates(composite_lines, sorted_tokens)

        # Inspection facts collectors
        extracted_net_qty: Optional[NetQuantityValue] = None
        extracted_mrp: Optional[MRPValue] = None
        extracted_usp: Optional[USPValue] = None
        extracted_mfg: Optional[AddressValue] = None
        extracted_packer: Optional[AddressValue] = None
        extracted_importer: Optional[AddressValue] = None
        extracted_consumer_care: Optional[ConsumerCareValue] = None
        extracted_origin: Optional[str] = None
        extracted_mfg_month: Optional[int] = None
        extracted_mfg_year: Optional[int] = None
        raw_fields: List[ExtractedFieldDTO] = []

        # Helper to compute measured font height in mm if px_to_mm is available
        def compute_font_height(bbox: List[int]) -> Tuple[Optional[float], Optional[float]]:
            if px_to_mm and px_to_mm > 0:
                h_px = max(1, bbox[2] - bbox[0])
                conf = calib_confidence if calib_confidence is not None else 0.95
                return round(h_px / px_to_mm, 2), round(conf, 2)
            return None, None

        # 1. NET QUANTITY & BANNED UNITS
        for unit in text_units:
            text = unit["text"]
            parsed_qty = self.parser.parse_net_quantity(text)
            if parsed_qty and extracted_net_qty is None:
                extracted_net_qty = NetQuantityValue(**parsed_qty)
                font_mm, font_conf = compute_font_height(unit["bounding_box"])
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="NET_QUANTITY",
                        raw_ocr_text=text,
                        normalized_value=parsed_qty,
                        detection_confidence=0.98,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )
                break

        # 2. MAXIMUM RETAIL PRICE (MRP) & TAX INCLUSIVITY
        # Priority 1: Check candidates with explicit MRP indicators (MRP, M.R.P., Max Retail Price, अ.वि.मू.)
        mrp_cand_explicit: Optional[Tuple[Dict[str, Any], Dict[str, Any]]] = None
        mrp_cand_standalone: Optional[Tuple[Dict[str, Any], Dict[str, Any]]] = None

        mrp_kw_re = re.compile(r"(?:MRP|M\.R\.P\.?|Maximum\s*Retail\s*Price|Max\.?\s*Retail\s*Price|अ\.वि\.मू\.)", re.IGNORECASE)

        for unit in text_units:
            text = unit["text"]
            parsed_mrp = self.parser.parse_mrp(text)
            if parsed_mrp:
                if mrp_kw_re.search(text):
                    if mrp_cand_explicit is None:
                        mrp_cand_explicit = (parsed_mrp, unit)
                        break
                elif mrp_cand_standalone is None:
                    mrp_cand_standalone = (parsed_mrp, unit)

        chosen_mrp = mrp_cand_explicit or mrp_cand_standalone
        if chosen_mrp:
            parsed_mrp, unit = chosen_mrp
            # If tax clause wasn't on this candidate line, verify against global full_text
            if not parsed_mrp["tax_inclusive"]:
                global_mrp_check = self.parser.parse_mrp(full_text)
                if global_mrp_check and global_mrp_check.get("tax_inclusive"):
                    parsed_mrp["tax_inclusive"] = True

            extracted_mrp = MRPValue(**parsed_mrp)
            font_mm, font_conf = compute_font_height(unit["bounding_box"])
            raw_fields.append(
                ExtractedFieldDTO(
                    field_type="MRP",
                    raw_ocr_text=unit["text"],
                    normalized_value=parsed_mrp,
                    detection_confidence=0.98,
                    ocr_confidence=unit["confidence"],
                    bounding_box=unit["bounding_box"],
                    measured_font_height_mm=font_mm,
                    measurement_confidence=font_conf,
                )
            )

        # 3. UNIT SALE PRICE (USP)
        for unit in text_units:
            text = unit["text"]
            parsed_usp = self.parser.parse_usp(text)
            if parsed_usp and extracted_usp is None:
                extracted_usp = USPValue(**parsed_usp)
                font_mm, font_conf = compute_font_height(unit["bounding_box"])
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="UNIT_SALE_PRICE",
                        raw_ocr_text=text,
                        normalized_value=parsed_usp,
                        detection_confidence=0.95,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )
                break

        # 4. MANUFACTURING & EXPIRY DATES
        for unit in text_units:
            text = unit["text"]
            parsed_dates = self.parser.parse_mfg_and_expiry_dates(text)
            font_mm, font_conf = compute_font_height(unit["bounding_box"])
            if (parsed_dates.get("mfg_month") or parsed_dates.get("mfg_year")) and extracted_mfg_month is None:
                extracted_mfg_month = parsed_dates.get("mfg_month")
                extracted_mfg_year = parsed_dates.get("mfg_year")
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="DATE_OF_MANUFACTURE",
                        raw_ocr_text=text,
                        normalized_value=parsed_dates,
                        detection_confidence=0.95,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )
            if (parsed_dates.get("exp_month") or parsed_dates.get("exp_year")) and not any(f.field_type == "DATE_OF_EXPIRY" for f in raw_fields):
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="DATE_OF_EXPIRY",
                        raw_ocr_text=text,
                        normalized_value={"exp_month": parsed_dates.get("exp_month"), "exp_year": parsed_dates.get("exp_year")},
                        detection_confidence=0.95,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )

        # 5. COUNTRY OF ORIGIN
        for unit in text_units:
            text = unit["text"]
            origin = self.parser.parse_country_of_origin(text)
            if origin and extracted_origin is None:
                extracted_origin = origin
                font_mm, font_conf = compute_font_height(unit["bounding_box"])
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="COUNTRY_OF_ORIGIN",
                        raw_ocr_text=text,
                        normalized_value={"country": origin},
                        detection_confidence=0.96,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )
                break

        # 6. MANUFACTURER / PACKER / IMPORTER / MARKETER ADDRESS
        extracted_marketer: Optional[AddressValue] = None

        # Priority A: Check aggregated multi-line address blocks first
        address_blocks = self._aggregate_address_blocks(composite_lines)
        for block in address_blocks:
            parsed_addr = self.parser.parse_address(block["text"])
            if parsed_addr:
                addr_val = AddressValue(**parsed_addr)
                role = block["role"]
                font_mm, font_conf = compute_font_height(block["bounding_box"])

                if role == "MANUFACTURER_AND_PACKER":
                    if extracted_mfg is None or extracted_mfg == extracted_marketer:
                        extracted_mfg = addr_val
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="MANUFACTURER_ADDRESS",
                            raw_ocr_text=block["text"],
                            normalized_value=parsed_addr,
                            detection_confidence=0.96,
                            ocr_confidence=block["confidence"],
                            bounding_box=block["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )
                    if extracted_packer is None:
                        extracted_packer = addr_val
                        raw_fields.append(
                            ExtractedFieldDTO(
                                field_type="PACKER_ADDRESS",
                                raw_ocr_text=block["text"],
                                normalized_value=parsed_addr,
                                detection_confidence=0.96,
                                ocr_confidence=block["confidence"],
                                bounding_box=block["bounding_box"],
                                measured_font_height_mm=font_mm,
                                measurement_confidence=font_conf,
                            )
                        )
                elif role == "MANUFACTURER":
                    # Actual manufacturer takes statutory priority over any previous marketer
                    if extracted_mfg is None or extracted_mfg == extracted_marketer:
                        extracted_mfg = addr_val
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="MANUFACTURER_ADDRESS",
                            raw_ocr_text=block["text"],
                            normalized_value=parsed_addr,
                            detection_confidence=0.95,
                            ocr_confidence=block["confidence"],
                            bounding_box=block["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )
                elif role == "PACKER" and extracted_packer is None:
                    extracted_packer = addr_val
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="PACKER_ADDRESS",
                            raw_ocr_text=block["text"],
                            normalized_value=parsed_addr,
                            detection_confidence=0.95,
                            ocr_confidence=block["confidence"],
                            bounding_box=block["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )
                elif role == "IMPORTER" and extracted_importer is None:
                    extracted_importer = addr_val
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="IMPORTER_ADDRESS",
                            raw_ocr_text=block["text"],
                            normalized_value=parsed_addr,
                            detection_confidence=0.95,
                            ocr_confidence=block["confidence"],
                            bounding_box=block["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )
                elif role == "MARKETER":
                    extracted_marketer = addr_val
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="MARKETER_ADDRESS",
                            raw_ocr_text=block["text"],
                            normalized_value=parsed_addr,
                            detection_confidence=0.94,
                            ocr_confidence=block["confidence"],
                            bounding_box=block["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )

        # Priority B: Fallback scan over candidate text units if address blocks didn't capture
        if extracted_mfg is None or extracted_packer is None or extracted_importer is None:
            for unit in text_units:
                text = unit["text"]
                text_lower = text.lower()
                if any(k in text_lower for k in [
                    "mfd by", "manufactured by", "mfg by", "marketed by", "pkd by",
                    "packed by", "imported by", "factory", "address", "निर्माता", "पैकर",
                    "manufactured in", "packed in", "mfd in", "mfd. in"
                ]):
                    role = "PACKER" if any(p in text_lower for p in ["pack", "pkd", "पैकर"]) and not any(m in text_lower for m in ["mfd", "mfg", "manufactur"]) else (
                        "IMPORTER" if "import" in text_lower else (
                            "MARKETER" if any(m in text_lower for m in ["marketed", "मार्केटेड"]) else "MANUFACTURER"
                        )
                    )
                    parsed_addr = self.parser.parse_address(text)
                    if parsed_addr:
                        addr_val = AddressValue(**parsed_addr)
                        font_mm, font_conf = compute_font_height(unit["bounding_box"])
                        if role == "MANUFACTURER" and (extracted_mfg is None or extracted_mfg == extracted_marketer):
                            extracted_mfg = addr_val
                            raw_fields.append(
                                ExtractedFieldDTO(
                                    field_type="MANUFACTURER_ADDRESS",
                                    raw_ocr_text=text,
                                    normalized_value=parsed_addr,
                                    detection_confidence=0.92,
                                    ocr_confidence=unit["confidence"],
                                    bounding_box=unit["bounding_box"],
                                    measured_font_height_mm=font_mm,
                                    measurement_confidence=font_conf,
                                )
                            )
                        elif role == "PACKER" and extracted_packer is None:
                            extracted_packer = addr_val
                            raw_fields.append(
                                ExtractedFieldDTO(
                                    field_type="PACKER_ADDRESS",
                                    raw_ocr_text=text,
                                    normalized_value=parsed_addr,
                                    detection_confidence=0.92,
                                    ocr_confidence=unit["confidence"],
                                    bounding_box=unit["bounding_box"],
                                    measured_font_height_mm=font_mm,
                                    measurement_confidence=font_conf,
                                )
                            )
                        elif role == "IMPORTER" and extracted_importer is None:
                            extracted_importer = addr_val
                            raw_fields.append(
                                ExtractedFieldDTO(
                                    field_type="IMPORTER_ADDRESS",
                                    raw_ocr_text=text,
                                    normalized_value=parsed_addr,
                                    detection_confidence=0.92,
                                    ocr_confidence=unit["confidence"],
                                    bounding_box=unit["bounding_box"],
                                    measured_font_height_mm=font_mm,
                                    measurement_confidence=font_conf,
                                )
                            )
                        elif role == "MARKETER" and extracted_marketer is None:
                            extracted_marketer = addr_val
                            raw_fields.append(
                                ExtractedFieldDTO(
                                    field_type="MARKETER_ADDRESS",
                                    raw_ocr_text=text,
                                    normalized_value=parsed_addr,
                                    detection_confidence=0.91,
                                    ocr_confidence=unit["confidence"],
                                    bounding_box=unit["bounding_box"],
                                    measured_font_height_mm=font_mm,
                                    measurement_confidence=font_conf,
                                )
                            )

        # Priority C: Scan remaining composite lines for PIN code and State if manufacturer is still incomplete
        if extracted_mfg is None:
            for unit in composite_lines:
                text = unit["text"]
                parsed_addr = self.parser.parse_address(text)
                if parsed_addr and (parsed_addr.get("pin_code") or parsed_addr.get("state")):
                    extracted_mfg = AddressValue(**parsed_addr)
                    font_mm, font_conf = compute_font_height(unit["bounding_box"])
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="MANUFACTURER_ADDRESS",
                            raw_ocr_text=text,
                            normalized_value=parsed_addr,
                            detection_confidence=0.90,
                            ocr_confidence=unit["confidence"],
                            bounding_box=unit["bounding_box"],
                            measured_font_height_mm=font_mm,
                            measurement_confidence=font_conf,
                        )
                    )
                    break

        # Priority D: Fallback to marketer if manufacturer was not declared separately
        if extracted_mfg is None and extracted_marketer is not None:
            extracted_mfg = extracted_marketer

        # 7. CONSUMER CARE
        care_status = self.parser.check_consumer_care_completeness(full_text)
        if any(care_status[k] for k in ["has_email", "has_phone", "has_address", "has_contact_name"]):
            contact_name = care_status.get("contact_name")
            phone = care_status.get("phone")
            email = care_status.get("email")
            address = care_status.get("address")

            # Collect consumer care bounding boxes
            care_bboxes = []
            for unit in composite_lines:
                if any(w in unit["text"].lower() for w in [
                    "consumer", "customer care", "complaints", "feedback", "helpline", "toll free",
                    "care@", "nodal", "grievance", "ग्राहक सेवा", "उपभोक्ता"
                ]):
                    care_bboxes.append(unit["bounding_box"])

            care_bbox = _compute_union_bbox(care_bboxes) if care_bboxes else [0, 0, 0, 0]
            font_mm, font_conf = compute_font_height(care_bbox)

            extracted_consumer_care = ConsumerCareValue(
                contact_name=contact_name,
                phone=phone,
                email=email,
                address=address,
                is_complete=care_status["is_complete"],
            )
            raw_fields.append(
                ExtractedFieldDTO(
                    field_type="CONSUMER_CARE_CONTACT",
                    raw_ocr_text=full_text[:300] if len(full_text) > 300 else full_text,
                    normalized_value=care_status,
                    detection_confidence=0.94,
                    ocr_confidence=0.95,
                    bounding_box=care_bbox,
                    measured_font_height_mm=font_mm,
                    measurement_confidence=font_conf,
                )
            )

        # 8. GENERIC NAME (Rule 6(1)(b))
        for unit in text_units:
            text = unit["text"]
            generic_name = self.parser.parse_generic_name(text)
            if generic_name and not any(f.field_type == "GENERIC_NAME" for f in raw_fields):
                font_mm, font_conf = compute_font_height(unit["bounding_box"])
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="GENERIC_NAME",
                        raw_ocr_text=text,
                        normalized_value={"generic_name": generic_name},
                        detection_confidence=0.93,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                        measured_font_height_mm=font_mm,
                        measurement_confidence=font_conf,
                    )
                )
                break

        return NormalizedCommodityFacts(
            image_id=image_id,
            net_quantity=extracted_net_qty,
            mrp=extracted_mrp,
            unit_sale_price=extracted_usp,
            manufacturer=extracted_mfg,
            packer=extracted_packer,
            importer=extracted_importer,
            consumer_care=extracted_consumer_care,
            country_of_origin=extracted_origin,
            mfg_date_month=extracted_mfg_month,
            mfg_date_year=extracted_mfg_year,
            raw_fields=raw_fields,
        )


def main():
    """Standalone CLI verification runner loading local fixtures."""
    fixtures_dir = Path(__file__).resolve().parent.parent / "fixtures"
    extractor = CommodityFactExtractor()

    print(f"=== Member 3: Information Extraction CLI Verification ===")
    fixture_files = list(fixtures_dir.glob("*.json"))
    if not fixture_files:
        print(f"No fixtures found in {fixtures_dir}")
        return

    for fixture_path in sorted(fixture_files):
        with open(fixture_path, "r", encoding="utf-8") as f:
            ocr_payload = json.load(f)

        facts = extractor.extract(ocr_payload)
        print(f"\n--- Extracted Facts for: {fixture_path.name} (Image: {facts.image_id}) ---")
        if facts.net_quantity:
            print(f"  * Net Quantity: {facts.net_quantity.magnitude} {facts.net_quantity.unit} (Banned: {facts.net_quantity.has_banned_unit})")
        if facts.mrp:
            print(f"  * MRP: {facts.mrp.currency} {facts.mrp.amount} (Tax Inclusive: {facts.mrp.tax_inclusive})")
        if facts.unit_sale_price:
            print(f"  * USP: Rs. {facts.unit_sale_price.price_per_unit} / {facts.unit_sale_price.unit}")
        if facts.mfg_date_month and facts.mfg_date_year:
            print(f"  * Mfg Date: {facts.mfg_date_month:02d}/{facts.mfg_date_year}")
        if facts.manufacturer:
            print(f"  * Manufacturer: {facts.manufacturer.name} | State: {facts.manufacturer.state} | PIN: {facts.manufacturer.pin_code} | Complete: {facts.manufacturer.is_complete}")
        if facts.consumer_care:
            print(f"  * Consumer Care: Phone={facts.consumer_care.phone}, Email={facts.consumer_care.email}, Complete={facts.consumer_care.is_complete}")
        if facts.country_of_origin:
            print(f"  * Country of Origin: {facts.country_of_origin}")
        print(f"  * Total Raw Fields Extracted: {len(facts.raw_fields)}")

    print(f"\n=== Verification Complete: All fixtures parsed into NormalizedCommodityFacts ===")


if __name__ == "__main__":
    main()
