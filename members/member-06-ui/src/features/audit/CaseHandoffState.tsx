import React from "react";
import { InspectionCase } from "../../types/inspection";
import { computeCaseReadiness } from "../../services/mockData";

interface CaseHandoffStateProps {
  caseData: InspectionCase;
  onOpenAdjudication?: () => void;
}

export const CaseHandoffState: React.FC<CaseHandoffStateProps> = ({
  caseData,
  onOpenAdjudication,
}) => {
  const readiness = computeCaseReadiness(caseData);

  const getReadinessBadge = () => {
    switch (readiness.readiness_state) {
      case "READY_FOR_LEGAL_NOTICE_DISPATCH":
        return {
          label: "READY FOR SHOW CAUSE NOTICE",
          classes: "bg-rose-100 text-rose-900 border-rose-300",
          icon: "⚠️",
        };
      case "READY_FOR_CASE_CLOSURE":
        return {
          label: "READY FOR COMPLIANT CLOSURE",
          classes: "bg-emerald-100 text-emerald-900 border-emerald-300",
          icon: "✓",
        };
      case "ACTION_REQUIRED_RETEST":
        return {
          label: "ACTION REQUIRED: RE-TEST",
          classes: "bg-amber-100 text-amber-900 border-amber-300",
          icon: "🔄",
        };
      case "PENDING_OFFICER_REVIEW":
      default:
        return {
          label: "PENDING OFFICER ADJUDICATION",
          classes: "bg-blue-100 text-blue-900 border-blue-300",
          icon: "⏳",
        };
    }
  };

  const badge = getReadinessBadge();

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Case Dossier Handoff Readiness
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Evaluation of case prerequisites before downstream legal notice drafting or administrative closure.
          </p>
        </div>

        <div className={`px-3 py-1 rounded-md border text-xs font-bold font-mono flex items-center gap-1.5 ${badge.classes}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      </div>

      {/* 1. Prerequisites Checklist */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Statutory Dossier Prerequisites Checklist
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Item 1: Evidence Availability */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${readiness.evidence_available ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                {readiness.evidence_available ? "✓" : "–"}
              </span>
              <span className="font-semibold text-slate-800">Physical Evidence Asset</span>
            </div>
            <span className={`font-mono text-[11px] font-bold ${readiness.evidence_available ? "text-emerald-700" : "text-slate-400"}`}>
              {readiness.evidence_available ? "AVAILABLE" : "MISSING"}
            </span>
          </div>

          {/* Item 2: Automated Pipeline Analysis */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${readiness.automated_analysis_completed ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                {readiness.automated_analysis_completed ? "✓" : "–"}
              </span>
              <span className="font-semibold text-slate-800">Automated Pipeline Findings</span>
            </div>
            <span className={`font-mono text-[11px] font-bold ${readiness.automated_analysis_completed ? "text-emerald-700" : "text-slate-400"}`}>
              {readiness.automated_analysis_completed ? "COMPLETE" : "PENDING"}
            </span>
          </div>

          {/* Item 3: Officer Adjudication */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${readiness.officer_adjudication_completed ? "bg-emerald-600 text-white" : "bg-amber-500 text-white"}`}>
                {readiness.officer_adjudication_completed ? "✓" : "!"}
              </span>
              <span className="font-semibold text-slate-800">Officer Adjudication (HITL)</span>
            </div>
            <span className={`font-mono text-[11px] font-bold ${readiness.officer_adjudication_completed ? "text-emerald-700" : "text-amber-700"}`}>
              {readiness.officer_adjudication_completed ? "RECORDED" : "REQUIRED"}
            </span>
          </div>

          {/* Item 4: Audit Record Completeness */}
          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${readiness.audit_record_complete ? "bg-emerald-600 text-white" : "bg-slate-300 text-slate-600"}`}>
                {readiness.audit_record_complete ? "✓" : "–"}
              </span>
              <span className="font-semibold text-slate-800">Audit Trail Record</span>
            </div>
            <span className={`font-mono text-[11px] font-bold ${readiness.audit_record_complete ? "text-emerald-700" : "text-slate-400"}`}>
              {readiness.audit_record_complete ? "VERIFIED" : "INCOMPLETE"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Downstream Action Guidance */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 uppercase text-[11px]">
            Statutory Guidance & Next Steps:
          </span>
          {caseData.adjudication?.action_order && (
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
              Order: {caseData.adjudication.action_order}
            </span>
          )}
        </div>

        <p className="text-slate-800 leading-relaxed">
          {readiness.downstream_action_guidance}
        </p>

        {/* Action Button for Unadjudicated Cases */}
        {!readiness.officer_adjudication_completed && onOpenAdjudication && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenAdjudication}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold rounded shadow transition-colors"
            >
              <span>Record Officer Adjudication Now</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Non-Autonomous Notice Disclaimer */}
      <div className="p-2.5 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-500 flex items-center justify-between">
        <span>
          Human-in-the-loop statutory boundary: legal show-cause notices and compounding orders are never dispatched autonomously by software.
        </span>
        <span className="font-mono text-[10px] text-slate-400 font-bold uppercase hidden md:inline">
          SECTION 15 COMPLIANCE
        </span>
      </div>
    </div>
  );
};
