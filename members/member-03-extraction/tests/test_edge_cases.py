"""Exhaustive Edge Cases and Adversarial Tests for Member 3 Semantic Extraction (SIH26034)

Verifies:
- Edge cases in metric and non-standard unit declarations
- Boundary conditions in Indian PIN codes, phone numbers, and FSSAI numbers
- Intermediate tax clauses and comma-formatted pricing
- Multilingual Devanagari numerals and dates
- Multi-line address blocks and spatial label-value linking
- Graceful degradation on empty or degenerate inputs
"""

from pathlib import Path
import sys
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from contracts.extraction.extraction_dto import NormalizedCommodityFacts
from extractor import CommodityFactExtractor
from parsers import StatutoryDeclarationParser


@pytest.fixture
def extractor():
    return CommodityFactExtractor()


# =========================================================================
# 1. Banned & Valid Units Deep Edge Cases
# =========================================================================

def test_all_prohibited_metric_symbols():
    """Verify all prohibited metric unit symbols under Section 11 & Rule 12 are flagged."""
    banned_samples = [
        ("Net Wt: 500 gms", "gms"),
        ("Net Wt: 500 gm", "gm"),
        ("Net Wt: 500 g.m.", "g.m."),
        ("Net Wt: 500 g.m.s.", "g.m.s."),
        ("Gross Wt: 5 Kgs", "Kgs"),
        ("Weight: 10 kgms", "kgms"),
        ("Volume: 750 ML", "ML"),
        ("Volume: 500 Ml", "Ml"),
        ("Volume: 2 ltrs", "ltrs"),
        ("Net Vol: 1 ltr", "ltr"),
        ("Capacity: 100 cc", "cc"),
        ("Capacity: 250 c.c.", "c.c."),
        ("Quantity: 5 liters", "liters"),
        ("Net Content: 10 kilos", "kilos"),
    ]
    for text, expected_sym in banned_samples:
        has_banned, sym = StatutoryDeclarationParser.detect_banned_units(text)
        assert has_banned is True, f"Failed on banned unit: {text}"
        assert sym is not None
        assert expected_sym.lower() in sym.lower() or sym in ("ML", "Ml")


def test_all_valid_metric_symbols_not_flagged():
    """Verify statutory valid SI units are NEVER falsely flagged as banned."""
    valid_samples = [
        "Net Quantity: 500 g",
        "Net Wt: 1.5 kg",
        "Net Content: 250 mg",
        "Net Volume: 750 ml",
        "Net Volume: 750 mL",
        "Volume: 1 l",
        "Volume: 2 L",
        "Net Quantity: 10 N",
        "Net Quantity: 5 U",
        "Net Length: 15 m",
        "Net Length: 100 cm",
        "Net Area: 5 sq m",
        "Net Area: 100 sq cm",
    ]
    for text in valid_samples:
        has_banned, sym = StatutoryDeclarationParser.detect_banned_units(text)
        assert has_banned is False, f"Falsely flagged valid unit in: {text}"
        assert sym is None


# =========================================================================
# 2. Net Quantity & Unit Normalization Deep Edge Cases
# =========================================================================

def test_net_quantity_varied_prefixes_and_units():
    """Verify net quantity parsing across diverse prefixes and units."""
    test_cases = [
        ("Net Weight: 250g", 250.0, "g"),
        ("Net Wt. : 1.5 kg", 1.5, "kg"),
        ("Net Content: 100 ml", 100.0, "ml"),
        ("Net Contents: 2 L", 2.0, "l"),
        ("Net Vol: 500 ml", 500.0, "ml"),
        ("Net Volume: 1,500 ml", 1500.0, "ml"),
        ("Net Mass: 1 kg", 1.0, "kg"),
        ("Quantity: 100 tablets", 100.0, "N"),
        ("Qty: 20 sachets", 20.0, "N"),
        ("Net Quantity: 12 pieces", 12.0, "N"),
        ("Net Qty: 6 Nos.", 6.0, "N"),
        ("Net Area: 10 sq m", 10.0, "sq m"),
        ("Net Length: 50 m", 50.0, "m"),
        ("शुद्ध भार: 250 g", 250.0, "g"),
    ]
    for text, exp_mag, exp_unit in test_cases:
        res = StatutoryDeclarationParser.parse_net_quantity(text)
        assert res is not None, f"Failed to parse net quantity from: {text}"
        assert res["magnitude"] == exp_mag, f"Magnitude mismatch on: {text}"
        assert res["unit"] == exp_unit, f"Unit mismatch on: {text}"


