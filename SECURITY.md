# Security Policy

## 🏛️ Security Philosophy & Evidentiary Integrity

**NyayaDrishti-LM** processes physical packaged commodity scans and digital e-commerce declarations to generate statutory enforcement notices under Section 36(1) of the Legal Metrology Act, 2009. 

Maintaining cryptographic chain of custody, data confidentiality, and system integrity is critical to preserving admissibility under **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.

---

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability, cryptographic weakness, or unauthorized bypass in the audit trail:

1. **Do NOT disclose the issue publicly** or file a public GitHub issue.
2. Submit a private advisory via GitHub Security Advisories or email the engineering leads directly.
3. Include:
   - Detailed description of the vulnerability.
   - Steps to reproduce or proof-of-concept exploit.
   - Impact assessment on evidentiary admissibility or merchant data confidentiality.

We commit to acknowledging receipt within **24 hours** and providing a mitigation timeline within **72 hours**.

---

## 🛡️ Key Security Architectural Controls

- **Zero Cloud Leakage on Edge:** In offline inspection mode, all OCR, homography, and AST rule evaluation executes strictly in-memory on CPU without outbound network telemetry.
- **SHA-256 Merkle Audit Trail:** All ingested label photographs and detected bounding boxes are immutably hashed at capture and recorded in an append-only ledger ([10_SECURITY_AND_AUDIT_SPECIFICATION.md](10_SECURITY_AND_AUDIT_SPECIFICATION.md)).
- **Role-Based Access Control (RBAC):** Strict separation between Field Inspecting Officers, District Adjudicating Officers, and Central Legal Administrators.
