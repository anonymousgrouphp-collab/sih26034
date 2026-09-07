# Member 5 Tasks — Backend, Platform & Evidentiary Dossier
**Assigned Engineer:** **Shailendra Pratap Singh** ([@shailendrapratap1](https://github.com/shailendrapratap1))  
**Branch:** `feat/m5-evidence`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Schemas & Merkle DAG Skeleton
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define pipeline output test fixtures for complete inspection sessions.
- [ ] Implement SHA-256 Merkle DAG tree builder and proof verifier.
- [ ] Implement tamper detection verification test (`TS-EVID-01`, `TS-EVID-02`).

### Day 2: Section 63 BSA 2023 & ReportLab PDF Generator
- [ ] Implement Section 63 Bharatiya Sakshya Adhiniyam, 2023 certificate generator.
- [ ] Implement ReportLab PDF/A Form-1 Legal Notice generator embedding photographic crops and QR code.
- [ ] Benchmark PDF generation latency: target $< 1.5\text{ seconds}$.

### Day 3: FastAPI Web Services & Storage Manager
- [ ] Build FastAPI server with async lifespan and CORS/security headers.
- [ ] Implement decoupled storage manager (`/storage/uploads/`, `/storage/evidence/`).
- [ ] Implement file upload hardening: MIME type checking (libmagic) and 15 MB upload cap (`TS-WEB-01`).
- [ ] Implement JWT authentication and RBAC middleware (`ADMIN`, `CONTROLLER`, `INSPECTOR`, `VIEWER`) (`TS-WEB-02`).

### Day 4: Relational Datastore & Mode B Sync Bridge
- [ ] Implement SQLAlchemy 2.0 models matching `08_DATABASE_SPECIFICATION.md`.
- [ ] Implement `POST /api/v1/inspections/sync-bundle` idempotent ingestion endpoint (`TS-SYS-04`).
- [ ] Benchmark metadata query response: P95 $< 100\text{ ms}$ (`TS-WEB-03`).
- [ ] Complete Definition of Done checklist.
- [ ] Update `progress.md` and `memory.md`.
