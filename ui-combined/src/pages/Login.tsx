import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole, roleMeta } from "../context/AuthContext";
import { StorageService } from "../services/storage";
import {
  Scale,
  ShieldCheck,
  ArrowRight,
  LockKeyhole,
  KeyRound,
  UserRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import { StateEmblem } from "../components/common/StateEmblem";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "framer-motion";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("inspector");
  const [email, setEmail] = useState("inspector@metrolens.gov.in");
  const [password, setPassword] = useState("Demo@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles: { id: UserRole; title: string; subtitle: string }[] = [
    {
      id: "inspector",
      title: "Legal Metrology Officer",
      subtitle: "Field Inspection & Evidence Capture",
    },
    {
      id: "controller",
      title: "Controller of Legal Metrology",
      subtitle: "Adjudication & Legal Notices",
    },
    {
      id: "administrator",
      title: "System Administrator",
      subtitle: "Jurisdiction & Threshold Config",
    },
    {
      id: "auditor",
      title: "Compliance Auditor",
      subtitle: "Sec 63 BSA Audit & Reports",
    },
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const emails: Record<UserRole, string> = {
      inspector: "inspector@metrolens.gov.in",
      controller: "controller@metrolens.gov.in",
      administrator: "admin@metrolens.gov.in",
      auditor: "audit@metrolens.gov.in",
    };
    setEmail(emails[roleId]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const usernameMap: Record<UserRole, string> = {
        inspector: "inspector_rajesh",
        controller: "controller_south",
        administrator: "admin_central",
        auditor: "inspector_rajesh",
      };
      const username = usernameMap[selectedRole] || "inspector_rajesh";
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Version": "1.0.0-sih26034",
          "X-Device-Fingerprint": "WEB-SPA-CLIENT-OFFICER-WORKSTATION",
        },
        body: JSON.stringify({ username, password: password || "Officer@2026" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.access_token) {
          StorageService.setAuthToken(data.access_token);
        }
      }
    } catch {
      // Non-blocking fallback
    }

    const res = login(selectedRole, email, password);
    if (res.ok) {
      navigate(roleMeta[selectedRole].landing);
    } else {
      setError(res.message || "Failed to authenticate.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official GIGW 3.0 Top Utility Bar */}
      <GovTopBar />

      <div className="flex-1 grid lg:grid-cols-[1.1fr_1fr]">
        {/* Left Informational Showcase */}
        <section className="relative hidden lg:flex flex-col justify-between bg-govNavy text-white p-12 overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 shadow-md flex items-center justify-center p-1.5 shrink-0">
                <StateEmblem size={24} tone="white" showMotto={true} />
              </div>
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-widest text-amber-400">
                  भारत सरकार • Government of India
                </p>
                <h2 className="text-base font-black tracking-tight text-white">
                  Department of Consumer Affairs • Legal Metrology
                </h2>
              </div>
            </Link>
          </div>

          <div className="relative z-10 max-w-lg space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
              <ShieldCheck size={14} />
              <span>Role-Based Access Control (RBAC)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              One Workstation.
              <span className="block text-amber-300">Complete Accountability.</span>
            </h1>

            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              Enforcing the Legal Metrology (Packaged Commodities) Rules, 2011 with Section 63 BSA 2023
              cryptographic evidence integrity. Select your official department profile to enter.
            </p>

            {/* Officer Field Workstation Preview */}
            <div className="rounded-xl overflow-hidden border border-white/20 shadow-lg bg-black/40 p-2 relative group">
              <img
                src="/assets/photography/officer_field_inspection.jpg"
                alt="Field Legal Metrology Officer conducting retail commodity inspection"
                className="w-full h-44 object-cover object-top rounded-lg opacity-95 group-hover:opacity-100 transition-opacity"
              />
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300 font-mono px-1">
                <span className="text-amber-300 font-bold">FIELD INSPECTION WORKSTATION</span>
                <span>DL-SOUTH-01 • Saket Circle</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/15 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Section 63 BSA 2023 Ledger</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Table-I Font Verification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>ArUco Metric Calibration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Human Officer Adjudication</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400">
            Prototype Workstation • SIH26034 • Department of Consumer Affairs
          </div>
        </section>

        {/* Right Sign-in Form */}
        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="text-xs font-bold text-slate-600 hover:text-govNavy flex items-center gap-1.5"
              >
                ← Return to Public Portal
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                <LockKeyhole size={12} /> SECURE GATE
              </span>
            </div>

            <div className="card p-6 sm:p-8 bg-white space-y-6 shadow-md border-slate-200">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="p-2 bg-govNavy border border-govNavy-light rounded-xl shrink-0 flex items-center justify-center shadow-xs">
                  <StateEmblem size={24} tone="white" showMotto={true} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                    Officer Authentication Gateway
                  </span>
                  <h2 className="text-xl font-black text-govNavy">Official Workstation Sign In</h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Legal Metrology Department • Government of India
                  </p>
                </div>
              </div>

              {/* Role Selectors */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Select Official Role:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roles.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedRole === r.id
                          ? "border-govNavy bg-govNavy/5 ring-2 ring-govNavy/30 shadow-xs"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <p
                        className={`text-xs font-extrabold leading-snug ${
                          selectedRole === r.id ? "text-govNavy" : "text-slate-800"
                        }`}
                      >
                        {r.title}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{r.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Official Email / Government ID
                  </label>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Security Password
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-9 pr-10 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2"
                >
                  <span>Authenticate & Enter Workstation</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700">Demonstration Access: </span>
                  <span>1-click sign-in prefilled</span>
                </div>
                <span className="font-mono font-bold text-govNavy">Demo@123</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-tight">
                <strong>Statutory Notice:</strong> Restricted to Gazetted Legal Metrology Officers and authorized enforcement personnel under the Legal Metrology Act, 2009. Unauthorized access attempts are monitored and recorded under Sec 43 of Information Technology Act, 2000.
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* GIGW 3.0 National Portal Footer */}
      <GovFooter />
    </div>
  );
};

export default Login;
