# COMPLETE PROJECT END-TO-END Guide

## Software System to Check Compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011

```
====================================================================================================
PROJECT IDENTIFIER : SIH26034
PROJECT TITLE      : Software System to check compliance of Packaged Commodities under
                     Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products,
                     images and labels.
MINISTRY           : Ministry of Consumer Affairs, Food & Public Distribution
DEPARTMENT         : Department of Consumer Affairs (DoCA)
PRODUCT NAME       : (Legal Metrology)
TEAM PROFILE       : 6-Member Multidisciplinary Student Engineering Team
CURRENT DATE       : 07 September 2026
SUBMISSION DEADLINE: 13 September 2026 (6 Days Execution Window)
DOCUMENT PURPOSE   : Single Human-Readable Master Guide for Development, Integration & Demo
====================================================================================================
```

---

## 0. READ THIS FIRST (The 3-Minute Executive Summary)

⭐ **MUST KNOW: Read this section before reading anything else. It explains the entire project in 3 minutes.**

### The Problem in One Sentence

India has over **12 million retail shops** and **billions of packaged products**, but only about **3,000 government inspectors** who must manually check packaging labels using handheld magnifying glasses and paper notebooks—meaning less than 0.1% of products are ever inspected.

### Who Has This Problem?

The **Department of Consumer Affairs (DoCA)**, Ministry of Consumer Affairs, Food & Public Distribution, Government of India, along with State Legal Metrology Departments.

### Who Will Use Our Software?

State **Legal Metrology Officers (LMOs)** inspecting shops, **Adjudicating Controllers** issuing legal notices, and **Central DoCA Policymakers** tracking compliance trends across India.

### What Are We Building?

We are building NyayaDrishti-LM, an **Online-First Web Application** built for the Department of Consumer Affairs (DoCA) to inspect packaged commodities under the Legal Metrology (Packaged Commodities) Rules, 2011. It operates across three distinct operational modes:
- **Mode A: Online Web Mode (Primary Production):** Centralized web application accessed via standard browsers (Chrome, Edge, Firefox). Features multi-user authentication (RBAC), centralized PostgreSQL 16+ datastore, server-side CPU INT8 ONNX inference, and national/state enforcement dashboards.
- **Mode B: Optional Local Inspection Mode (Secondary Field Resiliency):** Lightweight standalone execution capability running on field laptops (localhost:8000) for officers operating in network-deprived circles. Uses embedded ONNX Runtime CPU inference and local encrypted SQLite (SQLCipher), queueing signed sync bundles for upload when connectivity is restored.
- **Mode C: External Integrations (Future Roadmap):** Future national registry webhooks for eMaap, MCA21, and GSTN verification.

An officer takes photos of a packaged product with a small reference card placed beside it. The system:

1. Verifies image sharpness and checks for glare in < 15 ms.
2. Straightens the image and calculates real-world millimeters from pixels via planar homography.
3. Reads all text in English and Hindi using DBNet++ and PaddleOCR PP-OCRv4 ONNX models.
4. Checks all mandatory declarations (Manufacturer, Net Quantity, MRP, Unit Sale Price, Manufacturing Date, Consumer Care, Country of Origin).
5. Compares font sizes against statutory minimums based on package surface area (dual tolerance: $\le 0.15\text{ mm}$ on planar target; $\le 0.30\text{ mm}$ on retail packs).
6. Presents findings on a side-by-side verification screen for the officer to review.
7. Automatically generates an electronically signed, tamper-evident statutory draft **Inspection Notice** under Section 36(1) of the Legal Metrology Act, 2009, backed by a Digital Evidence Certificate under Section 63 of the **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**, sealed with an Ed25519 officer cryptographic signature and SHA-256 Merkle root.

### Why It Matters

When manufacturers print illegal tiny text, omit customer care details, hide Country of Origin, or display confusing Unit Sale Prices, ordinary consumers are misled or cheated. Our tool cuts inspection time from **8 minutes to 30 seconds per package**, enabling a 10x to 20x increase in market coverage.

### Our Main Innovation

1. **Mathematical Millimeter Accuracy:** Normal photos contain pixels, not millimeters. By placing a known reference card (ArUco marker or ₹5 coin), our software uses **planar homography** (geometry math) to measure physical font heights with sub-0.30 mm accuracy.
2. **Deterministic Legal Rule Engine:** Deep learning reads the text; fixed mathematical and legal rules verify the law. The AI never guesses legal guilt.
3. **Cryptographic Proof Chain:** Every image, measurement, and officer action is sealed into a SHA-256 hash chain so evidence cannot be challenged as tampered in court.

### The Complete System in One Simple Flow

```
CAMERA CAPTURE / UPLOAD (with reference card)
       ↓
IMAGE QUALITY GATE (rejects blur and glare in 10 ms)
       ↓
OPTICAL CALIBRATION (computes real millimeters per pixel)
       ↓
TEXT RECOGNITION (reads English & Hindi text via DBNet++ & PaddleOCR)
       ↓
INFORMATION EXTRACTION (extracts MRP, Net Qty, Dates, Address, Origin)
       ↓
LEGAL RULE ENGINE (applies exact Gazette rules based on pack manufacturing date)
       ↓
OFFICER REVIEW SCREEN (officer inspects highlighted findings & confirms)
       ↓
LEGAL NOTICE & CERTIFICATE (generates signed PDF/A under Section 63 BSA 2023)
       ↓
CENTRAL POSTGRESQL STORAGE (persisted centrally; or cached locally in Mode B)
```

### What the Final Demo Will Show

We will demonstrate our live web portal by uploading/capturing real commercial packaging with intentional legal flaws (banned unit symbol `gms` instead of `g`, sub-statutory font height, and wrong Unit Sale Price math). The system processes the images online, flags quality issues if present, rectifies perspective, detects all three violations with exact millimeter deficits and Gazette citations, lets the officer review side-by-side, and generates a complete statutory Form-1 Legal Notice PDF in seconds. We will also demonstrate how field officers in remote areas can use the local offline inspection mode and sync back seamlessly.

### What Our MVP Is

A production-ready **FastAPI backend** + **React 18 / Vite frontend SPA** running primarily as an online web application, backed by PostgreSQL 16+ and server-side CPU INT8 ONNX models with zero external GPU/cloud API costs. Its **Mode A primary web portal** handles multi-panel package uploads, calibrated optical measurement, Rule 6 and Table-I compliance, dashboard analytics, and court-ready Section 63 BSA 2023 PDF dossiers. Its **Mode B local inspection capability** provides complete operational resilience for field inspectors when network connectivity is lost.

### What the Six Members Are Doing

- **Member 1 (Optics & Metrology):** Camera capture, blur/glare filter, ArUco calibration, millimeter scale calculation.
- **Member 2 (OCR & Vision):** DBNet++ text detection, PaddleOCR text recognition (English + Hindi), server & local ONNX CPU speedup.
- **Member 3 (Extraction & NLP):** Regex parsers for MRP, Net Qty, dates, consumer care, and address PIN code extraction.
- **Member 4 (Rule Engine & Law):** Legal logic for Rule 6, Table-I font schedule, Unit Sale Price math, e-commerce checks, and 4-state verdict triage.
- **Member 5 (Backend, DB & Evidence):** FastAPI application server, PostgreSQL 16+ integration, JWT auth/RBAC, SHA-256 Merkle DAG, Section 63 BSA certificate, ReportLab Form-1 PDF generator.
- **Member 6 (Frontend, Web UX & Integration):** React 18 web SPA, camera/upload HUD, review canvas, central dashboard & history views, Docker packaging, demo runner.

### Deadline

**13 September 2026** (6 days from today, 07 September 2026). Feature complete by **10 September 2026 (Day 4)**.

### 5 Things Every Team Member Must Understand

1. **AI observes; rules verify; the human officer decides.** AI never acts as a judge or issues fines on its own.
2. **A photo has pixels, not millimeters.** We cannot measure physical font size without our reference card. Never claim "AI measures millimeters from any wild photo."
3. **The Indian Evidence Act, 1872 is repealed.** Electronic evidence is now governed exclusively by **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.
4. **E-commerce has different rules.** Under Rule 6(10), e-commerce listings are legally exempt from displaying the month and year of manufacture. Never flag an online listing for missing manufacturing date!
5. **No viral licenses.** Ultralytics YOLO is strictly banned because of its AGPL copyleft license. We use permissive Apache-2.0 and MIT libraries only.

---

## 1. PROJECT AT A GLANCE

```
+----------------------------------------------------------------------------------------------------+
| PARAMETER                    | VALUE / SPECIFICATION                                               |
+----------------------------------------------------------------------------------------------------+
| Problem Statement ID         | SIH26034                                                            |
| Competition                  | Smart India Hackathon 2026                                          |
| Ministry                     | Ministry of Consumer Affairs, Food & Public Distribution            |
| Department                   | Department of Consumer Affairs (DoCA)                               |
| Product Name                 | NyayaDrishti-LM (न्याय दृष्टि - Legal Metrology)                   |
| Team Composition             | 6 Engineering Students (Multidisciplinary Roles)                    |
| Current Date                 | 07 September 2026                                                   |
| Hard Submission Deadline     | 13 September 2026 (23:59 IST)                                       |
| Primary Statutory Act        | Legal Metrology Act, 2009 (Act No. 1 of 2010)                       |
| Primary Statutory Rules      | Legal Metrology (Packaged Commodities) Rules, 2011 (as amended)     |
| Evidentiary Standard         | Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)             |
| Core Pipeline Architecture   | Hybrid Perception-Verification (DL OCR + Deterministic AST Rules)   |
| Hardware & Hosting Target    | Standard 4/8-core Server CPU + Local Laptop CPU (ONNX INT8)         |
| Latency Target               | <= 1800 ms Web Round-Trip (<= 1200 ms Local Engine Latency)         |
| Primary Programming Stack    | React 18 SPA (Vite), FastAPI, PostgreSQL 16+, ONNX Runtime CPU     |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. THE PROBLEM

### What is Legal Metrology?

**Legal Metrology** is the branch of law that regulates weights, measurements, weighing instruments, and packaging declarations used in trade and commerce. Its goal is simple: **ensure consumers get what they pay for and are not deceived by misleading labels or short weights.**

### What are Packaged Commodities?

Any product pre-packed in a wrapper, box, tin, bottle, or pouch before being offered for sale, where the consumer cannot inspect or alter the contents without opening the package. Examples: biscuit packets, milk pouches, edible oil bottles, cosmetic creams, detergent boxes.

### Why Do Package Labels Matter?

Because a consumer cannot open the packet before buying, the label is their **only window into reality**. The law demands that labels clearly state:

- Who made or imported it (so someone is legally accountable).
- Exactly how much is inside (in standard metric units).
- What it costs and what it costs per gram/milliliter (to compare value across brands).
- When it was packed (to know freshness).
- Where to complain if there is a defect.

### What Does the Government Need to Check?

Enforcement officers must check:

1. **Completeness:** Are all mandatory items printed on the package?
2. **Correctness:** Are standard units used (`g`, not illegal `gms`)? Is Unit Sale Price math accurate?
3. **Readability & Font Size:** Are numerals and letters printed large enough for ordinary people to read, according to the official legal height schedule (Table-I)?
4. **Placement:** Is Net Quantity displayed conspicuously on the Principal Display Panel with clear borders?

### Why is Manual Checking Difficult?

Today, an officer must:

- Walk through crowded market alleys and pick up individual packages.
- Measure package dimensions with a physical ruler.
- Calculate the Principal Display Panel (PDP) area ($L \times W$).
- Look up Table-I in a paper rulebook to determine the required font height.
- Hold a magnifying loupe with an etched scale against the text to check letter height.
- Divide Price by Net Quantity using a pocket calculator to verify Unit Sale Price.
- Sit in the shop and handwrite an inspection memo (_panchnama_) in triplicate with two witnesses.
  This takes **5 to 8 minutes per product**. With over 100 million product variants and only ~3,000 inspectors, manual checking covers less than **0.1% of goods**.

### Who Performs Inspection?

- **State Legal Metrology Officers (LMOs) / Inspectors (ILMs):** Field raids, retail checks, issuing seizure memos.
- **Assistant / Deputy Controllers:** Quasi-judicial officers who review memos, hold compounding hearings, and levy fines.

### Why Automation is Useful

Software can ingest package photos, rectify perspective, read all text, verify all legal rules, check the math, and produce a formal inspection memo in **30 seconds**. An officer can inspect 20 packages in the time it used to take to inspect one.

### Problem in One Sentence

> **"The volume of packaged commodities in physical retail and e-commerce massively exceeds the capacity of government inspectors to manually verify mandatory consumer-protection declarations."**

### Real-Life Example

An officer picks up a packet of cookies in a grocery store:

- **What the officer must check manually:**
  1. Is the manufacturer's complete address with PIN code present?
  2. Does Net Quantity say `200 g` or illegal `200 gms`?
  3. Is the box $12\text{ cm} \times 12\text{ cm}$ ($144\text{ cm}^2$)? If so, Table-I requires numerals to be at least $2.5\text{ mm}$ high. Are they?
  4. If MRP is ₹80, is the Unit Sale Price declared as ₹0.40 per g?
  5. Is there a customer care phone number AND email address?
  6. Does it say "Country of Origin: India"?
- **How our software helps:**
  The officer places a small card next to the box and snaps a photo. In 1.2 seconds, the screen highlights the box, shows that the font is only $1.84\text{ mm}$ (a $0.66\text{ mm}$ violation), flags that `gms` was used illegally, flags that customer care email is missing, and drafts a ready-to-sign legal notice citing the exact sections of the law.

---

## 3. WHY THIS PROBLEM MATTERS

1. **Consumer Protection:** Prevents "shrinkflation" (reducing product weight while keeping the box size the same) and deceptive pricing.
2. **Fair Competition:** Honest manufacturers who invest in compliant, legible packaging should not be undercut by rogue manufacturers printing misleading fine print.
3. **Transparency in Trade:** Unit Sale Price allows a consumer to instantly compare whether a 500g cereal pack is actually cheaper per gram than a 250g pack.
4. **Scale of Economic Harm:** Over ₹25 lakh crore ($300 billion) worth of packaged consumer goods are sold in India annually. Unchecked non-compliance harms millions of consumers daily.
5. **Government Administrative Efficiency:** Replaces lost paper dossiers with an immutable digital record system, helping regulators identify repeat corporate offenders across different states.

---

## 4. WHO USES OUR SYSTEM

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       USER PERSONAS                                              │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│ PERSONA                       │ OPERATIONAL CONTEXT           │ KEY CAPABILITIES NEEDED          │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ 1. Field Inspector (LMO/ILM)  │ Market raids, kirana stores,  │ Fast mobile/laptop camera HUD,   │
│                               │ godowns, poor lighting & 4G.  │ instant blur/glare feedback,     │
│                               │                               │ auto-drafted inspection memos.   │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ 2. Adjudicating Controller    │ District headquarters, desk   │ High-resolution review canvas,   │
│                               │ workstation, quasi-judicial.  │ tamper-evident hash audit,       │
│                               │                               │ formal Section 36 notice export. │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ 3. Central DoCA Administrator │ Central Ministry, New Delhi,  │ High-level compliance dashboard, │
│                               │ policy planning.              │ recurring offender tracking,     │
│                               │                               │ eMaap portal interoperability.   │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────────────┤
│ 4. Pre-Compliance Brand User  │ FMCG packaging designer,      │ Pre-print label upload sandbox,  │
│    (Self-Audit Sandbox)       │ regulatory affairs officer.   │ instant compliance scorecard,    │
│                               │                               │ zero access to enforcement logs. │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┘
```

