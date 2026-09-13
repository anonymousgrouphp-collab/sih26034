import React from "react";
import { GitBranch, CheckCircle2, XCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface RuleResultItem {
  id: string;
  ruleCode: string;
  title: string;
  description: string;
  category: string;
  status: "PASS" | "FAIL" | "REVIEW" | "MANUAL_REVIEW" | "NOT_EVALUATED";
  severity: "CRITICAL" | "MAJOR" | "MEDIUM" | "LOW";
  observedValue?: string;
  expectedValue?: string;
  evidenceIds?: string[];
  rationale: string;
}

interface RuleResultCardProps {
  rules: RuleResultItem[];
  className?: string;
}

export const RuleResultCard: React.FC<RuleResultCardProps> = ({ rules, className = "" }) => {
  const { language } = useLanguage();

  return (
    <div className={`card overflow-hidden rounded-xl border border-slate-700 bg-slate-900/70 shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-govNavy/10 text-cyan-300">
            <GitBranch size={17} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">
              {language === "hi" ? "नियतात्मक सांविधिक जांचें" : "Deterministic Statutory Checks"}
            </h3>
            <p className="text-[10px] text-slate-400">
              {language === "hi"
                ? "एलएमपीसी नियम 2011 एवं विधिक मापविज्ञान अधिनियम 2009 के तहत मूल्यांकित"
                : "Evaluated against LMPC Rules 2011 & Legal Metrology Act 2009"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          {rules.length} {language === "hi" ? "मूल्यांकित" : "Evaluated"}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {rules.map((r) => {
          const isPass = r.status === "PASS";
          const isReview = r.status === "REVIEW" || r.status === "MANUAL_REVIEW";
          const isFail = r.status === "FAIL";

          const statusLabel = isPass
            ? (language === "hi" ? "उत्तीर्ण" : "PASS")
            : isReview
            ? (language === "hi" ? "समीक्षा" : "REVIEW")
            : (language === "hi" ? "उल्लंघन" : "FAIL");

          const severityLabel =
            r.severity === "CRITICAL"
              ? (language === "hi" ? "गंभीर" : "CRITICAL")
              : r.severity === "MAJOR"
              ? (language === "hi" ? "प्रमुख" : "MAJOR")
              : r.severity === "MEDIUM"
              ? (language === "hi" ? "मध्यम" : "MEDIUM")
              : (language === "hi" ? "सामान्य" : "LOW");

          return (
            <div key={r.id} className="p-4 hover:bg-slate-800/60 transition-colors">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 rounded-lg p-2 shrink-0 ${
                      isPass
                        ? "bg-emerald-900/30 text-emerald-400"
                        : isReview
                        ? "bg-amber-900/30 text-amber-400"
                        : "bg-rose-900/30 text-rose-400"
                    }`}
                  >
                    {isPass && <CheckCircle2 size={18} />}
                    {isReview && <AlertTriangle size={18} />}
                    {isFail && <XCircle size={18} />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-100">{r.title}</h4>
                      <code className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 border border-slate-700">
                        {r.ruleCode}
                      </code>
                      <span className="text-[10px] text-slate-400">· {r.category}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">{r.description}</p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    isPass
                      ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800"
                      : isReview
                      ? "bg-amber-900/30 text-amber-400 border border-amber-200"
                      : "bg-rose-900/30 text-rose-400 border border-rose-800"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>

              {/* Observed vs Expected Comparison Grid */}
              <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="rounded-md border border-slate-800 bg-slate-800/60 p-2.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400">
                    {language === "hi" ? "प्रेक्षित साक्ष्य" : "Observed Evidence"}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-100 break-words">
                    {r.observedValue ?? "—"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-800/60 p-2.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400">
                    {language === "hi" ? "सांविधिक आवश्यकता" : "Statutory Requirement"}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-slate-100 break-words">
                    {r.expectedValue ?? "—"}
                  </p>
                </div>
                <div className="rounded-md border border-slate-800 bg-slate-800/60 p-2.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400">
                    {language === "hi" ? "सांविधिक गंभीरता" : "Statutory Severity"}
                  </p>
                  <p
                    className={`mt-0.5 text-xs font-bold ${
                      r.severity === "CRITICAL"
                        ? "text-rose-400"
                        : r.severity === "MAJOR"
                        ? "text-amber-400"
                        : "text-slate-200"
                    }`}
                  >
                    {severityLabel}
                  </p>
                </div>
              </div>

              {/* Legal Rationale Box */}
              <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-slate-800/60 p-2.5 border border-slate-800">
                <Info size={14} className="mt-0.5 text-cyan-300 shrink-0" />
                <p className="text-[11px] leading-relaxed text-slate-400">
                  <b className="text-slate-100">
                    {language === "hi" ? "विधिक आधार: " : "Legal Ground: "}
                  </b>
                  {r.rationale}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RuleResultCard;
