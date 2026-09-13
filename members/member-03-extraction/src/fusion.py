"""Cross-Facet Semantic Fusion Engine (SIH26034 - NyayaDrishti-LM)

Reconciles and aggregates statutory declarations across multiple packaging panels
(e.g., Front PDP, Back Panel, Side Panels, Top Lid, Bottom Base).

Statutory packaging often distributes mandatory Rule 6 declarations:
- Front PDP: Generic Name, Brand Name, sometimes Net Quantity.
- Back Panel: MRP, Net Quantity, Mfg Date, Address, Consumer Care, Country of Origin.
- Side Panel: Nutritional facts, FSSAI registration, barcode.

This engine pools raw candidate entities from all uploaded facets, resolves conflicts
using legal metrology precedence rules, preserves exact source panel provenance
under Section 63 BSA 2023, and synthesizes 1 unified NormalizedCommodityFacts object.
"""

from dataclasses import dataclass, field
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

logger = logging.getLogger(__name__)


@dataclass
class FacetExtractionResult:
    """Container for per-image extraction output with panel metadata."""
    image_id: str
    panel_type: str = "UNKNOWN"
    facts: Optional[NormalizedCommodityFacts] = None
    raw_fields: List[Dict[str, Any]] = field(default_factory=list)
    calibration_scale: Optional[float] = None
    pdp_area_cm2: Optional[float] = None
    primary_font_height_mm: Optional[float] = None
    generic_name: Optional[str] = None


