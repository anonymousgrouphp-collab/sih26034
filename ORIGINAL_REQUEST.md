# Original User Request

## 2026-09-13T10:24:05Z

Dramatically elevate the **NIRIKSHAK** platform (Department of Consumer Affairs, Government of India) from its current baseline — which has skeleton loaders, basic sticky tables, and a minimal glassmorphism header — into a world-class, visually stunning GovTech enforcement portal that feels genuinely sovereign and modern, while strictly respecting WCAG 2.1 AA, `prefers-reduced-motion`, and all AGENTS.md guardrails.

Working directory: `c:\Users\kunal\Desktop\NIRIKSHAK\ui-combined`
Integrity mode: **demo** (pre-built libraries/frameworks for core UI functionality permitted; no AGPL-3.0 dependencies)

Reference codebase: `c:\Users\kunal\Desktop\NIRIKSHAK` — read AGENTS.md before touching anything.

---

## Context (What Was Already Done — Start From Here)

The following has already been implemented and must be **preserved**:
- Dark-slate base (`#0b1320`), surface (`#132238`), design token system in `tailwind.config.js`
- `framer-motion@13.2.0` + `LazyMotion` + `MotionConfig reducedMotion="user"` in `main.tsx`
- `AnimatePresence mode="wait"` page transitions in `App.tsx` via `AnimatedPage` wrapper
- `.glass` / `.glass-panel` CSS, `.skeleton` shimmer, `.btn-press`, `.card-lift`, `.animate-pop-in`, `.animate-overlay-in`, `.animate-fade-up`
- Custom scrollbars, floating label `.input-group`/`.input`/`.input-label`, `focus:border-cyan` focus rings
- `InspectionTable.tsx` with `isLoading` prop, sticky thead + sticky first column
- `StateEmblem.tsx`, `IndianNationalFlag.tsx`, `NirikshakBrandLogo.tsx` components

**The user explicitly said the current result is not good enough.** The work so far touches only the lowest-effort layer: CSS classes that were never used at scale across the real pages, and basic skeleton rows. The actual **page components** — Landing, Login, Dashboard, NewInspection, ReviewQueue, Rules, Reports, EvidenceDossier — are largely unstyled relative to the vision. Every major page and component needs a genuine visual upgrade applied to the actual JSX, not just new CSS utilities sitting unused.

---

## Requirements

### R1. Full-Page Visual Overhaul (Dark-Mode First, Government-Authentic)
Apply the platform's dark-slate design system comprehensively across every major page: `Landing.tsx`, `Login.tsx`, `Dashboard.tsx`, `NewInspection.tsx`, `ReviewQueue.tsx`, `Rules.tsx`, `Reports.tsx`, `EvidenceDossier.tsx`, `NotFound.tsx`, and `Unauthorized.tsx`. Each page must read as a cohesive part of the same high-authority government enforcement portal — not a default Tailwind template. Surfaces must use the `surface`/`base`/`glass`/`glass-panel` token system. Typography must use the govNavy/saffron/cyan accent hierarchy established in the design tokens. No page should have white backgrounds or light-mode defaults.

### R2. Motion & Micro-Interaction Uplift (All Major Components)
Apply purposeful, hardware-accelerated Framer Motion animations (using the already-installed library) to the components that matter most:
- **Dashboard KPI cards**: Staggered entrance with `delay` prop on each card (0ms, 75ms, 150ms, 225ms). Animated number count-up from 0 to final value on mount using `useMotionValue` + `useTransform`.
- **`Reveal` scroll-entrance**: Apply the existing `<Reveal>` component (already in `motion.tsx`) to every major section of `Landing.tsx`, `Rules.tsx`, and `Reports.tsx`.
- **Sidebar navigation**: Active nav item should have an animated indicator bar (`layoutId="nav-indicator"`) that slides between items on navigation.
- **Table row hover**: Rows in `Dashboard.tsx` and `InspectionTable.tsx` should use `whileHover` to subtly lift (`y: -1px`) via Framer Motion.
- **`NewInspection.tsx` pipeline stepper**: Each completed step should animate a checkmark draw (SVG `pathLength` from 0 to 1).
- **Modal open/close**: All modals should use `AnimatePresence` with `initial/animate/exit` variants (pop-in + fade) — not just CSS classes.

