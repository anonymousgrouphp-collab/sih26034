"""Unit tests for Authentication & RBAC Layer.
Explicitly validates TS-WEB-02 (Field LMO rejected from Controller compounding endpoint).
"""

from datetime import timedelta
import pytest
from pathlib import Path
import sys

from fastapi import Depends, FastAPI, status
from fastapi.testclient import TestClient

# Ensure src/ is importable
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

try:
    from auth import (
        create_access_token,
        decode_access_token,
        hash_password,
        verify_password,
        normalize_role,
        require_role,
        get_current_user,
        UserContext,
        extract_request_headers,
        RequestHeaders,
    )
    from database import RoleEnum
except ImportError:
    from .auth import (
        create_access_token,
        decode_access_token,
        hash_password,
        verify_password,
        normalize_role,
        require_role,
        get_current_user,
        UserContext,
        extract_request_headers,
        RequestHeaders,
    )
    from .database import RoleEnum


def test_password_hashing_and_verification():
    raw_pass = "LegalMetrology@2026!Sec63"
    hashed = hash_password(raw_pass)
    assert hashed.startswith("pbkdf2_sha256$100000$")
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False
    assert verify_password(raw_pass, "invalid_hash_string") is False


def test_jwt_token_lifecycle():
    data = {
        "sub": "user_dl_01",
        "role": "INSPECTOR",
        "jurisdiction_id": "CIRCLE_DL_SOUTH_01",
        "officer_name": "Insp. Rajesh Sharma",
        "badge_number": "INSP-DL-0842",
    }
    token = create_access_token(data)
    payload = decode_access_token(token)
    assert payload.sub == "user_dl_01"
    assert payload.role == "INSPECTOR"
    assert payload.officer_name == "Insp. Rajesh Sharma"
    assert payload.badge_number == "INSP-DL-0842"


def test_jwt_expired_token():
    # Issue a token that is already expired (-10 seconds)
    data = {"sub": "user_expired", "role": "CONTROLLER"}
    token = create_access_token(data, expires_delta=timedelta(seconds=-10))
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(token)
    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "expired" in str(exc_info.value.detail).lower()


def test_jwt_tampered_token():
    token = create_access_token({"sub": "user_valid", "role": "ADMIN"})
    tampered = token[:-5] + "XXXXX"
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(tampered)
    assert exc_info.value.status_code == status.HTTP_401_UNAUTHORIZED


def test_role_normalization():
    assert normalize_role("FIELD_LMO") == RoleEnum.INSPECTOR.value
    assert normalize_role("inspector") == RoleEnum.INSPECTOR.value
    assert normalize_role("ADJUDICATING_CONTROLLER") == RoleEnum.CONTROLLER.value
    assert normalize_role("CONTROLLER") == RoleEnum.CONTROLLER.value
    assert normalize_role("FMCG_USER") == RoleEnum.VIEWER.value
    assert normalize_role("ADMIN") == RoleEnum.ADMIN.value


# -----------------------------------------------------------------------------
# FastApi RBAC Integration & TS-WEB-02 Verification
# -----------------------------------------------------------------------------

app = FastAPI()

@app.post("/api/v1/inspections/upload", dependencies=[Depends(require_role("INSPECTOR"))])
def inspector_upload_endpoint(user: UserContext = Depends(get_current_user)):
    return {"status": "SUCCESS", "officer": user.full_name, "role": user.role}

@app.post("/api/v1/inspections/{id}/compounding", dependencies=[Depends(require_role("CONTROLLER"))])
def controller_compounding_endpoint(id: str, user: UserContext = Depends(get_current_user)):
    return {"status": "SUCCESS", "compounding_adjudicated": True, "officer": user.full_name}

@app.get("/api/v1/telemetry")
def telemetry_endpoint(headers: RequestHeaders = Depends(extract_request_headers)):
    return {
        "request_id": headers.request_id,
        "client_version": headers.client_version,
        "device_fingerprint": headers.device_fingerprint,
    }

client = TestClient(app)


def test_ts_web_02_field_lmo_access_controller_compounding():
    """TS-WEB-02: Field LMO tries to access Controller compounding endpoint.
    JWT with role: FIELD_LMO -> Backend MUST return 403 Forbidden.
    """
    field_lmo_token = create_access_token({
        "sub": "user_insp_001",
        "role": "FIELD_LMO",
        "officer_name": "Field LMO Rajesh",
        "jurisdiction_id": "CIRCLE_DL_SOUTH_01"
    })
    headers = {"Authorization": f"Bearer {field_lmo_token}"}

    # Attempt to access Controller compounding endpoint
    resp = client.post("/api/v1/inspections/insp_101/compounding", headers=headers)
    assert resp.status_code == status.HTTP_403_FORBIDDEN
    assert "Forbidden" in resp.json()["detail"]


def test_controller_can_access_compounding():
    controller_token = create_access_token({
        "sub": "user_ctrl_001",
        "role": "CONTROLLER",
        "officer_name": "Controller Anand Verma",
        "jurisdiction_id": "CIRCLE_DL_SOUTH_01"
    })
    headers = {"Authorization": f"Bearer {controller_token}"}

    resp = client.post("/api/v1/inspections/insp_101/compounding", headers=headers)
    assert resp.status_code == status.HTTP_200_OK
    assert resp.json()["compounding_adjudicated"] is True


def test_admin_can_access_all_roles():
    admin_token = create_access_token({
        "sub": "user_admin_001",
        "role": "ADMIN",
        "officer_name": "Central DoCA Admin",
    })
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin accesses controller endpoint
    resp1 = client.post("/api/v1/inspections/insp_101/compounding", headers=headers)
    assert resp1.status_code == status.HTTP_200_OK

    # Admin accesses inspector endpoint
    resp2 = client.post("/api/v1/inspections/upload", headers=headers)
    assert resp2.status_code == status.HTTP_200_OK


def test_unauthenticated_request_rejected():
    resp = client.post("/api/v1/inspections/insp_101/compounding")
    assert resp.status_code == status.HTTP_401_UNAUTHORIZED


def test_telemetry_headers():
    custom_headers = {
        "X-Request-ID": "test-uuid-9999",
        "X-Client-Version": "NyayaDrishti-Mobile/2.4.1",
        "X-Device-Fingerprint": "HARDWARE-TPM-778899",
    }
    resp = client.get("/api/v1/telemetry", headers=custom_headers)
    assert resp.status_code == status.HTTP_200_OK
    data = resp.json()
    assert data["request_id"] == "test-uuid-9999"
    assert data["client_version"] == "NyayaDrishti-Mobile/2.4.1"
    assert data["device_fingerprint"] == "HARDWARE-TPM-778899"
