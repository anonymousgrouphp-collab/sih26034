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

    text3 = "सामान्य नाम: बिस्कुट"
    assert StatutoryDeclarationParser.parse_generic_name(text3) == "बिस्कुट"

    text4 = "उत्पाद का नाम: आलू चिप्स"
    assert StatutoryDeclarationParser.parse_generic_name(text4) == "आलू चिप्स"


def test_multipack_net_quantity_parsing():
    """Verify multi-pack and composite wholesale quantity parsing under Rule 24."""
    # 1. Standard count x piece size (e.g. 4 x 50 g -> 200 g, never unit 'x')
    res1 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 4 x 50 g")
    assert res1 is not None
    assert res1["magnitude"] == 200.0
    assert res1["unit"] == "g"
    assert res1["unit"] != "x"
    assert res1["piece_count"] == 4
    assert res1["piece_magnitude"] == 50.0

    # 2. Explicit count N x piece size with declared total
    res2 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 4 N x 50 g = 200 g")
    assert res2 is not None
    assert res2["magnitude"] == 200.0
    assert res2["unit"] == "g"

    # 3. Pack of 3 x 100 ml
    res3 = StatutoryDeclarationParser.parse_net_quantity("Pack of 3 x 100 ml")
    assert res3 is not None
    assert res3["magnitude"] == 300.0
    assert res3["unit"] == "ml"

    # 4. Multi-pack with banned unit in piece declaration
    res4 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 4 x 50 gms")
    assert res4 is not None
    assert res4["magnitude"] == 200.0
    assert res4["has_banned_unit"] is True
    assert res4["banned_unit_found"] == "gms"


def test_banned_units_email_and_url_domain_guard():
    """Verify email domains and URLs containing 'ml' or 'gms' do not falsely trigger banned unit violations."""
    # Email with .ml domain or ml user
    has_banned1, sym1 = StatutoryDeclarationParser.detect_banned_units("Customer Care: care@ml.com")
    assert has_banned1 is False
    assert sym1 is None

    # URL with ml
    has_banned2, sym2 = StatutoryDeclarationParser.detect_banned_units("Visit: https://www.ml.com/care")
    assert has_banned2 is False

    # Real banned unit in same text alongside email
    has_banned3, sym3 = StatutoryDeclarationParser.detect_banned_units("Net Qty: 500 ML. Email: care@ml.com")
    assert has_banned3 is True
    assert sym3 == "ML"


def test_hindi_mrp_currency_symbols():
    """Verify Hindi currency symbols (रु., रू., रुपये) in MRP extraction."""
    # 1. Standalone Hindi currency with explicit prefix
    mrp1 = StatutoryDeclarationParser.parse_mrp("अ.वि.मू. रु. ५०/-")
    assert mrp1 is not None
    assert mrp1["amount"] == 50.0
    assert mrp1["currency"] == "INR"
    assert mrp1["tax_inclusive"] is False

    # 2. Hindi MRP with full prefix and tax inclusion clause
    mrp2 = StatutoryDeclarationParser.parse_mrp("अधिकतम खुदरा मूल्य: रु. ५०.०० (सभी कर सहित)")
    assert mrp2 is not None
    assert mrp2["amount"] == 50.0
    assert mrp2["tax_inclusive"] is True

    # 3. Currency symbol रू.
    mrp3 = StatutoryDeclarationParser.parse_mrp("अ.वि.मू. रू. १००/- (कर सहित)")
    assert mrp3 is not None
    assert mrp3["amount"] == 100.0
    assert mrp3["tax_inclusive"] is True


def test_derived_expiry_date_computation():
    """Verify derived expiry date calculation from manufacturing date + best before duration."""
    # 1. 12 months from 03/2024 -> 03/2025
    d1 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg Date: 03/2024, Best before 12 months")
    assert d1["mfg_month"] == 3
    assert d1["mfg_year"] == 2024
    assert d1["exp_month"] == 3
    assert d1["exp_year"] == 2025
    assert d1.get("is_derived_expiry") is True

    # 2. 24 months from 11/2023 -> 11/2025
    d2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Pkd: 11/2023, Best before 24 months")
    assert d2["mfg_month"] == 11
    assert d2["mfg_year"] == 2023
    assert d2["exp_month"] == 11
    assert d2["exp_year"] == 2025

    # 3. Explicit expiry date takes priority over best before duration
    d3 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("Mfg: 04/2024, Exp: 10/2025, Best before 12 months")
    assert d3["exp_month"] == 10
    assert d3["exp_year"] == 2025
    assert d3.get("is_derived_expiry") is None


