import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from "react";

export type UserRole = "inspector" | "senior-officer" | "administrator" | "auditor";

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  initials: string;
}

const roleMeta: Record<UserRole, {label:string; designation:string; landing:string; description:string}> = {
  inspector: {
    label: "Legal Metrology Inspector",
    designation: "Field Inspection Officer",
    landing: "/dashboard",
    description: "Conduct inspections, review evidence, run checks and prepare dossiers."
  },
  "senior-officer": {
    label: "Senior Officer",
    designation: "Review & Supervisory Officer",
    landing: "/review-queue",
    description: "Supervise flagged cases, resolve conflicts and approve officer assessments."
  },
  administrator: {
    label: "System Administrator",
    designation: "Platform Administrator",
    landing: "/settings",
    description: "Manage platform configuration, access controls and operational settings."
  },
  auditor: {
    label: "Audit Officer",
    designation: "Compliance & Audit Officer",
    landing: "/reports",
    description: "Inspect audit trails, evidence dossiers, reports and compliance trends."
  }
};

const demoUsers: Record<UserRole, SessionUser> = {
  inspector: {name:"Amit Singh", email:"inspector@metrolens.gov.in", role:"inspector", department:"Legal Metrology Department", designation:roleMeta.inspector.designation, initials:"AS"},
  "senior-officer": {name:"Priya Sharma", email:"senior.officer@metrolens.gov.in", role:"senior-officer", department:"Legal Metrology Department", designation:roleMeta["senior-officer"].designation, initials:"PS"},
  administrator: {name:"Rohan Verma", email:"admin@metrolens.gov.in", role:"administrator", department:"NIRIKSHAK Administration", designation:roleMeta.administrator.designation, initials:"RV"},
  auditor: {name:"Neha Gupta", email:"audit@metrolens.gov.in", role:"auditor", department:"Legal Metrology Audit Cell", designation:roleMeta.auditor.designation, initials:"NG"}
};

interface AuthContextValue {
  user: SessionUser | null;
  login: (role: UserRole, email: string, password: string) => {ok:boolean; message?:string};
  logout: () => void;
  roleMeta: typeof roleMeta;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}:{children:ReactNode}) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try { return JSON.parse(localStorage.getItem("nirikshak_session") || "null"); } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem("nirikshak_session", JSON.stringify(user));
    else localStorage.removeItem("nirikshak_session");
  }, [user]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    roleMeta,
    login: (role, email, password) => {
      if (!email || !password) return {ok:false, message:"Enter the User ID and password."};
      const expected = demoUsers[role];
      if (email.trim().toLowerCase() !== expected.email || password !== "Demo@123") {
        return {ok:false, message:`For the demo, use ${expected.email} with password Demo@123.`};
      }
      setUser(expected);
      return {ok:true};
    },
    logout: () => setUser(null)
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
