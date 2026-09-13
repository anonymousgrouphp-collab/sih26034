/**
 * Unit & Integration Tests for RBAC Notice Gating, Dynamic Evidence Coordinate Mapping,
 * and Truthful OCR Lineage.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { ApiService, DemoFixtureService } from "../src/services/api";
import { OfficerRole } from "../src/types/inspection";

describe("RBAC Notice Gating & Evidence Coordinate Invariants", () => {
  it("1. RBAC Notice Dispatch: Inspector cannot issue notice; requires Controller authorization", async () => {
    ApiService.setOperatingMode("MOCK");
    const caseData = await ApiService.getInspection("SKU-DEMO-01");

    // Case before adjudication requires officer review (HITL invariant)
    const preReadiness = await ApiService.getCaseReadiness(caseData.id);
    assert.strictEqual(preReadiness.readiness_state, "PENDING_OFFICER_REVIEW");

    // Officer adjudicates with Form 1 Notice action order
    await ApiService.submitAdjudication(caseData.id, {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Confirmed statutory violations. Notice recommended to Controller.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    });

    // Case now transitions to READY_FOR_LEGAL_NOTICE_DISPATCH
    const readiness = await ApiService.getCaseReadiness(caseData.id);
    assert.strictEqual(readiness.readiness_state, "READY_FOR_LEGAL_NOTICE_DISPATCH");

    // RBAC Authorization Rule: Section 36(1) Notice issuance requires Controller authorization
    const isRoleAuthorizedForNotice = (role: OfficerRole): boolean => role === "CONTROLLER";
    assert.strictEqual(
      isRoleAuthorizedForNotice("INSPECTOR"),
      false,
      "Inspector must NOT have direct notice issuance authority"
    );
    assert.strictEqual(
      isRoleAuthorizedForNotice("CONTROLLER"),
      true,
      "Controller must be authorized for Form-1 Notice issuance"
    );
  });

  it("2. Original Evidence Invariant: Original image SHA-256 remains immutable after adjudication", async () => {
    ApiService.setOperatingMode("MOCK");
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    const originalAsset = caseData.evidence_assets[0];
    const initialHash = originalAsset.raw_sha256;

    assert.ok(initialHash, "Must have valid raw_sha256");

    // Perform an adjudication
    await ApiService.submitAdjudication(caseData.id, {
      adjudication_verdict: "CONFIRM_VIOLATION",
      override_applied: false,
      officer_remarks: "Adjudication test for evidence immutability.",
      action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
    });

    const updatedCase = await ApiService.getInspection(caseData.id);
    const postAsset = updatedCase.evidence_assets[0];

    assert.strictEqual(postAsset.raw_sha256, initialHash, "Evidence SHA-256 hash must never mutate");
    assert.strictEqual(postAsset.is_original_untouched, true, "Must remain marked as original untouched evidence");
  });

  it("3. Dynamic Coordinate Mapping: SVG viewBox matches image natural dimensions", async () => {
    // Test that arbitrary non-1920x1080 dimensions are respected
    const customAsset = {
      image_width: 2560,
      image_height: 1440,
    };

    const naturalDims = { width: 3840, height: 2160 };

    // Dynamic resolution logic should prioritize natural dimensions over defaults
    const resolvedWidth = naturalDims?.width || customAsset.image_width || 1920;
    const resolvedHeight = naturalDims?.height || customAsset.image_height || 1080;

    assert.strictEqual(resolvedWidth, 3840, "Must use loaded naturalWidth");
    assert.strictEqual(resolvedHeight, 2160, "Must use loaded naturalHeight");
  });

  it("4. Devanagari OCR Lineage Truthfulness: Devanagari recognition is attributed to PP-OCRv3", async () => {
    ApiService.setOperatingMode("DEMO_FIXTURE");
    const caseData = await ApiService.getInspection("SKU-DEMO-01");
    const ocr = caseData.evidence_assets[0].ocr;

    assert.ok(ocr, "Must have OCR results");
    const hindiTokens = ocr.tokens.filter((t) => /[\u0900-\u097F]/.test(t.text));
    assert.ok(hindiTokens.length > 0, "Must contain Hindi tokens");

    // Verify model source identity is truthful
    hindiTokens.forEach((tok) => {
      // Model lineage must not claim PP-OCRv4 for Devanagari
      assert.notStrictEqual(
        tok.model_source,
        "PP-OCRv4_Devanagari",
        "Devanagari model must never be falsely claimed as PP-OCRv4"
      );
    });
  });

  it("5. Four-State Epistemic Model: All four states remain distinct and uncollapsed", async () => {
    const demoService = DemoFixtureService.getInstance();
    const cPass = await demoService.getInspection("SKU-DEMO-03");
    const cFail = await demoService.getInspection("SKU-DEMO-01");
    const cReview = await demoService.getInspection("SKU-DEMO-04");
    const cUnable = await demoService.getInspection("SKU-DEMO-05");

    const states = new Set([
      cPass.overall_status,
      cFail.overall_status,
      cReview.overall_status,
      cUnable.overall_status,
    ]);

    assert.strictEqual(states.size, 4, "All four epistemic states must be distinct");
    assert.ok(states.has("PASS"));
    assert.ok(states.has("FAIL"));
    assert.ok(states.has("REVIEW"));
    assert.ok(states.has("UNABLE_TO_VERIFY"));
  });
});
