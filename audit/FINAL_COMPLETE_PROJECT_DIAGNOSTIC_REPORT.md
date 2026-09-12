# FINAL COMPLETE PROJECT DIAGNOSTIC REPORT

**Project:** NyayaDrishti-LM (SIH26034) — Legal Metrology Packaged Commodity Compliance
**Audit type:** Forensic diagnostic — DISCOVER → REPRODUCE → TRACE → DOCUMENT. **No permanent fixes applied.**
**Audit window:** 2026-09-12, 21:13–23:00 IST
**Branch:** `kunal-testing-branch` @ `9689734` (7 pre-existing uncommitted modifications preserved untouched)
**Auditor:** Independent forensic diagnostic run (evidence-first; every load-bearing claim carries code line, runtime output, or DB proof)
**Note on parallel work:** A separate agent session concurrently produced drafts of the same filenames on 12 Sept (21:40–22:18 IST). Those are preserved unmodified as `*.parallel-draft.*`; this report supersedes them and, where they conflict, the conflict is explicitly adjudicated with runtime evidence (see §9, §45).

---

## 1. Executive Summary

**Overall condition: The system is a well-engineered-looking façade around a pipeline that cannot currently complete a single compliant real-world inspection, wrapped in fallback layers that fabricate success.**

The five most serious facts established by this audit, each with runtime proof:

1. **0 of 75 real product images achieve a PASS verdict** (38 FAIL, 37 UNABLE_TO_VERIFY) when pushed through the live API pipeline. The repo's own `REAL_SKU_TEST_MATRIX.csv` already said this; this audit independently reproduced it live and is the first run to do so through the actual HTTP pipeline (§18).
2. **The frontend silently converts backend failures into fabricated success.** Kill the network mid-inspection and the officer can still "complete" the case — against in-memory fake data — while the header continues to claim "Mode A Online". On refresh, the officer's case evaporates and a *different* product (a demo cookie case) is rendered at the same URL (§5, §7; live-reproduced).
3. **Fabricated forensic values are persistent and provable.** Every one of the 140 evidence images in the central SQLite DB carries the identical blur value 342.18 and calibration 12.45 mm/px — hardcoded defaults saved as *statutory measurements* whenever image decoding fails. A 25-byte fake PDF was accepted as evidence with a passing quality gate (§10, §16).
4. **Statutory font measurement is computed from the bounding-box width, not glyph height** (`extractor.py:574-579`). On a real watch label the engine reported 6.97 mm where the true numeral height is 1.78 mm — this single bug converts Table-I FAILs into PASSes system-wide (§22, live-proven with arithmetic).
5. **Court-facing artifacts are generated without the facts they certify.** The Evidence Dossier displays "Section 63 BSA 2023 Validated", a Merkle root, and an adjudicating officer for a case that has no certificate, no adjudication, and a *different* Merkle root in the backend audit ledger (§24; live-proven). The notice generator invents a violation when none exists and stamps a fabricated device serial (`TAB-ACTIVE4-HW-9988`) onto Form-1 PDFs (§25).

**Is the product trustworthy?** Not for reliable inspection results. The demo path is polished and deterministic; the live path produces mostly garbage verdicts on real photos and can silently serve fabricated data. The largest single risk to the SIH evaluation is not any one bug but the *pattern*: every layer (frontend adapter, backend defaults, notice generator, evidence dossier) independently chooses fabrication over honest failure.

**Biggest blockers (fix order in §39):** DIAG-001/002 (silent mock promotion + case substitution), DIAG-008 (font width bug), DIAG-009 (fabricated metrics), DIAG-010 (MISSING→FAIL negative logic), DIAG-006/007 (fabricated certificates/notices), DIAG-003/004 (auth secrets + unauthenticated evidence).

---

## 2. Diagnostic Scope

| Area | Covered | Method |
| :--- | :--- | :--- |
| Frontend (ui-combined, 14 routes) | Yes | 4 parallel code-forensics passes + live Playwright browser audit |
| Backend (FastAPI, 3 entrypoints) | Yes | Code forensics + live curl probing of the running instance |
| Databases (2 SQLite files) | Yes | Direct SQL inspection; both schemas and data distributions |
| AI/CV (quality, calibration, PDP) | Yes | Live batch (75 images) + code trace + arithmetic verification |
| OCR (PP-OCRv4 det/rec) | Yes | Live runs; visible-text vs OCR comparison on samples |
| Extraction (member-03) | Yes | Live field-level provenance tracing |
| Rule engine (member-04) | Yes | Full legal audit vs frozen baselines (§23) |
| Evidence / Merkle / Section 63 | Yes | Code + live UI-vs-DB contradiction capture |
| Reports / notices / PDF | Yes | Code + live unauthenticated PDF fetch |
| Camera | Partial | Code-level only (no physical camera in audit env) |
| Real product data | Yes | Full inventory + 75/75 live pipeline execution |
| Security | Yes | Controlled probes only (no exploitation beyond proof) |
| Accessibility / mobile | Partial | Code + 390px viewport checks; no screen-reader pass |
| Performance | Yes | Measured per-image latency vs documented budgets |
| Deployment (Docker/compose/Vercel/Render) | Yes | Config forensics |
| Test suites | Yes | Executed: 386 backend tests; frontend suite would not launch (§31) |
| Documentation | Yes | Full contradiction register (§32, E1–E22) |

