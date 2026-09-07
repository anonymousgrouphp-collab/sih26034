/**
 * Component Mock Tests for Member 6 Frontend (SIH26034)
 */

import { MockApiService } from "../src/mock_api";

describe("MockApiService", () => {
  it("returns realistic dashboard KPI summary", async () => {
    const summary = await MockApiService.getDashboardSummary();
    expect(summary.total_inspections).toBe(1420);
    expect(summary.compliance_rate_pct).toBeGreaterThan(70);
  });

  it("throws error when officer remarks are missing on adjudication", async () => {
    await expect(
      MockApiService.submitAdjudication("insp_01", "CONFIRM_VIOLATION", "", "pin_hash")
    ).rejects.toThrow("Mandatory officer justification remarks required");
  });
});
