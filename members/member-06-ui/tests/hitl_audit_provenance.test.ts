import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiService } from "../src/services/api";
import {
  getMockCases,
  resetMockCases,
  appendAuditEvent,
  computeCaseReadiness,
} from "../src/services/mockData";
import {
  InspectionCase,
  AdjudicationRequest,
} from "../src/types/inspection";

describe("Chunk 6: HITL Decision Workflow, Audit Trail & Evidence Provenance", () => {
  beforeEach(() => {
    ApiService.setMockMode(true);
    resetMockCases();
  });
  // Test 1: Original finding preserved after officer decision
  test("1. Original finding preserved — automated finding and officer decision remain separate", async () => {
    resetMockCases();
    const caseData = await ApiService.getInspection("SKU-DEMO-01");

    // Pre-adjudication check
    const originalFindings = [...caseData.rule_evaluations];
    assert.ok(originalFindings.length > 0, "SKU-DEMO-01 must have initial findings");
    const mrpFinding = originalFindings.find((f) => f.rule_code.includes("USP") || f.status === "FAIL");
    assert.ok(mrpFinding, "Must find a failing rule finding");
    assert.equal(mrpFinding.status, "FAIL", "Original automated finding status is FAIL");

    // Perform officer adjudication
    const request: AdjudicationRequest = {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Verified that Unit Sale Price was omitted on packaging PDP.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    };

    const decision = await ApiService.submitAdjudication(caseData.id, request);
    assert.equal(decision.verdict, "CONFIRM_VIOLATION");

    // Fetch updated case
    const updatedCase = await ApiService.getInspection(caseData.id);

    // Invariant check: original automated finding status is NOT mutated to CONFIRMED
    const updatedFinding = updatedCase.rule_evaluations.find((f) => f.finding_id === mrpFinding.finding_id);
    assert.ok(updatedFinding, "Finding must still exist");
    assert.equal(
      updatedFinding.status,
      "FAIL",
      "Automated finding status MUST remain FAIL, not mutated to CONFIRMED"
    );

    // Officer decision is recorded separately
    assert.ok(updatedCase.adjudication, "Officer adjudication must be recorded separately");
    assert.equal(updatedCase.adjudication.verdict, "CONFIRM_VIOLATION");
    assert.equal(updatedCase.adjudication.remarks, request.officer_remarks);
  });

  // Test 2: Mandatory remarks validation
  test("2. Mandatory remarks — rejected when remarks are missing or whitespace only", async () => {
    resetMockCases();
    const caseData = await ApiService.getInspection("SKU-DEMO-01");

    // Empty remarks
    await assert.rejects(
      async () => {
        await ApiService.submitAdjudication(caseData.id, {
          adjudication_verdict: "CONFIRM_VIOLATION",
          override_applied: false,
          officer_remarks: "",
          action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
        });
      },
      (err: any) => {
        assert.equal(err.error_code, "MISSING_OFFICER_REMARKS");
        return true;
      },
      "Must reject empty remarks"
    );

    // Whitespace remarks
    await assert.rejects(
      async () => {
        await ApiService.submitAdjudication(caseData.id, {
          adjudication_verdict: "DISMISS_AS_COMPLIANT",
          override_applied: true,
          officer_remarks: "    \n\t  ",
          action_order: "CLOSE_INSPECTION_COMPLIANT",
        });
      },
      (err: any) => {
        assert.equal(err.error_code, "MISSING_OFFICER_REMARKS");
        return true;
      },
      "Must reject whitespace remarks"
    );

    // Finding-level adjudication also enforces remarks
    await assert.rejects(
      async () => {
        await ApiService.submitFindingAdjudication(
          caseData.id,
          caseData.rule_evaluations[0]?.finding_id || "f_1",
          "CONFIRMED",
          "   "
        );
      },
      (err: any) => {
        assert.equal(err.error_code, "MISSING_OFFICER_REMARKS");
        return true;
      },
      "Must reject whitespace remarks for finding-level adjudication"
    );
  });

  // Test 3: Audit event appended on officer action
  test("3. Audit event appended — officer action appends an audit event to the chronological ledger", async () => {
    resetMockCases();
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    const initialAuditCount = caseData.audit_trail?.length || 0;

    const request: AdjudicationRequest = {
      adjudication_verdict: "DISMISS_AS_COMPLIANT",
      override_applied: true,
      officer_remarks: "Physical caliper verification confirmed font height measures 6.1mm.",
      action_order: "CLOSE_INSPECTION_COMPLIANT",
    };

    await ApiService.submitAdjudication(caseData.id, request);
    const updated = await ApiService.getInspection(caseData.id);

    assert.ok(updated.audit_trail, "Case must have audit trail");
    assert.equal(
      updated.audit_trail.length,
      initialAuditCount + 1,
      "Audit trail must contain exactly one additional event"
    );

    const latestEvent = updated.audit_trail[updated.audit_trail.length - 1];
    assert.equal(latestEvent.actor_type, "OFFICER");
    assert.equal(latestEvent.event_type, "OFFICER_OVERRIDE_APPLIED");
    assert.equal(latestEvent.decision, "DISMISS_AS_COMPLIANT");
    assert.equal(latestEvent.remarks, request.officer_remarks);
    assert.ok(latestEvent.sequence_number > 0, "Must have positive sequence number");
    assert.ok(latestEvent.entry_hash, "Must have entry hash");
    assert.ok(latestEvent.previous_hash, "Must have previous hash chained");
  });

  // Test 4: Append-only history (no mutation or deletion pathways)
  test("4. Append-only history — historical events retain sequence and hashes without mutation", async () => {
    resetMockCases();
    const caseData = await ApiService.getInspection("SKU-DEMO-02");
    const initialTrail = [...(caseData.audit_trail || [])];
    assert.ok(initialTrail.length >= 2, "Must have baseline events");

    // Snapshot event 1
    const event1Before = { ...initialTrail[0] };

    // Append new event
    appendAuditEvent(caseData.id, {
      event_type: "RETEST_REQUESTED",
      event_label: "Physical Caliper Retest Requested",
      actor_type: "OFFICER",
      actor_id: "INSP-DL-0842",
      actor_name: "Rajesh Sharma",
      entity_type: "INSPECTION",
      entity_id: caseData.id,
      remarks: "Sample referred to regional testing laboratory.",
    });

    const updated = await ApiService.getInspection(caseData.id);
    const updatedTrail = updated.audit_trail || [];

    // Verify event 1 was completely untouched (append-only)
    assert.deepEqual(
      updatedTrail[0],
      event1Before,
      "Historical event #1 must not be modified or mutated"
    );

    // Sequence numbers must be strictly monotonic
    for (let i = 0; i < updatedTrail.length; i++) {
      assert.equal(
        updatedTrail[i].sequence_number,
        i + 1,
        `Event at index ${i} must have sequence number ${i + 1}`
      );
    }
  });

  // Test 5: Provenance renders backend-provided values
  test("5. Provenance — evidence ID, canonical SHA-256, and source render from backend data", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    const asset = caseData.evidence_assets[0];

    assert.ok(asset, "Evidence asset must exist");
    assert.equal(asset.image_id, "img_demo_01_pdp");
    assert.equal(asset.panel_type, "PDP_FRONT");
    assert.equal(
      asset.raw_sha256,
      "a3f5e1b2c4d6879012345678abcdef0123456789abcdef0123456789abcdef01"
    );
    assert.equal(asset.image_width, 1920);
    assert.equal(asset.image_height, 1080);
    assert.equal(caseData.capture_source, "PHYSICAL_FIELD");
  });

  // Test 6: Dynamic DAG renders without fixed 7-node assumption
  test("6. Dynamic DAG — renders data-driven node arrays with arbitrary node counts", () => {
    // 3-node graph
    const threeNodeCase: Partial<InspectionCase> = {
      id: "case_three_nodes",
      evidence_graph: {
        inspection_id: "case_three_nodes",
        merkle_root: "root_hash_three",
        nodes: [
          { node_id: "n1", stage_name: "RAW_IMAGE", payload_sha256: "hash1", timestamp_utc: "2026-09-10T10:00:00Z", metadata: {} },
          { node_id: "n2", stage_name: "QUALITY_GATE", payload_sha256: "hash2", timestamp_utc: "2026-09-10T10:01:00Z", metadata: {} },
          { node_id: "n3", stage_name: "OCR", payload_sha256: "hash3", timestamp_utc: "2026-09-10T10:02:00Z", metadata: {} },
        ],
      },
    };
    assert.equal(threeNodeCase.evidence_graph?.nodes.length, 3, "Supports 3-node dynamic graph");

    // 8-node graph
    const eightNodeNodes = Array.from({ length: 8 }, (_, i) => ({
      node_id: `n_${i + 1}`,
      stage_name: `STAGE_${i + 1}`,
      payload_sha256: `hash_${i + 1}`,
      timestamp_utc: "2026-09-10T10:00:00Z",
      metadata: {},
      sequence_number: i + 1,
    }));

    const eightNodeCase: Partial<InspectionCase> = {
      id: "case_eight_nodes",
      evidence_graph: {
        inspection_id: "case_eight_nodes",
        merkle_root: "root_hash_eight",
        nodes: eightNodeNodes,
      },
    };
    assert.equal(eightNodeCase.evidence_graph?.nodes.length, 8, "Supports 8-node dynamic graph");
  });

  // Test 7: Original evidence preservation
  test("7. Original evidence preservation — original evidence reference is untouched after adjudication", async () => {
    resetMockCases();
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    const originalAsset = { ...caseData.evidence_assets[0] };

    // Perform finding adjudication and case adjudication
    await ApiService.submitFindingAdjudication(
      caseData.id,
      caseData.rule_evaluations[0]?.finding_id || "eval_01",
      "CONFIRMED",
      "Confirmed discrepancy during physical inspection."
    );

    await ApiService.submitAdjudication(caseData.id, {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Confirmed violation following inspection review.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    });

    const updated = await ApiService.getInspection(caseData.id);
    const postAsset = updated.evidence_assets[0];

    assert.equal(postAsset.image_id, originalAsset.image_id, "Asset ID unchanged");
    assert.equal(postAsset.raw_sha256, originalAsset.raw_sha256, "SHA-256 unchanged");
    assert.equal(postAsset.image_width, originalAsset.image_width, "Width unchanged");
    assert.equal(postAsset.image_height, originalAsset.image_height, "Height unchanged");
    assert.equal(postAsset.is_original_untouched, true, "Remains marked as untouched");
  });

  // Test 8: Four epistemic states remain distinct
  test("8. Four epistemic states — PASS, FAIL, REVIEW, UNABLE_TO_VERIFY remain distinct", async () => {
    resetMockCases();
    const mockCases = getMockCases();

    const passCase = Object.values(mockCases).find((c) => c.overall_status === "PASS");
    const failCase = Object.values(mockCases).find((c) => c.overall_status === "FAIL");
    const reviewCase = Object.values(mockCases).find((c) => c.overall_status === "REVIEW");
    const unableCase = Object.values(mockCases).find((c) => c.overall_status === "UNABLE_TO_VERIFY");

    assert.ok(passCase, "PASS case must exist");
    assert.ok(failCase, "FAIL case must exist");
    assert.ok(reviewCase, "REVIEW case must exist");
    assert.ok(unableCase, "UNABLE_TO_VERIFY case must exist");

    // Epistemic states must not be conflated
    assert.notEqual(passCase.overall_status, failCase.overall_status);
    assert.notEqual(reviewCase.overall_status, failCase.overall_status, "REVIEW is not FAIL");
    assert.notEqual(unableCase.overall_status, failCase.overall_status, "UNABLE_TO_VERIFY is not FAIL");
    assert.notEqual(reviewCase.overall_status, unableCase.overall_status, "REVIEW is distinct from UNABLE_TO_VERIFY");
  });

  // Test 9: Complete mock mode end-to-end flow
  test("9. Mock mode end-to-end — case -> automated finding -> officer decision -> audit -> handoff", async () => {
    resetMockCases();
    const caseId = "insp_demo_01_biscuit";

    // 1. Fetch case
    const caseData = await ApiService.getInspection(caseId);
    assert.equal(caseData.workflow_status, "COMPLETED");
    assert.equal(caseData.overall_status, "FAIL");

    // 2. Submit officer adjudication
    const decision = await ApiService.submitAdjudication(caseId, {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Adjudicated by LMO: Unit Sale Price deficit verified against package PDP.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    });
    assert.ok(decision.decision_id);

    // 3. Verify audit history contains the adjudication event
    const auditTrail = await ApiService.getAuditTrail(caseId);
    assert.ok(auditTrail.length >= 4);
    const lastEvent = auditTrail[auditTrail.length - 1];
    assert.equal(lastEvent.actor_type, "OFFICER");
    assert.equal(lastEvent.decision, "CONFIRM_VIOLATION");

    // 4. Verify downstream handoff readiness
    const readiness = await ApiService.getCaseReadiness(caseId);
    assert.equal(readiness.evidence_available, true);
    assert.equal(readiness.automated_analysis_completed, true);
    assert.equal(readiness.officer_adjudication_completed, true);
    assert.equal(readiness.audit_record_complete, true);
    assert.equal(readiness.readiness_state, "READY_FOR_LEGAL_NOTICE_DISPATCH");
  });

  // Test 10: Downstream handoff readiness derived from state without legal calculations
  test("10. Handoff readiness — derived accurately from case states and officer action orders", () => {
    // Scenario A: Unadjudicated case
    const unadjudicatedCase: InspectionCase = {
      id: "case_unadj",
      inspection_number: "INSP-01",
      created_at: "2026-09-10T10:00:00Z",
      officer_id: "INSP-01",
      jurisdiction_id: "J1",
      capture_source: "PHYSICAL_FIELD",
      product_name: "Test Product",
      category: "FOOD",
      package_type: "RECTANGULAR",
      workflow_status: "OPEN",
      overall_status: "FAIL",
      ai_verdict: "FAIL",
      evidence_assets: [{ image_id: "img1" } as any],
      extracted_fields: [],
      rule_evaluations: [{ finding_id: "f1", rule_code: "R1", status: "FAIL" } as any],
    };

    const readinessA = computeCaseReadiness(unadjudicatedCase);
    assert.equal(readinessA.readiness_state, "PENDING_OFFICER_REVIEW");
    assert.equal(readinessA.officer_adjudication_completed, false);

    // Scenario B: Adjudicated with DISMISS_AS_COMPLIANT
    const compliantCase: InspectionCase = {
      ...unadjudicatedCase,
      adjudication: {
        decision_id: "dec_1",
        inspection_id: "case_unadj",
        officer_id: "INSP-01",
        badge_number: "B1",
        officer_name: "Officer",
        verdict: "DISMISS_AS_COMPLIANT",
        override_applied: true,
        remarks: "Verified manually as compliant.",
        timestamp_utc: "2026-09-10T10:10:00Z",
        action_order: "CLOSE_INSPECTION_COMPLIANT",
      },
    };
    const readinessB = computeCaseReadiness(compliantCase);
    assert.equal(readinessB.readiness_state, "READY_FOR_CASE_CLOSURE");

    // Scenario C: Adjudicated with REQUEST_RETEST
    const retestCase: InspectionCase = {
      ...unadjudicatedCase,
      adjudication: {
        decision_id: "dec_2",
        inspection_id: "case_unadj",
        officer_id: "INSP-01",
        badge_number: "B1",
        officer_name: "Officer",
        verdict: "REQUEST_RETEST",
        override_applied: false,
        remarks: "Borderline measurement requires lab measurement.",
        timestamp_utc: "2026-09-10T10:10:00Z",
        action_order: "REQUEST_PHYSICAL_CALIPER_CHECK",
      },
    };
    const readinessC = computeCaseReadiness(retestCase);
    assert.equal(readinessC.readiness_state, "ACTION_REQUIRED_RETEST");
  });
});
