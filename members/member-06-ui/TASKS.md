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

### Day 4: Flagship Split-View Adjudication Canvas & Bidirectional Traceability (Chunk 5)
- [x] Implement dual-pane layout: Calibrated packaging image canvas with pixel inspection loupe (left) + Statutory rule ledger (right) (`AdjudicationCanvas.tsx`).
- [x] Implement interactive SVG bounding polygon overlays with status styling, hover tooltips, and bidirectional highlighting (`EvidenceViewer.tsx`).
- [x] Implement 4-state statutory compliance triage ledger (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`) with filter tabs and count badges (`FindingsLedger.tsx`).
- [x] Implement forensic detail panel for extracted fields, raw OCR streams, and rule engine findings (`FieldDetailPanel.tsx`).
- [x] Implement multilingual OCR token inspector preserving Devanagari Hindi (`शुद्ध मात्रा: २०० ग्राम`), Indic numerals (`२००`), and Rupee symbol (`₹`) (`FieldDetailPanel.tsx`).
- [x] Implement bidirectional relational traceability: `Finding ↔ Extracted Field ↔ OCR Token ↔ Image Polygon ↔ Evidence ID` (`AdjudicationTraceability.ts`).
- [x] Implement Human-in-the-Loop Officer Adjudication modal with mandatory justification remarks validation (`OfficerAdjudicationModal.tsx`).
- [x] Update Mock API service to record officer decisions with audit log preservation (`api.ts`, `mockData.ts`).
- [x] Implement comprehensive automated test suite verifying bidirectional traceability, SVG polygon rendering, 4-state epistemic triage, Unicode preservation, backend truth invariants, and officer overrides (`tests/adjudication_canvas.test.ts`).

### Day 5: HITL Decision Workflow, Audit Trail, Evidence Provenance & Handoff Readiness (Chunk 6)
- [x] Implement dynamic Evidence DAG visualizer with Section 63 BSA 2023 evidence node inspection (`EvidenceProvenancePanel.tsx`).
- [x] Implement chronological append-only audit timeline distinguishing SYSTEM pipeline events from OFFICER adjudications (`AuditTimeline.tsx`).
- [x] Implement finding-level officer decision workflow preserving automated findings without mutation (`FindingsLedger.tsx`, `FieldDetailPanel.tsx`, `api.ts`).
- [x] Implement downstream case handoff readiness checklist and action guidance without autonomous notice generation (`CaseHandoffState.tsx`).
- [x] Implement automated test suite covering HITL decision immutability, append-only audit, dynamic DAG, and readiness state (`tests/hitl_audit_provenance.test.ts`).
- [x] Complete Definition of Done checklist and verify zero prohibited claims.