# =========================================================================
# 3. MRP & Intermediate Tax Clauses Deep Edge Cases
# =========================================================================

def test_mrp_pricing_clauses_and_formats():
    """Verify MRP pricing across diverse tax clauses and currency symbols."""
    cases = [
        ("MRP Rs. 299.00 (inclusive of all taxes)", 299.00, True),
        ("MRP (incl. of all taxes) Rs. 499.00", 499.00, True),
        ("MRP (including all taxes) : ₹ 1,299.00", 1299.00, True),
        ("M.R.P. ₹ 99.00 (all taxes included)", 99.00, True),
        ("Maximum Retail Price: Rs. 500/- (incl. of taxes)", 500.00, True),
        ("अ.वि.मू. ₹ १,५००.०० (कर सहित)", 1500.00, True),
        ("MRP: Rs. 150.00", 150.00, False),
        ("₹ 350.00 (incl. of all taxes)", 350.00, True),
    ]
    for text, exp_amount, exp_tax in cases:
        mrp = StatutoryDeclarationParser.parse_mrp(text)
        assert mrp is not None, f"Failed to parse MRP from: {text}"
        assert mrp["amount"] == exp_amount, f"Amount mismatch on: {text}"
        assert mrp["tax_inclusive"] is exp_tax, f"Tax inclusive mismatch on: {text}"


# =========================================================================
# 4. USP Deep Edge Cases
# =========================================================================

def test_usp_varied_denominators():
    """Verify USP parsing across per g, per ml, per 100g, per kg, and per piece."""
    cases = [
        ("Unit Sale Price: Rs. 0.40 / g", 0.40, "g"),
        ("USP: ₹ 1.25 / ml", 1.25, "ml"),
        ("USP: Rs. 45.00 / 100g", 45.00, "100g"),
        ("USP: Rs. 45.00 / 100 g", 45.00, "100g"),
        ("USP: Rs. 1,200.00 / kg", 1200.00, "kg"),
        ("USP: Rs. 5.00 per piece", 5.00, "piece"),
        ("Rs. 0.50 per g", 0.50, "g"),
    ]
    for text, exp_price, exp_unit in cases:
        usp = StatutoryDeclarationParser.parse_usp(text)
        assert usp is not None, f"Failed to parse USP from: {text}"
        assert usp["price_per_unit"] == exp_price
        assert usp["unit"] == exp_unit


# =========================================================================
# 5. Dates & Manufacturing / Expiry Deep Edge Cases
# =========================================================================

def test_date_varied_formats():
    """Verify manufacturing, packaging, and expiry date variations."""
    cases = [
        ("Mfg Date: 03/2024", 3, 2024, None, None),
        ("Date of Mfg: 15-Mar-2024", 3, 2024, None, None),
        ("Packed: 04 / 2024", 4, 2024, None, None),
        ("Pkd Date: 05-24", 5, 2024, None, None),
        ("उत्पादन तिथि: ०५/२०२४", 5, 2024, None, None),
        ("Mfg Date: 01/2024  Exp Date: 01/2026", 1, 2024, 1, 2026),
        ("Date of Pkg: 10-Oct-2023  Use by: 10-Oct-2025", 10, 2023, 10, 2025),
        ("Mfg: 06/2024  Best before 18 months", 6, 2024, None, None),
    ]
    for text, m_mfg, y_mfg, m_exp, y_exp in cases:
        dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(text)
        if m_mfg:
            assert dates["mfg_month"] == m_mfg, f"Mfg month mismatch on: {text}"
            assert dates["mfg_year"] == y_mfg, f"Mfg year mismatch on: {text}"
        if m_exp:
            assert dates["exp_month"] == m_exp, f"Exp month mismatch on: {text}"
            assert dates["exp_year"] == y_exp, f"Exp year mismatch on: {text}"


# =========================================================================
# 6. PIN Code Boundary Guards & False Positive Rejection
# =========================================================================

def test_pin_code_guards_against_all_non_pins():
    """Verify PIN code parser rejects 10-digit phones, 14-digit FSSAI, GSTIN, and dates."""
    non_pin_texts = [
        "Customer Support Tel: 9876543210",
        "Phone No: 022-26830123",
        "Helpline: +91 9123456789",
        "FSSAI Lic. No. 10014022001234",
        "FSSAI Number: 11518018000123",
        "GSTIN: 27AAPFU0939F1ZV",
        "EAN-13 Barcode: 8901030383748",
    ]
    for text in non_pin_texts:
        pin = StatutoryDeclarationParser.parse_pin_code(text)
        assert pin is None, f"False positive PIN detected in: {text}"


