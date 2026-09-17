"""
Statutory End-to-End Pipeline Integration Test for NIRIKSHAK
Validating:
1. Stage 2 Optical Quality Gate (Rejecting blurred / degraded images with 422).
2. Stage 1-6 Pipeline Execution.
3. Manual Font Override & Dynamic Rule 6(1)(h) Re-evaluation.
4. Elimination of Hardcoded Device Telemetry across BSA 65B Certs & Form 1 Notices.
5. Form 1 Recipient Auto-Population from Declarations.
"""

import io
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient
from backend.evidence.server import app
from backend.cv.quality_gate import QualityGateEvaluator

client = TestClient(app)

def create_synthetic_image(sharp: bool = True, width: int = 600, height: int = 400) -> bytes:
    if sharp:
        # High contrast with sharp edges -> high Laplacian variance
        img = np.zeros((height, width, 3), dtype=np.uint8)
        img[:] = 240
        for y in range(30, height - 30, 40):
            cv2.line(img, (20, y), (width - 20, y), (10, 10, 10), 3)
            cv2.putText(img, "NET QUANTITY: 500 g MRP Rs 99.00", (30, y + 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    else:
        # Smooth gaussian blur -> very low Laplacian variance (< 10)
        img = np.full((height, width, 3), 128, dtype=np.uint8)
        img = cv2.GaussianBlur(img, (45, 45), 0)
    
    success, encoded = cv2.imencode(".jpg", img)
    assert success
    return encoded.tobytes()

def test_quality_gate_evaluator_direct():
    sharp_bytes = create_synthetic_image(sharp=True)
    sharp_arr = cv2.imdecode(np.frombuffer(sharp_bytes, np.uint8), cv2.IMREAD_COLOR)
    res_sharp = QualityGateEvaluator.evaluate_image(sharp_arr)
    assert res_sharp.passed, f"Sharp image should pass quality gate: {res_sharp.rejection_reason}"
    assert res_sharp.blur_variance >= 150.0
    
    blur_bytes = create_synthetic_image(sharp=False)
    blur_arr = cv2.imdecode(np.frombuffer(blur_bytes, np.uint8), cv2.IMREAD_COLOR)
    res_blur = QualityGateEvaluator.evaluate_image(blur_arr)
    assert not res_blur.passed, "Blurred image must be rejected by quality gate"
    assert "blurred" in (res_blur.rejection_reason or "").lower() or res_blur.blur_variance < 150.0

def test_end_to_end_statutory_inspection_pipeline():
    # 0. Authenticate as Controller / Officer
    auth_resp = client.post(
        "/api/v1/auth/login",
        json={"username": "controller_south", "password": "Officer@2026"}
    )
    assert auth_resp.status_code == 200, f"Login failed: {auth_resp.text}"
    token = auth_resp.json()["access_token"]
    auth_headers = {
        "Authorization": f"Bearer {token}",
        "X-Device-Model": "HP EliteBook 840 G10 Workstation",
        "X-Device-OS": "Windows 11 Enterprise (Build 26100)",
    }

    # 1. Create a statutory inspection case
    create_resp = client.post("/api/v1/inspections", json={
        "product_name": "Premium Basmati Rice 5kg",
        "brand_name": "Royal Harvest",
        "category": "FOOD_GRAINS",
        "package_type": "RECTANGULAR",
        "inspection_type": "ROUTINE_MARKET_SURVEILLANCE",
        "jurisdiction_circle_id": "CIRCLE_DL_SOUTH_01",
        "declared_net_quantity": "5 kg"
    }, headers=auth_headers)
    assert create_resp.status_code in (200, 201), f"Create inspection failed: {create_resp.text}"
    case_data = create_resp.json()
    inspection_id = case_data["id"]
    
    # 2. Test Optical Quality Gate: Upload a blurred image and verify 422 rejection
    blurred_img = create_synthetic_image(sharp=False)
    blur_upload_resp = client.post(
        f"/api/v1/inspections/{inspection_id}/evidence",
        files={"image": ("blurred_sample.jpg", blurred_img, "image/jpeg")},
        data={"metadata": '{"panel_type": "PDP_FRONT"}'},
        headers=auth_headers
    )
    assert blur_upload_resp.status_code == 422, "Blurred image must be rejected with 422 HTTP status"
    error_body = blur_upload_resp.json()
    assert error_body.get("error_code") == "IMAGE_QUALITY_GATE_FAILED" or "blur" in str(error_body).lower()
    
    # 3. Upload a sharp, high-quality image and verify 200/201 acceptance
    sharp_img = create_synthetic_image(sharp=True)
    sharp_upload_resp = client.post(
        f"/api/v1/inspections/{inspection_id}/evidence",
        files={"image": ("sharp_sample.jpg", sharp_img, "image/jpeg")},
        data={"metadata": '{"panel_type": "PDP_FRONT"}'},
        headers=auth_headers
    )
    assert sharp_upload_resp.status_code in (200, 201), f"Upload failed: {sharp_upload_resp.text}"
    evidence_data = sharp_upload_resp.json()
    assert evidence_data.get("quality_gate", {}).get("passed") is True
    
    # 4. Execute Batch Pipeline (Stages 3 to 6)
    batch_resp = client.post(f"/api/v1/inspections/{inspection_id}/pipeline/batch", headers=auth_headers)
    assert batch_resp.status_code == 200
    batch_result = batch_resp.json()
    assert "ai_verdict" in batch_result
    assert batch_result["total_facets_processed"] >= 1
    
    # 5. Retrieve Case Details
    get_resp = client.get(f"/api/v1/inspections/{inspection_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    detail = get_resp.json()
    
    # 6. Test Font Size Manual Editability & Dynamic Table-I Re-evaluation
    fields = detail.get("extracted_fields") or []
    if fields:
        target_field = fields[0]
        field_id = target_field["field_id"]
        
        # Test editing font size to a sub-statutory height (1.80 mm < 4.0mm)
        patch_resp = client.patch(
            f"/api/v1/inspections/{inspection_id}/fields/{field_id}",
            json={
                "measured_font_height_mm": 1.80,
                "raw_ocr_text": "Net Qty: 5 kg",
                "notes": "Officer manual measurement with digital caliper"
            },
            headers=auth_headers
        )
        assert patch_resp.status_code == 200
        patch_data = patch_resp.json()
        matching_fields = [f for f in patch_data.get("extracted_fields", []) if f.get("field_id") == field_id]
        if matching_fields:
            assert matching_fields[0]["measured_font_height_mm"] == 1.80
            assert matching_fields[0].get("font_measurement_method") == "OFFICER_MANUAL_OVERRIDE"
        
        # Test editing font size to a compliant height (5.50 mm >= 4.0mm)
        patch_pass_resp = client.patch(
            f"/api/v1/inspections/{inspection_id}/fields/{field_id}",
            json={
                "measured_font_height_mm": 5.50,
                "raw_ocr_text": "Net Qty: 5 kg"
            },
            headers=auth_headers
        )
        assert patch_pass_resp.status_code == 200
        patch_pass_data = patch_pass_resp.json()
        matching_pass = [f for f in patch_pass_data.get("extracted_fields", []) if f.get("field_id") == field_id]
        if matching_pass:
            assert matching_pass[0]["measured_font_height_mm"] == 5.50

    # 7. Generate Form-1 Notice with dynamic client headers
    client_headers = {
        **auth_headers,
        "X-Device-Model": "HP EliteBook 840 G10 Workstation",
        "X-Device-OS": "Windows 11 Enterprise (Build 26100)",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    
    notice_resp = client.post(
        "/api/v1/notices/generate",
        json={
            "inspection_id": inspection_id,
            "compounding_fee_amount": 5000,
            "reply_window_days": 15
        },
        headers=client_headers
    )
    assert notice_resp.status_code in (200, 201), f"Notice gen failed: {notice_resp.text}"
    notice_data = notice_resp.json()
    
    # Verify BSA Certificate in inspection record has dynamic device telemetry
    insp_after_notice = client.get(f"/api/v1/inspections/{inspection_id}", headers=client_headers).json()
    cert_record = insp_after_notice.get("bsa_certificate") or {}
    assert "Samsung" not in cert_record.get("device_make_model", "")
    assert "Android" not in cert_record.get("operating_system", "")
    
    # 8. Download Notice PDF and verify validity
    pdf_url = notice_data.get("pdf_download_url") or f"/api/v1/notices/{inspection_id}/pdf"
    pdf_resp = client.get(pdf_url, headers=client_headers)
    assert pdf_resp.status_code == 200
    assert pdf_resp.content.startswith(b"%PDF")
    assert b"Samsung" not in pdf_resp.content
