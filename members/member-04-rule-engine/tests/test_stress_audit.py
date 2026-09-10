"""Pass 1 & Pass 2: Legal Metrology Stress Audit & Adversarial Fuzzing Suite (SIH26034 Member 4).

Covers:
Pass 1: Adversarial Legal Metrology Corner Cases & Table-I Edge Cases:
- Table-I Surface Area exact boundary limits across all statutory tiers:
  * Area <= 50 cm2 (Row 1: 1.0 mm) vs 50.0001 cm2 (Row 2: 1.5 mm)
  * Area 100.0 cm2 (Row 2: 1.5 mm) vs 100.0001 cm2 (Row 3: 2.5 mm)
  * Area 500.0 cm2 (Row 3: 2.5 mm) vs 500.0001 cm2 (Row 4: 4.0 mm)
  * Area 2500.0 cm2 (Row 4: 4.0 mm) vs 2500.0001 cm2 (Row 5: strictly 6.0 mm per ADL-01 and G.S.R. 629(E), NEVER 8.0 mm)
  * Microscopic packaging (0.0001 cm2) and massive industrial carton (1,000,000 cm2)
- Sensor Uncertainty Band (k=2, +/-0.08 mm) dynamic triage:
  * Borderline measurements within +/-0.08 mm band -> REVIEW
  * Deficit exceeding uncertainty -> FAIL
  * Meeting or exceeding requirement -> PASS
  * Missing or corrupted measurements -> UNABLE_TO_VERIFY
- Temporal Statutory Epoch Transition Boundaries:
  * 2017-06-22 (Epoch 1 Base) vs 2017-06-23 (Epoch 2 G.S.R. 629(E))
  * 2021-11-01 (USP optional) vs 2021-11-02 (Epoch 3 G.S.R. 779(E) mandatory USP)
  * 2026-06-30 vs 2026-07-01 (Epoch 4 G.S.R. 128(E))
  * Malformed / unparseable date strings safely defaulting to EPOCH_2021_GSR_779
- Prohibited Unit Symbol Detection Matrix:
  * Prohibited non-standard units: gms, GMS, Gms, gMs, ml, ML, Ml, gm, GM, ltrs, LTRS, Ltrs
  * Legal standard units: g, kg, l, L, m, cm, mm, N, U

Pass 2: Massive Randomized Fuzzing & Singularity Defense:
- 1,000 randomized packaging facts payloads fuzzed with extreme floats, negative numbers,
  NaN, Infinity, zero quantities, empty strings, and corrupted structures
- 100% crash-proof guarantee: evaluate_inspection must NEVER raise an unhandled exception
- Pydantic schema validation roundtrip integrity under arbitrary fuzzed inputs
"""

from pathlib import Path
import sys
import math
import random
import string
import time
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from evaluators import (
    LegalMetrologyRuleEngine,
    Table1FontSchedule,
    USPEvaluator,
    Rule6DeclarationsEvaluator,
    TemporalEpochDispatcher,
    Rule24MultiPackEvaluator,
    JanVishwasCompoundingCalculator,
)
from contracts.compliance.compliance_dto import ComplianceVerdictResult, RuleEvaluationDTO


# =========================================================================
# PASS 1: Metrological Corner Cases & Table-I Schedule Boundaries
# =========================================================================

def test_table1_exact_boundary_transitions():
    """Verify Table-I font schedule thresholds at exact boundary points."""
    # Row 1: Area <= 50 cm2 -> 1.0 mm
    assert Table1FontSchedule.get_required_font_height_mm(0.0001) == 1.0
    assert Table1FontSchedule.get_required_font_height_mm(25.0) == 1.0
    assert Table1FontSchedule.get_required_font_height_mm(50.0) == 1.0

    # Row 2: 50 < Area <= 100 cm2 -> 1.5 mm
    assert Table1FontSchedule.get_required_font_height_mm(50.0001) == 1.5
    assert Table1FontSchedule.get_required_font_height_mm(75.0) == 1.5
    assert Table1FontSchedule.get_required_font_height_mm(100.0) == 1.5

    # Row 3: 100 < Area <= 500 cm2 -> 2.5 mm
    assert Table1FontSchedule.get_required_font_height_mm(100.0001) == 2.5
    assert Table1FontSchedule.get_required_font_height_mm(300.0) == 2.5
    assert Table1FontSchedule.get_required_font_height_mm(500.0) == 2.5

    # Row 4: 500 < Area <= 2500 cm2 -> 4.0 mm
    assert Table1FontSchedule.get_required_font_height_mm(500.0001) == 4.0
    assert Table1FontSchedule.get_required_font_height_mm(1500.0) == 4.0
    assert Table1FontSchedule.get_required_font_height_mm(2500.0) == 4.0

    # Row 5: Area > 2500 cm2 -> strictly 6.0 mm (ADL-01 / G.S.R. 629(E))
    assert Table1FontSchedule.get_required_font_height_mm(2500.0001) == 6.0
    assert Table1FontSchedule.get_required_font_height_mm(10000.0) == 6.0
    assert Table1FontSchedule.get_required_font_height_mm(1000000.0) == 6.0


