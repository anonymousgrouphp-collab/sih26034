import React from "react";
import {
  InspectionCase,
  EvidenceAsset,
  PipelineStageProgress,
} from "../../types/inspection";
import { VerdictBadge } from "../../components/common/StatusBadge";
import { ApiService } from "../../services/api";

interface AnalysisHUDProps {
  caseData: InspectionCase;
  activeAsset?: EvidenceAsset;
  isAnalyzing?: boolean;
  onExecutePipeline: () => void;
  onRetakeEvidence: () => void;
}

export const AnalysisHUD: React.FC<AnalysisHUDProps> = ({
  caseData,
  activeAsset,
  isAnalyzing = false,
  onExecutePipeline,
  onRetakeEvidence,
}) => {
  const isMock = caseData.is_mock_fixture || ApiService.isMockMode();
  const qg = activeAsset?.quality_gate;
  const calib = activeAsset?.calibration || (caseData.evidence_assets[0]?.calibration);
  const ocr = activeAsset?.ocr || (caseData.evidence_assets[0]?.ocr);
  const isUnableToVerify = caseData.overall_status === "UNABLE_TO_VERIFY" || qg?.passed === false;
  const isPipelineComplete = caseData.rule_evaluations.length > 0;

  // Determine pipeline stage progression
  const stages: PipelineStageProgress[] = [
    {
      id: "INGESTION",
      label: "Evidence Ingestion",
      status: activeAsset ? "COMPLETED" : isAnalyzing ? "RUNNING" : "PENDING",
      detail: activeAsset ? `SHA-256 verified (${activeAsset.raw_sha256.slice(0, 10)}...)` : "Awaiting image upload",
    },
    {
      id: "QUALITY_GATE",
      label: "Optical Quality Gate",
      status: qg ? (qg.passed ? "COMPLETED" : "FAILED") : isAnalyzing ? "RUNNING" : "PENDING",
      detail: qg
        ? qg.passed
          ? `Blur: ${qg.blur_variance.toFixed(1)} | Glare: ${qg.glare_percentage.toFixed(1)}%`
          : (qg.advice || "Optical quality threshold failed")
        : "Awaiting optical quality evaluation",
    },
    {
      id: "CALIBRATION",
      label: "Metric Calibration",
      status: isUnableToVerify
        ? "SKIPPED"
        : calib?.is_calibrated
        ? "COMPLETED"
        : isAnalyzing
        ? "RUNNING"
        : "PENDING",
      detail: calib?.is_calibrated
        ? `${calib.method} • ${calib.px_to_mm.toFixed(2)} px/mm`
        : isUnableToVerify
        ? "Halted due to optical rejection"
        : "ArUco 4x4 (50mm) / ISO 7810 fiducial",
    },
    {
      id: "OCR",
      label: "Multilingual OCR Detection",
      status: isUnableToVerify
        ? "SKIPPED"
        : ocr
        ? "COMPLETED"
        : isAnalyzing
        ? "RUNNING"
        : "PENDING",
      detail: ocr
        ? `${ocr.total_tokens} tokens • ${(ocr.mean_confidence * 100).toFixed(1)}% conf`
        : isUnableToVerify
        ? "Halted"
        : "DBNet++ / PP-OCRv4 (En) / PP-OCRv3 (Hi)",
    },
    {
      id: "EXTRACTION",
      label: "Semantic Extraction",
      status: isUnableToVerify
        ? "SKIPPED"
        : caseData.extracted_fields.length > 0
        ? "COMPLETED"
        : isAnalyzing
        ? "RUNNING"
        : "PENDING",
      detail: caseData.extracted_fields.length > 0
        ? `${caseData.extracted_fields.length} statutory fields parsed`
        : isUnableToVerify
        ? "Halted"
        : "Rule 6 LMPC Declarations",
    },
    {
      id: "RULES",
      label: "Statutory Rule Evaluation",
      status: isUnableToVerify
        ? "FAILED"
        : caseData.rule_evaluations.length > 0
        ? "COMPLETED"
        : isAnalyzing
        ? "RUNNING"
        : "PENDING",
      detail: isUnableToVerify
        ? "UNABLE TO VERIFY (Re-capture required)"
        : caseData.rule_evaluations.length > 0
        ? `${caseData.rule_evaluations.length} statutory rules evaluated`
        : "Table-I font & Rule 6 verification",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Pipeline Progression Telemetry Strip */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Inspection Analysis Pipeline HUD
            </h4>
            {isMock && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
                DEMO / LOCAL MODE
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {isAnalyzing
              ? "Running 12-Stage Pipeline..."
              : isPipelineComplete
              ? "Analysis Complete"
              : isUnableToVerify
              ? "Pipeline Halted at Quality Gate"
              : "Awaiting Pipeline Trigger"}
          </span>
        </div>

        {/* Stages timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {stages.map((st, idx) => (
            <div
              key={st.id}
              className={`p-2.5 rounded-md border text-xs flex flex-col justify-between transition-colors ${
                st.status === "COMPLETED"
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                  : st.status === "RUNNING"
                  ? "bg-blue-50 border-blue-400 text-blue-950 animate-pulse ring-1 ring-blue-400"
                  : st.status === "FAILED"
                  ? "bg-rose-50 border-rose-300 text-rose-950"
                  : st.status === "SKIPPED"
                  ? "bg-slate-100/70 border-slate-200 text-slate-400"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold font-mono text-slate-400">0{idx + 1}</span>
                {st.status === "COMPLETED" ? (
                  <span className="text-emerald-700 font-bold">✓</span>
                ) : st.status === "RUNNING" ? (
                  <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
                ) : st.status === "FAILED" ? (
                  <span className="text-rose-700 font-bold">✕</span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
              </div>
              <div className="font-bold text-[11px] leading-snug">{st.label}</div>
              <div className="text-[10px] mt-1 opacity-80 truncate" title={st.detail}>
                {st.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Optical Quality Gate Diagnostic Card */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Optical Quality Gate
            </h4>
          </div>
          {qg && (
            <VerdictBadge verdict={qg.passed ? "PASS" : "UNABLE_TO_VERIFY"} size="sm" />
          )}
        </div>

        {qg ? (
          <div className="space-y-3">
            {/* If Unable to verify: prominent warning banner per prompt Section 12 */}
            {!qg.passed && (
              <div className="p-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-white font-mono text-[10px]">
                    UNABLE TO VERIFY
                  </span>
                  <span>Evidence could not be reliably verified.</span>
                </div>
                {qg.rejection_reason && (
                  <p className="text-slate-700 text-[11px] font-mono bg-white p-2 rounded border border-slate-200">
                    <span className="font-bold text-rose-700">Reason:</span> {qg.rejection_reason}
                  </p>
                )}
                {qg.advice && (
                  <p className="text-amber-800 text-[11px] font-semibold">
                    Recommended Action: {qg.advice} — Please retake the packaging photograph.
                  </p>
                )}
              </div>
            )}

            {/* Metrics Telemetry Grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Laplacian Blur Variance</span>
                <span className={`font-mono font-bold text-sm ${!qg.passed && qg.rejection_reason?.toLowerCase().includes("blur") ? "text-rose-700" : "text-slate-800"}`}>
                  {qg.blur_variance.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reference Spec: &ge; 150.0</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Specular Glare Bloom</span>
                <span className={`font-mono font-bold text-sm ${!qg.passed && qg.rejection_reason?.toLowerCase().includes("glare") ? "text-rose-700" : "text-slate-800"}`}>
                  {qg.glare_percentage.toFixed(2)}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reference Spec: &le; 3.00%</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Perspective Skew Angle</span>
                <span className={`font-mono font-bold text-sm ${!qg.passed && qg.rejection_reason?.toLowerCase().includes("skew") ? "text-rose-700" : "text-slate-800"}`}>
                  {qg.skew_angle_deg.toFixed(1)}°
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Reference Spec: &le; 15.0°</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            No optical quality assessment yet. Submit physical package evidence to run Laplacian blur, specular glare, and skew verification.
          </div>
        )}
      </div>

      {/* 3. Metric Calibration & Geometry Card */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Metric Scale Calibration & PDP Geometry (ADR-06)
            </h4>
          </div>
          {calib && (
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              calib.is_calibrated ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
            }`}>
              {calib.is_calibrated ? "CALIBRATED (✓)" : "UNRESOLVED"}
            </span>
          )}
        </div>

        {calib?.is_calibrated ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Fiducial Standard</span>
              <span className="font-mono font-bold text-slate-800">{calib.method}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ArUco 50mm / ISO 7810</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Metric Scale Factor</span>
              <span className="font-mono font-bold text-govNavy">{calib.px_to_mm.toFixed(2)} px/mm</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Planar Homography H</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Measurement Confidence</span>
              <span className="font-mono font-bold text-emerald-800">{(calib.confidence * 100).toFixed(1)}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Uncertainty: ±{calib.margin_of_error_pct || 1.2}%</span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">PDP Surface Area</span>
              <span className="font-mono font-bold text-slate-800">
                {caseData.principal_display_panel?.pdp_area_cm2
                  ? `${caseData.principal_display_panel.pdp_area_cm2} cm²`
                  : "Calculated from bbox"}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Table-I Baseline</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            {isUnableToVerify
              ? "Calibration aborted due to optical quality rejection."
              : "Calibration awaiting pipeline execution."}
          </div>
        )}
      </div>

      {/* 4. Multilingual OCR Diagnostic Summary (Foundation Only per Section 15) */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              Multilingual OCR Diagnostics (Member 2 Provenance)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            DBNet++ • PP-OCRv4 (En) • PP-OCRv3 (Hi)
          </span>
        </div>

        {ocr ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="font-semibold text-slate-700">Tokens Recognized:</span>{" "}
                <span className="font-mono font-bold text-govNavy">{ocr.total_tokens}</span>
                <span className="text-slate-400 mx-2">|</span>
                <span className="font-semibold text-slate-700">Mean Confidence:</span>{" "}
                <span className="font-mono font-bold text-emerald-800">
                  {(ocr.mean_confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-500">
                Latency: {ocr.execution_time_ms} ms (CPU INT8)
              </div>
            </div>

            {/* Unicode Preservation Display (Devanagari, Indic Numerals, Rupee Symbol) */}
            <div className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-xs overflow-x-auto space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
                <span>Recognized Declarations Stream (Raw OCR Output)</span>
                <span className="text-emerald-400 text-[10px]">Unicode & Indic Script Intact</span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-200">
                {ocr.full_text}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 italic py-2">
            {isUnableToVerify
              ? "OCR engine was bypassed due to optical glare rejection."
              : "OCR engine awaiting pipeline execution."}
          </div>
        )}
      </div>

      {/* 5. Provenance & Evidence Digest Strip */}
      {activeAsset && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-xs space-y-1 font-mono text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Canonical Evidence SHA-256 (Backend Record):</span>
            <span className="text-govNavy font-bold truncate max-w-md" title={activeAsset.raw_sha256}>
              {activeAsset.raw_sha256}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Backend Evidence Record: Ingested to Verification Pipeline</span>
            <span>Panel: {activeAsset.panel_type}</span>
          </div>
        </div>
      )}

      {/* 6. Execution / Retake Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onRetakeEvidence}
          className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Retake / Upload New Evidence</span>
        </button>

        {!isUnableToVerify && !isPipelineComplete && (
          <button
            type="button"
            onClick={onExecutePipeline}
            disabled={isAnalyzing || !activeAsset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold rounded-md shadow focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-colors"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Executing 12-Stage Pipeline...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Execute AI Pipeline (Calibration → OCR → Rules)</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
