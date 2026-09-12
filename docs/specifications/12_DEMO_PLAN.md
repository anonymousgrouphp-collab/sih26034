# FINAL COMPREHENSIVE LIVE DEMONSTRATION PLAN

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Audience:** Smart India Hackathon 2026 Evaluation Jury (DoCA & Domain Experts)  
**Status:** FROZEN  

---

### 1. The Three-Tier Demo Safety Architecture

To guarantee that the live hackathon evaluation proceeds flawlessly regardless of venue network volatility, hardware glitches, or podium lighting constraints, NyayaDrishti-LM implements a **3-Tier Demo Architecture**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      3-TIER LIVE DEMO STRATEGY                                         │
├──────────────────────────────────┬──────────────────────────────────┬──────────────────────────────────┤
│ TIER 1: PRIMARY LIVE DEMO        │ TIER 2: BACKUP LOCAL INSTANCE    │ TIER 3: EMERGENCY STATIC GOLDEN  │
│ (Online Web Application)         │ (Local Mode B Fallback)          │ (Pre-Computed Merkle Dossiers)   │
├──────────────────────────────────┼──────────────────────────────────┼──────────────────────────────────┤
│ • Accessed via modern browser    │ • Runs on localhost:8000 via     │ • Instant loading of 5 golden    │
│   (Chrome / Edge / Firefox)      │   Docker Compose / local uvicorn │   inspection records             │
│ • Live connection to backend API │ • Activates instantly if venue   │ • Embedded pre-generated signed  │
│ • Full centralized database      │   Wi-Fi is disconnected or slow  │   court dossiers (PDF/A-1b)      │
│   (PostgreSQL 16+) & history     │ • Local ONNX CPU inference &     │ • Demonstrates full UI HUD,      │
│ • Central administrative view    │   local SQLite storage           │   provenance verification, and   │
│ • Live image upload & processing │ • Zero external network reliance │   statutory rule citations       │
└──────────────────────────────────┴──────────────────────────────────┴──────────────────────────────────┘
```

---

### 2. The 3-Minute Live Judging Script

#### MINUTE 1: The Problem & The Scientific Litmus Test (0:00 - 1:00)

- **Speaker:** Team Leader
- **Action:** Hold up a physical biscuit carton alongside an open laptop displaying the NyayaDrishti-LM web portal login.
- **Pitch:**
  > _"Respected Judges, India has approximately 3,000 Legal Metrology officers regulating billions of pre-packaged commodities across 12 million retail shops. Today, an officer spends 8 minutes per pack using a manual magnifying loupe, a handheld ruler, and manual arithmetic. Less than 0.1% of packages are ever inspected._
  >
  > _Amateur teams attempt to point a smartphone camera and prompt an ungrounded LLM to 'judge' the label. But as metrology and legal experts know, a 2D camera sees only uncalibrated pixels, not physical millimeters. Claiming to measure font height without optical scale calibration violates projective geometry._
  >
  > _We present **NyayaDrishti-LM**: an online-first web enforcement platform built for the Department of Consumer Affairs, featuring an optional local inspection capability for field officers in network-deprived circles. It solves the millimeter problem with mathematical rigor and enforces the Legal Metrology (Packaged Commodities) Rules, 2011 deterministically."_

#### MINUTE 2: Live Web Ingestion, Metric Calibration & Violation Detection (1:00 - 2:00)

- **Speaker:** Member 1 & Member 6
- **Action:** In the browser SPA, upload high-resolution package facet images with an optical reference marker placed in the scene.
- **UI Demonstration:**
  1. _Optical Quality Gate:_ Show the green `FRAME_OPTIMAL` indicator in the web interface. Highlight how excessive blur or glare is intercepted before processing.
  2. _Metric Scale Rectification:_ Show planar homography detection in real time, rectifying the perspective tilt and establishing optical scale $S = 0.052\text{ mm/pixel}$.
  3. _Multilingual OCR & Entity Normalization:_ Show DBNet++ text polygons tightly wrapping packaging text in English and Hindi, normalized into structured commodity facts.
  4. _Deterministic Rule Engine Execution:_
     - _Net Quantity:_ Reads `200 gms` $\rightarrow$ **FAIL:** System flags violation of Section 11 & Rule 12 (prohibited non-standard unit 'gms').
     - _Principal Display Panel Area:_ Computes $A = 144\text{ cm}^2$ (Table-I Row 3: requires font height $\ge 2.5\text{ mm}$).
     - _Physical Glyph Measurement:_ Measures numeral height at $1.84\text{ mm} \pm 0.08\text{ mm}$ $\rightarrow$ **FAIL:** Displays statutory deficit of $0.66\text{ mm}$.
     - _Unit Sale Price (USP):_ Declared USP ₹0.60/g on ₹80 MRP $\rightarrow$ **FAIL:** Flags arithmetic discrepancy ($200 \times 0.60 = ₹120 \ne ₹80$).

#### MINUTE 3: Central Governance, BSA Evidence & Field Resilience (2:00 - 3:00)

- **Speaker:** Member 4 & Member 5
- **Action:** Open the Centralized Enforcement Dashboard in another browser tab, show jurisdiction-wide analytics, then generate the Section 63 BSA 2023 Statutory Dossier.
- **Pitch:**
  > _"Notice that our AI does not issue fines autonomously. Under the Legal Metrology Act and the Jan Vishwas Act, 2023, statutory authority rests exclusively with the human officer. The inspector reviews the side-by-side rectified crop, validates the findings, and digitally confirms the memo._
  >
  > _Instantly, our platform compiles an immutable SHA-256 Merkle DAG conforming to Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, and produces a court-ready, tamper-evident Inspection Dossier citing exact Gazette GSR notifications._
  >
  > _All inspection records, metrics, and evidence files are centrally persisted in our PostgreSQL datastore, giving State Controllers real-time enforcement analytics. And if an officer is deployed in a remote circle with zero connectivity, NyayaDrishti-LM provides a local offline inspection mode that executes the exact same inspection pipeline locally on standard laptop CPUs, securely queueing signed sync bundles for upload._
  >
  > _NyayaDrishti-LM is not an ungrounded research toy; it is an online, scalable, legally defensible enforcement system for the Ministry of Consumer Affairs."_

---

### 3. Golden Test Cases for Demonstration

| SKU ID | Product Category | Intended Demonstration Point | Expected System Output |
| :--- | :--- | :--- | :--- |
| **SKU-DEMO-01** | Premium Biscuit Carton | Font height violation ($1.84\text{ mm}$ vs $2.50\text{ mm}$ req) + Banned unit `gms` | `VIOLATION_FLAG` on Table-I Row 3 and Section 11. |
| **SKU-DEMO-02** | Ready-to-Eat Curry Pouch | USP mathematical mismatch + Incomplete Consumer Care (missing email) | `VIOLATION_FLAG` on Rule 6(1)(f) and Rule 6(1)(g). |
| **SKU-DEMO-03** | Packaged Bottled Water | Fully compliant modern packaging (GSR 779 USP compliant, valid font) | `VERIFIED_COMPLIANT (PASS)` across all statutory clauses. |
| **SKU-DEMO-04** | Borderline FMCG Soap Box | Font height within measurement uncertainty ($2.46\text{ mm} \pm 0.08\text{ mm}$) | `REQUIRES_HUMAN_REVIEW` with prompt for caliper verification. |
| **SKU-DEMO-05** | Reflective Chips Pouch | Harsh specular glare bloom over Net Quantity statement | `UNABLE_TO_VERIFY (SPECULAR_GLARE)` with camera tilt prompt. |
| **SKU-DEMO-06** | E-Commerce Listing Snapshot | Online product page missing country of origin declaration | `VIOLATION_FLAG` on Rule 6(10) / Rule 6(1)(aa). |
