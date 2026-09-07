# AGENTS.md — Master Rules for Developers & AI Agents

Welcome to **NyayaDrishti-LM (SIH26034)**.
This file explains how our team works.
It is written in simple words so anyone can follow it easily.
Every developer and AI assistant must follow these rules without exception.

---

## 1. Project Purpose

NyayaDrishti-LM is an online web application built for the **Department of Consumer Affairs (DoCA)**, Government of India.
Its job is to help government inspectors check packaged goods (like biscuits, soaps, and oil bottles) to see if they follow the law.
The law is called the **Legal Metrology (Packaged Commodities) Rules, 2011**.
The app also checks single e-commerce product listings.
It has a local mode (Mode B) so field officers can inspect packages on a laptop even when there is no internet.
The system does not replace the human officer. It is a smart helper. The human officer always makes the final decision.

---

## 2. Source-of-Truth Hierarchy

When you need to know what is correct, always follow this order:
1. **Repository Frozen Markdown Specifications** (`01` through `17` and `CLAIMS_WE_MUST_NOT_MAKE.md`).
2. **Authoritative Decision Log** (`16_DECISION_LOG.md`).
3. **Contracts Directory** (`contracts/`).
4. **Member Task Files** (`members/*/TASKS.md`).
5. **General Documentation and Guides**.

Never invent rules, numbers, or facts.
If external training data or online blogs disagree with our repository documents, our repository documents win every time.

---

## 3. Frozen Documents List

These documents are frozen. You must not change their core decisions:
- `01_MASTER_PROJECT_BLUEPRINT.md`: Main project vision and schedule.
- `02_FINAL_REQUIREMENTS_SPECIFICATION.md`: All functional and non-functional requirements.
- `03_FINAL_ARCHITECTURE.md`: Monolith architecture, 12-stage pipeline, and modes.
- `04_FINAL_MVP_SCOPE.md`: What must be built (P0) and what is cut (P3).
- `05_TECHNOLOGY_DECISION_RECORD.md`: 13 official technology choices (ADRs).
- `06_DATA_AND_MODEL_STRATEGY.md`: Data plans and INT8 CPU optimizations.
- `07_API_AND_INTERFACE_CONTRACTS.md`: Exact REST endpoints and data shapes.
- `08_DATABASE_SPECIFICATION.md`: Database tables, fields, and SQL queries.
- `09_UI_UX_BLUEPRINT.md`: Screen wireframes, design tokens, and colors.
- `10_SECURITY_AND_AUDIT_SPECIFICATION.md`: Section 63 BSA 2023 evidence and JWT security.
- `11_TESTING_AND_VALIDATION_PLAN.md`: Test pyramid and golden test cases.
- `12_DEMO_PLAN.md`: 3-tier live demo strategy and scripts.
- `13_SIX_MEMBER_EXECUTION_PLAN.md`: 6-member daily task assignments.
- `14_GITHUB_WORKFLOW.md`: Git branches, pull requests, and Definition of Done.
- `15_RISK_AND_CONTINGENCY_REGISTER.md`: Known risks and backup plans.
- `16_DECISION_LOG.md`: Log of every frozen architectural decision.
- `17_OPEN_QUESTIONS.md`: Safe working defaults for bounded questions.
- `CLAIMS_WE_MUST_NOT_MAKE.md`: Blacklist of claims we must never make.
- `CONNECTIVITY_REQUIREMENTS.md`: Exact network rules for every component.
- `SYSTEM_MODES_AND_CONNECTIVITY.md`: Mode A (Online), Mode B (Local), Mode C (Integrations).

---

## 4. Six-Member Parallel Structure

Six developers work on this project at the same time:
1. **Member 1 (CV & Metrology):** Optical quality gate, ArUco calibration, homography, and font millimeter measurement.
2. **Member 2 (OCR):** Text detection (DBNet++) and multilingual recognition (PP-OCRv4).
3. **Member 3 (Extraction & NLP):** Reads text tokens and extracts MRP, net weight, dates, and addresses without hallucinating.
4. **Member 4 (Rule Engine):** Deterministic legal checks (Table-I font height, USP math, Rule 6 checks).
5. **Member 5 (Evidence & Backend):** FastAPI server, PostgreSQL database, SHA-256 Merkle chain, and Section 63 BSA PDF notice generator.
6. **Member 6 (UI & HUD):** React web frontend, camera HUD, adjudication canvas, and dashboard.

---

## 5. Folder Ownership

Every developer owns their specific folder:
- Member 1 owns `members/member-01-cv-metrology/`
- Member 2 owns `members/member-02-ocr/`
- Member 3 owns `members/member-03-extraction/`
- Member 4 owns `members/member-04-rule-engine/`
- Member 5 owns `members/member-05-evidence/`
- Member 6 owns `members/member-06-ui/`

