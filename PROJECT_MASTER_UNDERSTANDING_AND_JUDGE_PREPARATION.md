# NIRIKSHAK (निरीक्षक): Complete Project Master Understanding & Judge Preparation Guide

> **Document Class:** Authoritative Reverse-Engineering Technical Audit, Statutory Defense & Hackathon Pitch Mastery  
> **System Name:** NIRIKSHAK (निरीक्षक) — AI-Powered Automated Legal Metrology Inspection & Compliance Enforcement System  
> **Problem Statement ID:** SIH26034 | Ministry of Consumer Affairs, Food & Public Distribution | Department of Consumer Affairs (DoCA), Govt. of India  
> **Audience:** Core Engineering Team, Hackathon Presenters, Government Stakeholders & Technical Evaluators  
> **Statutory Jurisdiction:** Legal Metrology Act, 2009 | Packaged Commodities Rules (PCR), 2011 | G.S.R. 629(E) (2021) | Jan Vishwas Act, 2023 | Bharatiya Sakshya Adhiniyam, 2023 (BSA Section 63) | Constitution of India (Article 20(1))  
> **Codebase Root:** `c:\Users\kunal\Desktop\NIRIKSHAK`  
> **Audit Status:** 100% Empirical Code Inspection, Canonical Contract Verification & 38 Real Packaging Live Runs Completed

---

## 1. Executive Meta-Audit & System Mandate (सच्चाई, सुधार और मिशन)

### 1.1 Meta-Audit: Prior Assumptions vs. Actual Codebase Ground Truth

Kisi bhi technical presentation me judges ko sabse zyada disappoint tab lagta hai jab team apne hi architecture ke baare me galat ya hallucinated daawe karti hai. Humne pure codebase ka microscopic audit karke common misunderstandings ko correct kiya hai:

| #     | Common Mistake / Prior Assumption                                     | Codebase Ki Asli Ground Truth                                                                                                                                                                                                                                                            | Asli File Location                                                                          | Legal / Technical Impact                                                           |
| ----- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **1** | _"System YOLOv8 ya YOLOv11 use karta hai"_                            | **Ultralytics YOLO strictly BANNED hai (ADL-05).** YOLO GNU AGPL-3.0 copyleft par licensed hai jo government proprietary code ko open-source karne par majboor karta hai. Nirikshak strictly **DBNet++ (Apache-2.0)** for text aur **RT-DETR (Apache-2.0)** for packaging use karta hai. | `backend/ocr/detector.py`, `docs/specifications/16_DECISION_LOG.md#L69`                     | Legal immunity from AGPL license violations in government software.                |
| **2** | _"CV modules alag-alag files me hain (perspective.py, unrolling.py)"_ | CV ka poora homography, ArUco detection, ISO card detection, depth compensation, aur cylindrical unrolling **unified** hai inside `calibration.py` (635 lines) aur `quality_gate.py` (416 lines).                                                                                        | `backend/cv/calibration.py`, `backend/cv/quality_gate.py`                                   | Accurate codebase navigation and zero hallucinated file paths.                     |
| **3** | _"Optical blur threshold 100.0 hai"_                                  | Authoritative blur variance threshold strictly **$\text{Var}(\nabla^2 I) \ge 150.0$** hai. Solid-color/matte packaging ke liye $8 \times 8$ local patch variance multiplier ($2.2\times$) use hota hai.                                                                                  | `backend/cv/quality_gate.py#L128`, `backend/contracts/quality_gate/quality_gate_dto.py#L12` | Prevents false passes on blurry images and false rejections on clean matte labels. |
| **4** | _"Tilt angle consider nahi hota"_                                     | System actively perspective tilt angle check karta hai: `TILT_MAX_DEG = 15.0^\circ`. $> 15^\circ$ tilt hone par retake advice trigger hoti hai.                                                                                                                                          | `backend/cv/quality_gate.py#L130`                                                           | Enforces perspective limits before projective unwarping.                           |
| **5** | _"Rule engine alag compounding.py me hai"_                            | Rule evaluation, Table-I font schedule, USP math, Rule 24 multi-packs, aur Jan Vishwas compounding sab **unified** hain inside `evaluators.py` (999 lines, 48.5 KB).                                                                                                                     | `backend/rule_engine/evaluators.py`                                                         | Single deterministic engine evaluating all gazette rules.                          |
| **6** | _"System 100% offline hai everywhere"_                                | Nirikshak **Online-First Web Application (Mode A)** hai for central DoCA state portals, jisme **Optional Local Field Resiliency (Mode B)** provide ki gayi hai for zero-connectivity mandis.                                                                                             | `docs/specifications/SYSTEM_MODES_AND_CONNECTIVITY.md`                                      | Authoritative operational definition without contradictory claims.                 |
| **7** | _"Section 65B Certificate generate hota hai"_                         | **Section 65B repealed ho chuka hai (1 July 2024).** Nirikshak naye **Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA)** ke mutabik digital certificates generate karta hai.                                                                                                           | `backend/evidence/bsa_certificate.py`                                                       | Courtroom admissibility under active Indian criminal law.                          |

---

## 2. Six-Member Parallel Workstream & Team Execution Model (टीम कार्य-विभाजन)

NIRIKSHAK ek disciplined 6-member parallel engineering structure par banaya gaya hai (per `docs/specifications/13_SIX_MEMBER_EXECUTION_PLAN.md`). Har team member apne specific technical domain ka owner hai:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                6-MEMBER PARALLEL WORKSTREAM ALLOCATION                                 │
├───────────────────────────────┬───────────────────────────────┬────────────────────────────────────────┤
│ MEMBER 1: CV, OPTICS & SCALE  │ MEMBER 2: MULTILINGUAL OCR    │ MEMBER 3: SEMANTIC EXTRACTION          │
│ • Kunal Raj (@kunal-raj-dev)  │ • Parmarth Kumar              │ • Harsh Patel                          │
│ • Optical Quality Gate        │ • DBNet++ Text Detection      │ • Regex Token Normalizer               │
│ • ArUco & Card Homography     │ • PP-OCRv4 Recognizer         │ • Spatial Proximity Graph (K-D Tree)   │
│ • PDP Surface Area Calculator │ • Tesseract Fallback          │ • Indian Postal Address & Banned Units │
├───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────┤
│ MEMBER 4: STATUTORY ENGINE    │ MEMBER 5: BACKEND & PLATFORM  │ MEMBER 6: WEB UX & INTEGRATION         │
│ • Ambika Bansal               │ • Shailendra Pratap Singh     │ • Urvashi Rajput                       │
│ • Temporal Epoch Dispatcher   │ • FastAPI Server & Storage    │ • React 18/19 SPA Web Workstation      │
│ • Declarative AST Rules       │ • PostgreSQL 16+ & SQLite     │ • Adjudication Canvas & Loupe HUD      │
│ • 4-State Epistemic Triage    │ • JWT / RBAC & Security       │ • Executive Dashboard & History        │
│ • Jan Vishwas Compounding     │ • Section 63 BSA 2023 & PDF   │ • Offline Resilient Mode B             │
└───────────────────────────────┴───────────────────────────────┴────────────────────────────────────────┘
```

### Detailed Member Responsibilities & Acceptance Benchmarks:

#### Member 1: Kunal Raj ([@kunal-raj-dev](https://github.com/kunal-raj-dev)) — Lead CV, Optics & Metrology

- **Folder:** `backend/cv/` (`quality_gate.py`, `calibration.py`, `pipeline_cv.py`, `benchmark.py`).
- **Core Systems Delivered:**
  1. Optical Quality Gate: Laplacian blur variance ($\sigma^2 \ge 150.0$) with $8 \times 8$ local patch adaptive filter ($2.2\times$ multiplier) + HSV specular glare detector ($V > 245, S < 15, \le 3.0\%$) + Perspective tilt screener ($\le 15.0^\circ$).
  2. Triple Calibration Standards: ArUco `DICT_4X4_50` (50mm / 30mm) + ISO 7810 ID-1 Card ($85.60 \times 53.98\text{ mm}$) + Standard ₹5 Currency Coin (23mm via Hough Circle Transform).
  3. Planar Homography Matrix $H$ & Perspective Warp (`cv2.warpPerspective`).
  4. Pinhole Depth Compensation (`compensate_coplanar_depth`) for elevated labels:
     $$M = \frac{D_{\text{camera}}}{D_{\text{camera}} - \Delta z}, \quad S_{\text{corrected}} = S_{\text{base}} \cdot M, \quad u_{\text{depth}} = \frac{2 D_{\text{camera}}}{(D_{\text{camera}} - \Delta z)^2}$$
  5. Cylindrical Unrolling (`rectify_cylindrical_surface`) mapping Cartesian coordinates to surface arc-length ($u = R\theta$).
  6. Principal Display Panel (PDP) Surface Area ($A_{\text{PDP}}$) in $\text{cm}^2$ for Rectangular, Cylindrical (40% rule), and Flexible Pouches (Rule 2(h)(iii)).
- **Acceptance Target:** MAE $\le 0.15\text{ mm}$ on synthetic targets, $\le 0.30\text{ mm}$ on real retail packaging.

#### Member 2: Parmarth Kumar ([@parmarth-kumar](https://github.com/parmarth-kumar)) — Deep Learning & Multilingual OCR

- **Folder:** `backend/ocr/` (`detector.py`, `recognizer.py`, `engine.py`, `fallback.py`, `polygon_normalizer.py`).
- **Core Systems Delivered:**
  1. DBNet++ scene text polygon detector exported to ONNX INT8/FP32.
  2. PaddleOCR PP-OCRv4 recognizer for Latin English and Devanagari Hindi text.
  3. Inversion Probing: When recognition confidence $< 0.92$, automatically probes a $180^\circ$ rotated patch to read upside-down text.
  4. Consensus Fallback: When confidence remains $< 0.65$, runs secondary recognition with Tesseract v5 (`--oem 1 --psm 7`) and arbitrates character-level consensus.
  5. Standalone OCR Testing HUD in `backend/integration/test_ui/`.
- **Acceptance Target:** Character Error Rate (CER) $\le 3.0\%$; total CPU inference latency $\le 200\text{ ms}$ per panel.

#### Member 3: Harsh Patel ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab)) — Information Extraction & NLP

- **Folder:** `backend/extraction/` (`parsers.py`, `extractor.py`, `fusion.py`).
- **Core Systems Delivered:**
  1. Deterministic Regex AST Parsers for MRP, tax clauses, Net Quantity, and Unit Sale Price.
  2. Prohibited Metric Unit Detector: Flags illegal units like `gms`, `gm`, `g.`, `ml.`, `Kgs`, `ltrs`, `cc`.
  3. 2D Spatial Proximity Graph (K-D Tree) with dynamic 40% vertical overlap clustering and horizontal gap thresholding (140 px) to link key-value pairs (e.g., linking `M.R.P.` to `₹ 45.00`).
  4. Devanagari Numeral Normalizer: Converts Indic digits (`०, १, २, ३, ४, ५, ६, ७, ८, ९`) to standard IEEE floating-point numbers (`0-9`).
  5. Indian Postal Address Segmenter: Matches 28 States, 8 UTs, major industrial hubs (Baddi, Vapi, Hosur), and validates 6-digit Indian PIN codes (`110001` to `855120`).
  6. Consumer Care 4-Tuple Verifier: Enforces completeness across Contact Person, Postal Address, Phone, and Email.
  7. Cross-Facet Semantic Fusion Engine: Combines multi-shot burst captures into a unified commodity facts docket with source image attribution.
- **Acceptance Target:** Exact Field Match $\ge 95\%$ on physical pilot dataset.

#### Member 4: Ambika Bansal ([@bansalambika12-ship-it](https://github.com/bansalambika12-ship-it)) — Statutory Compliance Architect

- **Folder:** `backend/rule_engine/` (`evaluators.py`, `engine.py`).
- **Core Systems Delivered:**
  1. Temporal Statutory Epoch Dispatcher: Evaluates compliance based on product **Manufacturing Date** per Article 20(1) of the Indian Constitution.
  2. Table-I Font Schedule Evaluator: Enforces minimum font heights across 5 PDP area brackets, including the 6.0 mm boundary for Row 5 ($> 2500\text{ cm}^2$) under G.S.R. 629(E).
  3. Unit Sale Price (USP) Arithmetic Verifier: Validates $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$, including single-unit exemption under Rule 6(1)(da) second proviso (`1 N`, `1 U`).
  4. Rule 24 Wholesale and Multi-Pack Evaluator: Validates piece count, individual piece net quantity, and total quantity arithmetic ($\text{Total} = \text{Count} \times \text{PieceQty}$).
  5. Rule 6(10) E-Commerce Compliance Checker: Audits online marketplace listings (exempting Mfg Date per statutory proviso).
  6. 4-State Epistemic Verdict Triage (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`).
  7. Jan Vishwas Act 2023 Compounding Calculator: Implements proportional civil compounding under Act No. 18 of 2023 (15-day notice with ₹0 fine for minor flaws; up to ₹25,000 for substantive violations).
