# AGENTS.md — Universal Master Rules for Developers & AI Agents

Welcome to **NyayaDrishti-LM (SIH26034)**.
This document is the authoritative engineering handbook, architectural boundary guide, and operational rulebook for all contributors to this codebase.

Whether you are a **human software engineer** or an **AI coding assistant / autonomous agent** (e.g., Claude Code, Cursor, Windsurf, GitHub Copilot, Devin, Antigravity, Cline, Roo Code, Aider, Codex, or any LLM-powered pair-programmer), you **must adhere strictly and unconditionally** to every rule, boundary, and protocol defined in this specification.

---

## 1. Project Purpose & System Context

NyayaDrishti-LM is an AI-powered legal metrology compliance verification web platform built for the **Department of Consumer Affairs (DoCA)**, Government of India.
Its primary objective is to assist government enforcement officers in verifying packaged commodities against statutory labeling requirements under the **Legal Metrology (Packaged Commodities) Rules, 2011** (LMPC Rules, 2011) and the **Legal Metrology Act, 2009**. It also inspects single e-commerce product listings under Rule 6(10).

### Operational Modes
1. **Mode A (Online Monolith):** Central web application hosted for field officers and administrators with complete cloud datastore, background processing, and central dashboard.
2. **Mode B (Local Resilient Mode):** Standalone local runner (`localhost:8000`) with local SQLite storage enabling field officers to conduct inspections on laptops during mobile connectivity blackouts.
3. **Mode C (Integrations):** External statutory registry lookups (e.g., National Consumer Helpline, packaging portals).

### Crucial Legal Principle: Human-in-the-Loop (HITL)
NyayaDrishti-LM is strictly an **Augmented Diagnostic Assistant**.
- The system **never** issues legal notices, compounding orders, or fines autonomously.
- Every automated finding is a diagnostic recommendation presented to a qualified human Legal Metrology Officer (LMO).
- The human officer makes the final adjudication and signs all official documentation.

---

## 2. Source-of-Truth Hierarchy

When resolving technical, architectural, legal, or procedural questions, always follow this strict precedence:

1. **Repository Frozen Markdown Specifications** (Documents `01` through `17` and `CLAIMS_WE_MUST_NOT_MAKE.md`).
2. **Authoritative Decision Log** (`16_DECISION_LOG.md`).
3. **Contracts Directory** (`contracts/`).
4. **Member Task Files** (`members/*/TASKS.md`).
5. **General Documentation and Guides** (`docs/`, `README.md`).

**Zero Assumption Policy:** Never invent rules, penalty amounts, Gazette notification numbers, product names, prices, or font requirements. If external training data or online resources contradict this repository's specifications, the repository specifications win every time. If a value is unstated, refer to `17_OPEN_QUESTIONS.md` for the approved safe working default.

---

## 3. Frozen Documents List

