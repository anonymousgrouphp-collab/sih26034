"""Unit Tests for Member 3 Statutory Parsers (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest

# Ensure local src and contracts are on path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from parsers import StatutoryDeclarationParser

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_banned_unit_gms_flagged():
    with open(FIXTURES_DIR / "fixture_ocr_banned_unit_gms.json", encoding="utf-8") as f:
        data = json.load(f)
    token_text = data["tokens"][0]["text"]
    has_banned, symbol = StatutoryDeclarationParser.detect_banned_units(token_text)
    assert has_banned is True
    assert symbol.lower() == "gms"


def test_banned_unit_ml_flagged():
    with open(FIXTURES_DIR / "fixture_ocr_banned_unit_ml.json", encoding="utf-8") as f:
        data = json.load(f)
    token_text = data["tokens"][0]["text"]
    has_banned, symbol = StatutoryDeclarationParser.detect_banned_units(token_text)
    assert has_banned is True
    assert symbol.upper() == "ML"


def test_valid_quantity_parsing():
    with open(FIXTURES_DIR / "fixture_ocr_valid_quantities.json", encoding="utf-8") as f:
        data = json.load(f)
    net_qty_text = data["tokens"][0]["text"]
    parsed = StatutoryDeclarationParser.parse_net_quantity(net_qty_text)
    assert parsed is not None
    assert parsed["magnitude"] == 500.0
    assert parsed["unit"] == "g"
    assert parsed["has_banned_unit"] is False


def test_mrp_tax_inclusive():
    text = "MRP Rs. 200.00 (incl. of all taxes)"
    mrp = StatutoryDeclarationParser.parse_mrp(text)
    assert mrp is not None
    assert mrp["amount"] == 200.0
    assert mrp["tax_inclusive"] is True


def test_devanagari_digit_conversion():
    hindi_text = "शुद्ध मात्रा: २०० ग्राम"
    converted = StatutoryDeclarationParser.convert_indic_digits(hindi_text)
    assert "200" in converted


def test_consumer_care_missing_email():
    with open(FIXTURES_DIR / "fixture_ocr_incomplete_consumer_care.json", encoding="utf-8") as f:
        data = json.load(f)
    full_text = " ".join(t["text"] for t in data["tokens"])
    status = StatutoryDeclarationParser.check_consumer_care_completeness(full_text)
    assert status["has_phone"] is True
    assert status["has_email"] is False
    assert status["is_complete"] is False


def test_valid_ml_not_flagged_as_banned():
    """Verify that statutory lowercase 'ml' is NOT flagged as banned (TS-UNIT-03)."""
    text = "Net Volume: 750 ml"
    has_banned, symbol = StatutoryDeclarationParser.detect_banned_units(text)
    assert has_banned is False
    assert symbol is None
    parsed = StatutoryDeclarationParser.parse_net_quantity(text)
    assert parsed is not None
    assert parsed["magnitude"] == 750.0
    assert parsed["unit"] == "ml"
    assert parsed["has_banned_unit"] is False


def test_banned_units_ltrs_and_kgs_flagged():
    """Verify prohibited units ltrs and Kgs are flagged (TS-UNIT-01)."""
    has_banned, sym = StatutoryDeclarationParser.detect_banned_units("Net Qty: 2 ltrs")
    assert has_banned is True
    assert sym.lower() == "ltrs"

    has_banned, sym = StatutoryDeclarationParser.detect_banned_units("Gross Wt: 5 Kgs")
    assert has_banned is True
    assert sym.lower() == "kgs"


def test_usp_parsing():
    """Verify Unit Sale Price extraction per Rule 6(1)(k) (TS-UNIT-04)."""
    text = "Unit Sale Price: Rs. 0.40 / g"
    usp = StatutoryDeclarationParser.parse_usp(text)
    assert usp is not None
    assert usp["price_per_unit"] == 0.40
    assert usp["unit"] == "g"

    # Test alternative notation
    text2 = "USP: ₹ 1.50 per ml"
    usp2 = StatutoryDeclarationParser.parse_usp(text2)
    assert usp2 is not None
    assert usp2["price_per_unit"] == 1.50
    assert usp2["unit"] == "ml"


def test_mfg_and_expiry_date_parsing():
    """Verify manufacturing and expiry date parsing per Rule 6(1)(d)."""
    text = "Mfg Date: 03/2024  Exp Date: 03/2025"
    dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(text)
    assert dates["mfg_month"] == 3
    assert dates["mfg_year"] == 2024
    assert dates["exp_month"] == 3
    assert dates["exp_year"] == 2025

    # Best before months
    text2 = "Date of Mfg: Oct 2023  Best Before 12 Months"
    dates2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(text2)
    assert dates2["mfg_month"] == 10
    assert dates2["mfg_year"] == 2023
    assert dates2["best_before_months"] == 12


def test_address_parsing_with_pin_code():
    """Verify Indian postal address extraction with 6-digit PIN and State (OQ-02)."""
    text = "Manufactured by: Britannia Industries Ltd., 5/1A Hungerford Street, Kolkata, West Bengal 700017"
    addr = StatutoryDeclarationParser.parse_address(text)
    assert addr is not None
    assert addr["state"] == "West Bengal"
    assert addr["pin_code"] == "700017"
    assert addr["is_complete"] is True
    assert "Britannia Industries Ltd." in addr["name"]


def test_address_pin_code_guards_against_phone():
    """Verify that a 10-digit telephone number does not trigger a false PIN match."""
    text = "Customer Support Tel: 9876543210  Office: Mumbai, Maharashtra"
    pin = StatutoryDeclarationParser.parse_pin_code(text)
    assert pin is None  # 9876543210 must NOT match 987654

    addr = StatutoryDeclarationParser.parse_address(text)
    assert addr is not None
    assert addr["state"] == "Maharashtra"
    assert addr["pin_code"] is None
    assert addr["is_complete"] is False


def test_country_of_origin_parsing():
    """Verify Country of Origin parsing per Rule 6(1)(p) / GSR 128(E)."""
    text = "Country of Origin: India"
    origin = StatutoryDeclarationParser.parse_country_of_origin(text)
    assert origin == "India"

    text2 = "Made in India"
    origin2 = StatutoryDeclarationParser.parse_country_of_origin(text2)
    assert origin2 == "India"

    # Stop words in manufacturer clause
    text3 = "Made in India by Britannia Industries Ltd."
    origin3 = StatutoryDeclarationParser.parse_country_of_origin(text3)
    assert origin3 == "India"

    text4 = "Product of Thailand"
    origin4 = StatutoryDeclarationParser.parse_country_of_origin(text4)
    assert origin4 == "Thailand"


def test_banned_units_dotted_notation_flagged():
    """Verify prohibited dotted units (g.m., g.m.s., c.c., ltr.) are strictly flagged."""
    for text in ["Net Wt: 500 g.m.", "Net Wt: 500 g.m.s.", "Volume: 100 c.c.", "Volume: 2 ltr."]:
        has_banned, sym = StatutoryDeclarationParser.detect_banned_units(text)
        assert has_banned is True, f"Failed to flag banned unit in: {text}"
        assert sym is not None


def test_mrp_intermediate_tax_clause_and_commas():
    """Verify MRP parsing with intermediate tax clauses and Indian comma formatting."""
    # Intermediate tax clause
    text1 = "MRP (incl. of all taxes): Rs. 250.00"
    mrp1 = StatutoryDeclarationParser.parse_mrp(text1)
    assert mrp1 is not None
    assert mrp1["amount"] == 250.00
    assert mrp1["tax_inclusive"] is True

    # Intermediate tax clause without Rs.
    text2 = "MRP (inclusive of all taxes) : 150.00"
    mrp2 = StatutoryDeclarationParser.parse_mrp(text2)
    assert mrp2 is not None
    assert mrp2["amount"] == 150.00
    assert mrp2["tax_inclusive"] is True

    # Comma-formatted amount
    text3 = "MRP Rs. 1,499.00 (incl. of all taxes)"
    mrp3 = StatutoryDeclarationParser.parse_mrp(text3)
    assert mrp3 is not None
    assert mrp3["amount"] == 1499.00
    assert mrp3["tax_inclusive"] is True

    # Non-inclusive MRP
    text4 = "MRP: Rs. 450/-"
    mrp4 = StatutoryDeclarationParser.parse_mrp(text4)
    assert mrp4 is not None
    assert mrp4["amount"] == 450.00
    assert mrp4["tax_inclusive"] is False


def test_net_quantity_units_suite():
    """Verify net quantity extraction across mass, volume, length, area, and count."""
    # Area
    area_res = StatutoryDeclarationParser.parse_net_quantity("Net Area: 5 sq m")
    assert area_res is not None
    assert area_res["magnitude"] == 5.0
    assert area_res["unit"] == "sq m"

    # Count
    count_res = StatutoryDeclarationParser.parse_net_quantity("Net Quantity: 10 N")
    assert count_res is not None
    assert count_res["magnitude"] == 10.0
    assert count_res["unit"] == "N"

    count_res2 = StatutoryDeclarationParser.parse_net_quantity("Quantity: 10 units")
    assert count_res2 is not None
    assert count_res2["magnitude"] == 10.0
    assert count_res2["unit"] == "N"

    # Length
    len_res = StatutoryDeclarationParser.parse_net_quantity("Net Length: 25 m")
    assert len_res is not None
    assert len_res["magnitude"] == 25.0
    assert len_res["unit"] == "m"

    # Comma magnitude
    comma_res = StatutoryDeclarationParser.parse_net_quantity("Net Weight: 1,000 g")
    assert comma_res is not None
    assert comma_res["magnitude"] == 1000.0
    assert comma_res["unit"] == "g"


def test_date_alpha_and_spaces():
    """Verify date parsing with named months and OCR spaces around slashes."""
    d1 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 15-Mar-2024")
    assert d1["mfg_month"] == 3
    assert d1["mfg_year"] == 2024

    d2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 04 / 2024")
    assert d2["mfg_month"] == 4
    assert d2["mfg_year"] == 2024

    d3 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Exp Date: 15-Apr-2025")
    assert d3["exp_month"] == 4
    assert d3["exp_year"] == 2025

    d4 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg: 04/24  Best before six months")
    assert d4["mfg_month"] == 4
    assert d4["mfg_year"] == 2024
    assert d4["best_before_months"] == 6


def test_devanagari_dates():
    """Verify Hindi Devanagari mfg and expiry date parsing."""
    text = "उत्पादन तिथि: ०५/२०२४  अवसान तिथि: ०५/२०२५"
    d = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(text)
    assert d["mfg_month"] == 5
    assert d["mfg_year"] == 2024
    assert d["exp_month"] == 5
    assert d["exp_year"] == 2025


def test_address_split_pin_and_city_state_inference():
    """Verify formatted split PIN codes and city-to-state resolution."""
    # Split PIN: 110 020
    text1 = "Office: New Delhi - 110 020"
    pin1 = StatutoryDeclarationParser.parse_pin_code(text1)
    assert pin1 == "110020"

    addr1 = StatutoryDeclarationParser.parse_address(text1)
    assert addr1 is not None
    assert addr1["state"] == "Delhi"
    assert addr1["pin_code"] == "110020"
    assert addr1["is_complete"] is True

    # City inference: Mumbai -> Maharashtra
    text2 = "Manufactured by: ABC Foods Ltd., Andheri East, Mumbai - 400057"
    addr2 = StatutoryDeclarationParser.parse_address(text2)
    assert addr2 is not None
    assert addr2["state"] == "Maharashtra"
    assert addr2["pin_code"] == "400057"
    assert addr2["is_complete"] is True


def test_consumer_care_guards_against_fssai_phone():
    """Verify Consumer Care parser does NOT falsely match FSSAI 14-digit number as phone."""
    text = "FSSAI Lic No: 10014022001234. Customer Care: care@parle.biz. Office: Mumbai."
    status = StatutoryDeclarationParser.check_consumer_care_completeness(text)
    assert status["has_email"] is True
    assert status["has_phone"] is False
    assert status["phone"] is None
    assert status["is_complete"] is False


def test_banned_units_dotted_and_case_variants():
    """Verify single-dot abbreviations, capitalized variants, and punctuation on units."""
    samples = [
        ("Net Wt: 500 g.m", "g.m"),
        ("Volume: 100 c.c", "c.c"),
        ("Volume: 500 M.L", "M.L"),
        ("Volume: 500 M.l", "M.l"),
        ("Net Vol: 2 LTR", "LTR"),
        ("Net Vol: 2 LTRS", "LTRS"),
        ("Net Wt: 500 g.", "g."),
        ("Gross Wt: 1.5 kg.", "kg."),
        ("Net Volume: 750 ml.", "ml."),
        ("Volume: 1 l.", "l."),
    ]
    for text, expected_sub in samples:
        has_banned, sym = StatutoryDeclarationParser.detect_banned_units(text)
        assert has_banned is True, f"Failed to flag banned unit in: {text}"
        assert sym is not None


def test_devanagari_net_quantity_units():
    """Verify Devanagari Hindi net quantity units (gram, ml, kg, count)."""
    # 500 gram in Hindi
    res1 = StatutoryDeclarationParser.parse_net_quantity("शुद्ध मात्रा: ५०० ग्राम")
    assert res1 is not None
    assert res1["magnitude"] == 500.0
    assert res1["unit"] == "g"
    assert res1["has_banned_unit"] is False

    # 250 ml in Hindi
    res2 = StatutoryDeclarationParser.parse_net_quantity("शुद्ध मात्रा: २५० मिली")
    assert res2 is not None
    assert res2["magnitude"] == 250.0
    assert res2["unit"] == "ml"

    # 1 kg in Hindi
    res3 = StatutoryDeclarationParser.parse_net_quantity("शुद्ध भार: १ किलोग्राम")
    assert res3 is not None
    assert res3["magnitude"] == 1.0
    assert res3["unit"] == "kg"

    # 10 count in Hindi
    res4 = StatutoryDeclarationParser.parse_net_quantity("मात्रा: १० नग")
    assert res4 is not None
    assert res4["magnitude"] == 10.0
    assert res4["unit"] == "N"


def test_fractional_and_spaced_comma_quantities():
    """Verify fractional quantities and comma with whitespace in net quantity."""
    # Vulgar fraction ½ kg
    res1 = StatutoryDeclarationParser.parse_net_quantity("Net Weight: ½ kg")
    assert res1 is not None
    assert res1["magnitude"] == 0.5
    assert res1["unit"] == "kg"

    # ASCII fraction 1/2 kg
    res2 = StatutoryDeclarationParser.parse_net_quantity("Net Weight: 1/2 kg")
    assert res2 is not None
    assert res2["magnitude"] == 0.5
    assert res2["unit"] == "kg"

    # Comma with space 1, 000 g
    res3 = StatutoryDeclarationParser.parse_net_quantity("Net Weight: 1, 000 g")
    assert res3 is not None
    assert res3["magnitude"] == 1000.0
    assert res3["unit"] == "g"

    # Leading-dot decimal .5 kg
    res4 = StatutoryDeclarationParser.parse_net_quantity("Net Quantity: .5 kg")
    assert res4 is not None
    assert res4["magnitude"] == 0.5
    assert res4["unit"] == "kg"


def test_net_quantity_does_not_greedily_swallow_text():
    """Verify that multi-word unit parsing does not swallow arbitrary English follow-on words."""
    res = StatutoryDeclarationParser.parse_net_quantity("Net Weight: 500 g when packed")
    assert res is not None
    assert res["magnitude"] == 500.0
    assert res["unit"] == "g"


def test_mrp_rejects_usp_declarations():
    """Verify that parse_mrp does not falsely treat a USP declaration as an MRP."""
    usp_text = "USP: Rs. 0.40 / g"
    mrp = StatutoryDeclarationParser.parse_mrp(usp_text)
    assert mrp is None

    usp_text2 = "Unit Sale Price: ₹ 1.25 per ml"
    mrp2 = StatutoryDeclarationParser.parse_mrp(usp_text2)
    assert mrp2 is None


def test_usp_rejects_arbitrary_words_as_units():
    """Verify that parse_usp requires a recognized metric or count unit denominator."""
    # Date in denominator must be rejected
    res = StatutoryDeclarationParser.parse_usp("Rs. 100 / May 2024")
    assert res is None

    # Valid denominator must pass
    res2 = StatutoryDeclarationParser.parse_usp("USP: Rs. 0.40 / g")
    assert res2 is not None
    assert res2["price_per_unit"] == 0.40
    assert res2["unit"] == "g"


def test_iso_date_and_mfd_prefix():
    """Verify ISO 8601 date parsing and Mfd / MM-DD-YYYY variations."""
    # ISO YYYY-MM
    d1 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 2024-04")
    assert d1["mfg_month"] == 4
    assert d1["mfg_year"] == 2024

    # Mfd: prefix with alpha month
    d2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfd: 15-May-2024  Exp: 15-May-2026")
    assert d2["mfg_month"] == 5
    assert d2["mfg_year"] == 2024
    assert d2["exp_month"] == 5
    assert d2["exp_year"] == 2026

    # MM/DD/YYYY format (04/15/2024 -> month 4)
    d3 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Date of Mfg: 04/15/2024")
    assert d3["mfg_month"] == 4
    assert d3["mfg_year"] == 2024

    # Best before in days (90 days -> 3 months)
    d4 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 01/2024  Best before 90 days")
    assert d4["best_before_months"] == 3


def test_pin_code_rejects_batch_price_units():
    """Verify that PIN code parser rejects batch numbers, prices, and quantities."""
    assert StatutoryDeclarationParser.parse_pin_code("Batch No: 110020  Office: Mumbai") is None
    assert StatutoryDeclarationParser.parse_pin_code("MRP: Rs. 100020") is None
    assert StatutoryDeclarationParser.parse_pin_code("Total: 100020 units") is None
    assert StatutoryDeclarationParser.parse_pin_code("100020/-") is None


def test_goa_and_uttarakhand_3digit_pin_overrides():
    """Verify that 3-digit PIN overrides accurately resolve Goa and Uttarakhand without state names."""
    # 403504 is in Goa (first 2 digits 40 would otherwise map to Maharashtra)
    addr_goa = StatutoryDeclarationParser.parse_address("Manufactured by: Beachside Foods, Bicholim - 403504")
    assert addr_goa is not None
    assert addr_goa["state"] == "Goa"
    assert addr_goa["pin_code"] == "403504"

    # 249403 is in Uttarakhand (first 2 digits 24 would otherwise map to Uttar Pradesh)
    addr_uk = StatutoryDeclarationParser.parse_address("Packed by: Hilltop Herbs, Haridwar - 249403")
    assert addr_uk is not None
    assert addr_uk["state"] == "Uttarakhand"
    assert addr_uk["pin_code"] == "249403"


def test_address_entity_name_without_corporate_suffix():
    """Verify entity name extraction anchored to prefix for enterprises without Ltd/Pvt."""
    addr = StatutoryDeclarationParser.parse_address("Manufactured by: Krishna Dairy, Anand, Gujarat - 388001")
    assert addr is not None
    assert addr["name"] == "Krishna Dairy"
    assert addr["state"] == "Gujarat"
    assert addr["pin_code"] == "388001"


def test_hindi_address_and_entity_name():
    """Verify Hindi address, entity name, and Devanagari numerals parsing."""
    text = "निर्माता: डाबर इंडिया लिमिटेड, साहिबाबाद, गाजियाबाद, उत्तर प्रदेश २०१०१०"
    addr = StatutoryDeclarationParser.parse_address(text)
    assert addr is not None
    assert "डाबर इंडिया लिमिटेड" in addr["name"]
    assert addr["state"] == "Uttar Pradesh"
    assert addr["pin_code"] == "201010"
    assert addr["is_complete"] is True


def test_consumer_care_spaced_phones_and_1860():
    """Verify consumer care phone extraction on formatted mobile numbers and 1860 toll-free."""
    text1 = "Customer Care: Call 98765 43210 or email care@brand.com"
    care1 = StatutoryDeclarationParser.check_consumer_care_completeness(text1)
    assert care1["has_phone"] is True
    assert "98765" in care1["phone"]

    text2 = "Consumer Helpline: 1860 266 9100, Email: help@brand.in"
    care2 = StatutoryDeclarationParser.check_consumer_care_completeness(text2)
    assert care2["has_phone"] is True
    assert "1860" in care2["phone"]


def test_country_of_origin_usa_dot_preservation():
    """Verify Country of Origin preserves dotted acronyms and normalizes them."""
    assert StatutoryDeclarationParser.parse_country_of_origin("Country of Origin: U.S.A.") == "USA"
    assert StatutoryDeclarationParser.parse_country_of_origin("Country of Origin: P.R.C.") == "China"
    assert StatutoryDeclarationParser.parse_country_of_origin("Made in U.K.") == "United Kingdom"
    assert StatutoryDeclarationParser.parse_country_of_origin("Imported from: Thailand") == "Thailand"


def test_generic_name_parsing():
    """Verify generic name extraction per Rule 6(1)(b)."""
    text1 = "Generic Name: Butter Cookies"
    assert StatutoryDeclarationParser.parse_generic_name(text1) == "Butter Cookies"

    text2 = "Commodity: Whole Wheat Atta"
    assert StatutoryDeclarationParser.parse_generic_name(text2) == "Whole Wheat Atta"



