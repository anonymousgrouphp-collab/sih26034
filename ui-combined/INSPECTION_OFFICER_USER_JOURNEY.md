# Legal Metrology Inspection Officer (LMO) User Journey & Operational Workflow

**Product:** NyayaDrishti-LM  
**Target Role:** Legal Metrology Officer (LMO), Inspector, Assistant Controller, Controller  
**Jurisdictional Context:** Field raids, wholesale mandis, retail superstores, packaging units, e-commerce fulfillment hubs  
**Authoritative Statute:** Legal Metrology Act, 2009; Legal Metrology (Packaged Commodities) Rules, 2011; Section 63 Bharatiya Sakshya Adhiniyam, 2023  

---

## 1. Persona Profile & Field Operating Environment

### 1.1 Primary Persona: Rajesh Sharma (LMO-DL-084)
* **Designation:** Legal Metrology Officer (Inspector), South Delhi Enforcement Division.
* **Technical Proficiency:** Moderate smartphone user (WhatsApp, government portals, standard camera apps). Non-technical in computer vision, deep learning, or regexes.
* **Field Hardware:** Government-issued Android tablet / rugged smartphone, portable Bluetooth thermal printer (optional), 50mm ArUco scale calibration reference card, certified vernier caliper for tactile verification.
* **Operating Constraints:**
  - Harsh ambient lighting (bright direct sunlight in open mandis or dim fluorescent tubes in backroom godowns).
  - Variable internet connectivity (frequent 4G drops, warehouse dead-zones requiring local offline resilience).
  - Time constraints (officers inspect 20–50 SKUs during a single market surveillance drive).
  - High evidentiary burden (all seizure memos and violation notices must withstand aggressive defense counsel challenge in appellate court).

---

## 2. End-to-End Operational Inspection Journey

The complete operational journey is structured into 6 sequential phases, ensuring human-in-the-loop (HITL) primacy at every stage.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Phase 1: Setup │ ──> │ Phase 2: Intake │ ──> │Phase 3: Pipeline│
│Circle & Station │     │Package Capture  │     │ 5-Stage Vision  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│Phase 6: Notice  │ <── │Phase 5: Adjudic.│ <── │Phase 4: Review  │
│Sec 63 BSA Form 1│     │HITL Sign-Off    │     │Statutory Decls  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### Phase 1: Station Initiation & Jurisdictional Setup
1. **Officer Login & Circle Selection:**
   - The officer opens `NyayaDrishti-LM` on their browser or field device.
   - The top navigation bar automatically reflects their authenticated identity (`Rajesh Sharma • INSP-DL-0842`) and active circle (`DL-SOUTH-01 • South Delhi Circle`).
   - The connectivity pill displays `ONLINE (MODE A)` or automatically indicates `LOCAL RESILIENT (MODE B)` when operating offline with local SQLite datastore.
2. **Accessibility Confirmation:**
   - In outdoor glare, the officer toggles high-contrast mode (`Contrast` button) or increases font size (`A+` button) directly from the GIGW 3.0 top toolbar.

---

### Phase 2: Evidence Intake & Physical Package Capture
1. **Initiate New Case:**
   - Officer clicks `+ New Inspection Case` from the left navigation or top dashboard.
2. **Choose Intake Mode:**
   - System defaults to **Field Package Capture** (custom seizure) while offering **Benchmark Test Cases** for calibration drills.
3. **Capture Packaging Photograph:**
   - Officer taps `Capture Camera` on their smartphone/tablet.
   - The camera interface opens with `capture="environment"` (rear camera active).
   - The officer follows the on-screen **Field Photography Rules**:
     - Places the **50mm ArUco scale marker** on the same plane adjacent to the package.
     - Holds the lens perpendicular ($\pm 15^\circ$) to avoid severe perspective distortion.
     - Tilts slightly away from ceiling spotlights to avoid blinding specular glare on metallic pouches.
4. **Enter Field Metadata:**
   - Officer records:
     - Establishment / Premises: e.g., `Azadpur Wholesale Mandi, Shop 14`
     - Commodity Category: e.g., `FOOD_SNACKS`
     - Packaging Geometry: e.g., `FLEXIBLE_POUCH`
     - Declared Net Quantity: e.g., `500 g`
5. **Initiate Verification:**
   - Officer taps `Begin Statutory Verification`. The image is ingested, hashed (SHA-256), and passed to the local inference pipeline.

---

### Phase 3: Automated Diagnostic Pipeline Execution
The system executes a deterministic 5-stage vision and NLP pipeline:
1. **Stage 1 (Evidence Capture Quality Gate):**
   - Evaluates Laplacian blur variance ($\ge 100.0$) and specular glare bloom percentage ($\le 5.0\%$).
   - If degraded, alerts officer with actionable guidance (e.g., `CALIBRATION_FIDUCIAL_MISSING: Place ArUco 50mm marker next to package`).
