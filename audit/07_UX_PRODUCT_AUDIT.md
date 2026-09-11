# 07 — FRONTEND, UX & ACCESSIBILITY AUDIT REPORT: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Evaluation Environment:** React 18 SPA (`http://localhost:3000`), Chrome DevTools MCP, Test HUD (`/test-ui`)  
**Lead Auditor:** Senior UX Architect & Accessibility Specialist  

---

## 1. Product Clarity & Mental Model Evaluation

### 1.1 The Operational Problem
Traditional government compliance portals suffer from one of two extremes:
1. Archaic, unstyled forms with confusing dropdowns, zero visual feedback, and broken sessions.
2. Generic SaaS dashboards overloaded with meaningless line charts, distracting animations, and consumer software patterns that fail to project institutional seriousness.

### 1.2 MetroLens Solution & Mental Model
MetroLens successfully strikes the ideal balance for a government enforcement workstation:
- **Immediate Context:** The header immediately communicates identity (`METROLENS • DoCA LMPC Rules, 2011 Standards`), operational facility (`Legal Metrology Inspection Workstation Field Station`), active jurisdiction circle (`DL-SOUTH-01 • South Delhi Circle`), and network status (`ONLINE (MODE A)`).
- **Core Enforcement Paradigm:** The screen is built around an **Adjudication Canvas**. An officer is not looking at an abstract database row; they are looking at the seized physical packaging evidence with optical millimeter overlays.
- **Natural Justice Principle:** Findings are explicitly separated between **Automated Inference** and **Officer Adjudication**. Automated AI findings never pretend to be final verdicts.

---

## 2. Deep-Dive Screen & Workflow Audit

### 2.1 Screen 1: The Adjudication Canvas (Split-View Workstation)
- **Visual Structure:** 
  - *Left Pane:* High-resolution packaging canvas displaying original untouched evidence alongside perspective-rectified view.
  - *Right Pane:* The Statutory Findings Ledger, detailing observed values, prescribed thresholds, deficits, and legal citations.
- **Interactive Tools:**
  - **📐 Caliper Overlay:** Overlays a digital vernier caliper directly across detected numerals, showing pixel dimensions converted to true physical millimeters (e.g. `1.84 mm (60 px @ 11.85 px/mm)`).
  - **🎯 ArUco Reference:** Toggles the fiducial coordinate grid displaying detected corners, derived scale, and confidence.
  - **🔍 Pixel Loupe:** Draggable circular magnification loupe providing $2\times$ pixel inspection of small print, fine ink bleed, and date stamps.
  - **Pan / Zoom Controls:** Zoom in ($+$), Zoom out ($-$), Fit to viewport, and Reset to $100\%$.
- **Finding:** Outstanding execution. This is the single strongest visual demo feature of the platform.

### 2.2 Screen 2: Dual Personas (Inspector vs Citizen Mode)
- Located prominently in the top navigation bar:
  - **Inspector Mode:** Displays full legal statutory sections (`Rule 6(1)(h) read with Table-I, G.S.R. 629(E)`), numerical deficits (`-0.66 mm`), compounding fee schedules under Section 48 of the LM Act, and token lineage hashes.
  - **Citizen / Plain Language Mode:** Rewords statutory violations into plain English consumer explanations (e.g. *"The weight numbers on this package are too small to read comfortably from a shelf distance"*).
- **Finding:** Bridges the gap between strict court-admissible enforcement and public transparency.

### 2.3 Screen 3: Section 63 BSA 2023 Evidence Audit
- Visualizes the Merkle DAG chain-of-custody for digital evidence.
- Confirms electronic evidence custody status as `VERIFIED & AUDITABLE`.
- Displays device serial, operating system kernel version, monotonic clock status, and root SHA-256 hash.
- **Finding:** Instills immediate confidence in legal judges and technical auditors.

### 2.4 Screen 4: LMPC Statutory Schedules Reference
- Provides an interactive reference table of Table-I font schedules, standard units, and compounding fees.
- Allows officers to cross-check statutory requirements directly within the application without consulting paper gazette notifications.

### 2.5 Screen 5: Dossiers & Show Cause Notices
- Lists generated Form-1 notices, Section 63 BSA certificates, and compounding recommendation summaries.
- Allows downloading high-fidelity ReportLab PDF/A legal notices with embedded photographic crops and cryptographic QR codes.

### 2.6 Screen 6: Standalone Test HUD (`/test-ui/`)
- A zero-build, lightweight HTML/JS test runner served directly by FastAPI at `http://127.0.0.1:8000/test-ui/`.
- Enables testing all 6 Golden SKUs, inspecting raw JSON contracts, viewing calibrated SVG crops, and executing live pipeline runs without launching Node.js or Vite.

---

## 3. State Completeness Audit

Every production web application must handle all asynchronous lifecycles. We tested MetroLens across the standard state matrix:

| State | Implementation in MetroLens | Audit Finding |
| :--- | :--- | :---: |
| **Idle State** | Displays placeholder inspection desk with clear "New Inspection Case" primary action | **PASS** |
| **Loading State** | Skeleton loaders and progress indicators during pipeline execution | **PASS** |
| **Success State** | Renders 4-state badges (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`) with color and icons | **PASS** |
| **Borderline State** | Amber badge for `REVIEW` with tooltip explaining sensor uncertainty band ($k=2$) | **PASS** |
| **Optical Failure State**| Purple badge for `UNABLE_TO_VERIFY` with actionable retake guidance (not marked as non-compliant) | **PASS** |
| **Retry State** | Idempotent "Retry Inspection" and "Recapture Evidence" actions preserve case ID without duplication | **PASS** |
| **Empty State** | Clean informative empty states when no cases match search filters | **PASS** |

---

## 4. Accessibility (a11y) & Usability Audit (WCAG 2.1 AA)

| Accessibility Criterion | Compliance Mechanism | Audit Finding |
| :--- | :--- | :---: |
| **Color Contrast** | Dark slate backgrounds (`#090d16`) with high-contrast text (`#f8fafc`, `#38bdf8`) | Passes WCAG AAA ($> 7:1$) |
| **Non-Color-Only Status**| Every verdict uses text labels + distinct SVG icons (Check, X-Circle, Alert-Triangle, Eye-Off) | **PASS** |
| **Keyboard Navigation** | All buttons, tabs, dropdowns, and interactive tokens are reachable via `Tab` and `Enter` | **PASS** |
| **ARIA Attributes** | Tooltips and overlays implement `aria-label` and `role="region"` | **PASS** |
| **Semantic HTML** | Uses `<header>`, `<main>`, `<nav>`, `<aside>`, and heading levels (`h1`, `h2`, `h3`) properly | **PASS** |
| **Touch Targets** | All interactive buttons and controls have minimum hit targets $\ge 44 \times 44\text{ px}$ | **PASS** |

---

## 5. Identified UX Refinements & Minor Polish Items

1. **Adjudication Notice Generation UI Flow:**
   When an officer clicks "Form-1 Notice PDF" on an inspection that already had a certificate created, the UI currently catches the backend 500 error and displays a generic toast. The UI should display a clearer status indicating whether a notice has already been drafted or filed.
2. **Loupe Mobile Touch Handling:**
   The pixel loupe works via mouse hover on desktop. On mobile touchscreens, dragging the loupe can occasionally compete with mobile pinch-to-zoom gestures. A dedicated "Freeze Loupe Position" toggle button would enhance tablet field usability.
