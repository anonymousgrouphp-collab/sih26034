/**
 * Canonical API Service & Unified Adapter for NyayaDrishti-LM
 * Connects React UI to FastAPI Backend Catalog per 07_API_AND_INTERFACE_CONTRACTS.md.
 * 
 * Provides clean architectural separation into:
 * 1. LiveApiService: Direct HTTP requests to FastAPI backend with normalized mapping.
 * 2. MockApiService: Local interactive state mutations for mock testing.
 * 3. DemoFixtureService: Pure read-only access to the 6 Golden Demonstration SKUs (SKU-DEMO-01 to 06).
 * 
 * Strict boundary:
 * - UI components never make direct fetch() calls.
 * - Errors are normalized to ApiError.
 * - Pipeline source is truthfully declared (LIVE_BACKEND, BACKEND_SIMULATION, or DEMO_FIXTURES).
 * - Legal logic and calculations remain strictly in backend.
 */

import {
  IInspectionApiService,
  InspectionCase,
  InspectionSummary,
  DashboardSummary,
  QualityGateResult,
  AdjudicationRequest,
  OfficerDecision,
  OfficerActionOrder,
  FindingAdjudication,
  FindingOfficerDecision,
  AuditEvent,
  CaseReadinessChecklist,
  LegalNoticeResult,
  GenerateNoticePayload,
  CreateInspectionPayload,
  EvidenceAsset,
  ApiOperatingMode,
  PipelineSource,
} from "../types/inspection";
import { LiveApiService } from "./liveApi";
import { MockApiService } from "./mockApi";
import { DemoFixtureService } from "./demoFixtures";

export { LiveApiService } from "./liveApi";
export { MockApiService } from "./mockApi";
export { DemoFixtureService } from "./demoFixtures";

export class ApiService {
  private static operatingMode: ApiOperatingMode = "MOCK";

  public static setOperatingMode(mode: ApiOperatingMode): void {
    this.operatingMode = mode;
  }

  public static getOperatingMode(): ApiOperatingMode {
    return this.operatingMode;
  }

  // Backward-compatible mock mode toggle
  public static setMockMode(enabled: boolean): void {
    this.operatingMode = enabled ? "MOCK" : "LIVE";
  }

  public static isMockMode(): boolean {
    return this.operatingMode !== "LIVE";
  }

  public static getPipelineSource(): PipelineSource {
    if (this.operatingMode === "DEMO_FIXTURE") {
      return "DEMO_FIXTURES";
    }
    if (this.operatingMode === "MOCK") {
      return "BACKEND_SIMULATION";
    }
    return "LIVE_BACKEND";
  }

  public static getActiveService(): IInspectionApiService {
    switch (this.operatingMode) {
      case "DEMO_FIXTURE":
        return DemoFixtureService.getInstance();
      case "LIVE":
        return LiveApiService.getInstance();
      case "MOCK":
      default:
        return MockApiService.getInstance();
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Dashboard & History Endpoints
  // ---------------------------------------------------------------------------

  public static async getDashboardSummary(circleId?: string): Promise<DashboardSummary> {
    return this.getActiveService().getDashboardSummary(circleId);
  }

  public static async listInspections(params?: {
    circleId?: string;
    status?: string;
    workflowStatus?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; items: InspectionSummary[] }> {
    return this.getActiveService().listInspections(params);
  }

  // ---------------------------------------------------------------------------
  // 2. Case Creation & Registration
  // ---------------------------------------------------------------------------

  public static async createInspection(payload: CreateInspectionPayload): Promise<InspectionCase> {
    return this.getActiveService().createInspection(payload);
  }

  // ---------------------------------------------------------------------------
  // 3. Single Inspection Case Retrieval
  // ---------------------------------------------------------------------------

  public static async getInspection(id: string): Promise<InspectionCase> {
    // Check if ID is a Golden SKU request while in LIVE or MOCK mode:
    // If explicitly querying a Golden SKU ID (e.g. SKU-DEMO-01), allow DemoFixtureService to resolve it
    if (id.startsWith("SKU-DEMO-") && this.operatingMode !== "MOCK") {
      try {
        return await DemoFixtureService.getInstance().getInspection(id);
      } catch {
        // Fall back to active service
      }
    }
    return this.getActiveService().getInspection(id);
  }

  // ---------------------------------------------------------------------------
  // 4. Evidence Ingestion & Quality Gating
  // ---------------------------------------------------------------------------

  public static async uploadEvidence(
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
    return this.getActiveService().uploadEvidence(file, metadata);
  }

  // ---------------------------------------------------------------------------
  // 5. Pipeline Execution
  // ---------------------------------------------------------------------------

  public static async executePipeline(
    imageId: string,
    inspectionId?: string,
    scenario?: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY"
  ): Promise<InspectionCase> {
    return this.getActiveService().executePipeline(imageId, inspectionId, scenario);
  }

  // ---------------------------------------------------------------------------
  // 6. Human-in-the-Loop Adjudication
  // ---------------------------------------------------------------------------

  public static async submitAdjudication(
    inspectionId: string,
    request: AdjudicationRequest
  ): Promise<OfficerDecision> {
    return this.getActiveService().submitAdjudication(inspectionId, request);
  }

  public static async submitFindingAdjudication(
    inspectionId: string,
    findingId: string,
    decision: FindingOfficerDecision,
    remarks: string,
    actionOrder?: OfficerActionOrder
  ): Promise<FindingAdjudication> {
    return this.getActiveService().submitFindingAdjudication(
      inspectionId,
      findingId,
      decision,
      remarks,
      actionOrder
    );
  }

  // ---------------------------------------------------------------------------
  // 7. Audit Trail & Case Readiness
  // ---------------------------------------------------------------------------

  public static async getAuditTrail(inspectionId: string): Promise<AuditEvent[]> {
    return this.getActiveService().getAuditTrail(inspectionId);
  }

  public static async getCaseReadiness(inspectionId: string): Promise<CaseReadinessChecklist> {
    return this.getActiveService().getCaseReadiness(inspectionId);
  }

  public static async closeInspection(
    inspectionId: string,
    remarks?: string
  ): Promise<InspectionCase> {
    return this.getActiveService().closeInspection(inspectionId, remarks);
  }

  // ---------------------------------------------------------------------------
  // 8. Legal Notice & Section 63 BSA Document Generation
  // ---------------------------------------------------------------------------

  public static async generateNotice(
    payload: GenerateNoticePayload
  ): Promise<LegalNoticeResult> {
    return this.getActiveService().generateNotice(payload);
  }

  public static getNoticePdfUrl(noticeId: string): string {
    return this.getActiveService().getNoticePdfUrl(noticeId);
  }

  // ---------------------------------------------------------------------------
  // 9. System Health & Merkle Chain Integrity
  // ---------------------------------------------------------------------------

  public static async getSystemHealth(): Promise<{
    status: string;
    statutory_mandate: string;
    repealed_acts_cited: null;
    version: string;
  }> {
    return this.getActiveService().getSystemHealth();
  }

  public static async verifyAuditChain(): Promise<{
    chain_intact: boolean;
    total_audit_records: number;
    statutory_standard: string;
    verification_timestamp: string;
  }> {
    return this.getActiveService().verifyAuditChain();
  }
}
