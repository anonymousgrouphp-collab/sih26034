"""Integration test suite for Temporary Test UI & Golden Demo Endpoints.
Verifies Parmarth Kumar's temporary testing HUD integration on feat/m2-parmarth-test-ui.
"""

from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
TEST_UI_DIR = REPO_ROOT / "integration" / "test_ui"

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(TEST_UI_DIR) not in sys.path:
    sys.path.insert(0, str(TEST_UI_DIR))

# Import test UI server which mounts all routes onto backend app
import test_ui_server

client = TestClient(test_ui_server.app)


def test_serve_test_ui_html():
    """Verify GET /test-ui serves index.html with 200 OK and expected headers."""
    resp = client.get("/test-ui")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "NyayaDrishti-LM" in resp.text
    assert "Field Inspection & Testing HUD" in resp.text
    assert "Golden Demonstration SKUs" in resp.text


def test_root_redirect_to_test_ui():
    """Verify GET / redirects to /test-ui."""
    resp = client.get("/", follow_redirects=False)
    assert resp.status_code in [302, 307]
    assert resp.headers["location"] == "/test-ui"


def test_list_golden_demonstration_skus():
    """Verify GET /api/v1/demo/skus lists all 6 golden SKUs."""
    resp = client.get("/api/v1/demo/skus")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["count"] >= 5
    sku_ids = [s["sku_id"] for s in data["skus"]]
    assert "SKU-DEMO-01" in sku_ids
    assert "SKU-DEMO-02" in sku_ids
    assert "SKU-DEMO-03" in sku_ids


def test_run_golden_sku_01_biscuit_carton_fail():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-01/run executes pipeline and flags Table-I deficit."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-01/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-01"
    assert data["overall_status"] == "FAIL"
    assert len(data["merkle_root"]) == 64
    assert data["pdp_area_cm2"] == 144.0
    assert data["font_height_mm"] == 1.84

    # Verify rule evaluations exist
    evals = data["rule_evaluations"]
    assert any(e["status"] == "FAIL" for e in evals)
    # Verify banned unit was evaluated
    assert any("PROHIBITED_UNITS" in e.get("rule_code", "") for e in evals)


def test_run_golden_sku_03_bottled_water_pass():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-03/run returns PASS for compliant SKU."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-03/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-03"
    assert data["overall_status"] == "PASS"


def test_run_golden_sku_02_curry_pouch_usp_mismatch():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-02/run flags USP mismatch and missing consumer email."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-02/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-02"
    assert data["overall_status"] == "FAIL"
    evals = data["rule_evaluations"]
    assert any("USP" in e.get("rule_code", "") and e["status"] == "FAIL" for e in evals)
    assert any("CONSUMER_CARE" in e.get("rule_code", "") for e in evals)


def test_run_golden_sku_04_soap_box_borderline_review():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-04/run returns REVIEW for borderline measurement."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-04/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-04"
    assert data["overall_status"] == "REVIEW"
    assert any(b.get("recognized_script") == "DEVANAGARI" for b in data.get("bounding_boxes", []))


def test_run_golden_sku_05_chips_glare_unable_to_verify():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-05/run returns UNABLE_TO_VERIFY due to glare."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-05/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-05"
    assert data["overall_status"] == "UNABLE_TO_VERIFY"
    assert data["quality_gate"]["passed"] is False
    assert len(data.get("bounding_boxes", [])) == 0


def test_run_golden_sku_06_ecom_listing_fail():
    """Verify POST /api/v1/demo/skus/SKU-DEMO-06/run flags missing Country of Origin under Rule 6(10)."""
    resp = client.post("/api/v1/demo/skus/SKU-DEMO-06/run")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["sku_id"] == "SKU-DEMO-06"
    assert data["overall_status"] == "FAIL"
    evals = data["rule_evaluations"]
    assert any("RULE_06_10_ECOMM_MANDATORY_DECLARATIONS" in e.get("rule_code", "") for e in evals)
    assert any("RULE_06_10_MFG_DATE_EXEMPTION" in e.get("rule_code", "") for e in evals)


def test_golden_sku_not_found():
    """Verify 404 response for invalid SKU ID."""
    resp = client.post("/api/v1/demo/skus/SKU-NON-EXISTENT/run")
    assert resp.status_code == 404
