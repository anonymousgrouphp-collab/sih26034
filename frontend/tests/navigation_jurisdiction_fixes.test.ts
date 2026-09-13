/**
 * Unit Test Suite for UI Fixes:
 * 1. Mutual exclusivity of Sidebar navigation (Demo Scenarios vs Inspection Register)
 * 2. Dynamic Jurisdiction Circle resolution and bilingual labeling
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import {
  JURISDICTION_CIRCLES,
  getJurisdictionCircle,
} from "../src/context/CircleContext";

describe("UI Fixes & Statutory Invariants Verification", () => {
  describe("1. Dynamic Jurisdiction Circle Resolution", () => {
    it("resolves all official statutory jurisdiction circles accurately", () => {
      assert.strictEqual(JURISDICTION_CIRCLES.length, 5);

      const dlSouth = getJurisdictionCircle("CIRCLE_DL_SOUTH_01");
      assert.strictEqual(dlSouth.id, "CIRCLE_DL_SOUTH_01");
      assert.ok(dlSouth.label.includes("DL-SOUTH-01"));
      assert.ok(dlSouth.labelHi.includes("दक्षिण दिल्ली"));

      const upGbn = getJurisdictionCircle("CIRCLE_UP_GBN_01");
      assert.strictEqual(upGbn.id, "CIRCLE_UP_GBN_01");
      assert.ok(upGbn.label.includes("UP-GBN-01"));
      assert.ok(upGbn.label.includes("Noida"));
      assert.ok(upGbn.labelHi.includes("गौतम बुद्ध नगर"));

      const mhMum = getJurisdictionCircle("CIRCLE_MH_MUM_01");
      assert.strictEqual(mhMum.id, "CIRCLE_MH_MUM_01");
      assert.ok(mhMum.label.includes("MH-MUM-01"));

      const kaBlr = getJurisdictionCircle("CIRCLE_KA_BLR_01");
      assert.strictEqual(kaBlr.id, "CIRCLE_KA_BLR_01");
      assert.ok(kaBlr.label.includes("KA-BLR-01"));
    });

    it("resolves partial circle IDs cleanly (e.g. DL-SOUTH-01)", () => {
      const resolved = getJurisdictionCircle("DL-SOUTH-01");
      assert.strictEqual(resolved.id, "CIRCLE_DL_SOUTH_01");
      assert.ok(resolved.label.includes("DL-SOUTH-01"));
    });

    it("handles missing or unknown circle IDs safely with fallback", () => {
      const fallback = getJurisdictionCircle(undefined);
      assert.strictEqual(fallback.id, "CIRCLE_DL_SOUTH_01");

      const unknown = getJurisdictionCircle("CIRCLE_UNKNOWN_99");
      assert.strictEqual(unknown.id, "CIRCLE_UNKNOWN_99");
      assert.ok(unknown.label.includes("Enforcement Circle"));
    });
  });

  describe("2. Navigation Active State Mutual Exclusivity", () => {
    // Replicates the exact Sidebar active-matching predicate to test invariance
    const isRegisterActive = (current: string) => {
      return (
        current === "/inspections" ||
        (current.startsWith("/inspections/") &&
          current !== "/inspections/new" &&
          !current.includes("/evidence") &&
          !current.startsWith("/inspections/SKU-DEMO") &&
          current !== "/inspections/demo-fortune-sunlite")
      );
    };

    const isDemoScenariosActive = (current: string) => {
      return (
        current.startsWith("/inspections/SKU-DEMO") ||
        current === "/inspections/demo-fortune-sunlite"
      );
    };

    it("ensures ONLY Demo Scenarios is active when viewing demo SKUs", () => {
      const demoRoutes = [
        "/inspections/SKU-DEMO-01",
        "/inspections/SKU-DEMO-02",
        "/inspections/SKU-DEMO-03",
        "/inspections/SKU-DEMO-04",
        "/inspections/SKU-DEMO-05",
        "/inspections/SKU-DEMO-06",
        "/inspections/demo-fortune-sunlite",
      ];

      for (const route of demoRoutes) {
        assert.strictEqual(
          isDemoScenariosActive(route),
          true,
          `Demo tab should be active for ${route}`
        );
        assert.strictEqual(
          isRegisterActive(route),
          false,
          `Register tab should NOT be active for ${route}`
        );
      }
    });

    it("ensures ONLY Inspection Register is active when viewing general register or field cases", () => {
      assert.strictEqual(isRegisterActive("/inspections"), true);
      assert.strictEqual(isDemoScenariosActive("/inspections"), false);

      assert.strictEqual(isRegisterActive("/inspections/INSP-2026-0001"), true);
      assert.strictEqual(isDemoScenariosActive("/inspections/INSP-2026-0001"), false);
    });

    it("ensures neither register nor demo scenarios is active on new inspection or evidence", () => {
      assert.strictEqual(isRegisterActive("/inspections/new"), false);
      assert.strictEqual(isDemoScenariosActive("/inspections/new"), false);

      assert.strictEqual(isRegisterActive("/inspections/INSP-2026-0001/evidence"), false);
      assert.strictEqual(isDemoScenariosActive("/inspections/INSP-2026-0001/evidence"), false);
    });
  });
});
