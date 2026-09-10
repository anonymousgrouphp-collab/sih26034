# Member 6 Tasks — Frontend, Web UX & Integration
**Assigned Engineer:** **Urvashi Rajput** ([@rajputurvashi2006-bit](https://github.com/rajputurvashi2006-bit))  
**Branch:** `feat/m6-ui`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Design Tokens & Mock API Setup (Chunk 1 & Chunk 2)
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/api/`, `tests/`, `src/`.
- [x] Create mock API fixtures for all primary REST endpoints.
- [x] Set up React 18 + Vite + Tailwind CSS scaffolding with government palette tokens (`#1B365D`, `#059669`, `#DC2626`).
- [x] Implement canonical typed domain models (`src/types/inspection.ts`).
- [x] Implement standalone Mock API Service adapter and Golden SKU adapters (`src/services/`).

### Day 2: Inspection Desk & New Case Registration Flow (Chunk 3)
- [x] Implement official government Header with GOI branding, circle selector, and officer profile (`Header.tsx`).
- [x] Implement professional inspector navigation Sidebar rail with Desk, Audit, and Schedules (`Sidebar.tsx`).
- [x] Implement 4-State Epistemic Verdict badge and operational Workflow Status badge (`StatusBadge.tsx`).
- [x] Implement connectivity badge for Mode A / Mode B / Offline status indication (`ConnectivityBadge.tsx`).
- [x] Implement accessible Modal dialog with focus trapping and keyboard navigation (`Modal.tsx`).
- [x] Implement central Inspection Desk work queue with KPI metrics, status/verdict filters, search, and case register table (`InspectionDesk.tsx`).
- [x] Implement guided New Case Registration modal with Rule 6(1)(a) validation and dynamic case creation (`NewInspectionModal.tsx`).
- [x] Wire components into main application flow with notification banners (`App.tsx`).
- [x] Implement automated test suite covering desk querying, filtering, workflow vs verdict separation, and input validation (`tests/desk_new_case.test.ts`).

### Day 3: Evidence Intake & Inspection Analysis HUD (Chunk 4)
- [x] Implement compact Case Shell Header displaying case details, workflow badge, and verdict (`CaseHeader.tsx`).
- [x] Implement Evidence Intake dropzone with MIME and 15MB file size validation (`EvidenceIntake.tsx`).
- [x] Implement untouched original evidence preview preserving original filename, dimensions, and SHA-256 (`EvidenceIntake.tsx`).
- [x] Implement 4-state demo fixture quick selectors (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`).
- [x] Implement 6-Stage Pipeline Progression HUD (`AnalysisHUD.tsx`).
- [x] Implement Optical Quality Gate diagnostic card with glare, blur, and skew telemetry (`AnalysisHUD.tsx`).
- [x] Implement UNABLE_TO_VERIFY handling communicating evidence inadmissibility without conflating as FAIL (`AnalysisHUD.tsx`).
- [x] Implement Metric Calibration status card with ArUco 50mm method and scale factors (`AnalysisHUD.tsx`).
- [x] Implement Multilingual OCR diagnostic summary preserving Devanagari Hindi and Indic numerals (`AnalysisHUD.tsx`).
- [x] Implement CaseWorkspace coordinating intake and dual-column inspection view (`CaseWorkspace.tsx`).
- [x] Implement automated test suite covering evidence intake, optical rejection, pipeline progression, and retry (`tests/evidence_hud.test.ts`).

### Day 4: Flagship Split-View Adjudication Canvas & Evidence Ingestion HUD (Chunk 5)
- [ ] Implement dual-pane layout: Calibrated image canvas with pixel loupe (left) + Statutory rule ledger (right).
- [ ] Implement interactive bounding box visual overlays with confidence coloring.
- [ ] Implement officer override dialog with mandatory justification remarks logging.
- [ ] Implement dynamic Merkle DAG interactive visualizer and Form-1 Legal Notice preview.
- [ ] Complete Definition of Done checklist.
- [ ] Finalize end-to-end demo flow matching the 3-minute jury pitch script (`12_DEMO_PLAN.md`).