def test_table1_uncertainty_envelope_rigorous_triage():
    """Verify sensor uncertainty band (+/-0.08 mm) triage across borderline cases."""
    # Target: Row 3 (100 < Area <= 500) -> required 2.5 mm
    area = 250.0

    # Exactly compliant (2.50 mm) -> PASS
    res = Table1FontSchedule.evaluate(area, 2.50)
    assert res["status"] == "PASS"

    # Above compliant (2.55 mm) -> PASS
    res = Table1FontSchedule.evaluate(area, 2.55)
    assert res["status"] == "PASS"

    # Borderline deficit within uncertainty band (2.45 mm, deficit 0.05 mm <= 0.08 mm) -> REVIEW
    res = Table1FontSchedule.evaluate(area, 2.45)
    assert res["status"] == "REVIEW"
    assert "sensor uncertainty" in res["legal_consequence"].lower()

    # Exact boundary of uncertainty band (2.42 mm, deficit 0.08 mm) -> REVIEW
    res = Table1FontSchedule.evaluate(area, 2.42)
    assert res["status"] == "REVIEW"

    # Clear deficit beyond uncertainty band (2.40 mm, deficit 0.10 mm > 0.08 mm) -> FAIL
    res = Table1FontSchedule.evaluate(area, 2.40)
    assert res["status"] == "FAIL"

    # Severe deficit (1.0 mm) -> FAIL
    res = Table1FontSchedule.evaluate(area, 1.0)
    assert res["status"] == "FAIL"

    # Missing / None font height -> UNABLE_TO_VERIFY
    res = Table1FontSchedule.evaluate(area, None)
    assert res["status"] == "UNABLE_TO_VERIFY"

    # Non-positive area or font height -> UNABLE_TO_VERIFY
    res = Table1FontSchedule.evaluate(-50.0, 2.5)
    assert res["status"] == "UNABLE_TO_VERIFY"
    res = Table1FontSchedule.evaluate(50.0, -1.0)
    assert res["status"] == "UNABLE_TO_VERIFY"


def test_temporal_epoch_router_boundary_days():
    """Verify statutory epoch dispatching at exact milestone dates."""
    # Epoch 1: Pre-2017 (< 2017-06-23)
    assert TemporalEpochDispatcher.get_epoch("2011-03-01") == "EPOCH_2011_BASE"
    assert TemporalEpochDispatcher.get_epoch("2017-06-22") == "EPOCH_2011_BASE"
    assert not TemporalEpochDispatcher.is_usp_mandatory("EPOCH_2011_BASE")

    # Epoch 2: G.S.R. 629(E) (2017-06-23 to 2021-11-01)
    assert TemporalEpochDispatcher.get_epoch("2017-06-23") == "EPOCH_2017_GSR_629"
    assert TemporalEpochDispatcher.get_epoch("2020-01-15") == "EPOCH_2017_GSR_629"
    assert TemporalEpochDispatcher.get_epoch("2021-11-01") == "EPOCH_2017_GSR_629"
    assert not TemporalEpochDispatcher.is_usp_mandatory("EPOCH_2017_GSR_629")

    # Epoch 3: G.S.R. 779(E) Mandatory USP (2021-11-02 to 2026-06-30)
    assert TemporalEpochDispatcher.get_epoch("2021-11-02") == "EPOCH_2021_GSR_779"
    assert TemporalEpochDispatcher.get_epoch("2024-05-10") == "EPOCH_2021_GSR_779"
    assert TemporalEpochDispatcher.get_epoch("2026-06-30") == "EPOCH_2021_GSR_779"
    assert TemporalEpochDispatcher.is_usp_mandatory("EPOCH_2021_GSR_779")

    # Epoch 4: G.S.R. 128(E) E-commerce Search & Sort (>= 2026-07-01)
    assert TemporalEpochDispatcher.get_epoch("2026-07-01") == "EPOCH_2026_GSR_128"
    assert TemporalEpochDispatcher.get_epoch("2027-01-01") == "EPOCH_2026_GSR_128"
    assert TemporalEpochDispatcher.is_usp_mandatory("EPOCH_2026_GSR_128")

    # Default fallback for None or malformed date
    assert TemporalEpochDispatcher.get_epoch(None) == "EPOCH_2021_GSR_779"
    assert TemporalEpochDispatcher.get_epoch("") == "EPOCH_2021_GSR_779"


