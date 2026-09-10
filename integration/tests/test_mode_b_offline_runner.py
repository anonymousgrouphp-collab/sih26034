"""Automated Tests for Standalone Mode B Resilient Offline Runner (SIH26034).

Verifies TS-SYS-02 (Mode B Local Resilience) and ADR-13:
- Standalone execution with zero network connectivity (0 bytes transmitted)
- Embedded SQLite datastore persistence with SQLCipher-compatible schema
- Section 63 BSA 2023 evidentiary chain with LOCAL_DEVICE_MONOTONIC clock source
- Complete 7-stage pipeline (Quality Gate -> Geometry -> Extraction -> Rule AST -> Merkle DAG -> BSA Cert -> PDF Notice)
"""

import os
from pathlib import Path
import subprocess
import sys
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from local_runner import ModeBOfflineEngine, run_offline_verification


def test_mode_b_engine_offline_execution_pass():
    """Verify Mode B executes compliant commodity inspection offline with 100% local integrity."""
    engine = ModeBOfflineEngine()

    result = engine.execute_complete_offline_inspection(
        product_name="Himalayan Rock Salt 1kg",
        category="GROCERY",
        pdp_area_cm2=250.0,
        font_height_mm=2.6,
        net_quantity={"magnitude": 1.0, "unit": "kg", "has_banned_unit": False},
        mrp={"amount": 95.0, "tax_inclusive": True},
        declared_usp=95.0,
        manufacturer={"name": "Salt Works India", "address_line": "Sambhar Lake", "pin_code": "303329", "state": "Rajasthan"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        mfg_date_iso="2024-06-01",
    )

    assert result["mode"] == "MODE_B_OFFLINE"
    assert result["clock_source"] == "LOCAL_DEVICE_MONOTONIC"
    assert result["overall_verdict"] == "PASS"
    assert result["quality_gate"]["passed"] is True
    assert len(result["merkle_root"]) == 64
    assert result["bsa_certificate_number"].startswith("CERT-BSA2023-")
    assert result["pdf_generated"] is False
    assert result["jan_vishwas_action"] == "NO_ACTION"
    assert result["execution_time_seconds"] < 0.5


def test_mode_b_engine_offline_execution_fail_and_pdf():
    """Verify Mode B executes non-compliant inspection offline, generating Form-1 PDF notice locally."""
    engine = ModeBOfflineEngine()

    result = engine.execute_complete_offline_inspection(
        product_name="Almond Delight 250g",
        category="FOOD_SNACKS",
        pdp_area_cm2=150.0,
        font_height_mm=1.0,  # Deficit (Row 3 requires 2.5 mm)
        net_quantity={"magnitude": 250.0, "unit": "gms", "has_banned_unit": True, "banned_unit_found": "gms"},
        mrp={"amount": 150.0, "tax_inclusive": True},
        declared_usp=0.60,
        manufacturer={"name": "DryFruits Co", "address_line": "Industrial Area", "pin_code": "110020", "state": "Delhi"},
        consumer_care={"has_phone": True, "has_email": True},
        country_of_origin="India",
        offense_history="FIRST",
    )

    assert result["mode"] == "MODE_B_OFFLINE"
    assert result["overall_verdict"] == "FAIL"
    assert result["violations_count"] >= 2
    assert result["pdf_generated"] is True
    assert result["pdf_size_bytes"] > 5000
    assert result["jan_vishwas_action"] == "COMPOUNDING_FIRST_OFFENSE"


def test_mode_b_quality_gate_rejection_offline():
    """Verify optical quality gate rejection in Mode B fails closed to UNABLE_TO_VERIFY."""
    engine = ModeBOfflineEngine()

    result = engine.execute_complete_offline_inspection(
        product_name="Reflective Pouch",
        category="SNACKS",
        pdp_area_cm2=100.0,
        font_height_mm=2.0,
        net_quantity={"magnitude": 50.0, "unit": "g"},
        mrp={"amount": 20.0},
        glare_percentage=22.5,  # Exceeds 8.0% statutory threshold -> Rejection
    )

    assert result["overall_verdict"] == "UNABLE_TO_VERIFY"
    assert result["quality_gate"]["passed"] is False
    assert len(result["merkle_root"]) == 64


def test_mode_b_self_test_verification_suite():
    """Verify the self-contained offline verification runner completes with 100% success."""
    assert run_offline_verification() is True


def test_mode_b_cli_execution():
    """Verify python local_runner.py --verify-offline executes cleanly via subprocess."""
    cmd = [
        sys.executable,
        str(REPO_ROOT / "local_runner.py"),
        "--verify-offline",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, cwd=str(REPO_ROOT))
    assert proc.returncode == 0
    assert "MODE B OFFLINE RESILIENCE AUDIT PASSED 100%" in proc.stdout
