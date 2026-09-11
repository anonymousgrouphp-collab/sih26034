# NyayaDrishti-LM UI/UX Redesign & Integration Changelog

**Product:** NyayaDrishti-LM (SIH26034)  
**Release:** v2.0-combined  
**Target Directory:** `ui-combined/`  
**Date:** 11 September 2026  
**Build Status:** Clean compilation (`tsc -b && vite build` succeeded in 4.25s)  

---

## 1. Summary of Changes

This release represents a comprehensive overhaul and synthesis of the dual frontend codebases (`nirikshak-metrolens-ai` and `ui-combined`). The redesign addresses critical field officer usability challenges, fixes canvas blackout bugs, corrects institutional branding to meet statutory guidelines, introduces dedicated Rule 6 statutory declaration review tools, and streamlines the information architecture into 4 intuitive inspection tabs.

---

## 2. Detailed Changelog by Workstream

### 2.1 Institutional Branding & Statutory Guardrails
* **`NyayaDrishtiBrandLogo.tsx`:**
  - Removed misleading `.gov.in` domain and false national portal attribution.
  - Replaced with compliant branding: `NyayaDrishti-LM — Legal Metrology Inspection Workstation`.
  - Retained Ashoka Pillar state emblem and LMPC gold badge.
* **`GovTopBar.tsx`:**
  - Replaced misleading `STATUTORY COMPLIANCE // LMO AUTHORISED` banner with legally accurate `EVIDENTIARY ASSISTANCE // SEC 63 BSA 2023`.
  - Preserved complete GIGW 3.0 accessibility utilities: Live IST clock (`DD MMM YYYY, HH:MM:SS IST`), font resizing (`A-`, `A`, `A+`), high contrast mode toggle, and vernacular Hindi (`हिंदी`) language switcher.
* **`Landing.tsx`:**
  - Replaced sovereign ministry ownership attribution with honest positioning: `Government-Service-Grade • Legal Metrology (Packaged Commodities) Enforcement Workstation`.
  - Added explicit human-in-the-loop diagnostic assistant disclaimer.

### 2.2 Field Evidence Intake & Photography Guidance (`NewInspection.tsx`)
* **Tabbed Ingestion Architecture:**
  - Implemented dual-mode switcher: **Field Package Capture** (default real-world seizure workflow) vs. **Benchmark Test Cases** (`GoldenSkuQuickSelector`).
* **Mobile Camera Hardware Integration:**
  - Configured `<input type="file" accept="image/*" capture="environment" />` allowing field officers to launch rear camera directly on tablets and smartphones.
  - Added multiple image file selection with real-time thumbnail preview strip and remove buttons.
* **Field Photography Rules Card:**
  - Added illustrated guidelines card instructing officers on:
    - Distance: Maintain 30–50 cm framing to cover entire Principal Display Panel (PDP).
    - ArUco Scale Marker: Position 50mm fiducial card on the same plane adjacent to the package.
    - Specular Glare Mitigation: Angle camera slightly ($\pm 10^\circ$) to deflect harsh fluorescent ceiling reflection.
    - Background Contrast: Use neutral, un-patterned surfaces.
* **Rule 6 Field Metadata Intake:**
  - Structured form fields for Establishment / Trader Name, Premises Address, Commodity Category, Packaging Geometry, and Declared Net Quantity.

### 2.3 Information Architecture & Workspace Tab Consolidation (`CaseWorkspace.tsx`)
* **Header Deduplication:**
  - Eliminated redundant secondary product name, brand, and establishment block inside the Overview view that duplicated the top `CaseHeader`.
  - Created a compact **Executive Inspection Summary Ribbon** featuring quick commodity tags (`Category`, `Net Qty`, `MRP`), confidence meter, copyable Case ID, and a 6-metric ticker.
* **Streamlined 4-Tab Navigation:**
  - Consolidated 6 fragmented tabs (`OVERVIEW`, `CANVAS`, `HUD`, `AUDIT`, `OUTCOME`, `REPORT`) into **4 purposeful operational views**:
    1. **`Inspection Overview`:** 5-stage pipeline progress stepper, vision canvas with calibrated bounding boxes, ArUco calibration details, Section 63 BSA hash block, `StatutoryDeclarationsCard`, calibrated measurements, rule evaluations ledger, and quick preliminary officer adjudication box.
    2. **`Forensic Split-Canvas`:** Flagship `AdjudicationCanvas` with interactive DBNet++ polygon overlays, 2.5x optical forensic loupe, 10mm calibrated metric grid, bidirectional token-to-finding selection, and conflict resolution banner.
    3. **`Formal Report & Notice`:** Complete printable statutory inspection report, State Emblem, Section 63 BSA electronic evidence certificate, digital stamp seal, and Form-1 notice generator.
    4. **`Audit & Diagnostics`:** Dual sub-navigation allowing officers and technical auditors to switch between:
       - Sub-view A: *Section 63 BSA Evidentiary Ledger & Merkle DAG* (Provenance panel, immutable audit timeline, case handoff readiness).
       - Sub-view B: *12-Stage AI Pipeline Telemetry & Diagnostics HUD* (`AnalysisHUD` with latency breakdown, model source, optical gate scores).

