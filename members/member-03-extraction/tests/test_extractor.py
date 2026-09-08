"""Integration & End-to-End Tests for CommodityFactExtractor (SIH26034)
Verifies full pipeline conversion of OCROutput tokens into NormalizedCommodityFacts.
"""

import json
from pathlib import Path
import sys
import pytest

# Ensure local src, contracts, and root are on sys.path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from contracts.extraction.extraction_dto import NormalizedCommodityFacts
from contracts.ocr.ocr_dto import OCROutput, OCRToken
from extractor import CommodityFactExtractor

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


@pytest.fixture
def extractor():
    return CommodityFactExtractor()


def test_extract_fully_compliant_packaged_good(extractor):
    """Verify end-to-end extraction of all Rule 6 statutory declarations."""
    with open(FIXTURES_DIR / "fixture_ocr_compliant_packaged_good.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert isinstance(facts, NormalizedCommodityFacts)
    assert facts.image_id == "img_compliant_pack_05"

    # 1. Net Quantity
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 400.0
    assert facts.net_quantity.unit == "g"
    assert facts.net_quantity.has_banned_unit is False

    # 2. Maximum Retail Price (MRP)
    assert facts.mrp is not None
    assert facts.mrp.amount == 150.0
    assert facts.mrp.currency == "INR"
    assert facts.mrp.tax_inclusive is True

    # 3. Unit Sale Price (USP)
    assert facts.unit_sale_price is not None
    assert facts.unit_sale_price.price_per_unit == 0.375
    assert facts.unit_sale_price.unit == "g"

    # 4. Manufacturing & Expiry Dates
    assert facts.mfg_date_month == 4
    assert facts.mfg_date_year == 2024

    # 5. Manufacturer Address
    assert facts.manufacturer is not None
    assert "Parle Products" in facts.manufacturer.name
    assert facts.manufacturer.state == "Maharashtra"
    assert facts.manufacturer.pin_code == "400057"
    assert facts.manufacturer.is_complete is True

    # 6. Consumer Care 4-tuple
    assert facts.consumer_care is not None
    assert facts.consumer_care.phone is not None
    assert "1800-22-1234" in facts.consumer_care.phone
    assert facts.consumer_care.email == "care@parle.biz"
    assert facts.consumer_care.is_complete is True

    # 7. Country of Origin
    assert facts.country_of_origin == "India"

    # 8. Raw fields audit
    assert len(facts.raw_fields) >= 6
    for field in facts.raw_fields:
        assert len(field.bounding_box) == 4
        assert field.ocr_confidence > 0.0


def test_extract_devanagari_packaging(extractor):
    """Verify Indic numeral conversion and Devanagari packaging entity extraction."""
    with open(FIXTURES_DIR / "fixture_ocr_devanagari_packaging.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "g"

    assert facts.mrp is not None
    assert facts.mrp.amount == 120.0
    assert facts.mrp.tax_inclusive is True

    assert facts.mfg_date_month == 5
    assert facts.mfg_date_year == 2024
    assert facts.country_of_origin == "India"


def test_extract_banned_unit_ltrs_and_kgs(extractor):
    """Verify prohibited units 'ltrs' and 'Kgs' are flagged in extraction."""
    with open(FIXTURES_DIR / "fixture_ocr_banned_unit_ltrs.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 2.0
    assert facts.net_quantity.has_banned_unit is True
    assert facts.net_quantity.banned_unit_found.lower() == "ltrs"


def test_multi_token_spatial_merging(extractor):
    """Verify that split tokens on the same horizontal band are linked correctly."""
    ocr_payload = {
        "image_id": "img_split_tokens_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Net Wt:",
                "confidence": 0.99,
                "bounding_box": [100, 50, 140, 180],
                "polygon": [[50, 100], [180, 100], [180, 140], [50, 140]],
            },
            {
                "token_id": "t2",
                "text": "250 g",
                "confidence": 0.98,
                "bounding_box": [100, 190, 140, 280],
                "polygon": [[190, 100], [280, 100], [280, 140], [190, 140]],
            },
            {
                "token_id": "t3",
                "text": "MRP",
                "confidence": 0.99,
                "bounding_box": [160, 50, 200, 120],
                "polygon": [[50, 160], [120, 160], [120, 200], [50, 200]],
            },
            {
                "token_id": "t4",
                "text": "Rs. 85.00 (incl. of all taxes)",
                "confidence": 0.97,
                "bounding_box": [160, 130, 200, 480],
                "polygon": [[130, 160], [480, 160], [480, 200], [130, 200]],
            }
        ]
    }

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 250.0
    assert facts.net_quantity.unit == "g"

    assert facts.mrp is not None
    assert facts.mrp.amount == 85.0
    assert facts.mrp.tax_inclusive is True


def test_ocr_dto_instance_compatibility(extractor):
    """Verify that OCROutput Pydantic DTO instances can be passed directly to extract()."""
    ocr_dto = OCROutput(
        image_id="img_dto_test_01",
        total_tokens=2,
        mean_confidence=0.985,
        execution_time_ms=25,
        full_text="Net Qty: 1 kg\nMRP Rs. 90.00 (incl. of all taxes)",
        tokens=[
            OCRToken(
                token_id="tok_1",
                text="Net Qty: 1 kg",
                confidence=0.99,
                polygon=[[10, 10], [150, 10], [150, 40], [10, 40]],
                bounding_box=[10, 10, 40, 150],
                language="en",
            ),
            OCRToken(
                token_id="tok_2",
                text="MRP Rs. 90.00 (incl. of all taxes)",
                confidence=0.98,
                polygon=[[10, 50], [350, 50], [350, 80], [10, 80]],
                bounding_box=[50, 10, 80, 350],
                language="en",
            ),
        ]
    )

    facts = extractor.extract(ocr_dto)
    assert isinstance(facts, NormalizedCommodityFacts)
    assert facts.image_id == "img_dto_test_01"
    assert facts.net_quantity.magnitude == 1.0
    assert facts.net_quantity.unit == "kg"
    assert facts.mrp.amount == 90.0
    assert facts.mrp.tax_inclusive is True


def test_extract_banned_unit_gms(extractor):
    """Verify extraction on fixture_ocr_banned_unit_gms.json."""
    with open(FIXTURES_DIR / "fixture_ocr_banned_unit_gms.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "gms"
    assert facts.net_quantity.has_banned_unit is True
    assert facts.net_quantity.banned_unit_found.lower() == "gms"
    assert facts.mrp.amount == 120.0
    assert facts.mrp.tax_inclusive is True


def test_extract_banned_unit_ml(extractor):
    """Verify extraction on fixture_ocr_banned_unit_ml.json."""
    with open(FIXTURES_DIR / "fixture_ocr_banned_unit_ml.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 750.0
    assert facts.net_quantity.unit == "ML"
    assert facts.net_quantity.has_banned_unit is True
    assert facts.net_quantity.banned_unit_found == "ML"
    assert facts.mrp.amount == 45.0
    assert facts.mrp.tax_inclusive is True


def test_extract_incomplete_consumer_care_fixture(extractor):
    """Verify extraction on fixture_ocr_incomplete_consumer_care.json."""
    with open(FIXTURES_DIR / "fixture_ocr_incomplete_consumer_care.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.consumer_care is not None
    assert facts.consumer_care.is_complete is False
    assert facts.consumer_care.email is None
    assert facts.consumer_care.phone is not None
    assert facts.manufacturer is not None
    assert facts.manufacturer.pin_code == "110020"


def test_extract_valid_quantities_fixture(extractor):
    """Verify extraction on fixture_ocr_valid_quantities.json."""
    with open(FIXTURES_DIR / "fixture_ocr_valid_quantities.json", encoding="utf-8") as f:
        ocr_payload = json.load(f)

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "g"
    assert facts.net_quantity.has_banned_unit is False
    assert facts.mrp.amount == 200.0
    assert facts.mrp.tax_inclusive is True
    assert facts.unit_sale_price.price_per_unit == 0.40
    assert facts.unit_sale_price.unit == "g"


def test_extract_multiline_address_block(extractor):
    """Verify that multi-line address declarations across 3 lines are aggregated into a complete address."""
    ocr_payload = {
        "image_id": "img_multiline_addr_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Manufactured by: Parle Products Pvt Ltd",
                "confidence": 0.98,
                "bounding_box": [100, 10, 120, 350],
            },
            {
                "token_id": "t2",
                "text": "North Level Crossing, Vile Parle East",
                "confidence": 0.97,
                "bounding_box": [125, 10, 145, 350],
            },
            {
                "token_id": "t3",
                "text": "Mumbai, Maharashtra 400057",
                "confidence": 0.98,
                "bounding_box": [150, 10, 170, 350],
            }
        ]
    }

    facts = extractor.extract(ocr_payload)
    assert facts.manufacturer is not None
    assert "Parle Products" in facts.manufacturer.name
    assert facts.manufacturer.state == "Maharashtra"
    assert facts.manufacturer.pin_code == "400057"
    assert facts.manufacturer.is_complete is True

    # Verify union bounding box across the 3 lines
    mfg_field = next(f for f in facts.raw_fields if f.field_type == "MANUFACTURER_ADDRESS")
    assert mfg_field.bounding_box == [100, 10, 170, 350]


def test_extract_vertically_stacked_tokens(extractor):
    """Verify linking of vertically stacked label and value tokens."""
    ocr_payload = {
        "image_id": "img_vert_stack_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Net Weight:",
                "confidence": 0.99,
                "bounding_box": [50, 20, 70, 150],
            },
            {
                "token_id": "t2",
                "text": "500 g",
                "confidence": 0.98,
                "bounding_box": [75, 20, 95, 150],
            },
            {
                "token_id": "t3",
                "text": "MRP",
                "confidence": 0.99,
                "bounding_box": [110, 20, 130, 80],
            },
            {
                "token_id": "t4",
                "text": "Rs. 250.00 (incl. of all taxes)",
                "confidence": 0.97,
                "bounding_box": [135, 20, 155, 320],
            }
        ]
    }

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "g"

    assert facts.mrp is not None
    assert facts.mrp.amount == 250.0
    assert facts.mrp.tax_inclusive is True


