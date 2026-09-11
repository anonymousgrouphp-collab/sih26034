import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { OfficerRole } from "../types/inspection";

export type UserRole = "inspector" | "controller" | "administrator" | "auditor";

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
  officerRole: OfficerRole;
  department: string;
  designation: string;
  initials: string;
  badgeNumber: string;
}

export const roleMeta: Record<UserRole, { label: string; designation: string; landing: string; description: string; badge: string }> = {
  inspector: {
    label: "Legal Metrology Officer (Inspector)",
    designation: "Field Enforcement Officer",
    landing: "/dashboard",
    description: "Conduct physical packaging inspections, verify optical quality gates, and record evidence.",
    badge: "INSP-DL-0842",
  },
  controller: {
    label: "Controller of Legal Metrology",
    designation: "Notice Issuing Authority / District Controller",
    landing: "/review-queue",
    description: "Adjudicate borderline findings, issue Form-1 legal compounding notices, and review Section 63 certificates.",
    badge: "CTRL-DL-0012",
  },
  administrator: {
    label: "System Administrator",
    designation: "Platform Administrator",
    landing: "/settings",
    description: "Manage jurisdiction circles, sensor calibration thresholds, and workstation telemetry.",
    badge: "ADMIN-SYS-001",
  },
  auditor: {
    label: "Statutory Compliance Auditor",
    designation: "Section 63 BSA Audit Cell",
    landing: "/reports",
    description: "Inspect Merkle DAG chains-of-custody, tamper-evident hash ledgers, and compliance analytics.",
    badge: "AUDIT-GOI-044",
  },
};

export const demoUsers: Record<UserRole, SessionUser> = {
  inspector: {
    name: "Rajesh Sharma",
    email: "inspector@metrolens.gov.in",
    role: "inspector",
    officerRole: "INSPECTOR",
    department: "Department of Consumer Affairs",
    designation: roleMeta.inspector.designation,
    initials: "RS",
    badgeNumber: "INSP-DL-0842",
  },
  controller: {
    name: "S.K. Verma",
    email: "controller@metrolens.gov.in",
    role: "controller",
    officerRole: "CONTROLLER",
    department: "Directorate of Legal Metrology",
    designation: roleMeta.controller.designation,
    initials: "SKV",
    badgeNumber: "CTRL-DL-0012",
  },
  administrator: {
    name: "Rohan Verma",
    email: "admin@metrolens.gov.in",
    role: "administrator",
    officerRole: "CONTROLLER",
    department: "National Informatics / DoCA",
    designation: roleMeta.administrator.designation,
    initials: "RV",
    badgeNumber: "ADMIN-SYS-001",
  },
  auditor: {
    name: "Neha Gupta",
    email: "audit@metrolens.gov.in",
    role: "auditor",
    officerRole: "INSPECTOR",
    department: "Legal Metrology Audit Cell",
    designation: roleMeta.auditor.designation,
    initials: "NG",
    badgeNumber: "AUDIT-GOI-044",
  },
};

interface AuthContextValue {
  user: SessionUser | null;
  login: (role: UserRole, email: string, password?: string) => { ok: boolean; message?: string };
  logout: () => void;
  switchOfficerRole: (role: OfficerRole) => void;
  roleMeta: typeof roleMeta;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser | null>(() => {
    try {
      const stored = localStorage.getItem("nyayadrishti_session");
      return stored ? JSON.parse(stored) : demoUsers.inspector; // Default to inspector for instant demo
    } catch {
      return demoUsers.inspector;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("nyayadrishti_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("nyayadrishti_session");
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      roleMeta,
      login: (role, email, _password) => {
        const expected = demoUsers[role];
        setUser(expected);
        return { ok: true };
      },
      logout: () => setUser(null),
      switchOfficerRole: (newOfficerRole: OfficerRole) => {
        if (newOfficerRole === "CONTROLLER") {
          setUser(demoUsers.controller);
        } else {
          setUser(demoUsers.inspector);
        }
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
