# FINAL SIX-MEMBER DEVELOPMENT WORKSTREAM SPECIFICATION

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Sprint Window:** 07 September 2026 to 13 September 2026 (6 Days)  
**Status:** FROZEN & ASSIGNED  

---

### Workstream Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                6-MEMBER PARALLEL WORKSTREAM ALLOCATION                                 │
├───────────────────────────────┬───────────────────────────────┬────────────────────────────────────────┤
│ MEMBER 1: CV, OPTICS & SCALE  │ MEMBER 2: MULTILINGUAL OCR    │ MEMBER 3: SEMANTIC EXTRACTION          │
│ • Optical Quality Gate        │ • DBNet++ Text Detection      │ • Regex Token Normalizer               │
│ • ArUco & Card Homography     │ • PP-OCRv4 Recognizer         │ • Spatial Proximity Graph              │
│ • PDP Surface Area Calculator │ • Tesseract Fallback          │ • Indian Postal Address NER            │
├───────────────────────────────┼───────────────────────────────┼────────────────────────────────────────┤
│ MEMBER 4: STATUTORY ENGINE    │ MEMBER 5: BACKEND & PLATFORM  │ MEMBER 6: WEB UX & INTEGRATION         │
│ • Temporal Epoch Dispatcher   │ • FastAPI Server & Endpoints  │ • React 18 Web SPA & HUD               │
│ • Declarative AST Rules       │ • PostgreSQL 16+ & Storage    │ • Central Dashboard & History          │
│ • 4-State Epistemic Triage    │ • JWT / RBAC & Security       │ • Upload & Multi-Panel Workflow        │
│ • E-Commerce Compliance Check │ • Section 63 BSA 2023 & PDF   │ • Local Resilient Fallback UI          │
└───────────────────────────────┴───────────────────────────────┴────────────────────────────────────────┘
```

---

### Detailed Member Responsibilities

#### MEMBER 1: Lead Computer Vision & Metrology Engineer

- **Role:** Optical Quality, Calibration & Geometric Measurement
- **Primary Objective:** Deliver sub-millimeter physical scale calibration and optical gating on commodity cameras.
- **Core Tasks:**
  1. Implement Laplacian variance blur estimator ($\sigma^2 < 60 \implies \text{RETAKE}$).
  2. Implement HSV saturation specular glare detector ($V > 245, S < 15$).
  3. Implement ArUco fiducial marker detector and ISO 7810 card contour detector.
  4. Compute $3 \times 3$ planar homography matrix $H$ via OpenCV Direct Linear Transform.
  5. Warp perspective to orthogonal plane and compute metric scale factor $S = \text{mm/pixel}$.
  6. Calculate Principal Display Panel (PDP) surface area in $\text{cm}^2$ for rectangular and cylindrical packaging.
- **Deliverables:** `core/quality_gate/` and `core/homography/` Python modules with unit tests.
- **Interface Output:** `QualityGateResult` and `CalibrationResult` JSON schemas.
- **Acceptance Criteria:** MAE $\le 0.15\text{ mm}$ against vernier caliper measurements on planar test targets.

#### MEMBER 2: Deep Learning & Multilingual OCR Engineer

- **Role:** Perception Engine & Scene Text Recognition
- **Primary Objective:** High-speed multilingual text extraction across English and Devanagari Hindi on server and local CPUs.
- **Core Tasks:**
  1. Export DBNet++ text detector to ONNX and apply INT8 Post-Training Quantization.
  2. Export PaddleOCR PP-OCRv4 (SVTR) recognizer to ONNX INT8 with Latin and Devanagari dictionaries.
  3. Implement polygonal bounding box crop extraction and coordinate normalizer.
  4. Implement secondary consensus pass with Tesseract v5 on low-confidence crops ($\text{conf} < 0.65$).
  5. Measure character-level confidence scores and construct token list.
- **Deliverables:** `core/ocr_engine/` ONNX pipeline with benchmark test script.
- **Interface Output:** `OCROutput` JSON schema with polygons, text strings, and confidences.
- **Acceptance Criteria:** CER $\le 3.0\%$ on printed text; total inference latency $\le 200\text{ ms}$ on CPU per panel.

#### MEMBER 3: Information Extraction & NLP Engineer

- **Role:** Semantic Token Linking & Entity Normalization
- **Primary Objective:** Convert raw OCR tokens into verified statutory packaging entities without hallucinations.
- **Core Tasks:**
  1. Implement deterministic regex parsers for MRP, tax clauses, Net Quantity, and Unit Sale Price.
  2. Implement prohibited metric unit symbol detector (flagging `gms`, `gm`, `Kgs`, `ML`, `ltrs`).
  3. Build 2D spatial proximity graph (K-D Tree) to link key-value pairs on packaging labels.
  4. Implement Devanagari numeral converter mapping Indic digits (०..९) to IEEE floating-point numbers.
  5. Implement Indian postal address segmenter extracting State and 6-digit PIN codes.
  6. Implement Consumer Care 4-tuple completeness verifier (Contact, Address, Phone regex, Email regex).
- **Deliverables:** `core/extractor/` Python module with comprehensive regex test suite.
- **Interface Output:** `NormalizedCommodityFacts` JSON schema.
- **Acceptance Criteria:** Exact Field Match $\ge 95\%$ on synthetic and physical pilot datasets.

#### MEMBER 4: Legal Metrology & Rule Engine Architect

- **Role:** Statutory Compliance Logic & Temporal Reasoning
- **Primary Objective:** Translate the Legal Metrology Act and LMPC Rules into an auditable, deterministic AST engine.
- **Core Tasks:**
  1. Create immutable JSON rule snapshots for each statutory milestone (2011 Base, 2017 Font, 2021 USP, 2023 Jan Vishwas).
  2. Implement Temporal Statutory Epoch Dispatcher matching product Mfg Date to rule snapshot.
  3. Implement Table-I font-height evaluator comparing measured mm against required threshold by PDP area.
  4. Implement Unit Sale Price (USP) arithmetic consistency checker: $\|(\text{USP} \times \text{NetQty}) - \text{MRP}\| \le 0.02$.
  5. Implement Net Quantity exclusion space margin checker (clearance $\ge 1\times$ V, $2\times$ H).
  6. Implement 4-State Epistemic Verdict Triage (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`).
  7. Implement E-Commerce marketplace compliance checker under Rule 6(10).