---

## 3. Environment

- Windows 10.0.26200 x64, Git Bash; Python 3.14.3; Node 25.6.1; npm 11.9.0.
- Running backend during audit: FastAPI via **local_runner** topology — `system_mode: LOCAL_RESILIENT_MODE`, SQLite `legal_metrology_mode_b.db` (verified by inserting a probe case and locating it in that file). Port 8000.
- Running frontend: Vite 6.4.3 dev server, port 5173 (restarted by the audit after it was found down).
- **Environment volatility note:** the real-image folder was reorganized *during* the audit (21:50–21:51: `Urvashi sample skus/` removed; `item 1 facewash`, `item 2 perfume`, `item 3 edible`, `item 4` appeared), and the backend process changed PID mid-audit. All conclusions below were re-verified after the changes. Test case rows written into `legal_metrology_mode_b.db` are prefixed `DIAG ` (75 cases + probes) so they are identifiable; deletion is a Team Lead decision because rows are hash-chained into the audit ledger (§10).

---

## 4. Architecture Reality

**Documented:** 12-stage pipeline (03_FINAL_ARCHITECTURE), PostgreSQL Mode A + SQLCipher-encrypted SQLite Mode B, JWT RBAC (RS256/Argon2, 15-min tokens), Nginx web-proxy tier, offline browser persistence.
**Actual:** one shared FastAPI `app` object with **three entrypoints** — `main.py` (Docker; adds static mounts + SPA catch-all), `local_runner.py` (Mode B demo harness; **injects extra unauthenticated demo endpoints**), and `test_ui_server.py` (`reload=True` on 8000). Pipeline is a single synchronous function, not 12 enumerated stages (the "12 stages" are defined differently in three different documents — E15). Mode B is plain SQLite (no SQLCipher). Auth is HS256 + PBKDF2, 8-hour tokens. No Nginx in compose. The "offline browser persistence" is an in-memory JavaScript Map.

```text
ACTUAL RUNTIME TOPOLOGY (as audited)
Browser (SPA ui-combined, Vite 5173)
  ├─ api.ts facade ── mode = localStorage | env | "LIVE"
  │    ├─ LIVE: liveApi.ts ──> /api/* ──> FastAPI (port 8000, local_runner variant)
  │    │     └─ pipeline: upload→quality→calibration→OCR→extraction→rules→DB→audit
  │    └─ ANY FAILURE: MockApiService (in-memory Map) ← SILENT SWITCH (DIAG-001)
  └─ demoCatalog / mockData (11 fabricated cases; 7 in header menu)
FastAPI
  ├─ server.py app (23 endpoints) + [local_runner adds /api/v1/demo/skus/* unauthenticated]
  ├─ SQLite mode_b (366 inspections; ALL synced_to_central=0)
  └─ storage/ sha256-named files; audit ledger hash chain
```

---

## 5. Complete User Workflow Diagnostic (where it breaks)

Journey executed live as an officer:

1. **Login — broken by design.** Visiting `/dashboard` directly renders a signed-in session ("Rajesh Sharma, LMO-DL-048") without ever authenticating; the login form accepts any password (DIAG-011).
2. **Dashboard — misleading.** KPIs are computed from the first 50 records only ("Total 50" when 366 exist), with a fabricated "+12% this week" and hardcoded confidence percentages (DIAG-019). A "CERTIFIED DEMO SUITE" occupies the primary surface.
3. **New inspection — works until backend hiccups.** Form submission works against the live API. The 6-stage progress animation is `setTimeout` theater. If the backend is unreachable, the case is silently created in an in-memory Map (DIAG-001).
4. **Upload — contract trap.** The documented-style multipart `inspection_id` field is ignored; only a `metadata` JSON string is honored, else an orphan "Unlabeled Sample" case is forked (DIAG-013, live-proven).
5. **Processing — the honest core fails on real data.** Quality gate + calibration + OCR + extraction run for real, but: calibration resolved on only 11/75 real photos (ISO-card fallback); 45/75 images yielded zero OCR fields; extracted values include absurdities (8.0 L on a watch; 1.0 L parsed from a postal code) (DIAG-025/026).
6. **Review — fabrications visible.** The workspace labels ISO-card fallback calibration as "ArUco Scale", shows fabricated confidence bars, embeds demo-SKU shortcuts inside real cases, and raises a React key-prop console error (DIAG-021/040).
7. **Evidence — forged validation.** The dossier displays a Section 63 seal, Merkle root, and officer signature for uncertified, unadjudicated cases; its Merkle root contradicts the backend ledger (DIAG-006, live-proven).
8. **Report — dead ends.** Reports page downloads produce no files (DIAG-018); the notice generator will happily certify a compliant product (DIAG-007).
9. **History/sync — broken silently.** 366/366 Mode B cases `synced_to_central=0`; the sync endpoint acknowledges without importing (DIAG-016).

---

## 6. Route / Page Diagnostic

Routes audited live (App.tsx:36-120) — all render; focus results:

