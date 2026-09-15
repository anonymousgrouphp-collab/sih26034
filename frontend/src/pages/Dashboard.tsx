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
    window.addEventListener("nirikshak_data_updated", fetchCases);
    return () => window.removeEventListener("nirikshak_data_updated", fetchCases);
  }, [activeCircle]);

  const [tableFilter, setTableFilter] = useState<"ALL" | "PASS" | "FAIL" | "REVIEW">("ALL");

  const metrics = useMemo(() => {
    const total = cases.length;
    
    // Calculate recent cases (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = cases.filter((c) => new Date(c.created_at).getTime() > sevenDaysAgo).length;

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

    return { total, passed, failed, review: pendingReview, unable: 0, pendingTotal, complianceRate, recent };
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
          trend={language === "hi" ? `+${metrics.recent} इस सप्ताह` : `+${metrics.recent} this week`}
          trendPositive={metrics.recent > 0}
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

      {/* Secondary Dashboard Modules: Triage & Compliance Guarantee */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Review Queue Triage Callout */}
        <div className="p-6 border border-amber-300 bg-amber-50/80 space-y-4 rounded-xl shadow-xs relative overflow-hidden flex flex-col justify-between">
          <img
            src="/assets/gov/doca_legal_metrology_seal.svg"
            alt="Seal"
            className="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 pointer-events-none select-none"
            aria-hidden="true"
          />

          <div>
            <div className="flex items-center justify-between relative z-10 mb-2">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-base">
                <Users size={20} className="text-amber-700" />
                <span>{t("dash.triage_needed", "Officer Triage Needed")}</span>
              </div>
              <span className="px-2.5 py-1 text-sm font-mono font-black rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                {metrics.pendingTotal} {t("dash.cases_count", "Cases")}
              </span>
            </div>
            <p className="text-sm text-amber-900/85 leading-relaxed relative z-10 max-w-lg">
              {t(
                "dash.triage_desc",
                "Automated rules have identified borderline measurements within sensor uncertainty limits or degraded photographs requiring human officer adjudication."
              )}
            </p>
          </div>

          <Link
            to="/review-queue"
            className="w-full sm:w-auto self-start bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center justify-center gap-2 text-sm px-6 py-2.5 rounded-lg shadow-sm transition-colors relative z-10"
          >
            <span>{t("dash.open_review_queue", "Open Review Queue")}</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Section 63 BSA 2023 Digital Evidence Guarantee */}
        <div className="p-6 bg-emerald-50/80 border border-emerald-300 rounded-xl shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start gap-4">
          <img
            src="/assets/gov/sec63_bsa_cert_badge.svg"
            alt="BSA 2023 Tamper Proof Seal"
            className="w-16 h-16 shrink-0 mt-1"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-base">
              <span>{t("dash.sec63_title", "Section 63 BSA 2023 Evidentiary Guarantee")}</span>
            </div>
            <p className="text-sm text-emerald-900/90 leading-relaxed">
              {t(
                "dash.sec63_desc",
                "Electronic evidence certificates adhere strictly to Bharatiya Sakshya Adhiniyam, 2023. Repealed Section 65B Indian Evidence Act 1872 references are strictly forbidden."
              )}
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-100/60 p-2 rounded-lg border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>RFC 3161 NIC-TSA Timestamped • SHA-256 Validated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
