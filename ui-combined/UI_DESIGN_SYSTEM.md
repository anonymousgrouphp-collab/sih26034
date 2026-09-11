# NyayaDrishti-LM UI Design System & Component Architecture Specification

**Product:** NyayaDrishti-LM (SIH26034)  
**Classification:** Government-Service-Grade Legal Metrology Verification Platform  
**Compliance Standards:** GIGW 3.0 (Guidelines for Indian Government Websites), WCAG 2.1 AA, ISO 9241-110 Ergonomics  
**Framework Stack:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion  

---

## 1. Design Principles & Aesthetic Philosophy

1. **Government-Service-Grade Authority:** Avoid consumer-app frivolous minimalism or playful illustrations. Use structured, authoritative styling, dignified typography, and national government motifs (Ashoka Pillar emblem, National Flag palette accents).
2. **Honest & Non-Deceptive Branding:** Maintain strict compliance with statutory guidelines. The system presents as a dedicated statutory inspection assistant for the Department of Consumer Affairs without deceptively masquerading as a sovereign `.gov.in` domain.
3. **Ergonomic Simplicity for Non-Technical Officers:** Minimize multi-nested views. Present complex photogrammetry and deep learning inference in clean, actionable summary cards with clear plain-language tooltips.
4. **Evidentiary Rigor & Traceability:** Every measurement, OCR token, and rule evaluation must visually link to its underlying physical evidence asset and canonical SHA-256 hash digest.
5. **High-Contrast & Sunlight Readability:** Built for field officers operating in direct sunlight; all primary status indicators maintain a minimum contrast ratio of $4.5:1$ against backgrounds.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Primary & Institutional Colors

| Token Name | Hex Code | Tailwind Equivalent | Role & Application |
| :--- | :--- | :--- | :--- |
| `--gov-navy-dark` | `#0E213D` | `bg-govNavy-dark` | High-contrast top headers, deep authority elements |
| `--gov-navy` | `#1B365D` | `bg-govNavy` | Primary institutional brand color, active navigation tabs |
| `--gov-navy-light`| `#2C4D7D` | `bg-govNavy-light` | Hover states, secondary action buttons |
| `--tiranga-saffron`| `#FF9933` | `border-amber-400` | Sovereign accent line, active indicator accents |
| `--ashok-gold` | `#D97706` | `text-amber-600` | Legal notices, fiducial marker callouts |
| `--slate-surface` | `#F8FAFC` | `bg-slate-50` | Primary page background, container surface |
| `--slate-card` | `#FFFFFF` | `bg-white` | Elevated cards, forms, canvas wrapper surfaces |
| `--slate-border` | `#E2E8F0` | `border-slate-200` | Standard dividing borders and card outlines |

### 2.2 4-State Epistemic Statutory Verdict Tokens

The platform enforces a strict 4-state statutory evaluation taxonomy under the Legal Metrology Act, 2009:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│     PASS     │   │     FAIL     │   │    REVIEW    │   │UNABLE_TO_VER.│
│ Full Statutory│   │ Established  │   │  Borderline  │   │ Quality Gate │
│  Compliance  │   │  Violation   │   │  Band (k=2)  │   │   Deficit    │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

| Epistemic State | Surface Hex | Text Hex | Border Hex | Tailwind Style | Legal Consequence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PASS** | `#ECFDF5` | `#065F46` | `#A7F3D0` | `bg-emerald-50 text-emerald-800 border-emerald-300` | Compliant with statutory schedule; clear for trade. |
| **FAIL** | `#FFF1F2` | `#9F1239` | `#FECDD3` | `bg-rose-50 text-rose-800 border-rose-300` | Violation established; Form-1 notice generated. |
| **REVIEW** | `#FFFBEB` | `#92400E` | `#FDE68A` | `bg-amber-50 text-amber-800 border-amber-300` | Measurement within sensor uncertainty ($k=2, 95\%$ confidence); human officer adjudication required. |
| **UNABLE_TO_VERIFY** | `#F1F5F9` | `#475569` | `#CBD5E1` | `bg-slate-100 text-slate-700 border-slate-300` | Severe blur, glare bloom, or fiducial missing; retake required. |

---

## 3. Typography & Hierarchy

The interface utilizes a dual-typeface strategy separating administrative interaction from forensic telemetry.

### 3.1 Primary UI Font Family: Sans-Serif (`Inter`, system-ui)
* **Headings (Page/Section):** `text-base` to `text-xl`, `font-bold` / `font-black`, `tracking-tight`, `text-slate-900`.
* **Card Titles & Headers:** `text-xs` to `text-sm`, `font-bold`, `uppercase`, `tracking-wider`, `text-govNavy` or `text-slate-700`.
* **Body Copy:** `text-xs` to `text-sm`, `font-normal` / `font-medium`, `text-slate-600` / `text-slate-700`.
* **Field Photography Rules:** `text-xs`, `leading-relaxed`, high-legibility contrast.