def test_fmcg_industrial_hubs_mapping():
    """Verify major Indian FMCG manufacturing hubs map correctly to States."""
    # Baddi -> Himachal Pradesh
    a1 = StatutoryDeclarationParser.parse_address("Plot 14, Industrial Area, Baddi 173205")
    assert a1["state"] == "Himachal Pradesh"
    assert a1["pin_code"] == "173205"

    # Vapi -> Gujarat
    a2 = StatutoryDeclarationParser.parse_address("Plot 55, Phase II, GIDC, Vapi 396195")
    assert a2["state"] == "Gujarat"
    assert a2["pin_code"] == "396195"

    # Haridwar -> Uttarakhand
    a3 = StatutoryDeclarationParser.parse_address("Plot 1, SIDCUL, Haridwar 249403")
    assert a3["state"] == "Uttarakhand"
    assert a3["pin_code"] == "249403"


def test_banned_units_corporate_gm_defense():
    """Verify uppercase GM in corporate entities or job titles never triggers false accusations (NFR-06)."""
    # 1. Company names with GM must NOT be flagged
    has_banned1, sym1 = StatutoryDeclarationParser.detect_banned_units("Manufactured by: GM Foods Pvt Ltd")
    assert has_banned1 is False
    assert sym1 is None

    # 2. Job title GM must NOT be flagged
    has_banned2, sym2 = StatutoryDeclarationParser.detect_banned_units("Contact: GM - Operations")
    assert has_banned2 is False

    # 3. Non-GM crops must NOT be flagged
    has_banned3, sym3 = StatutoryDeclarationParser.detect_banned_units("Ingredients: Non-GM soybean")
    assert has_banned3 is False

    # 4. Email CC header must NOT be flagged as cubic centimeter
    has_banned4, sym4 = StatutoryDeclarationParser.detect_banned_units("CC: legal@nestle.com")
    assert has_banned4 is False

    # 5. Full text with GM company but legal 500 g net quantity must have has_banned_unit: False
    qty1 = StatutoryDeclarationParser.parse_net_quantity("Manufactured by: GM Foods Pvt Ltd, Net Qty: 500 g")
    assert qty1 is not None
    assert qty1["magnitude"] == 500.0
    assert qty1["unit"] == "g"
    assert qty1["has_banned_unit"] is False

    # 6. Actual illegal 500 GM must be flagged
    qty2 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 500 GM")
    assert qty2 is not None
    assert qty2["has_banned_unit"] is True
    assert qty2["banned_unit_found"] == "GM"


def test_mrp_inc_gst_and_ocr_inclusivity():
    """Verify GST, OCR missing 'l' (inc. of taxes), and Devanagari tax clauses."""
    # OCR dropping 'l' -> 'inc. of all taxes'
    mrp1 = StatutoryDeclarationParser.parse_mrp("MRP Rs. 150 (inc. of all taxes)")
    assert mrp1 is not None
    assert mrp1["amount"] == 150.0
    assert mrp1["tax_inclusive"] is True

    # GST clause
    mrp2 = StatutoryDeclarationParser.parse_mrp("MRP Rs. 200 (incl. of GST)")
    assert mrp2 is not None
    assert mrp2["amount"] == 200.0
    assert mrp2["tax_inclusive"] is True

    # Spaced acronym M. R. P.
    mrp3 = StatutoryDeclarationParser.parse_mrp("M. R. P. Rs. 250 (incl. of all taxes)")
    assert mrp3 is not None
    assert mrp3["amount"] == 250.0
    assert mrp3["tax_inclusive"] is True

    # Devanagari कुल कर सहित
    mrp4 = StatutoryDeclarationParser.parse_mrp("अधिकतम खुदरा मूल्य रु. 99 (कुल कर सहित)")
    assert mrp4 is not None
    assert mrp4["amount"] == 99.0
    assert mrp4["tax_inclusive"] is True


