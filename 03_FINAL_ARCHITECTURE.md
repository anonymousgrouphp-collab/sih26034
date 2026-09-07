# 03_FINAL_ARCHITECTURE.md

# SIH26034 - Legal Metrology Automated Compliance System

## Complete End-to-End System Architecture, 12-Stage Pipeline Flow & Deployment Topology

---

### 1. Architectural Philosophy & The "Simplicity Test"

To ensure bulletproof reliability during the Smart India Hackathon 2026 evaluation and provide an enterprise-grade solution for the Department of Consumer Affairs, this system adheres to an **Online-First Modular Monolith Architecture**:

- **Primary Delivery as an Online Web Application:** The system is hosted centrally and accessed via web browsers across desktop workstations, laptops, and tablets. It provides centralized authentication, multi-user role management, central inspection records, and state-wide oversight dashboards.
- **Zero Microservices Bloat:** No distributed service meshes, Kafka clusters, or multi-node Kubernetes clusters. A single, high-performance Python 3.11+ FastAPI service orchestrates ingestion, optical pre-processing, ONNX inference, rule evaluation, and report generation.
- **Colocated Server Inference:** Standardized ONNX Runtime INT8 execution runs on the server CPU, eliminating client device hardware variations, heavy browser downloads, and dependency on costly commercial cloud vision APIs.
- **Optional Local Inspection Resiliency:** The core inspection pipeline retains the capability to execute standalone on a local workstation or field laptop using embedded SQLite 3.45+ when an officer operates in a remote area devoid of cellular connectivity.
- **Strict Layer Decoupling:** Separation of concerns enforced through clean abstract interfaces, immutable Pydantic v2 DTOs, and event-driven database logging.
- **Authoritative System Modes (3 Discrete Modes):**
  - *Mode A (Online Web Mode — Primary Product):* Full browser access, central JWT auth & RBAC, server-side CPU ONNX inference, PostgreSQL 16+ persistence, centralized inspection history, executive dashboards, and single e-commerce URL audits.
  - *Mode B (Optional Local Inspection Mode — Secondary Capability):* Standalone local execution of optical calibration, ONNX OCR, rule engine, local SQLite, and PDF notice generation (0 bytes transmitted) for field resilience.
  - *Mode C (External Integration Mode — Future Enterprise Roadmap):* National eMaap portal webhooks, MCA21 corporate verification, and GSTN tax validation (refer to `SYSTEM_MODES_AND_CONNECTIVITY.md`).

---

### 2. High-Level System Architecture (C4 Level 2 Container Diagram)