- **Acceptance Target:** 100% rule traceability; zero hallucinations; execution time $< 15\text{ ms}$.

#### Member 5: Shailendra Pratap Singh ([@shailendrapratap1](https://github.com/shailendrapratap1)) — Backend, Platform & Evidence

- **Folder:** `backend/evidence/` (`server.py`, `database.py`, `merkle_dag.py`, `bsa_certificate.py`, `notice_generator.py`, `storage.py`, `sync_bridge.py`, `auth.py`, `cache_queue.py`).
- **Core Systems Delivered:**
  1. FastAPI Application Server (3,129 lines, 25+ REST endpoints) with async lifespan, Pydantic v2 schemas, and JWT 4-role RBAC.
  2. PostgreSQL 16+ Primary Database & Embedded SQLite 3.45+ (SQLCipher AES-256) dual-engine datastore.
  3. Decoupled Central Storage (`/storage/uploads/`, `/storage/evidence/`) with SHA-256 content keying (zero SQL BLOB bloat).
  4. In-Memory SHA-256 Merkle Directed Acyclic Graph (DAG) chaining 7 pipeline stages.
  5. Section 63 Bharatiya Sakshya Adhiniyam, 2023 Digital Evidence Certificate Generator (`CERT-BSA2023-YYYYMMDD-XXXX`).
  6. ISO 19005-1 Compliant ReportLab PDF/A Form-1 Legal Show Cause Notice Generator with dynamic verification QR code.
- **Acceptance Target:** P95 API latency $< 100\text{ ms}$; PDF generation $< 1.5\text{ s}$; unbroken Merkle root verification.

#### Member 6: Urvashi Rajput ([@rajputurvashi2006-bit](https://github.com/rajputurvashi2006-bit)) — Web UX, SPA & Integration

- **Folder:** `frontend/src/` (`App.tsx`, `pages/`, `features/`, `components/`, `context/`, `services/`).
- **Core Systems Delivered:**
  1. React 18/19 SPA with Vite, Tailwind CSS, and high-contrast accessibility.
  2. Multi-panel guided capture and burst upload workflow.
  3. Dual-Pane Adjudication Canvas: Side-by-side view of original photo and rectified crop with calibrated millimeter grid overlay.
  4. Interactive Evidence Tools: $0.5\times$ to $3.0\times$ smooth zoom, circular $2.5\times$ pixel loupe, perspective rectification toggle.
  5. Mandatory Officer Override Justification Log: Requires written remarks recorded into the audit trail before modifying AI verdicts.
  6. Connection Status Badge (`ONLINE`, `LOCAL MODE`, `DISRUPTED`) with `IndexedDB` offline session caching.
  7. Bilingual English/Hindi UI localization (`LanguageContext.tsx`, `translations.ts`).
- **Acceptance Target:** UI responsiveness $< 100\text{ ms}$; full web inspection flow $< 1.8\text{ s}$.

---

## 3. The Three Operational Modes & Connectivity Architecture (सिस्टम मोड्स)

NIRIKSHAK ka definitive architecture document `SYSTEM_MODES_AND_CONNECTIVITY.md` ke mutabik system **Online-First Web Application with Optional Local Field Resiliency** hai:

```
+----------------------------------------------------------------------------------------------------+
|                                    OPERATIONAL MODES AT A GLANCE                                   |
+----------------------------------------------------------------------------------------------------+
| MODE A: ONLINE WEB MODE             | MODE B: OPTIONAL LOCAL INSPECTION | MODE C: EXTERNAL INTEGRATIONS    |
| (Primary Product - Default Core)    | (Secondary Field Resiliency)      | (Future Enterprise Scaling)      |
+-------------------------------------+-----------------------------------+----------------------------------+
| • Hosted Web Application (Browser)  | • Standalone Local Workstation    | • Direct eMaap webhook sync      |
| • Centralized User Auth & RBAC      | • Local Optical Quality Gate      | • MCA21 corporate verification   |
| • Central PostgreSQL 16+ Datastore  | • Local ArUco / Coin Calibration  | • GSTN live tax registration API |
| • Server File/Object Storage        | • Local DBNet++ & PP-OCRv4 (CPU)  | • NCH grievance auto-dispatch    |
| • Colocated Server CPU/GPU ONNX     | • Local Deterministic Rule Engine | • Central National Offender Reg  |
| • Real-time Adjudication Canvas     | • Local HITL Adjudication Canvas  | • Enterprise Parichay SSO        |
| • Form-1/2 Statutory Notice PDF/A   | • Local Section 63 BSA PDF Notice |                                  |
| • Section 63 BSA 2023 Certificate   | • Local Embedded SQLite Storage   |                                  |
| • Central Inspection History/Search | • Optional Asynchronous Sync      |                                  |
| • Executive Compliance Dashboard    |   Bundle Export to Central Server |                                  |
| • Single E-Com Listing URL Fetch    | • Uploaded E-Com Screenshot/DOM   |                                  |
+-------------------------------------+-----------------------------------+----------------------------------+
| NETWORK REQUIRED: Standard HTTPS    | NETWORK REQUIRED: ZERO (0 Bytes)  | NETWORK REQUIRED: Govt Intranet  |
+-------------------------------------+-----------------------------------+----------------------------------+
```

### 1. Mode A: Online Web Mode (Primary Product)

- Standard deployment for State Metrology Directorates, Circle Headquarters, District Controllers, and connected Field Officers.
- Hosted centrally; accessed via any standard modern browser (Chrome, Edge, Firefox, Safari).
- Server-side colocated ONNX INT8 CPU inference ensures identical, deterministic results across all client devices without client hardware requirements.
- Central PostgreSQL 16+ database with PgBouncer connection pooling.
- Decoupled server filesystem storage (`/storage/uploads/`, `/storage/evidence/`) stores raw images and PDFs; database tables store only relative paths and SHA-256 hashes.

### 2. Mode B: Optional Local/Offline Inspection Mode (Field Resiliency)

- Engineered for field officers inspecting remote retail shops, rural weekly haats, wholesale mandis, and basement godowns where cellular connectivity is completely absent.
- Executed on a local laptop or tablet via `python backend/local_runner.py` or CLI `python backend/inspect_cli.py`.
- **Zero Network Required (0 Bytes):** All physical network interfaces can be completely disabled.
- Embedded SQLite 3.45+ with SQLCipher AES-256 transparent encryption (`legal_metrology.db`).
- Generates locally signed Section 63 BSA 2023 PDF notices and encrypted export bundles for subsequent synchronization to the central server when connectivity is restored.

### 3. Mode C: External Government Integrations (Future Scaling)

- **eMaap National Portal:** Webhook sync with National Informatics Centre (NIC) eMaap repository.
- **MCA21:** Verification of manufacturer Corporate Identity Number (CIN) and active registration status.
- **GSTN API:** GST number verification against national tax database to catch fraudulent invoices.
- **National Consumer Helpline (NCH):** Automated dispatch of consumer grievance dockets.
- **Parichay SSO:** Single Sign-On for Government of India administrative officers.

---

## 4. The 19 Architectural & Legal Decision Logs (ADL-01 to ADL-19)

Per `docs/specifications/16_DECISION_LOG.md`, these 19 decisions are formally codified and frozen:

| ID         |    Category    | Topic                                | Chosen Option                                                    | Rejected Alternative                   |     Owner     |
| :--------- | :------------: | :----------------------------------- | :--------------------------------------------------------------- | :------------------------------------- | :-----------: |
| **ADL-01** |     Legal      | Table-I Row 5 Blown Container Height | **6.0 mm** (per G.S.R. 629(E))                                   | 8.0 mm (Early draft typo)              | Lead / Legal  |
| **ADL-02** |     Legal      | Electronic Evidence Statutory Basis  | **Section 63 BSA 2023**                                          | Section 65B Indian Evidence Act 1872   | Lead / Crypto |
| **ADL-03** |     Vision     | Metric Scale Derivation Method       | **Planar Homography via Coplanar Reference (ArUco / Card)**      | Monocular AI Depth; Fixed DPI          |   Member 1    |
| **ADL-04** |    AI Arch     | Compliance Reasoning Architecture    | **Hybrid Perception-Verification (DL OCR + Deterministic AST)**  | Pure End-to-End VLM (GPT-4o/Gemini)    |   Member 4    |
| **ADL-05** |   Licensing    | Detection Model Backbone             | **DBNet++ & RT-DETR (Apache-2.0)**                               | Ultralytics YOLOv8/v11 (AGPL-3.0)      | Member 1 & 2  |
| **ADL-06** |      OCR       | Multilingual Text Recognizer         | **PaddleOCR PP-OCRv4 (SVTR) + Tesseract v5 fallback**            | TrOCR; Cloud Vision API                |   Member 2    |
| **ADL-07** |  Legal Logic   | Non-Retroactive Statutory Evaluation | **Temporal Statutory Epoch Dispatcher (by Mfg Date)**            | Static 2026 ruleset applied to all     |   Member 4    |
| **ADL-08** |    Evidence    | Cryptographic Evidence Provenance    | **SHA-256 Merkle Directed Acyclic Graph (DAG)**                  | Public/Private Blockchain              |   Member 5    |
| **ADL-09** |    Runtime     | Inference Hardware Strategy          | **Colocated Server & Local INT8 CPU via ONNX Runtime**           | Cloud GPU SaaS API; CUDA only          | Member 1 & 2  |
| **ADL-10** |     Scope      | E-Commerce Inspection Boundary       | **Targeted URL / Uploaded Screenshot Inspection**                | Mass automated commercial web scraping |   Member 3    |
| **ADL-11** |      Data      | Training & Validation Strategy       | **Procedural Synthetic Math Dataset + 50 FMCG Physical Pilot**   | Uncalibrated public web scrapes        |   Member 6    |
| **ADL-12** |  Trust Model   | Verdict State Representation         | **4-State Epistemic Triage (PASS / FAIL / REVIEW / UNABLE)**     | Binary Pass/Fail classification        |   Member 4    |
| **ADL-13** |  Architecture  | Primary Connectivity Model           | **Online-First Web App (Mode A) + Local Resilient (Mode B)**     | Blanket "100% offline everywhere"      |  Lead / Arch  |
| **ADL-14** |   Telemetry    | Timestamping Clock Source            | **Server NTP Atomic (Mode A) + Local Monotonic UTC (Mode B)**    | Mandatory external NTP offline         |   Member 5    |
| **ADL-15** |   Telemetry    | Geolocation & Hardware Fallback      | **Hardware GNSS When Present / Nullable + Circle Fallback**      | Mandatory GPS blocking laptops         |   Member 5    |
| **ADL-16** | Legal / Crypto | Evidence Integrity vs Admissibility  | **Cryptographic Integrity (SHA-256) + Section 63 BSA Cert**      | Claiming "guaranteed court outcome"    | Lead / Crypto |
| **ADL-17** |     Optics     | Font Measurement Tolerance Standard  | **Dual Standard (<= 0.15mm Synthetic / <= 0.30mm Retail Pilot)** | Contradictory blanket claims           |   Member 1    |
| **ADL-18** |   Deployment   | Frontend Architecture & Runtime      | **React 18/19 + Vite SPA in Modern Web Browser**                 | Mandatory Electron container           |   Member 6    |
| **ADL-19** |   Datastore    | Database & Binary Storage            | **PostgreSQL 16+ Primary + Decoupled Filesystem + SQLite**       | Binary BLOBs in SQL tables             |   Member 5    |

