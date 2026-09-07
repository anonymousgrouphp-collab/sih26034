# 01_MASTER_PROJECT_BLUEPRINT.md

# SIH26034 - Legal Metrology Automated Compliance System

## The Master Single Source of Truth (SSOT) & Architectural Blueprint

---

### 1. Executive Summary & Project Identity

```
========================================================================================
PROJECT IDENTIFIER : SIH26034
PROJECT TITLE      : Software System to check compliance of Packaged Commodities under
                     Legal Metrology (Packaged Commodities) Rules, 2011 by scanning
                     products, images and labels.
MINISTRY           : Ministry of Consumer Affairs, Food & Public Distribution
DEPARTMENT         : Department of Consumer Affairs (DoCA)
COMPETITION        : Smart India Hackathon 2026
ENGINEERING TEAM   : 6-Member Multidisciplinary Student Engineering Team
CURRENT STAGE      : FINAL ARCHITECTURE FREEZE COMPLETED -> READY FOR DEVELOPMENT
TARGET DEADLINE    : 13 September 2026 (6 Days Execution Window)
========================================================================================
```

This document serves as the **Master Single Source of Truth (SSOT)** for project SIH26034. It unifies all domain research, legal statutory standards, optical mathematics, machine learning pipelines, user experience designs, security architectures, and execution workstreams into an authoritative, binding engineering blueprint.

---

### 2. Complete Repository Blueprint & Documentation Map

The repository contains 21 authoritative engineering and governance specifications:

```
+----------------------------------------------------------------------------------------------------+
| FILE NAME                            | DESCRIPTION & PRIMARY SCOPE                                 |
+----------------------------------------------------------------------------------------------------+
| 01_MASTER_PROJECT_BLUEPRINT.md       | Master SSOT synthesizing all research, architecture, & plan.|
| 02_FINAL_REQUIREMENTS_SPECIFICATION.md| Master Requirements Spec (FR-01 to FR-20, NFR-01 to NFR-10).|
| 03_FINAL_ARCHITECTURE.md             | Modular monolith architecture & 12-stage pipeline data flow.|
| 04_FINAL_MVP_SCOPE.md                | MoSCoW prioritization, P0 freeze, & explicit cut list.      |
| 05_TECHNOLOGY_DECISION_RECORD.md     | Formal ADRs (ADR-01 to ADR-12) covering stack choices.      |
| 06_DATA_AND_MODEL_STRATEGY.md        | DS-SYNTH-001, DS-PILOT-050, ONNX INT8, & model licensing.   |
| 07_API_AND_INTERFACE_CONTRACTS.md    | RESTful OpenAPI 3.1 endpoints, Pydantic v2 pipeline DTOs.   |
| 08_DATABASE_SPECIFICATION.md         | Relational DDL, SQLite/PostgreSQL schemas, & index strategy.|
| 09_UI_UX_BLUEPRINT.md                | Design tokens, mobile HUD, adjudication canvas, & notices.  |
| 10_SECURITY_AND_AUDIT_SPECIFICATION.md| RBAC matrix, Section 63 BSA 2023, & Merkle audit ledger.   |
| 11_TESTING_AND_VALIDATION_PLAN.md    | 4-tier test pyramid, 20 formal test suites, & acceptance QA.|
| 12_DEMO_PLAN.md                      | 3-tier presentation fallback architecture & pitch script.   |
| 13_SIX_MEMBER_EXECUTION_PLAN.md      | Granular workstreams, APIs, & day-by-day tasks for 6 devs.  |
| 14_GITHUB_WORKFLOW.md                | Trunk-based branching, PR policy, CI checks, & DoD.         |
| 15_RISK_AND_CONTINGENCY_REGISTER.md  | 10 red-team failure modes, tripwires, & mitigation plans.   |
| 16_DECISION_LOG.md                   | Architectural Decision Log (ADL-01 to ADL-19) & rationales. |
| 17_OPEN_QUESTIONS.md                 | Strictly bounded open questions with frozen working defaults|
| SYSTEM_MODES_AND_CONNECTIVITY.md     | 3 System Operating Modes (Online Web Primary, Optional Local, Future).|
| CONNECTIVITY_REQUIREMENTS.md         | 4-tier component dependency matrix & network isolation spec.|
| FINAL_AUTHENTICITY_AND_ACCURACY_AUDIT.md| Master pre-development validation & compliance audit.    |
| CLAIMS_WE_MUST_NOT_MAKE.md           | Blacklist of unsupported, legally hazardous claims.         |
+----------------------------------------------------------------------------------------------------+
```

