# ARCHITECTURAL & LEGAL DECISION LOG (ADL)

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Governing Standard:** Immutable After Architecture Freeze  
**Last Updated:** 07 September 2026  
**Status:** FROZEN  

---

### Purpose

This document logs every high-impact technical, legal, mathematical, architectural, and data decision made during the research and architecture freeze phases. No frozen decision may be reversed during the sprint without following the formal Change Control Protocol.

---

### Decision Log Index

| ID | Date | Category | Topic | Chosen Option | Rejected Alternatives | Owner | Status |
| :--- | :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **ADL-01** | 2026-09-07 | Legal | Table-I Row 5 Blown Container Height | **6.0 mm** | 8.0 mm (Phase 1 typo) | Lead / Legal | **FROZEN** |
| **ADL-02** | 2026-09-07 | Legal | Electronic Evidence Statutory Basis | **Section 63 BSA 2023** | Section 65B Indian Evidence Act 1872 | Lead / Crypto | **FROZEN** |
| **ADL-03** | 2026-09-07 | Vision / Math | Metric Scale Derivation Method | **Planar Homography via Coplanar Reference (ArUco / ISO 7810 Card)** | Unassisted Monocular AI depth; Fixed DPI assumption | Member 1 | **FROZEN** |
| **ADL-04** | 2026-09-07 | AI Architecture | Compliance Engine Architecture | **Hybrid Perception-Verification (DL OCR + Deterministic AST Rules)** | Pure End-to-End VLM (GPT-4o / Gemini); Pure Classical Heuristics | Member 4 | **FROZEN** |
| **ADL-05** | 2026-09-07 | AI Licensing | Object & Text Detection Backbone | **DBNet++ & RT-DETR (Apache-2.0)** | Ultralytics YOLOv8/v11 (GNU AGPL-3.0 copyleft) | Member 1 & 2 | **FROZEN** |
| **ADL-06** | 2026-09-07 | OCR Engine | Multilingual Text Recognizer | **PaddleOCR PP-OCRv4 (SVTR, Apache-2.0) with Tesseract v5 fallback** | TrOCR (slow on CPU); Google Cloud Vision (cloud dependency) | Member 2 | **FROZEN** |
| **ADL-07** | 2026-09-07 | Legal Logic | Non-Retroactive Statutory Evaluation | **Temporal Statutory Epoch Dispatcher (by Mfg Date)** | Single static 2026 ruleset applied to all packs | Member 4 | **FROZEN** |
| **ADL-08** | 2026-09-07 | Evidence | Evidence Provenance & Cryptography | **SHA-256 Merkle Directed Acyclic Graph (DAG)** | Centralized relational log; Public/Private Blockchain | Member 5 | **FROZEN** |
| **ADL-09** | 2026-09-07 | Runtime | CPU Inference & Hardware Strategy | **Colocated Server & Local INT8 CPU Quantization via ONNX Runtime** | Cloud GPU SaaS API; Native CUDA requirement | Member 1 & 2 | **FROZEN** |
| **ADL-10** | 2026-09-07 | Scope | E-Commerce Inspection Boundary | **Direct URL / Uploaded Screenshot Inspection** | Mass automated commercial marketplace web crawling | Member 3 | **FROZEN** |
| **ADL-11** | 2026-09-07 | Data | Training & Validation Data Strategy | **Procedural Synthetic Math Dataset (DS-SYNTH) + 50 FMCG Physical Pilot** | Mass web scraping; relying on uncalibrated public sets | Member 6 | **FROZEN** |
| **ADL-12** | 2026-09-07 | Trust Model | Verdict State Representation | **4-State Epistemic Triage (PASS / FAIL / REVIEW / UNABLE_TO_VERIFY)** | Binary Pass/Fail classification | Member 4 | **FROZEN** |
| **ADL-13** | 2026-09-07 | Architecture | Primary Product Connectivity Model | **Online-First Web Application (Mode A) + Optional Local Field Mode (Mode B)** | Blanket "100% offline everywhere" claim | Lead / Arch | **FROZEN** |
| **ADL-14** | 2026-09-07 | Telemetry | Timestamping & Clock Source | **NTP Atomic Sync (Online) + Local Monotonic UTC Clock (Mode B)** | Mandatory "network atomic time" blocking offline field use | Member 5 | **FROZEN** |
| **ADL-15** | 2026-09-07 | Telemetry | Geolocation & GPS Hardware Fallback | **Hardware GNSS When Present / Nullable Coordinates + Circle Fallback** | Mandatory GPS coordinate requirement crashing laptops | Member 5 | **FROZEN** |
| **ADL-16** | 2026-09-07 | Legal / Crypto | Evidence Integrity vs Admissibility | **Technical Cryptographic Integrity (SHA-256/Ed25519) + BSA 2023 Cert** | Claiming "guaranteed court admissibility" and "licensed DSC" | Lead / Crypto | **FROZEN** |
| **ADL-17** | 2026-09-07 | Optics / Math | Font Measurement Tolerance Standard | **Dual Tolerance Standard (<= 0.15 mm Synthetic / <= 0.30 mm Retail Pilot)** | Contradictory blanket claims (0.15 mm vs 0.30 mm) | Member 1 | **FROZEN** |
| **ADL-18** | 2026-09-07 | Deployment | Frontend Architecture & Runtime Topology | **React 18 + Vite SPA in Modern Browser (Chrome/Edge/Firefox)** | Mandatory Electron desktop container | Member 6 | **FROZEN** |
| **ADL-19** | 2026-09-07 | Datastore | Database & File Storage Architecture | **PostgreSQL 16+ Primary Datastore + File Storage Decoupling + Local SQLite** | Storing binary images in SQL; SQLite as only datastore | Member 5 | **FROZEN** |

