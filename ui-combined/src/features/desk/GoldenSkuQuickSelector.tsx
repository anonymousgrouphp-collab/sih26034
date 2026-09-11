import React from "react";
import { useLanguage } from "../../context/LanguageContext";

export interface GoldenSkuItem {
  skuId: string;
  caseId: string;
  name: string;
  nameHi?: string;
  verdict: "FAIL" | "PASS" | "REVIEW" | "UNABLE";
  verdictLabel: string;
  verdictLabelHi?: string;
  description: string;
  descriptionHi?: string;
  ruleCitation: string;
  ruleCitationHi?: string;
}

export const GOLDEN_SKU_ITEMS: GoldenSkuItem[] = [
  {
    skuId: "SKU-DEMO-01",
    caseId: "SKU-DEMO-01",
    name: "Butter Cookies 200g",
    nameHi: "बटर कुकीज़ 200g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    verdictLabelHi: "अनुत्तीर्ण",
    description: "Font deficit (1.84 vs 2.50 mm) + Banned 'gms' unit",
    descriptionHi: "फॉन्ट कमी (1.84 बनाम 2.50 मिमी) + प्रतिबंधित 'gms' इकाई",
    ruleCitation: "Rule 6(1)(h) Table-I / Section 11",
    ruleCitationHi: "नियम 6(1)(h) तालिका-I / धारा 11",
  },
  {
    skuId: "SKU-DEMO-02",
    caseId: "SKU-DEMO-02",
    name: "Ready Curry Pouch 300g",
    nameHi: "रेडी करी पाउच 300g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    verdictLabelHi: "अनुत्तीर्ण",
    description: "USP Mismatch (Declared ₹0.28 vs Calc ₹0.23/g)",
    descriptionHi: "यूएसपी विसंगति (घोषित ₹0.28 बनाम परिकलित ₹0.23/g)",
    ruleCitation: "Rule 6(1)(e) USP Math",
    ruleCitationHi: "नियम 6(1)(e) यूएसपी गणित",
  },
  {
    skuId: "SKU-DEMO-03",
    caseId: "SKU-DEMO-03",
    name: "Packaged Water 1000ml",
    nameHi: "पैकेजबंद जल 1000ml",
    verdict: "PASS",
    verdictLabel: "PASS",
    verdictLabelHi: "उत्तीर्ण",
    description: "100% Statutory Compliant (Font & USP Pass)",
    descriptionHi: "100% सांविधिक अनुपालन (फॉन्ट एवं यूएसपी उत्तीर्ण)",
    ruleCitation: "LMPC Rules, 2011 Standard",
    ruleCitationHi: "एलएमपीसी नियम, 2011 मानक",
  },
  {
    skuId: "SKU-DEMO-04",
    caseId: "SKU-DEMO-04",
    name: "Herbal Soap 125g",
    nameHi: "हर्बल साबुन 125g",
    verdict: "REVIEW",
    verdictLabel: "REVIEW",
    verdictLabelHi: "समीक्षा",
    description: "Borderline measurement within sensor k=2 band (2.46 mm)",
    descriptionHi: "सेंसर k=2 बैंड (2.46 मिमी) के भीतर सीमांत माप",
    ruleCitation: "Physical Caliper Retest Advised",
    ruleCitationHi: "भौतिक कैलिपर पुनः परीक्षण अनुशंसित",
  },
  {
    skuId: "SKU-DEMO-05",
    caseId: "SKU-DEMO-05",
    name: "Potato Chips 75g",
    nameHi: "आलू चिप्स 75g",
    verdict: "UNABLE",
    verdictLabel: "UNABLE",
    verdictLabelHi: "असमर्थ",
    description: "Specular Glare Bloom (6.4% > 3.0%) statutory retake",
    descriptionHi: "चकाचौंध फैलाव (6.4% > 3.0%) सांविधिक पुनः कैप्चर",
    ruleCitation: "Section 63 BSA 2023 Optical Gate",
    ruleCitationHi: "धारा 63 बीएसए 2023 प्रकाशीय द्वार",
  },
  {
    skuId: "SKU-DEMO-06",
    caseId: "SKU-DEMO-06",
    name: "E-Commerce Tea 500g",
    nameHi: "ई-कॉमर्स चाय 500g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    verdictLabelHi: "अनुत्तीर्ण",
    description: "Rule 6(10) Violation: Missing Country of Origin",
    descriptionHi: "नियम 6(10) उल्लंघन: मूल देश अनुपस्थित",
    ruleCitation: "E-Commerce GSR 594(E)",
    ruleCitationHi: "ई-कॉमर्स जीएसआर 594(ई)",
  },
  {
    skuId: "INS-2026-0001",
    caseId: "INS-2026-0001",
    name: "Aashirvaad Atta 500g",
    nameHi: "आशीर्वाद आटा 500g",
    verdict: "PASS",
    verdictLabel: "PASS",
    verdictLabelHi: "उत्तीर्ण",
    description: "Full compliance (Font 4.2mm, MRP ₹32.00, SI units verified)",
    descriptionHi: "पूर्ण अनुपालन (फॉन्ट 4.2mm, एमआरपी ₹32.00, एसआई इकाइयां सत्यापित)",
    ruleCitation: "Field Package Benchmark",
    ruleCitationHi: "फील्ड पैकेज बेंचमार्क",
  },
  {
    skuId: "INS-2026-0002",
    caseId: "INS-2026-0002",
    name: "FizzUp Lemon 1L",
    nameHi: "फिज़अप लेमन 1L",
    verdict: "REVIEW",
    verdictLabel: "CONFLICT",
    verdictLabelHi: "परस्पर विरोधी",
    description: "Dual conflicting price markings (₹48.00 vs ₹45.00)",
    descriptionHi: "दोहरी परस्पर विरोधी मूल्य अंकन (₹48.00 बनाम ₹45.00)",
    ruleCitation: "Rule 18(1) Dual Pricing Check",
    ruleCitationHi: "नियम 18(1) दोहरी मूल्य निर्धारण जांच",
  },
  {
    skuId: "INS-2026-0003",
    caseId: "INS-2026-0003",
    name: "CleanHome Cleaner 250g",
    nameHi: "क्लीनहोम क्लीनर 250g",
    verdict: "UNABLE",
    verdictLabel: "UNABLE",
    verdictLabelHi: "असमर्थ",
    description: "Missing calibration fiducial on packaging plane",
    descriptionHi: "पैकेजिंग तल पर अंशांकन संदर्भ मानक चिन्ह अनुपस्थित",
    ruleCitation: "Section 63 BSA Calibration Gap",
    ruleCitationHi: "धारा 63 बीएसए अंशांकन अंतराल",
  },
  {
    skuId: "demo-fortune-sunlite",
    caseId: "demo-fortune-sunlite",
    name: "Fortune Sunlite Oil 1L",
    nameHi: "फॉर्च्यून सनलाइट तेल 1L",
    verdict: "PASS",
    verdictLabel: "PASS",
    verdictLabelHi: "उत्तीर्ण",
    description: "ArUco calibrated, USP consistency, and full Section 63 proof",
    descriptionHi: "ArUco अंशांकित, यूएसपी निरंतरता, एवं पूर्ण धारा 63 प्रमाण",
    ruleCitation: "Standard Live Demo Case",
    ruleCitationHi: "मानक लाइव डेमो मामला",
  },
];

