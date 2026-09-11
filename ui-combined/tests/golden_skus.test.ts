/**
 * Comprehensive Test Suite for Golden Demonstration SKUs (SKU-DEMO-01 to SKU-DEMO-06)
 * Governed by:
 * - 12_DEMO_PLAN.md & 11_TESTING_AND_VALIDATION_PLAN.md
 * - LMPC Rules, 2011 (Rule 6, Table-I font schedule, USP math, prohibited units)
 * - E-Commerce Rule 6(10) / GSR 594(E)
 * - 4-State Epistemic Result Model (PASS, FAIL, REVIEW, UNABLE_TO_VERIFY)
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ApiService } from "../src/services/api";

describe("Golden Demonstration SKU Scenarios (SKU-DEMO-01 to SKU-DEMO-06)", () => {
  beforeEach(() => {
    ApiService.setOperatingMode("DEMO_FIXTURE");
  });

  it("1. SKU-DEMO-01: Prohibited unit 'gms' and Table-I font deficit -> FAIL", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-01");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-01");
    assert.strictEqual(caseData.overall_status, "FAIL");
    assert.strictEqual(caseData.ai_verdict, "FAIL");
    assert.strictEqual(caseData.pipeline_source, "DEMO_FIXTURES");

    // Check prohibited unit finding
    const bannedUnitFinding = caseData.rule_evaluations.find(
      (f) => f.rule_code === "SECTION_11_RULE_12_PROHIBITED_UNITS"
    );
    assert.ok(bannedUnitFinding, "Must contain Section 11 / Rule 12 prohibited unit evaluation");
    assert.strictEqual(bannedUnitFinding.status, "FAIL");
    assert.strictEqual(bannedUnitFinding.measured_value, "Non-standard unit 'gms'");
    assert.strictEqual(bannedUnitFinding.required_value, "Standard SI metric symbol 'g'");

    // Check Table-I font height finding
    const fontFinding = caseData.rule_evaluations.find(
      (f) => f.rule_code === "RULE_06_1_H_NET_QTY_FONT"
    );
    assert.ok(fontFinding, "Must contain Table-I font height evaluation");
    assert.strictEqual(fontFinding.status, "FAIL");
    assert.strictEqual(fontFinding.measured_value, "1.84 mm");
    assert.ok(fontFinding.required_value.includes("2.50 mm"));

    // Check bilingual OCR tokens (English + Devanagari Hindi)
    const activeAsset = caseData.evidence_assets[0];
    assert.ok(activeAsset.ocr, "Must have OCR tokens");
    const devanagariToken = activeAsset.ocr.tokens.find((t) => /[\u0900-\u097F]/.test(t.text));
    assert.ok(devanagariToken, "Must preserve Devanagari Unicode token");
    assert.ok(devanagariToken.text.includes("ग्राम"), "Devanagari text must contain Hindi word");
  });

  it("2. SKU-DEMO-02: Unit Sale Price (USP) Mathematical Inconsistency -> FAIL", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-02");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-02");
    assert.strictEqual(caseData.overall_status, "FAIL");
    assert.strictEqual(caseData.ai_verdict, "FAIL");

    const uspFinding = caseData.rule_evaluations.find(
      (f) => f.rule_code === "RULE_06_1_K_USP_COMPUTATION"
    );
    assert.ok(uspFinding, "Must evaluate Unit Sale Price math check");
    assert.strictEqual(uspFinding.status, "FAIL");
    assert.strictEqual(uspFinding.measured_value, "Declared Rs. 0.55 / g");
    assert.ok(uspFinding.required_value.includes("0.40"));
    assert.ok(
      uspFinding.discrepancy?.includes("Discrepancy") || uspFinding.discrepancy?.includes("mismatch"),
      "Discrepancy must state the quantified deficit"
    );
  });

  it("3. SKU-DEMO-03: Compliant Bilingual FMCG Package -> PASS", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-03");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-03");
    assert.strictEqual(caseData.overall_status, "PASS");
    assert.strictEqual(caseData.ai_verdict, "PASS");

    // Zero failures
    const failedFindings = caseData.rule_evaluations.filter((f) => f.status === "FAIL");
    assert.strictEqual(failedFindings.length, 0, "Compliant SKU must have zero failures");

    // All findings must be PASS
    const passFindings = caseData.rule_evaluations.filter((f) => f.status === "PASS");
    assert.strictEqual(passFindings.length, caseData.rule_evaluations.length);

    // Font height passes Table-I Row 3 (100-500 cm2 PDP: 2.50 mm)
    const fontFinding = caseData.rule_evaluations.find((f) => f.rule_code.includes("FONT"));
    assert.ok(fontFinding);
    assert.strictEqual(fontFinding.status, "PASS");
  });

  it("4. SKU-DEMO-04: Borderline Measurement within Uncertainty Band -> REVIEW", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-04");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-04");
    assert.strictEqual(caseData.overall_status, "REVIEW");
    assert.strictEqual(caseData.ai_verdict, "REVIEW");

    // Borderline font evaluation
    const reviewFinding = caseData.rule_evaluations.find((f) => f.status === "REVIEW");
    assert.ok(reviewFinding, "Must contain a REVIEW status finding");
    assert.strictEqual(reviewFinding.measured_value, "2.46 mm");
    assert.ok(reviewFinding.required_value.includes("2.50 mm"));
    assert.ok(
      reviewFinding.discrepancy?.toLowerCase().includes("caliper"),
      "Guidance must suggest physical caliper verification"
    );
  });

  it("5. SKU-DEMO-05: Optical Specular Glare Rejection -> UNABLE_TO_VERIFY", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-05");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-05");
    assert.strictEqual(caseData.overall_status, "UNABLE_TO_VERIFY");
    assert.strictEqual(caseData.ai_verdict, "UNABLE_TO_VERIFY");

    const activeAsset = caseData.evidence_assets[0];
    assert.strictEqual(activeAsset.quality_gate.passed, false);
    assert.ok(activeAsset.quality_gate.glare_percentage > 3.0);
    assert.strictEqual(activeAsset.quality_gate.advice, "REDUCE_GLARE");

    const opticFinding = caseData.rule_evaluations.find(
      (f) => f.status === "UNABLE_TO_VERIFY"
    );
    assert.ok(opticFinding, "Must contain UNABLE_TO_VERIFY rule evaluation");
    assert.ok(
      opticFinding.discrepancy?.toLowerCase().includes("specular") ||
      opticFinding.discrepancy?.toLowerCase().includes("glare"),
      "Must explain specular glare reflection as reason"
    );
  });

  it("6. SKU-DEMO-06: E-Commerce Rule 6(10) Missing Country of Origin -> FAIL", async () => {
    const caseData = await ApiService.getInspection("SKU-DEMO-06");

    assert.strictEqual(caseData.sku_demo_id, "SKU-DEMO-06");
    assert.strictEqual(caseData.overall_status, "FAIL");
    assert.strictEqual(caseData.capture_source, "ECOMMERCE_URL");

    // Missing Country of Origin declaration on digital listing
    const originFinding = caseData.rule_evaluations.find(
      (f) => f.rule_code === "RULE_06_10_ECOMM_MANDATORY_DECLARATIONS"
    );
    assert.ok(originFinding, "Must evaluate Rule 6(10) Country of Origin");
    assert.strictEqual(originFinding.status, "FAIL");
    assert.strictEqual(originFinding.measured_value, "Omitted / Undeclared");

    // Statutory exemption of Date of Manufacture under Rule 6(10)
    const mfgFinding = caseData.rule_evaluations.find(
      (f) => f.rule_code === "RULE_06_10_MFG_DATE_EXEMPTION"
    );
    assert.ok(mfgFinding, "Must record Rule 6(10) manufacturing date statutory exemption");
    assert.strictEqual(mfgFinding.status, "NOT_APPLICABLE");
    assert.ok(
      mfgFinding.discrepancy?.toLowerCase().includes("exempt"),
      "Must explain statutory exemption for digital listings"
    );
  });
});
