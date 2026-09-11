import React from "react";
import { Link } from "react-router-dom";
import { StateEmblem } from "./StateEmblem";
import { useLanguage } from "../../context/LanguageContext";

interface NyayaDrishtiBrandLogoProps {
  className?: string;
  tone?: "light" | "dark"; // "light" for dark blue backgrounds, "dark" for white/light backgrounds
  size?: "sm" | "md" | "lg";
}

/**
 * NyayaDrishtiBrandLogo — Official Sovereign Brand Masthead
 * Modeled directly on the National Portal of India (india.gov.in / npi_logo.svg) identity:
 * - Sovereign State Emblem of India (Ashoka Lion Capital with Satyameva Jayate)
 * - Authority domain hierarchy: nyayadrishti.gov.in
 * - Statutory subtitle: National Legal Metrology Portal
 * - Official National Tricolor Accent Bar (#FF9933 / #FFFFFF / #138808)
 * - Department attribution: Department of Consumer Affairs • Government of India
 */
export const NyayaDrishtiBrandLogo: React.FC<NyayaDrishtiBrandLogoProps> = ({
  className = "",
  tone = "light",
  size = "md",
}) => {
  const { language, t } = useLanguage();

  const emblemSizes = {
    sm: 18,
    md: 24,
    lg: 32,
  };

  const isLight = tone === "light"; // on dark navy bg

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
      title="NyayaDrishti-LM — Legal Metrology Inspection Assistance Workstation"
    >
      {/* Legal Metrology Verification Crest — Contained strictly within header boundaries */}
      <div
        className={`p-1 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
          isLight
            ? "bg-white/10 backdrop-blur-xs border border-white/20 group-hover:bg-white/15 group-hover:border-white/40 shadow-2xs"
            : "bg-govNavy border border-govNavy-light group-hover:border-slate-500 shadow-xs"
        }`}
      >
        <StateEmblem size={emblemSizes[size]} tone="white" showMotto={true} />
      </div>

      {/* Typography Hierarchy */}
      <div className="flex flex-col justify-center leading-tight shrink-0">
        {/* Department & Ministry Pre-header */}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-none">
          <span className={isLight ? "text-amber-400" : "text-amber-700"}>
            {language === "hi" ? "विधिक मापविज्ञान" : "Legal Metrology"}
          </span>
          <span className={isLight ? "text-slate-400" : "text-slate-400"}>•</span>
          <span className={`font-medium ${isLight ? "text-slate-300" : "text-slate-600"}`}>
            {language === "hi" ? "कार्यप्रणाली सहायता" : "Inspection Assistance"}
          </span>
        </div>

        {/* Primary Product Title */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className={`font-black tracking-tight whitespace-nowrap ${
              size === "sm"
                ? "text-base"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : "text-lg sm:text-xl"
            } ${isLight ? "text-white" : "text-[#1B365D]"}`}
          >
            {language === "hi" ? "न्यायदृष्टि-एलएम" : "NyayaDrishti-LM"}
          </span>
          <span
            className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
              isLight
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : "bg-slate-100 text-slate-700 border border-slate-300"
            }`}
          >
            LMPC
          </span>
        </div>

        {/* National Tricolor Accent Line */}
        <div className="flex items-center gap-0.5 my-0.5 w-28 sm:w-36">
          <div className="h-0.5 flex-1 bg-[#FF9933] rounded-full" />
          <div className={`h-0.5 w-1.5 rounded-full ${isLight ? "bg-white" : "bg-slate-300"}`} />
          <div className="h-0.5 flex-1 bg-[#138808] rounded-full" />
        </div>

        {/* Subtitle / Classification */}
        <p
          className={`text-[9.5px] sm:text-[10px] font-semibold tracking-wide whitespace-nowrap hidden xl:block ${
            isLight ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {language === "hi" ? "विधिक मापविज्ञान निरीक्षण कार्यस्थान" : "Legal Metrology Inspection Workstation"}
        </p>
      </div>
    </Link>
  );
};