- **Deliverables:** `core/rule_engine/` AST evaluator, rule definition JSONs, and statutory test suites.
- **Interface Output:** `ComplianceVerdictResult` JSON schema with exact Gazette GSR citations.
- **Acceptance Criteria:** $100\%$ rule traceability; zero hallucinations; execution time $< 5\text{ ms}$.

#### MEMBER 5: Lead Backend, Platform & Database Engineer

- **Role:** Web Platform, Database Architecture, Security & Evidentiary Dossier
- **Primary Objective:** Deliver robust, scalable FastAPI web application services, PostgreSQL datastore, and court-ready Section 63 BSA 2023 evidence generator.
- **Core Tasks:**
  1. Build FastAPI application server with async lifespan management, dependency injection, and Pydantic v2 schemas.
  2. Implement PostgreSQL 16+ database schema, SQLAlchemy 2.0 models, Alembic migrations, and SQLite sync bridge.
  3. Implement central file storage manager (`/storage/uploads/`, `/storage/evidence/`) with SHA-256 content keying.
  4. Implement JWT authentication, RBAC middleware, and security hardening (magic byte validation, 15MB cap, rate limiting).
  5. Implement SHA-256 Merkle DAG chaining raw images, calibration matrices, OCR tokens, and rule findings under Section 63 BSA 2023.
  6. Implement ReportLab PDF generator producing court-ready, tamper-evident statutory Inspection Memos (Form 1) with embedded crops and QR code.
- **Deliverables:** `backend/` application service, database migrations, security dependencies, and ReportLab PDF generator.
- **Interface Output:** REST API OpenAPI contract, database schema, and ready-to-print `InspectionDossier.pdf`.
- **Acceptance Criteria:** P95 API response $< 100\text{ ms}$ for metadata queries; PDF generation $< 1.5\text{ seconds}$; validated Merkle tree root.

#### MEMBER 6: Lead Frontend, Web UX & Integration Engineer

- **Role:** Web Application SPA, Officer HUD, Central Dashboard & System Packaging
- **Primary Objective:** Build an intuitive, responsive web application interface for inspectors and controllers with local fallback capabilities.
- **Core Tasks:**
  1. Build React 18 + Vite web Single Page Application with responsive design for desktop, laptop, tablet, and mobile.
  2. Implement guided multi-panel capture & file upload workflow tracking progress across packaging facets.
  3. Implement Side-by-Side Review Canvas displaying original photo, rectified crop, millimeter grid, and rule citations.
  4. Build Centralized Enforcement Dashboard with search, filters (status, circle, date), and paginated historical inspection views.
  5. Implement Connection Status Indicator badge (`ONLINE`, `LOCAL MODE`, `DISRUPTED`) and offline session caching.
  6. Package the full application stack into Docker Compose for standard deployment, and assemble demo assets and test cases.
- **Deliverables:** `frontend/` React SPA codebase, Docker Compose configuration, and end-to-end integration demo harness.
- **Interface Output:** Clean, accessible browser SPA interface communicating with backend REST endpoints.
- **Acceptance Criteria:** $< 100\text{ ms}$ client UI responsiveness; full end-to-end web inspection flow working in under 1.8 seconds.