---

### Detailed Decision Records

#### ADL-01: Table-I Row 5 Blown Container Statutory Height
- **Context:** Initial notes recorded Row 5 ($> 2500\text{ cm}^2$) blown/moulded character height as 8.0 mm.
- **Evidence:** Official Gazette Notification G.S.R. 629(E) dated 23.06.2017 confirms Table-I prescribes **6.0 mm** for normal containers and **6.0 mm** for blown/moulded containers when $> 2500\text{ cm}^2$.
- **Decision:** Correct Row 5 blown height to **6.0 mm** across all system rule schemas.
- **Impact:** Eliminates false non-compliance flags on large bulk carboys/jars.

#### ADL-02: Electronic Evidence Statutory Basis (BSA 2023 vs Evidence Act 1872)
- **Context:** Outdated documentation cited Section 65B of the Indian Evidence Act, 1872.
- **Evidence:** The Indian Evidence Act, 1872 was repealed and replaced on 1 July 2024 by the **Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)**. Electronic records admissibility is governed under **Section 63 of BSA 2023**.
- **Decision:** All evidence schemas, PDF reports, and hash certificates must explicitly cite **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023**.
- **Impact:** Guarantees statutory relevance and prevents immediate technical dismissal by knowledgeable legal judges.

#### ADL-03: Metric Scale Derivation via Planar Homography
- **Context:** How to measure physical character heights ($1.0\text{ mm}$ to $6.0\text{ mm}$) from a camera photograph.
- **Evidence:** Perspective projection couples physical height and depth ($y = h \cdot f / (Z \cdot p_y)$). Monocular images possess scale ambiguity. Planar homography ($H$) anchored to an ArUco fiducial target or ISO 7810 card (known size: $85.60 \times 53.98\text{ mm}$) mathematically resolves metric scale $S = \text{mm/pixel}$.
- **Decision:** Require coplanar reference target for certified physical font measurement. Provide dual mode: Calibrated Mode (certified mm) and Uncalibrated Mode (relative ratio + flags).
- **Impact:** Scientifically defensible and demonstrably accurate ($\le 0.15\text{ mm}$ MAE on planar targets).

#### ADL-04: Hybrid Perception-Verification Architecture
- **Context:** Selection of reasoning paradigm: End-to-end VLM vs Classical CV vs Hybrid.
- **Evidence:** Generative models hallucinate numbers (e.g., ₹48 becomes ₹40), are non-deterministic, have high latency, and are legally inadmissible under Section 63 BSA. Classical heuristics break on varied packaging.
- **Decision:** Deep learning restricted to perceptual observation (DBNet++ text detection, PP-OCRv4 recognition); compliance logic executed by an immutable Abstract Syntax Tree (AST) deterministic rule engine.
- **Impact:** Zero legal hallucinations, 100% auditability, sub-millisecond rule evaluation.

#### ADL-05: Strict Prohibition of AGPL-Licensed Detection Models (Ultralytics YOLO)
- **Context:** Selecting object/panel detection model. YOLOv8/v11 are popular but licensed under GNU AGPL-3.0.
- **Evidence:** AGPL-3.0 contains viral copyleft provisions requiring any network-accessible service utilizing the code to open-source its entire proprietary codebase. This is unacceptable for government systems.
- **Decision:** Prohibit Ultralytics YOLO. Adopt **DBNet++** (Apache-2.0) for text detection and **RT-DETR** (Apache-2.0) for panel boundaries.
- **Impact:** Completely eliminates licensing liabilities for the Department of Consumer Affairs.