```
+---------------------------------------------------------------------------------------------------------+
|                                           PRESENTATION TIER                                             |
|                                                                                                         |
|   +------------------------------------+              +-------------------------------------+           |
|   |  Field Officer Tablet / Mobile     |              | Supervisory Desktop Web Workstation |           |
|   |  (Browser: React 18 SPA via HTTPS) |              | (Browser: React 18 Canvas & Notice) |           |
|   +------------------┬-----------------+              +------------------┬------------------+           |
+----------------------┼───────────────────────────────────────────────────┼------------------------------+
                       │ HTTPS / TLS 1.3                                   │ HTTPS / TLS 1.3
                       ▼                                                   ▼
+---------------------------------------------------------------------------------------------------------+
|                                  WEB REVERSE PROXY & GATEWAY TIER                                       |
|                                                                                                         |
|               Nginx / Caddy Web Server (Static Asset Serving, TLS 1.3, Rate Limiting)                   |
+--------------------------------------------------┬------------------------------------------------------+
                                                   │ Reverse Proxy (Unix Socket / Port 8000)
                                                   ▼
+---------------------------------------------------------------------------------------------------------+
|                                      APPLICATION & INFERENCE TIER                                       |
|                                                                                                         |
|   +-------------------------------------------------------------------------------------------------+   |
|   |                          FastAPI Modular Application Server (Python 3.11+)                      |   |
|   |                                                                                                 |   |
|   |  [Auth & RBAC Middleware] ───> [Quality Gate Filter] ───> [Async Task Worker Pool]              |   |
|   |                                                                                                 |   |
|   |  =========================== THE 12-STAGE INFERENCE PIPELINE =================================  |   |
|   |  1. Hashing & Chain-of-Custody (SHA-256)      7. Optical Character Recognition (PP-OCRv4)       |   |
|   |  2. Image Quality Gate (Laplacian / Glare)    8. Semantic Field Entity Extractor (Regex/Fuzzy)  |   |
|   |  3. Fiducial Calibration (OpenCV ArUco)       9. Physical Font Height Engine (Connected Comp.)  |   |
|   |  4. Homography Perspective Rectification     10. Deterministic Legal Rule Engine (Rule 6/Table1)|   |
|   |  5. Principal Display Panel (PDP) Segment    11. Human-in-the-Loop Adjudication Gateway         |   |
|   |  6. Text Detection Polygons (DBNet++)        12. Form-1 Legal Notice & BSA 2023 Bundler (PDF/A) |   |
|   |                                                                                                 |   |
|   |  [Colocated Server CPU ONNX Runtime INT8 Execution | Optional Local Runner Mode B]              |   |
|   +-------------------------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------------------------+
                       │                                                   │
                       ▼                                                   ▼
+------------------------------------------------+      +-------------------------------------------------+
|               PERSISTENCE TIER                 |      |              FORENSIC AUDIT TIER                |
|                                                |      |                                                 |
|  - PostgreSQL 16+ Primary Database (Online)    |      |  - Append-Only Merkle Tree Audit Ledger         |
|  - Server Storage (/storage/uploads & evidence)|      |  - SHA-256 Hash Chaining on all Inspections     |
|  - Optional Embedded SQLite (Local Mode B)     |      |  - Section 63 BSA 2023 Digital Certificate Log  |
+------------------------------------------------+      +-------------------------------------------------+
```

---

### 3. The 12-Stage Inference & Rule Pipeline (Detailed Data Flow)

```
[Raw Image Upload]
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 1: Forensic Ingestion & Hashing         |
| - Computes immutable SHA-256 hash of raw byte |
|   stream before any manipulation.             |
| - Logs initial provenance entry into Merkle   |
|   chain with monotonic UTC time & device ID.  |
| - Clock: LOCAL_DEVICE_MONOTONIC / Nullable GPS |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 2: Optical Quality Gate & Validation    |
| - Evaluates Laplacian variance (blur >= 150). |
| - Evaluates histogram glare saturation (<= 3%)|
| - If rejected: Emits real-time retry feedback |
|   to mobile HUD without running heavy ML.     |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 3: Fiducial Calibration & Metric Scale  |
| - Detects 50 mm ArUco 4x4 reference marker.   |
| - Extracts 4 fiducial corner coordinates.     |
| - Computes exact metric scale: px_to_mm.      |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 4: Perspective Warp & Rectification     |
| - Derives 3x3 homography matrix (H).          |
| - Executes cv2.warpPerspective to remove tilt |
|   and restore orthogonal front-facing view.   |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 5: Principal Display Panel (PDP) Calc   |
| - Locates package boundaries via contour/Canny|
| - Calculates total packaging area (cm²).      |
| - Calculates PDP area based on geometry:      |
|   * Rectangular: 40% of height x width.       |
|   * Cylindrical: 40% of height x circumf.     |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 6: Multi-Oriented Text Detection        |
| - DBNet++ (Real-Time Text Detector, ONNX INT8)|
| - Outputs oriented bounding polygons (4-point)|
|   around all textual clusters on the label.   |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 7: Optical Character Recognition (OCR)  |
| - PaddleOCR PP-OCRv4 (Permissive Apache-2.0). |
| - Batched line recognition on cropped patches.|
| - Emits raw text strings + character conf.    |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 8: Semantic Entity Classification       |
| - Fuzzy matching & regex entity parsers:      |
|   * MRP & currency tokens (Rs., INR, /-).     |
|   * Net Quantity (g, kg, ml, l).              |
|   * Unit Sale Price (USP).                    |
|   * Manufacturer / Packer address keywords.   |
|   * Country of Origin ("Made in ...").        |
|   * Dates (Mfg / Expiry / Use by).            |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 9: Physical Font Measurement Engine     |
| - Connected-Components Analysis on binarized  |
|   Net Quantity and MRP text patches.          |
| - Isolates lowercase 'x' or numeral heights.  |
| - Converts pixel height to millimeters using  |
|   calibrated px_to_mm scale.                  |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 10: Deterministic Legal Metrology Rules |
| - Evaluates Rule 6(1)(h) & Table-I font sizes:|
|   * Compares measured mm vs statutory min mm. |
| - Evaluates Rule 6(1)(k) Unit Sale Price math |
| - Evaluates Rule 6(1)(e) "(incl. of all taxes)|
| - Evaluates Rule 6(1)(p) Country of Origin.   |
| - Emits structured Compliance Evaluation list.|
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 11: Human-in-the-Loop Adjudication Gate |
| - Renders side-by-side verification canvas.   |
| - Inspector reviews bounding boxes & loupe.   |
| - Officer confirms violation OR overrides AI. |
| - All overrides require mandatory remarks.    |
+───────────────────────────────────────────────+
       │
       ▼
+───────────────────────────────────────────────+
| STAGE 12: Evidence Bundler & Notice Generator |
| - Compiles Form-1 / Form-2 Section 36(1)      |
|   Statutory Legal Notice.                     |
| - Compiles Section 63 BSA 2023 Digital        |
|   Certificate with cryptographic image hashes.|
| - Officer attestation via local private key   |
|   (Ed25519) and visual signature block.       |
| - Emits archival PDF/A evidence bundle.       |
+───────────────────────────────────────────────+
```