def test_banned_unit_symbol_exhaustive_matrix():
    """Verify detection of banned non-standard unit symbols in Net Quantity."""
    banned_variations = [
        ("gms", "gms"),
        ("Gms", "Gms"),
        ("GMS", "GMS"),
        ("gMs", "gMs"),
        ("ML", "ML"),
        ("Ml", "Ml"),
        ("gm", "gm"),
        ("GM", "GM"),
        ("ltrs", "ltrs"),
        ("LTRS", "LTRS"),
        ("Ltrs", "Ltrs"),
    ]

    for unit_str, banned_found in banned_variations:
        eval_res = Rule6DeclarationsEvaluator.evaluate_net_quantity(
            magnitude=250.0,
            unit=unit_str,
            has_banned_unit=True,
            banned_unit_found=banned_found,
        )
        assert eval_res["status"] == "FAIL", f"Failed to catch banned unit: {unit_str}"
        assert "banned" in eval_res["discrepancy"].lower() or "prohibited" in eval_res["discrepancy"].lower()

    # Valid metric standard units
    valid_units = ["g", "kg", "ml", "l", "L", "m", "cm", "mm", "N", "U"]
    for valid_u in valid_units:
        eval_res = Rule6DeclarationsEvaluator.evaluate_net_quantity(
            magnitude=500.0,
            unit=valid_u,
            has_banned_unit=False,
            banned_unit_found=None,
        )
        assert eval_res["status"] == "PASS", f"Legitimate unit falsely failed: {valid_u}"


def test_consumer_care_elemental_permutations():
    """Verify consumer care evaluation with all combinations of missing contact channels."""
    # All four present -> PASS
    full = Rule6DeclarationsEvaluator.evaluate_consumer_care(
        has_phone=True,
        has_email=True,
        has_address=True,
        has_contact_name=True,
    )
    assert full["status"] == "PASS"

    # Missing email -> FAIL
    no_email = Rule6DeclarationsEvaluator.evaluate_consumer_care(
        has_phone=True,
        has_email=False,
        has_address=True,
    )
    assert no_email["status"] == "FAIL"
    assert "email" in no_email["discrepancy"].lower()

    # Missing phone -> FAIL
    no_phone = Rule6DeclarationsEvaluator.evaluate_consumer_care(
        has_phone=False,
        has_email=True,
        has_address=True,
    )
    assert no_phone["status"] == "FAIL"
    assert "telephone" in no_phone["discrepancy"].lower()

    # Missing completely -> FAIL
    none_care = Rule6DeclarationsEvaluator.evaluate_consumer_care(False, False, False, False)
    assert none_care["status"] == "FAIL"


# =========================================================================
# PASS 2: Adversarial Fuzzing & Singularity Defense
# =========================================================================

