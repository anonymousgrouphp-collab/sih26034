# 12 — COMPREHENSIVE EVIDENCE & AUDIT TRACE INDEX: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Auditor:** Digital Forensics & Evidence Registry Specialist  

---

## 1. Visual & Browser Inspection Evidence

| Evidence ID | Visual Artifact Description | Source / URI | Inspection Method | Key Forensic Finding |
| :--- | :--- | :--- | :--- | :--- |
| `EV-UI-01` | Adjudication Canvas Live View | `http://localhost:3000/?case=SKU-DEMO-01` | Chrome DevTools MCP Snapshot & Screenshot | Interactive Caliper overlay ($1.84\text{ mm}$ vs $2.50\text{ mm}$ req), ArUco 4x4 fiducial ($50.0\text{ mm}$), Banned 'gms' unit flagger, Token inspector. |
| `EV-UI-02` | Section 63 BSA 2023 Evidence Audit Screen | `http://localhost:3000` (BSA Tab) | Chrome DevTools MCP Click & DOM Snapshot | Verified electronic evidence custody status, Merkle DAG ledger verification, citation of Section 63 BSA 2023. |
| `EV-UI-03` | Standalone Zero-Build Test HUD | `http://127.0.0.1:8000/test-ui/` | HTTP GET / Fast API Static Mount | 6 Golden SKUs, raw JSON contract inspection, SVG bounding polygon overlays without Node.js dependencies. |
| `EV-UI-04` | Inspector vs Citizen Persona Toggle | Header Navigation Element | Chrome DevTools MCP Snapshot | Instant switching between technical millimeter statutory view and consumer-friendly plain language explanations. |

---

## 2. Automated Test Execution Evidence

| Evidence ID | Test Suite | Command Line Executed | Verification Output |
| :--- | :--- | :--- | :--- |
| `EV-TEST-01` | Member Subsystems Test Suite | `.\.venv\Scripts\python.exe -m pytest members/ -q` | **391 passed, 1 skipped** in 20.62s |
| `EV-TEST-02` | Integration & Root Test Suite | `.\.venv\Scripts\python.exe -m pytest integration/tests tests/ -q` | **75 passed** in 5.82s |
| `EV-TEST-03` | Field Inspector CLI Suite | `.\.venv\Scripts\python.exe -m pytest tests/test_inspect_cli.py -v` | **18 passed** in 3.43s |
| `EV-TEST-04` | React 18 Frontend TSX Suite | `npm test` (in `members/member-06-ui`) | **104 passed, 0 failed** in 540 ms |
| `EV-TEST-05` | Advanced Calibration Stress Suite | `.\.venv\Scripts\python.exe tests/run_advanced_calibration_stress_suite.py` | **6 metrology suites / 33 scenarios 100% passed** |
| `EV-TEST-06` | Real Packaging Physical Suite | `.\.venv\Scripts\python.exe tests/run_real_packaging_physical_tests.py` | **8 real commercial FMCG packaging items verified** |
| `EV-TEST-07` | Mode B Offline Resilient Runner | `.\.venv\Scripts\python.exe local_runner.py --verify-offline` | **3 offline inspections passed (0 bytes transmitted)** |

---

## 3. Live Server & API Verification Evidence

| Evidence ID | Endpoint Probed | Method | Request Payload | Response Status & Body Evidence |
| :--- | :--- | :---: | :--- | :--- |
| `EV-API-01` | `/api/v1/health` | GET | None | `HTTP 200`: `{"status":"ONLINE","system_mode":"LOCAL_RESILIENT_MODE","audit_chain_valid":true,"version":"1.0.0-sih26034"}` |
| `EV-API-02` | `/api/v1/auth/login` | POST | `{"username":"inspector_rajesh","password":"Officer@2026"}` | `HTTP 200`: Valid JWT token issued, `expires_in: 28800`, claims `role: INSPECTOR`. |
| `EV-API-03` | `/api/v1/inspections` | GET | `Bearer <token>` | `HTTP 200`: Paginated response (`total: 14`, `items: 14`). |
| `EV-API-04` | `/api/v1/inspections/{id}` | GET | `Bearer <token>` | `HTTP 200`: Single case returned with 7 evaluations, evidence images, and bounding boxes. |
| `EV-API-05` | `/api/v1/notices/generate` (RBAC Test) | POST | `Bearer <inspector_token>` | `HTTP 403 Forbidden`: `{"detail":"Forbidden: Role 'INSPECTOR' is not authorized... Required: ['ADMIN', 'CONTROLLER']"}`. |
| `EV-API-06` | `/api/v1/notices/generate` (Defect Test)| POST | `Bearer <controller_token>` (existing inspection) | `HTTP 500 Internal Server Error`: `sqlite3.IntegrityError: UNIQUE constraint failed: bsa_certificates.inspection_id`. |