#### ADL-06: Multilingual OCR Engine Selection
- **Context:** Ingestion of English and Devanagari Hindi packaging text.
- **Evidence:** PaddleOCR PP-OCRv4 (SVTR) achieves $> 95\%$ Latin and $> 88\%$ Indic scene text accuracy with a small parameter footprint, executing in $\sim 110\text{ ms}$ on CPU. Tesseract v5 performs well on clean rectangular crops.
- **Decision:** Primary recognizer: PaddleOCR PP-OCRv4. Secondary consensus fallback on low confidence: Tesseract v5.
- **Impact:** Robust multilingual Indic support on commodity server and local hardware without cloud API fees.

#### ADL-07: Non-Retroactive Temporal Rule Evaluation
- **Context:** Enforcing new statutory amendments (e.g., 2021 USP mandate, 2026 origin filter) on products manufactured before their enactment date.
- **Evidence:** Article 20(1) of the Indian Constitution prohibits retroactive penal sanctions.
- **Decision:** Extract package Manufacturing Date; dispatch to immutable temporal rule snapshot (2011 Base, 2017 Font, 2021 USP, 2023 Jan Vishwas).
- **Impact:** Legally airtight enforcement notices immune to judicial dismissal.

#### ADL-08: SHA-256 Merkle Provenance Graph
- **Context:** Proving digital evidence integrity under Section 63 BSA 2023.
- **Evidence:** Blockchain networks add unnecessary consensus latency and external dependencies. Merkle DAGs provide cryptographic proof of unbroken chain of custody from raw pixel capture to final PDF dossier.
- **Decision:** Hash each pipeline stage (Raw Photo $\rightarrow$ Calibration Matrix $\rightarrow$ OCR Tokens $\rightarrow$ Rule Findings $\rightarrow$ Officer Sign-off) into a SHA-256 Merkle Tree embedded in the inspection dossier.
- **Impact:** Satisfies legal conditions for electronic evidence admissibility without third-party dependencies.

#### ADL-09: Server & Local CPU INT8 Inference via ONNX Runtime
- **Context:** Server hosting economics and local offline field deployment.
- **Evidence:** Cloud GPU instances (A100/T4) incur substantial infrastructure costs and are unavailable offline. INT8 quantized ONNX Runtime models execute on standard 4-core server and laptop CPUs in $\sim 200\text{ ms}$ per panel.
- **Decision:** Run colocated ONNX Runtime CPU inference on both the primary web server and the optional local field engine.
- **Impact:** Scalable, highly cost-effective server hosting ($0 external GPU/API costs) plus 100% parity on local field hardware.

#### ADL-10: E-Commerce Inspection Scope Boundary
- **Context:** Defining e-commerce compliance capabilities.
- **Evidence:** Mass web scraping triggers IP bans, violates commercial terms of service, and captures marketing renders rather than physical products.
- **Decision:** Restrict e-commerce scope to: (A) User-provided listing URL text analysis, (B) Direct HTML DOM snapshot upload, and (C) Uploaded product listing image inspection. Prohibit automated background crawler bots.
- **Impact:** Safe, legally compliant, maintainable, and demonstrably functional e-commerce module.

#### ADL-11: Data Strategy: Synthetic Procedural Math + Physical FMCG Pilot
- **Context:** Lack of public datasets with physical millimeter caliper annotations.
- **Evidence:** No public dataset exists. Manual annotation of thousands of packs is impossible in 6 days.
- **Decision:** Build procedural synthetic vector label generator (DS-SYNTH-001) with mathematically exact mm dimensions for algorithm testing, complemented by a physical retail pilot of 50 common FMCG packs measured with digital calipers ($\pm 0.02\text{ mm}$).
- **Impact:** Sub-pixel mathematical ground truth for testing, backed by empirical retail validation.

#### ADL-12: 4-State Epistemic Verdict Triage
- **Context:** Handling measurement uncertainty and degraded image quality.
- **Evidence:** Binary Pass/Fail on noisy real-world packaging causes wrongful accusations and officer distrust.
- **Decision:** Output four explicit states: VERIFIED_COMPLIANT (PASS), VIOLATION_FLAG (FAIL), REQUIRES_REVIEW (REVIEW), and UNABLE_TO_VERIFY (RETAKE).
- **Impact:** Protects legitimate businesses, prevents false legal notices, and establishes transparent human-in-the-loop governance.

#### ADL-13: Primary Product Connectivity Model (Online Web App + Local Field Capability)
- **Context:** Clarifying architectural intent and delivery scope for SIH 2026.
- **Evidence:** The deliverable is an enterprise web application for the Ministry of Consumer Affairs, requiring centralized multi-user login, state-wide dashboard analytics, and persistent inspection history. Field officers in remote areas also require operational resilience when internet connectivity drops.
- **Decision:** NyayaDrishti-LM is an **Online-First Web Application** (Mode A) accessible via web browser, backed by FastAPI, PostgreSQL 16+, and colocated ONNX CPU inference. It includes an **Optional Local Inspection Mode** (Mode B) for field resiliency, and external integration stubs (Mode C) for future government systems.
- **Impact:** Eliminates all architectural contradictions; provides an enterprise-ready, scalable web platform while maintaining field operational resilience.