| Route | Status | Key findings |
| :--- | :--- | :--- |
| `/` Landing | Renders | Demo case presented as "Live Physical Inspection Telemetry"; fabricated bench hardware; 5-stage pipeline claim; dead footer policy "links" (divs) |
| `/login` | Renders | Any password succeeds; MFA claimed in docs, absent in code |
| `/dashboard` | Renders | KPI page-1 undercount; hardcoded trend; duplicate list fetches; demo suite above real data |
| `/inspections` | Renders | New-case modal unreachable (`setIsModalOpen` only ever `false`); violations_count hardcoded 0 in list rows |
| `/inspections/new` | Renders | Works live; fake progress steps; metadata contract trap at API |
| `/inspections/:id` | Renders | Fabricated calibration label; fabricated confidence; demo chips; console error |
| `/inspections/:id/evidence` | Renders | Forged Section 63 seal + contradicting Merkle root (DIAG-006) |
| `/review-queue` | Renders | Badge count (24) derived live; reachable by any role |
| `/rules` | Renders | Correct 6.0 mm content — contradicts the ticker on other pages |
| `/reports` | Renders | Dead download buttons (live-verified); hardcoded distribution |
| `/settings` | Renders | Static "Active Mode: Mode B" regardless of truth |
| `/unauthorized` | Rendered only | No guard ever redirects to it |
| `/404`, `*` | Renders | OK |
| Mobile 390px | No horizontal overflow on 4 key routes | Dialog/row a11y gaps remain (DIAG-033) |

---

## 7. Frontend Diagnostic (summary — full detail in issue register)

- Silent LIVE→MOCK failover on *any* live error, stamped `pipeline_source: "LIVE_BACKEND"` (DIAG-001, P0).
- Refresh substitutes a different (demo) case at the same URL (DIAG-002, P0; live-reproduced).
- Decorative auth with hardcoded credentials, incl. backend auto-login `Officer@2026` (DIAG-011).
- Client-side rule evaluation in TS (mockApi.ts:553-653) contradicting the codebase's own "never calculated in React" invariant; scenario pre-selection by product name (`water`→PASS … else→FAIL) that *determines* mock outcomes (DIAG-031).
- Fabricated statutory values: measurement cards (`2.1 mm`/`3.0 mm` defaults), conflict card (₹40 vs ₹45 "Rule 18(2)"), empty-string SHA-256, invented 0.088 mm/px dossier scale (DIAG-020).
- Dead controls: report downloads, save-draft, unreachable modal, field-confirm `console.log` (DIAG-018).
- KPI undercount + fabricated trend/confidence (DIAG-019); contract mismatches fabricating displayed fields (DIAG-021); dual mode flags and never-reset module stores (DIAG-030).
- Evidence image swapped to a *different demo product* on load error, chosen by product-name keyword (DIAG-037).

## 8. Backend Diagnostic

- Three entrypoints, one app object; local_runner adds unauthenticated certificate-writing demo endpoints to port 8000 (DIAG-028).
- Synchronous pipeline in-request; new ONNX sessions per call; no timeouts (DIAG-014). Module-shadowing shim: `from engine import MultilingualOCREngine` resolves to **member-04's** re-export of member-02 (fragile).
- Fabricated quality/calibration persistence on decode failure (DIAG-009; DB-proven 140/140 identical values).
- Hardcoded PDP constants in the response, contradicting the same response's rule inputs (DIAG-027).
- Notice generator fabricates violations; certificates carry fake device serial and a `certificate_pdf_path` that does not exist (DIAG-007).
- Fuzzy inspection lookup by product name can resolve the wrong case (DIAG-036). Second `/system/status` registration is dead code; health stays ONLINE with `audit_chain_valid:false` (DIAG-043).
- Missing-evidence images silently substituted with demo photos by keyword (DIAG-037).

## 9. API / Integration Diagnostic

Full matrix: `API_DIAGNOSTIC_MATRIX.csv`. Highlights: undocumented multipart contract (DIAG-013); `workflow_status:"ADJUDICATED"` outside the frontend union; `created_at` fabricated as "now"; `violations_count` hardcoded 0; backend-enforced blur threshold 100 vs UI-displayed 150; `/close` exists (422 on missing `remarks`) — **the parallel draft's claim that `/close` is missing is stale/incorrect** (verified live).

## 10. Database Diagnostic

- Engines: Postgres 16 in compose; SQLite locally. 9 tables matching frozen spec 08 — the only major spec that matches reality well.
- **Fabrication fingerprint:** `legal_metrology.db` — 140/140 evidence rows with `blur=342.18`, `px_to_mm=12.45`. `legal_metrology_mode_b.db` — 77/169 rows at 342.18; the rest are demo-fixture constants (312.4/420.5/310.0/295.0) or genuine values.
- **Sync:** all 366 Mode B inspections `synced_to_central=0` (DIAG-016).
- **Certificates:** serial distribution `TAB-ACTIVE4-HW-9988` (34 mode-A / 23 mode-B) and `STATION-01-MAC` (78) — both fabricated in code, none from real hardware (DIAG-007/028).
- **Concurrency:** SQLite without WAL/timeout; audit `SELECT max(sequence)` race; verdict committed before its audit entry (DIAG-015).
- No SQL injection found (SQLAlchemy-only). Audit chain verifies intact (349 entries at audit time).
- 32 statutory notice PDFs are **tracked in git** despite `.gitignore` (confidentiality hygiene).

## 11. State / Cache Diagnostic

