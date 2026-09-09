"""Authentication & Role-Based Access Control (RBAC) Layer.
Enforces RFC 7519 JWT, PBKDF2 credential verification, and statutory RBAC per
10_SECURITY_AND_AUDIT_SPECIFICATION.md and TS-WEB-02.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import json
import os
from typing import Dict, List, Optional, Set, Union
import uuid

from fastapi import Depends, HTTPException, Header, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
import jwt

try:
    from database import RoleEnum, User, get_db_session
except ImportError:
    from .database import RoleEnum, User, get_db_session

# Security Configuration
SECRET_KEY = os.environ.get(
    "NYAYADRISHTI_SECRET_KEY",
    "nyayadrishti-sec63-bsa2023-statutory-secret-key-prod-delhi-01"
)
ALGORITHM = "HS256"
DEFAULT_TOKEN_EXPIRY_HOURS = 8

# Role normalization aliases
ROLE_ALIASES = {
    "FIELD_LMO": RoleEnum.INSPECTOR.value,
    "INSPECTOR": RoleEnum.INSPECTOR.value,
    "CONTROLLER": RoleEnum.CONTROLLER.value,
    "ADJUDICATING_CONTROLLER": RoleEnum.CONTROLLER.value,
    "ZONAL_CONTROLLER": RoleEnum.CONTROLLER.value,
    "ADMIN": RoleEnum.ADMIN.value,
    "CENTRAL_ADMIN": RoleEnum.ADMIN.value,
    "VIEWER": RoleEnum.VIEWER.value,
    "FMCG_USER": RoleEnum.VIEWER.value,
}


class TokenPayload(BaseModel):
    sub: str  # user_id
    role: str
    jurisdiction_id: Optional[str] = None
    officer_name: Optional[str] = None
    badge_number: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None


class UserContext(BaseModel):
    user_id: str
    username: str
    role: str
    full_name: str
    badge_number: Optional[str] = None
    jurisdiction_id: Optional[str] = None
    is_active: bool = True


# -----------------------------------------------------------------------------
# Password Hashing & Verification (PBKDF2-HMAC-SHA256)
# -----------------------------------------------------------------------------

def hash_password(password: str, salt_bytes: Optional[bytes] = None, iterations: int = 100_000) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with 100,000 iterations.
    Format: pbkdf2_sha256$iterations$salt_hex$hash_hex
    """
    if salt_bytes is None:
        salt_bytes = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, iterations)
    return f"pbkdf2_sha256${iterations}${salt_bytes.hex()}${dk.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a stored PBKDF2 hash using constant-time comparison."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt_bytes = bytes.fromhex(parts[2])
        expected_dk = bytes.fromhex(parts[3])
        actual_dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, iterations)
        return hmac.compare_digest(actual_dk, expected_dk)
    except Exception:
        return False


# -----------------------------------------------------------------------------
# JWT Token Issuance and Decoding
# -----------------------------------------------------------------------------

def create_access_token(
    data: Dict[str, Union[str, int]],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Issues an RFC 7519 JWT Bearer token signed with HMAC-SHA256."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=DEFAULT_TOKEN_EXPIRY_HOURS)

    to_encode.update({
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> TokenPayload:
    """Decodes and cryptographically validates a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        role = payload.get("role")
        if not sub or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload: missing sub or role claim",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token signature has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Cryptographic verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def normalize_role(role_name: str) -> str:
    """Normalizes role strings across aliases (e.g. FIELD_LMO -> INSPECTOR)."""
    clean_role = role_name.strip().upper()
    return ROLE_ALIASES.get(clean_role, clean_role)


# -----------------------------------------------------------------------------
# Request Headers & Tracing Dependency
# -----------------------------------------------------------------------------

class RequestHeaders(BaseModel):
    request_id: str
    client_version: str
    device_fingerprint: str


def extract_request_headers(
    x_request_id: Optional[str] = Header(None, alias="X-Request-ID"),
    x_client_version: Optional[str] = Header(None, alias="X-Client-Version"),
    x_device_fingerprint: Optional[str] = Header(None, alias="X-Device-Fingerprint"),
) -> RequestHeaders:
    """Extracts standard forensic telemetry headers per 07_API_AND_INTERFACE_CONTRACTS.md."""
    return RequestHeaders(
        request_id=x_request_id or str(uuid.uuid4()),
        client_version=x_client_version or "NyayaDrishti-Web/1.0.0",
        device_fingerprint=x_device_fingerprint or "UNKNOWN-DEVICE-FINGERPRINT",
    )


# -----------------------------------------------------------------------------
# Authentication & Role Dependency
# -----------------------------------------------------------------------------

http_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer_scheme),
) -> UserContext:
    """Extracts and verifies the current authenticated user from Bearer JWT."""
    if not auth_header or not auth_header.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header or Bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_payload = decode_access_token(auth_header.credentials)
    norm_role = normalize_role(token_payload.role)

    # In-memory context constructed from verified cryptographic token claims
    return UserContext(
        user_id=token_payload.sub,
        username=token_payload.officer_name or token_payload.sub,
        role=norm_role,
        full_name=token_payload.officer_name or token_payload.sub,
        badge_number=token_payload.badge_number,
        jurisdiction_id=token_payload.jurisdiction_id,
        is_active=True,
    )


def require_role(*allowed_roles: str):
    """Enforces Role-Based Access Control (RBAC) on FastAPI endpoints.
    
    Raises HTTP 403 Forbidden if user's role does not match permitted roles (TS-WEB-02).
    """
    normalized_allowed: Set[str] = {normalize_role(r) for r in allowed_roles}
    # ADMIN is globally privileged
    normalized_allowed.add(RoleEnum.ADMIN.value)

    async def role_checker(current_user: UserContext = Depends(get_current_user)) -> UserContext:
        user_role = normalize_role(current_user.role)
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Role '{current_user.role}' is not authorized for this statutory operation. Required: {list(normalized_allowed)}",
            )
        return current_user

    return role_checker