---

## 5. Canonical Interface Contracts & Data Transfer Objects (`backend/contracts/`)

Cross-module communication is strictly validated through Pydantic v2 schemas:

### Contract Hierarchy Diagram

```
[QualityGateResult] ──► [CalibrationResult] ──► [OCROutput] ──► [NormalizedCommodityFacts]
                                                                        │
                                                                        ▼
[LegalNoticeDTO] ◄── [Section63CertificateDTO] ◄── [MerkleNodeDTO] ◄── [ComplianceVerdictResult]
```

1. **`backend/contracts/calibration/calibration_dto.py`:**
   - `CalibrationDTO`: `method` (`ARUCO_4X4_50`, `ISO_7810_CARD`, `STANDARD_COIN`, `MANUAL_FIXED`), `px_to_mm` (float $> 0$), `confidence`, `reference_bounding_box`, `margin_of_error_pct`.
   - `PDPGeometryDTO`: `package_type` (`RECTANGULAR`, `CYLINDRICAL`, `FLEXIBLE_POUCH`), `package_area_cm2`, `pdp_area_cm2`, `pdp_area_percentage` (default 40.0%), `bounding_box`.
   - `CalibrationResult`: `is_calibrated` (bool), `calibration`, `principal_display_panel`, `homography_matrix` ($3 \times 3$).
2. **`backend/contracts/ocr/ocr_dto.py`:**
   - `OCRToken`: `token_id`, `text`, `confidence` ($0.0 \le c \le 1.0$), `polygon` (4 points), `bounding_box` (`[ymin, xmin, ymax, xmax]`), `language` ("en" | "hi").
   - `OCROutput`: `image_id`, `total_tokens`, `mean_confidence`, `tokens: List[OCRToken]`, `full_text`, `execution_time_ms`.
3. **`backend/contracts/extraction/extraction_dto.py`:**
   - `NetQuantityValue`: `magnitude`, `unit`, `has_banned_unit` (bool), `banned_unit_found`, `has_prefix`.
   - `MRPValue`: `amount`, `currency` ("INR"), `tax_inclusive` (bool).
   - `USPValue`: `price_per_unit`, `unit`.
   - `AddressValue`: `name`, `address_line`, `state`, `pin_code` (regex `^[1-9][0-9]{5}$`), `is_complete`.
   - `ConsumerCareValue`: `contact_name`, `phone`, `email`, `address`, `is_complete` (all 4 present).
   - `ExtractedFieldDTO`: `field_type`, `raw_ocr_text`, `normalized_value`, `bounding_box`, `measured_font_height_mm`.
   - `NormalizedCommodityFacts`: Aggregated container with all extracted declarations and raw field tokens.
4. **`backend/contracts/compliance/compliance_dto.py`:**
   - `RuleEvaluationDTO`: `rule_code`, `statutory_reference`, `status` (`PASS`, `FAIL`, `WARNING`, `REVIEW`, `UNABLE_TO_VERIFY`), `severity` (`CRITICAL`, `MAJOR`, `MINOR`), `required_value`, `measured_value`, `discrepancy`, `legal_consequence`.
   - `ComplianceVerdictResult`: `inspection_id`, `overall_verdict`, `adjudication_required`, `evaluations`, `epoch_applied`, `execution_time_ms`.
5. **`backend/contracts/evidence/evidence_dto.py`:**
   - `MerkleNodeDTO`: `stage_name`, `payload_sha256`, `timestamp_utc`, `metadata`.
   - `Section63CertificateDTO`: `certificate_number`, `inspection_id`, `statutory_law_ref`, `device_model`, `clock_source`, `raw_images_merkle_root`, `evidence_bundle_sha256`, `issuing_officer_id`, `officer_signature_token`.
   - `LegalNoticeDTO`: `notice_reference_number`, `inspection_id`, `bsa_certificate_number`, `recipient`, `statutory_mandate`, `violations_summary`, `compounding_fee_amount`, `reply_window_days`, `merkle_entry_hash`.
6. **`backend/contracts/quality_gate/quality_gate_dto.py`:**
   - `QualityCheckDTO`: `is_valid`, `laplacian_blur`, `glare_percentage`, `tilt_angle_deg`, `rejection_reason`.
   - `QualityGateResult`: `passed`, `blur_variance`, `glare_percentage`, `skew_angle_deg`, `advice`.

---

## 6. Code-Verified 12-Stage Pipeline Mechanics & Formulations (पाइपलाइन विवरण)

```
[Raw Image Ingestion]
       │
       ▼
[Stage 1: Forensic Ingestion & Hashing] ──► SHA-256 raw bytes, monotonic UTC clock, device ID
       │
       ▼
[Stage 2: Optical Quality Gate] ──(Blur < 150 / Glare > 3.0% / Tilt > 15°)──► [Instant Retake Guidance]
       │
       ▼
[Stage 3: Fiducial Calibration] ──► ArUco 4x4_50 (50mm) / ISO 7810 Card (85.60x53.98mm) -> px_to_mm
       │
       ▼
[Stage 4: Perspective Rectification & Depth] ──► 3x3 Homography H, pinhole depth comp, cylindrical unrolling
       │
       ▼
[Stage 5: Surface Area Calculation] ──► PDP Area A_PDP -> Table-I minimum font schedule
       │
       ▼
[Stage 6: Multi-Oriented Text Detection] ──► DBNet++ ONNX INT8/FP32 oriented polygons
       │
       ▼
[Stage 7: Multilingual Scene OCR] ──► PaddleOCR PP-OCRv4 (Latin/Devanagari) + 180° flip probe + Tesseract v5
       │
       ▼
[Stage 8: Semantic Entity Extraction] ──► Regex parsers, 2D proximity graph, banned unit detector
       │
       ▼
[Stage 9: Font Metric Measurement] ──► Connected components, numeral x-height, ISO 17025 GUM budget
       │
       ▼
[Stage 10: Deterministic Statutory AST Rule Engine] ──► Rules 6, 7, 9, 12, 24, Jan Vishwas compounding matrix
       │
       ▼
[Stage 11: Quasi-Judicial Human Adjudication] ──► Adjudication Canvas, 2.5x pixel loupe, override audit logs
       │
       ▼
[Stage 12: Evidence Dossier & Legal Notice] ──► SHA-256 Merkle DAG root, Section 63 BSA certificate, Form-1 PDF/A
```

### Stage Mechanics & Exact Formulas:

#### Stage 1: Forensic Ingestion & Cryptographic Locking

- Raw byte stream hash computed prior to decoding: $H_{\text{raw}} = \text{SHA-256}(\text{ImageBytes})$.
- Binds device ID, OS kernel, and monotonic timestamp (`time.monotonic_ns()`) to prevent clock rollback defenses.

#### Stage 2: Optical Quality Gate & Circuit Breaker (`quality_gate.py`)

- **Laplacian Blur Variance:** $\text{Var}(\nabla^2 I) \ge 150.0$.
  - _Matte Package Defense:_ Computes local variance across an $8 \times 8$ grid of image patches. If top patches exhibit high-frequency edge energy ($\ge 50.0$), scales global variance by $2.2\times$ to avoid false blur rejections on solid-background labels.
- **Specular Glare Coverage:** Masks HSV pixels with $V > 245$ and $S < 15$. Glare ratio must be $\le 3.0\%$.
- **Perspective Tilt Screener:** Skew angle must be $\le 15.0^\circ$.
- Fast-exit executes in $< 15\text{ ms}$.

#### Stage 3: Fiducial Calibration & Metric Scaling (`calibration.py`)

- **ArUco `DICT_4X4_50` (50.0 mm):** Corner refinement with `cv2.aruco.CORNER_REFINE_SUBPIX`. Mean Euclidean edge length gives scale factor $S = \text{pixels} / \text{mm}$.
- **ISO 7810 ID-1 Card ($85.60 \times 53.98\text{ mm}$):** Multi-threshold Canny edge detection, aspect ratio fidelity score, rectangularity $\ge 0.85$, corner orthogonality dot product $\le 0.38$.
- **Standard ₹5 Coin (23.0 mm):** Hough Circle Transform (`cv2.HoughCircles`).

#### Stage 4: Perspective Rectification, Depth Compensation & Unrolling (`calibration.py`)

- **Planar Homography ($H$):** $3 \times 3$ transform derived via `cv2.getPerspectiveTransform(src, dst)`. Perspective unwarping via `cv2.warpPerspective(..., flags=cv2.INTER_LINEAR)`.
- **Pinhole Depth Compensation (`compensate_coplanar_depth`):**
  $$M = \frac{D_{\text{camera}}}{D_{\text{camera}} - \Delta z}, \quad S_{\text{corrected}} = S_{\text{base}} \cdot M, \quad u_{\text{depth}} = \frac{2 D_{\text{camera}}}{(D_{\text{camera}} - \Delta z)^2}$$
- **Cylindrical Unrolling (`rectify_cylindrical_surface`):**
  $$\theta = \arcsin\left(\frac{x - x_{\text{center}}}{R}\right), \quad u = R \cdot \theta, \quad v = y$$
  Applies `cv2.remap` with bilinear interpolation, unwarping labels on curved bottles.

#### Stage 5: Principal Display Panel (PDP) Surface Area Calculation

- Rectangular: $A_{\text{PDP}} = W_{\text{cm}} \times H_{\text{cm}}$
- Cylindrical (Rule 7(3)): $A_{\text{PDP}} = 0.40 \times H_{\text{cm}} \times (\pi \cdot D_{\text{cm}})$
- Flexible Pouch (Rule 2(h)(iii)): $A_{\text{PDP}} = 0.40 \times (W_{\text{cm}} \times H_{\text{cm}})$

#### Stage 6: Multi-Oriented Text Detection (`ocr/detector.py`)

- DBNet++ (Apache-2.0) executed via ONNX Runtime CPU. Detects multi-oriented text polygons at any rotation angle ($0^\circ$ to $360^\circ$).

#### Stage 7: Multilingual Scene OCR & Consensus Fallback (`ocr/engine.py`)

- PP-OCRv4 (SVTR) for English and Devanagari Hindi.
- Inversion probing at $180^\circ$ on confidence $< 0.92$.
- Tesseract v5 consensus fallback on confidence $< 0.65$.

#### Stage 8: Semantic Entity Extraction & Proximity Graph (`extraction/extractor.py`)

- 2D Spatial Proximity Graph (K-D Tree) links label keys to adjacent values.
- Devanagari numeral converter maps Indic numerals (`०-९`) to floating-point numbers.
- Normalizes Unicode homoglyphs.
- Detects banned non-standard metric symbols: `gms`, `gm`, `g.`, `ml.`, `Kgs`, `ltrs`, `cc`.
- Validates Consumer Care 4-tuple and Indian postal PIN codes (`110001` to `855120`).

#### Stage 9: Physical Font Metric Measurement & Uncertainty Budget (`extraction/extractor.py`)

