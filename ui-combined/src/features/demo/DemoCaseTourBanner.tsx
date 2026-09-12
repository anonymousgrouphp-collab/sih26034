import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { DEMO_SCENARIOS, getDemoScenarioById, DemoScenarioItem } from "./demoCatalog";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  BookOpen,
  X,
  Compass,
  Scale,
} from "lucide-react";

interface DemoCaseTourBannerProps {
  currentCaseId: string;
  onSelectCase?: (caseId: string) => void;
}

export const DemoCaseTourBanner: React.FC<DemoCaseTourBannerProps> = ({
  currentCaseId,
  onSelectCase,
}) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showGuideModal, setShowGuideModal] = useState(false);

  const scenario = getDemoScenarioById(currentCaseId);
  if (!scenario) return null;

  const currentIndex = DEMO_SCENARIOS.findIndex((s) => s.caseId === scenario.caseId);
  const prevScenario =
    currentIndex > 0
      ? DEMO_SCENARIOS[currentIndex - 1]
      : DEMO_SCENARIOS[DEMO_SCENARIOS.length - 1];
  const nextScenario =
    currentIndex < DEMO_SCENARIOS.length - 1
      ? DEMO_SCENARIOS[currentIndex + 1]
      : DEMO_SCENARIOS[0];

  const handleNavigateTo = (targetCaseId: string) => {
    if (onSelectCase) {
      onSelectCase(targetCaseId);
    } else {
      navigate(`/inspections/${targetCaseId}`);
    }
  };

  const getVerdictTheme = (verdict: DemoScenarioItem["targetVerdict"]) => {
    switch (verdict) {
      case "FAIL":
        return {
          pill: "bg-rose-600 text-white border-rose-700",
          border: "border-rose-400/80 bg-gradient-to-r from-rose-50/90 via-white to-amber-50/40",
          accent: "text-rose-700",
          icon: ShieldAlert,
        };
      case "PASS":
        return {
          pill: "bg-emerald-600 text-white border-emerald-700",
          border: "border-emerald-400/80 bg-gradient-to-r from-emerald-50/90 via-white to-sky-50/40",
          accent: "text-emerald-700",
          icon: ShieldCheck,
        };
      case "REVIEW":
        return {
          pill: "bg-amber-600 text-white border-amber-700",
          border: "border-amber-400/80 bg-gradient-to-r from-amber-50/90 via-white to-orange-50/40",
          accent: "text-amber-800",
          icon: Scale,
        };
      case "UNABLE_TO_VERIFY":
        return {
          pill: "bg-purple-600 text-white border-purple-700",
          border: "border-purple-400/80 bg-gradient-to-r from-purple-50/90 via-white to-slate-50/40",
          accent: "text-purple-800",
          icon: Compass,
        };
    }
  };

  const theme = getVerdictTheme(scenario.targetVerdict);
  const VerdictIcon = theme.icon;

  const label =
    language === "hi" && scenario.verdictLabelHi
      ? scenario.verdictLabelHi
      : scenario.verdictLabel;
  const title =
    language === "hi" && scenario.titleHi ? scenario.titleHi : scenario.title;
  const headline =
    language === "hi" && scenario.headlineViolationHi
      ? scenario.headlineViolationHi
      : scenario.headlineViolation;

  return (
    <>
      <div
        role="region"
        aria-label="Demonstration Scenario Navigation Bar"
        className={`rounded-xl border shadow-sm p-3.5 sm:p-4 transition-all duration-200 ${theme.border}`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Left: Prominent Demo Identification & Scenario Summary */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-govNavy text-amber-400 shrink-0 shadow-xs hidden sm:flex items-center justify-center">
              <Sparkles size={20} className="animate-pulse" />
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Flashing Gold Demo Badge */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-amber-400 text-slate-950 border border-amber-500 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  <span>{language === "hi" ? "सांविधिक डेमो मामला" : "DEMO CASE FIXTURE"}</span>
                </span>

                {/* Scenario Counter */}
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                  {language === "hi"
                    ? `परिदृश्य ${scenario.scenarioNumber} / ${scenario.totalScenarios}`
                    : `Scenario ${scenario.scenarioNumber} of ${scenario.totalScenarios}`}
                </span>

                {/* Target Verdict Pill */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${theme.pill}`}
                >
                  <VerdictIcon size={12} />
                  <span>{label}</span>
                </span>

                <span className="text-xs font-mono font-bold text-govNavy hidden md:inline">
                  [{scenario.skuId}]
                </span>
              </div>

              {/* Title & Headline Infraction */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-govNavy truncate" title={title}>
                  {title}
                </h2>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <p className={`text-xs font-bold ${theme.accent} truncate max-w-xl`} title={headline}>
                  {headline}
                </p>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-1">
                {language === "hi"
                  ? "विधिक मापविज्ञान नियम 2011 एवं धारा 63 बीएसए 2023 के अंतर्गत पूर्व-प्रमाणित प्रदर्शन मामला।"
                  : "Pre-certified statutory scenario modeling automated LMPC compliance, calibrated optics, and BSA 2023 evidence proofs."}
              </p>
            </div>
          </div>

          {/* Right: Quick Tour Navigation Controls */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60">
            {/* Previous Scenario Button */}
            <button
              type="button"
              onClick={() => handleNavigateTo(prevScenario.caseId)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 hover:border-govNavy shadow-2xs transition-all"
              title={`Previous: Scenario ${prevScenario.scenarioNumber} - ${prevScenario.title}`}
            >
              <ChevronLeft size={16} className="text-govNavy" />
              <span className="hidden sm:inline">{language === "hi" ? "पिछला" : "Prev"}</span>
            </button>

            {/* Quick Dropdown Selector */}
            <select
              value={scenario.caseId}
              onChange={(e) => handleNavigateTo(e.target.value)}
              aria-label="Select demonstration scenario"
              className="text-xs font-bold bg-white text-govNavy border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
            >
              {DEMO_SCENARIOS.map((s) => (
                <option key={s.caseId} value={s.caseId}>
                  #{s.scenarioNumber}: {s.targetVerdict} — {s.title}
                </option>
              ))}
            </select>

            {/* Next Scenario Button (High Contrast) */}
            <button
              type="button"
              onClick={() => handleNavigateTo(nextScenario.caseId)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border border-amber-600 shadow-xs transition-all ring-1 ring-amber-400/50"
              title={`Next: Scenario ${nextScenario.scenarioNumber} - ${nextScenario.title}`}
            >
              <span>{language === "hi" ? "अगला डेमो" : "Next Demo"}</span>
              <ChevronRight size={16} className="text-slate-950" />
            </button>

            {/* Guide Details Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-govNavy bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors shadow-2xs"
              title="View Demonstration Objectives & Statutory Rules"
            >
              <BookOpen size={14} className="text-govNavy" />
              <span className="hidden md:inline">{language === "hi" ? "डेमो गाइड" : "Scenario Guide"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Demonstration Scenario Guide & Legal Context Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="bg-govNavy text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-500">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-black text-xs">
                  DEMO {scenario.scenarioNumber}/7
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight">{title}</h3>
                  <p className="text-xs text-amber-200 font-mono mt-0.5">
                    {scenario.inspectionNumber} • {scenario.packageType}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Expected Statutory Verdict */}
              <div className="p-3.5 rounded-xl border bg-slate-50 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0">
                  <VerdictIcon size={20} className={theme.accent} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                      {language === "hi" ? "अपेक्षित सांविधिक निर्णय" : "Expected Statutory AI Verdict"}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${theme.pill}`}>
                      {label}
                    </span>
                  </div>
                  <p className="font-extrabold text-slate-900 mt-1 text-xs">
                    {headline}
                  </p>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    {language === "hi" ? scenario.detailedRationaleHi : scenario.detailedRationale}
                  </p>
                </div>
              </div>

              {/* Statutory Rules Verified */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-govNavy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Scale size={14} className="text-amber-600" />
                  <span>{language === "hi" ? "परीक्षित सांविधिक नियम" : "Statutory Rules Evaluated"}</span>
                </h4>
                <ul className="space-y-1.5">
                  {(language === "hi" ? scenario.statutoryRulesHi : scenario.statutoryRules).map(
                    (rule, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800"
                      >
                        <span className="text-amber-600 font-bold">§</span>
                        <span>{rule}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* What Capabilities are Tested */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-govNavy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileCheck size={14} className="text-emerald-600" />
                  <span>{language === "hi" ? "सत्यापित मॉड्यूल क्षमताएं" : "Subsystem Capabilities Demonstrated"}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(language === "hi"
                    ? scenario.testedCapabilitiesHi
                    : scenario.testedCapabilities
                  ).map((cap, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border border-slate-200 bg-white flex items-center gap-2 text-[11px] text-slate-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluator / Officer Instructions */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-1">
                <div className="font-extrabold text-[11px] flex items-center gap-1.5 text-amber-900">
                  <Info size={14} className="text-amber-700" />
                  <span>{language === "hi" ? "मूल्यांकनकर्ता / अधिकारी निर्देश" : "How to Inspect this Demonstration Scenario"}</span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  {language === "hi" ? scenario.evaluatorGuideHi : scenario.evaluatorGuide}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Section 63 BSA 2023 Digital Evidence Invariant Active
              </span>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="btn-primary text-xs py-1.5 px-4"
              >
                {language === "hi" ? "समझ गया / केस देखें" : "Got it / Inspect Case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