interface GoldenSkuQuickSelectorProps {
  onSelectSku: (caseId: string) => void;
  activeSkuId?: string;
  isCompact?: boolean;
}

export const GoldenSkuQuickSelector: React.FC<GoldenSkuQuickSelectorProps> = ({
  onSelectSku,
  activeSkuId,
  isCompact = false,
}) => {
  const { language } = useLanguage();

  const getBadgeStyle = (verdict: GoldenSkuItem["verdict"]) => {
    switch (verdict) {
      case "FAIL":
        return "bg-red-950/80 text-red-400 border-red-900/80";
      case "PASS":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-900/80";
      case "REVIEW":
        return "bg-amber-950/80 text-amber-400 border-amber-900/80";
      case "UNABLE":
        return "bg-purple-950/80 text-purple-400 border-purple-900/80";
    }
  };

  const getCardBorder = (verdict: GoldenSkuItem["verdict"], isSelected: boolean) => {
    if (isSelected) {
      return "border-amber-400 ring-2 ring-amber-400/50 bg-slate-900";
    }
    switch (verdict) {
      case "FAIL":
        return "border-rose-900/40 hover:border-rose-600 bg-slate-900/90";
      case "PASS":
        return "border-emerald-900/40 hover:border-emerald-600 bg-slate-900/90";
      case "REVIEW":
        return "border-amber-900/40 hover:border-amber-600 bg-slate-900/90";
      case "UNABLE":
        return "border-purple-900/40 hover:border-purple-600 bg-slate-900/90";
    }
  };

  if (isCompact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1">
          {language === "hi" ? "डेमो एसकेयू:" : "Demo SKUs:"}
        </span>
        {GOLDEN_SKU_ITEMS.map((item) => {
          const isSelected = activeSkuId === item.skuId || activeSkuId === item.caseId;
          const label = language === "hi" && item.verdictLabelHi ? item.verdictLabelHi : item.verdictLabel;
          const itemName = language === "hi" && item.nameHi ? item.nameHi : item.name;
          const itemDesc = language === "hi" && item.descriptionHi ? item.descriptionHi : item.description;

          return (
            <button
              key={item.skuId}
              type="button"
              onClick={() => onSelectSku(item.caseId)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium flex items-center gap-1.5 border transition shrink-0 ${
                isSelected
                  ? "bg-govNavy text-white border-govNavy-light shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100 border-slate-300"
              }`}
              title={`${itemName} — ${itemDesc}`}
            >
              <span>{item.skuId}</span>
              <span
                className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                  item.verdict === "FAIL"
                    ? "bg-rose-100 text-rose-700"
                    : item.verdict === "PASS"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.verdict === "REVIEW"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-govNavy uppercase tracking-wider">
              {language === "hi"
                ? "स्वर्ण प्रदर्शन एसकेयू (पूर्व-प्रमाणित परीक्षण परिदृश्य)"
                : "Golden Demonstration SKUs (Pre-Certified Test Scenarios)"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {language === "hi"
                ? "एलएमपीसी नियम, 2011 के अंतर्गत तत्काल पूर्ण सांविधिक सत्यापन हेतु 1-क्लिक लोड"
                : "1-Click load for instant end-to-end statutory verification under LMPC Rules, 2011"}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {language === "hi" ? "6 स्वर्ण परीक्षण मामले तैयार" : "6 Golden Test Cases Ready"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {GOLDEN_SKU_ITEMS.map((item) => {
          const isSelected = activeSkuId === item.skuId || activeSkuId === item.caseId;
          const badgeStyles = {
            FAIL: "bg-rose-50 text-rose-800 border-rose-200",
            PASS: "bg-emerald-50 text-emerald-800 border-emerald-200",
            REVIEW: "bg-amber-50 text-amber-900 border-amber-200",
            UNABLE: "bg-purple-50 text-purple-900 border-purple-200",
          };

          const cardStyles = isSelected
            ? "border-amber-500 ring-2 ring-amber-400/40 bg-amber-50/30 shadow-sm"
            : "border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-300 hover:shadow-md";

          const label = language === "hi" && item.verdictLabelHi ? item.verdictLabelHi : item.verdictLabel;
          const itemName = language === "hi" && item.nameHi ? item.nameHi : item.name;
          const itemDesc = language === "hi" && item.descriptionHi ? item.descriptionHi : item.description;
          const citation = language === "hi" && item.ruleCitationHi ? item.ruleCitationHi : item.ruleCitation;

          return (
            <button
              key={item.skuId}
              type="button"
              onClick={() => onSelectSku(item.caseId)}
              className={`p-3 rounded-lg text-left transition-all duration-200 border flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-govNavy ${cardStyles}`}
            >
              <div>
                <div className="flex justify-between items-center text-[10px] mb-1.5">
                  <span className="font-mono font-bold text-slate-600 group-hover:text-govNavy">
                    {item.skuId}
                  </span>
                  <span
                    className={`px-2 py-0.5 font-bold rounded text-[9.5px] border ${badgeStyles[item.verdict]}`}
                  >
                    {label}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-govNavy transition-colors line-clamp-1">
                  {itemName}
                </div>
                <div className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {itemDesc}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] font-mono text-slate-500 truncate flex items-center justify-between">
                <span className="truncate">{citation}</span>
                <span className="text-amber-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