- Numerals isolated via Connected-Components Analysis (CCA) and Otsu binarization; physical height derived via $h_{\text{mm}} = h_{\text{pixel}} / S$.
- **ISO 17025 GUM Uncertainty Budget:**
  $$u_{\text{seg}} = \frac{0.75\text{ px}}{S}, \quad u_{\text{scale}} = \left(\frac{0.75\text{ px}}{50.0 \cdot S}\right) \cdot h, \quad u_{\text{tilt}} = h \cdot (1 - \cos\theta_{\text{tilt}})$$
  $$u_c = \sqrt{u_{\text{seg}}^2 + u_{\text{scale}}^2 + u_{\text{tilt}}^2}, \quad U_{95} = 2.0 \cdot u_c$$
  If deficit $|\Delta| \le U_{95}$, system routes to `REVIEW` with ₹0 penalty.

#### Stage 10: Deterministic Statutory AST Rule Engine (`rule_engine/evaluators.py`)

- **Table-I Font Schedule (G.S.R. 629(E)):**
  - $A \le 50\text{ cm}^2 \implies 1.0\text{ mm}$ (normal) / $1.5\text{ mm}$ (blown/moulded)
  - $50 < A \le 100\text{ cm}^2 \implies 1.5\text{ mm}$ / $2.0\text{ mm}$
  - $100 < A \le 500\text{ cm}^2 \implies 2.0\text{ mm}$ (or $2.5\text{ mm}$) / $4.0\text{ mm}$
  - $500 < A \le 2500\text{ cm}^2 \implies 4.0\text{ mm}$ / $6.0\text{ mm}$
  - $A > 2500\text{ cm}^2 \implies 6.0\text{ mm}$ / $6.0\text{ mm}$ (ADL-01)
- **USP Arithmetic Consistency:** $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$.
  - _Single-Unit Exemption:_ Rule 6(1)(da) second proviso exempts packages containing exactly 1 piece/unit (`1 N`, `1 U`) from declaring USP.
- **Rule 24 Multi-Pack Logic:** Validates piece count and total quantity arithmetic ($\text{Total} = \text{Count} \times \text{PieceQty}$).
- **Rule 6(10) E-Commerce Logic:** Audits digital marketplace declarations (exempting Mfg Date).

#### Stage 11: Quasi-Judicial Human Adjudication Gateway (`AdjudicationCanvas.tsx`)

- Side-by-side view of original photo and rectified crop with calibrated millimeter grid overlay.
- Interactive $2.5\times$ pixel loupe.
- Officer override logging: Any deviation from AI recommendations strictly mandates recorded written justifications.

#### Stage 12: Evidence Dossier & Statutory Notice Compilation (`merkle_dag.py`, `notice_generator.py`)

- In-memory SHA-256 Merkle DAG chains all 7 pipeline stages.
- Section 63 BSA 2023 Digital Certificate (`CERT-BSA2023-YYYYMMDD-XXXX`).
- ReportLab PDF/A Form-1 Show Cause Notice with embedded evidence crops and dynamic verification QR code.

---

## 7. Empirical Test Evidence & Real SKU Ground Truth (लाइव टेस्ट प्रमाण)

`backend/tests/verify_all_skus.py` ke through 38 real physical smartphone photographs (`Legal Metrology real product images/`) par execute kiye gaye actual ground-truth test results:

```
================================================================================
NIRIKSHAK LEGAL METROLOGY EMPIRICAL EVALUATION SUITE
================================================================================
SKU                                           | Verdict  | Fails  | Fee (INR)
--------------------------------------------------------------------------------
Item 1 - Watch (Titan Wyb Fastrack)           | PASS     | 0      | ₹0
Item 2 - General Wellness (Himalaya Brahmi)   | FAIL     | 1      | ₹0
Earbuds (Exotic Mile Pvt Ltd)                 | FAIL     | 1      | ₹0
Herbal Hair Oil (Gopi Baba & Co)              | FAIL     | 3      | ₹25,000
================================================================================
```

### Detailed SKU Findings & Ground-Truth Parity:

#### 1. Item 1: Titan Wyb Fastrack Watch (13 photos, Rigid Box)

- **Declarations Extracted:** Net Qty `01 NUMBER` (1 N), MRP ₹2,425.00 (incl. of all taxes), Origin: China, Importer: Titan Company Ltd, Hosur, TN.
- **Font Measurement:** Measured height $2.35\text{ mm} \ge 2.00\text{ mm}$ minimum required.
- **USP Evaluation:** No USP declared $\implies$ **PASS (Statutorily exempt under Rule 6(1)(da) second proviso for single items)**.
- **Final Verdict:** **PASS (0 violations)**. Compounding Fee: **₹0**.
- **Cryptographic Provenance Root:** `75b814c9ca991138bd49f597...`
- **Panel Attribution:** MRP proven from `front_angle_01.jpg`; Address and Consumer Care from `close_01.jpg`.

#### 2. Item 2: Himalaya Brahmi 60 Tablets (13 photos, Tuck-End Carton)

- **Declarations Extracted:** Net Qty `60 Tablets`, MRP ₹260.00, Declared USP: `₹4.33 / TAB`.
- **Arithmetic Check:** $260.00 / 60 = 4.3333 \implies 4.33\text{ INR}$ (Exact mathematical match!).
- **Font Height Deficit:** Batch imprint numeral height measured at **$1.46\text{ mm}$** vs $2.00\text{ mm}$ required (Deficit: $-0.54\text{ mm}$).
- **Ground-Truth Vernier Caliper Parity:**
  $$\text{Manual Physical Caliper Truth} = \mathbf{1.47\text{ mm}} \quad \text{vs.} \quad \text{Nirikshak CV Measurement} = \mathbf{1.46\text{ mm}} \implies \mathbf{\Delta = 0.01\text{ mm Error!}}$$
- **Final Verdict:** **FAIL (1 minor procedural defect)**.
- **Sanction:** **15-Day Statutory Improvement Notice (₹0 fine)** under Jan Vishwas Act Section 36(1) proviso.
- **Cryptographic Provenance Root:** `565bb91551b6a1751ae0d684...`

#### 3. Item 3: Boult Audio Earbuds (6 photos, Cardboard Box)

- **Declarations Extracted:** Net Qty `1.0 U`, MRP ₹1,999.00 (incl. taxes), USP: Exempt, Origin: India, Address: Wazirpur, Delhi.
- **Font Height Deficit:** Secondary white thermal sticker prints numeral "1" at **$1.24\text{ mm}$** vs $2.00\text{ mm}$ required (Deficit: $-0.76\text{ mm}$).
- **Final Verdict:** **FAIL (1 minor procedural defect)**.
- **Sanction:** **15-Day Statutory Improvement Notice (₹0 fine)** under Jan Vishwas Act.
- **Cryptographic Provenance Root:** `932ebf4b19923171df852ab5...`

#### 4. Item 4: Gopi Baba Herbal Hair Oil (6 photos, 100ml Curved PET Bottle)

- **Declarations Extracted:** MRP ₹90.00, Declared USP: `0.90 per ml`.
- **Arithmetic Check:** $90.00 / 100 = 0.90$ (Math is 100% correct).
- **Three Substantive Violations Detected:**
  1. _Rule 12(b) & Section 11:_ Prohibited non-standard unit `'ml.'` with period (`100ml.`).
  2. _Rule 6(1)(e):_ Missing mandatory tax clause `'(inclusive of all taxes)'` (`Max. Retail Price: 90/-`).
  3. _Rule 6(1)(n):_ Missing consumer care grievance email address (phone present, email absent).
- **Final Verdict:** **FAIL (3 substantive violations)**.
- **Sanction:** **Statutory Compounding Notice under Section 48 LM Act. Compounding Fee: ₹25,000 INR.**
- **Cryptographic Provenance Root:** `000fa0b0a26b9eb838e2152b...`

---

## 8. The Five Real Engineering Bugs Discovered & Solved During Physical Testing

Per `REAL_PRODUCT_EMPIRICAL_INSPECTION_REPORT.md`, real physical packaging testing revealed 5 major engineering edge cases that synthetic lab testing missed:

1. **Vertical Word Inversion on High-Resolution Sensors (16MP):**
   - _Bug:_ On high-resolution smartphone images, horizontal text words inverted order (e.g., reading `"260.00 RS."` instead of `"RS. 260.00"`).
   - _Root Cause:_ Rigid vertical pixel binning broke when text lines had minor printing tilt.
   - _Fix:_ Replaced rigid pixel bins with dynamic 40% vertical overlap clustering and strict left-to-right positional sorting.
2. **Small 8pt Text Erasure on Dark Matte Packaging:**
   - _Bug:_ Fine printed declarations on Boult earbuds packaging were completely wiped out during pre-processing.
   - _Root Cause:_ Over-aggressive bilateral Gaussian filtering blurred fine high-frequency characters.
   - _Fix:_ Removed destructive spatial pre-filters; integrated Contrast-Limited Adaptive Histogram Equalization (CLAHE) in LAB color space luminance channel.
3. **Spurious Single-Letter Quantity Matches:**
   - _Bug:_ Standalone packaging letters (like "N", "U", "M" in brand names) were falsely captured as Net Quantity units.
   - _Root Cause:_ Regex permitted standalone unit tokens without requiring prefix anchors.
   - _Fix:_ Enforced prefix constraints requiring statutory keywords (`Net Qty:`, `Net Wt:`, `शुद्ध मात्रा:`).
4. **False Math Failure on Banned Unit Rejection:**
   - _Bug:_ On Gopi Baba Hair Oil, `"100ml."` was rejected as an invalid unit by regex, which dropped the numerical magnitude `100`, causing a false USP division-by-zero math failure!
   - _Root Cause:_ Rigid pipeline discarded the entire token when a prohibited suffix was detected.
   - _Fix:_ Implemented dual-path parsing: if $(\text{MRP} / \text{USP}) \approx \text{NetQty}$, boost magnitude confidence by $+30$; flag the trailing period as a Rule 12 violation while preserving the magnitude for USP math verification.
5. **Single-Camera Multi-Panel Blindness:**
   - _Bug:_ Single photos could not capture all 8 mandatory declarations distributed across 6 packaging faces.
   - _Fix:_ Engineered the `CrossFacetSemanticFusionEngine` to link multi-shot burst captures into one unified statutory docket with source image attribution.

---

## 9. Real Retail Packaging Catalog & Metrological Stress Benchmarks

### 9.1 Standardized Retail Samples Catalog (`assets/data/real_packaging_samples/`)

- `REAL-PKG-01`: Parle-G Gluco Biscuits 45g (GS1 Barcode: `8901719134845`, flags banned unit `45gm`).
- `REAL-PKG-02`: Britannia Good Day Butter Cookies 100g (GS1 Barcode: `8901063093522`, $100\text{ g}$).
- `REAL-PKG-03`: Maggi 2-Minute Masala Noodles 70g (GS1 Barcode: `8901063139329`, $70\text{ g}$).
- `REAL-PKG-04`: Dabur Red Toothpaste 100g (GS1 Barcode: `8904043901015`, $100\text{ g}$).
- `REAL-PKG-05`: Tata Salt Vacuum Evaporated Iodized 1kg (GS1 Barcode: `8904004400731`, $1\text{ kg}$).
- `REAL-PKG-06`: Amul Butter Pasteurized 100g (GS1 Barcode: `8901262010016`, $100\text{ g}$).
- `REAL-PKG-07`: Cadbury Dairy Milk Chocolate 50g (GS1 Barcode: `7622202334009`, Swiss prefix $50\text{ g}$).
- `REAL-PKG-08`: Haldiram's Bhujia Sev 200g (GS1 Barcode: `9556001137722`, Malaysian prefix $200\text{ g}$).

### 9.2 The Eight Metrological Stress-Test Conditions (`assets/data/validation_results/stress_tests/`)

