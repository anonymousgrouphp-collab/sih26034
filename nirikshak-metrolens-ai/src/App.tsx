import {useState} from "react";
import {BrowserRouter,Navigate,Route,Routes} from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import {AuthProvider,useAuth} from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import Inspections from "./pages/Inspections";
import InspectionDetails from "./pages/InspectionDetails";
import EvidenceDossier from "./pages/EvidenceDossier";
import Rules from "./pages/Rules";
import ReviewQueue from "./pages/ReviewQueue";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function Workstation(){
  const [sidebarCollapsed,setSidebarCollapsed]=useState(false);
  return <AppShell collapsed={sidebarCollapsed} onToggleSidebar={()=>setSidebarCollapsed(v=>!v)}>
    <Routes>
      <Route path="/dashboard" element={<Dashboard/>}/>
      <Route path="/inspections/new" element={<NewInspection/>}/>
      <Route path="/inspections" element={<Inspections/>}/>
      <Route path="/inspections/:id" element={<InspectionDetails/>}/>
      <Route path="/inspections/:id/evidence" element={<EvidenceDossier/>}/>
      <Route path="/review-queue" element={<ReviewQueue/>}/>
      <Route path="/rules" element={<Rules/>}/>
      <Route path="/reports" element={<Reports/>}/>
      <Route path="/settings" element={<Settings/>}/>
      <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
    </Routes>
  </AppShell>
}

function ProtectedWorkstation(){
  const {user}=useAuth();
  if(!user) return <Navigate to="/login" replace/>;
  return <Workstation/>;
}

export default function App(){
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Landing/>}/>
    <Route path="/login" element={<Login/>}/>
    <Route path="/*" element={<ProtectedWorkstation/>}/>
  </Routes></AuthProvider></BrowserRouter>
}