---

### 3. Master Synthesis of All Three Research Phases

#### 3.1 Phase 1: Legal & Domain Metrology Foundation

- **Statutory Authority:** Enforcement is rooted in the _Legal Metrology Act, 2009_ and the _Legal Metrology (Packaged Commodities) Rules, 2011_.
- **Critical Gazette Corrections:**
  - _Table-I Font Height:_ G.S.R. 629(E) dated 23.06.2017 establishes that for packaging areas $> 2500\text{ cm}^2$, the minimum numeral height is **6.0 mm** (correcting historical typos citing 8.0 mm).
  - _Unit Sale Price (USP):_ G.S.R. 779(E) dated 02.11.2021 mandates explicit USP declarations (per gram / per milliliter for $<1\text{kg}/1\text{L}$, and per kg / per L for $>1\text{kg}/1\text{L}$) rounded to 2 decimal places.
  - _E-Commerce Mandates:_ Rule 6(10) mandates digital declaration of all Rule 6 attributes on e-commerce platforms. G.S.R. 128(E) dated 13.02.2026 inserts Rule 6(10A) mandating structured, searchable Country of Origin filters effective 1 July 2026.
  - _Electronic Evidence Repeal & Replacement:_ The Indian Evidence Act, 1872 (Section 65B) was repealed on 1 July 2024. All digital evidence admissibility is governed exclusively by **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.

#### 3.2 Phase 2: Computer Vision, Optical Mathematics & Model Strategy

- **Physical Scale Solvability:** Uncalibrated monocular depth estimation suffers from scale ambiguity and cannot measure physical millimeters. The system enforces **Planar Homography with OpenCV ArUco 4x4 fiducial markers** (with fallback to ₹5 standard coins), achieving $\le 0.30\text{ mm}$ error margin.
- **Licensing Safety:** Ultralytics YOLOv8 and YOLOv11 are strictly excluded due to GNU AGPL-3.0 viral copyleft terms. The system is built 100% on permissive **Apache-2.0 / MIT** models:
  - Text Detection: DBNet++ (Real-time polygon detector)
  - Text Recognition: PaddleOCR PP-OCRv4
  - Panel Segmentation: RT-DETR / OpenCV classical contours
- **Model Serving & CPU Optimization:** Colocated server-side CPU inference using ONNX Runtime INT8 quantization (with optional identical local execution for field resiliency) enables sub-second ($<1200\text{ ms}$) processing on standard multi-core CPUs without mandatory GPU hardware.

#### 3.3 Phase 3: System Engineering, Human Adjudication & Evidence Architecture

- **Advisory Diagnostic AI:** Under Indian constitutional jurisprudence, AI cannot act as an autonomous magistrate or automatically penalize citizens. The system serves as an **Augmented Diagnostic Assistant**; all adverse findings pass through a mandatory **Human-in-the-Loop (HITL) Inspector Adjudication Canvas**.
- **Cryptographic Chain of Custody:** Images are hashed with SHA-256 upon ingestion and recorded in an append-only Merkle ledger. All statutory notices under Section 36(1) are exported as archival PDF/A documents accompanied by Section 63 BSA 2023 Electronic Evidence Certificates.

---

### 4. Frozen Core Facts, Verified Boundaries & Technical Constants

