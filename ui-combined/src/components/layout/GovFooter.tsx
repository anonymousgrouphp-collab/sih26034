import React from "react";
import { StateEmblem } from "../common/StateEmblem";
import { ShieldCheck, ExternalLink, Scale, CheckCircle2, Lock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export const GovFooter: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer role="contentinfo" className="screen-only no-print bg-[#0D1B2A] text-slate-300 border-t-4 border-amber-500 font-sans mt-auto">
      {/* Tricolor Ribbon */}
      <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

      {/* Main Footer Container */}
      <div className="w-full max-w-[1750px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-8 border-b border-slate-700/60">
          {/* Column 1 (4 cols): State Emblem & Ministry Authority */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-start gap-3.5">
              {/* Sole Sovereign National Emblem of India (Ashoka Lion Capital) — Unboxed & Independent */}
              <StateEmblem size={38} tone="white" showMotto={true} className="shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                  {t("govt.india", "Government of India")}
                </h3>
                <h4 className="text-sm font-black text-white mt-0.5 leading-tight">
                  {t("govt.ministry", "Ministry of Consumer Affairs, Food & Public Distribution")}
                </h4>
                <p className="text-xs font-semibold text-slate-300 mt-1">
                  {t("govt.department", "Department of Consumer Affairs")} — {t("govt.division", "Legal Metrology Division")}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-400/30 text-[10.5px] font-mono text-amber-300 font-bold">
                  <Scale size={12} className="text-amber-400" />
                  <span>
                    {language === "hi"
                      ? "विधिक प्राधिकार: अधिनियम संख्या 1 वर्ष 2010"
                      : "Statutory Authority: Act No. 1 of 2010"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {language === "hi"
                ? "न्यायदृष्टि-एलएम, विधिक मापविज्ञान (पैकेज वस्तुएं) नियम, 2011 के अंतर्गत अधिकृत विधिक मापविज्ञान अधिकारियों (LMO) के लिए स्थापित आधिकारिक डिजिटल अनुपालन सत्यापन कार्यस्थान है।"
                : "NyayaDrishti-LM is the authorized digital compliance verification workstation deployed for authorized Legal Metrology Officers (LMO) under the Legal Metrology (Packaged Commodities) Rules, 2011."}
            </p>
          </div>

          {/* Column 2 (3 cols): Statutory Rules & Standards */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 border-b border-slate-700/60 pb-1.5">
              {language === "hi" ? "सांविधिक अधिनियम एवं नियम" : "Statutory Enactments & Acts"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                <span>{language === "hi" ? "विधिक मापविज्ञान अधिनियम, 2009" : "The Legal Metrology Act, 2009"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                <span>{language === "hi" ? "एलएमपीसी नियम, 2011 (यथा संशोधित 2024)" : "LMPC Rules, 2011 (As Amended 2024)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                <span className="font-bold text-white">
                  {language === "hi" ? "धारा 63 बीएसए 2023 (साक्ष्य ग्राह्यता)" : "Section 63 BSA 2023 (Admissibility)"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                <span>{language === "hi" ? "ई-कॉमर्स अनुपालन जीएसआर 594(E)" : "E-Commerce Compliance GSR 594(E)"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
                <span>{language === "hi" ? "इकाई विक्रय मूल्य अधिदेश जीएसआर 779(E)" : "Unit Sale Price Mandate GSR 779(E)"}</span>
              </li>
            </ul>
          </div>

          {/* Column 3 (3 cols): National Portals & Integrations */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 border-b border-slate-700/60 pb-1.5">
              {language === "hi" ? "राष्ट्रीय अंतःक्रियाशीलता" : "National Interoperability"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a
                  href="https://emaap.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>{language === "hi" ? "ई-माप (राष्ट्रीय विधिक मापविज्ञान पोर्टल)" : "e-Maap (National LM Portal)"}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>{language === "hi" ? "उपभोक्ता मामले विभाग आधिकारिक पोर्टल" : "DoCA Official Portal"}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://egazette.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>{language === "hi" ? "भारत का ई-राजपत्र" : "e-Gazette of India"}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://consumerhelpline.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>{language === "hi" ? "राष्ट्रीय उपभोक्ता हेल्पलाइन (एनसीएच - 1915)" : "National Consumer Helpline (NCH - 1915)"}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://india.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span>{language === "hi" ? "भारत का राष्ट्रीय पोर्टल (india.gov.in)" : "National Portal of India (india.gov.in)"}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 (2 cols): GIGW & Security Certifications */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 border-b border-slate-700/60 pb-1.5">
              {language === "hi" ? "मानक एवं सुरक्षा" : "Standards & Security"}
            </h4>
            <div className="space-y-2 text-[11px] font-mono text-slate-300">
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">GIGW 3.0</div>
                  <div className="text-[9.5px] text-slate-400">
                    {language === "hi" ? "सरकारी वेबसाइट मानक" : "Govt Website Standard"}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex items-center gap-2">
                <Lock size={16} className="text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">SHA-256 Merkle</div>
                  <div className="text-[9.5px] text-slate-400">
                    {language === "hi" ? "धारा 63 बीएसए श्रृंखला" : "Section 63 BSA Chain"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom GIGW Mandatory Disclaimers & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-4 flex-wrap text-center md:text-left">
            <span className="text-slate-300">
              {language === "hi" ? (
                <>
                  <strong className="text-white font-semibold">उपभोक्ता मामले विभाग</strong>, भारत सरकार के लिए अभिकल्पित एवं विकसित।
                </>
              ) : (
                <>
                  Designed & Developed for <strong className="text-white font-semibold">Department of Consumer Affairs</strong>, Government of India.
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-xs font-sans flex-wrap justify-center">
            <span className="hover:text-white cursor-pointer">
              {language === "hi" ? "नियम एवं शर्तें" : "Terms & Conditions"}
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">
              {language === "hi" ? "गोपनीयता नीति" : "Privacy Policy"}
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">
              {language === "hi" ? "हाइपरलिंक नीति" : "Hyperlink Policy"}
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">
              {language === "hi" ? "कॉपीराइट नीति" : "Copyright Policy"}
            </span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">
              {language === "hi" ? "पहुंच-योग्यता विवरण" : "Accessibility Statement"}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-mono">
          <div>
            {language === "hi"
              ? "आधिकारिक इलेक्ट्रॉनिक प्रवर्तन प्रणाली • संस्करण 1.0.0-SIH26034"
              : "Official Electronic Enforcement System • Version 1.0.0-SIH26034"}
          </div>
          <div className="mt-1 sm:mt-0">
            {language === "hi"
              ? "अंतिम अद्यतन: 11 सितंबर 2026 | सर्वर समय: भारतीय मानक समय (UTC+05:30)"
              : "Last Updated: 11 September 2026 | Server Time: IST (UTC+05:30)"}
          </div>
        </div>
      </div>
    </footer>
  );
};
