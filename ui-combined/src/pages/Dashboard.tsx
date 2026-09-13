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
    const passed = cases.filter((c) => c.overall_status === "PASS").length;
    const failed = cases.filter((c) => c.overall_status === "FAIL" || (c.violations_count !== undefined && c.violations_count > 0)).length;
    const review = cases.filter((c) => c.overall_status === "REVIEW").length;
    const unable = cases.filter((c) => c.overall_status === "UNABLE_TO_VERIFY" || c.overall_status === "PENDING_REVIEW" || c.workflow_status === "PENDING_REVIEW").length;
    const pendingTotal = review + unable;

    const complianceRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, review, unable, pendingTotal, complianceRate };
  }, [cases]);

  const filteredCases = useMemo(() => {
    if (tableFilter === "ALL") return cases;
    if (tableFilter === "PASS") return cases.filter((c) => c.overall_status === "PASS");
    if (tableFilter === "FAIL") return cases.filter((c) => c.overall_status === "FAIL");
    if (tableFilter === "REVIEW")
      return cases.filter((c) => c.overall_status === "REVIEW" || c.overall_status === "UNABLE_TO_VERIFY");
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

  const getCaseConfidence = (c: InspectionSummary): number => {
    if (typeof c.overall_confidence === "number") {
      return c.overall_confidence > 1 ? c.overall_confidence / 100 : c.overall_confidence;
    }
    if (c.overall_status === "PASS") return 0.98;
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
      <div className="glass-panel rounded-2xl border border-slate-700/90 shadow-2xl overflow-hidden">
        {/* National Portal Tricolor Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

        <div className="p-5 sm:p-6 space-y-4">
          {/* Top Row: Authority & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div className="flex items-start gap-4">
              {/* Sovereign State Emblem of India (Unboxed & Majestic) */}
              <div className="shrink-0 flex items-center justify-center pt-0.5">
                <StateEmblem size={44} tone="white" showMotto={true} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 leading-none">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                    {language === "hi"
                      ? "भारत सरकार • उपभोक्ता मामले विभाग"
                      : "Government of India • Department of Consumer Affairs"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] font-bold text-white font-mono">
                    {t("govt.division", "Legal Metrology Division")}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-800">
                    {language === "hi" ? "विधिक कार्यस्थान" : "DoCA Workstation"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5 leading-tight">
                  {t("dash.welcome", "Executive Inspection Control Centre")}
                </h1>

                {/* Official Underline Accent */}
                <div className="flex items-center gap-0.5 mt-1.5 w-28">
                  <div className="h-1 flex-1 bg-[#FF9933] rounded-full" />
                  <div className="h-1 w-1 bg-white rounded-full" />
                  <div className="h-1 w-6 bg-[#138808] rounded-full" />
                </div>
              </div>
            </div>

            {/* Officer Action Launchpad Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/inspections/new" className="btn-primary shadow-[0_0_15px_rgba(15,23,42,0.5)]">
                <Plus size={16} />
                <span>{t("action.new_case", "New Inspection Case")}</span>
              </Link>
              <Link to="/inspections" className="btn-secondary bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700">
                <Search size={16} />
                <span>{t("action.full_register", "Full Register")}</span>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Officer Telemetry, Jurisdiction, Live Time & Operational Modes */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/70">
            {/* Officer Persona */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                LMO
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                  {t("dash.active_inspector", "Active Inspector")}
                </p>
                <p
                  className="font-extrabold text-cyan-400 truncate"
                  title={`${user?.name || (language === "hi" ? "निरीक्षक कुणाल राज" : "Inspector Kunal Raj")} (LMO-DL-048)`}
                >
                  {user?.name || (language === "hi" ? "निरीक्षक कुणाल राज" : "Inspector Kunal Raj")} (LMO-DL-048)
                </p>
              </div>
            </div>

            {/* Jurisdiction Circle */}
            <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-700/60 pt-2 sm:pt-0 sm:pl-3">
              <Scale size={18} className="text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                  {t("dash.jurisdiction_circle", "Jurisdiction Circle")}
                </p>
                <p
                  className="font-bold text-white truncate font-mono text-[11px]"
                  title={language === "hi" ? currentCircle.labelHi : currentCircle.label}
                >
                  {language === "hi" ? currentCircle.labelHi : currentCircle.label}
                </p>
              </div>
            </div>

            {/* Live IST Clock */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-700/60 pt-2 xl:pt-0 xl:pl-3">
              <Clock size={18} className="text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                  {t("dash.ist_time", "Live Indian Standard Time")}
                </p>
                <p className="font-mono font-extrabold text-white tabular-nums">
                  {currentDateTime || "11 Sep 2026 IST"}
                </p>
              </div>
            </div>

            {/* Operational Modes Telemetry */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-700/60 pt-2 xl:pt-0 xl:pl-3">
              <Radio size={18} className="text-blue-400 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider truncate">
                  {t("dash.system_telemetry", "System Telemetry")}
                </p>
                <p className="font-bold text-white truncate text-[11px]">
                  Mode A <span className="text-emerald-400 font-extrabold">{t("dash.mode_a_online", "Online")}</span> • Mode B <span className="text-amber-400 font-extrabold">{t("dash.mode_b_resilient", "Resilient")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Integrated National Statutory Omnibox Console (india.gov.in Pattern) */}
          <div className="pt-2 border-t border-slate-700/60">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Search size={14} className="text-cyan-400" />
                <span>{t("dash.search_statutory", "Quick Statutory & Precedent Lookup")}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                {t("dash.search_sub", "Query statutory rules, Table-I font schedule, banned units, or inspection dossier")}
              </span>
            </div>
            <StatutoryOmnibox variant="dashboard" />
          </div>
        </div>
      </div>

      {/* National Statutory Surveillance Directives Ticker (Inspired by india.gov.in) */}
      <StatutorySurveillanceTicker />

      {/* Certified Statutory Demonstration & Evaluation Suite */}
      <StatutoryDemoShowcase />

      {/* Quick Statutory Action Launchpad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/inspections/new"
          className="group p-3.5 rounded-xl glass-panel border border-slate-700/60 shadow-[0_0_15px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 hover:border-amber-400 transition-all text-left btn-press"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-amber-900/30 text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Camera size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
            {t("dash.quick_scan", "Physical Label Scan")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {t("dash.quick_scan_desc", "ArUco fiducial & Table-I metric scale")}
          </p>
        </Link>

        <Link
          to="/inspections/new?mode=ecommerce"
          className="group p-3.5 rounded-xl glass-panel border border-slate-700/60 shadow-[0_0_15px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 hover:border-blue-400 transition-all text-left btn-press"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-blue-900/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
            {t("dash.quick_ecom", "E-Commerce Listing Audit")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {t("dash.quick_ecom_desc", "Rule 6(10) statutory exemption check")}
          </p>
        </Link>

        <Link
          to="/inspections"
          className="group p-3.5 rounded-xl glass-panel border border-slate-700/60 shadow-[0_0_15px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 hover:border-emerald-400 transition-all text-left btn-press"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-emerald-900/30 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
            {t("dash.quick_notice", "Issue Form-1 Notice")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {t("dash.quick_notice_desc", "Sec 63 BSA signed compounding notice")}
          </p>
        </Link>

        <Link
          to="/rules"
          className="group p-3.5 rounded-xl glass-panel border border-slate-700/60 shadow-[0_0_15px_rgba(15,23,42,0.5)] hover:-translate-y-0.5 hover:border-purple-400 transition-all text-left btn-press"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-purple-900/30 text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Scale size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors">
            {t("dash.quick_offline", "Offline Cache & Sync")}
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {t("dash.quick_offline_desc", "SQLite resilient local pipeline (Mode B)")}
          </p>
        </Link>
      </div>

      {/* 4 Stat KPI Cards with motion */}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KPICard
          delay={0.1}
          title={t("metric.total", "Total Inspections")}
          value={metrics.total}
          trend={language === "hi" ? "+12% इस सप्ताह" : "+12% this week"}
          trendPositive={true}
          subtext={t("metric.total_sub", "Recorded across all circles")}
          icon={<ClipboardCheck size={22} />}
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
          icon={<ShieldCheck size={22} />}
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
          icon={<AlertTriangle size={22} />}
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
          icon={<FileWarning size={22} />}
          tone="warning"
          onClick={() => navigate("/review-queue")}
        />
      </m.div>

      {/* Main Grid: Recent Inspections Table + Human-in-the-Loop Triage */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Recent Inspections Activity Table with Interactive Triage Filters */}
        <div className="lg:col-span-8 glass-panel overflow-hidden border-slate-700/60 rounded-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 px-4 sm:px-5 py-3.5 bg-slate-800/50 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="section-title text-white">
                  {language === "hi" ? "हाल के निरीक्षण मामले" : "Recent Inspection Cases"}
                </p>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-800/50">
                  {filteredCases.length} {language === "hi" ? "मामले" : "Dossiers"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === "hi"
                  ? "स्वचालित जांच अथवा अधिकारी न्यायनिर्णयन के अधीन सक्रिय पैकेजिंग डोजियर।"
                  : "Active packaging dossiers undergoing automated checks or officer adjudication."}
              </p>
            </div>

            {/* Quick Status Filter Pills with Compact Non-Wrapping Badges */}
            <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-slate-700/60 text-xs shrink-0 self-start sm:self-auto shadow-inner">
              {[
                {
                  id: "ALL" as const,
                  label: language === "hi" ? "सभी" : "All",
                  count: cases.length,
                  activeClass: "bg-cyan-600 text-white shadow-2xs",
                  inactiveClass: "text-slate-400 hover:text-white hover:bg-slate-800",
                },
                {
                  id: "PASS" as const,
                  label: language === "hi" ? "उत्तीर्ण" : "Pass",
                  count: metrics.passed,
                  activeClass: "bg-emerald-600 text-white shadow-2xs",
                  inactiveClass: "text-emerald-500 hover:bg-emerald-900/30",
                },
                {
                  id: "FAIL" as const,
                  label: language === "hi" ? "उल्लंघन" : "Fail",
                  count: metrics.failed,
                  activeClass: "bg-rose-600 text-white shadow-2xs",
                  inactiveClass: "text-rose-500 hover:bg-rose-900/30",
                },
                {
                  id: "REVIEW" as const,
                  label: language === "hi" ? "समीक्षा" : "Review",
                  count: metrics.pendingTotal,
                  activeClass: "bg-amber-600 text-white shadow-2xs",
                  inactiveClass: "text-amber-500 hover:bg-amber-900/30",
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
                          : "bg-slate-800 text-slate-400"
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
              <table className="w-full table-fixed divide-y divide-slate-700/60 text-xs border-collapse">
                <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 z-20 backdrop-blur-md">
                  <tr>
                    <th className="w-[46%] px-4 py-3 text-left sticky left-0 bg-slate-800/95 z-10 backdrop-blur-sm shadow-[1px_0_0_rgba(51,65,85,0.6)]">
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
                <tbody className="divide-y divide-slate-700/40 bg-slate-900/40 relative">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-4 sticky left-0 bg-slate-900/40 z-10 shadow-[1px_0_0_rgba(51,65,85,0.6)]">
                          <div className="h-4 bg-slate-700 rounded skeleton w-2/3 mb-2"></div>
                          <div className="h-3 bg-slate-700 rounded skeleton w-1/2"></div>
                        </td>
                        <td className="px-3 py-4"><div className="h-6 bg-slate-700 rounded-full skeleton w-16"></div></td>
                        <td className="px-3 py-4"><div className="h-4 bg-slate-700 rounded skeleton w-12"></div></td>
                        <td className="px-4 py-4 text-right"><div className="h-4 bg-slate-700 rounded skeleton w-12 ml-auto"></div></td>
                      </tr>
                    ))
                  ) : filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 font-mono text-xs">
                        {t("table.empty", "No inspection cases match the selected filter.")}
                      </td>
                    </tr>
                  ) : (
                    filteredCases.slice(0, 6).map((c) => {
                      const conf = getCaseConfidence(c);
                      const confPct = Math.round(conf * 100);
                      return (
                        <tr
                          key={c.id}
                          onClick={() => navigate(`/inspections/${c.id}`)}
                          className="group hover:bg-slate-800/80 cursor-pointer transition-all duration-200 row-expand-enter-active"
                        >
                          <td className="px-4 py-3 min-w-0 sticky left-0 bg-slate-900/40 group-hover:bg-slate-800/90 z-10 transition-colors shadow-[1px_0_0_rgba(51,65,85,0.6)]">
                            <div className="font-bold text-white text-xs sm:text-sm truncate transition-colors group-hover:text-cyan-400" title={c.product_name}>
                              {c.product_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5 min-w-0 flex-wrap">
                              <span className="shrink-0 text-amber-500/80">{c.inspection_number}</span>
                              <span className="text-slate-600">•</span>
                              <span className="truncate max-w-[120px] text-slate-300">{c.establishment_name || c.brand_name || (language === "hi" ? "सामान्य खुदरा" : "General Retail")}</span>
                              <span className="text-slate-600">•</span>
                              <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
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
                                    ? "text-emerald-400"
                                    : confPct >= 70
                                    ? "text-amber-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {confPct}%
                              </span>
                              <div className="hidden lg:block w-8 sm:w-10 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    confPct >= 90
                                      ? "bg-emerald-500"
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
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 duration-200">
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
            <div className="sm:hidden divide-y divide-slate-700/40 bg-slate-900/40">
              {isLoading ? (
                <div className="p-6 text-center text-slate-500 text-xs">
                  {language === "hi" ? "निरीक्षण रिकॉर्ड लोड हो रहे हैं..." : "Loading inspection records..."}
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="p-6 text-center text-slate-500 font-mono text-xs">
                  {t("table.empty", "No inspection cases match the selected filter.")}
                </div>
              ) : (
                filteredCases.slice(0, 6).map((c) => {
                  const conf = getCaseConfidence(c);
                  const confPct = Math.round(conf * 100);
                  return (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/inspections/${c.id}`)}
                      className="p-3.5 hover:bg-slate-800/60 active:bg-slate-800 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-white text-xs truncate min-w-0 flex-1" title={c.product_name}>
                          {c.product_name}
                        </div>
                        <VerdictBadge verdict={c.overall_status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-0.5">
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <span className="shrink-0 text-amber-500/80">{c.inspection_number}</span>
                          <span className="text-slate-600">•</span>
                          <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                            {formatCategory(c.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-cyan-400 font-bold text-[11px]">
                          <span className="font-mono text-slate-400">{confPct}%</span>
                          <ArrowRight size={12} className="text-cyan-400" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Human-in-the-Loop Triage & Golden SKU Quick Demos */}
        <div className="lg:col-span-4 space-y-4">
          {/* Review Queue Triage Callout */}
          <div className="glass-panel p-5 border border-amber-500/30 bg-amber-900/10 space-y-3 rounded-xl shadow-[0_0_15px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <Users size={18} className="text-amber-500" />
                <span>{t("dash.triage_needed", "Officer Triage Needed")}</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-black rounded-full bg-amber-500/20 text-amber-400">
                {metrics.pendingTotal} {t("dash.cases_count", "Cases")}
              </span>
            </div>

            <p className="text-xs text-amber-200/80 leading-relaxed">
              {t(
                "dash.triage_desc",
                "Automated rules have identified borderline measurements within sensor uncertainty limits or degraded photographs requiring human officer adjudication."
              )}
            </p>

            <Link
              to="/review-queue"
              className="w-full btn-primary bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 text-xs py-2 shadow-[0_0_10px_rgba(217,119,6,0.3)] btn-press"
            >
              <span>{t("dash.open_review_queue", "Open Review Queue")}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Golden SKU Quick Demonstration Shortcuts */}
          <div className="glass-panel p-5 space-y-3 rounded-xl border border-slate-700/60 shadow-[0_0_15px_rgba(15,23,42,0.5)]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <p className="section-title text-white">{t("dash.golden_skus", "Pre-loaded Golden SKUs")}</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
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
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-700/60 bg-slate-800/50 hover:bg-slate-700/50 hover:border-cyan-500/40 text-left transition-colors text-xs group btn-press"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-800/30">
                        DEMO
                      </span>
                      <p className="font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {sku.name}
                      </p>
                    </div>
                    <p className="text-[10.5px] text-slate-400 mt-0.5 truncate">{sku.tag}</p>
                  </div>
                  <VerdictBadge verdict={sku.badge as any} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Section 63 BSA 2023 Digital Evidence Guarantee */}
          <div className="glass-panel p-4 bg-emerald-900/10 border-emerald-900/30 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>{t("dash.sec63_title", "Section 63 BSA 2023 Evidentiary Invariant")}</span>
            </div>
            <p className="text-[11px] text-emerald-200/70 leading-relaxed">
              {t(
                "dash.sec63_desc",
                "Electronic evidence certificates adhere strictly to Bharatiya Sakshya Adhiniyam, 2023. Repealed Section 65B Indian Evidence Act 1872 references are strictly forbidden."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