---

## 5. WHAT THE LAW/DOMAIN REQUIRES

The system enforces two primary pieces of legislation:

1. **The Legal Metrology Act, 2009 (Act No. 1 of 2010)** — The parent statute passed by the Parliament of India.
2. **The Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)** — The detailed technical rules framed under Section 52.

### 5.1 The 8 Mandatory Declarations under Rule 6(1)

Every package intended for retail sale must display:

- **Rule 6(1)(a):** Name and complete address of the manufacturer, packer, or importer.
- **Rule 6(1)(aa):** Country of Origin (mandatory on all products since 2017).
- **Rule 6(1)(b):** Generic or common name of the commodity (e.g., "Wheat Flour", "Writing Pen").
- **Rule 6(1)(c):** Net Quantity in standard metric units (`g`, `kg`, `ml`, `l`, `m`, `cm`, `N`, `U`).
- **Rule 6(1)(d):** Month and year of manufacture, packing, or import (`MM/YYYY` or text).
- **Rule 6(1)(e):** Maximum Retail Price (MRP) formatted as: `MRP Rs. XX.XX (inclusive of all taxes)`.
- **Rule 6(1)(f):** Unit Sale Price (USP) per g/ml (for $< 1\text{kg/L}$) or per kg/L (for $\ge 1\text{kg/L}$).
- **Rule 6(1)(g):** Consumer Care contact details: Contact Person/Office, Address, Telephone Number, AND Email Address.

### 5.2 Table-I of Rule 7(2): Minimum Font Height Schedule

Statutory font height is **not** a typographic point size (`12pt`). It is the **physical printed height in millimeters** of numerals and letters, governed by the surface area of the **Principal Display Panel (PDP)**:

$$
\text{Table-I: Minimum Height of Numerals and Letters}
$$

|  Row  | Area of Principal Display Panel ($A$) in $\text{cm}^2$ |                Minimum Height: Normal Packaging ($mm$)                |      Minimum Height: Blown, Formed, Moulded, Perforated ($mm$)      |     |     |     |     |     |     |
| :---: | :----------------------------------------------------- | :-------------------------------------------------------------------: | :-----------------------------------------------------------------: | --- | --- | --- | --- | --- | --- |
| **1** | $A \le 50$                                             |                                **1.0**                                |                               **2.0**                               |     |     |     |     |
| **2** | $50 < A \le 100$                                       |                                **1.5**                                |                               **3.0**                               |     |     |     |     |
| **3** | $100 < A \le 500$                                      | **2.5** (Weight $\le 200\text{g}$) / **4.0** (Weight $> 200\text{g}$) |                               **4.0**                               |     |     |     |     |
| **4** | $500 < A \le 2500$                                     |                                **4.0**                                |                               **6.0**                               |     |     |     |     |
| **5** | $A > 2500$                                             |                                **6.0**                                | **6.0** _(Verified: G.S.R. 629(E) sets this to 6.0 mm, NOT 8.0 mm)_ |     |     |     |     |

- **Stroke Width Rule (Rule 7(3)):** Width of any letter/numeral must be at least **one-third of its height** (except for `1`, `i`, `I`, `l`).
- **Clear Margin Around Net Quantity (Rule 8(2)):** Space surrounding Net Quantity must be at least equal to font height above/below, and twice font height on left/right.

### 5.3 Unit Sale Price (USP) Invariant (G.S.R. 779(E))

$$
\left| (\text{Declared USP} \times \text{Declared Net Quantity}) - \text{Declared MRP} \right| \le \text{₹0.02 (Rounding Tolerance)}
$$

### 5.4 Metric Unit Rules (Section 11 & Rule 12)

Only official SI symbols are permitted:

- **Permitted:** `g`, `kg`, `ml`, `l`, `L`, `m`, `cm`, `mm`, `N`, `U`.
- **Prohibited & Illegal:** `gms`, `gm`, `g.`, `Kgs`, `kilos`, `ML`, `ltrs`, `pieces`.

### 5.5 E-Commerce Mandates: Rule 6(10) & Rule 6(10A)

- **Rule 6(10):** All Rule 6 declarations must be displayed on e-commerce product pages **EXCEPT the month and year of manufacture**. (Statutorily exempt because inventory rotates in fulfillment centers).
- **Rule 6(10A):** Effective **1 July 2026** (G.S.R. 128(E)), all e-commerce platforms must provide structured, searchable, and sortable Country of Origin filters.

### 5.6 The Jan Vishwas (Amendment of Provisions) Act, 2023

Passed by Parliament to promote Ease of Doing Business:

- Imprisonment for second offenses under Section 36(1) was **decriminalized / omitted**.
- Introduced the **Improvement Notice** mechanism: first-time offenders receive an Improvement Notice giving a cure period (usually 14–30 days) before civil compounding penalties apply.

---

## 6. WHAT WE CAN AND CANNOT VERIFY

⭐ **MUST KNOW: This section protects our team from claiming impossible things in front of judges.**

| What We Check                           | Simple Explanation                                    |            Can Software Check It?             | Extra Information Needed?                                                                       |
| :-------------------------------------- | :---------------------------------------------------- | :-------------------------------------------: | :---------------------------------------------------------------------------------------------- |
| **Manufacturer Name & Address**         | Company identity, city, state, postal PIN code        |                    **YES**                    | PIN code regex & NER parsing                                                                    |
| **Country of Origin**                   | "Country of Origin: India" or foreign state           |                    **YES**                    | Standard country list match                                                                     |
| **Net Quantity Syntax**                 | Standard metric symbol (`g`, `kg`, `ml`, `l`)         |                    **YES**                    | Regex validation against banned symbols (`gms`)                                                 |
| **True Physical Weight Inside Box**     | Actual grams of food/liquid inside                    |                    **NO**                     | ❌**Physically impossible from image.** Requires physical weighing scale under Rule 24.         |
| **MRP Declaration & Suffix**            | Currency symbol, number, and "(incl. of all taxes)"   |                    **YES**                    | Regex & fuzzy string matching                                                                   |
| **Unit Sale Price Math**                | Whether$\text{USP} \times \text{NetQty} = \text{MRP}$ |                    **YES**                    | Arithmetic verification engine                                                                  |
| **Manufacturing Date on Physical Pack** | Month and year printed on carton                      |                    **YES**                    | Date parser                                                                                     |
| **Manufacturing Date on E-Commerce**    | Listing webpage on Amazon/Flipkart                    |                **NO (EXEMPT)**                | ⚠️**Rule 6(10) exempts this.** Do not flag!                                                     |
| **Consumer Care Completeness**          | Person, address, phone, and valid email format        |                    **YES**                    | 4-part completeness check                                                                       |
| **Physical Font Height in Millimeters** | Millimeter height of letters under Table-I            | **YES (Calibrated)\*\***NO (Uncalibrated)\*\* | Needs coplanar reference card (ArUco or coin). Without marker: software flags for manual check. |
| **Clear Margin around Net Quantity**    | Free space around Net Quantity declaration            |                    **YES**                    | Bounding box spatial analysis                                                                   |
| **Color Contrast & Readability**        | Contrast of text ink against background               |                  **PARTLY**                   | Luminance contrast ratio ($WCAG \ge 4.5:1$)                                                     |
| **Corporate Legal Existence**           | Whether company actually exists in MCA registry       |                  **PARTLY**                   | Requires external MCA21 / GSTN database API                                                     |
| **Sticker Over-Printing / Tampering**   | Sticker pasted over printed MRP to inflate price      |                  **PARTLY**                   | Detects sticker edge artifact; officer must physically peel.                                    |

### Summary of Boundaries:

- **WE CAN DIRECTLY CHECK:** Presence/absence of text, syntax, banned units, arithmetic consistency, e-commerce disclosures, calibrated font sizes.
- **WE CAN HELP CHECK:** Borderline font heights, low contrast, potential sticker anomalies.
- **WE CANNOT PROVE FROM AN IMAGE ALONE:** Actual mass/volume inside a package, physical glue authenticity, legal MCA status of manufacturer.

---

## 7. OUR SOLUTION IN SIMPLE LANGUAGE

