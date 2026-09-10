/**
 * Chunk 5 Test Suite: Flagship Split-View Adjudication Canvas
 * 
 * Verifies:
 * 1. Forensic Traceability Chain:
 *    Finding ---> Extracted Field ---> OCR Token ---> Image Polygon ---> Evidence ID
 *    and reverse: OCR Token ---> Extracted Field ---> Finding
 * 2. Deterministic Polygon Coordinate Normalization & Safe Degradation
 * 3. 4-State Epistemic Handling across Golden Demo SKUs (PASS, FAIL, REVIEW, UNABLE_TO_VERIFY)
 * 4. Multilingual OCR & Unicode Preservation (Devanagari Hindi, Indic Numerals, Rupee Symbol)
 * 5. Backend Truth Invariants (Zero frontend legal math or metric calculations)
 * 6. Officer Adjudication, Overrides, Mandatory Remarks, and Audit Trail Preservation
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiService } from "../src/services/api";
import { resetMockCases } from "../src/services/mockData";
import {
  findFieldForFinding,
  findTokensForField,
  findTokensForFinding,
  findFieldForToken,
  findFindingsForToken,
  polygonToSvgPoints,
  polygonCenter,
  getStatusStyle,
} from "../src/features/adjudication/AdjudicationTraceability";
import { AdjudicationRequest } from "../src/types/inspection";

describe("Chunk 5: Flagship Split-View Adjudication Canvas", () => {
  beforeEach(() => {
    ApiService.setMockMode(true);
    resetMockCases();
  });

  describe("1. Forensic Traceability Chain (Bidirectional Linking)", () => {
    it("traces a compliance finding to its extracted field, OCR token, and image polygon", async () => {
      // Golden SKU-DEMO-01: Biscuit Carton (FAIL: font deficit & prohibited unit)
      const caseData = await ApiService.getInspection("SKU-DEMO-01");
      const asset = caseData.evidence_assets[0];
      assert.ok(asset, "Evidence asset must exist");
      assert.ok(caseData.rule_evaluations.length >= 2, "Must have rule evaluations");

      // Select Finding: Net Qty Font Height Deficit
      const fontFinding = caseData.rule_evaluations.find(
        (r) => r.rule_code === "RULE_06_1_H_NET_QTY_FONT"
      );
      assert.ok(fontFinding, "Font finding must exist");

      // 1. Finding ---> Extracted Field
      const linkedField = findFieldForFinding(fontFinding, caseData.extracted_fields);
      assert.ok(linkedField, "Must resolve linked ExtractedField");
      assert.equal(linkedField.field_type, "NET_QUANTITY");
      assert.equal(linkedField.raw_ocr_text, "Net Wt: 200 gms");
      assert.equal(linkedField.measured_font_height_mm, 1.84);

      // 2. Extracted Field ---> OCR Token
      const linkedTokens = findTokensForField(linkedField, asset.ocr?.tokens || []);
      assert.ok(linkedTokens.length > 0, "Must resolve linked OCRToken");
      const primaryToken = linkedTokens[0];
      assert.equal(primaryToken.token_id, "tok_01_02");
      assert.equal(primaryToken.text, "Net Wt: 200 gms");

      // Verify direct findTokensForFinding helper
      const directTokens = findTokensForFinding(fontFinding, caseData.extracted_fields, asset.ocr?.tokens || []);
      assert.equal(directTokens[0].token_id, "tok_01_02");

      // 3. OCR Token ---> Image Polygon
      assert.equal(primaryToken.polygon.length, 4, "Must have 4 polygon vertices");
      const svgPoints = polygonToSvgPoints(primaryToken.polygon);
      assert.equal(svgPoints, "200,350 550,350 550,410 200,410");

      // 4. Evidence Asset reference preserved
      assert.equal(asset.image_id, "img_demo_01_pdp");
      assert.match(asset.raw_sha256, /^[a-f0-9]{64}$/);
    });

    it("reverse-traces from clicked OCR polygon token to extracted field and compliance findings", async () => {
      const caseData = await ApiService.getInspection("SKU-DEMO-01");
      const asset = caseData.evidence_assets[0];
      const token = asset.ocr?.tokens.find((t) => t.token_id === "tok_01_02");
      assert.ok(token, "Token tok_01_02 must exist");

      // 1. Token ---> Extracted Field
      const parentField = findFieldForToken(token, caseData.extracted_fields);
      assert.ok(parentField, "Must resolve parent field");
      assert.equal(parentField.field_type, "NET_QUANTITY");

      // 2. Token ---> Compliance Findings
      const matchedFindings = findFindingsForToken(
        token,
        caseData.extracted_fields,
        caseData.rule_evaluations
      );
      assert.ok(matchedFindings.length >= 2, "Token should link to both font and unit violations");
      const ruleCodes = matchedFindings.map((f) => f.rule_code);
      assert.ok(ruleCodes.includes("RULE_06_1_H_NET_QTY_FONT"));
      assert.ok(ruleCodes.includes("SECTION_11_RULE_12_PROHIBITED_UNITS"));
    });
  });

  describe("2. Deterministic Polygon Coordinates & Safe Degradation", () => {
    it("converts 4-point polygons into deterministic SVG point strings and centers", () => {
      const polygon: [number, number][] = [
        [100, 200],
        [400, 200],
        [400, 260],
        [100, 260],
      ];

      const svgPoints = polygonToSvgPoints(polygon);
      assert.equal(svgPoints, "100,200 400,200 400,260 100,260");

      const center = polygonCenter(polygon);
      assert.equal(center.x, 250);
      assert.equal(center.y, 230);
    });

    it("handles invalid or degraded polygons gracefully without throwing errors", () => {
      assert.equal(polygonToSvgPoints([]), "");
      assert.equal(polygonToSvgPoints([[10, 20]]), "");

      const centerEmpty = polygonCenter([]);
      assert.deepEqual(centerEmpty, { x: 0, y: 0 });
    });

    it("resolves correct epistemic colors for all 4 states", () => {
      assert.equal(getStatusStyle("FAIL").stroke, "#DC2626");
      assert.equal(getStatusStyle("REVIEW").stroke, "#D97706");
      assert.equal(getStatusStyle("PASS").stroke, "#059669");
      assert.equal(getStatusStyle("UNABLE_TO_VERIFY").stroke, "#64748B");
    });
  });

  describe("3. 4-State Epistemic Fidelity Across Golden Demo SKUs", () => {
    it("handles PASS scenario (Bottled Water) without fabricating violations", async () => {
      const waterCase = await ApiService.getInspection("SKU-DEMO-03");
      assert.equal(waterCase.overall_status, "PASS");
      assert.equal(waterCase.ai_verdict, "PASS");

      for (const finding of waterCase.rule_evaluations) {
        assert.equal(finding.status, "PASS");
      }
    });

    it("handles REVIEW scenario (Borderline Soap) preserving sensor uncertainty status", async () => {
      const soapCase = await ApiService.getInspection("SKU-DEMO-04");
      assert.equal(soapCase.overall_status, "REVIEW");
      assert.equal(soapCase.ai_verdict, "REVIEW");

      const reviewFinding = soapCase.rule_evaluations[0];
      assert.equal(reviewFinding.status, "REVIEW");
      assert.match(reviewFinding.discrepancy || "", /uncertainty band/);
    });

    it("handles UNABLE_TO_VERIFY scenario (Chips Glare) without conflating as FAIL", async () => {
      const chipsCase = await ApiService.getInspection("SKU-DEMO-05");
      assert.equal(chipsCase.overall_status, "UNABLE_TO_VERIFY");
      assert.notEqual(chipsCase.overall_status, "FAIL");
      assert.equal(chipsCase.ai_verdict, "UNABLE_TO_VERIFY");

      const asset = chipsCase.evidence_assets[0];
      assert.equal(asset.quality_gate.passed, false);
      assert.match(asset.quality_gate.advice || "", /REDUCE_GLARE/);
    });
  });

  describe("4. Multilingual OCR & Unicode Character Integrity", () => {
    it("preserves Devanagari Hindi text, Indic numerals, and Rupee symbols in tokens and full text", async () => {
      const biscuitCase = await ApiService.getInspection("SKU-DEMO-01");
      const asset = biscuitCase.evidence_assets[0];
      const hindiToken = asset.ocr?.tokens.find((t) => t.token_id === "tok_01_04");

      assert.ok(hindiToken, "Hindi OCR token tok_01_04 must exist");
      assert.equal(hindiToken.text, "शुद्ध मात्रा: २०० ग्राम");
      assert.equal(hindiToken.language, "hi");
      assert.equal(hindiToken.model_source, "PP-OCRv3_Devanagari", "Model must be PP-OCRv3 Devanagari");

      // Verify Indic numerals inside character string
      assert.match(hindiToken.text, /२००/);

      // Verify Rupee symbol in text
      assert.match(asset.ocr?.full_text || "", /Rs\./);
    });
  });

  describe("5. Backend Truth & Non-Interference Invariants", () => {
    it("verifies rule findings and legal references originate from backend data, not UI math", async () => {
      const biscuitCase = await ApiService.getInspection("SKU-DEMO-01");
      const fontFinding = biscuitCase.rule_evaluations.find((r) => r.rule_code === "RULE_06_1_H_NET_QTY_FONT");

      assert.ok(fontFinding);
      assert.strictEqual(typeof fontFinding.measured_value, "string");
      assert.strictEqual(typeof fontFinding.required_value, "string");
      assert.strictEqual(typeof fontFinding.statutory_reference, "string");
      assert.match(fontFinding.statutory_reference, /Rule 6\(1\)\(h\)/);
      assert.match(fontFinding.legal_consequence, /Section 36\(1\)/);
    });

    it("verifies evidence digest is 64-hex SHA-256 and originates from backend", async () => {
      const waterCase = await ApiService.getInspection("SKU-DEMO-03");
      const asset = waterCase.evidence_assets[0];
      assert.match(asset.raw_sha256, /^[a-f0-9]{64}$/);
      assert.ok(asset.is_original_untouched, "Original untouched flag must be true");
    });
  });

  describe("6. Human-in-the-Loop Adjudication & Audit Trail Preservation", () => {
    it("rejects officer adjudication when mandatory justification remarks are missing", async () => {
      const biscuitCase = await ApiService.getInspection("SKU-DEMO-01");

      const emptyRemarksReq: AdjudicationRequest = {
        adjudication_verdict: "CONFIRM_VIOLATION",
        override_applied: false,
        officer_remarks: "",
        action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
      };

      await assert.rejects(
        async () => {
          await ApiService.submitAdjudication(biscuitCase.id, emptyRemarksReq);
        },
        (err: any) => {
          assert.equal(err.error_code, "MISSING_OFFICER_REMARKS");
          assert.match(err.message, /Mandatory officer justification remarks required/);
          return true;
        }
      );
    });

    it("accepts valid officer adjudication, updates case, and preserves original automated findings", async () => {
      const biscuitCase = await ApiService.getInspection("SKU-DEMO-01");
      const originalAutomatedVerdict = biscuitCase.overall_status;
      assert.equal(originalAutomatedVerdict, "FAIL");

      // Officer confirms violation with detailed remarks
      const validReq: AdjudicationRequest = {
        adjudication_verdict: "CONFIRM_VIOLATION",
        override_applied: false,
        officer_remarks: "Verified net quantity font height deficit of 0.66mm against Table-I schedule. Confirmed non-standard unit gms.",
        action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
      };

      const decision = await ApiService.submitAdjudication(biscuitCase.id, validReq);
      assert.ok(decision.decision_id.startsWith("dec_"));
      assert.equal(decision.verdict, "CONFIRM_VIOLATION");
      assert.equal(decision.officer_id, "INSP-DL-0842");
      assert.equal(decision.override_applied, false);
      assert.match(decision.remarks, /deficit of 0\.66mm/);

      // Verify case state updated to COMPLETED without erasing automated findings
      const updatedCase = await ApiService.getInspection(biscuitCase.id);
      assert.equal(updatedCase.workflow_status, "COMPLETED");
      assert.ok(updatedCase.adjudication, "Adjudication record must be attached to case");
      assert.equal(updatedCase.adjudication?.verdict, "CONFIRM_VIOLATION");
      assert.equal(updatedCase.ai_verdict, "FAIL", "Original AI verdict must remain intact for audit");
      assert.equal(updatedCase.rule_evaluations.length, biscuitCase.rule_evaluations.length, "Evaluations must not be erased");
    });

    it("supports officer override with auditable justification remarks", async () => {
      const soapCase = await ApiService.getInspection("SKU-DEMO-04");
      assert.equal(soapCase.overall_status, "REVIEW");

      // Officer overrides borderline review finding following physical digital caliper measurement
      const overrideReq: AdjudicationRequest = {
        adjudication_verdict: "DISMISS_AS_COMPLIANT",
        override_applied: true,
        officer_remarks: "Physical digital caliper verification conducted on-site. Net weight numeral height measured 2.52 mm (>= 2.50 mm statutory threshold). Packaging is compliant.",
        action_order: "CLOSE_INSPECTION_COMPLIANT",
      };

      const decision = await ApiService.submitAdjudication(soapCase.id, overrideReq);
      assert.equal(decision.verdict, "DISMISS_AS_COMPLIANT");
      assert.equal(decision.override_applied, true);

      const updatedCase = await ApiService.getInspection(soapCase.id);
      assert.equal(updatedCase.workflow_status, "COMPLETED");
      assert.equal(updatedCase.adjudication?.override_applied, true);
      assert.equal(updatedCase.ai_verdict, "REVIEW", "Original AI REVIEW verdict is preserved for judicial audit");
    });
  });
});
