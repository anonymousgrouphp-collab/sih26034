import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { StateEmblem } from "../components/common/StateEmblem";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { useLanguage } from "../context/LanguageContext";
import {
  FileQuestion,
  Home,
  ArrowLeft,
  ClipboardList,
} from "lucide-react";

export const NotFound: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surfaceBg flex flex-col font-sans">
      {/* Official GIGW 3.0 Top Utility Bar */}
      <GovTopBar />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fade-in">
          {/* Sovereign Masthead */}
          <div className="bg-govNavy text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="p-2 bg-white/10 backdrop-blur-xs rounded-xl border border-white/20 shadow-inner">
                <StateEmblem size={44} tone="white" showMotto={true} />
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                {language === "hi"
                  ? "भारत सरकार • उपभोक्ता मामले विभाग"
                  : "Government of India • Department of Consumer Affairs"}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {language === "hi" ? "विधिक मापविज्ञान पोर्टल" : "Legal Metrology Inspection Portal"}
              </h1>
            </div>
          </div>

          {/* 404 Error Body */}
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="flex justify-center mb-1">
              <img
                src="/assets/errors/error_404_dossier.svg"
                alt="404 Case Dossier Not Found Illustration"
                className="w-48 h-36 object-contain drop-shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full">
                {language === "hi" ? "त्रुटि कोड: 404 // सांविधिक रिकॉर्ड नहीं मिला" : "Error Code: 404 // Statutory Record Not Found"}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {language === "hi"
                  ? "पृष्ठ या निरीक्षण मामला नहीं मिला"
                  : "Requested Page or Case Dossier Not Found"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                {language === "hi"
                  ? "आपके द्वारा अनुरोधित URL या केस फ़ाइल उपलब्ध नहीं है अथवा स्थानांतरित कर दी गई है। कृपया नीचे दिए गए आधिकारिक विकल्पों का उपयोग करें।"
                  : "The statutory URL or inspection case record you requested does not exist, has expired, or may have been re-indexed in another enforcement division."}
              </p>
            </div>

            {/* Quick Recovery Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
              <Link
                to="/dashboard"
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-govNavy/40 hover:bg-slate-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-govNavy/5 text-govNavy group-hover:bg-govNavy group-hover:text-white transition-colors shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {language === "hi" ? "कार्यकारी डैशबोर्ड" : "Executive Dashboard"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {language === "hi" ? "निरीक्षण नियंत्रण कक्ष पर लौटें" : "Return to inspection control centre"}
                  </div>
                </div>
              </Link>

              <Link
                to="/inspections"
                className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-govNavy/40 hover:bg-slate-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-govNavy/5 text-govNavy group-hover:bg-govNavy group-hover:text-white transition-colors shrink-0">
                  <ClipboardList size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {language === "hi" ? "निरीक्षण पंजी" : "Inspection Register"}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {language === "hi" ? "सक्रिय जिंस मामले देखें" : "Browse active commodity cases"}
                  </div>
                </div>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={14} />
                <span>{language === "hi" ? "पिछली स्क्रीन पर वापस जाएं" : "Go Back to Previous Screen"}</span>
              </button>
              <Link
                to="/rules"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-govNavy text-xs font-bold text-white hover:bg-govNavy-light transition-colors shadow-xs"
              >
                <span>{language === "hi" ? "एलएमपीसी सांविधिक नियम देखें" : "Browse LMPC Statutory Rules"}</span>
              </Link>
            </div>

            {/* Support / Helpdesk Disclaimer */}
            <div className="pt-2 text-[11px] text-slate-400 font-mono">
              {language === "hi"
                ? "राष्ट्रीय उपभोक्ता हेल्पलाइन: 1915 • ई-माप प्रवर्तन डेस्क • न्यायदृष्टि-एलएम"
                : "National Consumer Helpline: 1915 • eMaap Enforcement Desk • NyayaDrishti-LM"}
            </div>
          </div>
        </div>
      </main>

      {/* Official Government Footer */}
      <GovFooter />
    </div>
  );
};

export default NotFound;
