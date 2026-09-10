import React from "react";
import { InspectionCase, EvidenceAsset } from "../../types/inspection";

interface EvidenceProvenancePanelProps {
  caseData: InspectionCase;
  activeAsset?: EvidenceAsset;
  onSelectFinding?: (findingId: string) => void;
}

export const EvidenceProvenancePanel: React.FC<EvidenceProvenancePanelProps> = ({
  caseData,
  activeAsset,
}) => {
  const asset = activeAsset || caseData.evidence_assets[0];
  const dagNodes = caseData.evidence_graph?.nodes || [];

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-5">
      {/* Header */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
            Evidence Provenance & Cryptographic Chain
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Backend-verified evidentiary custody trail distinguishing original physical captures from derived analytical layers.
        </p>
      </div>

      {/* Operational Non-Mutation Notice */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start gap-2.5">
        <svg className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="space-y-0.5">
          <span className="font-bold">Original Evidence Integrity Preservation:</span>
          <p className="text-[11px] text-blue-900 leading-relaxed">
            Original evidence is preserved independently; derived annotations and analysis layers do not overwrite the original evidence artifact.
          </p>
        </div>
      </div>

      {/* 1. Original vs Derived Dual Column Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Original Evidence Card */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-govNavy uppercase text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Original Evidence (Untouched)
            </span>
            <span className="px-2 py-0.5 rounded bg-govNavy text-white font-mono text-[10px] font-bold">
              PRIMARY SOURCE
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Asset Reference:</span>
              <span className="font-bold text-slate-900">{asset?.image_id || "Unassigned"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Capture Source:</span>
              <span className="text-slate-800">{caseData.capture_source || "PHYSICAL_FIELD"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Packaging Facet:</span>
              <span className="text-slate-800">{asset?.panel_type || "PDP_FRONT"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Original Filename:</span>
              <span className="text-slate-800 truncate max-w-[170px]" title={asset?.original_filename}>
                {asset?.original_filename || "packaging_pdp.jpg"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Resolution:</span>
              <span className="text-slate-800">{asset?.image_width} × {asset?.image_height} px</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">MIME Type:</span>
              <span className="text-slate-800">{asset?.mime_type || "image/jpeg"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-sans text-slate-500">Preserved Untouched:</span>
              <span className="text-emerald-700 font-bold">
                {asset?.is_original_untouched !== false ? "YES (READ-ONLY)" : "NO"}
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-200">
              <span className="font-sans text-slate-500 block text-[10px] uppercase">
                Canonical SHA-256 (Backend Record):
              </span>
              <span className="text-slate-600 block truncate text-[10px] select-all bg-white p-1 rounded border border-slate-200 mt-0.5" title={asset?.raw_sha256}>
                {asset?.raw_sha256 || "Pending hash registration"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Derived Analytical Artifacts */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="font-bold text-slate-800 uppercase text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Derived Analytical Artifacts
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-mono text-[10px] font-bold">
              ANALYSIS LAYERS
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Optical Quality Gate:</span>
              <span className={`font-mono font-bold ${asset?.quality_gate?.passed ? "text-emerald-700" : "text-amber-700"}`}>
                {asset?.quality_gate?.passed ? "PASSED" : "REJECTED (UNABLE_TO_VERIFY)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Metric Scale Factor:</span>
              <span className="font-mono text-slate-800">
                {asset?.calibration?.px_to_mm ? `${asset.calibration.px_to_mm.toFixed(2)} px/mm` : "Uncalibrated"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Multilingual OCR Tokens:</span>
              <span className="font-mono text-slate-800 font-bold">
                {asset?.ocr?.total_tokens || asset?.ocr?.tokens?.length || 0} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">OCR Engine Provenance:</span>
              <span className="font-mono text-[10px] text-slate-800">
                DBNet++ / PP-OCRv4 / PP-OCRv3
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Extracted Declarations:</span>
              <span className="font-mono text-slate-800 font-bold">
                {caseData.extracted_fields?.length || 0} fields
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Rule Engine Determinations:</span>
              <span className="font-mono text-slate-800 font-bold">
                {caseData.rule_evaluations?.length || 0} findings
              </span>
            </div>
            <div className="pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase">
                Officer Adjudication Status:
              </span>
              <span className="font-mono font-bold text-govNavy block mt-0.5">
                {caseData.adjudication ? caseData.adjudication.verdict : "Awaiting Officer Adjudication"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Evidence Graph / Merkle DAG */}
      <div className="border border-slate-200 rounded-lg p-3.5 bg-white space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h4 className="text-xs font-bold uppercase text-govNavy">
              Dynamic Evidence Graph (Section 63 BSA 2023)
            </h4>
            <p className="text-[11px] text-slate-500">
              Data-driven pipeline nodes as provided by backend contract.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
            {dagNodes.length} NODES LINKED
          </span>
        </div>

        {/* Dynamic Nodes Renderer (Supports 0 -> N nodes without fixed 7-node assumption) */}
        {dagNodes.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 italic bg-slate-50 rounded border border-slate-200">
            No evidence graph nodes provided for this inspection case yet.
          </div>
        ) : (
          <div className="space-y-2">
            {dagNodes.map((node, index) => (
              <div
                key={node.node_id || `node_${index}`}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs font-mono space-y-1.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-govNavy text-white flex items-center justify-center text-[10px] font-bold">
                      {node.sequence_number || index + 1}
                    </span>
                    <span className="font-bold text-govNavy text-xs">
                      {node.stage_name}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {node.timestamp_utc ? new Date(node.timestamp_utc).toLocaleTimeString() : ""}
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 truncate bg-white p-1.5 rounded border border-slate-200" title={node.payload_sha256}>
                  <span className="text-slate-400 select-none">SHA-256: </span>
                  <span className="text-slate-800">{node.payload_sha256}</span>
                </div>

                {node.metadata && Object.keys(node.metadata).length > 0 && (
                  <div className="text-[10px] text-slate-500 font-sans flex items-center gap-2 flex-wrap pt-0.5">
                    {Object.entries(node.metadata).map(([k, v]) => (
                      <span key={k} className="bg-slate-200/60 px-1.5 py-0.5 rounded">
                        <span className="font-semibold">{k}:</span> {String(v)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Merkle Root Footer if supplied */}
        {caseData.evidence_graph?.merkle_root && (
          <div className="p-2 bg-slate-100 rounded border border-slate-200 text-xs font-mono flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-600">Merkle Provenance Root:</span>
            <span className="text-slate-800 truncate max-w-[260px]" title={caseData.evidence_graph.merkle_root}>
              {caseData.evidence_graph.merkle_root}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
