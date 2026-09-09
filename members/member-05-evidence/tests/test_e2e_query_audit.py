"""Comprehensive End-to-End Query & Statutory Reference Audit Test.
Verifies that all API queries, database queries, and exported documents
contain exact, legally required statutory references, section citations,
and court-admissible electronic evidence metadata.
"""

from io import BytesIO
import json
from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure src/ is importable
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from server import app
from auth import create_access_token
from database import (
    get_db_session,
    Jurisdiction,
    User,
    Inspection,
    EvidenceImage,
    ComplianceEvaluation,
    BSACertificate,
    LegalNotice,
    AuditLog,
)
from sqlalchemy import select


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def tokens():
    insp_token = create_access_token({
        "sub": "usr_01_rajesh",
        "role": "INSPECTOR",
        "officer_name": "Rajesh Sharma",
        "badge_number": "INSP-DL-0842",
        "jurisdiction_id": "CIRCLE_DL_SOUTH_01",
    })
    ctrl_token = create_access_token({
        "sub": "usr_ctrl_01",
        "role": "CONTROLLER",
        "officer_name": "Sunita Deshmukh",
        "badge_number": "CTRL-DL-0101",
        "jurisdiction_id": "CIRCLE_DL_SOUTH_01",
    })
    return {
        "inspector": {
            "Authorization": f"Bearer {insp_token}",
            "X-Request-ID": "e2e-insp-001",
            "X-Client-Version": "NyayaDrishti-Mobile/1.0.0",
            "X-Device-Fingerprint": "DEV-TAB-ACTIVE4-9988",
        },
        "controller": {
            "Authorization": f"Bearer {ctrl_token}",
            "X-Request-ID": "e2e-ctrl-001",
            "X-Client-Version": "NyayaDrishti-Web/1.0.0",
            "X-Device-Fingerprint": "DEV-CTRL-CONSOLE-001",
        },
    }


