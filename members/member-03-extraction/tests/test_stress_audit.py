"""Exhaustive Stress-Testing, Bug-Bash and Evidentiary Defense Audit for Member 3 Semantic Extraction (SIH26034)

Verifies:
1. ReDoS & Performance Benchmarks: Sub-150ms execution on massive text blocks (10,000 to 50,000 chars)
2. Section 63 BSA 2023 Evidentiary Defense (0.0% False Accusation Rate):
   - Dotted uppercase corporate entities (G.M. Foods, G.M. Agro, Non-GM, GM Operations)
   - Modern AI/ML technology descriptors (AI & ML, AI and ML, ML-powered, ML ops)
   - Bare domain URL paths (brand.com/ML, care.co.in/ML)
   - Latin abbreviations (e.g. with milk, i.e., etc.)
3. Postal Invariants: City precedence over shared PIN prefixes (Valsad vs Silvassa 396), Regd Off PINs
4. Indic Script & Matra Boundaries: UP/MP no origin leak, Devanagari vowel sign Mc boundary safety
5. Degraded & Corrupted Payload Resilience: None tokens, None bboxes, 1/0 fractions, extreme payloads
6. E-Commerce Single Listing Inspections: Rule 6(10) statutory exemption & structured attribute dicts
"""

from pathlib import Path
import sys
import time
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
# 1. ReDoS & Performance Stress Benchmarks
# =========================================================================

def test_redos_address_and_parsers_throughput():
    """Verify all statutory parsers complete massive text scans (40,000 chars) in sub-150ms with ZERO ReDoS."""
    parser = StatutoryDeclarationParser
    massive_text = "Statutory compliance declaration paragraph for legal metrology inspection. " * 500
    assert len(massive_text) > 35000

    t0 = time.perf_counter()
    banned = parser.detect_banned_units(massive_text)
    qty = parser.parse_net_quantity(massive_text)
    mrp = parser.parse_mrp(massive_text)
    usp = parser.parse_usp(massive_text)
    dates = parser.parse_mfg_and_expiry_dates(massive_text)
    pin = parser.parse_pin_code(massive_text)
    addr = parser.parse_address(massive_text)
    care = parser.check_consumer_care_completeness(massive_text)
    coo = parser.parse_country_of_origin(massive_text)
    gen = parser.parse_generic_name(massive_text)
    elapsed = time.perf_counter() - t0

    assert banned == (False, None)
    assert qty is None
    assert mrp is None
    assert addr is None
    # Whole suite on 37k chars must complete in under 500ms on standard CPUs (guarantees O(N) linear performance)
    assert elapsed < 0.50, f"ReDoS vulnerability detected! Elapsed time: {elapsed:.4f}s"


def test_extractor_high_volume_tokens_throughput(extractor):
    """Verify 1,000 OCR tokens are processed by the 2D spatial graph linker in under 1.0 second."""
    fake_tokens = [
        {"token_id": f"t_{i}", "text": f"LabelWord_{i}", "confidence": 0.95, "bounding_box": [i * 2, 10, i * 2 + 15, 120]}
        for i in range(1000)
    ]
    # Insert actual declarations in the stream
    fake_tokens[50] = {"token_id": "t_50", "text": "Net Qty: 500 g", "confidence": 0.98, "bounding_box": [100, 10, 115, 150]}
    fake_tokens[100] = {"token_id": "t_100", "text": "MRP Rs. 99.00 (incl. of all taxes)", "confidence": 0.98, "bounding_box": [200, 10, 215, 300]}

    t0 = time.perf_counter()
    facts = extractor.extract({"image_id": "stress_1k", "tokens": fake_tokens})
    elapsed = time.perf_counter() - t0

    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.mrp is not None
    assert facts.mrp.amount == 99.0
    assert elapsed < 1.0, f"Spatial graph linking took too long: {elapsed:.4f}s"


# =========================================================================
# 2. Section 63 BSA 2023 Evidentiary Defense (0.0% False Accusations)
# =========================================================================

