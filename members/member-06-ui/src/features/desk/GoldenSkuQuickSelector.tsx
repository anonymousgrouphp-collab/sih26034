import React from "react";

export interface GoldenSkuItem {
  skuId: string;
  caseId: string;
  name: string;
  verdict: "FAIL" | "PASS" | "REVIEW" | "UNABLE";
  verdictLabel: string;
  description: string;
  ruleCitation: string;
}

export const GOLDEN_SKU_ITEMS: GoldenSkuItem[] = [
  {
    skuId: "SKU-DEMO-01",
    caseId: "SKU-DEMO-01",
    name: "Butter Cookies 200g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    description: "Font deficit (1.84 vs 2.50 mm) + Banned 'gms' unit",
    ruleCitation: "Rule 6(1)(h) Table-I / Section 11",
  },
  {
    skuId: "SKU-DEMO-02",
    caseId: "SKU-DEMO-02",
    name: "Ready Curry Pouch 300g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    description: "USP Mismatch (Declared ₹0.28 vs Calc ₹0.23/g)",
    ruleCitation: "Rule 6(1)(e) USP Math",
  },
  {
    skuId: "SKU-DEMO-03",
    caseId: "SKU-DEMO-03",
    name: "Packaged Water 1000ml",
    verdict: "PASS",
    verdictLabel: "PASS",
    description: "100% Statutory Compliant (Font & USP Pass)",
    ruleCitation: "LMPC Rules, 2011 Standard",
  },
  {
    skuId: "SKU-DEMO-04",
    caseId: "SKU-DEMO-04",
    name: "Herbal Soap 125g",
    verdict: "REVIEW",
    verdictLabel: "REVIEW",
    description: "Borderline measurement within sensor k=2 band (2.46 mm)",
    ruleCitation: "Physical Caliper Retest Advised",
  },
  {
    skuId: "SKU-DEMO-05",
    caseId: "SKU-DEMO-05",
    name: "Potato Chips 75g",
    verdict: "UNABLE",
    verdictLabel: "UNABLE",
    description: "Specular Glare Bloom (6.4% > 3.0%) statutory retake",
    ruleCitation: "Section 63 BSA 2023 Optical Gate",
  },
  {
    skuId: "SKU-DEMO-06",
    caseId: "SKU-DEMO-06",
    name: "E-Commerce Tea 500g",
    verdict: "FAIL",
    verdictLabel: "FAIL",
    description: "Rule 6(10) Violation: Missing Country of Origin",
    ruleCitation: "E-Commerce GSR 594(E)",
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
          Demo SKUs:
        </span>
        {GOLDEN_SKU_ITEMS.map((item) => {
          const isSelected = activeSkuId === item.skuId || activeSkuId === item.caseId;
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
              title={`${item.name} — ${item.description}`}
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
                {item.verdictLabel}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/95 border border-slate-700 rounded-lg p-4 shadow-sm text-slate-200 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 border-b border-slate-700/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-base" aria-hidden="true">⭐</span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Golden Demonstration SKUs (Pre-Certified Test Scenarios)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          1-Click load for instant end-to-end statutory verification
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {GOLDEN_SKU_ITEMS.map((item) => {
          const isSelected = activeSkuId === item.skuId || activeSkuId === item.caseId;
          return (
            <button
              key={item.skuId}
              type="button"
              onClick={() => onSelectSku(item.caseId)}
              className={`p-2.5 rounded-md text-left transition group border flex flex-col justify-between ${getCardBorder(
                item.verdict,
                isSelected
              )}`}
            >
              <div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span className="font-mono font-semibold">{item.skuId}</span>
                  <span
                    className={`px-1.5 py-0.5 font-bold rounded text-[9px] border ${getBadgeStyle(
                      item.verdict
                    )}`}
                  >
                    {item.verdictLabel}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors" title={item.name}>
                  {item.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight" title={item.description}>
                  {item.description}
                </div>
              </div>
              <div className="mt-2 text-[9px] font-mono text-slate-500 truncate pt-1 border-t border-slate-800">
                {item.ruleCitation}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
