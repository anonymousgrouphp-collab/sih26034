# SIX-MEMBER PARALLEL WORKSTREAM ASSIGNMENT SPECIFICATION

**Project ID:** SIH26034  
**Product Name:** NyayaDrishti-LM  
**Governing Standard:** Six-Member Fully Parallel Development System  
**Status:** FROZEN & AUTHORITATIVE  

---

## Executive Overview

This document specifies the exact boundaries, inputs, outputs, acceptance criteria, and rules for each of the six developers on the NyayaDrishti-LM engineering team.

### Work Assignment Governance
1. **Team Lead Authority:** The **Team Lead manually assigns all work** across the team.
2. **AI Task Boundaries:** AI coding assistants and autonomous agents must **not** create additional member branches, automatically assign work, or redistribute member tasks. All development proceeds strictly against explicit Team Lead direction.

### 3-Tier Branch Hierarchy
```text
main (stable/approved baseline)
  ↓
dev (central integration branch)
  ↓
feat/m1-cv-metrology
feat/m2-ocr
feat/m3-extraction
feat/m4-rule-engine
feat/m5-evidence
feat/m6-ui (individual member branches)
```

### Mandatory Pre-Work Branch Sync Protocol
Before starting any new work on an assigned feature branch, every member must run:
```bash
git fetch origin
git checkout <member-branch>
git merge origin/main
```

**Development from `dev` Note:**
Because feature branches are developed from `dev`, the Team Lead may also require a feature branch to sync from the latest `dev` before integration work (e.g., `git merge origin/dev`). Always consult the Team Lead for integration sync timing.

### Git Operational Guardrails
- **Rebase:** Permitted **only** with explicit prior approval from the Team Lead. Merging is standard.
- **Uncommitted Changes:** Never overwrite or discard uncommitted work. Maintain clean working trees.
- **Force-Push:** Strictly prohibited unless explicitly approved by the Team Lead.
- **Conflict Escalation:** If conflicts affect contracts (`contracts/`), architecture, legal rules, or peer code, **stop immediately and escalate to the Team Lead**.
- **No Extra Feature Branches:** No member branches beyond the approved six may be created.

### Chunk-by-Chunk Execution & Signing Protocol
1. **Task Decomposition:** Decompose any assigned task into small, verifiable chunks before modifying code.
2. **Sequential Verification:** Implement and test one chunk at a time. Do not jump ahead.
3. **Signed Record:** Update `progress.md` with an official signing note (`SIGNED OFF BY: <handle> (<email>) — YYYY-MM-DD HH:MM IST [VERIFIED]`) upon completing each chunk.

### The Universal Non-Dependency Rule
Every member must be able to clone the repository, check out their branch, navigate to their assigned folder, run their fixtures, execute their test suite, and implement their module **without waiting for another member's unfinished implementation**. Cross-member coordination is achieved strictly through frozen contracts in `contracts/`.

---

## Member 1: Computer Vision, Optics & Metrology

- **Member Designation:** Member 1
- **Role:** Lead Computer Vision & Metrology Engineer
- **Assigned Folder:** `members/member-01-cv-metrology/`
- **Assigned Git Branch:** `feat/m1-cv-metrology`
- **Primary Objective:** Build the optical quality gate, metric scale calibration via fiducials, planar homography rectification, and packaging geometry / PDP area calculator.

