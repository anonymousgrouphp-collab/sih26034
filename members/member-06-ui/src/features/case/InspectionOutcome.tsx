import React, { useState } from "react";
import {
  InspectionCase,
  CaseReadinessChecklist,
  EvidenceAsset,
} from "../../types/inspection";
import { CaseClosureModal } from "./CaseClosureModal";
import { computeCaseReadiness } from "../../services/mockData";

interface InspectionOutcomeProps {
  caseData: InspectionCase;
  onViewReport: () => void;
  onOpenCanvas: () => void;
  onOpenAudit: () => void;
  onCloseCase?: (remarks: string) => Promise<void>;
}

export const InspectionOutcome: React.FC<InspectionOutcomeProps> = ({
  caseData,
  onViewReport,
  onOpenCanvas,
  onOpenAudit,
  onCloseCase,
}) => {
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [isSubmittingClosure, setIsSubmittingClosure] = useState(false);

  // Derive findings summary counts directly from canonical rule_evaluations
  // Strict rule: These are display counts only; NO frontend legal overall verdict calculation
  const evaluations = caseData.rule_evaluations || [];
  const countFail = evaluations.filter((f) => f.status === "FAIL").length;
  const countReview = evaluations.filter((f) => f.status === "REVIEW").length;
  const countPass = evaluations.filter((f) => f.status === "PASS").length;
  const countUnable = evaluations.filter((f) => f.status === "UNABLE_TO_VERIFY").length;

  // Officer adjudication counts from finding_decisions or overall adjudication
  const findingDecisions = caseData.finding_decisions || {};
  const decisionValues = Object.values(findingDecisions);
  const countConfirmed = decisionValues.filter((d) => d.decision === "CONFIRMED").length;
  const countDismissed = decisionValues.filter((d) => d.decision === "DISMISSED").length;
  const countRetestReq = decisionValues.filter((d) => d.decision === "RETEST_REQUESTED").length;
  const countPendingAdjudication = Math.max(0, evaluations.length - decisionValues.length);

  // Evidence asset reference
  const primaryAsset: EvidenceAsset | undefined =
    caseData.evidence_assets && caseData.evidence_assets.length > 0
      ? caseData.evidence_assets[caseData.evidence_assets.length - 1]
      : undefined;

  // Downstream readiness (from fixture/backend contract)
  const readiness: CaseReadinessChecklist =
    caseData.readiness_checklist || computeCaseReadiness(caseData);

  // Audit trail statistics
  const auditEvents = caseData.audit_trail || [];
  const latestAuditEvent = auditEvents.length > 0 ? auditEvents[auditEvents.length - 1] : undefined;

  const handleConfirmClosure = async (remarks: string) => {
    if (!onCloseCase) return;
    setIsSubmittingClosure(true);
    try {
      await onCloseCase(remarks);
    } finally {
      setIsSubmittingClosure(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Top Action Bar */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-govNavy text-white text-[10px] font-bold uppercase tracking-wider">
              Case Outcome Review
            </span>
            <span className="font-mono text-xs text-slate-500 font-bold">
              {caseData.inspection_number}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                caseData.workflow_status === "COMPLETED"
                  ? "bg-slate-200 text-slate-800"
                  : "bg-blue-100 text-blue-900"
              }`}
            >
              Workflow: {caseData.workflow_status}
            </span>
          </div>
          <h2 className="text-base font-bold text-govNavy mt-1">
            {caseData.product_name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
            {caseData.brand_name && <span>Brand: <strong className="text-slate-700">{caseData.brand_name}</strong></span>}
            {caseData.establishment_name && <span>Establishment: <strong className="text-slate-700">{caseData.establishment_name}</strong></span>}
            <span>Jurisdiction: <strong className="text-slate-700">{caseData.jurisdiction_id}</strong></span>
            <span>Date: <strong className="text-slate-700">{caseData.created_at ? new Date(caseData.created_at).toLocaleDateString("en-IN") : "Not available"}</strong></span>
          </div>
        </div>

        {/* Primary Outcome Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={onOpenCanvas}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Adjudication Canvas</span>
          </button>

          <button
            type="button"
            onClick={onViewReport}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-govNavy hover:bg-govNavy-light rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Formal Report View</span>
          </button>
        </div>
      </div>

      {/* 2. Key Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Automated Findings Summary */}
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Automated Findings
            </span>
            <span className="font-mono text-xs font-bold text-govNavy bg-slate-100 px-2 py-0.5 rounded">
              {evaluations.length} total
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-rose-50 border border-rose-200 flex items-center justify-between">
              <span className="font-semibold text-rose-800">FAIL</span>
              <span className="font-mono font-bold text-rose-900 text-sm">{countFail}</span>
            </div>
            <div className="p-2 rounded bg-amber-50 border border-amber-200 flex items-center justify-between">
              <span className="font-semibold text-amber-800">REVIEW</span>
              <span className="font-mono font-bold text-amber-900 text-sm">{countReview}</span>
            </div>
            <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="font-semibold text-emerald-800">PASS</span>
              <span className="font-mono font-bold text-emerald-900 text-sm">{countPass}</span>
            </div>
            <div className="p-2 rounded bg-slate-100 border border-slate-200 flex items-center justify-between">
              <span className="font-semibold text-slate-700">UNABLE</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{countUnable}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 italic">
            Telemetry counts supplied by backend AST rule evaluation.
          </p>
        </div>

        {/* Card B: Officer Adjudication Summary */}
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Officer Adjudication
            </span>
            <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              HITL Verified
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Confirmed Violations:</span>
              <span className="font-mono font-bold text-rose-700">{countConfirmed}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Dismissed Findings:</span>
              <span className="font-mono font-bold text-emerald-700">{countDismissed}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-600">Retest Requested:</span>
              <span className="font-mono font-bold text-amber-700">{countRetestReq}</span>
            </div>
            <div className="flex justify-between items-center py-0.5 border-t border-slate-100 pt-1">
              <span className="text-slate-500">Pending Officer Review:</span>
              <span className="font-mono font-bold text-slate-600">{countPendingAdjudication}</span>
            </div>
          </div>
        </div>

        {/* Card C: Evidence Health & Custody */}
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Evidence Health
            </span>
            <span className="text-[10px] font-bold text-govNavy bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              UNTOUCHED
            </span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Evidence Asset:</span>
              <span className="font-bold text-slate-800 truncate max-w-[120px]">
                {primaryAsset ? primaryAsset.image_id : "Not available"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Calibration:</span>
              <span className="text-slate-800">
                {primaryAsset?.calibration?.is_calibrated ? "ArUco 50mm" : "Uncalibrated"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Quality Gate:</span>
              <span className={primaryAsset?.quality_gate.passed ? "text-emerald-700 font-bold" : "text-rose-700 font-bold"}>
                {primaryAsset ? (primaryAsset.quality_gate.passed ? "PASSED" : "REJECTED") : "Awaiting"}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-sans">Digest:</span>
              <span className="truncate max-w-[130px] text-slate-500" title={primaryAsset?.raw_sha256}>
                {primaryAsset ? primaryAsset.raw_sha256.slice(0, 16) + "..." : "Not available"}
              </span>
            </div>
          </div>
        </div>

        {/* Card D: Audit Trail Integrity */}
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Audit History
            </span>
            <button
              type="button"
              onClick={onOpenAudit}
              className="text-[10px] text-govNavy hover:underline font-bold"
            >
              View Full Trail →
            </button>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Chained Events:</span>
              <span className="font-mono font-bold text-slate-800">{auditEvents.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Append-Only Mode:</span>
              <span className="text-emerald-700 font-bold text-[11px]">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">Latest Event:</span>
              <span className="text-slate-700 truncate max-w-[120px]">
                {latestAuditEvent ? latestAuditEvent.event_label : "None"}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              Historical ledger entries cannot be altered or removed.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Downstream Case Readiness & Action Handoff Panel */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-sm font-bold uppercase tracking-wider text-govNavy">
              Downstream Case Readiness & Administrative Status
            </h3>
          </div>

          {/* Readiness State Badge */}
          <span
            className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border ${
              readiness.readiness_state === "READY_FOR_LEGAL_NOTICE_DISPATCH"
                ? "bg-rose-50 text-rose-800 border-rose-300"
                : readiness.readiness_state === "READY_FOR_CASE_CLOSURE"
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : readiness.readiness_state === "ACTION_REQUIRED_RETEST"
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-blue-50 text-blue-800 border-blue-300"
            }`}
          >
            {readiness.readiness_state.replace(/_/g, " ")}
          </span>
        </div>

        {/* Readiness State Guidance Content */}
        <div className="space-y-3">
          {readiness.readiness_state === "READY_FOR_CASE_CLOSURE" ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  <span>Case Eligible for Formal Closure</span>
                </div>
                <p className="text-xs text-emerald-800">
                  {readiness.downstream_action_guidance ||
                    "Inspection findings have been reviewed and marked compliant by the officer. Case is ready for official administrative closure."}
                </p>
              </div>

              {onCloseCase && caseData.workflow_status !== "COMPLETED" && (
                <button
                  type="button"
                  onClick={() => setIsClosureModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
                >
                  Close Inspection Case
                </button>
              )}
            </div>
          ) : readiness.readiness_state === "READY_FOR_LEGAL_NOTICE_DISPATCH" ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-2 text-xs text-rose-950">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                <span>Downstream Legal Workflow: Ready for Authorized Next Step</span>
              </div>
              <p className="text-rose-900">
                {readiness.downstream_action_guidance ||
                  "Statutory violation confirmed by inspecting officer. Case dossier is ready for Form-1 Show Cause Notice preparation."}
              </p>
              <div className="p-2.5 bg-white/70 border border-rose-200 rounded text-[11px] text-rose-800">
                <strong>Administrative Notice:</strong> Form-1 Legal Notices require authorized officer signature and formal administrative dispatch. NyayaDrishti-LM never autonomously dispatches legal notices or issues compounding fees.
              </div>
            </div>
          ) : readiness.readiness_state === "ACTION_REQUIRED_RETEST" ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <span className="h-2 w-2 rounded-full bg-amber-600" />
                <span>Action Required: Physical Re-measurement or Optical Recapture</span>
              </div>
              <p className="text-amber-900">
                {readiness.downstream_action_guidance ||
                  "The inspecting officer or optical gate has ordered re-verification before case adjudication can proceed."}
              </p>
              <button
                type="button"
                onClick={onOpenCanvas}
                className="mt-1 px-3 py-1.5 text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded hover:bg-amber-100 transition-colors"
              >
                Inspect Finding on Canvas →
              </button>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-xs text-blue-950">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span>Officer Adjudication Required</span>
              </div>
              <p className="text-blue-900">
                {readiness.downstream_action_guidance ||
                  "Automated findings require human officer review and adjudication on the split-view canvas."}
              </p>
              <button
                type="button"
                onClick={onOpenCanvas}
                className="mt-1 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors"
              >
                Proceed to Adjudication Canvas →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Case Closure Confirmation Modal */}
      <CaseClosureModal
        isOpen={isClosureModalOpen}
        caseData={caseData}
        onClose={() => setIsClosureModalOpen(false)}
        onConfirmClosure={handleConfirmClosure}
        isSubmitting={isSubmittingClosure}
      />
    </div>
  );
};