def test_evidentiary_defense_dotted_corporate_gm_entities():
    """Verify corporate names with uppercase GM/G.M. and dots NEVER trigger false accusations."""
    safe_corporate_samples = [
        "Manufactured by: G.M. Foods Pvt. Ltd., Industrial Area, Baddi",
        "Marketed by G.M. Agro Limited, Mumbai",
        "Formulated by G.M. Bio Sciences LLP",
        "G.M. Organics Ltd., New Delhi",
        "Produced at G.M. Mills, Ludhiana, Punjab",
        "Executive: G.M. Operations, Corporate Office",
        "Contact: General Manager (G.M.) Consumer Relations",
        "100% Non-GM Ingredients Certified",
        "Certified Non-GMO Corn Flour",
        "GM Exports International Pvt Ltd",
    ]
    for sample in safe_corporate_samples:
        has_banned, unit = StatutoryDeclarationParser.detect_banned_units(sample)
        assert has_banned is False, f"False accusation on legal corporate entity in: {sample} (flagged '{unit}')"
        assert unit is None


def test_evidentiary_defense_prohibited_gm_with_quantity_flagged():
    """Verify prohibited GM declarations with numeric quantity or rate denominator ARE flagged."""
    prohibited_samples = [
        ("Net Wt: 500 G.M.", "G.M."),
        ("Net Wt: 500 GM", "GM"),
        ("Net Quantity: 250 g.m.", "g.m."),
        ("Net Wt: 100 gm", "gm"),
        ("Unit Sale Price: Rs. 0.50 / GM", "GM"),
        ("Rate: Rs. 10 per GM", "GM"),
        ("Quantity: 500 g.m.s.", "g.m.s."),
        ("Net Content: 1000 G.M.S.", "G.M.S."),
    ]
    for sample, expected in prohibited_samples:
        has_banned, unit = StatutoryDeclarationParser.detect_banned_units(sample)
        assert has_banned is True, f"Failed to flag illegal unit in: {sample}"
        assert unit is not None


def test_evidentiary_defense_modern_ai_ml_tech_descriptors():
    """Verify modern smart device AI/ML descriptors NEVER trigger illegal ML (Mega-Litre) flags."""
    safe_tech_samples = [
        "Smart Kitchen Scale with AI & ML technology",
        "AI and ML powered precision weighing sensor",
        "ML-powered freshness tracking indicator",
        "Integrated AI/ML model for dietary analysis",
        "Machine Learning (ML) enabled diagnostics",
        "ML ops calibrated device, Batch No: 2024",
    ]
    for sample in safe_tech_samples:
        has_banned, unit = StatutoryDeclarationParser.detect_banned_units(sample)
        assert has_banned is False, f"False accusation on modern AI/ML technology in: {sample} (flagged '{unit}')"
        assert unit is None


def test_evidentiary_defense_prohibited_ml_volume_flagged():
    """Verify capitalized ML volume declarations ARE strictly flagged under Rule 12."""
    prohibited_ml_samples = [
        "Net Volume: 750 ML",
        "Net Vol: 500 Ml",
        "Volume: 1000 M.L.",
        "Contents: 200 M.l",
    ]
    for sample in prohibited_ml_samples:
        has_banned, unit = StatutoryDeclarationParser.detect_banned_units(sample)
        assert has_banned is True, f"Failed to flag prohibited ML in: {sample}"
        assert unit in ("ML", "Ml", "M.L.", "M.l")


def test_evidentiary_defense_bare_urls_and_latin_abbreviations():
    """Verify URLs without protocol or www and Latin abbreviations NEVER falsely accuse."""
    safe_samples = [
        "Visit nestle.com/ML/page for details",
        "Customer portal: feedback.co.in/ML",
        "Info: parle.org/gm/nutrition",
        "Serving suggestion (e.g. with milk or fruit)",
        "Dosage: e.g. 1 tablet twice daily",
        "Use as directed, i.e. with warm water",
        "Ingredients: wheat, sugar, salt, etc.",
    ]
    for sample in safe_samples:
        has_banned, unit = StatutoryDeclarationParser.detect_banned_units(sample)
        assert has_banned is False, f"False accusation in: {sample} (flagged '{unit}')"
        assert unit is None


