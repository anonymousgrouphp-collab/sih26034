# NyayaDrishti-LM (SIH26034) — Member 6 UI to Backend Integration Handoff Specification

**Document Version:** 1.0.0-PROD-READY  
**Author:** Member 6 (Frontend & HUD Engineer)  
**Target Audience:** Member 5 (Evidence & Backend Lead), Integration Team, Team Lead  
**Governing Standard:** Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) read with Legal Metrology Act, 2009 & LMPC Rules, 2011  

---

## 1. Executive Summary & Architecture Overview

The Member 6 Inspection Workstation (`members/member-06-ui/`) provides the inspector-facing operational cockpit for the Department of Consumer Affairs (DoCA). It implements a strict 8-stage Human-in-the-Loop (HITL) compliance workflow:

$$\text{01 Registration} \to \text{02 Evidence Capture} \to \text{03 Analysis HUD} \to \text{04 Rule Findings} \to \text{05 Adjudication} \to \text{06 Merkle Audit} \to \text{07 Outcome Review} \to \text{08 Report / Notice}$$

### Tri-Mode Operation
The UI supports three decoupled runtime modes via `IInspectionApiService`:
1. `LIVE`: Pure HTTP client targeting FastAPI backend at `/api/v1/` with resilient client-side caching.
2. `MOCK`: In-memory interactive sandbox for testing officer workflows without external infrastructure.
3. `DEMO_FIXTURE`: Read-only demonstration mode featuring the 6 Golden Demonstration SKUs (`SKU-DEMO-01` through `SKU-DEMO-06`).

---

## 2. Priority 0 (P0) Backend Integration Requirements (Critical Path)

### P0-1: Inspection Case Session Persistence (`extracted_fields` & `rule_evaluations`)
* **Observed Issue on `dev`:** Calling `POST /api/v1/pipeline/execute` computes optical metrics, OCR tokens, extracted fields, and rule evaluations. However, subsequent `GET /api/v1/inspections/{id}` requests return empty arrays for `extracted_fields: []` and `rule_evaluations: []`.
* **Frontend Workaround in Place:** `LiveApiService` incorporates an in-memory `pipelineArtifactCache` keyed by `inspection_id` that caches returned pipeline artifacts and stitches them back onto subsequent `getInspection(id)` responses during the active session.
* **Backend Remediation Needed:**
  - Persist `extracted_fields` into the `extracted_facts` / `inspection_entities` table in PostgreSQL.
  - Persist `rule_evaluations` into the `rule_evaluations` / `compliance_findings` table.
  - Eagerly or join-load these child records when serving `GET /api/v1/inspections/{id}`.

### P0-2: Real M1–M4 Pipeline Invocation in `POST /api/v1/pipeline/execute`
* **Observed Issue on `dev`:** The integration pipeline routes currently invoke simulated/stubbed stages.
* **Backend Remediation Needed:**
  - Connect M1 quality gate (`Laplacian blur`, `specular glare threshold 3.0%`, ArUco scale factor).
  - Connect M2 OCR detector (`DBNet++`) and multilingual recognizers (`PP-OCRv4 Latin`, `PP-OCRv3 Devanagari`).
  - Connect M3 semantic extractor (`MRP`, `Net Quantity`, `Country of Origin`, `Dates`, `Addresses`).
  - Connect M4 AST rule compliance engine (Table-I font schedule, USP math, prohibited units).

---

## 3. Priority 1 (P1) Missing Routes & RBAC Gating

### P1-1: Missing Route `POST /api/v1/inspections/{id}/close`
* **Contract Specification:**
  - **Endpoint:** `POST /api/v1/inspections/{id}/close`
  - **Payload:**
    ```json
    {
      "officer_id": "INSP-DL-0842",
      "closure_reason": "ALL_FINDINGS_ADJUDICATED_AND_FILED",
      "remarks": "Official inspection closed. Administrative record sealed."
    }
    ```
  - **Response:** Updated `InspectionCase` object with `workflow_status: "COMPLETED"`.
  - **Frontend Fallback:** If the route returns HTTP 404/405, `LiveApiService` marks local workflow state as `COMPLETED` and appends an audit event.