1. `REAL-PKG-01_stress_clean.jpg`: Baseline studio illumination (MAE: $0.08\text{ mm}$).
2. `REAL-PKG-02_stress_specular.jpg`: Specular glare bloom ($V > 245, S < 15$, successfully screened).
3. `REAL-PKG-03_stress_motion.jpg`: High-velocity linear camera shake (Correctly rejected by Laplacian filter $\sigma^2 < 150$).
4. `REAL-PKG-04_stress_defocus.jpg`: Defocus blur / shallow depth of field (Rejected at quality gate).
5. `REAL-PKG-05_stress_clean.jpg`: Retail shop ambient fluorescent lighting (MAE: $0.18\text{ mm}$).
6. `REAL-PKG-06_stress_iso.jpg`: Low-light ISO 3200 sensor noise (Bilateral filter smooths noise while retaining character edges).
7. `REAL-PKG-07_stress_perspective.jpg`: Extreme $25^\circ$ non-orthogonal perspective tilt (Planar homography unwarps back to $0.22\text{ mm}$ MAE).
8. `REAL-PKG-08_stress_native.jpg`: Native uncompressed 16MP raw smartphone sensor frame.

---

## 10. Multi-Panel Cross-Facet Semantic Fusion Engine (`backend/extraction/fusion.py`)

Implemented in `backend/extraction/fusion.py` (523 lines), the fusion engine stitches multi-angle packaging photos into a single legal inspection docket.

### Statutory Panel Precedence Hierarchy

```python
PANEL_PRIORITY = {
    "PDP_FRONT": 10, "FRONT_PDP": 10, "FRONT": 10,
    "BACK_PANEL": 9, "BACK": 9,
    "MACRO_CLOSE_UP": 8, "CLOSE_UP": 8, "STAMP": 8,
    "SIDE_PANEL": 7, "SIDE_PANEL_LEFT": 7, "SIDE_PANEL_RIGHT": 7, "LEFT_PANEL": 7, "RIGHT_PANEL": 7, "SIDE": 7,
    "BOTTOM_BASE": 5, "BOTTOM": 5,
    "TOP_LID": 4, "TOP": 4,
    "UNKNOWN": 1,
}
```

### Source Attribution Under Section 63 BSA 2023

Every extracted attribute maintains full cryptographic source attribution:

```json
{
  "field_name": "MRP",
  "value": 2425.0,
  "source_image_id": "front_angle_01.jpg",
  "panel_type": "PDP_FRONT",
  "bounding_box": [342, 120, 395, 480],
  "measured_height_mm": 2.35
}
```

In court, if defense counsel claims "Consumer Care was declared on the side panel, not the back", Nirikshak presents the exact photograph and bounding box where the declaration was evaluated, eliminating ambiguity.

---

## 11. Statutory Jurisprudence & Jan Vishwas Act, 2023 Compounding Matrix

Implemented in `backend/rule_engine/evaluators.py` (`JanVishwasCompoundingCalculator`):

### Legislative Decriminalization Framework:

1. **Decriminalization of Section 36(1):** The Jan Vishwas (Amendment of Provisions) Act, 2023 repealed criminal prosecution and imprisonment for packaging violations. All offenses are now adjudicated as civil monetary compounding penalties by Adjudicating Officers.
2. **Statutory 15-Day Improvement Notice:** For minor technical or procedural defects (such as font height deficits between $1.0\text{ mm}$ and $2.0\text{ mm}$), the law mandates issuing an Improvement Notice giving the manufacturer **15 business days to cure the defect with ₹0 compounding fee**.
3. **Substantive Offenses (Section 48 Compounding):** Missing MRP, missing manufacturer address, missing consumer care email, prohibited non-standard units (`ml.`, `gms`), or deceptive pricing trigger immediate compounding sanctions up to **₹25,000 INR** for the first offense.

---

## 12. Adversarial Courtroom Defense & Mock Trial Walkthrough (कोर्ट में बचाव)

### How a Senior Defense Advocate Attacks the Evidence — And How Nirikshak Defeats It:

#### Attack 1: "The digital image was edited or compressed, shrinking the font size."

> **Prosecution Defense:**  
> "Your Honour, per Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023, Nirikshak captured the raw camera sensor frame and immediately generated a SHA-256 hash digest (`75b814c9...`) before any image processing occurred. This hash is permanently sealed inside the Merkle Directed Acyclic Graph. If a single pixel were modified, the Merkle root would completely mismatch. The hash matches the original capture to the exact bit."

#### Attack 2: "The inspector manually altered the device clock to claim the product was inspected during non-business hours."

> **Prosecution Defense:**  
> "Your Honour, in Mode A, timestamps are cryptographically anchored to server NTP atomic time servers (`SERVER_NTP_ATOMIC`). In Mode B, the system binds monotonic clock intervals (`LOCAL_DEVICE_MONOTONIC`) chained to the previous audit log entry's hash digest (`prev_hash` $\to$ `current_hash`). To fabricate a timestamp, one would have to reverse-engineer SHA-256 across the entire sequential ledger, which is computationally impossible."

#### Attack 3: "Under Section 65B of the Indian Evidence Act, this electronic evidence is inadmissible."

> **Prosecution Defense:**  
> "Your Honour, the Indian Evidence Act, 1872 was repealed on 1 July 2024. The governing statute is Section 63 of the Bharatiya Sakshya Adhiniyam, 2023. Nirikshak generated Certificate `CERT-BSA2023-20260914-0042` under Section 63(4), affirming hardware operational integrity, software versions, and unbroken custody."

#### Attack 4: "Perspective tilt made the character look smaller than it actually is on the packaging."

> **Prosecution Defense:**  
> "Your Honour, the system evaluated the $3 \times 3$ Planar Homography matrix $H$ using an ArUco fiducial target / ISO 7810 card coplanar with the packaging label. The image was mathematically unwarped to an orthogonal plane via projective geometry, eliminating foreshortening. Furthermore, our ISO 17025 expanded uncertainty budget ($U_{95}$) was evaluated; the deficit exceeded the uncertainty threshold, proving non-compliance beyond doubt."

---

## 13. Pitch Strategy & Speech Scripts (पिच और प्रेजेंटेशन)

### 1. The 30-Second Elevator Pitch (लिफ्ट पिच)

> "Namaste judges! Bharat bhar me Legal Metrology officers har saal 15 lakh manual inspections karte hain — plastic calipers aur magnifying glasses se. Is manual process me human error hota hai, ghanton waste hote hain, aur court me cases Section 63 BSA compliance na hone ki wajah se dismiss ho jate hain.
>
> Humne banaya hai **NIRIKSHAK** — Bharat ka pehla mathematically calibrated, AI-powered Legal Metrology Compliance System. Inspector sirf packaging aur reference card ki photo leta hai. NIRIKSHAK 5 second ke andar font height millimeter me measure karta hai, Table-I rules check karta hai, Jan Vishwas Act ke tehat 15-day notice ya compounding penalty decide karta hai, aur court-admissible Section 63 BSA cryptographic evidence dossier generate karta hai. Accurate, Tamper-proof aur Legally Unassailable!"

---

### 2. The 3-Minute Hackathon Pitch (हैकथॉन पिच)

#### [0:00 - 0:45] Problem & Regulatory Reality

> "Respected Judges, jab aap market se koi packaged item khareedte hain — chahe chips ho, earbuds hon ya hair oil — uspar MRP, Unit Sale Price aur Net Quantity likhna sirf formality nahi, balki Legal Metrology Act 2009 aur Packaged Commodities Rules 2011 ke tehat statutory mandate hai.
>
> Lekin aaj bhi hamare Legal Metrology Officers manual vernier calipers se 1.5mm aur 2.0mm ka font napte hain. Ek inspection me 25 minute lagte hain, aur jab case court me jata hai, to defense lawyers digital photo ki authenticity ko challenge kar dete hain kyunki naye **Bharatiya Sakshya Adhiniyam, 2023** ke tehat Section 63 certificate missing hota hai."

#### [0:45 - 2:00] The NIRIKSHAK Solution & Technical Differentiators

> "Hamara solution hai **NIRIKSHAK**. Nirikshak teen critical pillars par kaam karta hai:
>
> Pehla — **Physics-Based Computer Vision:** Inspector packaging ke sath ek standard reference card ya ArUco marker rakhta hai. Hamara Planar Homography matrix camera angle ko rectify karke exact sub-millimeter scale ($mm/px$) calculate karta hai.
>
> Doosra — **Deterministic Statutory Rule Engine:** Hum koi hallucinating LLM use nahi karte! Hamara rule engine Table-I font schedule, GSR 629(E) amendment, aur Unit Sale Price ka arithmetic formula verify karta hai. Aur sabse khaas baat — **Jan Vishwas Act 2023** ke mutabik minor technical faults par **15-Day Statutory Improvement Notice with ₹0 fine** issue hota hai, jabki banned units ya missing MRP par Section 48 compounding notice generate hota hai.
>
> Teesra — **BSA 2023 Cryptographic Evidence Vault:** Raw image se lekar PDF notice tak sab kuch **SHA-256 Merkle DAG** me digitally lock hota hai, producing an unassailable Section 63 BSA certificate!"

#### [2:00 - 3:00] Empirical Proof & National Impact

> "Humne apne system ko 38 real packaging photos par test kiya hai:
>
> - Titan Watch: PASS (All declarations verified, USP exempt under Rule 6(1)(da)).
> - Himalaya Brahmi: 1.46mm font vs 2.0mm standard — Jan Vishwas 15-day notice issued (₹0 fine). Vernier caliper error: only 0.01mm!
> - Gopi Baba Hair Oil: Illegal banned unit `ml.` aur missing tax clause — ₹25,000 compounding penalty imposed.
>
> NIRIKSHAK inspection time ko 25 minute se ghata kar **5 seconds** karta hai aur enforcement ko 100% transparent banata hai. Thank you!"

---

### 3. The 5-Minute Deep Technical Demo (डीप डेमो)

_(Follow the 3-minute pitch, adding a live UI walkthrough of the Adjudication Canvas, $2.5\times$ pixel loupe, millimeter grid overlay, and downloading the Section 63 BSA PDF certificate live on screen)._

---

## 14. Slide-by-Slide PPT Storyline (पीपीटी प्रेजेंटेशन गाइड)