def test_e2e_query_statutory_references_and_results(client, tokens):
    """Executes a complete end-to-end inspection lifecycle and validates that
    all queries return the exact statutory references required by law.
    """
    # 1. System Health Query: Verifies Statutory Mandate & Zero Repealed Acts
    status_resp = client.get("/api/v1/system/status")
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert "Section 63 Bharatiya Sakshya Adhiniyam, 2023" in status_data["statutory_mandate"]
    assert status_data["repealed_acts_cited"] is None, "Repealed Section 65B must NEVER be cited"

    # 2. Upload Evidence Image
    valid_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"\xee" * 300
    files = {"image": ("biscuit_audit_sample.jpg", BytesIO(valid_jpeg), "image/jpeg")}
    metadata = {
        "capture_source": "PHYSICAL_FIELD",
        "product_name": "Super Digestive Biscuit 200g",
        "brand_name": "Patanjali",
        "category": "FOOD_SNACKS",
        "package_type": "RECTANGULAR",
    }
    upload_resp = client.post(
        "/api/v1/inspections/upload",
        files=files,
        data={"metadata": json.dumps(metadata)},
        headers=tokens["inspector"],
    )
    assert upload_resp.status_code == 201
    upload_data = upload_resp.json()
    insp_id = upload_data["inspection_id"]
    image_id = upload_data["image_id"]

    # 3. Pipeline Execution: Evaluates Rules & Generates Statutory Citations
    pipe_resp = client.post(f"/api/v1/pipeline/execute/{image_id}", headers=tokens["inspector"])
    assert pipe_resp.status_code == 200
    pipe_data = pipe_resp.json()
    assert pipe_data["ai_verdict"] == "FAIL"

    # Validate that Rule Citations match G.S.R. 629(E) Table-I and G.S.R. 779(E)
    rule_evals = pipe_data["rule_evaluations"]
    citations = [r["statutory_reference"] for r in rule_evals]
    assert any("Rule 6(1)(h)" in c and "Table-I" in c and "G.S.R. 629(E)" in c for c in citations), \
        "Table-I font height citation must be returned in query"
    assert any("Rule 6(1)(k)" in c and "G.S.R. 779(E)" in c for c in citations), \
        "Unit Sale Price citation must be returned in query"

    # 4. Human-in-the-Loop Adjudication
    adj_payload = {
        "adjudication_verdict": "CONFIRM_VIOLATION",
        "override_applied": False,
        "officer_remarks": "Confirmed font height deficiency on PDP area. Ready for statutory notice.",
        "action_order": "GENERATE_LEGAL_NOTICE_FORM_1",
    }
    adj_resp = client.patch(
        f"/api/v1/inspections/{insp_id}/adjudicate",
        json=adj_payload,
        headers=tokens["inspector"],
    )
    assert adj_resp.status_code == 200
    assert adj_resp.json()["final_status"] == "FAIL"

    # 5. Inspection Detail Query: Verifies All Statutory References Returned
    detail_resp = client.get(f"/api/v1/inspections/{insp_id}", headers=tokens["inspector"])
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    
    # Assert inspection fields
    assert detail_data["inspection"]["id"] == insp_id
    assert detail_data["inspection"]["overall_status"] == "FAIL"
    assert detail_data["inspection"]["jurisdiction_id"] == "CIRCLE_DL_SOUTH_01"
    
    # Assert evidence images decoupling (ADL-19)
    assert len(detail_data["evidence_images"]) > 0
    img_record = detail_data["evidence_images"][0]
    assert img_record["file_path"].startswith("uploads/"), "Must decouple BLOBs to storage"

    # Assert compliance evaluations in query
    evals = detail_data["evaluations"]
    assert len(evals) >= 2
    font_eval = next((e for e in evals if e["rule_code"] == "RULE_06_1_H_NET_QTY_FONT"), None)
    assert font_eval is not None
    assert "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)" in font_eval["statutory_reference"]
    assert font_eval["status"] == "FAIL"

    # 6. Statutory Section 48 Compounding by Controller
    compounding_payload = {
        "compounding_fee_amount": 25000.0,
        "statutory_section": "Section 48 read with Section 36(1) LM Act 2009",
        "remarks": "First offense compounding per Jan Vishwas Act 2023",
    }
    comp_resp = client.post(
        f"/api/v1/inspections/{insp_id}/compounding",
        json=compounding_payload,
        headers=tokens["controller"],
    )
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["compounding_fee_amount"] == 25000.0
    assert comp_data["adjudicating_controller"] == "Sunita Deshmukh"

    # 7. Generate Court-Ready Form-1 Notice & Section 63 BSA Certificate
    notice_req = {
        "inspection_id": insp_id,
        "recipient": {
            "type": "MANUFACTURER",
            "name": "Patanjali Foods Limited",
            "address": "Haridwar, Uttarakhand 249401",
            "email": "legal@patanjali.example.com",
        },
        "compounding_fee_amount": 25000.0,
        "reply_window_days": 15,
    }
    notice_resp = client.post("/api/v1/notices/generate", json=notice_req, headers=tokens["controller"])
    assert notice_resp.status_code == 201
    notice_data = notice_resp.json()
    
    # Assert returned statutory mandate
    assert "Section 36(1) of Legal Metrology Act, 2009" in notice_data["statutory_mandate"]
    assert "Section 63 BSA 2023" in notice_data["statutory_mandate"]
    assert "CERT-BSA2023" in notice_data["bsa_certificate_number"]
    assert len(notice_data["merkle_entry_hash"]) == 64
    notice_id = notice_data["notice_id"]

    # 8. Fetch Court-Ready PDF Dossier (ReportLab verification)
    pdf_resp = client.get(f"/api/v1/notices/{notice_id}/pdf")
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert pdf_resp.content.startswith(b"%PDF-"), "Generated PDF must start with valid PDF magic bytes"

    # 9. eMaap Standard JSON Export Query (National Integration OQ-03)
    emaap_resp = client.get(f"/api/v1/inspections/{insp_id}/emaap-export", headers=tokens["inspector"])
    assert emaap_resp.status_code == 200
    emaap_data = emaap_resp.json()
    assert emaap_data["emaap_schema_version"] == "2.1.0"
    assert emaap_data["legal_basis"] == "Section 63 Bharatiya Sakshya Adhiniyam, 2023"
    assert len(emaap_data["statutory_findings"]) >= 2
    first_finding = emaap_data["statutory_findings"][0]
    assert "Rule 6(1)(h)" in first_finding["citation"]
    assert "Section 36(1)" in first_finding["section"]

    # 10. Audit Chain Verification Query (Cryptographic Ledger Integrity)
    audit_resp = client.get("/api/v1/audit/chain-verify", headers=tokens["inspector"])
    assert audit_resp.status_code == 200
    audit_data = audit_resp.json()
    assert audit_data["chain_intact"] is True
    assert audit_data["tampered_sequence_number"] is None
    assert audit_data["statutory_standard"] == "Section 63 Bharatiya Sakshya Adhiniyam, 2023"
    assert audit_data["total_audit_records"] > 0
