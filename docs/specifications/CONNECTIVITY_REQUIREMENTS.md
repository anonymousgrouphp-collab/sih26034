# CONNECTIVITY REQUIREMENTS SPECIFICATION

**Project ID:** SIH26034  
**Product Name:** NyayaDrishti-LM  
**Governing Standard:** Comprehensive Pre-Development Connectivity & Infrastructure Contract  
**Current Date:** 07 September 2026  
**Status:** AUTHORITATIVE & BINDING  

---

## 1. Core Architectural Connectivity Principle

> **"NyayaDrishti-LM is an Online-First Web Application designed for central regulatory oversight, multi-user adjudication, and scalable compliance management. The core inspection processing components additionally maintain an optional, standalone local execution capability to ensure field resilience in areas with zero cellular connectivity."**

All development workstreams, CI checks, and testing suites must adhere to the component dependency matrix and tier classifications below.

---

## 2. Granular Component Dependency Matrix

| Component / Subsystem | Primary Online Mode Execution | Optional Local Mode Fallback | Internet Required in Primary Mode? | Internet Required in Local Mode? | Database / Storage Used | Failure Impact / Resiliency Action |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **Web Portal & Navigation UI** | Browser via HTTPS | Local Browser via localhost | **YES** | **NO** | React 18+ static bundle | Displays offline retry toast if disconnected |
| **User Authentication & RBAC** | Central FastAPI (JWT) | Local PIN / Credentials | **YES** | **NO** | PostgreSQL (Online) / SQLite (Local) | Token verified against server public key |
| **Camera & File Ingestion** | HTML5 Browser Upload | Local File Selector / WebRTC | **YES** (Upload) | **NO** | Server Disk / Local Disk | Multipart stream buffered to temporary file |
| **Image Hashing (SHA-256)** | Server-side Python | Local Python | **YES** (Post-upload) | **NO** | In-memory `hashlib.sha256` | Deterministic mathematical hash computed |
| **Optical Quality Gate** | Server-side OpenCV | Client/Local OpenCV | **YES** (Online) | **NO** | In-memory frame buffer | Rejects blur/glare; returns guidance to UI |
| **ArUco & Coin Calibration** | Server-side OpenCV | Local OpenCV | **YES** (Online) | **NO** | In-memory homography matrix | Fallback to uncalibrated textual audit mode |
| **Perspective Homography Warp**| Server-side OpenCV | Local OpenCV | **YES** (Online) | **NO** | In-memory rectified image buffer | Generates orthogonal front-facing crop |
| **DBNet++ Text Detection** | Server CPU (ONNX INT8) | Local CPU (ONNX INT8) | **YES** (Online) | **NO** | Colocated model binaries | Outputs oriented polygon coordinates |
| **PP-OCRv4 Text Recognition** | Server CPU (ONNX INT8) | Local CPU (ONNX INT8) | **YES** (Online) | **NO** | Colocated model binaries | Outputs character strings + confidences |
| **Semantic Entity Extractor** | Server-side Python | Local Python | **YES** (Online) | **NO** | In-memory regex & K-D tree | Deterministic token normalization |
| **Physical Font Measurement** | Server-side OpenCV | Local OpenCV | **YES** (Online) | **NO** | In-memory connected components | Derives glyph height in millimeters |
| **Deterministic Rule Engine** | Server-side Python AST | Local Python AST | **YES** (Online) | **NO** | Statutory rule configuration JSON | Evaluates Rule 6, Table-I, and USP math |
| **HITL Adjudication Canvas** | Web Browser Interface | Local Browser Interface | **YES** (Online) | **NO** | React 18+ Interactive Canvas | Inspector inspects bounding boxes & loupe |
| **Form-1/2 Legal Notice PDF** | Server-side ReportLab | Local ReportLab | **YES** (Online) | **NO** | Server `/storage/` or Local Disk | Emits archival PDF/A document |
| **Section 63 BSA Certificate**| Server-side ReportLab | Local ReportLab | **YES** (Online) | **NO** | Embedded in PDF/A bundle | Cryptographic proof linking hashes |
| **Central Inspection History** | Central PostgreSQL 16+ | Local SQLite 3.45+ | **YES** | **NO** | PostgreSQL with indexed search | Paginated search across circles/dates |
| **Executive KPI Dashboard** | Central PostgreSQL 16+ | N/A (Online Only) | **YES** | **N/A** | Analytical aggregate SQL queries | State-wide compliance statistics |
| **E-Com Screenshot Analysis** | Server-side OCR & Rules | Local OCR & Rules | **YES** (Online) | **NO** | Processed as standard image | Audits digital declarations under Rule 6(10)|
| **E-Com HTML/DOM Snapshot** | Server-side Parser | Local Parser | **YES** (Online) | **NO** | BeautifulSoup4 / Trafilatura | Parses pre-saved `.html`/`.mhtml` files |
| **Live E-Com Listing URL Fetch**| Server-side HTTP client | N/A (Requires Internet) | **YES** | **YES** | Temporary HTTP cache | Falls back to prompt for screenshot/DOM |
| **Server NTP Clock Sync** | Server-level NTP daemon | Local monotonic counter | **YES** (Server) | **NO** | Host OS clock daemon | Server timestamp logged as authoritative |
| **GPS / Location Services** | Browser Geolocation API | Nullable with Circle Fallback| **OPTIONAL** | **NO** | Saved in inspection record | Falls back to manual Circle/Premise selection|
| **National eMaap Webhook** | Post-Hackathon Roadmap | N/A (Deferred) | **YES** | **N/A** | NIC API endpoints | Standalone Form-1 JSON export in MVP |
| **MCA21 / GSTN Registries** | Post-Hackathon Roadmap | N/A (Deferred) | **YES** | **N/A** | Ministry API endpoints | Offline regex verification in MVP |

