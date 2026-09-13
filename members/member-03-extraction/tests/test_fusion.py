"""Unit tests for CrossFacetSemanticFusionEngine (SIH26034 - NyayaDrishti-LM)"""

from pathlib import Path
import sys
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from fusion import CrossFacetSemanticFusionEngine, FacetExtractionResult
from contracts.extraction.extraction_dto import (
    AddressValue,
    ConsumerCareValue,
    ExtractedFieldDTO,
    MRPValue,
    NetQuantityValue,
    NormalizedCommodityFacts,
    USPValue,
)


def test_multi_facet_reconciliation():
    """Verify Front PDP + Back Panel + Side Panel synthesize into 1 complete declaration set."""
    front_facts = NormalizedCommodityFacts(
        image_id="img_front_pdp",
        net_quantity=NetQuantityValue(magnitude=1.0, unit="U"),
    )
    back_facts = NormalizedCommodityFacts(
        image_id="img_back_panel",
        mrp=MRPValue(amount=1999.0, currency="INR", tax_inclusive=True),
        unit_sale_price=USPValue(price_per_unit=1999.0, unit="U"),
        manufacturer=AddressValue(
            name="Exotic Mile Pvt Ltd",
            address_line="B-70 Okhla Industrial Area Phase II",
            state="Delhi",
            pin_code="110020",
            is_complete=True,
        ),
        consumer_care=ConsumerCareValue(
            contact_name="Customer Support Manager",
            phone="011-40890009",
            email="support@goboult.co.in",
            address="B-70 Okhla Phase II, Delhi 110020",
            is_complete=True,
        ),
        country_of_origin="India",
        mfg_date_month=4,
        mfg_date_year=2026,
    )

    facets = [
        FacetExtractionResult(
            image_id="img_front_pdp",
            panel_type="PDP_FRONT",
            facts=front_facts,
            generic_name="Wireless Bluetooth Earbuds",
            pdp_area_cm2=150.0,
            primary_font_height_mm=3.2,
        ),
        FacetExtractionResult(
            image_id="img_back_panel",
            panel_type="BACK_PANEL",
            facts=back_facts,
            pdp_area_cm2=145.0,
            primary_font_height_mm=2.8,
        ),
    ]

    fused = CrossFacetSemanticFusionEngine.fuse_facets(facets, inspection_id="insp_test_01")

    assert fused["total_facets_processed"] == 2
    assert fused["primary_pdp_area_cm2"] == 150.0
    assert fused["primary_font_height_mm"] == 3.2
    assert not fused["has_banned_unit"]

    facts = fused["unified_facts"]
    assert facts["generic_name"] == "Wireless Bluetooth Earbuds"
    assert facts["mrp"]["amount"] == 1999.0
    assert facts["mrp"]["tax_inclusive"] is True
    assert facts["net_quantity"]["magnitude"] == 1.0
    assert facts["manufacturer"]["name"] == "Exotic Mile Pvt Ltd"
    assert facts["manufacturer"]["pin_code"] == "110020"
    assert facts["consumer_care"]["email"] == "support@goboult.co.in"
    assert facts["country_of_origin"] == "India"
    assert facts["mfg_date_month"] == 4
    assert facts["mfg_date_year"] == 2026

    # Verify attribution tracking
    attr = fused["panel_attribution"]
    assert attr["GENERIC_NAME"]["source_image_id"] == "img_front_pdp"
    assert attr["MRP"]["source_image_id"] == "img_back_panel"
    assert attr["MANUFACTURER_ADDRESS"]["source_image_id"] == "img_back_panel"


def test_banned_unit_cross_panel_propagation():
    """Verify that a prohibited unit on any panel (e.g. gms on Side Panel) flags the entire package."""
    front_facts = NormalizedCommodityFacts(
        image_id="img_front",
        net_quantity=NetQuantityValue(magnitude=200.0, unit="g", has_banned_unit=False),
    )
    side_facts = NormalizedCommodityFacts(
        image_id="img_side",
        net_quantity=NetQuantityValue(
            magnitude=200.0, unit="gms", has_banned_unit=True, banned_unit_found="gms"
        ),
    )

    facets = [
        {"image_id": "img_front", "panel_type": "PDP_FRONT", "facts": front_facts.model_dump()},
        {"image_id": "img_side", "panel_type": "SIDE_PANEL", "facts": side_facts.model_dump()},
    ]

    fused = CrossFacetSemanticFusionEngine.fuse_facets(facets)
    assert fused["has_banned_unit"] is True
    assert fused["banned_unit_found"] == "gms"
    assert fused["unified_facts"]["net_quantity"]["has_banned_unit"] is True


def test_split_address_reconciliation():
    """Verify that corporate name from front PDP and address/PIN from back panel merge seamlessly."""
    front_facts = NormalizedCommodityFacts(
        image_id="img_front",
        manufacturer=AddressValue(name="Haldiram Snacks Pvt Ltd", is_complete=False),
    )
    back_facts = NormalizedCommodityFacts(
        image_id="img_back",
        manufacturer=AddressValue(
            address_line="C-3, Sector 67",
            state="Uttar Pradesh",
            pin_code="201307",
            is_complete=True,
        ),
    )

    facets = [
        {"image_id": "img_front", "panel_type": "PDP_FRONT", "facts": front_facts.model_dump()},
        {"image_id": "img_back", "panel_type": "BACK_PANEL", "facts": back_facts.model_dump()},
    ]

    fused = CrossFacetSemanticFusionEngine.fuse_facets(facets)
    mfg = fused["unified_facts"]["manufacturer"]
    assert mfg["name"] == "Haldiram Snacks Pvt Ltd"
    assert mfg["pin_code"] == "201307"
    assert mfg["state"] == "Uttar Pradesh"
    assert mfg["is_complete"] is True


def test_consumer_care_multi_panel_merging():
    """Verify phone from back panel and email from side panel merge into one contact tuple."""
    back_facts = NormalizedCommodityFacts(
        image_id="img_back",
        consumer_care=ConsumerCareValue(phone="1800-200-8888"),
    )
    side_facts = NormalizedCommodityFacts(
        image_id="img_side",
        consumer_care=ConsumerCareValue(email="customercare@tata.com", address="Mumbai, Maharashtra"),
    )

    facets = [
        {"image_id": "img_back", "panel_type": "BACK_PANEL", "facts": back_facts.model_dump()},
        {"image_id": "img_side", "panel_type": "SIDE_PANEL", "facts": side_facts.model_dump()},
    ]

    fused = CrossFacetSemanticFusionEngine.fuse_facets(facets)
    cc = fused["unified_facts"]["consumer_care"]
    assert cc["phone"] == "1800-200-8888"
    assert cc["email"] == "customercare@tata.com"
    assert cc["address"] == "Mumbai, Maharashtra"
    assert cc["is_complete"] is True


def test_empty_and_single_facet():
    """Verify empty and single-facet inputs do not raise unhandled exceptions."""
    empty_res = CrossFacetSemanticFusionEngine.fuse_facets([])
    assert empty_res["total_facets_processed"] == 0
    assert empty_res["unified_facts"]["image_id"] == "unknown"

    single_facts = NormalizedCommodityFacts(
        image_id="img_single",
        mrp=MRPValue(amount=50.0, tax_inclusive=True),
    )
    single_res = CrossFacetSemanticFusionEngine.fuse_facets([
        {"image_id": "img_single", "panel_type": "PDP_FRONT", "facts": single_facts.model_dump()}
    ])
    assert single_res["total_facets_processed"] == 1
    assert single_res["unified_facts"]["mrp"]["amount"] == 50.0