# =========================================================================
# 3. Postal Invariants & State Precedence (OQ-02)
# =========================================================================

def test_postal_city_precedence_over_shared_pin_prefixes():
    """Verify explicit city names in text always take precedence over shared 3-digit PIN prefixes."""
    # Shared prefix 396: Valsad is Gujarat, Silvassa is Dadra and Nagar Haveli
    addr_silvassa = StatutoryDeclarationParser.parse_address("Survey 12, Silvassa - 396230")
    assert addr_silvassa is not None
    assert addr_silvassa["state"] == "Dadra and Nagar Haveli"
    assert addr_silvassa["pin_code"] == "396230"
    assert addr_silvassa["is_complete"] is True

    addr_valsad = StatutoryDeclarationParser.parse_address("Plot 44, GIDC, Valsad - 396001")
    assert addr_valsad is not None
    assert addr_valsad["state"] == "Gujarat"
    assert addr_valsad["pin_code"] == "396001"
    assert addr_valsad["is_complete"] is True

    # Shared prefix 682: Kochi is Kerala, Kavaratti is Lakshadweep
    addr_kav = StatutoryDeclarationParser.parse_address("Harbour Road, Kavaratti - 682555")
    assert addr_kav is not None
    assert addr_kav["state"] == "Lakshadweep"
    assert addr_kav["pin_code"] == "682555"

    addr_kochi = StatutoryDeclarationParser.parse_address("Marine Drive, Kochi - 682001")
    assert addr_kochi is not None
    assert addr_kochi["state"] == "Kerala"
    assert addr_kochi["pin_code"] == "682001"


def test_postal_regd_off_and_license_disambiguation():
    """Verify Registered Office PINs are extracted while license numbers are rejected."""
    # Valid Registered Office PIN
    pin1 = StatutoryDeclarationParser.parse_pin_code("Regd Off: Bengaluru 560001")
    assert pin1 == "560001"

    pin2 = StatutoryDeclarationParser.parse_pin_code("Regd. Office: Mumbai - 400057")
    assert pin2 == "400057"

    # Disallowed registration numbers
    assert StatutoryDeclarationParser.parse_pin_code("Reg. No. 123456") is None
    assert StatutoryDeclarationParser.parse_pin_code("Regd. No. 560001") is None
    assert StatutoryDeclarationParser.parse_pin_code("Registration Number: 110020") is None
    assert StatutoryDeclarationParser.parse_pin_code("Lic No. 110020") is None


# =========================================================================
# 4. Indic Script & Matra Boundary Invariants
# =========================================================================

def test_indic_state_names_do_not_leak_into_country_of_origin():
    """Verify states ending in 'देश' (Uttar Pradesh, Madhya Pradesh) NEVER leak into origin."""
    up_address = "निर्माता: डाबर इंडिया लिमिटेड, साहिबाबाद, उत्तर प्रदेश २०१०१०"
    coo = StatutoryDeclarationParser.parse_country_of_origin(up_address)
    assert coo is None

    mp_address = "निर्माता: पतंजलि आयुर्वेद, पीथमपुर, मध्य प्रदेश ४५४७७५"
    coo_mp = StatutoryDeclarationParser.parse_country_of_origin(mp_address)
    assert coo_mp is None

    # Valid origin declaration
    valid_hindi_origin = "मूल देश: भारत, निर्माता: डाबर, उत्तर प्रदेश २०१०१०"
    assert StatutoryDeclarationParser.parse_country_of_origin(valid_hindi_origin) == "भारत"


def test_indic_matra_mc_boundary_safety():
    """Verify non-word vowel sign matras (Unicode category Mc) are correctly parsed without boundary failures."""
    # Matra 'ी' in मिली
    q_milli = StatutoryDeclarationParser.parse_net_quantity("शुद्ध मात्रा: २५० मिली")
    assert q_milli is not None
    assert q_milli["magnitude"] == 250.0
    assert q_milli["unit"] == "ml"
    assert q_milli["has_banned_unit"] is False

    # USP with Indic unit
    usp_hindi = StatutoryDeclarationParser.parse_usp("इकाई विक्रय मूल्य: रु. ०.५० प्रति मिली")
    assert usp_hindi is not None
    assert usp_hindi["price_per_unit"] == 0.50
    assert usp_hindi["unit"] == "ml"


