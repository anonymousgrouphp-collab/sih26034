# VISUAL_IDENTITY_GUIDE.md — NyayaDrishti-LM Design System & Visual Identity

**Product:** NyayaDrishti-LM (SIH26034) — Legal Metrology Compliance Workstation  
**Design System Level:** Government of India Institutional Service Grade (GIGW 3.0 Aligned)  
**Date:** 11 September 2026  
**Status:** CANONICAL DESIGN SPECIFICATION  

---

## 1. Visual Philosophy & Core Pillars

NyayaDrishti-LM's visual identity expresses three non-negotiable values:
1. **Sovereign Trust & Authority:** Evoking the dignity of the Department of Consumer Affairs, Government of India, through disciplined structure, authentic state emblems, and refined color harmony.
2. **Metrological Rigor & Precision:** Technical precision inspired by optical vernier calipers, laboratory reticles, homography calibration grids, and cryptographic SHA-256 Merkle proofs.
3. **Field Usability & Calm Clarity:** Zero visual clutter, legible typography, high contrast under bright sunlight, touch-friendly tap targets ($\ge 48\text{px}$), and clear epistemic color coding.

---

## 2. Color Palette & Design Tokens

### Primary Institutional Palette

```css
:root {
  /* Government Navy — Primary Sovereign Tone */
  --color-gov-navy-950: #071526; /* Deep Masthead Background */
  --color-gov-navy-900: #0A192F; /* Primary Brand & Header Bars */
  --color-gov-navy-800: #0F284E; /* Dark Card Borders & Accents */
  --color-gov-navy-700: #1E3A8A; /* Active Interactive Elements */

  /* Ashoka Saffron & Amber — Accents & Statutory Highlights */
  --color-saffron-500:  #FF9933; /* National Portal Tricolor Accent */
  --color-amber-500:    #F59E0B; /* Primary Action Highlights & Focus */
  --color-amber-600:    #D97706; /* Table-I Schedule Badges */
  --color-amber-700:    #B45309; /* Sub-headers on White */

  /* India Green & Verification Emerald — Compliance & Verification */
  --color-green-flag:   #138808; /* National Portal Flag Green */
  --color-emerald-600:  #059669; /* PASS Status, Calibrated Indicators */
  --color-emerald-500:  #10B981; /* Reticle Lock-on Borders */
  --color-emerald-50:   #ECFDF5; /* PASS Container Background */

  /* Violation Crimson — Statutory Non-Compliance */
  --color-crimson-600:  #DC2626; /* FAIL Status, Prohibited Unit Alerts */
  --color-crimson-700:  #B91C1C; /* Formal Notice Warnings */
  --color-crimson-50:   #FEF2F2; /* Violation Container Background */

  /* Sensor Slate & Technical Neutral — Surface & Text */
  --color-slate-900:    #0F172A; /* Primary Body Text */
  --color-slate-700:    #334155; /* Secondary Body Text */
  --color-slate-500:    #64748B; /* Meta Labels & Captions */
  --color-slate-200:    #E2E8F0; /* Card Borders & Dividers */
  --color-slate-50:     #F8FAFC; /* Card Backgrounds */
  --color-white:        #FFFFFF; /* Pure Surface White */
}
```

### 4-State Epistemic Status Coding

| Epistemic Verdict | Border / Text Token | Background Token | Symbolic Meaning |
| :--- | :--- | :--- | :--- |
| **PASS** | Emerald `#059669` | Light Emerald `#ECFDF5` | All LMPC Rules verified; Table-I font schedule met. |
| **FAIL** | Crimson `#DC2626` | Light Crimson `#FEF2F2` | Concrete statutory violation detected (e.g., prohibited unit `gms`). |
| **REVIEW** | Amber `#D97706` | Light Amber `#FFFBEB` | Measurement falls within sensor uncertainty band ($k=2, 95\%$ CI). |
| **UNABLE_TO_VERIFY** | Slate `#64748B` | Light Slate `#F1F5F9` | Degraded optical input (excessive blur or specular glare). |

---

## 3. Typography Hierarchy

The typographic system supports bilingual English and Devanagari Hindi text seamlessly:

1. **Primary Interface:** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
   - Clean, geometric, neutral, high legibility at micro sizes (10px - 12px).
2. **Bilingual Indic / Hindi:** `Noto Sans Devanagari, "Mangal", sans-serif`
   - Statutorily accurate letterforms for official Hindi declarations (*विधिक मापविज्ञान प्रभाग*).
3. **Metrological & Cryptographic Telemetry:** `JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace`
   - Fixed-width numerals for SHA-256 hashes, mm/px ratios, and coordinates ($x, y, w, h$).

### Scale Hierarchy:
- **Title H1:** `24px` to `32px` (Bold 800/900)
- **Section H2:** `18px` to `22px` (Bold 700/800)
- **Sub-header H3:** `14px` to `16px` (Bold 600/700)
- **Body Standard:** `13px` to `14px` (Regular 400 / Medium 500)
- **Technical Caption / Meta:** `10px` to `12px` (Semi-bold 600)
- **Micro Badge:** `9px` to `10.5px` (Bold 700, All Caps)

---

## 4. Iconography & Vector Asset Architecture

1. **System Utility Icons:** Curated from `lucide-react` with uniform `1.75px` or `2.0px` stroke widths.
2. **Statutory Custom Vectors:**
   - **Reticles:** Concentric target circles with corner crosshairs denoting optical alignment.
   - **Calibration Scale:** Dimension callouts with bilateral extension arrows and numeric tick marks.
   - **Dossiers:** Formal administrative binder folders with legal ribbon seals and stamp textures.
   - **Cryptographic Seal:** Double concentric ring with scalloped outer edge, internal Merkle tree branches, and Section 63 statutory citation.

---

## 5. UI Craft & Component Design Floor

1. **GIGW 3.0 Sovereign Masthead:** Every official page incorporates the sovereign top utility bar featuring the Indian Tricolor, national date/time in IST, contrast toggles, and font scaler (`A-`, `A`, `A+`).
2. **State Emblem Integrity:** The Lion Capital of Ashoka is presented in clean white monochrome within high-contrast dark navy surfaces or formal letterheads, always accompanied by the national motto *सत्यमेव जयते*.
3. **Zero Horizontal Layout Bleed:** All tabular data containers utilize `table-fixed w-full` with controlled column truncation or responsive card folding to ensure horizontal scroll is 100% eliminated on mobile and desktop viewports.
4. **Touch Targets:** All interactive buttons, camera triggers, and modal dismissals maintain a minimum bounding box of $44 \times 44\text{ px}$.
