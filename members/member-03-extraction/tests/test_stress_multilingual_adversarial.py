"""Pass 2: Multilingual Adversarial Chaos & Unicode/OCR Noise Stress Test Suite (SIH26034)

Audits and stress-tests:
- Zero-width space (\\u200B), BOM (\\uFEFF), and non-breaking space injection
- Devanagari numerals, mixed fractions, and vernacular Hindi dates
- Bilingual packaging declarations (English + Devanagari Hindi)
- Indic vowel signs (matras) and combining Unicode characters
- Middle Eastern / South Asian script contamination (Arabic / Urdu)
- Official Gazette statutory phrases (निवल सामग्री, अ.वि.मू., कर सहित)
- Complete Devanagari Hindi address blocks with GIDC / industrial zones
"""

import sys
from pathlib import Path
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from parsers import StatutoryDeclarationParser
from extractor import CommodityFactExtractor



@pytest.fixture
def extractor():
    return CommodityFactExtractor()


def test_devanagari_zero_width_and_invisible_unicode_injection():
    """Verify invisible zero-width and non-breaking characters do not corrupt parsing."""
    parser = StatutoryDeclarationParser

    # Zero-width space injected between digits and non-breaking space before unit
    noisy_qty = "निवल मात्रा:\u200b २\u200b५०\u00a0ग्राम"
    qty_res = parser.parse_net_quantity(noisy_qty)
    assert qty_res is not None
    assert qty_res["magnitude"] == 250.0
    assert qty_res["unit"] == "g"
    assert qty_res["has_banned_unit"] is False

    # BOM and narrow no-break space in MRP declaration
    noisy_mrp = "अ.वि.मू.\ufeff रु.\u202f१,४९९/- (सभी कर सहित)"
    mrp_res = parser.parse_mrp(noisy_mrp)
    assert mrp_res is not None
    assert mrp_res["amount"] == 1499.0
    assert mrp_res["currency"] == "INR"
    assert mrp_res["tax_inclusive"] is True


def test_devanagari_mixed_fractions_and_hindi_dates():
    """Verify mixed vulgar fractions and Hindi month names are parsed accurately."""
    parser = StatutoryDeclarationParser

    # Mixed fraction in Hindi: 2 ½ kg
    fractional_qty = "शुद्ध वजन: २ ½ किग्रा"
    qty = parser.parse_net_quantity(fractional_qty)
    assert qty is not None
    assert qty["magnitude"] == 2.5
    assert qty["unit"] == "kg"

    # Hindi month name and Devanagari year
    hindi_date = "निर्माण तिथि: १५-मार्च-२०२४"
    dates = parser.parse_mfg_and_expiry_dates(hindi_date)
    assert dates is not None
    assert dates["mfg_month"] == 3
    assert dates["mfg_year"] == 2024


def test_multilingual_bilingual_hindi_english_packaging(extractor):
    """Verify composite bilingual packaging declarations with simultaneous English and Hindi."""
    bilingual_tokens = [
        {"token_id": "t1", "text": "Net Weight / निवल भार:", "confidence": 0.96, "bounding_box": [10, 10, 30, 200]},
        {"token_id": "t2", "text": "500 g / ५०० ग्राम", "confidence": 0.98, "bounding_box": [35, 10, 55, 180]},
        {"token_id": "t3", "text": "MRP / अधिकतम खुदरा मूल्य:", "confidence": 0.95, "bounding_box": [70, 10, 90, 220]},
        {"token_id": "t4", "text": "Rs. 120.00 / रु. १२० (कर सहित)", "confidence": 0.97, "bounding_box": [95, 10, 115, 230]},
        {"token_id": "t5", "text": "उत्पत्ति का देश: भारत / Country of Origin: India", "confidence": 0.94, "bounding_box": [130, 10, 150, 350]},
    ]

    facts = extractor.extract(bilingual_tokens)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.net_quantity.unit == "g"
    assert facts.mrp is not None
    assert facts.mrp.amount == 120.0
    assert facts.mrp.tax_inclusive is True
    assert facts.country_of_origin in ("India", "भारत")


def test_indic_matra_and_combining_characters_resilience():
    """Verify combining vowel signs (matras, category Mc) never cause regex boundary failures."""
    parser = StatutoryDeclarationParser

    test_cases = [
        ("निवल सामग्री: १० मि.ली.", 10.0, "ml"),
        ("मात्रा: ५ लीटर", 5.0, "l"),
        ("भार: १०० ग्रा.", 100.0, "g"),
        ("कुल परिमाण: ५० मिलीलीटर", 50.0, "ml"),
    ]

    for text, expected_mag, expected_unit in test_cases:
        res = parser.parse_net_quantity(text)
        assert res is not None, f"Failed on: {text}"
        assert res["magnitude"] == expected_mag
        assert res["unit"] == expected_unit


def test_arabic_urdu_script_contamination():
    """Verify RTL scripts (Arabic/Urdu) on export packaging do not disrupt LMPC statutory parsing."""
    parser = StatutoryDeclarationParser

    export_text = "وزن صاف 100 غرام | Net Quantity: 100 g | Mfd by: Britannia Industries Ltd, Kolkata 700017"
    qty = parser.parse_net_quantity(export_text)
    assert qty is not None
    assert qty["magnitude"] == 100.0
    assert qty["unit"] == "g"

    addr = parser.parse_address(export_text)
    assert addr is not None
    assert addr["state"] == "West Bengal"
    assert addr["pin_code"] == "700017"


def test_gazette_hindi_statutory_phrases():
    """Verify official Gazette statutory terms under LMPC Rules 2011."""
    parser = StatutoryDeclarationParser

    usp_text = "इकाई विक्रय मूल्य: रु. ०.७५ प्रति ग्राम"
    usp = parser.parse_usp(usp_text)
    assert usp is not None
    assert usp["price_per_unit"] == 0.75
    assert usp["unit"] == "g"

    gen_text = "वस्तु का नाम: नहाने का साबुन"
    gen = parser.parse_generic_name(gen_text)
    assert gen is not None
    assert "साबुन" in gen


def test_complete_devanagari_address_block():
    """Verify full Devanagari Hindi address parsing with industrial GIDC zone."""
    parser = StatutoryDeclarationParser

    hindi_address = "निर्माता एवं पैकर: आनंद एग्रो फूड्स, प्लॉट नंबर १२, जीआईडीसी वापी, गुजरात ३९६१९५"
    addr = parser.parse_address(hindi_address)
    assert addr is not None
    assert addr["state"] == "Gujarat"
    assert addr["pin_code"] == "396195"
    assert addr["is_complete"] is True
