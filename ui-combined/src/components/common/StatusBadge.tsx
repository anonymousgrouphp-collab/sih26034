import React from "react";
import { EpistemicVerdict, WorkflowStatus } from "../../types/inspection";
import { useLanguage } from "../../context/LanguageContext";

interface VerdictBadgeProps {
  verdict: EpistemicVerdict | "PENDING_REVIEW" | "PENDING";
  size?: "sm" | "md";
  showDot?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = "md",
  showDot = true,
}) => {
  const { language } = useLanguage();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  switch (verdict) {
    case "PASS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-verdictPass-dark/20 bg-verdictPass-light text-verdictPass-dark ${sizeClasses}`}
          title={language === "hi" ? "विधिक मापविज्ञान नियम, 2011 के तहत पूर्ण विधिक अनुपालन सत्यापित" : "Full statutory compliance verified under LMPC Rules, 2011"}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-verdictPass" />}
          {language === "hi" ? "उत्तीर्ण (PASS)" : "PASS"}
        </span>
      );
    case "FAIL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-verdictFail-dark/20 bg-verdictFail-light text-verdictFail-dark ${sizeClasses}`}
          title={language === "hi" ? "विधिक मापविज्ञान नियम, 2011 के तहत विधिक उल्लंघन पाया गया" : "Statutory non-compliance identified under LMPC Rules, 2011"}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-verdictFail" />}
          {language === "hi" ? "उल्लंघन (FAIL)" : "FAIL"}
        </span>
      );
    case "REVIEW":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-verdictReview-dark/20 bg-verdictReview-light text-verdictReview-dark ${sizeClasses}`}
          title={language === "hi" ? "सेंसर अनिश्चितता सीमा में सीमावर्ती माप (k=2, 95% विश्वास)" : "Borderline measurement within sensor uncertainty band (k=2, 95% confidence)"}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-verdictReview" />}
          {language === "hi" ? "समीक्षा (REVIEW)" : "REVIEW"}
        </span>
      );
    case "UNABLE_TO_VERIFY":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-verdictUnable-dark/20 bg-verdictUnable-light text-verdictUnable-dark ${sizeClasses}`}
          title={language === "hi" ? "ऑप्टिकल गुणवत्ता खराब (अत्यधिक धुंधलापन या चमक)" : "Optical quality degraded (specular glare, blur, or obscured text)"}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-verdictUnable" />}
          {language === "hi" ? "सत्यापन असमर्थ" : "UNABLE TO VERIFY"}
        </span>
      );
    case "PENDING_REVIEW":
    case "PENDING":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 text-slate-700 ${sizeClasses}`}
          title={language === "hi" ? "पाइपलाइन निष्पादन अथवा अधिकारी समीक्षा लंबित" : "Awaiting pipeline execution or officer review"}
        >
          {showDot && <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
          {language === "hi" ? "निर्णय लंबित" : "PENDING"}
        </span>
      );
  }
};

interface WorkflowBadgeProps {
  status: WorkflowStatus;
  size?: "sm" | "md";
}

export const WorkflowBadge: React.FC<WorkflowBadgeProps> = ({
  status,
  size = "md",
}) => {
  const { language } = useLanguage();
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-0.5 text-xs font-medium";

  switch (status) {
    case "DRAFT":
      return (
        <span className={`inline-flex items-center rounded border border-slate-200 bg-slate-50 text-slate-600 ${sizeClasses}`}>
          {language === "hi" ? "प्रारूप (DRAFT)" : "DRAFT"}
        </span>
      );
    case "OPEN":
      return (
        <span className={`inline-flex items-center rounded border border-blue-200 bg-blue-50 text-blue-700 ${sizeClasses}`}>
          {language === "hi" ? "सक्रिय (OPEN)" : "OPEN"}
        </span>
      );
    case "PROCESSING":
      return (
        <span className={`inline-flex items-center rounded border border-purple-200 bg-purple-50 text-purple-700 animate-pulse ${sizeClasses}`}>
          {language === "hi" ? "प्रक्रियाधीन" : "PROCESSING"}
        </span>
      );
    case "PENDING_REVIEW":
      return (
        <span className={`inline-flex items-center rounded border border-amber-200 bg-amber-50 text-amber-800 ${sizeClasses}`}>
          {language === "hi" ? "निर्णय लंबित" : "PENDING ADJUDICATION"}
        </span>
      );
    case "COMPLETED":
      return (
        <span className={`inline-flex items-center rounded border border-slate-300 bg-slate-100 text-slate-800 ${sizeClasses}`}>
          {language === "hi" ? "समाप्त (CLOSED)" : "CLOSED"}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded border border-slate-200 bg-slate-50 text-slate-600 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
