import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { InspectionCase } from "../../types/inspection";
import { VerdictBadge, WorkflowBadge } from "../../components/common/StatusBadge";
import { ApiService } from "../../services/api";
import { GoldenSkuQuickSelector } from "../desk/GoldenSkuQuickSelector";

interface CaseHeaderProps {
  caseData: InspectionCase;
  onBack: () => void;
  isProcessing?: boolean;
  onSelectSku?: (caseId: string) => void;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseData,
  onBack,
  isProcessing = false,
  onSelectSku,
}) => {
  const { language } = useLanguage();
  const isMock = caseData.is_mock_fixture || ApiService.isMockMode();

  return (
    <div className="case-header screen-only no-print bg-panelBg border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
      {/* Top Row: Navigation + Statuses */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-govNavy hover:bg-slate-100 border border-slate-300 transition-colors focus:outline-none focus:ring-1 focus:ring-govNavy"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{language === "hi" ? "निरीक्षण डेस्क" : "Inspection Desk"}</span>
          </button>
          <div className="h-4 w-px bg-slate-300 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-govNavy">
              {caseData.inspection_number}
            </span>
            {isMock && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-semibold" title="Running in Standalone Demo / Local Mode">
                {language === "hi" ? "डेमो / स्थानीय मोड" : "DEMO / LOCAL MODE"}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <WorkflowBadge status={isProcessing ? "PROCESSING" : (caseData.workflow_status || "OPEN")} />
          {caseData.workflow_status === "DRAFT" || caseData.evidence_assets.length === 0 ? (
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              {language === "hi" ? "[कोई साक्ष्य प्रस्तुत नहीं]" : "[NO EVIDENCE SUBMITTED]"}
            </span>
          ) : (
            <VerdictBadge verdict={caseData.overall_status} />
          )}
        </div>
      </div>

      {/* Quick Demo Scenario Switcher (Compact Bar) */}
      {onSelectSku && (
        <div className="pt-0.5 pb-1 border-b border-slate-100">
          <GoldenSkuQuickSelector
            onSelectSku={onSelectSku}
            activeSkuId={caseData.sku_demo_id || caseData.id}
            isCompact={true}
          />
        </div>
      )}

      {/* Details Row: Commodity, Trader, Registration Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === "hi" ? "पैकेज्ड वस्तु" : "Packaged Commodity"}
          </span>
          <div className="font-bold text-slate-900 truncate" title={caseData.product_name}>
            {caseData.product_name}
          </div>
          <div className="text-[11px] text-slate-500">
            {language === "hi" ? "ब्रांड:" : "Brand:"} <span className="font-semibold text-slate-700">{caseData.brand_name || (language === "hi" ? "गैर-ब्रांडेड / सामान्य" : "Unbranded / Generics")}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === "hi" ? "प्रतिष्ठान / परिसर" : "Establishment / Premises"}
          </span>
          <div className="font-semibold text-slate-800 truncate" title={caseData.establishment_name || "Field Seizure"}>
            {caseData.establishment_name || (language === "hi" ? "क्षेत्र जब्ती / खुदरा दुकान" : "Field Seizure / Retail Store")}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {caseData.premises_address || (language === "hi" ? "क्षेत्रीय अभियान में दर्ज परिसर" : "Premises recorded during field drive")}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === "hi" ? "श्रेणी एवं ज्यामिति" : "Category & Geometry"}
          </span>
          <div className="font-semibold text-slate-800">
            {caseData.category}
          </div>
          <div className="text-[11px] text-slate-500">
            {language === "hi" ? "आकार:" : "Shape:"} <span className="font-mono text-slate-700">{caseData.package_type}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === "hi" ? "अधिकार क्षेत्र एवं दिनांक" : "Jurisdiction & Date"}
          </span>
          <div className="font-mono text-slate-800">
            {caseData.jurisdiction_id}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {new Date(caseData.created_at).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