class CrossFacetSemanticFusionEngine:
    """Semantic reconciliation engine synthesizing multi-panel evidence into unified statutory facts."""

    # Statutory panel precedence hierarchy
    PANEL_PRIORITY = {
        "PDP_FRONT": 10,
        "FRONT_PDP": 10,
        "FRONT": 10,
        "BACK_PANEL": 9,
        "BACK": 9,
        "MACRO_CLOSE_UP": 8,
        "CLOSE_UP": 8,
        "STAMP": 8,
        "SIDE_PANEL": 7,
        "SIDE_PANEL_LEFT": 7,
        "SIDE_PANEL_RIGHT": 7,
        "LEFT_PANEL": 7,
        "RIGHT_PANEL": 7,
        "SIDE": 7,
        "BOTTOM_BASE": 5,
        "BOTTOM": 5,
        "TOP_LID": 4,
        "TOP": 4,
        "UNKNOWN": 1,
    }

    @classmethod
    def fuse_facets(
        cls,
        facets: List[Union[FacetExtractionResult, Dict[str, Any]]],
        inspection_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Fuses multiple facet extraction outputs into one coherent, unified declaration set.

        Parameters
        ----------
        facets : List[Union[FacetExtractionResult, Dict[str, Any]]]
            Per-panel extraction results containing image_id, panel_type, facts, raw_fields.
        inspection_id : Optional[str]
            Parent inspection identifier.

        Returns
        -------
        Dict[str, Any]
            Synthesized payload containing:
            - "unified_facts": NormalizedCommodityFacts dict
            - "raw_fields": Combined list of ExtractedFieldDTOs tagged with source image_id
            - "panel_attribution": Mapping of statutory field to originating panel & image_id
            - "primary_pdp_area_cm2": Maximum or Front PDP surface area
            - "primary_font_height_mm": Highest confidence measured font height
            - "has_banned_unit": True if any panel declared prohibited unit
            - "banned_unit_found": Details of violation if present
        """
        if not facets:
            return cls._empty_fused_result(inspection_id)

        # Standardize input facets
        normalized_facets: List[Dict[str, Any]] = []
        for f in facets:
            if isinstance(f, FacetExtractionResult):
                if f.facts:
                    facts_dict = f.facts.model_dump() if hasattr(f.facts, "model_dump") else f.facts.dict()
                else:
                    facts_dict = {}
                if f.generic_name:
                    facts_dict["generic_name"] = f.generic_name
                normalized_facets.append({
                    "image_id": f.image_id,
                    "panel_type": (f.panel_type or "UNKNOWN").upper(),
                    "facts": facts_dict,
                    "raw_fields": f.raw_fields or (f.facts.raw_fields if f.facts else []),
                    "calibration_scale": f.calibration_scale,
                    "pdp_area_cm2": f.pdp_area_cm2,
                    "primary_font_height_mm": f.primary_font_height_mm,
                })
            elif isinstance(f, dict):
                p_type = str(f.get("panel_type") or "UNKNOWN").upper()
                facts_data = f.get("facts", {})
                if hasattr(facts_data, "model_dump"):
                    facts_data = facts_data.model_dump()
                elif hasattr(facts_data, "dict"):
                    facts_data = facts_data.dict()
                normalized_facets.append({
                    "image_id": str(f.get("image_id", "unknown_img")),
                    "panel_type": p_type,
                    "facts": facts_data if isinstance(facts_data, dict) else {},
                    "raw_fields": f.get("raw_fields", []),
                    "calibration_scale": f.get("calibration_scale"),
                    "pdp_area_cm2": f.get("pdp_area_cm2"),
                    "primary_font_height_mm": f.get("primary_font_height_mm"),
                })

        # Aggregated stores
        all_raw_fields: List[Dict[str, Any]] = []
        panel_attribution: Dict[str, Dict[str, Any]] = {}

        candidate_net_quantities: List[Tuple[int, Dict[str, Any], str, Optional[float]]] = []
        candidate_mrps: List[Tuple[int, Dict[str, Any], str, Optional[float]]] = []
        candidate_usps: List[Tuple[int, Dict[str, Any], str]] = []
        candidate_manufacturers: List[Tuple[int, Dict[str, Any], str]] = []
        candidate_packers: List[Tuple[int, Dict[str, Any], str]] = []
        candidate_importers: List[Tuple[int, Dict[str, Any], str]] = []
        candidate_consumer_cares: List[Tuple[int, Dict[str, Any], str]] = []
        candidate_origins: List[Tuple[int, str, str]] = []
        candidate_dates: List[Tuple[int, int, int, str]] = []  # (priority, month, year, image_id)
        candidate_generic_names: List[Tuple[int, str, str]] = []

        banned_unit_found: Optional[str] = None
        has_banned_unit: bool = False

        best_pdp_area_cm2: Optional[float] = None
        best_font_height_mm: Optional[float] = None

        # 1. Traverse all facets and pool candidates
        for facet in normalized_facets:
            img_id = facet["image_id"]
            p_type = facet["panel_type"]
            p_weight = cls.PANEL_PRIORITY.get(p_type, 1)
            facts = facet.get("facts", {})

            # Pool PDP area (prefer Front PDP if present, otherwise max valid area)
            area = facet.get("pdp_area_cm2")
            if area and area > 0:
                if p_type == "PDP_FRONT" or best_pdp_area_cm2 is None:
                    best_pdp_area_cm2 = float(area)
                elif best_pdp_area_cm2 is not None and area > best_pdp_area_cm2 and p_type != "UNKNOWN":
                    best_pdp_area_cm2 = float(area)

            # Accumulate raw fields and tag with source image
            fields_list = facet.get("raw_fields", [])
            for rf in fields_list:
                rf_dict = rf.dict() if hasattr(rf, "dict") else dict(rf)
                rf_dict["source_image_id"] = img_id
                rf_dict["panel_type"] = p_type
                all_raw_fields.append(rf_dict)

                # Check for font measurements on raw fields
                f_mm = rf_dict.get("measured_font_height_mm")
                if f_mm and f_mm > 0:
                    if best_font_height_mm is None or f_mm > best_font_height_mm:
                        best_font_height_mm = float(f_mm)

            # A. Net Quantity Candidate
            nq = facts.get("net_quantity")
            if nq:
                # Check for banned units across any panel
                if nq.get("has_banned_unit"):
                    has_banned_unit = True
                    if not banned_unit_found:
                        banned_unit_found = nq.get("banned_unit_found")

                # Score quality: valid magnitude + standard SI unit
                score = p_weight
                unit = str(nq.get("unit", "")).lower()
                if unit in ("g", "kg", "ml", "l", "n", "u"):
                    score += 5
                if not nq.get("has_banned_unit"):
                    score += 5
                font_val = facet.get("primary_font_height_mm")
                candidate_net_quantities.append((score, nq, img_id, font_val))

            # B. MRP Candidate
            mrp_val = facts.get("mrp")
            if mrp_val and isinstance(mrp_val, dict) and mrp_val.get("amount"):
                score = p_weight
                if mrp_val.get("tax_inclusive"):
                    score += 10
                if mrp_val.get("currency") in ("INR", "₹", "Rs", "Rs."):
                    score += 3
                candidate_mrps.append((score, mrp_val, img_id, facet.get("primary_font_height_mm")))

            # C. USP Candidate
            usp_val = facts.get("unit_sale_price")
            if usp_val and isinstance(usp_val, dict) and usp_val.get("price_per_unit"):
                score = p_weight
                candidate_usps.append((score, usp_val, img_id))

            # D. Address Candidates (Manufacturer / Packer / Importer)
            for role, store in [
                ("manufacturer", candidate_manufacturers),
                ("packer", candidate_packers),
                ("importer", candidate_importers),
            ]:
                addr = facts.get(role)
                if addr and isinstance(addr, dict) and (addr.get("name") or addr.get("address_line")):
                    score = p_weight
                    if addr.get("name"):
                        score += 5
                    if addr.get("pin_code"):
                        score += 5
                    if addr.get("state"):
                        score += 3
                    if addr.get("is_complete"):
                        score += 10
                    store.append((score, addr, img_id))

            # E. Consumer Care Candidate
            cc_val = facts.get("consumer_care")
            if cc_val and isinstance(cc_val, dict):
                score = p_weight
                channels = sum(1 for k in ("phone", "email", "address", "contact_name") if cc_val.get(k))
                score += channels * 4
                if channels > 0:
                    candidate_consumer_cares.append((score, cc_val, img_id))

            # F. Country of Origin
            origin = facts.get("country_of_origin")
            if origin and isinstance(origin, str) and len(origin.strip()) > 1:
                candidate_origins.append((p_weight, origin.strip(), img_id))

            # G. Manufacturing Date
            m_month = facts.get("mfg_date_month")
            m_year = facts.get("mfg_date_year")
            if m_month and m_year:
                candidate_dates.append((p_weight, int(m_month), int(m_year), img_id))

            # H. Generic Name
            g_name = facts.get("generic_name")
            if g_name and isinstance(g_name, str) and len(g_name.strip()) > 1:
                # Front PDP gets highest priority for product generic name
                g_weight = p_weight + (10 if p_type == "PDP_FRONT" else 0)
                candidate_generic_names.append((g_weight, g_name.strip(), img_id))

        # 2. Select best candidates and build panel attribution
        resolved_net_qty: Optional[Dict[str, Any]] = None
        if candidate_net_quantities:
            candidate_net_quantities.sort(key=lambda x: x[0], reverse=True)
            best_nq_entry = candidate_net_quantities[0]
            resolved_net_qty = dict(best_nq_entry[1])
            # Propagate banned unit flag across the entire packaging if any panel violated
            if has_banned_unit:
                resolved_net_qty["has_banned_unit"] = True
                resolved_net_qty["banned_unit_found"] = banned_unit_found
            panel_attribution["NET_QUANTITY"] = {
                "source_image_id": best_nq_entry[2],
                "score": best_nq_entry[0],
            }
            if best_nq_entry[3] and best_nq_entry[3] > 0:
                best_font_height_mm = best_nq_entry[3]

        resolved_mrp: Optional[Dict[str, Any]] = None
        if candidate_mrps:
            candidate_mrps.sort(key=lambda x: x[0], reverse=True)
            best_mrp_entry = candidate_mrps[0]
            resolved_mrp = dict(best_mrp_entry[1])
            panel_attribution["MRP"] = {
                "source_image_id": best_mrp_entry[2],
                "score": best_mrp_entry[0],
            }

        resolved_usp: Optional[Dict[str, Any]] = None
        if candidate_usps:
            candidate_usps.sort(key=lambda x: x[0], reverse=True)
            resolved_usp = dict(candidate_usps[0][1])
            panel_attribution["UNIT_SALE_PRICE"] = {
                "source_image_id": candidate_usps[0][2],
                "score": candidate_usps[0][0],
            }

        # Multi-panel address reconciliation:
        # If one panel has the corporate name and another has the address/pin, merge them!
        resolved_mfg = cls._reconcile_address_candidates(candidate_manufacturers, panel_attribution, "MANUFACTURER_ADDRESS")
        resolved_packer = cls._reconcile_address_candidates(candidate_packers, panel_attribution, "PACKER_ADDRESS")
        resolved_importer = cls._reconcile_address_candidates(candidate_importers, panel_attribution, "IMPORTER_ADDRESS")

        # Multi-panel consumer care reconciliation:
        # Merge phone from one panel and email from another if needed
        resolved_cc = cls._reconcile_consumer_care_candidates(candidate_consumer_cares, panel_attribution)

        resolved_origin: Optional[str] = None
        if candidate_origins:
            candidate_origins.sort(key=lambda x: x[0], reverse=True)
            resolved_origin = candidate_origins[0][1]
            panel_attribution["COUNTRY_OF_ORIGIN"] = {
                "source_image_id": candidate_origins[0][2],
                "origin": resolved_origin,
            }

        resolved_month: Optional[int] = None
        resolved_year: Optional[int] = None
        if candidate_dates:
            candidate_dates.sort(key=lambda x: x[0], reverse=True)
            resolved_month = candidate_dates[0][1]
            resolved_year = candidate_dates[0][2]
            panel_attribution["DATE_OF_MANUFACTURE"] = {
                "source_image_id": candidate_dates[0][3],
                "date": f"{resolved_month:02d}/{resolved_year}",
            }

        resolved_generic_name: Optional[str] = None
        if candidate_generic_names:
            candidate_generic_names.sort(key=lambda x: x[0], reverse=True)
            resolved_generic_name = candidate_generic_names[0][1]
            panel_attribution["GENERIC_NAME"] = {
                "source_image_id": candidate_generic_names[0][2],
                "name": resolved_generic_name,
            }

        # 3. Build unified facts dictionary conforming to NormalizedCommodityFacts
        composite_image_id = f"fused_{inspection_id}" if inspection_id else (
            normalized_facets[0]["image_id"] if normalized_facets else "unknown"
        )

        unified_facts = {
            "image_id": composite_image_id,
            "net_quantity": resolved_net_qty,
            "mrp": resolved_mrp,
            "unit_sale_price": resolved_usp,
            "manufacturer": resolved_mfg,
            "packer": resolved_packer,
            "importer": resolved_importer,
            "consumer_care": resolved_cc,
            "country_of_origin": resolved_origin,
            "mfg_date_month": resolved_month,
            "mfg_date_year": resolved_year,
            "generic_name": resolved_generic_name,
        }

        return {
            "unified_facts": unified_facts,
            "raw_fields": all_raw_fields,
            "panel_attribution": panel_attribution,
            "primary_pdp_area_cm2": best_pdp_area_cm2 or 100.0,
            "primary_font_height_mm": best_font_height_mm,
            "has_banned_unit": has_banned_unit,
            "banned_unit_found": banned_unit_found,
            "total_facets_processed": len(normalized_facets),
        }

    @classmethod
    def _reconcile_address_candidates(
        cls,
        candidates: List[Tuple[int, Dict[str, Any], str]],
        attribution_map: Dict[str, Any],
        field_name: str,
    ) -> Optional[Dict[str, Any]]:
        """Reconciles corporate entity address across multiple panels."""
        if not candidates:
            return None

        candidates.sort(key=lambda x: x[0], reverse=True)
        primary = dict(candidates[0][1])
        attribution_map[field_name] = {"source_image_id": candidates[0][2], "score": candidates[0][0]}

        # If primary lacks corporate name, address, state, or PIN, inspect other candidates
        if not primary.get("name") or not primary.get("pin_code") or not primary.get("state") or not primary.get("address_line"):
            for _, secondary, sec_img_id in candidates[1:]:
                if not primary.get("pin_code") and secondary.get("pin_code"):
                    primary["pin_code"] = secondary["pin_code"]
                if not primary.get("state") and secondary.get("state"):
                    primary["state"] = secondary["state"]
                if not primary.get("address_line") and secondary.get("address_line"):
                    primary["address_line"] = secondary["address_line"]
                if not primary.get("name") and secondary.get("name"):
                    primary["name"] = secondary["name"]

        # Recalculate completeness
        primary["is_complete"] = bool(primary.get("state") and primary.get("pin_code"))
        return primary

    @classmethod
    def _reconcile_consumer_care_candidates(
        cls,
        candidates: List[Tuple[int, Dict[str, Any], str]],
        attribution_map: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Merges consumer care channels across multiple packaging panels."""
        if not candidates:
            return None

        candidates.sort(key=lambda x: x[0], reverse=True)
        primary = dict(candidates[0][1])
        attribution_map["CONSUMER_CARE_CONTACT"] = {"source_image_id": candidates[0][2], "score": candidates[0][0]}

        # If primary lacks any channel, merge from secondary panels
        for _, sec, _ in candidates[1:]:
            for k in ("phone", "email", "address", "contact_name"):
                if not primary.get(k) and sec.get(k):
                    primary[k] = sec[k]

        # Recalculate completeness
        has_phone = bool(primary.get("phone"))
        has_email = bool(primary.get("email"))
        has_addr = bool(primary.get("address"))
        primary["is_complete"] = has_phone and has_email and has_addr
        return primary

    @staticmethod
    def _empty_fused_result(inspection_id: Optional[str]) -> Dict[str, Any]:
        """Returns empty baseline structure when zero facets provided."""
        return {
            "unified_facts": {
                "image_id": f"fused_{inspection_id}" if inspection_id else "unknown",
                "net_quantity": None,
                "mrp": None,
                "unit_sale_price": None,
                "manufacturer": None,
                "packer": None,
                "importer": None,
                "consumer_care": None,
                "country_of_origin": None,
                "mfg_date_month": None,
                "mfg_date_year": None,
                "generic_name": None,
            },
            "raw_fields": [],
            "panel_attribution": {},
            "primary_pdp_area_cm2": 100.0,
            "primary_font_height_mm": None,
            "has_banned_unit": False,
            "banned_unit_found": None,
            "total_facets_processed": 0,
        }
