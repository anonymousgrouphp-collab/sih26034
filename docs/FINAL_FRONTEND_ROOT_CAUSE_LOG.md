# FINAL_FRONTEND_ROOT_CAUSE_LOG.md

NyayaDrishti-LM / NIRIKSHAK (SIH26034) — Frontend Diagnostic & Repair Pass
Date: 2026-09-13 · Branch: `kunal-testing` · Scope: `ui-combined/`
Verification: Chrome DevTools live session (desktop 1440/1280 + mobile 390×844), `tsc --noEmit`, `npm run build`, `npm test` (162/162 pass).

> No commit, no push, no deploy, no git reset was performed. All changes remain in the working tree.

---

## BUG-01 — Design-token bug: entire Tailwind `cyan` scale dead (45 broken utilities)

- **Page(s):** Dashboard, Review Queue, Case Workspace, Reports, New Inspection, Header, others (45 utility usages across `src/`).
- **Symptom:** "Active Inspector" name rendered slate-800 (near-invisible) on the dark hero; case IDs on Review Queue rendered dark-on-dark; selected-state chips/toggles silently missing their backgrounds/borders/rings (e.g., Review Queue "Total Flagged Cases" card lost its dark glass and rendered white-on-white with a white "50").
- **Root cause:** `tailwind.config.js` defined `cyan: "#38bdf8"` inside `theme.extend.colors`. Assigning a single string to a name that collides with a default Tailwind palette **replaces the whole default scale** (`cyan-50`…`cyan-950`). Every `text-cyan-400`, `bg-cyan-500/10`, `ring-cyan-500/50`, `border-cyan-800/50` class in the codebase compiled to nothing; elements fell back to inherited dark text on dark panels.
- **Affected layer:** Design tokens (build config) → all consuming components.
- **Fix:** `cyan` is now a full scale object (DEFAULT `#38bdf8` brand accent + standard `50…950` steps). One-line root fix; all 45 utilities restored app-wide.
- **Regression:** `tsc --noEmit` clean; production build clean; 162/162 tests pass; live re-verification of Dashboard (officer name `rgb(34,211,238)`), Review Queue (readable "50", cyan case IDs), Reports (cyan case chips).
- **Status:** FIXED & VERIFIED.

## BUG-02 — Sidebar overflows viewport by 63 px; nav list clips mid-item

- **Page(s):** All authenticated workstation pages.
- **Symptom:** At the top of any page the sidebar bottom (officer card / Sign-out) sat ~62 px below the fold; the nav list clipped its last visible item mid-height ("Evidence Dossier" cut in half) with `scrollbar-hide` hiding any affordance.
- **Root cause:** Sidebar uses `lg:sticky lg:top-[70px] lg:h-[calc(100vh-70px)]`, tuned for the scrolled state (sticky Header = 70 px). At page top the stack is GovTopBar (63 px, non-sticky) + Header (69 px) = 132 px, so a `100vh-70px` sidebar starting at y=132 overshoots the viewport by 62 px. Additionally the nav scroll container hid its scrollbar, so overflow was undiscoverable.
- **Affected layer:** `components/layout/Sidebar.tsx` layout classes.
- **Fix:** Height changed to `lg:h-[calc(100vh-8.25rem)]` (132 px stack). Nav container scrollbar re-enabled (`custom-scrollbar`) so an overflowing list is scrollable-discoverable.
- **Regression:** Live geometry re-measured at 1280×732: aside spans 132→732 at page top (exact fit) and 70→732 stuck under the scrolled header; officer card fully visible.
- **Status:** FIXED & VERIFIED.

## BUG-03 — Dashboard "Recent Inspection Cases": ~330 px dead empty panel

