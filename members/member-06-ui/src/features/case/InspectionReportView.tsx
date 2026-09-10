import React from "react";
import { InspectionCase, EvidenceAsset } from "../../types/inspection";
import { computeCaseReadiness } from "../../services/mockData";
import { findFieldForFinding } from "../adjudication/AdjudicationTraceability";

interface InspectionReportViewProps {
  caseData: InspectionCase;
  onBackToWorkspace: () => void;
  onBackToOutcome?: () => void;
}

export const InspectionReportView: React.FC<InspectionReportViewProps> = ({
  caseData,
  onBackToWorkspace,
  onBackToOutcome,
}) => {
  const primaryAsset: EvidenceAsset | undefined =
    caseData.evidence_assets && caseData.evidence_assets.length > 0
      ? caseData.evidence_assets[caseData.evidence_assets.length - 1]
      : undefined;

  const evaluations = caseData.rule_evaluations || [];
  const findingDecisions = caseData.finding_decisions || {};
  const readiness = caseData.readiness_checklist || computeCaseReadiness(caseData);
  const auditTrail = caseData.audit_trail || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Screen-Only Action & Print Navigation Toolbar */}
      <div className="screen-only bg-panelBg rounded-lg border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBackToOutcome ? (
            <button
              type="button"
              onClick={onBackToOutcome}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              ← Back to Outcome
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToWorkspace}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              ← Back to Workspace
            </button>
          )}
          <span className="text-xs text-slate-500 hidden sm:inline">|</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            Inspection Case Dossier &amp; Statutory Report
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-bold text-white bg-govNavy hover:bg-govNavy-light rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Report / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Printable Formal Report Container */}
      <div className="printable-report bg-white text-slate-900 p-6 sm:p-10 rounded-lg border border-slate-300 shadow-md space-y-6 max-w-5xl mx-auto">
        {/* Report Header */}
        <div className="border-b-2 border-slate-800 pb-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
              Government of India • Department of Consumer Affairs
            </div>
            <h1 className="text-xl font-bold text-govNavy mt-0.5 tracking-tight">
              Legal Metrology Packaging Inspection Report
            </h1>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              Statutory verification dossier under Legal Metrology Act, 2009 &amp; LMPC Rules, 2011
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-600 space-y-0.5 self-center sm:self-auto">
            <div>
              <span className="text-slate-400">Case ID: </span>
              <strong className="text-slate-900">{caseData.inspection_number}</strong>
            </div>
            <div>
              <span className="text-slate-400">Date: </span>
              <span>{caseData.created_at ? new Date(caseData.created_at).toLocaleDateString("en-IN") : "Not available"}</span>
            </div>
            <div>
              <span className="text-slate-400">Jurisdiction: </span>
              <span>{caseData.jurisdiction_id}</span>
            </div>
            <div>
              <span className="text-slate-400">Status: </span>
              <strong className="uppercase">{caseData.workflow_status}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Establishment & Commodity Identification */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            1. Establishment &amp; Commodity Identification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Commodity / Product Name:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{caseData.product_name}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Brand Name:</span>
              <div className="font-semibold text-slate-800 mt-0.5">{caseData.brand_name || "Not available"}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Establishment / Trader:</span>
              <div className="font-semibold text-slate-800 mt-0.5">{caseData.establishment_name || "Not available"}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Premises Address:</span>
              <div className="text-slate-700 mt-0.5">{caseData.premises_address || "Not available"}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Packaging Geometry:</span>
              <div className="font-semibold text-slate-800 mt-0.5">{caseData.package_type}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Declared Net Quantity:</span>
              <div className="font-semibold text-slate-800 mt-0.5">{caseData.declared_net_quantity || "Not available"}</div>
            </div>
          </div>
        </section>

        {/* Section 2: Original Evidence Asset */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              2. Physical Evidence Asset Record
            </h2>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded border border-slate-300">
              ORIGINAL EVIDENCE — UNTOUCHED
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans">Evidence Asset ID:</span>
                <div className="font-bold text-slate-800">{primaryAsset ? primaryAsset.image_id : "Not available"}</div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">Native Dimensions:</span>
                <div className="text-slate-800">
                  {primaryAsset ? `${primaryAsset.image_width} × ${primaryAsset.image_height} px` : "Not available"}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">MIME &amp; Panel Facet:</span>
                <div className="text-slate-800">
                  {primaryAsset ? `${primaryAsset.mime_type || "image/jpeg"} (${primaryAsset.panel_type})` : "Not available"}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 font-sans">Canonical SHA-256 (Backend Record):</span>
              <span className="text-slate-700 truncate max-w-lg" title={primaryAsset?.raw_sha256}>
                {primaryAsset ? primaryAsset.raw_sha256 : "Not available"}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200 font-sans">
              Original physical capture preserved independently. Derived annotations and analysis layers do not overwrite the original evidence artifact.
            </p>
          </div>
        </section>

        {/* Section 3: Automated Diagnostic Analysis */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            3. Automated Diagnostic Analysis Telemetry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Quality Gate */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>Optical Quality Gate:</span>
                <span className={primaryAsset?.quality_gate.passed ? "text-emerald-700" : "text-rose-700"}>
                  {primaryAsset ? (primaryAsset.quality_gate.passed ? "[PASSED]" : "[REJECTED]") : "N/A"}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Blur: {primaryAsset ? primaryAsset.quality_gate.blur_variance.toFixed(1) : "N/A"}
                <br />
                Glare: {primaryAsset ? primaryAsset.quality_gate.glare_percentage.toFixed(2) + "%" : "N/A"}
                <br />
                Tilt: {primaryAsset ? primaryAsset.quality_gate.skew_angle_deg.toFixed(1) + "°" : "N/A"}
              </div>
            </div>

            {/* Metric Calibration */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>Metric Calibration:</span>
                <span className={primaryAsset?.calibration?.is_calibrated ? "text-emerald-700" : "text-slate-600"}>
                  {primaryAsset?.calibration?.is_calibrated ? "[CALIBRATED]" : "[UNCALIBRATED]"}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Method: {primaryAsset?.calibration?.method || "None"}
                <br />
                Scale: {primaryAsset?.calibration ? `${primaryAsset.calibration.px_to_mm.toFixed(2)} px/mm` : "N/A"}
                <br />
                Confidence: {primaryAsset?.calibration?.confidence ? `${(primaryAsset.calibration.confidence * 100).toFixed(0)}%` : "N/A"}
              </div>
            </div>

            {/* OCR Vision Stack */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700">Multilingual OCR Provenance:</div>
              <div className="text-[11px] text-slate-600">
                DBNet++ Text Detection
                <br />
                PP-OCRv4 English recognition
                <br />
                PP-OCRv3 Devanagari recognition
                <br />
                Tesseract v5 Fallback
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Traceable Statutory Findings Ledger */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              4. Traceable Statutory Findings &amp; Officer Adjudications
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {evaluations.length} statutory rule evaluations
            </span>
          </div>

          {evaluations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-50 rounded border border-slate-200">
              No statutory rule evaluations recorded for this inspection case.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2.5">Finding ID</th>
                    <th className="py-2 px-2.5">Field</th>
                    <th className="py-2 px-2.5">Statutory Citation</th>
                    <th className="py-2 px-2.5">Prescribed vs Measured</th>
                    <th className="py-2 px-2.5 text-center">AI Finding</th>
                    <th className="py-2 px-2.5 text-center">Officer Decision</th>
                    <th className="py-2 px-2.5">Traceability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {evaluations.map((finding) => {
                    const officerDec = findingDecisions[finding.finding_id];
                    const linkedField = findFieldForFinding(finding, caseData.extracted_fields || []);
                    return (
                      <tr key={finding.finding_id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-mono text-[11px] font-bold text-govNavy whitespace-nowrap">
                          {finding.finding_id}
                        </td>
                        <td className="py-2 px-2.5 font-medium text-slate-800 whitespace-nowrap">
                          {finding.rule_code.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                          {finding.statutory_reference || "Not available"}
                        </td>
                        <td className="py-2 px-2.5 text-[11px] font-mono text-slate-700">
                          <div>Req: {finding.required_value || "N/A"}</div>
                          <div>Obs: {finding.measured_value || "N/A"}</div>
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase ${
                              finding.status === "PASS"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : finding.status === "FAIL"
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : finding.status === "REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            [{finding.status}]
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          {officerDec ? (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                officerDec.decision === "CONFIRMED"
                                  ? "bg-rose-100 text-rose-900 border-rose-400"
                                  : officerDec.decision === "DISMISSED"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                                  : "bg-amber-100 text-amber-900 border-amber-400"
                              }`}
                            >
                              {officerDec.decision}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500">
                          <div>E: {primaryAsset?.image_id || "N/A"}</div>
                          <div>F: {linkedField?.field_id || (finding.field_type ? `FIELD_${finding.field_type}` : "N/A")}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 5: Officer Adjudication Review */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            5. Human Officer Adjudication &amp; Final Determination
          </h2>
          {caseData.adjudication ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500">Adjudicating Officer:</span>
                  <div className="font-bold text-slate-900">{caseData.adjudication.officer_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{caseData.adjudication.badge_number}</div>
                </div>
                <div>
                  <span className="text-slate-500">Adjudication Verdict:</span>
                  <div className="font-bold text-slate-900 uppercase">
                    [{caseData.adjudication.verdict}]
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Override Applied: {caseData.adjudication.override_applied ? "Yes" : "No"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Action Order &amp; Timestamp:</span>
                  <div className="font-mono text-[11px] text-slate-800">
                    {caseData.adjudication.action_order || "None"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(caseData.adjudication.timestamp_utc).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Officer Justification Remarks:</span>
                <p className="mt-0.5 text-slate-800 bg-white p-2 rounded border border-slate-200 font-sans italic">
                  &ldquo;{caseData.adjudication.remarks}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 italic">
              Officer adjudication has not yet been finalized for this case dossier.
            </div>
          )}
        </section>

        {/* Section 6: Chronological Evidentiary Audit Trail */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              6. Chronological Evidentiary Audit Ledger
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              {auditTrail.length} recorded events
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-1.5 px-2 font-mono">Seq</th>
                  <th className="py-1.5 px-2">Timestamp (IST)</th>
                  <th className="py-1.5 px-2">Actor</th>
                  <th className="py-1.5 px-2">Event Label</th>
                  <th className="py-1.5 px-2">Decision / Action</th>
                  <th className="py-1.5 px-2 font-mono">Entry SHA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {auditTrail.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 font-bold text-slate-700">{evt.sequence_number}</td>
                    <td className="py-1.5 px-2 text-slate-600 font-sans whitespace-nowrap">
                      {new Date(evt.timestamp_utc).toLocaleDateString("en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-1.5 px-2 font-sans">
                      <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${evt.actor_type === "OFFICER" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                        {evt.actor_type}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 font-sans text-slate-800">{evt.event_label}</td>
                    <td className="py-1.5 px-2 font-sans text-slate-700 truncate max-w-[200px]" title={evt.remarks || evt.decision}>
                      {evt.decision ? `[${evt.decision}] ` : ""}{evt.remarks || "—"}
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 text-[10px]" title={evt.entry_hash}>
                      {evt.entry_hash ? evt.entry_hash.slice(0, 10) + "..." : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Downstream Administrative Case Readiness */}
        <section className="space-y-2 border-t border-slate-200 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Downstream Case Readiness:</span>
              <div className="font-bold text-govNavy text-sm mt-0.5">
                {readiness.readiness_state.replace(/_/g, " ")}
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {readiness.downstream_action_guidance || "Backend readiness evaluation complete."}
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              Report Generated by NyayaDrishti-LM
              <br />
              Department of Consumer Affairs, GoI
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