---

### 3.1 Component Execution & AI Hosting Matrix

| Component | Primary Execution | Optional Fallback | Internet Required? | Reason |
| :--- | :--- | :--- | :---: | :--- |
| **Image Quality Gate** | Server-side CPU (FastAPI + OpenCV) | Client-side Canvas / Local OpenCV | Yes (Online upload) | Fast rejection ($\sigma^2 < 150$, Glare $> 3\%$) prevents wasting server compute cycles. |
| **Fiducial Calibration** | Server-side CPU (OpenCV ArUco) | Local OpenCV | Yes (Online upload) | Resolves scale factor $S = \text{px\_to\_mm}$ and planar homography in $< 35\text{ ms}$. |
| **Text Detection (DBNet++)** | Server-side CPU (ONNX INT8) | Local CPU ONNX Runtime | Yes (Online upload) | Colocated INT8 inference eliminates client device GPU variance. |
| **Text Recognition (PP-OCRv4)**| Server-side CPU (ONNX INT8) | Local CPU ONNX Runtime | Yes (Online upload) | High-accuracy multilingual Latin/Indic line recognition in $\sim 420\text{ ms}$. |
| **Information Extraction** | Server-side CPU (Python) | Local Python | Yes (Online upload) | Deterministic K-D tree spatial proximity graph and statutory regex parsers. |
| **Statutory Rule Engine** | Server-side CPU (Python AST) | Local Python AST | Yes (Online upload) | 100% reproducible legal rules (Rule 6, Table-I, USP math) in $< 15\text{ ms}$. |
| **Evidence & Hash Generation** | Server-side CPU (SHA-256) | Local Python | Yes (Online upload) | Cryptographic Merkle DAG links raw byte stream to final legal verdicts. |
| **ReportLab PDF Generator** | Server-side CPU (ReportLab) | Local ReportLab | Yes (Online upload) | Generates court-admissible Form-1/2 PDF/A notice and Section 63 BSA certificate. |

---

### 4. E-Commerce Pipeline Extension (Rule 6(10) & Rule 6(10A))

NyayaDrishti-LM structures e-commerce compliance auditing into distinct operational tiers:
- **Mode A (Online Web Mode):** Single product listing URLs are fetched via server-side asynchronous HTTP client (`httpx`). Additionally supports direct officer upload of product listing screenshots and saved HTML DOM snapshot files (`.html` / `.mhtml`).
- **Mode B (Optional Local Mode):** Uploaded product packaging images, listing screenshots, and pre-saved HTML DOM snapshot files are audited locally with zero network connectivity.
- **P3 Non-Goal (Blacklisted):** Mass web crawling / spidering of commercial marketplaces is strictly prohibited.

