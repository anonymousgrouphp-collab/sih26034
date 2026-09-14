import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ApiService } from "../services/api";
import { InspectionSummary } from "../types/inspection";
import { KPICard } from "../components/common/KPICard";
import { VerdictBadge, WorkflowBadge } from "../components/common/StatusBadge";
import {
  ClipboardCheck,
  ShieldCheck,
  AlertTriangle,
  FileWarning,
  Plus,
  ArrowRight,
  Sparkles,
  Search,
  ExternalLink,
  Users,
  Scale,
  Camera,
  Calendar,
  Clock,
  Radio,
  FileText,
  CheckCircle2,
  Sliders,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCircle } from "../context/CircleContext";
import { StatutorySurveillanceTicker } from "../components/common/StatutorySurveillanceTicker";
import { StatutoryOmnibox } from "../components/common/StatutoryOmnibox";
import { StateEmblem } from "../components/common/StateEmblem";
import { StatutoryDemoShowcase } from "../features/demo/StatutoryDemoShowcase";
import { m } from "framer-motion";

export const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { activeCircle, currentCircle } = useCircle();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await ApiService.listInspections({ circleId: activeCircle });
        setCases(res.items);
      } catch (err) {
        console.error("Failed to load dashboard cases:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, [activeCircle]);

  const [tableFilter, setTableFilter] = useState<"ALL" | "PASS" | "FAIL" | "REVIEW">("ALL");

  const metrics = useMemo(() => {
    const total = cases.length;
    const passed = cases.filter(
      (c) => c.overall_status === "PASS" || (c.overall_status === "COMPLETED" && c.ai_verdict !== "FAIL")
    ).length;
    const failed = cases.filter(
      (c) => c.overall_status === "FAIL" || (c.violations_count !== undefined && c.violations_count > 0)
    ).length;
    const pendingReview = cases.filter(
      (c) =>
        c.overall_status === "REVIEW" ||
        c.overall_status === "UNABLE_TO_VERIFY" ||
        c.overall_status === "PENDING_REVIEW" ||
        c.overall_status === "PENDING"
    ).length;

    // Remaining edge cases if any
    const accounted = passed + failed + pendingReview;
    const pendingTotal = accounted < total ? pendingReview + (total - accounted) : pendingReview;

    const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, review: pendingReview, unable: 0, pendingTotal, complianceRate };
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (tableFilter === "ALL") return cases;
    if (tableFilter === "PASS") {
      return cases.filter(
        (c) => c.overall_status === "PASS" || (c.overall_status === "COMPLETED" && c.ai_verdict !== "FAIL")
      );
    }
    if (tableFilter === "FAIL") {
      return cases.filter(
        (c) => c.overall_status === "FAIL" || (c.violations_count !== undefined && c.violations_count > 0)
      );
    }
    if (tableFilter === "REVIEW") {
      return cases.filter(
        (c) =>
          c.overall_status === "REVIEW" ||
          c.overall_status === "UNABLE_TO_VERIFY" ||
          c.overall_status === "PENDING_REVIEW" ||
          c.overall_status === "PENDING"
      );
    }
    return cases;
  }, [cases, tableFilter]);

  const formatCategory = (cat?: string): string => {
    if (!cat) return language === "hi" ? "पैकेज्ड वस्तु" : "Packaged Commodity";
    if (language === "hi") {
      const lower = cat.toLowerCase();
      if (lower.includes("snack") || lower.includes("food")) return "खाद्य एवं स्नैक्स";
      if (lower.includes("oil")) return "खाद्य तेल / घी";
      if (lower.includes("beverage") || lower.includes("water") || lower.includes("drink")) return "पेय पदार्थ";
      if (lower.includes("cosmetic") || lower.includes("personal")) return "सौंदर्य प्रसाधन";
      if (lower.includes("electronic")) return "इलेक्ट्रॉनिक वस्तु";
      if (lower.includes("clean") || lower.includes("detergent") || lower.includes("chemical")) return "स्वच्छता उत्पाद";
      if (lower.includes("grain") || lower.includes("staple") || lower.includes("atta") || lower.includes("salt")) return "अनाज एवं आवश्यक सामग्री";
      return "पैकेज्ड वस्तु";
    }
    return cat
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const getFormattedProductName = (c: InspectionSummary): string => {
    if (
      !c.product_name ||
      c.product_name === "Unlabeled Sample" ||
      c.product_name.toLowerCase().includes("unlabeled")
    ) {
      const est = c.establishment_name ? `${c.establishment_name} - ` : "";
      const cat = c.category ? formatCategory(c.category) : (language === "hi" ? "पैकेज्ड वस्तु" : "Packaged Commodity");
      return language === "hi"
        ? `${est}${cat} (भौतिक संज्ञान)`
        : `${est}${cat} (Physical Intake)`;
    }
    return c.product_name;
  };

  const getCaseConfidence = (c: InspectionSummary): number => {
    if (typeof c.overall_confidence === "number") {
      return c.overall_confidence > 1 ? c.overall_confidence / 100 : c.overall_confidence;
    }
    if (c.overall_status === "PASS" || (c.overall_status === "COMPLETED" && c.ai_verdict !== "FAIL")) return 0.98;
    if (c.overall_status === "FAIL") return 0.95;
    if (c.overall_status === "REVIEW") return 0.74;
    if (c.overall_status === "UNABLE_TO_VERIFY") return 0.42;
    return 0.88;
  };

  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  // Hash deep-links (e.g. /dashboard#demo-showcase from the header demo menu):
  // native anchor scrolling fires before async content renders, so re-scroll
  // once loading settles.
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    return () => clearTimeout(timer);
  }, [location.hash, isLoading]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      const formatted = new Intl.DateTimeFormat("en-IN", options).format(now);
      setCurrentDateTime(`${formatted} IST`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Executive Inspection Control Centre Command Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden relative">
        {/* Subtle Sovereign Security Guilloche Background Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: "url('/assets/gov/gov_guilloche_pattern.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "400px 200px",
          }}
          aria-hidden="true"
        />

        {/* National Portal Tricolor Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] relative z-10" />

        <div className="p-5 sm:p-6 space-y-4 relative z-10">
          {/* Top Row: Authority & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4 relative">
            <div className="flex items-start gap-4">
              {/* Sovereign State Emblem of India (Unboxed & Majestic) */}
              <div className="shrink-0 flex items-center justify-center pt-0.5">
                <StateEmblem size={44} tone="navy" showMotto={true} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 leading-none">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1B365D]">
                    {language === "hi"
                      ? "भारत सरकार • उपभोक्ता मामले विभाग"
                      : "Government of India • Department of Consumer Affairs"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-bold text-slate-700 font-mono">
                    {t("govt.division", "Legal Metrology Division")}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {language === "hi" ? "विधिक कार्यस्थान" : "DoCA Workstation"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 leading-tight">
                  {t("dash.welcome", "Executive Inspection Control Centre")}
                </h1>

                {/* Official Sovereign National Tricolor Underline Accent */}
                <div className="flex items-center gap-1.5 mt-2 w-48 sm:w-64" aria-hidden="true">
                  <div className="h-1 flex-1 bg-[#FF9933] rounded-full shadow-2xs" />
                  <div className="h-1 flex-1 bg-slate-200/90 rounded-full border border-slate-300/80" />
                  <div className="h-1 flex-1 bg-[#138808] rounded-full shadow-2xs" />
                </div>
              </div>
            </div>

            {/* Officer Action Launchpad Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/inspections/new" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#1B365D] hover:bg-[#0A2540] text-white shadow-sm transition-colors">
                <Plus size={16} />
                <span>{t("action.new_case", "New Inspection Case")}</span>
              </Link>
              <Link to="/inspections" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors">
                <Search size={16} />
                <span>{t("action.full_register", "Full Register")}</span>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Official Statutory Authority & Operational Mandate */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            {/* Statutory Act Mandate */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1B365D] text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                <Scale size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {language === "hi" ? "सांविधिक प्राधिकार" : "Statutory Authority"}
                </p>
                <p className="font-extrabold text-[#1B365D] truncate text-[11.5px]" title="The Legal Metrology Act, 2009 (Act No. 1 of 2010)">
                  {language === "hi" ? "विधिक मापविज्ञान अधिनियम, 2009" : "Legal Metrology Act, 2009"}
                </p>
              </div>
            </div>

            {/* Regulatory Rules & Schedules */}
            <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {language === "hi" ? "विनियामक नियम" : "Regulatory Enactment"}
                </p>
                <p className="font-bold text-slate-900 truncate font-mono text-[11px]" title="Legal Metrology (Packaged Commodities) Rules, 2011">
                  {language === "hi" ? "एलएमपीसी नियम, 2011 (तालिका-I)" : "LMPC Rules, 2011 (Table-I)"}
                </p>
              </div>
            </div>

            {/* Digital Evidentiary Standard */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-200 pt-2 xl:pt-0 xl:pl-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {language === "hi" ? "न्यायालय साक्ष्य प्रमाणन" : "Court Evidence Standard"}
                </p>
                <p className="font-mono font-bold text-slate-900 truncate text-[11px]" title="Section 63, Bharatiya Sakshya Adhiniyam, 2023">
                  {language === "hi" ? "धारा 63 बीएसए 2023 (हैश सील्ड)" : "Sec. 63 BSA 2023 (Hash Sealed)"}
                </p>
              </div>
            </div>

            {/* Operational Telemetry */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-200 pt-2 xl:pt-0 xl:pl-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
                <Radio size={16} className="animate-pulse" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {language === "hi" ? "प्रवर्तन कार्यप्रणाली" : "Operational Telemetry"}
                </p>
                <p className="font-bold text-slate-900 truncate text-[11px]">
                  Mode A <span className="text-emerald-700 font-extrabold">{t("dash.mode_a_online", "Online")}</span> • Mode B <span className="text-amber-800 font-extrabold">{t("dash.mode_b_resilient", "Resilient")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Integrated National Statutory Omnibox Console (india.gov.in Pattern) */}
          <div className="pt-2 border-t border-slate-100">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Search size={14} className="text-[#1B365D]" />
                <span>{t("dash.search_statutory", "Quick Statutory & Precedent Lookup")}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                {t("dash.search_sub", "Query statutory rules, Table-I font schedule, banned units, or inspection dossier")}
              </span>
            </div>
            <StatutoryOmnibox variant="dashboard" />
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards with motion - Positioned prominently below command masthead */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KPICard
          delay={0.1}
          title={t("metric.total", "Total Registered Cases")}
          value={metrics.total}
          trend={language === "hi" ? "+12% इस सप्ताह" : "+12% this week"}
          trendPositive={true}
          subtext={t("metric.total_sub", "Recorded across all circles")}
          statutoryCitation={language === "hi" ? "विधिक माप अधिनियम, 2009 की धारा 15 पंजी" : "Sec. 15 Legal Metrology Act, 2009 Register"}
          icon={<img src="/assets/gov/doca_legal_metrology_seal.svg" alt="Directorate Seal" className="w-6 h-6 object-contain" />}
          tone="normal"
          onClick={() => navigate("/inspections")}
        />
        <KPICard
          delay={0.2}
          title={t("metric.rate", "Compliance Rate")}
          value={`${metrics.complianceRate}%`}
          trend={language === "hi" ? `${metrics.passed} उत्तीर्ण` : `${metrics.passed} Pass`}
          trendPositive={metrics.complianceRate >= 70}
          subtext={t("metric.passed_sub", "Table-I & Rule 6 compliant")}
          statutoryCitation={language === "hi" ? "तालिका-I व नियम 6 के अंतर्गत पूर्ण अनुपालन" : "Table-I & Rule 6 Statutory Benchmark Passed"}
          icon={<img src="/assets/gov/lmpc_rule6_verified_badge.svg" alt="LMPC Verified" className="w-6 h-6 object-contain" />}
          tone={metrics.complianceRate >= 70 ? "success" : "warning"}
          onClick={() => navigate("/inspections?verdict=PASS")}
        />
        <KPICard
          delay={0.3}
          title={t("metric.failed", "Statutory Violations")}
          value={metrics.failed}
          trend={language === "hi" ? `${metrics.failed} कार्रवाई योग्य` : `${metrics.failed} Actionable`}
          trendPositive={false}
          subtext={t("metric.failed_sub", "Contraventions established")}
          statutoryCitation={language === "hi" ? "धारा 36(1) नोटिस योग्य विधिक उल्लंघन" : "Sec. 36(1) Compounding Notice Ready"}
          icon={<AlertTriangle size={22} className="text-rose-700" />}
          tone="danger"
          onClick={() => navigate("/inspections?verdict=FAIL")}
        />
        <KPICard
          delay={0.4}
          title={t("metric.review", "Human Review Queue")}
          value={metrics.pendingTotal}
          trend={
            language === "hi"
              ? `${metrics.review} समीक्षा | ${metrics.unable} विकृत`
              : `${metrics.review} Rev | ${metrics.unable} Degraded`
          }
          trendPositive={metrics.pendingTotal === 0}
          subtext={t("metric.review_sub", "Requires officer sign-off")}
          statutoryCitation={language === "hi" ? "नियम 24 संवेदक अनिश्चितता व मानव सत्यापन" : "Rule 24 Sensor Uncertainty & Adjudication Desk"}
          icon={<img src="/assets/gov/sovereign_balance_tula.svg" alt="Metrology Tula" className="w-6 h-6 object-contain" />}
          tone="warning"
          onClick={() => navigate("/review-queue")}
        />
      </m.div>

      {/* National Statutory Surveillance Directives Ticker (Inspired by india.gov.in) */}
      <StatutorySurveillanceTicker />

      {/* Quick Statutory Action Launchpad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/inspections/new"
          className="group p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md transition-all text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
              <Camera size={18} />
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Rule 2(h)
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1B365D] transition-colors">
            {t("dash.quick_scan", "Physical Label Scan")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_scan_desc", "ArUco fiducial & Table-I metric scale")}
          </p>
        </Link>

        <Link
          to="/inspections/new?mode=ecommerce"
          className="group p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md transition-all text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-800 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
              <FileText size={18} />
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              GSR 594(E)
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1B365D] transition-colors">
            {t("dash.quick_ecom", "E-Commerce Listing Audit")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_ecom_desc", "Rule 6(10) statutory exemption check")}
          </p>
        </Link>

        <Link
          to="/inspections"
          className="group p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md transition-all text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
              <ShieldCheck size={18} />
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              Rule 29
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1B365D] transition-colors">
            {t("dash.quick_notice", "Issue Form-1 Notice")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_notice_desc", "Sec 63 BSA signed compounding notice")}
          </p>
        </Link>

        <Link
          to="/settings"
          className="group p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md transition-all text-left relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-800 group-hover:bg-[#1B365D] group-hover:text-white transition-colors">
              <Sliders size={18} />
            </div>
            <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
              BSA § 63
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1B365D] transition-colors">
            {t("dash.quick_settings", "Station Settings")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_settings_desc", "LMPC rules, AI vision & Sec 63 vault")}
          </p>
        </Link>
      </div>

      {/* Main Grid: Recent Inspections Table + Human-in-the-Loop Triage */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Recent Inspections Activity Table with Interactive Triage Filters */}
        <div className="lg:col-span-8 bg-white overflow-hidden border border-slate-200 rounded-xl shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-4 sm:px-5 py-3.5 bg-slate-50/80 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-sm">
                  {language === "hi" ? "हाल के निरीक्षण मामले" : "Recent Inspection Cases"}
                </p>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-blue-50 text-[#1B365D] border border-blue-200">
                  {filteredCases.length} {language === "hi" ? "मामले" : "Dossiers"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === "hi"
                  ? "स्वचालित जांच अथवा अधिकारी न्यायनिर्णयन के अधीन सक्रिय पैकेजिंग डोजियर।"
                  : "Active packaging dossiers undergoing automated checks or officer adjudication."}
              </p>
            </div>

            {/* Quick Status Filter Pills with Compact Non-Wrapping Badges */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shrink-0 self-start sm:self-auto shadow-inner">
              {[
                {
                  id: "ALL" as const,
                  label: language === "hi" ? "सभी" : "All",
                  count: cases.length,
                  activeClass: "bg-[#1B365D] text-white shadow-2xs font-bold",
                  inactiveClass: "text-slate-600 hover:text-slate-900 hover:bg-white",
                },
                {
                  id: "PASS" as const,
                  label: language === "hi" ? "उत्तीर्ण" : "Pass",
                  count: metrics.passed,
                  activeClass: "bg-emerald-700 text-white shadow-2xs font-bold",
                  inactiveClass: "text-emerald-700 hover:bg-emerald-50",
                },
                {
                  id: "FAIL" as const,
                  label: language === "hi" ? "उल्लंघन" : "Fail",
                  count: metrics.failed,
                  activeClass: "bg-rose-700 text-white shadow-2xs font-bold",
                  inactiveClass: "text-rose-700 hover:bg-rose-50",
                },
                {
                  id: "REVIEW" as const,
                  label: language === "hi" ? "समीक्षा" : "Review",
                  count: metrics.pendingTotal,
                  activeClass: "bg-amber-600 text-white shadow-2xs font-bold",
                  inactiveClass: "text-amber-800 hover:bg-amber-50",
                },
              ].map((tab) => {
                const isActive = tableFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTableFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1.5 transition-colors ${
                      isActive ? tab.activeClass : tab.inactiveClass
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-semibold ${
                        isActive
                          ? "bg-black/20 text-white"
                          : "bg-white text-slate-700 border border-slate-200"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar relative max-h-[500px] lg:max-h-none lg:flex-1 lg:min-h-0">
            {/* Desktop / Tablet Table View (sm+) */}
            <div className="hidden sm:block min-w-[700px]">
              <table className="w-full table-fixed divide-y divide-slate-200 text-xs border-collapse">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 sticky top-0 z-20 backdrop-blur-md">
                  <tr>
                    <th className="w-[46%] px-4 py-3 text-left sticky left-0 bg-slate-50 z-10 shadow-[1px_0_0_rgba(226,232,240,1)]">
                      {language === "hi" ? "मामला / उत्पाद" : "Case / Product"}
                    </th>
                    <th className="w-[22%] px-3 py-3 text-left whitespace-nowrap">
                      {language === "hi" ? "विधिक निर्णय" : "Compliance Verdict"}
                    </th>
                    <th className="w-[16%] px-3 py-3 text-left whitespace-nowrap">
                      {language === "hi" ? "सटीकता" : "Confidence"}
                    </th>
                    <th className="w-[16%] px-4 py-3 text-right whitespace-nowrap">
                      {language === "hi" ? "कार्रवाई" : "Action"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white relative">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4 sticky left-0 bg-white z-10 shadow-[1px_0_0_rgba(226,232,240,1)]">
                          <div className="h-4 bg-slate-200 rounded skeleton w-2/3 mb-2"></div>
                          <div className="h-3 bg-slate-200 rounded skeleton w-1/2"></div>
                        </td>
                        <td className="px-3 py-4"><div className="h-6 bg-slate-200 rounded-full skeleton w-16"></div></td>
                        <td className="px-3 py-4"><div className="h-4 bg-slate-200 rounded skeleton w-12"></div></td>
                        <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-200 rounded skeleton w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-mono text-xs">
                        {t("table.empty", "No inspection cases match the selected filter.")}
                      </td>
                    </tr>
                  ) : (
                    filteredCases.slice(0, 10).map((c) => {
                      const conf = getCaseConfidence(c);
                      const confPct = Math.round(conf * 100);
                      return (
                        <tr
                          key={c.id}
                          onClick={() => navigate(`/inspections/${c.id}`)}
                          className="group hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                        >
                          <td className="px-4 py-3 min-w-0 sticky left-0 bg-white group-hover:bg-blue-50/60 z-10 transition-colors shadow-[1px_0_0_rgba(226,232,240,1)]">
                            <div className="font-bold text-slate-900 text-xs sm:text-sm truncate transition-colors group-hover:text-[#1B365D]" title={getFormattedProductName(c)}>
                              {getFormattedProductName(c)}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5 min-w-0 flex-wrap">
                              <span className="shrink-0 text-[#1B365D] font-bold">{c.inspection_number}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[120px] text-slate-700">{c.establishment_name || c.brand_name || (language === "hi" ? "सामान्य खुदरा" : "General Retail")}</span>
                              <span className="text-slate-300">•</span>
                              <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                                {formatCategory(c.category)}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <VerdictBadge verdict={c.overall_status} size="sm" />
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-mono text-xs font-bold tabular-nums ${
                                  confPct >= 90
                                    ? "text-emerald-700"
                                    : confPct >= 70
                                    ? "text-amber-700"
                                    : "text-rose-700"
                                }`}
                              >
                                {confPct}%
                              </span>
                              <div className="hidden lg:block w-8 sm:w-10 h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${
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
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1B365D] group-hover:underline transition-colors">
                              <span>{language === "hi" ? "निरीक्षण" : "Inspect"}</span>
                              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Touch Card List View (< sm) */}
            <div className="sm:hidden divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  {language === "hi" ? "निरीक्षण रिकॉर्ड लोड हो रहे हैं..." : "Loading inspection records..."}
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono text-xs">
                  {t("table.empty", "No inspection cases match the selected filter.")}
                </div>
              ) : (
                filteredCases.slice(0, 10).map((c) => {
                  const conf = getCaseConfidence(c);
                  const confPct = Math.round(conf * 100);
                  return (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/inspections/${c.id}`)}
                      className="p-3.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-slate-900 text-xs truncate min-w-0 flex-1" title={getFormattedProductName(c)}>
                          {getFormattedProductName(c)}
                        </div>
                        <VerdictBadge verdict={c.overall_status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <span className="shrink-0 text-[#1B365D] font-bold">{c.inspection_number}</span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {formatCategory(c.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[#1B365D] font-bold text-[11px]">
                          <span className="font-mono text-slate-600">{confPct}%</span>
                          <ArrowRight size={12} className="text-[#1B365D]" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Official GovTech Table Footer with Summary & Register Deep-Link */}
          <div className="border-t border-slate-200 px-4 sm:px-5 py-3 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <span className="text-slate-600 font-medium">
              {language === "hi"
                ? `प्रदर्शित ${Math.min(10, filteredCases.length)} / कुल ${filteredCases.length} सक्रिय प्रकरण (${currentCircle.labelHi})`
                : `Showing ${Math.min(10, filteredCases.length)} of ${filteredCases.length} active dossiers (${currentCircle.label})`}
            </span>
            <Link
              to="/inspections"
              className="inline-flex items-center gap-1.5 font-bold text-[#1B365D] hover:underline transition-colors"
            >
              <span>
                {language === "hi"
                  ? `संपूर्ण निरीक्षण रजिस्टर देखें (${cases.length})`
                  : `Access Complete Inspection Register (${cases.length})`}
              </span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Human-in-the-Loop Triage & Golden SKU Quick Demos */}
        <div className="lg:col-span-4 space-y-4">
          {/* Review Queue Triage Callout */}
          <div className="p-5 border border-amber-300 bg-amber-50/80 space-y-3 rounded-xl shadow-xs relative overflow-hidden">
            {/* Subtle Directorate Seal Background Watermark */}
            <img
              src="/assets/gov/doca_legal_metrology_seal.svg"
              alt="Seal"
              className="absolute -right-6 -bottom-6 w-32 h-32 opacity-10 pointer-events-none select-none"
              aria-hidden="true"
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <Users size={18} className="text-amber-700" />
                <span>{t("dash.triage_needed", "Officer Triage Needed")}</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-black rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                {metrics.pendingTotal} {t("dash.cases_count", "Cases")}
              </span>
            </div>

            <p className="text-xs text-amber-900/85 leading-relaxed relative z-10">
              {t(
                "dash.triage_desc",
                "Automated rules have identified borderline measurements within sensor uncertainty limits or degraded photographs requiring human officer adjudication."
              )}
            </p>

            <Link
              to="/review-queue"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 text-xs py-2 rounded-lg shadow-sm transition-colors relative z-10"
            >
              <span>{t("dash.open_review_queue", "Open Review Queue")}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Golden SKU Quick Demonstration Shortcuts */}
          <div className="bg-white p-5 space-y-3 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/assets/gov/sovereign_balance_tula.svg" alt="Tula" className="w-5 h-5 object-contain shrink-0" />
                <p className="font-bold text-slate-900 text-sm">{t("dash.golden_skus", "Pre-loaded Golden SKUs")}</p>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                LMPC 2011
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t(
                "dash.golden_skus_desc",
                "Test end-to-end statutory adjudication against pre-configured golden demonstration cases:"
              )}
            </p>

            <div className="space-y-2">
              {[
                {
                  id: "SKU-DEMO-01",
                  name: language === "hi" ? "सनफीस्ट बटर कुकीज़ 200g" : "Sunfeast Butter Cookies 200g",
                  tag: language === "hi" ? "उल्लंघन — फॉन्ट कमी (1.84mm) + 'gms' इकाई" : "FAIL — Font Deficit (1.84mm) + 'gms' unit",
                  badge: "FAIL",
                },
                {
                  id: "SKU-DEMO-02",
                  name: language === "hi" ? "रेडी करी पाउच 300g" : "Ready Curry Retort Pouch 300g",
                  tag: language === "hi" ? "उल्लंघन — यूएसपी विसंगति (₹0.28 vs ₹0.23/g)" : "FAIL — Rule 6(1)(e) USP Mismatch",
                  badge: "FAIL",
                },
                {
                  id: "SKU-DEMO-03",
                  name: language === "hi" ? "खनिज जल बोतल 1L" : "Natural Mineral Water 1L",
                  tag: language === "hi" ? "उत्तीर्ण — 100% विधिक अनुपालक (बेलनाकार)" : "PASS — 100% Compliant (Cylindrical)",
                  badge: "PASS",
                },
                {
                  id: "SKU-DEMO-04",
                  name: language === "hi" ? "हर्बल साबुन 125g" : "Herbal Bathing Soap 125g",
                  tag: language === "hi" ? "समीक्षा — सीमांत फॉन्ट (2.46mm, k=2 बैंड)" : "REVIEW — Borderline Font (k=2 band)",
                  badge: "REVIEW",
                },
                {
                  id: "SKU-DEMO-05",
                  name: language === "hi" ? "आलू चिप्स 75g" : "Crispy Potato Chips 75g",
                  tag: language === "hi" ? "असमर्थ — चकाचौंध फैलाव (6.4% > 3.0%)" : "UNABLE — Specular Glare (6.4% > 3.0%)",
                  badge: "UNABLE_TO_VERIFY",
                },
                {
                  id: "SKU-DEMO-06",
                  name: language === "hi" ? "ई-कॉमर्स ईयरबड्स" : "Wireless Earbuds (E-Commerce)",
                  tag: language === "hi" ? "उल्लंघन — नियम 6(10) मूल देश अनुपस्थित" : "FAIL — Rule 6(10) Missing Country of Origin",
                  badge: "FAIL",
                },
                {
                  id: "demo-fortune-sunlite",
                  name: language === "hi" ? "फॉर्च्यून सनलाइट तेल 1L" : "Fortune Sunlite Oil 1L",
                  tag: language === "hi" ? "उत्तीर्ण — ArUco अंशांकन एवं धारा 63 प्रमाण" : "PASS — Calibrated ArUco Benchmark",
                  badge: "PASS",
                },
              ].map((sku) => (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => navigate(`/inspections/${sku.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-[#1B365D]/40 text-left transition-colors text-xs group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-white text-[#1B365D] border border-slate-200">
                        DEMO
                      </span>
                      <p className="font-bold text-slate-900 group-hover:text-[#1B365D] transition-colors truncate">
                        {sku.name}
                      </p>
                    </div>
                    <p className="text-[10.5px] text-slate-500 mt-0.5 truncate">{sku.tag}</p>
                  </div>
                  <VerdictBadge verdict={sku.badge as any} size="sm" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <a
                href="#demo-showcase"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
              >
                <span>{language === "hi" ? "सभी 7 प्रमाणित सांविधिक परिदृश्य देखें" : "View Full 7 Certified Scenarios Showcase"}</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>

          {/* Section 63 BSA 2023 Digital Evidence Guarantee */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-300 rounded-xl shadow-xs relative overflow-hidden flex items-start gap-3">
            <img
              src="/assets/gov/sec63_bsa_cert_badge.svg"
              alt="BSA 2023 Tamper Proof Seal"
              className="w-12 h-12 shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                <span>{t("dash.sec63_title", "Section 63 BSA 2023 Evidentiary Guarantee")}</span>
              </div>
              <p className="text-[11px] text-emerald-900/90 leading-relaxed mt-1">
                {t(
                  "dash.sec63_desc",
                  "Electronic evidence certificates adhere strictly to Bharatiya Sakshya Adhiniyam, 2023. Repealed Section 65B Indian Evidence Act 1872 references are strictly forbidden."
                )}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono font-bold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>RFC 3161 NIC-TSA Timestamped • SHA-256 Validated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Certified Demonstration Suite (Statutory Golden SKUs) */}
      <div id="demo-showcase" className="pt-2">
        <StatutoryDemoShowcase />
      </div>
    </div>
  );
};

export default Dashboard;