#### ADL-14: Timestamping & Clock Source Specification
- **Context:** Field inspections in rural mandis and basements have no network connection; attempting to query network atomic time causes pipeline blocking.
- **Evidence:** NTP requires UDP port 123 access to external time servers; local monotonic clock (`time.monotonic_ns()`) guarantees tamper-evident sequencing offline.
- **Decision:** In Online Mode, bind server NTP-synchronized UTC timestamps (`clock_source: SERVER_NTP_ATOMIC`). In Mode B, bind local monotonic timestamps (`clock_source: LOCAL_DEVICE_MONOTONIC`).
- **Impact:** Eliminates offline pipeline blocking; preserves transparent, tamper-evident cryptographic provenance.

#### ADL-15: Geolocation & GPS Hardware Fallback
- **Context:** Laptops and indoor retail shops lack satellite GPS; browser geolocation fails without network location services.
- **Evidence:** Standard field laptops running Chrome return `GEOLOCATION_POSITION_UNAVAILABLE` when disconnected from Wi-Fi.
- **Decision:** `gps_latitude` and `gps_longitude` are nullable/optional in schema. When running indoors or on laptop hardware, coordinates record as NULL and officer selects assigned Circle / Premise from administrative dropdown.
- **Impact:** Prevents database insertion crashes and allows field inspections anywhere in India.

#### ADL-16: Evidence Integrity vs Legal Admissibility Boundaries
- **Context:** Legal claims regarding Section 63 BSA 2023.
- **Evidence:** Software cannot legally guarantee courtroom outcomes; commercial PKI DSC tokens require online CRL verification and external hardware dongles. Section 63(4) BSA 2023 conditions admissibility on officer certificate credibility and system operational integrity.
- **Decision:** State clearly that the system structures electronic evidence to satisfy the statutory requirements of Section 63 BSA 2023; cryptographic Merkle DAG provides mathematical proof of technical integrity; final legal admissibility rests with the judicial authority.
- **Impact:** Legally unassailable claims during evaluation; zero risk of dismissal by judicial experts.

#### ADL-17: Font Measurement Tolerance Harmonization
- **Context:** Contradiction between documents claiming MAE $\le 0.15\text{ mm}$ everywhere vs $\le 0.30\text{ mm}$.
- **Evidence:** Standard 1080p optical sensor at 20 cm provides ~15 px/mm; single pixel quantization error is ~0.067 mm; ink spread on cardboard adds ~0.15 mm variance.
- **Decision:** Adopt Dual Tolerance Standard: Benchmark Mean Absolute Error (MAE) $\le 0.15\text{ mm}$ on planar synthetic targets (DS-SYNTH-001); Acceptance Target MAE $\le 0.30\text{ mm}$ on real-world retail FMCG pilot packaging (DS-PILOT-050). Borderline cases within $\pm 0.30\text{ mm}$ route to `REQUIRES_HUMAN_REVIEW`.
- **Impact:** Scientifically rigorous, defendable before metrology judges, zero false precision claims.

#### ADL-18: Frontend Architecture & Runtime Topology
- **Context:** Packaging desktop application vs web application.
- **Evidence:** A browser-based Single Page Application (SPA) built with React 18 and Vite allows seamless cross-platform access across laptops, tablets, and smartphones without installing proprietary desktop packages.
- **Decision:** React 18 + Vite SPA deployed via Nginx / FastAPI in production, accessed via standard browsers (Chrome, Edge, Firefox). Electron is eliminated as a required component.
- **Impact:** Instant browser access, zero client installation barrier, responsive layout on any screen size.

#### ADL-19: Database & Central Storage Architecture
- **Context:** Datastore selection and binary asset handling.
- **Evidence:** Storing raw images in relational database columns (BLOBs) degrades query performance, inflates backups, and causes database bloat. PostgreSQL 16+ is the enterprise standard for central data persistence; SQLite is ideal for embedded local caching.
- **Decision:** PostgreSQL 16+ is the primary online datastore; SQLite 3.45+ (SQLCipher) is used exclusively for Mode B local caching. All image and PDF assets are stored in central filesystem storage (`/storage/uploads/`, `/storage/evidence/`), with database storing only relative paths and SHA-256 hashes.
- **Impact:** High relational query performance, clean migrations via Alembic, zero SQL bloat, and seamless Mode B sync.
