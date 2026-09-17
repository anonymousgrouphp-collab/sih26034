import test from "node:test";
import assert from "node:assert/strict";
import { generateClientForm1PdfBlob } from "../src/utils/clientForm1PdfGenerator";
import { InspectionCase } from "../src/types/inspection";

test("generateClientForm1PdfBlob generates valid ISO-32000 compliant PDF containing 2011 Rules and product details", async () => {
  const mockCase: InspectionCase = {
    id: "insp_test_999",
    inspection_number: "INSP-20260917-REAL01",
    created_at: "2026-09-17T12:00:00Z",
    updated_at: "2026-09-17T12:30:00Z",
    status: "UNDER_REVIEW",
    workflow_status: "UNDER_REVIEW",
    verdict: "NON_COMPLIANT",
    establishment_name: "Titan Watch Enterprise",
    premises_address: "3, SIPCOT Industrial Complex, Hosur, Tamil Nadu",
    product_name: "Quartz Analog Wristwatch Model W-402",
    brand_name: "Titan",
    category: "Timepieces & Precision Electronics",
    batch_number: "TC-2026-B9",
    packaging_geometry: "RECTANGULAR_RIGID_BOX",
    pdp_surface_area_cm2: 64.5,
    declared_mrp: 2425.0,
    declared_net_quantity: "1 Unit",
    rule_evaluations: [
      {
        id: "eval_01",
        rule_name: "Rule 6(1)(k)",
        rule_id: "RULE-USP-01",
        status: "FAIL",
        finding: "NON_COMPLIANT",
        description: "Unit Sale Price (USP) absent on PDP",
        measured_value: "USP Absent",
        mandated_value: "Prominent USP",
        penalty_section: "Section 36(1) proviso Legal Metrology Act, 2009",
      },
      {
        id: "eval_02",
        rule_name: "Rule 7(1) read with Table-I",
        rule_id: "RULE-NETQTY-01",
        status: "FAIL",
        finding: "NON_COMPLIANT",
        description: "Net quantity numeral height 1.8mm vs mandated 3.0mm",
        measured_value: "1.8 mm",
        mandated_value: "3.0 mm",
        penalty_section: "Section 36(1) proviso Legal Metrology Act, 2009",
      }
    ],
    extracted_fields: [
      {
        id: "field_mrp",
        field_type: "MRP",
        raw_text: "MRP Rs. 2,425.00",
        confidence: 0.98,
        token_ids: ["tok_01"],
        bounding_box: [100, 100, 150, 300],
      },
      {
        id: "field_email",
        field_type: "CONSUMER_CARE",
        raw_text: "Email: helpdesk@titan.co.in",
        confidence: 0.95,
        token_ids: ["tok_02"],
        bounding_box: [200, 100, 250, 400],
      }
    ],
  };

  const blob = generateClientForm1PdfBlob(mockCase, undefined, 5000, 15, "Rajesh Sharma", "INSP-DL-0842");
  assert.ok(blob, "Blob must be defined");
  assert.equal(blob.type, "application/pdf", "Blob type must be application/pdf");
  assert.ok(blob.size > 2000, `Blob size should be > 2000 bytes, got ${blob.size}`);

  const arrayBuffer = await blob.arrayBuffer();
  const textContent = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer));

  // PDF syntax structure
  assert.ok(textContent.startsWith("%PDF-1.4"), "Must start with PDF 1.4 header");
  assert.ok(textContent.includes("%%EOF"), "Must end with %%EOF marker");
  assert.ok(textContent.includes("/Root 1 0 R"), "Must contain catalog root reference");

  // Statutory mandate references
  assert.ok(
    textContent.includes("Packaged Commodities") && textContent.includes("Rules, 2011"),
    "Must cite 2011 LMPC Rules"
  );
  assert.ok(textContent.includes("Jan Vishwas"), "Must cite Jan Vishwas Act, 2023");
  assert.ok(textContent.includes("Bharatiya Sakshya Adhiniyam, 2023"), "Must cite Section 63 BSA 2023");
  assert.ok(textContent.includes("Section 36"), "Must cite Section 36 proviso");

  // Inspected product particulars
  assert.ok(textContent.includes("Titan"), "Must contain brand name");
  assert.ok(textContent.includes("Quartz Analog Wristwatch"), "Must contain product name");
  assert.ok(textContent.includes("2425"), "Must contain MRP");
  assert.ok(textContent.toLowerCase().includes("15 days"), "Must contain 15-day statutory improvement window");
  assert.ok(textContent.includes("5,000"), "Must contain compounding fee");
  assert.ok(textContent.includes("Rajesh Sharma"), "Must contain officer name");
  assert.ok(textContent.includes("INSP-DL-0842"), "Must contain officer badge");
});

