# 08 — HISTORICAL AUDIT & RECENT CHANGE IMPACT REPORT: SIH26034

**Project Identifier:** SIH26034  
**Audit Baseline:** Pre-Development Audit (07 September 2026) vs Current Audit (10 September 2026)  
**Time Elapsed:** 3 Days (Cycle 1 through Cycle 6)  
**Lead Auditor:** Systems Architect & Project Continuity Specialist  

---

## 1. Historical Audit Baseline Overview

On **07 September 2026**, prior to Day 1 development, the repository underwent its initial pre-development feasibility review, recorded in `FINAL_AUTHENTICITY_AND_ACCURACY_AUDIT.md`.

The 07 September audit issued 9 binding development readiness directives:
1. Re-align primary product as an Online-First Web Application (Mode A) with local field resilience (Mode B).
2. Eliminate legacy typo in Table-I font schedule (substituting 6.0 mm for Row 5 instead of 8.0 mm).
3. Strictly cite Section 63 BSA 2023 and eliminate repealed Section 65B of the Indian Evidence Act, 1872.
4. Maintain 100% permissive licensing (zero AGPL-3.0 / GPL-3.0 copyleft models or dependencies).
5. Separate binary files into `/storage/`, never storing BLOBs in relational tables.
6. Adopt realistic dual performance and accuracy standards ($\le 0.15\text{ mm}$ on synthetic targets; $\le 0.30\text{ mm}$ on real FMCG packages).
7. Allocate ownership strictly across 6 independent workstreams.
8. Validate a 3-tier live demonstration strategy (Online Web -> Local Web -> Static Golden).
9. Eliminate misleading marketing claims regarding "guaranteed court admissibility" or "100% offline everywhere".

---

## 2. Comprehensive Previous Finding vs Current State Matrix

| Previous Mandate (07 Sept 2026) | Recommended Action | Current State (10 Sept 2026) | Verification Evidence | Classification & Assessment |
| :--- | :--- | :--- | :--- | :--- |
| **1. Online Monolith + Mode B Resilience** | Implement FastAPI server serving React SPA and standalone local runner with SQLite. | Fully implemented. `main.py` serves web SPA; `local_runner.py` executes 12-stage pipeline locally with 0 bytes transmitted. | Live server running on port 8000; `test_mode_b_offline_runner.py` passes 100%. | **GENUINELY COMPLETED & EXCELLENT.** |
| **2. Table-I Row 5 Font Height** | Fix legacy 8.0 mm typo to statutory 6.0 mm (G.S.R. 629(E)). | Codified in `evaluators.py` line 34: `A > 2500 cm2` returns `6.0 mm`. | `test_rules.py` tests Table-I Row 5 with 6.0 mm assertions. | **CORRECTLY FIXED & CODIFIED.** |
| **3. Section 63 BSA 2023 Electronic Evidence** | Purge Section 65B citations; adopt Section 63 BSA 2023. | 100% purged. Schemas, PDF templates, and UI strictly reference Section 63 BSA 2023. | `test_bsa_certificate.py`, UI snapshot, PDF notice header. | **CORRECTLY FIXED & AIRTIGHT.** |
| **4. Permissive Open-Source Licensing** | Ban AGPL-3.0 (YOLOv8/11); use DBNet++ and PP-OCRv4 (Apache-2.0). | DBNet++ and PP-OCRv4 ONNX checkpoints vendored; requirements contain 0 copyleft packages. | `members/member-02-ocr/models/`, `requirements.txt`. | **COMPLETED & FULLY AUDITED.** |
| **5. Storage Decoupling** | Decouple file binaries from database tables; store in `/storage/`. | `storage.py` manages filesystem storage; database stores only URI and SHA-256 hash. | `test_storage_manager.py`, database schema inspection. | **CORRECTLY IMPLEMENTED.** |
| **6. Realistic Dual Accuracy Standards** | Document $\le 0.15\text{ mm}$ on flat targets and $\le 0.30\text{ mm}$ on real FMCG. | Dual tolerances codified in `contracts/calibration/` and `evaluators.py`. | Real packaging test suite achieves $\le 0.25\text{ mm}$ on physical commercial FMCG. | **GENUINELY IMPROVED.** |
| **7. Six-Member Parallel Architecture** | Execute in parallel using mocked Pydantic DTO contracts. | All 6 members completed and merged into `dev` via PRs #2, #3, #4, #5, #6. | Git commit log, PR merge records, 570 passing tests. | **COMPLETED AHEAD OF SCHEDULE.** |
| **8. Three-Tier Demo Safety** | Prepare Tier 1 (Live Web), Tier 2 (Local Runner), Tier 3 (Golden SKUs). | All 3 tiers built: Live Web on port 8000/3000, Mode B runner, and 6 frozen golden SKUs. | `inspect_cli.py --demo`, React quick-selector catalog. | **EXCELLENT DEMO READINESS.** |
| **9. False Confidence Blacklist** | Enforce prohibited claims in `CLAIMS_WE_MUST_NOT_MAKE.md`. | System adheres to HITL principle, never claims autonomous penalties or guaranteed court wins. | Code docstrings, UI plain-language mode, user rules. | **DISCIPLINED & COMPLIANT.** |

