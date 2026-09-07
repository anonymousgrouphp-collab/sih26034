# SYSTEM MODES AND CONNECTIVITY ARCHITECTURE

**Project ID:** SIH26034  
**Product Name:** NyayaDrishti-LM  
**Governing Standard:** Authoritative Connectivity & System Modes Specification  
**Current Date:** 07 September 2026  
**Status:** AUTHORITATIVE & FROZEN  

---

## 1. Executive Definition: The Online-First Web Application Reality

**NyayaDrishti-LM** is an **Online-First Web Application** engineered for the **Department of Consumer Affairs (DoCA)**, Ministry of Consumer Affairs, Food & Public Distribution, Government of India.

To eliminate architectural ambiguity across all documentation, engineering workstreams, and jury evaluations:
- **The Primary Product is an Online Web Application.** It is hosted on a central server/cloud environment and accessed by users through standard web browsers across desktop, laptop, and tablet devices.
- **Centralized Online Operations:** User authentication, role-based access control, centralized inspection repository, supervisory audit logs, analytical dashboards, multi-user workflows, and server-side model execution run online.
- **Optional Local/Offline Core Inspection Capability:** For field officers inspecting retail markets, rural mandis, or basement warehouses where cellular connectivity is absent or degraded, the core inspection engine (optical quality gate, ArUco fiducial calibration, DBNet++ text detection, PP-OCRv4 recognition, deterministic rule engine, and Section 63 BSA PDF notice generation) is capable of standalone local execution.
- **Offline is a Resiliency Feature, NOT the Whole Product Identity:** The system must never be characterized as "100% offline across all features" or "entire application is offline". The online web platform is the definitive primary system.

---

## 2. The Three Operational Modes

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

---

## 3. Detailed Mode Specifications

### 3.1 Mode A: Online Web Mode (Primary Product)

#### Purpose & Operational Environment
The standard operational mode for State Metrology Directorates, Circle Headquarters, District Controllers, and connected Field Legal Metrology Officers (LMOs). Users navigate to the hosted application URL via any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).

#### Component Execution Architecture
- **Where Frontend Runs:** User's web browser (React 18+ Single Page Application with Tailwind CSS).
- **Where Backend Runs:** Central cloud or institutional server (FastAPI ASGI application server in Python 3.11+).
- **Where AI Models Run:** Server-side CPU inference using ONNX Runtime INT8 quantization (with optional GPU acceleration where infrastructure permits). Colocated inference eliminates client-side hardware incompatibilities and ensures uniform performance.
- **Where Database Runs:** Central managed PostgreSQL 16+ server with connection pooling (PgBouncer).
- **Where Files/Images Are Stored:** Structured server filesystem directories (`/storage/uploads/` and `/storage/evidence/`) or S3-compatible object storage. Images are never stored as raw binary blobs in database tables.
- **Internet Requirement:** Active broadband, 4G/5G, or Wi-Fi connection required for client-server communication over TLS 1.3.

