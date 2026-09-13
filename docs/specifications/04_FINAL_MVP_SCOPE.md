# 04_FINAL_MVP_SCOPE.md

# SIH26034 - Legal Metrology Automated Compliance System

## Definitive MVP Scope, MoSCoW Prioritization & Explicit Cut List for 13 September 2026 Deadline

---

### 1. Strategic Context & Hackathon Realities

- **Target Competition:** Smart India Hackathon 2026 (Problem Statement ID: SIH26034)
- **Ministry / Department:** Ministry of Consumer Affairs, Food & Public Distribution / Department of Consumer Affairs (DoCA)
- **Execution Window:** 07 September 2026 to 13 September 2026 (6 Days Remaining)
- **Team Size:** 6-Member Multidisciplinary Engineering Team
- **Guiding Engineering Axiom:**
  > _"A complete, bug-free, legally unassailable end-to-end vertical slice always triumphs over a wide, half-broken horizontal architecture with mock data."_

The scope defined herein is **FROZEN**. No features outside P0 may be added until the P0 pipeline is passing 100% of integration test suites and has executed a complete end-to-end live run.

---

### 2. MoSCoW Prioritization Matrix

```
+----------------------------------------------------------------------------------------------------+
| PRIORITY LEVEL    | DESCRIPTION & EXECUTION STATUS                                                 |
+----------------------------------------------------------------------------------------------------+
| P0: MUST-HAVE     | Mandatory core pipeline. Failure to deliver any item = Project Incompletion.   |
| (MVP Freeze)      | Deadline for code complete: 10 September 2026 (Day 4).                         |
+----------------------------------------------------------------------------------------------------+
| P1: SHOULD-HAVE   | High-value differentiators. Implemented only after P0 integration passes.      |
| (Stretch Goals)   | Target delivery: 11 September 2026 (Day 5).                                    |
+----------------------------------------------------------------------------------------------------+
| P2: COULD-HAVE    | Post-hackathon architectural roadmap for state-wide scaling.                   |
| (Roadmap)         | Documented in architecture blueprints; omitted from demo code.                 |
+----------------------------------------------------------------------------------------------------+
| P3: WON'T-HAVE    | Explicitly blacklisted features, hazardous designs, and scope-creep traps.     |
| (Cut List)        | Zero development time allocated. Rejected by architectural consensus.          |
+----------------------------------------------------------------------------------------------------+
```

---

### 3. Detailed Scope Breakdown

#### 3.1 P0: Must-Have (MVP Frozen Scope)

1. **Online-First Web Application Platform (Primary Core Delivery):**
   - Responsive browser-based Single Page Application (React 18 + Vite + Tailwind CSS) running across desktop, laptop, and tablet viewports.
   - High-throughput FastAPI ASGI modular application server (Python 3.11+).
   - Secure authentication via bcrypt password hashing and RFC 7519 Bearer JWT with Role-Based Access Control (`ADMIN`, `CONTROLLER`, `INSPECTOR`, `VIEWER`).
   - Centralized PostgreSQL 16+ persistence managing multi-tenant circle data, inspections, evaluations, notices, and audit ledgers.
   - Structured server file/evidence storage (`/storage/uploads/` and `/storage/evidence/`) storing images and generated PDF/A documents with SHA-256 database links.
   - Centralized inspection history, paginated search, and executive analytics dashboard.
2. **Physical Label Ingestion & Optical Quality Gate:**
   - Ingestion of high-resolution packaging images ($\ge 1920 \times 1080$) via browser upload or mobile camera.
   - Automated quality gating: Laplacian blur variance ($\sigma^2 \ge 150$), specular glare threshold ($\le 3\%$), and perspective skew limit ($\le 15^\circ$).
3. **Deterministic Fiducial Calibration Engine:**
   - Detection of ArUco 4x4 50 mm reference marker (with fallback to ₹5 standard coin).
   - Planar homography perspective rectification (`cv2.warpPerspective`) to eliminate camera tilt distortion.
   - Derivation of exact pixel-to-millimeter scaling ratio (`px_to_mm`).
4. **Apache-2.0 Permissive OCR & Text Detection Pipeline:**
   - DBNet++ / PaddleDetection for multi-oriented text polygon detection.
   - PaddleOCR PP-OCRv4 for high-accuracy text recognition on English statutory declarations (INT8 CPU optimized).
   - Connected-components bounding analysis for character x-height measurement.
5. **Core Legal Metrology Rule Engine (Packaged Commodities Rules, 2011):**
   - **Rule 6(1)(a):** Name and address of manufacturer, packer, or importer.
   - **Rule 6(1)(h) & Table-I:** Net quantity declaration and minimum font height validation based on calculated Principal Display Panel (PDP) area:
     - Area $\le 50\text{ cm}^2$: $\ge 1.0\text{ mm}$
     - $50 < \text{Area} \le 100\text{ cm}^2$: $\ge 1.5\text{ mm}$
     - $100 < \text{Area} \le 500\text{ cm}^2$: $\ge 2.0\text{ mm}$ (Weight $\le 200\text{g}$) / $\ge 4.0\text{ mm}$ (Weight $> 200\text{g}$)
     - $500 < \text{Area} \le 2500\text{ cm}^2$: $\ge 4.0\text{ mm}$
     - $\text{Area} > 2500\text{ cm}^2$: **$\ge 6.0\text{ mm}$** (Official Gazette G.S.R. 629(E) boundary).
   - **Rule 6(1)(e):** Maximum Retail Price (MRP) declaration including mandatory "(inclusive of all taxes)" clause.
   - **Rule 6(1)(k):** Unit Sale Price (USP) validation:
     - Packaged commodities $< 1\text{ kg} / 1\text{ L}$: Declared per gram / per milliliter.
     - Packaged commodities $\ge 1\text{ kg} / 1\text{ L}$: Declared per kilogram / per liter.
     - Mathematical accuracy cross-check: $|\text{USP}_{\text{calc}} - \text{USP}_{\text{declared}}| \le 0.01$.
   - **Rule 6(1)(n):** Consumer care name, address, telephone number, and email.
   - **Rule 6(1)(p):** Country of origin declaration (especially for imported goods).
