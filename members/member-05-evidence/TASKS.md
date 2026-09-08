# Member 5 Tasks — Backend, Platform & Evidentiary Dossier
**Assigned Engineer:** **Shailendra Pratap Singh** ([@shailendrapratap1](https://github.com/shailendrapratap1))  
**Branch:** `feat/m5-evidence`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Schemas & Merkle DAG Skeleton
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define pipeline output test fixtures for complete inspection sessions.
- [x] Implement SHA-256 Merkle DAG tree builder and proof verifier.
- [x] Implement tamper detection verification test (`TS-EVID-01`, `TS-EVID-02`).

### Day 2: Section 63 BSA 2023 & ReportLab PDF Generator
- [x] Implement Section 63 Bharatiya Sakshya Adhiniyam, 2023 certificate generator.
- [x] Implement ReportLab PDF/A Form-1 Legal Notice generator embedding photographic crops and QR code.
- [x] Benchmark PDF generation latency: target $< 1.5\text{ seconds}$ (Achieved ~0.15s).

### Day 3: FastAPI Web Services & Storage Manager
- [x] Build FastAPI server with async lifespan and CORS/security headers.
- [x] Implement decoupled storage manager (`/storage/uploads/`, `/storage/evidence/`).
- [x] Implement file upload hardening: MIME type checking and 15 MB upload cap (`TS-WEB-01`).
- [x] Implement JWT authentication and RBAC middleware (`ADMIN`, `CONTROLLER`, `INSPECTOR`, `VIEWER`) (`TS-WEB-02`).

### Day 4: Relational Datastore & Mode B Sync Bridge
- [x] Implement SQLAlchemy 2.0 models matching `08_DATABASE_SPECIFICATION.md`.
- [x] Implement `POST /api/v1/inspections/sync-bundle` idempotent ingestion endpoint (`TS-SYS-04`).
- [x] Benchmark metadata query response: P95 $< 100\text{ ms}$ (`TS-WEB-03`).
- [x] Complete Definition of Done checklist.
- [x] Update `progress.md` and `memory.md`.

