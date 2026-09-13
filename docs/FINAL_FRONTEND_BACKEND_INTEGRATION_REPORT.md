# FINAL_FRONTEND_BACKEND_INTEGRATION_REPORT.md

NyayaDrishti-LM / NIRIKSHAK — Frontend ↔ Backend integration check (2026-09-13)
Frontend: `ui-combined` (React 18 + Vite, `ApiService` adapter). Backend: FastAPI dev server at `127.0.0.1:8000`, reached through the Vite proxy `/api/v1` (Mode A). Mode B local-resilient fallback engages on network failure and is surfaced honestly (never as success).

## Contracts exercised live (Mode A)
| Frontend call | Backend route | Observed result |
|---|---|---|
| `getDashboardSummary` | `GET /dashboard/summary` | Live counts rendered on Dashboard KPI strip |
| `listInspections({circleId})` | `GET /inspections?circle_id=…` | 50 live cases in Register and Reports (after BUG-05 fix) |
| `getInspection(id)` | `GET /inspections/{id}` | Full case: evidence images, extracted fields, evaluations, audit trail |
| `createInspection` | `POST /inspections` | Case registered; app navigates to the new case |
| `uploadEvidence` | `POST /inspections/upload` | SHA-256 + quality gate returned; original-resolution invariant honored (no client downscale) |
| `executePipeline` / `executeBatchPipeline` | `POST /pipeline/execute/{imageId}` · `POST /inspections/{id}/pipeline/batch` | Extracted fields + rule evaluations cached client-side (session bridge) and rendered |
| `submitAdjudication` | `PATCH /inspections/{id}/adjudicate` | Requires officer remarks; verdict recorded |
| `generateNotice` | `POST /notices/generate` (Controller auth) | RBAC-gated; PDF URL resolution per contract |
| `deleteInspection` | `DELETE /inspections/{id}` | Deleted-ID registry hides case across adapters and reloads |
| Auto-auth | `POST /auth/login` (inspector/controller) | Token cached in StorageService; 401 → re-auth once, then fail honestly |

## Mismatches found & fixed in this pass
1. **Reports circle-ID mismatch (BUG-05):** frontend sent `DL_SOUTH_01`, backend stores `CIRCLE_DL_SOUTH_01` → distribution read 0 cases. Fixed to canonical circle IDs; verified 50/33-FAIL parity with the Register.
2. **Reports date filtering (BUG-06):** backend list endpoint has no date-range param; period selector is now an honest client-side `created_at` filter instead of a dead control.
3. **Pending ≠ UNABLE (BUG-07):** distribution no longer folds `PENDING_REVIEW` into "Degraded Evidence (UNABLE_TO_VERIFY)".

## Data consistency verified
- Refresh / back-forward / direct-URL on case and evidence routes → same case data (live fetch each mount; in-memory pipeline-artifact cache keyed by case/image ID prevents stale cross-contamination).
- Delete → reload → case stays hidden (deleted-ID registry persisted in localStorage, filtered across live+mock adapters).
- Mock-purge guard: `ApiService` boot clears accidental MOCK latch and purges mock cases carrying live `insp_*` UUIDs, so stale mock data never masks live data.

## Database
Verified indirectly through the live API (read-only posture): register count, case detail, and Reports distribution all derive from the same persisted rows. No direct DB writes were performed during the audit.

## Remaining integration notes
- Per-finding adjudication is intentionally refused by the live adapter (no backend endpoint per contract 07 §3.3) — the UI surfaces the case-level adjudication path instead of faking persistence (verified: error path explains remediation).
- Known dev gaps handled in the adapter: audit-trail 404 → empty honest list; close-inspection 404 → falls back to case-level adjudication with `CLOSE_INSPECTION_COMPLIANT`.
- Mode B fallback writes to the local datastore only and never claims backend persistence.