### P1-2: Missing Route `GET /api/v1/inspections/{id}/audit-trail`
* **Contract Specification:**
  - **Endpoint:** `GET /api/v1/inspections/{id}/audit-trail`
  - **Response:** Array of `AuditEvent`:
    ```json
    [
      {
        "event_id": "evt_01",
        "timestamp_utc": "2026-09-10T09:15:00Z",
        "actor": "INSP-DL-0842",
        "action": "EVIDENCE_INGESTED",
        "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
        "current_hash": "a3f5e1b2c4d6879012345678abcdef0123456789abcdef0123456789abcdef01",
        "payload_summary": "Raw PDP JPEG capture uploaded (1920x1080)"
      }
    ]
    ```
  - **Frontend Fallback:** When absent, frontend reads `case.audit_trail` directly from the inspection record.

### P1-3: Role-Based Access Control (RBAC) & Legal Notice Gating
* **Statutory Requirement:** Under Section 36(1) of the Legal Metrology Act, 2009, an inspecting field officer (**LMO / Inspector**) investigates and recommends legal action. The statutory authority to issue a formal **Form-1 Show Cause Notice** rests exclusively with the **Controller / Assistant Controller of Legal Metrology**.
* **Frontend Implementation:**
  - Global Header features role switcher: `INSPECTOR` vs `CONTROLLER`.
  - When logged in as `INSPECTOR`: The Form-1 Legal Notice button is disabled and replaced with `"Escalated to Controller for Notice Issuance"`.
  - When logged in as `CONTROLLER`: The action enables `"Prepare Form-1 Legal Notice (Controller Authorization) ->"`.
* **Backend Requirement:**
  - Add JWT-based RBAC authentication middleware.
  - Enforce role check on `POST /api/v1/notices/generate`: return HTTP 403 Forbidden if requester role is `INSPECTOR`.

---

## 4. Priority 2 (P2) Artifact Streaming & Offline Sync

### P2-1: ReportLab Form-1 PDF/A Binary Download
* **Endpoint:** `GET /api/v1/notices/{id}/pdf`
* **Specification:**
  - Return `application/pdf` with `Content-Disposition: inline; filename="Notice_Form1_{id}.pdf"`.
  - Stamped with Section 63 BSA 2023 Digital Certificate QR code and Merkle root hash.

### P2-2: WebSocket / Server-Sent Events (SSE) for Real-Time Pipeline HUD
* **Endpoint:** `GET /api/v1/pipeline/stream/{task_id}`
* **Specification:** Stream pipeline progress stages (`OPTICAL_QUALITY_GATE` $\to$ `ARUCO_CALIBRATION` $\to$ `MULTILINGUAL_OCR` $\to$ `SEMANTIC_EXTRACTION` $\to$ `RULE_EVALUATION`).

---

## 5. Summary of Frontend Alignment Status

| Contract Domain | Frontend Implementation | Dev Backend Status | Alignment Verification |
| :--- | :--- | :--- | :--- |
| **Golden SKUs (01–06)** | 100% Implemented & Tested | Pre-computed fixtures available | Verified via `tests/golden_skus.test.ts` (PASS) |
| **API Decoupling** | LiveApi, MockApi, DemoFixtures | Standalone FastAPI `/api/v1/` | Verified via `tests/api_adapter.test.ts` (PASS) |
| **Dynamic Coordinates** | Dynamic SVG viewBox detection | Normalized coordinates $[ymin, xmin, ymax, xmax]$ | Verified via `tests/rbac_and_evidence.test.ts` (PASS) |
| **Evidence Immutability** | Untouched SHA-256 preservation | Merkle DAG payload hashing | Verified via `tests/rbac_and_evidence.test.ts` (PASS) |
| **Devanagari Attribution**| Stamped as `PP-OCRv3 Devanagari` | PP-OCRv3 Devanagari inference | Verified via `tests/rbac_and_evidence.test.ts` (PASS) |
| **Section 63 BSA Citations**| Section 63 BSA 2023 strictly cited | Section 63 BSA 2023 generator | Verified across all screens (0 violations) |
| **Zero Client Legal Rules**| All rules rendered from backend | AST Rule Engine (Member 4) | Verified across all components |