```
STEP 1: CAPTURE PACKAGE
An officer places a small standard reference card (or ₹5 coin) beside the package and snaps a photo.

STEP 2: CHECK IMAGE QUALITY
The system instantly checks if the photo is blurry, dark, or has bright white glare. If bad, it tells the officer how to fix it.

STEP 3: READ THE TEXT
The system straightens any angle distortion, detects every text box, and reads words and numbers in English and Hindi.

STEP 4: UNDERSTAND WHAT EACH PIECE OF TEXT MEANS
The system identifies which number is the MRP, which is the Net Quantity, which block is the address, and where the date is.

STEP 5: CHECK LEGAL RULES
The rule engine compares the extracted facts against the Legal Metrology Rules:
Is the font big enough for this package size? Does USP match MRP? Is customer care complete?

STEP 6: SHOW EVIDENCE TO OFFICER
The screen displays the photo with highlighted color-coded boxes. The officer sees exactly what passed and what failed.

STEP 7: OFFICER REVIEWS & DECIDES
The officer verifies the finding on the screen. The officer can approve or override. AI never issues a fine alone.

STEP 8: GENERATE LEGAL NOTICE
With one click, the system creates an official Section 36(1) Legal Notice PDF and a Section 63 BSA 2023 Digital Evidence Certificate.

STEP 9: SAVE INSPECTION HISTORY
The record is cryptographically hashed and saved in local encrypted storage, ready to sync with the national eMaap portal.
```

---

## 8. COMPLETE SYSTEM FLOW (12-Stage Pipeline)

```
[Camera / Upload] ──> [Stage 1: Hashing] ──> [Stage 2: Quality Gate] ──> [Stage 3: Calibration]
                            │                            │                         │
                            ▼                            ▼                         ▼
[Stage 6: Text Detection] <── [Stage 5: PDP Area] <── [Stage 4: Homography Warp]
       │
       ▼
[Stage 7: OCR Recognition] ──> [Stage 8: Entity Extraction] ──> [Stage 9: Font Measurement]
                                                                        │
                                                                        ▼
[Stage 12: PDF Notice] <── [Stage 11: Human Adjudication] <── [Stage 10: Legal Rule Engine]
```

### Stage-by-Stage Breakdown:

#### Stage 1: Forensic Ingestion & Hashing

- **What happens:** Ingests raw photo bytes and immediately computes a SHA-256 cryptographic hash before any processing.
- **Owner:** Member 5.
- **Input:** Raw image file.
- **Output:** `raw_sha256` string and timestamped provenance node.
- **Failure fallback:** If file is corrupt, returns `400 Bad Request` with clear error message.

#### Stage 2: Optical Quality Gate

- **What happens:** Measures image sharpness using Laplacian variance ($\sigma^2$) and specular glare using HSV color masking ($V > 245, S < 15$).
- **Owner:** Member 1.
- **Input:** Raw RGB image.
- **Output:** `QualityGateResult` (`passed: true/false`, blur score, glare percentage).
- **Failure fallback:** If blurry ($\sigma^2 < 150$) or glare covers $> 3\%$ of label, returns `UNABLE_TO_VERIFY` with user guidance ("Hold steady" or "Tilt camera 15°").

#### Stage 3: Fiducial Calibration & Metric Scale

- **What happens:** Detects the 50 mm ArUco 4x4 marker (or ₹5 coin) and calculates the exact pixel-to-millimeter ratio ($S$).
- **Owner:** Member 1.
- **Input:** Image with reference marker.
- **Output:** `px_to_mm` scale factor and marker corner coordinates.
- **Failure fallback:** If marker is missing, switches to **Uncalibrated Mode**: text rules still execute, but font size checks are routed to `REQUIRES_REVIEW (NO_CALIBRATION_TARGET)`.

#### Stage 4: Homography Perspective Rectification

- **What happens:** Straightens tilted or angled photos using a $3 \times 3$ transformation matrix (`cv2.warpPerspective`) to produce a flat, orthogonal front-facing view.
- **Owner:** Member 1.
- **Input:** Image + detected marker corners.
- **Output:** Rectified, undistorted planar image.
- **Failure fallback:** If tilt $> 35^\circ$, warns officer that angle is too steep for millimeter accuracy.

#### Stage 5: Principal Display Panel (PDP) Calculation

- **What happens:** Detects package outer edges and calculates total surface area in $\text{cm}^2$. Calculates PDP area ($L \times W$ for boxes, or $0.4 \times H \times C$ for cylinders).
- **Owner:** Member 1.
- **Input:** Rectified packaging image + package shape type.
- **Output:** `pdp_area_cm2` and applicable Table-I font row.
- **Failure fallback:** If package boundaries unclear, prompts officer to confirm package dimensions.

#### Stage 6: Multi-Oriented Text Detection

- **What happens:** Locates all text lines and words on the label using **DBNet++**, outputting oriented 4-point bounding polygons.
- **Owner:** Member 2.
- **Input:** Rectified label image.
- **Output:** List of text polygon coordinates.
- **Failure fallback:** Merges overlapping bounding boxes if text spacing is tight.

#### Stage 7: Optical Character Recognition (OCR)

- **What happens:** Reads text inside each polygon using **PaddleOCR PP-OCRv4 (SVTR)** in English and Devanagari Hindi, outputting text strings and confidence scores.
- **Owner:** Member 2.
- **Input:** Cropped text polygon patches.
- **Output:** List of recognized text tokens with confidence values ($0.0$ to $1.0$).
- **Failure fallback:** If confidence $< 0.65$, runs a secondary consensus pass using Tesseract v5.

#### Stage 8: Semantic Entity Classification

- **What happens:** Uses deterministic regex patterns, spatial proximity trees, and Indian postal NER to classify tokens into statutory fields: MRP, Net Quantity, Dates, Address, Country of Origin, Consumer Care.
- **Owner:** Member 3.
- **Input:** OCR text tokens and bounding box coordinates.
- **Output:** `NormalizedCommodityFacts` object.
- **Failure fallback:** If address cannot be fully parsed, flags missing PIN code while preserving recognized entity lines.

#### Stage 9: Physical Font Measurement Engine

- **What happens:** Performs connected-components analysis on binarized text crops of Net Quantity and MRP to isolate letter/numeral x-height in pixels, then multiplies by $S$ (`px_to_mm`) to get real-world millimeters.
- **Owner:** Member 1 & Member 2.
- **Input:** Binarized character patches + metric scale $S$.
- **Output:** `measured_font_height_mm` with uncertainty margin ($\pm 0.08\text{ mm}$).
- **Failure fallback:** If stroke edges are noisy, uses median height across numeral cluster.

#### Stage 10: Deterministic Legal Metrology Rule Evaluation

- **What happens:** Evaluates extracted facts against an Abstract Syntax Tree (AST) of statutory rules. Resolves the product's manufacturing date to the correct historical Gazette epoch. Compares font height to Table-I, checks USP math, checks for banned units (`gms`).
- **Owner:** Member 4.
- **Input:** `NormalizedCommodityFacts` + `measured_font_height_mm`.
- **Output:** List of `ComplianceEvaluation` items with verdicts, measured values, required values, deficits, and Gazette citations.
- **Failure fallback:** If manufacturing date is missing, applies rules effective on date of inspection and flags missing date as a separate violation.

#### Stage 11: Human-in-the-Loop Adjudication Gate

- **What happens:** Displays visual findings on the officer's review screen. The officer reviews highlighted boxes, verifies deficits using the pixel loupe, and clicks "Confirm Violation" or "Override".
- **Owner:** Member 6.
- **Input:** Rule evaluation results + rectified image overlays.
- **Output:** Officer-signed adjudication order with mandatory justification remarks for any overrides.
- **Failure fallback:** Officer can request rescan or enter manual caliper measurement.

#### Stage 12: Evidence Bundler & Notice Generator

- **What happens:** Binds all stage outputs into a SHA-256 Merkle DAG, signs the Section 63 BSA 2023 Digital Evidence Certificate, and compiles an archival Form-1 / Form-2 Legal Notice PDF/A via ReportLab.
- **Owner:** Member 5.
- **Input:** Adjudicated inspection record.
- **Output:** Downloadable, tamper-evident PDF inspection dossier with embedded evidence image crops and verification QR code.
- **Failure fallback:** PDF generation runs locally; if rendering fails, exports structured JSON evidence bag.

---

## 9. WHY OUR SOLUTION IS DIFFERENT

```
+----------------------------------------------------------------------------------------------------+
| FEATURE / CAPABILITY         | TYPICAL HACKATHON PROJECT        | NYAYADRISHTI-LM (OUR SYSTEM)     |
+----------------------------------------------------------------------------------------------------+
| Font Size Measurement        | Guesses from raw pixels (DPI)    | Calibrated Planar Homography     |
|                              | (Scientifically invalid)         | (Real mm via ArUco reference)    |
+----------------------------------------------------------------------------------------------------+
| Legal Compliance Reasoning   | Prompts an LLM (ChatGPT/Gemini)  | Deterministic AST Rule Engine    |
|                              | (Hallucinates, non-reproducible) | (100% reproducible, exact GSR)   |
+----------------------------------------------------------------------------------------------------+
| Model Licensing              | Uses YOLOv8/v11 (AGPL Copyleft)  | DBNet++ & PP-OCRv4 (Apache-2.0)  |
|                              | (Viral license hazard for Govt)  | (Permissive, safe for Govt)      |
+----------------------------------------------------------------------------------------------------+
| Hardware & Network           | Requires cloud GPUs & SaaS APIs  | Server & Local INT8 CPU (ONNX)   |
|                              | (Expensive per-scan SaaS costs)  | (Zero API fees; local fallback)  |
+----------------------------------------------------------------------------------------------------+
| Evidentiary Law              | Cites repealed 1872 Evidence Act | Section 63 BSA 2023 Compliant    |
|                              | (Legally void in court)          | (SHA-256 Merkle DAG certificate) |
+----------------------------------------------------------------------------------------------------+
| Legal Authority Boundary     | Claims AI issues penalties       | AI advises; human officer signs  |
|                              | (Unconstitutional under law)     | (Strictly adheres to admin law)  |
+----------------------------------------------------------------------------------------------------+
| Temporal Non-Retroactivity   | Applies 2026 rules to all goods  | Temporal Epoch Dispatcher        |
|                              | (Illegal under Article 20(1))    | (Matches rules to Mfg Date)      |
+----------------------------------------------------------------------------------------------------+
```

---

## 10. AI / CV / RULES / HUMAN BOUNDARY

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE THREE-TIER SEPARATION OF POWERS                              │
│                                                                                                  │
│   1. COMPUTER VISION OBSERVES       2. RULE ENGINE VERIFIES         3. HUMAN OFFICER DECIDES     │
│   ───────────────────────────       ───────────────────────         ────────────────────────     │
│   • Rectifies perspective           • Evaluates Table-I font math   • Inspects evidence crops    │
│   • Extracts text strings           • Checks USP division math      • Confirms or overrides flags│
│   • Measures letter pixel height    • Checks prohibited units       • Exercises legal authority  │
│   • Computes confidence scores      • Identifies missing clauses    • Signs statutory notice     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Why Large Language Models (LLMs) Must NOT Be Used as Legal Judges

1. **Hallucination:** An LLM can misread `₹48` as `₹40` or invent a non-existent clause.
2. **Indeterminism:** If you feed the exact same image twice with temperature $> 0$, an LLM might say "Compliant" the first time and "Violated" the second time. In a court of law, this is fatal.
3. **Black-Box Opacity:** A magistrate cannot cross-examine the internal weights of a transformer network.
4. **Offline Constraint:** Multi-billion parameter LLMs cannot run in under 1.5 seconds on an ordinary field laptop without expensive GPUs.

---

## 11. MEASUREMENT & FONT-SIZE EXPLAINED

### The Problem in Plain English

A camera photograph contains **pixels**, not real-world **millimeters**.
If you hold a biscuit packet 15 cm away, a letter might be 40 pixels high. If you hold it 30 cm away, the same letter will be only 20 pixels high.
Therefore, **no software can know the physical millimeter height of a letter from a normal photo alone.**

### The Solution: Planar Homography with a Known Reference

To convert pixels into physical millimeters, we place an object of **known physical size** in the same flat plane as the packaging label:

- **Primary Reference:** A 50 mm $\times$ 50 mm square **ArUco fiducial marker** printed on the inspector's official plastic card.
- **Secondary Reference:** A standard Indian **₹5 coin** (official diameter: exactly $23.0\text{ mm}$).

```
[Camera Photo with Tilt] ──> [Detect 4 Corners of ArUco] ──> [Calculate 3x3 Matrix H]
                                                                      │
                                                                      ▼
[Measured Font mm] <── [Letter Height in Pixels x S] <── [Warp to Flat Perpendicular View]
```

