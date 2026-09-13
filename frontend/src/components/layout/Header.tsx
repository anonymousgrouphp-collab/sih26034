import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NirikshakBrandLogo } from "../common/nirikshakBrandLogo";
import { OfficerRole } from "../../types/inspection";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ApiService } from "../../services/api";
import { Radio, Scale, ShieldCheck, CheckCircle2, ChevronDown } from "lucide-react";
import { DEMO_SCENARIOS } from "../../features/demo/demoCatalog";
import { Modal } from "../common/Modal";
import { useCircle } from "../../context/CircleContext";

interface HeaderProps {
  activeCircle: string;
  onCircleChange: (circleId: string) => void;
  onRefresh?: () => void;
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

import { JURISDICTION_CIRCLES } from "../../context/CircleContext";
export { JURISDICTION_CIRCLES };

export const Header: React.FC<HeaderProps> = ({
  activeCircle,
  onCircleChange,
  onRefresh,
  onToggleSidebar,
  onOpenCommandPalette,
}) => {
  const { user, switchOfficerRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const isController = user?.officerRole === "CONTROLLER";

  const [currentMode, setCurrentMode] = useState<"ONLINE" | "LOCAL_RESILIENT">(() => {
    try {
      const operatingMode = ApiService.getOperatingMode();
      if (operatingMode === "MOCK" || operatingMode === "DEMO_FIXTURE") {
        return "LOCAL_RESILIENT";
      }
      const stored = localStorage.getItem("Nirikshak_mode");
      return stored === "LOCAL_RESILIENT" ? "LOCAL_RESILIENT" : "ONLINE";
    } catch {
      return "ONLINE";
    }
  });

  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const { allCircles, customCircles, addCustomCircle } = useCircle();

  const [isAddCircleOpen, setIsAddCircleOpen] = useState(false);
  const [newCircleId, setNewCircleId] = useState("");
  const [newCircleLabel, setNewCircleLabel] = useState("");
  const [newCircleLabelHi, setNewCircleLabelHi] = useState("");
  const [newCircleError, setNewCircleError] = useState<string | null>(null);

  const openAddCircleModal = () => {
    setNewCircleId("");
    setNewCircleLabel("");
    setNewCircleLabelHi("");
    setNewCircleError(null);
    setIsAddCircleOpen(true);
  };

  const handleAddCircleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewCircleError(null);
    const result = addCustomCircle(newCircleId, newCircleLabel, newCircleLabelHi);
    if (!result.ok || !result.circle) {
      setNewCircleError(result.error ?? "Unable to add circle.");
      return;
    }
    setIsAddCircleOpen(false);
    onCircleChange(result.circle.id);
  };

  const handleRoleToggle = (newRole: OfficerRole) => {
    switchOfficerRole(newRole);
  };

  const handleModeSwitch = (mode: "ONLINE" | "LOCAL_RESILIENT") => {
    setCurrentMode(mode);
    try {
      localStorage.setItem("Nirikshak_mode", mode);
      if (mode === "ONLINE") {
        ApiService.setOperatingMode("LIVE");
      } else {
        // Mode B (Local Resilient Mode) enables interactive offline inspection via MockApiService
        ApiService.setOperatingMode("MOCK");
      }
    } catch {
      // ignore
    }
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <header
        className={`glass text-white border-b-2 shadow-md sticky top-0 z-50 w-full transition-colors duration-200 ${
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

            <NirikshakBrandLogo tone="light" size="md" />
          </div>

          {/* Quick Command Palette Search Trigger */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label="Open universal command search palette (Ctrl+K)"
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-govNavy-dark/80 hover:bg-govNavy-light border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors shadow-2xs whitespace-nowrap min-w-0 overflow-hidden"
            >
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden 2xl:inline truncate min-w-0">{t("portal.command_search", "Quick Search Cases & Rules...")}</span>
              <span className="inline 2xl:hidden truncate min-w-0">{t("portal.command_search_short", "Search Cases...")}</span>
              <kbd className="hidden 2xl:inline-block ml-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600 shrink-0">
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
                onClick={() => {
                  setDemoMenuOpen(!demoMenuOpen);
                  setModeMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-xs border border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                title="Quick Access: Certified Statutory Demonstration Scenarios"
                aria-haspopup="true"
                aria-expanded={demoMenuOpen}
              >
                <Scale size={14} className="text-slate-950" />
                <span className="hidden sm:inline">{language === "hi" ? "डेमो परिदृश्य" : "Demo Cases"}</span>
                <span className="hidden sm:inline bg-slate-950 text-amber-300 text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full">
                  7
                </span>
                <ChevronDown size={13} className={`transition-transform duration-200 ${demoMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {demoMenuOpen && (
                <>
                  {/* Fixed Backdrop for Outside Click Dismissal */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setDemoMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    className="absolute left-0 mt-2 w-80 sm:w-88 rounded-xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-pop-in"
                  >
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-extrabold text-xs text-govNavy flex items-center gap-1.5">
                          <Scale size={12} className="text-amber-500" />
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
              </>
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
                onChange={(e) => {
                  if (e.target.value === "__add_new_circle__") {
                    openAddCircleModal();
                    return;
                  }
                  onCircleChange(e.target.value);
                }}
                className="bg-transparent text-xs text-amber-200 font-semibold focus:outline-none cursor-pointer pr-2 max-w-[160px] 2xl:max-w-[220px] truncate"
              >
                {allCircles.map((c) => (
                  <option key={c.id} value={c.id} className="bg-govNavy text-white">
                    {(language === "hi" && c.labelHi ? c.labelHi : c.label) +
                      (customCircles.some((cc) => cc.id === c.id) ? " • custom" : "")}
                  </option>
                ))}
                {/* Guard: keep the select truthful if the stored circle is not in the registry */}
                {!allCircles.some((c) => c.id === activeCircle) && (
                  <option value={activeCircle} className="bg-govNavy text-white">
                    {activeCircle}
                  </option>
                )}
                <option value="__add_new_circle__" className="bg-govNavy text-emerald-300">
                  ＋ Add New Circle…
                </option>
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

            {/* System Operating Mode — Mode A (Online Monolith) / Mode B (Local Resilient Field Mode).
                Rendered as an explained dropdown so its purpose is self-evident (feedback #bug-2). */}
            <div className="relative hidden md:block shrink-0">
              <button
                type="button"
                onClick={() => {
                  setModeMenuOpen(!modeMenuOpen);
                  setDemoMenuOpen(false);
                }}
                aria-haspopup="true"
                aria-expanded={modeMenuOpen}
                aria-label="System operating mode"
                title="Statutory System Mode: Mode A runs inspections from the central cloud server & datastore; Mode B runs standalone on this workstation (local storage) when field connectivity is unavailable."
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all bg-govNavy-dark/80 ${
                  isController ? "border-purple-500/50 hover:border-purple-400/80" : "border-slate-700 hover:border-amber-400/60"
                }`}
              >
                <Radio
                  size={13}
                  className={`shrink-0 ${currentMode === "ONLINE" ? "text-emerald-400" : "text-amber-400"}`}
                />
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold hidden xl:inline">
                  System Mode
                </span>
                <span className={currentMode === "ONLINE" ? "text-emerald-300" : "text-amber-300"}>
                  {currentMode === "ONLINE"
                    ? `Mode A ${language === "hi" ? "(ऑनलाइन)" : "(Online)"}`
                    : `Mode B ${language === "hi" ? "(लचीला)" : "(Resilient)"}`}
                </span>
                <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${modeMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {modeMenuOpen && (
                <>
                  {/* Fixed Backdrop for Outside Click Dismissal */}
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setModeMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-pop-in">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-extrabold text-xs text-govNavy flex items-center gap-1.5">
                        <Radio size={12} className="text-emerald-500" />
                        <span>{language === "hi" ? "सिस्टम संचालन मोड" : "System Operating Mode"}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {language === "hi"
                          ? "चुनें कि यह निरीक्षण सत्र कहाँ चलेगा।"
                          : "Choose where this inspection session runs."}
                      </p>
                    </div>

                    <div className="py-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          handleModeSwitch("ONLINE");
                          setModeMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start justify-between gap-2 border transition-colors ${
                          currentMode === "ONLINE"
                            ? "bg-emerald-50 border-emerald-300"
                            : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Mode A — {language === "hi" ? "ऑनलाइन मोनोलिथ" : "Online Monolith"}
                          </p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                            Central cloud datastore &amp; server pipeline for the whole circle.
                          </p>
                        </div>
                        {currentMode === "ONLINE" && (
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleModeSwitch("LOCAL_RESILIENT");
                          setModeMenuOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start justify-between gap-2 border transition-colors ${
                          currentMode === "LOCAL_RESILIENT"
                            ? "bg-amber-50 border-amber-300"
                            : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            Mode B — {language === "hi" ? "स्थानीय लचीला मोड" : "Local Resilient"}
                          </p>
                          <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                            Standalone field inspection on this workstation (local storage) — works during connectivity blackouts.
                          </p>
                        </div>
                        {currentMode === "LOCAL_RESILIENT" && (
                          <CheckCircle2 size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>

      {/* Add New Jurisdiction Circle (feedback #least-priority) */}
      <Modal
        isOpen={isAddCircleOpen}
        onClose={() => setIsAddCircleOpen(false)}
        title={language === "hi" ? "नया प्रवर्तन मंडल जोड़ें" : "Add New Jurisdiction Circle"}
        subtitle={
          language === "hi"
            ? "मंडल पहचानकर्ता इस वर्कस्टेशन पर सहेजा जाएगा।"
            : "The circle identifier is saved on this workstation."
        }
        maxWidth="sm"
      >
        <form onSubmit={handleAddCircleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-circle-id" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {language === "hi" ? "मंडल आईडी" : "Circle ID"}
            </label>
            <input
              id="new-circle-id"
              type="text"
              className="input font-mono"
              value={newCircleId}
              onChange={(e) => setNewCircleId(e.target.value)}
              placeholder="CIRCLE_DL_WEST_05"
              maxLength={40}
              required
            />
            <p className="mt-1 text-[10px] text-slate-400">
              {language === "hi"
                ? "केवल A-Z, 0-9 और अंडरस्कोर (उदा. CIRCLE_DL_WEST_05)।"
                : "A-Z, 0-9 and underscores only (e.g. CIRCLE_DL_WEST_05)."}
            </p>
          </div>

          <div>
            <label htmlFor="new-circle-label" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {language === "hi" ? "प्रदर्शन नाम" : "Display Name"}
            </label>
            <input
              id="new-circle-label"
              type="text"
              className="input"
              value={newCircleLabel}
              onChange={(e) => setNewCircleLabel(e.target.value)}
              placeholder="DL-WEST-05 • West Delhi Circle"
              maxLength={80}
              required
            />
          </div>

          <div>
            <label htmlFor="new-circle-label-hi" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              {language === "hi" ? "हिंदी नाम (वैकल्पिक)" : "Hindi Name (optional)"}
            </label>
            <input
              id="new-circle-label-hi"
              type="text"
              className="input"
              value={newCircleLabelHi}
              onChange={(e) => setNewCircleLabelHi(e.target.value)}
              placeholder="DL-WEST-05 • पश्चिम दिल्ली मंडल"
              maxLength={80}
            />
          </div>

          {newCircleError && (
            <p role="alert" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {newCircleError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={() => setIsAddCircleOpen(false)}>
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </button>
            <button type="submit" className="btn-primary">
              {language === "hi" ? "मंडल जोड़ें" : "Add Circle"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
