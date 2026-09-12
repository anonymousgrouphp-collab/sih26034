# 02_FINAL_REQUIREMENTS_SPECIFICATION.md

# SIH26034 - Legal Metrology Automated Compliance System

## Master Requirements Specification (MRS) - Functional & Non-Functional Requirements with Verification Criteria

---

### 1. Statutory Context & Legal Authority

This Master Requirements Specification defines the precise technical and legal requirements for **SIH26034**: _Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels_.

The system derives its statutory authority and testing thresholds from:

1. **The Legal Metrology Act, 2009 (Act No. 1 of 2010):**
   - Section 18: Mandatory adherence to standard quantities and packaging declarations.
   - Section 36(1): Penal provisions and compounding fines for manufacturing, packing, selling, or distributing non-compliant commodities.
2. **The Legal Metrology (Packaged Commodities) Rules, 2011:**
   - Rule 6(1): Mandatory on-pack statutory declarations.
   - Rule 6(10) & Rule 6(10A): E-commerce platform obligations and Country of Origin search/filtering mandates (as amended by G.S.R. 128(E) dated 13.02.2026, effective 1 July 2026).
   - Rule 7 & Table-I: Minimum font size and numeral height standards as a function of Principal Display Panel (PDP) area (amended by G.S.R. 629(E) dated 23.06.2017).
   - Rule 6(1)(k): Unit Sale Price (USP) computation and display requirements (amended by G.S.R. 779(E) dated 02.11.2021).
3. **The Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023):**
   - Section 63: Admissibility of electronic records in legal proceedings (replacing repealed Section 65B of the Indian Evidence Act, 1872).

---

### 2. Functional Requirements (FR-01 to FR-20)

