# LEGAL METROLOGY FRONTEND RESEARCH NOTE (SECTION 46)

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Author:** Member 6 Workstream (Urvashi Rajput / Antigravity Takeover)  
**Date:** 10 September 2026  
**Status:** COMPLETE & VERIFIED  

---

## 1. Primary Users
- **Legal Metrology Inspector (LMI) / Legal Metrology Officer (LMO)**:
  - Appointed under Sections 13 and 14 of the **Legal Metrology Act, 2009**.
  - Operates directly in retail shops, wholesale mandis, packaging factories, e-commerce fulfillment centers, and customs warehouses.
  - Inspects packages for compliance with the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules, 2011)**.
  - Typical environment: Rugged mobile/tablet usage under noisy market conditions, godowns with intermittent connectivity, or field laptops.

---

## 2. Secondary Users
- **Assistant Controller / Deputy Controller / District Controller of Legal Metrology**:
  - Supervisory statutory authority.
  - Reviews inspection reports submitted by LMIs.
  - Issues formal Show Cause Notices under Section 36(1).
  - Presides over compounding hearings under Section 48 of the Act.
  - Issues sanction for prosecution under Section 50 where compounding is refused or inapplicable.
- **State Directorate of Legal Metrology / Department of Consumer Affairs (DoCA)**:
  - Central and State headquarters monitors state-wide compliance indices, repeat offenders, and e-commerce platform compliance rates.
- **Authorized Business Representative / Trader / Packer / Manufacturer**:
  - Receives inspection memos, provides proof of Rule 27 registration, and submits rectification or compounding requests.

---

## 3. Current Inspection Workflow (Verified Official Field Workflow)
Based on official State Legal Metrology Enforcement Manuals and statutory provisions under Sections 15 & 18 of the Legal Metrology Act, 2009:

1. **Origin of Inspection**:
   - Routine market surveillance scheduled by the Controller.
   - Consumer complaint referred from National Consumer Helpline (NCH / INGRAM / e-Daakhil).
   - Targeted market enforcement or surprise raid.
   - Follow-up on prior non-compliance or compounding default.
2. **Entry and Identification**:
   - The LMO enters the commercial premises during business hours under Section 15(1).
   - Presents official identity card to the owner/manager.
3. **Premises Documentation**:
   - Records business name, trade name, GSTIN, Shop/Establishment license number, and physical address.
4. **Drawing of Package Samples**:
   - Draws pre-packaged commodities from retail display shelves or factory warehouse lots.
   - For net quantity testing, samples are drawn according to the statistical sampling plan prescribed in the **Second Schedule of the LMPC Rules, 2011** ($N$ lot size vs. $n$ sample size).
5. **Physical Examination of Declarations (Rule 6)**:
   - Verifies Name & Address of Manufacturer / Packer / Importer (Rule 6(1)(a)).
   - Verifies Generic or common name of commodity (Rule 6(1)(b)).
   - Verifies Net quantity statement in metric units (Rule 6(1)(c), Rule 12, Rule 13).
   - Verifies Month and Year of manufacture / packaging / import (Rule 6(1)(d)).
   - Verifies Maximum Retail Price (MRP) inclusive of all taxes (Rule 6(1)(e)).
   - Verifies Font size of numerals and letters against Table-I of Rule 7 (Rule 6(1)(h)).
   - Verifies Unit Sale Price (USP) for packages manufactured after 01 Jan 2022 (Rule 6(1)(k)).
   - Verifies Consumer Care contact details: name, phone, email, postal address (Rule 6(1)(n)).
   - Verifies Country of Origin for imported commodities (Rule 6(1)(p)).
6. **Physical Metrology & Measurement**:
   - Calculates Principal Display Panel (PDP) area in $\text{cm}^2$.
   - Measures numeral font height using a handheld magnifying glass/reticle loupe against Table-I thresholds.
   - Net weight / volume verification (Rule 24): Weighs samples on a calibrated balance, subtracts tare weight, and compares individual errors with the Maximum Permissible Error (MPE) in the First Schedule.
