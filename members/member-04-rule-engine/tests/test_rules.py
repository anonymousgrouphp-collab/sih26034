"""Unit Tests for Member 4 Statutory Rule Engine (SIH26034)

Verifies 100% deterministic AST legal compliance checks:
- Table-I Font Schedule (all 5 rows; Row 5 > 2500 cm² strictly 6.0 mm per ADL-01 / G.S.R. 629(E))
- Unit Sale Price (USP) Arithmetic (|USP * NetQty - MRP| <= 0.02 per G.S.R. 779(E))
- Rule 6 Statutory Declarations (Manufacturer, Net Qty + Banned Units, MRP + Taxes, Consumer Care)
- E-Commerce Marketplace Rule 6(10) (Country of Origin mandatory, Mfg Date exempt)
- Temporal Statutory Epoch Dispatcher (Article 20(1) non-retroactivity)
- 4-State Epistemic Verdict Triage (PASS, FAIL, REVIEW, UNABLE_TO_VERIFY)
- Test suite coverage for TS-UNIT-04 through TS-UNIT-13 per 11_TESTING_AND_VALIDATION_PLAN.md.
"""

import json
from pathlib import Path
import sys
import time
import pytest

# Ensure local src and contracts are on path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from evaluators import (
    Table1FontSchedule,
    USPEvaluator,
    Rule6DeclarationsEvaluator,
    EcommerceComplianceEvaluator,
    TemporalEpochDispatcher,
    LegalMetrologyRuleEngine,
)
from contracts.compliance.compliance_dto import (
    RuleEvaluationDTO,
    ComplianceVerdictResult,
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


# ============================================================================
# 1. TABLE-I FONT SCHEDULE (TS-UNIT-06, TS-UNIT-07, TS-UNIT-08 & SCHEDULE ROWS)
# ============================================================================

def test_table_1_pass_fixture():
    """TS-UNIT-06: PDP Area 144 cm2, measured 2.80 mm >= 2.50 mm -> PASS."""
    with open(FIXTURES_DIR / "fixture_rule_table_1_pass.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "PASS"
    assert result["required_mm"] == 2.50
    assert result["deficit_mm"] == 0.0


def test_table_1_fail_fixture():
    """TS-UNIT-07: PDP Area 144 cm2, measured 1.84 mm < 2.50 mm -> FAIL."""
    with open(FIXTURES_DIR / "fixture_rule_table_1_fail.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "FAIL"
    assert result["required_mm"] == 2.50
    assert result["deficit_mm"] < 0


def test_table_1_row_5_large_container_6mm():
    """TS-UNIT-08: PDP Area > 2500 cm2 must strictly require 6.0 mm (ADL-01 / G.S.R. 629(E))."""
    with open(FIXTURES_DIR / "fixture_rule_row_5_large_container.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "PASS"
    assert result["required_mm"] == 6.00  # Statutory 6.0 mm per G.S.R. 629(E) (ADL-01)


def test_table_1_all_statutory_rows():
    """Verifies all five statutory rows of Table-I (G.S.R. 629(E))."""
    # Row 1: Area <= 50 cm2 -> 1.0 mm
    assert Table1FontSchedule.get_required_font_height_mm(45.0) == 1.0
    assert Table1FontSchedule.get_required_font_height_mm(50.0) == 1.0

    # Row 2: 50 < Area <= 100 cm2 -> 1.5 mm
    assert Table1FontSchedule.get_required_font_height_mm(51.0) == 1.5
    assert Table1FontSchedule.get_required_font_height_mm(100.0) == 1.5

    # Row 3: 100 < Area <= 500 cm2 -> 2.5 mm
    assert Table1FontSchedule.get_required_font_height_mm(101.0) == 2.5
    assert Table1FontSchedule.get_required_font_height_mm(450.0) == 2.5
    assert Table1FontSchedule.get_required_font_height_mm(500.0) == 2.5

    # Row 4: 500 < Area <= 2500 cm2 -> 4.0 mm
    assert Table1FontSchedule.get_required_font_height_mm(501.0) == 4.0
    assert Table1FontSchedule.get_required_font_height_mm(2500.0) == 4.0

    # Row 5: Area > 2500 cm2 -> strictly 6.0 mm (Never 8.0 mm)
    assert Table1FontSchedule.get_required_font_height_mm(2501.0) == 6.0
    assert Table1FontSchedule.get_required_font_height_mm(5000.0) == 6.0


def test_table_1_uncertainty_review_and_unable_to_verify():
    """Verifies 4-state epistemic triage on font measurements: REVIEW and UNABLE_TO_VERIFY."""
    # Borderline measurement: required 2.5 mm, measured 2.45 mm (deficit 0.05 mm <= 0.08 mm uncertainty)
    res_review = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=2.45, uncertainty_mm=0.08)
    assert res_review["status"] == "REVIEW"

    # Missing / degraded measurement: None -> UNABLE_TO_VERIFY
    res_unverifiable = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=None)
    assert res_unverifiable["status"] == "UNABLE_TO_VERIFY"

    # Invalid measurement: <= 0 -> UNABLE_TO_VERIFY
    res_zero = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=0.0)
    assert res_zero["status"] == "UNABLE_TO_VERIFY"


# ============================================================================
# 2. UNIT SALE PRICE (USP) ARITHMETIC (TS-UNIT-04, TS-UNIT-05)
# ============================================================================

def test_ts_unit_04_usp_math_pass():
    """TS-UNIT-04: 200g pack, MRP Rs. 80, declared USP Rs. 0.40/g -> PASS."""
    result = USPEvaluator.evaluate(net_qty=200.0, mrp=80.0, declared_usp=0.40)
    assert result["status"] == "PASS"
    assert result["discrepancy"] == 0.00
    assert result["discrepancy"] <= USPEvaluator.TOLERANCE_INR


def test_ts_unit_05_usp_math_fail():
    """TS-UNIT-05: 400g pack, MRP Rs. 200, declared USP Rs. 0.60/g -> FAIL (discrepancy 40.00 > 0.02)."""
    with open(FIXTURES_DIR / "fixture_rule_usp_mismatch.json") as f:
        data = json.load(f)
    result = USPEvaluator.evaluate(
        net_qty=data["net_quantity_magnitude"],
        mrp=data["mrp_amount"],
        declared_usp=data["declared_usp"],
    )
    assert result["status"] == "FAIL"
    assert result["discrepancy"] == 40.0
    assert result["discrepancy"] > USPEvaluator.TOLERANCE_INR


def test_usp_rounding_tolerance_boundary():
    """Verifies tolerance band of 0.02 INR under G.S.R. 779(E)."""
    # Exact 0.02 INR rounding error -> PASS
    res_edge_pass = USPEvaluator.evaluate(net_qty=100.0, mrp=50.0, declared_usp=0.5002)
    assert res_edge_pass["status"] == "PASS"

    # 0.03 INR mismatch -> FAIL
    res_edge_fail = USPEvaluator.evaluate(net_qty=100.0, mrp=50.0, declared_usp=0.5003)
    assert res_edge_fail["status"] == "FAIL"


def test_usp_invalid_inputs():
    """Verifies handling of invalid or non-positive net quantity / MRP / declared USP."""
    assert USPEvaluator.evaluate(net_qty=0.0, mrp=50.0, declared_usp=0.50)["status"] == "UNABLE_TO_VERIFY"
    assert USPEvaluator.evaluate(net_qty=100.0, mrp=0.0, declared_usp=0.50)["status"] == "UNABLE_TO_VERIFY"
    assert USPEvaluator.evaluate(net_qty=100.0, mrp=50.0, declared_usp=None)["status"] == "UNABLE_TO_VERIFY"


# ============================================================================
# 3. RULE 6 MANDATORY STATUTORY DECLARATIONS
# ============================================================================

def test_rule_6_manufacturer_evaluator():
    """Rule 6(1)(a): Name and complete address of manufacturer/packer."""
    # Compliant
    pass_res = Rule6DeclarationsEvaluator.evaluate_manufacturer(
        name="Britannia Industries Ltd",
        address_line="5/1A Hungerford Street, Kolkata, West Bengal 700017"
    )
    assert pass_res["status"] == "PASS"

    # Missing name -> FAIL
    fail_no_name = Rule6DeclarationsEvaluator.evaluate_manufacturer(name=None, address_line="Kolkata")
    assert fail_no_name["status"] == "FAIL"

    # Missing address -> FAIL
    fail_no_addr = Rule6DeclarationsEvaluator.evaluate_manufacturer(name="Britannia Industries Ltd", address_line="")
    assert fail_no_addr["status"] == "FAIL"


def test_rule_6_net_quantity_and_banned_units():
    """Rule 6(1)(f) read with Rule 12 & Section 11: Net quantity & banned unit symbols."""
    # Compliant SI unit
    pass_res = Rule6DeclarationsEvaluator.evaluate_net_quantity(magnitude=500.0, unit="g")
    assert pass_res["status"] == "PASS"

    # Prohibited non-standard unit 'gms' (TS-UNIT-01)
    fail_gms = Rule6DeclarationsEvaluator.evaluate_net_quantity(
        magnitude=500.0, unit="gms", has_banned_unit=True, banned_unit_found="gms"
    )
    assert fail_gms["status"] == "FAIL"
    assert "gms" in fail_gms["discrepancy"]

    # Prohibited unit 'ML' (TS-UNIT-02)
    fail_ml = Rule6DeclarationsEvaluator.evaluate_net_quantity(
        magnitude=750.0, unit="ML", has_banned_unit=True, banned_unit_found="ML"
    )
    assert fail_ml["status"] == "FAIL"

    # Missing magnitude -> FAIL
    fail_missing = Rule6DeclarationsEvaluator.evaluate_net_quantity(magnitude=0.0, unit="g")
    assert fail_missing["status"] == "FAIL"


def test_rule_6_mrp_and_tax_clause():
    """Rule 6(1)(e): Maximum Retail Price and mandatory '(inclusive of all taxes)' clause."""
    # Compliant
    pass_res = Rule6DeclarationsEvaluator.evaluate_mrp(amount=45.0, tax_inclusive=True)
    assert pass_res["status"] == "PASS"

    # Missing tax clause -> FAIL
    fail_tax = Rule6DeclarationsEvaluator.evaluate_mrp(amount=45.0, tax_inclusive=False)
    assert fail_tax["status"] == "FAIL"
    assert "inclusive of all taxes" in fail_tax["discrepancy"]

    # Missing or non-positive MRP -> FAIL
    fail_zero = Rule6DeclarationsEvaluator.evaluate_mrp(amount=0.0, tax_inclusive=True)
    assert fail_zero["status"] == "FAIL"


def test_ts_unit_09_consumer_care_missing_email():
    """TS-UNIT-09: Declaration has Tel, Address, Contact, but NO email -> VIOLATION_FLAG."""
    with open(FIXTURES_DIR / "fixture_rule_consumer_care_fail.json") as f:
        data = json.load(f)
    result = Rule6DeclarationsEvaluator.evaluate_consumer_care(
        has_phone=bool(data.get("phone")),
        has_email=bool(data.get("email")),
        has_address=bool(data.get("address")),
        has_contact_name=bool(data.get("contact_name")),
    )
    assert result["status"] == "FAIL"
    assert "Email" in result["discrepancy"]


def test_consumer_care_complete():
    """Rule 6(1)(n): Complete 4-tuple consumer care -> PASS."""
    result = Rule6DeclarationsEvaluator.evaluate_consumer_care(
        has_phone=True,
        has_email=True,
        has_address=True,
        has_contact_name=True,
    )
    assert result["status"] == "PASS"
    assert result["discrepancy"] is None


def test_rule_6_country_of_origin():
    """Rule 6(1)(p): Country of Origin declaration."""
    assert Rule6DeclarationsEvaluator.evaluate_country_of_origin("India")["status"] == "PASS"
    assert Rule6DeclarationsEvaluator.evaluate_country_of_origin(None)["status"] == "FAIL"
    assert Rule6DeclarationsEvaluator.evaluate_country_of_origin("")["status"] == "FAIL"


# ============================================================================
# 4. TEMPORAL STATUTORY EPOCH DISPATCHER (TS-UNIT-10, TS-UNIT-11)
# ============================================================================

def test_temporal_epoch_pre_2021():
    """TS-UNIT-10: Pre-USP amendment (10/2021) routes to EPOCH_2017_GSR_629; USP not mandatory."""
    epoch = TemporalEpochDispatcher.get_epoch("2021-10-15")
    assert epoch == "EPOCH_2017_GSR_629"
    assert TemporalEpochDispatcher.is_usp_mandatory(epoch) is False


def test_temporal_epoch_post_2021():
    """TS-UNIT-11: Post-USP amendment (03/2023) routes to EPOCH_2021_GSR_779; USP is mandatory."""
    epoch = TemporalEpochDispatcher.get_epoch("2023-03-20")
    assert epoch == "EPOCH_2021_GSR_779"
    assert TemporalEpochDispatcher.is_usp_mandatory(epoch) is True


def test_temporal_epoch_2011_and_2026():
    """Verifies Base 2011 and future 2026 G.S.R. 128(E) epochs."""
    assert TemporalEpochDispatcher.get_epoch("2015-01-01") == "EPOCH_2011_BASE"
    assert TemporalEpochDispatcher.get_epoch("2026-08-01") == "EPOCH_2026_GSR_128"
    assert TemporalEpochDispatcher.is_usp_mandatory("EPOCH_2026_GSR_128") is True


# ============================================================================
# 5. E-COMMERCE LISTING AUDITOR (TS-UNIT-12, TS-UNIT-13)
# ============================================================================

def test_ts_unit_12_ecommerce_missing_mfg_date_statutorily_exempt():
    """TS-UNIT-12: Online listing missing Manufacturing Date is statutorily EXEMPT under Rule 6(10) -> PASS."""
    listing = {
        "manufacturer_name": "Organic India Pvt Ltd",
        "manufacturer_address": "Plot 28, Sector 18, Gurugram 122015",
        "net_quantity_magnitude": 250.0,
        "net_quantity_unit": "g",
        "mrp": 320.0,
        "tax_inclusive": True,
        "consumer_care_phone": "1800-123-456",
        "consumer_care_email": "care@organicindia.com",
        "consumer_care_address": "Plot 28, Sector 18, Gurugram",
        "country_of_origin": "India",
        "mfg_date": None,  # EXEMPT per Rule 6(10)
    }
    evaluations = EcommerceComplianceEvaluator.evaluate_listing(listing)
    mfg_eval = next(e for e in evaluations if e["rule_code"] == "RULE_06_10_MFG_DATE_EXEMPTION")
    assert mfg_eval["status"] == "PASS"
    assert "exempt" in mfg_eval["legal_consequence"].lower()

    # Overall listing should PASS
    overall = LegalMetrologyRuleEngine.triage_verdict(evaluations)
    assert overall == "PASS"


def test_ts_unit_13_ecommerce_missing_country_of_origin():
    """TS-UNIT-13: Online listing missing Country of Origin -> FAIL under Rule 6(10) / Rule 6(1)(p)."""
    listing = {
        "manufacturer_name": "Organic India Pvt Ltd",
        "manufacturer_address": "Plot 28, Sector 18, Gurugram 122015",
        "net_quantity_magnitude": 250.0,
        "net_quantity_unit": "g",
        "mrp": 320.0,
        "tax_inclusive": True,
        "consumer_care_phone": "1800-123-456",
        "consumer_care_email": "care@organicindia.com",
        "country_of_origin": None,  # MANDATORY!
    }
    evaluations = EcommerceComplianceEvaluator.evaluate_listing(listing)
    origin_eval = next(e for e in evaluations if e["rule_code"] == "RULE_06_10_COUNTRY_OF_ORIGIN")
    assert origin_eval["status"] == "FAIL"

    overall = LegalMetrologyRuleEngine.triage_verdict(evaluations)
    assert overall == "FAIL"


def test_ecommerce_fixture_evaluation():
    """Evaluates the dedicated e-commerce fixture file."""
    with open(FIXTURES_DIR / "fixture_rule_ecommerce_listing.json") as f:
        data = json.load(f)
    evaluations = EcommerceComplianceEvaluator.evaluate_listing(data)
    overall = LegalMetrologyRuleEngine.triage_verdict(evaluations)
    assert overall == data["expected_verdict"]


# ============================================================================
# 6. COMPOSITE 4-STATE EPISTEMIC TRIAGE & ENGINE INTEGRATION
# ============================================================================

def test_rule_engine_full_compliant_pass():
    """Full compliant package inspection: all rules pass -> overall PASS."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_test_pass_001",
        pdp_area_cm2=144.0,
        font_height_mm=2.80,
        net_quantity={"magnitude": 200.0, "unit": "g"},
        mrp={"amount": 80.0, "tax_inclusive": True},
        declared_usp=0.40,
        manufacturer={"name": "Tata Consumer Products", "address_line": "1 Bishop Lefroy Road, Kolkata"},
        consumer_care={"has_phone": True, "has_email": True, "has_address": True, "has_contact_name": True},
        country_of_origin="India",
        mfg_date_iso="2023-05-15",
    )
    assert result["overall_verdict"] == "PASS"
    assert result["adjudication_required"] is True
    assert result["epoch_applied"] == "EPOCH_2021_GSR_779"
    assert result["execution_time_ms"] >= 0

    # Validate against canonical Pydantic contracts
    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "PASS"
    assert len(dto.evaluations) >= 5


def test_rule_engine_violation_fail():
    """Package with font violation & USP mismatch -> overall FAIL."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_test_fail_002",
        pdp_area_cm2=144.0,
        font_height_mm=1.80,  # Below 2.5 mm requirement
        net_quantity={"magnitude": 400.0, "unit": "g"},
        mrp={"amount": 200.0, "tax_inclusive": True},
        declared_usp=0.60,  # Mismatch: 0.60 * 400 = 240 != 200
        manufacturer={"name": "Snack Co", "address_line": "Delhi"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        mfg_date_iso="2023-06-01",
    )
    assert result["overall_verdict"] == "FAIL"

    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "FAIL"
    failed_codes = [e.rule_code for e in dto.evaluations if e.status == "FAIL"]
    assert "RULE_06_1_H_NET_QTY_FONT" in failed_codes
    assert "RULE_06_1_K_USP_COMPUTATION" in failed_codes


def test_rule_engine_borderline_review():
    """Package with borderline font height within sensor uncertainty -> overall REVIEW."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_test_review_003",
        pdp_area_cm2=144.0,
        font_height_mm=2.45,  # 2.45 mm vs 2.50 mm required (diff -0.05 mm <= 0.08 mm uncertainty)
        net_quantity={"magnitude": 200.0, "unit": "g"},
        mrp={"amount": 80.0, "tax_inclusive": True},
        declared_usp=0.40,
        manufacturer={"name": "Tata Consumer Products", "address_line": "Kolkata"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        mfg_date_iso="2023-05-15",
    )
    assert result["overall_verdict"] == "REVIEW"
    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "REVIEW"


def test_rule_engine_unverifiable():
    """Package with missing font measurement -> overall UNABLE_TO_VERIFY."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_test_unverifiable_004",
        pdp_area_cm2=144.0,
        font_height_mm=None,  # Degraded / unreadable numeral
        net_quantity={"magnitude": 200.0, "unit": "g"},
        mrp={"amount": 80.0, "tax_inclusive": True},
        declared_usp=0.40,
        manufacturer={"name": "Tata Consumer Products", "address_line": "Kolkata"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        mfg_date_iso="2023-05-15",
    )
    assert result["overall_verdict"] == "UNABLE_TO_VERIFY"
    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "UNABLE_TO_VERIFY"


def test_rule_engine_execution_latency_sub_5ms():
    """Acceptance Benchmark: Evaluates determinism and execution speed < 5 ms."""
    t0 = time.perf_counter()
    for _ in range(100):
        LegalMetrologyRuleEngine.evaluate_inspection(
            inspection_id="insp_perf_benchmark",
            pdp_area_cm2=144.0,
            font_height_mm=2.80,
            net_quantity={"magnitude": 200.0, "unit": "g"},
            mrp={"amount": 80.0, "tax_inclusive": True},
            declared_usp=0.40,
            manufacturer={"name": "Tata Consumer", "address_line": "Kolkata"},
            consumer_care={"has_phone": True, "has_email": True},
            country_of_origin="India",
            mfg_date_iso="2023-05-15",
        )
    elapsed_total = time.perf_counter() - t0
    avg_ms = (elapsed_total / 100) * 1000
    assert avg_ms < 5.0, f"Average execution time {avg_ms:.3f} ms exceeds 5 ms target"