1. OpenCV detects the four corners of the ArUco marker in the photo.
2. Because we know the physical marker is exactly $50.0\text{ mm} \times 50.0\text{ mm}$, the algorithm solves the **Planar Homography matrix ($H$)**.
3. The software mathematically straightens the tilted photo into an orthogonal (flat front-facing) view.
4. Across this straightened view, the scale factor is constant:
   $$
   \text{Scale } S = \frac{\text{Known Marker Width (50 mm)}}{\text{Measured Marker Pixels}}
   $$
5. The system measures the pixel height of the printed letter ($h_{\text{px}}$) and multiplies:
   $$
   \text{Physical Height (mm)} = h_{\text{px}} \times S
   $$
6. Benchmarked accuracy: **Dual Tolerance Standard**—Mean Absolute Error (MAE) $\le 0.15\text{ mm}$ on planar synthetic benchmark target (`DS-SYNTH-001`), and $\le 0.30\text{ mm}$ acceptance threshold on real-world retail packaging (`DS-PILOT-050`) compared to physical digital vernier calipers.

### What if the Reference Card is Missing?

The software **never guesses or invents numbers**. If no reference marker is detected, the system:

- Continues to check all text declarations (MRP, Net Quantity, Dates, Address, Origin, USP math).
- Sets font size checks to: `REQUIRES_REVIEW (NO_CALIBRATION_TARGET)`.
- Displays a prompt: _"No reference card detected. Text rules evaluated; font height requires physical caliper measurement."_

---

## 12. RESULT STATES

NyayaDrishti-LM uses **four mutually exclusive statutory states** (never a simplistic binary pass/fail):

```
+----------------------------------------------------------------------------------------------------+
| RESULT STATE             | MEANING                          | WHEN SYSTEM USES IT                  |
+----------------------------------------------------------------------------------------------------+
| 1. VERIFIED_COMPLIANT    | All statutory requirements met   | High OCR confidence (>= 0.85); all   |
|    (PASS)                | with clear physical evidence.    | Rule 6 fields present; font >= min.  |
+----------------------------------------------------------------------------------------------------+
| 2. VIOLATION_FLAG        | Unambiguous statutory violation  | Missing Country of Origin; illegal   |
|    (FAIL)                | detected beyond tolerance.       | unit 'gms'; font deficit > tolerance.|
+----------------------------------------------------------------------------------------------------+
| 3. REQUIRES_REVIEW       | System uncertain; borderline     | Font measurement within uncertainty  |
|    (REVIEW)              | measurement or uncalibrated.     | band (e.g. 2.45mm vs 2.50mm); no card|
+----------------------------------------------------------------------------------------------------+
| 4. UNABLE_TO_VERIFY      | Image quality too degraded for   | Severe blur (Laplacian < 150), glare |
|    (RETAKE)              | legal analysis; no verdict.      | covering text, extreme tilt (> 35°). |
+----------------------------------------------------------------------------------------------------+
```

---

## 13. EVIDENCE & AUDITABILITY

### Why Evidence Matters in Court

When an officer issues an Improvement Notice or seizes non-compliant goods, the manufacturer's lawyers may challenge the inspection in court, alleging:

- _"The officer took a blurry photo and misread our label."_
- _"The image was digitally photoshopped to invent a violation."_
- _"The notice cites repealed legislation."_

### Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)

On **1 July 2024**, the Indian Evidence Act, 1872 was repealed. Section 65B no longer exists.
All electronic records submitted to Indian courts are now governed exclusively by **Section 63 of the BSA 2023**. To satisfy statutory requirements, the electronic record must be accompanied by a formal certificate identifying the device, certifying its lawful operation, and cryptographically proving that contents were not altered.

NyayaDrishti-LM generates the complete Section 63 digital evidence certificate artifact with local monotonic UTC timestamps (`clock_source: LOCAL_DEVICE_MONOTONIC`), device telemetry, and officer Ed25519 cryptographic attestation. Final judicial admissibility remains the prerogative of the court under BSA 2023.

### The SHA-256 Merkle Provenance Chain

NyayaDrishti-LM builds a cryptographic chain linking every step of the inspection:

```
[Raw Photo SHA-256] ──> [Calibration Matrix SHA-256] ──> [Rectified Image SHA-256]
                                                                │
                                                                ▼
[Officer Signature] <── [Rule Verdict SHA-256] <── [OCR Tokens SHA-256]
         │
         ▼
[MERKLE ROOT HASH] ──> Embedded in PDF Header & Verification QR Code
```

If a single pixel of the photo or a single character of the OCR text is altered retroactively, the Merkle root changes completely, instantly exposing tampering.

---

## 14. E-COMMERCE SCOPE

### Physical Packaging vs E-Commerce Listings

The law treats physical retail packages and digital website listings differently:

```
+------------------------------------+----------------------------------+----------------------------------+
| STATUTORY DECLARATION              | PHYSICAL PACKAGING (Rule 6(1))   | E-COMMERCE LISTING (Rule 6(10))  |
+------------------------------------+----------------------------------+----------------------------------+
| Manufacturer / Packer Name         | Mandatory on carton              | Mandatory on webpage             |
| Country of Origin                  | Mandatory on carton              | Mandatory on webpage             |
| Searchable Country of Origin Filter| Not applicable                   | Mandatory from 1 July 2026 (10A) |
| Net Quantity                       | Mandatory with spacing margin    | Mandatory on webpage             |
| Maximum Retail Price (MRP)         | Mandatory (incl. of all taxes)   | Mandatory on webpage             |
| Unit Sale Price (USP)              | Mandatory on pack                | Mandatory alongside MRP          |
| Month & Year of Manufacture/Pack   | MANDATORY ON PACK                | STATUTORILY EXEMPT UNDER 6(10)   |
| Consumer Care Details              | Mandatory full 4-tuple           | Mandatory contact channel        |
+------------------------------------+----------------------------------+----------------------------------+
```

### What We Are Building for E-Commerce (MVP Scope)

1. **Direct Listing URL Ingestion (Mode A Online):** The officer pastes an Amazon, Flipkart, Blinkit, or Zepto product URL. The web backend fetches the page text and audits mandatory Rule 6(10) declarations.
2. **DOM / HTML Snapshot Upload (Mode A & Mode B):** The officer uploads a pre-saved `.html` or `.mhtml` snapshot of a product listing. The system parses the DOM structure and checks compliance without external HTTP requests.
3. **Listing Screenshot / Image Analysis (Mode A & Mode B):** The officer uploads screenshots of the listing page and product gallery. The system runs OCR and Rule 6(10) checks directly on the uploaded images.
4. **Cross-Channel Discrepancy Check (Mode A & Mode B):** Compares webpage text claims against the OCR text read from the gallery packaging image (e.g., webpage claims `Net Qty: 200g`, but the packaging image says `150g`).

### What We Are NOT Building: Mass Automated Web Crawlers

We do **not** build automated web scraping spiders that crawl millions of Amazon pages daily.

- _Why:_ Commercial platforms use Cloudflare and Akamai to block scrapers with IP bans and CAPTCHAs. Building scrapers violates platform Terms of Service and diverts time from the core metrology scanning problem.

---

## 15. DATA STRATEGY

### The Core Data Reality

**No public dataset exists anywhere in the world that provides packaging photos paired with millimeter caliper ground-truth measurements under Indian Legal Metrology law.**

### Our Two-Track Data Architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   THE DUAL-TRACK DATA STRATEGY                                   │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ TRACK A: SYNTHETIC DATASET (DS-SYNTH-001)       │ TRACK B: PHYSICAL PILOT DATASET (DS-PILOT-050) │
├─────────────────────────────────────────────────┼────────────────────────────────────────────────┤
│ • 2,000 programmatically generated vector labels│ • 50 real Indian commercial FMCG packages      │
│ • Exact mathematical millimeter typography      │   purchased from local retail markets          │
│ • Known PDP areas: 20 to 3,000 cm²              │ • Categories: snacks, drinks, cosmetics, soaps │
│ • Known font heights: 1.0 mm to 8.0 mm          │ • Ground truth measured with digital vernier   │
│ • Synthesized noise, tilt (0-30°), glare, blur  │   calipers (+/- 0.02 mm) under optical loupe   │
│ • Used for: Algorithm verification & testing    │ • Used for: Final acceptance benchmarking      │
└─────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

### Why Synthetic Data is NOT Real-World Proof

Synthetic data proves that our code works when math is clean. It does **not** prove that our system works on a crushed potato-chip bag under yellow shop lighting. That is why the **50 physical pilot packages (DS-PILOT-050)** are mandatory for live demonstration.

### Filtered Public Datasets Used:

- **Bharat Scene Text Dataset (BSTD):** Used to validate Devanagari Hindi scene text recognition.
- **IndicSTR12:** Used for word-level Indic OCR testing.

---

## 16. FINAL TECH STACK

All technology choices are **FROZEN** under formal Architecture Decision Records (ADRs):

| Component                  | Selected Technology                 | Why We Use It                                                             | Owner |
| :------------------------- | :---------------------------------- | :------------------------------------------------------------------------ | :---: |
| **Backend Framework**      | **Python 3.11+ with FastAPI**       | Fast async execution, automatic OpenAPI 3.1 docs, native CV ecosystem     | M1-M5 |
| **Data Contracts**         | **Pydantic v2**                     | Rust-compiled strict typing; eliminates data coercion bugs                | M3-M4 |
| **Frontend Framework**     | **React 18+ with Vite & Tailwind**  | Instant HMR, lightweight bundle, responsive canvas for loupe tool         |  M6   |
| **Computer Vision Engine** | **OpenCV 4.9+ (Apache-2.0)**        | Direct Linear Transform homography, ArUco fiducials, Canny edge detection |  M1   |
| **Text Detection**         | **DBNet++ (Apache-2.0)**            | Real-time multi-oriented polygon text detection; avoids AGPL YOLO         |  M2   |
| **Text Recognition (OCR)** | **PaddleOCR PP-OCRv4 (Apache-2.0)** | SOTA scene text accuracy for English + Devanagari Hindi; 38 MB footprint  |  M2   |
| **OCR Consensus Fallback** | **Tesseract v5 (Apache-2.0)**       | Secondary confirmation on low-confidence cropped text fields              |  M2   |
| **Edge Optimization**      | **ONNX Runtime INT8 (CPU)**         | Quantized CPU execution; achieves$< 1200\text{ ms}$ latency without GPU   | M1-M2 |
| **Legal Rule Engine**      | **Custom Python AST Engine**        | 100% deterministic boolean logic; zero hallucination; temporal routing    |  M4   |
| **Local Database**         | **SQLite 3.45+ with SQLCipher**     | Single-file zero-config database with AES-256 encryption at rest          |  M6   |
| **Cloud Database (Prod)**  | **PostgreSQL 16+ with pgcrypto**    | High-concurrency multi-district production scaling                        |  M6   |
| **Notice & Evidence PDF**  | **ReportLab (BSD License)**         | Precise millimeter layout control for Form-1 notices & BSA certs          |  M5   |
| **Cryptographic Hashing**  | **Python `hashlib` (SHA-256)**      | Immutable Merkle DAG provenance chains under Section 63 BSA 2023          |  M5   |

---

## 17. FINAL ARCHITECTURE (Modular Monolith)

We intentionally reject microservices. The entire application runs as a **Modular Monolith** inside a single FastAPI process:

- No Kafka queues.
- No Docker-in-Docker complexity during field use.
- Instant startup on any student laptop via:
  ```bash
  uvicorn server.main:app --port 8000
  npm run dev --prefix client
  ```

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MODULAR MONOLITH ARCHITECTURE                                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PRESENTATION LAYER: React 18 SPA (Viewfinder HUD, Pan/Zoom Canvas, Review Ledger, Notice Modal)  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER (FastAPI): Auth Middleware ──> Pipeline Orchestrator ──> Event Bus             │
│   ├── modules/quality_gate     (Blur, Glare, Skew)                                               │
│   ├── modules/metrology        (ArUco, Homography, Scale S, PDP Area, Font Height Engine)        │
│   ├── modules/perception       (DBNet++ Detection, PP-OCRv4 Recognition, ONNX Runtime INT8)      │
│   ├── modules/extractor        (Regex Parsers, Spatial K-D Tree, Address NER, Numeral Normalizer)│
│   ├── modules/rule_engine      (AST Legal Predicates, Temporal Epoch Router, 4-State Triage)     │
│   └── modules/evidence         (SHA-256 Merkle DAG, Section 63 BSA Cert, ReportLab PDF Notice)  │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PERSISTENCE LAYER: SQLite 3.45+ with SQLCipher (Local) / PostgreSQL 16+ (Cloud Production)       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 18. DATABASE

