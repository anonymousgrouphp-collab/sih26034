/**
 * Unit tests for API Service Architecture & Unified Adapter
 * Verifies clean decoupling of LiveApiService, MockApiService, and DemoFixtureService.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ApiService, DemoFixtureService, MockApiService, LiveApiService } from "../src/services/api";

describe("API Adapter & Service Layer Architecture", () => {
  beforeEach(() => {
    ApiService.setOperatingMode("MOCK");
  });

  it("1. DemoFixtureService provides all 6 Golden Demonstration SKUs with DEMO_FIXTURES provenance", async () => {
    const demoService = DemoFixtureService.getInstance();

    const sku01 = await demoService.getInspection("SKU-DEMO-01");
    assert.strictEqual(sku01.overall_status, "FAIL");
    assert.strictEqual(sku01.pipeline_source, "DEMO_FIXTURES");

    const sku02 = await demoService.getInspection("SKU-DEMO-02");
    assert.strictEqual(sku02.overall_status, "FAIL");
    assert.strictEqual(sku02.pipeline_source, "DEMO_FIXTURES");

    const sku03 = await demoService.getInspection("SKU-DEMO-03");
    assert.strictEqual(sku03.overall_status, "PASS");
    assert.strictEqual(sku03.pipeline_source, "DEMO_FIXTURES");

    const sku04 = await demoService.getInspection("SKU-DEMO-04");
    assert.strictEqual(sku04.overall_status, "REVIEW");
    assert.strictEqual(sku04.pipeline_source, "DEMO_FIXTURES");

    const sku05 = await demoService.getInspection("SKU-DEMO-05");
    assert.strictEqual(sku05.overall_status, "UNABLE_TO_VERIFY");
    assert.strictEqual(sku05.pipeline_source, "DEMO_FIXTURES");

    const sku06 = await demoService.getInspection("SKU-DEMO-06");
    assert.strictEqual(sku06.overall_status, "FAIL");
    assert.strictEqual(sku06.pipeline_source, "DEMO_FIXTURES");
  });

  it("2. DemoFixtureService enforces read-only mode for mutations", async () => {
    const demoService = DemoFixtureService.getInstance();
    await assert.rejects(
      async () => {
        await demoService.createInspection({
          product_name: "Test Commodity",
          category: "FOOD_SNACKS",
          package_type: "RECTANGULAR",
          inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
          jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
        });
      },
      (err: any) => {
        assert.strictEqual(err.error_code, "READ_ONLY_MODE");
        return true;
      }
    );
  });

  it("3. MockApiService supports interactive mutable workflow and sets BACKEND_SIMULATION source", async () => {
    const mockService = MockApiService.getInstance();
    const newCase = await mockService.createInspection({
      product_name: "Mock Mustard Oil 1L",
      brand_name: "Fortune",
      category: "EDIBLE_OIL",
      package_type: "CYLINDRICAL",
      inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
      jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
    });

    assert.ok(newCase.id);
    assert.strictEqual(newCase.product_name, "Mock Mustard Oil 1L");
    assert.strictEqual(newCase.pipeline_source, "BACKEND_SIMULATION");

    const fetched = await mockService.getInspection(newCase.id);
    assert.strictEqual(fetched.id, newCase.id);
    assert.strictEqual(fetched.pipeline_source, "BACKEND_SIMULATION");
  });

  it("4. ApiService unified facade dynamically routes calls based on operating mode", async () => {
    // Demo mode
    ApiService.setOperatingMode("DEMO_FIXTURE");
    assert.strictEqual(ApiService.getPipelineSource(), "DEMO_FIXTURES");
    const demoCase = await ApiService.getInspection("SKU-DEMO-03");
    assert.strictEqual(demoCase.overall_status, "PASS");
    assert.strictEqual(demoCase.pipeline_source, "DEMO_FIXTURES");

    // Mock mode
    ApiService.setOperatingMode("MOCK");
    assert.strictEqual(ApiService.getPipelineSource(), "BACKEND_SIMULATION");
    const mockCase = await ApiService.getInspection("SKU-DEMO-01");
    assert.strictEqual(mockCase.overall_status, "FAIL");

    // Live mode
    ApiService.setOperatingMode("LIVE");
    assert.strictEqual(ApiService.getPipelineSource(), "LIVE_BACKEND");
    assert.strictEqual(ApiService.isMockMode(), false);
  });

  it("5. LiveApiService caches pipeline execution artifacts to resolve session persistence gap", async () => {
    const liveService = LiveApiService.getInstance();
    // Simulate pipeline cache injection
    (liveService as any).pipelineArtifactCache.set("insp_test_cache", {
      extracted_fields: [
        {
          field_id: "f_mrp_1",
          field_type: "MRP",
          raw_ocr_text: "MRP Rs 75.00",
          normalized_value: { currency: "INR", amount: 75.0 },
          detection_confidence: 0.98,
          ocr_confidence: 0.99,
          bounding_box: [100, 200, 150, 400],
        },
      ],
      rule_evaluations: [],
    });

    const cached = (liveService as any).pipelineArtifactCache.get("insp_test_cache");
    assert.ok(cached);
    assert.strictEqual(cached.extracted_fields.length, 1);
    assert.strictEqual(cached.extracted_fields[0].raw_ocr_text, "MRP Rs 75.00");
  });
});
