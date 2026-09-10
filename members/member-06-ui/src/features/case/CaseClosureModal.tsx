import React, { useState, useEffect, useRef } from "react";
import { InspectionCase } from "../../types/inspection";

interface CaseClosureModalProps {
  isOpen: boolean;
  caseData: InspectionCase;
  onClose: () => void;
  onConfirmClosure: (remarks: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const CaseClosureModal: React.FC<CaseClosureModalProps> = ({
  isOpen,
  caseData,
  onClose,
  onConfirmClosure,
  isSubmitting = false,
}) => {
  const [remarks, setRemarks] = useState(
    "Inspection concluded. Case reviewed against backend statutory records and marked closed."
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarks.trim()) {
      setValidationError("Officer closure remarks are required for the audit record.");
      return;
    }
    setValidationError(null);
    try {
      await onConfirmClosure(remarks.trim());
      onClose();
    } catch (err: any) {
      setValidationError(err.message || "Failed to record case closure.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="closure-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg bg-panelBg rounded-xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-govNavy px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 id="closure-modal-title" className="text-sm font-bold tracking-wide">
              Close Inspection Case?
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-300 hover:text-white text-lg font-bold leading-none p-1 rounded"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Backend Readiness: Ready for Case Closure</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              The case is marked ready for closure by the current workflow state.
              This action will record the officer&apos;s closure decision and update the case workflow
              through the configured backend.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Case Number:</span>
              <span className="font-mono font-bold text-slate-800">{caseData.inspection_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Commodity:</span>
              <span className="font-semibold text-slate-800">{caseData.product_name}</span>
            </div>
            {caseData.establishment_name && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Establishment:</span>
                <span className="text-slate-800">{caseData.establishment_name}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="closure-remarks" className="block text-xs font-bold text-slate-700">
              Officer Closure Remarks <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="closure-remarks"
              ref={textareaRef}
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
              className="w-full text-xs p-2.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy/20 focus:border-govNavy text-slate-800"
              placeholder="Enter official factual justification or closure record notes..."
            />
          </div>

          {validationError && (
            <div role="alert" className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
              {validationError}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Recording Closure...</span>
                </>
              ) : (
                <span>Confirm Case Closure</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
