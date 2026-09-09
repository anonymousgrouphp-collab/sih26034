# Special Task Assignment — Parmarth Kumar (Temporary Test Frontend & Inspection HUD)

**Assigned Engineer:** **Parmarth Kumar** ([@parmarth-kumar](https://github.com/parmarth-kumar))  
**Workstream:** Parallel Testing & Demonstration Tooling  
**Feature Branch:** `feat/m2-parmarth-test-ui`  
**Base Integration Branch:** `dev`  
**Target Code Directory:** `integration/test_ui/`  
**Authority:** Explicit assignment by Project Team Lead (10 September 2026)

---

## 1. Context & Purpose

Member 1 through Member 5 have completed and merged their core subsystems into `dev`:
- **Member 1:** Optical Quality Gate, ArUco Metrology & PDP Area
- **Member 2:** DBNet++ & PP-OCRv4 Multilingual OCR
- **Member 3:** Statutory Semantic Extraction & Legal Metrology Unit Defense
- **Member 4:** Table-I AST Compliance Rule Engine & Epistemic Verdicts
- **Member 5:** FastAPI REST Services, Section 63 BSA 2023 Evidentiary Dossier & Form-1 PDF Generator

Member 6 (Urvashi Rajput) is actively building the full React 18 + Vite production frontend on `feat/m6-ui`. To prevent engineering and demonstration workflows from stalling while Member 6 finishes, **Parmarth Kumar** is tasked with developing a **lightweight, standalone temporary testing UI** (`integration/test_ui/`).

This tool will serve as an immediate test harness for field officers, developers, and jury evaluators to interact with the live pipeline directly.

---

## 2. Engineering Boundaries & Non-Interference Rules

1. **Folder Boundary:** The temporary UI must reside exclusively in `integration/test_ui/`. Never touch or modify `members/member-06-ui/`.
2. **Zero Build Requirement:** The test UI must be zero-build (pure HTML5, modern Tailwind CSS via CDN, and Vanilla JavaScript). No `npm install` or `vite build` required.
3. **Backend Coupling:** Must connect seamlessly to the existing FastAPI backend (`members/member-05-evidence/src/server.py`) at `http://localhost:8000`.
4. **License Compliance:** 100% permissive open source (MIT/Apache-2.0). Zero AGPL code.

---

## 3. Sprint Checklist & Deliverables

### Milestone 1: Authentication & Evidence Ingestion
- [ ] Implement one-click officer login switcher for seeded roles:
  - Inspector: `inspector_rajesh` / `Officer@2026`
  - Controller: `controller_south` / `Officer@2026`
  - Admin: `admin_central` / `Officer@2026`
  - Viewer: `viewer_analyst` / `Officer@2026`
- [ ] Implement packaging image upload with drag-and-drop and client-side raster preview.
- [ ] Implement quick-load buttons for all 6 Golden Demonstration SKUs:
  1. `SKU-DEMO-01`: Biscuit carton (font deficit & prohibited `gms` unit)
  2. `SKU-DEMO-02`: Curry pouch (USP mismatch)
  3. `SKU-DEMO-03`: Bottled water (fully compliant)
  4. `SKU-DEMO-04`: Soap box (borderline review $k=2$)
  5. `SKU-DEMO-05`: Chips pouch (glare bloom rejection)
  6. `SKU-DEMO-06`: E-commerce listing (missing country of origin)

### Milestone 2: Interactive Pipeline & Visual Overlay
- [ ] Implement interactive canvas displaying packaging image with color-coded bounding boxes:
  - Green: Compliant declarations
  - Red: Prohibited units (`gms`, `ML`, `gm`) / Font deficit
  - Amber: Review / Borderline
- [ ] Display live optical quality gate telemetry (Laplacian blur variance, Specular glare %, Skew angle).
- [ ] Display Table-I font compliance ledger with required mm vs measured mm.
- [ ] Display 4-state epistemic verdict badge (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`).

### Milestone 3: Human-in-the-Loop (HITL) Adjudication & Notice Download
- [ ] Implement officer review dialog with verdict confirmation and required remarks.
- [ ] One-click button to trigger court-ready Form-1 Legal Notice PDF generation.
- [ ] Direct download and embedded preview of the generated PDF with embedded QR code.
- [ ] Executive KPI summary cards and cryptographic Merkle audit chain verification button.

### Milestone 4: FastAPI Mount & Automated Verification
- [ ] Provide `test_ui_server.py` to launch the test UI on `http://localhost:8000/test-ui`.
- [ ] Write integration test `integration/tests/test_ui_endpoints.py` asserting `/test-ui` route and functionality.
- [ ] Ensure full repository test suite (`pytest members/ integration/ -v`) passes 100%.

---

## 4. Definition of Done

- All 4 milestones implemented and verified.
- Zero merge conflicts with `dev`.
- All repository tests passing.
- `progress.md` updated with formal signing note.
