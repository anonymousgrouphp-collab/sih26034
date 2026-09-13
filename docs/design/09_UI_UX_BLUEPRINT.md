# 09_UI_UX_BLUEPRINT.md

# SIH26034 - Legal Metrology Automated Compliance System

## Complete UI/UX Specification, Design Tokens, Screen Wireframes & Interaction Workflows

---

### 1. Document Control & Design Philosophy

- **Standard:** SIH26034 Production-Grade Design Specification
- **Design Directive:** "Evidence-Grade Ergonomics, High-Cognitive-Clarity, Zero-Ambiguity Adjudication"
- **Target Users:**
  1. _Field Legal Metrology Inspector (LMO/LMI):_ Rugged mobile/tablet usage in noisy markets, grocery godowns, retail stores, and packaging factories. Needs high-contrast, large touch targets ($\ge 48 \text{ dp}$), one-handed capture controls, and real-time capture guidance.
  2. _Senior Adjudicating Officer / District Controller:_ High-density dual-monitor desktop workstation. Needs side-by-side high-resolution optical zoom, multi-layered visual bounding overlays, OCR text inspection, and instantaneous override/audit logging.
  3. _State Metrology Directorate:_ High-level oversight dashboard displaying state-wide compliance statistics, recurring offender indices, seizure trends, and e-commerce platform compliance rates.
  4. _Packer / Importer / Manufacturer:_ Self-audit portal for pre-market label validation, report download, and notice rectification submissions.

---

### 2. Design System & Foundational Design Tokens

```
Typography:
  Display / Headers: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  Monospace / Data: "JetBrains Mono", "Fira Code", monospace (For timestamps, hashes, OCR strings, font heights)
  Base Scale:
    - Display 1: 32px / Line Height: 40px (Bold 700)
    - Heading 1: 24px / Line Height: 32px (Semi-Bold 600)
    - Heading 2: 20px / Line Height: 28px (Semi-Bold 600)
    - Subheading: 16px / Line Height: 24px (Medium 500)
    - Body Regular: 14px / Line Height: 20px (Regular 400)
    - Body Small / Metadata: 12px / Line Height: 16px (Regular 400)
    - Legal Monospace: 12px / Line Height: 18px (Medium 500)

Color Tokens:
  Brand / Institutional:
    - Primary Blue (Govt / Official): #1B365D (Deep Ashoka Navy)
    - Primary Blue Accent: #2E5B9A
    - Surface Background Light: #F8FAFC (Slate 50)
    - Card / Panel Surface Light: #FFFFFF
    - Surface Background Dark: #0F172A (Slate 900)
    - Card / Panel Surface Dark: #1E293B (Slate 800)

  Compliance Semantic Status Colors:
    - Fully Compliant (PASS): #059669 (Emerald 600) / Surface Tint: #ECFDF5
    - Partial / Minor Infraction (WARNING): #D97706 (Amber 600) / Surface Tint: #FFFBEB
    - Non-Compliant / Violation (FAIL): #DC2626 (Rose 600) / Surface Tint: #FEF2F2
    - Pending Inspection / Review (NEUTRAL): #475569 (Slate 600) / Surface Tint: #F1F5F9
    - High-Confidence Bounding Box: #10B981 (Green)
    - Medium-Confidence Bounding Box: #F59E0B (Amber)
    - Low-Confidence / Flagged Bounding Box: #EF4444 (Crimson)
    - Reference Calibration Ruler / ArUco Box: #6366F1 (Indigo 500)

Elevation & Spacing:
  Grid System: 8-point base grid (4px, 8px, 16px, 24px, 32px, 48px, 64px)
  Border Radii: Sharp-Clean (Inputs: 4px, Cards: 8px, Modals: 12px, Badges: 9999px)
  Elevation Shadows:
    - Level 0: None
    - Level 1 (Card Rest): 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)
    - Level 2 (Card Hover / Active): 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
    - Level 3 (Modal / Floating Inspector HUD): 0 10px 15px -3px rgba(0, 0, 0, 0.15)
```

---

### 3. Screen Inventory & Interaction Flows

```
+-----------------------------------------------------------------------------------+
|                              SCREEN NAVIGATION FLOW                               |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [0. Auth / Role Gate]                                                            |
|          │                                                                        |
|          ├───> [1. Executive Dashboard] ────> [6. Batch Ingestion / Analytics]    |
|          │                                                                        |
|          ├───> [2. Inspector Mobile Capture HUD] ──┐                              |
|          │                                         │ (Scan / Ingest)              |
|          ├───> [4. E-Commerce Listing Auditor] ────┴───> [3. Verification Canvas] |
|                                                                 │                 |
|                                                                 ▼ (Adjudicate)    |
|                                                     [5. Legal Notice Generator]   |
+-----------------------------------------------------------------------------------+
```

