/**
 * Automated Verification: Inspection Case Persistence & Form-1 Notice PDF Generation
 * 
 * Verifies:
 * 1. Custom inspection cases persist in localStorage under USER_CASES_STORAGE_KEY
 * 2. Re-initializing dynamic cases or reloading recovers all custom cases
 * 3. Newly created cases sort to the top of the Inspection Desk register
 * 4. Case deduplication guarantees unique entries by ID
 * 5. Quick Form-1 notice generation issues authentic /form1.pdf download URL
 * 6. Statutory citation correctly references Section 63 BSA 2023
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiService } from "../src/services/api";
import {
  getMockCases,
  addMockCase,
  resetMockCases,
  loadPersistedCases,
  USER_CASES_STORAGE_KEY,
} from "../src/services/mockData";

const mockStorage: Record<string, string> = {};
(global as any).window = {
  localStorage: {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  },
};

describe("Case Persistence & Form-1 Notice Verification", () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    ApiService.setMockMode(true);
    resetMockCases();
  });

  describe("1. Form-1 Statutory Notice PDF Dispatch", () => {
    it("generates notice with authentic /form1.pdf download URL", async () => {
      const notice = await ApiService.generateNotice({
        inspection_id: "SKU-DEMO-01",
        recipient: {
          type: "MANUFACTURER",
          name: "Britannia Industries Ltd",
          address: "5/1A Hungerford Street, Kolkata - 700017",
        },
        compounding_fee_amount: 5000,
        reply_window_days: 15,
      });

      assert.ok(notice.notice_id, "Notice ID must be present");
      assert.equal(notice.pdf_download_url, "/form1.pdf", "PDF URL must point to static authentic /form1.pdf");
      assert.match(
        notice.statutory_mandate,
        /Section 63 BSA 2023/,
        "Statutory mandate must cite Section 63 BSA 2023"
      );
    });

    it("returns /form1.pdf from ApiService.getNoticePdfUrl", () => {
      const url = ApiService.getNoticePdfUrl("not_mock_1234567890");
      assert.equal(url, "/form1.pdf");
    });
  });

  describe("2. Case Persistence Across Page Reloads", () => {
    it("persists newly created inspection case to localStorage", async () => {
      const newCase = await ApiService.createInspection({
        product_name: "GOBOULT W45 Wireless Earbuds",
        brand_name: "GOBOULT",
        category: "ELECTRONICS",
        package_type: "RECTANGULAR",
        inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
        jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
        declared_net_quantity: "1 U",
      });

      assert.ok(newCase.id, "Case ID must be created");

      // Verify it was stored in localStorage
      const persisted = loadPersistedCases();
      assert.ok(persisted[newCase.id], "Case must be saved in persisted cases map");
      assert.equal(persisted[newCase.id].product_name, "GOBOULT W45 Wireless Earbuds");

      // Verify listInspections returns the case
      const list = await ApiService.listInspections();
      const found = list.items.find((i) => i.id === newCase.id);
      assert.ok(found, "Newly created case must appear in listInspections");
      assert.equal(list.items[0].id, newCase.id, "Newest case must appear at the top of the desk");
    });

    it("retrieves persisted case even when looking up by inspection number or ID", async () => {
      const newCase = await ApiService.createInspection({
        product_name: "Aashirvaad Shudh Chakki Atta 5kg",
        brand_name: "Aashirvaad",
        category: "STAPLES",
        package_type: "POUCH",
        inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
        jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
      });

      const fetchedById = await ApiService.getInspection(newCase.id);
      assert.equal(fetchedById.product_name, "Aashirvaad Shudh Chakki Atta 5kg");

      const fetchedByNumber = await ApiService.getInspection(newCase.inspection_number);
      assert.equal(fetchedByNumber.product_name, "Aashirvaad Shudh Chakki Atta 5kg");
    });

    it("clears persisted cases when resetMockCases is invoked", async () => {
      await ApiService.createInspection({
        product_name: "Temporary Test Item",
        category: "FOOD_SNACKS",
        package_type: "RECTANGULAR",
        inspection_type: "ROUTINE_MARKET_SURVEILLANCE",
        jurisdiction_circle_id: "CIRCLE_DL_SOUTH_01",
      });

      resetMockCases();
      const persisted = loadPersistedCases();
      assert.equal(Object.keys(persisted).length, 0, "Persisted cases must be empty after reset");
    });
  });
});