6. **Interactive Officer Adjudication Canvas:**
   - Split-view web application: Calibrated zoom/pan image canvas with visual bounding box overlays on the left; structured statutory rule ledger on the right.
   - Pixel loupe tool with real-time millimeter readout.
   - Human-in-the-Loop approval / override workflow with mandatory justification logging.
7. **Statutory Legal Notice & Section 63 BSA 2023 Generator:**
   - Automated compilation of Form-1 / Form-2 Legal Notice under Section 36(1) of the Legal Metrology Act, 2009.
   - Generation of Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) Electronic Evidence Certificate embedding raw image SHA-256 hash, authoritative timestamp, and officer attestation.
   - Archival PDF/A export with embedded evidence exhibits.
8. **E-Commerce Compliance Auditing (Mode A Online + Mode B Local):**
   - Mode A (Online Web Mode): Direct ingestion of single product listing URLs from major platforms (Amazon, Flipkart, Blinkit, Zepto) via server-side HTTP client, plus uploaded screenshots and saved HTML DOM files.
   - Mode B (Optional Local Mode): Ingestion and auditing of officer-uploaded product listing screenshots, gallery packaging images, and pre-saved HTML DOM snapshots.
   - Rule 6(10) declaration completeness check (packer name, origin, net qty, MRP; excluding statutorily exempt manufacturing date).
   - Rule 6(10A) Country of Origin search/filter compliance check (G.S.R. 128(E) 2026 mandate).
   - Discrepancy detector: Cross-referencing webpage textual claims against OCR text read from packaging image.
9. **Tamper-Evident SHA-256 Audit Trail:**
   - Append-only cryptographic ledger chaining all inspection steps and officer actions in PostgreSQL (and local SQLite).
10. **Optional Local Inspection Capability (Resiliency Mode B):**
    - Standalone local execution capability for the core inspection pipeline using embedded SQLite 3.45+ (SQLCipher) for field use without internet.

---

#### 3.2 P1: Should-Have (Stretch Scope - Only if P0 Completed by Day 4)

1. **Batch CSV Ingestion Queue:** Uploading a CSV of 100 e-commerce URLs for automated asynchronous processing.
2. **1D/2D Barcode & QR Parsing:** Pyzbar / OpenCV decoding of EAN-13 barcodes to verify prefix validity against GS1 India prefix registries (890).
3. **Multi-Lingual OCR Baseline:** Hindi Devanagari text recognition for dual-language labels (English + Hindi).

---

#### 3.3 P2: Could-Have (Future Product Roadmap)

1. Native Android APK with live WebRTC/AR camera guidance overlays.
2. Enterprise SSO integration with Government Parichay / Jan Parichay identity services.
3. Direct automated API integration with National Consumer Helpline (NCH) grievance portal.

---

#### 3.4 P3: Won't-Have (The Explicit Cut List & Non-Goals)

```
+----------------------------------------------------------------------------------------------------+
| CUT ITEM                           | RATIONALE FOR EXCLUSION                                       |
+----------------------------------------------------------------------------------------------------+
| 1. Mass E-Commerce Web Scraping   | Mass scraping triggers IP bans, CAPTCHAs, and violates TOS.   |
|                                    | Scope is strictly restricted to single URL / DOM / gallery    |
|                                    | image ingestion.                                              |
+----------------------------------------------------------------------------------------------------+
| 2. Autonomous AI Notice Dispatch   | Unconstitutional and illegal under Indian jurisprudence. Fines |
|                                    | and notices require human officer adjudication sign-off.       |
+----------------------------------------------------------------------------------------------------+
| 3. Monocular Depth Estimation      | Single uncalibrated images cannot resolve physical mm without |
|    Without Reference Fiducials     | scale ambiguity. Legally inadmissable in court.               |
+----------------------------------------------------------------------------------------------------+
| 4. AGPL-3.0 Models (YOLOv8/v11)    | Viral copyleft license endangers government intellectual      |
|                                    | property. Permissive Apache-2.0 alternatives chosen.          |
+----------------------------------------------------------------------------------------------------+
| 5. Physical Scale / Weight Testing | Software cannot weigh physical goods. Net weight compliance   |
|    Verification                    | is checked strictly against printed on-pack declarations.     |
+----------------------------------------------------------------------------------------------------+
| 6. Chemical / FSSAI Ingredient     | Outside Legal Metrology Department statutory jurisdiction.    |
|    Adulteration Analysis           | Scope strictly bounded to Legal Metrology (PC) Rules, 2011.   |
+----------------------------------------------------------------------------------------------------+
| 7. Proprietary Cloud Vision APIs   | Paid commercial APIs (Google Cloud Vision, AWS Rekognition)   |
|                                    | create recurring government cost dependencies and vendor lock.|
+----------------------------------------------------------------------------------------------------+
```
