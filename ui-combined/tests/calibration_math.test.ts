/**
 * Unit Test Suite: Metric Calibration Traceability & Math Schedule
 * 
 * Verifies:
 * 1. Step-by-step formula block in AnalysisHUD:
 *    scale = reference length (mm) / measured ArUco marker edge (px)
 *    scale = 50.00 / 800 = 0.0625 mm/px
 *    Estimated uncertainty (k=2, 95% CI): ±0.04 mm
 * 2. Step-by-step formula block in AdjudicationCanvas
 * 3. Optical quality gate coupling: UNABLE_TO_VERIFY optical rejection aborts calibration math
 * 4. Table-I statutory numeral schedule integration (ADR-06)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AnalysisHUD } from "../src/features/case/AnalysisHUD";
import { AdjudicationCanvas } from "../src/features/adjudication/AdjudicationCanvas";
import { GOLDEN_SKU_CASES } from "../src/services/mockData";

describe("Mathematical Traceability in Metric Calibration", () => {
  it("1. renders explicit formula block in AnalysisHUD for calibrated SKU", () => {
    const sku01 = GOLDEN_SKU_CASES["SKU-DEMO-01"];
    assert.ok(sku01, "SKU-DEMO-01 must exist");
    assert.ok(sku01.evidence_assets[0]?.calibration?.is_calibrated, "SKU-DEMO-01 must be calibrated");

    const html = renderToStaticMarkup(
      React.createElement(AnalysisHUD, {
        caseData: sku01,
        activeAsset: sku01.evidence_assets[0],
        onExecutePipeline: () => {},
        onRetakeEvidence: () => {},
      })
    );

    assert.ok(
      html.includes("scale = reference length (mm) / measured ArUco marker edge (px)"),
      "Must render scale definition formula"
    );
    assert.ok(
      html.includes("scale = 50.00 / 800 = 0.0625 mm/px"),
      "Must render concrete calibrated values"
    );
    assert.ok(
      html.includes("Estimated uncertainty (k=2, 95% CI): ±0.04 mm"),
      "Must render k=2 uncertainty bound"
    );
    assert.ok(
      html.includes("Calibration Math &amp; Optical Traceability") || html.includes("Calibration Math & Optical Traceability"),
      "Must render section title"
    );
  });

  it("2. renders explicit formula block in AdjudicationCanvas for calibrated SKU", () => {
    const sku03 = GOLDEN_SKU_CASES["SKU-DEMO-03"];
    assert.ok(sku03, "SKU-DEMO-03 must exist");

    const html = renderToStaticMarkup(
      React.createElement(AdjudicationCanvas, {
        caseData: sku03,
        onAdjudicationSubmitted: async () => {},
      })
    );

    assert.ok(
      html.includes("scale = reference length (mm) / measured ArUco marker edge (px)"),
      "AdjudicationCanvas must render scale definition formula"
    );
    assert.ok(
      html.includes("scale = 50.00 / 800 = 0.0625 mm/px"),
      "AdjudicationCanvas must render concrete calibrated values"
    );
    assert.ok(
      html.includes("Estimated uncertainty (k=2, 95% CI): ±0.04 mm"),
      "AdjudicationCanvas must render k=2 uncertainty bound"
    );
    assert.ok(
      html.includes("Metric Calibration Traceability (ADR-06 &amp; Table-I Schedule)") ||
      html.includes("Metric Calibration Traceability (ADR-06 & Table-I Schedule)"),
      "Must cite Table-I and ADR-06"
    );
  });

  it("3. optical quality gate rejection (SKU-DEMO-05) halts calibration without fabricated scale math", () => {
    const sku05 = GOLDEN_SKU_CASES["SKU-DEMO-05"];
    assert.ok(sku05, "SKU-DEMO-05 must exist");
    assert.equal(sku05.overall_status, "UNABLE_TO_VERIFY");

    const html = renderToStaticMarkup(
      React.createElement(AnalysisHUD, {
        caseData: sku05,
        activeAsset: sku05.evidence_assets[0],
        onExecutePipeline: () => {},
        onRetakeEvidence: () => {},
      })
    );

    assert.ok(
      html.includes("Calibration aborted due to optical quality rejection"),
      "Must clearly declare calibration aborted"
    );
    assert.ok(
      !html.includes("scale = 50.00 / 800 = 0.0625 mm/px"),
      "Must NEVER fabricate calibration scale math when optical quality gate failed"
    );
  });

  it("4. Table-I schedule font height baseline matches statutory boundaries", () => {
    const sku01 = GOLDEN_SKU_CASES["SKU-DEMO-01"];
    const pdpArea = sku01.principal_display_panel?.pdp_area_cm2 || 0;
    assert.ok(pdpArea > 100 && pdpArea <= 500, "SKU-01 area 144 cm2 falls in Table-I 100-500 cm2 bracket");

    // Table-I minimum required font height for 100-500 cm2 is 2.5 mm
    const fontFinding = sku01.rule_evaluations.find((f) => f.rule_code.includes("FONT"));
    assert.ok(fontFinding, "Must have font height evaluation");
    assert.ok(fontFinding.required_value.includes("2.50 mm"), "Required font height must be 2.50 mm");
  });
});