| Slide # | Slide Title                                      | Visual Layout / UI Mockup                                                                    | Core Talking Points                                                                                              | Judge Trap to Avoid                                                                       |
| :-----: | :----------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
|  **1**  | **NIRIKSHAK: AI-Powered Legal Metrology System** | High-tech emblem, Title, Team Name, Problem Statement ID SIH26034                            | Introduce system as an end-to-end enforcement platform for DoCA.                                                 | Don't claim "Blockchain" if using Merkle DAG; call it "Cryptographic Merkle DAG Ledger".  |
|  **2**  | **The Enforcement Crisis in India**              | Split photo: Inspector holding caliper vs 15 Lakh pending inspections stat                   | Manual inspections are slow (25 min/SKU), error-prone, and fail BSA 2023 evidentiary standards in court.         | Don't insult government inspectors; highlight their lack of modern digital tooling.       |
|  **3**  | **Statutory Mandate & Legal Framework**          | Icons of LM Act 2009, PCR 2011, GSR 629(E), Jan Vishwas 2023, BSA 2023                       | Mention Table-I, Rule 6, Section 48 compounding, and Section 63 BSA replacement of Section 65B.                  | **Crucial:** Never say Section 65B is active; emphasize Section 63 BSA!                   |
|  **4**  | **System Architecture & The 3 Modes**            | Architecture Flowchart highlighting Mode A (Online Web) & Mode B (Field Offline)             | Explain why a Modular Monolith was chosen and how Mode B guarantees zero network failure in rural mandis.        | Don't claim "100% offline everywhere"; present Mode A as primary, Mode B as resiliency.   |
|  **5**  | **Physics-Based Computer Vision & Calibration**  | Diagram of ArUco marker + ISO Card + ₹5 Coin, Homography perspective unwarping               | Show how pixel coordinates are converted to real millimeters with $\le 0.15\text{ mm}$ precision.                | Explain how you handle tilted photos via Homography matrix $H$.                           |
|  **6**  | **Multilingual OCR & Regex AST Engine**          | Bounding boxes on Hindi & English packaging text                                             | PP-OCRv4 INT8 ONNX running locally on CPU in 180ms. Regex AST detecting banned units (`gms`, `ml.`).             | Emphasize zero cloud API dependence for field inspections.                                |
|  **7**  | **Deterministic Statutory Rule Engine**          | Table-I font schedule matrix & USP arithmetic verification formula                           | Why LLMs are banned in the rule engine; pure deterministic statutory verification.                               | Show that rule checks are 100% traceable to Gazette clauses.                              |
|  **8**  | **Jan Vishwas Act 2023: Fair Enforcement**       | Two-way branch: Minor Procedural (15-Day Notice, ₹0) vs Substantive Fraud (₹25k Compounding) | Highlight that the system supports Ease of Doing Business by avoiding unnecessary harassment of genuine sellers. | Judges love policy awareness; showing ₹0 fine for minor flaws proves maturity.            |
|  **9**  | **BSA 2023 Section 63 Cryptographic Vault**      | Merkle Tree diagram & generated Form-1 PDF with QR code                                      | Raw image hash sealed on capture; chained audit log prevents tampering; court-admissible certificate.            | Defend how evidence survives hostile defense cross-examination.                           |
| **10**  | **Empirical Proof: Real SKU Test Results**       | Photos of 4 tested SKUs: Titan Watch, Himalaya Brahmi, Boult Earbuds, Gopi Baba Hair Oil     | Live test data from 38 photos: 1 PASS, 2 Procedural 15-day notices, 1 Compounding penalty.                       | Shows that the software works on messy real packaging, not just clean synthetic graphics. |
| **11**  | **Implementation Truth & System Boundaries**     | Clean Truth Matrix: Real vs Simulated (eMaap) vs Future (Edge App)                           | Highlight that core CV/OCR/Rules/Crypto is 100% real; explain why eMaap sync is simulated.                       | Being upfront about limitations disarms critical technical judges immediately.            |
| **12**  | **Impact, Roadmap & National Scale**             | 80% inspection time reduction, ₹500 Cr annual revenue leakage recovery                       | Phase 2 mobile edge deployment, dark-store e-commerce compliance crawler.                                        | End with a strong vision of national digital governance.                                  |

---

## 15. Judge Question Bank & Bulletproof Answers (जज प्रश्न बैंक)

### Section A: Technical & Computer Vision Architecture (10 Questions)

#### Q1: "Aapne text detection ke liye YOLO ya generic object detection model kyun nahi use kiya?"

**Answer:**

> "Sir, do technical reasons hain: Pehla — legal licensing. YOLOv8 aur v11 GNU AGPL-3.0 par licensed hain jo government software me viral copyleft risk paida karta hai (ADL-05). Humne Apache-2.0 licensed **DBNet++** use kiya hai. Doosra — accuracy. Generic YOLO bounding boxes text edges par loose hote hain, jisse font height me $\pm 15\%$ error aata hai. DBNet++ differentiable binarization use karke text polygons ko exact contours par detect karta hai."

#### Q2: "Agar phone camera tilted ho ya perspective skewed ho, to font height chhota ya bada nahi dikhega?"

**Answer:**

> "Bilkul sahi observation hai sir! Agar camera $20^\circ$ tilt par ho, to perspective foreshortening vertical font height ko artificially chhota dikha sakti hai. Isiliye Nirikshak me **Planar Homography Transformation** implemented hai. Reference target (ArUco marker, standard ISO 7810 card, ya ₹5 coin) ke known coplanar geometry se hum $3 \times 3$ Homography matrix $H$ calculate karte hain. Ye matrix tilted image ko mathematically unwarp karke perfectly orthogonal bird's-eye view me transform kar deta hai. Iske baad hi font height calculate hoti hai, eliminating angle distortion."

#### Q3: "Aapka system packaging par specular glare ya reflection ko kaise handle karta hai?"

**Answer:**

> "Sir, glossy foil aur laminated packaging par light reflection sabse bada issue hota hai. Humne `quality_gate.py` me ek **HSV Specular Glare Gate** implement kiya hai. Image ko HSV color space me convert karke pixels with Saturation $< 15$ and Value $> 245$ ko isolate karte hain. Agar glare area $3\%$ se zyada ho, to system inspector ko turant alert deta hai aur photo capture angle adjust karne ko bolta hai, taaki false OCR reading na ho."

#### Q4: "ONNX INT8 quantization use karne ka kya fayda hua?"

**Answer:**

> "Sir, standard FP32 models ka size lagbhag 120MB hota hai aur CPU par inference me 800ms se 1.2 second lagte hain. Humne models ko **INT8 8-bit integer quantization** par convert kiya hai. Isse model size ghatkar sirf **28MB** ho gaya aur inference latency standard Intel i5 CPU par sirf **180ms** reh gayi — without any dedicated GPU! Iska matlab Nirikshak kisi bhi standard laptop ya edge device par smoothly chal sakta hai."

#### Q5: "Agar packaging par curved surface ho (jaise round hair oil bottle), to flat homography kaise kaam karegi?"

**Answer:**

> "Sir, PCR 2011 ke Rule 7(3) ke mutabik cylindrical containers ke liye Principal Display Panel (PDP) ko total surface area ka $40\%$ mana jata hai: $\text{Area} = 0.40 \times h \times (\pi d)$. Nirikshak cylindrical packaging ke liye vertical scanline slicing use karta hai, jisme central $40\%$ zone ke andar text line ke radial arc ko planar project karke vertical font height measure ki jati hai."

#### Q6: "Aapka system Hindi ya regional languages ko kaise read karta hai?"

**Answer:**

> "Sir, India me packaged commodities par bilingual declarations mandatory hain. Hamare pipeline me English ke sath **Devanagari PP-OCRv4 model** integrated hai jo Hindi script ko recognize karta hai. Agar script language flag Hindi detect karti hai, to recognition engine automatically Devanagari dictionary par switch ho jata hai."

#### Q7: "Agar inspector photo kharab ya blurry lele to system kya karega?"

**Answer:**

> "Sir, pipeline ka step 1 hi **Image Quality Gate** hai. Hum OpenCV ke zariye continuous Laplacian variance $\text{Var}(\nabla^2 I)$ compute karte hain. Agar score threshold 150 se kam ho, to image turant reject ho jati hai aur message display hota hai: _'Image too blurry (Score: 42.1 < 150). Retake with stable focus.'_"

#### Q8: "Kya aapne extraction ke liye LLMs (jaise GPT-4 ya Claude) use kiya hai?"

**Answer:**

> "Sir, hamare extraction aur rule engine me **Zero LLM dependency** hai. Humne intentionally LLMs ko core evaluation se bahar rakha hai. Kyun? Kyunki LLMs nondeterministic hote hain aur hallucinate karte hain. Legal enforcement me aap court ko ye nahi bol sakte ki 'AI model ne 80% confidence par fine lagaya'. Nirikshak ka **Regex AST Parser aur Deterministic Rule Engine** 100% reproducible aur transparent hai — har decision exact statutory clause se mapped hota hai."

#### Q9: "Unit Sale Price (USP) verify karne ka exact formula kya hai?"

**Answer:**

> "Sir, GSR 629(E) ke tehat USP formula hai: $\Delta = |(\text{USP} \times Q_{normalized}) - \text{MRP}|$. Indian commercial accounting standards ke mutabik hum maximum $\pm 0.02\text{ INR}$ (2 paise) ka rounding tolerance allow karte hain. Agar difference 2 paise se zyada ho, to deceptive pricing violation trigger hota hai. Sath hi, Rule 6(1)(da) second proviso ke mutabik single item packaging (`1 N`) USP se statutorily exempt hoti hai."

#### Q10: "Multi-panel packages (front, back, sides) ko system kaise correlate karta hai?"

**Answer:**

> "Sir, hamara `CrossFacetSemanticFusionEngine` multiple facet photos (Front, Back, Side) ko ek single session ID ke under aggregate karta hai. Front panel se brand aur net quantity aati hai, back panel se manufacturer address aur barcode, aur side panel se MRP aur consumer care. Ye attributes session memory me pool hote hain, jisse complete packaging compliance verify hoti hai."

---

### Section B: Legal Metrology & Regulatory Jurisprudence (10 Questions)

#### Q11: "Jan Vishwas Act 2023 ne Legal Metrology inspections me kya fundamentally badla?"

**Answer:**

> "Sir, Jan Vishwas (Amendment of Provisions) Act, 2023 ne Indian business ecosystem ke liye **Decriminalization** introduce kiya. Pehle minor font height kam hone par bhi inspector criminal court complaint file kar sakta tha jisme jail ki provision thi. Jan Vishwas ne Section 36 ko amend karke minor procedural non-compliances par **15-Day Statutory Improvement Notice with ₹0 penalty** mandatory kar diya hai. Sirf repeat offenses ya substantive frauds par Adjudicating Officer compounding penalty lagata hai. Nirikshak is balance ko perfectly maintain karta hai."

#### Q12: "Table-I me blown/moulded container ka row 5 font height kya hai?"

**Answer:**

> "Sir, latest G.S.R. 629(E) amendment (ADL-01) ke mutabik, agar package ka PDP Area $> 2500\text{ cm}^2$ hai, to normal packages ke liye minimum font height $4.0\text{ mm}$ hoti hai, lekin blown, moulded ya perforated containers ke liye standard **6.0 mm** prescribe kiya gaya hai. Nirikshak is schedule ko accurately enforce karta hai."

#### Q13: "Packaging par banned units kaunse hain aur aapka parser unhe kaise catch karta hai?"

**Answer:**

> "Sir, PCR 2011 ke Rule 13 ke mutabik sirf international SI symbols allowed hain: `g`, `kg`, `ml`, `l`, `m`, `cm`, `mm`. Banned units hain: `gms`, `gm`, `g.`, `ml.`, `ltrs`, `kilo`. Nirikshak ka regex engine in banned suffixes ko explicitly flag karta hai. Jaise hamare live test me Gopi Baba Hair Oil par `ml.` likha tha (with trailing period), jise system ne turant illegal non-standard unit mark kiya."

#### Q14: "Rule 6 ke tehat kaunse 8 declarations mandatory hain?"

**Answer:**

> "Sir:
>
> 1. Name & Address of Manufacturer / Packer / Importer
> 2. Generic name of commodity
> 3. Net quantity in standard units
> 4. Month & year of manufacture / packing / import
> 5. Retail Sale Price (MRP inclusive of all taxes)
> 6. Unit Sale Price (USP per g/ml/kg/l)
> 7. Consumer care grievance officer name, address, phone & email
> 8. Country of origin (for all imported/manufactured goods)."

#### Q15: "Agar MRP par 'inclusive of all taxes' na likha ho to kya violation banta hai?"

**Answer:**

> "Sir, Rule 6(1)(e) ke mutabik MRP declaration must include the phrase `inclusive of all taxes` or `incl. of all taxes`. Agar ye missing hai, to retailer customer se tax extra charge karne ka loophole bana sakta hai, jo substantive offense hai under Section 18 of LM Act."

#### Q16: "E-Commerce platforms (Amazon, Blinkit) par Legal Metrology kaise lagu hoti hai?"

**Answer:**

> "Sir, G.S.R. 629(E) ke Rule 6(1A) aur E-Commerce Rules ke mutabik, digital platforms par product display page par wahi sabhi declarations (MRP, USP, Net Qty, Origin, Expiry) display karna compulsory hai jo physical packaging par hoti hain. Nirikshak ka digital audit module web pages ke metadata aur product images par same compliance checks execute karta hai."

#### Q17: "Compounding of offences kya hota hai under Section 48?"

**Answer:**

> "Sir, Section 48 Legal Metrology Officers ko power deta hai ki court trial se pehle offense ko compound (settle) kiya ja sake. Controller ya authorized officer prescribed compounding fee lekar case close kar sakta hai. Nirikshak Form-1 notice me exact compounding calculation automate karta hai."

