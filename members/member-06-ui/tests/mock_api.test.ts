/**
 * Component Mock Tests for Member 6 Frontend (SIH26034)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MockApiService } from "../src/mock_api";

describe("MockApiService", () => {
  it("returns realistic dashboard KPI summary", async () => {
    const summary = await MockApiService.getDashboardSummary();
    assert.equal(summary.total_inspections, 1420);
    assert.ok(summary.compliance_rate_pct > 70);
  });

  it("throws error when officer remarks are missing on adjudication", async () => {
    await assert.rejects(
      async () => {
        await MockApiService.submitAdjudication("insp_01", "CONFIRM_VIOLATION", "", "pin_hash");
      },
      /Mandatory officer justification remarks required/
    );
  });
});
