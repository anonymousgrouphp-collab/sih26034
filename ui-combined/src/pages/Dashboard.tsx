import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { StatutorySurveillanceTicker } from "../components/common/StatutorySurveillanceTicker";
import { StatutoryOmnibox } from "../components/common/StatutoryOmnibox";
import { motion } from "framer-motion";

export const Dashboard: React.FC = () => {
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await ApiService.listInspections();
        setCases(res.items);
      } catch (err) {
        console.error("Failed to load dashboard cases:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  const [tableFilter, setTableFilter] = useState<"ALL" | "PASS" | "FAIL" | "REVIEW">("ALL");

  const metrics = useMemo(() => {
    const total = cases.length;
    const passed = cases.filter((c) => c.overall_status === "PASS").length;
    const failed = cases.filter((c) => c.overall_status === "FAIL").length;
    const review = cases.filter((c) => c.overall_status === "REVIEW").length;
    const unable = cases.filter((c) => c.overall_status === "UNABLE_TO_VERIFY").length;
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
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
        {/* National Portal Tricolor Ribbon */}
        <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

        <div className="p-5 sm:p-6 space-y-4">
          {/* Top Row: Authority & Badges */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div className="flex items-start gap-4">
              {/* Department of Consumer Affairs Legal Metrology Crest */}
              <div className="p-3 bg-amber-50/80 border-2 border-amber-300 rounded-2xl shadow-xs shrink-0 flex items-center justify-center">
                <Scale size={32} className="text-amber-700" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 leading-none">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-700">
                    {language === "hi"
                      ? "भारत सरकार • उपभोक्ता मामले विभाग"
                      : "Government of India • Department of Consumer Affairs"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-bold text-govNavy font-mono">
                    {t("govt.division", "Legal Metrology Division")}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    {language === "hi" ? "विधिक कार्यस्थान" : "DoCA Workstation"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 leading-tight">
                  {t("dash.welcome", "Executive Inspection Control Centre")}
                </h1>

                {/* Official Underline Accent */}
                <div className="flex items-center gap-0.5 mt-1.5 w-28">
                  <div className="h-1 flex-1 bg-[#FF9933] rounded-full" />
                  <div className="h-1 w-1 bg-slate-300 rounded-full" />
                  <div className="h-1 w-6 bg-[#138808] rounded-full" />
                </div>
              </div>
            </div>

            {/* Officer Action Launchpad Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <Link to="/inspections/new" className="btn-primary shadow-md">
                <Plus size={16} />
                <span>{t("action.new_case", "New Inspection Case")}</span>
              </Link>
              <Link to="/inspections" className="btn-secondary">
                <Search size={16} />
                <span>{t("action.full_register", "Full Register")}</span>
              </Link>
            </div>
          </div>

          {/* Bottom Row: Officer Telemetry, Jurisdiction, Live Time & Operational Modes */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
            {/* Officer Persona */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-govNavy text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                LMO
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {t("dash.active_inspector", "Active Inspector")}
                </p>
                <p className="font-extrabold text-govNavy truncate">
                  {user?.name || (language === "hi" ? "निरीक्षक कुणाल राज" : "Inspector Kunal Raj")} (LMO-DL-048)
                </p>
              </div>
            </div>

            {/* Jurisdiction Circle */}
            <div className="flex items-center gap-2.5 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
              <Scale size={18} className="text-amber-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {t("dash.jurisdiction_circle", "Jurisdiction Circle")}
                </p>
                <p className="font-bold text-slate-800 truncate font-mono text-[11px]">
                  DL-SOUTH-01 • {language === "hi" ? "दक्षिण दिल्ली मंडल" : "South Delhi Circle"}
                </p>
              </div>
            </div>

            {/* Live IST Clock */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-200 pt-2 xl:pt-0 xl:pl-3">
              <Clock size={18} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {t("dash.ist_time", "Live Indian Standard Time")}
                </p>
                <p className="font-mono font-extrabold text-slate-800 tabular-nums">
                  {currentDateTime || "11 Sep 2026 IST"}
                </p>
              </div>
            </div>

            {/* Operational Modes Telemetry */}
            <div className="flex items-center gap-2.5 border-t xl:border-t-0 xl:border-l border-slate-200 pt-2 xl:pt-0 xl:pl-3">
              <Radio size={18} className="text-blue-600 shrink-0 animate-pulse" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider truncate">
                  {t("dash.system_telemetry", "System Telemetry")}
                </p>
                <p className="font-bold text-slate-800 truncate text-[11px]">
                  Mode A <span className="text-emerald-700 font-extrabold">{t("dash.mode_a_online", "Online")}</span> • Mode B <span className="text-amber-700 font-extrabold">{t("dash.mode_b_resilient", "Resilient")}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Integrated National Statutory Omnibox Console (india.gov.in Pattern) */}
          <div className="pt-2 border-t border-slate-200/80">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Search size={14} className="text-[#D32F2F]" />
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

      {/* National Statutory Surveillance Directives Ticker (Inspired by india.gov.in) */}
      <StatutorySurveillanceTicker />

      {/* Quick Statutory Action Launchpad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/inspections/new"
          className="group p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-govNavy transition-colors">
              <Camera size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-govNavy transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-govNavy group-hover:text-amber-600 transition-colors">
            {t("dash.quick_scan", "Physical Label Scan")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_scan_desc", "ArUco fiducial & Table-I metric scale")}
          </p>
        </Link>

        <Link
          to="/inspections/new?mode=ecommerce"
          className="group p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-govNavy transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-govNavy group-hover:text-blue-600 transition-colors">
            {t("dash.quick_ecom", "E-Commerce Listing Audit")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_ecom_desc", "Rule 6(10) statutory exemption check")}
          </p>
        </Link>

        <Link
          to="/inspections"
          className="group p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-govNavy transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-govNavy group-hover:text-emerald-600 transition-colors">
            {t("dash.quick_notice", "Issue Form-1 Notice")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_notice_desc", "Sec 63 BSA signed compounding notice")}
          </p>
        </Link>

        <Link
          to="/rules"
          className="group p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-400 transition-all text-left"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Scale size={18} />
            </div>
            <ArrowRight size={14} className="text-slate-400 group-hover:text-govNavy transition-transform group-hover:translate-x-0.5" />
          </div>
          <h4 className="text-xs font-bold text-govNavy group-hover:text-purple-600 transition-colors">
            {t("dash.quick_offline", "Offline Cache & Sync")}
          </h4>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {t("dash.quick_offline_desc", "SQLite resilient local pipeline (Mode B)")}
          </p>
        </Link>
      </div>

      {/* 4 Stat KPI Cards with motion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KPICard
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
      </motion.div>

      {/* Main Grid: Recent Inspections Table + Human-in-the-Loop Triage */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: Recent Inspections Activity Table with Interactive Triage Filters */}
        <div className="lg:col-span-8 card overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-4 sm:px-5 py-3.5 bg-slate-50/50 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="section-title">
                  {language === "hi" ? "हाल के निरीक्षण मामले" : "Recent Inspection Cases"}
                </p>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-govNavy/10 text-govNavy">
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
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shrink-0 self-start sm:self-auto shadow-2xs">
              {[
                {
                  id: "ALL" as const,
                  label: language === "hi" ? "सभी" : "All",
                  count: cases.length,
                  activeClass: "bg-govNavy text-white shadow-2xs",
                  inactiveClass: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                },
                {
                  id: "PASS" as const,
                  label: language === "hi" ? "उत्तीर्ण" : "Pass",
                  count: metrics.passed,
                  activeClass: "bg-emerald-700 text-white shadow-2xs",
                  inactiveClass: "text-emerald-700 hover:bg-emerald-50",
                },
                {
                  id: "FAIL" as const,
                  label: language === "hi" ? "उल्लंघन" : "Fail",
                  count: metrics.failed,
                  activeClass: "bg-rose-700 text-white shadow-2xs",
                  inactiveClass: "text-rose-700 hover:bg-rose-50",
                },
                {
                  id: "REVIEW" as const,
                  label: language === "hi" ? "समीक्षा" : "Review",
                  count: metrics.pendingTotal,
                  activeClass: "bg-amber-600 text-white shadow-2xs",
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
                          ? "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="w-full overflow-hidden">
            {/* Desktop / Tablet Table View (sm+) */}
            <div className="hidden sm:block">
              <table className="w-full table-fixed divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="w-[46%] px-4 py-3 text-left">
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
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                        {language === "hi" ? "निरीक्षण रिकॉर्ड लोड हो रहे हैं..." : "Loading inspection records..."}
                      </td>
                    </tr>
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
                          className="group hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 min-w-0">
                            <div className="font-bold text-govNavy text-xs sm:text-sm truncate" title={c.product_name}>
                              {c.product_name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5 min-w-0 flex-wrap">
                              <span className="shrink-0">{c.inspection_number}</span>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[120px] text-slate-600">{c.establishment_name || c.brand_name || (language === "hi" ? "सामान्य खुदरा" : "General Retail")}</span>
                              <span className="text-slate-300">•</span>
                              <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-100 text-slate-700 border border-slate-200/60 shrink-0">
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
                                className={`font-mono text-xs font-bold ${
                                  confPct >= 90
                                    ? "text-emerald-700"
                                    : confPct >= 70
                                    ? "text-amber-700"
                                    : "text-rose-700"
                                }`}
                              >
                                {confPct}%
                              </span>
                              <div className="hidden lg:block w-8 sm:w-10 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
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
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-govNavy group-hover:text-amber-600 transition-colors">
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
                <div className="p-6 text-center text-slate-400 text-xs">
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
                      className="p-3.5 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-govNavy text-xs truncate min-w-0 flex-1" title={c.product_name}>
                          {c.product_name}
                        </div>
                        <VerdictBadge verdict={c.overall_status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-0.5">
                        <div className="flex items-center gap-1.5 truncate min-w-0">
                          <span className="shrink-0">{c.inspection_number}</span>
                          <span className="text-slate-300">•</span>
                          <span className="inline-block px-1.5 py-0.2 text-[9.5px] font-sans font-medium rounded bg-slate-100 text-slate-700 shrink-0">
                            {formatCategory(c.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-govNavy font-bold text-[11px]">
                          <span className="font-mono text-slate-600">{confPct}%</span>
                          <ArrowRight size={12} className="text-govNavy" />
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
          <div className="card p-5 border-amber-300 bg-amber-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <Users size={18} className="text-amber-700" />
                <span>{t("dash.triage_needed", "Officer Triage Needed")}</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-mono font-black rounded-full bg-amber-200 text-amber-900">
                {metrics.pendingTotal} {t("dash.cases_count", "Cases")}
              </span>
            </div>

            <p className="text-xs text-amber-900/80 leading-relaxed">
              {t(
                "dash.triage_desc",
                "Automated rules have identified borderline measurements within sensor uncertainty limits or degraded photographs requiring human officer adjudication."
              )}
            </p>

            <Link
              to="/review-queue"
              className="w-full btn-primary bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2 text-xs py-2 shadow-xs"
            >
              <span>{t("dash.open_review_queue", "Open Review Queue")}</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Golden SKU Quick Demonstration Shortcuts */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              <p className="section-title">{t("dash.golden_skus", "Pre-loaded Golden SKUs")}</p>
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
                  id: "INS-2026-0001",
                  name: language === "hi" ? "आशीर्वाद आटा 500g" : "Aashirvaad Atta 500g",
                  tag: language === "hi" ? "उत्तीर्ण — 4.2mm फॉन्ट, ₹32.00 MRP, SI मात्रक" : "PASS — 4.2mm Font, ₹32.00 MRP, SI units",
                  badge: "PASS",
                },
                {
                  id: "INS-2026-0002",
                  name: language === "hi" ? "फ़िज़अप लेमन 1L" : "FizzUp Lemon Drink 1L",
                  tag: language === "hi" ? "समीक्षा — नियम 18(1) दोहरा मूल्य विवाद (₹48 vs ₹45)" : "REVIEW — Rule 18(1) Dual Price Conflict (₹48 vs ₹45)",
                  badge: "REVIEW",
                },
                {
                  id: "INS-2026-0003",
                  name: language === "hi" ? "क्लीनहोम फ्लोर क्लीनर 250g" : "CleanHome Floor Cleaner 250g",
                  tag: language === "hi" ? "असमर्थ — अरुको अंशांकन अनुपस्थित" : "UNABLE — Uncalibrated Sensor (ArUco Missing)",
                  badge: "UNABLE_TO_VERIFY",
                },
                {
                  id: "demo-fortune-sunlite",
                  name: language === "hi" ? "फॉर्च्यून सनलाइट ऑयल 1L" : "Fortune Sunlite Oil 1L",
                  tag: language === "hi" ? "अनुत्तीर्ण — प्रतिबंधित इकाई (1000 ML)" : "FAIL — Prohibited Unit (1000 ML)",
                  badge: "FAIL",
                },
                {
                  id: "demo-tata-salt",
                  name: language === "hi" ? "टाटा नमक 1kg" : "Tata Salt 1kg",
                  tag: language === "hi" ? "उत्तीर्ण — 100% विधिक अनुपालक" : "PASS — 100% Compliant",
                  badge: "PASS",
                },
                {
                  id: "demo-dettol-handwash",
                  name: language === "hi" ? "डेटॉल लिक्विड हैंडवॉश" : "Dettol Liquid Handwash",
                  tag: language === "hi" ? "समीक्षा — सीमावर्ती अंक ऊंचाई" : "REVIEW — Borderline Font",
                  badge: "REVIEW",
                },
              ].map((sku) => (
                <button
                  key={sku.id}
                  type="button"
                  onClick={() => navigate(`/inspections/${sku.id}`)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-left transition-colors text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-govNavy truncate">{sku.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{sku.tag}</p>
                  </div>
                  <VerdictBadge verdict={sku.badge as any} size="sm" />
                </button>
              ))}
            </div>
          </div>

          {/* Section 63 BSA 2023 Digital Evidence Guarantee */}
          <div className="card p-4 bg-slate-50 border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span>{t("dash.sec63_title", "Section 63 BSA 2023 Evidentiary Invariant")}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
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