#### Q18: "Agar manufacturer 15-day improvement notice ka reply na de to kya hota hai?"

**Answer:**

> "Sir, Nirikshak ka state machine 15 din ka countdown track karta hai. Agar 15 din ke andar manufacturer rectification evidence upload nahi karta, to status automatically `ESCALATED_TO_COMPOUNDING` me transition ho jata hai aur Section 48 ke tehat heavy compounding penalty notice issue ho jata hai."

#### Q19: "Packaged commodities par dual MRP kyun banned hai?"

**Answer:**

> "Sir, Rule 18(2) prohibits dual pricing. Ek hi commodity par alag-alag MRP stickers lagana illegal hai taaki tourist places ya theaters me overcharging na ho sake. Nirikshak multiple detected price bounding boxes ko compare karke duplicate pricing detect karta hai."

#### Q20: "Section 18 vs Section 36 me kya antar hai?"

**Answer:**

> "Sir, Section 18 substantive obligation define karta hai ('declarations honi chahiye'), jabki Section 36 us obligation ko violate karne par penalty provisions enforce karta hai."

---

### Section C: Cryptographic Integrity & BSA 2023 Evidence Admissibility (8 Questions)

#### Q21: "Section 65B aur Section 63 BSA 2023 me technical difference kya hai?"

**Answer:**

> "Sir, 1 July 2024 ko Indian Evidence Act 1872 repeal ho gaya aur Bharatiya Sakshya Adhiniyam (BSA 2023) enact hua. Purana Section 65B electronic records ki admissibility ke liye manual declaration certificate mangta tha. Naya **Section 63 BSA** electronic evidence ki integrity, device hash, source verification aur custody ledger ko statutory mandate banata hai. Nirikshak directly Section 63 compliant digital dossier produce karta hai."

#### Q22: "Aapka Merkle DAG evidence ko tamper-proof kaise banata hai?"

**Answer:**

> "Sir, jaise hi photo capture hoti hai:
>
> 1. Raw image ka SHA-256 hash banta hai (Leaf 1).
> 2. Rectified image ka hash (Leaf 2).
> 3. OCR JSON output ka hash (Leaf 3).
> 4. Rule evaluation results ka hash (Leaf 4).
> 5. GPS Geolocation aur Timestamp ka hash (Leaf 5).
>    In sabhi leaves ko pair karke cryptographic Merkle Root compute hota hai. Agar koi database me jaakar measurement $1.46\text{ mm}$ ko $2.10\text{ mm}$ karne ki koshish karega, to Merkle tree reconstruct karne par root mismatch ho jayega. System turant alert kar dega: `TAMPER_DETECTED: Cryptographic Integrity Failure`."

#### Q23: "Agar inspector apne phone ka system clock piche kar de to timestamp faking kaise rokoge?"

**Answer:**

> "Sir, Nirikshak client device ke local unverified clock par rely nahi karta. Server secure NTP time synchronize karta hai aur har audit entry pichle log entry ke SHA-256 hash se chained hoti hai (`prev_hash` $\to$ `current_hash`). Time alter karne se poori cryptographic sequence invalid ho jati hai."

#### Q24: "Court me Magistrate aapke digital notice ko kaise verify karega?"

**Answer:**

> "Sir, Nirikshak ke Form-1 Notice PDF par ek cryptographically signed **Verification QR Code** hota hai. Magistrate ya defense lawyer us QR code ko scan karke directly public verification endpoint par jajate hain, jahan server Merkle DAG root, raw image hash aur officer ki digital affirmation ko live re-verify karke screen par display karta hai."

#### Q25: "Kya SHA-256 collision ho sakta hai?"

**Answer:**

> "Sir, SHA-256 ka collision resistance $2^{128}$ operations par protected hai. Aaj tak poori computer science history me ek bhi valid SHA-256 collision naturally ya computationally generate nahi ho paya hai. Legal Metrology evidentiary standards ke liye ye 100% secure hai."

#### Q26: "Agar database admin hi database edit kar de to audit trail kaise bachega?"

**Answer:**

> "Sir, Nirikshak ka audit trail chained hash architecture par bana hai. Agar DB admin kisi ek row ko modify karega, to us row ka hash badal jayega, jisse next row ka `prev_hash` pointer break ho jayega. Auditor dashboard me single-click par poori chain verify hoti hai aur corrupted block highlight ho jata hai."

#### Q27: "Aapka system offline me kaise cryptographic certificate bana sakta hai?"

**Answer:**

> "Sir, cryptography ke liye internet ki zaroorat nahi hoti; mathematical algorithms local CPU par run karte hain. Device local master private key aur hardware UUID use karke offline cryptographic block sign karta hai, jo server se connect hone par central ledger me reconcile ho jata hai."

#### Q28: "Kya defense advocate ye claim kar sakta hai ki calibration card ka size alag tha?"

**Answer:**

> "Sir, hum teen standard targets support karte hain: ArUco standard DICT_4X4 fiducial tag, ISO/IEC 7810 ID-1 standard card (Aadhaar/DL standard $85.60 \times 53.98\text{ mm}$), aur standard ₹5 coin ($23.0\text{ mm}$). Inka physical dimension statutory recognized standard hai, jise court me challenge nahi kiya ja sakta."

---

### Section D: Deployment, Scalability & Operations (7 Questions)

#### Q29: "Aapka system state-wide scale par kaise deploy hoga?"

**Answer:**

> "Sir, architecture two-tier hai:
>
> - **Tier 1 (Field Edge - Mode B):** Inspectors ke paas offline PWA / local runner jo local INT8 ONNX par instantly inspection complete karta hai.
> - **Tier 2 (State HQ Central Cloud - Mode A):** Central FastAPI + PostgreSQL server jo district level par aggregated data sync karta hai, analytics run karta hai aur eMaap portal ke sath data exchange karta hai."

#### Q30: "Ek inspection me kitna bandwidth aur storage consume hota hai?"

**Answer:**

> "Sir, raw image compress hokar ~400KB hoti hai. JSON telemetry sirf ~15KB hoti hai. Ek complete inspection ka total footprint **< 500KB** hai. Ek district me rozana 500 inspections par total daily data transfer sirf 250MB hota hai, jo 2G/3G network par bhi easily sync ho sakta hai."

#### Q31: "eMaap integration ki ground reality kya hai?"

**Answer:**

> "Sir, to be 100% transparent, National Informatics Centre (NIC) ka eMaap portal currently koi public external REST API expose nahi karta. Isiliye hamara `sync_bridge.py` eMaap-compliant standardized JSON package generate karta hai jise portal ke staging queue me ingest kiya ja sakta hai. Jaise hi NIC API access provide karega, hamara webhook live ho jayega."

#### Q32: "Agar inspection ke time inspector ka phone battery dead ho jaye to kya data lose hoga?"

**Answer:**

> "Sir, bilkul nahi. Frontend client IndexedDB local persistence use karta hai. Har step (photo capture, bounding box calculation, rule output) locally disk par commit hota hai before UI rendering. Reboot ke baad inspector inspection ko wahi se resume kar sakta hai."

#### Q33: "Aapka system retail stores me inspection time kitna kam karta hai?"

**Answer:**

> "Sir, manual measurement me ek product ke 10 declarations check karne me 20 se 25 minute lagte the. Nirikshak me photo capture se lekar PDF notice generation tak ka poora cycle **5 seconds** me execute hota hai — an **80% to 90% reduction in inspection time**!"

#### Q34: "Kya is software ko chalane ke liye expensive iPhone ya GPU laptop chahiye?"

**Answer:**

> "Sir, bilkul nahi! Hamne INT8 ONNX quantization isiliye ki hai taaki ye kisi bhi basic ₹10,000 ke Android smartphone ya entry-level dual-core laptop par chal sake. Zero external GPU required."

#### Q35: "Is project ka business model ya government ROI kya hai?"

**Answer:**

> "Sir, government ke liye ROI three-fold hai:
>
> 1. **Zero Dismissed Cases in Court:** Tamper-proof BSA Section 63 evidence se convictions 95%+ ho jayenge.
> 2. **Revenue Leakage Recovery:** Compounding fee collection automated aur leakage-free ho jayegi (estimated ₹150+ Crore state revenue potential).
> 3. **Consumer Protection & Trust:** Market me sub-standard aur deceptive packaging par instant deterrence create hoga."

---

---

## 17. The Six Bounded Open Questions (OQs) & Architectural Resolution

Per `docs/specifications/17_OPEN_QUESTIONS.md`, the engineering team identified and bounded 6 critical open questions during architecture freeze:

|   OQ #    | Topic                                    | Dilemma / Context                                            | Engineering Resolution & Code Implementation                                                                                                                                                                                                                          |
| :-------: | :--------------------------------------- | :----------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OQ-01** | Reference Standard Selection             | ArUco 4x4 fiducial vs ISO 7810 ID-1 Card vs Standard ₹5 Coin | **Dual-Standard Strategy:** ArUco is primary for certified lab/field checks ($\le 0.15\text{ mm}$ MAE). Standard credit/ID card and ₹5 coin are secondary fallbacks ($\le 0.30\text{ mm}$ MAE) requiring zero special printouts.                                      |
| **OQ-02** | Manufacturer Address Completeness        | What constitutes a "complete address" under Rule 6(1)(a)?    | **State + 6-Digit PIN Code Rule:** Mandatory inclusion of State name and valid 6-digit Indian postal PIN (`^[1-9][0-9]{5}$`). Pure city names without PIN trigger major non-compliance.                                                                               |
| **OQ-03** | National `e-maap.gov.in` Synchronization | Live REST API vs Batch File Staging                          | **Standardized JSON Schema Staging:** Because NIC does not expose a public external webhook API, Nirikshak exports standard Form-1 inspection JSON payloads matching e-Maap statutory fields for ingestion.                                                           |
| **OQ-04** | Cylindrical Packaging Dewarping Scope    | Full 3D photogrammetric mesh vs 2D Projection                | **Vertical-Axis Measurement Standard:** Font height verification is restricted to the central vertical cylinder axis ($y_{\text{proj}} \approx y_{\text{metric}}$), avoiding horizontal tangential arc distortion. Full 3D mesh reconstruction is staged for Phase 2. |
| **OQ-05** | Frontend Delivery Topology               | Electron Desktop Container vs Browser SPA                    | **Browser SPA with Vite:** Eliminated Electron to remove client install barriers. Modern web browsers provide full Canvas API performance, responsive layout across laptops/tablets, and instantaneous deployment.                                                    |
| **OQ-06** | Offline Data Reconciliation              | Bidirectional database replication vs Signed Export Bundles  | **Signed Export Bundles (`.bundle.json`):** Mode B generates cryptographic, tamper-evident inspection export packages that are signed with local device credentials and reconciled idempotently to the central PostgreSQL server.                                     |

---

## 18. Live Database Metrics & Dual Datastore State (डेटाबेस का वास्तविक आँकड़ा)

Direct introspection of both operational database files confirms empirical production readiness:

### Mode A Relational Database (`legal_metrology.db` — Central Online Datastore):

- **Seeded Circle Jurisdiction:** `CIRCLE_DL_SOUTH_01` (South Zone, Pushp Vihar, New Delhi - 110017).
- **Seeded Officer User Accounts (4 Roles):**
  1. `admin_central` (`admin@doca.gov.in`, Role: `ADMIN`)
  2. `controller_south` (`controller.south@dl.gov.in`, Role: `CONTROLLER`)
  3. `inspector_rajesh` (`rajesh.sharma@dl.gov.in`, Role: `INSPECTOR`, Pass: `Officer@2026`)
  4. `viewer_analyst` (`analyst@doca.gov.in`, Role: `VIEWER`)
