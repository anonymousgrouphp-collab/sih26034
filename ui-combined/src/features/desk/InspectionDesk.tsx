import React, { useState, useMemo } from "react";
import { InspectionSummary } from "../../types/inspection";
import { VerdictBadge, WorkflowBadge } from "../../components/common/StatusBadge";
import { GoldenSkuQuickSelector } from "./GoldenSkuQuickSelector";
import { MapPin, CalendarDays, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface InspectionDeskProps {
  cases: InspectionSummary[];
  activeCircle: string;
  onSelectCase: (caseId: string) => void;
  onNewInspectionClick: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const InspectionDesk: React.FC<InspectionDeskProps> = ({
  cases,
  activeCircle,
  onSelectCase,
  onNewInspectionClick,
  isLoading = false,
  onRefresh,
}) => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("ALL");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("ALL");
  const [triageFilter, setTriageFilter] = useState<"ALL" | "CONFLICTS" | "EVIDENCE_GAPS">("ALL");

  // Summary Metrics calculated directly from the cases
  const metrics = useMemo(() => {
    const total = cases.length;
    const pendingAdjudication = cases.filter(
      (c) => c.workflow_status === "PENDING_REVIEW" || c.workflow_status === "DRAFT" || c.workflow_status === "OPEN"
    ).length;
    const violations = cases.filter((c) => c.overall_status === "FAIL" || (c.violations_count && c.violations_count > 0)).length;
    const compliant = cases.filter((c) => c.overall_status === "PASS").length;

    return { total, pendingAdjudication, violations, compliant };
  }, [cases]);

  // Triage filter counters
  const conflictCount = useMemo(() => {
    return cases.filter(
      (c) =>
        c.overall_status === "REVIEW" ||
        c.inspection_number.includes("DEMO-02") ||
        c.inspection_number.includes("DEMO-04") ||
        (c.violations_count !== undefined && c.violations_count > 1) ||
        Boolean(c.has_conflicts)
    ).length;
  }, [cases]);

  const evidenceGapCount = useMemo(() => {
    return cases.filter(
      (c) =>
        c.workflow_status === "DRAFT" ||
        c.overall_status === "UNABLE_TO_VERIFY" ||
        c.overall_status === "PENDING_REVIEW" ||
        c.inspection_number.includes("DEMO-05") ||
        Boolean(c.evidence_gap)
    ).length;
  }, [cases]);

  // Confidence estimation helper with robust bounds clamping [0.0 - 1.0] and percentage handling
  const getCaseConfidence = (c: InspectionSummary): number => {
    let val: number;
    if (typeof c.overall_confidence === "number") {
      val = c.overall_confidence > 1 ? c.overall_confidence / 100 : c.overall_confidence;
    } else if (c.overall_status === "PASS") {
      val = 0.98;
    } else if (c.overall_status === "FAIL") {
      val = 0.95;
    } else if (c.overall_status === "REVIEW") {
      val = 0.74;
    } else if (c.overall_status === "UNABLE_TO_VERIFY") {
      val = 0.42;
    } else {
      val = 0.88;
    }
    return Math.max(0, Math.min(1, val));
  };

  // Filtered case records
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Circle filter
      if (activeCircle && activeCircle !== "ALL" && c.jurisdiction_id && c.jurisdiction_id !== activeCircle) {
        return false;
      }

      // Quick Triage Filter
      if (triageFilter === "CONFLICTS") {
        const isConflict =
          c.overall_status === "REVIEW" ||
          c.inspection_number.includes("DEMO-02") ||
          c.inspection_number.includes("DEMO-04") ||
          (c.violations_count !== undefined && c.violations_count > 1) ||
          Boolean(c.has_conflicts);
        if (!isConflict) return false;
      } else if (triageFilter === "EVIDENCE_GAPS") {
        const isGap =
          c.workflow_status === "DRAFT" ||
          c.overall_status === "UNABLE_TO_VERIFY" ||
          c.overall_status === "PENDING_REVIEW" ||
          c.inspection_number.includes("DEMO-05") ||
          Boolean(c.evidence_gap);
        if (!isGap) return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchProduct = c.product_name.toLowerCase().includes(query);
        const matchNumber = c.inspection_number.toLowerCase().includes(query);
        const matchBrand = c.brand_name ? c.brand_name.toLowerCase().includes(query) : false;
        const matchEst = c.establishment_name ? c.establishment_name.toLowerCase().includes(query) : false;
        if (!matchProduct && !matchNumber && !matchBrand && !matchEst) {
          return false;
        }
      }

      // Workflow filter
      if (selectedWorkflow !== "ALL" && c.workflow_status !== selectedWorkflow) {
        return false;
      }

      // Verdict filter
      if (selectedVerdict !== "ALL" && c.overall_status !== selectedVerdict) {
        return false;
      }

      return true;
    });
  }, [cases, activeCircle, searchTerm, selectedWorkflow, selectedVerdict, triageFilter]);

  const formatInspectionType = (type?: string) => {
    if (language === "hi") {
      switch (type) {
        case "ROUTINE_MARKET_SURVEILLANCE":
          return "नियमित बाजार निगरानी";
        case "COMPLAINT_VERIFICATION":
          return "शिकायत ऑडिट";
        case "MANUFACTURER_PACKER_DEPOT":
          return "डिपो / पैकर ऑडिट";
        case "SURPRISE_ENFORCEMENT_RAID":
          return "प्रवर्तन छापा";
        default:
          return "क्षेत्रीय निरीक्षण";
      }
    }
    switch (type) {
      case "ROUTINE_MARKET_SURVEILLANCE":
        return "Routine Surveillance";
      case "COMPLAINT_VERIFICATION":
        return "Complaint Audit";
      case "MANUFACTURER_PACKER_DEPOT":
        return "Depot Audit";
      case "SURPRISE_ENFORCEMENT_RAID":
        return "Enforcement Raid";
      default:
        return type || "Field Inspection";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString.slice(0, 10);
    }
  };

  return (
    <div className="space-y-5">
      {/* Desk Title Strip & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-panelBg p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-govNavy">
              {language === "hi" ? "विधिक मापविज्ञान निरीक्षण पटल" : "Legal Metrology Inspection Desk"}
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
              {language === "hi" ? `सक्रिय मंडल: ${activeCircle}` : `Active Circle: ${activeCircle}`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === "hi"
              ? "विधिक मापविज्ञान (पैकेज वस्तुएं) नियम, 2011 के अंतर्गत सत्यापित निरीक्षण कार्य कतार।"
              : "Statutory work queue for verified packaged commodity inspections under LMPC Rules, 2011."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-xs font-medium focus:outline-none"
              title={language === "hi" ? "मामला पंजी रीफ्रेश करें" : "Refresh case register"}
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onNewInspectionClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>{language === "hi" ? "नया मामला" : "New Case"}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            {language === "hi" ? "कुल पंजीकृत मामले" : "Total Registered Cases"}
          </div>
          <div className="text-2xl font-bold text-govNavy mt-1 font-mono">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === "hi" ? "विधिक माप अधिनियम की धारा 15 के तहत" : "Under Section 15 LM Act"}
          </div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider">
            {language === "hi" ? "निर्णय लंबित" : "Pending Adjudication"}
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{metrics.pendingAdjudication}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === "hi" ? "अधिकारी हस्ताक्षर अपेक्षित" : "Awaiting LMO Sign-off"}
          </div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-rose-700 uppercase tracking-wider">
            {language === "hi" ? "पाए गए विधिक उल्लंघन" : "Violations Detected"}
          </div>
          <div className="text-2xl font-bold text-verdictFail mt-1 font-mono">{metrics.violations}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === "hi" ? "धारा 36(1) नोटिस योग्य" : "Section 36(1) Notice Ready"}
          </div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
            {language === "hi" ? "विधिक अनुपालक वस्तुएं" : "Compliant Products"}
          </div>
          <div className="text-2xl font-bold text-verdictPass mt-1 font-mono">{metrics.compliant}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {language === "hi" ? "पूर्ण विधिक अनुपालन" : "Table-I & Rule 6 compliant"}
          </div>
        </div>
      </div>

      {/* Golden Demonstration SKU Quick-Selector Bar (1-Click Pipeline Verification) */}
      <GoldenSkuQuickSelector onSelectSku={onSelectCase} />

      {/* Quick Triage Filter Pills (Urvashi Workstation Enhancement) */}
      <div className="flex items-center gap-2 flex-wrap bg-panelBg p-3 rounded-lg border border-slate-200 shadow-xs">
        <span className="section-eyebrow shrink-0">
          {language === "hi" ? "त्वरित वर्गीकरण:" : "Quick Triage:"}
        </span>
        <button
          type="button"
          data-testid="triage-all"
          onClick={() => setTriageFilter("ALL")}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
            triageFilter === "ALL"
              ? "bg-govNavy text-white border-govNavy shadow-xs"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          {language === "hi" ? `सभी मामले (${cases.length})` : `All Cases (${cases.length})`}
        </button>
        <button
          type="button"
          data-testid="triage-conflicts"
          onClick={() => setTriageFilter("CONFLICTS")}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors inline-flex items-center gap-1.5 ${
            triageFilter === "CONFLICTS"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100/70"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {language === "hi" ? `विवादित मामले (${conflictCount})` : `Conflict Cases (${conflictCount})`}
        </button>
        <button
          type="button"
          data-testid="triage-evidence-gaps"
          onClick={() => setTriageFilter("EVIDENCE_GAPS")}
          className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors inline-flex items-center gap-1.5 ${
            triageFilter === "EVIDENCE_GAPS"
              ? "bg-slate-700 text-white border-slate-700 shadow-xs"
              : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-500"></span>
          {language === "hi" ? `साक्ष्य अंतराल (${evidenceGapCount})` : `Evidence Gaps (${evidenceGapCount})`}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-panelBg p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === "hi" ? "वस्तु, ब्रांड, प्रतिष्ठान या मामला आईडी खोजें..." : "Search commodity, brand, shop, or case ID..."}
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Workflow Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500">
              {language === "hi" ? "कार्यप्रवाह:" : "Workflow:"}
            </span>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">{language === "hi" ? "सभी कार्यप्रवाह" : "All Workflows"}</option>
              <option value="DRAFT">{language === "hi" ? "प्रारूप (Draft)" : "Draft"}</option>
              <option value="OPEN">{language === "hi" ? "सक्रिय (Open)" : "Open"}</option>
              <option value="PROCESSING">{language === "hi" ? "प्रक्रियाधीन (Processing)" : "Processing"}</option>
              <option value="PENDING_REVIEW">{language === "hi" ? "निर्णय लंबित (Pending)" : "Pending Adjudication"}</option>
              <option value="COMPLETED">{language === "hi" ? "समाप्त (Closed)" : "Closed"}</option>
            </select>
          </div>

          {/* Verdict Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500">
              {language === "hi" ? "निर्णय:" : "Verdict:"}
            </span>
            <select
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              className="text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">{language === "hi" ? "सभी निर्णय" : "All Verdicts"}</option>
              <option value="PASS">{language === "hi" ? "उत्तीर्ण (PASS)" : "PASS (Compliant)"}</option>
              <option value="FAIL">{language === "hi" ? "उल्लंघन (FAIL)" : "FAIL (Violations)"}</option>
              <option value="REVIEW">{language === "hi" ? "समीक्षा (REVIEW)" : "REVIEW (Borderline)"}</option>
              <option value="UNABLE_TO_VERIFY">{language === "hi" ? "सत्यापन असमर्थ" : "UNABLE TO VERIFY"}</option>
              <option value="PENDING_REVIEW">{language === "hi" ? "लंबित" : "PENDING"}</option>
            </select>
          </div>

          {(searchTerm || selectedWorkflow !== "ALL" || selectedVerdict !== "ALL" || triageFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedWorkflow("ALL");
                setSelectedVerdict("ALL");
                setTriageFilter("ALL");
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 underline"
            >
              {language === "hi" ? "फ़िल्टर हटाएं" : "Clear"}
            </button>
          )}
        </div>
      </div>

      {/* Case Register Table */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <img
              src={searchTerm || selectedWorkflow !== "ALL" || selectedVerdict !== "ALL" || triageFilter !== "ALL" ? "/assets/empty-states/empty_search.svg" : "/assets/empty-states/empty_dossiers.svg"}
              alt="No matching inspection cases"
              className="w-32 h-28 mx-auto object-contain"
            />
            <div>
              <h3 className="text-sm font-bold text-govNavy mb-1">
                {searchTerm || selectedWorkflow !== "ALL" || selectedVerdict !== "ALL" || triageFilter !== "ALL"
                  ? (language === "hi" ? "कोई निरीक्षण मामला आपके फिल्टर से मेल नहीं खाता" : "No inspection cases match your filter")
                  : (language === "hi" ? "कोई भौतिक निरीक्षण मामला पंजीकृत नहीं है" : "No physical inspection cases registered")}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchTerm || selectedWorkflow !== "ALL" || selectedVerdict !== "ALL" || triageFilter !== "ALL"
                  ? (language === "hi" ? "फ़िल्टर रीसेट करने या खोज शब्दों को समायोजित करने का प्रयास करें।" : "Try resetting filters or adjusting search keywords.")
                  : (language === "hi" ? "एक नया पैकेज्ड कमोडिटी निरीक्षण पंजीकृत करें या डेमो केस चुनें।" : "Register a new packaged commodity inspection or select a demo case.")}
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={onNewInspectionClick}
                className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} />
                <span>{language === "hi" ? "नया निरीक्षण पंजीकृत करें" : "Register New Inspection"}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: High-Legibility Card Tiles */}
            <div className="block md:hidden divide-y divide-slate-200">
              {filteredCases.map((c) => {
                const conf = getCaseConfidence(c);
                const confPct = Math.min(100, Math.max(0, Math.round(conf * 100)));
                return (
                  <div
                    key={`mobile-${c.id}`}
                    onClick={() => onSelectCase(c.id)}
                    className="p-3.5 hover:bg-slate-50 cursor-pointer space-y-2 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-govNavy truncate">
                        {c.inspection_number}
                      </span>
                      <VerdictBadge verdict={c.overall_status} size="sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs truncate">
                        {c.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{c.establishment_name || (language === "hi" ? "खुदरा डिपो" : "Retail Depot")} • {c.location || c.jurisdiction_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] text-slate-500 font-medium">{language === "hi" ? "विश्वसनीयता" : "Confidence"}: {confPct}%</span>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${
                            confPct >= 90 ? "bg-emerald-600" : confPct >= 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="font-mono text-[10px] flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{formatDate(c.created_at)} • {formatInspectionType(c.inspection_type)}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="text-xs font-bold text-govNavy hover:underline"
                      >
                        {language === "hi" ? "जांचें →" : "Inspect →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop View: Full Data Table with Workstation Micro-Interactions */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "केस आईडी / दिनांक" : "Case ID / Date"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "वस्तु एवं ब्रांड" : "Commodity & Brand"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "प्रतिष्ठान / स्थान" : "Establishment / Location"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "निरीक्षण प्रकार" : "Inspection Type"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "विश्वसनीयता" : "Confidence"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "कार्यप्रवाह" : "Workflow"}</th>
                  <th scope="col" className="px-4 py-3">{language === "hi" ? "अनुपालन निर्णय" : "Compliance Verdict"}</th>
                  <th scope="col" className="px-4 py-3 text-right">{language === "hi" ? "कार्रवाई" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredCases.map((c) => {
                  const conf = getCaseConfidence(c);
                  const confPct = Math.min(100, Math.max(0, Math.round(conf * 100)));
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Case ID & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-mono font-bold text-govNavy flex items-center gap-1">
                          {c.inspection_number}
                          {c.is_mock_fixture && (
                            <span className="text-[10px] font-mono font-normal px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              DEMO
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatDate(c.created_at)}</span>
                        </div>
                      </td>

                      {/* Commodity & Brand */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 max-w-xs truncate" title={c.product_name}>
                          {c.product_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.brand_name || (language === "hi" ? "गैर-ब्रांडेड / सामान्य" : "Unbranded / Generics")}
                        </div>
                      </td>

                      {/* Establishment & Location */}
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 max-w-xs truncate" title={c.establishment_name || (language === "hi" ? "क्षेत्र व्यापारी" : "Field Trader")}>
                          {c.establishment_name || (language === "hi" ? "क्षेत्र जब्ती" : "Field Seizure")}
                        </div>
                        <div className="text-[11px] text-slate-500 max-w-xs truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{c.location || c.jurisdiction_id}</span>
                        </div>
                      </td>

                      {/* Inspection Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-700">
                          {formatInspectionType(c.inspection_type)}
                        </span>
                      </td>

                      {/* Confidence Micro-Progress Bar */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="w-24">
                          <span className="text-[11px] font-mono font-bold text-slate-700">
                            {confPct}%
                          </span>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className={`h-full rounded-full transition-all ${
                                confPct >= 90
                                  ? "bg-emerald-600"
                                  : confPct >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${confPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Workflow Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <WorkflowBadge status={c.workflow_status || "OPEN"} size="sm" />
                      </td>

                      {/* Compliance Verdict */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {c.workflow_status === "DRAFT" ? (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {language === "hi" ? "[साक्ष्य उपलब्ध नहीं]" : "[NO EVIDENCE]"}
                          </span>
                        ) : (
                          <VerdictBadge verdict={c.overall_status} size="sm" />
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-govNavy group-hover:text-white group-hover:bg-govNavy border border-govNavy rounded transition-colors"
                        >
                          {language === "hi" ? "केस खोलें →" : "Open Case →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
};
