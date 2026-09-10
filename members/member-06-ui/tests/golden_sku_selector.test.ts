/**
 * Unit Test Suite for Golden Demonstration SKU Quick-Selector Bar & In-Workspace Switcher
 * Ported from the standalone test UI into the official React 18 SPA.
 *
 * Verifies:
 * 1. Catalog of all 6 pre-certified Golden SKUs (SKU-DEMO-01 to SKU-DEMO-06)
 * 2. 4-State Epistemic Verdict mapping (FAIL, PASS, REVIEW, UNABLE)
 * 3. Exact statutory citations and deficit summaries
 * 4. 1-Click case ID resolution to the underlying inspection cases
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { GOLDEN_SKU_ITEMS } from "../src/features/desk/GoldenSkuQuickSelector";
import { ApiService } from "../src/services/api";

describe("Golden Demonstration SKU Quick-Selector Integration", () => {
  it("1. Catalog contains exactly 6 frozen demonstration SKUs", () => {
    assert.strictEqual(GOLDEN_SKU_ITEMS.length, 6, "Must define exactly 6 pre-certified SKUs");
    const skuIds = GOLDEN_SKU_ITEMS.map((item) => item.skuId);
    assert.deepStrictEqual(skuIds, [
      "SKU-DEMO-01",
      "SKU-DEMO-02",
      "SKU-DEMO-03",
      "SKU-DEMO-04",
      "SKU-DEMO-05",
      "SKU-DEMO-06",
    ]);
  });

  it("2. Epistemic verdicts strictly cover all 4 statutory states", () => {
    const verdicts = new Set(GOLDEN_SKU_ITEMS.map((item) => item.verdict));
    assert.ok(verdicts.has("FAIL"), "Must include FAIL scenario");
    assert.ok(verdicts.has("PASS"), "Must include PASS scenario");
    assert.ok(verdicts.has("REVIEW"), "Must include REVIEW scenario");
    assert.ok(verdicts.has("UNABLE"), "Must include UNABLE scenario");
  });

  it("3. SKU-DEMO-01 verifies Table-I font deficit and banned 'gms' unit", () => {
    const sku1 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-01")!;
    assert.strictEqual(sku1.name, "Butter Cookies 200g");
    assert.strictEqual(sku1.verdict, "FAIL");
    assert.ok(sku1.description.includes("Font deficit"));
    assert.ok(sku1.description.includes("gms"));
    assert.ok(sku1.ruleCitation.includes("Table-I"));
  });

  it("4. SKU-DEMO-02 verifies Unit Sale Price (USP) mismatch", () => {
    const sku2 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-02")!;
    assert.strictEqual(sku2.name, "Ready Curry Pouch 300g");
    assert.strictEqual(sku2.verdict, "FAIL");
    assert.ok(sku2.description.includes("USP Mismatch"));
  });

  it("5. SKU-DEMO-03 verifies 100% compliant statutory product", () => {
    const sku3 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-03")!;
    assert.strictEqual(sku3.name, "Packaged Water 1000ml");
    assert.strictEqual(sku3.verdict, "PASS");
    assert.ok(sku3.description.includes("Statutory Compliant"));
  });

  it("6. SKU-DEMO-04 verifies sensor uncertainty band (k=2) review", () => {
    const sku4 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-04")!;
    assert.strictEqual(sku4.name, "Herbal Soap 125g");
    assert.strictEqual(sku4.verdict, "REVIEW");
    assert.ok(sku4.description.includes("k=2"));
  });

  it("7. SKU-DEMO-05 verifies optical specular glare bloom rejection", () => {
    const sku5 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-05")!;
    assert.strictEqual(sku5.name, "Potato Chips 75g");
    assert.strictEqual(sku5.verdict, "UNABLE");
    assert.ok(sku5.description.includes("Glare"));
  });

  it("8. SKU-DEMO-06 verifies E-Commerce Rule 6(10) missing origin violation", () => {
    const sku6 = GOLDEN_SKU_ITEMS.find((s) => s.skuId === "SKU-DEMO-06")!;
    assert.strictEqual(sku6.name, "E-Commerce Tea 500g");
    assert.strictEqual(sku6.verdict, "FAIL");
    assert.ok(sku6.description.includes("Country of Origin"));
  });

  it("9. Every quick-selector caseId maps directly to an inspectable case in ApiService", async () => {
    for (const item of GOLDEN_SKU_ITEMS) {
      const caseRecord = await ApiService.getInspection(item.caseId);
      assert.ok(caseRecord, `Case record for ${item.skuId} must be retrievable`);
      assert.strictEqual(caseRecord.sku_demo_id, item.skuId);
      if (item.verdict === "UNABLE") {
        assert.strictEqual(caseRecord.overall_status, "UNABLE_TO_VERIFY");
      } else {
        assert.strictEqual(caseRecord.overall_status, item.verdict);
      }
    }
  });
});
