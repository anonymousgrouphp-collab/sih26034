import React from "react";
import { Link } from "react-router-dom";
import { NirikshakLogoEmblem } from "./NirikshakLogoEmblem";
import { useLanguage } from "../../context/LanguageContext";
import { resetScrollToTop } from "./ScrollToTop";

interface NirikshakBrandLogoProps {
  className?: string;
  tone?: "light" | "dark"; // "light" for dark blue backgrounds, "dark" for white/light backgrounds
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  onClick?: () => void;
}

/**
 * NirikshakBrandLogo — Official Sovereign Brand Masthead
 * Features:
 * - Metrology Balance & Inspection Lens Reticle Emblem (optically weighted for compact display)
 * - Product title: Official NIRIKSHAK Monoline Wordmark SVG
 * - National Tricolor Accent Bar (#FF9933 / #FFFFFF / #138808)
 * - Subtitle: Plus Jakarta Sans / Noto Sans Inspection Workstation
 */
export const NirikshakBrandLogo: React.FC<NirikshakBrandLogoProps> = ({
  className = "",
  tone = "light",
  size = "md",
  showSubtitle = true,
  onClick,
}) => {
  const { language } = useLanguage();

  const isLight = tone === "light"; // on dark navy bg
  const strokeNir = isLight ? "#FFFFFF" : "#1B365D";
  const strokeIkshak = isLight ? "#A9C0EC" : "#2563EB";

  const widthClasses = {
    sm: "w-[92px] sm:w-[112px]",
    md: "w-[114px] sm:w-[138px]",
    lg: "w-[135px] sm:w-[165px]",
  };

  const barWidthClasses = {
    sm: "max-w-[92px] sm:max-w-[112px]",
    md: "max-w-[114px] sm:max-w-[138px]",
    lg: "max-w-[135px] sm:max-w-[165px]",
  };

  return (
    <Link
      to="/"
      onClick={onClick || resetScrollToTop}
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
      title={language === "hi" ? "निरीक्षक — विधिक मापविज्ञान कार्यस्थान" : "NIRIKSHAK — Inspection Workstation"}
    >
      {/* Official Metrology Balance & Inspection Lens Reticle Emblem */}
      <NirikshakLogoEmblem
        size={size}
        tone={tone}
        className="transition-transform duration-200 group-hover:opacity-95 shrink-0"
      />

      {/* Typography Hierarchy */}
      <div className="flex flex-col justify-center leading-none shrink-0 min-w-0">
        {/* Primary Product Title: Official Monoline Wordmark SVG (Bilingual: Hindi & English) */}
        <div className="flex items-center">
          {language === "hi" ? (
            /* Monoline Devanagari Wordmark SVG — Exact same line aesthetic as English */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 588 127"
              fill="none"
              role="img"
              aria-labelledby="wmdTitleHi wmdDescHi"
              className={`${widthClasses[size]} h-auto object-contain transition-transform group-hover:scale-[1.02]`}
            >
              <title id="wmdTitleHi">निरीक्षक शब्द-प्रतीक</title>
              <desc id="wmdDescHi">
                निरीक्षक मोनोलाइन वर्डमार्क: 'निरी' श्वेत रंग में, 'क्षक' मृदु इंडिगो में, और दिव्य दृष्टि-बिंदु हरित व केसरिया रंग में।
              </desc>
              <g strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
                {/* प्रथम भाग: 'निरी' (श्वेत मोनोलाइन) */}
                <g stroke={strokeNir}>
                  {/* शिरोरेखा 'निरी' */}
                  <line x1="16" y1="30" x2="278" y2="30" />
                  {/* 'नि' (ह्रस्व इ-कार + न) */}
                  <line x1="28" y1="30" x2="28" y2="114" />
                  <path d="M 28 30 C 28 8 138 8 138 30" />
                  <line x1="138" y1="30" x2="138" y2="114" />
                  <path d="M 138 72 L 88 72 C 66 72 66 102 88 102 C 106 102 106 72 88 72" />
                  {/* 'री' (र + दीर्घ ई-कार) */}
                  <path d="M 184 30 C 156 30 156 70 184 70 L 214 114" />
                  <line x1="262" y1="30" x2="262" y2="114" />
                  <path d="M 184 30 C 184 8 262 8 262 30" />
                </g>

                {/* द्वितीय भाग: 'क्षक' (मृदु इंडिगो मोनोलाइन) */}
                <g stroke={strokeIkshak}>
                  {/* शिरोरेखा 'क्षक' (निरी से निर्बाध रूप से जुड़ी हुई) */}
                  <line x1="278" y1="30" x2="564" y2="30" />
                  {/* 'क्ष' (प्रमाणिक ज्यामितीय संयुक्त वर्ण) */}
                  <line x1="422" y1="30" x2="422" y2="114" />
                  <path d="M 422 72 L 372 72 C 350 72 346 46 362 44 C 378 42 380 60 366 68 L 344 90 C 336 98 346 112 360 106 L 382 114" />
                  {/* 'क' (मोनोलाइन कण्डली एवं अंकुश) */}
                  <line x1="504" y1="30" x2="504" y2="114" />
                  <path d="M 504 52 C 452 52 452 92 504 92" />
                  <path d="M 504 72 C 554 72 554 86 554 104" />
                </g>
              </g>

              {/* दिव्य दृष्टि-बिंदु (Seeing-Tittle) 'री' के शिखर पर */}
              <circle cx="223" cy="11" r="6" stroke="#34D399" strokeWidth="4" />
              <circle cx="223" cy="11" r="2.1" fill="#FF9933" />
            </svg>
          ) : (
            /* Monoline English Wordmark SVG */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 588 127"
              fill="none"
              role="img"
              aria-labelledby="wmdTitle wmdDesc"
              className={`${widthClasses[size]} h-auto object-contain transition-transform group-hover:scale-[1.02]`}
            >
              <title id="wmdTitle">NIRIKSHAK wordmark (on dark)</title>
              <desc id="wmdDesc">NIRIKSHAK monoline wordmark tuned for dark navy surfaces: NIR in white, IKSHAK in soft indigo, seeing-tittle in emerald and saffron.</desc>
              <g strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <g stroke={strokeNir}>
                  <g transform="translate(6,30)"><path d="M8 86 L8 0 L56 86 L56 0"/></g>
                  <g transform="translate(78,30)"><path d="M8 0 L8 86"/></g>
                  <g transform="translate(112,30)"><path d="M8 86 L8 0 L26 0 A23 21.5 0 0 1 26 43 L8 43 M27 43 L56 86"/></g>
                </g>
                <g stroke={strokeIkshak}>
                  <g transform="translate(188,30)"><path d="M8 0 L8 86"/></g>
                  <g transform="translate(224,30)"><path d="M8 0 L8 86 M54 0 L8 43 M22 30 L56 86"/></g>
                  <g transform="translate(298,30)"><path d="M48 12 C40 2 16 3 11 19 C6 34 28 39 37 44 C48 50 52 57 47 69 C41 83 14 83 8 70"/></g>
                  <g transform="translate(366,30)"><path d="M8 0 L8 86 M56 0 L56 86 M8 43 L56 43"/></g>
                  <g transform="translate(442,30)"><path d="M31 0 L6 86 M31 0 L56 86 M14 58 L48 58"/></g>
                  <g transform="translate(518,30)"><path d="M8 0 L8 86 M54 0 L8 43 M22 30 L56 86"/></g>
                </g>
              </g>
              <circle cx="196" cy="12" r="6" stroke="#34D399" strokeWidth="4"/>
              <circle cx="196" cy="12" r="2.1" fill="#FF9933"/>
            </svg>
          )}
        </div>

        {/* National Tricolor Accent Line — Calibrated to Wordmark & Subtitle Width */}
        <div className={`flex items-center gap-0.5 mt-1 ${showSubtitle ? "mb-1" : ""} w-full ${barWidthClasses[size]}`}>
          <div className="h-[2px] flex-1 bg-[#FF9933] rounded-full" />
          <div className={`h-[2px] w-1.5 rounded-full ${isLight ? "bg-white" : "bg-slate-300"}`} />
          <div className="h-[2px] flex-1 bg-[#138808] rounded-full" />
        </div>

        {/* Subtitle / Classification — Untruncated and clearly legible */}
        {showSubtitle && (
          <p
            className={`w-full ${barWidthClasses[size]} text-[9px] sm:text-[10px] font-medium tracking-[0.01em] font-['Plus_Jakarta_Sans',_'Noto_Sans',_sans-serif] whitespace-nowrap overflow-visible hidden sm:block leading-tight ${
              isLight ? "text-slate-200/90" : "text-slate-700"
            }`}
          >
            {language === "hi" ? "निरीक्षण कार्यस्थान" : "Inspection Workstation"}
          </p>
        )}
      </div>
    </Link>
  );
};