Rules for folder ownership:
- You work primarily inside your assigned folder.
- You must not edit another member's folder without direct permission.
- Shared files live in `contracts/`, `integration/`, or `docs/`.
- Do not scatter random loose files in the root directory.

---

## 6. Branch Rules

We use a strict branching system:
- `main`: Safe for demos and production. Never push directly to `main`.
- `dev`: The central integration branch.
- Feature branches:
  - `feat/m1-cv-metrology`
  - `feat/m2-ocr`
  - `feat/m3-extraction`
  - `feat/m4-rule-engine`
  - `feat/m5-evidence`
  - `feat/m6-ui`

Rules:
- Work starts from `dev`.
- Always work on your own feature branch.
- Never force push (`git push --force`) to shared branches.
- Never rebase or delete someone else's branch.
- Keep commits small, clear, and focused.

---

## 7. The No-Cross-Dependency Rule

This is our golden rule:
**No member may depend on another member's unfinished code.**

Examples:
- Bad: Member 3 imports code from Member 2 to get OCR results.
- Good: Member 3 loads a frozen test fixture (`fixtures/ocr_sample.json`) that matches the contract.
- Bad: Member 6 waits for Member 5 to finish the live server.
- Good: Member 6 runs the UI against mock API fixtures (`fixtures/api/`).
- Bad: Member 4 waits for Member 1 and Member 3.
- Good: Member 4 uses static extracted entity fixtures to test legal rules.

Every module must run and pass tests completely on its own!

---

## 8. Contract-First Development

We build our software using contracts:
1. The contract defines the data shape in `contracts/`.
2. Each member builds fixtures that match this contract.
3. Each member writes code to satisfy the contract.
4. If a contract must change, you cannot change it alone. You must follow the decision-change process.

Contracts are shared rules. They protect everyone from surprises.

---

## 9. Test Fixture Policy

Every member creates local fixtures inside their `fixtures/` directory:
- File naming format: `fixture_<feature>_<scenario>.<ext>` (e.g., `fixture_blur_fail.json`, `fixture_mrp_valid.json`).
- Always write a 1-line comment or note explaining where the fixture values came from.
- Label synthetic data clearly as `SYNTHETIC`.
- Label demo data clearly as `DEMO FIXTURE`.
- Never pretend fake data is real government data.

---

## 10. Data Non-Assumption Policy

Never invent data. This is strictly prohibited.
- Do not invent legal rules or fines.
- Do not invent Gazette notification numbers.
- Do not invent product names, prices, or manufacturer addresses.
- Do not invent font sizes or accuracy percentages.
- Always use the exact values written in the repository documents.
- If a value is missing in a document, check `17_OPEN_QUESTIONS.md` for the safe working default.

---

## 11. Legal & Regulatory Safety Rules

Our project deals with government law enforcement.
We must follow strict legal guardrails:
- Our system is an **Augmented Diagnostic Assistant**.
- The software **never** issues fines or legal notices by itself.
- A human Legal Metrology Officer (LMO) must always review and approve the evidence.
- We cite **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)** for electronic evidence. We never cite repealed Section 65B of the old 1872 Act.
- We implement Table-I font sizes correctly: Row 5 ($> 2500\text{ cm}^2$) requires **6.0 mm** (not 8.0 mm).
- Check `CLAIMS_WE_MUST_NOT_MAKE.md` before writing any presentation or doc string.

---

## 12. Dependency & Licensing Rules

We must protect government intellectual property:
- **Zero AGPL-3.0 libraries:** Never install or import Ultralytics YOLOv8, YOLOv11, or other AGPL copyleft code.
- Use only permissive licenses: **Apache-2.0, MIT, BSD-3-Clause, or PostgreSQL license**.
- Approved models: DBNet++ (Apache-2.0), PP-OCRv4 (Apache-2.0), RT-DETR (Apache-2.0), Tesseract 5 (Apache-2.0).
- Check `requirements.txt` before adding any new package.

---

## 13. Testing Rules

Every member is responsible for their own tests:
- Tests go into your `tests/` folder.
- Write tests for normal cases, failure cases, and edge cases.
- Every test must be deterministic. It must give the same result every time.
- Never say "it works on my computer" without showing passing test output.
- Target: $> 85\%$ test coverage for math and legal rule checks.

---

## 14. Progress Log Format (`progress.md`)

Every member must keep an updated `progress.md` file in their folder.
Use this exact format for every entry:

```markdown
# Progress Log

## [DATE] [TIME] IST

### Task
What I worked on.

### Status
NOT STARTED / IN PROGRESS / BLOCKED / COMPLETE

### Completed
Exactly what is finished.

### Tests
Which tests were run and the exact results.

### Problems
Any issues or bugs discovered.

### Decisions
Any choices made during work.

### Next Step
What I will do next.

### Completion Note
If finished, write:
COMPLETE — YYYY-MM-DD HH:MM IST
```

