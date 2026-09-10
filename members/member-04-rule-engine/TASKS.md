# Member 4 Tasks — Statutory Rule Engine
**Assigned Engineer:** **Ambika Bansal** ([@bansalambika12-ship-it](https://github.com/bansalambika12-ship-it))  
**Branch:** `feat/m4-rule-engine`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & Table-I Schedule
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define compliance input test fixtures representing legal violations and compliant packages.
- [x] Implement Table-I font-height evaluator comparing measured mm vs required threshold:
  - Row 1: Area $\le 50\text{ cm}^2 \implies 1.0\text{ mm}$
  - Row 2: $50 < \text{Area} \le 100\text{ cm}^2 \implies 1.5\text{ mm}$
  - Row 3: $100 < \text{Area} \le 500\text{ cm}^2 \implies 2.5\text{ mm}$
  - Row 4: $500 < \text{Area} \le 2500\text{ cm}^2 \implies 4.0\text{ mm}$
  - Row 5: $\text{Area} > 2500\text{ cm}^2 \implies \mathbf{6.0\text{ mm}}$ (G.S.R. 629(E))
- [x] Write unit tests for Table-I (`TS-UNIT-06`, `TS-UNIT-07`, `TS-UNIT-08`).

### Day 2: USP Arithmetic & Rule 6 Checks
- [x] Implement Unit Sale Price (USP) arithmetic validator: $\|(\text{USP} \times \text{NetQty}) - \text{MRP}\| \le 0.02$.
- [x] Implement Rule 6(1)(e) MRP tax clause check ("(inclusive of all taxes)").
- [x] Implement Rule 6(1)(p) Country of Origin check.
- [x] Write unit tests for USP math (`TS-UNIT-04`, `TS-UNIT-05`).

### Day 3: Temporal Epoch Dispatcher & E-Commerce Auditor
- [x] Create statutory rule snapshots (2011 Base, 2017 Font, 2021 USP, 2023 Jan Vishwas).
- [x] Implement Temporal Epoch Dispatcher routing product Mfg Date to rule snapshot.
- [x] Implement E-Commerce marketplace compliance checker (Rule 6(10) with Mfg Date exemption).
- [x] Implement 4-State Epistemic Triage (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`).
- [x] Write unit tests for temporal routing and e-com checks (`TS-UNIT-10` to `TS-UNIT-13`).

### Day 4: Benchmarking, Hallucination Audit & DoD
- [x] Verify 100% rule execution determinism and latency $< 5\text{ ms}$.
- [x] Audit to guarantee zero LLM calls or ungrounded heuristic guesses.
- [x] Complete Definition of Done checklist.
- [x] Update `progress.md` and `memory.md`.

### Phase 3: Courtroom-Admissible AST Hardening, Rule 24 Wholesale Multi-Packs & Jan Vishwas 2023
- [x] Chunk 1: USP Mathematical Edge-Cases (cross-unit conversions $g \leftrightarrow kg$, $ml \leftrightarrow l$, per $100\text{g}/100\text{ml}$, per piece, IEEE 754 precision defense, NaN/Inf input safety).
- [x] Chunk 2: Rule 24 Wholesale Multi-Pack & Multi-Piece Package Compliance (piece count, individual piece net quantity, quantity arithmetic validation, and multi-pack USP).
- [x] Chunk 3: Jan Vishwas (Amendment of Provisions) Act, 2023 (Act No. 18 of 2023) Decriminalization & Compounding Schedule Calculator (Form-1 Statutory Improvement Notices with 14-day cure window for first-time technical defaults, compounding tiers up to ₹25,000 / ₹50,000 / ₹1,00,000 with imprisonment repealed).
- [x] Chunk 4: Courtroom-admissible AST evidence integration, 100% Pydantic contract compliance (`ComplianceVerdictResult` / `RuleEvaluationDTO`), sub-5ms execution latency, and comprehensive 42-test suite.

### Phase 4: 4-Pass Stress-Test, Bug-Bash, Fuzzing & Concurrency Audit
- [x] Pass 1: Metrological Corner Cases & Table-I Schedule Boundaries (exact row thresholds across 5 tiers, sensor uncertainty envelope triage with IEEE 754 precision guard, epoch boundary days, banned unit symbol exhaustive matrix).
- [x] Pass 2: 1,000 Randomized Fuzzed Inspections & Singularity Defense (extreme floats, negative numbers, NaN/Inf, zero crash guarantee, Pydantic DTO roundtrip).
- [x] Pass 3: High-Concurrency & Multi-Thread Stress (50 concurrent worker threads, 500 simultaneous inspections, wholesale multi-pack calculations, p99 latency < 5ms).
- [x] Pass 4: Memory Stability & 100% Deterministic Repetitive Stress (3,000 sequential inspections in constant time, zero memory leaks, byte-for-byte reproducibility).

