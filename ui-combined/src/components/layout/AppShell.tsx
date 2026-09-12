import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { GovTopBar } from "./GovTopBar";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { GovFooter } from "./GovFooter";
import { ApiService } from "../../services/api";
import { InspectionSummary, InspectionCase } from "../../types/inspection";
import { NewInspectionModal } from "../../features/new-inspection/NewInspectionModal";
import { CommandPalette } from "../common/CommandPalette";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useCircle } from "../../context/CircleContext";

interface AppShellProps {
  children: ReactNode;
  activeCircle?: string;
  onCircleChange?: (circleId: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { language } = useLanguage();
  const { activeCircle, setActiveCircle } = useCircle();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  // Global Ctrl+K / Cmd+K shortcut listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadCases = useCallback(async () => {
    try {
      const res = await ApiService.listInspections({ circleId: activeCircle });
      setCases(res.items);
    } catch (err) {
      console.error("Failed to load cases in AppShell:", err);
    }
  }, [activeCircle]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleCaseCreated = (newCase: InspectionCase) => {
    setIsNewModalOpen(false);
    setNotification(
      language === "hi"
        ? `प्रकरण ${newCase.inspection_number} सफलतापूर्वक ${activeCircle} में पंजीकृत किया गया।`
        : `Case ${newCase.inspection_number} registered successfully in ${activeCircle}.`
    );
    setTimeout(() => setNotification(null), 5000);
    loadCases();
    navigate(`/inspections/${newCase.id}`);
  };

  const pendingReviewCount = cases.filter(
    (c) => c.overall_status === "REVIEW" || c.overall_status === "UNABLE_TO_VERIFY" || c.workflow_status === "PENDING_REVIEW"
  ).length;

  return (
    <div className="min-h-screen bg-surfaceBg flex flex-col font-sans relative overflow-x-hidden">
      {/* WCAG 2.1 AA Accessible Skip Link */}
      <a href="#main-content" className="skip-link">
        {language === "hi" ? "मुख्य वैधानिक सामग्री पर जाएं" : "Skip to main statutory content"}
      </a>

      {/* Official GIGW 3.0 Government of India Top Utility Bar */}
      <GovTopBar />

      <Header
        activeCircle={activeCircle}
        onCircleChange={(c) => {
          setActiveCircle(c);
          loadCases();
        }}
        onRefresh={loadCases}
        onNewInspectionClick={() => setIsNewModalOpen(true)}
        onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      <div className="flex-1 flex w-full max-w-[1750px] mx-auto min-w-0">
        <Sidebar
          pendingCasesCount={pendingReviewCount}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onNewInspectionClick={() => setIsNewModalOpen(true)}
        />

        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto min-w-0 focus:outline-none"
        >
          {notification && (
            <div
              role="status"
              className="mb-4 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-fade-in"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {children}
        </main>
      </div>

      {/* Official GIGW 3.0 Government of India Portal Footer */}
      <GovFooter />

      <NewInspectionModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultCircleId={activeCircle}
        onSuccess={handleCaseCreated}
      />

      {/* Universal Command Search Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