---

### 4. Detailed Screen Specifications

#### 4.1 Screen 1: Executive Dashboard (`/dashboard`)

- **Primary Goal:** Real-time visibility into inspections, compliance heatmaps, and enforcement pipeline.
- **Top Bar:**
  - Ministry Seal & "Legal Metrology Enforcement Directorate"
  - Current Active Inspector / Officer Badge, District Name, Active Jurisdiction.
  - Quick Search (Barcodes, Notice IDs, Brand Names, E-commerce URL).
  - "New Field Scan" & "Ingest E-Commerce URL" Action CTA Buttons.
- **KPI Row (4 Cards):**
  1. _Total Inspections Logged (30 Days):_ Total count + week-on-week trend.
  2. _Compliance Rate:_ Percentage (e.g. 78.4%) with green/amber/red status gauge.
  3. _Violations Detected:_ Categorized by Font Height, Missing MRP, Unit Sale Price, Origin.
  4. _Active Legal Notices Issued:_ Drafts, Pending Signatures, Dispatched under Section 36(1).
- **Main Viewport Layout:**
  - _Left 65%:_ Recent Inspections Table. Columns: Inspection ID, Timestamp, Brand/Product, Category, Capture Mode (Field / E-Comm), Primary Violation, Overall Status (Badge: PASS / FAIL / FLAG), Action (Review / Notice).
  - _Right 35%:_ Top Non-Compliant Offender Categories (FMCG Snacks, Cosmetics, Imported Electronics, Infant Food) & Geographic Violation Heatmap.

---

#### 4.2 Screen 2: Field Inspector Mobile/Tablet Capture HUD (`/capture`)

- **Primary Goal:** Guide physical label capture to ensure mathematical solvability before transmission to inference pipeline.
- **Orientation & Viewport:** Portrait & Landscape adaptive. Full-screen camera stream viewfinder.
- **Live Overlay HUD Elements:**
  1. _ArUco / Reference Ruler Anchor Box:_ Semi-transparent cyan rectangle indicating where the standard reference card/coin/ruler must be placed.
  2. _Package Silhouette Guide:_ Dynamic dashed outline indicating Principal Display Panel (PDP) bounding framing.
  3. _Real-Time Angle & Tilt Gyro Sensor:_
     - Pitch/Roll Indicator: Turns GREEN when tilt angle $\le 5^\circ$ perpendicular to label.
     - Warning Toast: "Tilt too high ($14^\circ$). Straighten camera to avoid projective distortion."
  4. _Glare & Specular Reflection Warning:_
     - Real-time histogram detector highlights washed-out text regions with magenta flashing border: "Excessive glare on MRP text. Reposition lighting."
  5. _Resolution / Sharpness Gate:_
     - Real-time Laplacian variance meter: "Image too blurry ($\sigma^2 < 120$). Hold steady."
  6. _Trigger Button:_ Large circular haptic-enabled shutter with multi-shot burst mode (Front PDP, Side Net Qty Panel, Back MRP/Mfg Panel).

```
+-------------------------------------------------------------+
| [X Close]           Tilt: 1.8° [OK]           Lighting: [OK] |
|                                                             |
|       ┌ - - - - - - - - - - - - - - - - - - - - - - - ┐     |
|       |                                               |     |
|       |     Place Principal Display Panel (PDP)       |     |
|       |                  Here                         |     |
|       |                                               |     |
|       |                                               |     |
|       |                                               |     |
|       |   ┌────────────┐                              |     |
|       |   │ ArUco Ref  │                              |     |
|       |   │   Card     │                              |     |
|       |   └────────────┘                              |     |
|       └ - - - - - - - - - - - - - - - - - - - - - - - ┘     |
|                                                             |
| [Multi-Shot: 2/3]        (  SHUTTER  )          [Flash: Auto]|
+-------------------------------------------------------------+
```

---

#### 4.3 Screen 3: Verification & Adjudication Canvas (`/inspect/:id`)

- **Primary Goal:** Dual-pane inspector verification environment. Ensures that AI never issues legal notices autonomously without an explicit human officer sign-off.
- **Layout:** Split-screen layout (Left 50% Image Loupe, Right 50% Rule Adjudication Ledger).

