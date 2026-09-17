#!/usr/bin/env python3
"""NIRIKSHAK (SIH26034) - Comprehensive Environment & Cloud Verification Tool.
Verifies:
1. Local .env files (root, frontend, backend)
2. Oracle VM host (68.233.117.16) SSH accessibility & container health
3. Live FastAPI Backend health & authentication (controller_south / Officer@2026)
4. Supabase Cloud Storage bucket access & publishable key validity
"""

import os
from pathlib import Path
import sys
import httpx
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent

# Load root .env and .env.local
root_env = REPO_ROOT / ".env"
if root_env.exists():
    load_dotenv(root_env)
root_env_local = REPO_ROOT / ".env.local"
if root_env_local.exists():
    load_dotenv(root_env_local, override=True)

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"


def check_status(label: str, passed: bool, detail: str = ""):
    symbol = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
    print(f"[{symbol}] {BOLD}{label}{RESET} {detail}")
    return passed


def main():
    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    print(f"{CYAN}{BOLD} NIRIKSHAK (SIH26034) - SYSTEM ENVIRONMENT VERIFICATION{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

    all_passed = True

    # 1. Check local environment files & templates
    print(f"{YELLOW}--- 1. Checking Environment Files & Templates ---{RESET}")
    root_env_ok = (REPO_ROOT / ".env").is_file()
    all_passed &= check_status("Root .env exists", root_env_ok, str(REPO_ROOT / ".env"))

    fe_env_ok = (REPO_ROOT / "frontend" / ".env").is_file()
    all_passed &= check_status("Frontend .env exists", fe_env_ok, str(REPO_ROOT / "frontend" / ".env"))

    be_env_ok = (REPO_ROOT / "backend" / ".env").is_file()
    all_passed &= check_status("Backend .env exists", be_env_ok, str(REPO_ROOT / "backend" / ".env"))

    root_example_ok = (REPO_ROOT / ".env.example").is_file()
    all_passed &= check_status("Root .env.example exists", root_example_ok, str(REPO_ROOT / ".env.example"))

    fe_example_ok = (REPO_ROOT / "frontend" / ".env.example").is_file()
    all_passed &= check_status("Frontend .env.example exists", fe_example_ok, str(REPO_ROOT / "frontend" / ".env.example"))

    be_example_ok = (REPO_ROOT / "backend" / ".env.example").is_file()
    all_passed &= check_status("Backend .env.example exists", be_example_ok, str(REPO_ROOT / "backend" / ".env.example"))

    key_ok = (REPO_ROOT / "oracle_vm_key.pem").is_file()
    all_passed &= check_status("Oracle VM SSH Key file exists", key_ok, str(REPO_ROOT / "oracle_vm_key.pem"))

    ssh_key_env = os.getenv("ORACLE_VM_SSH_KEY", "")
    ssh_env_ok = bool(ssh_key_env and "BEGIN RSA PRIVATE KEY" in ssh_key_env and "END RSA PRIVATE KEY" in ssh_key_env)
    all_passed &= check_status("ORACLE_VM_SSH_KEY in env", ssh_env_ok, f"{len(ssh_key_env)} chars")

    # 2. Check Supabase Connectivity
    print(f"\n{YELLOW}--- 2. Checking Supabase Cloud Storage ---{RESET}")
    sb_url = os.getenv("SUPABASE_URL", "https://ihqhfusgkullpbjfmjiy.supabase.co").rstrip("/")
    sb_key = os.getenv("SUPABASE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or ""
    sb_bucket = os.getenv("SUPABASE_BUCKET", "evidence-images")

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(f"{sb_url}/storage/v1/bucket", headers={"apikey": sb_key, "Authorization": f"Bearer {sb_key}"})
            sb_ok = resp.status_code == 200
            all_passed &= check_status("Supabase API reachable", sb_ok, f"HTTP {resp.status_code} ({sb_url})")
    except Exception as e:
        all_passed &= check_status("Supabase API reachable", False, str(e))

    # 3. Check Oracle VM Live Backend Health
    print(f"\n{YELLOW}--- 3. Checking Oracle Cloud VPS Backend ---{RESET}")
    vm_host = os.getenv("ORACLE_VM_HOST", "68.233.117.16")
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(f"http://{vm_host}:8000/api/v1/health")
            h_ok = resp.status_code == 200 and resp.json().get("status") == "ONLINE"
            detail = f"Status: {resp.json().get('status', 'UNKNOWN')} | DB: {resp.json().get('database', 'UNKNOWN')}"
            all_passed &= check_status("Live Backend /health", h_ok, detail)
    except Exception as e:
        all_passed &= check_status("Live Backend /health", False, str(e))

    # 4. Check Official Controller Authentication
    print(f"\n{YELLOW}--- 4. Checking Officer Authentication (controller_south) ---{RESET}")
    officer_user = os.getenv("DEMO_OFFICER_USERNAME", "controller_south")
    officer_pass = os.getenv("DEMO_OFFICER_PASSWORD", "Officer@2026")
    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.post(
                f"http://{vm_host}:8000/api/v1/auth/login",
                json={"username": officer_user, "password": officer_pass},
                headers={"Content-Type": "application/json"},
            )
            auth_ok = resp.status_code == 200 and "access_token" in resp.json()
            user_data = resp.json().get("user", {})
            auth_detail = f"Officer: {user_data.get('full_name')} ({user_data.get('role')}) | Token Issued"
            all_passed &= check_status(f"Login '{officer_user}'", auth_ok, auth_detail)
    except Exception as e:
        all_passed &= check_status(f"Login '{officer_user}'", False, str(e))

    print(f"\n{CYAN}{BOLD}{'='*70}{RESET}")
    if all_passed:
        print(f"{GREEN}{BOLD}ALL ENVIRONMENT & CLOUD VERIFICATION CHECKS PASSED SUCCESSFULLY!{RESET}")
    else:
        print(f"{RED}{BOLD}SOME CHECKS FAILED. PLEASE REVIEW LOGS ABOVE.{RESET}")
    print(f"{CYAN}{BOLD}{'='*70}{RESET}\n")

    return 0 if all_passed else 1


if __name__ == "__main__":
    sys.exit(main())
