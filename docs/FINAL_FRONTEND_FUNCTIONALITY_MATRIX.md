# FINAL_FRONTEND_FUNCTIONALITY_MATRIX.md

NyayaDrishti-LM / NIRIKSHAK — Functionality matrix after fixes (2026-09-13)
Source of truth per element during the audit: live Chrome session + code trace. API column shows the serving adapter observed at test time (Mode A live backend reachable at `/api/v1` via Vite proxy; Mode B local fallback on network failure).

| Page | Element / Flow | Expected | Actual (post-fix) | API | State | Status |
|---|---|---|---|---|---|---|
| Landing | Omnibox search + categories | Navigates to rules/case results | Works; trending chips fill query | n/a (static registry) | OK | PASS |
| Landing | Footer doc links | Open GIGW doc pages | All resolve | n/a | OK | PASS |
| Login | Role select → authenticate | Sets auth context, routes to /dashboard | Works; demo prefill documented | LIVE | OK | PASS |
| Login | Email/password labels | Programmatic labels | id/name + label assoc present | — | OK | PASS |
| Dashboard | Officer identity | Readable, full name on hover | Cyan-400 restored + title attr | — | OK | PASS (fixed BUG-01) |
| Dashboard | Recent cases table + filter pills | Live cases; filter by verdict | 50 live cases; pills filter + count | LIVE | OK | PASS |
| Dashboard | Recent-cases card | No dead space | Table viewport fills card | — | OK | PASS (fixed BUG-03) |
| Dashboard | Quick actions (scan/ecom/register/review) | Navigate | All navigate | — | OK | PASS |
| Register | Search / workflow / verdict filters | Filter list | Work against live list | LIVE | OK | PASS |
| Register | Golden SKU quick-select | Load demo case | Routes to /inspections/SKU-DEMO-0x | LIVE+fixtures | OK | PASS |
| New Inspection | Validation → Start Analysis | Disabled until 1 photo + product name | Enforced | LIVE | OK | PASS |
| New Inspection | Camera modal | Opens/permission flow | Opens (hardware path = known limitation) | — | OK | PASS w/ limitation |
| New Inspection | Upload + pipeline execute | Real analysis artifacts | Upload → pipeline → extracted fields render | LIVE | OK | PASS |
| Case Workspace | Tab switcher | All 6 tabs reachable | Clipping fixed at 1280 | — | OK | PASS (fixed BUG-11) |
| Case Workspace | Copy case ID | Clipboard + truncated chip | Works | — | OK | PASS (fixed BUG-12) |
| Case Workspace | Adjudication | Requires remarks; RBAC gates notices | Enforced client+server (tests TS-WEB-02) | LIVE | OK | PASS |
| Case Workspace | Dispose case | Confirm → case hidden everywhere incl. reload | Works via deleted-registry | LIVE+local | OK | PASS |
| Evidence Dossier | Chain-of-custody render | Real SHA-256 assets | Renders from live case | LIVE | OK | PASS |
| Evidence Dossier | Export JSON / Print | Real artifact | Works | — | OK | PASS |
| Review Queue | Triage KPI cards | Readable selected+unselected | Fixed (BUG-04) | LIVE | OK | PASS |
| Review Queue | Adjudicate in Canvas | Routes to case workspace | Works | — | OK | PASS |
| Rules | Static statutory reference | Accurate Table-I (Row 5 = 6.0 mm) | Matches frozen spec | — | OK | PASS |
| Reports | Outcome distribution | Matches register counts | 50 cases / 33 FAIL (66%) | LIVE | OK | PASS (fixed BUG-05) |
| Reports | Period selector | Filters honestly | created_at window filter | client-side | OK | PASS (fixed BUG-06) |
| Reports | UNABLE row | Counts only UNABLE_TO_VERIFY | Fixed (BUG-07) | — | OK | PASS |
| Reports | Download buttons | Produce PDF artifact | Serves bundled form1.pdf | — | OK | PASS |
| Settings | Preferences save | Persist to localStorage | Works | local | OK | PASS |
| Settings | Mode telemetry | Truthful A/B state | Derived from ApiService + 3 s poll | — | OK | PASS (fixed BUG-10) |
| 404 / Unauthorized | Recovery paths | Clear actions | Dashboard/Register/Back/Rules | — | OK | PASS |
| Global | Ctrl+K palette | Open/navigate | Works | — | OK | PASS |
| Global | Sidebar fit | No clipped nav/officer card | Exact fit top + scrolled | — | OK | PASS (fixed BUG-02) |
| Global | High contrast / font size / language | A11y toggles apply | Work (GovTopBar) | — | OK | PASS |

**Legend:** PASS = verified working in the live session. Camera live-capture path = hardware dependency (fixtures/queue reviewed statically).
