"""Exhaustive Courtroom-Admissible Audit & Stress Test Suite for Member 4 Rule Engine.

Covers:
1. Mathematical Edge-Cases in USP (cross-unit metric conversions, per 100g/ml, IEEE 754 precision, NaN/Inf defense)
2. Rule 24 Wholesale Multi-Pack & Multi-Piece Package Compliance (piece count, piece qty, arithmetic consistency)
3. Jan Vishwas Act 2023 Decriminalization & Compounding Schedule Calculator (Improvement Notices, cure windows, compounding fees)
4. Courtroom-Admissible AST Integration & Pydantic DTO Strict Conformance
"""

from pathlib import Path
import sys
import math
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from evaluators import (
    LegalMetrologyRuleEngine,
    USPEvaluator,
    Rule24MultiPackEvaluator,
    JanVishwasCompoundingCalculator,
    Table1FontSchedule,
    Rule6DeclarationsEvaluator,
    TemporalEpochDispatcher,
)
from contracts.compliance.compliance_dto import ComplianceVerdictResult, RuleEvaluationDTO


# ==============================================================================
# 1. MATHEMATICAL EDGE-CASES IN UNIT SALE PRICE (USP)
# ==============================================================================

def test_usp_cross_unit_grams_to_kg():
    """Verifies that when Net Qty is in grams, USP declared per kg is validated accurately."""
    # 500 g pack, MRP Rs. 200, declared USP Rs. 400.00 / kg -> PASS
    res = USPEvaluator.evaluate(net_qty=500.0, mrp=200.0, declared_usp=400.0)
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0
    assert "Rs. 400.00 /kg or /l" in res["required_value"]


def test_usp_cross_unit_kg_to_grams():
    """Verifies that when Net Qty is in kg, USP declared per gram is validated accurately."""
    # 2.5 kg pack, MRP Rs. 200, declared USP Rs. 0.08 / g -> PASS
    res = USPEvaluator.evaluate(net_qty=2.5, mrp=200.0, declared_usp=0.08)
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0


def test_usp_commercial_per_100g():
    """Verifies commercial per-100g rate declarations under G.S.R. 779(E)."""
    # 500 g pack, MRP Rs. 200, declared USP Rs. 40.00 / 100g -> PASS
    res = USPEvaluator.evaluate(net_qty=500.0, mrp=200.0, declared_usp=40.0)
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0
    assert "100g" in res["required_value"]


def test_usp_cross_unit_millilitres_to_litres():
    """Verifies that when Net Qty is in ml, USP declared per litre is validated accurately."""
    # 750 ml bottle, MRP Rs. 150, declared USP Rs. 200.00 / litre -> PASS
    res = USPEvaluator.evaluate(net_qty=750.0, mrp=150.0, declared_usp=200.0)
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0


def test_usp_floating_point_ieee754_boundary():
    """Verifies immunity to IEEE 754 binary floating-point representation quirks."""
    # 100 g pack, MRP Rs. 29.0, declared USP Rs. 0.29/g (0.29 * 100 in float can have representation artifacts)
    res = USPEvaluator.evaluate(net_qty=100.0, mrp=29.0, declared_usp=0.29)
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0

    # 100 g pack, MRP Rs. 50.0, declared USP Rs. 0.5002 (exact 0.02 INR discrepancy boundary)
    res_boundary = USPEvaluator.evaluate(net_qty=100.0, mrp=50.0, declared_usp=0.5002)
    assert res_boundary["status"] == "PASS"

    # Beyond 0.02 tolerance (0.5003 * 100 = 50.03, diff 0.03 > 0.02) -> FAIL
    res_fail = USPEvaluator.evaluate(net_qty=100.0, mrp=50.0, declared_usp=0.5003)
    assert res_fail["status"] == "FAIL"


def test_usp_nan_inf_and_negative_input_defense():
    """Verifies that mathematical singularities (NaN, Inf, negative, zero) fail closed to UNABLE_TO_VERIFY."""
    # NaN
    res_nan = USPEvaluator.evaluate(net_qty=float("nan"), mrp=100.0, declared_usp=1.0)
    assert res_nan["status"] == "UNABLE_TO_VERIFY"

    # Infinity
    res_inf = USPEvaluator.evaluate(net_qty=100.0, mrp=float("inf"), declared_usp=1.0)
    assert res_inf["status"] == "UNABLE_TO_VERIFY"

    # Negative values
    res_neg = USPEvaluator.evaluate(net_qty=-50.0, mrp=100.0, declared_usp=2.0)
    assert res_neg["status"] == "UNABLE_TO_VERIFY"


# ==============================================================================
# 2. RULE 24 WHOLESALE MULTI-PACK & MULTI-PIECE COMPLIANCE
# ==============================================================================

