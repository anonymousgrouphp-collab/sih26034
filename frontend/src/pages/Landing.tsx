import React from "react";
import { Link } from "react-router-dom";
import {
  Scale,
  ShieldCheck,
  FileSearch,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
  Workflow,
  Landmark,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { NirikshakBrandLogo } from "../components/common/NirikshakBrandLogo";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { StatutoryPipelineInfographic } from "../components/common/StatutoryPipelineInfographic";
import { useLanguage } from "../context/LanguageContext";
import { m } from "framer-motion";
import { Reveal } from "../components/common/motion";
import { SovereignMetrologyHeroBackdrop } from "../components/common/SovereignMetrologyHeroBackdrop";
import { NationalLeadershipBanner } from "../components/common/NationalLeadershipBanner";
import { StatutoryOmnibox } from "../components/common/StatutoryOmnibox";
import { StateEmblem } from "../components/common/StateEmblem";
import { resetScrollToTop } from "../components/common/ScrollToTop";

export const Landing: React.FC = () => {
  const { t, language } = useLanguage();

  const highlights = [
    {
      title:
        language === "hi"
          ? "धारा 63 बीएसए 2023 इलेक्ट्रॉनिक साक्ष्य"
          : "Section 63 BSA 2023 Electronic Evidence",
      desc:
        language === "hi"
          ? "सभी डिजिटल कैप्चर, ArUco फिड्यूशियल और OCR टोकन अदालत में स्वीकार्य प्रवर्तन के लिए बैकएंड SHA-256 मर्कल प्रमाणों के साथ क्रिप्टोग्राफिक रूप से हस्ताक्षरित हैं।"
          : "All digital captures, ArUco fiducials, and OCR tokens are cryptographically signed with backend SHA-256 Merkle proofs for court-admissible enforcement.",
      icon: FileSearch,
    },
    {
      title:
        language === "hi"
          ? "अधिकारी-सहित अधिनिर्णय (Human-in-the-Loop)"
          : "Human-in-the-Loop Adjudication",
      desc:
        language === "hi"
          ? "प्रणाली केवल स्वचालित नैदानिक सिफारिशें प्रदान करती है। योग्य विधिक मापविज्ञान अधिकारी प्रत्येक विधिक निर्णय लेते हैं और सभी आधिकारिक नोटिसों पर हस्ताक्षर करते हैं।"
          : "The system provides automated diagnostic recommendations. Qualified Legal Metrology Officers make every legal decision and sign all official notices.",
      icon: Scale,
    },
    {
      title:
        language === "hi"
          ? "क्षेत्र-तैयार एवं ऑफ़लाइन सक्षम (मोड बी)"
          : "Field-Ready & Offline Resilient (Mode B)",
      desc:
        language === "hi"
          ? "डेस्कटॉप वर्कस्टेशन और मोबाइल उपकरणों पर निर्बाध रूप से कार्य करने के लिए इंजीनियर किया गया, नेटवर्क ब्लैकआउट के दौरान स्थानीय SQLite लचीलापन सहित।"
          : "Engineered to run seamlessly on desktop workstations and mobile devices, with local SQLite resilience during network blackouts.",
      icon: Smartphone,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Official GIGW 3.0 Top Utility Bar */}
      <GovTopBar />

      {/* Official Portal Header — Sovereign Masthead */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#1B365D] text-white shadow-md">
        {/* National Tricolor Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <NirikshakBrandLogo tone="light" size="md" />

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href="https://emaap.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-colors"
            >
              <span>{language === "hi" ? "ई-माप पोर्टल" : "eMaap Portal"}</span>
              <ExternalLink size={13} />
            </a>
            <Link
              to="/login"
              onClick={resetScrollToTop}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-xs transition"
            >
              <span>{t("portal.officer_workstation", "Officer Workstation")}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section Inspired by india.gov.in */}
      <main id="main-content" className="flex-1">
        <section className="relative overflow-hidden bg-[#0A2240] text-white pt-3 pb-8 sm:pt-5 sm:pb-10 lg:pt-6 lg:pb-12 lg:min-h-[calc(100vh-5.25rem)] flex flex-col justify-between">
          {/* Subtle Sovereign Foundation Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-[#0A2240] to-[#061426] pointer-events-none" />
          
          {/* Sovereign Metrology Architectural Skyline Backdrop */}
          <SovereignMetrologyHeroBackdrop />

          {/* Central Reading Pocket Vignette (Ensures Maximum Foreground Typography Contrast) */}
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 38%, rgba(6, 18, 34, 0.78) 0%, rgba(10, 34, 64, 0.45) 55%, transparent 100%)",
            }}
          />

          <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col justify-between py-1 min-w-0">
            <div className="w-full max-w-4xl mx-auto text-center space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-center min-w-0">
              {/* Official Ministerial Authority Masthead with Sovereign State Emblem */}
              <div className="inline-flex items-center justify-center gap-2.5 sm:gap-3.5 animate-fade-up">
                <StateEmblem size={38} tone="gold" showMotto={true} />
                <div className="text-left border-l border-amber-400/40 pl-2.5 sm:pl-3">
                  <p className="text-[10px] sm:text-xs font-black tracking-widest uppercase text-amber-300 font-mono">
                    {language === "hi"
                      ? "भारत सरकार • विधिक मापविज्ञान प्रभाग"
                      : "GOVERNMENT OF INDIA • LEGAL METROLOGY DIVISION"}
                  </p>
                  <p className="text-[9.5px] sm:text-[11px] text-slate-300 font-medium">
                    {language === "hi"
                      ? "उपभोक्ता मामले विभाग • राष्ट्रीय विधिक प्रवर्तन प्रणाली"
                      : "Department of Consumer Affairs • National Statutory Enforcement System"}
                  </p>
                </div>
              </div>

              {/* Sovereign Portal Title & Tagline */}
              <div className="space-y-1 sm:space-y-1.5 max-w-3xl mx-auto w-full min-w-0">
                <div className="inline-block animate-fade-up w-full">
                  <h1 className="text-xl sm:text-3xl lg:text-[1.95rem] font-black tracking-tight leading-snug sm:leading-[1.16] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                    {t("hero.headline_1", "Evidence-Grade Package Compliance.")}
                    <span className="block text-amber-300 mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                      {t("hero.headline_2", "Statutory Transparency.")}
                    </span>
                  </h1>
                  {/* Official National Portal Tricolor Accent Ribbon */}
                  <div className="flex items-center justify-center gap-1 mt-1.5 mx-auto max-w-[150px]">
                    <div className="h-0.5 flex-1 bg-[#FF9933] rounded-full" />
                    <div className="h-0.5 w-2 bg-white rounded-full" />
                    <div className="h-0.5 flex-1 bg-[#138808] rounded-full" />
                  </div>
                </div>

                <p className="text-xs sm:text-[13.5px] font-medium text-slate-100 max-w-3xl mx-auto leading-relaxed animate-fade-up px-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  {t(
                    "hero.description",
                    "Rule 6 Mandatory Declarations & Table-I Schedule Verification under Legal Metrology Act, 2009 with Section 63 BSA 2023 Tamper-Evident Certificates for Enforcement Officers."
                  )}
                </p>
              </div>

              {/* Central Statutory Omnibox Search Engine */}
              <div className="w-full max-w-full min-w-0 pt-1 sm:pt-1.5 animate-fade-up">
                <StatutoryOmnibox />
              </div>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-2 sm:pt-3 animate-fade-up w-full max-w-md sm:max-w-none mx-auto">
                <Link
                  to="/dashboard"
                  onClick={resetScrollToTop}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-black shadow-lg hover:shadow-amber-400/25 transition-all transform hover:-translate-y-0.5 btn-press cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck size={17} className="text-slate-950 shrink-0" />
                  <span>{t("hero.cta_workstation", "Launch Officer Workstation")}</span>
                  <ArrowRight size={15} className="shrink-0" />
                </Link>
                <Link
                  to="/rules"
                  onClick={resetScrollToTop}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/35 hover:border-white/60 bg-[#0c2340]/90 hover:bg-[#123157] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-md backdrop-blur-md transition-all btn-press cursor-pointer whitespace-nowrap"
                >
                  <Scale size={16} className="text-amber-300 shrink-0" />
                  <span>{t("hero.cta_rules", "Statutory Rules & Table-I Schedule")}</span>
                </Link>
              </div>
            </div>

            {/* 4 Trust Pillar Badges (Grounded at Bottom of 1st Frame) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-4xl mx-auto w-full pt-3 pb-1 border-t border-white/15 text-xs mt-3 sm:mt-5">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#091C33]/85 hover:bg-[#0E2847] border border-white/15 hover:border-white/30 backdrop-blur-md shadow-xs text-center transition-colors">
                <p className="text-sm sm:text-base font-black text-amber-300 leading-tight drop-shadow-xs">
                  {t("hero.trust_verdicts", "4-State")}
                </p>
                <p className="text-slate-200 text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
                  {t("hero.trust_verdicts_sub", "Epistemic Verdicts")}
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#091C33]/85 hover:bg-[#0E2847] border border-white/15 hover:border-white/30 backdrop-blur-md shadow-xs text-center transition-colors">
                <p className="text-sm sm:text-base font-black text-emerald-400 leading-tight drop-shadow-xs">
                  {t("hero.trust_evidence", "Sec 63 BSA")}
                </p>
                <p className="text-slate-200 text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
                  {t("hero.trust_evidence_sub", "Electronic Evidence")}
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#091C33]/85 hover:bg-[#0E2847] border border-white/15 hover:border-white/30 backdrop-blur-md shadow-xs text-center transition-colors">
                <p className="text-sm sm:text-base font-black text-amber-300 leading-tight drop-shadow-xs">
                  {t("hero.trust_font", "Table-I")}
                </p>
                <p className="text-slate-200 text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
                  {t("hero.trust_font_sub", "Font Height (6.0 mm)")}
                </p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#091C33]/85 hover:bg-[#0E2847] border border-white/15 hover:border-white/30 backdrop-blur-md shadow-xs text-center transition-colors">
                <p className="text-sm sm:text-base font-black text-cyan-300 leading-tight drop-shadow-xs">
                  {t("hero.trust_offline", "Mode B")}
                </p>
                <p className="text-slate-200 text-[10px] sm:text-[11px] font-medium mt-0.5 truncate">
                  {t("hero.trust_offline_sub", "Offline Resilient")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* National Leadership & DPI Vision Spotlight Banner */}
        <NationalLeadershipBanner />

        {/* Official Statutory Benchmark & Physical Laboratory Testing Docket */}
        <section className="py-8 sm:py-14 bg-slate-100/80 border-b border-slate-200 scroll-mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1B365D] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {language === "hi" ? "सांविधिक प्रयोगशाला परीक्षण डोजियर" : "Statutory Laboratory Inspection Docket"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-700 font-mono font-bold">{t("demo.case_id", "Case: INSP-2026-0842-01")}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-xl mt-1.5 leading-snug">
                    {t("demo.headline", "Fortune Sunlite Refined Sunflower Oil 1L — Principal Display Panel (PDP) Adjudication")}
                  </h3>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-rose-50 text-rose-800 border border-rose-200 shadow-xs">
                    {t("demo.status_fail", "FAIL — PROHIBITED STATUTORY UNIT")}
                  </span>
                  <Link
                    to="/inspections/demo-fortune-sunlite"
                    onClick={resetScrollToTop}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#1B365D] hover:bg-[#0A2540] text-white px-4 py-2 text-xs font-bold shadow-xs transition-all"
                  >
                    <span>{t("demo.inspect_canvas", "Inspect in Canvas")}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative group shadow-sm">
                  <img
                    src="/assets/pdp_calibration_desk.jpg"
                    alt="Packaging Inspection & ArUco Metric Calibration Desk"
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg text-xs font-mono text-slate-900 font-bold border border-slate-300 shadow-sm">
                    {language === "hi" ? "भौतिक वर्नियर: 56.45 मिमी" : "Physical Vernier: 56.45 mm"}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 bg-[#1B365D]/95 backdrop-blur-md p-2.5 rounded-lg text-xs text-white flex items-center justify-between border border-white/20 shadow-xs">
                    <span className="font-mono text-blue-100 text-[11px]">
                      {language === "hi" ? "फिड्यूशियल: ArUco 4x4 (50मिमी संदर्भ)" : "Fiducial: ArUco 4x4 (50mm Reference)"}
                    </span>
                    <span className="font-bold text-amber-300 font-mono text-[11px]">
                      {language === "hi" ? "पैमाना गुणक: 11.4 px/mm" : "Scale Factor: 11.4 px/mm"}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t("demo.quality_gate", "Automated Statutory Quality Gate & Telemetry")}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-mono">{t("demo.blur_pass", "Laplacian Blur: σ²=340 [PASS]")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-mono">{t("demo.glare_pass", "Specular Glare: 2.1% [PASS]")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-mono">{t("demo.numeral_val", "Table-I Numeral: 4.8 mm")}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                      <span className="truncate font-mono">{t("demo.sha_val", "Sec 63 SHA-256 Verified")}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5 shadow-xs">
                    <p className="font-bold flex items-center gap-1.5 text-rose-800">
                      <AlertCircle size={15} className="text-rose-600 shrink-0" />
                      <span>{t("demo.contravention_title", "Contravention Established under Rule 5")}</span>
                    </p>
                    <p className="text-rose-900/90 leading-relaxed text-[11.5px]">
                      {t("demo.contravention_desc", "The packaging declares Net Quantity as \"1000 ML\" and \"910 gms\". Under the LMPC Rules 2011, uppercase ML and pluralized gms are strictly prohibited symbols. Standard symbols are strictly ml or mL and g.")}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* National Metrology Infrastructure & e-Maap Operations Showcase */}
        <section className="py-14 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Officer Visual with Official Stamp Caption */}
              <Reveal className="lg:col-span-6 space-y-3">
                <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-300 bg-slate-100 group">
                  <img
                    src="/assets/goi_metrology_inspection_hero.jpg"
                    alt="Legal Metrology Officer Conducting Verified Packaging Adjudication"
                    className="w-full h-[360px] sm:h-[420px] object-cover object-top"
                  />
                  {/* Official Gazetted Stamp Badge */}
                  <div className="absolute top-3 left-3 bg-[#1B365D]/95 text-white border border-amber-400/80 px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-xs flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        {language === "hi" ? "राजपत्रित अधिकारी सत्यापन" : "Gazetted Officer Verification"}
                      </div>
                      <div className="text-[9px] text-slate-200 font-mono">
                        LMO-DL-048 • NCT Delhi Division
                      </div>
                    </div>
                  </div>

                  {/* Hardware Telemetry Bar */}
                  <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-slate-700 p-3 rounded-xl backdrop-blur-md text-xs text-white">
                    <div className="flex items-center justify-between font-mono text-[10.5px] border-b border-slate-700 pb-1.5 mb-1.5">
                      <span className="text-amber-400 font-bold">
                        {language === "hi" ? "सक्रिय बेंच हार्डवेयर" : "ACTIVE BENCH HARDWARE"}
                      </span>
                      <span className="text-emerald-400">
                        {language === "hi" ? "अंशांकित एवं सुरक्षित" : "CALIBRATED & SECURE"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-300">
                      <div>
                        <span className="text-slate-400 block">
                          {language === "hi" ? "वर्नियर:" : "Vernier:"}
                        </span>
                        <span className="font-mono font-bold text-white">Mitutoyo 150mm</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">
                          {language === "hi" ? "लक्ष्य:" : "Target:"}
                        </span>
                        <span className="font-mono font-bold text-white">ArUco 4x4 (50mm)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">
                          {language === "hi" ? "वर्ग-II तराजू:" : "Class-II Scale:"}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {language === "hi" ? "0.01g प्रमाणित" : "0.01g Certified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic text-center">
                  {language === "hi"
                    ? "चित्र 1.0: उपभोक्ता मामले विभाग के क्षेत्रीय मापविज्ञान कार्यस्थान पर वास्तविक समय में भौतिक वस्तु का निरीक्षण।"
                    : "Figure 1.0: Real-time physical commodity inspection at the Department of Consumer Affairs field metrology workstation."}
                </p>
              </Reveal>

              {/* National Interoperability Matrix */}
              <Reveal className="lg:col-span-6 space-y-5" delay={0.08}>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#1B365D]">
                    <Landmark size={14} className="text-[#1B365D]" />
                    <span>
                      {language === "hi" ? "ई-माप पारिस्थितिकी तंत्र एकीकरण" : "e-Maap Ecosystem Integration"}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-2">
                    {language === "hi"
                      ? "एकीकृत राष्ट्रीय मापविज्ञान अवसंरचना"
                      : "Unified National Metrology Infrastructure"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {language === "hi"
                      ? "क्षेत्रीय निरीक्षण अधिकारियों को सीधे केंद्रीय वैधानिक डेटाबेस से जोड़ना, नकली पैकेजिंग की खामियों को समाप्त करना और पूर्ण उपभोक्ता पारदर्शिता लागू करना।"
                      : "Connecting field inspection officers directly to central statutory databases, eliminating counterfeit packaging loopholes and enforcing complete consumer transparency."}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 shrink-0">
                      <ExternalLink size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {language === "hi" ? "ई-माप पोर्टल अंतर्संबंध" : "e-Maap Portal Interconnect"}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-900 font-mono border border-amber-200">
                          {language === "hi" ? "नियम 27" : "Rule 27"}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-[11.5px]">
                        {language === "hi"
                          ? "केंद्रीय विधिक मापविज्ञान निदेशालय रजिस्ट्री के विरुद्ध निर्माता, पैकर और आयातक के सांविधिक पंजीकरणों का त्वरित सत्यापन।"
                          : "Instant validation of manufacturer, packer, and importer statutory registrations against the central Directorate of Legal Metrology registry."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                    <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 shrink-0">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {language === "hi"
                            ? "धारा 63 बीएसए 2023 साक्ष्य वॉल्ट"
                            : "Section 63 BSA 2023 Evidentiary Vault"}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 font-mono">
                          {language === "hi" ? "अदालत में स्वीकार्य" : "Court-Admissible"}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-[11.5px]">
                        {language === "hi"
                          ? "प्रत्येक ऑप्टिकल फ्रेम, सामान्यीकृत टोकन, और नियम एएसटी निर्णय स्वचालित धारा 63 बीएसए 2023 इलेक्ट्रॉनिक प्रमाणपत्रों के लिए एक एसएचए-256 मर्कल लीफ उत्पन्न करता है।"
                          : "Every optical frame, normalized token, and Rule AST verdict generates a SHA-256 Merkle leaf for automated Section 63 BSA 2023 electronic certificates."}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs flex items-start gap-3.5 hover:border-slate-300 transition-colors">
                    <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 shrink-0">
                      <Scale size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {language === "hi"
                            ? "तालिका-I अनुसूची एवं यूएसपी सटीक गणित"
                            : "Table-I Schedule & USP Strict Math"}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-blue-100 text-blue-900 border border-blue-200 font-mono">
                          {language === "hi" ? "ADL-01 लागू" : "ADL-01 Enforced"}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed text-[11.5px]">
                        {language === "hi"
                          ? "पंक्ति 5 के लिए ठीक 6.0 मिमी (कभी भी 8.0 मिमी नहीं) की न्यूनतम संख्यात्मक ऊंचाई और इकाई विक्रय मूल्य गणितीय सहनशीलता |USP × Qty - MRP| ≤ ₹0.02 लागू करता है।"
                          : "Enforces Row 5 minimum numeral height of exactly 6.0 mm (never 8.0 mm) and Unit Sale Price math tolerance |USP × Qty - MRP| ≤ ₹0.02."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    href="https://emaap.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
                  >
                    <span>{language === "hi" ? "आधिकारिक ई-माप पोर्टल देखें" : "Visit Official e-Maap Portal"}</span>
                    <ExternalLink size={13} />
                  </a>
                  <span className="text-slate-300">•</span>
                  <a
                    href="https://consumerhelpline.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:underline"
                  >
                    <span>{language === "hi" ? "राष्ट्रीय उपभोक्ता हेल्पलाइन (1915)" : "National Consumer Helpline (1915)"}</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Interactive 5-Stage Statutory Pipeline Infographic */}
        <section className="py-14 bg-slate-50 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <StatutoryPipelineInfographic />
          </div>
        </section>

        {/* 4-Stage Statutory Flow */}
        <section className="py-14 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1B365D] text-[11px] font-bold uppercase tracking-widest mb-2.5">
                <span>{t("protocol.label", "Statutory Inspection Protocol")}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
                {t("protocol.title", "From Physical Capture to Adjudicated Notice in 4 Steps")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                {t(
                  "protocol.subtitle",
                  "Designed for field inspectors with zero technical friction. Every automated calculation is verified against legal schedules before notice drafting."
                )}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: t("protocol.step1_title", "Evidence Ingestion"),
                  desc: t(
                    "protocol.step1_desc",
                    "Capture Principal Display Panel (PDP) with ArUco 4x4 fiducial marker. Real-time blur and glare quality gates."
                  ),
                },
                {
                  step: "02",
                  title: t("protocol.step2_title", "Multilingual OCR"),
                  desc: t(
                    "protocol.step2_desc",
                    "DBNet++ detection with PP-OCRv4 English and Devanagari Hindi recognition parses all statutory declarations."
                  ),
                },
                {
                  step: "03",
                  title: t("protocol.step3_title", "Rule Engine & Math"),
                  desc: t(
                    "protocol.step3_desc",
                    "Automated verification against Table-I font schedule, Unit Sale Price math (|USP × Qty - MRP| ≤ ₹0.02), and banned units."
                  ),
                },
                {
                  step: "04",
                  title: t("protocol.step4_title", "Officer Adjudication"),
                  desc: t(
                    "protocol.step4_desc",
                    "Human Legal Metrology Officer reviews evidence in split canvas and dispatches Form-1 Notice with Section 63 BSA certificate."
                  ),
                },
              ].map((item, idx) => (
                <Reveal key={item.step} delay={idx * 0.06} className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative space-y-3 shadow-2xs hover:border-slate-300 transition-all card-lift">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1B365D] text-white font-black text-xs shadow-2xs">
                    {item.step}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid (Fixing White-on-White Bug) */}
        <section className="py-14 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={idx * 0.06} className="bg-white card-lift p-6 space-y-3 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                      <Icon size={22} />
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Official GIGW 3.0 National Portal Footer */}
      <GovFooter />
    </div>
  );
};

export default Landing;

