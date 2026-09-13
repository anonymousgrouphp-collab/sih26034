# DISPATCH Log

## 2026-09-13T10:38:20Z
You are the Project Orchestrator (teamwork_preview_orchestrator) for the NIRIKSHAK GovTech enforcement platform UI visual overhaul.

## Working Directory & Metadata
Your working directory is: `c:\Users\kunal\Desktop\NIRIKSHAK\.agents\orchestrator_2`.
All your coordination files (plan.md, progress.md, BRIEFING.md, handoffs) MUST live in this folder.
Do NOT place any source code or build artifacts inside `.agents/`.
(Note: Predecessor orchestrator at `.agents/orchestrator_1` encountered a host network drop during early survey; you are launching with clean context).

## Authoritative User Intent
Read and follow `c:\Users\kunal\Desktop\NIRIKSHAK\.agents\ORIGINAL_REQUEST.md` (and `c:\Users\kunal\Desktop\NIRIKSHAK\ORIGINAL_REQUEST.md`) verbatim.
The project codebase is located at `c:\Users\kunal\Desktop\NIRIKSHAK\ui-combined`.

## Critical Rules & Boundaries (AGENTS.md)
- Strictly observe `c:\Users\kunal\Desktop\NIRIKSHAK\AGENTS.md`.
- You are working on Member 6 (UI): touch ONLY files in `c:\Users\kunal\Desktop\NIRIKSHAK\ui-combined\`, `c:\Users\kunal\Desktop\NIRIKSHAK\NIRIKSHAK_UX_MOTION_UPGRADE.md`, and `c:\Users\kunal\Desktop\NIRIKSHAK\members\member-06-ui\progress.md`.
- DO NOT touch `members/member-01` through `members/member-05` or `contracts/`.
- ZERO AGPL-3.0 dependencies. Only Apache-2.0, MIT, BSD-3-Clause, or PostgreSQL licensed packages allowed.
- Preserve all WCAG 2.1 AA contrast requirements and `prefers-reduced-motion` safeguards (`MotionConfig reducedMotion="user"` and `@media (prefers-reduced-motion: reduce)`).

## Requirements to Deliver
1. **R1. Full-Page Visual Overhaul**: Dark-slate base (`#0b1320` / `bg-base`) and surface token system applied across all pages:
   `Landing.tsx`, `Login.tsx`, `Dashboard.tsx`, `NewInspection.tsx`, `ReviewQueue.tsx`, `Rules.tsx`, `Reports.tsx`, `EvidenceDossier.tsx`, `NotFound.tsx`, `Unauthorized.tsx`.
   No white/light-mode backgrounds or default templates. Authentic sovereign GovTech look.
2. **R2. Motion & Micro-Interaction Uplift**:
   - Dashboard KPI cards: staggered entrance (0ms, 75ms, 150ms, 225ms) + animated count-up via `useMotionValue` + `useTransform`.
   - `<Reveal>` scroll-entrance applied across major sections in `Landing.tsx`, `Rules.tsx`, `Reports.tsx`.
   - `Sidebar.tsx`: active nav item indicator bar with `layoutId="nav-indicator"`.
   - Table row hover: `whileHover={{ y: -1 }}` in `Dashboard.tsx` and `InspectionTable.tsx`.
   - `NewInspection.tsx` pipeline stepper: animated checkmark draw (SVG `pathLength` from 0 to 1).
   - Modal open/close: `AnimatePresence` with `initial/animate/exit` variants.
3. **R3. Component-Level Polish**:
   - `GovFooter.tsx`: hover underline-slide animations, gold top-border glow on authority block.
   - `Header.tsx`: glassmorphic circle selector with smooth expand/collapse.
   - `Sidebar.tsx`: frosted glass panel, smooth hover, animated collapse/expand.
   - `KPICard.tsx`: `card-lift`, `Reveal`, radial gradient icon highlight.
   - `StatusBadge.tsx` / `VerdictBadge`: pulsing glow animations.
   - `ReviewQueue.tsx`: card expand/collapse with animated height in `AnimatePresence`.
   - `EvidenceDossier.tsx`: thumbnail hover zoom + border glow, monospace hash reveal animation.
4. **R4. Landing Page Sovereign Hero Redesign**:
   - Full-viewport dark hero, centered `StateEmblem`, bold title, animated radial gradient background, prominent tricolor stripe.
   - At least 3 module cards with `Reveal` stagger.
   - "Login as Officer" CTA with radial gradient, glow, and `whileHover`.
5. **R5. Build Integrity & Verification**:
   - `npm run build` in `ui-combined` must succeed with exit code 0 and zero errors.
   - `npm run typecheck` must pass with zero errors.
   - Update `NIRIKSHAK_UX_MOTION_UPGRADE.md` with complete second-pass changelog.
   - Update `members/member-06-ui/progress.md` with signed verification entry.

Maintain your `progress.md` regularly. When all requirements and acceptance criteria are fulfilled and verified, report completion with full evidence back to Sentinel.
