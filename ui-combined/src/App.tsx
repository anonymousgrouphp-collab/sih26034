import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CircleProvider } from "./context/CircleContext";
import { AppShell } from "./components/layout/AppShell";

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

// Protected Workstation Route Wrapper
const ProtectedWorkstation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <CircleProvider>
            <Routes>
          {/* Public Portal & Login */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

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

          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />

          {/* Fallback 404 Not Found Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </CircleProvider>
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);
};

export default App;