The database schema uses an **Abstract Dialect Pattern** (runs seamlessly on SQLite locally and PostgreSQL in production):

```
+----------------------------------------------------------------------------------------------------+
| TABLE NAME              | PURPOSE & CONTENTS                                                       |
+----------------------------------------------------------------------------------------------------+
| 1. `jurisdictions`      | State, district, and circle offices (e.g. DL-South, MH-Mumbai).           |
| 2. `users`              | Officer accounts, badge numbers, hashed passwords, assigned roles.       |
| 3. `inspections`        | Master inspection sessions: product, brand, timestamp, overall status.   |
| 4. `evidence_images`    | Ingested photos, raw SHA-256 hashes, px_to_mm scale, blur/glare metrics.|
| 5. `bounding_boxes`     | Detected text polygon coordinates, OCR strings, measured font heights.   |
| 6. `compliance_evals`   | Rule engine findings: rule code, status (PASS/FAIL), measured vs req mm. |
| 7. `bsa_certificates`   | Section 63 BSA electronic certificates, device metadata, Merkle roots.   |
| 8. `legal_notices`      | Form-1/2 notices, reference numbers, compounding amounts, PDF paths.     |
| 9. `audit_logs`         | Append-only Merkle ledger recording every officer action and hash chain. |
+----------------------------------------------------------------------------------------------------+
```

---

## 19. API / INTERFACES

### Core REST Endpoints:

- `POST /api/v1/auth/login` — Officer authentication; returns JWT.
- `POST /api/v1/inspections/upload` — Ingests raw photo + metadata; returns image ID and quality check.
- `POST /api/v1/inspections/ecommerce` — Ingests product URL or DOM snapshot.
- `POST /api/v1/pipeline/execute/{image_id}` — Runs 12-stage pipeline; returns extracted fields & rule findings.
- `PATCH /api/v1/inspections/{id}/adjudicate` — Officer confirms or overrides findings with mandatory remarks.
- `POST /api/v1/notices/generate` — Generates Form-1 Legal Notice and Section 63 BSA certificate.
- `GET  /api/v1/notices/{id}/pdf` — Downloads signed PDF/A document.

### Sample Pipeline Response (`/api/v1/pipeline/execute/{image_id}`):

```json
{
  "inspection_id": "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094",
  "execution_time_ms": 842,
  "calibration": {
    "method": "ARUCO_4X4_50",
    "px_to_mm": 12.45
  },
  "principal_display_panel": {
    "pdp_area_cm2": 144.0,
    "table_1_required_font_mm": 2.5
  },
  "extracted_fields": [
    {
      "field_type": "NET_QUANTITY",
      "raw_text": "Net Wt: 200 gms",
      "measured_font_height_mm": 1.84,
      "confidence": 0.96
    },
    {
      "field_type": "MRP",
      "raw_text": "MRP Rs. 80.00 (incl. of all taxes)",
      "amount": 80.0
    }
  ],
  "rule_evaluations": [
    {
      "rule_code": "RULE_12_BANNED_UNITS",
      "status": "FAIL",
      "statutory_reference": "Section 11 & Rule 12",
      "discrepancy": "Illegal unit 'gms' used instead of statutory 'g'"
    },
    {
      "rule_code": "TABLE_1_FONT_HEIGHT",
      "status": "FAIL",
      "statutory_reference": "Rule 7(2), Table-I, Row 3",
      "required": ">= 2.50 mm",
      "measured": "1.84 mm",
      "discrepancy": "Deficit of 0.66 mm (-26.4%)"
    }
  ],
  "overall_verdict": "FAIL"
}
```

---

## 20. USER INTERFACE (6 Screens)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SCREEN NAVIGATION FLOW                                        │
│                                                                                                  │
│   [1. Dashboard] ───────────┬───> [2. Inspector Capture HUD] (Field Mobile/Tablet)               │
│                             │                  │                                                 │
│                             ├───> [4. E-Commerce Auditor] (Web URL / DOM)                        │
│                             │                  │                                                 │
│                             │                  ▼                                                 │
│                             └───> [3. Adjudication Canvas] (Side-by-Side Review)                 │
│                                                │                                                 │
│                                                ▼                                                 │
│                                   [5. Legal Notice Generator]                                    │
│                                                │                                                 │
│                                                ▼                                                 │
│                                   [6. Admin Diagnostics Console]                                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Executive Dashboard (`/dashboard`):** Real-time inspection counts, compliance rate gauges, violation category charts, and quick-search table.
2. **Inspector Capture HUD (`/capture`):** Full-screen mobile viewfinder with ArUco alignment box, tilt gyro indicator (turns green when level), and real-time glare warning toasts.
3. **Adjudication Canvas (`/inspect/:id`):** Dual-pane interface. Left: High-resolution zoomable image with color-coded bounding boxes and pixel loupe showing millimeters. Right: Rule ledger showing exact measured deficits.
4. **E-Commerce Auditor (`/ecommerce`):** URL paste input, DOM snapshot uploader, Rule 6(10) declaration checklist, and cross-reference widget comparing website claims against packaging images.
5. **Legal Notice Generator (`/notice/:id`):** Form-1 / Form-2 interactive preview, pre-filled statutory contraventions, embedded evidence image crops, and one-click signed PDF export.
6. **Admin Diagnostics Console (`/admin`):** Pipeline latency breakdown chart (ms per stage), detection confidence sliders, and database maintenance tools.

---

## 21. SECURITY

- **Role-Based Access Control (RBAC):** Inspectors can capture and draft memos; only Controllers can approve formal notices; Central Admins have read-only macro views.
- **Local Encryption at Rest:** Field databases use **SQLCipher (AES-256)** encryption. If an inspector's tablet is lost or stolen, commercial evidence remains protected.
- **Section 63 BSA Tamper-Proofing:** Every action appends to an immutable SHA-256 Merkle tree. Any file modification breaks the hash chain immediately.
- **Zero Cloud Leakage:** All inference executes locally on device. Data syncs to the central ministry server only over encrypted TLS 1.3 when connected to official networks.

---

## 22. FINAL MVP (MoSCoW Prioritization)

```
+----------------------------------------------------------------------------------------------------+
| MUST-HAVE (P0) - FROZEN           | SHOULD-HAVE (P1) - STRETCH       | WON'T-HAVE (P3) - CUT LIST  |
+----------------------------------------------------------------------------------------------------+
| 1. Optical Quality Gate (Blur/Glare)| 1. Batch CSV URL upload queue    | 1. Mass web scraping        |
| 2. ArUco Homography Scale ($S$)   | 2. EAN-13 Barcode scanner        | 2. Autonomous penalty issue |
| 3. DBNet++ & PP-OCRv4 on CPU      | 3. Devanagari Hindi OCR testing  | 3. Weighing package mass    |
| 4. Rule 6 & Table-I Rule Engine   |                                  | 4. AGPL YOLO models         |
| 5. Adjudication Canvas (Side/Side)|                                  | 5. FSSAI / Food testing     |
| 6. Form-1 PDF Notice Generator    |                                  | 6. Blockchain ledger        |
| 7. Section 63 BSA Certificate     |                                  | 7. Commercial cloud APIs    |
| 8. Single E-Com URL/Image checker |                                  |                             |
| 9. SQLite Encrypted Local DB      |                                  |                             |
+----------------------------------------------------------------------------------------------------+
```

### If We Fall Behind Schedule:

1. Cut Batch CSV upload (P1).
2. Cut EAN-13 barcode parsing (P1).
3. Focus 100% on the core **P0 pipeline** (Image Ingestion $\rightarrow$ Scale $\rightarrow$ OCR $\rightarrow$ Rules $\rightarrow$ Adjudication Canvas $\rightarrow$ PDF Notice).

---

## 23. WHAT WE ARE NOT BUILDING

1. **We are NOT building an Autonomous Judge:** AI does not issue fines or prosecute. The human officer signs every notice.
2. **We are NOT building a Mass Web Scraper:** No crawling millions of Amazon/Flipkart listings. We inspect targeted URLs and uploaded screenshots.
3. **We are NOT building a Digital Weighing Scale:** Software cannot weigh physical goods from a photo.
4. **We are NOT building an FSSAI Food Safety Tool:** We do not check ingredients, calories, or organic claims. We enforce Legal Metrology (net quantity, MRP, units, dates, origin, font size).
5. **We are NOT using Blockchain:** A SHA-256 Merkle DAG satisfies Section 63 BSA 2023 with zero overhead.
6. **We are NOT using Closed Commercial APIs:** Zero dependence on Google Cloud Vision or AWS Rekognition.
7. **We are NOT building Full 3D Cylindrical Mesh Unwrapping:** We measure font height along the vertical unwarped axis of bottles and cans.

---

## 24. SIX-MEMBER TEAM PLAN

```
+----------------------------------------------------------------------------------------------------+
| MEMBER & ROLE        | MAIN RESPONSIBILITY & DELIVERABLES                                          |
+----------------------------------------------------------------------------------------------------+
| MEMBER 1             | Optics, Calibration & Metrology                                             |
|                      | • Ingestion quality gate (blur/glare detection)                             |
|                      | • ArUco & coin planar homography scale engine                               |
|                      | • Principal Display Panel (PDP) surface area calculator                     |
|                      | • Connected-components font x-height physical measurement                   |
|                      | Delivers: `core/quality_gate/` and `core/homography/` modules                |
+----------------------------------------------------------------------------------------------------+
| MEMBER 2             | Deep Learning & OCR Pipeline                                                |
|                      | • DBNet++ multi-oriented text polygon detection                             |
|                      | • PaddleOCR PP-OCRv4 text recognition (English + Hindi)                     |
|                      | • Tesseract v5 secondary consensus fallback                                 |
|                      | • ONNX Runtime INT8 CPU quantization & performance tuning                   |
|                      | Delivers: `core/ocr_engine/` module with benchmark scripts                  |
+----------------------------------------------------------------------------------------------------+
| MEMBER 3             | Extraction & NLP Parsing                                                    |
|                      | • Regex token normalizer (MRP, Net Qty, Dates, USP)                         |
|                      | • Prohibited metric unit detector (flags 'gms', 'ML')                       |
|                      | • 2D spatial proximity graph (K-D tree) for key-value association           |
|                      | • Indian postal address segmenter & PIN code verifier                       |
|                      | • Consumer Care 4-tuple completeness checker                                |
|                      | Delivers: `core/extractor/` module with unit test suite                     |
+----------------------------------------------------------------------------------------------------+
| MEMBER 4             | Statutory Logic & Legal Rule Engine                                         |
|                      | • Immutable JSON rule snapshots (2011 Base, 2017 Font, 2021 USP, 2023 JV)   |
|                      | • Temporal Statutory Epoch Dispatcher (by Mfg Date)                         |
|                      | • Table-I font-height evaluator & Net Qty clearance checker                 |
|                      | • Unit Sale Price arithmetic verifier (|USP*Qty - MRP| <= 0.02)              |
|                      | • 4-State Epistemic Verdict Triage (PASS/FAIL/REVIEW/UNABLE_TO_VERIFY)      |
|                      | Delivers: `core/rule_engine/` module & statutory test suites                |
+----------------------------------------------------------------------------------------------------+
| MEMBER 5             | Security, Cryptography & Notice Generator                                   |
|                      | • SHA-256 Merkle DAG provenance graph                                       |
|                      | • Section 63 BSA 2023 Electronic Evidence Certificate generator             |
|                      | • ReportLab Form-1 / Form-2 Legal Notice PDF/A generator                    |
|                      | • Monotonic hardware clock, nullable GPS with circle fallback & Ed25519     |
|                      | Delivers: `core/evidence/` module & PDF generation engine                   |
+----------------------------------------------------------------------------------------------------+
| MEMBER 6             | Frontend, Integration & Demo Orchestration                                  |
|                      | • React 18 + Vite UI (Dashboard, Capture HUD, Adjudication Canvas)          |
|                      | • Real-time camera viewfinder with blur/glare HUD guidance                  |
|                      | • Interactive pixel loupe tool with real-time millimeter readout            |
|                      | • Local encrypted SQLite database integration                               |
|                      | • 50-package physical pilot evaluation & demo launch scripts                 |
|                      | Delivers: `client/` frontend application & full system packaging            |
+----------------------------------------------------------------------------------------------------+
```

