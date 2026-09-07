# Contributing to NyayaDrishti-LM (SIH26034)

Thank you for contributing to **NyayaDrishti-LM**, an automated compliance inspection platform engineered for the **Department of Consumer Affairs (DoCA)**, Ministry of Consumer Affairs, Food & Public Distribution under **Smart India Hackathon 2026**.

To maintain deterministic reproducibility, strict legal compliance, and zero architectural drift, all contributions must strictly adhere to the engineering workflows detailed below.

---

## 🏛️ Governance & Architecture Freeze

1. **Master Single Source of Truth:** All contributions must comply with [01_MASTER_PROJECT_BLUEPRINT.md](01_MASTER_PROJECT_BLUEPRINT.md) and [03_FINAL_ARCHITECTURE.md](03_FINAL_ARCHITECTURE.md).
2. **Permissive Open-Source Licensing Only:**
   - Permitted: `Apache-2.0`, `MIT`, `BSD-3-Clause`.
   - **Strictly Prohibited:** Any `GNU AGPL-3.0` packages (e.g., `ultralytics`). Pull requests introducing AGPL dependencies will be automatically rejected by CI.
3. **No Uncalibrated Physical Measurements:** Physical font millimeter measurements must use the calibrated planar homography pipeline ([06_DATA_AND_MODEL_STRATEGY.md](06_DATA_AND_MODEL_STRATEGY.md)).

---

## 🌿 Branching Strategy (Strict Trunk-Based)

- **`main`**: Production-ready, demo-safe code. Direct commits to `main` are disabled.
- **`dev`**: Central integration branch. All automated CI checks must pass before merging.
- **Feature Branches**: Named strictly according to member workstreams:
  - Format: `feat/m<member_id>-<subsystem>`
  - Examples:
    - `feat/m1-aruco-homography`
    - `feat/m2-dbnet-ppocr-pipeline`
    - `feat/m3-spatial-extraction-graph`
    - `feat/m4-ast-rule-engine`
    - `feat/m5-sec63-bsa-pdf-dossier`
    - `feat/m6-adjudication-canvas-ui`
- **Hotfix Branches**: `hotfix/<issue-name>`.

---

## 📝 Commit Message Conventions

We adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` A new feature or subsystem implementation
- `fix:` A bug fix in existing logic
- `docs:` Documentation updates or specifications
- `test:` Adding or refactoring unit, integration, or regression tests
- `refactor:` Code refactoring without changing observable behavior
- `perf:` Performance optimizations (e.g., ONNX INT8 quantization, latency reduction)
- `ci:` Changes to CI configuration or automated workflows

**Example:**
```bash
git commit -m "feat(homography): implement ArUco 4x4 planar rectification with sub-0.3mm MAE"
```

---

## 🛡️ Definition of Done (DoD)

A pull request is considered **DONE** and eligible for merge if and only if:

1. **Contract Conformance:** Strictly satisfies the API contracts and schemas defined in [07_API_AND_INTERFACE_CONTRACTS.md](07_API_AND_INTERFACE_CONTRACTS.md).
2. **Test Coverage:** Achieves $> 85\%$ unit test coverage for mathematical, optical, and legal rule algorithms ([11_TESTING_AND_VALIDATION_PLAN.md](11_TESTING_AND_VALIDATION_PLAN.md)).
3. **Edge Performance:** Executes within the CPU latency budget ($\le 1200\text{ ms}$ on 8-core CPU) without requiring a discrete GPU.
4. **Peer Review:** Reviewed and approved by at least **one other team member** whose module interfaces with the change.
5. **No Broken Windows:** Zero linting errors, clean type hints (Pydantic v2 / TypeScript), and zero unhandled exceptions exposed to the user.

---

## 📜 Pull Request Procedure

1. Fork or branch from `dev`.
2. Implement changes accompanied by unit tests.
3. Verify all checks pass locally.
4. Submit a Pull Request targeting `dev` using the [Pull Request Template](.github/pull_request_template.md).
5. Reference the governing MRS Requirement ID (e.g., `MRS-03`, `FR-05`).