def test_extract_packer_and_importer_role_disambiguation(extractor):
    """Verify disambiguation between manufacturer and packer in the same package."""
    ocr_payload = {
        "image_id": "img_roles_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Manufactured by: Nestlé India Limited, Industrial Area, Nanjangud, Mysore, Karnataka 571301",
                "confidence": 0.98,
                "bounding_box": [100, 10, 130, 600],
            },
            {
                "token_id": "t2",
                "text": "Packed by: Packaging Solutions Pvt Ltd, Sector 5, Haridwar, Uttarakhand 249403",
                "confidence": 0.97,
                "bounding_box": [140, 10, 170, 600],
            }
        ]
    }

    facts = extractor.extract(ocr_payload)
    assert facts.manufacturer is not None
    assert "Nestlé India" in facts.manufacturer.name
    assert facts.manufacturer.state == "Karnataka"
    assert facts.manufacturer.pin_code == "571301"

    assert facts.packer is not None
    assert "Packaging Solutions" in facts.packer.name
    assert facts.packer.state == "Uttarakhand"
    assert facts.packer.pin_code == "249403"


def test_extract_manufactured_and_packed_by_joint_roles(extractor):
    """Verify that 'Manufactured & Packed by' populates BOTH manufacturer and packer facts."""
    ocr_payload = {
        "image_id": "img_joint_roles_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Manufactured & Packed by: Parle Products Pvt Ltd, Mumbai, Maharashtra 400057",
                "confidence": 0.98,
                "bounding_box": [100, 10, 130, 600],
            }
        ]
    }
    facts = extractor.extract(ocr_payload)
    assert facts.manufacturer is not None
    assert "Parle Products" in facts.manufacturer.name
    assert facts.manufacturer.pin_code == "400057"
    assert facts.manufacturer.state == "Maharashtra"

    assert facts.packer is not None
    assert "Parle Products" in facts.packer.name
    assert facts.packer.pin_code == "400057"


