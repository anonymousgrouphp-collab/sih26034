/**
 * Case Deletion & Evidentiary Disposal Test Suite
 * 
 * Verifies:
 * 1. Permanent case deletion from Inspection Desk and Case Register.
 * 2. Purging of all case aliases (case ID, inspection number, SKU identifier).
 * 3. Retrieval rejection: ApiService.getInspection() returns 404 / CASE_DISPOSED.
 * 4. Tombstone persistence: deleted cases never resurface or resurrect upon listing.
 * 5. Dynamic case creation followed by disposal verifies clean zero-dangling state.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ApiService } from "../src/services/api";
import { resetMockCases, isCaseDeleted } from "../src/services/mockData";
import { CreateInspectionPayload } from "../src/types/inspection";

describe("Case Deletion & Evidentiary Disposal", () => {
  beforeEach(() => {
    ApiService.setMockMode(true);
    resetMockCases();
  });

  it("1. permanently deletes an existing case and removes it from listInspections", async () => {
    const initialList = await ApiService.listInspections();
    assert.ok(initialList.items.length > 0, "Initial case list must not be empty");

    const target = initialList.items[0];
    const targetId = target.id;
    const targetNumber = target.inspection_number;

    // Execute disposal & deletion
    const delResult = await ApiService.deleteInspection(targetId);
    assert.equal(delResult.success, true);

    // Verify it is recorded in deleted set
    assert.ok(isCaseDeleted(targetId, targetNumber), "Case must be marked as deleted");

    // Verify listInspections does not contain target
    const updatedList = await ApiService.listInspections();
    const stillPresent = updatedList.items.some(
      (item) => item.id === targetId || item.inspection_number === targetNumber
    );
    assert.equal(stillPresent, false, "Deleted case must not appear in case register");
    assert.equal(updatedList.total, initialList.total - 1);
  });

  it("2. getInspection() rejects deleted case with 404 / CASE_DISPOSED", async () => {
    const list = await ApiService.listInspections();
    const target = list.items[0];

    await ApiService.deleteInspection(target.id);

    // Subsequent retrieval must reject
    await assert.rejects(
      async () => {
        await ApiService.getInspection(target.id);
      },
      (err: any) => {
        return err.status === 404 || err.error_code === "CASE_DISPOSED";
      }
    );
  });

  it("3. creates a new custom inspection and verifies clean disposal lifecycle", async () => {
    const payload: CreateInspectionPayload = {
      product_name: "Fresh Himalayan Mineral Salt 500g",
      brand_name: "PureHimalaya",
      category: "FOOD_SPICES",
      package_type: "FLEXIBLE_POUCH",
      declared_net_quantity: "500 g",
      jurisdiction_id: "CIRCLE_DL_SOUTH_01",
    };

    const created = await ApiService.createInspection(payload);
    assert.ok(created.id, "Case ID must be generated");
    assert.ok(created.inspection_number, "Inspection number must be assigned");

    // Verify it appears in the desk register
    let deskList = await ApiService.listInspections();
    assert.ok(
      deskList.items.some((i) => i.id === created.id || i.inspection_number === created.inspection_number),
      "Newly registered case must appear in desk register"
    );

    // Now delete it
    const delRes = await ApiService.deleteInspection(created.id);
    assert.equal(delRes.success, true);

    // Verify it vanished from desk register
    deskList = await ApiService.listInspections();
    assert.equal(
      deskList.items.some((i) => i.id === created.id || i.inspection_number === created.inspection_number),
      false,
      "Deleted custom case must not linger in desk register"
    );

    // Verify retrieval fails
    await assert.rejects(async () => {
      await ApiService.getInspection(created.id);
    });
  });

  it("4. deleting by inspection_number purges the UUID as well", async () => {
    const list = await ApiService.listInspections();
    const target = list.items[0];

    // Delete using inspection_number instead of UUID
    await ApiService.deleteInspection(target.inspection_number);

    // Both ID and inspection_number must be tombstoned
    assert.ok(isCaseDeleted(target.id), "UUID must be tombstoned");
    assert.ok(isCaseDeleted(undefined, target.inspection_number), "Inspection number must be tombstoned");

    const updatedList = await ApiService.listInspections();
    assert.equal(
      updatedList.items.some((i) => i.id === target.id || i.inspection_number === target.inspection_number),
      false
    );
  });
});