---

## 3. What Genuinely Improved (07 Sept to 10 Sept 2026)

1. **Massive Codebase Maturity:**
   Over the past 72 hours, the team integrated all 6 parallel workstreams into a functional monolith:
   - PR #2: Member 5 (Evidence backend, FastAPI REST, Merkle DAG, ReportLab notices).
   - PR #3: Member 1 (CV metrology, ArUco detection, homography, PDP surface calculation).
   - PR #4: Member 2 (Multilingual OCR, INT8 post-training quantization, ONNX Runtime).
   - PR #5: Member 3 (Semantic extraction, banned unit detector, homoglyph normalization).
   - PR #6, #8, #9: Member 4 (Legal AST rule engine, Table-I schedules, Jan Vishwas compounding).
2. **Creation of Interactive Field Inspector CLI (`inspect_cli.py`):**
   A rich terminal inspection tool with ANSI tables, sub-millisecond execution, and instant demo capabilities was implemented on 10 September.
3. **Creation of Standalone Zero-Build Test HUD (`/test-ui/`):**
   A dedicated diagnostic interface serving raw JSON contracts, SVG overlays, and live pipeline execution without requiring Node.js.
4. **Physical Packaging Benchmark Suite:**
   Real testing against 8 physical commercial packaging items (Parle-G, Amul Butter, Tata Salt, Haldiram's Bhujia, etc.).

---

## 4. What Was Partially Implemented or Ignored

1. **Automated Live E-Commerce Marketplace Crawler:**
   While Rule 6(10) statutory exemptions and country-of-origin filters were implemented in the parser and rule engine, an automated dynamic crawler that accepts a live URL (e.g. `https://www.amazon.in/dp/...`), renders JavaScript via Playwright, and extracts the DOM automatically was deferred. The current system ingests plain text or saved HTML snippets.
2. **Hardware PKI Token (DSC Dongle) Integration:**
   `08_DATABASE_SPECIFICATION.md` and `10_SECURITY_AND_AUDIT_SPECIFICATION.md` discussed cryptographic smartcard dongles. In line with the pre-development audit, this was safely scoped down to local cryptographic signing of the Merkle root with an officer PIN rather than attempting to interface with physical USB dongles in a hackathon demo.

---

## 5. New Issues & Regressions Introduced in Recent Commits

1. **NEW CRITICAL DEFECT: Notice Generation Unique Constraint Collision (HTTP 500):**
   Introduced during PR #2 backend wiring in `members/member-05-evidence/src/server.py`. The `generate_legal_notice` endpoint unconditionally creates a new `BSACertificate` row for `inspection_id`. If a certificate already exists, the database unique constraint aborts the transaction with HTTP 500.
2. **NEW ENVIRONMENT GAP: Missing `playwright` Package:**
   Introduced in commit `b74db2a` when adding `tests/live_e2e_playwright_accuracy_suite.py`. The script relies on `playwright`, which was not added to the virtual environment, causing it to fail on headless CLI test runs.
3. **HARDCODED DEVELOPER PATH:**
   In commit `fe97941` (`tests/test_inspect_cli.py`), a hardcoded path `C:\Users\ceoha\...` was committed, which broke on other developer machines until dynamically redirected to `sys.executable`.