#### Available Capabilities
1. **Central Authentication & RBAC:** Secure login with bcrypt/Argon2 password hashing and RFC 7519 Bearer JWT authentication supporting four distinct roles (`ADMIN`, `CONTROLLER`, `INSPECTOR`, `VIEWER`).
2. **Online Inspection Ingestion:** Multipart image upload ($\ge 1920 \times 1080$ resolution) with server-side validation of MIME types, magic bytes, and file size ($\le 25\text{ MB}$).
3. **Server-Side Optical Quality Gating:** Real-time Laplacian blur variance calculation ($\sigma^2 \ge 150$) and specular glare saturation masking ($\le 3\%$).
4. **Server-Side Metric Calibration:** Detection of 50 mm ArUco 4x4 fiducials or standard ₹5 coin (23 mm), calculation of metric scaling factor ($S = \text{px\_to\_mm}$), and planar homography perspective rectification (`cv2.warpPerspective`).
5. **Server-Side Deep Learning OCR:** Multi-oriented text polygon detection via DBNet++ and text line recognition via PaddleOCR PP-OCRv4 (SVTR) with INT8 quantization on server CPU.
6. **Deterministic Statutory Rule Engine:** Pure Python AST evaluator validating on-pack declarations against Rule 6, Table-I font schedules (including G.S.R. 629(E) 6.0 mm boundary), and Rule 6(1)(k) Unit Sale Price arithmetic.
7. **Interactive Web Adjudication Canvas:** Dual-pane browser interface featuring synchronized pan, zoom, visual bounding overlays, interactive pixel loupe, and mandatory officer override justification logging.
8. **Statutory Notice & Certificate Compilation:** Automated generation of Section 36(1) Form-1/2 Legal Notices and Section 63 BSA 2023 Electronic Evidence Certificates exported as archival PDF/A via ReportLab.
9. **Centralized History, Search & Filtering:** Instant multi-tenant search across inspections by district, date, brand, manufacturer, or compliance verdict.
10. **Executive Analytics Dashboard:** Visual metrics displaying violation distribution, category trends, officer activity, and enforcement notice statuses.
11. **Targeted E-Commerce URL Inspection:** Direct ingestion of single product listing URLs from supported platforms (Amazon, Flipkart, Blinkit, Zepto) via server-side HTTP client.

#### Network Disruption Behavior
If internet connectivity is interrupted during an active online session:
- The web frontend displays an immediate, non-blocking connection warning: `NETWORK_DISCONNECTED: Connection lost. Active draft saved locally in browser session.`
- Active inputs and uploaded image references are retained in browser session memory (`sessionStorage` / `IndexedDB`) to prevent data loss.
- An automatic exponential-backoff retry mechanism pings the health endpoint (`/api/v1/system/status`).
- Upon reconnection, the user is prompted to resume or submit the pending inspection with zero loss of progress.

---

### 3.2 Mode B: Optional Local/Offline Inspection Mode (Secondary Field Capability)

#### Purpose & Operational Environment
Engineered as an optional fallback capability for field Legal Metrology Officers (LMOs) inspecting retail shops, wholesale mandis, packaging factories, and basement godowns in rural or remote areas where cellular signal is completely absent or unreliable.

#### Component Execution Architecture
- **Where Frontend Runs:** Local web browser connected to `http://localhost:8000` (or `http://127.0.0.1:8000`), served directly by the local FastAPI application server.
- **Where Backend Runs:** Local host machine (laptop or rugged tablet) running the self-contained FastAPI service.
- **Where AI Models Run:** Local machine CPU using the identical ONNX Runtime INT8 quantized model binaries.
- **Where Database Runs:** Local embedded SQLite 3.45+ with SQLCipher transparent AES-256 encryption (`legal_metrology.db`).
- **Where Files/Images Are Stored:** Local encrypted directory (`./storage/`).
- **Internet Requirement:** Zero (0 bytes transmitted). All physical network interfaces can be completely disconnected.

#### Available Capabilities
1. **Local Forensic Ingestion:** Local camera capture or file picker ingestion with immediate SHA-256 cryptographic hashing of raw bytes.
2. **Local Optical Quality Gating:** OpenCV blur variance and specular glare detection executing in $< 45\text{ ms}$.
3. **Local Fiducial Calibration:** OpenCV ArUco detector and planar homography perspective warp.
4. **Local Deep Learning OCR:** DBNet++ and PP-OCRv4 CPU inference executing in $< 850\text{ ms}$ on local quad-core or 8-core CPU.
5. **Local Rule Engine & Adjudication:** Full Rule 6, Table-I, and USP verification on local Adjudication Canvas with mandatory officer override logging.
6. **Local Notice & Certificate Generation:** Standalone ReportLab generation of Section 36(1) Form-1/2 Legal Notices and Section 63 BSA 2023 Digital Certificates saved directly to local disk.
7. **Local E-Commerce File Auditing:** Offline auditing of officer-provided listing screenshots and pre-saved HTML DOM snapshot files (`.html` / `.mhtml`).