```
+----------------------------------------------------------------------------------------------------+
| PARAMETER / CONSTANT                 | FROZEN VALUE                                | SOURCE / AUTHORITY              |
+----------------------------------------------------------------------------------------------------+
| System Connectivity Model            | Online-First Web Application (with Local Resiliency)| ADL-13 / SYSTEM_MODES           |
| Core Inspection Offline Capability   | Optional Standalone Mode B (0 bytes net)            | Mode B Specification            |
| Maximum Acceptable Inference Latency | <= 1200 ms (CPU processing budget)                  | System NFR-01 (Multi-core CPU)  |
| Minimum Image Resolution             | 1920 x 1080 (1080p)                                 | Optical Quality Standard        |
| Minimum Laplacian Blur Variance      | 150.0                                               | Quality Gate Specification      |
| Maximum Permissible Specular Glare   | 3.0% of label area                                  | Quality Gate Specification      |
| Maximum Permissible Camera Tilt      | 15.0 degrees                                        | Homography Warp Bound           |
| Primary Fiducial Standard            | ArUco 4x4_50 (50.0 mm)                              | ADL-05 / ADR-06                 |
| Secondary Fiducial Standard          | Indian ₹5 Coin (23.0 mm)                            | ADL-05 / ADR-06                 |
| Font Measurement Tolerance           | <= 0.15 mm (Synthetic) /                            | ADL-17 / Benchmarked Standard   |
|                                      | <= 0.30 mm (Retail Pilot)                           |                                 |
| Table-I Area > 2500 cm² Font Bound   | 6.0 mm (NOT 8.0 mm)                                 | Gazette G.S.R. 629(E) 23.06.2017|
| Electronic Evidence Statute          | Section 63 BSA 2023                                 | Bharatiya Sakshya Adhiniyam     |
| Clock / Timestamp Source             | Server UTC (NTP) / Device Monotonic Fallback        | ADL-14 / CONNECTIVITY_REQ       |
| Geolocation Coordinates              | Browser Geolocation / Circle Fallback               | ADL-15 / CONNECTIVITY_REQ       |
| E-Commerce Origin Filter Mandate     | Rule 6(10A)                                         | Gazette G.S.R. 128(E) 13.02.2026|
| Legal Notice Statutory Format        | Form-1 / Form-2                                     | Section 36(1) LM Act 2009       |
| Primary Database Engine (Online)     | PostgreSQL 16+ (Server Relational Datastore)         | ADL-04 / ADR-04                 |
| Secondary Database Engine (Local)    | SQLite 3.45+ (SQLCipher, Local Edge Fallback)       | ADL-04 / ADR-04                 |
| Primary Backend Framework            | FastAPI 0.110+ (Py 3.11+)                           | ADR-01                          |
| Primary Frontend Framework           | React 18+ (Vite + Tailwind SPA in Browser)          | ADR-02 / ADR-18                 |
| Open-Source License Ceiling          | Apache-2.0 / MIT / BSD                              | ADL-03 / ADR-03                 |
+----------------------------------------------------------------------------------------------------+
```

---

### 5. Day-by-Day Master Execution Schedule (07 - 13 September 2026)

```
========================================================================================
TIMELINE OVERVIEW:
- Day 1 (07 Sep): Project Setup, Repository Skeleton, DB Schemas, DTO Contracts.
- Day 2 (08 Sep): Synthetic Data Generation (DS-SYNTH-001) & Optical Pre-Processing.
- Day 3 (09 Sep): OCR Integration (DBNet++ / PP-OCRv4) & Connected Component Font Engine.
- Day 4 (10 Sep): Deterministic Rule Engine, HITL Adjudication UI & P0 Integration Freeze.
- Day 5 (11 Sep): Section 63 BSA Notice PDF Generator, E-Commerce Auditor & P1 Polish.
- Day 6 (12 Sep): End-to-End Stress Testing, Caliper Benchmarking & Demo Rehearsals.
- Day 7 (13 Sep): FINAL SUBMISSION & LIVE SMART INDIA HACKATHON EVALUATION.
========================================================================================
```

#### Detailed Daily Milestones

