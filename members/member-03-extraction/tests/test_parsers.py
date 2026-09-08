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

