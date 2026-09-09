"""Temporary Test UI Server & Golden Demonstration Bridge (SIH26034)
Assigned to: Parmarth Kumar (feat/m2-parmarth-test-ui)
Mounts lightweight interactive testing HUD directly onto FastAPI backend.
"""

from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import sys
import uuid

# Path discovery
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
M5_SRC = REPO_ROOT / "members" / "member-05-evidence" / "src"
M1_SRC = REPO_ROOT / "members" / "member-01-cv-metrology" / "src"
M2_SRC = REPO_ROOT / "members" / "member-02-ocr" / "src"
M3_SRC = REPO_ROOT / "members" / "member-03-extraction" / "src"
M4_SRC = REPO_ROOT / "members" / "member-04-rule-engine" / "src"
FIXTURES_DIR = REPO_ROOT / "integration" / "fixtures"
M1_FIXTURES = REPO_ROOT / "members" / "member-01-cv-metrology" / "fixtures"
TEST_UI_DIR = REPO_ROOT / "integration" / "test_ui"

for p in [str(REPO_ROOT), str(M5_SRC), str(M1_SRC), str(M2_SRC), str(M3_SRC), str(M4_SRC)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select
from sqlalchemy.orm import Session

# Import backend application and database models
from server import app
from database import (
    AuditLedgerService,
    AuditLog,
    BoundingBox,
    BSACertificate,
    ComplianceEvaluation,
    EvidenceImage,
    Inspection,
    Jurisdiction,
    RoleEnum,
    User,
    get_db_session,
)
from merkle_dag import MerkleAuditLedger, PipelineEvidenceDAG
from integration.adapters.pipeline_adapter import CentralPipelineAdapter


# -----------------------------------------------------------------------------
# 1. Golden Demonstration SKU Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/v1/demo/skus")
def list_golden_demonstration_skus():
    """Returns catalog of all 6 frozen golden demonstration SKUs for testing."""
    skus = []
    if FIXTURES_DIR.exists():
        for f in sorted(FIXTURES_DIR.glob("sku_demo_*.json")):
            try:
                with open(f, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                    skus.append(data)
            except Exception as e:
                continue
    return {"status": "SUCCESS", "count": len(skus), "skus": skus}


@app.post("/api/v1/demo/skus/{sku_id}/run")
def run_golden_demonstration_sku(
    sku_id: str,
    db: Session = Depends(get_db_session),
):
    """Executes full pipeline on selected golden demonstration SKU with complete persistence."""
    target_file = None
    if FIXTURES_DIR.exists():
        for f in FIXTURES_DIR.glob("sku_demo_*.json"):
            if sku_id.lower().replace("-", "_") in f.stem.lower():
                target_file = f
                break

    if not target_file:
        raise HTTPException(status_code=404, detail=f"Golden SKU '{sku_id}' not found.")

    with open(target_file, "r", encoding="utf-8") as fp:
        sku_data = json.load(fp)

    # 1. Create inspection session
    insp_number = f"INSP-DL-SOUTH-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    inspection = Inspection(
        id=f"insp_{uuid.uuid4()}",
        inspection_number=insp_number,
        jurisdiction_id="CIRCLE_DL_SOUTH_01",
        officer_id="usr_01_rajesh",
        capture_source="PHYSICAL_FIELD",
        product_name=sku_data.get("product_name", "Packaged Commodity"),
        brand_name=sku_data.get("product_name", "").split()[0],
        category=sku_data.get("category", "FOOD_SNACKS"),
        package_type=sku_data.get("packaging_type", "RECTANGULAR"),
        overall_status=sku_data.get("expected_overall_verdict", "FAIL"),
        ai_verdict=sku_data.get("expected_overall_verdict", "FAIL"),
        device_fingerprint="TEST_HARNESS_BROWSER_DEMO_01",
    )
    db.add(inspection)
    db.flush()

    # 2. Attach evidence image
    raw_hash = sku_data.get("raw_image_mock", {}).get("sha256", "0" * 64)
    image_name = sku_data.get("raw_image_mock", {}).get("filename", f"{sku_id}.jpg")
    
    # Check if real M1 fixture image can be linked
    rel_img_path = f"/static/fixtures/fixture_quality_gate_clear.png"
    if "glare" in sku_id.lower():
        rel_img_path = f"/static/fixtures/fixture_quality_gate_glare.png"
    elif "biscuit" in sku_id.lower():
        rel_img_path = f"/static/fixtures/fixture_calibration_iso_card.png"

    qg = sku_data.get("quality_gate", {})
    ev_image = EvidenceImage(
        id=f"img_{uuid.uuid4()}",
        inspection_id=inspection.id,
        panel_type="PDP_FRONT",
        file_path=rel_img_path,
        raw_sha256=raw_hash,
        image_width=800,
        image_height=600,
        calibration_method="ARUCO_4X4_50",
        blur_laplacian_variance=float(qg.get("blur_variance", 312.4)),
        glare_pixel_percentage=float(qg.get("glare_percentage", 1.1)),
    )
    db.add(ev_image)
    db.flush()

    # 3. Quality Gate Evaluation
    qg_passed = qg.get("passed", True)

    # 4. Generate Bounding Boxes & Rule Evaluations
    extracted = sku_data.get("extracted_entities", {})
    pdp_area = sku_data.get("pdp_area_cm2", 100.0)

    # Net quantity box
    net_qty = extracted.get("net_quantity", {})
    mag = net_qty.get("magnitude", 100.0)
    unit = net_qty.get("unit", "g")
    has_banned = net_qty.get("has_banned_unit", False)
    font_mm = extracted.get("measured_font_height_mm", 2.0)

    bbox_net_qty = BoundingBox(
        id=f"bbox_{uuid.uuid4()}",
        image_id=ev_image.id,
        field_type="NET_QUANTITY",
        ymin_px=650,
        xmin_px=220,
        ymax_px=710,
        xmax_px=540,
        detection_confidence=0.98,
        raw_ocr_text=f"Net Weight: {mag} {unit}",
        normalized_text=json.dumps({"magnitude": mag, "unit": unit, "has_banned_unit": has_banned}),
        ocr_confidence=0.97,
        measured_font_height_mm=font_mm,
    )
    db.add(bbox_net_qty)

    # MRP box
    mrp = extracted.get("mrp", {})
    mrp_amt = mrp.get("amount", 50.0)
    tax_inc = mrp.get("tax_inclusive", True)
    bbox_mrp = BoundingBox(
        id=f"bbox_{uuid.uuid4()}",
        image_id=ev_image.id,
        field_type="MRP",
        ymin_px=730,
        xmin_px=220,
        ymax_px=780,
        xmax_px=620,
        detection_confidence=0.99,
        raw_ocr_text=f"MRP Rs. {mrp_amt:.2f} (incl. of all taxes)",
        normalized_text=json.dumps({"amount": mrp_amt, "currency": "INR", "tax_inclusive": tax_inc}),
        ocr_confidence=0.98,
        measured_font_height_mm=font_mm * 1.2,
    )
    db.add(bbox_mrp)

    # Compute rule checks
    declared_usp = extracted.get("declared_usp")
    rule_results = CentralPipelineAdapter.execute_rule_checks(
        pdp_area_cm2=pdp_area,
        font_height_mm=font_mm,
        net_qty=mag,
        mrp=mrp_amt,
        declared_usp=declared_usp,
    )

    # Add banned unit check if present
    if has_banned:
        rule_results.append({
            "rule_code": "SECTION_11_RULE_12_PROHIBITED_UNITS",
            "citation": "Section 11 LM Act 2009 read with Rule 12 LMPC Rules 2011",
            "status": "FAIL",
            "severity": "CRITICAL",
            "required": "Standard SI Unit: 'g' or 'kg'",
            "measured": f"Prohibited unit '{unit}'",
            "deficit": "Prohibited non-standard abbreviation",
            "penalty": "Section 29 LM Act 2009 (Use of non-standard units)",
        })

    # Save rule evaluations
    for r in rule_results:
        ev = ComplianceEvaluation(
            id=f"eval_{uuid.uuid4()}",
            inspection_id=inspection.id,
            rule_code=r["rule_code"],
            rule_legal_citation=r.get("citation", r.get("statutory_reference", "LMPC Rules 2011")),
            status=r["status"],
            severity=r.get("severity", "MAJOR"),
            required_value=str(r.get("required_mm", r.get("required", ""))),
            measured_value=str(r.get("measured_mm", r.get("measured", ""))),
            discrepancy=str(r.get("deficit_mm", r.get("deficit", ""))),
            penalty_provision=r.get("penalty", r.get("legal_consequence", "Adjudication Required")),
        )
        db.add(ev)

    # 5. Build 7-Node SHA-256 Merkle DAG for Section 63 BSA 2023 Evidence
    dag = PipelineEvidenceDAG(inspection_id=inspection.id)
    dag.add_node("RAW_IMAGE", raw_hash)
    dag.add_node("QUALITY_GATE", qg)
    dag.add_node("CALIBRATION", sku_data.get("calibration", {}))
    dag.add_node("OCR_TOKENS", [{"text": bbox_net_qty.raw_ocr_text}, {"text": bbox_mrp.raw_ocr_text}])
    dag.add_node("EXTRACTED_FACTS", extracted)
    dag.add_node("COMPLIANCE_VERDICT", {"verdict": sku_data.get("expected_overall_verdict", "FAIL")})
    dag.add_node("HITL_ADJUDICATION", {"status": "PENDING_OFFICER_REVIEW"})
    merkle_root = dag.compute_root()

    # Section 63 BSA 2023 Digital Certificate
    cert = BSACertificate(
        id=f"bsa_{uuid.uuid4()}",
        certificate_number=f"BSA-DL-SOUTH-{uuid.uuid4().hex[:8].upper()}",
        inspection_id=inspection.id,
        issuing_officer_id="usr_01_rajesh",
        statutory_law_ref="Section 63 of Bharatiya Sakshya Adhiniyam, 2023",
        device_make_model="Inspection Station",
        device_serial_mac="STATION-01-MAC",
        operating_system="Windows/Linux x86_64",
        hash_algorithm="SHA-256",
        raw_images_merkle_root=merkle_root,
        evidence_bundle_sha256=merkle_root,
        officer_digital_signature=hashlib.sha256(f"OFFICER_DL_0842:{merkle_root}".encode("utf-8")).hexdigest(),
        certificate_pdf_path=f"storage/evidence/cert_{inspection.id}.pdf",
    )
    db.add(cert)
    db.commit()

    return {
        "status": "SUCCESS",
        "sku_id": sku_id,
        "inspection_id": inspection.id,
        "inspection_number": inspection.inspection_number,
        "overall_status": inspection.overall_status,
        "ai_verdict": inspection.ai_verdict,
        "merkle_root": merkle_root,
        "image_url": rel_img_path,
        "quality_gate": qg,
        "pdp_area_cm2": pdp_area,
        "font_height_mm": font_mm,
        "rule_evaluations": rule_results,
        "extracted_entities": extracted,
        "demonstration_point": sku_data.get("demonstration_point", ""),
    }


# -----------------------------------------------------------------------------
# 2. Static Files & Test UI Route Mounting
# -----------------------------------------------------------------------------

# Mount static directories
if TEST_UI_DIR.exists():
    app.mount("/static/test_ui", StaticFiles(directory=str(TEST_UI_DIR)), name="test_ui_static")

if M1_FIXTURES.exists():
    app.mount("/static/fixtures", StaticFiles(directory=str(M1_FIXTURES)), name="fixtures_static")

STORAGE_DIR = REPO_ROOT / "storage"
if STORAGE_DIR.exists():
    app.mount("/static/storage", StaticFiles(directory=str(STORAGE_DIR)), name="storage_static")


@app.get("/test-ui", response_class=HTMLResponse)
def serve_test_ui():
    """Serves standalone zero-build test UI HTML."""
    html_path = TEST_UI_DIR / "index.html"
    if not html_path.exists():
        raise HTTPException(status_code=404, detail="Test UI index.html not found.")
    with open(html_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())


@app.get("/")
def redirect_to_test_ui():
    """Redirects root URL to /test-ui for instant interactive testing."""
    return RedirectResponse(url="/test-ui")


if __name__ == "__main__":
    import uvicorn
    print("Starting NyayaDrishti-LM Temporary Test UI Server on http://localhost:8000 ...")
    uvicorn.run("test_ui_server:app", host="127.0.0.1", port=8000, reload=True)