### Required Reading
1. `01_MASTER_PROJECT_BLUEPRINT.md`
2. `03_FINAL_ARCHITECTURE.md` (Stages 1–5: Quality Gate, Homography, Calibration, PDP)
3. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-06: ArUco & Homography)
4. `07_API_AND_INTERFACE_CONTRACTS.md` (`QualityCheckDTO`, `CalibrationDTO`, `/api/v1/inspections/upload`)
5. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-CALIB-01`, `TS-CALIB-02`, `TS-OPTIC-01`, `TS-OPTIC-02`)
6. `16_DECISION_LOG.md` (ADL-03, ADL-17)
7. `17_OPEN_QUESTIONS.md` (OQ-01, OQ-04)
8. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 1: Optical & Measurement Claims)

### Inputs
- Raw packaging images (`.jpg`, `.png` $\ge 1080\text{p}$)
- In-scene fiducial reference: ArUco 4x4_50 marker ($50.0\text{ mm}$) or ISO 7810 ID-1 card ($85.60 \times 53.98\text{ mm}$)
- Local fixtures in `members/member-01-cv-metrology/fixtures/`

### Outputs (Contracts)
- Conforms to `contracts/quality_gate/quality_gate_dto.py` (`QualityCheckDTO`, `QualityGateResult`)
- Conforms to `contracts/calibration/calibration_dto.py` (`CalibrationDTO`, `PlanarHomographyResult`, `PDPGeometryDTO`)

### Acceptance Criteria
- **Blur Estimator:** Laplacian variance $\sigma^2 < 150 \implies \text{RETAKE}$ prompt.
- **Glare Detector:** Specular glare saturation $> 3\% \implies \text{RETAKE}$ prompt.
- **Perspective Skew Check:** Reject tilt $> 15^\circ$.
- **Calibration Precision:** Metric scale error $\le 0.15\text{ mm}$ (synthetic planar) and $\le 0.30\text{ mm}$ (retail pilot).
- **Execution Time:** $< 80\text{ ms}$ combined on multi-core CPU.

### Minimum Test Suite
- `test_quality_gate_clear_image()`
- `test_quality_gate_blurred_image()`
- `test_quality_gate_specular_glare()`
- `test_aruco_4x4_detection_and_scale()`
- `test_iso_card_contour_fallback()`
- `test_planar_homography_warp_rectification()`
- `test_rectangular_pdp_area_calculation()`
- `test_cylindrical_pdp_area_calculation()`

### Explicit Exclusions (What M1 Must NOT Do)
- Do NOT perform OCR or text recognition.
- Do NOT evaluate legal rules or penalties.
- Do NOT generate PDF notices.
- Do NOT import code from Members 2, 3, 4, 5, or 6.

---

## Member 2: Deep Learning & Multilingual OCR

- **Member Designation:** Member 2
- **Role:** Deep Learning & Multilingual OCR Engineer
- **Assigned Folder:** `members/member-02-ocr/`
- **Assigned Git Branch:** `feat/m2-ocr`
- **Primary Objective:** Build high-speed multilingual text detection and character recognition pipeline targeting CPU execution via ONNX Runtime INT8.

### Required Reading
1. `03_FINAL_ARCHITECTURE.md` (Stages 6 & 7: DBNet++ Text Detection, PP-OCRv4 Recognition)
2. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-03: AGPL Ban, ADR-05: ONNX INT8, ADR-06: Multilingual OCR)
3. `06_DATA_AND_MODEL_STRATEGY.md` (INT8 Quantization, Latency Budgets)
4. `07_API_AND_INTERFACE_CONTRACTS.md` (`OCROutput`, `OCRToken`)
5. `11_TESTING_AND_VALIDATION_PLAN.md` (Text Recognition CER $\le 2.5\%$)
6. `16_DECISION_LOG.md` (ADL-05, ADL-06, ADL-09)
7. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 3: AI & Architecture Claims)

### Inputs
- Rectified or raw label image crops (`.png`, `.jpg`)
- Synthetic and benchmark packaging crops from `members/member-02-ocr/fixtures/`

### Outputs (Contracts)
- Conforms to `contracts/ocr/ocr_dto.py` (`OCROutput`, `OCRToken`, `BoundingPolygon`)

### Acceptance Criteria
- **Model Licensing:** 100% Permissive (Apache-2.0 / MIT). Zero AGPL-3.0 copyleft code.
- **Accuracy:** Character Error Rate (CER) $\le 2.5\%$ on clean printed text; $\le 3.0\%$ on Devanagari text.
- **Inference Latency:** $\le 800\text{ ms}$ combined on CPU for detection + recognition.
- **Polygon Normalization:** Coordinate outputs normalized strictly to image dimensions.

### Minimum Test Suite
- `test_dbnet_text_detection_polygons()`
- `test_ppocr_english_recognition()`
- `test_ppocr_devanagari_hindi_recognition()`
- `test_tesseract_consensus_fallback()`
- `test_coordinate_normalization()`
- `test_low_contrast_and_noisy_crops()`

### Explicit Exclusions (What M2 Must NOT Do)
- Do NOT perform semantic entity parsing (that belongs to Member 3).
- Do NOT evaluate legal compliance (that belongs to Member 4).
- Do NOT depend on Member 1's homography module; use static image fixtures.

---

## Member 3: Semantic Extraction & NLP

- **Member Designation:** Member 3
- **Role:** Information Extraction & NLP Engineer
- **Assigned Folder:** `members/member-03-extraction/`
- **Assigned Git Branch:** `feat/m3-extraction`
- **Primary Objective:** Convert raw OCR tokens into structured, normalized statutory packaging entities without hallucinations.

### Required Reading
1. `02_FINAL_REQUIREMENTS_SPECIFICATION.md` (FR-07 to FR-13)
2. `03_FINAL_ARCHITECTURE.md` (Stage 8: Semantic Entity Classification)
3. `07_API_AND_INTERFACE_CONTRACTS.md` (`ExtractedFieldDTO`, `NormalizedCommodityFacts`)
4. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-UNIT-01`, `TS-UNIT-02`, `TS-UNIT-03`, `TS-UNIT-09`)
5. `16_DECISION_LOG.md` (ADL-04: Hybrid Perception-Verification)
6. `17_OPEN_QUESTIONS.md` (OQ-02: Minimum Address Parsing Tokens)
7. `CLAIMS_WE_MUST_NOT_MAKE.md`

