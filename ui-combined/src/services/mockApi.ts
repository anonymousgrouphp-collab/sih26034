/**
 * Mock API Service for NyayaDrishti-LM
 * Provides interactive local state mutations against mockData.ts
 * for developer testing, offline demonstrations, and standalone execution.
 * 
 * Strict boundary:
 * - Isolated to mockData.ts.
 * - Truthfully marks pipeline_source = "BACKEND_SIMULATION".
 * - Does not perform client-side legal calculations.
 */

import {
  IInspectionApiService,
  InspectionCase,
  InspectionSummary,
  DashboardSummary,
  QualityGateResult,
  AdjudicationRequest,
  OfficerDecision,
  FindingOfficerDecision,
  FindingAdjudication,
  OfficerActionOrder,
  AuditEvent,
  HandoffReadinessState,
  CaseReadinessChecklist,
  GenerateNoticePayload,
  LegalNoticeResult,
  CreateInspectionPayload,
  EvidenceAsset,
  ApiError,
} from "../types/inspection";
import {
  GOLDEN_SKU_CASES,
  MOCK_DASHBOARD_SUMMARY,
  getMockCases,
  addMockCase,
  updateMockCase,
  appendAuditEvent,
  computeCaseReadiness,
} from "./mockData";

export class MockApiService implements IInspectionApiService {
  private static instance: MockApiService;

  public static getInstance(): MockApiService {
    if (!MockApiService.instance) {
      MockApiService.instance = new MockApiService();
    }
    return MockApiService.instance;
  }

  public async getDashboardSummary(circleId?: string): Promise<DashboardSummary> {
    return {
      ...MOCK_DASHBOARD_SUMMARY,
      jurisdiction_circle: circleId || MOCK_DASHBOARD_SUMMARY.jurisdiction_circle,
    };
  }

  public async listInspections(params?: {
    circleId?: string;
    status?: string;
    workflowStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; items: InspectionSummary[] }> {
    const allCases = Object.values(getMockCases());
    let items = allCases.map((c) => ({
      id: c.id,
      inspection_number: c.inspection_number,
      product_name: c.product_name,
      brand_name: c.brand_name,
      manufacturer_name: c.manufacturer_name,
      establishment_name: c.establishment_name,
      inspection_type: c.inspection_type,
      category: c.category,
      package_type: c.package_type,
      workflow_status: c.workflow_status || "OPEN",
      overall_status: c.overall_status,
      ai_verdict: c.ai_verdict,
      jurisdiction_id: c.jurisdiction_id,
      created_at: c.created_at,
      violations_count: c.rule_evaluations.filter((e) => e.status === "FAIL").length,
      adjudicated: !!c.adjudication,
      is_mock_fixture: c.is_mock_fixture ?? false,
    }));

    if (params?.status) {
      items = items.filter((i) => i.overall_status === params.status);
    }
    if (params?.workflowStatus) {
      items = items.filter((i) => i.workflow_status === params.workflowStatus);
    }
    if (params?.circleId) {
      items = items.filter((i) => i.jurisdiction_id === params.circleId);
    }
    if (params?.search) {
      const query = params.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.product_name.toLowerCase().includes(query) ||
          i.inspection_number.toLowerCase().includes(query) ||
          (i.brand_name && i.brand_name.toLowerCase().includes(query)) ||
          (i.establishment_name && i.establishment_name.toLowerCase().includes(query))
      );
    }

    return { total: items.length, items };
  }

