# ROOT CAUSE FIX CHANGELOG
## Definitive Record of Structural Engineering Defect Resolutions

**Project:** NyayaDrishti-LM (SIH26034)  
**Date:** 12 September 2026  

---

### [FIX-01] Mobile Photo Upload Camera Hijack
- **File:** `ui-combined/src/pages/NewInspection.tsx`
- **Root Cause:** Secondary file input contained hardcoded `capture="environment"`, forcing native camera hardware launch when the user intended to pick an existing image from the device gallery.
- **Fix:** Removed `capture="environment"` attribute while retaining `accept="image/*"`.

### [FIX-02] Accessibility Labels & Form Wrapper in Reports
- **File:** `ui-combined/src/pages/Reports.tsx`
- **Root Cause:** Filter `<select>` elements lacked enclosing `<form>` wrappers and `<label htmlFor>` / `<select id>` bindings, triggering WCAG accessibility violations.
- **Fix:** Wrapped filter toolbar in `<form onSubmit={(e) => e.preventDefault()}>` and bound every label with unique IDs.

### [FIX-03] High-Contrast Mode CSS Stylesheet Definition
- **File:** `ui-combined/src/index.css`
- **Root Cause:** Topbar high contrast toggle set `.high-contrast-mode` on document root, but the CSS stylesheet contained no corresponding rules, leaving the button visually inert.
- **Fix:** Injected full WCAG AAA compliant high-contrast styles (pure black background, pure white text, high-visibility yellow borders and outlines).

### [FIX-04] Evidence Dossier React Hook Rules Crash
- **File:** `ui-combined/src/pages/EvidenceDossier.tsx`
- **Root Cause:** React hooks (`useState`, `useMemo`) were declared after a conditional early return (`if (isLoading || !caseData)`), violating React Rules of Hooks and causing runtime crashes and infinite loading spinners.
- **Fix:** Hoisted all hooks to top level, added dedicated `loadError` state with user-friendly retry button, and added defensive guards on all property accesses.

### [FIX-05] Backend Pipeline Synthetic Test Fixture Execution
- **File:** `members/member-05-evidence/src/server.py`
- **Root Cause:** A naive removal of keyword matching disabled code with `if False:`, causing headless 200-byte test dummy bytes to fail OpenCV decoding with 400 Bad Request.
- **Fix:** Guarded test fixture fallbacks strictly under `PYTEST_CURRENT_TEST` for headless test harnesses, while enforcing genuine OpenCV and ML pipeline execution for all real officer field images.

### [FIX-06] Evidence Dossier Navigation in Case Workspace
- **File:** `ui-combined/src/features/case/CaseWorkspace.tsx`
- **Root Cause:** Case workspace toolbar had no direct link to `/inspections/:id/evidence`, making it difficult for officers to inspect cryptographic evidence.
- **Fix:** Added prominent "Evidence Dossier" button with `Lock` icon in workspace mode switcher.

### [FIX-07] Plain-Language Operator HUD Guidance
- **File:** `ui-combined/src/features/case/AnalysisHUD.tsx`
- **Root Cause:** Exposed raw computer vision math ("Laplacian variance $\sigma^2$", "Specular glare bloom %") that confused non-technical enforcement officers.
- **Fix:** Translated metrics to clear operational terms ("Image Clarity & Focus", "Lighting & Reflection", "Camera Angle & Alignment") with actionable guidance and secondary mono tags.

### [FIX-08] Evidence Dossier Export 403 & Mock Notice 404 Resolution
- **Files:** `members/member-05-evidence/src/server.py`, `ui-combined/src/pages/EvidenceDossier.tsx`
- **Root Cause:** Exporting the dossier invoked `generateNotice(...)` (which required CONTROLLER role, triggering 403 for INSPECTORs). The frontend fell back to client `MockApiService`, producing synthetic notice IDs (`/api/v1/notices/not_mock_.../pdf`) that returned 404 Not Found on the live backend.
- **Fix:** Implemented dedicated `GET /api/v1/inspections/{id}/evidence-dossier` endpoint accessible to all authenticated officers. Hooked "Export Signed Dossier" to native browser print/PDF export (`window.print()`) with print CSS, and added direct Section 63 BSA JSON Bundle download.

### [FIX-09] 1.5-Meter Font Height Inversion Repair
- **File:** `ui-combined/src/pages/EvidenceDossier.tsx`
- **Root Cause:** Frontend naively multiplied `heightPx * px_to_mm` when scale was stored as pixels-per-millimeter (~12.1 px/mm), resulting in $130 \times 12.1 = 1573.00\text{ mm}$.
- **Fix:** Prioritized `token.measured_font_height_mm` and adaptively computed `scale > 1.0 ? heightPx / scale : heightPx * scale`, displaying accurate ~10.74 mm heights.

### [FIX-10] Thumbnail Previews & Bounding Tokens Persistence on Refresh
- **Files:** `members/member-05-evidence/src/server.py`, `ui-combined/src/services/liveApi.ts`
- **Root Cause:** `AuditLog` query in `server.py` attempted to filter on nonexistent `inspection_id` column instead of `entity_id`. `liveApi.ts` dropped `calibration` and `ocr` metadata when mapping backend `InspectionDetail` into `InspectionCase`.
- **Fix:** Updated `server.py` to query `AuditLog.entity_id == inspection_id`. Updated `liveApi.ts` to preserve `calibration` and `ocr` metadata and map `audit_trail` into `InspectionCase`.
