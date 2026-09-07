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