### Inputs
- OCR token lists conforming to `contracts/ocr/ocr_dto.py`
- Frozen OCR JSON fixtures in `members/member-03-extraction/fixtures/`

### Outputs (Contracts)
- Conforms to `contracts/extraction/extraction_dto.py` (`NormalizedCommodityFacts`, `ExtractedFieldDTO`)

### Acceptance Criteria
- **Banned Unit Detection:** Flagger for prohibited units `gms`, `gm`, `Kgs`, `ML`, `ltrs` under Section 11 / Rule 12.
- **MRP Parsing:** Captures amount, currency (`INR`), and `tax_inclusive` boolean.
- **USP Parsing:** Captures unit price and normalized denominator (`g`, `ml`, `kg`, `l`).
- **Indic Numerals:** Accurate conversion of Devanagari digits (०..९) to decimal floats.
- **Address Parsing:** Validates State + 6-digit Indian PIN code.
- **Consumer Care 4-Tuple:** Checks contact person/office, address, telephone regex, email regex.

### Minimum Test Suite
- `test_banned_units_detection_gms()`
- `test_banned_units_detection_ml()`
- `test_valid_units_parsing_g_and_kg()`
- `test_mrp_regex_and_tax_clause()`
- `test_usp_regex_and_unit_denominator()`
- `test_devanagari_numeral_conversion()`
- `test_indian_postal_address_and_pin_parsing()`
- `test_consumer_care_completeness_and_missing_email()`

### Explicit Exclusions (What M3 Must NOT Do)
- Do NOT use generative LLMs to guess missing values.
- Do NOT make final legal PASS/FAIL determinations (that belongs to Member 4).
- Do NOT import code from Member 2; consume static OCR fixtures.

---

## Member 4: Statutory Legal Metrology Rule Engine

- **Member Designation:** Member 4
- **Role:** Legal Metrology & Rule Engine Architect
- **Assigned Folder:** `members/member-04-rule-engine/`
- **Assigned Git Branch:** `feat/m4-rule-engine`
- **Primary Objective:** Implement an auditable, deterministic Abstract Syntax Tree (AST) compliance engine for the Legal Metrology Act and LMPC Rules.