def test_rule_24_multipack_compliant():
    """Verifies compliant multi-pack: '4 x 50 g = 200 g' at MRP Rs. 100."""
    evals = Rule24MultiPackEvaluator.evaluate(
        piece_count=4,
        piece_magnitude=50.0,
        piece_unit="g",
        total_magnitude=200.0,
        total_unit="g",
        mrp_amount=100.0,
        declared_usp=25.0,  # Rs. 25 / piece
    )
    assert len(evals) == 3
    assert all(e["status"] == "PASS" for e in evals)
    assert evals[0]["rule_code"] == "RULE_24_PIECE_COUNT"
    assert evals[1]["rule_code"] == "RULE_24_PIECE_QUANTITY"
    assert evals[2]["rule_code"] == "RULE_24_TOTAL_QUANTITY_ARITHMETIC"


def test_rule_24_multipack_quantity_mismatch():
    """Verifies detection of multi-pack quantity arithmetic discrepancy."""
    # 4 pieces of 50g declared as total 250g (expected 200g) -> FAIL
    evals = Rule24MultiPackEvaluator.evaluate(
        piece_count=4,
        piece_magnitude=50.0,
        piece_unit="g",
        total_magnitude=250.0,
        total_unit="g",
    )
    arithmetic_eval = next(e for e in evals if e["rule_code"] == "RULE_24_TOTAL_QUANTITY_ARITHMETIC")
    assert arithmetic_eval["status"] == "FAIL"
    assert "Declared total 250.0 != expected 200.00" in arithmetic_eval["discrepancy"]


def test_rule_24_multipack_missing_piece_count_or_quantity():
    """Verifies detection of missing piece count or individual piece quantity under Rule 24."""
    # Missing piece count
    evals1 = Rule24MultiPackEvaluator.evaluate(
        piece_count=None,
        piece_magnitude=50.0,
        piece_unit="g",
        total_magnitude=200.0,
    )
    count_eval = next(e for e in evals1 if e["rule_code"] == "RULE_24_PIECE_COUNT")
    assert count_eval["status"] == "FAIL"

    # Missing piece magnitude
    evals2 = Rule24MultiPackEvaluator.evaluate(
        piece_count=4,
        piece_magnitude=None,
        piece_unit=None,
        total_magnitude=200.0,
    )
    qty_eval = next(e for e in evals2 if e["rule_code"] == "RULE_24_PIECE_QUANTITY")
    assert qty_eval["status"] == "FAIL"


def test_rule_24_multipack_usp_per_piece():
    """Verifies multi-pack USP evaluated per individual piece."""
    # 10 sachets x 2 g = 20 g, MRP Rs. 20, declared USP Rs. 2.00 / piece
    res = USPEvaluator.evaluate(
        net_qty=20.0,
        mrp=20.0,
        declared_usp=2.0,
        piece_count=10,
    )
    assert res["status"] == "PASS"
    assert res["discrepancy"] == 0.0


# ==============================================================================
# 3. JAN VISHWAS 2023 DECRIMINALIZATION & STATUTORY COMPOUNDING CALCULATOR
# ==============================================================================

def test_jan_vishwas_first_offense_statutory_improvement_notice():
    """Verifies that first-time technical defaults receive a 14-day Statutory Improvement Notice."""
    evaluations = [
        {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "status": "FAIL",
            "severity": "CRITICAL",
            "required_value": ">= 2.50 mm",
            "measured_value": "1.80 mm",
            "discrepancy": "0.70 mm deficit",
            "legal_consequence": "Non-compliant under Section 36(1) LM Act 2009",
        }
    ]
    sanction = JanVishwasCompoundingCalculator.calculate_sanction(
        overall_verdict="FAIL",
        evaluations=evaluations,
        offense_history="FIRST",
    )
    assert sanction["recommended_action"] == "STATUTORY_IMPROVEMENT_NOTICE"
    assert sanction["statutory_cure_period_days"] == 14
    assert sanction["max_compounding_fee_inr"] == 0
    assert "Section 36(1) proviso" in sanction["legal_summary"]
    assert "Jan Vishwas Act, 2023" in sanction["statutory_framework"]


def test_jan_vishwas_first_offense_prohibited_units_compounding():
    """Verifies that non-curable prohibited unit violations (Section 11) trigger compounding up to Rs. 25,000."""
    evaluations = [
        {
            "rule_code": "RULE_06_1_F_NET_QUANTITY",
            "statutory_reference": "Rule 6(1)(f) read with Section 11 LM Act 2009",
            "status": "FAIL",
            "severity": "CRITICAL",
            "required_value": "Strict standard SI unit",
            "measured_value": "500 gms",
            "discrepancy": "Prohibited non-standard unit 'gms' under Section 11 / Rule 12",
            "legal_consequence": "Section 11 / Section 36(1) LM Act 2009",
        }
    ]
    sanction = JanVishwasCompoundingCalculator.calculate_sanction(
        overall_verdict="FAIL",
        evaluations=evaluations,
        offense_history="FIRST",
    )
    assert sanction["recommended_action"] == "COMPOUNDING_FIRST_OFFENSE"
    assert sanction["max_compounding_fee_inr"] == 25000
    assert sanction["statutory_cure_period_days"] == 0
    assert "Section 48" in sanction["legal_summary"]


