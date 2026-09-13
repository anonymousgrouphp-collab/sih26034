import { test } from "node:test";
import assert from "node:assert/strict";
import {
  JURISDICTION_CIRCLES,
  getJurisdictionCircle,
  normalizeCircleId,
  validateNewCircle,
  readCustomCircles,
  saveCustomCircles,
} from "../src/context/CircleContext";
import type { JurisdictionCircle, StorageLike } from "../src/context/CircleContext";

/**
 * Deterministic unit tests for the custom jurisdiction circle registry
 * (feedback #least-priority: ability to add new circles).
 * All storage is injected — no browser APIs, no network, no fixtures on disk.
 */

class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) as string) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
}

const existingIds = (): string[] => JURISDICTION_CIRCLES.map((c) => c.id);

test("built-in registry contains exactly the five seeded enforcement circles", () => {
  assert.equal(JURISDICTION_CIRCLES.length, 5);
  assert.equal(JURISDICTION_CIRCLES[0].id, "CIRCLE_DL_SOUTH_01");
  for (const c of JURISDICTION_CIRCLES) {
    assert.ok(c.id.length > 0 && c.label.length > 0 && c.labelHi.length > 0);
  }
});

test("normalizeCircleId trims and uppercases input", () => {
  assert.equal(normalizeCircleId("  circle_dl_west_05 "), "CIRCLE_DL_WEST_05");
});

test("validateNewCircle accepts a well-formed new circle", () => {
  const err = validateNewCircle(
    "CIRCLE_DL_WEST_05",
    "DL-WEST-05 • West Delhi Circle",
    "DL-WEST-05 • पश्चिम दिल्ली मंडल",
    existingIds()
  );
  assert.equal(err, null);
});

test("validateNewCircle rejects malformed IDs", () => {
  assert.ok(validateNewCircle("AB", "Valid Display Name", "", existingIds()));
  assert.ok(validateNewCircle("HAS SPACE_01", "Valid Display Name", "", existingIds()));
  assert.ok(validateNewCircle("LOWER-case_01", "Valid Display Name", "", existingIds()));
  assert.ok(validateNewCircle("DASH-01", "Valid Display Name", "", existingIds()));
  assert.ok(validateNewCircle("", "Valid Display Name", "", existingIds()));
  const longId = "CIRCLE_" + "A".repeat(40);
  assert.ok(validateNewCircle(longId, "Valid Display Name", "", existingIds()));
});

test("validateNewCircle rejects duplicate IDs (built-in or custom)", () => {
  assert.ok(validateNewCircle("CIRCLE_DL_SOUTH_01", "Duplicate", "", existingIds()));
  const withCustom = [...existingIds(), "CIRCLE_CUSTOM_01"];
  assert.ok(validateNewCircle("circle_custom_01", "Duplicate Custom", "", withCustom));
});

test("validateNewCircle rejects invalid display names", () => {
  assert.ok(validateNewCircle("CIRCLE_NEW_01", "ab", "", existingIds()));
  assert.ok(validateNewCircle("CIRCLE_NEW_01", "", "", existingIds()));
  assert.ok(validateNewCircle("CIRCLE_NEW_01", "x".repeat(81), "", existingIds()));
  assert.ok(validateNewCircle("CIRCLE_NEW_01", "Valid Name", "ab", existingIds()));
  assert.ok(validateNewCircle("CIRCLE_NEW_01", "Valid Name", "x".repeat(81), existingIds()));
});

test("readCustomCircles returns [] for empty / malformed / hostile storage content", () => {
  const s = new MemoryStorage();
  assert.deepEqual(readCustomCircles(s), []);
  s.setItem("nyayadrishti_custom_circles", "not-json{");
  assert.deepEqual(readCustomCircles(s), []);
  s.setItem("nyayadrishti_custom_circles", JSON.stringify({ nope: true }));
  assert.deepEqual(readCustomCircles(s), []);
  s.setItem(
    "nyayadrishti_custom_circles",
    JSON.stringify([
      { id: "CIRCLE_OK_01", label: "OK Circle" },
      { id: "", label: "Missing ID" },
      { id: "CIRCLE_NO_LABEL", label: "" },
      null,
      42,
      { id: "CIRCLE_OK_02", label: "Fallback Hi", labelHi: 7 },
    ])
  );
  const circles = readCustomCircles(s);
  assert.equal(circles.length, 2);
  assert.equal(circles[0].id, "CIRCLE_OK_01");
  assert.equal(circles[0].labelHi, "OK Circle"); // labelHi falls back to label
  assert.equal(circles[1].id, "CIRCLE_OK_02");
});

test("saveCustomCircles persists and readCustomCircles round-trips", () => {
  const s = new MemoryStorage();
  const circles: JurisdictionCircle[] = [
    { id: "CIRCLE_DL_WEST_05", label: "DL-WEST-05 • West Delhi Circle", labelHi: "DL-WEST-05 • पश्चिम दिल्ली मंडल" },
  ];
  assert.equal(saveCustomCircles(circles, s), true);
  const readBack = readCustomCircles(s);
  assert.deepEqual(readBack, circles);
});

test("getJurisdictionCircle resolves built-ins, custom extras, and unknown IDs gracefully", () => {
  assert.equal(getJurisdictionCircle("CIRCLE_KA_BLR_01").id, "CIRCLE_KA_BLR_01");
  const custom: JurisdictionCircle[] = [
    { id: "CIRCLE_DL_WEST_05", label: "DL-WEST-05 • West Delhi Circle", labelHi: "DL-WEST-05 • पश्चिम" },
  ];
  assert.equal(getJurisdictionCircle("CIRCLE_DL_WEST_05", custom).labelHi, "DL-WEST-05 • पश्चिम");
  const unknown = getJurisdictionCircle("CIRCLE_XX_99");
  assert.equal(unknown.id, "CIRCLE_XX_99");
  assert.ok(unknown.label.includes("CIRCLE_XX_99"));
  assert.equal(getJurisdictionCircle(undefined).id, "CIRCLE_DL_SOUTH_01");
});

test("storage injection keeps helpers browser-free (no global localStorage access)", () => {
  // Passing an explicit storage must not touch the environment at all.
  const s = new MemoryStorage();
  assert.deepEqual(readCustomCircles(s), []);
  assert.equal(saveCustomCircles([], s), true);
});
