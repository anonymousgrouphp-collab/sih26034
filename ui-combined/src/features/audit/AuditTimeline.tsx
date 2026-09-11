import React, { useState } from "react";
import { AuditEvent, AuditActorType } from "../../types/inspection";
import { useLanguage } from "../../context/LanguageContext";

interface AuditTimelineProps {
  auditTrail: AuditEvent[];
  onSelectFinding?: (findingId: string) => void;
  onSelectEvidence?: (evidenceId: string) => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  auditTrail,
  onSelectFinding,
  onSelectEvidence,
}) => {
  const { language } = useLanguage();
  const [filterActor, setFilterActor] = useState<"ALL" | AuditActorType>("ALL");

  const filteredEvents = auditTrail.filter((event) => {
    if (filterActor === "ALL") return true;
    return event.actor_type === filterActor;
  });

  const officerCount = auditTrail.filter((e) => e.actor_type === "OFFICER").length;
  const systemCount = auditTrail.filter((e) => e.actor_type === "SYSTEM").length;

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
      {/* 1. Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-govNavy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              {language === "hi" ? "कालानुक्रमिक लेखापरीक्षा (ऑडिट) अभिलेख" : "Chronological Audit Record"}
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi"
              ? "सिस्टम पाइपलाइन घटनाओं एवं प्राधिकृत अधिकारी कार्रवाइयों का केवल-परिशिष्ट साक्ष्य बही (लेज़र)।"
              : "Append-only evidentiary ledger of system pipeline events and authorized officer actions."}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setFilterActor("ALL")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              filterActor === "ALL"
                ? "bg-govNavy text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {language === "hi" ? `सभी घटनाएं (${auditTrail.length})` : `All Events (${auditTrail.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilterActor("OFFICER")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
              filterActor === "OFFICER"
                ? "bg-emerald-700 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <span>{language === "hi" ? "अधिकारी कार्रवाइयां" : "Officer Actions"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-bold">
              {officerCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterActor("SYSTEM")}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors flex items-center gap-1 ${
              filterActor === "SYSTEM"
                ? "bg-blue-700 text-white shadow-sm"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <span>{language === "hi" ? "सिस्टम पाइपलाइन" : "System Pipeline"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200 text-blue-900 font-bold">
              {systemCount}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Chronological Activity Stream */}
      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded border border-slate-200">
          {language === "hi" ? "चयनित फ़िल्टर हेतु कोई ऑडिट घटना दर्ज नहीं है।" : "No audit events recorded for the selected filter."}
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-2 ml-2">
          {filteredEvents.map((evt) => {
            const isOfficer = evt.actor_type === "OFFICER";
            const dateStr = evt.timestamp_utc
              ? new Date(evt.timestamp_utc).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
                  dateStyle: "short",
                  timeStyle: "medium",
                })
              : (language === "hi" ? "लंबित समय-मुहर" : "Pending timestamp");

            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node marker */}
                <div
                  className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
                    isOfficer ? "bg-emerald-600 ring-2 ring-emerald-300" : "bg-blue-600 ring-2 ring-blue-200"
                  }`}
                  aria-hidden="true"
                />

                {/* Event Card */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm text-xs space-y-2 hover:border-slate-300 transition-colors">
                  {/* Event Header */}
                  <div className="flex items-center justify-between flex-wrap gap-1 border-b border-slate-100 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isOfficer
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}
                      >
                        {isOfficer
                          ? (language === "hi" ? "अधिकारी कार्रवाई" : "OFFICER ACTION")
                          : (language === "hi" ? "सिस्टम घटना" : "SYSTEM EVENT")}
                      </span>
                      <span className="font-bold text-slate-900 text-xs">
                        {evt.event_label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                      <span>{language === "hi" ? `क्रम #${evt.sequence_number}` : `seq #${evt.sequence_number}`}</span>
                      <span>•</span>
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Actor Details */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-500">{language === "hi" ? "कर्ता:" : "Actor:"}</span>
                      <span className="font-medium text-slate-800">{evt.actor_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">({evt.actor_id})</span>
                    </div>

                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]" title={evt.id}>
                      ID: {evt.id}
                    </span>
                  </div>

                  {/* Decision & Remarks */}
                  {evt.decision && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-700">{language === "hi" ? "निर्णय:" : "Decision:"}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                          evt.decision === "CONFIRM_VIOLATION" || evt.decision === "CONFIRMED"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : evt.decision === "DISMISS_AS_COMPLIANT" || evt.decision === "DISMISSED"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {language === "hi"
                          ? (evt.decision === "CONFIRM_VIOLATION" || evt.decision === "CONFIRMED"
                              ? "उल्लंघन की पुष्टि"
                              : evt.decision === "DISMISS_AS_COMPLIANT" || evt.decision === "DISMISSED"
                              ? "अनुपालन के रूप में खारिज"
                              : evt.decision)
                          : evt.decision}
                      </span>
                    </div>
                  )}

                  {evt.remarks && (
                    <div className="text-slate-700 bg-slate-50 p-2 rounded border border-slate-150 text-[11px] leading-relaxed">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase">
                        {language === "hi" ? "टिप्पणी / औचित्य:" : "Remarks / Justification:"}
                      </span>
                      "{evt.remarks}"
                    </div>
                  )}

                  {/* Links / Traceability references */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500 flex-wrap">
                    {evt.related_evidence_id && (
                      <div className="flex items-center gap-1">
                        <span>{language === "hi" ? "साक्ष्य:" : "Evidence:"}</span>
                        {onSelectEvidence ? (
                          <button
                            type="button"
                            onClick={() => onSelectEvidence(evt.related_evidence_id!)}
                            className="text-govNavy hover:underline font-bold"
                          >
                            {evt.related_evidence_id}
                          </button>
                        ) : (
                          <span className="text-govNavy font-semibold">{evt.related_evidence_id}</span>
                        )}
                      </div>
                    )}

                    {evt.related_finding_id && (
                      <div className="flex items-center gap-1">
                        <span>{language === "hi" ? "निष्कर्ष:" : "Finding:"}</span>
                        {onSelectFinding ? (
                          <button
                            type="button"
                            onClick={() => onSelectFinding(evt.related_finding_id!)}
                            className="text-govNavy hover:underline font-bold"
                          >
                            {evt.related_finding_id}
                          </button>
                        ) : (
                          <span className="text-govNavy font-semibold">{evt.related_finding_id}</span>
                        )}
                      </div>
                    )}

                    {evt.entry_hash && (
                      <div className="flex items-center gap-1 ml-auto text-[10px] text-slate-400">
                        <span>{language === "hi" ? "प्रविष्टि SHA:" : "Entry SHA:"}</span>
                        <span className="truncate max-w-[120px]" title={evt.entry_hash}>
                          {evt.entry_hash}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Append-Only Policy Banner */}
      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            {language === "hi"
              ? "केवल-परिशिष्ट ऑडिट रिकॉर्ड: निरीक्षण इंटरफ़ेस के माध्यम से ऐतिहासिक घटनाओं को संशोधित, हटाया या पिछली तारीख में नहीं किया जा सकता है।"
              : "Append-only audit record: historical events cannot be modified, deleted, or backdated through the inspection interface."}
          </span>
        </div>
        <span className="font-mono text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">
          {language === "hi" ? "ऑडिट अखंडता सुरक्षित" : "AUDIT INTEGRITY PRESERVED"}
        </span>
      </div>
    </div>
  );
};
