import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NyayaDrishtiBrandLogo } from "../common/NyayaDrishtiBrandLogo";
import { OfficerRole } from "../../types/inspection";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ApiService } from "../../services/api";
import { LogOut, Scale, ShieldCheck, Sparkles, ChevronDown } from "lucide-react";
import { DEMO_SCENARIOS } from "../../features/demo/demoCatalog";

interface HeaderProps {
  activeCircle: string;
  onCircleChange: (circleId: string) => void;
  onRefresh?: () => void;
  onNewInspectionClick?: () => void;
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export const JURISDICTION_CIRCLES = [
  {
    id: "CIRCLE_DL_SOUTH_01",
    label: "DL-SOUTH-01 • South Delhi Circle (Saket / Kalkaji)",
    labelHi: "DL-SOUTH-01 • दक्षिण दिल्ली मंडल (साकेत / कालकाजी)",
  },
  {
    id: "CIRCLE_DL_CENTRAL_02",
    label: "DL-CENTRAL-02 • Central Delhi Circle (Connaught Place)",
    labelHi: "DL-CENTRAL-02 • मध्य दिल्ली मंडल (कनॉट प्लेस)",
  },
  {
    id: "CIRCLE_UP_GBN_01",
    label: "UP-GBN-01 • Gautam Buddha Nagar Division (Noida / Gr. Noida)",
    labelHi: "UP-GBN-01 • गौतम बुद्ध नगर प्रभाग (नोएडा / ग्रेटर नोएडा)",
  },
  {
    id: "CIRCLE_MH_MUM_01",
    label: "MH-MUM-01 • Mumbai Suburban Enforcement Circle",
    labelHi: "MH-MUM-01 • मुंबई उपनगरीय प्रवर्तन मंडल",
  },
  {
    id: "CIRCLE_KA_BLR_01",
    label: "KA-BLR-01 • Bengaluru Urban Enforcement Depot",
    labelHi: "KA-BLR-01 • बेंगलुरु शहरी प्रवर्तन डिपो",
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeCircle,
  onCircleChange,
  onRefresh,
  onNewInspectionClick,
  onToggleSidebar,
  onOpenCommandPalette,
}) => {
  const { user, logout, switchOfficerRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isController = user?.officerRole === "CONTROLLER";

  const [currentMode, setCurrentMode] = useState<"ONLINE" | "LOCAL_RESILIENT">(() => {
    try {
      const stored = localStorage.getItem("nyayadrishti_mode");
      return stored === "LOCAL_RESILIENT" ? "LOCAL_RESILIENT" : "ONLINE";
    } catch {
      return "ONLINE";
    }
  });

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleRoleToggle = (newRole: OfficerRole) => {
    switchOfficerRole(newRole);
  };

  const handleModeSwitch = (mode: "ONLINE" | "LOCAL_RESILIENT") => {
    setCurrentMode(mode);
    try {
      localStorage.setItem("nyayadrishti_mode", mode);
      if (mode === "ONLINE") {
        ApiService.setOperatingMode("LIVE");
      } else {
        ApiService.setOperatingMode("DEMO_FIXTURE");
      }
    } catch {
      // ignore
    }
    if (onRefresh) onRefresh();
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <header
      className={`bg-govNavy text-white border-b-2 shadow-md sticky top-0 z-40 w-full transition-colors duration-200 ${
        isController ? "border-purple-500" : "border-amber-500"
      }`}
    >
      {/* Tricolor National Stripe */}
      <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] w-full" />

      <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-5 lg:px-6">
        <div className="flex items-center justify-between h-16 max-h-16 gap-2 lg:gap-4">
          {/* Brand & State Emblem of India */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 py-0.5">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-govNavy-light lg:hidden"
                title="Toggle Navigation Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <NyayaDrishtiBrandLogo tone="light" size="md" />
          </div>

          {/* Quick Command Palette Search Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Open universal command search palette (Ctrl+K)"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-govNavy-dark/80 hover:bg-govNavy-light border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors shadow-2xs whitespace-nowrap shrink-0"
            >
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden 2xl:inline">{t("portal.command_search", "Quick Search Cases & Rules...")}</span>
              <span className="inline 2xl:hidden">{t("portal.command_search_short", "Search Cases...")}</span>
              <kbd className="hidden xl:inline-block ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600">
                Ctrl K
              </kbd>
            </button>
          )}

          {/* Controls: Circle Selector, Connectivity, RBAC Toggle, Officer Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Quick Demo Cases Dropdown Launcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                title="Quick Access: Certified Statutory Demonstration Scenarios"
                aria-haspopup="true"
                aria-expanded={demoMenuOpen}
              >
                <Sparkles size={14} className="text-slate-950" />
                <span>{language === "hi" ? "डेमो परिदृश्य" : "Demo Cases"}</span>
                <span className="bg-slate-950 text-amber-300 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                  7
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${demoMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 sm:w-88 rounded-xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-xs text-govNavy flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-500" />
                        <span>{language === "hi" ? "सांविधिक प्रदर्शन परिदृश्य" : "Statutory Demo Suite"}</span>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {language === "hi" ? "त्वरित सांविधिक जांच हेतु 1-क्लिक लोड" : "1-Click load for statutory audit"}
                      </p>
                    </div>
                    <Link
                      to="/dashboard#demo-showcase"
                      onClick={() => setDemoMenuOpen(false)}
                      className="text-[11px] font-bold text-amber-700 hover:underline"
                    >
                      {language === "hi" ? "सभी 7 देखें" : "View All"}
                    </Link>
                  </div>

                  <div className="py-1 max-h-80 overflow-y-auto space-y-1">
                    {DEMO_SCENARIOS.map((s) => (
                      <button
                        key={s.caseId}
                        type="button"
                        onClick={() => {
                          setDemoMenuOpen(false);
                          navigate(`/inspections/${s.caseId}`);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between gap-2 text-xs transition-colors group border border-transparent hover:border-slate-200"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9px] font-bold text-slate-500">
                              #{s.scenarioNumber}
                            </span>
                            <span className="font-bold text-slate-900 group-hover:text-govNavy truncate">
                              {language === "hi" && s.titleHi ? s.titleHi : s.title}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                            {language === "hi" && s.headlineViolationHi ? s.headlineViolationHi : s.headlineViolation}
                          </p>
                        </div>
                        <span
                          className={`text-[9.5px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                            s.targetVerdict === "FAIL"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : s.targetVerdict === "PASS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : s.targetVerdict === "REVIEW"
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {s.targetVerdict}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Jurisdiction Circle Selector */}
            <div className="hidden 2xl:flex items-center space-x-2 bg-govNavy-dark/70 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
              <label htmlFor="circle-select" className="text-xs text-slate-300 whitespace-nowrap font-medium">
                {t("portal.circle", "Circle:")}
              </label>
              <select
                id="circle-select"
                value={activeCircle}
                onChange={(e) => onCircleChange(e.target.value)}
                className="bg-transparent text-xs text-amber-200 font-semibold focus:outline-none cursor-pointer pr-2 max-w-[200px] 2xl:max-w-[260px] truncate"
              >
                {JURISDICTION_CIRCLES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-govNavy text-white">
                    {language === "hi" && c.labelHi ? c.labelHi : c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick RBAC Role Toggle */}
            <div
              className={`hidden sm:flex items-center bg-govNavy-dark/80 p-0.5 rounded-lg border text-xs shrink-0 transition-colors ${
                isController ? "border-purple-500/50" : "border-amber-500/40"
              }`}
            >
              <button
                type="button"
                onClick={() => handleRoleToggle("INSPECTOR")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  !isController
                    ? "bg-amber-500 text-govNavy shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Legal Metrology Officer (Inspector) Role"
              >
                {t("portal.role_lmo", "LMO Inspector")}
              </button>
              <button
                type="button"
                onClick={() => handleRoleToggle("CONTROLLER")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  isController
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Switch to Controller of Legal Metrology Role"
              >
                {t("portal.role_controller", "Controller")}
              </button>
            </div>

            {/* Operational Mode Toggle — Segmented switch matching Role Toggle styling */}
            <div
              className={`hidden md:flex items-center bg-govNavy-dark/80 p-0.5 rounded-lg border text-xs shrink-0 transition-colors ${
                isController ? "border-purple-500/50" : "border-amber-500/40"
              }`}
              title="Statutory System Mode: Mode A (Central Cloud Monolith) / Mode B (Field Standalone Resilient Mode)"
            >
              <button
                type="button"
                onClick={() => handleModeSwitch("ONLINE")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  currentMode === "ONLINE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-300 hover:text-white"
                }`}
                title="Mode A (Online Monolith): Central Cloud Datastore & Server Pipeline"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentMode === "ONLINE" ? "bg-white animate-pulse" : "bg-emerald-400"
                  }`}
                />
                <span>Mode A <span className="hidden xl:inline font-semibold">({language === "hi" ? "ऑनलाइन" : "Online"})</span></span>
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("LOCAL_RESILIENT")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                  currentMode === "LOCAL_RESILIENT"
                    ? isController
                    : "bg-amber-500 text-govNavy shadow-xs"
                }`}
                title="Mode B (Local Resilient): Standalone Field Inspection on Local SQLite"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentMode === "LOCAL_RESILIENT"
                      ? isController
                        ? "bg-white"
                        : "bg-govNavy"
                      : "bg-amber-400"
                  }`}
                />
                <span>Mode B <span className="hidden xl:inline font-semibold">({language === "hi" ? "लचीला" : "Resilient"})</span></span>
              </button>
            </div>

            {/* Officer Profile Badge — Themed to Active Role (LMO Inspector vs Controller) */}
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all duration-200 shrink-0 ${
                isController
                  ? "bg-govNavy-dark/90 border-purple-500/50 hover:border-purple-400/80 shadow-xs"
                  : "bg-govNavy-dark/90 border-amber-500/40 hover:border-amber-400/80 shadow-xs"
              }`}
              title={`Active Officer: ${user?.name || (isController ? "S.K. Verma" : "Rajesh Sharma")} (${isController ? "Controller" : "LMO Inspector"})`}
            >
              {/* Role-Themed Avatar */}
              <div
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-black border transition-all shrink-0 shadow-2xs ${
                  isController
                    ? "bg-purple-600 text-white border-purple-400 ring-1 ring-purple-300/40"
                    : "bg-amber-500 text-govNavy border-amber-300 ring-1 ring-amber-400/40"
                }`}
              >
                {user?.initials || (isController ? "SKV" : "RS")}
              </div>

              {/* Officer Identity & Role Pill */}
              <div className="hidden xl:block text-left max-w-[140px] truncate">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                  <span className="truncate">{user?.name || (isController ? "S.K. Verma" : "Rajesh Sharma")}</span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold border shrink-0 uppercase tracking-wider ${
                      isController
                        ? "bg-purple-500/25 text-purple-200 border-purple-400/50"
                        : "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    }`}
                  >
                    {isController ? "CTRL" : "LMO"}
                  </span>
                </div>
                <div className={`text-[10px] font-mono truncate ${isController ? "text-purple-200/80" : "text-amber-200/80"}`}>
                  {user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")}
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out of workstation session"
                className={`p-1 rounded text-slate-300 hover:text-red-300 transition-colors ml-0.5 shrink-0 ${
                  isController ? "hover:bg-purple-900/40" : "hover:bg-amber-950/40"
                }`}
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
