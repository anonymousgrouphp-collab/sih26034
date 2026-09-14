import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NirikshakBrandLogo } from "../common/NirikshakBrandLogo";
import { resetScrollToTop } from "../common/ScrollToTop";
import { OfficerRole } from "../../types/inspection";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { ApiService } from "../../services/api";
import {
  Radio,
  Scale,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Search,
  MapPin,
  LogOut,
  Sliders,
  UserCheck,
  KeyRound,
  ExternalLink,
} from "lucide-react";
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
  const { user, logout } = useAuth();
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

  const [officerMenuOpen, setOfficerMenuOpen] = useState(false);
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

  const handleModeSwitch = (mode: "ONLINE" | "LOCAL_RESILIENT") => {
    setCurrentMode(mode);
    try {
      localStorage.setItem("Nirikshak_mode", mode);
      if (mode === "ONLINE") {
        ApiService.setOperatingMode("LIVE");
      } else {
        ApiService.setOperatingMode("MOCK");
      }
    } catch {
      // ignore
    }
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <header className="bg-[#1B365D] text-white border-b border-[#0A2540] shadow-md sticky top-0 z-50 w-full select-none">
        {/* Tricolor Sovereign Accent Ribbon */}
        <div className="h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />

        <div className="w-full max-w-[1750px] mx-auto px-3 sm:px-5 lg:px-6">
          <div className="flex items-center justify-between h-14 max-h-14 gap-2 lg:gap-4">
            {/* Left: Hamburger & Sovereign Brand Identity */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 py-0.5">
              {onToggleSidebar && (
                <button
                  type="button"
                  onClick={onToggleSidebar}
                  className="p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 lg:hidden cursor-pointer transition-colors"
                  title="Toggle Navigation Menu"
                  aria-label="Toggle Navigation Menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              <NirikshakBrandLogo tone="light" size="md" />
            </div>

            {/* Center: Integrated Universal Enforcement Search Console */}
            {onOpenCommandPalette && (
              <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md xl:max-w-lg mx-2 lg:mx-4">
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  aria-label="Open universal statutory enforcement search (Ctrl+K)"
                  className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#0B213B] hover:bg-[#0E294A] border border-blue-400/25 hover:border-blue-300/40 text-left transition-all shadow-inner group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Search size={14} className="text-blue-300 group-hover:text-amber-300 transition-colors shrink-0" />
                    <span className="text-xs text-slate-300 group-hover:text-white truncate">
                      {language === "hi"
                        ? "सांविधिक नियम, तालिका-I या प्रकरण खोजें..."
                        : "Universal Statutory Search (Rules, Table-I, Cases)..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-blue-200 border border-white/20 font-bold">
                      Ctrl K
                    </kbd>
                  </div>
                </button>
              </div>
            )}

            {/* Right: Administrative Circle, Demo Suite, Officer Digital ID Badge */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              {/* Jurisdiction Circle Selector (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 bg-[#0B213B] px-3 py-1.5 rounded-lg border border-blue-400/25 text-xs shadow-2xs shrink-0">
                <MapPin size={13} className="text-amber-400 shrink-0" />
                <label htmlFor="circle-select" className="sr-only">
                  {t("portal.circle", "Jurisdiction Circle")}
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
                  className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer pr-1 max-w-[150px] xl:max-w-[200px] truncate"
                >
                  {allCircles.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#1B365D] text-white">
                      {(language === "hi" && c.labelHi ? c.labelHi : c.label) +
                        (customCircles.some((cc) => cc.id === c.id) ? " • custom" : "")}
                    </option>
                  ))}
                  {!allCircles.some((c) => c.id === activeCircle) && (
                    <option value={activeCircle} className="bg-[#1B365D] text-white">
                      {activeCircle}
                    </option>
                  )}
                  <option value="__add_new_circle__" className="bg-[#1B365D] text-emerald-300">
                    ＋ Add New Circle…
                  </option>
                </select>
              </div>

              {/* Mobile Active Circle Pill */}
              <div 
                title={`Active Circle: ${activeCircle}`}
                className="flex lg:hidden items-center gap-1 bg-[#0B213B] px-2 py-1 rounded-lg border border-blue-400/25 text-[10.5px] font-mono font-bold text-amber-300 shrink-0 shadow-2xs"
              >
                <MapPin size={11} className="text-amber-400 shrink-0" />
                <span className="truncate max-w-[80px]">{activeCircle.replace("CIRCLE_", "")}</span>
              </div>

              {/* Government Officer Digital ID Badge & Popover */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setOfficerMenuOpen(!officerMenuOpen)}
                  aria-haspopup="true"
                  aria-expanded={officerMenuOpen}
                  aria-label="Officer Profile and Telemetry"
                  className="flex items-center gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-[#0B213B] hover:bg-[#0E294A] border border-blue-400/25 hover:border-blue-300/40 text-xs transition-all shadow-2xs focus:outline-none cursor-pointer"
                >
                  {/* Officer Monogram Crest with Gold Border */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-xs flex items-center justify-center border border-amber-200 shrink-0 shadow-xs">
                    {user?.initials || (isController ? "SKV" : "RS")}
                  </div>

                  {/* Officer Metadata (Condensed on mobile, full on desktop) */}
                  <div className="hidden sm:flex flex-col text-left leading-none min-w-0 pr-0.5">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-white text-[11.5px] truncate max-w-[110px] xl:max-w-[140px]">
                        {user?.name || "Rajesh Sharma"}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Active Verified Session" />
                    </div>
                    <span className="text-[9.5px] font-mono font-bold text-blue-200/80 mt-0.5 truncate">
                      {user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")}
                    </span>
                  </div>

                  <ChevronDown size={12} className={`text-blue-200 transition-transform duration-200 ${officerMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Officer Digital Credentials & System Dossier Popover */}
                {officerMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setOfficerMenuOpen(false)}
                      aria-hidden="true"
                    />

                    <div className="absolute right-0 mt-2 w-80 sm:w-84 max-w-[calc(100vw-1.5rem)] rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 z-50 overflow-hidden animate-pop-in">
                      {/* Popover Header: Sovereign Navy + Golden Tricolor Ribbon */}
                      <div className="bg-[#1B365D] text-white p-4 relative overflow-hidden">
                        <div className="h-1 absolute top-0 left-0 right-0 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                        <div className="flex items-start gap-3 mt-1">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-white/80 shrink-0 shadow-md">
                            {user?.initials || (isController ? "SKV" : "RS")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-sm text-white truncate">
                              {user?.name || "Rajesh Sharma"}
                            </h4>
                            <p className="text-[11px] font-semibold text-amber-300 truncate">
                              {isController ? "Controller of Legal Metrology" : "Legal Metrology Officer (Inspector)"}
                            </p>
                            <p className="text-[10px] text-blue-200/80 font-mono mt-0.5 truncate">
                              Badge: {user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Officer Credentials Details */}
                      <div className="p-3.5 space-y-3 text-xs bg-white">
                        {/* Jurisdiction Circle */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#1B365D]" />
                            <span className="text-[11px] font-bold text-slate-600">
                              {language === "hi" ? "अधिकार क्षेत्र:" : "Jurisdiction:"}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[11px] text-[#1B365D]">
                            {activeCircle}
                          </span>
                        </div>

                        {/* Digital Signature Token Status */}
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
                          <div className="flex items-center gap-2">
                            <KeyRound size={14} className="text-emerald-700" />
                            <span className="text-[11px] font-bold text-emerald-950">
                              {language === "hi" ? "डिजिटल हस्ताक्षर (DSC):" : "DSC Token:"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            NIC Class-3 Active
                          </span>
                        </div>

                        {/* System Telemetry Mode (Mode A / Mode B) */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                              <Radio size={13} className="text-blue-600" />
                              <span>{language === "hi" ? "सिस्टम संचालन मोड:" : "System Mode:"}</span>
                            </div>
                            <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-100 text-[#1B365D]">
                              {currentMode === "ONLINE" ? "Mode A (Online)" : "Mode B (Resilient)"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => handleModeSwitch("ONLINE")}
                              className={`px-2 py-1.5 rounded text-[10.5px] font-bold text-center border transition-colors cursor-pointer ${
                                currentMode === "ONLINE"
                                  ? "bg-[#1B365D] text-white border-[#1B365D] shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Mode A Cloud
                            </button>
                            <button
                              type="button"
                              onClick={() => handleModeSwitch("LOCAL_RESILIENT")}
                              className={`px-2 py-1.5 rounded text-[10.5px] font-bold text-center border transition-colors cursor-pointer ${
                                currentMode === "LOCAL_RESILIENT"
                                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              Mode B Offline
                            </button>
                          </div>
                        </div>

                        {/* Quick Action Links */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <Link
                            to="/settings"
                            onClick={() => setOfficerMenuOpen(false)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B365D] hover:underline"
                          >
                            <Sliders size={13} />
                            <span>{language === "hi" ? "स्टेशन सेटिंग्स" : "Station Settings"}</span>
                          </Link>
                          {logout && (
                            <button
                              type="button"
                              onClick={() => {
                                setOfficerMenuOpen(false);
                                logout();
                                navigate("/login");
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                            >
                              <LogOut size={13} />
                              <span>{language === "hi" ? "साइन आउट" : "Sign Out"}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add New Jurisdiction Circle Modal */}
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
            <label htmlFor="new-circle-id" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
            <p className="mt-1 text-[10px] text-slate-500">
              {language === "hi"
                ? "केवल A-Z, 0-9 और अंडरस्कोर (उदा. CIRCLE_DL_WEST_05)।"
                : "A-Z, 0-9 and underscores only (e.g. CIRCLE_DL_WEST_05)."}
            </p>
          </div>

          <div>
            <label htmlFor="new-circle-label" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
            <label htmlFor="new-circle-label-hi" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
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
            <p role="alert" className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
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

export default Header;
