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
