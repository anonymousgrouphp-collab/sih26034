import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

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
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const location = useLocation();

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
    if (path === "/inspections") {
      return (
        current === "/inspections" ||
        (current.startsWith("/inspections/") &&
          current !== "/inspections/new" &&
          !current.includes("/evidence"))
      );
    }
    if (path === "/settings") {
      return current === "/settings";
    }
    return current === path || current.startsWith(path + "/");
  };

  const navigation = [
    { label: t("nav.dashboard", "Executive Dashboard"), path: "/dashboard", icon: Home },
    { label: t("nav.register", "Inspection Register"), path: "/inspections", icon: SearchCheck },
    { label: t("nav.new", "New Inspection"), path: "/inspections/new", icon: ClipboardCheck },
    {
      label: t("nav.review", "Review Queue"),
      path: "/review-queue",
      icon: Users,
      badge: pendingCasesCount > 0 ? pendingCasesCount : undefined,
    },
    { label: t("nav.rules", "Rules & Schedules"), path: "/rules", icon: GitBranch },
    { label: t("nav.evidence", "Evidence Dossier"), path: "/inspections/demo-fortune-sunlite/evidence", icon: FileArchive },
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

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:w-64 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 lg:hidden bg-govNavy text-white">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-amber-400" />
            <span className="font-bold text-sm">NyayaDrishti-LM</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-300 hover:bg-govNavy-light hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Primary Action */}
        <div className="p-4 space-y-3">
          <Link
            to="/inspections/new"
            onClick={onCloseMobile}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-govNavy hover:bg-govNavy-light text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <Plus size={16} />
            <span>{t("action.new_case", "New Inspection Case")}</span>
          </Link>

          <p className="px-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "नेविगेशन मेनू" : "Navigation Menu"}
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    active
                      ? "bg-amber-50 text-govNavy font-bold border-l-4 border-govNavy pl-2 shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={active ? "text-govNavy" : "text-slate-500"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-200 text-amber-900">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Station Settings & Legal Invariants Card */}
        <div className="mt-auto p-3 space-y-3 border-t border-slate-200 bg-slate-50/50">
          <Link
            to="/settings"
            onClick={onCloseMobile}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isItemActive("/settings")
                ? "bg-amber-50 text-govNavy font-bold border-l-4 border-govNavy pl-2"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Settings size={16} className={isItemActive("/settings") ? "text-govNavy" : "text-slate-500"} />
            <span>{t("nav.settings", "Station Settings")}</span>
          </Link>

          <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-amber-800">
              <ShieldCheck size={13} className="text-amber-600" />
              <span>{language === "hi" ? "विधिक मापविज्ञान अधिनियम, 2009" : "Legal Metrology Act, 2009"}</span>
            </div>
            <p className="text-[10px] text-amber-800/90 leading-relaxed font-sans">
              {language === "hi"
                ? "धारा 63 भारतीय साक्ष्य अधिनियम, 2023 के तहत डिजिटल साक्ष्य प्रमाणन।"
                : "Section 63 BSA 2023 evidence certification active."}
            </p>
          </div>

          <div className="p-3 border border-slate-200 bg-white rounded-lg shadow-2xs text-[10.5px] font-mono space-y-1 text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{language === "hi" ? "सांविधिक नियम:" : "Statute:"}</span>
              <span className="text-govNavy font-medium">LMPC 2011</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{language === "hi" ? "साक्ष्य अधिनियम:" : "Evidence Act:"}</span>
              <span className="text-emerald-700 font-bold">Sec 63 BSA 2023</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{language === "hi" ? "संदर्भ मार्कर:" : "Fiducial:"}</span>
              <span>ArUco / ISO 7810</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">{language === "hi" ? "तालिका-I पंक्ति 5:" : "Table-I Row 5:"}</span>
              <span className="text-amber-700 font-bold">6.0 mm (ADL-01)</span>
            </div>
            <div className="pt-1.5 border-t border-slate-100 text-center text-[9.5px] text-slate-400">
              NyayaDrishti-LM • v1.0.0-sih26034
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
