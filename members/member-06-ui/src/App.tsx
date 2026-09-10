import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/layout/Header";
import { Sidebar, SidebarTab } from "./components/layout/Sidebar";
import { InspectionDesk } from "./features/desk/InspectionDesk";
import { NewInspectionModal } from "./features/new-inspection/NewInspectionModal";
import { CaseWorkspace } from "./features/case/CaseWorkspace";
import { ApiService } from "./services/api";
import {
  InspectionSummary,
  InspectionCase,
  OfficerRole,
} from "./types/inspection";

export const App: React.FC = () => {
  const [activeCircle, setActiveCircle] = useState("CIRCLE_DL_SOUTH_01");
  const [currentTab, setCurrentTab] = useState<SidebarTab>("DESK");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<InspectionCase | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [officerRole, setOfficerRole] = useState<OfficerRole>("INSPECTOR");

  // Load inspection cases for current jurisdiction
  const loadCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.listInspections({
        circleId: activeCircle,
      });
      setCases(res.items);
    } catch (err) {
      console.error("Failed to load inspections:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCircle]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  // Handle selecting a case
  const handleSelectCase = async (caseId: string) => {
    try {
      const fullCase = await ApiService.getInspection(caseId);
      setSelectedCase(fullCase);
    } catch (err) {
      console.error("Failed to fetch inspection details:", err);
    }
  };

  // Handle new case registration success
  const handleCaseCreated = (newCase: InspectionCase) => {
    setIsNewModalOpen(false);
    setNotification(`Case ${newCase.inspection_number} successfully registered in ${activeCircle}.`);
    setTimeout(() => setNotification(null), 5000);
    loadCases();
    setSelectedCase(newCase);
  };

  // Render view depending on tab / selection
  const renderMainContent = () => {
    if (selectedCase) {
      return (
        <CaseWorkspace
          caseData={selectedCase}
          onBack={() => setSelectedCase(null)}
          onCaseUpdated={(updated) => {
            setSelectedCase(updated);
            loadCases();
          }}
          officerRole={officerRole}
        />
      );
    }

    switch (currentTab) {
      case "AUDIT":
        return (
          <div className="bg-panelBg p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-govNavy">
                Section 63 Bharatiya Sakshya Adhiniyam, 2023 Evidence Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Backend Merkle DAG Chain-of-Custody verification for statutory enforcement notices.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                Electronic Evidence Custody Status: VERIFIED & AUDITABLE
              </div>
              <p>
                All digital images, ArUco metric scaling factors, and OCR tokens have backend SHA-256 digests associated with pipeline evidence artifacts before human adjudication.
              </p>
              <div className="font-mono text-[11px] bg-white/70 p-2.5 rounded border border-emerald-300 text-emerald-900">
                Statutory Reference: Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)
                <br />
                Repealed Act Status: Section 65B Indian Evidence Act, 1872 strictly prohibited
              </div>
            </div>
          </div>
        );

      case "SCHEDULES":
        return (
          <div className="bg-panelBg p-6 rounded-lg border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-govNavy">
                Legal Metrology (Packaged Commodities) Rules, 2011 — Statutory Schedules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official statutory reference schedules enforced by the NyayaDrishti-LM Rule Engine.
              </p>
            </div>

            {/* Table I Font Schedule */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-govNavy">
                Table-I: Minimum Height of Numerals & Letters (Rule 6(1)(h) / G.S.R. 629(E))
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-md">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-[11px] font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Row</th>
                      <th className="px-4 py-2 text-left">Principal Display Panel (PDP) Area (A)</th>
                      <th className="px-4 py-2 text-left">Minimum Font Height (Normal Case)</th>
                      <th className="px-4 py-2 text-left">Blown / Formed Packaging</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="px-4 py-2 font-mono">1</td>
                      <td className="px-4 py-2">A ≤ 50 cm²</td>
                      <td className="px-4 py-2 font-bold text-govNavy">1.0 mm</td>
                      <td className="px-4 py-2 font-mono text-slate-600">1.5 mm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono">2</td>
                      <td className="px-4 py-2">50 cm² &lt; A ≤ 100 cm²</td>
                      <td className="px-4 py-2 font-bold text-govNavy">1.5 mm</td>
                      <td className="px-4 py-2 font-mono text-slate-600">3.0 mm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono">3</td>
                      <td className="px-4 py-2">100 cm² &lt; A ≤ 500 cm²</td>
                      <td className="px-4 py-2 font-bold text-govNavy">2.5 mm</td>
                      <td className="px-4 py-2 font-mono text-slate-600">4.0 mm</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-mono">4</td>
                      <td className="px-4 py-2">500 cm² &lt; A ≤ 2500 cm²</td>
                      <td className="px-4 py-2 font-bold text-govNavy">4.0 mm</td>
                      <td className="px-4 py-2 font-mono text-slate-600">6.0 mm</td>
                    </tr>
                    <tr className="bg-amber-50/50">
                      <td className="px-4 py-2 font-mono font-bold">5</td>
                      <td className="px-4 py-2 font-semibold">A &gt; 2500 cm² (ADL-01 Baseline)</td>
                      <td className="px-4 py-2 font-bold text-rose-700">6.0 mm (Never 8.0 mm)</td>
                      <td className="px-4 py-2 font-mono text-slate-600">6.0 mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case "DESK":
      default:
        return (
          <InspectionDesk
            cases={cases}
            activeCircle={activeCircle}
            onSelectCase={handleSelectCase}
            onNewInspectionClick={() => setIsNewModalOpen(true)}
            isLoading={isLoading}
            onRefresh={loadCases}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surfaceBg flex flex-col font-sans">
      {/* Official Top Bar */}
      <Header
        activeCircle={activeCircle}
        onCircleChange={(c) => {
          setActiveCircle(c);
          setSelectedCase(null);
        }}
        onRefresh={loadCases}
        officerRole={officerRole}
        onOfficerRoleChange={setOfficerRole}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setSelectedCase(null);
          }}
          onNewInspectionClick={() => setIsNewModalOpen(true)}
          pendingCasesCount={cases.filter((c) => c.workflow_status === "PENDING_REVIEW").length}
        />

        {/* Dynamic Center Work Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {notification && (
            <div
              role="status"
              className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-md text-xs text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{notification}</span>
              </div>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {renderMainContent()}
        </main>
      </div>

      {/* Registration Modal */}
      <NewInspectionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultCircleId={activeCircle}
        onSuccess={handleCaseCreated}
      />
    </div>
  );
};

export default App;
