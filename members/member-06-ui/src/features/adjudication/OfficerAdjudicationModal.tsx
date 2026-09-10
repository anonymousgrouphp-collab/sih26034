import React, { useState } from "react";
import { Modal } from "../../components/common/Modal";
import {
  InspectionCase,
  OfficerAdjudicationVerdict,
  OfficerActionOrder,
  AdjudicationRequest,
} from "../../types/inspection";

interface OfficerAdjudicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: InspectionCase;
  onSubmitAdjudication: (request: AdjudicationRequest) => Promise<void>;
  isSubmitting?: boolean;
}

export const OfficerAdjudicationModal: React.FC<OfficerAdjudicationModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onSubmitAdjudication,
  isSubmitting = false,
}) => {
  const [verdict, setVerdict] = useState<OfficerAdjudicationVerdict>(
    caseData.overall_status === "FAIL" ? "CONFIRM_VIOLATION" : "DISMISS_AS_COMPLIANT"
  );
  const [remarks, setRemarks] = useState<string>("");
  const [actionOrder, setActionOrder] = useState<OfficerActionOrder>(
    caseData.overall_status === "FAIL"
      ? "GENERATE_LEGAL_NOTICE_FORM_1"
      : "CLOSE_INSPECTION_COMPLIANT"
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const isOverride =
    (caseData.overall_status === "FAIL" && verdict === "DISMISS_AS_COMPLIANT") ||
    (caseData.overall_status === "PASS" && verdict === "CONFIRM_VIOLATION") ||
    (caseData.overall_status === "REVIEW" && verdict !== "REQUEST_RETEST");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Enforce mandatory officer justification remarks per statutory standard
    if (!remarks || remarks.trim().length < 5) {
      setValidationError(
        "Mandatory officer justification remarks required. Please provide a detailed factual rationale for the official inspection record."
      );
      return;
    }

    try {
      await onSubmitAdjudication({
        adjudication_verdict: verdict,
        override_applied: isOverride,
        officer_remarks: remarks.trim(),
        action_order: actionOrder,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || "Failed to submit officer adjudication.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Legal Metrology Officer Adjudication"
      subtitle={`Statutory human-in-the-loop determination for Case ${caseData.inspection_number}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Officer Identity Box */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block">Adjudicating Officer</span>
            <span className="font-bold text-govNavy text-sm">INSP-DL-0842 • Rajesh Sharma</span>
            <span className="text-[11px] text-slate-500 block">LMO Class-II Gazetted, South Delhi Enforcement Division</span>
          </div>
          <span className="px-2.5 py-1 rounded bg-govNavy text-white font-mono text-[10px] font-bold">
            SECTION 15 LM ACT
          </span>
        </div>

        {/* Automated Finding vs Officer Decision Banner */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Automated AI Diagnostic Finding:</span>
            <span className="font-mono font-bold text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200">
              {caseData.overall_status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Automated findings serve strictly as an augmented diagnostic recommendation. The adjudicating officer holds sole statutory authority under Section 15 of the Legal Metrology Act, 2009.
          </p>
        </div>

        {/* Error Alert */}
        {validationError && (
          <div role="alert" className="p-2.5 bg-rose-50 border border-rose-300 rounded text-rose-800 font-semibold">
            {validationError}
          </div>
        )}

        {/* Decision Selection */}
        <div className="space-y-1.5">
          <label className="font-bold text-slate-700 block">
            Adjudication Decision <span className="text-rose-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setVerdict("CONFIRM_VIOLATION");
                setActionOrder("GENERATE_LEGAL_NOTICE_FORM_1");
              }}
              className={`p-2.5 rounded-md border text-left font-sans transition-colors ${
                verdict === "CONFIRM_VIOLATION"
                  ? "border-rose-600 bg-rose-50/70 ring-2 ring-rose-500 text-rose-900"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="font-bold text-xs">Confirm Violation</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Uphold statutory deficit findings</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setVerdict("DISMISS_AS_COMPLIANT");
                setActionOrder("CLOSE_INSPECTION_COMPLIANT");
              }}
              className={`p-2.5 rounded-md border text-left font-sans transition-colors ${
                verdict === "DISMISS_AS_COMPLIANT"
                  ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 text-emerald-900"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="font-bold text-xs">Dismiss as Compliant</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Override finding (manual check passed)</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setVerdict("REQUEST_RETEST");
                setActionOrder("REQUEST_PHYSICAL_CALIPER_CHECK");
              }}
              className={`p-2.5 rounded-md border text-left font-sans transition-colors ${
                verdict === "REQUEST_RETEST"
                  ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-500 text-amber-900"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <div className="font-bold text-xs">Request Re-verification</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Physical caliper check or recapture</div>
            </button>
          </div>
        </div>

        {/* Action Order */}
        <div className="space-y-1">
          <label htmlFor="action-order-select" className="font-bold text-slate-700 block">
            Statutory Action Order
          </label>
          <select
            id="action-order-select"
            value={actionOrder}
            onChange={(e) => setActionOrder(e.target.value as OfficerActionOrder)}
            className="w-full bg-white border border-slate-300 rounded p-2 text-xs text-slate-800 focus:ring-1 focus:ring-govNavy focus:outline-none"
          >
            <option value="GENERATE_LEGAL_NOTICE_FORM_1">Generate Form-1 Show Cause Notice (Section 36(1))</option>
            <option value="CLOSE_INSPECTION_COMPLIANT">Close Inspection Record (Full Statutory Compliance Verified)</option>
            <option value="REQUEST_PHYSICAL_CALIPER_CHECK">Order Physical Caliper Measurement by Field Officer</option>
          </select>
        </div>

        {/* Mandatory Remarks */}
        <div className="space-y-1">
          <label htmlFor="officer-remarks-area" className="font-bold text-slate-700 block flex items-center justify-between">
            <span>Mandatory Officer Justification Remarks <span className="text-rose-600">*</span></span>
            {isOverride && (
              <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">
                [Override Justification Required]
              </span>
            )}
          </label>
          <textarea
            id="officer-remarks-area"
            rows={4}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter official factual justification, physical caliper measurement readings, or grounds for overriding automated finding..."
            className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-govNavy focus:outline-none font-sans"
          />
          <span className="text-[10px] text-slate-400 block">
            This justification will be immutably recorded in the Section 63 BSA 2023 evidentiary chain of custody.
          </span>
        </div>

        {/* Submission Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-govNavy hover:bg-govNavy-light rounded-md shadow focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {isSubmitting ? "Recording Adjudication..." : "Sign & Record Adjudication"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