def test_usp_hindi_and_count_standardization():
    """Verify USP normalization for Hindi Devanagari and count units."""
    # Hindi gram -> g
    usp1 = StatutoryDeclarationParser.parse_usp("USP: Rs. 0.50 / ग्राम")
    assert usp1 is not None
    assert usp1["price_per_unit"] == 0.50
    assert usp1["unit"] == "g"

    # Hindi 100 gram -> 100g
    usp2 = StatutoryDeclarationParser.parse_usp("USP: Rs. 50 / 100 ग्राम")
    assert usp2 is not None
    assert usp2["price_per_unit"] == 50.0
    assert usp2["unit"] == "100g"

    # Hindi nag -> N
    usp3 = StatutoryDeclarationParser.parse_usp("USP: Rs. 10 / नग")
    assert usp3 is not None
    assert usp3["price_per_unit"] == 10.0
    assert usp3["unit"] == "N"

    # Count unit -> unit
    usp4 = StatutoryDeclarationParser.parse_usp("USP: Rs. 15.00 / unit")
    assert usp4 is not None
    assert usp4["price_per_unit"] == 15.0
    assert usp4["unit"] == "unit"


def test_consumer_care_actual_address_and_title_extraction():
    """Verify consumer care extracts actual postal address reference and contact designation."""
    text1 = "For complaints contact: Nodal Officer, Write to us at: P.O. Box 1234, Mumbai, Phone: 1800-11-2233, Email: care@domain.com"
    res1 = StatutoryDeclarationParser.check_consumer_care_completeness(text1)
    assert res1["is_complete"] is True
    assert res1["contact_name"] == "Nodal Officer"
    assert "P.O. Box 1234" in res1["address"]

    text2 = "For complaints contact: Customer Care Executive at the address given above, Helpline: 18001801234, Email: care@nestle.in"
    res2 = StatutoryDeclarationParser.check_consumer_care_completeness(text2)
    assert res2["is_complete"] is True
    assert res2["contact_name"] == "Customer Care Executive"
    assert res2["address"] == "At manufacturer's address given on pack"


def test_gazette_statutory_hindi_terms():
    """Verify official Hindi Gazette terms under LMPC Rules 2011."""
    # 1. Gazette Net Quantity: निवल मात्रा
    qty1 = StatutoryDeclarationParser.parse_net_quantity("निवल मात्रा: 500 g")
    assert qty1 is not None
    assert qty1["magnitude"] == 500.0
    assert qty1["unit"] == "g"

    # 2. Gazette Multipack: निवल सामग्री
    qty2 = StatutoryDeclarationParser.parse_net_quantity("निवल सामग्री: 4 x 50 g")
    assert qty2 is not None
    assert qty2["magnitude"] == 200.0
    assert qty2["unit"] == "g"

    # 3. Gazette Unit Sale Price: इकाई विक्रय मूल्य
    usp1 = StatutoryDeclarationParser.parse_usp("इकाई विक्रय मूल्य: ₹ 1.25 / ग्राम")
    assert usp1 is not None
    assert usp1["price_per_unit"] == 1.25
    assert usp1["unit"] == "g"

    # 4. Gazette Unit Sale Price with प्रति: इकाई बिक्री मूल्य: रु. 0.50 प्रति मिली
    usp2 = StatutoryDeclarationParser.parse_usp("इकाई बिक्री मूल्य: रु. 0.50 प्रति मिली")
    assert usp2 is not None
    assert usp2["price_per_unit"] == 0.50
    assert usp2["unit"] == "ml"

    # 5. Gazette Commodity Name: वस्तु का नाम
    gen1 = StatutoryDeclarationParser.parse_generic_name("वस्तु का नाम: पारले-जी बिस्कुट")
    assert gen1 == "पारले-जी बिस्कुट"


