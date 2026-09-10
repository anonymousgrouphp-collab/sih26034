import React from "react";
import { RuleFinding, ExtractedField, OCRToken } from "../../types/inspection";
import { VerdictBadge } from "../../components/common/StatusBadge";

interface FieldDetailPanelProps {
  finding?: RuleFinding;
  field?: ExtractedField;
  tokens: OCRToken[];
  onSelectToken?: (tokenId: string) => void;
}

export const FieldDetailPanel: React.FC<FieldDetailPanelProps> = ({
  finding,
  field,
  tokens,
  onSelectToken,
}) => {
  if (!finding && !field && tokens.length === 0) {
    return (
      <div className="bg-panelBg rounded-lg border border-slate-200 p-6 text-center text-slate-500 text-xs italic">
        Select a compliance finding from the ledger or an OCR polygon on the physical package to inspect the forensic chain of evidence.
      </div>
    );
  }

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
      {/* 1. Header: Finding Status & Statutory Citation */}
      <div className="border-b border-slate-200 pb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
              Forensic Evidence Record
            </span>
            {finding?.finding_id && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                #{finding.finding_id}
              </span>
            )}
          </div>
          <h3 className="text-sm font-bold text-govNavy mt-0.5">
            {field?.field_type
              ? field.field_type.replace(/_/g, " ")
              : finding?.field_type
              ? finding.field_type.replace(/_/g, " ")
              : "Declaration Analysis"}
          </h3>
        </div>
        {finding && <VerdictBadge verdict={finding.status as any} size="sm" />}
      </div>

      {/* 2. Special Review / Unable to Verify Guidance Banner */}
      {finding?.status === "REVIEW" && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-md text-xs space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>OFFICER REVIEW REQUIRED</span>
          </div>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            {finding.discrepancy || "Measurement falls within the reported sensor uncertainty band. Physical caliper verification recommended before adjudication."}
          </p>
        </div>
      )}

      {finding?.status === "UNABLE_TO_VERIFY" && (
        <div className="p-3 bg-slate-100 border border-slate-300 rounded-md text-xs space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>UNABLE TO VERIFY</span>
          </div>
          <p className="text-slate-700 text-[11px] leading-relaxed">
            {finding.discrepancy || "Evidence is degraded or insufficient for automated statutory verification. Officer image recapture advised."}
          </p>
        </div>
      )}

      {/* 3. Canonical Rule Engine Findings */}
      {finding && (
        <div className="space-y-2 text-xs">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Backend Statutory Evaluation
          </h4>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Observed Measurement</span>
                <span className="font-bold text-slate-900 text-xs">{finding.measured_value}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Prescribed Threshold</span>
                <span className="font-semibold text-slate-700 text-xs">{finding.required_value}</span>
              </div>
            </div>

            {finding.discrepancy && (
              <div className="pt-1.5 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold block font-mono">Quantified Discrepancy</span>
                <span className="text-slate-800 text-[11px] font-sans font-medium">
                  {finding.discrepancy}
                </span>
              </div>
            )}

            <div className="pt-1.5 border-t border-slate-200 space-y-1">
              <div className="flex items-start justify-between gap-2 text-[11px]">
                <span className="text-slate-500 font-semibold">Statutory Reference:</span>
                <span className="text-govNavy font-bold text-right truncate max-w-xs" title={finding.statutory_reference}>
                  {finding.statutory_reference}
                </span>
              </div>
              {finding.legal_consequence && (
                <div className="flex items-start justify-between gap-2 text-[11px]">
                  <span className="text-slate-500 font-semibold">Legal Consequence:</span>
                  <span className="text-rose-700 font-semibold text-right truncate max-w-xs" title={finding.legal_consequence}>
                    {finding.legal_consequence}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Extracted Field Details (Rule 6 LMPC Declarations) */}
      {field && (
        <div className="space-y-2 text-xs">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Semantic Extraction Record
          </h4>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block font-mono">Raw OCR Text Stream</span>
              <div className="p-2 bg-white rounded border border-slate-200 font-sans text-xs text-slate-800 font-medium">
                {field.raw_ocr_text}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Extraction Confidence</span>
                <span className="font-bold text-slate-800">{(field.detection_confidence * 100).toFixed(1)}%</span>
              </div>
              {field.measured_font_height_mm !== undefined && (
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Measured Font Height</span>
                  <span className="font-bold text-govNavy">{field.measured_font_height_mm.toFixed(2)} mm</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Multilingual OCR Token Inspector */}
      {tokens.length > 0 && (
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Multilingual OCR Tokens ({tokens.length})
            </h4>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold">
              Unicode & Indic Preserved
            </span>
          </div>

          <div className="space-y-2">
            {tokens.map((tok) => (
              <div
                key={tok.token_id}
                onClick={() => onSelectToken && onSelectToken(tok.token_id)}
                className="p-2.5 bg-slate-900 text-slate-100 rounded-lg border border-slate-800 font-mono text-xs space-y-1.5 cursor-pointer hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold">#{tok.token_id}</span>
                  <span className="text-slate-400 text-[10px]">
                    {tok.model_source || "PP-OCR"} • Conf: {(tok.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Character String Preserving Devanagari Hindi Text & Indic Numerals */}
                <div className="font-sans text-white text-xs font-semibold bg-slate-800/80 p-2 rounded border border-slate-700">
                  {tok.text}
                </div>

                {/* Coordinates */}
                <div className="text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Polygon: {tok.polygon.length} vertices</span>
                  <span className="truncate max-w-[200px]" title={JSON.stringify(tok.polygon)}>
                    [{tok.polygon.map(([x, y]) => `(${x},${y})`).join(", ")}]
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
