#!/usr/bin/env python3
"""NIRIKSHAK (SIH26034) - Oracle Cloud Infrastructure (OCI) VM Operations Helper.
Facilitates seamless operations on the live Ubuntu VM hosting Dockerized FastAPI & PostgreSQL.
Governed by Section 63 Bharatiya Sakshya Adhiniyam, 2023.
"""

import os
from pathlib import Path
import subprocess
import sys
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent.parent

if (REPO_ROOT / ".env").exists():
    load_dotenv(REPO_ROOT / ".env")
if (REPO_ROOT / ".env.local").exists():
    load_dotenv(REPO_ROOT / ".env.local", override=True)


def get_ssh_cmd(remote_command: str = ""):
    host = os.getenv("ORACLE_VM_HOST", "68.233.117.16").strip()
    user = os.getenv("ORACLE_VM_USERNAME", "ubuntu").strip()
    key_path = REPO_ROOT / os.getenv("ORACLE_VM_KEY_PATH", "oracle_vm_key.pem")

    if not key_path.exists():
        fallback_key = Path.home() / ".ssh" / "oracle_vm_key.pem"
        if fallback_key.exists():
            key_path = fallback_key
        elif os.getenv("ORACLE_VM_SSH_KEY"):
            # Auto-materialize private key from environment variable
            key_content = os.getenv("ORACLE_VM_SSH_KEY", "").strip()
            if key_content:
                key_path.write_text(key_content + "\n", encoding="utf-8")
                try:
                    import stat
                    key_path.chmod(stat.S_IRUSR | stat.S_IWUSR)
                except Exception:
                    pass

    cmd = [
        "ssh",
        "-i", str(key_path),
        "-o", "StrictHostKeyChecking=no",
        "-o", "ConnectTimeout=10",
        f"{user}@{host}",
    ]
    if remote_command:
        cmd.append(remote_command)
    return cmd


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/oracle_vm_helper.py [status|ps|logs|pull|restart|exec <cmd>|shell]")
        return 1

    action = sys.argv[1].lower()

    if action in ("status", "ps"):
        cmd = get_ssh_cmd("docker ps && echo '--- System Load ---' && uptime")
    elif action == "logs":
        container = sys.argv[2] if len(sys.argv) > 2 else "nyayadrishti-backend"
        cmd = get_ssh_cmd(f"docker logs --tail 100 {container}")
    elif action == "restart":
        container = sys.argv[2] if len(sys.argv) > 2 else "nyayadrishti-backend"
        cmd = get_ssh_cmd(f"docker restart {container}")
    elif action == "pull":
        cmd = get_ssh_cmd("cd sih26034 && git pull origin main && docker-compose up --build -d backend")
    elif action == "exec":
        remote_cmd = " ".join(sys.argv[2:])
        cmd = get_ssh_cmd(remote_cmd)
    elif action == "shell":
        cmd = get_ssh_cmd()
    else:
        print(f"Unknown action: {action}")
        return 1

    return subprocess.call(cmd)


if __name__ == "__main__":
    sys.exit(main())
