import React from "react";

export type SidebarTab = "DESK" | "AUDIT" | "SCHEDULES";

interface SidebarProps {
  currentTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onNewInspectionClick: () => void;
  pendingCasesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  onNewInspectionClick,
  pendingCasesCount = 0,
}) => {
  return (
    <aside className="w-64 bg-panelBg border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm hidden md:flex">
      {/* Top Action & Navigation */}
      <div className="p-4 space-y-4">
        {/* Primary CTA: New Case Registration */}
        <button
          type="button"
          onClick={onNewInspectionClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-govNavy hover:bg-govNavy-light text-white text-sm font-semibold rounded-md shadow transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Inspection Case
        </button>

        {/* Navigation items */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => onTabChange("DESK")}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "DESK"
                ? "bg-amber-50 text-govNavy font-bold border-l-4 border-govNavy pl-2"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Inspection Desk</span>
            </div>
            {pendingCasesCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-200 text-amber-900">
                {pendingCasesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange("AUDIT")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "AUDIT"
                ? "bg-amber-50 text-govNavy font-bold border-l-4 border-govNavy pl-2"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Section 63 BSA Audit</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("SCHEDULES")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              currentTab === "SCHEDULES"
                ? "bg-amber-50 text-govNavy font-bold border-l-4 border-govNavy pl-2"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>LMPC Statutory Schedules</span>
          </button>
        </nav>
      </div>

      {/* Bottom Information Card */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-[11px] font-mono space-y-1.5 text-slate-600">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Statute:</span>
            <span className="text-govNavy font-medium">LMPC Rules 2011</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Evidence Act:</span>
            <span className="text-emerald-700 font-bold">Sec 63 BSA 2023</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Fiducial:</span>
            <span>ArUco / ISO 7810</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">OCR Engine:</span>
            <span>PP-OCRv4 / v3 (Hi)</span>
          </div>
          <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
            NyayaDrishti-LM • v1.0.0-sih26034
          </div>
        </div>
      </div>
    </aside>
  );
};