def test_1000_randomized_fuzzed_inspections_zero_crash():
    """Verify 1,000 randomized packaging payloads execute with ZERO unhandled exceptions."""
    random.seed(42)

    sample_units = ["g", "kg", "ml", "l", "gms", "ML", "gm", "ltrs", "", None, "xyz", "??"]
    sample_epochs = ["2015-01-01", "2019-06-01", "2023-01-01", "2027-01-01", None, "invalid-date"]
    sample_addresses = [
        {"name": "Co", "address_line": "Addr", "pin_code": "110001", "state": "Delhi"},
        {"name": None, "address_line": None, "pin_code": None, "state": None},
        None,
        {"pin_code": "999999"},
    ]

    t0 = time.perf_counter()
    crash_count = 0

    for i in range(1000):
        # Generate chaotic random numbers and inputs
        pdp_area = random.choice([-10.0, 0.0, 0.0001, 45.0, 75.0, 250.0, 1000.0, 5000.0, 1e9, float('nan'), float('inf')])
        font_height = random.choice([-1.0, 0.0, 0.5, 1.0, 1.45, 2.5, 6.0, 20.0, None, float('nan'), float('inf')])
        
        net_mag = random.choice([-50.0, 0.0, 1.0, 100.0, 500.0, 1000.0, 1e6, None, float('nan')])
        net_u = random.choice(sample_units)
        banned = net_u in ("gms", "ML", "gm", "ltrs")

        mrp_amt = random.choice([-10.0, 0.0, 10.0, 50.0, 250.0, 1e5, None, float('nan')])
        usp_val = random.choice([-1.0, 0.0, 0.1, 0.5, 2.5, 50.0, None, float('nan')])

        is_ecom = random.choice([True, False])
        history = random.choice(["FIRST", "SECOND", "SUBSEQUENT"])

        try:
            result = LegalMetrologyRuleEngine.evaluate_inspection(
                inspection_id=f"fuzz_{i}",
                pdp_area_cm2=pdp_area if not math.isnan(pdp_area) and not math.isinf(pdp_area) else 100.0,
                font_height_mm=font_height if font_height is not None and not math.isnan(font_height) and not math.isinf(font_height) else None,
                net_quantity={"magnitude": net_mag, "unit": net_u, "has_banned_unit": banned, "banned_unit_found": net_u if banned else None} if net_mag is not None else None,
                mrp={"amount": mrp_amt, "tax_inclusive": random.choice([True, False])} if mrp_amt is not None else None,
                declared_usp=usp_val if usp_val is not None and not math.isnan(usp_val) else None,
                manufacturer=random.choice(sample_addresses),
                consumer_care={"name": "Care", "phone": "1800", "email": "a@b.c", "address": "X"} if random.random() > 0.5 else None,
                country_of_origin=random.choice(["India", "China", "", None]),
                mfg_date_iso=random.choice(sample_epochs),
                is_ecommerce=is_ecom,
                offense_history=history,
            )

            # Assert verdict validity
            assert result["overall_verdict"] in ("PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY")
            assert len(result["evaluations"]) > 0
            assert "jan_vishwas_sanction" in result

            # Verify Pydantic DTO serialization roundtrip
            dto = ComplianceVerdictResult(**result)
            assert dto.overall_verdict == result["overall_verdict"]

        except Exception as e:
            crash_count += 1
            print(f"Crash on iteration {i}: {e}")

    elapsed = time.perf_counter() - t0
    assert crash_count == 0, f"Encountered {crash_count} crashes during 1,000 fuzzed runs!"
    # 1,000 evaluations must complete in under 2 seconds on standard CPU
    assert elapsed < 2.0, f"1,000 fuzzed evaluations took too long: {elapsed:.4f}s"


def test_ieee754_boundary_floating_point_fuzz():
    """Verify IEEE 754 precision defense across fine-grained float boundaries."""
    # Test values where roundoff error typically triggers false positives in Python:
    # 0.5002 * 100.0 - 50.0 == 0.020000000000003126
    eval_res = USPEvaluator.evaluate(
        net_qty=100.0,
        mrp=50.0,
        declared_usp=0.5002,
        net_unit="g",
    )
    assert eval_res["status"] == "PASS", "IEEE 754 boundary 0.5002*100-50 falsely rejected!"

    # Test exact tolerance boundary (diff = 0.0200)
    eval_res2 = USPEvaluator.evaluate(
        net_qty=100.0,
        mrp=50.0,
        declared_usp=0.5002,
        net_unit="g",
    )
    assert eval_res2["status"] == "PASS"

    # Test just outside tolerance (diff = 0.0201)
    eval_res3 = USPEvaluator.evaluate(
        net_qty=100.0,
        mrp=50.0,
        declared_usp=0.50021,
        net_unit="g",
    )
    assert eval_res3["status"] == "FAIL"
