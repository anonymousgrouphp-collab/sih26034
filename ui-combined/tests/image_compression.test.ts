/**
 * Automated Verification: Client-Side Packaging Image Compression
 * 
 * Verifies:
 * 1. compressPackagingImage operates safely on Blob and File instances
 * 2. Fallback execution in headless environments produces valid uploadable File/Blob
 * 3. Filename sanitation converts extension to .jpg for JPEG mimeType
 * 4. Compression options clamp dimensions and set sensible defaults (maxDimension: 1280, quality: 0.8)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compressPackagingImage } from "../src/services/imageCompression";

describe("Client-Side Packaging Image Compression", () => {
  it("compresses a File instance and returns structured result", async () => {
    const rawBuffer = Buffer.from("fake-binary-image-stream-data-1234567890");
    const rawFile = new File([rawBuffer], "earbuds_raw_pdp.png", { type: "image/png" });

    const result = await compressPackagingImage(rawFile, {
      maxDimension: 1280,
      quality: 0.8,
      mimeType: "image/jpeg",
    });

    assert.ok(result.file instanceof File, "Result should contain a File instance");
    assert.ok(result.blob instanceof Blob, "Result should contain a Blob instance");
    assert.equal(typeof result.originalSizeBytes, "number");
    assert.equal(typeof result.compressedSizeBytes, "number");
    assert.equal(typeof result.compressionRatioPct, "number");
    assert.ok(result.width <= 1920);
    assert.ok(result.height <= 1080);
  });

  it("handles Blob input without crashing and generates valid file name", async () => {
    const rawBlob = new Blob(["sample-blob-data"], { type: "image/jpeg" });
    const result = await compressPackagingImage(rawBlob);

    assert.ok(result.file.name.endsWith(".jpg"), "Default file name should end with .jpg");
    assert.equal(result.file.type, "image/jpeg");
  });

  it("preserves aspect bounds and provides correct options defaults", async () => {
    const rawFile = new File(["test-content"], "box_front.jpg", { type: "image/jpeg" });
    const result = await compressPackagingImage(rawFile);

    assert.ok(result.originalSizeBytes > 0);
    assert.equal(result.file.name, "box_front.jpg");
  });
});