```
+---------------------------------------------------------------------------------------------------------+
| Notice Draft #LMO-2026-0842 | Product: "Crispy Delight 150g" | Date: 07-Sep-2026 | Inspector: R. Sharma |
+----------------------------------------------------+----------------------------------------------------+
|               SOURCE IMAGE & OVERLAYS              |           LEGAL RULE COMPLIANCE AUDIT              |
+----------------------------------------------------+----------------------------------------------------+
| [Layers: Bounding Boxes | Heatmap | Ruler | Grid]  | Category: Packaged Snacks (Solid Food)             |
|                                                    | Total Package Area: 280 cm²                        |
|                                                    | Principal Display Panel (PDP) Area: 112 cm² (40%)  |
|   +--------------------------------------------+   | Table-I Minimum Required Font Height: 4.0 mm       |
|   | [CRISPY DELIGHT]                           |   +----------------------------------------------------+
|   |                                            |   | MANDATORY DECLARATIONS AUDIT (Rule 6)              |
|   | Net Weight: 150 g                          |   |                                                    |
|   | ----------------                           |   | [PASS] 1. Name & Address of Manufacturer           |
|   | [FAIL: Font Height: 2.1mm < Req: 4.0mm]    |   |        Extracted: "Haldiram Snacks Pvt Ltd..."     |
|   |                                            |   |        Confidence: 98.2% | Verified: [x]           |
|   | MRP Rs. 35.00                              |   |                                                    |
|   | (incl. of all taxes)                       |   | [FAIL] 2. Net Quantity Declaration (Rule 6(1)(h))  |
|   | Unit Sale Price: Rs. 0.23 / g              |   |        Extracted: "Net Weight: 150 g"              |
|   |                                            |   |        Measured Height: 2.12 mm (Req: >= 4.0 mm)   |
|   | Mfg Date: 08/2026   Use By: 02/2027        |   |        Violation: Rule 6(1)(h) read with Table-I   |
|   |                                            |   |        Discrepancy: -1.88 mm (-47.0%)              |
|   +--------------------------------------------+   |                                                    |
|                                                    | [PASS] 3. Maximum Retail Price (Rule 6(1)(e))      |
| Zoom: [ 100% ] [ + ] [ - ] [Reset] [ Loupe Tool ]  |        Extracted: "Rs. 35.00 (incl. of all taxes)"  |
| Measurement Mode: [ Calibrated ArUco (12.4 px/mm)] |                                                    |
| Pixel Loupe: 142 px = 2.12 mm at standard scale    | [PASS] 4. Unit Sale Price (USP) (Rule 6(1)(k))     |
|                                                    |        Extracted: "Rs. 0.23 / g" (Correctly calc)  |
|                                                    |                                                    |
|                                                    | [PASS] 5. Consumer Care Contacts (Rule 6(1)(n))    |
|                                                    |        Email & Phone present & valid format        |
|                                                    |                                                    |
|                                                    | [PASS] 6. Country of Origin (Rule 6(1)(p))         |
|                                                    |        Extracted: "Made in India"                  |
+----------------------------------------------------+----------------------------------------------------+
| ACTIONS & ADJUDICATION:                                                                                 |
| Officer Adjudication: ( ) Approve All Compliant   (*) Confirm Violation & Issue Legal Notice            |
| Officer Remarks: "Confirmed non-compliance on Net Quantity font size. Physical measurement agrees."    |
| [Generate Form-1 Legal Notice]   [Request Rescan]   [Reject AI Finding]   [Save Evidence Bundle]        |
+---------------------------------------------------------------------------------------------------------+
```

---

#### 4.4 Screen 4: E-Commerce Listing Compliance Inspector (`/ecommerce`)

- **Primary Goal:** Ingest e-commerce product pages, analyze text attributes and product gallery images, and check Rule 6(10) and Rule 6(10A) compliance.
- **Input Methods:**
  - _Tab A: Single Product URL / DOM Ingestion:_ Pastes Amazon/Flipkart/Blinkit/Zepto product URL or uploads saved HTML DOM snapshot.
  - _Tab B: Listing Gallery Image Ingestion:_ Uploads the primary packaging images displayed to the online consumer.
  - _Tab C: Batch CSV / Catalog Ingestion:_ Uploads listing URLs for scheduled headless ingestion.
- **E-Commerce Results View:**
  - _Declaration Completeness Checklist:_
    1. Name of the Manufacturer / Packer / Importer: Identified in DOM text? Identified on label? Match?
    2. Country of Origin: Clearly declared in tabular specifications? (Mandatory under Rule 6(10)).
    3. Net Quantity: Declared in standard units?
    4. Best Before / Expiry Date: Declared? (For perishable/packaged food).
    5. MRP & Unit Sale Price: Displayed clearly alongside purchase button?
  - _Rule 6(10A) 2026 Filter Compliance Audit:_
    - Checks whether the host platform exposes Country of Origin as a structured, searchable, and sortable search facet.
  - _Cross-Reference Reconciliation Widget:_
    - Compares text declared on the e-commerce webpage against the OCR text read from the uploaded gallery packaging image.
    - Flags _Discrepancy Violations_ (e.g. Webpage states "Net Qty: 200g", but package image states "Net Qty: 150g").

---