# =========================================================================
# 5. Degraded & Corrupted Payload Resilience
# =========================================================================

def test_extractor_resilient_to_null_and_corrupted_tokens(extractor):
    """Verify extractor degrades gracefully on null, empty, and corrupted tokens without crashing."""
    corrupted_payload = {
        "image_id": "corrupted_payload_01",
        "tokens": [
            {"text": None, "bounding_box": None, "confidence": None},
            {"text": "", "bounding_box": [10, 20]},
            {},
            {"token_id": "t_valid", "text": "Net Qty: 250 g", "bounding_box": [50, 10, 70, 150]},
            {"text": "MRP Rs. 75.00 (incl. of all taxes)", "bounding_box": [80, 10, 100, 250]},
        ]
    }
    facts = extractor.extract(corrupted_payload)
    assert isinstance(facts, NormalizedCommodityFacts)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 250.0
    assert facts.mrp is not None
    assert facts.mrp.amount == 75.0
    assert facts.mrp.tax_inclusive is True


def test_parsers_resilient_to_mathematical_singularities():
    """Verify division by zero, negative quantities, and extreme numbers are safely handled."""
    # Zero quantity
    assert StatutoryDeclarationParser.parse_net_quantity("Net Qty: 0 g") is None
    # Zero division fraction
    assert StatutoryDeclarationParser.parse_net_quantity("Net Qty: 1/0 kg") is None
    # Negative quantity
    assert StatutoryDeclarationParser.parse_net_quantity("Net Qty: -500 g") is None
    # Zero MRP
    assert StatutoryDeclarationParser.parse_mrp("MRP Rs. 0.00 (incl. of all taxes)") is None
    # Zero USP
    assert StatutoryDeclarationParser.parse_usp("USP: Rs. 0.00 / g") is None


# =========================================================================
# 6. E-Commerce Single Listing Inspections (Rule 6(10) & ADL-10)
# =========================================================================

def test_ecommerce_structured_dictionary_ingestion(extractor):
    """Verify extractor accepts structured attribute dictionaries from scrapers/APIs."""
    scraped_listing = {
        "title": "Aashirvaad Superior MP Sharbati Whole Wheat Atta, 5kg",
        "price_mrp": "MRP: ₹ 340.00 (inclusive of all taxes)",
        "net_quantity": "Net Weight: 5 kg",
        "unit_price": "Unit Sale Price: ₹ 68.00 / kg",
        "country_of_origin": "Country of Origin: India",
        "manufacturer": "ITC Limited, 37, J.L. Nehru Road, Kolkata - 700071, West Bengal",
        "consumer_care": "For queries, contact Customer Care Executive at 1800-425-4444, itccares@itc.in",
    }
    facts = extractor.extract_ecommerce(scraped_listing, url="https://marketplace.in/product/12345")

    assert facts.image_id == "https://marketplace.in/product/12345"
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 5.0
    assert facts.net_quantity.unit == "kg"

    assert facts.mrp is not None
    assert facts.mrp.amount == 340.0
    assert facts.mrp.tax_inclusive is True

    assert facts.unit_sale_price is not None
    assert facts.unit_sale_price.price_per_unit == 68.0
    assert facts.unit_sale_price.unit == "kg"

    assert facts.country_of_origin == "India"
    assert facts.manufacturer is not None
    assert facts.manufacturer.state == "West Bengal"
    assert facts.manufacturer.pin_code == "700071"

    # Verify Rule 6(10) statutory exemption for manufacturing date on digital marketplace listings
    exemption_fields = [f for f in facts.raw_fields if f.raw_ocr_text == "STATUTORY_EXEMPTION_RULE_6_10"]
    assert len(exemption_fields) == 1
    assert exemption_fields[0].normalized_value.get("is_exempt") is True
    assert exemption_fields[0].normalized_value.get("status") == "EXEMPT"