#### Synchronization & Reconnection Protocol
- **Synchronization Method:** When the officer returns to an office with internet or connects to Wi-Fi, the local system provides a **"Sync to Central Portal"** action.
- **Sync Bundle Format:** Local inspections are packaged into an encrypted JSON/ZIP sync bundle containing raw images, metadata, evaluation logs, and cryptographic SHA-256 hashes.
- **Idempotent Ingestion:** The central server exposes `POST /api/v1/inspections/sync-bundle`. It verifies the cryptographic Merkle root of each record and inserts new records without duplicates.
- **Conflict Handling:** Each inspection uses a globally unique UUID primary key generated at creation. Conflicts are prevented by key uniqueness; if a record already exists with matching SHA-256, it is marked as synced. If an unresolvable discrepancy is detected, the server retains both records and alerts the administrator.

#### Explicit Limitations of Mode B
- No live e-commerce URL fetching (must use pre-saved HTML DOM or screenshots).
- No real-time multi-user visibility or centralized dashboard updates.
- No remote user management or administrative role modifications.

---

### 3.3 Mode C: External Integration Mode (Future Enterprise Roadmap)

#### Purpose & Operational Environment
Designed for post-hackathon enterprise scaling across State Metrology Directorates and the central Department of Consumer Affairs (DoCA).

#### Scope & Capabilities
1. **National eMaap Webhook Integration:** Automated dispatch of finalized inspection dossiers and compounding notices directly to `emaap.gov.in` via authenticated NIC APIs.
2. **Corporate Identity Cross-Check (MCA21):** Automated live verification of manufacturer corporate registration and active director status via Ministry of Corporate Affairs database.
3. **GSTN Tax Registration Audit:** Real-time validation of manufacturer/packer GSTIN against the GST Network portal.
4. **National Consumer Helpline (NCH) Bridge:** Ingestion of consumer misbranding complaints for automated field verification dispatch.
5. **Enterprise SSO:** Authentication via National Single Sign-On (Parichay / Jan Parichay).

#### MVP Status
- **Marked P2 / P3 (Deferred).** Core MVP does NOT require or depend on Mode C.
- Standalone Form-1 JSON export schemas are provided in MVP to ensure full future interoperability without requiring active API access today.

---

## 4. Operational Failure & Resilience Matrix

```
+----------------------------------------------------------------------------------------------------+
| SCENARIO                   | SYSTEM REACTION                  | DATA IMPACT      | RECOVERY ACTION  |
+----------------------------------------------------------------------------------------------------+
| Server Unreachable         | Frontend displays "Service       | Zero client data | Check connection |
| (Central Outage / 503)     | Temporarily Unavailable" banner; | loss; draft in   | or switch to     |
|                            | allows saving draft locally.     | session storage. | local instance.  |
+----------------------------------------------------------------------------------------------------+
| Network Disconnected       | Non-blocking toast displayed;    | Session state    | Auto-reconnect   |
| During Online Inspection   | retry backoff starts.            | preserved.       | when Wi-Fi/4G    |
|                            |                                  |                  | is restored.     |
+----------------------------------------------------------------------------------------------------+
| Disconnect During          | HTTP client aborts with 504;     | Zero corruption; | Prompt user for  |
| E-Commerce URL Fetch       | UI prompts for screenshot upload.| clean error msg. | screenshot/DOM.  |
+----------------------------------------------------------------------------------------------------+
| Client Browser Crash /     | Frontend restores state from     | Last completed   | Reopen browser;  |
| Accidental Tab Close       | sessionStorage on reload.        | stage preserved. | resume draft.    |
+----------------------------------------------------------------------------------------------------+
| Hardware GPS Unavailable   | Coordinates recorded as NULL;    | Valid inspection | Select circle    |
| (Indoor / Laptop)          | premise selected from dropdown.  | record created.  | from dropdown.   |
+----------------------------------------------------------------------------------------------------+
| Camera Feed Disconnect     | UI detects stream loss; falls    | Inspection state | File selector    |
| (Webcam unplugged)         | back to file upload picker.      | preserved.       | fallback.        |
+----------------------------------------------------------------------------------------------------+
```