def test_extract_multi_column_isolation(extractor):
    """Verify that tokens in distant columns at the same vertical level are NOT merged into the same line."""
    ocr_payload = {
        "image_id": "img_multicol_01",
        "tokens": [
            {
                "token_id": "t_right",
                "text": "Batch No: 9876",
                "confidence": 0.95,
                "bounding_box": [100, 500, 120, 650],
            },
            {
                "token_id": "t_left",
                "text": "Net Qty: 500 g",
                "confidence": 0.98,
                "bounding_box": [101, 50, 121, 180],
            }
        ]
    }
    composite = extractor._cluster_horizontal_lines(ocr_payload["tokens"])
    assert len(composite) == 2, f"Expected 2 lines for 2 distinct columns, got {len(composite)}"

    facts = extractor.extract(ocr_payload)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "g"


def test_mrp_priority_over_usp_when_usp_precedes_mrp(extractor):
    """Verify that when USP appears before MRP in token stream, true MRP is not overwritten by USP."""
    ocr_payload = {
        "image_id": "img_mrp_usp_order_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "USP: Rs. 0.40 / g",
                "confidence": 0.97,
                "bounding_box": [100, 50, 120, 250],
            },
            {
                "token_id": "t2",
                "text": "MRP: Rs. 80.00 (incl. of all taxes)",
                "confidence": 0.98,
                "bounding_box": [150, 50, 170, 380],
            }
        ]
    }
    facts = extractor.extract(ocr_payload)
    assert facts.mrp is not None
    assert facts.mrp.amount == 80.0, f"Expected true MRP 80.0, but got {facts.mrp.amount}"
    assert facts.mrp.tax_inclusive is True

    assert facts.unit_sale_price is not None
    assert facts.unit_sale_price.price_per_unit == 0.40
    assert facts.unit_sale_price.unit == "g"