def test_jan_vishwas_second_and_subsequent_offenses_compounding():
    """Verifies second and subsequent offense compounding tiers (Rs. 50,000 and Rs. 1,00,000 with imprisonment repealed)."""
    evaluations = [
        {"rule_code": "RULE_06_1_E_MRP", "status": "FAIL", "discrepancy": "Missing tax clause"}
    ]

    # Second offense: up to Rs. 50,000
    sanction_second = JanVishwasCompoundingCalculator.calculate_sanction(
        overall_verdict="FAIL",
        evaluations=evaluations,
        offense_history="SECOND",
    )
    assert sanction_second["recommended_action"] == "COMPOUNDING_SECOND_OFFENSE"
    assert sanction_second["max_compounding_fee_inr"] == 50000

    # Subsequent offense: up to Rs. 1,00,000 (imprisonment repealed)
    sanction_subsequent = JanVishwasCompoundingCalculator.calculate_sanction(
        overall_verdict="FAIL",
        evaluations=evaluations,
        offense_history="SUBSEQUENT",
    )
    assert sanction_subsequent["recommended_action"] == "COMPOUNDING_SUBSEQUENT_OFFENSE"
    assert sanction_subsequent["max_compounding_fee_inr"] == 100000
    assert "criminal imprisonment repealed" in sanction_subsequent["decriminalization_status"].lower()


def test_jan_vishwas_pass_review_and_unable_to_verify_actions():
    """Verifies sanction calculation for PASS, REVIEW, and UNABLE_TO_VERIFY states."""
    # PASS
    s_pass = JanVishwasCompoundingCalculator.calculate_sanction("PASS", [])
    assert s_pass["recommended_action"] == "NO_ACTION"
    assert s_pass["max_compounding_fee_inr"] == 0

    # REVIEW
    s_review = JanVishwasCompoundingCalculator.calculate_sanction("REVIEW", [])
    assert s_review["recommended_action"] == "OFFICER_REVIEW"
    assert "natural justice" in s_review["legal_summary"].lower()

    # UNABLE_TO_VERIFY
    s_unverifiable = JanVishwasCompoundingCalculator.calculate_sanction("UNABLE_TO_VERIFY", [])
    assert s_unverifiable["recommended_action"] == "RETAKE_OR_PHYSICAL_INSPECTION"


# ==============================================================================
# 4. COURTROOM-ADMISSIBLE AST INTEGRATION & PYDANTIC DTO CONFORMANCE
# ==============================================================================

def test_full_inspection_with_multipack_and_jan_vishwas_dto_compliance():
    """Verifies complete inspection pipeline with multi-pack and Jan Vishwas compounding producing 100% Pydantic compliant output."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_courtroom_multipack_01",
        pdp_area_cm2=200.0,
        font_height_mm=2.60,
        net_quantity={"magnitude": 200.0, "unit": "g"},
        mrp={"amount": 100.0, "tax_inclusive": True},
        declared_usp=25.0,  # Rs. 25 per piece
        manufacturer={"name": "Himalayan Foods Pvt Ltd", "address_line": "Plot 12, Industrial Area, Haridwar, Uttarakhand 249401"},
        consumer_care={"has_phone": True, "has_email": True, "has_address": True, "has_contact_name": True},
        country_of_origin="India",
        mfg_date_iso="2024-03-15",
        multipack_details={
            "piece_count": 4,
            "piece_magnitude": 50.0,
            "piece_unit": "g",
            "total_magnitude": 200.0,
            "total_unit": "g",
        },
        offense_history="FIRST",
    )

    assert result["overall_verdict"] == "PASS"
    assert "jan_vishwas_sanction" in result
    assert result["jan_vishwas_sanction"]["recommended_action"] == "NO_ACTION"

    # Strict conformance to frozen ComplianceVerdictResult contract
    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "PASS"
    assert dto.adjudication_required is True
    assert len(dto.evaluations) >= 8
    for ev in dto.evaluations:
        assert isinstance(ev, RuleEvaluationDTO)
        assert ev.status in ("PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY")


def test_full_inspection_improvement_notice_on_font_deficit():
    """Verifies that a font deficit triggers FAIL with Form-1 Statutory Improvement Notice recommendation."""
    result = LegalMetrologyRuleEngine.evaluate_inspection(
        inspection_id="insp_font_deficit_02",
        pdp_area_cm2=120.0,
        font_height_mm=1.80,  # Required: 2.50 mm (deficit 0.70 mm)
        net_quantity={"magnitude": 250.0, "unit": "g"},
        mrp={"amount": 120.0, "tax_inclusive": True},
        declared_usp=0.48,
        manufacturer={"name": "Good Life FMCG", "address_line": "Mumbai 400001"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        mfg_date_iso="2024-01-01",
        offense_history="FIRST",
    )

    assert result["overall_verdict"] == "FAIL"
    assert result["jan_vishwas_sanction"]["recommended_action"] == "STATUTORY_IMPROVEMENT_NOTICE"
    assert result["jan_vishwas_sanction"]["statutory_cure_period_days"] == 14

    dto = ComplianceVerdictResult(**result)
    assert dto.overall_verdict == "FAIL"