### 3.2 Evidentiary & Telemetry Font Family: Monospace (`JetBrains Mono`, `SFMono-Regular`, `Consolas`)
* **Inspection Case IDs:** `text-xs`, `font-mono`, `font-bold`, `tracking-normal`.
* **SHA-256 Digests:** `text-[11px]`, `font-mono`, `break-all`, `select-all`, `text-slate-600`.
* **Calibrated Dimensions:** `text-xs`, `font-mono`, `font-semibold` (e.g., `0.260 mm/px`, `4.2 mm`).
* **Section 63 BSA Digital Signatures:** `text-[10px]`, `font-mono`, `uppercase`.

---

## 4. Component Patterns & Specifications

### 4.1 5-Stage Statutory Pipeline Stepper (`PipelineStepper.tsx`)
* **Architecture:** Horizontal responsive step progress track with connecting lines.
* **States:** `completed` (green circle with checkmark), `active` (pulsing blue ring), `failed` (rose circle with exclamation mark), `pending` (slate circle).
* **Stages:**
  1. Evidence Capture (Laplacian blur & glare gate)
  2. Multilingual OCR (DBNet++ text detection & PP-OCRv4 recognition)
  3. Metric Calibration (ArUco 4x4 scale calibration & homography)
  4. Rule Evaluation (LMPC Table-I font schedule & Rule 6 verification)
  5. Officer Adjudication (Human-in-the-loop statutory sign-off)

### 4.2 Statutory Declarations Card (`StatutoryDeclarationsCard.tsx`)
* **Purpose:** Core human-in-the-loop review interface for Rule 6 mandatory package declarations.
* **Layout:** Responsive 2-column card grid displaying:
  - Commodity Generic Name (Rule 6(1)(b))
  - Net Quantity & Measurement Units (Rule 6(1)(c) & Section 11)
  - Maximum Retail Price & Tax Inclusivity (Rule 6(1)(e))
  - Unit Sale Price (USP) (Rule 6(1)(e))
  - Month & Year of Manufacture/Packing (Rule 6(1)(d))
  - Manufacturer / Packer / Importer Complete Postal Address (Rule 6(1)(a))
  - Consumer Care Contact Details (Rule 6(1)(f))
* **Interaction:**
  - Status badges (`Valid`, `Banned Unit Flagged`, `Missing`).
  - System extracted confidence score pill.
  - Officer inline editing modal/input.
  - One-click `Confirm` button registering officer human sign-off.

### 4.3 Calibrated Evidence Canvas (`EvidenceViewer.tsx`)
* **Stage Controls:**
  - View Toggle: `Original Capture (Untouched)` vs. `Derived Rectified View (Homography M1)`.
  - 10mm Calibrated Metric Grid Overlay (ADR-06 visual dimension grid).
  - 2.5x Optical Forensic Magnifying Loupe.
  - Zoom viewport controls (`-`, `+`, `Fit`, `Reset 100%`).
* **Overlay Layer:** SVG polygon coordinate stage mapping DBNet++ tokens directly onto physical packaging with hover tooltips and bidirectional click selection.

### 4.4 Section 63 BSA Digital Certificate & Form-1 Notice (`InspectionReportView.tsx`)
* **Visual Elements:**
  - Government of India State Emblem (`StateEmblem.tsx`).
  - Digital Stamp Seal (`GovStampSeal.tsx`) with dynamic inspection date and circle code.
  - Line-by-line statutory compliance matrix citing specific LMPC 2011 sub-rules.
  - Official compounding fee calculation and statutory 15-day appeal window.

---

## 5. GIGW 3.0 & Accessibility Standards

The application strictly adheres to the Guidelines for Indian Government Websites 3.0:
1. **GIGW Top Toolbar:**
   - Live Indian Standard Time (IST) clock: `DD MMM YYYY, HH:MM:SS IST`.
   - Font Resizing Utility: `A-` (Decrease), `A` (Default), `A+` (Increase).
   - High Contrast Mode Toggle: Inverts canvas and boosts luminance contrast for sunlight reading.
   - Vernacular Language Switcher: Instant toggle between English and Hindi (`हिंदी`).
   - Screen Reader Access Shortcut.
2. **Keyboard Navigation & ARIA Landmarks:**
   - All interactive buttons, canvas tokens, and tab switchers possess explicit `aria-label`, `role="button"`, and `tabIndex={0}` attributes.
   - Polygons on the canvas support `Enter` and `Space` key activation for screen reader users.
3. **Minimum Target Sizes:**
   - Mobile camera intake buttons and primary adjudication actions guarantee a minimum touch target of $44 \times 44\text{ px}$.
   - Desktop toolbar buttons maintain a minimum height of $32\text{ px}$ with clear spacing.
