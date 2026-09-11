# 04 — TEST & VERIFICATION AUDIT REPORT: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Test Environment:** Windows Host, Python 3.13.9 (`.venv`), Node v20.11, Chrome DevTools MCP  
**Lead Auditor:** Senior QA / SDET Lead  

---

## 1. Test Suite Summary & Pass/Fail Metrics

```
================================================================================
                    METROLENS AUTOMATED TEST SUITE METRICS
================================================================================
Subsystem / Workstream               | Suite File Count | Tests Run | Passed | Failed | Skipped | Runtime
---------------------------------------------------------------------------------------------------------
Member 1: CV & Metrology             |        2         |    29     |   29   |   0    |    0    |  1.82s
Member 2: Multilingual OCR           |       11         |    74     |   73   |   0    |    1*   |  4.65s
Member 3: Semantic Extraction        |        8         |   161     |  161   |   0    |    0    |  3.12s
Member 4: Rule Engine                |        4         |    54     |   54   |   0    |    0    |  2.41s
Member 5: Evidence & Backend         |       11         |    73     |   73   |   0    |    0    |  8.71s
Integration: Golden SKUs & Mode B    |        4         |    57     |   57   |   0    |    0    |  3.40s
CLI: Field Inspector Harness         |        1         |    18     |   18   |   0    |    0    |  3.43s
Frontend: React 18 / Vite TSX Tests  |       34         |   104     |  104   |   0    |    0    |  0.54s
---------------------------------------------------------------------------------------------------------
TOTAL SUITE EXECUTION                |       75         |   570     |  569   |   0    |    1    | 28.08s
================================================================================
* Skipped: test_real_tesseract_fallback_execution (optional fallback; system Tesseract binary not on host).
```

---

## 2. Deep-Dive Test Results by Member

### 2.1 Member 1: Computer Vision & Metrology (`members/member-01-cv-metrology/tests/`)
- `test_quality_gate.py` (12 tests):
  - Ingests clean image: passes blur ($>150$), glare ($<3\%$), tilt ($<15^\circ$).
  - Ingests motion-blurred frame: rejects with code `OPTICAL_BLUR` and advice `Hold camera steady`.
  - Ingests flash glare frame: rejects with code `SPECULAR_GLARE` and advice `Diffuse direct light`.
  - Ingests extreme tilt ($>20^\circ$): rejects with code `PERSPECTIVE_TILT`.
- `test_calibration.py` (17 tests):
  - ArUco 4x4 marker detection, subpixel corner refinement, px_to_mm scale accuracy within $\pm 0.8\%$.
  - ISO 7810 ID-1 card fallback detection and perspective rectification.
  - Planar homography warping ($3 \times 3$ matrix) rectifying distorted labels.
  - Principal Display Panel (PDP) calculation for rectangular and cylindrical surfaces.

### 2.2 Member 2: Multilingual Deep Learning OCR (`members/member-02-ocr/tests/`)
- `test_detector.py` (10 tests): DBNet++ ONNX inference, polygonal bounding boxes, IoU verification.
- `test_recognizer.py` (5 tests): PP-OCRv4 Latin character recognition, PP-OCRv3 Devanagari character recognition.
- `test_real_model_smoke.py` (5 tests): Real neural inference against physical ONNX checkpoints in `models/`. Real DBNet++ detection confidence $> 0.80$, English recognition confidence $> 0.85$, Devanagari recognition confidence $> 0.80$.
- `test_quantized_engine.py` (5 tests): Static INT8 QDQ quantization execution mode, CPU memory footprint $< 120\text{ MB}$.
- `test_stress_bugbash.py` (23 tests): Edge cases, zero-dimension crops, corrupted images, extreme aspect ratios.

### 2.3 Member 3: Semantic Extraction & Banned Units (`members/member-03-extraction/tests/`)
- `test_parsers.py` (56 tests): Parsing of Net Qty, MRP, USP, Dates, Address, Consumer Care, Origin.
- `test_extractor.py` (30 tests): Bounding box spatial clustering and token-to-field assignment.
- `test_adversarial_ocr_and_ecom.py` (12 tests): E-commerce DOM text ingestion, Rule 6(10) mfg date exemption, Latin abbreviations defense (`e.g.` masked to avoid `g.` unit false flag), corporate entity defense (`GM Foods` preserved).
- `test_stress_audit.py` (14 tests): Homoglyph attack resilience (Cyrillic lookalikes normalized to ASCII).
- `test_stress_industrial_chains.py` (7 tests): Extreme multi-line industrial packaging declarations.
- `test_stress_multilingual_adversarial.py` (7 tests): Mixed Hindi-English bilingual labels and Devanagari numerals (`२०० ग्राम`).
- `test_stress_fuzzing_concurrency.py` (5 tests): Multi-threaded concurrent text extraction with zero race conditions.