### Required Reading
1. `02_FINAL_REQUIREMENTS_SPECIFICATION.md` (FR-08 to FR-16)
2. `03_FINAL_ARCHITECTURE.md` (Stage 10: Deterministic Legal Metrology Rules)
3. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-07: AST Rule Engine)
4. `07_API_AND_INTERFACE_CONTRACTS.md` (`RuleEvaluationDTO`, `ComplianceVerdictResult`)
5. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-UNIT-04` through `TS-UNIT-13`)
6. `16_DECISION_LOG.md` (ADL-01: Table-I Row 5 6.0 mm, ADL-07: Temporal Epochs, ADL-12: 4-State Triage)
7. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 2: Legal & Regulatory Claims)

### Inputs
- `NormalizedCommodityFacts` from `contracts/extraction/extraction_dto.py`
- Millimeter font measurements from `contracts/calibration/calibration_dto.py`
- Synthetic and edge-case fixtures in `members/member-04-rule-engine/fixtures/`

### Outputs (Contracts)
- Conforms to `contracts/compliance/compliance_dto.py` (`ComplianceVerdictResult`, `RuleEvaluationDTO`)

### Acceptance Criteria
- **Table-I Font Schedule:** Exact thresholds based on PDP area ($\le 50\text{ cm}^2 \implies 1.0\text{ mm}$; $50-100 \implies 1.5\text{ mm}$; $100-500 \implies 2.5\text{ mm}$; $500-2500 \implies 4.0\text{ mm}$; $> 2500 \implies 6.0\text{ mm}$).
- **USP Consistency:** Verifies $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02$.
- **Temporal Epoch Router:** Dispatches to correct gazette snapshot based on product Mfg Date (2011 Base, 2017 Font, 2021 USP, 2023 Jan Vishwas).
- **E-Commerce Compliance:** Audits Rule 6(10) declarations, strictly exempting manufacturing date.
- **Epistemic 4-State Triage:** `PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`.
- **Reproducibility:** 100% deterministic; evaluation execution time $< 5\text{ ms}$.

### Minimum Test Suite
- `test_table_1_font_height_pass_and_fail()`
- `test_table_1_row_5_large_container_6mm()`
- `test_usp_mathematical_consistency()`
- `test_usp_inconsistency_flagged()`
- `test_temporal_epoch_pre_2021_skips_usp()`
- `test_temporal_epoch_post_2021_enforces_usp()`
- `test_ecommerce_mfg_date_statutory_exemption()`
- `test_ecommerce_country_of_origin_missing()`
- `test_four_state_epistemic_verdict_routing()`

### Explicit Exclusions (What M4 Must NOT Do)
- Do NOT use LLMs or heuristic guesses for legal decisions.
- Do NOT force incomplete evidence into a binary PASS/FAIL.
- Do NOT depend on Member 1 or Member 3 source code.

---

## Member 5: Backend, Platform & Evidentiary Dossier

- **Member Designation:** Member 5
- **Role:** Lead Backend, Platform, Security & Evidentiary Dossier Engineer
- **Assigned Folder:** `members/member-05-evidence/`
- **Assigned Git Branch:** `feat/m5-evidence`
- **Primary Objective:** Deliver FastAPI web services, PostgreSQL datastore, SHA-256 Merkle chain-of-custody ledger, and Section 63 BSA 2023 PDF/A inspection notice generator.

### Required Reading
1. `03_FINAL_ARCHITECTURE.md` (Stage 1 & 12, Component Matrix)
2. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-01: FastAPI, ADR-04: PostgreSQL/Storage, ADR-09: Merkle, ADR-10: BSA 2023, ADR-12: ReportLab)
3. `07_API_AND_INTERFACE_CONTRACTS.md` (Complete REST catalog & schemas)
4. `08_DATABASE_SPECIFICATION.md` (Complete DDL & indices)
5. `10_SECURITY_AND_AUDIT_SPECIFICATION.md` (JWT RBAC, Merkle DAG, Section 63 BSA Certificate)
6. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-EVID-01`, `TS-EVID-02`, `TS-WEB-01` to `TS-WEB-03`)
7. `16_DECISION_LOG.md` (ADL-02, ADL-08, ADL-14, ADL-15, ADL-19)
8. `CLAIMS_WE_MUST_NOT_MAKE.md`

### Inputs
- Inspection execution payloads conforming to `contracts/`
- Database configuration & test sessions
- Pipeline output fixtures in `members/member-05-evidence/fixtures/`

### Outputs (Contracts)
- Conforms to `contracts/evidence/evidence_dto.py` (`BSAEvidenceBundleDTO`, `MerkleNodeDTO`, `Section63CertificateDTO`)
- Relational schema matching `08_DATABASE_SPECIFICATION.md`
- Court-ready archival `InspectionNotice_Form1.pdf`