### R3. Component-Level Polish (Glassmorphism, Cards, Tables, Forms)
Upgrade the visual quality of the core component set to production-demo standard:
- **`GovFooter.tsx`**: All footer link columns should have hover underline-slide animations. The Ministry authority block should have a subtle gold top-border glow on hover.
- **`Header.tsx`**: The Jurisdiction Circle selector dropdown must use glassmorphism (`glass-panel`) and have a smooth expand/collapse animation.
- **`Sidebar.tsx`**: Add a glassmorphic frosted-glass background panel. Nav items must have smooth hover backgrounds. The collapsed/expanded state transition must be animated.
- **`KPICard.tsx`**: Add `card-lift` class, use `Reveal` for scroll entrance, and apply a radial gradient background highlight on the icon container based on `tone`.
- **`StatusBadge.tsx` / `VerdictBadge`**: The PASS/FAIL/REVIEW/UNABLE_TO_VERIFY badges must have subtle pulsing glow animations (border-glow keyframe for FAIL, gentle breathe for REVIEW).
- **`ReviewQueue.tsx`**: Each queue item card should expand/collapse using `AnimatePresence` with a height animation when the officer clicks to see details.
- **`EvidenceDossier.tsx`**: Evidence image thumbnails should have a hover zoom + border glow. The SHA-256 hash display should use a monospace reveal animation (character-by-character typed appearance on mount).

### R4. Landing Page — Sovereign Hero Redesign
`Landing.tsx` is the public-facing entry point seen by officers and stakeholders. It must be redesigned to feel like a genuine, authoritative government digital platform — not a generic SaaS landing page:
- A full-viewport dark hero section with the State Emblem prominently centered, the platform name in large bold Inter type, and a subtle animated radial gradient background (saffron/cyan tones bleeding through the dark base).
- The tricolor stripe must be prominent and properly weighted (not a 1px line).
- At least 3 feature/module cards with icon, title, and description — using `Reveal` scroll entrance with stagger.
- A "Login as Officer" CTA button with a radial gradient, subtle glow border, and `whileHover` scale/glow.

### R5. Build Integrity & Accessibility
All changes must:
- Pass `npm run build` (tsc + vite) with exit code 0 and zero TypeScript errors.
- Preserve all existing `prefers-reduced-motion` safeguards — no new animation should bypass the existing `MotionConfig reducedMotion="user"` or the CSS `@media (prefers-reduced-motion: reduce)` rule.
- Maintain WCAG 2.1 AA contrast on all text/background pairs. Do not introduce any text on a background where the contrast ratio drops below 4.5:1.
- Respect AGENTS.md folder boundaries: only modify files inside `ui-combined/` (and the root-level `NIRIKSHAK_UX_MOTION_UPGRADE.md`). Do not touch any `members/member-01` through `members/member-05` files or the `contracts/` directory.
- Zero AGPL-3.0 dependencies introduced. All new npm packages must be Apache-2.0, MIT, BSD-3-Clause, or PostgreSQL licensed.

---

## Acceptance Criteria

### Build & Type Safety
- [ ] `npm run build` inside `ui-combined/` exits with code 0 and produces `dist/index.html` with zero TypeScript errors.
- [ ] `npm run typecheck` (i.e., `tsc --noEmit`) passes with zero errors.

### Visual Coverage
- [ ] Every page in `src/pages/` (Landing, Login, Dashboard, NewInspection, ReviewQueue, Rules, Reports, EvidenceDossier, NotFound, Unauthorized) uses the dark-slate base (`#0b1320` or `bg-base`) as its background — not white or light-slate defaults.
- [ ] The `Landing.tsx` hero section renders the `StateEmblem` component and the platform name at `text-4xl` or larger on desktop viewports.
- [ ] `KPICard.tsx` uses the `card-lift` class and the `Reveal` component wrapper.

### Motion & Interaction
- [ ] Dashboard KPI cards have staggered entrance delays (each card delayed by at least 50 ms more than the previous).
- [ ] The `Sidebar.tsx` active nav item has a Framer Motion `layoutId` animated indicator.
- [ ] At least one modal in the codebase uses `AnimatePresence` with `initial/animate/exit` props (not just CSS `.animate-pop-in` classes).
- [ ] `ReviewQueue.tsx` has a card expand/collapse toggle with animated height (not `display:none` snap).

### Accessibility & GIGW 3.0
- [ ] `:focus-visible` outline remains `#38bdf8` (2px) — no regression.
- [ ] `@media (prefers-reduced-motion: reduce)` block in `index.css` remains present and covers `animation-duration` and `transition-duration`.
- [ ] All new decorative SVGs or icon-only elements have `aria-hidden="true"`.

### Documentation
- [ ] `NIRIKSHAK_UX_MOTION_UPGRADE.md` in the repo root is updated with a comprehensive second-pass changelog, covering all new components changed and verified build output.
- [ ] `members/member-06-ui/progress.md` has a new signed entry with timestamp and `npm run build` evidence.

---

## Verification Resources

The existing codebase at `c:\Users\kunal\Desktop\NIRIKSHAK\ui-combined\src` is the ground truth. The implementing team must:
1. Read all existing files before modifying — do not overwrite work that is already correctly done.
2. Run `npm run build` as the primary programmatic test gate.
3. An independent agent-as-judge audit should spot-check: (a) that `bg-base` or `bg-[#0b1320]` appears in the className of the root `<div>` or `<main>` of at least 5 distinct pages, (b) that `layoutId` appears at least once in the Sidebar, (c) that `AnimatePresence` is used in at least one modal component.
