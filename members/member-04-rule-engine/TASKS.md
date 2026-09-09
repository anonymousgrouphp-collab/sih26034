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
