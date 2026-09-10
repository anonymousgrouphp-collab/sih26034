"""Pass 3: Real-World Industrial FMCG Complexity & Multi-Entity Supply Chains (SIH26034)

Audits and stress-tests:
- Multi-tier multi-pack configurations (Rule 24 wholesale & retail cartons)
- Complex multi-entity supply chains (Manufacturer vs Packer vs Marketer vs Importer)
- Dual price packaging declarations (MRP vs Discount / Special Offer Price)
- Multi-PIN SEZ & industrial export addresses
- Dot-matrix inkjet best-before derivations
- Multi-line split tax inclusivity declarations
- Multi-channel consumer redressal contacts (Toll-free, landline, email, PO Box)
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


def test_multipack_nested_tier_wholesale_cartons():
    """Verify Rule 24 multi-pack declarations with count, piece size, and total net mass."""
    parser = StatutoryDeclarationParser

    # Retail multi-pack: 10 sachets x 5 g = 50 g
    multipack_str = "Net Quantity: 10 sachets x 5 g (Total Net Weight: 50 g)"
    res = parser.parse_net_quantity(multipack_str)
    assert res is not None
    assert res["magnitude"] == 50.0
    assert res["unit"] == "g"
    assert res["piece_count"] == 10
    assert res["piece_magnitude"] == 5.0

    # Wholesale case pack: Pack of 24 x 150 ml
    case_str = "Pack of 24 x 150 ml"
    case_res = parser.parse_net_quantity(case_str)
    assert case_res is not None
    assert case_res["magnitude"] == 3600.0
    assert case_res["unit"] == "ml"
    assert case_res["piece_count"] == 24


def test_multi_entity_chain_manufacturer_packer_marketer(extractor):
    """Verify four-tier supply chain: Manufacturer takes priority over Marketer for mfg address."""
    chain_tokens = [
        {"token_id": "t1", "text": "Manufactured by: Pure Foods Factory, Plot 14, Baddi, Solan, Himachal Pradesh 173205", "confidence": 0.97, "bounding_box": [10, 10, 30, 400]},
        {"token_id": "t2", "text": "Packed by: Packaging Unit 2, GIDC Vapi, Gujarat 396195", "confidence": 0.95, "bounding_box": [35, 10, 55, 380]},
        {"token_id": "t3", "text": "Marketed by: Global Brands India Ltd, Nariman Point, Mumbai 400021", "confidence": 0.96, "bounding_box": [60, 10, 80, 410]},
        {"token_id": "t4", "text": "Net Qty: 250 g | MRP Rs. 99.00 (incl. of all taxes)", "confidence": 0.98, "bounding_box": [85, 10, 105, 350]},
    ]

    facts = extractor.extract(chain_tokens)
    assert facts.manufacturer is not None
    # Manufacturer takes precedence over marketer
    assert facts.manufacturer.state == "Himachal Pradesh"
    assert facts.manufacturer.pin_code == "173205"
    assert "Pure Foods" in facts.manufacturer.name


def test_dual_price_mrp_vs_special_offer_discount():
    """Verify MRP parser extracts statutory maximum retail price without contamination from promotional discounts."""
    parser = StatutoryDeclarationParser

    label = "MRP: Rs. 499.00 (Inclusive of all taxes). Special Offer Price: Rs. 399.00 (Save Rs. 100/-)!"
    mrp_res = parser.parse_mrp(label)
    assert mrp_res is not None
    assert mrp_res["amount"] == 499.0
    assert mrp_res["tax_inclusive"] is True


def test_complex_sez_and_multiple_pincodes_in_single_block():
    """Verify address parsing identifies primary factory address in multi-location corporate blocks."""
    parser = StatutoryDeclarationParser

    address_text = "Factory: Sector 62, Phase 3, Noida, Uttar Pradesh 201309. Regd Office: Express Towers, Mumbai 400021"
    addr = parser.parse_address(address_text)
    assert addr is not None
    assert addr["state"] in ("Uttar Pradesh", "Maharashtra")
    assert addr["pin_code"] in ("201309", "400021")
    assert addr["is_complete"] is True


def test_non_standard_inkjet_best_before_and_derived_expiry():
    """Verify dot-matrix printed manufacturing date and best-before duration derivation."""
    parser = StatutoryDeclarationParser

    inkjet_text = "B.NO. 882 MFD. 05/2024 BEST BEFORE 18 MONTHS FROM PKG"
    dates = parser.parse_mfg_and_expiry_dates(inkjet_text)
    assert dates is not None
    assert dates["mfg_month"] == 5
    assert dates["mfg_year"] == 2024
    # 05/2024 + 18 months = 11/2025
    assert dates["exp_month"] == 11
    assert dates["exp_year"] == 2025


def test_split_line_tax_clause_multiple_lines_later():
    """Verify decoupled tax inclusivity checker on split packaging layouts."""
    parser = StatutoryDeclarationParser

    split_block = """
    PRODUCT: BASMATI RICE
    MRP: Rs. 185.00
    LOT NO: R-2024-A
    PKD: 02/2024
    NET WEIGHT: 1 kg
    (INCLUSIVE OF ALL TAXES)
    """
    assert parser.has_tax_inclusive_clause(split_block) is True


def test_consumer_care_multi_channel_redressal():
    """Verify consumer redressal contact parsing extracts phone, toll-free, email, title, and PO Box."""
    parser = StatutoryDeclarationParser

    care_text = (
        "Consumer Care Officer: Tel: (022) 2831-8888, Toll Free: 1800-22-3344. "
        "Email: care@nestleindia.com. Address: Post Box No. 456, Mumbai 400001"
    )
    care = parser.check_consumer_care_completeness(care_text)
    assert care["has_phone"] is True
    assert care["has_email"] is True
    assert care["has_address"] is True
    assert care["has_contact_name"] is True
    assert care["is_complete"] is True
    assert "nestleindia.com" in care["email"]