Always use real dates and times. Never fake timestamps.

---

## 15. Memory Log Format (`memory.md`)

Every member has a permanent memory file called `memory.md`.
Use this format to record important discoveries and facts:

```markdown
# Permanent Working Memory

## [07 September 2026 | 18:30 IST]

### Discovery
Found that Table-I Row 5 requires 6.0 mm for containers over 2500 cm².

### Evidence
`05_TECHNOLOGY_DECISION_RECORD.md` and Gazette G.S.R. 629(E).

### Decision
Set the minimum threshold in rule engine to 6.0 mm.

### Why
Phase 1 notes had an 8.0 mm typo corrected in official decision ADL-01.

### Impact
Prevents false violations on large jars and bags.

### Status
ACTIVE
```

---

## 16. Commit Rules

Use clear and standard commit messages:
- Features: `feat(m<N>): short description` (e.g., `feat(m1): implement Laplacian blur check`)
- Bug fixes: `fix(m<N>): short description` (e.g., `fix(m4): fix USP rounding error`)
- Tests: `test(m<N>): short description` (e.g., `test(m3): add tests for banned unit gms`)
- Docs: `docs(m<N>): short description` (e.g., `docs(m5): update PDF generation notes`)

Keep each commit small and related to one thing.

---

## 17. Pull Request (PR) Rules

When opening a Pull Request:
1. Target the `dev` branch (never target `main` directly).
2. Use this template:
   ```markdown
   ## What Changed
   Brief summary of changes.

   ## Why
   Reason for this change.

   ## Requirements Covered
   Requirement ID (e.g., FR-02, FR-08).

   ## Tests Performed
   List passing test commands and results.

   ## Known Limitations
   Anything not yet covered.

   ## Documentation Updated
   List updated files.
   ```
3. At least one teammate must review and approve.
4. All CI checks must pass before merging.

---

## 18. Definition of Done (DoD)

A task is **DONE** only when:
1. The code is written and follows clean coding standards.
2. It matches the frozen contract in `contracts/`.
3. Unit tests pass with zero errors.
4. Error cases are handled smoothly without crashes.
5. `README.md` in your member folder is updated.
6. `progress.md` is updated with `COMPLETE — [Date] [Time] IST`.
7. `memory.md` records all key technical choices.
8. No unapproved outside data was introduced.

---

## 19. Integration Rules

We only connect modules together after they work standalone:
- Integration happens in the `integration/` directory.
- Use adapters in `integration/adapters/` to bridge components.
- Do not modify a member's clean source folder to force integration.
- Test both success and failure flows (e.g., blurry picture, glare, missing unit).

---

## 20. Emergency / Hotfix Process

If a critical bug breaks integration:
1. Branch from `dev`: `hotfix/<issue-name>`.
2. Fix only the critical bug. Do not add new features.
3. Write a test reproducing and proving the fix.
4. Open a hotfix PR.
5. Merge back to `dev` once tests pass.

---

## 21. Decision-Change Process

If you find a mistake in a frozen decision:
1. **Do not silently change the code.**
2. Record the conflict clearly:
   ```text
   CONFLICT FOUND
   Document A: ...
   Document B: ...
   Impact: ...
   Current Frozen Default: ...
   Proposed Fix: ...
   ```
3. Discuss with the team lead.
4. If approved, add an entry to `16_DECISION_LOG.md`.
5. Update the contract and notify all affected members.

---

## 22. Demo Safety Rules

We follow a 3-tier demo safety plan:
- **Tier 1 (Live Web App):** The normal online web application on standard browsers.
- **Tier 2 (Local Mode B):** Standalone local runner on `localhost:8000` with local SQLite if internet fails.
- **Tier 3 (Golden Static Fixtures):** 5 pre-computed verified dossiers ready for instant display if hardware fails.

Never let a demo fail because of venue Wi-Fi. Mode B and golden fixtures keep us 100% safe.

---

## 23. Instructions for AI Coding Agents

If you are an AI coding assistant working on this repository:
1. **Read before writing:** Check `AGENTS.md`, your member's `README.md`, and relevant contracts before editing code.
2. **Stay in your lane:** Work only in your assigned member folder. Do not edit other members' files.
3. **Respect contracts:** Never change a file in `contracts/` without explicit authorization.
4. **Never invent data:** Do not invent facts, numbers, or legal rules.
5. **No AGPL-3.0 code:** Never recommend or import Ultralytics or copyleft packages.
6. **Always write tests:** Every new function must have unit tests.
7. **Keep logs up to date:** Always update `progress.md` and `memory.md` when completing work.