def test_pin_code_valid_variations():
    """Verify valid PIN codes in various formatting styles."""
    valid_pins = [
        ("Mumbai, Maharashtra 400057", "400057"),
        ("New Delhi - 110 020", "110020"),
        ("Bengaluru - 560-001", "560001"),
        ("PIN Code: 700017", "700017"),
        ("PIN: 600 001", "600001"),
        ("पिन कोड: ४०००५७", "400057"),
    ]
    for text, exp_pin in valid_pins:
        pin = StatutoryDeclarationParser.parse_pin_code(text)
        assert pin == exp_pin, f"Failed to extract PIN from: {text}"


# =========================================================================
# 7. Indian Postal Address & State Resolution Deep Edge Cases
# =========================================================================

def test_address_resolution_from_cities_and_pins():
    """Verify State resolution from city names and PIN prefixes."""
    # City-based resolution
    addr_city = StatutoryDeclarationParser.parse_address("Manufactured by: Britannia Industries Ltd., Mumbai - 400057")
    assert addr_city["state"] == "Maharashtra"
    assert addr_city["pin_code"] == "400057"
    assert addr_city["is_complete"] is True

    # Bengaluru city -> Karnataka
    addr_blr = StatutoryDeclarationParser.parse_address("Packed by: ITC Limited, Bengaluru - 560001")
    assert addr_blr["state"] == "Karnataka"
    assert addr_blr["pin_code"] == "560001"
    assert addr_blr["is_complete"] is True

    # Kolkata city -> West Bengal
    addr_ccu = StatutoryDeclarationParser.parse_address("Imported by: ABC Traders, Kolkata - 700017")
    assert addr_ccu["state"] == "West Bengal"
    assert addr_ccu["pin_code"] == "700017"
    assert addr_ccu["is_complete"] is True


# =========================================================================
# 8. Consumer Care 4-Tuple Deep Edge Cases
# =========================================================================

def test_consumer_care_full_tuple_and_completeness():
    """Verify Consumer Care 4-tuple evaluation and address reference detection."""
    full_text = (
        "For Consumer Complaints, contact Customer Care Executive at the manufacturer's address given above. "
        "Toll-free: 1800-22-1234, Email: consumer.feedback@brand.co.in"
    )
    status = StatutoryDeclarationParser.check_consumer_care_completeness(full_text)
    assert status["has_contact_name"] is True
    assert status["has_address"] is True
    assert status["has_phone"] is True
    assert status["has_email"] is True
    assert status["is_complete"] is True
    assert status["email"] == "consumer.feedback@brand.co.in"
    assert "1800-22-1234" in status["phone"]


# =========================================================================
# 9. Country of Origin Deep Edge Cases
# =========================================================================

def test_country_of_origin_isolation():
    """Verify Country of Origin strips trailing manufacturer details."""
    cases = [
        ("Country of Origin: India", "India"),
        ("Made in India by Nestlé India Ltd.", "India"),
        ("Produce of India", "India"),
        ("Product of Thailand", "Thailand"),
        ("Made in Bharat", "India"),
        ("Country of Origin: Vietnam", "Vietnam"),
        ("मूल देश: भारत", "भारत"),
    ]
    for text, exp_country in cases:
        origin = StatutoryDeclarationParser.parse_country_of_origin(text)
        assert origin == exp_country, f"Origin mismatch on: {text}"


# =========================================================================
# 10. End-to-End Degenerate & Empty Input Resilience
# =========================================================================

def test_extractor_handles_empty_and_degraded_inputs(extractor):
    """Verify extractor handles empty token lists and degenerate inputs without crashing."""
    empty_payload = {
        "image_id": "img_empty_01",
        "tokens": [],
        "full_text": ""
    }
    facts = extractor.extract(empty_payload)
    assert isinstance(facts, NormalizedCommodityFacts)
    assert facts.image_id == "img_empty_01"
    assert facts.net_quantity is None
    assert facts.mrp is None
    assert facts.unit_sale_price is None
    assert facts.manufacturer is None
    assert len(facts.raw_fields) == 0