test("generateClientForm1PdfBlob renders lawful compliance determination when product has no violations or dismissed by officer", async () => {
  const compliantCase: InspectionCase = {
    id: "insp_compliant_001",
    inspection_number: "INSP-20260917-COMP01",
    created_at: "2026-09-17T14:00:00Z",
    updated_at: "2026-09-17T14:15:00Z",
    status: "COMPLETED",
    workflow_status: "ADJUDICATED",
    verdict: "PASS",
    establishment_name: "Himalaya Wellness Company",
    premises_address: "Makali, Bengaluru, Karnataka",
    product_name: "Purifying Neem Face Wash 100ml",
    brand_name: "Himalaya",
    category: "Personal Care & Cosmetics",
    batch_number: "HIM-2026-04A",
    pdp_surface_area_cm2: 85.0,
    declared_mrp: 140.0,
    declared_net_quantity: "100 ml",
    rule_evaluations: [
      {
        finding_id: "eval_netqty_01",
        rule_code: "RULE_06_1_H_NET_QTY_FONT",
        statutory_reference: "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
        status: "FAIL",
        severity: "MAJOR",
        required_value: ">= 3.0 mm font",
        measured_value: "2.4 mm font",
        discrepancy: "Numeral height deficit 0.6mm",
        legal_consequence: "Section 36(1) proviso Legal Metrology Act, 2009",
      }
    ],
    // Officer adjudicated and dismissed the marginal font deficit upon physical verification
    finding_decisions: {
      eval_netqty_01: {
        finding_id: "eval_netqty_01",
        decision: "DISMISSED",
        notes: "Physical caliper check confirms lawful font height of 3.1mm on curved bottle surface.",
      }
    },
    adjudication: {
      decision_id: "adj_001",
      inspection_id: "insp_compliant_001",
      officer_id: "usr_lmo_south",
      badge_number: "LMO-KA-5521",
      officer_name: "Vikramaditya Rao",
      verdict: "DISMISS_AS_COMPLIANT",
      override_applied: true,
      remarks: "Physical caliper verification confirmed font compliant on cylindrical packaging.",
      timestamp_utc: "2026-09-17T14:15:00Z",
      action_order: "CLOSE_INSPECTION_COMPLIANT",
    },
    extracted_fields: [
      {
        field_id: "f_mrp",
        field_type: "MRP",
        raw_ocr_text: "MRP Rs. 140.00",
        normalized_value: { value: 140.0 },
        detection_confidence: 0.99,
        ocr_confidence: 0.97,
        bounding_box: [100, 100, 150, 300],
      },
      {
        field_id: "f_usp",
        field_type: "UNIT_SALE_PRICE",
        raw_ocr_text: "USP: Rs. 1.40 / ml",
        normalized_value: { value: 1.40, unit: "ml" },
        detection_confidence: 0.96,
        ocr_confidence: 0.94,
        bounding_box: [160, 100, 190, 300],
      }
    ]
  };

  const blob = generateClientForm1PdfBlob(
    compliantCase,
    undefined,
    5000,
    15,
    "Vikramaditya Rao",
    "LMO-KA-5521"
  );
  assert.ok(blob, "Blob must be defined");
  assert.equal(blob.type, "application/pdf");

  const arrayBuffer = await blob.arrayBuffer();
  const textContent = new TextDecoder("latin1").decode(new Uint8Array(arrayBuffer));

  // Assert compliance determination
  assert.ok(textContent.includes("COMPLIANT COMMODITY"), "Must state COMPLIANT COMMODITY");
  assert.ok(textContent.includes("STATUTORY_COMPLIANT"), "Must render STATUTORY_COMPLIANT row in Schedule B");
  assert.ok(textContent.includes("Rs. 0.00") && textContent.includes("Nil"), "Must indicate Rs. 0.00 (Nil) compounding fee");
  assert.ok(textContent.includes("Nil - Compliant"), "Must state Nil - Compliant");
  assert.ok(textContent.includes("Vikramaditya Rao"), "Must render adjudicating officer name");
  assert.ok(textContent.includes("LMO-KA-5521"), "Must render adjudicating officer badge");
  assert.ok(textContent.includes("Himalaya"), "Must render brand name");
  assert.ok(textContent.includes("Purifying Neem Face Wash"), "Must render product name");
});