```
+---------------------------------------------------------------------------------------+
| DAY & DATE      | WORKSTREAM MILESTONES & DELIVERABLES                                |
+---------------------------------------------------------------------------------------+
| Day 1 (07 Sep)  | M1: Setup GitHub repo, trunk rules, pre-commit hooks, CI.           |
| (Foundations)   | M2: Implement DB models (SQLite/Postgres), Alembic migrations.      |
|                 | M3: Define Pydantic v2 DTOs, FastAPI skeleton routes.               |
|                 | M4: Initialize React 18 + Vite + Tailwind scaffolding.             |
|                 | M5: Build synthetic label script & procure 50 FMCG pilot packages.  |
|                 | M6: Setup automated test harness (pytest, Vitest, fixtures).        |
+---------------------------------------------------------------------------------------+
| Day 2 (08 Sep)  | M1: Build OpenCV ArUco detector & homography warp pipeline.         |
| (Pre-Processing)| M2: Implement Laplacian blur & specular glare quality gate.         |
|                 | M3: Implement JWT authentication, RBAC middleware, Merkle ledger.  |
|                 | M4: Build mobile camera HUD component with ArUco alignment box.     |
|                 | M5: Generate 2,000 synthetic labels with ground truth annotations.  |
|                 | M6: Author unit tests for quality gate and fiducial calibration.    |
+---------------------------------------------------------------------------------------+
| Day 3 (09 Sep)  | M1: Integrate DBNet++ ONNX INT8 text detection pipeline.            |
| (Vision & Font) | M2: Integrate PaddleOCR PP-OCRv4 text recognition pipeline.         |
|                 | M3: Build physical font x-height connected component measurement.   |
|                 | M4: Implement interactive Adjudication Canvas (Pan/Zoom/Boxes).     |
|                 | M5: Benchmark OCR on DS-PILOT-050; tune character confidence.       |
|                 | M6: Author integration tests for OCR and font measurement.          |
+---------------------------------------------------------------------------------------+
| Day 4 (10 Sep)  | M1: Build deterministic Legal Rule Engine (Rule 6, Table-I, USP).   |
| (P0 FREEZE)     | M2: Connect FastAPI pipeline end-to-end (Stage 1 to Stage 10).      |
|                 | M3: Wire frontend Canvas to live backend inspection API.            |
|                 | M4: Build Inspector override & justification remarks modal.         |
|                 | M5: Execute caliper benchmark: verify font MAE <= 0.30 mm.          |
|                 | M6: P0 FEATURE COMPLETE & CODE FREEZE. Execute full regression.     |
+---------------------------------------------------------------------------------------+
| Day 5 (11 Sep)  | M1: Implement ReportLab Form-1/2 Legal Notice PDF/A generator.      |
| (Notices & ECom)| M2: Implement Section 63 BSA 2023 Digital Certificate generator.    |
|                 | M3: Build E-Commerce single listing URL / DOM / gallery auditor.    |
|                 | M4: Build Notice preview & download modal in frontend.              |
|                 | M5: Build Executive Dashboard KPI widgets & batch CSV queue (P1).   |
|                 | M6: End-to-end integration test of notice generation and BSA certs. |
+---------------------------------------------------------------------------------------+
| Day 6 (12 Sep)  | ALL MEMBERS:                                                        |
| (Stress & Demo) | 1. Execute full 20-suite test pyramid across all 50 pilot packages. |
|                 | 2. Record 1080p Virtual Video Stream backup (Demo Tier 2).          |
|                 | 3. Generate static evidence pack (Demo Tier 3).                     |
|                 | 4. Conduct 5 dry-run presentations adhering to 3-minute pitch script|
|                 | 5. Verify zero lingering lints, warnings, or debug print statements.|
+---------------------------------------------------------------------------------------+
| Day 7 (13 Sep)  | SUBMISSION & LIVE EVALUATION GATE:                                  |
| (Evaluation)    | Deploy to online production web host, verify live browser demo &    |
|                 | backup local instance, win Hackathon.                               |
+---------------------------------------------------------------------------------------+
```

---

### 6. Final Development Readiness Gate & Pre-Flight Checklist

Before launching implementation, the engineering team must satisfy the following **Pre-Flight Gates**:

```
[x] 1. Legal Alignment: Table-I font boundary confirmed at 6.0 mm for >2500 cm² (G.S.R. 629(E)).
[x] 2. Evidentiary Law: Section 63 BSA 2023 replaces repealed Section 65B Indian Evidence Act.
[x] 3. E-Commerce Scope: Mass scraping rejected; single URL / DOM / image inspection frozen.
[x] 4. Licensing Safety: AGPL-3.0 banned; DBNet++, PP-OCRv4, RT-DETR selected under Apache-2.0.
[x] 5. Hardware Decoupling: ONNX INT8 CPU inference eliminates GPU server dependency.
[x] 6. Optical Grounding: ArUco / coin fiducial homography eliminates scale ambiguity.
[x] 7. Constitutional Process: Advisory diagnostic assistant with mandatory HITL adjudication.
[x] 8. Tamper-Evidence: SHA-256 chained Merkle audit ledger specified.
[x] 9. Execution Plan: 6-member workstreams with explicit API interfaces and tasks assigned.
[x] 10. Contingency: 3-tier demo fallback and 10 red-team risk mitigations documented.

STATUS: 10 / 10 GATES PASSED -> ARCHITECTURE FROZEN -> PROCEED TO DEVELOPMENT.
```