---

## 3. Four-Tier Classification

### Tier 1: ONLINE CORE (P0 Primary Web Application)
The foundational delivery for the Smart India Hackathon 2026. Operates via standard web browsers accessing the hosted application server:
1. User authentication via secure login and role-based access control (Admin, Controller, Inspector, Viewer).
2. Package image upload with client-side preview and server-side validation.
3. Server-side optical quality gating (Laplacian blur $\ge 150$, specular glare $\le 3\%$).
4. Planar homography metric calibration via ArUco 4x4 fiducial or ₹5 coin benchmark.
5. Server-side INT8 ONNX inference for DBNet++ text detection and PaddleOCR PP-OCRv4 recognition.
6. Deterministic semantic extraction and physical font measurement in millimeters.
7. Statutory compliance evaluation against Packaged Commodities Rules, 2011.
8. Interactive browser-based Adjudication Canvas with pixel loupe and officer override logging.
9. Server-side compilation of Section 36(1) Form-1/2 Legal Notices and Section 63 BSA 2023 Digital Certificates.
10. Centralized PostgreSQL persistence, multi-user inspection history, and executive dashboard analytics.
11. E-commerce uploaded screenshot and pre-saved HTML DOM snapshot auditing.

### Tier 2: LOCAL RESILIENCY (P0 Optional Field Capability)
Core inspection capability packaged for standalone local execution on field laptops or tablets when physical inspection occurs in areas devoid of internet connectivity:
1. Local execution of optical quality gate, fiducial calibration, and ONNX OCR.
2. Local deterministic rule engine and adjudication canvas.
3. Local generation of signed PDF/A notices and Section 63 BSA certificates.
4. Embedded SQLite 3.45+ (SQLCipher) encrypted persistence.
5. Asynchronous sync bundle export for later upload to the central web portal.

### Tier 3: CONNECTED ENRICHMENT (P1 Optional Web Enhancements)
Features that expand functionality when the server or client has active internet access, but are **never required to complete a physical inspection**:
1. Server-side single product listing URL text scraping via `httpx`.
2. Asynchronous batch CSV URL ingestion queue for scheduled compliance auditing.
3. Automated barcode prefix lookup against GS1 India prefix registry (890).

### Tier 4: FUTURE ROADMAP (Post-Hackathon Enterprise Integrations)
Explicitly deferred to post-hackathon state-wide rollout:
1. Live automated REST webhooks to national `emaap.gov.in` portal.
2. Real-time API integration with Ministry of Corporate Affairs (MCA21) database.
3. Live GSTIN status verification with the Goods and Services Tax Network (GSTN).
4. Direct bridge with National Consumer Helpline (NCH) grievance portal.
5. Enterprise National Single Sign-On (Parichay / Jan Parichay).

---

## 4. Operational Integrity & Defense Protocols

1. **Asset Bundling Protocol:** The React web frontend must bundle all core UI components, styling (Tailwind), and icon sets (Lucide) into the static production distribution. In local mode, zero external CDN scripts or remote fonts are requested.
2. **Colocated Model Weights:** All ONNX model weights (DBNet++, PP-OCRv4) reside in dedicated filesystem directories (`./models/`) on the server (or local host). Dynamic runtime downloads from external repositories are prohibited.
3. **Bounded Network Timeouts:** All server-side external HTTP requests (e.g. e-commerce URL fetching) must enforce a strict connection and read timeout ($\le 5.0\text{ seconds}$) to prevent hanging threads.
4. **Graceful Connection Degradation:** If a web client disconnects during an active session, client-side session state is preserved in memory, and the user is provided with clear connection status telemetry rather than an unhandled application crash.