7. **Recording Paperwork & Panchnama**:
   - Prepares on-site Inspection Memo / Checklist.
   - Executes Panchnama / Spot Mahazar witnessed and signed by two independent local witnesses and the trader.
   - If commodities are seized under Section 15(1)(b), prepares a formal Seizure Memo.
8. **Statutory Adjudication & Notice**:
   - If compliant: Records inspection in register and closes case.
   - If non-compliant: Submits inspection report to the Assistant Controller.
   - Controller issues Show Cause Notice under Section 36(1) giving 15 days to reply.
   - Trader may apply for compounding of offence under Section 48.

---

## 4. Current Paperwork & Official Records
- **Inspection Report / Inspection Memo (Form 1)**: Primary case record detailing place, date, time, entity, product, and specific contraventions.
- **Panchnama / Spot Mahazar**: Legal proof of on-site search and sample collection, required to satisfy court evidence rules.
- **Sample Testing Data Sheet**: Prescribed under the Second & Third Schedules of LMPC Rules, recording lot size, sample size, declared quantity, gross weight, tare weight, net weight, permissible error, individual errors, and average error.
- **Seizure Memo / Seizure List**: Under Section 15(1)(b) of the LM Act, listing seized packages, batch numbers, and custody location.
- **Show Cause Notice under Section 36(1)**: Formal statutory communication detailing violations and penalties.
- **Compounding Application & Compounding Order**: Under Section 48 of the Act.

---

## 5. Evidence Collected
- High-resolution physical package photographs (Front PDP, Net Qty panel, MRP panel, Mfg panel).
- Seized physical commodity samples (tagged with tamper-evident evidence slips).
- Copy of trader's GST certificate / trade license / Packer registration under Rule 27.
- Purchase invoice / cash memo (for test purchases).
- Signed Panchnama with witness names, addresses, and signatures.

---

## 6. Measurement Workflow
- **Principal Display Panel (PDP) Surface Area ($A$)**:
  - Rectangular containers: Area of one entire side (Height $\times$ Width).
  - Cylindrical containers: $40\%$ of Height $\times$ Circumference ($0.4 \times H \times 2\pi r$).
  - Flexible pouches / irregular shapes: Area of one complete face.
- **Font Height Schedule (Table-I of Rule 7)**:
  - $A \le 50\text{ cm}^2$: $\ge 1.0\text{ mm}$ (normal), $\ge 1.5\text{ mm}$ (blown/moulded)
  - $50 < A \le 100\text{ cm}^2$: $\ge 1.5\text{ mm}$ (normal), $\ge 2.0\text{ mm}$ (blown/moulded)
  - $100 < A \le 500\text{ cm}^2$: $\ge 2.5\text{ mm}$ (normal), $\ge 4.0\text{ mm}$ (blown/moulded)
  - $500 < A \le 2500\text{ cm}^2$: $\ge 4.0\text{ mm}$ (normal), $\ge 6.0\text{ mm}$ (blown/moulded)
  - $A > 2500\text{ cm}^2$ (Row 5): $\ge 6.0\text{ mm}$ (normal & blown/moulded) — *ADL-01*
- **Unit Sale Price (USP) Arithmetic Check**:
  - Enforces $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$.

---

## 7. Violation Workflow
1. Field Inspector discovers statutory defect (e.g., font deficit of $0.66\text{ mm}$, banned unit `gms`, or missing consumer care email).
2. LMO records evidence and prepares Draft Inspection Memo.
3. Assistant Controller reviews case, signs Form-1 Legal Notice under Section 36(1) read with Section 63 Bharatiya Sakshya Adhiniyam, 2023.
4. Recipient has 15 days statutory reply window.
5. Recipient may opt for compounding under Section 48 (e.g., standard fee ₹25,000 for first offence) or challenge the notice.

---

## 8. Human Decision Points (Mandatory Human-in-the-Loop)
- Deciding whether observed defect is actionable or within sensor uncertainty ($k=2, 95\%$ confidence).
- Approving or overriding automated compliance recommendations.
- Determining whether photographic evidence is clear enough to withstand court scrutiny.
- Assessing trader explanations during compounding hearings.
- Signing and issuing statutory notices.

---