---

## 25. HOW WE WORK IN PARALLEL

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               CONTRACT-FIRST PARALLEL WORKFLOW                                   │
│                                                                                                  │
│   Day 1: All 6 agree on DTO JSON schemas (API Contracts)                                         │
│          │                                                                                       │
│          ├──> Member 1 builds Homography using sample tilted photos                              │
│          ├──> Member 2 builds OCR pipeline using cropped image patches                           │
│          ├──> Member 3 builds Regex Parsers using raw OCR JSON mocks                             │
│          ├──> Member 4 builds AST Rule Engine using normalized fact JSON mocks                   │
│          ├──> Member 5 builds PDF Notice Generator using rule finding JSON mocks                 │
│          └──> Member 6 builds React UI components using static API mocks                         │
│          │                                                                                       │
│   Day 4: Integration Checkpoint: Connect modules together (Contracts already match!)             │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

**The Golden Rule:** You do **NOT** wait for another member to finish their code before starting yours.

- Use the agreed JSON schemas in `07_API_AND_INTERFACE_CONTRACTS.md`.
- Test your code against mock data fixtures.
- When we connect on Day 4, the pieces fit together seamlessly.

---

## 26. GITHUB WORKFLOW

- **Repository:** `sih26034-nyayadrishti`
- **Main Branch (`main`):** Demo-safe, production code. Pushing directly to `main` is strictly forbidden.
- **Development Branch (`dev`):** Integration branch. All features merge here first.
- **Feature Branches:** Named as `feat/m<number>-<name>` (e.g., `feat/m1-homography`, `feat/m4-rule-engine`).
- **Pull Request (PR) Policy:**
  - Must solve a specific requirement ID.
  - Must pass all local unit tests.
  - Must be reviewed by at least one other team member.
  - Zero AGPL-3.0 dependencies permitted.

---

## 27. DEFINITION OF DONE (DoD)

A task or feature is **DONE** if and only if:

$$
\text{Code} + \text{Unit Tests} + \text{Schema Conformance} + \text{Latency Check} + \text{Docs} = \mathbf{DONE}
$$

1. **Schema Match:** Output strictly matches the JSON contract in `07_API_AND_INTERFACE_CONTRACTS.md`.
2. **Unit Tested:** Passes unit tests with $> 85\%$ test coverage on logic.
3. **Speed Budget:** Runs on laptop CPU within its allocated latency budget.
4. **No Crashes:** Handles invalid or corrupted inputs gracefully without crashing.
5. **Integrated:** Connected to the central test runner.

---

## 28. TESTING & VALIDATION

### The 4-Tier Test Pyramid:

- **Tier 1 (Unit):** Regex syntax, rule boolean predicates, USP floating-point math.
- **Tier 2 (Metrology):** ArUco scale derivation and font height vs. vernier caliper ground truth.
- **Tier 3 (Integration):** Multi-stage pipeline flow, quality gate rejection, latency budget.
- **Tier 4 (Physical Pilot Acceptance):** Running the complete system on all **50 real-world FMCG pilot packages** (DS-PILOT-050).

### Key Acceptance Benchmarks:

- Font measurement Mean Absolute Error (MAE): Dual Standard—$\le 0.15\text{ mm}$ on planar target (`DS-SYNTH-001`); $\le 0.30\text{ mm}$ on retail packs (`DS-PILOT-050`).
- OCR Character Error Rate (CER): $\le 2.5\%$ on clear printed text.
- Rule Engine False Positive Rate (falsely accusing a compliant pack): **$0.0\%$**.
- Total Pipeline Latency: **$< 1200\text{ ms}$** on 8-core CPU.

---

## 29. PERFORMANCE & SUCCESS METRICS

```
+----------------------------------------------------------------------------------------------------+
| METRIC CATEGORY             | SPECIFIC METRIC                | TARGET VALUE                        |
+----------------------------------------------------------------------------------------------------+
| Model & Vision Metrics      | Character Error Rate (CER)     | <= 2.5% on clean statutory text     |
|                             | Bounding Box IoU               | >= 92.0% on text clusters           |
|                             | Font Measurement Error (MAE)   | <= 0.15 mm (Planar) / <= 0.30 mm (Retail)|
+----------------------------------------------------------------------------------------------------+
| System Performance Metrics  | End-to-End Latency             | <= 1200 ms on 8-core CPU            |
|                             | RAM Footprint                  | <= 800 MB total resident memory     |
|                             | Offline Availability           | 100% Core Pipeline (0 bytes net)    |
+----------------------------------------------------------------------------------------------------+
| Legal & Enforcement Metrics | Rule Statutory Traceability    | 100% (Every finding cites Gazette)  |
|                             | False Accusation Rate          | 0.0% (Zero autonomous false notices)|
|                             | Section 63 BSA Tech Integrity  | 100% (Cryptographic Merkle DAG)     |
+----------------------------------------------------------------------------------------------------+
| Workflow Efficiency Metrics | Inspection Cycle Time          | < 45 seconds (down from 8 minutes)  |
|                             | Notice Generation Speed        | < 2 seconds for complete PDF/A      |
+----------------------------------------------------------------------------------------------------+
```

---

## 30. TOP RISKS & RED-TEAM MITIGATIONS

```
+----------------------------------------------------------------------------------------------------+
| RISK & THREAT               | WHY IT HAPPENS             | HOW WE DETECT IT  | CONTINGENCY PROTOCOL|
+----------------------------------------------------------------------------------------------------+
| TR-01: Scale Ambiguity      | Photo taken without marker | ArUco detection   | Protocol ALPHA:     |
| (Attempting mm without card)| or placed out-of-plane.    | returns null.     | Switch to uncalibrated; |
|                             |                            |                   | evaluate text rules;|
|                             |                            |                   | flag font for caliper.|
+----------------------------------------------------------------------------------------------------+
| TR-02: Specular Glare       | Shiny metallic pouches     | HSV saturation on | Protocol BETA:      |
| (Foil reflection blocks OCR)| reflect ceiling lights.    | text crop > 3%.   | Red warning toast;  |
|                             |                            |                   | prompt tilt camera  |
|                             |                            |                   | 15°; multi-angle merge.|
+----------------------------------------------------------------------------------------------------+
| TR-03: Retroactive Law      | Older 2021 package judged  | Mfg Date parser   | Dynamic epoch router|
| (Wrongful penalization)     | by 2026 rules.             | resolves date.    | applies historical  |
|                             |                            |                   | rule snapshot.      |
+----------------------------------------------------------------------------------------------------+
| TR-04: Dot-Matrix Misread   | Inkjet expiry/MRP dots     | Low confidence on | Protocol GAMMA:     |
| (₹48 misread as ₹40)        | are fragmented.            | numeral tokens.   | Morphological filter;|
|                             |                            |                   | prompt officer confirm.|
+----------------------------------------------------------------------------------------------------+
| TR-05: AGPL Contamination   | Accidental use of YOLO.    | Pre-commit CI     | Strictly banned.    |
|                             |                            | license scanner.  | Use Apache DBNet++. |
+----------------------------------------------------------------------------------------------------+
| TR-06: Network Blackout     | Field inspection in        | Ping timeout /    | Resilient Mode B    |
|                             | remote circle or basement. | offline flag.     | local engine; sync. |
+----------------------------------------------------------------------------------------------------+
| TR-07: Court Inadmissibility| Evidence challenged as     | Merkle DAG audit  | Section 63 BSA cert |
|                             | unverified hearsay.        | verification.     | + Ed25519 signature.|
+----------------------------------------------------------------------------------------------------+
| TR-08: E-Com Anti-Bot Block | Scraper blocked by         | HTTP 403 / 429    | No mass crawling;   |
|                             | Cloudflare / Akamai.       | CAPTCHA page.     | direct URL / DOM /  |
|                             |                            |                   | screenshot upload.  |
+----------------------------------------------------------------------------------------------------+
| TR-09: Cylindrical Distortion| Can curvature compresses   | Aspect ratio      | Measure along unwarped|
|                             | text horizontally.         | check on can.     | vertical axis only. |
+----------------------------------------------------------------------------------------------------+
| TR-10: Live Demo Crash      | Hardware camera glitch on  | Video stream check| Tier 2 backup stream|
|                             | podium during judging.     |                   | or Tier 3 static pack.|
+----------------------------------------------------------------------------------------------------+
| TR-11: Clock/GPS Blackout   | Indoor godowns lack GPS;   | Geolocation null/ | Monotonic UTC clock;|
|                             | laptop hardware lacks GPS. | clock skew detected| administrative circle|
|                             |                            |                   | dropdown fallback.  |
+----------------------------------------------------------------------------------------------------+
```

---

## 31. DEMO PLAN

### The 3-Tier Demo Architecture

1. **Tier 1 (Live Primary):** Live physical camera capture of real biscuit/snack boxes on the judging podium with ArUco reference card.
2. **Tier 2 (Simulated Video Backup):** Pre-recorded high-resolution video stream feeding into the live pipeline, immune to podium lighting glare.
3. **Tier 3 (Emergency Golden Static):** 5 pre-computed golden inspection records with pre-generated Section 63 BSA PDF dossiers loaded in the local database.

### The 3-Minute Live Judging Pitch Script

- **0:00 - 1:00 (Leader):** Hold up real packaging. Explain the 8-minute manual inspection bottleneck and the scientific impossibility of measuring millimeters without a scale reference. Introduce NyayaDrishti-LM.
- **1:00 - 2:00 (Members 1 & 6):** Snap live photo with ArUco card. Show quality gate passing, ArUco detection, and live pipeline execution. Show detected violations: font deficit, banned `gms`, and USP math error.
- **2:00 - 3:00 (Members 4 & 5):** Show officer review canvas. Explain why AI does not issue fines alone. Click "Confirm", show instant Section 63 BSA Merkle DAG generation, and display the official Form-1 Legal Notice PDF.

### 5 Golden Test Packages for Demonstration:

1. `SKU-DEMO-01` (Biscuit Box): Font height violation ($1.84\text{ mm}$ vs $2.50\text{ mm}$) + Banned unit `gms`.
2. `SKU-DEMO-02` (Curry Pouch): USP math mismatch + Missing customer care email.
3. `SKU-DEMO-03` (Water Bottle): Fully compliant packaging (Clean `PASS` across all clauses).
4. `SKU-DEMO-04` (Soap Box): Borderline font height ($2.46\text{ mm}$ vs $2.50\text{ mm}$) triggering `REQUIRES_REVIEW`.
5. `SKU-DEMO-05` (Chips Pouch): Harsh glare triggering `UNABLE_TO_VERIFY` and recovery advice.

---

## 32. JUDGE QUESTIONS (Cheat Sheet)

### Legal Domain Questions:

- **Q: How do you know what font height is legally required?**
  - _Answer:_ "We calculate the Principal Display Panel (PDP) surface area first. Under Table-I of Rule 7(2), a PDP area of $100\text{ to }500\text{ cm}^2$ mandates a minimum numeral height of $2.5\text{ mm}$ for packs $\le 200\text{g}$, and $4.0\text{ mm}$ for packs $> 200\text{g}$."
  - _What NOT to say:_ Never say "Our AI classified it as small font."
- **Q: Does your system issue automated penalties?**
  - _Answer:_ "No. Under Indian administrative law and Sections 15 & 36 of the Act, statutory power rests exclusively with appointed human officers. Our software is an investigative decision-support tool that prepares draft inspection memos for the officer's sign-off."
