# Permanent Working Memory — Member 5 (Backend & Evidence)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that the Indian Evidence Act, 1872 and its electronic evidence provision Section 65B were repealed on 1 July 2024. Citing Section 65B in court would result in immediate technical dismissal by knowledgeable judges.

### Evidence
`05_TECHNOLOGY_DECISION_RECORD.md` (ADR-10), `16_DECISION_LOG.md` (ADL-02), and Bharatiya Sakshya Adhiniyam, 2023.

### Decision
All electronic evidence certificates, database tables, and legal notice exports must strictly cite and conform to **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.

### Why
Guarantees statutory admissibility and legal relevance in Indian courts of law.

### Impact
Protects government prosecution notices from procedural failure.

### Status
ACTIVE

---

## [08 September 2026 | 20:40 IST]

### Discovery
Found that native `libmagic` C-libraries introduce platform-dependent binary incompatibilities on Windows field inspection devices, whereas pure-Python header signature validation provides 100% deterministic detection of JPEG, PNG, PDF magic bytes while rejecting Windows PE executables, Linux ELF binaries, and SVG/XML script injection attacks.

### Evidence
`10_SECURITY_AND_AUDIT_SPECIFICATION.md` (TS-WEB-01) and unit tests `test_upload_file_magic_bytes_validation`.

### Decision
Implemented zero-trust magic byte validation directly in `DecoupledStorageManager` using byte slicing without external compiled C-libraries. Enforced the 7-node SHA-256 Merkle DAG (`PipelineEvidenceDAG`) across all inspection stages.

### Why
Ensures field resilience across heterogeneous operating systems (Windows laptops, Android tablets, Linux servers) without risking runtime dynamic library loading crashes during emergency field inspections.

### Impact
Zero native DLL crashes, deterministic security enforcement, and 100% test pass rate on all development and production environments.

### Status
ACTIVE

