import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardCheck,
  SearchCheck,
  Users,
  GitBranch,
  FileArchive,
  BarChart3,
  Settings,
  Plus,
  ShieldCheck,
  Scale,
  X,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { StateEmblem } from "../common/StateEmblem";
import { m, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SidebarProps {
  pendingCasesCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNewInspectionClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingCasesCount = 0,
  mobileOpen = false,
  onCloseMobile,
  onNewInspectionClick,
}) => {
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const location = useLocation();

  const isController = user?.officerRole === "CONTROLLER";

  const handleSignOut = () => {
    onCloseMobile?.();
    logout();
    navigate("/login");
  };

  const isItemActive = (path: string): boolean => {
    const current = location.pathname;
    if (path === "/dashboard") {
      return current === "/dashboard";
    }
    if (path === "/inspections/new") {
      return current === "/inspections/new";
    }
    if (path.includes("/evidence")) {
      return current.includes("/evidence");
    }
    if (path === "/inspections/SKU-DEMO-01") {
      return (
        current.startsWith("/inspections/SKU-DEMO") ||
        current === "/inspections/demo-fortune-sunlite"
      );
    }
    if (path === "/inspections") {
      return (
        current === "/inspections" ||
        (current.startsWith("/inspections/") &&
          current !== "/inspections/new" &&
          !current.includes("/evidence") &&
          !current.startsWith("/inspections/SKU-DEMO") &&
          current !== "/inspections/demo-fortune-sunlite")
      );
    }
    if (path === "/settings") {
      return current === "/settings";
    }
    return current === path || current.startsWith(path + "/");
  };

  const currentCaseMatch = location.pathname.match(/^\/inspections\/([^/]+)/);
  const currentRouteCaseId = currentCaseMatch && currentCaseMatch[1] !== "new" ? currentCaseMatch[1] : null;
  const lastCaseId =
    currentRouteCaseId ||
    (typeof window !== "undefined"
      ? window.localStorage?.getItem("Nirikshak_last_case_id") || "demo-fortune-sunlite"
      : "demo-fortune-sunlite");

  const navigation = [
    { label: t("nav.dashboard", "Executive Dashboard"), path: "/dashboard", icon: Home },
    { label: t("nav.register", "Inspection Register"), path: "/inspections", icon: SearchCheck },
    {
      label: language === "hi" ? "डेमो परिदृश्य (7)" : "Demo Scenarios (7)",
      path: "/inspections/SKU-DEMO-01",
      icon: Scale,
      badge: "7 DEMOS",
    },
    { label: t("nav.new", "New Inspection"), path: "/inspections/new", icon: ClipboardCheck },
    {
      label: t("nav.review", "Review Queue"),
      path: "/review-queue",
      icon: Users,
      badge: pendingCasesCount > 0 ? pendingCasesCount : undefined,
    },
    { label: t("nav.rules", "Rules & Schedules"), path: "/rules", icon: GitBranch },
    { label: t("nav.evidence", "Evidence Dossier"), path: `/inspections/${lastCaseId}/evidence`, icon: FileArchive },
    { label: t("nav.reports", "Reports & Notices"), path: "/reports", icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <m.aside
        initial={false}
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-white/10 glass-panel text-slate-300 transition-transform lg:sticky lg:inset-y-auto lg:top-[70px] lg:h-[calc(100vh-8.25rem)] ${
          mobileOpen ? "translate-x-0 shadow-2xl w-64" : "-translate-x-full lg:translate-x-0 lg:shadow-none"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4 lg:hidden">
          <div className="flex items-center gap-2.5">
            <StateEmblem size={22} tone="white" showMotto={true} className="shrink-0" />
            <span className="font-bold text-sm tracking-tight text-white">NIRIKSHAK</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex items-center justify-end p-2 border-b border-white/10">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Top Primary Action + Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <Link
            to="/inspections/new"
            onClick={onCloseMobile}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-amber-500/20 transition-all focus:ring-2 focus:ring-amber-500 focus:outline-none overflow-hidden ${isCollapsed ? 'px-0' : 'px-4'}`}
          >
            <Plus size={isCollapsed ? 20 : 16} className="shrink-0" />
            {!isCollapsed && <span className="truncate">{t("action.new_case", "New Inspection")}</span>}
          </Link>

          {!isCollapsed && (
            <p className="px-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {language === "hi" ? "नेविगेशन मेनू" : "Navigation Menu"}
            </p>
          )}

          <nav className="space-y-1 relative">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  title={isCollapsed ? item.label : undefined}
                  className={`relative w-full flex items-center justify-between py-2.5 text-xs font-semibold rounded-lg transition-colors overflow-hidden ${
                    active
                      ? "text-white font-bold bg-white/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  } ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}
                >
                  {active && (
                    <m.div
                      layoutId="nav-indicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#e5a93c]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <Icon size={18} className={`shrink-0 ${active ? "text-amber-400" : "text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="shrink-0 mt-auto p-3 space-y-3 border-t border-white/10 bg-black/20">
          <Link
            to="/settings"
            onClick={onCloseMobile}
            title={isCollapsed ? t("nav.settings", "Station Settings") : undefined}
            className={`w-full flex items-center gap-3 py-2 text-xs font-semibold rounded-lg transition-colors overflow-hidden ${
              isItemActive("/settings")
                ? "text-white font-bold bg-white/10"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            } ${isCollapsed ? 'px-0 justify-center' : 'px-3'}`}
          >
            {isItemActive("/settings") && (
              <m.div
                layoutId="nav-indicator"
                className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#e5a93c]"
                transition={{ duration: 0.2 }}
              />
            )}
            <Settings size={18} className={`shrink-0 ${isItemActive("/settings") ? "text-amber-400" : "text-slate-500"}`} />
            {!isCollapsed && <span className="truncate">{t("nav.settings", "Station Settings")}</span>}
          </Link>

          {!isCollapsed && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-amber-400">
                <ShieldCheck size={13} className="text-amber-500" />
                <span className="truncate">{language === "hi" ? "विधिक मापविज्ञान अधिनियम, 2009" : "Legal Metrology Act"}</span>
              </div>
            </div>
          )}

          {!isCollapsed && (
            <div className="p-3 border border-white/10 bg-white/5 rounded-lg text-[10.5px] font-mono space-y-1 text-slate-400">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{language === "hi" ? "सांविधिक नियम:" : "Statute:"}</span>
                <span className="text-white font-medium">LMPC 2011</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">{language === "hi" ? "साक्ष्य अधिनियम:" : "Evidence Act:"}</span>
                <span className="text-emerald-400 font-bold">Sec 63 BSA</span>
              </div>
            </div>
          )}

          <div
            className={`flex items-center gap-2.5 rounded-lg border bg-white/5 transition-all overflow-hidden ${
              isController ? "border-purple-500/30" : "border-amber-500/30"
            } ${isCollapsed ? 'p-1.5 justify-center' : 'p-2.5'}`}
            title={`Active Officer: ${user?.name || (isController ? "S.K. Verma" : "Rajesh Sharma")}`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                isController ? "bg-purple-600 text-white" : "bg-amber-500 text-govNavy"
              }`}
            >
              {user?.initials || (isController ? "SKV" : "RS")}
            </div>
            {!isCollapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] font-bold text-white truncate">
                      {user?.name || (isController ? "S.K. Verma" : "R. Sharma")}
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 truncate">
                    {user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </m.aside>
    </>
  );
};