### Acceptance Criteria
- **Merkle DAG Integrity:** SHA-256 hash chaining of raw image, calibration, OCR, and rules; 100% tamper detection upon single-byte modification.
- **Section 63 BSA Certificate:** Generates legally sound digital certificate with device telemetry, monotonic UTC timestamp, and officer signature block.
- **PDF Generation:** Deterministic ReportLab PDF/A rendered in $< 1.5\text{ seconds}$ with embedded photographic crops and QR code.
- **REST Endpoints:** High-performance async FastAPI endpoints matching OpenAPI 3.1 contract.
- **Storage Decoupling:** Large images and PDFs stored in filesystem/storage; database rows store only relative paths and SHA-256 hashes.

### Minimum Test Suite
- `test_sha256_image_hashing()`
- `test_merkle_dag_construction_and_verification()`
- `test_tamper_detection_on_altered_payload()`
- `test_bsa_section_63_certificate_generation()`
- `test_reportlab_form1_pdf_generation()`
- `test_jwt_auth_and_rbac_permissions()`
- `test_upload_file_magic_bytes_validation()`
- `test_sqlite_mode_b_to_postgres_sync_bundle()`

### Explicit Exclusions (What M5 Must NOT Do)
- Do NOT store raw binary images as BLOBs in relational tables.
- Do NOT claim software replaces court admissibility scrutiny or uses a physical DSC token.
- Do NOT wait for Member 6; verify endpoints using pytest-asyncio and httpx.

---

## Member 6: Frontend, Web UX & Integration

- **Member Designation:** Member 6
- **Role:** Lead Frontend, Web UX & Integration Engineer
- **Assigned Folder:** `members/member-06-ui/`
- **Assigned Git Branch:** `feat/m6-ui`
- **Primary Objective:** Build responsive React 18 SPA, camera/upload HUD, split-view Adjudication Canvas, Central Dashboard, and local Mode B resilient UX.

### Required Reading
1. `03_FINAL_ARCHITECTURE.md` (Stage 11: HITL Adjudication Gate)
2. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-02: React 18 Vite, ADR-08: HITL, ADR-13: Online-First)
3. `07_API_AND_INTERFACE_CONTRACTS.md` (REST Request/Response Schemas)
4. `09_UI_UX_BLUEPRINT.md` (Design Tokens, Color Palette, Screen Inventory)
5. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-SYS-01` to `TS-SYS-03`)
6. `12_DEMO_PLAN.md` (3-Tier demo flow & 3-minute pitch script)
7. `16_DECISION_LOG.md` (ADL-13, ADL-18)
8. `17_OPEN_QUESTIONS.md` (OQ-05, OQ-06)
9. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 4: Connectivity Claims)

### Inputs
- Mock API response fixtures in `members/member-06-ui/fixtures/api/` conforming to `07_API_AND_INTERFACE_CONTRACTS.md`
- Design tokens and wireframes from `09_UI_UX_BLUEPRINT.md`

### Outputs (Contracts)
- Conforms to `contracts/ui/ui_contract_schema.json`
- Production-ready React 18 + Vite SPA bundle

### Acceptance Criteria
- **Screen Inventory:** Executive Dashboard (`/dashboard`), Inspector HUD (`/capture`), Verification Canvas (`/review/:id`), Notice Viewer (`/notices/:id`).
- **Adjudication Canvas:** Side-by-side view with synchronized zoom/pan, visual bounding overlays, and real-time pixel loupe.
- **Connection Telemetry:** Status badge indicating `ONLINE`, `LOCAL RESILIENT MODE`, or `DISRUPTED` with cached session state.
- **Design Tokens:** Strict alignment with Government Deep Ashoka Navy (`#1B365D`), Emerald 600 (`#059669`), Rose 600 (`#DC2626`).
- **Client Performance:** Sub-100 ms UI interaction responsiveness; zero external CDN dependencies in production bundle.

### Minimum Test Suite
- `test_dashboard_kpi_cards_render()`
- `test_capture_hud_quality_gate_feedback()`
- `test_adjudication_canvas_bounding_box_overlay()`
- `test_officer_override_requires_justification_remarks()`
- `test_mock_api_fallback_mode()`
- `test_connection_status_badge_behavior()`

### Explicit Exclusions (What M6 Must NOT Do)
- Do NOT block development waiting for the live backend server.
- Do NOT use Electron containers.
- Do NOT invent API endpoints not defined in `07_API_AND_INTERFACE_CONTRACTS.md`.
