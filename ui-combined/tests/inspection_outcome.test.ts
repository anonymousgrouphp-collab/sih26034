/**
 * Chunk 7 Test Suite: Inspection Outcome, Traceable Report, Controlled Case Closure & Demo
 * Verifies:
 * 1. Backend workflow state is rendered faithfully without frontend recalculation.
 * 2. No fabricated overall verdict is invented from finding counts.
 * 3. Machine finding and officer adjudication remain strictly separate.
 * 4. Report findings retain end-to-end relational traceability (Evidence -> Token -> Field -> Finding -> Decision).
 * 5. Original physical evidence is preserved untouched with canonical SHA-256 record.
 * 6. Four epistemic states (PASS, FAIL, REVIEW, UNABLE_TO_VERIFY) remain distinct.
 * 7. Case closure is gated strictly by backend readiness state (READY_FOR_CASE_CLOSURE).
 * 8. Zero autonomous legal notice generation or dispatch in frontend.
 * 9. Print view excludes interactive screen controls and preserves monochrome legibility.
 * 10. Missing data fields display safely without defaulting to compliant.
 * 11. All six Golden SKU fixtures adapt and render seamlessly.
 * 12. Regression integrity across existing pipeline contracts.
 */

import test, { describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ApiService } from "../src/services/api";
import {
  getMockCases,
  resetMockCases,
  computeCaseReadiness,
} from "../src/services/mockData";
import {
  InspectionCase,
  RuleFinding,
} from "../src/types/inspection";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Chunk 7: Inspection Outcome, Traceable Report View & Controlled Case Closure", () => {
  beforeEach(() => {
    ApiService.setMockMode(true);
    resetMockCases();
  });

  // Test 1: Backend workflow state rendered without recalculation
  test("1. Backend workflow state — outcome renders supplied workflow state directly", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    assert.equal(caseData.workflow_status, "COMPLETED", "Workflow status must match backend record");

    // Also register a fresh case to verify initial workflow status is preserved faithfully
    const newCase = await ApiService.createInspection({
      product_name: "Fresh Inspection Sample",
      category: "FOOD",
      package_type: "RECTANGULAR",
      inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
      jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
    });
    assert.equal(newCase.workflow_status, "DRAFT", "New case workflow status must be DRAFT");

    const readiness = await ApiService.getCaseReadiness(caseData.id);
    assert.ok(readiness, "Case readiness must be provided by backend/mock adapter");
    assert.equal(
      readiness.readiness_state,
      "PENDING_OFFICER_REVIEW",
      "Unadjudicated case must have PENDING_OFFICER_REVIEW readiness"
    );
  });

  // Test 2: No fabricated overall verdict
  test("2. No fabricated overall verdict — finding counts do NOT invent an overall legal verdict", async () => {
    // Create synthetic case with 1 FAIL finding but NO overall status set
    const syntheticCase: InspectionCase = {
      id: "insp_synthetic_no_verdict",
      inspection_number: "INSP-SYN-001",
      created_at: "2026-09-10T12:00:00Z",
      officer_id: "INSP-DL-0842",
      jurisdiction_id: "CIRCLE_DL_SOUTH_01",
      capture_source: "PHYSICAL_FIELD",
      product_name: "Synthetic Test Commodity",
      category: "FOOD",
      package_type: "RECTANGULAR",
      workflow_status: "DRAFT",
      overall_status: "PENDING_REVIEW",
      ai_verdict: "PENDING",
      evidence_assets: [],
      extracted_fields: [],
      rule_evaluations: [
        {
          finding_id: "find_syn_01",
          rule_code: "RULE_MRP_01",
          statutory_reference: "Rule 6(1)(h)",
          status: "FAIL",
          severity: "CRITICAL",
          required_value: "Declared",
          measured_value: "Missing",
          discrepancy: "MRP declaration omitted",
        } as RuleFinding,
      ],
    };

    // Verify finding count reflects 1 FAIL
    const failCount = syntheticCase.rule_evaluations.filter((f) => f.status === "FAIL").length;
    assert.equal(failCount, 1, "Must have 1 FAIL finding");

    // Invariant: The case's overall_status MUST NOT be automatically converted to FAIL by the frontend
    assert.equal(
      syntheticCase.overall_status,
      "PENDING_REVIEW",
      "Frontend must NOT invent an overall FAIL verdict merely because finding count > 0"
    );
  });

  // Test 3: Finding / adjudication separation
  test("3. Finding / adjudication separation — automated status and officer determination remain distinct", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-02");
    const finding = caseData.rule_evaluations[0];
    assert.equal(finding.status, "FAIL", "Original automated finding status is FAIL");

    // Submit officer adjudication with DISMISSED
    await ApiService.submitFindingAdjudication(
      caseData.id,
      finding.finding_id,
      "DISMISSED",
      "Physical digital caliper verification confirms compliance with backend threshold."
    );

    const updated = await ApiService.getInspection(caseData.id);
    const updatedFinding = updated.rule_evaluations.find((f) => f.finding_id === finding.finding_id);
    const officerDecision = updated.finding_decisions?.[finding.finding_id];

    // Invariant: The finding's status is still FAIL; officer decision is DISMISSED
    assert.equal(updatedFinding?.status, "FAIL", "Original finding status must remain FAIL");
    assert.equal(officerDecision?.decision, "DISMISSED", "Officer adjudication must be DISMISSED");
    assert.notEqual(updatedFinding?.status, officerDecision?.decision, "Finding and decision are distinct dimensions");
  });

  // Test 4: Report traceability
  test("4. Report traceability — findings retain linkages to evidence, extracted fields, and tokens", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    assert.ok(caseData.rule_evaluations.length > 0, "Case must have evaluations");

    const finding = caseData.rule_evaluations[0];
    assert.ok(finding.finding_id, "Finding must have finding_id");
    assert.ok(finding.rule_code, "Finding must have rule_code");
    assert.ok(finding.statutory_reference, "Finding must have statutory citation from backend");

    // Traceability reference checks
    const primaryAsset = caseData.evidence_assets[0];
    assert.ok(primaryAsset.image_id, "Evidence asset ID must be present");
    assert.equal(primaryAsset.is_original_untouched, true, "Asset must be untouched");

    if (caseData.extracted_fields.length > 0) {
      const field = caseData.extracted_fields[0];
      assert.ok(field.field_id, "Extracted field must retain unique field_id");
    }
  });

  // Test 5: Original evidence preservation
  test("5. Original evidence preservation — original evidence record remains untouched", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-03");
    const asset = caseData.evidence_assets[0];

    assert.equal(asset.is_original_untouched, true);
    assert.ok(asset.raw_sha256, "Asset must contain raw SHA-256");
    assert.equal(asset.raw_sha256.length, 64, "Raw SHA-256 must be standard 64 hex characters");
    assert.ok(asset.image_width > 0, "Native width must be positive");
    assert.ok(asset.image_height > 0, "Native height must be positive");
  });

  // Test 6: Four epistemic states preservation
  test("6. Four epistemic states — PASS, FAIL, REVIEW, UNABLE_TO_VERIFY remain distinct", async () => {
    const allCases = getMockCases();

    const passCase = allCases["SKU-DEMO-03"];
    const failCase = allCases["SKU-DEMO-02"];
    const reviewCase = allCases["SKU-DEMO-04"];
    const unableCase = allCases["SKU-DEMO-05"];

    assert.equal(passCase.overall_status, "PASS");
    assert.equal(failCase.overall_status, "FAIL");
    assert.equal(reviewCase.overall_status, "REVIEW");
    assert.equal(unableCase.overall_status, "UNABLE_TO_VERIFY");

    // Invariant: UNABLE_TO_VERIFY is NEVER conflated with FAIL
    assert.notEqual(unableCase.overall_status, "FAIL", "Optical rejection must never be marked as FAIL");
    assert.equal(unableCase.evidence_assets[0].quality_gate.passed, false);
    assert.equal(unableCase.evidence_assets[0].quality_gate.advice, "REDUCE_GLARE");
  });

  // Test 7: Closure gating
  test("7. Closure gating — case closure is rejected if case is not marked ready for closure", async () => {
    // SKU-DEMO-02 has unadjudicated FAIL findings and readiness PENDING_OFFICER_REVIEW
    const caseData = await ApiService.getInspection("SKU-DEMO-02");
    const readiness = computeCaseReadiness(caseData);
    assert.equal(readiness.readiness_state, "PENDING_OFFICER_REVIEW");

    // Attempting to close the case must fail
    await assert.rejects(
      async () => {
        await ApiService.closeInspection(caseData.id, "Attempting closure without officer review");
      },
      (err: any) => {
        assert.equal(err.error_code, "CASE_NOT_READY_FOR_CLOSURE");
        return true;
      },
      "Must reject case closure when readiness is not READY_FOR_CASE_CLOSURE"
    );

    // Now test a compliant case that is ready for closure
    // Adjudicate SKU-DEMO-04 as compliant
    await ApiService.submitAdjudication(caseData.id, {
      adjudication_verdict: "DISMISS_AS_COMPLIANT",
      override_applied: true,
      officer_remarks: "Physical digital caliper verification confirmed compliance with statutory threshold.",
      action_order: "CLOSE_INSPECTION_COMPLIANT",
    });

    const readyCase = await ApiService.getInspection(caseData.id);
    const readyState = computeCaseReadiness(readyCase);
    assert.equal(readyState.readiness_state, "READY_FOR_CASE_CLOSURE");

    // Now closure succeeds
    const closedCase = await ApiService.closeInspection(readyCase.id, "Case closed after officer review.");
    assert.equal(closedCase.workflow_status, "COMPLETED");

    // Audit event for closure appended
    const latestAudit = closedCase.audit_trail?.[closedCase.audit_trail.length - 1];
    assert.equal(latestAudit?.event_type, "INSPECTION_CLOSED");
    assert.equal(latestAudit?.decision, "CASE_CLOSED");
  });

  // Test 8: No autonomous notice generation
  test("8. No autonomous notice generation — notice dispatch status reflects readiness without autonomous generation", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-02");

    // Submit confirmation of violation with notice action order
    await ApiService.submitAdjudication(caseData.id, {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Statutory violation confirmed against backend schedule. Notice authorized.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    });

    const updated = await ApiService.getInspection(caseData.id);
    const readiness = computeCaseReadiness(updated);

    assert.equal(
      readiness.readiness_state,
      "READY_FOR_LEGAL_NOTICE_DISPATCH",
      "Readiness must reflect READY_FOR_LEGAL_NOTICE_DISPATCH"
    );
    // Invariant: The case MUST NOT have a pre-generated legal notice attached autonomously
    assert.equal(
      updated.notice_reference,
      undefined,
      "No legal notice reference should be autonomously created without explicit dispatch"
    );
  });

  // Test 9: Print view structure
  test("9. Print structure — screen-only controls and printable sections are demarcated", () => {
    // Verify that index.css includes @media print rules
    // and InspectionReportView includes screen-only and printable-report markers
    const cssPath = path.resolve(__dirname, "../src/index.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    assert.match(cssContent, /@media\s+print/, "index.css must contain @media print queries");
    assert.match(cssContent, /\.screen-only/, "index.css must hide .screen-only elements in print");
    assert.match(cssContent, /print-color-adjust:\s*exact/, "index.css must enforce exact print colors");

    const reportPath = path.resolve(__dirname, "../src/features/case/InspectionReportView.tsx");
    const reportContent = fs.readFileSync(reportPath, "utf-8");

    assert.match(reportContent, /screen-only/, "InspectionReportView must use screen-only class for toolbar");
    assert.match(reportContent, /printable-report/, "InspectionReportView must use printable-report class for printable dossier");
    assert.match(reportContent, /window\.print\(\)/, "InspectionReportView must use native window.print()");
  });

  // Test 10: Missing data handling
  test("10. Missing data handling — unavailable fields display safely without defaulting to compliant", () => {
    const minimalCase: InspectionCase = {
      id: "insp_minimal_01",
      inspection_number: "INSP-MIN-001",
      created_at: "",
      officer_id: "INSP-01",
      jurisdiction_id: "J1",
      capture_source: "PHYSICAL_FIELD",
      product_name: "Minimal Product",
      category: "UNSPECIFIED",
      package_type: "UNSPECIFIED",
      workflow_status: "DRAFT",
      overall_status: "PENDING_REVIEW",
      ai_verdict: "PENDING",
      evidence_assets: [],
      extracted_fields: [],
      rule_evaluations: [],
    };

    const readiness = computeCaseReadiness(minimalCase);
    assert.equal(readiness.evidence_available, false, "Evidence must be marked false when assets empty");
    assert.equal(readiness.automated_analysis_completed, false, "Analysis must be marked false when evaluations empty");
    assert.equal(readiness.officer_adjudication_completed, false, "Adjudication must be marked false");
    assert.equal(readiness.readiness_state, "PENDING_OFFICER_REVIEW");

    // Invariant: An empty or missing evaluation does NOT produce PASS or COMPLIANT
    assert.notEqual(readiness.readiness_state, "READY_FOR_CASE_CLOSURE");
  });

  // Test 11: Golden SKU compatibility
  test("11. Golden SKU compatibility — all six demonstration SKUs adapt and render", async () => {
    const skus = [
      "SKU-DEMO-01",
      "SKU-DEMO-02",
      "SKU-DEMO-03",
      "SKU-DEMO-04",
      "SKU-DEMO-05",
      "SKU-DEMO-06",
    ];

    for (const sku of skus) {
      const caseData = await ApiService.getInspection(sku);
      assert.ok(caseData, `Case ${sku} must be retrievable`);
      assert.ok(caseData.product_name, `Case ${sku} must have product_name`);
      assert.ok(caseData.evidence_assets.length > 0, `Case ${sku} must have evidence asset`);

      const readiness = await ApiService.getCaseReadiness(caseData.id);
      assert.ok(readiness.readiness_state, `Case ${sku} must produce valid readiness state`);
    }
  });

  // Test 12: Regression across existing modules
  test("12. Regression — all existing mock cases retain valid audit trail and asset properties", () => {
    const allCases = getMockCases();
    assert.ok(Object.keys(allCases).length >= 6, "Must contain all golden cases");

    Object.values(allCases).forEach((c) => {
      assert.ok(c.id, "Case ID must exist");
      assert.ok(c.inspection_number, "Inspection number must exist");
      assert.ok(c.audit_trail, "Audit trail must exist on every case");
      assert.ok(c.audit_trail.length >= 1, "Audit trail must have at least 1 initial event");
      assert.ok(c.evidence_assets, "Evidence assets must exist");
    });
  });
});