Module-global `dynamicCases` Map (never reset; `resetMockCases` has zero callers); unbounded `pipelineArtifactCache`; `nyayadrishti_last_case_id` cross-case leak; two divergent mode flags; officer's token persisted in *localStorage*; volatile in-memory cases presented as durable (DIAG-030/001/002).

## 12. Authentication / Authorization Diagnostic

Frontend: decorative (DIAG-011). Backend: HS256 with public fallback secret (DIAG-003); claims-only authorization, no revocation, 8 h tokens; anonymous backdoor flag; INSPECTOR can adjudicate own uploads; no jurisdiction scoping; compounding/notices correctly CONTROLLER-gated; evidence/notice-PDF downloads and all static mounts unauthenticated (DIAG-004/012).

## 13. Camera Diagnostic (code-level)

`useCameraStream` is the strongest frontend module: permission-error mapping, stream stop on unmount + visibilitychange, torch, haptics, ImageCapture-first capture. Gaps: preview glare heuristic disagrees with backend gate; captured dimensions ignored by NewInspection (hardcoded 1920×1080 uploaded); panel types assigned by index, not by which face was captured. Not exercised against physical hardware in this audit (marked NOT VERIFIED, §44).

## 14. Real Product Data Diagnostic

- **Actual inventory (post-reorg): 75 images / 8 folders** — `Earbuds` (6), `Herbal hair oil` (6), `Item 1 - Watch` (14), `Item 2 - General Wellness` (12), `item 1 facewash` (11), `item 2 perfume` (10), `item 3 edible` (8), `item 4` (8), plus one dataset-guide PDF. The folder set changed mid-audit (see §3).
- Documents claiming "63 photographs / Item 1–6 categories" are false (E2/E3); the "Urvashi sample skus" set existed at audit start and was removed mid-audit.
- Difficult cases confirmed live: mirrored/upside-down labels (OCR reads reversed text), glare frames, far shots, low-contrast frames — these map to the quality-fail/UNABLE bucket and behave as designed *only* for the blur short-circuit.

## 15. Full Pipeline Diagnostic

| Stage | Expected | Actual (live, 75 images) | Breakpoints |
| :--- | :--- | :--- | :--- |
| Upload/hash | hash stored, honest quality | Hash always real; **metrics fabricated on decode failure** | DIAG-009 |
| Quality gate | reject blur/glare; UTV | Works (39 pass/36 fail); blur-only enforcement; 0.02s short-circuit correct | Threshold mismatch UI (DIAG-021) |
| Calibration | ArUco 4x4_50 homography | **UNRESOLVED on 64/75**; ISO-card heuristic on 11; fabricated 12.45 fallback | DIAG-026/009 |
| PDP/geometry | real segmentation | **Hardcoded constants** in response; contradictory area values in same payload | DIAG-027 |
| OCR | PP-OCRv4 en+hi | Real; fails on mirrored/rotated text; produces reversed tokens | DIAG-026 |
| Extraction | statutory fields | **0 fields on 45/75**; wrong associations (8.0 L watch; 1.0 L from PIN code) | DIAG-025 |
| Font measurement | glyph height vs Table-I | **Width-as-height bug** → inflated heights → false PASS | DIAG-008 (P0) |
| Rules | 4-state epistemic verdict | Engine sound; **MISSING→FAIL negative logic** dominates real data; epoch boundary off by 2 months | DIAG-010/022 |
| Evidence | Merkle over real artifacts | Metadata-only leaves; UI root ≠ backend root; certs on demand with fabricated attestation | DIAG-006/007 |
| Report | Form-1 for established violations | Generator fabricates violations; device serial invented | DIAG-007 |
| **Net result** | trustworthy verdicts | **0/75 PASS** | chain of DIAG-008→026→010 |

## 16. Hardcode / Fake / Mock Diagnostic (explicit answers)

- **Hardcoded results?** Yes: quality/calibration defaults persisted as measurements (DIAG-009); PDP constants (DIAG-027); notice "default fallback violation" (DIAG-007); frontend confidence mapping and KPI trends (DIAG-019); fabricated dossier Merkle/officer (DIAG-006).
- **Mock paths?** Yes: entire in-memory MockApiService + 11 golden cases in production bundle; demo endpoints on the live port in Mode B.
- **Can mock results enter the live flow?** Yes — three doors: (1) silent failover (DIAG-001); (2) unknown-ID → demo-case fallback (DIAG-002); (3) `PYTEST_CURRENT_TEST` env or `demo`-containing ids trigger backend fixture path for any case (server.py:780-788).
- **Known SKUs treated specially?** Yes — fuzzy product-name matching to fixtures at server.py:762-778, gated (verified live that a Sunfeast-named case with a watch image still ran the real pipeline; the gate held for normal API-created cases).
- **Filename shortcuts?** **None at backend** — rename test produced identical content-derived results (§19). The frontend, however, picks mock *scenarios* by product name (DIAG-031).
- **Static frontend results?** Yes — Reports page distribution, dashboard trend, confidence %, Settings mode, landing telemetry (DIAG-019/041/042/039).

## 17. Result Provenance (critical fields)