def test_address_with_origin_prefix():
    """Verify address parser extracts entity and location when prefixed with manufacturing origin."""
    # 1. Manufactured in India by
    addr1 = StatutoryDeclarationParser.parse_address(
        "Manufactured in India by: ABC Consumer Goods Pvt Ltd, Plot 12, Sanand, Gujarat 382110"
    )
    assert addr1 is not None
    assert "ABC Consumer Goods" in addr1["name"]
    assert addr1["state"] == "Gujarat"
    assert addr1["pin_code"] == "382110"
    assert addr1["is_complete"] is True

    # 2. Packed in Bharat by
    addr2 = StatutoryDeclarationParser.parse_address(
        "Packed in Bharat by: South Agro Foods Ltd, SIPCOT Phase 1, Hosur, Tamil Nadu 635126"
    )
    assert addr2 is not None
    assert "South Agro Foods" in addr2["name"]
    assert addr2["state"] == "Tamil Nadu"
    assert addr2["pin_code"] == "635126"
    assert addr2["is_complete"] is True

    # 3. Industrial cluster Kanchipuram
    addr3 = StatutoryDeclarationParser.parse_address(
        "Mfd by: Chennai Packagers Ltd, Industrial Hub, Kanchipuram 631501"
    )
    assert addr3 is not None
    assert addr3["state"] == "Tamil Nadu"
    assert addr3["pin_code"] == "631501"


def test_banned_units_latin_abbreviations_and_ai_ml_defense():
    """Verify Section 63 BSA 2023 evidentiary defense against Latin abbreviations and tech terms."""
    # 1. 'e.g.' in serving suggestions must NOT flag 'g.' as banned unit
    is_banned, sym = StatutoryDeclarationParser.detect_banned_units("Serving suggestion (e.g. with milk)")
    assert not is_banned
    assert sym is None

    # 2. 'e.g. 50g' must NOT flag
    is_banned2, sym2 = StatutoryDeclarationParser.detect_banned_units("Recipe example (e.g. 50g butter, 100ml water)")
    assert not is_banned2
    assert sym2 is None

    # 3. 'i.e.' must NOT flag
    is_banned3, sym3 = StatutoryDeclarationParser.detect_banned_units("Net Quantity: 1 pack (i.e. 500 g)")
    assert not is_banned3
    assert sym3 is None

    # 4. 'AI/ML' tech acronym on smart packaging must NOT flag 'ML'
    is_banned4, sym4 = StatutoryDeclarationParser.detect_banned_units("Powered by AI/ML Edge Technology")
    assert not is_banned4
    assert sym4 is None

    # 5. 'Machine Learning (ML)' must NOT flag
    is_banned5, sym5 = StatutoryDeclarationParser.detect_banned_units("Advanced Machine Learning (ML) Sensor")
    assert not is_banned5
    assert sym5 is None

    # 6. Actual banned units accompanying Latin abbreviations must still be caught
    is_banned6, sym6 = StatutoryDeclarationParser.detect_banned_units("Serving size: 50 gms (e.g. with milk)")
    assert is_banned6
    assert sym6 == "gms"


def test_pin_code_regd_off_and_license_disambiguation():
    """Verify parse_pin_code parses Regd Off without false disallowed_prefix collision."""
    # 1. 'Regd Off: City 560001' must parse 560001
    pin1 = StatutoryDeclarationParser.parse_pin_code("Regd Off: Bengaluru 560001")
    assert pin1 == "560001"

    # 2. 'Regd. Office: Pune 411001' must parse 411001
    pin2 = StatutoryDeclarationParser.parse_pin_code("Regd. Office: Pune 411001")
    assert pin2 == "411001"

    # 3. 'Lic. under FSSAI... Regd Office: Mumbai 400001' must parse 400001
    pin3 = StatutoryDeclarationParser.parse_pin_code("Lic. under FSSAI Act. Regd Office: Mumbai 400001")
    assert pin3 == "400001"

    # 4. 'Reg. No: 560001' must be rejected as registration number
    pin4 = StatutoryDeclarationParser.parse_pin_code("Reg. No: 560001")
    assert pin4 is None

    # 5. 'Lic. No: 560001' must be rejected as license number
    pin5 = StatutoryDeclarationParser.parse_pin_code("Lic. No: 560001")
    assert pin5 is None


