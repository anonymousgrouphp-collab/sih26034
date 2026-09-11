# 02 — COMPLETE DETAILED AUDIT REPORT: METROLENS (SIH26034)

**Document Classification:** Comprehensive Multi-Perspective Technical & Statutory Audit  
**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Auditors:** Senior Product Architect, GovTech Domain Analyst, Lead ML/CV Engineer, Security Auditor, SDET  

---

## 1. System Architecture & Component Inventory

### 1.1 Architectural Topology
MetroLens is structured as an **Online-First Monolith Application (Mode A)** with an **Integrated Local Field Resilience Engine (Mode B)** and **Open Statutory Integration Payloads (Mode C)**.

```
                                  +------------------------------------------------------+
                                  |                 React 18 + Vite SPA                  |
                                  |    (Adjudication Canvas, HUD, Inspector/Citizen)     |
                                  +---------------------------+--------------------------+
                                                              | HTTPS / TLS 1.3
                                                              v
+-------------------------------------------------------------------------------------------------------------------------+
|                                              FastAPI Monolith Gateway (Port 8000)                                       |
|  - Role-Based Access Control (ADMIN, CONTROLLER, INSPECTOR, VIEWER)                                                     |
|  - Decoupled Storage Layer (/storage/uploads/, /storage/evidence/, /storage/notices/)                                   |
|  - Cryptographic Append-Only Merkle DAG Audit Ledger                                                                    |
+-------------------------------------------------------------------------------------------------------------------------+
       |                                      |                                     |                              |
       v                                      v                                     v                              v
+---------------+                     +---------------+                     +---------------+              +---------------+
| Member 1: CV  |                     | Member 2: OCR |                     | Member 3: NER |              | Member 4: AST |
| - QualityGate |                     | - DBNet++     |                     | - Entity Extr |              | - Table-I Font|
| - ArUco / Card|                     | - PP-OCRv4 En |                     | - Banned Units|              | - USP Match   |
| - Homography  |                     | - PP-OCRv3 Hi |                     | - Hindi Script|              | - Jan Vishwas |
+---------------+                     +---------------+                     +---------------+              +---------------+
       \                                      /                                     |                              /
        --------------------------------------                                      v                             /
                           |                                        +-------------------------------+            /
                           v                                        |       Central Pipeline        |<-----------
                  Pipeline Adapter (Contracts) -------------------->|       Execution Orchestrator  |
                                                                    +-------------------------------+
                                                                                    |
                                                                                    v
                                                                    +-------------------------------+
                                                                    |      PostgreSQL / SQLite      |
                                                                    |  - 9 Relational Tables        |
                                                                    |  - Section 63 BSA Hash Chain  |
                                                                    +-------------------------------+
```

### 1.2 Physical File & Directory Inventory

| Directory / Layer | Purpose | Code Volume / Assets | Standalone Status |
| :--- | :--- | :--- | :--- |
| `members/member-01-cv-metrology/` | Optical quality gating, ArUco fiducials, perspective homography, PDP geometry | ~2,500 lines Python | Standalone verified (29 tests pass) |
| `members/member-02-ocr/` | DBNet++ text detection, PP-OCRv4 Latin / PP-OCRv3 Devanagari ONNX INT8 models | ~3,100 lines + 24MB ONNX | Standalone verified (73 tests pass) |
| `members/member-03-extraction/` | Statutory entity extraction, banned unit detector, homoglyph normalization | ~3,800 lines Python | Standalone verified (161 tests pass) |
| `members/member-04-rule-engine/` | Deterministic AST compliance engine, Table-I schedules, Jan Vishwas compounding | ~2,200 lines Python | Standalone verified (54 tests pass) |
| `members/member-05-evidence/` | FastAPI REST services, PostgreSQL schema, Merkle DAG ledger, ReportLab Form-1 | ~4,200 lines Python | Standalone verified (73 tests pass) |
| `members/member-06-ui/` | React 18 SPA, HUD, Adjudication Canvas, Vite build, Tailwind design tokens | ~12,000 lines TypeScript/TSX | Standalone verified (104 tests pass) |
| `contracts/` | Canonical interface contracts, Pydantic models, JSON schemas for zero coupling | ~1,800 lines Python / JSON | Frozen SSOT |
| `integration/` | End-to-end pipeline adapter, test HUD, golden fixtures, cross-member test suites | ~3,500 lines Python / HTML | Standalone verified (57 tests pass) |

---

## 2. End-to-End User Journeys: Intended vs Implemented vs Reality

