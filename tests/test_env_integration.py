"""Integration Test for Nirikshak Environment Variables & Credentials (SIH26034).
Tests:
1. Root, frontend, and backend .env variables are loaded properly.
2. Supabase Storage connectivity with provided anon key and URL.
3. Live backend authentication with controller_south and Officer@2026.
4. Oracle VM SSH private key validation.
"""

import os
from pathlib import Path
import pytest
from dotenv import load_dotenv
import httpx
import cryptography.hazmat.primitives.serialization as crypto_serialization

REPO_ROOT = Path(__file__).resolve().parent.parent

# Load environment (.env and .env.local)
if (REPO_ROOT / ".env").exists():
    load_dotenv(REPO_ROOT / ".env")
if (REPO_ROOT / ".env.local").exists():
    load_dotenv(REPO_ROOT / ".env.local", override=True)


def test_env_variables_presence():
    assert os.getenv("VITE_API_BASE_URL") == "/api/v1"
    assert os.getenv("VITE_DEMO_OFFICER_USERNAME") == "controller_south"
    assert os.getenv("VITE_DEMO_OFFICER_PASSWORD") == "Officer@2026"
    assert os.getenv("VITE_OPERATING_MODE") == "LIVE"
    assert "supabase.co" in os.getenv("VITE_SUPABASE_URL", "")
    assert os.getenv("VITE_SUPABASE_ANON_KEY", "").startswith("sb_publishable_")
    assert os.getenv("ORACLE_VM_HOST") == "68.233.117.16"
    assert os.getenv("ORACLE_VM_USERNAME") == "ubuntu"
    ssh_key = os.getenv("ORACLE_VM_SSH_KEY")
    assert ssh_key is not None, "ORACLE_VM_SSH_KEY must be defined in environment"
    assert "BEGIN RSA PRIVATE KEY" in ssh_key
    assert "END RSA PRIVATE KEY" in ssh_key


def test_env_example_templates_presence():
    assert (REPO_ROOT / ".env.example").is_file(), "Root .env.example must exist"
    assert (REPO_ROOT / "frontend" / ".env.example").is_file(), "Frontend .env.example must exist"
    assert (REPO_ROOT / "backend" / ".env.example").is_file(), "Backend .env.example must exist"


def test_supabase_connectivity():
    url = os.getenv("SUPABASE_URL", "https://ihqhfusgkullpbjfmjiy.supabase.co").rstrip("/")
    key = os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
    }
    with httpx.Client(timeout=10.0) as client:
        resp = client.get(f"{url}/storage/v1/bucket", headers=headers)
        assert resp.status_code == 200, f"Supabase storage bucket query failed: {resp.status_code}"


def test_oracle_vm_key_validity():
    key_path = REPO_ROOT / "oracle_vm_key.pem"
    ssh_key_env = os.getenv("ORACLE_VM_SSH_KEY", "").strip()
    if not key_path.exists() and not ssh_key_env:
        pytest.skip("Neither oracle_vm_key.pem nor ORACLE_VM_SSH_KEY is present in environment")

    if key_path.exists():
        key_data = key_path.read_text(encoding="utf-8").strip()
        key_from_file = crypto_serialization.load_pem_private_key(key_data.encode("utf-8"), password=None)
        assert key_from_file.key_size == 2048

    if ssh_key_env:
        key_from_env = crypto_serialization.load_pem_private_key(ssh_key_env.encode("utf-8"), password=None)
        assert key_from_env.key_size == 2048


def test_live_backend_auth_controller():
    host = os.getenv("ORACLE_VM_HOST", "68.233.117.16")
    username = os.getenv("DEMO_OFFICER_USERNAME", "controller_south")
    password = os.getenv("DEMO_OFFICER_PASSWORD", "Officer@2026")
    with httpx.Client(timeout=10.0) as client:
        resp = client.post(
            f"http://{host}:8000/api/v1/auth/login",
            json={"username": username, "password": password},
            headers={"Content-Type": "application/json"},
        )
        assert resp.status_code == 200, f"Authentication failed: {resp.status_code} {resp.text}"
        data = resp.json()
        assert "access_token" in data
        assert data.get("user", {}).get("role") == "CONTROLLER"
        assert data.get("user", {}).get("username") == "controller_south"
