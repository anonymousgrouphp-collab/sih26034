import React from "react";
import { ConnectivityBadge } from "../common/ConnectivityBadge";
import { OfficerRole } from "../../types/inspection";

interface HeaderProps {
  activeCircle: string;
  onCircleChange: (circleId: string) => void;
  onRefresh?: () => void;
  officerRole?: OfficerRole;
  onOfficerRoleChange?: (role: OfficerRole) => void;
}

export const JURISDICTION_CIRCLES = [
  { id: "CIRCLE_DL_SOUTH_01", label: "DL-SOUTH-01 • South Delhi Circle (Saket / Kalkaji)" },
  { id: "CIRCLE_DL_CENTRAL_02", label: "DL-CENTRAL-02 • Central Delhi Circle (Connaught Place)" },
  { id: "CIRCLE_MH_MUM_01", label: "MH-MUM-01 • Mumbai Suburban Enforcement Circle" },
  { id: "CIRCLE_KA_BLR_01", label: "KA-BLR-01 • Bengaluru Urban Enforcement Depot" },
];

export const Header: React.FC<HeaderProps> = ({
  activeCircle,
  onCircleChange,
  onRefresh,
  officerRole = "INSPECTOR",
  onOfficerRoleChange,
}) => {
  const isController = officerRole === "CONTROLLER";

  return (
    <header className="bg-govNavy text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40 w-full">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 sm:py-2.5">
          {/* Brand & Ministry */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5 py-0.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-govNavy font-bold text-xs shadow-sm border border-amber-400 shrink-0">
              <span className="font-serif tracking-tighter text-xs sm:text-sm text-govNavy font-black leading-none">GOI</span>
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 leading-none">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-amber-400 whitespace-nowrap">
                  <span className="inline sm:hidden">GOI</span>
                  <span className="hidden sm:inline">Government of India</span>
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-[10px] sm:text-[11px] text-slate-300 font-medium whitespace-nowrap">
                  <span className="inline sm:hidden">DoCA</span>
                  <span className="hidden sm:inline">Department of Consumer Affairs</span>
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1 leading-tight min-w-0">
                <span className="whitespace-nowrap truncate">NyayaDrishti-LM</span>
                <span className="hidden sm:inline-block text-[10px] sm:text-xs font-mono font-normal px-2 py-0.5 rounded bg-govNavy-light border border-slate-600 text-slate-200 whitespace-nowrap">
                  LMPC Rules, 2011 Workstation
                </span>
              </h1>
            </div>
          </div>

          {/* Controls: Circle Selector, Connectivity, RBAC Role Toggle, Officer Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 xl:space-x-4">
            {/* Jurisdiction Circle Selector */}
            <div className="hidden md:flex items-center space-x-1.5 xl:space-x-2 bg-govNavy-dark/60 px-2 xl:px-3 py-1.5 rounded-md border border-slate-700">
              <label htmlFor="circle-select" className="text-xs text-slate-300 whitespace-nowrap font-medium">
                Circle:
              </label>
              <select
                id="circle-select"
                value={activeCircle}
                onChange={(e) => onCircleChange(e.target.value)}
                title={JURISDICTION_CIRCLES.find((c) => c.id === activeCircle)?.label || activeCircle}
                className="bg-transparent text-xs text-amber-200 font-medium focus:outline-none cursor-pointer pr-1 xl:pr-2 max-w-[150px] xl:max-w-[280px] truncate"
              >
                {JURISDICTION_CIRCLES.map((c) => (
                  <option key={c.id} value={c.id} title={c.label} className="bg-govNavy text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* RBAC Role Toggle */}
            {onOfficerRoleChange && (
              <div className="hidden sm:flex items-center bg-govNavy-dark/80 p-0.5 rounded-md border border-slate-700 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => onOfficerRoleChange("INSPECTOR")}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    !isController
                      ? "bg-amber-500 text-govNavy font-bold shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title="Switch to Legal Metrology Officer (Inspector) Role"
                >
                  Inspector
                </button>
                <button
                  type="button"
                  onClick={() => onOfficerRoleChange("CONTROLLER")}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                    isController
                      ? "bg-purple-600 text-white font-bold shadow-xs"
                      : "text-slate-300 hover:text-white"
                  }`}
                  title="Switch to Controller of Legal Metrology (Notice Issuing Authority) Role"
                >
                  Controller
                </button>
              </div>
            )}

            {/* Connectivity Badge */}
            <ConnectivityBadge onRefresh={onRefresh} />

            {/* Officer Profile Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-700 shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shadow-inner ${
                  isController
                    ? "bg-purple-900 text-purple-200 border-purple-400"
                    : "bg-govNavy-light text-amber-300 border-slate-500"
                }`}
                title={isController ? "S.K. Verma (Controller • CTRL-DL-0012)" : "Rajesh Sharma (Legal Metrology Officer • INSP-DL-0842)"}
              >
                {isController ? "SKV" : "RS"}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                  {isController ? "S.K. Verma" : "Rajesh Sharma"}
                  <span
                    className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                      isController
                        ? "bg-purple-500/20 text-purple-300 border-purple-400/40"
                        : "bg-amber-400/20 text-amber-300 border-amber-400/30"
                    }`}
                  >
                    {isController ? "CONTROLLER" : "LMO / INSP"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 whitespace-nowrap">
                  {isController ? "CTRL-DL-0012" : "INSP-DL-0842"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
