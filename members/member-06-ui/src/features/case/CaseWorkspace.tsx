import React, { useState } from "react";
import { InspectionCase, EvidenceAsset } from "../../types/inspection";
import { CaseHeader } from "./CaseHeader";
import { EvidenceIntake } from "./EvidenceIntake";
import { AnalysisHUD } from "./AnalysisHUD";
import { ApiService } from "../../services/api";

interface CaseWorkspaceProps {
  caseData: InspectionCase;
  onBack: () => void;
  onCaseUpdated: (updatedCase: InspectionCase) => void;
}

export const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({
  caseData,
  onBack,
  onCaseUpdated,
}) => {
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [isAnalyzingPipeline, setIsAnalyzingPipeline] = useState(false);
  const [isRetakeMode, setIsRetakeMode] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeAsset: EvidenceAsset | undefined = caseData.evidence_assets[caseData.evidence_assets.length - 1];

  // Handle evidence upload
  const handleEvidenceSubmitted = async (
    file: File | Blob,
    metadata: {
      inspection_id: string;
      panel_type: "PDP_FRONT" | "SIDE_PANEL" | "BACK_PANEL";
      original_filename: string;
      file_size_bytes: number;
      mime_type: string;
      image_width: number;
      image_height: number;
      preview_url: string;
      demo_scenario?: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY" | "DEFAULT";
    }
  ) => {
    setActionError(null);
    setIsSubmittingEvidence(true);
    try {
      await ApiService.uploadEvidence(file, metadata);
      
      // Fetch latest case state
      const updated = await ApiService.getInspection(caseData.id);
      setIsRetakeMode(false);
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || "Evidence submission failed. Please try again.");
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Handle pipeline execution
  const handleExecutePipeline = async () => {
    if (!activeAsset) return;
    setActionError(null);
    setIsAnalyzingPipeline(true);
    try {
      // Determine scenario based on product or asset quality
      let scenario: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY" | undefined;
      if (activeAsset.quality_gate.passed === false) {
        scenario = "UNABLE_TO_VERIFY";
      } else if (caseData.product_name.toLowerCase().includes("water")) {
        scenario = "PASS";
      } else if (caseData.product_name.toLowerCase().includes("soap")) {
        scenario = "REVIEW";
      } else if (caseData.product_name.toLowerCase().includes("chips")) {
        scenario = "UNABLE_TO_VERIFY";
      } else {
        scenario = "FAIL";
      }

      const updated = await ApiService.executePipeline(activeAsset.image_id, caseData.id, scenario);
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || "Pipeline execution failed. Please retry.");
    } finally {
      setIsAnalyzingPipeline(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Compact Case Shell Header */}
      <CaseHeader
        caseData={caseData}
        onBack={onBack}
        isProcessing={isSubmittingEvidence || isAnalyzingPipeline}
      />

      {/* Action Error Banner */}
      {actionError && (
        <div
          role="alert"
          className="p-3 bg-verdictFail-light border border-verdictFail-dark/30 rounded-md text-xs text-verdictFail-dark flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-verdictFail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-verdictFail-dark font-bold hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Stage Area */}
      {caseData.evidence_assets.length === 0 || isRetakeMode ? (
        /* Evidence Intake Mode */
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">Stage 1: Physical Evidence Ingestion. </span>
              Select or capture the Principal Display Panel (PDP) photograph with an ArUco 4x4 (50mm) fiducial marker placed on the same plane.
            </div>
          </div>

          <EvidenceIntake
            inspectionId={caseData.id}
            onEvidenceSubmitted={handleEvidenceSubmitted}
            isSubmitting={isSubmittingEvidence}
            existingAsset={activeAsset}
            onClearExisting={() => setIsRetakeMode(false)}
          />
        </div>
      ) : (
        /* Dual-Column Case Workspace: Evidence (Left) + Analysis HUD (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column (5 cols): Physical Evidence Viewer */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
                    Physical Evidence Asset
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-govNavy text-white font-bold">
                  ORIGINAL UNTOUCHED
                </span>
              </div>

              {/* Image Preview Box */}
              <div className="relative rounded-lg border border-slate-300 bg-slate-950 overflow-hidden min-h-64 flex items-center justify-center">
                {activeAsset?.preview_url || activeAsset?.file_path ? (
                  <img
                    src={activeAsset.preview_url || activeAsset.file_path}
                    alt={`Packaging evidence for ${caseData.product_name}`}
                    className="max-h-96 w-auto object-contain rounded"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <div className="font-mono text-slate-300 mb-1">{activeAsset?.image_id}</div>
                    <div>Physical evidence photograph on secure storage ledger</div>
                  </div>
                )}
              </div>

              {/* Technical Evidence Attributes */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Asset Reference:</span>
                  <span className="text-govNavy font-bold">{activeAsset?.image_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Resolution:</span>
                  <span>{activeAsset?.image_width} × {activeAsset?.image_height} px</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Facet:</span>
                  <span className="font-sans font-medium text-slate-800">{activeAsset?.panel_type}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                  <span className="font-semibold text-slate-500">Canonical SHA-256 (Backend Record):</span>
                  <span className="text-slate-500 truncate max-w-[180px]" title={activeAsset?.raw_sha256}>
                    {activeAsset?.raw_sha256}
                  </span>
                </div>
              </div>

              {/* Retake Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsRetakeMode(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none"
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Re-upload / Retake Evidence Photograph</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Analysis HUD */}
          <div className="lg:col-span-7 space-y-4">
            <AnalysisHUD
              caseData={caseData}
              activeAsset={activeAsset}
              isAnalyzing={isAnalyzingPipeline}
              onExecutePipeline={handleExecutePipeline}
              onRetakeEvidence={() => setIsRetakeMode(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