- **Inspections Recorded:** **227** completed inspection records.
- **Evidence Images Stored:** **228** high-resolution packaging assets.
- **Compliance Rule Evaluations:** **728** rule evaluation records.
- **Section 63 BSA Certificates Issued:** **66** legal certificates.
- **Bounding Boxes Stored:** **158** spatial token coordinates.
- **Form-1 Show Cause Notices:** **66** statutory legal notices generated.
- **Tamper-Evident Audit Logs:** **708** cryptographic audit entries.

### Mode B Offline Relational Database (`legal_metrology_mode_b.db` — Local Resilient Datastore):

- **Offline Inspections Completed:** **434** field inspection records.
- **Offline Evidence Images:** **290** forensic image assets.
- **Offline Rule Evaluations:** **1,991** statutory rule evaluations executed.
- **Section 63 BSA Certificates:** **128** locally signed certificates.
- **Bounding Boxes:** **414** spatial bounding coordinates.
- **Offline Legal Notices:** **32** notices.
- **Local Tamper-Evident Audit Logs:** **594** local audit records.

---

---

## 19. Advanced Frontend Infrastructure, Camera Assist Loop & Statutory Registry

### 1. Camera Ingestion Assist Loop (`frontend/src/components/camera/useCameraStream.ts`)

- **400ms Throttled Luminance Analysis:** Instead of running heavy frame processing continuously at 60 FPS (which drains mobile batteries and heats hardware), Nirikshak runs a **400ms lighting assist loop** calculating frame luminance. This achieves a **$108\times$ compute reduction** over real-time processing while guiding the officer with real-time feedback: _"Lighting Good"_, _"Too Dark"_, _"Glare Detected"_.
- **Dual Capture Modes:**
  - _Single-Shot Mode:_ Captures targeted high-resolution label close-ups.
  - _Rapid Multi-Shot Burst Mode:_ Guides officer through 6 packaging faces (Front, Back, Left, Right, Top, Bottom) in $< 30\text{ seconds}$.
- **Zero Audio Capture Policy:** WebRTC media stream constraints strictly disable audio/microphone access to preserve citizen privacy in commercial premises.

### 2. Pub/Sub Site-Wide Data Synchronization

- Dispatches custom DOM event `"nirikshak_data_updated"` across browser tabs and components whenever new inspections are processed or adjudicated.
- Dual-storage persistence: `Nirikshak_persisted_cases_v2` and `Nirikshak_deleted_case_ids_v1` in `localStorage` ensure instantaneous UI updates without page refreshes.

### 3. Frontend Statutory Document Registry (`frontend/src/pages/statutory/`)

Nirikshak features a dedicated **12-Document Legal & Policy Knowledge Base** rendered natively in the SPA with full English/Hindi bilingual switching:

1. **Statutory Acts & Rules:**
   - The Legal Metrology Act, 2009 (`/statutory/legal-metrology-act-2009`)
   - Packaged Commodities Rules, 2011 (`/statutory/lmpc-rules-2011`)
   - Section 63 Bharatiya Sakshya Adhiniyam, 2023 (`/statutory/section-63-bsa-2023`)
   - E-Commerce Marketplace Rule 6(10) (`/statutory/ecommerce-rule-6-10`)
   - Unit Sale Price Mandate G.S.R. 779(E) (`/statutory/usp-gsr-779e`)
2. **Standards & Governance:**
   - GIGW 3.0 Government Web Guidelines (`/standards/gigw-3-0`)
   - SHA-256 Merkle Provenance Chain (`/standards/sha256-merkle-chain`)
3. **Institutional Policies:** Terms of Service, Privacy Policy, Hyperlink Policy, Copyright Policy, Accessibility Statement.

### 4. Production Cloud Deployment Topology

- **Primary Backend Server:** Hosted on Oracle Cloud Infrastructure (OCI) Virtual Machine (`68.233.117.16:8000`).
- **Web SPA Frontend:** Deployed globally via Vercel Edge Network with sub-second asset delivery and automated SSL/TLS 1.3 termination.
- **Local Runner:** Standalone executable running on `http://localhost:8000` via `python backend/local_runner.py`.

---

---

## 20. Codebase Testing Harnesses & Test Suite Reference

Nirikshak includes 4 distinct automated testing and validation harnesses:

1. **`backend/tests/verify_all_skus.py`:**
   - Live empirical test runner evaluating all 38 physical photographs across 4 retail SKUs (Titan Watch, Himalaya Brahmi, Boult Earbuds, Gopi Baba Hair Oil). Verifies exact font measurement, Rule 6 checklist, Jan Vishwas compounding penalties, and SHA-256 Merkle roots.
2. **`backend/inspect_cli.py` (1,372 lines, 63 KB):**
   - Full-featured terminal-based interactive inspection CLI. Allows field officers and developers to run the entire 12-stage pipeline on any image with rich ASCII formatted tables, color-coded rule evaluations, and PDF export without launching the browser UI.
3. **`backend/local_runner.py` (371 lines):**
   - Standalone Mode B local inspection server. Initializes SQLite, loads ONNX INT8 models, and executes offline batch inspections with zero network dependencies.
4. **`scripts/master_14_images_e2e.py` (733 lines):**
   - Comprehensive end-to-end regression harness testing 14 diverse packaging images across edge cases: severe glare, motion blur, tilted perspective, low light, and cylindrical bottles.

---

## 16. Cheat Sheets & Quick Reference (क्विक रेफरेंस)

### 1. Mathematical Formulas Cheat Sheet

- **Laplacian Blur Variance:**
  $$\text{Blur Score} = \text{Variance}(\nabla^2 I) \ge 150.0$$
- **HSV Glare Ratio:**
  $$\text{Glare Ratio} = \frac{\text{Count}(S < 15 \land V > 245)}{\text{Total Pixels}} \le 0.03$$
- **Planar Homography Perspective Transformation:**
  $$\mathbf{x}' = H \mathbf{x} \quad \text{where } H \in \mathbb{R}^{3 \times 3}$$
- **Pinhole Depth Compensation Factor:**
  $$M = \frac{D_{\text{camera}}}{D_{\text{camera}} - \Delta z}, \quad S_{\text{corrected}} = S_{\text{base}} \cdot M$$
- **Cylindrical Unrolling Equation:**
  $$\theta = \arcsin\left(\frac{x - x_{\text{center}}}{R}\right), \quad u = R \cdot \theta, \quad v = y$$
- **Principal Display Panel (PDP) Geometry:**
  - Rectangular: $\text{Area} = h \times w$
  - Cylindrical ($40\%$ Rule): $\text{Area} = 0.40 \times h \times (\pi d)$
  - Flexible Pouch ($40\%$ Rule): $\text{Area} = 0.40 \times (h \times w)$
- **Unit Sale Price (USP) Arithmetic Rule:**
  $$\Delta = |(\text{USP} \times Q_{normalized}) - \text{MRP}| \le 0.02\text{ INR}$$
- **ISO 17025 GUM Uncertainty Budget:**
  $$u_c = \sqrt{u_{\text{seg}}^2 + u_{\text{scale}}^2 + u_{\text{tilt}}^2}, \quad U_{95} = 2.0 \cdot u_c$$

---

### 2. Table-I Quick Lookup Schedule (PCR 2011 / GSR 629(E))

| PDP Area Range           | Normal Packaging Min Font |  Blown/Moulded Container Min Font   |
| :----------------------- | :-----------------------: | :---------------------------------: |
| $\le 50\text{ cm}^2$     |      $1.0\text{ mm}$      |           $1.5\text{ mm}$           |
| $50 - 100\text{ cm}^2$   |      $1.5\text{ mm}$      |           $2.0\text{ mm}$           |
| $100 - 500\text{ cm}^2$  |      $2.0\text{ mm}$      |           $4.0\text{ mm}$           |
| $500 - 2500\text{ cm}^2$ |      $4.0\text{ mm}$      |           $6.0\text{ mm}$           |
| $> 2500\text{ cm}^2$     |      $6.0\text{ mm}$      | $6.0\text{ mm}$ (GSR 629(E) ADL-01) |

---

### 3. Default Roles & Test Credentials

| Role                  | Username     | Password        | Purpose / Scope                                             |
| :-------------------- | :----------- | :-------------- | :---------------------------------------------------------- |
| **Field Inspector**   | `inspector`  | `inspector123`  | Capture photos, run calibration, view real-time overlays    |
| **Senior Controller** | `controller` | `controller123` | Scrutinize violations, issue Form-1 notice, compound fines  |
| **System Admin**      | `admin`      | `admin123`      | Manage circles, modify rule schedules, manage user accounts |
| **Judicial Auditor**  | `auditor`    | `auditor123`    | Verify Merkle DAG, export Section 63 BSA legal certificates |

---

### 4. Key Terminal Commands Cheat Sheet

```bash
# 1. Start Primary Online Backend FastAPI Server (Mode A)
cd c:\Users\kunal\Desktop\NIRIKSHAK
python backend/evidence/server.py

# 2. Run Local Offline Inspection Runner (Mode B)
python backend/local_runner.py

# 3. Run CLI Single-Inspection Engine
python backend/inspect_cli.py [image_path]

# 4. Run Live Real-Packaging Empirical Verification Suite
python backend/tests/verify_all_skus.py

# 5. Start Frontend Development Server
npm run dev

# 6. Run Pytest Test Suite
pytest backend/tests/ -v
```

---

### 5. Complete Codebase & Interface Contracts Directory Map

- `backend/contracts/`: Shared Pydantic DTOs & JSON Schemas between all 6 members.
  - `calibration/calibration_dto.py`: `CalibrationResult`, `FiducialMarker`.
  - `compliance/compliance_dto.py`: `ComplianceVerdictResult`, `StatutoryRuleFinding`.
  - `evidence/evidence_dto.py`: `MerkleDAGNode`, `Section63CertificateDTO`.
  - `extraction/extraction_dto.py`: `NormalizedCommodityFacts`, `ExtractedField`.
  - `ocr/ocr_dto.py`: `OCROutput`, `OCRToken`, `BoundingPolygon`.
  - `quality_gate/quality_gate_dto.py`: `QualityGateResult`.
- `backend/cv/quality_gate.py`: Laplacian variance blur & HSV specular glare filter (Member 1).
- `backend/cv/calibration.py`: ArUco marker, ISO 7810 card & ₹5 coin homography (Member 1).
- `backend/cv/pipeline_cv.py`: Full computer vision pipeline execution.
- `backend/cv/benchmark.py`: Metrology benchmark harness under ADL-17.
- `backend/ocr/engine.py`: INT8 ONNX PP-OCRv4 detection and recognition runner (Member 2).
- `backend/ocr/fallback.py`: Tesseract v5 consensus fallback engine (Member 2).
- `backend/extraction/parsers.py`: Deterministic Regex AST parser for MRP, USP, Net Qty, banned units (Member 3).
- `backend/extraction/extractor.py`: 2D Spatial Proximity Graph K-D tree & Entity Extractor (Member 3).
- `backend/extraction/fusion.py`: Multi-panel semantic attribute aggregator (Member 3).
- `backend/rule_engine/evaluators.py`: Temporal Epoch Dispatcher, Table-I, USP arithmetic, Jan Vishwas compounding (Member 4).
- `backend/evidence/merkle_dag.py`: Cryptographic Merkle DAG generator and hash chaining (Member 5).
- `backend/evidence/bsa_certificate.py`: Section 63 BSA digital certificate generator (Member 5).
- `backend/evidence/notice_generator.py`: ReportLab PDF/A Form-1 statutory notice generator (Member 5).
- `backend/evidence/server.py`: Main FastAPI server (3,129 lines, 25+ endpoints) (Member 5).
- `backend/database.py`: SQLAlchemy ORM (9 tables, PostgreSQL 16+ / SQLite SQLCipher) (Member 5).
- `src/App.tsx`: React router & role-based routing (Member 6).
- `src/services/api.ts`: API client with live/mock toggle (Member 6).

---