- **Q: What about Section 65B of the Evidence Act?**
  - _Answer:_ "Section 65B was repealed on 1 July 2024. Our system generates digital certificates compliant with **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**, using SHA-256 Merkle hash chaining."

### Technical & AI Questions:

- **Q: How can you measure millimeters from a smartphone photo?**
  - _Answer:_ "We do not measure uncalibrated photos because projective geometry makes that mathematically impossible. We place a coplanar reference target (ArUco marker or ₹5 coin) of known size in the frame and solve the planar homography matrix $H$, establishing an exact $\text{mm/pixel}$ scale."
- **Q: Why not use GPT-4o or Gemini to inspect the label?**
  - _Answer:_ "Large Language Models are non-deterministic, hallucinate numbers, cannot measure physical geometry, and cannot run offline in rural wholesale markets. We use a hybrid architecture: deep learning observes text, deterministic rules verify the law."
- **Q: What happens if an image is blurry or has glare?**
  - _Answer:_ "Our optical quality gate rejects frames where blur variance is $< 150$ or glare covers $> 3\%$ of the label, returning `UNABLE_TO_VERIFY` and instructing the officer to tilt the camera."

---

## 33. CLAIMS WE MUST NEVER MAKE (The Blacklist)

⭐ **MUST KNOW: Any team member who makes these claims during judging will hurt the team's credibility.**

1. ❌ **NEVER SAY:** _"Our AI measures font millimeters directly from any normal photo."_
   - ✅ **SAY INSTEAD:** _"We derive physical millimeter scale using planar homography anchored to a coplanar reference target of known dimensions (ArUco marker or ₹5 coin)."_
2. ❌ **NEVER SAY:** _"Our AI acts as a judge and automatically fines the shopkeeper."_
   - ✅ **SAY INSTEAD:** _"NyayaDrishti-LM is an investigative decision-support tool that drafts statutory notices; final legal sign-off rests with the authorized officer."_
3. ❌ **NEVER SAY:** _"Our software detects if the package has less weight inside than declared."_
   - ✅ **SAY INSTEAD:** _"A camera sees surface ink, not mass. Short-weight detection requires physical weighing under Rule 24, which our workflow prompts when Net Quantity syntax is verified."_
4. ❌ **NEVER SAY:** _"All products on Amazon must declare manufacturing date."_
   - ✅ **SAY INSTEAD:** _"Rule 6(10) explicitly exempts e-commerce listings from declaring the month and year of manufacture."_
5. ❌ **NEVER SAY:** _"We trained our own foundation AI model from scratch."_
   - ✅ **SAY INSTEAD:** _"We fine-tuned and quantized proven open-source architectures (DBNet++ and PaddleOCR PP-OCRv4) to run on CPU via ONNX Runtime."_
6. ❌ **NEVER SAY:** _"We scrape millions of Amazon products daily."_
   - ✅ **SAY INSTEAD:** _"Our e-commerce module audits single URLs, DOM snapshots, or uploaded listing screenshots provided by officers for targeted scrutiny."_
7. ❌ **NEVER SAY:** _"Table-I Row 5 requires 8.0 mm font for blown bottles."_
   - ✅ **SAY INSTEAD:** _"Gazette Notification G.S.R. 629(E) sets Row 5 at 6.0 mm for both normal and blown containers."_
8. ❌ **NEVER SAY:** _"Our report is guaranteed to win in court or legally infallible."_
   - ✅ **SAY INSTEAD:** _"We produce tamper-evident electronic evidence structured under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 with SHA-256 Merkle root verification; final admissibility is the sole prerogative of the court."_
9. ❌ **NEVER SAY:** _"Our primary product is an offline desktop app, or that our entire website works without internet."_
   - ✅ **SAY INSTEAD:** _"NyayaDrishti-LM is an online-first web application accessed via standard web browsers, with an optional local inspection capability (Mode B) for field officers in network-deprived circles."_
10. ❌ **NEVER SAY:** _"We obtain network atomic time in field mode."_
    - ✅ **SAY INSTEAD:** _"We use local monotonic UTC hardware clocks (`time.monotonic_ns()`) for tamper-resistant field timing, with optional NTP synchronization when network connectivity is available."_
11. ❌ **NEVER SAY:** _"Hardware GPS is guaranteed on all officer devices."_
    - ✅ **SAY INSTEAD:** _"Field laptops and indoor godowns often lack GPS; our system makes GPS coordinates nullable and provides mandatory administrative jurisdiction circle dropdown selection."_
12. ❌ **NEVER SAY:** _"The canvas touch drawing is a legally valid PKI digital signature under the IT Act."_
    - ✅ **SAY INSTEAD:** _"The canvas signature is a visual attestation mark for printed notices; the legal digital signature is executed cryptographically via local officer Ed25519 key signing."_

---

## 34. DAILY DEVELOPMENT PLAN (07 - 13 September 2026)

```
====================================================================================================
DAY 1 (07 Sep): SKELETON, DATABASE & DTO CONTRACTS
- M1: OpenCV ArUco detector & test script with sample card photos.
- M2: Download PP-OCRv4 & DBNet++ weights; export initial ONNX models.
- M3: Implement deterministic regex parsers for MRP, Net Qty, and banned units.
- M4: Code AST rule engine and Table-I lookup logic in Python.
- M5: Implement SHA-256 Merkle DAG hashing class and test with mock payloads.
- M6: Initialize React + Vite project with Tailwind and basic screen routing.
Checkpoint: All DTO schemas pass validation; repository skeleton live on GitHub.
====================================================================================================
DAY 2 (08 Sep): CORE ALGORITHMS & PRE-PROCESSING
- M1: Implement Laplacian blur estimator and HSV glare mask filter.
- M2: Implement DBNet++ polygon extraction and patch cropping.
- M3: Build 2D spatial proximity graph (K-D tree) linking MRP to tax suffix.
- M4: Implement Unit Sale Price math checker and temporal epoch dispatcher.
- M5: Build ReportLab Form-1 PDF template and embed raw image exhibits.
- M6: Build Camera Viewfinder HUD with real-time ArUco overlay box.
Checkpoint: Quality gate rejects blurry images; homography rectifies test photos.
====================================================================================================
DAY 3 (09 Sep): OCR & METROLOGY PIPELINE
- M1: Implement connected-components font x-height measurement in mm.
- M2: Connect DBNet++ to PaddleOCR PP-OCRv4 with Latin & Devanagari dictionaries.
- M3: Implement Consumer Care 4-tuple parser and Indian postal PIN code regex.
- M4: Connect extractor outputs to AST rules; verify Table-I compliance logic.
- M5: Implement Section 63 BSA certificate generator with officer signature block.
- M6: Build Side-by-Side Adjudication Canvas with pan/zoom and bounding boxes.
Checkpoint: Calibrated font measurement achieves MAE <= 0.15 mm on planar test target (<= 0.30 mm on pilot retail packs).
====================================================================================================
DAY 4 (10 Sep): P0 INTEGRATION & FEATURE FREEZE (CRITICAL PATH)
- ALL MEMBERS: Connect Stage 1 through Stage 12 into unified FastAPI backend.
- Wire React frontend to live backend inspection API.
- Execute Caliper Benchmark on 20 pilot packages; tune character confidence floors.
- CODE FREEZE on P0 features by 20:00 IST. Zero new features permitted.
Checkpoint: Complete end-to-end run: image upload -> review canvas -> signed PDF.
====================================================================================================
DAY 5 (11 Sep): E-COMMERCE AUDITOR & POLISH
- M3 & M4: Build E-commerce single URL / DOM parser auditing Rule 6(10) & 6(10A).
- M5: Polish Form-1 Legal Notice PDF styling and embed verification QR code.
- M6: Polish Executive Dashboard KPI cards and dark/light mode toggle.
- M1 & M2: Final ONNX INT8 CPU benchmark; verify latency < 1200 ms.
Checkpoint: E-commerce audit functional; notice PDFs render in < 2 seconds.
====================================================================================================
DAY 6 (12 Sep): STRESS TESTING, CALIBRATION & DEMO REHEARSALS
- ALL MEMBERS:
  1. Run complete 20-suite test pyramid across all 50 FMCG pilot packages.
  2. Record 1080p Virtual Video Stream backup (Tier 2 demo safety).
  3. Pre-generate and verify Tier 3 golden static dossiers in SQLite.
  4. Conduct 5 full dry-run presentations following the 3-minute pitch script.
  5. Remove all debug print statements, console logs, and temporary files.
Checkpoint: 5 out of 5 mock presentations executed flawlessly within 3 minutes.
====================================================================================================
DAY 7 (13 Sep): FINAL SUBMISSION & LIVE EVALUATION GATE
- Deploy production web containers to server/cloud; verify online web portal and local fallback resilience.
- Package code, documentation, and slides; complete SIH portal submission.
- Deliver winning live demonstration to Department of Consumer Affairs jury!
====================================================================================================
```

---

## 35. IF WE FALL BEHIND (Emergency Triage)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EMERGENCY TRIAGE DECISION TREE                                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ IF OCR IS SLOW ON CPU (> 2.0s):                                                                  │
│ ──> Downsample image to 1080p before OCR; crop only text clusters detected by DBNet++.           │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ IF HINDI OCR HAS ERRORS:                                                                         │
│ ──> Rely on English statutory fields (MRP, Net Qty, Dates); mark Hindi text as informational.    │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ IF CYLINDRICAL DEWARPING FAILS:                                                                  │
│ ──> Restrict font measurement strictly to the vertical unwarped axis (zero distortion).         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ IF LIVE CAMERA DISCONNECTS ON PODIUM:                                                            │
│ ──> Instantly switch to Tier 2 Virtual Stream or Tier 3 Golden SQLite records.                   │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ IF UI FEATURE IS DELAYED:                                                                        │
│ ──> Cut dashboard graphs; protect the core Adjudication Canvas and PDF generator at all costs.   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 36. PROJECT GLOSSARY

- **Legal Metrology:** The statutory regulation of weights, measurements, and packaging labels for consumer protection.
- **PDP (Principal Display Panel):** The main face of a package containing the brand name and net quantity, governing required font size.
- **Table-I:** The official statutory schedule in Rule 7 prescribing minimum font heights ($1.0\text{ to }6.0\text{ mm}$) based on PDP area.
- **USP (Unit Sale Price):** The price per gram, milliliter, kilogram, or liter, mandatory on all retail packages to allow price comparison.
- **Planar Homography ($H$):** A geometric $3 \times 3$ transformation matrix used to mathematically straighten an angled photo to a flat view.
- **ArUco Marker:** A standardized black-and-white grid pattern of known physical size used as a camera scale reference.
- **OCR (Optical Character Recognition):** Technology that converts printed letter pixels into machine-readable text strings.
- **Rule Engine:** Software that evaluates fixed legal boolean conditions and math against extracted facts without AI guessing.
- **AST (Abstract Syntax Tree):** A structured, tree-like mathematical representation of legal rules and conditions.
- **Section 63 BSA 2023:** The modern Indian law governing the admissibility of electronic evidence in court, replacing repealed Section 65B.
- **Merkle DAG:** A cryptographic tree of SHA-256 hashes proving that digital records have not been altered or tampered with.
- **RBAC:** Role-Based Access Control, restricting system actions based on officer credentials.
- **INT8 Quantization:** Compressing neural network weights from 32-bit floats to 8-bit integers, accelerating CPU inference by $3\times$.
- **ONNX Runtime:** A high-performance cross-platform engine for executing machine learning models on CPUs.
- **Laplacian Variance:** A mathematical formula used to measure image sharpness and detect motion blur in under 10 milliseconds.

---

## 37. IF YOU ONLY REMEMBER 20 THINGS

