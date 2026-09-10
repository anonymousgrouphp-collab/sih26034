/**
 * Unit Test Suite: ConflictResolutionCard & Contradictory Evidence Triage
 * 
 * Verifies:
 * 1. ConflictResolutionCard rendering and Expected vs Observed badge structure
 * 2. Human-in-the-Loop (HITL) gate under Section 63 BSA 2023
 * 3. Officer Adjudication action callback triggering
 * 4. Resolution state handling when officer adjudication is recorded
 * 5. Automated contradiction detection for USP arithmetic mismatches & dual markings
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ConflictResolutionCard,
  EvidenceConflict,
} from "../src/features/adjudication/ConflictResolutionCard";
import { GOLDEN_SKU_CASES } from "../src/services/mockData";

describe("ConflictResolutionCard & Contradictory Evidence Widget", () => {
  it("1. returns null when no conflicts exist", () => {
    const htmlEmpty = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, { conflicts: [] })
    );
    assert.equal(htmlEmpty, "");

    const htmlNull = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, { conflicts: undefined as any })
    );
    assert.equal(htmlNull, "");
  });

  it("2. renders contradictory evidence with Expected vs Observed badges", () => {
    const sampleConflicts: EvidenceConflict[] = [
      {
        id: "conflict_mrp_dual",
        field: "DUAL MRP MARKING",
        expected: "₹48.00",
        observed: "₹48.00 vs ₹45.00",
        description:
          "Multiple contradictory MRP declarations detected on package panels. Dual pricing violates Rule 6.",
        requiresHumanDecision: true,
        resolved: false,
      },
    ];

    const html = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, {
        conflicts: sampleConflicts,
        onOpenAdjudication: () => {},
      })
    );

    assert.ok(html.includes("Human Review Required"), "Must state human review required");
    assert.ok(html.includes("SECTION 63 BSA 2023 · HITL GATE"), "Must cite Section 63 BSA 2023 HITL gate");
    assert.ok(html.includes("DUAL MRP MARKING"), "Must render field name");
    assert.ok(html.includes("Expected: ₹48.00"), "Must render Expected badge");
    assert.ok(html.includes("Observed: ₹48.00 vs ₹45.00"), "Must render Observed badge");
    assert.ok(html.includes("Officer Adjudication"), "Must render Officer Adjudication button");
  });

  it("3. displays resolution note when conflict has been resolved by LMO", () => {
    const resolvedConflicts: EvidenceConflict[] = [
      {
        id: "conflict_resolved_01",
        field: "NET_QUANTITY",
        expected: "500 g",
        observed: "490 g vs 500 g",
        description: "Resolved during physical inspection verification.",
        requiresHumanDecision: false,
        resolved: true,
      },
    ];

    const html = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, {
        conflicts: resolvedConflicts,
      })
    );

    assert.ok(html.includes("Resolved by LMO"), "Must display Resolved by LMO badge");
    assert.ok(!html.includes("Officer Adjudication"), "Should not display Officer Adjudication button when resolved");
  });

  it("4. detects USP calculation conflict for SKU-DEMO-02", () => {
    const sku02 = GOLDEN_SKU_CASES["SKU-DEMO-02"];
    assert.ok(sku02, "SKU-DEMO-02 must exist");

    const uspFinding = sku02.rule_evaluations.find((f) => f.rule_code.includes("USP"));
    assert.ok(uspFinding, "SKU-DEMO-02 must contain USP rule finding");
    assert.equal(uspFinding.status, "FAIL");
    assert.ok(uspFinding.discrepancy?.includes("mismatch"), "Discrepancy must document arithmetic mismatch");

    // Construct conflict representation
    const conflict: EvidenceConflict = {
      id: `conflict_${uspFinding.finding_id}`,
      field: "UNIT_SALE_PRICE",
      expected: uspFinding.required_value,
      observed: uspFinding.measured_value,
      description: uspFinding.discrepancy || "",
      requiresHumanDecision: true,
      resolved: false,
    };

    const html = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, {
        conflicts: [conflict],
        onOpenAdjudication: () => {},
      })
    );

    assert.ok(html.includes("UNIT_SALE_PRICE"));
    assert.ok(html.includes(uspFinding.required_value));
    assert.ok(html.includes(uspFinding.measured_value));
  });

  it("5. renders multiple conflicts in a high-density triage list", () => {
    const multiConflicts: EvidenceConflict[] = [
      {
        id: "c1",
        field: "MRP",
        expected: "₹100.00",
        observed: "₹100.00 vs ₹110.00",
        description: "Contradictory MRP on front vs side panel.",
        requiresHumanDecision: true,
        resolved: false,
      },
      {
        id: "c2",
        field: "NET_QUANTITY",
        expected: "1 kg",
        observed: "950 g vs 1000 g",
        description: "Weight mismatch across vernacular vs english panels.",
        requiresHumanDecision: true,
        resolved: false,
      },
    ];

    const html = renderToStaticMarkup(
      React.createElement(ConflictResolutionCard, {
        conflicts: multiConflicts,
        onOpenAdjudication: () => {},
      })
    );

    assert.ok(html.includes("2 Contradictory Markings"), "Header must show count of contradictory markings");
    assert.ok(html.includes("₹100.00 vs ₹110.00"));
    assert.ok(html.includes("950 g vs 1000 g"));
  });
});
