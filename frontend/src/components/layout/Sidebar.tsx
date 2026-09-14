import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { StateEmblem } from "../common/StateEmblem";
import { resetScrollToTop } from "../common/ScrollToTop";
import { m } from "framer-motion";

interface SidebarProps {
  pendingCasesCount?: number;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingCasesCount = 0,
  mobileOpen = false,
  onCloseMobile,
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

  // Semantic GovTech Functional Grouping
  const navGroups = [
    {
      title: language === "hi" ? "प्रवर्तन कार्यस्थान" : "Enforcement Desk",
      items: [
        {
          label: t("nav.dashboard", "Executive Dashboard"),
          path: "/dashboard",
          icon: Home,
        },
        {
          label: t("nav.register", "Inspection Register"),
          path: "/inspections",
          icon: SearchCheck,
        },
        {
          label: t("nav.review", "Review Queue"),
          path: "/review-queue",
          icon: Users,
          badge: pendingCasesCount > 0 ? pendingCasesCount : undefined,
          badgeType: "warning",
        },
      ],
    },
    {
      title: language === "hi" ? "सत्यापन एवं साक्ष्य" : "Verification & Evidence",
      items: [
        {
          label: language === "hi" ? "डेमो परिदृश्य" : "Demo Scenarios",
          path: "/inspections/SKU-DEMO-01",
          icon: Scale,
          badge: "7",
          badgeType: "info",
        },
        {
          label: t("nav.evidence", "Evidence Dossier"),
          path: `/inspections/${lastCaseId}/evidence`,
          icon: FileArchive,
        },
        {
          label: t("nav.reports", "Reports & Notices"),
          path: "/reports",
          icon: BarChart3,
        },
      ],
    },
    {
      title: language === "hi" ? "विधिक मानक एवं विन्यास" : "Regulatory & Settings",
      items: [
        {
          label: t("nav.rules", "Rules & Schedules"),
          path: "/rules",
          icon: GitBranch,
        },
        {
          label: t("nav.settings", "Station Settings"),
          path: "/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <m.aside
        initial={false}
        animate={{ width: isCollapsed ? 68 : 256 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        className={`fixed inset-y-0 left-0 z-[60] flex shrink-0 flex-col border-r border-slate-200 bg-white text-slate-700 transition-transform lg:sticky lg:inset-y-auto lg:top-[57px] lg:h-[calc(100vh-3.6rem)] lg:z-30 shadow-xs select-none ${
          mobileOpen ? "translate-x-0 shadow-2xl w-64" : "-translate-x-full lg:translate-x-0 lg:shadow-none"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 lg:hidden bg-slate-50">
          <div className="flex items-center gap-2.5">
            <StateEmblem size={22} tone="navy" showMotto={true} className="shrink-0" />
            <span className="font-bold text-sm tracking-tight text-[#1B365D]">NIRIKSHAK</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Desktop Header / Collapse Bar */}
        <div className="hidden lg:flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0 animate-pulse" />
              <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500 truncate">
                {language === "hi" ? "विधिक कार्यस्थान" : "LMO Workstation"}
              </span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0 animate-pulse" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Top Primary Action + Grouped Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {/* Primary Action Button */}
          <Link
            to="/inspections/new"
            onClick={() => {
              onCloseMobile?.();
              resetScrollToTop();
            }}
            title={isCollapsed ? t("action.new_case", "New Inspection Case") : undefined}
            className={`w-full flex items-center justify-center gap-2 py-2.5 bg-[#1B365D] hover:bg-[#0A2540] text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all border border-[#152a48] group overflow-hidden ${
              isCollapsed ? "px-0" : "px-3.5"
            }`}
          >
            <div className="w-5 h-5 rounded bg-[#FF9933] text-slate-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Plus size={13} className="stroke-[3]" />
            </div>
            {!isCollapsed && (
              <span className="truncate tracking-wide">
                {t("action.new_case", "New Inspection Case")}
              </span>
            )}
          </Link>

          {/* Grouped Navigation Links */}
          <nav className="space-y-4">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!isCollapsed ? (
                  <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {group.title}
                  </p>
                ) : (
                  <div className="h-px bg-slate-100 my-2 mx-1" />
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={`group relative w-full flex items-center justify-between py-2.5 text-sm font-semibold rounded-lg transition-all overflow-hidden ${
                        active
                          ? "bg-[#1B365D]/8 text-[#1B365D] font-bold border-l-[3.5px] border-[#1B365D] rounded-l-none pl-2.5"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border-l-[3.5px] border-transparent pl-2.5"
                      } ${isCollapsed ? "px-0 justify-center border-l-0" : "pr-3"}`}
                    >
                      <div className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : ""}`}>
                        <Icon
                          size={18}
                          className={`shrink-0 transition-colors ${
                            active
                              ? "text-[#1B365D]"
                              : "text-slate-400 group-hover:text-slate-600"
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 text-[11px] font-mono font-bold rounded-md shrink-0 border ${
                            item.badgeType === "warning"
                              ? "bg-amber-50 text-amber-900 border-amber-300"
                              : "bg-blue-50 text-[#1B365D] border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Officer Credential & Statutory Regulatory Card */}
        <div className="shrink-0 mt-auto p-3 border-t border-slate-200 bg-slate-50/70">
          {!isCollapsed ? (
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs space-y-2">
              {/* Officer Identification Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 shadow-2xs ${
                      isController ? "bg-purple-700 text-white" : "bg-[#1B365D] text-white"
                    }`}
                  >
                    {user?.initials || (isController ? "SKV" : "RS")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate leading-tight">
                      {user?.name || (isController ? "S.K. Verma" : "Rajesh Sharma")}
                    </p>
                    <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                      {user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  title={t("portal.signout", "Sign out")}
                  aria-label={t("portal.signout", "Sign out")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut size={15} />
                </button>
              </div>

              {/* Integrated Statutory Regulatory Seal */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <ShieldCheck size={12} className="text-[#1B365D]" />
                  <span>LMPC 2011</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-emerald-700">
                  Sec 63 BSA 2023
                </span>
              </div>
            </div>
          ) : (
            /* Collapsed view: compact avatar and logout button */
            <div className="flex flex-col items-center gap-2 py-1">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-2xs ${
                  isController ? "bg-purple-700 text-white" : "bg-[#1B365D] text-white"
                }`}
                title={`${user?.name || (isController ? "S.K. Verma" : "Rajesh Sharma")} (${user?.badgeNumber || (isController ? "CTRL-DL-0012" : "INSP-DL-0842")})`}
              >
                {user?.initials || (isController ? "SKV" : "RS")}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title={t("portal.signout", "Sign out")}
                aria-label={t("portal.signout", "Sign out")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </div>
      </m.aside>
    </>
  );
};