- **Page(s):** Dashboard.
- **Symptom:** Large empty dark rounded panel below the recent-cases table (left 8-col card stretched to the right column's ~890 px height while its content ended at ~560 px).
- **Root cause:** Grid items stretch by default; the card was not a flex column, so its `max-h-[500px]` table viewport could not grow into the stretched card.
- **Fix:** Card is now `flex flex-col`; table wrapper is `lg:flex-1 lg:min-h-0 lg:max-h-none` (mobile keeps the 500 px cap). The stretched space became a live table viewport (more rows visible, sticky header intact).
- **Status:** FIXED & VERIFIED (table fills the card).

## BUG-04 — Review Queue KPI cards: selected state unreadable (white-on-light)

- **Page(s):** Review Queue.
- **Symptom:** The selected triage card ("Total Flagged Cases 50") was white text on a near-white background.
- **Root cause:** Selected-state classes were dead cyan utilities (`bg-cyan-500/10` compiled to nothing — BUG-01), so the card lost its dark surface over the light page background. Unselected cards kept `glass-panel` (dark) — only the selected one broke.
- **Fix:** BUG-01 fix restored the tint; additionally `glass-panel` was added to all three KPI card roots so the dark surface persists in both states.
- **Status:** FIXED & VERIFIED.

## BUG-05 — Reports page: outcome distribution showed "0 Cases" while the register holds 50

- **Page(s):** Reports.
- **Symptom:** PASS/FAIL/REVIEW/UNABLE all 0 + "No statutory inspection cases registered in selected reporting period" despite 50 live cases (33 FAIL).
- **Root cause:** Circle-ID format mismatch. The division `<option>` values (`DL_SOUTH_01`, default state included) were passed as `circle_id` to the API, while every real case carries jurisdiction `CIRCLE_DL_SOUTH_01`. The backend filtered to an empty set. (The Inspection Register works because it passes the canonical `CIRCLE_DL_SOUTH_01` from CircleContext.)
- **Affected layer:** `pages/Reports.tsx` (frontend state/contract mismatch).
- **Fix:** Option values and the `division` default now use canonical circle IDs (`CIRCLE_DL_SOUTH_01`, `CIRCLE_DL_CENTRAL_02`, `CIRCLE_UP_GBN_01`).
- **Regression:** Live re-check: "50 Cases", FAIL 33 (66%) — matches the register exactly.
- **Status:** FIXED & VERIFIED.

## BUG-06 — Reports "Reporting Period" selector was a dead control

- **Symptom:** Changing the period changed nothing (numbers identical).
- **Root cause:** No filtering existed; the live backend list endpoint exposes no date-range parameter.
- **Fix (honest, no fake):** Client-side `created_at` window filter (Sept-2026 / Aug-2026 / Q3-FY26) feeding the metrics and the report list; out-of-window data truthfully shows the existing empty state.
- **Status:** FIXED.

## BUG-07 — Reports "Degraded Evidence (UNABLE_TO_VERIFY)" absorbed all pending cases

- **Symptom:** UNABLE bar at 100% on a period where no case is UNABLE — every `PENDING_REVIEW` case was counted as degraded evidence, overstating evidence-quality failures.
- **Root cause:** Metric OR-clause `overall_status === "UNABLE_TO_VERIFY" || workflow_status === "PENDING_REVIEW"`.
- **Fix:** Row now counts only true `UNABLE_TO_VERIFY` outcomes. (Pre-analysis pending cases are work-in-progress, not a degraded-evidence outcome; the "50 Cases" chip still reports the full register.)
- **Status:** FIXED.

## BUG-08 — Login form fields had no programmatic labels (a11y + console issue)

- **Symptom:** Chromium DevTools issue "A form field element should have an id or name attribute"; screen readers announced unlabeled textboxes.
- **Root cause:** Visible labels were unassociated `<p>`/`<span>` text.
- **Fix:** Observed fixed in the current tree (inputs now carry `id`/`name` + associated `<label>`: `official-email`, `security-password`). Verified live.
- **Status:** FIXED (verified; fix landed in the shared working tree during this pass).

## BUG-09 — Dark-on-dark headings across dark glass panels (`.section-title` misuse)

- **Page(s):** New Inspection (stepper "Enforcement Verification Stages", Step-1/Step-2 section headers, inactive tab "Benchmark Test Cases", form field labels, upload warning), Reports ("Inspection Outcomes Distribution", "Official Departmental Reports & Notices", header chip, outcome count values).
- **Root cause:** `.section-title` (`@layer components`, `text-govNavy`) and light-theme text utilities (`text-slate-900`, `text-amber-700`, `text-slate-700`) were used inside dark `.glass-panel` sections. Components layer loses to utilities, so targeted `text-white`/`-400`/`-200` utilities fix it cleanly.
- **Fix:** Per-instance light-text overrides on dark panels (`section-title text-white`, `text-slate-200` labels, `text-amber-400` step labels, `text-slate-300 hover:text-white` inactive tabs). Light-surface usages (StatutoryDeclarationsCard, Evidence chain header strip) intentionally left dark-on-light.
- **Status:** FIXED & VERIFIED live (headings legible).

## BUG-10 — Settings hardcoded a false operating mode ("Mode B Standalone" while running Mode A live)

- **Page(s):** Settings → Enforcement Mode Telemetry.
- **Symptom:** Truthfulness defect (Phase-15 rule): telemetry claimed "Active Mode: Mode B (Local Resilient SQLite Standalone)" while the header and actual API traffic showed Mode A (Online).
- **Root cause:** Static string.
- **Fix:** Telemetry now derives from `ApiService.getOperatingMode()` (LIVE → "Mode A (Online — Live Backend)", otherwise "Mode B (Local Resilient Standalone)"), refreshed on a 3 s poll so auto-failover transitions are reflected.
- **Status:** FIXED.

## BUG-11 — Demo case tab switcher: last tab clipped; findings label squeezed tabs

- **Page(s):** `/inspections/SKU-DEMO-*` (Case Workspace header).
- **Symptom:** "Audit & Diagnostics" tab half-clipped with no scrollbar affordance (`no-scrollbar`) at 1280 px; "N statutory findings evaluated" label competed for space from `xl:` up.
- **Fix:** Findings label moved to `hidden 2xl:inline`, freeing tab space at the common 1280–1536 px band.
- **Status:** FIXED.

## BUG-12 — Case-ID copy chip could blow out the case header

- **Fix:** Truncation cap (`max-w-[160px] xl:max-w-[220px] truncate`) on the copyable case ID; full ID remains available via click-to-copy and tooltip.
- **Status:** FIXED.

---

## KNOWN LIMITATIONS (honest classification)

1. **Vision-canvas annotation labels can clip at pan edges on very small screens** — boxes are positioned relative to the evidence image; their `whitespace-nowrap` badges can extend past the visible pan region. Full text remains available via tooltip and the Annotations tab. Classified: **known limitation** (fixing requires per-label pixel clamping against the pan state; risk outweighs benefit now).
2. **Demo-count microcopy:** sidebar "Demo Scenarios (7)" / header "Demo Cases 7" count the 7-scenario demo catalog; the register's golden-SKU strip says "6 Golden Test Cases Ready" (6 pre-certified SKU-DEMO fixtures; the 7th is the Fortune Sunlite live case). Both numbers are individually correct; consider one unified label later.
3. **Main bundle is 1.4 MB (363 KB gzip)** — Vite chunk warning. No code-splitting was introduced in this pass (risk control); recommend route-level `React.lazy` as a follow-up.
4. **Concurrent editing session:** a second agent/workstream was actively editing `ui-combined` during this pass (Login form labels, page re-theming, desk components). Fixes here were coordinated by file-mtime monitoring to avoid clobbering; final states were re-verified in the browser after both change sets landed.
5. **Camera hardware path** (live capture, permission denial flows) could not be exercised in this environment — hardware dependency; code paths and the upload path were reviewed statically and via fixtures.
6. **Live backend was reachable** (Mode A): API persistence checks were performed through real endpoints (list/create flows observed in the register); deep DB-row inspection was kept read-only by design.
