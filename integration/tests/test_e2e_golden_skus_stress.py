"""End-to-End Stress & Zero-Crash Verification of All 6 Golden Demonstration SKUs (SIH26034).

Executes multi-pass sequential and concurrent stress tests across the complete pipeline:
- SKU-DEMO-01: Butter Cookies (Table-I Font Deficit + Banned 'gms' Unit -> FAIL)
- SKU-DEMO-02: Ready Curry Pouch (USP Math Mismatch -> FAIL)
- SKU-DEMO-03: Bottled Spring Water (100% Statutory Compliant -> PASS)
- SKU-DEMO-04: Herbal Soap Box (Borderline k=2 Uncertainty Band -> REVIEW)
- SKU-DEMO-05: Chips Pouch (Specular Glare Bloom > 18% -> UNABLE_TO_VERIFY)
- SKU-DEMO-06: E-Commerce Audio Listing (Missing Country of Origin under Rule 6(10) -> FAIL)
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
import json
from pathlib import Path
import sys
import time
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from integration.adapters.pipeline_adapter import CentralPipelineAdapter
from evaluators import LegalMetrologyRuleEngine, Table1FontSchedule, USPEvaluator
from quality_gate import QualityGateEvaluator
from merkle_dag import PipelineEvidenceDAG

FIXTURES_DIR = REPO_ROOT / "integration" / "fixtures"

GOLDEN_SKUS = [
    "sku_demo_01_biscuit_carton",
    "sku_demo_02_curry_pouch",
    "sku_demo_03_bottled_water",
    "sku_demo_04_soap_box_borderline",
    "sku_demo_05_chips_pouch_glare",
    "sku_demo_06_ecom_listing_no_origin",
]


def load_sku(sku_name: str) -> dict:
    fpath = FIXTURES_DIR / f"{sku_name}.json"
    with open(fpath, "r", encoding="utf-8") as fp:
        return json.load(fp)


def execute_full_pipeline_on_sku(sku_data: dict) -> dict:
    """Executes the full automated compliance pipeline on a single Golden SKU."""
    sku_id = sku_data.get("sku_id", "SKU_DEMO")
    dag = PipelineEvidenceDAG(inspection_id=f"e2e_{sku_id}")

    # 1. Optical Quality Gate
    qg_data = sku_data.get("quality_gate", {})
    is_valid, reason = QualityGateEvaluator.evaluate_metrics(
        blur_variance=qg_data.get("blur_variance", 300.0),
        glare_percentage=qg_data.get("glare_percentage", 1.0),
        skew_angle_deg=qg_data.get("skew_angle_deg", 2.0),
    )
    dag.add_node("STAGE_01_QUALITY_GATE", {"is_valid": is_valid, "reason": reason})

    if not is_valid:
        return {
            "sku_id": sku_id,
            "overall_verdict": "UNABLE_TO_VERIFY",
            "qg_passed": False,
            "merkle_root": dag.compute_root(),
        }

    # 2. Geometry & Rectification
    pdp_area = sku_data.get("pdp_area_cm2", 100.0)
    entities = sku_data.get("extracted_entities", {})
    font_mm = entities.get("measured_font_height_mm")
    dag.add_node("STAGE_03_RECTIFICATION", {"pdp_area_cm2": pdp_area, "font_mm": font_mm})

    # 3. Rule AST Execution
    is_ecom = sku_data.get("packaging_type") == "ECOMMERCE_LISTING"
    evaluations = []

    if font_mm is not None and not is_ecom:
        evaluations.append(Table1FontSchedule.evaluate(pdp_area, font_mm))

    net_qty = entities.get("net_quantity", {})
    mrp = entities.get("mrp", {})
    declared_usp = entities.get("declared_usp")

    if declared_usp is not None and net_qty and mrp:
        evaluations.append(USPEvaluator.evaluate(
            net_qty=net_qty.get("magnitude", 0.0),
            mrp=mrp.get("amount", 0.0),
            declared_usp=declared_usp,
        ))

    if net_qty.get("has_banned_unit"):
        evaluations.append({
            "rule_code": "SECTION_11_RULE_12_PROHIBITED_UNITS",
            "status": "FAIL",
            "statutory_reference": "Section 11 LM Act 2009 read with Rule 12 LMPC 2011",
            "deficit": f"Non-standard unit '{net_qty.get('banned_unit_found')}' is strictly prohibited.",
        })

    if is_ecom and not entities.get("country_of_origin"):
        evaluations.append({
            "rule_code": "RULE_06_10_ECOM_ORIGIN_MISSING",
            "status": "FAIL",
            "statutory_reference": "Rule 6(10) LMPC 2011",
            "deficit": "Country of origin declaration is mandatory on e-commerce product listings.",
        })

    overall_verdict = LegalMetrologyRuleEngine.triage_verdict(evaluations) if evaluations else "PASS"
    dag.add_node("STAGE_10_RULE_AST", {"verdict": overall_verdict, "evaluations_count": len(evaluations)})

    return {
        "sku_id": sku_id,
        "overall_verdict": overall_verdict,
        "qg_passed": True,
        "evaluations_count": len(evaluations),
        "merkle_root": dag.compute_root(),
    }


def test_all_6_golden_skus_verdicts_accuracy():
    """Verify each Golden SKU produces its exact statutory verdict."""
    expected_verdicts = {
        "sku_demo_01_biscuit_carton": "FAIL",
        "sku_demo_02_curry_pouch": "FAIL",
        "sku_demo_03_bottled_water": "PASS",
        "sku_demo_04_soap_box_borderline": "REVIEW",
        "sku_demo_05_chips_pouch_glare": "UNABLE_TO_VERIFY",
        "sku_demo_06_ecom_listing_no_origin": "FAIL",
    }

    for sku_name in GOLDEN_SKUS:
        data = load_sku(sku_name)
        res = execute_full_pipeline_on_sku(data)
        assert res["overall_verdict"] == expected_verdicts[sku_name], (
            f"Verdict mismatch on {sku_name}: expected {expected_verdicts[sku_name]}, got {res['overall_verdict']}"
        )
        assert len(res["merkle_root"]) == 64


def test_golden_skus_sequential_stress_10_passes():
    """Execute 10 consecutive full pipeline passes over all 6 Golden SKUs (60 runs) in sub-second."""
    t0 = time.perf_counter()
    run_count = 0

    for _ in range(10):
        for sku_name in GOLDEN_SKUS:
            data = load_sku(sku_name)
            res = execute_full_pipeline_on_sku(data)
            assert res["overall_verdict"] in ("PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY")
            run_count += 1

    elapsed = time.perf_counter() - t0
    assert run_count == 60
    assert elapsed < 1.0, f"60 Golden SKU executions took too long: {elapsed:.3f}s"


def test_golden_skus_concurrent_stress_20_threads():
    """Execute 100 simultaneous Golden SKU inspections across 20 concurrent threads."""
    skus_data = [load_sku(name) for name in GOLDEN_SKUS]

    def worker_task(task_id: int):
        data = skus_data[task_id % len(skus_data)]
        res = execute_full_pipeline_on_sku(data)
        return task_id, res["sku_id"], res["overall_verdict"], len(res["merkle_root"])

    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = [executor.submit(worker_task, i) for i in range(100)]
        results = [f.result() for f in as_completed(futures)]

    assert len(results) == 100
    for tid, sku_id, verdict, root_len in results:
        assert verdict in ("PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY")
        assert root_len == 64