---

## 4. Relational Database Evidence

- **Database Files:** `legal_metrology.db` (217 KB), `legal_metrology_mode_b.db` (667 KB).
- **Relational Tables Verified:**
  1. `jurisdictions`: Circle definitions (`CIRCLE_DL_SOUTH_01`).
  2. `users`: 4 accounts (`admin_central`, `controller_south`, `inspector_rajesh`, `viewer_analyst`).
  3. `inspections`: 14 rows in Mode A, 125 rows in Mode B.
  4. `audit_logs`: 42 chronological events in Mode A, 95 events in Mode B.
  5. `evidence_images`: 14 physical/e-com images in Mode A, 71 images in Mode B.
  6. `bsa_certificates`: Section 63 BSA electronic certificates with SHA-256 Merkle roots.
  7. `bounding_boxes`: Normalized coordinate polygons for detected tokens.
  8. `legal_notices`: Generated show-cause notices with reply windows.
  9. `compliance_evaluations`: 42 AST statutory determinations in Mode A, 597 in Mode B.

---

## 5. Physical Neural Model Checkpoints Evidence

| Model Path | Checkpoint Name | Physical File Size | SHA-256 Digest |
| :--- | :--- | :---: | :--- |
| `members/member-02-ocr/models/int8/` | `ch_PP-OCRv4_det_int8.onnx` | 4,999,859 bytes | `e7bf4b26e32f89d02287f9e6141b280a0f93b2e2aecb659862146206ee2f9dd9` |
| `members/member-02-ocr/models/int8/` | `en_PP-OCRv4_rec_infer_int8.onnx` | 7,740,465 bytes | `e2eba942d929e7645cbc1b136cbe5611d4136451691d41fd52fbb3720ec4bf67` |
| `members/member-02-ocr/models/int8/` | `devanagari_PP-OCRv4_rec_int8.onnx` | 3,094,838 bytes | `846705cddacbc1530d4a3a38805309ac2d1a162452ecd6237f87e6ea440ca590` |
| `members/member-02-ocr/models/` | `hin.traineddata` | 15,336,773 bytes | `7848f12d22b2d0fa3b429d2f2d909568df9fcfdf4f67c32cfbd0ca532c2567df` |

---

## 6. Statutory Gazette & Legal Precedent Index

1. **The Legal Metrology Act, 2009 (Act No. 1 of 2010):**
   - Section 11: Prohibition of non-standard units (prohibiting `gms`, `gm`, `ML`).
   - Section 18: Mandatory packaging declarations.
   - Section 36(1): Penal provisions for non-compliant packaging.
   - Section 48: Compounding of offenses.
2. **The Legal Metrology (Packaged Commodities) Rules, 2011:**
   - Rule 2(h): Principal Display Panel (PDP) definition and $40\%$ cylindrical multiplier.
   - Rule 6(1): Mandatory declarations (Name, Net Qty, MRP, Mfg Date, Consumer Care, Origin).
   - Rule 6(10) & Rule 6(10A): E-commerce marketplace duties and mfg date exemption.
   - Rule 7 & Table-I (amended by G.S.R. 629(E)): Minimum numeral font schedule (Row 5 strictly $6.0\text{ mm}$).
   - Rule 6(1)(k) (amended by G.S.R. 779(E)): Unit Sale Price (USP) computation and display.
3. **The Jan Vishwas (Amendment of Provisions) Act, 2023 (Act No. 18 of 2023):**
   - Decriminalization of Section 36(1) into civil compounding fines up to ₹25,000 for first offenses.
4. **The Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023):**
   - Section 63: Admissibility of electronic records in court, superseding repealed Section 65B of Indian Evidence Act, 1872.