def test_country_of_origin_hindi_state_guard():
    """Verify parse_country_of_origin does not treat Hindi state 'प्रदेश' as origin prefix 'देश'."""
    # 1. 'उत्तर प्रदेश: लखनऊ 226001' must NOT match as country of origin
    origin1 = StatutoryDeclarationParser.parse_country_of_origin("उत्तर प्रदेश: लखनऊ 226001")
    assert origin1 is None

    # 2. 'मध्य प्रदेश: भोपाल 462001' must NOT match
    origin2 = StatutoryDeclarationParser.parse_country_of_origin("मध्य प्रदेश: भोपाल 462001")
    assert origin2 is None

    # 3. Statutory Gazette term 'उत्पत्ति का देश: भारत'
    origin3 = StatutoryDeclarationParser.parse_country_of_origin("उत्पत्ति का देश: भारत")
    assert origin3 == "भारत"

    # 4. Statutory Gazette term 'मूल देश: भारत'
    origin4 = StatutoryDeclarationParser.parse_country_of_origin("मूल देश: भारत")
    assert origin4 == "भारत"

    # 5. Non-country phrase with 'Made in' must be rejected by fallback validator
    origin5 = StatutoryDeclarationParser.parse_country_of_origin("Made in accordance with ISO 9001 standards")
    assert origin5 is None


def test_lmpc_second_schedule_count_units():
    """Verify LMPC Second Schedule count units (pair, pairs, sheet, sheets, wipe, wipes, roll, rolls)."""
    # 1. 1 pair
    q1 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 1 pair")
    assert q1 is not None
    assert q1["magnitude"] == 1.0
    assert q1["unit"] == "N"

    # 2. 2 pairs
    q2 = StatutoryDeclarationParser.parse_net_quantity("Net Quantity: 2 pairs")
    assert q2 is not None
    assert q2["magnitude"] == 2.0
    assert q2["unit"] == "N"

    # 3. 100 sheets
    q3 = StatutoryDeclarationParser.parse_net_quantity("Quantity: 100 sheets")
    assert q3 is not None
    assert q3["magnitude"] == 100.0
    assert q3["unit"] == "N"

    # 4. 80 wipes
    q4 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 80 wipes")
    assert q4 is not None
    assert q4["magnitude"] == 80.0
    assert q4["unit"] == "N"

    # 5. 1 roll
    q5 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 1 roll")
    assert q5 is not None
    assert q5["magnitude"] == 1.0
    assert q5["unit"] == "N"


def test_standalone_dot_and_iso_dates():
    """Verify dot-matrix printed dates '04.2024' and ISO '2024-05' in standalone parser."""
    # 1. Dot separator date 04.2024
    d1 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("04.2024")
    assert d1["mfg_month"] == 4
    assert d1["mfg_year"] == 2024

    # 2. Standalone ISO date 2024-05
    d2 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("2024-05")
    assert d2["mfg_month"] == 5
    assert d2["mfg_year"] == 2024

    # 3. Standalone ISO date with slash 2024/06
    d3 = StatutoryDeclarationParser.parse_mfg_and_expiry_dates("2024/06")
    assert d3["mfg_month"] == 6
    assert d3["mfg_year"] == 2024


def test_consumer_care_support_desks():
    """Verify consumer care parser recognizes Customer Support Desk and Consumer Complaints Cell."""
    # 1. Customer Support Desk
    t1 = "For queries write to Customer Support Desk, care@brand.com, 1800-123-4567, address on pack"
    res1 = StatutoryDeclarationParser.check_consumer_care_completeness(t1)
    assert res1["is_complete"] is True
    assert res1["has_contact_name"] is True
    assert "Customer Support" in res1["contact_name"]

    # 2. Consumer Complaints Cell
    t2 = "Consumer Complaints Cell, care@brand.com, 1800-123-4567, at above address"
    res2 = StatutoryDeclarationParser.check_consumer_care_completeness(t2)
    assert res2["is_complete"] is True
    assert res2["has_contact_name"] is True
    assert "Consumer Complaints" in res2["contact_name"]


def test_ladakh_and_ut_pin_codes():
    """Verify Ladakh 194xxx and UT city mappings."""
    # 1. Ladakh 194xxx PIN code override
    a1 = StatutoryDeclarationParser.parse_address("Main Bazar, Leh 194101")
    assert a1 is not None
    assert a1["state"] == "Ladakh"
    assert a1["pin_code"] == "194101"
    assert a1["is_complete"] is True

    # 2. Kargil Ladakh
    a2 = StatutoryDeclarationParser.parse_address("Near District Hospital, Kargil 194103")
    assert a2 is not None
    assert a2["state"] == "Ladakh"
    assert a2["pin_code"] == "194103"

    # 3. Kavaratti Lakshadweep
    a3 = StatutoryDeclarationParser.parse_address("Beach Road, Kavaratti 682555")
    assert a3 is not None
    assert a3["state"] == "Lakshadweep"
    assert a3["pin_code"] == "682555"

    # 4. Silvassa Dadra and Nagar Haveli
    a4 = StatutoryDeclarationParser.parse_address("Plot 22, GIDC, Silvassa 396230")
    assert a4 is not None
    assert a4["state"] == "Dadra and Nagar Haveli"
    assert a4["pin_code"] == "396230"


