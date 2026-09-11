/**
 * Chunk 3 Test Suite: Inspection Desk & New Case Registration Flow
 * 
 * Verifies:
 * 1. Inspection Desk case listing, search, and filtering
 * 2. Strict separation of Workflow Status vs Epistemic Compliance Verdict
 * 3. Case registration input validation (Rule 6(1)(a) required fields)
 * 4. Dynamic case creation without fabricated verdicts or optical math
 * 5. Golden Demo SKU integration in Desk register
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiService } from "../src/services/api";
import { resetMockCases } from "../src/services/mockData";
import { CreateInspectionPayload } from "../src/types/inspection";

describe("Chunk 3: Inspection Desk & Case Registration", () => {
  beforeEach(() => {
    ApiService.setMockMode(true);
    resetMockCases();
  });

  describe("1. Inspection Desk Query & Filter Integration", () => {
    it("retrieves the initial case register with all Golden Demo SKUs", async () => {
      const res = await ApiService.listInspections();
      assert.ok(res.total >= 6, "Must contain at least the 6 Golden SKU cases");
      assert.equal(res.items.length, res.total);

      const biscuit = res.items.find((i) => i.product_name.includes("Butter Cookies"));
      assert.ok(biscuit, "Biscuit carton must be in desk list");
      assert.equal(biscuit?.overall_status, "FAIL");
      assert.equal(biscuit?.workflow_status, "COMPLETED");

      const water = res.items.find((i) => i.product_name.includes("Mineral Water"));
      assert.ok(water, "Water bottle must be in desk list");
      assert.equal(water?.overall_status, "PASS");
      assert.equal(water?.workflow_status, "COMPLETED");
    });

    it("filters cases by workflow status correctly", async () => {
      const completedRes = await ApiService.listInspections({ workflowStatus: "COMPLETED" });
      assert.ok(completedRes.items.length > 0);
      for (const item of completedRes.items) {
        assert.equal(item.workflow_status, "COMPLETED");
      }

      const pendingRes = await ApiService.listInspections({ workflowStatus: "PENDING_REVIEW" });
      for (const item of pendingRes.items) {
        assert.equal(item.workflow_status, "PENDING_REVIEW");
      }
    });

    it("filters cases by epistemic compliance verdict", async () => {
      const failRes = await ApiService.listInspections({ status: "FAIL" });
      assert.ok(failRes.items.length >= 3, "At least SKU-01, SKU-02, SKU-06 have FAIL verdict");
      for (const item of failRes.items) {
        assert.equal(item.overall_status, "FAIL");
      }

      const reviewRes = await ApiService.listInspections({ status: "REVIEW" });
      assert.ok(reviewRes.items.length >= 1, "SKU-04 has REVIEW verdict");
      assert.equal(reviewRes.items[0].overall_status, "REVIEW");

      const unableRes = await ApiService.listInspections({ status: "UNABLE_TO_VERIFY" });
      assert.ok(unableRes.items.length >= 1, "SKU-05 has UNABLE_TO_VERIFY verdict");
      assert.equal(unableRes.items[0].overall_status, "UNABLE_TO_VERIFY");
    });

    it("searches cases by commodity name, brand, establishment, or inspection number", async () => {
      // Search by brand
      const brandRes = await ApiService.listInspections({ search: "Sunfeast" });
      assert.equal(brandRes.items.length, 1);
      assert.equal(brandRes.items[0].brand_name, "Sunfeast Bakery");

      // Search by establishment
      const estRes = await ApiService.listInspections({ search: "Kalkaji" });
      assert.ok(estRes.items.length >= 1);

      // Search by inspection number
      const numRes = await ApiService.listInspections({ search: "INSP-20260910-W001" });
      assert.equal(numRes.items.length, 1);
      assert.equal(numRes.items[0].product_name, "Natural Mineral Water 1L");
    });
  });

  describe("2. Workflow Status vs Statutory Verdict Separation", () => {
    it("distinguishes operational workflow states from legal verdicts", async () => {
      const res = await ApiService.listInspections();
      
      // Check SKU-05 (Chips Pouch with glare bloom)
      const chips = res.items.find((i) => i.id === "insp_demo_05_chips");
      assert.ok(chips);
      assert.equal(chips?.workflow_status, "OPEN", "Workflow status is OPEN");
      assert.equal(chips?.overall_status, "UNABLE_TO_VERIFY", "Compliance verdict is UNABLE_TO_VERIFY");

      // Check SKU-04 (Soap with borderline font height)
      const soap = res.items.find((i) => i.id === "insp_demo_04_soap");
      assert.ok(soap);
      assert.equal(soap?.workflow_status, "PENDING_REVIEW", "Workflow status is PENDING_REVIEW");
      assert.equal(soap?.overall_status, "REVIEW", "Compliance verdict is REVIEW");
    });
  });

  describe("3. New Case Registration & Validation", () => {
    it("rejects registration when commodity product name is missing or empty", async () => {
      const invalidPayloads: CreateInspectionPayload[] = [
        {
          product_name: "",
          category: "FOOD_SNACKS",
          package_type: "RECTANGULAR",
          inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
          jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
        },
        {
          product_name: "   ",
          category: "FOOD_SNACKS",
          package_type: "RECTANGULAR",
          inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
          jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
        },
      ];

      for (const payload of invalidPayloads) {
        await assert.rejects(
          async () => {
            await ApiService.createInspection(payload);
          },
          (err: any) => {
            assert.equal(err.error_code, "VALIDATION_ERROR");
            assert.equal(err.status, 400);
            assert.match(err.message, /Commodity \/ product name is required/i);
            return true;
          }
        );
      }
    });

    it("registers a valid inspection case with initial DRAFT status and NO fabricated verdict", async () => {
      const payload: CreateInspectionPayload = {
        product_name: "Refined Mustard Oil 1L",
        brand_name: "Kisan Shudh",
        manufacturer_name: "Kisan Agrotech Ltd",
        establishment_name: "Verma Provision Store",
        premises_address: "Shop 7, Main Bazaar, Govindpuri, New Delhi 110019",
        category: "COMMODITY_GOODS",
        package_type: "CYLINDRICAL",
        inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
        jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
        declared_net_quantity: "1 L",
        notes: "Sample drawn from retail shelf for routine surveillance.",
      };

      const newCase = await ApiService.createInspection(payload);

      // Verify case attributes
      assert.ok(newCase.id.startsWith("insp_"));
      assert.match(newCase.inspection_number, /^INSP-\d{8}-\d{4}$/);
      assert.equal(newCase.product_name, "Refined Mustard Oil 1L");
      assert.equal(newCase.brand_name, "Kisan Shudh");
      assert.equal(newCase.establishment_name, "Verma Provision Store");
      assert.equal(newCase.premises_address, "Shop 7, Main Bazaar, Govindpuri, New Delhi 110019");
      assert.equal(newCase.package_type, "CYLINDRICAL");

      // Critical Rule: Initial state must NOT fabricate an AI verdict or mathematical findings
      assert.equal(newCase.workflow_status, "DRAFT");
      assert.equal(newCase.overall_status, "PENDING_REVIEW");
      assert.equal(newCase.ai_verdict, "PENDING");
      assert.equal(newCase.evidence_assets.length, 0, "No evidence assets initially");
      assert.equal(newCase.extracted_fields.length, 0, "No OCR fields initially");
      assert.equal(newCase.rule_evaluations.length, 0, "No rule findings initially");

      // Verify the new case now appears in the Desk list query
      const deskList = await ApiService.listInspections();
      const registeredItem = deskList.items.find((i) => i.id === newCase.id);
      assert.ok(registeredItem, "Newly created case must appear in Desk list");
      assert.equal(registeredItem?.workflow_status, "DRAFT");
      assert.equal(registeredItem?.product_name, "Refined Mustard Oil 1L");
    });
  });

  describe("4. Demonstration SKU Boundaries & E-Commerce Scope Guard", () => {
    it("includes SKU-DEMO-06 as a demo item in the register without activating separate e-comm subsystem", async () => {
      const res = await ApiService.listInspections({ search: "Earbuds" });
      assert.equal(res.items.length, 1);
      const earbuds = res.items[0];
      assert.equal(earbuds.package_type, "ECOMMERCE_LISTING");
      assert.equal(earbuds.overall_status, "FAIL");
      assert.equal(earbuds.is_mock_fixture, true);

      // Verify it retrieves as a standard inspection case without breaking monolith contracts
      const fullCase = await ApiService.getInspection(earbuds.id);
      assert.equal(fullCase.id, "insp_demo_06_earbuds");
      assert.equal(fullCase.category, "ELECTRONICS_COMMODITY");
    });
  });
});