### 2.4 Member 4: Legal AST Rule Engine (`members/member-04-rule-engine/tests/`)
- `test_rules.py` (26 tests): Table-I Schedule Row 1 to Row 5 (strictly 6.0 mm), Rule 6 mandatory declarations, Rule 24 wholesale multi-packs.
- `test_courtroom_rule_engine_audit.py` (16 tests): Jan Vishwas Act 2023 compounding schedule, first offense vs repeat offense compounding limits.
- `test_stress_audit.py` (14 tests): Boundary condition testing: font height exactly on threshold ($2.50\text{ mm}$), font height in sensor uncertainty band ($2.46\text{ mm} \implies \text{REVIEW}$).
- `test_stress_fuzzing_concurrency.py` (5 tests): IEEE 754 floating point precision edge cases ($0.0199999$ vs $0.02$).

### 2.5 Member 5: Evidence & Backend Architecture (`members/member-05-evidence/tests/`)
- `test_auth_rbac.py` (10 tests): JWT generation, role hierarchy (ADMIN, CONTROLLER, INSPECTOR, VIEWER), token expiration.
- `test_bsa_certificate.py` (2 tests): Section 63 BSA 2023 electronic certificate generation, hardware serial, monotonic clock.
- `test_merkle.py` (4 tests): Merkle DAG parent-child chaining, tamper-detection (changing 1 byte in evidence alters Merkle root).
- `test_reportlab_pdf.py` (2 tests): ReportLab Form-1 Show Cause Notice PDF generation, exact millimeter layout.
- `test_pdf_concurrency_stress.py` (1 test): 50 concurrent threads generating Form-1 PDFs simultaneously with zero file collisions or deadlocks.
- `test_server_api.py` (13 tests): FastAPI REST endpoints, JSON schemas, error handlers.
- `test_database.py` (5 tests): SQLAlchemy models, SQLite/PostgreSQL relational integrity, transaction rollbacks.
- `test_storage_manager.py` (10 tests): Storage decoupling, path traversal rejection, file size limits (15 MB max), MIME type filtering.
- `test_sync_bundle.py` (3 tests): Mode B offline inspection export and Mode A central ingestion.

### 2.6 Member 6: Frontend & UI Components (`members/member-06-ui/tests/`)
- `Chunk 2 Contracts` (6 tests): TypeScript DTO contracts, API adapter, safe storage service.
- `Chunk 3 Inspection Desk` (4 suites, 8 tests): Case query & filtering, operational workflow vs statutory verdict separation, registration validation.
- `Chunk 4 Evidence Intake & HUD` (5 suites, 11 tests): Quality gate rendering, 4-state epistemic HUD handling, Devanagari unicode rendering, retry recovery.
- `Chunk 5 Golden Demonstration SKUs` (2 suites, 15 tests): SKU-DEMO-01 to SKU-DEMO-06 integration and verdict validation.
- `Chunk 6 HITL Adjudication & Audit` (10 tests): Officer override logging, mandatory remarks enforcement, append-only history, Merkle DAG rendering.
- `Chunk 7 Outcome & Report View` (12 tests): Controlled case closure, no autonomous notice generation, print layout styling.
- `RBAC & Security Gating` (5 tests): Inspector prohibited from dispatching notice, dynamic SVG coordinate mapping.

---

## 3. Real Packaging Physical Testing Suite (`tests/run_real_packaging_physical_tests.py`)

Eight physical commercial packaging items procured from Indian retail markets were tested against the full end-to-end pipeline:

