import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CircleProvider } from "./context/CircleContext";
import { AppShell } from "./components/layout/AppShell";
import { AnimatedPage } from "./components/common/motion";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inspections from "./pages/Inspections";
import NewInspection from "./pages/NewInspection";
import InspectionDetails from "./pages/InspectionDetails";
import EvidenceDossier from "./pages/EvidenceDossier";
import ReviewQueue from "./pages/ReviewQueue";
import Rules from "./pages/Rules";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import StatutoryDocumentPage from "./pages/statutory/StatutoryDocumentPage";
import { LEGAL_DOCS, docBasePath } from "./pages/statutory/legalDocRegistry";

// Protected Workstation Route Wrapper
const ProtectedWorkstation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return (
    <AppShell>
      <AnimatedPage>{children}</AnimatedPage>
    </AppShell>
  );
};

// Route transitions: the keyed Routes keeps the outgoing page mounted just
// long enough for its exit variant to play (AnimatePresence mode="wait").
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
          {/* Public Portal & Login */}
          <Route path="/" element={<AnimatedPage><Landing /></AnimatedPage>} />
          <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />

          {/* GIGW 3.0 Governed Document Pages — Statutory Enactments, Policies & Standards */}
          {LEGAL_DOCS.map((doc) => (
            <Route
              key={doc.slug}
              path={`${docBasePath(doc.category)}/${doc.slug}`}
              element={<AnimatedPage><StatutoryDocumentPage slug={doc.slug} /></AnimatedPage>}
            />
          ))}

          {/* Authenticated Inspection Workstation */}
          <Route
            path="/dashboard"
            element={
              <ProtectedWorkstation>
                <Dashboard />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/inspections"
            element={
              <ProtectedWorkstation>
                <Inspections />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/inspections/new"
            element={
              <ProtectedWorkstation>
                <NewInspection />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/inspections/:id"
            element={
              <ProtectedWorkstation>
                <InspectionDetails />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/inspections/:id/evidence"
            element={
              <ProtectedWorkstation>
                <EvidenceDossier />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/review-queue"
            element={
              <ProtectedWorkstation>
                <ReviewQueue />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/rules"
            element={
              <ProtectedWorkstation>
                <Rules />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedWorkstation>
                <Reports />
              </ProtectedWorkstation>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedWorkstation>
                <Settings />
              </ProtectedWorkstation>
            }
          />

          <Route path="/unauthorized" element={<AnimatedPage><Unauthorized /></AnimatedPage>} />
          <Route path="/404" element={<AnimatedPage><NotFound /></AnimatedPage>} />

          {/* Fallback 404 Not Found Page */}
          <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CircleProvider>
            <AnimatedRoutes />
          </CircleProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
};

export default App;
