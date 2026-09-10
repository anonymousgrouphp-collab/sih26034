import React, { useState } from "react";
import { RuleFinding, ExtractedField, EpistemicVerdict } from "../../types/inspection";
import { VerdictBadge } from "../../components/common/StatusBadge";
import { findFieldForFinding } from "./AdjudicationTraceability";

interface FindingsLedgerProps {
  findings: RuleFinding[];
  extractedFields: ExtractedField[];
  selectedFindingId?: string;
  onSelectFinding: (findingId: string) => void;
}

export const FindingsLedger: React.FC<FindingsLedgerProps> = ({
  findings,
  extractedFields,
  selectedFindingId,
  onSelectFinding,
}) => {
  const [filter, setFilter] = useState<"ALL" | "FAIL" | "REVIEW" | "PASS" | "UNABLE_TO_VERIFY">("ALL");

  // Filter findings
  const filteredFindings = findings.filter((f) => {
    if (filter === "ALL") return true;
    return f.status === filter;
  });

  // Count summaries
  const failCount = findings.filter((f) => f.status === "FAIL").length;
  const reviewCount = findings.filter((f) => f.status === "REVIEW").length;
  const passCount = findings.filter((f) => f.status === "PASS").length;
  const unableCount = findings.filter((f) => f.status === "UNABLE_TO_VERIFY").length;

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* 1. Header & Tabs */}
      <div className="p-3 border-b border-slate-200 space-y-2 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Statutory Findings Ledger
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-semibold">
            {findings.length} determinations
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
              filter === "ALL"
                ? "bg-govNavy text-white"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All ({findings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("FAIL")}
            className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
              filter === "FAIL"
                ? "bg-rose-700 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <span>Violations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200 text-rose-900 font-bold">
              {failCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("REVIEW")}
            className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
              filter === "REVIEW"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <span>Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
              {reviewCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter("PASS")}
            className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
              filter === "PASS"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <span>Pass</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-bold">
              {passCount}
            </span>
          </button>
          {unableCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("UNABLE_TO_VERIFY")}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
                filter === "UNABLE_TO_VERIFY"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
              }`}
            >
              <span>Degraded</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300 text-slate-800 font-bold">
                {unableCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Findings Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[520px]">
        {filteredFindings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 italic">
            No compliance findings match the selected filter.
          </div>
        ) : (
          filteredFindings.map((finding) => {
            const isSelected = selectedFindingId === finding.finding_id;
            const linkedField = findFieldForFinding(finding, extractedFields);

            return (
              <div
                key={finding.finding_id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onSelectFinding(finding.finding_id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectFinding(finding.finding_id);
                  }
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-govNavy ${
                  isSelected
                    ? "border-govNavy bg-blue-50/40 shadow-sm ring-1 ring-govNavy"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                {/* Finding Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">
                      {finding.rule_code.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {finding.field_type
                        ? finding.field_type.replace(/_/g, " ")
                        : linkedField?.field_type.replace(/_/g, " ") || "Statutory Declaration"}
                    </h4>
                  </div>
                  <VerdictBadge verdict={finding.status as EpistemicVerdict} size="sm" />
                </div>

                {/* Values Comparison Strip */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Observed</span>
                    <span
                      className={`font-semibold truncate block ${
                        finding.status === "FAIL"
                          ? "text-rose-700"
                          : finding.status === "REVIEW"
                          ? "text-amber-700"
                          : "text-slate-800"
                      }`}
                    >
                      {finding.measured_value}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Prescribed</span>
                    <span className="text-slate-700 font-semibold truncate block">
                      {finding.required_value}
                    </span>
                  </div>
                </div>

                {/* Discrepancy & Legal Notice Footnote */}
                {finding.discrepancy && (
                  <p className="mt-1.5 text-[11px] text-slate-600 leading-snug">
                    <span className="font-semibold text-slate-800">Finding: </span>
                    {finding.discrepancy}
                  </p>
                )}

                {/* Relational Evidence Link */}
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span>{linkedField?.token_ids?.[0] ? `#${linkedField.token_ids[0]}` : `#${finding.finding_id}`}</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">Click to trace on package ↗</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
