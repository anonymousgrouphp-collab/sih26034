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
  AlertCircle,
  Building2,
  FileCheck2,
  PhoneCall,
  ExternalLink,
} from "lucide-react";
import { StateEmblem } from "../components/common/StateEmblem";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { useLanguage } from "../context/LanguageContext";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<UserRole>("inspector");
  const [email, setEmail] = useState("inspector.lmo@nic.in");
  const [password, setPassword] = useState("Demo@123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const primaryRoles: {
    id: UserRole;
    title: { en: string; hi: string };
    cadre: { en: string; hi: string };
    badge: string;
    description: { en: string; hi: string };
    icon: typeof Scale;
  }[] = [
    {
      id: "inspector",
      title: {
        en: "Legal Metrology Officer (Inspector)",
        hi: "विधिक मापविज्ञान अधिकारी (निरीक्षक)",
      },
      cadre: {
        en: "Field Inspection Squad • LMO Authorized",
        hi: "क्षेत्रीय निरीक्षण दस्ता • अधिकृत LMO",
      },
      badge: "INSP-DL-0842",
      description: {
        en: "On-site packaging verification, ArUco metric calibration, Table-I font schedule checks, and Section 63 BSA evidence registration.",
        hi: "स्थल पर पैकेजिंग सत्यापन, ArUco मीट्रिक अंशांकन, तालिका-I फॉन्ट अनुसूची जांच और धारा 63 बीएसए साक्ष्य पंजीकरण।",
      },
      icon: Scale,
    },
    {
      id: "controller",
      title: {
        en: "Controller of Legal Metrology",
        hi: "विधिक मापविज्ञान नियंत्रक (Controller)",
      },
      cadre: {
        en: "District Adjudicating Authority • Gazetted Rank",
        hi: "जिला न्यायनिर्णायक प्राधिकारी • राजपत्रित संवर्ग",
      },
      badge: "CTRL-DL-0012",
      description: {
        en: "Borderline review queue adjudication, Form-1 compounding notice issuance, and cryptographic evidence dossier certification.",
        hi: "सीमांत समीक्षा कतार न्यायनिर्णयन, फॉर्म-1 शमन नोटिस जारी करना और डिजिटल साक्ष्य डॉसियर प्रमाणीकरण।",
      },
      icon: ShieldCheck,
    },
  ];

  const secondaryRoles: { id: UserRole; label: { en: string; hi: string } }[] = [
    {
      id: "administrator",
      label: { en: "System Administrator", hi: "प्रणाली व्यवस्थापक" },
    },
    {
      id: "auditor",
      label: { en: "Compliance Auditor", hi: "अनुपालन लेखापरीक्षक" },
    },
  ];

  const handleRoleSelect = (roleId: UserRole) => {
    setSelectedRole(roleId);
    const emails: Record<UserRole, string> = {
      inspector: "inspector.lmo@nic.in",
      controller: "controller.clm@nic.in",
      administrator: "admin.metrology@nic.in",
      auditor: "auditor.doca@nic.in",
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
        auditor: "viewer_analyst",
      };
      const username = usernameMap[selectedRole] || "inspector_rajesh";
      const backendPassword = (!password || password === "Demo@123") ? "Officer@2026" : password;
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Client-Version": "1.0.0-sih26034",
          "X-Device-Fingerprint": "WEB-SPA-CLIENT-OFFICER-WORKSTATION",
        },
        body: JSON.stringify({ username, password: backendPassword }),
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Official GIGW 3.0 Top Utility Bar */}
      <GovTopBar />

      {/* Main Administrative Container */}
      <div className="flex-1 w-full max-w-[1550px] mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: National Infrastructure & Statutory Mandate */}
          <section className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between bg-[#1B365D] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-[#152a48] relative overflow-hidden">
            {/* National Tricolor Header Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

            <div className="space-y-6 relative z-10">
              {/* Sovereign State Emblem & Department Masthead */}
              <div className="flex items-start gap-4 pb-6 border-b border-white/15">
                <div className="shrink-0 pt-1">
                  <StateEmblem size={44} tone="white" showMotto={true} />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF9933] flex items-center gap-2">
                    <span>{language === "hi" ? "भारत सरकार" : "GOVERNMENT OF INDIA"}</span>
                    <span className="text-white/40">•</span>
                    <span>{language === "hi" ? "उपभोक्ता मामले विभाग" : "DEPARTMENT OF CONSUMER AFFAIRS"}</span>
                  </p>
                  <h2 className="text-lg sm:text-xl font-black text-white mt-1 leading-snug">
                    {language === "hi"
                      ? "विधिक मापविज्ञान प्रभाग — राष्ट्रीय निरीक्षण पोर्टल"
                      : "Legal Metrology Division — National Inspection Portal"}
                  </h2>
                  <p className="text-xs text-blue-200 mt-0.5">
                    {language === "hi"
                      ? "विधिक मापविज्ञान अधिनियम, 2009 एवं पैकेज वस्तुएं नियम, 2011 का अधिकृत प्रवर्तन कार्यस्थान"
                      : "Official Statutory Enforcement Workstation under the Legal Metrology Act, 2009"}
                  </p>
                </div>
              </div>

              {/* Informational Pitch */}
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-100 shadow-2xs">
                  <ShieldCheck size={14} className="text-[#FF9933]" />
                  <span>
                    {language === "hi"
                      ? "राष्ट्रीय अधिकारी प्रमाणीकरण प्रणाली (NIC / MeriPehchaan)"
                      : "National Officer Authentication Gateway (NIC / MeriPehchaan)"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                  {language === "hi" ? (
                    <>
                      साक्ष्य-स्तरीय पैकेज अनुपालन।{" "}
                      <span className="text-[#FF9933]">विधिक शुचिता एवं शुद्धि।</span>
                    </>
                  ) : (
                    <>
                      Evidence-Grade Compliance.{" "}
                      <span className="text-[#FF9933]">Statutory Transparency.</span>
                    </>
                  )}
                </h1>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {language === "hi"
                    ? "विधिक मापविज्ञान अधिकारियों (LMO) और जिला नियंत्रकों हेतु स्वचालित ऑप्टिकल गुणवत्ता जांच, ArUco मीट्रिक अंशांकन, तालिका-I फॉन्ट अनुसूची सत्यापन एवं धारा 63 भारतीय साक्ष्य अधिनियम, 2023 डिजिटल साक्ष्य प्रमाणपत्र प्रणाली।"
                    : "Automated optical verification under the Legal Metrology Act, 2009 and LMPC Rules, 2011, backed by Section 63 BSA 2023 tamper-evident cryptographic hash immutability."}
                </p>
              </div>

              {/* Inspection Photodocumentation Card */}
              <div className="rounded-2xl bg-[#122744] border border-white/15 p-3 overflow-hidden shadow-md">
                <div className="relative rounded-xl overflow-hidden h-44 sm:h-52 bg-slate-900">
                  <img
                    src="/assets/photography/officer_field_inspection.jpg"
                    alt="Field Legal Metrology Officer conducting retail commodity inspection"
                    className="w-full h-full object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1F36] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-[10.5px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>SEC 63 BSA VERIFIED</span>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200">
                    <span className="font-bold text-[#FF9933]">CIRCULAR: DOCA/LM-2026/04</span>
                    <span className="text-white/80">DELHI JURISDICTION SQUAD</span>
                  </div>
                </div>
              </div>

              {/* Statutory Pillars */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{language === "hi" ? "तालिका-I फॉन्ट ऊंचाई मानक" : "Table-I Minimum Font Schedule"}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{language === "hi" ? "धारा 63 बीएसए 2023 मर्कल लेजर" : "Section 63 BSA 2023 Ledger"}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{language === "hi" ? "ArUco मीट्रिक फ़िड्यूशियल अंशांकन" : "ArUco Metric Fiducial Gate"}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-100">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>{language === "hi" ? "फॉर्म-1 शमन नोटिस अधिनिर्णय" : "Form-1 Notice Adjudication"}</span>
                </div>
              </div>
            </div>

            {/* Official Support & Helpdesk Footer */}
            <div className="pt-6 mt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-[11px] text-blue-200 relative z-10">
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-[#FF9933]" />
                <span>
                  {language === "hi" ? "राष्ट्रीय उपभोक्ता हेल्पलाइन:" : "National Consumer Helpline:"}{" "}
                  <strong className="text-white font-bold">1915</strong>
                </span>
              </div>
              <span className="font-mono text-white/60">NODE: NIC-DOCA-SEC-2026</span>
            </div>
          </section>

          {/* Right Column: Authentic Government Officer Login Docket */}
          <section className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
              {/* National Tricolor Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#1B365D] border border-blue-200">
                      {language === "hi" ? "विधिक कार्यस्थान" : "Officer Gateway"}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <LockKeyhole size={11} />
                      <span>{language === "hi" ? "एसएसएल सुरक्षित" : "SSL Encrypted"}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {language === "hi" ? "अधिकारी कार्यस्थान लॉगिन" : "Official Workstation Sign In"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "hi"
                      ? "कृपया अपने अधिकृत संवर्ग एवं क्रेडेंशियल्स का चयन करें"
                      : "Select your designated cadre & enter official credentials"}
                  </p>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <StateEmblem size={32} tone="navy" showMotto={false} />
                </div>
              </div>

              {/* Officer Role / Cadre Selector (Inspector vs Controller) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    {language === "hi" ? "1. अधिकृत संवर्ग चुनें (Designation / Cadre):" : "1. Select Official Cadre / Role:"}
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#1B365D]">RBAC AUTHORIZED</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {primaryRoles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;

                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? "border-[#1B365D] bg-blue-50/70 shadow-xs ring-2 ring-[#1B365D]/15"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-[#1B365D] text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {r.title[language === "hi" ? "hi" : "en"]}
                                </p>
                                <span className="font-mono text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {r.badge}
                                </span>
                              </div>
                              <p className="text-[10.5px] font-semibold text-[#1B365D] mt-0.5 truncate">
                                {r.cadre[language === "hi" ? "hi" : "en"]}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1 leading-snug line-clamp-2">
                                {r.description[language === "hi" ? "hi" : "en"]}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 pt-0.5">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? "border-[#1B365D] bg-[#1B365D] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Administrative Roles */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {language === "hi" ? "अन्य संवर्ग:" : "Other Roles:"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {secondaryRoles.map((sr) => (
                      <button
                        key={sr.id}
                        type="button"
                        onClick={() => handleRoleSelect(sr.id)}
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                          selectedRole === sr.id
                            ? "bg-[#1B365D] text-white border-[#1B365D]"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                        }`}
                      >
                        {sr.label[language === "hi" ? "hi" : "en"]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2 shadow-xs"
                >
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="official-email"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    {language === "hi"
                      ? "2. अधिकृत सरकारी ईमेल / आईडी (Official Gov ID):"
                      : "2. Official Gov ID / NIC Email:"}
                  </label>
                  <div className="relative">
                    <UserRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="official-email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="security-password"
                      className="block text-xs font-bold text-slate-700"
                    >
                      {language === "hi"
                        ? "3. सुरक्षा पासवर्ड / डिजिटल टोकन:"
                        : "3. Security Password / Digital Token:"}
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">ENCRYPTED</span>
                  </div>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      id="security-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#1B365D] hover:bg-[#0A2540] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  <span>
                    {language === "hi"
                      ? "प्रमाणीकरण एवं कार्यस्थान में प्रवेश करें"
                      : "Authenticate & Enter Workstation"}
                  </span>
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Demo Pre-fill Notice */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1B365D]">
                    {language === "hi" ? "त्वरित प्रदर्शन सुविधा: " : "Demonstration Mode: "}
                  </span>
                  <span className="text-slate-500">
                    {language === "hi" ? "क्रेडेंशियल्स स्वतः भरे हैं" : "Pre-filled credentials"}
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  Demo@123
                </span>
              </div>

              {/* Statutory Warning Box */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 leading-relaxed">
                <strong className="font-bold">
                  {language === "hi" ? "वैधानिक सुरक्षा सूचना:" : "Statutory Security Notice:"}
                </strong>{" "}
                {language === "hi"
                  ? "यह पोर्टल केवल विधिक मापविज्ञान अधिनियम, 2009 के अंतर्गत अधिकृत राजपत्रित अधिकारियों हेतु सुरक्षित है। अनधिकृत प्रवेश सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 43 एवं 66 के तहत दंडनीय अपराध है।"
                  : "Authorized exclusively for Gazetted Legal Metrology Officers and designated enforcement personnel. Unauthorized access is punishable under Sections 43 & 66 of the IT Act, 2000."}
              </div>

              {/* Back Link */}
              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="text-xs font-semibold text-slate-500 hover:text-[#1B365D] transition-colors"
                >
                  ← {language === "hi" ? "सार्वजनिक पोर्टल पर वापस जाएं" : "Return to Public Portal"}
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* GIGW 3.0 National Portal Footer */}
      <GovFooter />
    </div>
  );
};

export default Login;
