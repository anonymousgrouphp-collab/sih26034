<p align="center">
  <img src="docs/design/nirikshak-banner-hero.svg" alt="NIRIKSHAK — Legal Metrology Inspection Workstation" width="100%" />
</p>

# Nirikshak

> **AI-assisted Legal Metrology Inspection & Evidence Workstation**<br/>
> *Statutory Compliance Verification & Evidentiary Dossier Generation for the Department of Consumer Affairs (DoCA)*

[![Problem ID](https://img.shields.io/badge/Problem%20ID-SIH26034-blue.svg?style=flat-square)](https://www.sih.gov.in/)
[![Ministry](https://img.shields.io/badge/Ministry-Consumer%20Affairs%2C%20Food%20%26%20Public%20Distribution-green.svg?style=flat-square)](https://consumeraffairs.nic.in/)
[![Department](https://img.shields.io/badge/Department-DoCA-teal.svg?style=flat-square)](https://consumeraffairs.nic.in/)
[![Architecture](https://img.shields.io/badge/Architecture-Online--First%20Web%20Monolith-success.svg?style=flat-square)]()
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2016%2B%20%7C%20SQLite%20Mode%20B-blue.svg?style=flat-square)]()
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18%2B%20Vite%206-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX%20Runtime-INT8%20CPU-005CED.svg?style=flat-square)](https://onnxruntime.ai/)
[![Tests](https://img.shields.io/badge/Tests-562%20Passed%20%7C%2055%20Files-brightgreen.svg?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=flat-square)](LICENSE)

---

## Overview

**Nirikshak** is an institutional-grade, AI-assisted legal metrology inspection and evidence workstation built for enforcement officers and controllers under the **Department of Consumer Affairs (DoCA)**, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

Designed to eliminate fragmented field enforcement workflows, Nirikshak centralizes photographic evidence intake, optical scale calibration, multilingual text extraction, statutory rule verification, cryptographic chain-of-custody tracking, and human-in-the-loop adjudication into a unified digital desk.

The platform audits packaged commodities against the statutory mandates of the **Legal Metrology Act, 2009** and the **Legal Metrology (Packaged Commodities) Rules, 2011** (incorporating Gazette amendments up to 2026, including G.S.R. 629(E), G.S.R. 779(E), and G.S.R. 128(E)).

---

## Problem

Enforcement officers conducting field packaging audits face severe operational hurdles:
1. **Scattered Evidence & Broken Traceability:** Officers take ad-hoc camera photos with smartphones, manually record field observations in paper notebooks, and compute metrics using hand calculators, creating fractured custody chains prone to evidentiary challenge.
2. **Manual Transcription & High Cognitive Load:** Transcribing dense statutory declarations (MRP, Net Quantity, Unit Sale Price, Manufacturing Dates, Consumer Care, Country of Origin) across English and regional Indic scripts is slow and error-prone.
3. **Complex Metric Font Verification:** Verifying minimum numeral font heights across packaging surface areas under Table-I (varying from $1.0\text{ mm}$ to $6.0\text{ mm}$) requires physical vernier calipers and geometric surface area calculations that are difficult to replicate in the field.
4. **Disjointed Adjudication:** Automated scanning tools often operate as opaque "black boxes" that attempt to output final legal verdicts autonomously, violating administrative due process and failing statutory evidentiary standards.

---

## Solution

Nirikshak establishes a structured **Augmented Diagnostic Assistant** workstation that pairs deterministic computer vision and multilingual deep learning with mandatory **Human-in-the-Loop (HITL)** adjudication:

```text
Inspector Workstation
        ↓
Evidence Intake (Browser Camera / High-Res Upload / Single E-Commerce Listing)
        ↓
Optical Quality Gate (Laplacian Blur Variance ≥ 150 | Specular Glare ≤ 3.0%)
        ↓
Planar Homography & Metrology Calibration (ArUco 4×4 / ISO Bank Card Fiducials)
        ↓
Multilingual Deep Learning OCR (DBNet++ Detection + PP-OCRv4 Multilingual Recognition)
        ↓
Connected Component Font Measurement (Physical Millimeter Height Calculation)
        ↓
Semantic NLP Extraction (Statutory Regex Invariants + Indic Word Boundary Isolation)
        ↓
Deterministic Legal Rule Engine (Table-I Font Schedule + USP Math Cross-Check)
        ↓
Cryptographic Provenance (SHA-256 Merkle DAG Hash Tree + Section 63 BSA Manifest)
        ↓
HITL Adjudication Canvas (Side-by-Side Visual Verification & Mandatory Text Override)
        ↓
Statutory Disposal / Form-1 Legal Notice (ReportLab Form-1 Statutory Notice PDF with QR Verification & SHA-256 Merkle Root)
```

Nirikshak strictly assists the officer; it **never** issues compounding orders, penalty notices, or citations autonomously. The officer reviews all visual evidence bounding boxes, evaluates borderline findings, inputs mandatory remarks for any modifications, and signs the final disposition.

---

## Key Features

### 1. Optical Quality Gate & Viewfinder HUD
- **Real-Time Blur & Glare Defense:** Measures Laplacian variance ($\ge 150.0$) and specular saturation masks ($\le 3.0\%$) to reject degraded or blurry photos before downstream processing.
- **Guided Recapture UI:** Provides visual feedback prompts for optical stabilization, lighting adjustment, and distance correction.

### 2. Physical Metrology & Planar Scale Calibration
- **Sub-Millimeter Calibration:** Derives the true physical pixel-to-millimeter ratio ($\text{scale\_px\_per\_mm}$) using planar homography from standardized reference fiducials (ArUco 4×4 markers or ISO/IEC 7810 ID-1 standard reference cards: $85.60\text{ mm} \times 53.98\text{ mm}$).
- **Principal Display Panel (PDP) Geometry:** Calculates the physical surface area in $\text{cm}^2$ across rectangular, cylindrical, or irregular package faces to determine the applicable statutory Table-I font threshold.

### 3. Multilingual Indic OCR Engine
- **Lightweight CPU-Optimized Architecture:** DBNet++ polygon text detection and PP-OCRv4 text recognition vectorized for INT8 CPU execution using ONNX Runtime.
- **Bilingual English & Devanagari Hindi:** Accurately transcribes statutory numerals and text strings, handling complex Hindi ligatures, Indic vowel matras, and mixed alphanumeric product codes.

### 4. Semantic Extraction & Evidentiary Invariants
- **Statutory Entity Parsing:** Extracts mandatory label attributes: Maximum Retail Price (MRP), Net Quantity, Unit Sale Price (USP), Date of Manufacture/Packaging, Expiry Date, Consumer Care Address/Email/Phone, and Country of Origin.
- **Prohibited Unit Flagger:** Flags non-standard, prohibited unit abbreviations (`gms`, `gm`, `ML`, `ltrs`) mandated under Section 11 of the Legal Metrology Act, 2009.
- **Adversarial Input Defense:** Sanitizes Latin abbreviations (`e.g.`, `i.e.`) and technical acronyms (`AI/ML`) to prevent false-positive unit violation flags.

### 5. Deterministic Compliance Rule Engine
- **Table-I Schedule Enforcement:** Enforces minimum numeral font heights per packaging area schedules:
  - $\text{Area} \le 50\text{ cm}^2 \rightarrow 1.0\text{ mm}$
  - $50 < \text{Area} \le 100\text{ cm}^2 \rightarrow 1.5\text{ mm}$
  - $100 < \text{Area} \le 500\text{ cm}^2 \rightarrow 2.5\text{ mm}$
  - $500 < \text{Area} \le 2500\text{ cm}^2 \rightarrow 4.0\text{ mm}$
  - $\text{Area} > 2500\text{ cm}^2 \rightarrow \mathbf{6.0\text{ mm}}$ *(Correcting historical 8.0 mm misprints per G.S.R. 629(E))*
- **USP Mathematical Cross-Check:** Verifies unit sale price consistency against declared MRP: $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$ with IEEE 754 precision protection.
- **Temporal Epoch Router:** Enforces amendments strictly by manufacturing date (e.g. USP mandatory only for commodities packaged on or after 01 January 2022 per G.S.R. 779(E)).
- **E-Commerce Rule 6(10) Compliance:** Validates digital listings for mandatory declarations (Manufacturer, Net Qty, MRP, Consumer Care, Country of Origin) while correctly applying statutory manufacturing date exemption.

### 6. Human-in-the-Loop Adjudication Canvas
- **Visual Overlay & Bounding Polygon Inspection:** Inspects raw image coordinates against OCR text tokens with zoom, pan, and coordinate inspection tools.
- **Interactive Conflict Resolution:** Allows officers to override automated field classifications or font measurements, enforcing mandatory written justifications to prevent arbitrary officer tampering.
- **Role-Based Action Controls (RBAC):** Inspectors can intake evidence, run analysis, and propose findings; only authorized Controllers can issue formal compounding orders or sign statutory Form-1 notices.

### 7. Cryptographic Chain-of-Custody & BSA 2023 Workflows
- **Section 63 BSA Evidence Workflows:** Generates electronic-evidence metadata and cryptographic certificates citing Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (repealing Section 65B of the Indian Evidence Act, 1872).
- **SHA-256 Merkle DAG Hash Chain:** Links raw photographic inputs, pipeline intermediate tokens, rule engine AST payloads, and officer adjudication timestamps into an immutable cryptographic hash tree.
- **Dynamic ReportLab Form-1 Notice:** Assembles cryptographically anchored Form-1 statutory notices (ReportLab PDF) containing case metadata, violation ledgers, embedded high-resolution cropped evidence, QR code verification, Merkle root hashes, and officer digital signatures.

### 8. Mode B Local Field Resiliency
- **Offline Inspection Engine:** Field officers deployed in wholesale mandis, rural markets, or network-deprived basements can run Nirikshak locally on field laptops (`localhost:8000`) using SQLite storage.
- **Cryptographic Sync Bundles:** Packages offline inspection records, evidence images, and audit logs into signed `.json` sync bundles for idempotent reconciliation with the central Mode A database upon reconnecting.

---

## Why It Matters

| Dimension | Traditional Inspection | Nirikshak Workstation |
|:---|:---|:---|
| **Evidence Traceability** | Disconnected camera photos and paper notes | Cryptographic SHA-256 Merkle DAG linking raw pixels to statutory notices |
| **Measurement Accuracy** | Manual mechanical calipers subject to parallax | Homography-rectified physical scale calibration ($\le 0.15\text{ mm}$ error margin) |
| **Multilingual Support** | Manual translation and transcription | INT8 CPU deep learning for English & Devanagari Hindi text |
| **Statutory Nuance** | Risk of applying repealed rules or wrong font rows | Codified AST rule engine enforcing exact Gazette amendment timelines |
| **Legal Due Process** | "Black-box" automated scoring vs manual bureaucracy | Human-in-the-Loop: AI assists, qualified officer adjudicates with mandatory audit log |
| **Evidentiary Integrity** | Citing repealed Section 65B Indian Evidence Act | Electronic-evidence metadata and cryptographic hash manifests designed to support Section 63 BSA workflows |

---

## Architecture

Nirikshak is architected as an **Online-First Modular Monolith** combining a React 18 single-page application with a high-throughput FastAPI service and INT8 deep learning models:

```mermaid
flowchart TD
    subgraph Client ["Client Presentation Tier (Browser)"]
        UI["React 18 SPA (Vite 6 + Tailwind CSS)"]
        Cam["HTML5 MediaDevices Camera HUD"]
        Desk["Adjudication Canvas & Split-View Desk"]
    end

    subgraph Gateway ["Network & Security Layer"]
        Proxy["Nginx Reverse Proxy / TLS 1.3 / Rate Limiter"]
    end

    subgraph AppServer ["Core Application Monolith (main.py)"]
        API["FastAPI 0.110+ Modular REST Catalog"]
        RBAC["OAuth2 Bearer JWT RBAC Engine"]
        Storage["Decoupled Storage Manager (/storage/)"]
    end

    subgraph Pipeline ["Deterministic 12-Stage Inspection Pipeline"]
        QG["Stage 1: Laplacian Quality Gate"]
        Calib["Stage 2: ArUco / ISO Card Planar Homography"]
        OCR["Stage 3: DBNet++ & PP-OCRv4 Multilingual OCR"]
        Font["Stage 4: Connected Component Font Measurement"]
        NER["Stage 5: Statutory Semantic Extraction"]
        Rule["Stage 6: AST Legal Metrology Rule Engine"]
    end

    subgraph EvidenceStore ["Evidentiary & Persistence Tier"]
        Merkle["Merkle DAG Audit Chain (SHA-256)"]
        BSA["Section 63 BSA 2023 Digital Certificate"]
        PDF["ReportLab Form-1 Statutory Notice PDF Generator"]
        DB[(PostgreSQL 16+ Primary / SQLite Mode B)]
    end

    Cam --> UI
    UI -->|HTTPS / OpenAPI 3.1| Proxy
    Proxy --> API
    API --> RBAC
    API --> Storage
    API --> Pipeline
    Pipeline --> QG
    QG -->|Pass| Calib
    Calib --> OCR
    OCR --> Font
    Font --> NER
    NER --> Rule
    Rule --> Merkle
    Merkle --> BSA
    BSA --> PDF
    API --> DB
    Desk <--> UI
```

---

## End-to-End Data Flow

1. **Intake:** The officer captures a photo via the browser camera or uploads a high-resolution packaging image. E-commerce product URLs can also be ingested.
2. **Quality Gate:** The server calculates the Laplacian blur variance and specular glare saturation. If the image is degraded, the upload is rejected with clear remediation guidance.
3. **Rectification & Scaling:** The image is rectified using planar homography against detected ArUco or standard reference card corners, establishing true physical scale ($\text{px}/\text{mm}$).
4. **Multilingual OCR:** DBNet++ detects word polygons; PP-OCRv4 extracts character strings across English and Hindi.
5. **Measurement & Parsing:** Connected component analysis measures the physical numeral height of declarations. Semantic extractors parse MRP, Net Qty, Dates, and Addresses.
6. **Statutory Evaluation:** The AST rule engine checks Table-I font heights against packaging area, verifies USP math, checks mandatory clauses, and flags non-standard units.
7. **Provenance & Ledger:** An SHA-256 Merkle root is calculated across all pipeline outputs and logged into the append-only cryptographic audit ledger.
8. **Officer Review & Adjudication:** The inspection appears on the officer's Adjudication Canvas. The officer reviews side-by-side overlays, accepts or overrides findings, and inputs required text remarks.
9. **Notice Generation:** Upon controller authorization, electronic-evidence metadata designed to support Section 63 BSA workflows and a cryptographically anchored Form-1 statutory legal notice PDF are generated and permanently linked to the case.

---

## Tech Stack

| Layer | Core Technologies | Specification / Purpose |
|:---|:---|:---|
| **Frontend SPA** | React 18.3, Vite 6.0, TypeScript 5.7 | High-performance responsive inspector workstation |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React, Framer Motion | Government of India design tokens, accessible UI, micro-animations |
| **API & Backend** | FastAPI 0.110+, Python 3.11+, Pydantic v2 | High-throughput asynchronous REST catalog |
| **Application Server** | Uvicorn ASGI | Modular monolith process server |
| **Primary Datastore** | PostgreSQL 16+ | Relational schema, indices, JSONB evidence graphs |
| **Local Resilient DB** | SQLite 3.45+ (SQLCipher-ready schema) | Mode B offline field database |
| **Computer Vision** | OpenCV 4.9+ (`opencv-python-headless`) | Laplacian blur variance, glare masking, ArUco 4×4 fiducial homography |
| **Multilingual OCR** | DBNet++ (Detection), PP-OCRv4 (Recognition) | INT8 CPU quantized inference via ONNX Runtime 1.17+ |
| **Fallback OCR** | Tesseract 5 / pytesseract | Permissive fallback engine |
| **Rule Engine** | Deterministic Python AST | Exact statutory schedule logic without probabilistic drift |
| **Notice Generation** | ReportLab 4.1+ | Form-1 Statutory Notice PDF generation with embedded QR verification and SHA-256 Merkle root |
| **Cryptography** | `hashlib` (SHA-256) | Append-only Merkle DAG hash tree |
| **License Compliance** | Apache-2.0, MIT, BSD-3-Clause | Zero copyleft AGPL dependencies |

---

## Project Structure

```text
.
├── main.py                             # Monolith production server (FastAPI + SPA mount)
├── local_runner.py                     # Mode B standalone offline runner (localhost:8000)
├── inspect_cli.py                      # Headless CLI inspection utility
├── requirements.txt                    # Root Python dependencies
├── pytest.ini                          # Test configuration
├── docker-compose.yml                  # Container deployment specification
├── Dockerfile                          # Multi-stage production container build
│
├── ui-combined/                        # React 18 + Vite 6 Production Frontend
│   ├── src/
│   │   ├── components/                 # Reusable Gov.in design components
│   │   ├── features/
│   │   │   ├── adjudication/           # Split-view Canvas, Bounding Boxes, Ledger
│   │   │   ├── case/                   # Case workspace, intake, closure modal
│   │   │   ├── demo/                   # Golden SKU showcase & catalog
│   │   │   └── desk/                   # Inspection desk & quick triage
│   │   ├── pages/                      # Dashboard, Inspections, Evidence Dossier, Rules
│   │   └── services/                   # LiveApiService, MockApiService, StorageService
│   ├── tests/                          # 18 test files (142 passing tests via tsx)
│   └── package.json
│
├── members/                            # Standalone Tested Subsystem Modules
│   ├── member-01-cv-metrology/         # Optical Quality Gate, ArUco Homography & Scaling
│   │   ├── src/ (calibration.py, quality_gate.py)
│   │   └── tests/ (43 passing tests)
│   ├── member-02-ocr/                  # DBNet++ & PP-OCRv4 Multilingual ONNX Engine
│   │   ├── src/ (engine.py, detector.py, recognizer.py)
│   │   ├── models/ (devanagari_dict.txt, en_dict.txt, checksums.txt)
│   │   └── tests/ (78 passing tests)
│   ├── member-03-extraction/           # Statutory Entity Parsers & Banned Unit Flaggers
│   │   ├── src/ (parsers.py, extractors.py, normalizers.py)
│   │   └── tests/ (151 passing tests)
│   ├── member-04-rule-engine/          # Table-I Font Schedule & USP Math AST Engine
│   │   ├── src/ (evaluators.py, ast_engine.py, rules.py)
│   │   └── tests/ (53 passing tests)
│   └── member-05-evidence/             # FastAPI REST Server, Database, Merkle DAG & Notice
│       ├── src/ (server.py, database.py, merkle_dag.py, notice_generator.py, storage.py)
│       └── tests/ (71 passing tests)
│
├── integration/                        # Cross-Subsystem Integration Layer
│   ├── adapters/                       # Pipeline adapters bridging subsystems
│   ├── fixtures/                       # Golden Demonstration SKU JSON fixtures
│   └── tests/                          # End-to-end integration tests (24 passing tests)
│
├── contracts/                          # Frozen Pydantic DTOs & Schema Definitions
│   ├── calibration/                    # PlanarHomographyResult, PDPGeometryDTO
│   ├── compliance/                     # RuleEvaluationDTO, ComplianceVerdictResult
│   ├── evidence/                       # BSAEvidenceBundleDTO, Section63CertificateDTO
│   ├── extraction/                     # ExtractedFieldDTO, NormalizedCommodityFacts
│   ├── ocr/                            # OCROutput, OCRToken, BoundingPolygon
│   └── quality_gate/                   # QualityCheckDTO, QualityGateResult
│
├── docs/                               # Master Technical Specifications & Guides
│   ├── COMPLETE_PROJECT_END_TO_END_GUIDE.md # Comprehensive 42-section technical & domain handbook
│   ├── DEPLOYMENT_GUIDE.md             # Production Docker & Cloud deployment guide
│   ├── design/                         # UI/UX blueprints & design system tokens
│   ├── research/                       # Statutory research & domain dossiers
│   ├── specifications/                 # Core ADRs, architecture & interface contracts
│   └── real_packaging_inspections/     # Real Indian packaging testbed images
│
└── Legal Metrology real product images/# 75 Physical packaging test photos & ground truth notes
```

---

## Getting Started

### Prerequisites
- **Python:** Version 3.11, 3.12, or 3.13 (64-bit)
- **Node.js:** Version 18.x or 20.x LTS with npm
- **Database:** PostgreSQL 16+ (Optional for local development; SQLite fallback is fully automated)
- **Git:** Standard git client

---

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anonymousgrouphp-collab/sih26034.git
   cd sih26034
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # Linux / macOS:
   source .venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Start the monolith server:**
   ```bash
   python main.py
   ```
   The backend API will start at `http://localhost:8000`.
   Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd ui-combined
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Start the Vite development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible in your browser at `http://localhost:5173`.
   *Note: Vite is pre-configured to automatically proxy `/api` and `/storage` requests to `http://127.0.0.1:8000`.*

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production build is written to `ui-combined/dist`, which is served directly by `main.py` at `http://localhost:8000`.

---

### Environment Variables

Configure environment variables via `.env` or system environment:

| Variable | Description | Default / Example | Classification |
|:---|:---|:---|:---:|
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./nyayadrishti.db` *(or `postgresql://user:pass@localhost:5432/nyayadrishti`)* | Optional |
| `SECRET_KEY` | Secret key for JWT signing | `statutory_secret_key_nyayadrishti_2026` | Required for Prod |
| `STORAGE_DIR` | Directory for evidence photos & PDFs | `./storage` | Optional |
| `VITE_API_BASE_URL` | API base URL for frontend client | `/api/v1` | Optional |
| `HOST` | Server bind address | `0.0.0.0` | Optional |
| `PORT` | Server bind port | `8000` | Optional |

---

## Running the Application

### 1. Development & Demo Role Seeding
Local development environments automatically seed demo role profiles (`Inspector`, `Controller`, `Admin`, `Viewer`) for evaluation.
Credentials are configured through the development seed configuration (`seed_default_platform_data()` in `members/member-05-evidence/src/database.py`) and must never be reused in production deployments.

For local hackathon evaluation, quick-login buttons and seeded demo credentials are provided directly in the local development login interface.

### 2. Standard Inspection Workflow
1. Open `http://localhost:5173` (or `http://localhost:8000` in production mode).
2. Log in using an Inspector role account.
3. Click **"New Inspection"** from the top bar or dashboard.
4. Select an intake mode:
   - **Upload Photographic Evidence:** Select one or more product photos.
   - **Use Live Camera:** Align package face within the guided viewfinder HUD.
   - **E-Commerce Single Listing:** Ingest a digital listing URL.
   - **Demonstration Showcase:** Select one of the 7 Golden Demonstration SKUs.
5. Click **"Execute Pipeline"** to trigger blur/glare verification, scale calibration, multilingual OCR, and rule engine analysis.
6. Review the **Adjudication Canvas**:
   - Inspect side-by-side visual overlays of detected text boxes.
   - Review rule findings in the ledger.
   - For any overridden finding, input mandatory text remarks.
7. Switch to a Controller role to review officer recommendations, issue compounding orders, or generate the cryptographically anchored **Form-1 Statutory Notice PDF**.

### 3. Headless CLI Inspection
Inspect packages directly from the command line:
```bash
python inspect_cli.py --image "Legal Metrology real product images/item 1 facewash/front_01.jpg" --reference card
```

### 4. Standalone Mode B (Offline Field Runner)
Launch local inspection mode during connectivity blackouts:
```bash
python local_runner.py
```

---

## Real-World Testing & Dataset Validation

Nirikshak includes a real-world physical packaging evaluation testbed:

```text
Legal Metrology real product images/
├── Item 1 - Watch/             # Smart watch packaging (declarations & e-waste markings)
├── Item 2 - General Wellness/  # Wellness commodity (dual language & nutritional panel)
├── item 1 facewash/            # Facewash tube (curved cylindrical PDP surface)
├── item 2 perfume/             # Perfume bottle (metallic foil packaging)
├── item 3 edible/              # Edible oil container (net volume & USP validation)
└── item 4/                     # Biscuit carton (Table-I numeral font height schedule)
```

Each category includes high-resolution photography, perspective variations, specular reflections, and physical verification logs (`COLLECTION_NOTES.txt`) recording ground-truth caliper measurements.

To run automated pipeline validation across real packaging samples:
```bash
python run_real_tests.py
```

---

## Validation & Testing

Nirikshak maintains an exhaustive, deterministic automated test suite covering unit, integration, and UI layers. All test counts are verified directly against the active codebase:

```bash
# 1. Run all Frontend Tests (142 passing tests across 18 test files)
cd ui-combined && npm test

# 2. Run Member 5 Evidence & Backend + Integration Tests (95 passing tests)
python -m pytest members/member-05-evidence/tests/ integration/tests/ -v

# 3. Run Computer Vision, OCR & Rule Engine Unit Tests (174 passing tests)
python -m pytest members/member-01-cv-metrology/tests/ members/member-02-ocr/tests/ members/member-04-rule-engine/tests/ -v

# 4. Run Semantic Extraction Test Suite (151 passing tests)
python -m pytest members/member-03-extraction/tests/ -v
```

### Verified Test Summary
- **Frontend Test Suite (`ui-combined`):** **142 passing tests** across 18 test files (0 failed, 0 skipped)
- **Backend & Subsystem Suites (`members/` & `integration/`):** **420 passing tests** across 37 test files (0 failed, 0 skipped)
- **Authoritative Platform Total:** **562 passing tests across 55 standard test files** (0 failed, 0 skipped)

---

## Human-in-the-Loop Safety

Nirikshak enforces constitutional due process and administrative law safeguards:

1. **Augmented Assistant Boundary:** The platform acts exclusively as an evidentiary diagnostic aid. It does **not** possess autonomous legal agency.
2. **Mandatory Officer Adjudication:** Every automated finding (e.g. font deficit, USP mismatch) is presented as a *preliminary diagnostic recommendation*. A human Legal Metrology Officer (LMO) must explicitly review and sign off on each item.
3. **Mandatory Text Justification for Overrides:** If an officer disagrees with an automated finding (e.g. re-classifying a `FAIL` as `PASS`), the system strictly requires non-empty textual justification. This remark is permanently embedded in the audit trail.
4. **Separation of Duties (RBAC):** Field inspectors can conduct inspections and propose findings; only authorized Controllers can legally dispose of cases, issue compounding orders, or dispatch statutory notices.

---

## Security & Evidence Integrity

1. **Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) Workflows:** Electronic-evidence metadata and cryptographic hash manifests designed to support Section 63 BSA workflows, recording device telemetry, software version hashes, capture timestamps, and custodian badge credentials.
2. **SHA-256 Merkle DAG Hash Chain:** Every stage of analysis (raw photo, rectified crop, OCR tokens, extracted entities, rule evaluations, officer remarks) generates a deterministic SHA-256 hash. These hashes form an immutable Merkle tree anchored in an append-only audit ledger.
3. **Pristine Evidence Preservation:** Ingested images are stored immutably in decoupled storage (`/storage/uploads/`). Bounding boxes and annotations are recorded as SVG vector coordinate layers over the original image, ensuring the original pixels are never altered or compressed destructively.
4. **Statutory Security Gates:** Enforces strict MIME magic-byte validation (rejecting disguised PE/ELF executables per TS-WEB-01) and a statutory 15MB file size limit.

---

## Supported Verdict Model

Nirikshak implements an epistemic **4-State Verdict Model** to prevent false accusations:

```text
┌───────────────────┬────────────────────────────────────────────────────────────────────────┐
│ State             │ Operational Definition & System Action                                 │
├───────────────────┼────────────────────────────────────────────────────────────────────────┤
│ PASS              │ Full statutory compliance verified across all mandatory declarations   │
│                   │ and geometric font schedules.                                          │
├───────────────────┼────────────────────────────────────────────────────────────────────────┤
│ FAIL              │ Definite statutory non-compliance established (e.g. font height       │
│                   │ deficit, banned unit abbreviation 'gms', USP math mismatch > 0.02 INR).│
├───────────────────┼────────────────────────────────────────────────────────────────────────┤
│ REVIEW            │ Borderline measurement falling within the sensor uncertainty band      │
│                   │ (k=2, 95% confidence; e.g. font height within ±0.05 mm of threshold).  │
│                   │ Officer must conduct physical caliper verification.                    │
├───────────────────┼────────────────────────────────────────────────────────────────────────┤
│ UNABLE_TO_VERIFY  │ Optical quality degraded (Laplacian blur variance < 150, specular       │
│                   │ glare bloom > 3%, or label occlusion). Triggers guided recapture UI.   │
└───────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## Demonstration Scenarios

Nirikshak includes 7 **Golden Demonstration SKUs** accessible directly from the workspace:

| SKU ID | Product Title | Package Type | Target Verdict | Statutory Rule Tested | Expected Finding |
|:---|:---|:---|:---:|:---|:---|
| **SKU-DEMO-01** | Sunfeast Butter Cookies 200g | Cardboard Carton | `FAIL` | Table-I Font Schedule & Section 11 | Numeral font height deficit ($2.8\text{ mm}$ observed vs $4.0\text{ mm}$ required for Area $650\text{ cm}^2$); prohibited unit `gms`. |
| **SKU-DEMO-02** | Everest Garam Masala 100g | Flexible Pouch | `FAIL` | Rule 6(1)(k) / G.S.R. 779(E) USP Math | USP calculation mismatch: declared $\text{Rs } 0.45/\text{g}$ vs calculated $\text{Rs } 0.52/\text{g}$ on $\text{Rs } 52.00$ MRP. |
| **SKU-DEMO-03** | Himalayan Mineral Water 1L | Cylindrical Bottle | `PASS` | Rules 6, 7, 8, 9, 10 & Table-I | Nominal compliant baseline: font height $4.2\text{ mm} > 4.0\text{ mm}$, valid standard unit `L`, correct USP calculation. |
| **SKU-DEMO-04** | Medimix Ayurvedic Soap 75g | Cardboard Box | `REVIEW` | Sensor Uncertainty ($k=2, 95\%$) | Borderline measurement: font height $2.48\text{ mm}$ within $\pm 0.05\text{ mm}$ uncertainty of $2.50\text{ mm}$ statutory threshold. |
| **SKU-DEMO-05** | Kurkure Masala Munch 90g | Metallic Foil Pouch | `UNABLE_TO_VERIFY`| Optical Quality Gate (TS-OPTIC-02) | Specular glare bloom on glossy surface obscuring text; prompts guided recapture. |
| **SKU-DEMO-06** | Royal Delight Almonds 500g | E-Commerce Listing | `FAIL` | Rule 6(10) / G.S.R. 128(E) | Missing mandatory Country of Origin; correctly exempts manufacturing date. |
| **SKU-DEMO-07** | Fortune Sunlite Sunflower Oil 1L | Plastic Pouch | `FAIL` | Table-I Indic Hindi Schedule | Hindi Devanagari Net Quantity declaration numeral font height deficit ($2.9\text{ mm} < 4.0\text{ mm}$). |

---

## Limitations

1. **Optical Resolution Dependency:** Accurate sub-millimeter font height measurement requires photographs taken with adequate resolution ($\ge 1080\text{p}$) and proper focus. Severely degraded images will be routed to `UNABLE_TO_VERIFY`.
2. **Reference Plane Requirement:** Scale calibration relies on planar homography. If a reference card or fiducial marker is placed on a different plane than the Principal Display Panel (PDP), angular perspective error may occur.
3. **Hardware-Bound Inference:** While models are quantized to INT8 CPU for universal portability without GPUs, inference latency on low-spec dual-core laptops may exceed the $1200\text{ ms}$ benchmark.
4. **Assistive Nature:** Nirikshak is not an automated judicial tribunal. Final statutory culpability, legal notices, and compounding sanctions remain the sole legal responsibility of the human officer.

---

## Future Work

- **Mode C External Integrations:** Bi-directional national registry webhooks for eMaap, MCA21 (Ministry of Corporate Affairs), and GSTN (Goods & Services Tax Network) company validation.
- **Thermal Mobile Printing:** Direct ESC/POS Bluetooth printing of on-site inspection seizure memos and compounding challans.
- **Edge Model Quantization:** WebAssembly (WASM) compilation of DBNet++ and PP-OCRv4 to enable full in-browser inference without server round-trips.

---

## 👥 Core Engineering Team & Contributors

NyayaDrishti-LM is developed under Smart India Hackathon 2026 for the **Department of Consumer Affairs (DoCA)**:

| Member | Workstream & Focus | Subsystem Scope | GitHub Profile |
|:---|:---|:---|:---:|
| **Kunal Raj** | **Member 1: CV, Metrology & Frontend** | Optical quality gate, ArUco 4×4 calibration, planar homography, PDP metric schedule, Frontend Adjudication canvas | [@kunal-raj-dev](https://github.com/kunal-raj-dev) |
| **Parmarth Kumar** | **Member 2: Multilingual OCR & Member 6: Lead Frontend** | DBNet++ text detection, PP-OCRv4 Indic recognition, ONNX INT8 inference, React 18 + Vite SPA, Metrology workbench, split-view Canvas HUD | [@parmarth-kumar](https://github.com/parmarth-kumar) |
| **Harsh Patel** | **Member 3: Semantic Extraction, Rule Engine & Frontend** | Statutory field parsing (MRP, Net Qty, Dates, Address, PIN), banned unit flagger, AST rule engine hardening, Frontend E2E pipeline orchestration | [@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab) |
| **Ambika Bansal** | **Member 4: Statutory Rule Engine** *(Co-engineered with Harsh Patel)* | AST statutory engine, Table-I font schedule (Row 5 = 6.0 mm), USP math, IEEE 754 precision guard, Rule 6(1)(k) single-unit proviso, 4-state triage | [@bansalambika12-ship-it](https://github.com/bansalambika12-ship-it) |
| **Shailendra Pratap Singh** | **Member 5: Evidence & Cryptography** | FastAPI REST services, PostgreSQL 16 schema, Merkle DAG, Section 63 BSA 2023 certificate, Form-1 PDF engine | [@shailendrapratap1](https://github.com/shailendrapratap1) |
| **Urvashi Rajput** | **UI/UX Architecture & Design System** | Initial frontend architecture, Nirikshak Metrolens workstation framework, Quick Triage Filter Pills, elevation shadow design tokens & UI styling | [@rajputurvashi2006-bit](https://github.com/rajputurvashi2006-bit) |

### ⚖️ Statutory Rule Engine Collaboration
The deterministic rule engine (`members/member-04-rule-engine/`) was co-engineered for deterministic technical reproducibility:
- **Lead Statutory Rule Architecture & Font Schedules:** Ambika Bansal ([@bansalambika12-ship-it](https://github.com/bansalambika12-ship-it))
- **AST Compliance Hardening, IEEE 754 Precision Guard & Statutory Provisos:** Harsh Patel ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab))

### 🎨 Frontend & Adjudication Workstation Collaboration
The production web platform (`ui-combined/`) is a collaborative achievement across the team:
- **Lead Frontend Architecture & Inspection HUD:** Parmarth Kumar ([@parmarth-kumar](https://github.com/parmarth-kumar))
- **Full-Pipeline Integration & Verification:** Harsh Patel ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab))
- **Metrology Canvas & Calibration Overlay:** Kunal Raj ([@kunal-raj-dev](https://github.com/kunal-raj-dev))
- **Initial UI Foundation & Workstation Design:** Urvashi Rajput ([@rajputurvashi2006-bit](https://github.com/rajputurvashi2006-bit))

See **[CONTRIBUTORS.md](CONTRIBUTORS.md)** for full details and attribution policies.

---

## 🤝 Community & Governance

- **[Contributing Guidelines](CONTRIBUTING.md)**: Git branching workflow, code review standards, Definition of Done.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Contributor Covenant v2.1.
- **[Security Policy](SECURITY.md)**: Vulnerability disclosure procedure and evidence integrity standards.

---

## 🛡️ License & Legal Disclaimer

This project is licensed under the **[Apache License 2.0](LICENSE)**.

All deep learning models, optical pipelines, and software libraries used in Nirikshak adhere strictly to permissive licenses (Apache-2.0, MIT, BSD-3-Clause, PostgreSQL). **GNU AGPL-3.0 dependencies are strictly prohibited** to safeguard institutional legal integrity.

---

<p align="center">
  <b>Department of Consumer Affairs (DoCA)</b><br/>
  Ministry of Consumer Affairs, Food & Public Distribution • Government of India<br/>
  <i>Smart India Hackathon 2026</i>
</p>
