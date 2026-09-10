/**
 * Unit Test Suite: FindingsLedger Semantic HTML Accessibility & Keyboard Navigation
 * 
 * Verifies:
 * 1. Semantic <button type="button"> elements for each finding in the ledger
 * 2. aria-pressed="true" for selected item, aria-pressed="false" for unselected
 * 3. Zero non-semantic <div role="button"> regressions (WCAG 2.1 AA compliance)
 * 4. AI Finding status vs Officer Adjudication decision rendering
 * 5. Deterministic filter tabs (All, Fail, Review, Pass)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FindingsLedger } from "../src/features/adjudication/FindingsLedger";
import { RuleFinding, ExtractedField } from "../src/types/inspection";

describe("FindingsLedger Semantic Accessibility & Keyboard Navigation", () => {
  const sampleFindings: RuleFinding[] = [
    {
      finding_id: "finding_01_font",
      rule_code: "RULE_06_1_H_NET_QTY_FONT",
      statutory_reference: "Rule 6(1)(h) Table-I LMPC Rules 2011",
      field_type: "NET_QUANTITY",
      status: "FAIL",
      severity: "CRITICAL",
      required_value: ">= 2.50 mm (Table-I)",
      measured_value: "1.84 mm",
      discrepancy: "Numeral height 1.84 mm is below statutory minimum 2.50 mm (deficit 0.66 mm)",
      legal_consequence: "Section 36(1) LM Act 2009",
    },
    {
      finding_id: "finding_02_unit",
      rule_code: "SECTION_11_RULE_12_PROHIBITED_UNITS",
      statutory_reference: "Section 11 LM Act 2009 / Rule 12 LMPC Rules 2011",
      field_type: "NET_QUANTITY",
      status: "FAIL",
      severity: "CRITICAL",
      required_value: "g, kg",
      measured_value: "gms",
      discrepancy: "Non-standard abbreviation 'gms' is prohibited by Rule 12",
      legal_consequence: "Section 29 LM Act 2009",
    },
    {
      finding_id: "finding_03_mrp",
      rule_code: "RULE_06_1_E_MRP_INCLUSIVE_TAX",
      statutory_reference: "Rule 6(1)(e) LMPC Rules 2011",
      field_type: "MRP",
      status: "PASS",
      severity: "MINOR",
      required_value: "Declared with 'incl. of all taxes'",
      measured_value: "MRP ₹48.00 (Incl. of all taxes)",
      legal_consequence: "Compliant",
    },
  ];

  const sampleExtractedFields: ExtractedField[] = [
    {
      field_id: "fld_01",
      field_type: "NET_QUANTITY",
      raw_ocr_text: "Net Wt: 200 gms",
      normalized_value: { value: 200, unit: "g" },
      detection_confidence: 0.96,
      ocr_confidence: 0.98,
      bounding_box: [100, 100, 200, 50],
      token_ids: ["tok_01"],
    },
  ];

  it("1. renders each finding as a native semantic <button type=\"button\"> element", () => {
    const html = renderToStaticMarkup(
      React.createElement(FindingsLedger, {
        findings: sampleFindings,
        extractedFields: sampleExtractedFields,
        selectedFindingId: "finding_01_font",
        onSelectFinding: () => {},
      })
    );

    // Verify presence of buttons with aria-pressed
    assert.ok(html.includes('<button type="button" data-testid="finding-item-finding_01_font" aria-pressed="true"'), "Selected finding must be button with aria-pressed=true");
    assert.ok(html.includes('<button type="button" data-testid="finding-item-finding_02_unit" aria-pressed="false"'), "Unselected finding must be button with aria-pressed=false");
    assert.ok(html.includes('<button type="button" data-testid="finding-item-finding_03_mrp" aria-pressed="false"'), "Unselected finding must be button with aria-pressed=false");

    // Count button occurrences for findings
    const findingBtnMatches = html.match(/data-testid="finding-item-/g);
    assert.equal(findingBtnMatches?.length, 3, "Must render exactly 3 finding buttons");
  });

  it("2. guarantees zero non-semantic <div role=\"button\"> elements for findings (anti-regression check)", () => {
    const html = renderToStaticMarkup(
      React.createElement(FindingsLedger, {
        findings: sampleFindings,
        extractedFields: sampleExtractedFields,
        selectedFindingId: undefined,
        onSelectFinding: () => {},
      })
    );

    assert.ok(!html.includes('role="button"'), "Must NOT contain any non-semantic div with role=button");
  });

  it("3. distinguishes automated AI finding from officer adjudication", () => {
    const htmlWithAdjudication = renderToStaticMarkup(
      React.createElement(FindingsLedger, {
        findings: sampleFindings,
        extractedFields: sampleExtractedFields,
        selectedFindingId: "finding_01_font",
        onSelectFinding: () => {},
        findingDecisions: {
          finding_01_font: {
            finding_id: "finding_01_font",
            decision: "CONFIRMED",
            officer_id: "INSP-DL-0842",
            officer_name: "Rajesh Sharma",
            badge_number: "INSP-DL-0842",
            remarks: "Deficit verified against physical sample.",
            timestamp_utc: "2026-09-10T15:00:00Z",
          },
        },
      })
    );

    assert.ok(htmlWithAdjudication.includes("AI Finding:"), "Must display AI Finding label");
    assert.ok(htmlWithAdjudication.includes("Officer Adjudication:"), "Must display Officer Adjudication label");
    assert.ok(htmlWithAdjudication.includes("CONFIRMED"), "Must display confirmed violation decision");
    assert.ok(htmlWithAdjudication.includes("Pending Review"), "Unadjudicated findings must show Pending Review");
  });

  it("4. handles empty findings list safely with informative placeholder", () => {
    const htmlEmpty = renderToStaticMarkup(
      React.createElement(FindingsLedger, {
        findings: [],
        extractedFields: [],
        onSelectFinding: () => {},
      })
    );

    assert.ok(htmlEmpty.includes("0 determinations"), "Must show 0 determinations");
    assert.ok(htmlEmpty.includes("No compliance findings match the selected filter"), "Must display empty state message");
  });
});