def test_extract_generic_name_field(extractor):
    """Verify generic name extraction per Rule 6(1)(b) into ExtractedFieldDTO."""
    ocr_payload = {
        "image_id": "img_generic_name_01",
        "tokens": [
            {
                "token_id": "t1",
                "text": "Generic Name: Butter Cookies",
                "confidence": 0.99,
                "bounding_box": [50, 50, 70, 300],
            },
            {
                "token_id": "t2",
                "text": "Net Qty: 200 g",
                "confidence": 0.98,
                "bounding_box": [80, 50, 100, 200],
            }
        ]
    }
    facts = extractor.extract(ocr_payload)
    generic_field = next((f for f in facts.raw_fields if f.field_type == "GENERIC_NAME"), None)
    assert generic_field is not None
    assert generic_field.normalized_value.get("generic_name") == "Butter Cookies"


def test_extract_with_calibration_font_height(extractor):
    """Verify that optical scale factor px_to_mm attaches measured_font_height_mm."""
    ocr_payload = {
        "image_id": "img_calib_01",
        "calibration": {
            "px_to_mm": 10.0,
            "confidence": 0.99
        },
        "tokens": [
            {
                "token_id": "t1",
                "text": "Net Weight: 500 g",
                "confidence": 0.98,
                "bounding_box": [100, 50, 125, 250],  # 25 pixels height -> 2.5 mm
            }
        ]
    }
    facts = extractor.extract(ocr_payload)
    net_field = next(f for f in facts.raw_fields if f.field_type == "NET_QUANTITY")
    assert net_field.measured_font_height_mm == 2.5
    assert net_field.measurement_confidence == 0.95