| Field | True origin (live-traced) | Presented as |
| :--- | :--- | :--- |
| raw_sha256 | SHA-256 of uploaded bytes (real) | Evidence hash (OK) |
| blur/glare | Real if cv2 decodes; else **constants 342.18/0.84** | Measured σ² (FABRICATED path) |
| px_to_mm | Real ArUco rarely; ISO-card heuristic; else **12.45** | Calibrated scale (FABRICATED path) |
| PDP area | **Constants 280/112/40** | Segmentation output |
| measured_font_height_mm | **bbox width / px_to_mm** | Numeral height (WRONG) |
| MRP / net qty | OCR + regex; includes garbage associations (8.0 L) | Extracted declaration |
| verdict | member-04 engine over above inputs | "AI Verdict" |
| Merkle root (UI) | **Recomputed client-side; ≠ backend root** | Sec 63 chain (FABRICATED) |
| Confidence % (UI) | **Hardcoded by verdict** | Sensor confidence |
| Certificate serial | **Constant string** | Device attestation |

## 18. Real-SKU Results (75/75 executed live through the HTTP pipeline)

By folder: Earbuds 1 FAIL/5 UTV; Herbal hair oil 0/6 UTV; Item 1 - Watch 12 FAIL/2 UTV; Item 2 - General Wellness 10 FAIL/2 UTV; facewash 0/12 UTV; perfume 3 FAIL/6 UTV; edible 6 FAIL/2 UTV; item 4 6 FAIL/2 UTV. **0 PASS.**
Full per-image matrix with stage statuses: `REAL_DATA_DIAGNOSTIC_MATRIX.csv`. Latency avg 3.13 s (max 9.97 s) vs documented ≤1800 ms budget. Quality short-circuit (blur<100 → UNABLE, ~0.02 s) works as designed.

## 19. Adversarial Tests (executed live)

| Test | Result |
| :--- | :--- |
| **Rename** (same image, random filename) | Results identical → backend is content-driven, not filename-driven. PASS (integrity holds) |
| **SKU-swap** (watch image under "Sunfeast Butter Cookies 200g" case) | Real pipeline ran (fixture path did NOT trigger for API-created cases) → results content-derived. PASS; residual risk: fixture path still triggers for `demo`-containing ids and all pytest runs (DIAG-038) |
| **Offline (network killed mid-session)** | Case created in-memory, full workspace rendered, header claimed "Mode A" — **P0 reproduced** (DIAG-001) |
| **Refresh after offline case** | Different demo case rendered at same URL — **P0 reproduced** (DIAG-002) |
| **Repeat** (same image twice) | Same verdict/fields both runs (deterministic on same input) |
| **Metadata contradiction** | Not separately staged: product metadata is ignored by the backend pipeline (proven by SKU-swap), so metadata cannot currently override image content — the opposite problem (DIAG-025 garbage extraction) dominates |
| **Unknown SKU** | All 75 real images are unknown SKUs — processed genuinely, no crash, no fixture leakage |
| **Upload edge cases** | 0-byte → 400 (good); .txt → 415 (good); fake PDF → accepted as evidence with fabricated passing metrics (DIAG-009/029) |
| **Traversal** | 404 on all variants; code lacks containment guard (DIAG-005, NOT REPRODUCED at runtime) |

## 20. OCR Diagnostic

Real-but-weak: DBNet++ det + PP-OCRv4 rec run genuinely; Tesseract fallback present. Failure classes on real data: mirrored/upside-down text read as reversed garbage ("00LZ 008L/6L"); tiny far-shot text missed entirely (45/75 zero-field); Hindi model present but untested against Devanagari labels in this run. No hallucinated text observed — failures are honest at the OCR layer; fabrication begins downstream (defaults) and in the UI.

## 21. Extraction Diagnostic

Regex-driven parsers mostly correct on clean input (earbuds MRP ₹1999, mfg 01/22, origin India, addresses with PIN all extracted correctly on the best frame). Defects: wrong-association net-quantity (postal code → 1.0 L; mirrored text → 8.0 L) with `has_banned_unit:false`; `litres/liters` simultaneously valid and banned; standard-unit whitelist never enforced; width-as-height font metric (P0).

## 22. Computer Vision Diagnostic

Quality gate (Laplacian blur, glare, skew) behaves as documented and its short-circuit is correct. Calibration: ArUco detection succeeded on 0/75 real field photos (no markers in real scenes — dataset has no ArUco fiducials), ISO-7810 card heuristic on 11, unresolved 64. PDP: hardcoded constants — no real segmentation exists in the pipeline response. Homography: not reached in practice. **The metric layer of the product is effectively non-functional on the real dataset.**

## 23. Legal Rule Diagnostic (no legal logic modified; register only)

Compliant with frozen baselines: Table-I thresholds/boundaries exact (never 8.0 mm in engine); USP 0.02 tolerance with boundary tests; e-commerce mfg-date exemption correct; triage structure per ADL-12; zero Section 65B citations; no invented Gazette numbers *in the engine*.
Defects: F-1 REVIEW band 0.08 vs ADL-17 ±0.30; F-2 CLI synthetic defaults (font 2.5 mm, origin "India", mfg "2024-01-15"); F-3 USP epoch 2021-11-02 vs frozen 2022-01-01; F-4 malformed dates → oldest epoch; F-5 divergent e-commerce implementations (CRITICAL vs MAJOR origin); F-6 litres contradiction; F-7 origin FAIL without imported-goods applicability; F-8 systemic MISSING→FAIL; F-9 reduced duplicate evaluation path in integration adapter; F-10 UI re-asserts banned 8.0 mm claim; F-11 untraceable ₹25k/50k/1L compounding schedule + 14-day cure + "Section 36(1) proviso" doctrine — **printed on the Form-1 PDF** (Zero Assumption Policy violation). Coverage gaps: mfg-date presence/format rule, expiry/best-before, PIN validity, generic name, Rule 6(10A) filter audit, FR-16 e-com discrepancy — all MISSING.