  public async createInspection(payload: CreateInspectionPayload): Promise<InspectionCase> {
    if (!payload.product_name || payload.product_name.trim().length === 0) {
      throw {
        error_code: "VALIDATION_ERROR",
        status: 400,
        message: "Commodity / product name is required.",
        remediation: "Please enter the declared product name on the packaging.",
      } as ApiError;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCase: InspectionCase = {
      id: `insp_${Date.now()}_${randomSuffix}`,
      inspection_number: `INSP-${dateStr}-${randomSuffix}`,
      created_at: now.toISOString(),
      officer_id: "INSP-DL-0842",
      jurisdiction_id: payload.jurisdiction_circle_id || "CIRCLE_DL_SOUTH_01",
      capture_source: "PHYSICAL_FIELD",
      product_name: payload.product_name.trim(),
      brand_name: payload.brand_name?.trim() || undefined,
      manufacturer_name: payload.manufacturer_name?.trim() || undefined,
      establishment_name: payload.establishment_name?.trim() || undefined,
      premises_address: payload.premises_address?.trim() || undefined,
      inspection_type: payload.inspection_type || "ROUTINE_MARKET_SURVEILLANCE",
      category: payload.category || "FOOD_SNACKS",
      package_type: payload.package_type || "RECTANGULAR",
      workflow_status: "DRAFT",
      overall_status: "PENDING_REVIEW",
      ai_verdict: "PENDING",
      declared_net_quantity: payload.declared_net_quantity?.trim() || undefined,
      notes: payload.notes?.trim() || undefined,
      evidence_assets: [],
      extracted_fields: [],
      rule_evaluations: [],
      is_mock_fixture: true,
      pipeline_source: "BACKEND_SIMULATION",
    };

    addMockCase(newCase);
    return newCase;
  }

  public async getInspection(id: string): Promise<InspectionCase> {
    const mockCases = getMockCases();
    const found =
      mockCases[id] ||
      Object.values(mockCases).find(
        (c) => c.id === id || c.sku_demo_id === id || c.inspection_number === id
      );

    if (found) {
      return {
        ...found,
        pipeline_source: "BACKEND_SIMULATION",
      };
    }

    // Default fallback to first case
    return {
      ...(mockCases["SKU-DEMO-01"] || Object.values(mockCases)[0]),
      pipeline_source: "BACKEND_SIMULATION",
    };
  }

  public async uploadEvidence(
    file: File | Blob,
    metadata: {
      inspection_id: string;
      panel_type?: "PDP_FRONT" | "SIDE_PANEL" | "BACK_PANEL" | "ECOMMERCE_SNAPSHOT";
      original_filename?: string;
      file_size_bytes?: number;
      mime_type?: string;
      image_width?: number;
      image_height?: number;
      preview_url?: string;
      demo_scenario?: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY" | "DEFAULT";
    }
  ): Promise<{
    inspection_id: string;
    image_id: string;
    raw_sha256: string;
    quality_gate: QualityGateResult;
    asset: EvidenceAsset;
  }> {
    const imageId = `img_mock_${Date.now()}`;
    let rawSha256 = "a3f5e1b2c4d6879012345678abcdef0123456789abcdef0123456789abcdef01";
    let qualityGate: QualityGateResult = {
      passed: true,
      blur_variance: 342.18,
      glare_percentage: 0.84,
      skew_angle_deg: 1.45,
      advice: "FRAME_OPTIMAL",
    };

    if (metadata.demo_scenario === "UNABLE_TO_VERIFY") {
      rawSha256 = "e7b9c5f6a8b0213456789012abcdef0123456789abcdef0123456789abcdef05";
      qualityGate = {
        passed: false,
        blur_variance: 310.0,
        glare_percentage: 6.4,
        skew_angle_deg: 2.5,
        advice: "REDUCE_GLARE",
        rejection_reason:
          "SPECULAR_GLARE: Glare coverage 6.40% exceeds acceptable maximum 3.00%. Tilt camera slightly to avoid direct light reflection.",
      };
    } else if (metadata.demo_scenario === "REVIEW") {
      rawSha256 = "d6a8b4e5f7a9102345678901abcdef0123456789abcdef0123456789abcdef04";
      qualityGate = {
        passed: true,
        blur_variance: 295.0,
        glare_percentage: 0.9,
        skew_angle_deg: 1.1,
        advice: "FRAME_OPTIMAL",
      };
    } else if (metadata.demo_scenario === "PASS") {
      rawSha256 = "c5f7a3d4e6f8091234567890abcdef0123456789abcdef0123456789abcdef03";
      qualityGate = {
        passed: true,
        blur_variance: 420.5,
        glare_percentage: 0.6,
        skew_angle_deg: 0.8,
        advice: "FRAME_OPTIMAL",
      };
    }

    const asset: EvidenceAsset = {
      image_id: imageId,
      inspection_id: metadata.inspection_id,
      file_path: metadata.preview_url || `storage/uploads/${metadata.original_filename || "field_evidence.jpg"}`,
      raw_sha256: rawSha256,
      panel_type: metadata.panel_type || "PDP_FRONT",
      image_width: metadata.image_width || 1920,
      image_height: metadata.image_height || 1080,
      quality_gate: qualityGate,
      original_filename: metadata.original_filename || (file instanceof File ? file.name : "evidence_capture.jpg"),
      mime_type: metadata.mime_type || (file instanceof File ? file.type : "image/jpeg"),
      file_size_bytes: metadata.file_size_bytes || (file instanceof File ? file.size : 1024 * 512),
      preview_url: metadata.preview_url,
      uploaded_at: new Date().toISOString(),
      is_original_untouched: true,
    };

    const existing = getMockCases()[metadata.inspection_id];
    if (existing) {
      updateMockCase(metadata.inspection_id, {
        evidence_assets: [...existing.evidence_assets, asset],
        workflow_status: "OPEN",
        overall_status: qualityGate.passed ? "PENDING_REVIEW" : "UNABLE_TO_VERIFY",
        ai_verdict: qualityGate.passed ? "PENDING" : "UNABLE_TO_VERIFY",
      });
    }

    return {
      inspection_id: metadata.inspection_id,
      image_id: imageId,
      raw_sha256: rawSha256,
      quality_gate: qualityGate,
      asset,
    };
  }

  public async executePipeline(
    imageId: string,
    inspectionId?: string,
    scenario?: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY"
  ): Promise<InspectionCase> {
    const mockCases = getMockCases();
    const targetCase = inspectionId
      ? mockCases[inspectionId]
      : Object.values(mockCases).find((c) => c.evidence_assets.some((a) => a.image_id === imageId)) ||
        mockCases["SKU-DEMO-01"];

    if (!targetCase) {
      return {
        ...GOLDEN_SKU_CASES["SKU-DEMO-01"],
        pipeline_source: "BACKEND_SIMULATION",
      };
    }

    const activeAsset =
      targetCase.evidence_assets.find((a) => a.image_id === imageId) ||
      targetCase.evidence_assets[0];
    const isOpticalFail = activeAsset?.quality_gate?.passed === false || scenario === "UNABLE_TO_VERIFY";

    if (isOpticalFail) {
      const updated = updateMockCase(targetCase.id, {
        workflow_status: "OPEN",
        overall_status: "UNABLE_TO_VERIFY",
        ai_verdict: "UNABLE_TO_VERIFY",
        rule_evaluations: [
          {
            finding_id: `eval_optic_${Date.now()}`,
            rule_code: "QUALITY_GATE_OPTICAL_REJECTION",
            statutory_reference: "Section 63 BSA 2023 Evidentiary Clarity Standard",
            status: "UNABLE_TO_VERIFY",
            severity: "CRITICAL",
            required_value: "Specular glare <= 3.00%",
            measured_value: `${activeAsset?.quality_gate?.glare_percentage?.toFixed(2) || "6.40"}% glare bloom`,
            discrepancy:
              activeAsset?.quality_gate?.rejection_reason ||
              "Harsh specular reflection obscures Net Quantity text region",
            legal_consequence: "Image inadmissible for statutory enforcement without re-capture",
          },
        ],
      });
      return {
        ...(updated || targetCase),
        pipeline_source: "BACKEND_SIMULATION",
      };
    }

    let sourceTemplate = GOLDEN_SKU_CASES["SKU-DEMO-01"];
    if (scenario === "PASS" || targetCase.product_name.toLowerCase().includes("water")) {
      sourceTemplate = GOLDEN_SKU_CASES["SKU-DEMO-03"];
    } else if (scenario === "REVIEW" || targetCase.product_name.toLowerCase().includes("soap")) {
      sourceTemplate = GOLDEN_SKU_CASES["SKU-DEMO-04"];
    } else if (scenario === "FAIL") {
      sourceTemplate = GOLDEN_SKU_CASES["SKU-DEMO-01"];
    }

    const updatedAssets = targetCase.evidence_assets.map((a) => {
      if (a.image_id === (activeAsset?.image_id || imageId)) {
        return {
          ...a,
          calibration: sourceTemplate.evidence_assets[0]?.calibration,
          ocr: sourceTemplate.evidence_assets[0]?.ocr,
        };
      }
      return a;
    });

    const updated = updateMockCase(targetCase.id, {
      evidence_assets: updatedAssets.length > 0 ? updatedAssets : sourceTemplate.evidence_assets,
      principal_display_panel: sourceTemplate.principal_display_panel,
      extracted_fields: sourceTemplate.extracted_fields,
      rule_evaluations: sourceTemplate.rule_evaluations,
      evidence_graph: sourceTemplate.evidence_graph,
      bsa_certificate: sourceTemplate.bsa_certificate,
      workflow_status: "PENDING_REVIEW",
      overall_status: sourceTemplate.overall_status,
      ai_verdict: sourceTemplate.ai_verdict,
    });

    return {
      ...(updated || targetCase),
      pipeline_source: "BACKEND_SIMULATION",
    };
  }

  public async submitAdjudication(
    inspectionId: string,
    request: AdjudicationRequest
  ): Promise<OfficerDecision> {
    if (!request.officer_remarks || request.officer_remarks.trim().length === 0) {
      throw {
        error_code: "MISSING_OFFICER_REMARKS",
        status: 400,
        message: "Mandatory officer justification remarks required for statutory record.",
        remediation: "Provide detailed reasoning for adjudication decision before proceeding.",
      } as ApiError;
    }

    const decision: OfficerDecision = {
      decision_id: `dec_${Date.now()}`,
      inspection_id: inspectionId,
      officer_id: "INSP-DL-0842",
      badge_number: "INSP-DL-0842",
      officer_name: "Rajesh Sharma",
      verdict: request.adjudication_verdict,
      override_applied: request.override_applied,
      remarks: request.officer_remarks,
      timestamp_utc: new Date().toISOString(),
      action_order: request.action_order,
    };

    let readinessState: HandoffReadinessState = "PENDING_OFFICER_REVIEW";
    let guidance = "Officer adjudication recorded.";
    if (
      request.action_order === "REQUEST_PHYSICAL_CALIPER_CHECK" ||
      request.adjudication_verdict === "REQUEST_RETEST"
    ) {
      readinessState = "ACTION_REQUIRED_RETEST";
      guidance = "Physical caliper re-measurement or packaging re-capture ordered by inspecting officer.";
    } else if (
      request.action_order === "CLOSE_INSPECTION_COMPLIANT" ||
      request.adjudication_verdict === "DISMISS_AS_COMPLIANT"
    ) {
      readinessState = "READY_FOR_CASE_CLOSURE";
      guidance = "Inspection record marked compliant by officer. Ready for administrative filing and case closure.";
    } else if (
      request.action_order === "GENERATE_LEGAL_NOTICE_FORM_1" ||
      request.adjudication_verdict === "CONFIRM_VIOLATION"
    ) {
      readinessState = "READY_FOR_LEGAL_NOTICE_DISPATCH";
      guidance = "Statutory notice authorized by inspecting officer. Ready for Form-1 Show Cause Notice preparation.";
    }

    updateMockCase(inspectionId, {
      adjudication: decision,
      workflow_status: "COMPLETED",
      readiness_checklist: {
        evidence_available: true,
        automated_analysis_completed: true,
        officer_adjudication_completed: true,
        audit_record_complete: true,
        readiness_state: readinessState,
        downstream_action_guidance: guidance,
      },
    });

    appendAuditEvent(inspectionId, {
      event_type: request.override_applied ? "OFFICER_OVERRIDE_APPLIED" : "OFFICER_ADJUDICATION_RECORDED",
      event_label: request.override_applied ? "Officer Adjudication Override" : "Officer Adjudication Recorded",
      actor_type: "OFFICER",
      actor_id: "INSP-DL-0842",
      actor_name: "Rajesh Sharma",
      entity_type: "ADJUDICATION",
      entity_id: decision.decision_id,
      decision: request.adjudication_verdict,
      remarks: request.officer_remarks,
      metadata: {
        action_order: request.action_order,
        override_applied: request.override_applied,
      },
    });

    return decision;
  }

  public async submitFindingAdjudication(
    inspectionId: string,
    findingId: string,
    decision: FindingOfficerDecision,
    remarks: string,
    actionOrder?: OfficerActionOrder
  ): Promise<FindingAdjudication> {
    if (!remarks || remarks.trim().length === 0) {
      throw {
        error_code: "MISSING_OFFICER_REMARKS",
        status: 400,
        message: "Mandatory officer justification remarks required for statutory record.",
        remediation: "Provide detailed reasoning for adjudication decision before proceeding.",
      } as ApiError;
    }

    const findingAdj: FindingAdjudication = {
      finding_id: findingId,
      decision,
      officer_id: "INSP-DL-0842",
      officer_name: "Rajesh Sharma",
      badge_number: "INSP-DL-0842",
      remarks: remarks.trim(),
      timestamp_utc: new Date().toISOString(),
      action_order: actionOrder,
    };

    const mockCases = getMockCases();
    const current = Object.values(mockCases).find(
      (c) => c.id === inspectionId || c.sku_demo_id === inspectionId || c.inspection_number === inspectionId
    );
    const existingDecisions = current?.finding_decisions || {};
    const updatedDecisions = { ...existingDecisions, [findingId]: findingAdj };

    updateMockCase(inspectionId, {
      finding_decisions: updatedDecisions,
    });

    appendAuditEvent(inspectionId, {
      event_type: "OFFICER_ADJUDICATION_RECORDED",
      event_label: `Finding Adjudicated: ${decision}`,
      actor_type: "OFFICER",
      actor_id: "INSP-DL-0842",
      actor_name: "Rajesh Sharma",
      entity_type: "FINDING",
      entity_id: findingId,
      related_finding_id: findingId,
      decision,
      remarks: remarks.trim(),
    });

    return findingAdj;
  }

  public async getAuditTrail(inspectionId: string): Promise<AuditEvent[]> {
    const c = await this.getInspection(inspectionId);
    return c.audit_trail || [];
  }

  public async getCaseReadiness(inspectionId: string): Promise<CaseReadinessChecklist> {
    const c = await this.getInspection(inspectionId);
    return computeCaseReadiness(c);
  }

  public async closeInspection(inspectionId: string, remarks?: string): Promise<InspectionCase> {
    const caseData = await this.getInspection(inspectionId);
    const readiness = computeCaseReadiness(caseData);

    if (readiness.readiness_state !== "READY_FOR_CASE_CLOSURE") {
      throw {
        error_code: "CASE_NOT_READY_FOR_CLOSURE",
        status: 400,
        message: "Case is not marked ready for closure by current workflow state.",
        remediation: "Complete officer review and ensure all findings are resolved before case closure.",
      } as ApiError;
    }

    const closureRemarks =
      remarks?.trim() ||
      "Inspection concluded. Case reviewed against backend statutory records and marked closed.";

    updateMockCase(inspectionId, {
      workflow_status: "COMPLETED",
      readiness_checklist: {
        ...readiness,
        downstream_action_guidance: "Case officially closed and archived in inspection registry.",
      },
    });

    appendAuditEvent(inspectionId, {
      event_type: "INSPECTION_CLOSED",
      event_label: "Inspection Case Closed",
      actor_type: "OFFICER",
      actor_id: "INSP-DL-0842",
      actor_name: "Rajesh Sharma",
      entity_type: "INSPECTION",
      entity_id: inspectionId,
      decision: "CASE_CLOSED",
      remarks: closureRemarks,
    });

    return await this.getInspection(inspectionId);
  }

  public async generateNotice(_payload: GenerateNoticePayload): Promise<LegalNoticeResult> {
    return {
      notice_id: `not_mock_${Date.now()}`,
      notice_reference_number: "LMO/DL/SOUTH/2026/0842",
      bsa_certificate_number: "CERT-BSA2023-20260910-0842",
      statutory_mandate: "Section 36(1) of Legal Metrology Act, 2009 read with Section 63 BSA 2023",
      pdf_download_url: `/api/v1/notices/not_mock_${Date.now()}/pdf`,
      merkle_entry_hash: "8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123",
    };
  }

  public getNoticePdfUrl(noticeId: string): string {
    return `/api/v1/notices/${noticeId}/pdf`;
  }

  public async getSystemHealth(): Promise<{
    status: string;
    statutory_mandate: string;
    repealed_acts_cited: null;
    version: string;
  }> {
    return {
      status: "LOCAL_RESILIENT_MODE",
      statutory_mandate: "Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)",
      repealed_acts_cited: null,
      version: "1.0.0-sih26034",
    };
  }

  public async verifyAuditChain(): Promise<{
    chain_intact: boolean;
    total_audit_records: number;
    statutory_standard: string;
    verification_timestamp: string;
  }> {
    return {
      chain_intact: true,
      total_audit_records: 4,
      statutory_standard: "Section 63 Bharatiya Sakshya Adhiniyam, 2023",
      verification_timestamp: new Date().toISOString(),
    };
  }
}