| SKU ID | Commercial Product Name | Barcode | Calibrated Scale | PDP Area | Required Font | Measured Font | Statutory Verdict | Deficit / Finding |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `REAL-PKG-01` | Parle-G Gluco Biscuits | 8901063012822 | 3.12 px/mm | 153.7 cm² | 2.5 mm | 1.84 mm | **FAIL** | Font height deficit (-0.66 mm) |
| `REAL-PKG-02` | Britannia Good Day Cookies | 8901063016257 | 3.12 px/mm | 81.5 cm² | 1.5 mm | 2.10 mm | **PASS** | Fully compliant declarations |
| `REAL-PKG-03` | Britannia Bourbon Biscuits | 8901063012358 | 3.12 px/mm | 130.2 cm² | 2.5 mm | 2.80 mm | **PASS** | Compliant font height & declarations |
| `REAL-PKG-04` | Tata Salt Vacuum Evaporated | 8904043901015 | 3.12 px/mm | 135.2 cm² | 2.5 mm | 4.17 mm | **PASS** | Compliant font & declarations |
| `REAL-PKG-05` | Haldiram's Nagpur Aloo Bhujia | 8904004400731 | 3.12 px/mm | 123.0 cm² | 2.5 mm | 7.06 mm | **FAIL** | Prohibited unit `gm` under Sec 11 / Rule 12 |
| `REAL-PKG-06` | Amul Pasteurized Butter | 8901262010016 | 3.11 px/mm | 121.1 cm² | 2.5 mm | 6.42 mm | **PASS** | Standard unit `g` and compliant font |
| `REAL-PKG-07` | Cadbury Dairy Milk Chocolate | 7622202334009 | 3.12 px/mm | 80.5 cm² | 1.5 mm | 10.56 mm | **PASS** | Compliant declarations |
| `REAL-PKG-08` | Maggi 2-Minute Noodles | 9556001137722 | 3.12 px/mm | 75.9 cm² | 1.5 mm | 10.88 mm | **UNABLE_TO_VERIFY** | Optical blur score 52.5 < 100; retake advice |

**Empirical Result:** 100% of real packaging items were correctly triaged according to statutory rules without false accusations.

---

## 4. Advanced Metrological Calibration Stress Suite (`tests/run_advanced_calibration_stress_suite.py`)

| Benchmark Suite | Scenarios Tested | Empirical Validation Outcome | Status |
| :--- | :---: | :--- | :---: |
| **Suite 1: ISO 7810 ID-1 Card Fallback** | 5 | Accurate scale within $\pm 0.15\text{ mm}$ across 5 background contrast levels | **PASS** |
| **Suite 2: Extreme Perspective Distortions** | 6 | Survived perspective yaw/pitch up to $45^\circ$ with homography rectification | **PASS** |
| **Suite 3: Occlusion & Shadow Degradation** | 6 | Fiducial detection maintained under up to 85% directional shadow | **PASS** |
| **Suite 4: Cylindrical Packaging PDP Geometry** | 6 | Rule 2(h)(ii) $0.40\pi DH$ schedule verified on cans, jars, PET bottles, carboys | **PASS** |
| **Suite 5: Sensor Uncertainty Propagation** | 25 | ISO 17025 $k=2$ uncertainty band ($\pm 0.08\text{ mm}$) correctly routes to `REVIEW` | **PASS** |
| **Suite 6: Real FMCG Packaging Adversarial Attacks**| 8 | Motion blur, defocus, specular flash correctly rejected; zero false prosecutions | **PASS** |
| **TOTAL METROLOGY STRESS SCENARIOS** | **56** | **All 56 Metrological Stress Scenarios Verified (100% SUCCESS)** | **PASS** |

---

## 5. Discovered Defect Analysis & Root Causes

### 5.1 Defect 1: HTTP 500 on Legal Notice Re-Generation (CRITICAL)
- **Symptom:** Invoking `POST /api/v1/notices/generate` via REST API on an existing inspection record fails with HTTP 500: `sqlite3.IntegrityError: UNIQUE constraint failed: bsa_certificates.inspection_id`.
- **Root Cause:** In `members/member-05-evidence/src/server.py` line 1283, `generate_legal_notice` unconditionally creates and adds a new `BSACertificate` record:
  ```python
  bsa_cert = BSACertificate(
      id=f"cert_{uuid.uuid4()}",
      inspection_id=insp.id,
      ...
  )
  db.add(bsa_cert)
  db.flush()
  ```
  Because the database table `bsa_certificates` defines `inspection_id` as unique, this statement crashes if a certificate already exists.
- **Recommended Fix:** Query for an existing certificate first (`existing_cert = db.query(BSACertificate).filter_by(inspection_id=insp.id).first()`). If found, reuse its attributes or update it rather than calling `db.add()`.

### 5.2 Defect 2: Missing `playwright` Package in Workspace Virtual Environment
- **Symptom:** Running `tests/live_e2e_playwright_accuracy_suite.py` fails with `ModuleNotFoundError: No module named 'playwright'`.
- **Root Cause:** The dependency was not included in `requirements.txt` or was omitted during venv bootstrap.
- **Recommended Fix:** Add `playwright>=1.40.0` to `requirements.txt` and run `pip install playwright && playwright install chromium`.