### 2.4 Dedicated Statutory Declarations Review (`StatutoryDeclarationsCard.tsx`)
* **New Component:** Authored and exported `StatutoryDeclarationsCard.tsx` in `src/components/nirikshak/`.
* **Features:**
  - Line-by-line inspection cards for mandatory Rule 6 declarations (MRP, Net Qty, USP, Dates, Manufacturer, Country of Origin, Consumer Care).
  - Status indicators (`Valid`, `Banned Unit Flagged`, `Missing`).
  - System extracted confidence score.
  - Officer inline editing modal allowing correction of OCR misreads.
  - One-click `Confirm` button registering officer human verification.

### 2.5 Adjudication Canvas Blackout Fix & Packaging Assets
* **Image Blackout Resolution (`EvidenceViewer.tsx`):**
  - Added resilient image error handling (`imageError` state and `onError` handler).
  - Created multi-tier fallback ensuring the canvas container never renders as an unexplained black void.
  - Added fallback status banner notifying the officer when a backup fixture is active.
* **Dimension Calculation Fix:**
  - Added explicit `width="900" height="1100"` attributes to all SVG packaging assets in `public/assets/` to prevent Chromium from computing distorted intrinsic dimensions ($123 \times 150\text{ px}$).
  - Updated `imgWidth` and `imgHeight` calculation in `EvidenceViewer.tsx` to prioritize calibrated asset metadata.
* **New High-Fidelity Packaging Assets (`public/assets/`):**
  - `aashirvaad-atta-demo.svg`: Whole wheat flour pouch with ArUco 50mm fiducial marker, Table-I compliant declarations, and registered batch.
  - `fizzup-lemon-demo.svg`: Sparkling lemon drink bottle with dual conflicting MRPs (₹45.00 original vs ₹48.00 overprinted sticker under Rule 18(1)).
  - `cleanhome-cleaner-demo.svg`: Surface disinfectant spray bottle with missing fiducial marker illustrating uncalibrated sensor triage.
  - Updated `tata-salt-demo.svg` with explicit dimensions.

### 2.6 Metric Calibration Data Synchronization (`mockData.ts`)
* **ArUco Detection Synchronization:**
  - Synchronized `calibration_summary` across mock cases to support both `aruco_detected` and `available` properties.
  - Updated `INS-2026-0001` (Aashirvaad Atta) to show ArUco #0 detected, resolving the false Stage 3 failure in the pipeline stepper.
  - Mapped mock case assets to their corresponding SVG demonstration files.

### 2.7 Accessibility & Touch Targets
* **Toolbar Ergonomics (`EvidenceViewer.tsx`):**
  - Increased button touch targets to a minimum height of $32\text{ px}$ on desktop/tablet and $44\text{ px}$ on mobile.
  - Added explicit `aria-label` attributes to all zoom controls (`−`, `+`, `Fit`, `Reset`), loupe toggle, and 10mm grid toggle.
  - Maintained keyboard accessibility (`Enter` and `Space` key activation on canvas tokens).

---

## 3. Verification & Compliance Matrix

| Verification Gate | Method / Tool | Result |
| :--- | :--- | :--- |
| **TypeScript Type Checking** | `npm run typecheck` (`tsc --noEmit`) | **0 errors, 0 warnings** |
| **Production Bundle Compilation** | `npm run build` (`tsc -b && vite build`) | **Successful in 4.25s** |
| **Local Dev Server Execution** | `npm run dev -- --port 5174` | **Active on http://localhost:5174** |
| **Live Browser Verification** | Chrome DevTools MCP | **Verified across 4 primary tabs** |
| **GIGW 3.0 Accessibility** | Color contrast audit, GIGW toolbar | **Passed** |
| **Section 63 BSA Evidentiary Admissibility** | SHA-256 hash preservation, Merkle DAG | **Passed** |
