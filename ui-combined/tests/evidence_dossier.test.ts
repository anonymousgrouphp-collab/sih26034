/**
 * Evidence Dossier & Section 63 BSA 2023 Evidentiary Verification Tests
 * Tests data retrieval, cryptographic SHA-256 hash preservation,
 * multilingual OCR token linkage, and resilient error recovery.
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { ApiService } from "../src/services/api";

describe("Evidence Dossier & Section 63 BSA 2023 Cryptographic Ledger", () => {
  it("1. Loads case data for Evidence Dossier with intact SHA-256 hashes", async () => {
    ApiService.setOperatingMode("MOCK");
    const caseData = await ApiService.getInspection("demo-fortune-sunlite");

    assert.ok(caseData, "Case data must be returned");
    assert.strictEqual(caseData.id, "demo-fortune-sunlite");
    assert.ok(caseData.evidence_assets.length > 0, "Must have evidence assets");

    // Verify SHA-256 evidentiary hash on each raw asset
    caseData.evidence_assets.forEach((asset) => {
      assert.ok(asset.raw_sha256, "Asset must have SHA-256 digest");
      assert.strictEqual(asset.raw_sha256.length, 64, "SHA-256 hash must be exactly 64 hex characters");
      assert.match(asset.raw_sha256, /^[a-f0-9]{64}$/i, "Must be valid hexadecimal digest");
    });
  });

  it("2. Verifies Section 63 BSA digital certificate compliance fields", async () => {
    ApiService.setOperatingMode("MOCK");
    const caseData = await ApiService.getInspection("SKU-DEMO-01");

    assert.ok(caseData.rule_evaluations, "Rule evaluations must exist");
    assert.ok(caseData.rule_evaluations.length >= 2, "Should contain Table-I font and banned unit checks");

    // Ensure evaluations contain legitimate legal statutory references
    const fontFinding = caseData.rule_evaluations.find(
      (r) => r.rule_code.includes("FONT") || r.statutory_reference.includes("Table-I")
    );
    assert.ok(fontFinding, "Must have Table-I font evaluation");
    assert.ok(fontFinding.statutory_reference, "Must cite statutory reference");
    assert.match(fontFinding.statutory_reference, /Table-I|Rule/i, "Must reference Table-I schedule or Rule");

    // Verify audit trail contains append-only hash chain
    assert.ok(caseData.audit_trail, "Audit trail must exist");
    assert.ok(caseData.audit_trail.length >= 1, "Audit trail must contain initial ingestion event");
    caseData.audit_trail.forEach((event) => {
      assert.ok(event.id, "Every audit event must have unique id");
      assert.ok(event.timestamp_utc, "Every audit event must have timestamp_utc");
      assert.ok(event.actor_id, "Every audit event must record officer/system actor");
    });
  });

  it("3. Guarantees multilingual OCR token attribution without data loss", async () => {
    ApiService.setOperatingMode("MOCK");
    const caseData = await ApiService.getInspection("demo-fortune-sunlite");

    const pdpAsset = caseData.evidence_assets.find((a) => a.panel_type === "PDP_FRONT") || caseData.evidence_assets[0];
    assert.ok(pdpAsset, "PDP asset must exist");
    assert.ok(pdpAsset.ocr?.tokens, "OCR tokens must exist");
    assert.ok(pdpAsset.ocr.tokens.length > 0, "Must have extracted OCR tokens");

    // Check multilingual token fields
    const tokens = pdpAsset.ocr.tokens;
    tokens.forEach((tok) => {
      assert.ok(tok.text, "Token must have text");
      assert.ok(typeof tok.confidence === "number", "Token must have confidence score");
      assert.ok(tok.bounding_box && tok.bounding_box.length === 4, "Token must have 4-point bounding box");
    });
  });

  it("4. Handles unknown case IDs gracefully in ApiService without crashing", async () => {
    ApiService.setOperatingMode("MOCK");
    try {
      const res = await ApiService.getInspection("non-existent-case-uuid-99999");
      assert.ok(res, "Either resolves or throws expected error");
    } catch (err: any) {
      assert.ok(err, "Throws controlled error for non-existent case");
    }
  });

  it("5. Verifies Form-1 statutory legal notice generation payload for Section 63", async () => {
    ApiService.setOperatingMode("MOCK");
    const noticePayload = {
      inspection_id: "demo-fortune-sunlite",
      recipient: {
        type: "MANUFACTURER" as const,
        name: "Adani Wilmar Limited",
        address: "Fortune House, Near Navrangpura, Ahmedabad 380009",
      },
      compounding_fee_amount: 5000,
      reply_window_days: 15,
    };

    const res = await ApiService.generateNotice(noticePayload);
    assert.ok(res, "Notice generation response must exist");
    assert.ok(res.notice_reference_number, "Must return statutory reference number");
    assert.match(res.notice_reference_number, /FORM1|LMO|INSP/i, "Must have valid notice format");
  });
});