# =========================================================================
# 11. Senior SDE & CTO Adversarial Deep Attacks
# =========================================================================

def test_adversarial_banned_units_variations():
    """Verify single-dot abbreviations, capitalized variants, and punctuation on units."""
    adversarial_banned = [
        "Net Wt: 500 g.m",
        "Volume: 100 c.c",
        "Volume: 500 M.L",
        "Volume: 500 M.l",
        "Net Vol: 2 LTR",
        "Net Vol: 2 LTRS",
        "Net Wt: 500 g.",
        "Gross Wt: 1.5 kg.",
        "Net Volume: 750 ml.",
        "Volume: 1 l.",
    ]
    for text in adversarial_banned:
        has_banned, sym = StatutoryDeclarationParser.detect_banned_units(text)
        assert has_banned is True, f"Failed to flag adversarial banned unit in: {text}"
        assert sym is not None


def test_adversarial_hindi_declarations():
    """Verify Hindi Devanagari net quantities, dates, and addresses."""
    # Hindi Net Quantity with Hindi unit
    q1 = StatutoryDeclarationParser.parse_net_quantity("शुद्ध मात्रा: ५०० ग्राम")
    assert q1 is not None and q1["magnitude"] == 500.0 and q1["unit"] == "g"

    q2 = StatutoryDeclarationParser.parse_net_quantity("शुद्ध मात्रा: २५० मिली")
    assert q2 is not None and q2["magnitude"] == 250.0 and q2["unit"] == "ml"

    # Hindi Date
    d = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("उत्पादन तिथि: ०५/२०२४  अवसान तिथि: ०५/२०२५")
    assert d["mfg_month"] == 5 and d["mfg_year"] == 2024
    assert d["exp_month"] == 5 and d["exp_year"] == 2025

    # Hindi Address
    addr = StatutoryDeclarationParser.parse_address("निर्माता: डाबर इंडिया लिमिटेड, साहिबाबाद, उत्तर प्रदेश २०१०१०")
    assert addr is not None
    assert "डाबर इंडिया लिमिटेड" in addr["name"]
    assert addr["state"] == "Uttar Pradesh"
    assert addr["pin_code"] == "201010"
    assert addr["is_complete"] is True


def test_adversarial_mrp_usp_isolation():
    """Verify strict isolation between MRP and USP declarations."""
    # USP must not match as MRP
    assert StatutoryDeclarationParser.parse_mrp("USP: Rs. 0.40 / g") is None
    assert StatutoryDeclarationParser.parse_mrp("Unit Sale Price: ₹ 1.50 per ml") is None

    # Dates and words must not match as USP unit
    assert StatutoryDeclarationParser.parse_usp("Rs. 100 / May 2024") is None

    # Valid USP
    usp = StatutoryDeclarationParser.parse_usp("USP: Rs. 0.40 / g")
    assert usp is not None and usp["price_per_unit"] == 0.40 and usp["unit"] == "g"


def test_adversarial_dates_iso_and_ambiguous():
    """Verify ISO dates and day/month disambiguation."""
    # ISO YYYY-MM
    d1 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 2024-04")
    assert d1["mfg_month"] == 4 and d1["mfg_year"] == 2024

    # MM/DD/YYYY
    d2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 04/15/2024")
    assert d2["mfg_month"] == 4 and d2["mfg_year"] == 2024

    # DD/MM/YYYY
    d3 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 15/04/2024")
    assert d3["mfg_month"] == 4 and d3["mfg_year"] == 2024

    # Mfd: prefix with alpha month
    d4 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfd: 15-May-2024")
    assert d4["mfg_month"] == 5 and d4["mfg_year"] == 2024


def test_adversarial_pin_code_guards():
    """Verify PIN code parser rejects batch numbers, prices, barcodes, and quantities."""
    assert StatutoryDeclarationParser.parse_pin_code("Batch No: 110020") is None
    assert StatutoryDeclarationParser.parse_pin_code("MRP: Rs. 100020") is None
    assert StatutoryDeclarationParser.parse_pin_code("Quantity: 100020 units") is None
    assert StatutoryDeclarationParser.parse_pin_code("Barcode: 8901030383748") is None
    assert StatutoryDeclarationParser.parse_pin_code("Tel: 9876543210") is None
    assert StatutoryDeclarationParser.parse_pin_code("FSSAI: 10014022001234") is None
    assert StatutoryDeclarationParser.parse_pin_code("400057") == "400057"