1. **The Goal:** Build an offline field tool for Legal Metrology Officers to verify packaged goods in 30 seconds.
2. **The Ministry:** Ministry of Consumer Affairs, Food & Public Distribution (DoCA).
3. **The Core Law:** Legal Metrology Act, 2009 & Legal Metrology (Packaged Commodities) Rules, 2011.
4. **The Evidence Law:** Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023). Indian Evidence Act 1872 is repealed!
5. **AI Observes, Rules Verify, Humans Decide:** AI reads pixels; rules check the law; human officers sign notices.
6. **No Millimeters Without a Marker:** Photos have pixels, not millimeters. We use an ArUco card or coin to calculate scale.
7. **Table-I Row 5 Boundary:** For PDP $> 2500\text{ cm}^2$, required font height is **6.0 mm** (not 8.0 mm).
8. **E-Commerce Exemption:** E-commerce listings are legally exempt from displaying manufacturing date under Rule 6(10).
9. **E-Commerce 2026 Mandate:** Searchable Country of Origin filter is mandatory from 1 July 2026 under Rule 6(10A).
10. **Banned Units:** `gms`, `gm`, `Kgs`, `ML`, `ltrs` are illegal under Section 11. Only official SI units (`g`, `kg`, `ml`, `l`) are legal.
11. **Unit Sale Price Math:** $\text{USP} \times \text{NetQty}$ must equal $\text{MRP}$ within ₹0.02.
12. **Consumer Care Checklist:** Must contain Contact Person/Office, Address, Telephone Number, AND Email Address.
13. **No AGPL Software:** Ultralytics YOLO is banned due to copyleft licensing. We use Apache-2.0 DBNet++ and PaddleOCR.
14. **Online Web Architecture + Local Resiliency:** Central web portal on FastAPI/PostgreSQL with optional local CPU inspection engine (Mode B) for zero cloud API dependence.
15. **Four Result States:** `PASS`, `FAIL`, `REVIEW`, and `UNABLE_TO_VERIFY`.
16. **Quality Gate Filter:** Blurry photos or photos with $> 3\%$ glare are rejected before running OCR.
17. **Tamper-Proof Evidence:** Every inspection is sealed into a SHA-256 Merkle DAG and exported as a Form-1 PDF notice.
18. **No Weighing Claims:** We inspect printed labels; we do not weigh package mass.
19. **No Mass Scraping:** We inspect targeted URLs, DOM snapshots, and uploaded images—no automated scraping bots.
20. **Hard Deadline:** 13 September 2026. P0 code freeze on 10 September 2026 (Day 4).

---

## 38. TEAM LEADER CHEAT SHEET (For Standups & Meetings)

### Daily 10-Minute Standup Agenda (Every Morning at 09:00 IST):

1. **What did you deliver yesterday that matches your JSON contract?**
2. **What unit tests are passing today?**
3. **What is blocking your interface with the next team member?**
4. **Are you introducing any AGPL-3.0 or cloud dependencies? (Strictly forbid!)**

### Critical Path Dependencies:

- **Member 1 $\rightarrow$ Member 2:** Member 2 needs rectified planar images from Member 1 to run OCR.
- **Member 2 $\rightarrow$ Member 3:** Member 3 needs OCR text tokens from Member 2 to extract fields.
- **Member 3 $\rightarrow$ Member 4:** Member 4 needs normalized entity facts from Member 3 to evaluate rules.
- **Member 4 $\rightarrow$ Member 5:** Member 5 needs rule findings from Member 4 to generate the PDF notice.
- **Member 6 $\rightarrow$ All:** Member 6 provides the UI canvas where all these pieces connect.

### What the Leader Must NEVER Allow:

- Never allow someone to "experiment with a new cloud API" or "test a generic LLM prompt."
- Never allow unverified changes to the frozen DTO schemas.
- Never allow anyone to push broken code directly to `main`.
- Never allow a team member to say "it works on my GPU" if it fails on CPU.

---

## 39. START DEVELOPMENT FROM HERE (Immediate Next Actions)

```
====================================================================================================
DAY 1 IMMEDIATE TASK ASSIGNMENTS:

MEMBER 1:
1. Initialize `core/homography/` and `core/quality_gate/`.
2. Write a Python script using OpenCV to detect ArUco 4x4_50 marker and compute homography H.
3. Test on 3 sample packaging photos taken with a printed ArUco marker.

MEMBER 2:
1. Initialize `core/ocr_engine/`.
2. Download PaddleOCR PP-OCRv4 ONNX models (detection & recognition).
3. Benchmark inference time on CPU with an INT8 quantized test patch.

MEMBER 3:
1. Initialize `core/extractor/`.
2. Author deterministic regex patterns for MRP, Net Quantity, Dates, and prohibited units ('gms').
3. Run pytest against 20 mock packaging string fixtures.

MEMBER 4:
1. Initialize `core/rule_engine/`.
2. Create `rules_2017_gsr_629.json` and `rules_2021_gsr_779.json`.
3. Implement Table-I font schedule evaluation function and USP math validator.

MEMBER 5:
1. Initialize `core/evidence/`.
2. Build SHA-256 Merkle DAG class linking raw image hash to inspection findings.
3. Build ReportLab Form-1 Legal Notice PDF script with dummy text and evidence image crop.

MEMBER 6:
1. Initialize `client/` using `npm create vite@latest client -- --template react`.
2. Install Tailwind CSS and Lucide Icons.
3. Set up the 3 primary screens: Dashboard, Capture Viewfinder, and Adjudication Canvas.
====================================================================================================
```

---

## 40. IMPORTANT CORRECTIONS & UPDATES MADE DURING GUIDE CREATION

```
+----------------------------------------------------------------------------------------------------+
| OLD ASSUMPTION / DRAFT CLAIM       | CORRECT VERIFIED FACT           | WHY CORRECTION WAS MADE & SOURCE|
+----------------------------------------------------------------------------------------------------+
| Table-I Row 5 blown container font | Correct height is **6.0 mm**    | Gazette G.S.R. 629(E) confirms  |
| height is 8.0 mm (Phase 1 typo).   | for both normal and blown packs.| Row 5 (> 2500 cm²) is 6.0 mm.   |
+----------------------------------------------------------------------------------------------------+
| Electronic evidence governed by    | Governed exclusively by         | Indian Evidence Act 1872 was    |
| Section 65B Indian Evidence Act.   | **Section 63 BSA 2023**.        | repealed on 1 July 2024 by BSA. |
+----------------------------------------------------------------------------------------------------+
| E-commerce listings must declare   | E-commerce listings are         | Rule 6(10) explicitly exempts   |
| month and year of manufacture.     | **statutorily exempt** from mfg | manufacturing date on e-com.    |
|                                    | date on webpage.                |                                 |
+----------------------------------------------------------------------------------------------------+
| Software can measure physical mm   | Monocular single photo has      | Projective scale ambiguity      |
| directly from any smartphone photo.| scale ambiguity; **requires     | requires a coplanar reference   |
|                                    | known reference (ArUco/coin)**. | target for metric homography.   |
+----------------------------------------------------------------------------------------------------+
| Ultralytics YOLOv8/v11 selected for| YOLO strictly banned due to     | AGPL copyleft forces opening of |
| packaging panel detection.         | **GNU AGPL-3.0** viral copyleft.| government source code; replaced|
|                                    |                                 | by Apache-2.0 DBNet++ & RT-DETR.|
+----------------------------------------------------------------------------------------------------+
| Software will crawl and scrape     | Scrapers trigger IP bans & TOS  | Mass scraping is out of scope;  |
| millions of e-commerce listings.   | violations. Scope restricted to | system audits direct URLs, DOM  |
|                                    | single URL/DOM/screenshot audit.| snapshots, and uploaded images. |
+----------------------------------------------------------------------------------------------------+
| AI acts as autonomous magistrate   | AI is an **advisory decision-   | Under LM Act 2009, penal power  |
| and issues fines to shopkeepers.   | support tool**; human officer   | rests exclusively with gazetted |
|                                    | reviews and signs all notices.  | officers; AI fines are illegal. |
+----------------------------------------------------------------------------------------------------+
```

---

## 41. REMAINING OPEN QUESTIONS (Bounded by Safe Defaults)

- **OQ-01: ArUco Marker vs Standard Credit-Card-Sized Reference (ISO 7810 ID-1):**
  - _Working Default:_ Implement dual OpenCV detection: ArUco 4x4_50 is primary; standard ID-1 card contour detection is automatic fallback.
- **OQ-02: Minimum Manufacturer Address Tokens Required for Violation:**
  - _Working Default:_ Must contain State + 6-digit PIN code. Missing street line triggers `REQUIRES_REVIEW` rather than a hard fail.
- **OQ-03: eMaap National Portal REST API Schema:**
  - _Working Default:_ Since `emaap.gov.in` has no public API, export standardized Form-1 JSON payload matching statutory inspection memo fields, ready for future webhook integration.
- **OQ-04: Cylindrical Packaging Text Dewarping:**
  - _Working Default:_ Restrict physical font height measurement to the vertical unwarped axis of the cylinder (zero distortion). Deferred full 3D surface mesh unwrapping to post-hackathon roadmap.
- **OQ-05: Deployment Packaging:**
  - _Working Default:_ FastAPI direct static mount serving pre-built React 18 production bundle at `/`, eliminating runtime Node.js or CORS friction in demo/evaluation. Vite dev server for local UI development. Electron remains an optional packaging wrapper.

---

## 42. SOURCE MAP (Index of Authoritative Repository Documents)

```
+----------------------------------------------------------------------------------------------------+
| FILE NAME                              | PRIMARY AUTHORITY & CONTENT SCOPE                         |
+----------------------------------------------------------------------------------------------------+
| `01_MASTER_PROJECT_BLUEPRINT.md`       | Executive architectural synthesis and SSOT summary.       |
| `02_FINAL_REQUIREMENTS_SPECIFICATION.md`| Master requirements (FR-01 to FR-20, NFR-01 to NFR-10).   |
| `03_FINAL_ARCHITECTURE.md`             | Modular monolith architecture & 12-stage pipeline flow.  |
| `04_FINAL_MVP_SCOPE.md`                | MoSCoW prioritization, P0 frozen scope & explicit cut list|
| `05_TECHNOLOGY_DECISION_RECORD.md`     | Formal ADRs (ADR-01 to ADR-12) covering stack choices.    |
| `06_DATA_AND_MODEL_STRATEGY.md`        | DS-SYNTH-001, DS-PILOT-050, ONNX INT8 & license audits.   |
| `07_API_AND_INTERFACE_CONTRACTS.md`    | OpenAPI 3.1 REST schemas & Pydantic v2 pipeline DTOs.     |
| `08_DATABASE_SPECIFICATION.md`         | Relational DDL, SQLite/PostgreSQL schemas & indexing.     |
| `09_UI_UX_BLUEPRINT.md`                | Design tokens, mobile HUD wireframes & review canvas.     |
| `10_SECURITY_AND_AUDIT_SPECIFICATION.md`| RBAC matrix, Section 63 BSA 2023 & Merkle audit ledger.  |
| `11_TESTING_AND_VALIDATION_PLAN.md`    | 4-tier test pyramid, 20 test suites & acceptance metrics. |
| `12_DEMO_PLAN.md`                      | 3-tier presentation fallback architecture & pitch script. |
| `13_SIX_MEMBER_EXECUTION_PLAN.md`      | Granular workstreams, APIs, and tasks for 6 developers.   |
| `14_GITHUB_WORKFLOW.md`                | Trunk-based branching, PR policy, CI checks & DoD.        |
| `15_RISK_AND_CONTINGENCY_REGISTER.md`  | 11 red-team failure modes, tripwires & mitigations.       |
| `16_DECISION_LOG.md`                   | Architectural Decision Log (ADL-01 to ADL-19) & reasons.  |
| `17_OPEN_QUESTIONS.md`                 | Strictly bounded open questions with safe working defaults|
| `CLAIMS_WE_MUST_NOT_MAKE.md`           | Blacklist of unsupported, legally hazardous claims.       |
| `SYSTEM_MODES_AND_CONNECTIVITY.md`     | Formal definition of Mode 1 (Offline), Mode 2, & Mode 3.  |
| `CONNECTIVITY_REQUIREMENTS.md`         | 29-component offline/online dependency & isolation matrix. |
| `FINAL_AUTHENTICITY_AND_ACCURACY_AUDIT.md`| Definitive pre-dev legal, tech, metric & truth audit.  |
+----------------------------------------------------------------------------------------------------+
```

---

_End of Master Guide. All 6 members proceed to Day 1 task execution immediately._
