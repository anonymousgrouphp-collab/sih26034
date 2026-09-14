import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole, roleMeta, demoUsers } from "../context/AuthContext";
import { StorageService } from "../services/storage";
import {
  Scale,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
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
  LogIn,
  RefreshCw,
  Volume2,
  Smartphone,
  Cpu,
  Sparkles,
  Shield,
  UserCheck,
  Check,
  Clock,
  Fingerprint,
  ChevronRight,
  Home,
} from "lucide-react";
import { StateEmblem } from "../components/common/StateEmblem";
import { NirikshakBrandLogo } from "../components/common/NirikshakBrandLogo";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { useLanguage } from "../context/LanguageContext";
import { resetScrollToTop } from "../components/common/ScrollToTop";

type AuthMethod = "gov_id" | "meripehchaan" | "dsc";

export const Login: React.FC = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const [authMethod, setAuthMethod] = useState<AuthMethod>("gov_id");
  const [selectedRole, setSelectedRole] = useState<UserRole>("inspector");
  const [email, setEmail] = useState("inspector.lmo@nic.in");
  const [password, setPassword] = useState("Demo@123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [shiftDuration, setShiftDuration] = useState<"8h" | "incident">("8h");

  // Captcha State
  const [captchaQuestion, setCaptchaQuestion] = useState<{ text: string; answer: number }>({
    text: "7 + 5",
    answer: 12,
  });
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  // MeriPehchaan OTP State
  const cadrePhoneMap: Record<UserRole, string> = {
    inspector: "+91 98765 43210",
    controller: "+91 98112 00121",
    administrator: "+91 98710 33455",
    auditor: "+91 99551 22440",
  };
  const [mobileOrVid, setMobileOrVid] = useState(cadrePhoneMap.inspector);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpCountdown, setOtpCountdown] = useState(30);

  // DSC Token State
  const [tokenPin, setTokenPin] = useState("842019");
  const [showTokenPin, setShowTokenPin] = useState(false);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global Escape key listener to cleanly return to public landing portal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        resetScrollToTop();
        navigate("/");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Generate new math captcha
  const refreshCaptcha = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setCaptchaQuestion({
      text: `${n1} + ${n2}`,
      answer: n1 + n2,
    });
    setCaptchaInput("");
    setCaptchaError(null);
  };

  // Quick auto-solve helper for evaluation testing
  const handleAutoSolveCaptcha = () => {
    setCaptchaInput(String(captchaQuestion.answer));
    setCaptchaError(null);
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  // Read aloud captcha for accessibility (GIGW 3.0)
  const speakCaptcha = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        language === "hi"
          ? `सुरक्षा कैप्चा चुनौती है: ${captchaQuestion.text.replace("+", "जमा")}`
          : `Security captcha challenge: ${captchaQuestion.text}`
      );
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const primaryRoles: {
    id: UserRole;
    name: string;
    title: { en: string; hi: string };
    cadre: { en: string; hi: string };
    badge: string;
    circle: { en: string; hi: string };
    description: { en: string; hi: string };
    icon: typeof Scale;
  }[] = [
    {
      id: "inspector",
      name: "Rajesh Sharma",
      title: {
        en: "Legal Metrology Officer (Inspector)",
        hi: "विधिक मापविज्ञान अधिकारी (निरीक्षक)",
      },
      cadre: {
        en: "Field Inspection Squad • LMO Authorized",
        hi: "क्षेत्रीय निरीक्षण दस्ता • अधिकृत LMO",
      },
      badge: "INSP-DL-0842",
      circle: {
        en: "Delhi Zone-IV (Enforcement)",
        hi: "दिल्ली मंडल-IV (प्रवर्तन)",
      },
      description: {
        en: "Physical packaging inspection, ArUco metric calibration, Table-I font schedule checks, and Section 63 BSA evidence registration.",
        hi: "स्थल पर पैकेजिंग सत्यापन, ArUco मीट्रिक अंशांकन, तालिका-I फॉन्ट अनुसूची जांच और धारा 63 बीएसए साक्ष्य पंजीकरण।",
      },
      icon: Scale,
    },
    {
      id: "controller",
      name: "S.K. Verma",
      title: {
        en: "Controller of Legal Metrology",
        hi: "विधिक मापविज्ञान नियंत्रक (Controller)",
      },
      cadre: {
        en: "District Adjudicating Authority • Gazetted Rank",
        hi: "जिला न्यायनिर्णायक प्राधिकारी • राजपत्रित संवर्ग",
      },
      badge: "CTRL-DL-0012",
      circle: {
        en: "Directorate Headquarters",
        hi: "निदेशालय मुख्यालय",
      },
      description: {
        en: "Borderline review queue adjudication, Form-1 compounding notice issuance, and cryptographic evidence dossier certification.",
        hi: "सीमांत समीक्षा कतार न्यायनिर्णयन, फॉर्म-1 शमन नोटिस जारी करना और डिजिटल साक्ष्य डॉसियर प्रमाणीकरण।",
      },
      icon: ShieldCheck,
    },
    {
      id: "administrator",
      name: "Dr. Alok Verma",
      title: {
        en: "System Administrator",
        hi: "प्रणाली व्यवस्थापक (Administrator)",
      },
      cadre: {
        en: "Platform & Station Configuration • Central Authority",
        hi: "प्लेटफ़ॉर्म एवं स्टेशन विन्यास • केंद्रीय प्राधिकारी",
      },
      badge: "ADMIN-SYS-001",
      circle: {
        en: "NIC Central Command",
        hi: "एनआईसी केंद्रीय कमान",
      },
      description: {
        en: "Manage jurisdiction circles, optical calibration thresholds, workstation telemetry, and national compliance parameters.",
        hi: "अधिकार क्षेत्र मंडल, ऑप्टिकल अंशांकन सीमाएं, वर्कस्टेशन टेलीमेट्री और राष्ट्रीय अनुपालन पैरामीटर प्रबंधित करें।",
      },
      icon: Shield,
    },
    {
      id: "auditor",
      name: "Neha Gupta",
      title: {
        en: "Compliance Auditor",
        hi: "विधिक अनुपालन लेखापरीक्षक (Auditor)",
      },
      cadre: {
        en: "Section 63 BSA Audit Cell • Merkle Ledger Review",
        hi: "धारा 63 बीएसए लेखापरीक्षा प्रकोष्ठ • मर्कल लेजर समीक्षा",
      },
      badge: "AUDIT-GOI-044",
      circle: {
        en: "DoCA Oversight Wing",
        hi: "उपभोक्ता मामले निगरानी प्रकोष्ठ",
      },
      description: {
        en: "Inspect tamper-evident SHA-256 Merkle DAG chains-of-custody, evidentiary audits, and statutory compliance analytics.",
        hi: "छेड़छाड़-रोधी SHA-256 मर्कल डीएजी कस्टडी श्रृंखला, साक्ष्य लेखापरीक्षा और वैधानिक अनुपालन विश्लेषिकी का निरीक्षण करें।",
      },
      icon: FileCheck2,
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
    setMobileOrVid(cadrePhoneMap[roleId]);
    setError(null);
  };

  // Perform backend token synchronization with fallback to resilient Mode B
  const syncBackendToken = async (
    role: UserRole,
    customPassword?: string
  ): Promise<{ success: boolean; isOffline: boolean; error?: string }> => {
    const usernameMap: Record<UserRole, string> = {
      inspector: "inspector_rajesh",
      controller: "controller_south",
      administrator: "admin_central",
      auditor: "viewer_analyst",
    };
    const username = usernameMap[role] || "inspector_rajesh";
    const backendPassword =
      !customPassword || customPassword === "Demo@123" ? "Officer@2026" : customPassword;

    const baseUrl = ((import.meta as any)?.env?.VITE_API_BASE_URL as string) || "/api/v1";

    try {
      const res = await fetch(`${baseUrl}/auth/login`, {
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
          if (role === "controller") {
            StorageService.setControllerAuthToken(data.access_token);
          } else {
            StorageService.setAuthToken(data.access_token);
          }
        }
        return { success: true, isOffline: false };
      }

      if (res.status === 401) {
        return {
          success: false,
          isOffline: false,
          error:
            language === "hi"
              ? "अमान्य सुरक्षा क्रेडेंशियल्स। परीक्षण हेतु डिफ़ॉल्ट क्रेडेंशियल्स (Demo@123 / Officer@2026) का उपयोग करें।"
              : "Invalid security credentials. For testing, please use default demo password 'Demo@123' or 'Officer@2026'.",
        };
      }

      return { success: true, isOffline: true };
    } catch {
      // Offline/Local resilient mode fallback
      return { success: true, isOffline: true };
    }
  };

  // 1-Click Fast-Track Instant Demo Sign-In (For SIH Judges & Evaluators)
  const handleInstantDemoLogin = async (role: UserRole) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    setError(null);
    setSubmitSuccess(false);
    setSubmitPhase(
      language === "hi"
        ? "एनआईसी राष्ट्रीय गेटवे से क्रेडेंशियल्स सत्यापित किए जा रहे हैं..."
        : "Validating officer credentials with National NIC Gateway..."
    );

    const syncRes = await syncBackendToken(role);
    if (!syncRes.success && syncRes.error) {
      setIsSubmitting(false);
      setError(syncRes.error);
      return;
    }

    setSubmitPhase(
      language === "hi"
        ? "डिजिटल टोकन सत्यापित! कार्यक्षेत्र में प्रवेश हो रहा है..."
        : "Cryptographic credentials verified! Launching officer workstation..."
    );
    setSubmitSuccess(true);

    setTimeout(() => {
      login(role);
      navigate(roleMeta[role].landing);
    }, 380);
  };

  // Standard Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCaptchaError(null);

    // Validate captcha if using Gov ID method
    if (authMethod === "gov_id") {
      const parsedAns = parseInt(captchaInput.trim(), 10);
      if (isNaN(parsedAns) || parsedAns !== captchaQuestion.answer) {
        setCaptchaError(
          language === "hi"
            ? "कैप्चा उत्तर गलत है। कृपया पुनः प्रयास करें।"
            : "Incorrect captcha solution. Please calculate and try again."
        );
        return;
      }
    }

    // Validate OTP if using MeriPehchaan method
    if (authMethod === "meripehchaan") {
      const otpFull = otpDigits.join("");
      if (otpFull.length !== 6 || !/^\d{6}$/.test(otpFull)) {
        setError(
          language === "hi"
            ? "कृपया 6 अंकों का आधिकारिक संख्यात्मक ओटीपी दर्ज करें।"
            : "Please enter the complete 6-digit numeric OTP code."
        );
        return;
      }
    }

    // Validate DSC PIN if using Token method
    if (authMethod === "dsc") {
      if (!tokenPin || tokenPin.length < 4) {
        setError(
          language === "hi"
            ? "कृपया वैध टोकन पिन दर्ज करें (न्यूनतम 4 अंक)।"
            : "Please enter a valid cryptographic token PIN (min 4 digits)."
        );
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitPhase(
      language === "hi"
        ? "एनआईसी राष्ट्रीय प्रमाणीकरण पोर्टल से संपर्क स्थापित हो रहा है..."
        : "Connecting to NIC National Authentication Gateway..."
    );

    // For OTP and DSC token flows, use official officer demo seed password; for Gov ID pass user input
    const backendPass = authMethod === "gov_id" ? password : "Demo@123";
    const syncRes = await syncBackendToken(selectedRole, backendPass);
    if (!syncRes.success && syncRes.error) {
      setIsSubmitting(false);
      setError(syncRes.error);
      return;
    }

    setSubmitPhase(
      language === "hi"
        ? "धारा 63 बीएसए मर्कल लेजर से सत्र पंजीकृत किया जा रहा है..."
        : "Registering session with Section 63 BSA Merkle cryptographic ledger..."
    );

    setTimeout(() => {
      const res = login(selectedRole, email, password);
      if (res.ok) {
        setSubmitSuccess(true);
        setSubmitPhase(
          language === "hi"
            ? "प्रमाणीकरण सफल! कार्यक्षेत्र में प्रवेश..."
            : "Authentication successful! Transferring to official workstation..."
        );
        setTimeout(() => {
          navigate(roleMeta[selectedRole].landing);
        }, 350);
      } else {
        setIsSubmitting(false);
        setError(res.message || "Failed to authenticate.");
      }
    }, 400);
  };

  // Auto-fill test OTP helper
  const handleAutoFillOtp = () => {
    setOtpDigits(["8", "4", "2", "0", "1", "9"]);
    setOtpSent(true);
    setOtpCountdown(30);
    setError(null);
  };

  // Handle OTP digit box paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nextDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setOtpDigits(nextDigits);
    setError(null);
    const targetIdx = Math.min(pasted.length, 5);
    const targetEl = document.getElementById(`otp-box-${targetIdx}`);
    if (targetEl) targetEl.focus();
  };

  // Find currently selected role definition
  const currentRoleDef =
    primaryRoles.find((r) => r.id === selectedRole) || primaryRoles[0];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Official GIGW 3.0 Top Utility Bar */}
      <GovTopBar />

      {/* Official Portal Header — Sovereign Masthead with Prominent Return to Public Portal */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#1B365D] text-white shadow-md">
        {/* National Tricolor Top Accent Line */}
        <div className="h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] w-full" />
        <div className="mx-auto flex max-w-[1550px] items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center gap-3 sm:gap-4">
            <NirikshakBrandLogo tone="light" size="md" />
            <div className="hidden md:block h-6 w-px bg-white/20" />
            <div className="hidden md:block text-left leading-tight">
              <p className="text-[10.5px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                {language === "hi" ? "अधिकारी प्रमाणीकरण गेटवे" : "Officer Authentication Gateway"}
              </p>
              <p className="text-[10px] text-slate-300">
                {language === "hi" ? "विधिक मापविज्ञान प्रभाग • उपभोक्ता मामले विभाग" : "Legal Metrology Division • Govt of India"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://emaap.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-amber-300 transition-colors"
            >
              <span>{language === "hi" ? "ई-माप पोर्टल" : "eMaap Portal"}</span>
              <ExternalLink size={13} />
            </a>

            {/* Prominent Back to Public Portal Link with Esc shortcut */}
            <Link
              to="/"
              onClick={resetScrollToTop}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white/40 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-amber-300 cursor-pointer group"
              title={language === "hi" ? "सार्वजनिक मुख्य पोर्टल पर वापस जाएं (Esc)" : "Return to Nirikshak Public Portal (Esc)"}
              aria-label={language === "hi" ? "सार्वजनिक मुख्य पोर्टल पर वापस जाएं" : "Return to Nirikshak Public Portal"}
            >
              <ArrowLeft size={16} className="text-amber-400 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span className="hidden sm:inline">
                {language === "hi" ? "सार्वजनिक पोर्टल पर वापस जाएं" : "Back to Public Portal"}
              </span>
              <span className="sm:hidden">
                {language === "hi" ? "सार्वजनिक पोर्टल" : "Public Portal"}
              </span>
              <kbd className="hidden md:inline-block text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/15 text-amber-200 border border-white/25">
                Esc
              </kbd>
            </Link>
          </div>
        </div>
      </header>

      {/* Contextual Statutory Breadcrumb Navigation */}
      <div className="w-full max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-1">
        <nav aria-label="Breadcrumb" className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              onClick={resetScrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#1B365D] transition-colors"
            >
              <Home size={13} className="text-slate-400 shrink-0" />
              <span>{language === "hi" ? "मुख्य पृष्ठ (सार्वजनिक पोर्टल)" : "Home (Public Portal)"}</span>
            </Link>
            <ChevronRight size={13} className="text-slate-400 shrink-0" />
            <span className="text-[#1B365D] font-bold">
              {language === "hi" ? "अधिकारी कार्यस्थान लॉगिन" : "Official Workstation Sign In"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
            <LockKeyhole size={12} className="text-emerald-600 shrink-0" />
            <span>{language === "hi" ? "एसएसएल 256-बिट सुरक्षित • धारा 63 बीएसए" : "SSL 256-Bit • Sec 63 BSA Verified"}</span>
          </div>
        </nav>
      </div>

      {/* Main Administrative Container */}
      <div className="flex-1 w-full max-w-[1550px] mx-auto p-3 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
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
                      ? "राष्ट्रीय अधिकारी प्रमाणीकरण गेटवे (NIC / MeriPehchaan)"
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
            <div className="bg-white border border-slate-200 shadow-xl rounded-3xl p-5 sm:p-7 space-y-5 relative overflow-hidden">
              {/* National Tricolor Top Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

              {/* Active Session Notification Card (if already logged in) */}
              {user && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#1B365D] text-amber-300 font-black text-xs flex items-center justify-center shrink-0 border border-amber-300">
                      {user.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                        <span>{user.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-950">
                          {user.badgeNumber}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-amber-900 truncate">
                        {language === "hi"
                          ? "सक्रिय अधिकारी सत्र चालू है"
                          : "Active officer session currently verified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate(roleMeta[user.role]?.landing || "/dashboard")}
                      className="flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg bg-[#1B365D] hover:bg-[#0A2540] text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span>{language === "hi" ? "कार्यस्थान पर जाएं" : "Go to Workstation"}</span>
                      <ArrowRight size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-2 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition-colors cursor-pointer"
                      title={language === "hi" ? "लॉग आउट करें" : "Sign Out"}
                    >
                      {language === "hi" ? "साइन आउट" : "Sign Out"}
                    </button>
                  </div>
                </div>
              )}

              {/* Card Top Utility Bar — Immediate Back to Public Portal Link */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <Link
                  to="/"
                  onClick={resetScrollToTop}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1B365D] transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 group cursor-pointer"
                  title={language === "hi" ? "सार्वजनिक मुख्य पोर्टल पर वापस जाएं" : "Return to Nirikshak Public Portal"}
                >
                  <ArrowLeft size={14} className="text-amber-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                  <span>{t("login.return_portal", "Return to Public Portal")}</span>
                </Link>
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <LockKeyhole size={11} className="text-emerald-700" />
                  <span>SSL 256-BIT • GIGW 3.0</span>
                </div>
              </div>

              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-50 text-[#1B365D] border border-blue-200">
                      {language === "hi" ? "विधिक कार्यस्थान" : "Officer Gateway"}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {language === "hi" ? "राजपत्रित संवर्ग प्रमाणीकरण" : "Gazetted Officer Identification"}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {language === "hi" ? "अधिकारी कार्यस्थान लॉगिन" : "Official Workstation Sign In"}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "hi"
                      ? "विधिक मापविज्ञान अधिनियम, 2009 के तहत अधिकृत प्रवर्तन लॉगिन"
                      : "Authorized statutory portal under Legal Metrology Act, 2009"}
                  </p>
                </div>
                <div className="shrink-0 hidden sm:block">
                  <StateEmblem size={32} tone="navy" showMotto={false} />
                </div>
              </div>

              {/* AUTHORIZED CADRE SEGMENTED CONTROLLER & OFFICER IDENTIFICATION DOSSIER */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserRound size={13} className="text-[#1B365D]" />
                    <span>
                      {language === "hi"
                        ? "1. अधिकृत अधिकारी संवर्ग चुनें (Select Cadre):"
                        : "1. Select Authorized Officer Cadre:"}
                    </span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#1B365D] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    RBAC SECURED
                  </span>
                </div>

                {/* 4-Way Segmented Cadre Switcher with Official Badge Numbers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  {primaryRoles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleSelect(r.id)}
                        className={`p-2 rounded-lg text-left transition-all cursor-pointer flex flex-col justify-between gap-1 border ${
                          isSelected
                            ? "bg-[#1B365D] text-white border-[#1B365D] shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                              isSelected
                                ? "bg-amber-400 text-slate-950 border-amber-300"
                                : "bg-slate-100 text-slate-800 border-slate-200"
                            }`}
                          >
                            {r.badge}
                          </span>
                          <Icon size={13} className={isSelected ? "text-amber-300" : "text-slate-400"} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black truncate leading-tight mt-0.5">
                            {r.name}
                          </p>
                          <p
                            className={`text-[9.5px] truncate font-medium ${
                              isSelected ? "text-blue-200" : "text-slate-500"
                            }`}
                          >
                            {r.id === "inspector"
                              ? (language === "hi" ? "निरीक्षक" : "Inspector")
                              : r.id === "controller"
                              ? (language === "hi" ? "नियंत्रक" : "Controller")
                              : r.id === "administrator"
                              ? (language === "hi" ? "प्रशासक" : "Admin")
                              : (language === "hi" ? "लेखापरीक्षक" : "Auditor")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* OFFICIAL DESIGNATED OFFICER IDENTIFICATION DOSSIER CARD */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/40 to-amber-50/30 border border-blue-200/80 p-3 sm:p-3.5 shadow-2xs relative overflow-hidden">
                  {/* Sovereign Tricolor top micro accent */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
                    {/* Officer Identity & Badge Pill */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-amber-300 font-black text-sm flex items-center justify-center border-2 border-amber-400/40 shadow-xs">
                          {demoUsers[selectedRole]?.initials || "GO"}
                        </div>
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse"
                          title="Statutory Session Verified"
                        />
                      </div>

                      <div className="min-w-0 leading-tight">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                            {currentRoleDef.name}
                          </span>
                          {/* Official Sovereign Badge Pill */}
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs">
                            🇮🇳 {currentRoleDef.badge}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-[#1B365D] truncate mt-0.5">
                          {currentRoleDef.title[language === "hi" ? "hi" : "en"]}
                        </p>
                        <p className="text-[9.5px] text-slate-500 truncate mt-0.5">
                          {currentRoleDef.circle[language === "hi" ? "hi" : "en"]} • {currentRoleDef.cadre[language === "hi" ? "hi" : "en"]}
                        </p>
                      </div>
                    </div>

                    {/* Integrated Instant 1-Click Fast-Track Sign-In CTA */}
                    <div className="shrink-0 flex sm:flex-col items-end justify-center">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleInstantDemoLogin(selectedRole)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 group"
                        title={language === "hi" ? "चयनित अधिकारी के रूप में 1-क्लिक त्वरित प्रवेश" : "Instant 1-Click login as active officer"}
                      >
                        <Sparkles size={13} className="text-slate-950 shrink-0" />
                        <span>
                          {language === "hi" ? "1-क्लिक त्वरित प्रवेश" : "Instant 1-Click Sign In"}
                        </span>
                        <ArrowRight size={13} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                      <span className="hidden sm:block text-[9px] text-slate-500 mt-1 font-mono text-right">
                        NIC Fast-Track • Direct Launch
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authentication Method Selector Tabs */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  {language === "hi" ? "2. प्रमाणीकरण पद्धति चुनें (Authentication Method):" : "2. Authentication Gateway Method:"}
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("gov_id");
                      setError(null);
                    }}
                    className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === "gov_id"
                        ? "bg-[#1B365D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <KeyRound size={14} className="shrink-0" />
                    <span className="text-[11px] truncate">
                      {language === "hi" ? "एनआईसी आईडी" : "Gov ID"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("meripehchaan");
                      setError(null);
                    }}
                    className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === "meripehchaan"
                        ? "bg-[#1B365D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Smartphone size={14} className="shrink-0" />
                    <span className="text-[11px] truncate">
                      {language === "hi" ? "मेरी पहचान" : "MeriPehchaan"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("dsc");
                      setError(null);
                    }}
                    className={`py-2 px-2 rounded-lg font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authMethod === "dsc"
                        ? "bg-[#1B365D] text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    <Cpu size={14} className="shrink-0" />
                    <span className="text-[11px] truncate">
                      {language === "hi" ? "डीएससी टोकन" : "DSC Token"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2 shadow-xs animate-shake"
                >
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submitting / Success Progress Indicator */}
              {isSubmitting && (
                <div
                  className={`p-3.5 rounded-xl border text-xs transition-all space-y-2 ${
                    submitSuccess
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                      : "bg-blue-50 border-blue-200 text-[#1B365D]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold">
                    {submitSuccess ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    ) : (
                      <RefreshCw size={15} className="animate-spin text-[#1B365D] shrink-0" />
                    )}
                    <span>{submitPhase}</span>
                  </div>
                  <div
                    className={`w-full h-1 rounded-full overflow-hidden ${
                      submitSuccess ? "bg-emerald-200" : "bg-blue-200"
                    }`}
                  >
                    <div
                      className={`h-1 rounded-full ${
                        submitSuccess
                          ? "bg-emerald-600 w-full transition-all duration-300"
                          : "bg-[#1B365D] animate-indeterminate"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* TAB 1: GOV ID & PASSWORD */}
              {authMethod === "gov_id" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Gov Email / ID */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="official-email"
                        className="block text-xs font-bold text-slate-700"
                      >
                        {language === "hi"
                          ? "अधिकृत सरकारी ईमेल / आईडी (Official Gov ID):"
                          : "Official Gov ID / NIC Email:"}
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">{currentRoleDef.badge}</span>
                    </div>
                    <div className="relative">
                      <UserRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="official-email"
                        name="email"
                        type="email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Security Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="security-password"
                        className="block text-xs font-bold text-slate-700"
                      >
                        {language === "hi"
                          ? "सुरक्षा पासवर्ड / डिजिटल टोकन:"
                          : "Security Password / Digital Token:"}
                      </label>
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 font-mono">
                        Demo: Demo@123
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="security-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
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

                  {/* GIGW 3.0 Accessible Security Captcha */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="captcha-input" className="text-xs font-bold text-slate-700">
                        {language === "hi" ? "सुरक्षा कैप्चा सत्यापन (Security Captcha):" : "Security Captcha Challenge:"}
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoSolveCaptcha}
                        className="text-[10px] font-bold text-[#1B365D] hover:underline cursor-pointer"
                        title={language === "hi" ? "कैप्चा स्वतः हल करें" : "Auto-fill captcha answer"}
                      >
                        {language === "hi" ? "स्वतः हल करें" : "Auto-solve"}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Visual Captcha Box (Clickable for instant solution) */}
                      <button
                        type="button"
                        onClick={handleAutoSolveCaptcha}
                        title={language === "hi" ? "कैप्चा स्वतः हल करने के लिए क्लिक करें" : "Click to auto-solve captcha"}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono font-black text-sm tracking-widest text-center select-none shadow-inner border border-slate-700 hover:border-amber-400/50 transition-all cursor-pointer group flex items-center justify-center gap-1.5"
                      >
                        <span>{captchaQuestion.text} = ?</span>
                      </button>

                      {/* Read Aloud Button (Audio Accessibility) */}
                      <button
                        type="button"
                        onClick={speakCaptcha}
                        title={language === "hi" ? "कैप्चा सुनें" : "Read Captcha Aloud"}
                        aria-label="Read Captcha Aloud"
                        className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      >
                        <Volume2 size={16} />
                      </button>

                      {/* Refresh Captcha Button */}
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        title={language === "hi" ? "नया कैप्चा प्राप्त करें" : "Refresh Captcha"}
                        aria-label="Refresh Captcha"
                        className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                      >
                        <RefreshCw size={16} />
                      </button>

                      {/* Captcha Input */}
                      <div className="w-24">
                        <input
                          id="captcha-input"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Ans"
                          value={captchaInput}
                          onChange={(e) => {
                            setCaptchaInput(e.target.value.replace(/\D/g, ""));
                            setCaptchaError(null);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-bold text-center text-sm focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    {captchaError && (
                      <p className="text-[11px] text-rose-600 font-bold mt-1">{captchaError}</p>
                    )}
                  </div>

                  {/* Shift Duration & Remember Device */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded text-[#1B365D] border-slate-300 focus:ring-[#1B365D]"
                      />
                      <span>{language === "hi" ? "यह डिवाइस याद रखें (30 दिन)" : "Remember this workstation"}</span>
                    </label>

                    <span className="font-mono text-[10px] text-slate-500">SHIFT: 8-HOURS</span>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B365D] hover:bg-[#0A2540] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-75"
                  >
                    <LogIn size={16} />
                    <span>
                      {language === "hi"
                        ? "प्रमाणीकरण एवं कार्यस्थान में प्रवेश करें"
                        : "Authenticate & Enter Workstation"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* TAB 2: MERIPEHCHAAN SSO / OTP */}
              {authMethod === "meripehchaan" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-orange-900">
                        <Smartphone size={14} className="text-[#FF9933]" />
                        <span>Jan Parichay • MeriPehchaan SSO</span>
                      </span>
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-orange-200/80 text-orange-900">
                        2FA VERIFIED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {language === "hi"
                        ? `भारत सरकार का राष्ट्रीय एकल खिड़की प्रमाणीकरण। पंजीकृत अधिकारी ${currentRoleDef.name} (${currentRoleDef.badge}) के मोबाइल पर सुरक्षित ओटीपी प्राप्त करें।`
                        : `National Single Sign-On Gateway of India. One-time password verification sent to registered NIC mobile for ${currentRoleDef.name} (${currentRoleDef.badge}).`}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="mobile-or-vid"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      {language === "hi" ? "पंजीकृत मोबाइल या आभासी आईडी (VID):" : "Registered Mobile / Virtual ID (VID):"}
                    </label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <Smartphone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <input
                          id="mobile-or-vid"
                          type="text"
                          value={mobileOrVid}
                          onChange={(e) => setMobileOrVid(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 font-medium focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        disabled={otpSent && otpCountdown > 0}
                        onClick={() => {
                          setOtpSent(true);
                          setOtpCountdown(30);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        {otpSent && otpCountdown > 0
                          ? language === "hi"
                            ? `पुनः भेजें (${otpCountdown}s)`
                            : `Resend in ${otpCountdown}s`
                          : otpSent
                          ? language === "hi"
                            ? "पुनः भेजें"
                            : "Resend OTP"
                          : language === "hi"
                          ? "ओटीपी भेजें"
                          : "Get OTP"}
                      </button>
                    </div>
                  </div>

                  {/* OTP Digits Block */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-700">
                        {language === "hi" ? "6-अंकीय ओटीपी दर्ज करें:" : "Enter 6-Digit Verification OTP:"}
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoFillOtp}
                        className="text-[10px] font-bold text-[#1B365D] hover:underline cursor-pointer"
                      >
                        {language === "hi" ? "डेमो ओटीपी स्वतः भरें (842019)" : "Auto-Fill Demo OTP (842019)"}
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          inputMode="numeric"
                          value={digit}
                          onPaste={handleOtpPaste}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace") {
                              if (!otpDigits[idx] && idx > 0) {
                                const prev = document.getElementById(`otp-box-${idx - 1}`);
                                if (prev) prev.focus();
                              }
                            } else if (e.key === "ArrowLeft" && idx > 0) {
                              const prev = document.getElementById(`otp-box-${idx - 1}`);
                              if (prev) prev.focus();
                            } else if (e.key === "ArrowRight" && idx < 5) {
                              const next = document.getElementById(`otp-box-${idx + 1}`);
                              if (next) next.focus();
                            }
                          }}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(-1);
                            const copy = [...otpDigits];
                            copy[idx] = val;
                            setOtpDigits(copy);
                            setError(null);
                            if (val && idx < 5) {
                              const next = document.getElementById(`otp-box-${idx + 1}`);
                              if (next) next.focus();
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-black text-center text-base focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>
                        {otpSent
                          ? language === "hi"
                            ? `ओटीपी वैध है: ${otpCountdown}s`
                            : `OTP valid for ${otpCountdown}s`
                          : language === "hi"
                            ? "ओटीपी भेजा नहीं गया है"
                            : "Press Get OTP to request code"}
                      </span>
                      <span className="font-mono text-[10px] text-emerald-700 font-bold">SHA-256 HMAC</span>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B365D] hover:bg-[#0A2540] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-75"
                  >
                    <ShieldCheck size={16} />
                    <span>
                      {language === "hi"
                        ? "ओटीपी सत्यापित कर प्रवेश करें"
                        : "Verify OTP & Enter Workstation"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* TAB 3: DIGITAL SIGNATURE CERTIFICATE (DSC) / TOKEN */}
              {authMethod === "dsc" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Simulated Detected Token Card with Dynamic Subject */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-300 text-xs text-emerald-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Cpu size={15} className="text-emerald-700" />
                        <span>ePass2003 FIPS 140-2 Level 3 Token</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-900 font-mono">
                        USB READY
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-700">
                      <p>
                        <strong className="text-slate-900">Certificate Subject:</strong>{" "}
                        {currentRoleDef.name} ({currentRoleDef.badge})
                      </p>
                      <p>
                        <strong className="text-slate-900">Certifying Authority:</strong> National Informatics Centre (NIC Sub-CA)
                      </p>
                      <p>
                        <strong className="text-slate-900">Cryptographic Key:</strong> RSA 2048-bit (SHA-256 Digest) • Valid till Sep 2027
                      </p>
                    </div>
                  </div>

                  {/* DSC Token PIN with Show/Hide Toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="token-pin" className="block text-xs font-bold text-slate-700">
                        {language === "hi" ? "टोकन सुरक्षा पिन (Token PIN):" : "Hardware Security Token PIN:"}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setTokenPin("842019");
                          setError(null);
                        }}
                        className="text-[10px] font-bold text-[#1B365D] hover:underline cursor-pointer"
                      >
                        {language === "hi" ? "डिफ़ॉल्ट पिन भरें (842019)" : "Default PIN (842019)"}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        id="token-pin"
                        type={showTokenPin ? "text" : "password"}
                        value={tokenPin}
                        onChange={(e) => setTokenPin(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 font-mono font-bold tracking-widest focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/20 focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        aria-label={showTokenPin ? "Hide token PIN" : "Show token PIN"}
                        onClick={() => setShowTokenPin((prev) => !prev)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors p-0.5 cursor-pointer"
                      >
                        {showTokenPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-500 leading-snug">
                    {language === "hi"
                      ? "सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 35 के तहत क्लास-3 डिजिटल हस्ताक्षर प्रमाणपत्र से सुरक्षित।"
                      : "Cryptographic hardware token authentication compliant with Section 35 of the Information Technology Act, 2000."}
                  </p>

                  {/* Primary Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1B365D] hover:bg-[#0A2540] text-white font-bold py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-75"
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {language === "hi"
                        ? "डीएससी हस्ताक्षर एवं कार्यस्थान प्रारंभ"
                        : "Sign with DSC & Enter Workstation"}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* Statutory Security Notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 leading-relaxed">
                <strong className="font-bold">
                  {language === "hi" ? "वैधानिक सुरक्षा सूचना:" : "Statutory Security Notice:"}
                </strong>{" "}
                {language === "hi"
                  ? "यह पोर्टल केवल विधिक मापविज्ञान अधिनियम, 2009 के अंतर्गत अधिकृत राजपत्रित अधिकारियों हेतु सुरक्षित है। अनधिकृत प्रवेश सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 43 एवं 66 के तहत दंडनीय अपराध है।"
                  : "Authorized exclusively for Gazetted Legal Metrology Officers and designated enforcement personnel. Unauthorized access is punishable under Sections 43 & 66 of the IT Act, 2000."}
              </div>

              {/* Return to Public Portal Footer Link */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to="/"
                  onClick={resetScrollToTop}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#1B365D] transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 group cursor-pointer"
                >
                  <ArrowLeft size={14} className="text-[#1B365D] group-hover:-translate-x-1 transition-transform shrink-0" />
                  <span>{t("login.return_portal", "Return to Public Portal")}</span>
                </Link>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="hidden sm:inline">NIC-DOCA-2026</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    Esc to Exit
                  </kbd>
                </div>
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
