# 05 — CYBERSECURITY & EVIDENCE INTEGRITY AUDIT REPORT: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Standards:** ISO 27001, OWASP Top 10, Section 63 Bharatiya Sakshya Adhiniyam, 2023  
**Lead Auditor:** Senior Cybersecurity & Digital Forensics Auditor  

---

## 1. Executive Security Evaluation

The security architecture of MetroLens (NyayaDrishti-LM) was audited across authentication, role-based access control (RBAC), storage security, cryptographic evidence chain-of-custody, and API protection.

### **OVERALL SECURITY POSTURE: ROBUST & PRODUCTION-GRADE (GRADE: A-)**

The platform implements genuine defense-in-depth:
- Server-side RBAC authorization cannot be bypassed by client manipulation.
- Cryptographic evidence ledger utilizes SHA-256 Merkle DAG chaining.
- Strict MIME and magic-byte checks prevent malicious file uploads.
- Zero copyleft AGPL/GPL dependencies ensure government intellectual property safety.

---

## 2. Authentication & Session Security Audit

| Security Control | Implementation Mechanism | Audit Finding & Verification Evidence | Status |
| :--- | :--- | :--- | :---: |
| **Token Standard** | JWT (JSON Web Token) with HMAC-SHA256 (`HS256`) | Tokens encode `sub`, `role`, `jurisdiction_id`, `officer_name`, `badge_number`, `iat`, and `exp`. | **SECURE** |
| **Token Expiry** | 8 Hours (28,800 seconds) | Matches standard government 8-hour shift duration. | **SECURE** |
| **Password Hashing** | PBKDF2-HMAC-SHA256 with 100,000 iterations | Passwords stored with unique salt; zero plaintext storage. | **SECURE** |
| **Default Credentials** | Seeded with `Officer@2026` in dev/demo | Default accounts exist for 4 roles; documentation mandates changing `JWT_SECRET_KEY` and passwords before cloud deployment. | **ACCEPTABLE FOR PROTOTYPE** |
| **Brute-Force Protection** | Rate limiting configured in Docker/Nginx | Monolith FastAPI layer relies on reverse-proxy or cloud edge (Render/Vercel) for rate limits. | **RECOMMENDED IMPROVEMENT** |

---

## 3. Role-Based Access Control (RBAC) Verification

The system defines four administrative roles:
1. `ADMIN`: Full platform configuration, user account management, and circle definition.
2. `CONTROLLER`: Controller of Legal Metrology; exclusive authority to approve case closures, compounding sanctions, and dispatch Form-1 Show Cause Notices.
3. `INSPECTOR`: Legal Metrology Officer (LMO); field evidence intake, image upload, inspection review, and recommended findings.
4. `VIEWER`: Read-only telemetry and statistical dashboard access.

### Empirical RBAC Penetration Test:
We performed a live adversarial penetration attempt via direct HTTP REST API calls:
- **Test:** Authenticated as `usr_01_rajesh` (`role: INSPECTOR`).
- **Target Endpoint:** `POST /api/v1/notices/generate` (statutory notice dispatch).
- **Attack Payload:** Attempted to issue a Section 36(1) show cause notice directly via HTTP request bypassing the UI.
- **Server Response:**
  ```json
  HTTP 403 Forbidden
  {"detail": "Forbidden: Role 'INSPECTOR' is not authorized for this statutory operation. Required: ['ADMIN', 'CONTROLLER']"}
  ```
- **Finding:** **VERIFIED SECURE.** The backend strictly enforces authorization decorators on all sensitive operations. The frontend UI disablement is backed by immutable server-side gatekeepers.

---

## 4. Evidence Integrity & Section 63 BSA 2023 Compliance

### 4.1 Evidentiary Requirements under New Criminal Laws
On 1 July 2024, the Indian Evidence Act, 1872 (including Section 65B) was repealed and superseded by the **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**. Under Section 63 of the BSA 2023:
- Electronic records are admissible only when accompanied by technical proof that the device producing the record was in lawful custody and operating properly.
- Any alteration of digital evidence invalidates the prosecution.

