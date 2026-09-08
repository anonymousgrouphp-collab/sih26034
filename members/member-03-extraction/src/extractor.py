"""Commodity Fact Extractor (SIH26034 - NyayaDrishti-LM)
Transforms raw OCR tokens into verified NormalizedCommodityFacts
conforming to contracts/extraction/extraction_dto.py.
"""

import json
import logging
from pathlib import Path
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
    from .parsers import StatutoryDeclarationParser
except ImportError:
    from parsers import StatutoryDeclarationParser

logger = logging.getLogger(__name__)


class CommodityFactExtractor:
    """Deterministic Statutory Entity Extractor and 2D Spatial Proximity Graph Linker."""

    def __init__(self, line_y_tolerance: int = 15, horizontal_gap_threshold: int = 80):
        self.line_y_tolerance = line_y_tolerance
        self.horizontal_gap_threshold = horizontal_gap_threshold
        self.parser = StatutoryDeclarationParser

    def _normalize_tokens(self, ocr_data: Union[Dict[str, Any], Any]) -> Tuple[str, List[Dict[str, Any]], str]:
        """Extracts image_id, tokens list, and full_text from dict or OCROutput DTO."""
        if hasattr(ocr_data, "model_dump"):
            data = ocr_data.model_dump()
        elif hasattr(ocr_data, "dict"):
            data = ocr_data.dict()
        elif isinstance(ocr_data, dict):
            data = ocr_data
        else:
            raise ValueError(f"Unsupported OCR input type: {type(ocr_data)}")

        image_id = data.get("image_id", "unknown_image")
        tokens = data.get("tokens", [])
        full_text = data.get("full_text", "")
        if not full_text and tokens:
            full_text = " \n ".join(t.get("text", "") for t in tokens)

        return image_id, tokens, full_text

    def _sort_tokens_reading_order(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sorts tokens into top-to-bottom, left-to-right 2D reading order."""
        def get_sort_key(token: Dict[str, Any]):
            bbox = token.get("bounding_box", [0, 0, 0, 0])
            ymin, xmin = bbox[0], bbox[1]
            line_band = ymin // self.line_y_tolerance
            return (line_band, xmin)

        return sorted(tokens, key=get_sort_key)

    def _cluster_horizontal_lines(self, tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Merges adjacent tokens on approximately the same vertical level into composite lines."""
        if not tokens:
            return []

        sorted_tokens = sorted(tokens, key=lambda t: (t.get("bounding_box", [0, 0, 0, 0])[0], t.get("bounding_box", [0, 0, 0, 0])[1]))
        lines: List[List[Dict[str, Any]]] = []
        current_line: List[Dict[str, Any]] = []

        for token in sorted_tokens:
            bbox = token.get("bounding_box", [0, 0, 0, 0])
            if not current_line:
                current_line.append(token)
                continue

            prev_bbox = current_line[-1].get("bounding_box", [0, 0, 0, 0])
            y_diff = abs(bbox[0] - prev_bbox[0])
            x_gap = bbox[1] - prev_bbox[3]

            if y_diff <= self.line_y_tolerance and (x_gap <= self.horizontal_gap_threshold or x_gap < 0):
                current_line.append(token)
            else:
                lines.append(current_line)
                current_line = [token]

        if current_line:
            lines.append(current_line)

        composite_lines: List[Dict[str, Any]] = []
        for line in lines:
            text = " ".join(t.get("text", "") for t in line)
            confidences = [t.get("confidence", 0.9) for t in line]
            mean_conf = sum(confidences) / len(confidences) if confidences else 0.9
            ymins = [t.get("bounding_box", [0, 0, 0, 0])[0] for t in line]
            xmins = [t.get("bounding_box", [0, 0, 0, 0])[1] for t in line]
            ymaxs = [t.get("bounding_box", [0, 0, 0, 0])[2] for t in line]
            xmaxs = [t.get("bounding_box", [0, 0, 0, 0])[3] for t in line]
            composite_bbox = [min(ymins), min(xmins), max(ymaxs), max(xmaxs)]
            composite_lines.append({
                "text": text,
                "confidence": mean_conf,
                "bounding_box": composite_bbox,
                "source_tokens": line,
            })

        return composite_lines

    def extract(self, ocr_data: Union[Dict[str, Any], Any]) -> NormalizedCommodityFacts:
        """Processes OCR tokens to extract and normalize all statutory commodity declarations."""
        image_id, tokens, full_text = self._normalize_tokens(ocr_data)
        sorted_tokens = self._sort_tokens_reading_order(tokens)
        composite_lines = self._cluster_horizontal_lines(tokens)

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

        # Candidate text pools: both composite lines and individual tokens
        text_units = composite_lines + [
            {
                "text": t.get("text", ""),
                "confidence": t.get("confidence", 0.9),
                "bounding_box": t.get("bounding_box", [0, 0, 0, 0]),
                "source_tokens": [t],
            }
            for t in sorted_tokens
        ]

        # 1. NET QUANTITY & BANNED UNITS
        for unit in text_units:
            text = unit["text"]
            parsed_qty = self.parser.parse_net_quantity(text)
            if parsed_qty and extracted_net_qty is None:
                extracted_net_qty = NetQuantityValue(**parsed_qty)
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="NET_QUANTITY",
                        raw_ocr_text=text,
                        normalized_value=parsed_qty,
                        detection_confidence=0.98,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                    )
                )
                break

        # 2. MAXIMUM RETAIL PRICE (MRP) & TAX INCLUSIVITY
        for unit in text_units:
            text = unit["text"]
            parsed_mrp = self.parser.parse_mrp(text)
            if parsed_mrp and extracted_mrp is None:
                if not parsed_mrp["tax_inclusive"]:
                    global_mrp_check = self.parser.parse_mrp(full_text)
                    if global_mrp_check and global_mrp_check.get("tax_inclusive"):
                        parsed_mrp["tax_inclusive"] = True

                extracted_mrp = MRPValue(**parsed_mrp)
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="MRP",
                        raw_ocr_text=text,
                        normalized_value=parsed_mrp,
                        detection_confidence=0.98,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                    )
                )
                break

        # 3. UNIT SALE PRICE (USP)
        for unit in text_units:
            text = unit["text"]
            parsed_usp = self.parser.parse_usp(text)
            if parsed_usp and extracted_usp is None:
                extracted_usp = USPValue(**parsed_usp)
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="UNIT_SALE_PRICE",
                        raw_ocr_text=text,
                        normalized_value=parsed_usp,
                        detection_confidence=0.95,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                    )
                )
                break

        # 4. MANUFACTURING & EXPIRY DATES
        for unit in text_units:
            text = unit["text"]
            parsed_dates = self.parser.parse_mfg_and_expiry_dates(text)
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
                    )
                )

        # 5. COUNTRY OF ORIGIN
        for unit in text_units:
            text = unit["text"]
            origin = self.parser.parse_country_of_origin(text)
            if origin and extracted_origin is None:
                extracted_origin = origin
                raw_fields.append(
                    ExtractedFieldDTO(
                        field_type="COUNTRY_OF_ORIGIN",
                        raw_ocr_text=text,
                        normalized_value={"country": origin},
                        detection_confidence=0.96,
                        ocr_confidence=unit["confidence"],
                        bounding_box=unit["bounding_box"],
                    )
                )
                break

        # 6. MANUFACTURER / PACKER / IMPORTER ADDRESS
        for unit in text_units:
            text = unit["text"]
            text_lower = text.lower()
            if any(k in text_lower for k in ["mfd by", "manufactured by", "mfg by", "marketed by", "pkd by", "packed by", "imported by", "factory", "address"]):
                role = "PACKER" if "pack" in text_lower else ("IMPORTER" if "import" in text_lower else "MANUFACTURER")
                parsed_addr = self.parser.parse_address(text)
                if parsed_addr:
                    addr_val = AddressValue(**parsed_addr)
                    if role == "MANUFACTURER" and extracted_mfg is None:
                        extracted_mfg = addr_val
                        raw_fields.append(
                            ExtractedFieldDTO(
                                field_type="MANUFACTURER_ADDRESS",
                                raw_ocr_text=text,
                                normalized_value=parsed_addr,
                                detection_confidence=0.92,
                                ocr_confidence=unit["confidence"],
                                bounding_box=unit["bounding_box"],
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
                            )
                        )

        # If manufacturer is still None, scan composite lines for PIN code and State
        if extracted_mfg is None:
            for unit in composite_lines:
                text = unit["text"]
                parsed_addr = self.parser.parse_address(text)
                if parsed_addr and (parsed_addr.get("pin_code") or parsed_addr.get("state")):
                    extracted_mfg = AddressValue(**parsed_addr)
                    raw_fields.append(
                        ExtractedFieldDTO(
                            field_type="MANUFACTURER_ADDRESS",
                            raw_ocr_text=text,
                            normalized_value=parsed_addr,
                            detection_confidence=0.90,
                            ocr_confidence=unit["confidence"],
                            bounding_box=unit["bounding_box"],
                        )
                    )
                    break

        # 7. CONSUMER CARE
        care_status = self.parser.check_consumer_care_completeness(full_text)
        if any(care_status[k] for k in ["has_email", "has_phone", "has_address", "has_contact_name"]):
            contact_name = "Customer Care Executive" if care_status["has_contact_name"] else None
            phone = care_status.get("phone")
            email = care_status.get("email")
            care_bbox = [0, 0, 0, 0]
            for unit in composite_lines:
                if any(w in unit["text"].lower() for w in ["consumer", "customer care", "complaints", "feedback", "helpline"]):
                    care_bbox = unit["bounding_box"]
                    break

            extracted_consumer_care = ConsumerCareValue(
                contact_name=contact_name,
                phone=phone,
                email=email,
                address="Consumer Care Cell" if care_status["has_address"] else None,
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
                )
            )

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
            print(f"  * Manufacturer: {facts.manufacturer.name} | PIN: {facts.manufacturer.pin_code} | Complete: {facts.manufacturer.is_complete}")
        if facts.consumer_care:
            print(f"  * Consumer Care: Phone={facts.consumer_care.phone}, Email={facts.consumer_care.email}, Complete={facts.consumer_care.is_complete}")
        if facts.country_of_origin:
            print(f"  * Country of Origin: {facts.country_of_origin}")
        print(f"  * Total Raw Fields Extracted: {len(facts.raw_fields)}")

    print(f"\n=== Verification Complete: All fixtures parsed into NormalizedCommodityFacts ===")


if __name__ == "__main__":
    main()