```
+---------------------------------------------------------------------------------------------------------+
| REQ ID | REQUIREMENT TITLE            | STATUTORY BASE      | ACCEPTANCE CRITERIA                       |
+---------------------------------------------------------------------------------------------------------+
| FR-01  | Forensic Image Ingestion &   | BSA 2023 Sec 63     | Image ingested, SHA-256 computed before   |
|        | SHA-256 Hashing              |                     | any transformation, logged to ledger.     |
+---------------------------------------------------------------------------------------------------------+
| FR-02  | Optical Quality Gating       | Technical Standard  | Rejects blur (Var < 150), glare (> 3%),   |
|        |                              |                     | tilt (> 15°); emits real-time HUD advice. |
+---------------------------------------------------------------------------------------------------------+
| FR-03  | Fiducial Calibration &       | Technical Standard  | Detects ArUco 4x4 / coin; computes exact  |
|        | Perspective Rectification    |                     | px_to_mm scale; warps perspective.        |
+---------------------------------------------------------------------------------------------------------+
| FR-04  | Principal Display Panel      | LM (PC) Rule 2(h)   | Calculates PDP area based on package      |
|        | (PDP) Area Calculation       | & Rule 7            | geometry (40% rule for rect/cyl).         |
+---------------------------------------------------------------------------------------------------------+
| FR-05  | Multi-Oriented Text Detection| Technical Standard  | DBNet++ extracts text polygon bounding    |
|        |                              |                     | boxes with IoU >= 0.50.                   |
+---------------------------------------------------------------------------------------------------------+
| FR-06  | Optical Character Recognition| Technical Standard  | PaddleOCR PP-OCRv4 transcribes text;      |
|        | (OCR)                        |                     | Character Error Rate (CER) <= 2.5%.       |
+---------------------------------------------------------------------------------------------------------+
| FR-07  | Manufacturer/Packer/Importer | LM (PC) Rule 6(1)(a)| Validates presence of registered corporate|
|        | Address Extraction           |                     | identity, city, state, and pin code.      |
+---------------------------------------------------------------------------------------------------------+
| FR-08  | Net Quantity & Table-I Font  | LM (PC) Rule 6(1)(h)| Measures numeral x-height; cross-checks   |
|        | Height Verification          | & Table-I (GSR 629E)| against PDP area threshold (incl. 6.0mm). |
+---------------------------------------------------------------------------------------------------------+
| FR-09  | Maximum Retail Price (MRP) & | LM (PC) Rule 6(1)(e)| Validates currency, numeral value, and    |
|        | Tax Inclusivity Check        |                     | mandatory "(incl. of all taxes)" clause.  |
+---------------------------------------------------------------------------------------------------------+
| FR-10  | Unit Sale Price (USP)        | LM (PC) Rule 6(1)(k)| Verifies presence, correct unit denom,    |
|        | Mathematical Cross-Check     | (GSR 779E)          | and math: |USP_calc - USP_decl| <= 0.01.  |
+---------------------------------------------------------------------------------------------------------+
| FR-11  | Date of Manufacture / Expiry | LM (PC) Rule 6(1)(d)| Extracts month & year of manufacture /    |
|        | Verification                 |                     | packaging; checks format compliance.      |
+---------------------------------------------------------------------------------------------------------+
| FR-12  | Consumer Care Contact        | LM (PC) Rule 6(1)(n)| Validates presence of person/office name, |
|        | Verification                 |                     | telephone number, and valid email format. |
+---------------------------------------------------------------------------------------------------------+
| FR-13  | Country of Origin Extraction | LM (PC) Rule 6(1)(p)| Detects origin declaration; flags missing |
|        |                              |                     | origin on imported packaged goods.        |
+---------------------------------------------------------------------------------------------------------+
| FR-14  | E-Commerce Mandatory         | LM (PC) Rule 6(10)  | Ingests DOM/URL; checks digital presence  |
|        | Attribute Extraction         |                     | of all Rule 6 statutory declarations.     |
+---------------------------------------------------------------------------------------------------------+
| FR-15  | E-Commerce 2026 Country of   | LM (PC) Rule 6(10A) | Checks whether origin is exposed as a     |
|        | Origin Filter Audit          | (GSR 128E)          | structured, searchable, sortable filter.  |
+---------------------------------------------------------------------------------------------------------+
| FR-16  | E-Commerce vs Packaging      | Consumer Protection | Flags discrepancies between webpage text  |
|        | Discrepancy Cross-Check      | Act 2019 / LM Act   | and physical packaging gallery image.     |
+---------------------------------------------------------------------------------------------------------+
| FR-17  | Interactive Adjudication     | Principles of       | Dual-pane canvas; synchronized pan/zoom;  |
|        | Canvas & Pixel Loupe         | Natural Justice     | interactive pixel loupe with mm display.  |
+---------------------------------------------------------------------------------------------------------+
| FR-18  | Mandatory Officer Override   | Evidence Procedure  | Any modification of AI findings requires  |
|        | Justification Logging        |                     | officer PIN and mandatory text remarks.   |
+---------------------------------------------------------------------------------------------------------+
| FR-19  | Statutory Legal Notice       | LM Act 2009 Sec 36(1| Generates archival PDF/A Form-1/2 notice |
|        | Compilation                  | Form-1 / Form-2     | with embedded photographic evidence crops.|
+---------------------------------------------------------------------------------------------------------+
| FR-20  | Section 63 BSA 2023 Digital  | BSA 2023 Sec 63     | Emits electronic certificate with device  |
|        | Evidence Certification       |                     | metadata, image hashes, officer signature.|
+---------------------------------------------------------------------------------------------------------+
| FR-21  | Web Portal & Role-Based Auth | IT Act / ISO 27001  | HTTPS browser access with JWT auth & RBAC |
|        |                              |                     | (ADMIN, CONTROLLER, INSPECTOR, VIEWER).   |
+---------------------------------------------------------------------------------------------------------+
| FR-22  | Centralized Inspection       | Administrative Law  | Centralized PostgreSQL persistence, multi-|
|        | History & Executive Dash     | & Governance        | tenant circle search, and KPI analytics.  |
+---------------------------------------------------------------------------------------------------------+
```

---

### 3. Non-Functional Requirements (NFR-01 to NFR-10)