#### 4.5 Screen 5: Legal Notice & Report Generator (`/notice/:id`)

- **Primary Goal:** Automated generation of statutory legal notices under Section 36(1) of the Legal Metrology Act, 2009, complete with Section 63 BSA 2023 Digital Certificates.
- **Interactive Document Preview:**
  - Standard DoCA Legal Metrology Notice Template (Form-1 / Form-2).
  - Pre-filled fields:
    - Addressee: Packer/Manufacturer name and registered corporate address.
    - Notice Reference Number: Automatically generated hierarchical format `LMO/{STATE}/{DISTRICT}/{YEAR}/{AUTO_INC}`.
    - Facts of the Case: Product seized/scanned, inspection location, date, timestamp.
    - Specific Statutory Contraventions: Citing specific Legal Metrology (Packaged Commodities) Rules, 2011 violated (e.g., Rule 6(1)(h), Rule 12, Rule 18(1)).
    - Photographic Evidence Exhibits: Crop of the non-compliant packaging panel, pixel loupe measurement diagram, OCR transcript, calibration scale metadata.
    - Mandatory Reply Period: 15 days from receipt of notice.
- **Digital Evidence Appendices:**
  - _Annexure-A: Technical Inspection Report:_ Full telemetry, model version, calibration scale, ArUco detection confidence.
  - _Annexure-B: Section 63 BSA 2023 Certificate:_
    - Device identifier, IP address, GPS coordinate coordinates ($\pm 4 \text{ m}$ accuracy).
    - SHA-256 hash of raw input image.
    - SHA-256 hash of generated evidence PDF bundle.
    - Digital signature of the inspecting officer.
- **Export Formats:**
  - Signed PDF/A (Archival grade, tamper-evident).
  - JSON Evidence Bag (ZIP bundle containing raw image, cropped bounding boxes, metadata, OCR JSON, and Section 63 certificate).

---

#### 4.6 Screen 6: Batch Audit & Model Diagnostics Console (`/admin`)

- **Primary Goal:** Engineering and supervisory administration of inference pipelines, model accuracy metrics, and benchmark telemetry.
- **Components:**
  - _Inference Latency Breakdown:_ Bar chart showing milliseconds spent in Preprocessing -> Panel Detection -> Text Detection (DBNet++) -> OCR (PP-OCRv4) -> Rule Engine.
  - _Confidence Threshold Slider Controls:_ Real-time tuning of detection thresholds with ROC curve preview.
  - _False Positive / Human Override Feedback Loop:_ Lists all inspections where the human officer overrode the AI finding. Allows exporting misclassified crops directly into the fine-tuning dataset pipeline.
  - _Model Registry Status:_ Active weights, ONNX INT8 quantization status, memory footprint.

---

### 5. Responsive Web Architecture, Connectivity Telemetry & Accessibility

1. **Responsive Web Access Across Devices:**
   - **Desktop Workstations:** High-density split-screen layout with dual-pane image loupe and tabular statutory ledger.
   - **Laptops & Field Tablets:** Responsive flexible grid adapting to touch viewports with touch target sizes $\ge 48\text{ dp}$.
   - **Mobile Web Browsers:** Adaptive single-column flow with full-width camera viewfinder HUD and bottom drawer inspection controls.
   - **Zero Electron Dependency:** Delivers complete functionality natively through standard modern web browsers (Chrome, Firefox, Safari, Edge).
2. **Online Connectivity Telemetry & Status Badges:**
   - Top navigation bar prominently displays real-time connection status:
     - `🟢 ONLINE [PostgreSQL 16+ Connected]` — Full multi-user web mode.
     - `🟡 LOCAL MODE [SQLite Standalone]` — Operating locally in Mode B.
     - `🔴 CONNECTION INTERRUPTED` — Automatic backoff retry banner with non-blocking user feedback.
3. **Network Disruption & Data Protection Protocol:**
   - If internet connectivity drops during an online inspection:
     - Active form inputs, OCR bounding box edits, and draft remarks are automatically cached in browser `sessionStorage` and `IndexedDB`.
     - An alert toast informs the user: *"Network disconnected. Your active inspection draft is safe locally. Click 'Retry Connection' or continue editing."*
     - Prevents page reloads or silent loss of officer work.
4. **WCAG 2.1 AA Accessibility & Ergonomics:**
   - Contrast ratio $\ge 4.5:1$ for all standard text; $\ge 3.0:1$ for large text and bounding indicators.
   - Screen reader attributes (`aria-label`, `aria-live="polite"` for real-time capture guidance).
   - Full keyboard navigation support on adjudication canvas (Arrow keys to navigate bounding boxes, Space to zoom, Enter to approve, Tab to remarks).
   - Shutter button positioned in thumb-accessible bottom zone on tablet/mobile screens.