## 9. Current Digital Systems Observed
- **eMaap Portal**: National portal for verification/stamping of weighing instruments and manufacturer registration under Rule 27.
- **State Legal Metrology Portals**: Basic administrative websites for license renewal.
- **INGRAM / NCH**: Consumer grievance lodging.
- *Gap*: No unified digital system currently exists in the field for real-time automated label compliance checking, metric font measurement, and BSA electronic evidence certification. Inspections remain overwhelmingly manual.

---

## 10. Pain Points in Current Manual Process
- High time consumption: 8 to 15 minutes per package doing manual math and reticle loupe alignment.
- Trader confrontation: Disputes over subjective handheld ruler readings without photographic proof.
- Defective notice drafting: Clerical errors, outdated gazette citations, or wrong section numbers leading to court dismissals.
- Lack of digital chain of custody: Photos captured on personal phones lack cryptographic integrity under Section 63 BSA 2023.

---

## 11. What SIH26034 Automates
1. Optical frame quality gate (blur, glare, tilt).
2. Metric scale calibration via coplanar reference targets ($S = \text{mm/px}$).
3. Multilingual text detection (DBNet++ / PP-OCRv4 detection) and OCR (PP-OCRv4 English recognition, PP-OCRv3 Devanagari recognition, with Tesseract fallback).
4. Statutory field parsing (Net Qty, MRP, USP, Dates, Addresses, Consumer Care, Origin).
5. Banned unit flagging (`gms`, `gm`, `ML`, `ltrs`).
6. Table-I font height compliance evaluation based on PDP area.
7. USP mathematical reconciliation.
8. Temporal statutory epoch routing (non-retroactivity under Article 20(1)).
9. Dynamic cryptographic SHA-256 Merkle DAG chain of custody (nodes dynamically supplied by backend pipeline).
10. Display and drafting of court-ready Form-1 Legal Notice and Section 63 BSA Certificate based on backend-provided findings and statutory sections.

---

## 12. What SIH26034 Must NOT Automate
- System **never** issues notices, compounding orders, or fines autonomously.
- Frontend **never** acts as the legal source of truth: canonical rule codes, statutory citations, and compounding recommendations are computed by backend Member 4 & 5, and frontend only renders them.
- System **never** measures package weight/mass with a camera (cannot weigh with photons).
- System **never** fabricates missing declarations or assumes unverified values.
- System **never** treats `UNABLE_TO_VERIFY` as `PASS`.
- System **never** overrides human officer decisions silently.

---

## 13. Proposed Digital Case Workflow
```text
INSPECTION CASE
  ├── 1. Context & Entity (Circle, Inspector, Business Details, GSTIN)
  ├── 2. Sample Registration (Brand, Commodity, Packaging Type, Lot/Batch)
  ├── 3. Optical Capture HUD (Blur/Glare Telemetry, Scale Reference, Silhouette)
  ├── 4. Automated 12-Stage Pipeline (Calibration, OCR, Extraction, Rules)
  ├── 5. Split-View Adjudication Canvas (Calibrated Loupe + Rule Compliance Ledger)
  ├── 6. Human Adjudication (Confirm, Dismiss, Retest + Mandatory Justification)
  ├── 7. Evidence Vault (Dynamic Merkle DAG + Section 63 BSA Certificate)
  └── 8. Form-1 Statutory Notice Generation (Court-Ready Signed PDF/A)
```

---

## 14. Industry UX Principles Adopted
- **Evidence-Grade Ergonomics**: Original pixel integrity preserved; non-destructive vector overlays.
- **High-Cognitive-Clarity**: 4-State Epistemic Verdict (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`) with distinct icons, color, and textual explanation.
- **Explainability & Traceability**: Direct visual mapping between package polygon $\leftrightarrow$ OCR token $\leftrightarrow$ Extracted field $\leftrightarrow$ Statutory rule $\leftrightarrow$ Deficit calculation.
- **Field-Resilient**: Offline session caching, touch-friendly controls ($\ge 48\text{ dp}$), and local resilient mode indicators.

---

## 15. Gaps & Assumptions Requiring Validation
- Standard jurisdiction circle formats (modeled as `CIRCLE_DL_SOUTH_01`).
- Offline bundle sync protocol (modeled as idempotent `POST /api/v1/inspections/sync-bundle`).