### 4.2 MetroLens Evidentiary Architecture

```
[Camera Sensor Capture]
          |
          v
   Raw Image SHA-256 Digest (Computed Before Any Processing)
          |
          v
[Quality Gate & Calibrated Homography Warp]
          |
          v
   Rectified Frame SHA-256 Digest
          |
          v
[DBNet++ / PP-OCRv4 Token Extraction]
          |
          v
   OCR Tokens & Bounding Polygons JSON Digest
          |
          v
[Merkle DAG Chaining Algorithm: parent_hash + child_hash -> Merkle Root]
          |
          v
[Section 63 BSA 2023 Certificate: Device Serial + OS Kernel + Monotonic Clock + Root Hash]
          |
          v
[ReportLab Form-1 Legal Show Cause Notice PDF with Embedded QR & Merkle Proof]
```

### 4.3 Tamper-Evident Ledger Verification
In `members/member-05-evidence/src/merkle_dag.py`:
- `AuditLedgerService.verify_audit_chain(db)` iterates through the complete chronological audit chain.
- If an adversary updates a single character in the database or alters an evidence image in `/storage/`, the parent-child hash link breaks and `audit_chain_valid` returns `False`.
- Verified live: `http://127.0.0.1:8000/api/v1/health` reports `"audit_chain_valid": true`.

---

## 5. Storage Security & File Upload Hardening

The file storage subsystem in `members/member-05-evidence/src/storage.py` was audited against upload vulnerabilities:

| Vulnerability | Defense Mechanism | Audit Verification Result |
| :--- | :--- | :---: |
| **Path Traversal (`../`)** | Canonicalized paths via `Path.resolve()`; filename sanitization strips relative path prefixes | **SECURE (Tested)** |
| **Malicious File Extensions** | Whitelist only: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf` | **SECURE (Tested)** |
| **Magic Byte Validation** | Validates binary headers (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG) using `imghdr`/Pillow | **SECURE (Tested)** |
| **Payload Bomb (DoS)** | Hard statutory limit of 15.0 MB enforced via streaming buffer checks | **SECURE (Tested)** |
| **Executable Injection** | Scripts, `.exe`, `.sh`, `.php` trigger immediate `UnsupportedMediaTypeError` (HTTP 415) | **SECURE (Tested)** |

---

## 6. OWASP Top 10 Vulnerability Matrix

| OWASP Vulnerability | Risk in MetroLens | Mitigating Architecture | Residual Risk |
| :--- | :--- | :--- | :---: |
| **A01: Broken Access Control** | High | Strict JWT role decorators on all endpoints (`require_role`) | Low |
| **A02: Cryptographic Failures** | Medium | SHA-256 hashing, PBKDF2 password derivation, Ed25519 signatures | Low |
| **A03: Injection (SQL / Command)** | High | SQLAlchemy 2.0 parameterized queries; zero string concatenation | Very Low |
| **A04: Insecure Design** | Medium | HITL mandatory adjudication; 4-state epistemic model prevents false flags | Low |
| **A05: Security Misconfiguration** | Medium | CORS configured with wildcard in dev; needs explicit domain whitelist in prod | Medium |
| **A06: Vulnerable Components** | Low | Permissive dependencies regularly updated; 0 AGPL/GPL libraries | Low |
| **A07: Identification & Auth** | Medium | JWT bearer tokens; monotonic timestamp checking | Low |
| **A08: Software & Data Integrity** | Low | Merkle DAG append-only ledger; pre-transform image hashing | Very Low |
| **A09: Security Logging & Monitoring** | Low | Every officer login, upload, override, and closure logged to audit table | Very Low |
| **A10: Server-Side Request Forgery** | Low | E-commerce ingestion currently uses text/HTML snippets; no blind HTTP fetches | Low |
