# FINAL GITHUB & ENGINEERING WORKFLOW SPECIFICATION

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Governing Rule:** Simplicity • Determinism • Zero Drift  
**Status:** FROZEN  

---

### 1. Repository Structure

```
sih26034-nyayadrishti/
├── .github/workflows/          # CI/CD pipelines (lint, unit tests, schema validation, license audit)
├── docs/                       # Authoritative architectural and requirements specifications
├── data/
│   ├── synthetic/              # DS-SYNTH-001 procedural vector label generator & fixtures
│   ├── pilot_50_skus/          # Calibrated physical retail packages with vernier caliper ground truth
│   └── public_benchmarks/      # Filtered Indic scene text evaluation splits
├── models/
│   ├── onnx/                   # INT8 quantized CPU models (DBNet++, PP-OCRv4)
│   └── configs/                # Model configurations, anchors, character dictionaries
├── backend/                    # FastAPI Application Server & Pipeline Core (Member 5 & Team)
│   ├── app/
│   │   ├── api/                # REST endpoints (auth, inspections, dashboard, system)
│   │   ├── core/               # Inspection pipeline components:
│   │   │   ├── quality_gate/   # Blur and specular glare validation (Member 1)
│   │   │   ├── homography/     # ArUco / card planar rectification & scale S (Member 1)
│   │   │   ├── ocr_engine/     # Multilingual DBNet++ + PP-OCRv4 + Tesseract (Member 2)
│   │   │   ├── extractor/      # Regex parsing, spatial proximity graph, address NER (Member 3)
│   │   │   ├── rule_engine/    # Declarative AST evaluator & temporal epoch router (Member 4)
│   │   │   └── evidence/       # SHA-256 Merkle DAG & Section 63 BSA PDF dossier engine (Member 5)
│   │   ├── models/             # SQLAlchemy 2.0 database models
│   │   ├── schemas/            # Pydantic v2 validation and response schemas
│   │   ├── services/           # Storage manager, auth service, sync bundle service
│   │   └── main.py             # ASGI application entrypoint & lifespan
│   ├── alembic/                # Database migrations for PostgreSQL
│   ├── storage/                # Central filesystem storage mounts (/uploads/, /evidence/)
│   └── Dockerfile              # Backend container build definition
├── frontend/                   # React 18 + Vite Web Application SPA (Member 6)
│   ├── src/
│   │   ├── components/         # Viewfinder HUD, Multi-Panel Canvas, Review Interface
│   │   ├── pages/              # Dashboard, New Inspection, Inspection History, Settings
│   │   ├── services/           # REST API client, session storage cache, sync manager
│   │   └── App.tsx             # Root router and responsive app shell
│   ├── public/                 # Static web assets and icons
│   └── Dockerfile              # Frontend container build definition
├── nginx/                      # Nginx reverse proxy configuration & TLS settings
├── tests/                      # PyTest regression suites, web API tests, golden fixtures
├── docker-compose.yml          # Multi-container orchestration (Nginx + Backend + DB)
├── local_runner.py             # Standalone runner for Mode B optional local inspection
└── README.md                   # Setup instructions, architecture overview, live demo script
```

---

### 2. Work Assignment & Team Lead Authority

1. **Manual Assignment Only:** The **Team Lead manually assigns all work** to members.
2. **No Automated AI Task Assignment:** Antigravity and any automated systems must **not** automatically assign, redistribute, or take ownership of member tasks.
3. **Role of AI Orchestrator:** Antigravity operates strictly under instructions and explicit task boundaries assigned by the Team Lead.

---

### 3. Branching & Merging Strategy (Strict Trunk-Based)

- `main`: Production-ready, demo-safe code. Direct pushes are strictly **prohibited**.
- `dev`: Active integration branch. Automated CI must pass before merging into `dev`.
- Feature Branches: Named strictly as: `feat/m<member_id>-<subsystem>` (e.g., `feat/m1-cv-metrology`, `feat/m2-ocr`, `feat/m3-extraction`, `feat/m4-rule-engine`, `feat/m5-evidence`, `feat/m6-ui`).
- Hotfix Branches: `hotfix/<issue-name>`.

#### Mandatory Pre-Work Branch Sync Protocol
Before starting **any** new work on any branch, every member must execute:

```bash
git fetch origin
git checkout <their-branch>
git merge origin/main
```

#### Critical Git Guardrails
1. **Rebase Approval Required:** Rebase may be used **only when the Team Lead explicitly approves it**. Standard practice is merging `origin/main`.
2. **Never Overwrite Uncommitted Work:** Always verify working tree status before branch operations. Destructive commands (`git reset --hard`, `git checkout -f`, `git clean -fd`) that risk losing uncommitted changes are strictly forbidden.
3. **Never Force-Push:** Never force-push (`git push --force` or `--force-with-lease`) unless the **Team Lead explicitly approves it**. If a push is rejected by the remote, stop and report the issue immediately.
4. **Cross-Boundary Conflict Escalation:** If merge conflicts involve contracts (`contracts/`), system architecture (`03_FINAL_ARCHITECTURE.md`), legal rules (`02_FINAL_REQUIREMENTS_SPECIFICATION.md`, `16_DECISION_LOG.md`), or another member's code, **STOP immediately and inform the Team Lead**. Do NOT resolve cross-boundary conflicts unilaterally.

---

### 4. Pull Request (PR) Policy & Code Review Rules

1. Every PR must reference a specific requirements ID (e.g., `FR-03: Implement ArUco Planar Homography` or `FR-21: Web Portal & RBAC`).
2. Every PR must pass all automated CI unit tests and lint checks before submission.
3. Every PR must be reviewed and approved by at least **one other team member** whose interface is affected.
4. **No AGPL-3.0 Dependencies:** Any PR introducing an AGPL-licensed package (e.g., `ultralytics`) will be rejected automatically by CI license scanning.
5. PR merges into `dev` require passing CI and must be approved by the Team Lead. Rebase during merge is permitted only with Team Lead approval.

---

### 5. Definition of Done (DoD)

A feature is considered **DONE** if and only if:

1. It strictly conforms to the JSON schemas defined in `07_API_AND_INTERFACE_CONTRACTS.md`.
2. It has passing unit/integration tests with $> 85\%$ code coverage for mathematical and rule logic.
3. It executes within the performance budgets specified in `03_FINAL_ARCHITECTURE.md` (server web round-trip $\le 1800\text{ ms}$, local CPU engine $\le 1200\text{ ms}$).
4. It handles network latency, validation errors, and pipeline rejections gracefully without unhandled crashes.
5. It is documented with clear OpenAPI schemas and integration test assertions.
