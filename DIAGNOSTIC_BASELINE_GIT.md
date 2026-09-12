# DIAGNOSTIC BASELINE GIT STATE

**Project:** NyayaDrishti-LM (SIH26034)
**Recorded:** 2026-09-12 ~21:28 IST
**Purpose:** Forensic audit baseline — NOT a release checkpoint

---

## Current Branch

```
kunal-testing-branch
```

> ⚠️ This is NOT an approved canonical branch per AGENTS.md Section 10. Approved branches are: `main`, `dev`, `feat/m1-cv-metrology`, `feat/m2-ocr`, `feat/m3-extraction`, `feat/m4-rule-engine`, `feat/m5-evidence`, `feat/m6-ui`.

---

## 10 Most Recent Commits

```
9689734 chore: add detailed PDF and handoff document
171acae chore: save local state with testing reports and mock removals
05cf923 merge: synchronize latest origin/main baseline into kunal-project-testing
8173f71 feat(ui): harmonize multi-angle navigation, workspace mode switcher, and evidentiary flows
011c9f6 fix(ui): eliminate camera flicker, support multi-angle uploads and real packaging extraction
2e82d5b feat(ui,backend): calibrate dynamic bounding box overlays and eliminate dummy fallbacks
b0fe665 docs(ui): log origin/main synchronization and full-stack test verification
43064ab fix(ui): resolve packaging image paths to authentic photographs and prevent black canvas
621f1fe fix(ui): harmonize getInspection resolution for MOCK mode test mutability
539dbeb merge: integrate origin/main live postgres persistence with certified demo suite
```

---

## Uncommitted Modified Files (at diagnostic start)

```
 M members/member-05-evidence/src/server.py
 M ui-combined/src/features/case/AnalysisHUD.tsx
 M ui-combined/src/features/case/CaseWorkspace.tsx
 M ui-combined/src/index.css
 M ui-combined/src/pages/EvidenceDossier.tsx
 M ui-combined/src/pages/NewInspection.tsx
 M ui-combined/src/pages/Reports.tsx
 M ui-combined/src/services/api.ts
 M ui-combined/src/services/liveApi.ts
 M ui-combined/src/types/inspection.ts
 M ui-combined/tests/api_adapter.test.ts
```

---

## Untracked Files Created (diagnostic artifacts — not production code)

```
?? API_DIAGNOSTIC_MATRIX.csv
?? DIAGNOSTIC_BASELINE_GIT.md
?? DIAGNOSTIC_ISSUE_REGISTER.csv
?? FINAL_COMPLETE_PROJECT_DIAGNOSTIC_REPORT.md
?? FINAL_FRONTEND_BACKEND_DB_VALIDATION.md
?? FINAL_REAL_DATA_FUNCTIONALITY_MATRIX.csv
?? FINAL_ROOT_CAUSE_FIX_LOG.md
?? FINAL_TRUTH_VALIDATION.md
?? FINAL_UX_IMPLEMENTATION_REPORT.md
?? REAL_DATA_DIAGNOSTIC_MATRIX.csv
?? REAL_OFFICER_WORKFLOW_AUDIT.md
?? file_list.txt
?? ui-combined/tests/evidence_dossier.test.ts
```

---

## Database State at Baseline

**File:** `legal_metrology_mode_b.db` (SQLite, 1.37 MB)

| Table | Rows |
|---|---|
| jurisdictions | 1 |
| users | 4 |
| inspections | 268 |
| audit_logs | 217 |
| evidence_images | 155 |
| bsa_certificates | 100 |
| bounding_boxes | 235 |
| legal_notices | 22 |
| compliance_evaluations | 1265 |

**Critical observation:** All 268 inspections have `synced_to_central = 0` — no sync has ever succeeded.

---

## Python Environment

| Python | Path |
|---|---|
| System | `C:\Python314\python.exe` (Python 3.14) |
| Virtual env | `.venv/` (Python 3.13 per AGENTS.md — `.venv` exists in root) |
| AGENTS.md specified | `C:\Users\ceoha\AppData\Local\Programs\Python\Python313\python.exe` (different user — path in rule is for `ceoha`, not `kunal`) |

---

## Real Product Image Inventory

| Category | Files |
|---|---|
| Earbuds | ~6 .jpeg |
| Herbal hair oil | ~6 .jpeg |
| Item 1 - Watch | ~10 .jpg |
| Item 2 - General Wellness | ~11 .jpg + manifest.pdf |
| Urvashi sample skus (4 sub-items) | ~40+ .jpg |
| **Total** | **94 files (75 images + 19 non-image)** |

---

## Key Source Files (Diagnostic Read Timestamps)

| File | Size | Diagnostic Read |
|---|---|---|
| `ui-combined/src/services/api.ts` | 18.9 KB (527 lines) | FULLY READ |
| `ui-combined/src/services/liveApi.ts` | 29.2 KB (751 lines) | FULLY READ |
| `ui-combined/src/services/mockApi.ts` | 40.1 KB (1009 lines) | HEADER READ (1–60) |
| `ui-combined/src/services/mockData.ts` | 85.0 KB (2325 lines) | SECTIONS READ (1–260) |
| `ui-combined/src/services/demoFixtures.ts` | 9.9 KB (318 lines) | HEADER READ (1–60) |
| `members/member-05-evidence/src/server.py` | 84.5 KB (2073 lines) | KEY SECTIONS READ |
| `legal_metrology_mode_b.db` | 1.37 MB | QUERIED VIA SQLITE3 |

---

*This baseline documents the state of the repository at the start of the diagnostic audit. No production fixes were applied.*
*SIGNED OFF BY: antigravity-49d4e174 (forensic-audit@sih26034) — 2026-09-12 21:28 IST [DIAGNOSTIC BASELINE ONLY — NOT A RELEASE]*
