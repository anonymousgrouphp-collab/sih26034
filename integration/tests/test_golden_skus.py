"""Integration Verification of Golden Demonstration SKUs (SKU-DEMO-01 to SKU-DEMO-06)
Frozen per 12_DEMO_PLAN.md and 11_TESTING_AND_VALIDATION_PLAN.md
"""

import json
from pathlib import Path
import sys
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from integration.adapters.pipeline_adapter import CentralPipelineAdapter

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_sku_demo_01_biscuit_carton_font_deficit_and_banned_unit():
    with open(FIXTURES_DIR / "sku_demo_01_biscuit_carton.json") as f:
        data = json.load(f)

    # 1. Quality Gate passes
    qg = CentralPipelineAdapter.execute_quality_gate(
        blur=data["quality_gate"]["blur_variance"],
        glare=data["quality_gate"]["glare_percentage"],
        tilt=data["quality_gate"]["skew_angle_deg"]
    )
    assert qg["is_valid"] is True

    # 2. Rule evaluation flags Table-I deficit
    evals = CentralPipelineAdapter.execute_rule_checks(
        pdp_area_cm2=data["pdp_area_cm2"],
        font_height_mm=data["extracted_entities"]["measured_font_height_mm"],
        net_qty=data["extracted_entities"]["net_quantity"]["magnitude"],
        mrp=data["extracted_entities"]["mrp"]["amount"]
    )
    font_eval = evals[0]
    assert font_eval["status"] == "FAIL"
    assert font_eval["required_mm"] == 2.50
    assert font_eval["deficit_mm"] < 0

    # 3. Banned unit flag present
    assert data["extracted_entities"]["net_quantity"]["has_banned_unit"] is True
    assert data["extracted_entities"]["net_quantity"]["banned_unit_found"] == "gms"


def test_sku_demo_02_curry_pouch_usp_mismatch():
    with open(FIXTURES_DIR / "sku_demo_02_curry_pouch.json") as f:
        data = json.load(f)

    evals = CentralPipelineAdapter.execute_rule_checks(
        pdp_area_cm2=data["pdp_area_cm2"],
        font_height_mm=data["extracted_entities"]["measured_font_height_mm"],
        net_qty=data["extracted_entities"]["net_quantity"]["magnitude"],
        mrp=data["extracted_entities"]["mrp"]["amount"],
        declared_usp=data["extracted_entities"]["declared_usp"]
    )
    usp_eval = next(e for e in evals if "USP" in e["rule_code"])
    assert usp_eval["status"] == "FAIL"
    assert usp_eval["discrepancy"] > 0.02


def test_sku_demo_03_bottled_water_fully_compliant():
    with open(FIXTURES_DIR / "sku_demo_03_bottled_water.json") as f:
        data = json.load(f)

    evals = CentralPipelineAdapter.execute_rule_checks(
        pdp_area_cm2=data["pdp_area_cm2"],
        font_height_mm=data["extracted_entities"]["measured_font_height_mm"],
        net_qty=data["extracted_entities"]["net_quantity"]["magnitude"],
        mrp=data["extracted_entities"]["mrp"]["amount"],
        declared_usp=data["extracted_entities"]["declared_usp"]
    )
    for e in evals:
        assert e["status"] == "PASS"


def test_sku_demo_04_soap_box_borderline_review():
    with open(FIXTURES_DIR / "sku_demo_04_soap_box_borderline.json") as f:
        data = json.load(f)

    evals = CentralPipelineAdapter.execute_rule_checks(
        pdp_area_cm2=data["pdp_area_cm2"],
        font_height_mm=data["extracted_entities"]["measured_font_height_mm"],
        net_qty=data["extracted_entities"]["net_quantity"]["magnitude"],
        mrp=data["extracted_entities"]["mrp"]["amount"]
    )
    font_eval = evals[0]
    assert font_eval["status"] == "REVIEW"


def test_sku_demo_05_chips_pouch_glare_rejection():
    with open(FIXTURES_DIR / "sku_demo_05_chips_pouch_glare.json") as f:
        data = json.load(f)

    qg = CentralPipelineAdapter.execute_quality_gate(
        blur=data["quality_gate"]["blur_variance"],
        glare=data["quality_gate"]["glare_percentage"],
        tilt=data["quality_gate"]["skew_angle_deg"]
    )
    assert qg["is_valid"] is False
    assert "SPECULAR_GLARE" in qg["rejection_reason"]


def test_merkle_provenance_integration():
    stage_payloads = [
        {"stage": "RAW", "hash": "a" * 64},
        {"stage": "CALIB", "scale": 12.0},
        {"stage": "RULES", "verdict": "FAIL"}
    ]
    root = CentralPipelineAdapter.build_evidence_merkle_root(stage_payloads)
    assert len(root) == 64