```
[Mode A: Single Listing URL (ONLINE) | Mode A/B: Uploaded Screenshot / DOM Snapshot (OFFLINE/LOCAL)]
                                     │
                                     ▼
                      +──────────────────────────────+
                      |   HTML DOM Parser & Stripper |
                      |   (BeautifulSoup4 / Trafilatura)
                      +──────────────┬───────────────+
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
               +──────────────────────+    +────────────────────────+
               | Text Specification   |    | Product Gallery Image  |
               | Declaration Checker  |    | Downloader & Auditor   |
               +──────────────────────+    +────────────────────────+
               | - Extracts declared  |    | - Passes gallery image |
               |   Net Qty, MRP, USP, |    |   into Stages 1 - 10   |
               |   Packer, Origin.    |    |   of Inference Pipeline|
               +──────────────────────+    +────────────────────────+
                       │                           │
                       └─────────────┬─────────────┘
                                     ▼
               +─────────────────────────────────────────────+
               | Discrepancy & Cross-Reference Engine        |
               | - Cross-checks webpage text vs label OCR.   |
               | - Flags discrepancies (e.g. DOM claims 200g |
               |   but packaging photo reveals 150g).        |
               | - Checks Rule 6(10A) Country of Origin      |
               |   search filter presence on platform.       |
               +─────────────────────────────────────────────+
```

---

### 5. Deployment Topology & Operational Readiness

#### 5.1 Primary Online Production Web Deployment (Docker Compose Topology)

The primary judge-facing and operational product is a fully containerized web application:

```yaml
version: "3.8"
services:
  web-proxy:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]
    depends_on: ["frontend", "backend"]

  frontend:
    build: { context: ./frontend, dockerfile: Dockerfile }
    environment:
      - VITE_API_BASE_URL=/api/v1

  backend:
    build: { context: ./backend, dockerfile: Dockerfile }
    environment:
      - DATABASE_URL=postgresql://lmo_admin:secure_pass@postgres:5432/legal_metrology
      - ONNX_NUM_THREADS=4
      - MODEL_CACHE_DIR=/app/models
      - STORAGE_ROOT=/app/storage
    volumes:
      - evidence_storage:/app/storage
    depends_on: ["postgres"]

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=legal_metrology
      - POSTGRES_USER=lmo_admin
      - POSTGRES_PASSWORD=secure_pass
    volumes:
      - pg_data:/var/lib/postgresql/data

volumes:
  pg_data:
  evidence_storage:
```

#### 5.2 Local Development & Optional Standalone Mode

- **Host Workstation:** Standard Intel Core i5/i7 or AMD Ryzen developer laptop running Windows, macOS, or Linux.
- **Backend & Static Asset Serving:** `uvicorn app.main:app --host 127.0.0.1 --port 8000` (serves API routes at `/api/v1` and compiled React SPA static assets at `/`).
- **Frontend Development Mode:** `npm run dev` in `./frontend` (Vite dev server running on `localhost:5173` with proxy to backend).
- **Database in Local Dev:** Embedded SQLite 3.45+ (`legal_metrology.db`) or local PostgreSQL container.
- **Packaging Note:** Electron is deferred/removed; the web browser provides the official cross-platform interface.
- **Network Independence in Mode B:** When executed locally, the standalone backend and client function with network cables unplugged and Wi-Fi disabled.

---

### 6. Resilience & Circuit Breaker Architecture

1. **Optical Quality Circuit Breaker:** If image blur variance $\sigma^2 < 150$ or glare $> 3\%$, the pipeline aborts immediately before invoking DBNet++ or PP-OCRv4. This prevents wasting CPU cycles on unresolvable images.
2. **Fallback Calibration Mode:** If the ArUco marker is missing or occluded, the system attempts secondary edge/coin detection. If unresolvable, the system switches to **"Relative / Textual Audit Only"** mode (evaluating presence of declarations and USP math, while gracefully flagging Table-I physical font heights as "Pending Physical Benchmarking").
3. **Audit Ledger Self-Healing:** The cryptographic Merkle ledger verifies its own chain on startup. If an unauthorized byte modification is detected in the database, the server halts into read-only safety mode and alerts the administrator.
