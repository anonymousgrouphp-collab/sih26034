import React, { useState, useMemo } from "react";
import {
  InspectionCase,
  EvidenceAsset,
  RuleFinding,
  ExtractedField,
  OCRToken,
  AdjudicationRequest,
} from "../../types/inspection";
import { EvidenceViewer } from "./EvidenceViewer";
import { FindingsLedger } from "./FindingsLedger";
import { FieldDetailPanel } from "./FieldDetailPanel";
import { OfficerAdjudicationModal } from "./OfficerAdjudicationModal";
import { ApiService } from "../../services/api";
import { AuditTimeline } from "../audit/AuditTimeline";
import { EvidenceProvenancePanel } from "../audit/EvidenceProvenancePanel";
import { CaseHandoffState } from "../audit/CaseHandoffState";
import {
  findFieldForFinding,
  findTokensForFinding,
  findFieldForToken,
  findFindingsForToken,
} from "./AdjudicationTraceability";

interface AdjudicationCanvasProps {
  caseData: InspectionCase;
  onAdjudicationSubmitted: (request: AdjudicationRequest) => Promise<void>;
  onRetakeRequested?: () => void;
  onSwitchToDiagnosticHUD?: () => void;
}

export const AdjudicationCanvas: React.FC<AdjudicationCanvasProps> = ({
  caseData,
  onAdjudicationSubmitted,
  onRetakeRequested,
  onSwitchToDiagnosticHUD,
}) => {
  const activeAsset: EvidenceAsset | undefined =
    caseData.evidence_assets[caseData.evidence_assets.length - 1];

  const findings: RuleFinding[] = caseData.rule_evaluations || [];
  const fields: ExtractedField[] = caseData.extracted_fields || [];
  const tokens: OCRToken[] = activeAsset?.ocr?.tokens || [];

  // Active selections for bidirectional synchronization
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(
    findings[0]?.finding_id
  );
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(undefined);
  const [rightTab, setRightTab] = useState<"FINDINGS" | "DETAILS" | "AUDIT" | "PROVENANCE" | "HANDOFF">("FINDINGS");
  const [isAdjudicationModalOpen, setIsAdjudicationModalOpen] = useState<boolean>(false);
  const [isSubmittingAdjudication, setIsSubmittingAdjudication] = useState<boolean>(false);
  const [isGeneratingNotice, setIsGeneratingNotice] = useState<boolean>(false);
  const [noticeResultMsg, setNoticeResultMsg] = useState<string | null>(null);

  // Quick Form-1 Notice PDF Generation handler
  const handleQuickGenerateNotice = async () => {
    setIsGeneratingNotice(true);
    setNoticeResultMsg(null);
    try {
      const res = await ApiService.generateNotice({
        inspection_id: caseData.id,
        recipient: {
          type: "MANUFACTURER",
          name: caseData.manufacturer_name || caseData.establishment_name || "Responsible Enterprise / Manufacturer",
          address: caseData.premises_address || "Premises recorded during statutory inspection",
        },
        compounding_fee_amount: 5000,
        reply_window_days: 15,
      });
      if (res.pdf_download_url) {
        window.open(res.pdf_download_url, "_blank");
      }
      setNoticeResultMsg(`Form-1 Notice ${res.notice_reference_number} generated with Section 63 BSA certificate.`);
      setTimeout(() => setNoticeResultMsg(null), 6000);
    } catch (err: any) {
      setNoticeResultMsg(`Notice dispatch note: ${err.message || "Ready for officer sign-off."}`);
      setTimeout(() => setNoticeResultMsg(null), 6000);
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  // Selected entities derived from active finding ID or active token ID
  const selectedFinding: RuleFinding | undefined = useMemo(() => {
    if (selectedFindingId) {
      return findings.find((f) => f.finding_id === selectedFindingId);
    }
    if (selectedTokenId) {
      const token = tokens.find((t) => t.token_id === selectedTokenId);
      if (token) {
        const matchingFindings = findFindingsForToken(token, fields, findings);
        return matchingFindings[0];
      }
    }
    return findings[0];
  }, [selectedFindingId, selectedTokenId, findings, tokens, fields]);

  const selectedField: ExtractedField | undefined = useMemo(() => {
    if (selectedFinding) {
      const field = findFieldForFinding(selectedFinding, fields);
      if (field) return field;
    }
    if (selectedTokenId) {
      const token = tokens.find((t) => t.token_id === selectedTokenId);
      if (token) {
        return findFieldForToken(token, fields);
      }
    }
    return fields[0];
  }, [selectedFinding, selectedTokenId, fields, tokens]);

  const selectedTokens: OCRToken[] = useMemo(() => {
    if (selectedTokenId) {
      const direct = tokens.filter((t) => t.token_id === selectedTokenId);
      if (direct.length > 0) return direct;
    }
    if (selectedFinding) {
      return findTokensForFinding(selectedFinding, fields, tokens);
    }
    return tokens.slice(0, 1);
  }, [selectedTokenId, selectedFinding, fields, tokens]);

  // Handler: Selecting a finding in the Ledger highlights field, token, and polygon
  const handleSelectFinding = (findingId: string) => {
    setSelectedFindingId(findingId);
    const finding = findings.find((f) => f.finding_id === findingId);
    if (finding) {
      const linkedTokens = findTokensForFinding(finding, fields, tokens);
      if (linkedTokens.length > 0) {
        setSelectedTokenId(linkedTokens[0].token_id);
      } else {
        setSelectedTokenId(undefined);
      }
    }
  };

  // Handler: Selecting an OCR polygon on the image canvas highlights token, field, and finding
  const handleSelectToken = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    const token = tokens.find((t) => t.token_id === tokenId);
    if (token) {
      const matchingFindings = findFindingsForToken(token, fields, findings);
      if (matchingFindings.length > 0) {
        setSelectedFindingId(matchingFindings[0].finding_id);
      }
    }
  };

  const handleSubmitAdjudication = async (request: AdjudicationRequest) => {
    setIsSubmittingAdjudication(true);
    try {
      await onAdjudicationSubmitted(request);
      setIsAdjudicationModalOpen(false);
    } finally {
      setIsSubmittingAdjudication(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Sub-Header: Adjudication Workspace Mode Bar */}
      <div className="bg-panelBg border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-govNavy flex items-center gap-1.5">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Flagship Adjudication Canvas
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-mono">
            {caseData.product_name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSwitchToDiagnosticHUD && (
            <button
              type="button"
              onClick={onSwitchToDiagnosticHUD}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1 rounded transition-colors"
              title="View step-by-step diagnostic HUD telemetry"
            >
              Diagnostic HUD ↗
            </button>
          )}

          {/* Quick Form-1 Notice PDF Generation */}
          <button
            type="button"
            onClick={handleQuickGenerateNotice}
            disabled={isGeneratingNotice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded shadow-xs focus:outline-none focus:ring-1 focus:ring-govNavy transition-colors"
            title="Generate and download Section 36(1) Form-1 Notice PDF with cryptographic provenance"
          >
            <svg className="w-3.5 h-3.5 text-rose-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{isGeneratingNotice ? "Generating Form-1..." : "Form-1 Notice PDF"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdjudicationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold rounded shadow focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>{caseData.adjudication ? "Update Adjudication" : "Adjudicate Case (LMO)"}</span>
          </button>
        </div>
      </div>

      {/* Notice Action Banner */}
      {noticeResultMsg && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-md text-xs flex items-center justify-between shadow-xs">
          <span>{noticeResultMsg}</span>
          <button type="button" onClick={() => setNoticeResultMsg(null)} className="text-blue-700 font-bold ml-2 hover:text-blue-900">×</button>
        </div>
      )}

      {/* 2. Flagship Split-View Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (6 cols): Calibrated Evidence Viewer with SVG Polygon Overlays */}
        <div className="lg:col-span-6 h-full">
          {activeAsset ? (
            <EvidenceViewer
              asset={activeAsset}
              productName={caseData.product_name}
              selectedTokenId={selectedTokenId}
              selectedFinding={selectedFinding}
              selectedField={selectedField}
              findings={findings}
              extractedFields={fields}
              onSelectToken={handleSelectToken}
              onRetakeRequested={onRetakeRequested}
            />
          ) : (
            <div className="p-8 bg-panelBg rounded-lg border border-slate-200 text-center text-xs text-slate-500">
              No evidence asset available for this inspection case.
            </div>
          )}
        </div>

        {/* Right Column (6 cols): Findings Ledger, Forensic Inspector, Audit, Provenance, Handoff */}
        <div className="lg:col-span-6 space-y-3">
          {/* Right Pane Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 p-1.5 rounded-t-lg gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setRightTab("FINDINGS")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                rightTab === "FINDINGS"
                  ? "bg-white text-govNavy shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Statutory Findings ({findings.length})
            </button>
            <button
              type="button"
              onClick={() => setRightTab("DETAILS")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                rightTab === "DETAILS"
                  ? "bg-white text-govNavy shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Forensic Detail
            </button>
            <button
              type="button"
              onClick={() => setRightTab("AUDIT")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                rightTab === "AUDIT"
                  ? "bg-white text-govNavy shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Audit Timeline ({caseData.audit_trail?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setRightTab("PROVENANCE")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                rightTab === "PROVENANCE"
                  ? "bg-white text-govNavy shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Provenance & DAG
            </button>
            <button
              type="button"
              onClick={() => setRightTab("HANDOFF")}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-colors ${
                rightTab === "HANDOFF"
                  ? "bg-white text-govNavy shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Case Readiness
            </button>
          </div>

          {/* Tab 1: Findings Ledger */}
          {rightTab === "FINDINGS" && (
            <FindingsLedger
              findings={findings}
              extractedFields={fields}
              selectedFindingId={selectedFinding?.finding_id}
              onSelectFinding={handleSelectFinding}
              caseAdjudication={caseData.adjudication}
              findingDecisions={caseData.finding_decisions}
            />
          )}

          {/* Tab 2: Forensic Detail Inspector */}
          {rightTab === "DETAILS" && (
            <FieldDetailPanel
              finding={selectedFinding}
              field={selectedField}
              tokens={selectedTokens}
              onSelectToken={handleSelectToken}
              caseAdjudication={caseData.adjudication}
              findingAdjudication={selectedFinding ? caseData.finding_decisions?.[selectedFinding.finding_id] : undefined}
            />
          )}

          {/* Tab 3: Chronological Audit Record */}
          {rightTab === "AUDIT" && (
            <AuditTimeline
              auditTrail={caseData.audit_trail || []}
              onSelectFinding={handleSelectFinding}
            />
          )}

          {/* Tab 4: Evidence Provenance & Dynamic DAG */}
          {rightTab === "PROVENANCE" && (
            <EvidenceProvenancePanel
              caseData={caseData}
              activeAsset={activeAsset}
              onSelectFinding={handleSelectFinding}
            />
          )}

          {/* Tab 5: Case Handoff Readiness Checklist */}
          {rightTab === "HANDOFF" && (
            <CaseHandoffState
              caseData={caseData}
              onOpenAdjudication={() => setIsAdjudicationModalOpen(true)}
            />
          )}
        </div>
      </div>

      {/* 3. Forensic Traceability & Evidence Breadcrumb Rail */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-3.5 border border-slate-800 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            <span>Forensic Evidence Traceability Path:</span>
          </div>

          <span className="text-[10px] text-slate-400">
            Source: Rule Engine (AST) & Multilingual OCR (DBNet++ / PP-OCRv4 / PP-OCRv3)
          </span>
        </div>

        {/* Chain Trace */}
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-950/60 p-2 rounded border border-slate-800">
          <span className="text-slate-400 font-sans">1. Physical Evidence:</span>
          <span className="text-white font-bold">{activeAsset?.image_id || "Awaiting asset"}</span>
          <span className="text-amber-500 font-bold">→</span>

          <span className="text-slate-400 font-sans">2. OCR Token:</span>
          <span className="text-cyan-300 font-bold">
            {selectedTokenId ? `#${selectedTokenId}` : selectedTokens[0]?.token_id ? `#${selectedTokens[0].token_id}` : "Unselected"}
          </span>
          <span className="text-amber-500 font-bold">→</span>

          <span className="text-slate-400 font-sans">3. Extracted Field:</span>
          <span className="text-indigo-300 font-bold">
            {selectedField?.field_type || "None"}
          </span>
          <span className="text-amber-500 font-bold">→</span>

          <span className="text-slate-400 font-sans">4. Compliance Finding:</span>
          <span className="text-amber-300 font-bold">
            {selectedFinding?.rule_code || "None"}
          </span>
          <span className="text-amber-500 font-bold">→</span>

          <span className="text-slate-400 font-sans">5. Adjudication:</span>
          <span className="text-emerald-400 font-bold">
            {caseData.adjudication ? caseData.adjudication.verdict : "Pending Officer Decision"}
          </span>
        </div>
      </div>

      {/* 4. Completed Adjudication Record Display (Audit Integrity) */}
      {caseData.adjudication && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-700 text-white font-bold text-[10px]">
                OFFICER ADJUDICATION RECORDED
              </span>
              <span className="font-bold text-emerald-950 font-mono">
                {caseData.adjudication.verdict}
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-800">
              {new Date(caseData.adjudication.timestamp_utc).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-emerald-900">
            <div>
              <span className="font-bold text-[10px] uppercase text-emerald-700 block">Adjudicating Officer</span>
              <span>{caseData.adjudication.officer_name} ({caseData.adjudication.badge_number})</span>
            </div>
            <div>
              <span className="font-bold text-[10px] uppercase text-emerald-700 block">Action Order</span>
              <span className="font-mono">{caseData.adjudication.action_order}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-200">
            <span className="font-bold text-[10px] uppercase text-emerald-700 block">
              Mandatory Officer Justification Remarks:
            </span>
            <p className="mt-0.5 text-emerald-950 bg-white p-2.5 rounded border border-emerald-200 font-sans leading-relaxed">
              "{caseData.adjudication.remarks}"
            </p>
          </div>
        </div>
      )}

      {/* 5. Adjudication Dialog Modal */}
      <OfficerAdjudicationModal
        isOpen={isAdjudicationModalOpen}
        onClose={() => setIsAdjudicationModalOpen(false)}
        caseData={caseData}
        onSubmitAdjudication={handleSubmitAdjudication}
        isSubmitting={isSubmittingAdjudication}
      />
    </div>
  );
};