def test_parenthesized_std_phones():
    """Verify consumer care telephone numbers with parenthesized STD codes."""
    # 1. Mumbai STD (022)
    t1 = "For queries write to Nodal Officer, Tel: (022) 2831-8888, care@brand.in, at above address"
    res1 = StatutoryDeclarationParser.check_consumer_care_completeness(t1)
    assert res1["is_complete"] is True
    assert res1["has_phone"] is True
    assert res1["phone"] == "(022) 2831-8888"

    # 2. Delhi STD (011)
    t2 = "Customer Care: (011) 2345-6789, email: care@tea.com, Customer Care Executive, address on pack"
    res2 = StatutoryDeclarationParser.check_consumer_care_completeness(t2)
    assert res2["is_complete"] is True
    assert res2["has_phone"] is True
    assert res2["phone"] == "(011) 2345-6789"


def test_mixed_fractions_net_quantity():
    """Verify mixed vulgar fractions like '1 ½ kg' and '2 ½ g' normalize to correct floats."""
    # 1. 1 ½ kg -> 1.5 kg
    q1 = StatutoryDeclarationParser.parse_net_quantity("Net Qty: 1 ½ kg")
    assert q1 is not None
    assert q1["magnitude"] == 1.5
    assert q1["unit"] == "kg"
    assert q1["has_banned_unit"] is False

    # 2. 2 ½ g -> 2.5 g
    q2 = StatutoryDeclarationParser.parse_net_quantity("Net Weight: 2 ½ g")
    assert q2 is not None
    assert q2["magnitude"] == 2.5
    assert q2["unit"] == "g"

    # 3. 1 1/4 l -> 1.25 l
    q3 = StatutoryDeclarationParser.parse_net_quantity("Net Content: 1 1/4 l")
    assert q3 is not None
    assert q3["magnitude"] == 1.25
    assert q3["unit"] == "l"


def test_has_tax_inclusive_clause_standalone():
    """Verify StatutoryDeclarationParser.has_tax_inclusive_clause standalone helper."""
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("MRP: Rs. 100/- (incl. of all taxes)") is True
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("Inclusive of all taxes") is True
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("All taxes included") is True
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("सभी कर सहित") is True
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("MRP: Rs. 100/- (Extra taxes apply)") is False
    assert StatutoryDeclarationParser.has_tax_inclusive_clause("Price: Rs. 50") is False


def test_processed_and_packed_by_factory_anchors():
    """Verify entity extraction anchored to Processed & Packed by, Works:, and composite headers."""
    # 1. Processed & Packed by
    a1 = StatutoryDeclarationParser.parse_address("Processed & Packed by: Organic India Pvt. Ltd., Plot 5, Industrial Area, Solan 173212")
    assert a1 is not None
    assert a1["name"] == "Organic India Pvt. Ltd."
    assert a1["state"] == "Himachal Pradesh"
    assert a1["pin_code"] == "173212"

    # 2. Manufactured, Packed & Marketed by
    a2 = StatutoryDeclarationParser.parse_address("Manufactured, Packed & Marketed by: Amul Dairy, Anand 388001, Gujarat")
    assert a2 is not None
    assert a2["name"] == "Amul Dairy"
    assert a2["state"] == "Gujarat"
    assert a2["pin_code"] == "388001"

    # 3. Works:
    a3 = StatutoryDeclarationParser.parse_address("Works: Godrej Agrovet Ltd, GIDC Sanand 382110, Gujarat")
    assert a3 is not None
    assert a3["name"] == "Godrej Agrovet Ltd"
    assert a3["state"] == "Gujarat"
    assert a3["pin_code"] == "382110"






