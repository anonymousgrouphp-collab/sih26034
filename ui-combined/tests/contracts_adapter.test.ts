/**
 * Contracts & API Adapter Unit Tests for NyayaDrishti-LM Member 6
 * Verifies:
 * - Golden SKU 01-06 typed contract mapping
 * - 4-State Epistemic Verdict Triage (PASS / FAIL / REVIEW / UNABLE_TO_VERIFY)
 * - Multilingual OCR & Devanagari Hindi Unicode preservation
 * - Dynamic Evidence Graph (no fixed node count)
 * - Officer Adjudication mandatory justification checks
 * - Safe client-side storage serialization
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOLDEN_SKU_CASES } from "../src/services/mockData";
import { ApiService } from "../src/services/api";
import { StorageService } from "../src/services/storage";
import { EpistemicVerdict } from "../src/types/inspection";

describe("Chunk 2: Contracts & API Adapter", () => {
  describe("1. Golden SKU Domain Model Integration", () => {
    it("adapts SKU-DEMO-01 (Biscuit Carton) with font deficit and banned unit", () => {
      const sku1 = GOLDEN_SKU_CASES["SKU-DEMO-01"];
      assert.ok(sku1, "SKU-DEMO-01 must be present");
      assert.equal(sku1.overall_status, "FAIL");
      assert.equal(sku1.category, "FOOD_SNACKS");
      assert.equal(sku1.package_type, "RECTANGULAR");
      assert.equal(sku1.principal_display_panel?.pdp_area_cm2, 144.0);

      // Verify rule findings preserve backend identifiers
      const fontEval = sku1.rule_evaluations.find((e) => e.rule_code === "RULE_06_1_H_NET_QTY_FONT");
      assert.ok(fontEval, "Font height evaluation must exist");
      assert.equal(fontEval?.status, "FAIL");
      assert.match(fontEval?.required_value || "", /2\.50 mm/);
      assert.match(fontEval?.measured_value || "", /1\.84 mm/);

      const unitEval = sku1.rule_evaluations.find((e) => e.rule_code === "SECTION_11_RULE_12_PROHIBITED_UNITS");
      assert.ok(unitEval, "Prohibited unit evaluation must exist");
      assert.equal(unitEval?.status, "FAIL");
    });

    it("adapts SKU-DEMO-02 (Curry Pouch) with USP arithmetic mismatch", () => {
      const sku2 = GOLDEN_SKU_CASES["SKU-DEMO-02"];
      assert.ok(sku2);
      assert.equal(sku2.overall_status, "FAIL");
      assert.equal(sku2.package_type, "FLEXIBLE_POUCH");

      const uspEval = sku2.rule_evaluations.find((e) => e.rule_code === "RULE_06_1_K_USP_COMPUTATION");
      assert.ok(uspEval);
      assert.equal(uspEval?.status, "FAIL");
      assert.match(uspEval?.discrepancy || "", /45\.00/);
    });

    it("adapts SKU-DEMO-03 (Bottled Water) with fully compliant PASS verdict", () => {
      const sku3 = GOLDEN_SKU_CASES["SKU-DEMO-03"];
      assert.ok(sku3);
      assert.equal(sku3.overall_status, "PASS");
      assert.equal(sku3.ai_verdict, "PASS");
      assert.equal(sku3.package_type, "CYLINDRICAL");

      for (const ev of sku3.rule_evaluations) {
        assert.equal(ev.status, "PASS");
      }
    });

    it("adapts SKU-DEMO-04 (Soap Box) with borderline REVIEW verdict", () => {
      const sku4 = GOLDEN_SKU_CASES["SKU-DEMO-04"];
      assert.ok(sku4);
      assert.equal(sku4.overall_status, "REVIEW");
      assert.equal(sku4.ai_verdict, "REVIEW");

      const fontEval = sku4.rule_evaluations[0];
      assert.equal(fontEval.status, "REVIEW");
      assert.match(fontEval.discrepancy || "", /uncertainty band/);
    });

    it("adapts SKU-DEMO-05 (Chips Pouch) with optical UNABLE_TO_VERIFY verdict", () => {
      const sku5 = GOLDEN_SKU_CASES["SKU-DEMO-05"];
      assert.ok(sku5);
      assert.equal(sku5.overall_status, "UNABLE_TO_VERIFY");
      assert.equal(sku5.ai_verdict, "UNABLE_TO_VERIFY");

      const asset = sku5.evidence_assets[0];
      assert.equal(asset.quality_gate.passed, false);
      assert.ok(asset.quality_gate.glare_percentage > 3.0);
      assert.match(asset.quality_gate.rejection_reason || "", /SPECULAR_GLARE/);
    });

    it("adapts SKU-DEMO-06 (Earbuds Listing) with missing origin declaration", () => {
      const sku6 = GOLDEN_SKU_CASES["SKU-DEMO-06"];
      assert.ok(sku6);
      assert.equal(sku6.overall_status, "FAIL");
      assert.equal(sku6.package_type, "ECOMMERCE_LISTING");

      const originEval = sku6.rule_evaluations.find((e) => e.rule_code === "RULE_06_10_ECOMM_MANDATORY_DECLARATIONS");
      assert.ok(originEval);
      assert.equal(originEval?.status, "FAIL");
    });
  });

  describe("2. Epistemic 4-State Verdict Coverage", () => {
    it("verifies all four epistemic verdict states are represented across Golden SKUs", () => {
      const verdicts: EpistemicVerdict[] = ["PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY"];
      const presentVerdicts = new Set(
        Object.values(GOLDEN_SKU_CASES).map((c) => c.overall_status)
      );

      for (const v of verdicts) {
        assert.ok(presentVerdicts.has(v), `Epistemic verdict ${v} must be represented`);
      }
    });
  });

  describe("3. Multilingual OCR & Devanagari Hindi Text Preservation", () => {
    it("preserves Devanagari script, Indic numerals, and Rupee symbol without corruption", () => {
      const sku1 = GOLDEN_SKU_CASES["SKU-DEMO-01"];
      const tokens = sku1.evidence_assets[0].ocr?.tokens || [];
      const hindiToken = tokens.find((t) => t.language === "hi");

      assert.ok(hindiToken, "Devanagari token must be present");
      assert.equal(hindiToken?.text, "शुद्ध मात्रा: २०० ग्राम");
      assert.equal(hindiToken?.model_source, "PP-OCRv3_Devanagari");

      // Verify 4-point polygon geometry integrity
      assert.equal(hindiToken?.polygon.length, 4);
      assert.deepEqual(hindiToken?.polygon[0], [200, 550]);
    });
  });

  describe("4. Dynamic Evidence Graph (Variable Node Count)", () => {
    it("supports variable node count in Merkle DAG without assuming fixed 7 nodes", () => {
      const sku1 = GOLDEN_SKU_CASES["SKU-DEMO-01"];
      const graph = sku1.evidence_graph;
      assert.ok(graph, "Evidence graph must exist");
      assert.ok(graph?.nodes.length > 0, "Nodes array must be populated");
      assert.equal(graph?.nodes.length, 4, "SKU-01 specifies 4 pipeline nodes");
      assert.equal(graph?.is_tamper_verified, true);
      assert.ok(graph?.merkle_root.length === 64, "Merkle root must be SHA-256 64-char hex");
    });
  });

  describe("5. ApiService & Human-in-the-Loop Adjudication", () => {
    it("retrieves dashboard summary in mock mode", async () => {
      ApiService.setMockMode(true);
      const summary = await ApiService.getDashboardSummary("CIRCLE_DL_SOUTH_01");
      assert.equal(summary.jurisdiction_circle, "CIRCLE_DL_SOUTH_01");
      assert.equal(summary.total_inspections, 1420);
      assert.ok(summary.compliance_rate_pct > 70);
    });

    it("filters inspection cases by status", async () => {
      ApiService.setMockMode(true);
      const failResult = await ApiService.listInspections({ status: "FAIL" });
      for (const item of failResult.items) {
        assert.equal(item.overall_status, "FAIL");
      }

      const passResult = await ApiService.listInspections({ status: "PASS" });
      assert.ok(passResult.items.length >= 1);
      for (const item of passResult.items) {
        assert.equal(item.overall_status, "PASS");
      }
      assert.ok(passResult.items.some((item) => item.id === "insp_demo_03_water"));
    });

    it("requires mandatory remarks when submitting officer adjudication", async () => {
      ApiService.setMockMode(true);
      await assert.rejects(
        async () => {
          await ApiService.submitAdjudication("insp_demo_01_biscuit", {
            adjudication_verdict: "CONFIRM_VIOLATION",
            override_applied: false,
            officer_remarks: "",
            action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
          });
        },
        (err: any) => {
          return err.error_code === "MISSING_OFFICER_REMARKS";
        }
      );
    });

    it("accepts valid officer adjudication with remarks", async () => {
      ApiService.setMockMode(true);
      const decision = await ApiService.submitAdjudication("insp_demo_01_biscuit", {
        adjudication_verdict: "CONFIRM_VIOLATION",
        override_applied: false,
        officer_remarks: "Confirmed non-compliance on Net Quantity font size and banned unit 'gms'.",
        action_order: "GENERATE_LEGAL_NOTICE_FORM_1",
      });

      assert.equal(decision.inspection_id, "insp_demo_01_biscuit");
      assert.equal(decision.verdict, "CONFIRM_VIOLATION");
      assert.match(decision.remarks, /Confirmed non-compliance/);
    });
  });

  describe("6. Safe Storage Service", () => {
    it("handles draft saving and retrieval cleanly", () => {
      // Mock basic localStorage in Node environment
      const mockStorage: Record<string, string> = {};
      (global as any).window = {
        localStorage: {
          getItem: (k: string) => mockStorage[k] || null,
          setItem: (k: string, v: string) => { mockStorage[k] = v; },
          removeItem: (k: string) => { delete mockStorage[k]; },
        },
        sessionStorage: {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
      };

      const draft = {
        product_name: "Test Almond Biscuit",
        category: "FOOD_SNACKS",
        package_type: "RECTANGULAR",
        jurisdiction_id: "CIRCLE_DL_SOUTH_01",
        saved_at: new Date().toISOString(),
      };

      const saved = StorageService.saveDraft(draft);
      assert.equal(saved, true);

      const retrieved = StorageService.getDraft();
      assert.equal(retrieved?.product_name, "Test Almond Biscuit");

      StorageService.clearDraft();
      assert.equal(StorageService.getDraft(), null);
    });

    it("recovers gracefully from corrupted storage json", () => {
      const mockStorage: Record<string, string> = {
        nyayadrishti_draft_inspection_v1: "{ corrupted: json ... }",
      };
      (global as any).window = {
        localStorage: {
          getItem: (k: string) => mockStorage[k] || null,
          setItem: (k: string, v: string) => { mockStorage[k] = v; },
          removeItem: (k: string) => { delete mockStorage[k]; },
        },
      };

      const result = StorageService.getDraft();
      assert.equal(result, null, "Corrupted JSON must return null without crashing");
    });
  });
});