## 24. Evidence Diagnostic

Hashing of stored bytes is real; audit chain verifies intact. Contradictions: metadata-only Merkle leaves; certificate `evidence_bundle_sha256` = Merkle root (self-referential); UI dossier recomputes its own root (proven different from backend, live); "Validated" seal without certificate; officer attribution without adjudication; missing-file → demo-image substitution; demo certificates written without audit entries; 32 notice PDFs committed to git.

## 25. Report Diagnostic

Form-1 PDF generation is real (ReportLab) but content-provenance is broken: fabricated fallback violation, fabricated device attestation, untraceable penalty schedule on the notice face, hardcoded compounding fee (₹5000) and reply window (15 days) from the frontend, `certificate_pdf_path` pointing to a nonexistent file. Reports page is entirely static (dead downloads).

## 26. Security Diagnostic

P0s: fallback JWT secret = committed compose secret (auth bypass if env unset); unauthenticated evidence + notice PDF downloads (live-proven); path-traversal-prone catch-all (code-confirmed, runtime 404 on tested variants); plaintext Postgres password + secret in compose; hardcoded frontend credentials incl. auto-login; token in localStorage. Also: CORS `*` with credentials; PDF-as-evidence; memory-DoS read-before-cap; anonymous backdoor flag. **No exploitation beyond controlled proof was performed.**

## 27. Accessibility Diagnostic

Strong foundations (skip link, focus-visible, reduced-motion, high-contrast, print styles, i18n toggle). Gaps: dialogs without focus trap/Escape/`role="dialog"`; table rows and cards as non-focusable `onClick` divs; sub-44px touch targets; unlabeled icon button on ConnectivityBadge; `strict:false` TypeScript hides undefined-access risks. No automated axe/Lighthouse artifacts exist despite "100% WCAG" claims (E14).

## 28. Mobile / Responsive Diagnostic

390×844 live checks: no horizontal overflow on dashboard/new/case/review-queue; nav collapses to drawer. Functionality gaps at mobile are inherited from the desktop defects (same silent failover). Camera path (primary mobile flow) is code-solid per §13. NOT VERIFIED on real devices.

## 29. Performance Diagnostic

Measured: pipeline avg 3.13 s / max 9.97 s / watch 5.12 s vs README ≤1800 ms target and ≤1200 ms benchmark — **over budget on real data** (DIAG-014). Root causes: per-request ONNX session construction, synchronous in-request execution, Tesseract probe without timeout. Frontend bundle: all 14 pages eagerly loaded; render-blocking Google Fonts (offline field impact). Health endpoint re-hashes the entire audit ledger per call (DIAG-034). The "~993 ms PASS" in FINAL_END_TO_END_SYSTEM_AUDIT is unsupported by any artifact (E4).

## 30. Deployment / Environment Diagnostic

Docker: compose (db/backend/frontend) works; **plaintext secrets**; published 5432. Render: secrets generated properly (config disagreement between the two). Vercel: two divergent configs (root aggregator vs ui-combined); `/storage/*` not proxied on Vercel or nginx → some real evidence paths 404 in deployed frontends. `local_runner.py` + docker-compose both bind 8000 (two-listener state observed at audit start; single listener after user restart). SQLite default path CWD-dependent in containers. Lower-bound-only pins for all Python deps (non-reproducible builds).

## 31. Test Suite Diagnostic