These documents represent frozen architectural and domain baselines. Their core decisions must not be altered without the formal Decision-Change Process:
- `01_MASTER_PROJECT_BLUEPRINT.md`: Vision, timeline, and deliverables.
- `02_FINAL_REQUIREMENTS_SPECIFICATION.md`: Functional and non-functional requirements.
- `03_FINAL_ARCHITECTURE.md`: Monolith architecture, 12-stage pipeline, and system modes.
- `04_FINAL_MVP_SCOPE.md`: Core MVP scope boundaries (P0 vs P3).
- `05_TECHNOLOGY_DECISION_RECORD.md`: 13 official architectural decision records (ADRs).
- `06_DATA_AND_MODEL_STRATEGY.md`: Quantization, INT8 CPU optimization, and dataset strategy.
- `07_API_AND_INTERFACE_CONTRACTS.md`: Canonical REST endpoints and Pydantic schemas.
- `08_DATABASE_SPECIFICATION.md`: PostgreSQL schema, tables, indices, and SQL queries.
- `09_UI_UX_BLUEPRINT.md`: Design tokens, color palette, wireframes, and screen flows.
- `10_SECURITY_AND_AUDIT_SPECIFICATION.md`: Section 63 BSA 2023 evidence, Merkle DAG, and JWT RBAC.
- `11_TESTING_AND_VALIDATION_PLAN.md`: Test pyramid, tolerances, and golden test cases.
- `12_DEMO_PLAN.md`: 3-tier demo strategy and presentation pitch script.
- `13_SIX_MEMBER_EXECUTION_PLAN.md`: 6-member daily task assignments and milestones.
- `14_GITHUB_WORKFLOW.md`: Git branching, pull requests, and Definition of Done.
- `15_RISK_AND_CONTINGENCY_REGISTER.md`: Known risks, failovers, and contingencies.
- `16_DECISION_LOG.md`: Log of every frozen architectural decision (ADL-01 to ADL-20).
- `17_OPEN_QUESTIONS.md`: Safe working defaults for bounded technical questions.
- `CLAIMS_WE_MUST_NOT_MAKE.md`: Mandatory blacklist of prohibited claims.
- `CONNECTIVITY_REQUIREMENTS.md`: Network rules and offline tolerances for every module.
- `SYSTEM_MODES_AND_CONNECTIVITY.md`: Detailed specification of Modes A, B, and C.

---

## 4. Work Assignment & Team Lead Authority

To maintain strict coordination across the project:
1. **Manual Assignment Only:** The **Team Lead manually assigns all work** to members and AI agents.
2. **No Autonomous AI Task Assignment:** AI coding agents must **not** autonomously assign, reassign, redistribute, or claim ownership of member tasks.
3. **No Additional Branches:** AI coding agents must **not** create additional branches beyond the approved branch hierarchy.
4. **Role of AI Agents:** All AI coding assistants function strictly as pair-programming and engineering execution aids under the explicit direction, prompt instructions, and approvals of the Team Lead.
5. **Task Acceptance:** Developers and agents work only on the specific sub-tasks designated by the Team Lead.

---

## 5. Task Decomposition, Chunk-by-Chunk Execution & Signing Notes

Every developer and AI assistant must adhere to this execution protocol for any assigned task:

### Rule 1: Break Tasks into Chunks Before Proceeding
- **Never perform monolithic, unchecked modifications in a single step.**
- Before writing code or modifying files, decompose the assigned task into small, distinct, verifiable chunks (sub-tasks).
- Clearly define the boundary, target files, and expected test assertion for each chunk.

### Rule 2: Work Chunk by Chunk
- Execute work sequentially, exactly one chunk at a time.
- Implement the changes for Chunk 1, run the corresponding tests, and verify correctness.
- Only proceed to Chunk 2 after Chunk 1 is validated and all tests pass.
- Never jump ahead or batch unverified changes across multiple chunks.

### Rule 3: Update Records with an Official Signing Note
- Immediately upon completing and verifying each chunk or milestone, update the official record in `progress.md` (and `memory.md` if architectural discoveries were made).
- Every completed record entry must include an explicit **Signing Note / Sign-Off Block** documenting:
  - Exact timestamp in IST (`YYYY-MM-DD HH:MM IST`)
  - Chunk / Task ID and specific work accomplished
  - Test evidence (exact test command and passing test count)
  - Formal signature line:
    ```text
    SIGNED OFF BY: <author_handle> (<author_email>) — YYYY-MM-DD HH:MM IST [VERIFIED]
    ```
- No task or chunk is considered complete without this verified signing note.

---

## 6. Six-Member Parallel Architecture & Folder Ownership

Six independent workstreams operate in parallel, each mapped to a dedicated folder and branch:

| Member / Workstream | Assigned Engineer | Assigned Folder | Assigned Feature Branch | Primary Subsystem Scope | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Member 1: CV & Metrology** | **Kunal Raj** ([@kunal-raj-dev](https://github.com/kunal-raj-dev)) | `members/member-01-cv-metrology/` | `feat/m1-cv-metrology` | Optical quality gate (blur/glare), ArUco scale calibration, homography rectification, PDP surface area calculation. | **MERGED IN DEV (PR #3)** |
| **Member 2: Multilingual OCR** | **Parmarth Kumar** ([@parmarth-kumar](https://github.com/parmarth-kumar)) | `members/member-02-ocr/` | `feat/m2-ocr` | Text detection (DBNet++), multilingual recognition (PP-OCRv4 English + Devanagari Hindi), ONNX INT8 CPU inference, coordinate normalization. | **MERGED IN DEV (PR #4)** |
| **Member 3: Semantic Extraction** | **Harsh Patel** ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab)) | `members/member-03-extraction/` | `feat/m3-extraction` | Statutory field parsing (MRP, Net Qty, Dates, Address, PIN), banned unit flagger (`gms`, `ML`, `gm`, `ltrs`), Indic numeral conversion. | **MERGED IN DEV (PR #5)** |
| **Member 4: Rule Engine** | **Ambika Bansal** ([@bansalambika12-ship-it](https://github.com/bansalambika12-ship-it)) | `members/member-04-rule-engine/` | `feat/m4-rule-engine` | AST statutory compliance engine, Table-I font schedule (Row 5 = 6.0 mm), USP math validation, Rule 6 checks, 4-state verdict triage. | In Development |
| **Member 5: Evidence & Backend** | **Shailendra Pratap Singh** ([@shailendrapratap1](https://github.com/shailendrapratap1)) | `members/member-05-evidence/` | `feat/m5-evidence` | FastAPI REST services, PostgreSQL schema, SHA-256 Merkle chain-of-custody, Section 63 BSA 2023 digital certificate, ReportLab Form 1 PDF/A generation. | In Review / PR Open |
| **Member 6: Frontend & HUD** | **Urvashi Rajput** ([@rajputurvashi2006-bit](https://github.com/rajputurvashi2006-bit)) | `members/member-06-ui/` | `feat/m6-ui` | React 18 + Vite SPA, inspector camera HUD, split-view Adjudication Canvas, Central Dashboard, offline status indicators, mock API client. | In Development |

### Folder Ownership Rules
- You work **strictly inside your assigned folder**.
- Never modify files in another member's folder without explicit Team Lead approval.
- Shared contracts live strictly in `contracts/`.
- Integration glue and multi-module pipelines live strictly in `integration/`.
- Documentation lives in `docs/` or root markdown files. Never leave miscellaneous loose files in the root folder.

---

## 7. The Universal Non-Dependency Rule

This is our fundamental architectural rule:
**No member or AI agent may depend on another member's unmerged or unfinished code.**

- **Member 1** does not need Member 2; Member 1 tests optics and calibration on standalone image files.
- **Member 2** does not wait for Member 1; Member 2 runs text detection on pre-cropped image fixtures.
- **Member 3** does not import Member 2's OCR engine; Member 3 loads static OCR token JSON fixtures.
- **Member 4** does not wait for Members 1 and 3; Member 4 evaluates legal rules using pre-extracted entity fixtures.
- **Member 5** does not wait for Member 6; Member 5 tests REST endpoints using `pytest-asyncio` and `httpx`.
- **Member 6** does not wait for Member 5's live server; Member 6 builds and tests the UI against static mock API fixtures.

Every module must compile, run, and pass 100% of its tests completely standalone!

---

## 8. Contract-First Development

We coordinate parallel work entirely through contracts:
1. Canonical interfaces and DTOs are frozen in `contracts/`:
   - `quality_gate/`: `QualityCheckDTO`, `QualityGateResult`
   - `calibration/`: `CalibrationDTO`, `PlanarHomographyResult`, `PDPGeometryDTO`
   - `ocr/`: `OCROutput`, `OCRToken`, `BoundingPolygon`
   - `extraction/`: `ExtractedFieldDTO`, `NormalizedCommodityFacts`
   - `compliance/`: `RuleEvaluationDTO`, `ComplianceVerdictResult`
   - `evidence/`: `BSAEvidenceBundleDTO`, `MerkleNodeDTO`, `Section63CertificateDTO`
   - `ui/`: `ui_contract_schema.json`
2. Every member creates local test fixtures matching these contract schemas.
3. Every member writes implementation code to satisfy their contract.
4. Contracts cannot be modified unilaterally. Any contract change requires the formal Decision-Change Process.

---

## 9. Test Fixture Policy

Every member creates and maintains standalone fixtures inside their `fixtures/` directory:
- **File Naming Format:** `fixture_<feature>_<scenario>.<ext>` (e.g., `fixture_blur_fail.json`, `fixture_mrp_valid.json`).
- **Documentation:** Every fixture must include a 1-line source comment explaining where its ground truth values came from.
- **Clear Labeling:** Clearly tag synthetic data as `SYNTHETIC` and demo data as `DEMO FIXTURE`.
- **Integrity:** Never misrepresent synthetic data as actual seized or real-world enforcement data.

---

## 10. Git Branching Hierarchy & Sync Protocol

We enforce a strict 3-tier Git branch hierarchy:

```text
main (stable/approved baseline)
  ↓
dev (central integration branch)
  ↓
feat/m1-cv-metrology
feat/m2-ocr
feat/m3-extraction
feat/m4-rule-engine
feat/m5-evidence
feat/m6-ui (individual member feature branches)
```

- `main`: **Stable and approved baseline**. Contains the complete baseline specification, contracts, workspaces, and demo-safe releases. Direct pushes to `main` are restricted to approved baseline syncs by the Team Lead.
- `dev`: **Central integration branch**. All feature branches integrate here. Automated CI must pass before merging.
- Feature branches (`feat/*`): **Individual member branches** developed from `dev`:
  - `feat/m1-cv-metrology`
  - `feat/m2-ocr`
  - `feat/m3-extraction`
  - `feat/m4-rule-engine`
  - `feat/m5-evidence`
  - `feat/m6-ui`
- Hotfix branches: `hotfix/<issue-name>`

### Mandatory Pre-Work Branch Sync Protocol
Before starting **any** new work on an assigned branch, every developer and AI agent must run:

```bash
git fetch origin
git checkout <member-branch>
git merge origin/main
```

**Development from `dev` Note:**
Because feature branches are developed from `dev`, the Team Lead may also require a feature branch to sync from the latest `dev` before integration work (e.g., `git merge origin/dev`). Always consult the Team Lead for integration sync timing.

### Critical Git Guardrails
1. **Rebase Restriction:** Rebase may be used **only when the Team Lead explicitly approves it**. Standard practice is merging.
2. **Never Overwrite Uncommitted Work:** Never run destructive reset/clean commands (`git reset --hard`, `git checkout -f`, `git clean -fd`) that risk losing uncommitted changes. Stash or commit before syncing.
3. **Never Force-Push:** Never force-push (`git push --force` or `--force-with-lease`) unless the **Team Lead explicitly approves it**. If a push is rejected by the remote, stop and report the issue immediately.
4. **Escalate Cross-Boundary Conflicts:** If merge conflicts involve contracts (`contracts/`), system architecture (`03_FINAL_ARCHITECTURE.md`), legal rules (`02_FINAL_REQUIREMENTS_SPECIFICATION.md`, `16_DECISION_LOG.md`), or another member's code, **STOP immediately and inform the Team Lead**. Do NOT resolve cross-boundary conflicts unilaterally.
5. **No Extra Feature Branches:** Do not create any additional feature branches beyond the approved six.
6. **Small & Focused Commits:** Keep commits small, clear, and strictly scoped to your assigned tasks.

---

## 11. Legal & Regulatory Safety Guardrails

Our software directly supports government statutory enforcement. The following legal rules are strictly non-negotiable:
1. **Augmented Assistant Only:** The software never issues notices or fines on its own. It provides recommendations for human officer review.
2. **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023):** Electronic evidence certificates must cite **Section 63 of the BSA 2023**. Never cite repealed Section 65B of the Indian Evidence Act, 1872.
3. **Table-I Font Schedule:** The minimum numeral font height schedule under the LMPC Rules, 2011 is strictly:
   - Area $\le 50\text{ cm}^2$: **$1.0\text{ mm}$**
   - $50 < \text{Area} \le 100\text{ cm}^2$: **$1.5\text{ mm}$**
   - $100 < \text{Area} \le 500\text{ cm}^2$: **$2.5\text{ mm}$**
   - $500 < \text{Area} \le 2500\text{ cm}^2$: **$4.0\text{ mm}$**
   - $\text{Area} > 2500\text{ cm}^2$ (Row 5): **$6.0\text{ mm}$** (Never use 8.0 mm; see ADL-01).
4. **Unit Sale Price (USP) Math:** Enforce $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02$ INR.
5. **Temporal Epoch Router:** Check manufacturing dates against statutory amendment dates (e.g., USP mandatory only after 01 January 2022).
6. **E-Commerce Rule 6(10):** E-commerce listings must declare manufacturer, net quantity, MRP, consumer care, and country of origin. Manufacturing date is statutory exempt from digital listings.
7. **4-State Epistemic Verdict:** Output must classify findings into:
   - `PASS`: Full statutory compliance verified.
   - `FAIL`: Clear statutory violation established.
   - `REVIEW`: Borderline measurement within sensor uncertainty band ($k=2, 95\%$ confidence).
   - `UNABLE_TO_VERIFY`: Image quality degraded (severe blur, glare bloom, or obscured label).
8. **Prohibited Claims:** Consult `CLAIMS_WE_MUST_NOT_MAKE.md` before writing code comments, documentation, or docstrings.

---

## 12. Licensing & Intellectual Property Rules

To protect government intellectual property and ensure complete open-source auditability:
- **Zero AGPL-3.0 Dependencies:** Never install, import, or vendor Ultralytics YOLOv8, YOLOv11, or any copyleft AGPL library. Any AGPL dependency will trigger automatic CI rejection.
- **Approved Permissive Licenses Only:** Use packages licensed under **Apache-2.0, MIT, BSD-3-Clause, or PostgreSQL License**.
- **Approved Core Models:** DBNet++ (Apache-2.0), PP-OCRv4 (Apache-2.0), RT-DETR (Apache-2.0), Tesseract 5 (Apache-2.0).
- Check `requirements.txt` / `package.json` before adding any new third-party dependency.

---

## 13. Testing Standards

Every developer and AI agent is directly responsible for their module's tests:
- Tests reside strictly in your member's `tests/` directory.
- Test suites must cover normal success paths, explicit failure paths, boundary conditions, and degraded inputs.
- **Determinism:** Tests must be 100% deterministic and yield the identical result across runs without network calls.
- **Performance:** Mathematical, image processing, and rule tests must execute rapidly on standard CPU architectures.
- **Coverage Target:** Maintain $> 85\%$ branch and statement coverage for mathematical, metric calibration, and legal rule logic.
- Never report a task as complete without providing passing `pytest -v` command output.

---

## 14. Progress Log Format (`progress.md`)

Every member directory contains a permanent `progress.md` tracking file.
Every completed chunk or task entry must use this exact structure:

```markdown
# Progress Log

## [DATE] [TIME] IST

### Task / Chunk
What chunk or task was worked on.

### Status
NOT STARTED / IN PROGRESS / BLOCKED / COMPLETE

### Completed
Detailed bullet points of exactly what was implemented or resolved in this chunk.

### Tests
Exact test command executed and verification evidence (e.g., `pytest members/member-0X/tests/ -v`, 5 passed in 0.20s).

### Problems
Any blockers, bugs, or anomalies discovered.

### Decisions
Technical choices, parameters, or edge-case handling rationale.

### Next Step
The specific chunk or task to be executed next.

### Signing Note
SIGNED OFF BY: <author_handle> (<author_email>) — YYYY-MM-DD HH:MM IST [VERIFIED]
```

Always use accurate, current timestamps. Never falsify progress entries or test results.

---

## 15. Working Memory Format (`memory.md`)

Every member directory maintains a `memory.md` file to preserve critical discoveries, architectural constraints, and rationale:

```markdown
# Permanent Working Memory

## [DATE | TIME IST]

### Discovery
Specific technical, mathematical, or regulatory finding.

### Evidence
Document citation, Gazette notification number, test output, or benchmark data.

### Decision
The precise rule, threshold, parameter, or architectural choice established.

### Why
The root cause or technical rationale explaining why this choice is necessary.

### Impact
How this prevents bugs, regressions, legal false positives, or latency spikes.

### Status
ACTIVE / SUPERSEDED
```

---

## 16. Git Commit & Pull Request Standards

### Commit Format
Use clear, conventional commit messages:
- `feat(m<N>): <description>` (e.g., `feat(m1): implement Laplacian blur variance check`)
- `fix(m<N>): <description>` (e.g., `fix(m4): resolve USP rounding tolerance for multi-pack`)
- `test(m<N>): <description>` (e.g., `test(m3): add unit tests for prohibited gms unit`)
- `docs(m<N>): <description>` (e.g., `docs(m5): document Section 63 BSA certificate fields`)

Keep each commit small, atomic, and focused on a single verifiable change.

### Pull Request (PR) Policy
When submitting a feature branch for integration:
1. Target the `dev` branch only (never target `main` directly).
2. Use this required PR template:
   ```markdown
   ## What Changed
   Summary of changes introduced in this pull request.

   ## Why
   Technical or statutory reason for this change.

   ## Requirements Covered
   Specification IDs (e.g., FR-03, FR-08, ADR-06).

   ## Tests Performed
   Exact test commands and passing verification output.

   ## Known Limitations
   Any edge cases or incomplete scope deferred to future chunks.

   ## Documentation Updated
   List of updated README, progress, or memory files.
   ```
3. At least one peer review approval is required prior to merge.
4. All automated CI checks (lint, unit tests, license scan) must pass 100%.

---

## 17. Definition of Done (DoD)

A task or chunk is considered **DONE** if and only if:
1. The code is written, well-documented, clean, and typed.
2. It strictly conforms to the canonical contract in `contracts/`.
3. Unit and regression tests pass with zero errors and zero warnings.
4. Degradations, edge cases, and invalid inputs are handled gracefully without unhandled exceptions.
5. The member folder's `README.md` is kept up to date.
6. The task was decomposed into testable chunks before starting, and executed chunk-by-chunk with verification at each step.
7. `progress.md` is updated with a verified signing note (`SIGNED OFF BY: <handle> (<email>) — YYYY-MM-DD HH:MM IST [VERIFIED]`).
8. `memory.md` records all architectural discoveries and rationales.
9. Zero AGPL-3.0 code, zero invented legal rules, and zero unverified assumptions were introduced.

---

## 18. Integration Rules

Modules are combined only after each component works completely standalone:
- Cross-module integration happens strictly in the `integration/` directory.
- Use adapters in `integration/adapters/` to bridge between subsystems.
- Never modify a member's clean source folder to force integration.
- Test both nominal success flows and pipeline rejection flows (e.g., blur retake, glare retake, missing statutory unit).

---

## 19. Emergency & Hotfix Protocol

If a critical bug breaks integration on `dev`:
1. Create a hotfix branch from `dev`: `hotfix/<issue-name>`.
2. Implement only the minimal fix. Do not introduce new features.
3. Write an automated test reproducing and proving the fix.
4. Open a hotfix PR targeting `dev`.
5. Merge once automated CI tests pass and the Team Lead approves.

---

## 20. Decision-Change Process

If an inconsistency or error is discovered in a frozen decision:
1. **Do not silently modify code or contracts.**
2. Log the conflict using this template:
   ```text
   CONFLICT IDENTIFIED
   Document A: ...
   Document B: ...
   Impact: ...
   Current Frozen Default: ...
   Proposed Resolution: ...
   ```
3. Escalate the conflict directly to the Team Lead.
4. If approved by the Team Lead, record the amendment in `16_DECISION_LOG.md`.
5. Update canonical contracts and notify all affected workstreams.

---

## 21. Demo Safety Architecture

To guarantee 100% demo reliability under unpredictable hackathon or exhibition venue network conditions, the system adheres to a 3-tier safety plan:
- **Tier 1 (Live Web Application):** Full online web platform running in modern desktop/mobile browsers connected to the FastAPI backend and PostgreSQL datastore.
- **Tier 2 (Local Mode B Standalone):** Local Python runner on `localhost:8000` with local SQLite storage, executing inspections locally without internet connectivity.
- **Tier 3 (Golden Static Fixtures):** 5 pre-computed, verified inspection dossiers (`SKU-DEMO-01` to `SKU-DEMO-05`) ready for instant presentation if all local hardware fails.

Never allow a live demonstration to fail due to network, API timeout, or hardware disruption.

---

## 22. Universal Instructions for All AI Coding Agents

If you are an **AI coding assistant, autonomous agent, or LLM-driven pair-programmer** (including Claude Code, Cursor, Windsurf, GitHub Copilot, Devin, Antigravity, Cline, Roo Code, Aider, or any other agent tool) working on this repository:

1. **Read Before Writing:** Read `AGENTS.md`, your member's `README.md`, and relevant contracts in `contracts/` before touching code.
2. **Team Lead Authority:** The human Team Lead manually assigns all work. Never autonomously invent tasks, redistribute tasks, or self-assign work across member workspaces.
3. **No Extra Branches:** Never create extra feature branches beyond the approved 6 member branches (`feat/m1-cv-metrology` through `feat/m6-ui`).
4. **Mandatory Pre-Work Sync:** Always verify that the branch sync protocol has been run before writing code:
   ```bash
   git fetch origin
   git checkout <member-branch>
   git merge origin/main
   ```
   *(Or `git merge origin/dev` when explicitly directed by the Team Lead for integration work).*
5. **Rebase Restriction:** Rebase may be used **only** when the Team Lead explicitly approves it. Merging is the standard sync mechanism.
6. **Protect Uncommitted Changes:** Never run destructive commands (`git reset --hard`, `git checkout -f`, `git clean -fd`) that risk losing uncommitted changes. Stash or commit cleanly.
7. **Zero Force-Push:** Never force-push (`git push --force` or `--force-with-lease`) unless the Team Lead explicitly approves it. If a push is rejected, stop and investigate.
8. **Escalate Cross-Boundary Conflicts:** If conflicts involve contracts (`contracts/`), system architecture (`03_FINAL_ARCHITECTURE.md`), legal rules (`02_FINAL_REQUIREMENTS_SPECIFICATION.md`, `16_DECISION_LOG.md`), or another member's code, **STOP immediately and inform the Team Lead**. Do not resolve cross-boundary conflicts unilaterally.
9. **Stay in Your Assigned Workspace:** Work strictly within your assigned member directory (`members/member-0X/`). Do not edit another member's files.
10. **Respect Contracts:** Never change a file in `contracts/` without explicit authorization through the Decision-Change Process.
11. **Zero Data Hallucination:** Do not invent statutory rules, penalty fines, Gazette numbers, font heights, or manufacturer data.
12. **Zero AGPL-3.0 Code:** Never recommend, import, or vendor Ultralytics YOLO or any copyleft AGPL packages. Use permissive licenses only.
13. **Write Unit Tests First/Alongside:** Every new function, parser, or rule evaluation must have deterministic unit tests in `tests/`.
14. **Break Tasks into Chunks Before Proceeding:** Never attempt large, monolithic modifications in one shot. Always decompose assigned work into small, testable chunks first.
15. **Work Chunk by Chunk:** Implement and verify each chunk sequentially before starting the next chunk.
16. **Update Records with Signing Notes:** Conclude every completed chunk or task entry in `progress.md` with an official signing note:
    ```text
    SIGNED OFF BY: <author_handle> (<author_email>) — YYYY-MM-DD HH:MM IST [VERIFIED]
    ```