### 2.1 The Intended Statutory Enforcement Journey
1. **Officer Ingestion:** Field Inspector logs into portal, captures packaging image on smartphone/tablet with ArUco calibration card in frame.
2. **Instant Pre-Screening:** System checks blur, glare, and perspective in $< 200\text{ ms}$; if blurry, prompts immediate physical retake.
3. **Automated Pipeline Execution:** Server rectifies homography, calculates Principal Display Panel (PDP) surface area, extracts multilingual tokens, parses entities, and evaluates compliance across all LMPC rules in $< 1200\text{ ms}$.
4. **Adjudication Canvas (HITL):** Officer reviews findings in split-view canvas; measured font heights are displayed in physical millimeters alongside digital caliper overlay.
5. **Officer Review:** If satisfied, officer confirms violation with mandatory justification remarks.
6. **Notice Dispatch:** Controller of Legal Metrology authorizes issuance; system generates Section 36(1) Form-1 Show Cause Notice PDF with embedded Section 63 BSA 2023 certificate and cryptographic Merkle root.

### 2.2 The Implemented Reality Today
- **Steps 1–4:** **100% OPERATIONAL & VERIFIED.** Works in both the live React SPA (`http://localhost:3000`) and the zero-build test HUD (`http://127.0.0.1:8000/test-ui`). Real ONNX models run in sub-second time.
- **Step 5 (Adjudication):** **100% OPERATIONAL & VERIFIED.** Adjudication updates case state in database and appends cryptographic audit record to Merkle ledger.
- **Step 6 (Notice Dispatch):**
  - **CLI / Standalone Execution:** **100% OPERATIONAL.** `inspect_cli.py --issue-notice` produces clean 10.4 KB Form-1 PDF in ~150 ms.
  - **REST API Path:** **PARTIALLY BROKEN (Bug #1).** When `POST /api/v1/notices/generate` is called on an existing inspection record that was already processed in the database, it fails with HTTP 500 (`sqlite3.IntegrityError: UNIQUE constraint failed: bsa_certificates.inspection_id`) because the handler unconditionally inserts a duplicate `BSACertificate` row rather than reusing the existing certificate.

---

## 3. Subsystem-by-Subsystem Deep Dive

### 3.1 Member 1: Computer Vision & Metrology
- **Optical Quality Gate:** Evaluates Laplacian variance ($\text{threshold} \ge 150.0$), specular glare saturation ($\le 3.0\%$ of PDP area in HSV $V \ge 250, S \le 30$), and perspective tilt angle ($\le 15^\circ$).
- **Fiducial Metric Calibration:** Uses OpenCV `cv2.aruco` with `DICT_4X4_50` ($50.0\text{ mm}$ physical ground truth). Subpixel corner refinement (`CORNER_REFINE_SUBPIX`) guarantees high geometric precision.
- **Card Fallback Standard:** When ArUco is absent, automatically detects standard ISO 7810 ID-1 card dimensions ($85.60 \times 53.98\text{ mm}$, aspect ratio $1.5858$), enabling field officers to use any standard laminated office ID or payment card as a metric reference.
- **Principal Display Panel (PDP) Geometry:** Implements Rule 2(h) calculations for rectangular ($H \times W$) and cylindrical packaging ($0.40 \times \pi \times D \times H$). Tested on 6 industrial packaging geometries ranging from 250ml slim energy cans to 20L water carboys.

### 3.2 Member 2: Multilingual Deep Learning OCR
- **Deep Learning Architecture:**
  - Text Detection: DBNet++ (`ch_PP-OCRv4_det_int8.onnx`, 4.99 MB)
  - Latin Recognition: PP-OCRv4 (`en_PP-OCRv4_rec_infer_int8.onnx`, 7.74 MB)
  - Devanagari Hindi Recognition: PP-OCRv3 (`devanagari_PP-OCRv4_rec_int8.onnx`, 3.09 MB)
- **Quantization & Execution Mode:** Full static post-training INT8 quantization (QDQ format). Inference executes purely on CPU via ONNX Runtime in ~400 ms without requiring CUDA or GPU hardware.
- **Coordinate Normalization:** All detected polygon vertices are normalized into $[0.0, 1.0]$ canonical space with explicit bounding boxes $[ymin, xmin, ymax, xmax]$, enabling dynamic SVG coordinate overlays in the frontend regardless of viewport scaling.

### 3.3 Member 3: Semantic Extraction & Statutory Parsers
- **Coverage of Declarations:** Extracts Commodity Name, Net Quantity, MRP, Unit Sale Price (USP), Date of Manufacture/Packaging, Best Before / Expiry, Complete Manufacturer/Packer Address with PIN code, Consumer Care details (Email, Phone, Postal), and Country of Origin.
- **Section 11 / Rule 12 Banned Unit Detector:** Flags illegal non-standard units (`gms`, `gm`, `g.m.`, `g.`, `ML`, `Ml`, `ltrs`, `cc`).
- **Legal Defense Standards:**
  - **Latin Abbreviations Defense:** Masks `e.g.`, `i.e.`, `etc.` to prevent false flagging of serving suggestions.
  - **Tech Acronyms Defense:** Masks `AI/ML` and `Machine Learning` to prevent false mega-litre violation flags on modern packaging.
  - **Corporate Entity Defense:** Never flags uppercase `GM` unless accompanied by numeric quantity or rate denominator.
  - **Indic Script Boundaries:** Uses unicode lookbehinds `(?<![a-zA-Z\u0900-\u097F])` to prevent Indian state suffixes (`उत्तर प्रदेश`, `मध्य प्रदेश`) from falsely leaking into country of origin fields.

### 3.4 Member 4: Legal AST Rule Engine
- **Deterministic AST Engine:** Zero probabilistic hallucinations; compliance decisions are derived by deterministic evaluation nodes.
- **Amended Table-I Schedule:** Strictly encodes G.S.R. 629(E) dated 23.06.2017:
  - $\text{Area} \le 50\text{ cm}^2 \implies 1.0\text{ mm}$
  - $50 < \text{Area} \le 100\text{ cm}^2 \implies 1.5\text{ mm}$
  - $100 < \text{Area} \le 500\text{ cm}^2 \implies 2.5\text{ mm}$
  - $500 < \text{Area} \le 2500\text{ cm}^2 \implies 4.0\text{ mm}$
  - $\text{Area} > 2500\text{ cm}^2 \implies \mathbf{6.0\text{ mm}}$ (Row 5 strictly enforces 6.0 mm per ADL-01).
- **Unit Sale Price (USP) Math:** Enforces Rule 6(1)(k) / G.S.R. 779(E) with $|(USP \times NetQty) - MRP| \le 0.02\text{ INR}$.
- **Jan Vishwas Act 2023 Decriminalization:** Automatically calculates statutory compounding recommendations under Section 48 read with Section 36(1) of the LM Act (up to ₹25,000 compounding fine for first offenses).
- **4-State Epistemic Verdict:** Classifies all evaluations into `PASS`, `FAIL`, `REVIEW` (within sensor uncertainty $k=2$), and `UNABLE_TO_VERIFY` (optical degradation).

### 3.5 Member 5: Evidence & Backend Architecture
- **FastAPI Framework:** 20+ REST endpoints covering authentication, image upload, e-commerce DOM ingestion, pipeline execution, adjudication, compounding, notice generation, and telemetry.
- **Relational Schema:** 9 normalized tables in PostgreSQL / SQLite: `jurisdictions`, `users`, `inspections`, `audit_logs`, `evidence_images`, `bsa_certificates`, `bounding_boxes`, `legal_notices`, `compliance_evaluations`.
- **Merkle DAG Chain-of-Custody:** SHA-256 parent-child hashing maintains an immutable audit trail. Any tampering with stored evidence breaks the root hash.
- **Section 63 BSA 2023 Certificate:** Emits electronic certificate with hardware serial, OS build, hash algorithm, raw images Merkle root, and officer digital signature token.

### 3.6 Member 6: Frontend & Adjudication HUD
- **Modern Institutional UI:** Built with React 18, Vite, Tailwind CSS, and Lucide icons.
- **Flagship Adjudication Canvas:** Interactive packaging view with synchronized zoom, pan, digital vernier caliper overlay, ArUco scale overlay, and pixel magnification loupe.
- **Dual Personas:** Instant toggle between:
  - *Inspector Persona:* Full statutory citations, millimeter tolerances, deficit calculations, and penal compounding recommendations.
  - *Citizen / Plain Language Persona:* Simplified explanations of consumer rights, clear pass/fail indicators, and plain-language summaries.
- **Offline / Online State Awareness:** Telemetry badges display real-time connection status (Mode A vs Mode B) and database connectivity.

---

## 4. Integration & Data Flow Verification

```
[Raw Image / DOM]
       |
       v (SHA-256 Hashing -> storage/uploads/)
[Quality Gate] ------ (Failed: Var < 150 or Glare > 3%) ------> UNABLE_TO_VERIFY (Retake Advice)
       | (Passed)
       v
[Metric Calibration] -> px_to_mm scale, homography warp, PDP area (cm²)
       |
       v
[DBNet++ ONNX INT8] -> Text detection bounding polygons
       |
       v
[PP-OCRv4 / v3 ONNX] -> Multilingual token transcription + confidence
       |
       v
[Semantic Extractor] -> Entity classification, regex normalizers, banned unit detector
       |
       v
[AST Rule Engine] -> Table-I schedule, USP math, 4-state verdict, Jan Vishwas compounding
       |
       v
[Merkle DAG Ledger] -> Cryptographic hash chaining + Section 63 BSA 2023 Certificate
       |
       v
[Officer Adjudication (HITL)] -> Mandatory remarks, PIN validation, action order
       |
       v
[ReportLab Engine] -> Official Form-1 Legal Show Cause Notice PDF/A
```
All stages pass strict Pydantic contract validation defined in `contracts/`.