Executed during audit: **member-01+02+03: 271 passed, 1 skipped; member-04+05: 115 passed** (386 total, consistent with the most honest docs' 384-391 claims). Frontend suite could not be launched via `npx vitest` (tooling error, unrelated to tests; 118 test definitions exist).
Blind spots (DIAG-038): the backend fixture gate activates under `PYTEST_CURRENT_TEST`, so **no pytest run ever exercises the real pipeline**; integration golden-SKU tests evaluate only Table-I+USP via a reduced adapter (can pass where the full engine fails); frontend tests assert mock behavior; zero tests cover real-image E2E, camera, auth flows, sync, or the notice generator's fabrication path. This is how 386 green tests coexist with a 0/75 real pass rate.

## 32. Documentation Diagnostic

Contradiction register E1–E22: five "100% VERIFIED / PRODUCTION READY" reports vs the repo's own 0/75 matrix; seven stub "audit" files under 200 bytes; mutually exclusive test-count and latency claims; invented endpoint catalog and ArUco dictionary in the newest audit; MFA/WCAG/SQLite-sync/SQLCipher claims false; 12-stage pipeline defined three different ways; UI blueprint routes diverged from App.tsx; deployment topology obsolete. `12_DEMO_PLAN` (6 SKUs) and `07_API_CONTRACTS`/`08_DATABASE_SPEC` are the docs that match reality.

## 33. Complete Issue Register

See **`DIAGNOSTIC_ISSUE_REGISTER.csv`** — 45 issues (10×P0, 21×P1, 9×P2, 5×P3), each with location, reproducibility, root-cause status, impact, evidence, dependencies, and recommended fix order.

## 34. Root-Cause Dependency Map

```text
DIAG-008 font-width bug ──┐
DIAG-026 OCR/calibration gaps on real photos ──┤
DIAG-025 wrong-association extraction ──┤
        └──────────────> DIAG-010 MISSING→FAIL negative logic
                              │
                              ├──> 0/75 real PASS (DIAG-026 headline)
                              ├──> officers distrust / bypass system
                              └──> pressure toward demo mode

DIAG-001 silent mock failover ──> DIAG-002 refresh case substitution ──> DIAG-031 fabricated legal lifecycle
        └── (same root: facade prefers fabrication over honest failure)

DIAG-003 fallback secret ──> DIAG-004 unauth endpoints escalate to full evidence leak ──> DIAG-028 unaudited cert writer

DIAG-009 fabricated metrics ──> DIAG-027 PDP constants ──> font/area rule inputs untrustworthy ──> DIAG-006/007 forged certificates/notices
```
Symptoms (UI wrong numbers, failed sync badge, KPI undercount) share these five roots; fixing downstream symptoms without the roots will multiply fabrications.

## 35. P0 Release Blockers

DIAG-001, DIAG-002, DIAG-003, DIAG-004, DIAG-005, DIAG-006, DIAG-007, DIAG-008, DIAG-009, DIAG-010 (see CSV for each).

## 36. P1 High Priority

DIAG-011 … DIAG-031 (21 items, see CSV).

## 37. P2 Medium

DIAG-032 … DIAG-040 (9 items).

## 38. P3 Low

DIAG-041 … DIAG-045 (5 items).

## 39. Fix Order Recommendation (no fixes implemented in this run)

1. **Truth/integrity:** DIAG-001/002 (failover + substitution) — make every failure loud; then DIAG-006/007 (stop forging certificates/notices). Nothing else is meaningful while these exist.
2. **Core pipeline correctness:** DIAG-008 (font width→height one-line fix, highest legal ROI), DIAG-010 (UNABLE instead of FAIL for missing; applicability gates), DIAG-025 (extraction association), DIAG-027/009 (honest CV outputs or honest absence).
3. **Integration contracts:** DIAG-013 (upload contract), DIAG-021 (kill fabricated display fields), DIAG-016/017 (sync + finding persistence).
4. **Security:** DIAG-003/004/005/011/012 (secrets, authz on evidence, guards, real login).
5. **Real-data reliability:** calibration strategy for marker-less field photos; OCR orientation handling (DIAG-026).
6. **Database/state:** DIAG-015/030 (WAL, atomic audit, store resets).
7. **UX/a11y:** DIAG-033/039 (demo/real separation, focus management).
8. **Performance:** DIAG-014/034 (engine pooling, async pipeline).
9. **Cosmetic/docs:** DIAG-032 (rewrite or delete the false "FINAL" reports — they are an active liability), P3 items.

Dependencies: 1 before 3 (failover masks contract fixes); 2 before 5 (legal logic before tuning models); DIAG-008 is independent and should be fixed first of all (one line, unblocks true Table-I behavior).

## 40. What Must NOT Be Fixed With a Shortcut

- The failover (DIAG-001): must not be "fixed" by better mock data or a bigger badge — the mock path must be unreachable from the live inspection flow.
- Font heights (DIAG-008): must not hardcode per-SKU heights or clamp to expected values.
- Missing-field verdicts (DIAG-010): must not map unknown→REVIEW by default either; applicability must be reasoned, not thresholded away.
- Certificates (DIAG-006/007): must not pre-render "Validated" seals client-side under any circumstance; notices must require persisted FAIL evaluations.
- Calibration (DIAG-026): must not fake a scale from image dimensions or product metadata.
- Extraction (DIAG-025): must not whitelist the known demo SKUs' expected values.
- Any place currently persisting defaults as measurements (DIAG-009) must write NULL + status, never plausible constants.

## 41. What Is Actually Working (evidence-backed)

1. Image hashing + sha256-addressed storage; evidence fetch by content ID.
2. Quality gate short-circuit semantics (blur<100 → UNABLE in 0.02 s; honest rejections).
3. Table-I engine schedule (thresholds, boundaries, no 8.0 mm) — byte-correct with ADL-01, well tested.
4. USP 0.02 tolerance math with boundary tests; invalid-input → UNABLE_TO_VERIFY.
5. E-commerce Rule 6(10) field set + mfg-date exemption row.
6. 386 backend member tests pass; members are genuinely standalone per the non-dependency rule.
7. BSA 2023 Section 63 cited everywhere; zero Section 65B references.
8. 9-table DB schema matches frozen spec 08; SQLAlchemy-only (no injection surface).
9. Camera hook lifecycle (code-level).
10. Rename/SKU-swap integrity at the backend (results are content-derived).
11. Demo fixture segregation gate held under live adversarial probing (API path).

## 42. What Is Partially Working

Upload→pipeline→DB→UI flow end-to-end (works mechanically; values untrustworthy); OCR on clean frontal labels (earbuds best-frame extractions largely correct); authz role gates on mutating endpoints; review-queue badge and live list rendering; evidence dossier display of *stored* data (correct fields, fabricated seal on top); mobile layout; i18n shell; notice PDF generation (mechanically, wrong content governance).

## 43. What Is Broken

Everything in §35–38; headline: real-data verdicts (0/75 PASS), silent mock promotion, refresh case substitution, forged evidence surfaces, notice fabrication, metric layer (calibration/PDP/font height), sync, finding adjudication persistence, report downloads, dashboard statistics, frontend authentication.

## 44. What Is Not Verified

Physical camera behavior on real devices; Devanagari OCR accuracy on Hindi labels; Postgres Mode A behavior under Docker on this machine (compose not executed to avoid mutating the running environment); iOS Safari specifics; actual multi-user concurrency (single-officer probes only); accessibility with assistive tech; penetration beyond controlled probes.

## 45. What Is Still Unknown

Whether the Render deployment ever ran with real traffic (keepalive ping exists; no logs available). Whether any real enforcement data was ever processed in the field (mode_b 366 cases are test/demo; provenance unknown). Whether the parallel session's 21:40 draft reflects a different code state (its `/close`-missing claim conflicts with the audited tree). Intent behind the mid-audit image-folder reorganization.

## 46. Current Product Trust Assessment

**NOT TRUSTWORTHY FOR RELIABLE INSPECTION RESULTS.**
Reasons (all evidenced above): fabricated measurement persistence; systematic false PASS on font checks; false FAIL on unreadable labels; forged validation surfaces; silent substitution of fabricated data for real failures; authentication that does not authenticate; and a demo layer indistinguishable from live data at the point of adjudication.

## 47. Current Demo Readiness

**READY WITH MATERIAL LIMITATIONS.**
The 7 golden demo cases are deterministic, fast, and present well; the certified-demo path is segregated (live-verified that adversarial inputs do not cross it). Limitations a judge can hit in minutes: any question about *live* processing ("run this real photo") exposes 0-PASS results and 3–10 s latency; the "12-stage pipeline" story conflicts across docs; demo fixtures are visible in production headers/sidebars; and the ticker's 8.0 mm claim directly contradicts the Rules page if both are shown. The landing page's "Live Physical Inspection Telemetry" is demo data labeled as live — a skeptical judge who catches this will discount everything else.

## 48. Exact Next Fixing Plan (recommended sequence for the next engineering phase — not implemented)

1. **Hour 0–2 (P0, tiny diffs, huge ROI):** extractor.py:579 `bbox[2]-bbox[0]` → `bbox[3]-bbox[1]` (+ update fixtures/tests); server.py: delete the 342.18/0.84/1.45/12.45 pre-seeds and the `qg_passed_real=True` except-branch (write NULLs + UNABLE instead); server.py: delete the "Default fallback violation" block in `/notices/generate`.
2. **Session A (failover honesty):** api.ts — remove all MockApiService fallbacks from LIVE mode; show a blocking "backend unreachable" state; mockApi unknown-ID fallback → explicit not-found; single mode flag; CaseWorkspace blocks adjudication/notice when `is_mock_fixture` is true.
3. **Session B (legal truth):** evaluators.py — MISSING → UNABLE_TO_VERIFY with applicability gates; epoch boundary 2022-01-01; REVIEW band to ADL-17 ±0.30; remove/trace F-11 sanction schedule or get it frozen into 16_DECISION_LOG via the Decision-Change Process; fix litres contradiction; fix ticker 8.0 mm + GSR 594(E) copy.
4. **Session C (auth/evidence):** env-only secrets (fail fast if unset); auth on evidence/notice endpoints + containment check in catch-all; delete `NYAYADRISHTI_ALLOW_ANON_LOCAL` default-on path; frontend real login (no default user, no auto-login).
5. **Session D (contracts/state):** upload contract (accept top-level field OR document metadata-only and validate); map `created_at`/`violations_count`/`workflow_status` truthfully; finding adjudication endpoint + persistence; WAL + atomic audit transaction; store resets + single artifact cache keyed per inspection.
6. **Session E (real-data reliability):** calibration strategy for marker-less photos (document-based card heuristic or explicit UNCALIBRATED state), OCR orientation probe (180°/mirror), then re-run the 75-image harness (batch loop preserved in this report's companion artifacts) as the acceptance gate: target ≥60% honest verdicts (PASS or justified FAIL), 100% honest UNABLEs.
7. **Session F (docs):** delete or rewrite the seven stub reports and the five false "FINAL" documents; single pipeline-stage definition; regen route/screen docs.
8. **Ongoing:** keep the 75-image live harness as permanent tooling; forbid `PYTEST_CURRENT_TEST` from gating production code paths (inject the fixture path via explicit test configuration instead).

---

### Final Safety Check (per mission)

- `git status` re-inspected post-audit: only new report artifacts + scratch; the 7 pre-existing modifications untouched; no branch operations performed; original real images untouched (copies only); ground-truth fixtures untouched.
- Temporary artifacts: `scratch/audit-tmp/` (scripts, tokens, batch JSONL, probe images) — removed after report finalization; `scratch/` directory retained as it pre-existed. 75 `DIAG`-prefixed inspection rows + a handful of probe rows remain in `legal_metrology_mode_b.db` (hash-chained; deletion is a Team Lead decision — recorded in §3).
- Parallel-session drafts preserved as `*.parallel-draft.*`.

*END OF REPORT — DIAGNOSTIC ONLY. NO PERMANENT FIXES WERE APPLIED.*
