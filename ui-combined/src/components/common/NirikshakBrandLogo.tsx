import React from "react";
import { Link } from "react-router-dom";
import { StateEmblem } from "./StateEmblem";
import { useLanguage } from "../../context/LanguageContext";

interface NirikshakBrandLogoProps {
  className?: string;
  tone?: "light" | "dark"; // "light" for dark blue backgrounds, "dark" for white/light backgrounds
  size?: "sm" | "md" | "lg";
}

/**
 * NirikshakBrandLogo — Official Sovereign Brand Masthead
 * Modeled on the National Portal of India (india.gov.in / npi_logo.svg) identity:
 * - Sovereign State Emblem of India (Ashoka Lion Capital with Satyameva Jayate)
 * - Product name: NIRIKSHAK (निरीक्षक)
 * - Official National Tricolor Accent Bar (#FF9933 / #FFFFFF / #138808)
 * - Department attribution: Department of Consumer Affairs • Government of India
 */
export const NirikshakBrandLogo: React.FC<NirikshakBrandLogoProps> = ({
  className = "",
  tone = "light",
  size = "md",
}) => {
  const { language } = useLanguage();

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
      title="NIRIKSHAK — Inspection Workstation"
    >
      {/* Sovereign State Emblem of India (Ashoka Lion Capital with Satyameva Jayate) — Unboxed & Independent */}
      <StateEmblem
        size={emblemSizes[size]}
        tone={isLight ? "white" : "navy"}
        showMotto={true}
        className="transition-transform duration-200 group-hover:opacity-95"
      />

      {/* Typography Hierarchy */}
      <div className="flex flex-col justify-center leading-tight shrink-0 min-w-0">
        {/* Primary Product Title */}
        <div className="flex items-baseline gap-1">
          <span
            className={`font-black tracking-tight whitespace-nowrap ${
              size === "sm"
                ? "text-base"
                : size === "lg"
                ? "text-2xl sm:text-3xl"
                : "text-lg sm:text-xl"
            } ${isLight ? "text-white" : "text-[#1B365D]"}`}
          >
            {language === "hi" ? "निरीक्षक" : "NIRIKSHAK"}
          </span>
        </div>

        {/* National Tricolor Accent Line */}
        <div className="flex items-center gap-0.5 my-0.5 w-20 sm:w-36">
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
          {language === "hi" ? "निरीक्षण कार्यस्थान" : "Inspection Workstation"}
        </p>
      </div>
    </Link>
  );
};
