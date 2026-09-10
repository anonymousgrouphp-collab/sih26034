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
    <header className="bg-govNavy text-white border-b-2 border-amber-500 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Ministry */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-govNavy font-bold text-xs shadow-sm border border-amber-400">
              <span className="font-serif tracking-tighter text-sm text-govNavy font-black">GOI</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                  Government of India
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  Department of Consumer Affairs
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
                NyayaDrishti-LM
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-govNavy-light border border-slate-600 text-slate-200">
                  LMPC Rules, 2011 Workstation
                </span>
              </h1>
            </div>
          </div>

          {/* Controls: Circle Selector, Connectivity, RBAC Role Toggle, Officer Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Jurisdiction Circle Selector */}
            <div className="hidden md:flex items-center space-x-2 bg-govNavy-dark/60 px-3 py-1.5 rounded-md border border-slate-700">
              <label htmlFor="circle-select" className="text-xs text-slate-300 whitespace-nowrap font-medium">
                Circle:
              </label>
              <select
                id="circle-select"
                value={activeCircle}
                onChange={(e) => onCircleChange(e.target.value)}
                className="bg-transparent text-xs text-amber-200 font-medium focus:outline-none cursor-pointer pr-2"
              >
                {JURISDICTION_CIRCLES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-govNavy text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* RBAC Role Toggle */}
            {onOfficerRoleChange && (
              <div className="hidden sm:flex items-center bg-govNavy-dark/80 p-0.5 rounded-md border border-slate-700 text-xs">
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
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-700">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shadow-inner ${
                  isController
                    ? "bg-purple-900 text-purple-200 border-purple-400"
                    : "bg-govNavy-light text-amber-300 border-slate-500"
                }`}
              >
                {isController ? "SKV" : "RS"}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
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
                <div className="text-[11px] font-mono text-slate-300">
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