2. **Stage 2 (Multilingual OCR):**
   - DBNet++ text detector localizes text bounding boxes.
   - PP-OCRv4 multilingual recognizer extracts Latin English and Devanagari Hindi text tokens.
3. **Stage 3 (Metric Calibration):**
   - Detects ArUco marker, calculates homography matrix, and derives scale ratio ($\text{mm}/\text{px}$).
4. **Stage 4 (Statutory Rule Engine):**
   - Compares extracted entities against statutory schedules under LMPC Rules, 2011:
     - Table-I numeral font height schedule based on PDP area.
     - Rule 6(1)(e) MRP inclusive of taxes.
     - Unit Sale Price (USP) math ($|\text{USP} \times \text{NetQty} - \text{MRP}| \le 0.02$).
     - Banned units check (`gms`, `ML`, `ltrs` flag non-compliant).
5. **Stage 5 (Adjudication Ready):**
   - Case is triaged into `PASS`, `FAIL`, `REVIEW`, or `UNABLE_TO_VERIFY`.

---

### Phase 4: Diagnostic Review & Statutory Declarations Card
1. **Inspection Overview Tab:**
   - Officer reviews the **5-Stage Pipeline Progress Stepper** (all stages highlighted green if passed, amber if review required, red if violation detected).
   - Reviews the **Executive Summary Ticker** (Total Checks, Compliant, Violations, Review Band, Metric Calibration status, Conflicts).
2. **Statutory Declarations Review:**
   - In the right-hand column, officer reviews the dedicated **Statutory Declarations Card**:
     - Commodity Name (`Rule 6(1)(b)`)
     - Net Quantity & Units (`Rule 6(1)(c) & Sec 11`)
     - Maximum Retail Price (`Rule 6(1)(e)`)
     - Month & Year of Packing (`Rule 6(1)(d)`)
     - Manufacturer / Packer (`Rule 6(1)(a)`)
     - Consumer Care (`Rule 6(1)(f)`)
   - Officer clicks `Confirm` to validate individual system extractions or clicks `Edit` to adjust any OCR misread (e.g., distinguishing faded ink lot numbers).

---

### Phase 5: Contradiction Adjudication & Borderline Handling
1. **Contradictory Evidence Gate (Dual MRP):**
   - If conflicting markings are detected on the package body (e.g., original ₹45.00 vs overprinted sticker ₹48.00 under Rule 18(1)), the prominent **Conflicting Evidence Alert** appears.
   - Officer taps `Review Contradiction` or switches to the `Forensic Split-Canvas` tab.
2. **Deep Forensic Inspection:**
   - Officer uses the **2.5x Optical Forensic Loupe** to magnify tiny numeral markings (e.g., verifying font height against Table-I requirements).
   - Toggles the **10mm Calibrated Metric Grid** to visually verify physical package dimensions.
   - Inspects the **Token Inspector Drawer** to view OCR model source and confidence.
3. **Officer Adjudication:**
   - Officer clicks `Adjudicate Case (LMO)`:
     - Sets Final Epistemic Verdict (`CONFIRMED VIOLATION`, `COMPLIANT`, `COMPOUNDING RECOMMENDED`).
     - Selects statutory offense clauses (e.g., `Rule 18(1) - Alteration of Retail Price`).
     - Records official rationale and compounding fee (e.g., `₹5,000` under Section 49).
     - Confirms digital signature.

---

### Phase 6: Section 63 BSA Certification & Notice Issuance
1. **Formal Statutory Report:**
   - Officer navigates to the `Formal Report & Notice` tab.
   - System renders the complete statutory inspection dossier including:
     - Commodity & trader identification.
     - Section 63 BSA 2023 digital certificate.
     - Unbroken cryptographic SHA-256 evidence ledger digest.
     - Government State Emblem and Digital Stamp Seal.
2. **Form-1 Statutory Notice Dispatch:**
   - Officer clicks `Issue Statutory Notice (Form-1 under LMPC Rules)`.
   - The system generates an official ReportLab PDF/A document citing Section 63 BSA 2023, granting the statutory 15-day contest window.
   - Officer can download the PDF, print on-site, or attach to the departmental seizure memo.

---

## 3. Offline Resilient Mode (Mode B Operations)

When an officer operates in subterranean godowns or rural mandis with zero internet connectivity:
1. **Seamless Local Operation:** The platform operates locally on `localhost:8000` / `localhost:5174` using lightweight SQLite persistence and client-side ONNX INT8 CPU inference.
2. **Unbroken Chain-of-Custody:** Every image capture is hashed immediately with client-side SHA-256 and appended to the local Merkle ledger.
3. **Re-synchronization:** When returning to circle headquarters or regaining Wi-Fi, the officer initiates a one-click synchronization to the central PostgreSQL cloud datastore.