1. **NFR-01: End-to-End Pipeline Latency & Response Budget:**
   - Server-side CPU inference and rule evaluation time from raw image receipt to completed evaluation must be $\le 1200\text{ ms}$ on a multi-core CPU (BENCHMARK).
   - Total web round-trip time (including client upload, quality check, inference, and response serialization) must be $\le 1.8\text{ s}$ over standard broadband/4G (TARGET).
2. **NFR-02: Physical Font Measurement Precision:**
   - Mean Absolute Error (MAE) of measured font x-height must be $\le 0.30\text{ mm}$ when benchmarked against certified digital vernier calipers on planar surfaces.
3. **NFR-03: Text Recognition Accuracy:**
   - Character Error Rate (CER) on statutory declaration fields must not exceed $2.5\%$ under standard lighting conditions ($\ge 300\text{ lux}$).
4. **NFR-04: Intellectual Property & Licensing Safety:**
   - 100% of third-party libraries, models, and dependencies must carry permissive licenses (Apache-2.0, MIT, BSD). Zero AGPL-3.0 or GPL-3.0 copyleft dependencies permitted.
5. **NFR-05: Evidentiary Admissibility:**
   - All exported digital records, certificates, and evidence bundles must conform strictly to the statutory evidentiary requirements of Section 63 of the Bharatiya Sakshya Adhiniyam, 2023.
6. **NFR-06: Zero Autonomous False Accusations:**
   - Under no circumstances shall an automated penalty or legal notice be issued without explicit, authenticated human officer adjudication. False Accusation Rate = $0.0\%$.
7. **NFR-07: Field Resilience & Optional Local Mode:**
   - Core inspection processing must maintain an optional standalone local execution capability using local SQLite/SQLCipher caching for field resilience in areas lacking connectivity.
8. **NFR-08: Cryptographic Tamper-Evidence:**
   - The audit log must use SHA-256 cryptographic chaining (Merkle Tree architecture). Any alteration, insertion, or deletion of inspection rows must invalidate subsequent hash verification.
9. **NFR-09: Accessibility & Usability:**
   - The user interface must comply with WCAG 2.1 AA standards, supporting keyboard navigation, high-contrast display modes, and touch target sizes $\ge 48\text{ dp}$.
10. **NFR-10: Statutory Data Retention:**
    - The data tier must enforce a minimum 7-year immutable retention policy for all inspection records, raw images, and issued legal notices.

---

### 4. Requirements Traceability Matrix (RTM Sample)

```
+----------------------------------------------------------------------------------------+
| REQ ID | ARCHITECTURE COMPONENT          | DATABASE TABLE         | TEST SUITE         |
+----------------------------------------------------------------------------------------+
| FR-01  | Ingestion / Hashing Service     | evidence_images        | TS-01 (Unit)       |
| FR-02  | Optical Quality Gate            | evidence_images        | TS-02 (Unit)       |
| FR-03  | Fiducial Calibration Engine     | evidence_images        | TS-03 (Unit)       |
| FR-04  | PDP Geometry Calculator         | inspections            | TS-04 (Unit)       |
| FR-05  | DBNet++ Text Detection          | bounding_boxes         | TS-05 (Model)      |
| FR-06  | PaddleOCR PP-OCRv4 Engine       | bounding_boxes         | TS-06 (Model)      |
| FR-08  | Physical Font Measurement       | compliance_evaluations | TS-07 (Integration)|
| FR-10  | USP Deterministic Calculator    | compliance_evaluations | TS-08 (Integration)|
| FR-17  | Adjudication Canvas (Frontend)  | inspections            | TS-15 (E2E)        |
| FR-19  | ReportLab PDF Notice Generator  | legal_notices          | TS-18 (System)     |
| FR-20  | Section 63 BSA Cert Generator   | bsa_certificates       | TS-19 (Compliance) |
| FR-21  | Web Auth & RBAC Middleware      | users                  | TS-SYS-02 (Web)    |
| FR-22  | Centralized Dashboard / History | inspections            | TS-SYS-03 (Web)    |
+----------------------------------------------------------------------------------------+
```
