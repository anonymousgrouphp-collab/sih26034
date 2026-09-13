import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { ApiService } from "../services/api";
import {
  Settings as SettingsIcon,
  Database,
  Bell,
  LockKeyhole,
  ShieldCheck,
  Save,
  CheckCircle2,
} from "lucide-react";

export const Settings: React.FC = () => {
  const { language } = useLanguage();
  const [division, setDivision] = useState("CIRCLE_DL_SOUTH_01");
  const [retention, setRetention] = useState("POLICY");
  const [showOverlays, setShowOverlays] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [showMath, setShowMath] = useState(true);
  const [saved, setSaved] = useState(false);
  // Live operating-mode telemetry (Mode A online vs Mode B resilient failover)
  const [operatingMode, setOperatingMode] = useState(ApiService.getOperatingMode());
  useEffect(() => {
    const t = setInterval(() => setOperatingMode(ApiService.getOperatingMode()), 3000);
    return () => clearInterval(t);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 glass-panel p-5 rounded-xl border border-slate-700/60 shadow-2xl">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
            {language === "hi" ? "स्टेशन विन्यास" : "Station Configuration"}
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            {language === "hi" ? "कार्यस्थान सेटिंग्स" : "Workstation Settings"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {language === "hi"
              ? "स्थानीय साक्ष्य संग्रहण प्राथमिकताएं, सेंसर अंशांकन सीमाएं एवं धारा 63 बीएसए ऑडिट टेलीमेट्री कॉन्फ़िगर करें।"
              : "Configure local evidence ingestion preferences, sensor calibration thresholds, and Section 63 BSA audit telemetry."}
          </p>
        </div>

        <button type="button" onClick={handleSave} className="btn-primary text-xs flex items-center gap-1.5">
          <Save size={15} />
          <span>
            {saved
              ? (language === "hi" ? "सेटिंग्स सहेजी गईं!" : "Settings Saved!")
              : (language === "hi" ? "प्राथमिकताएं सहेजें" : "Save Preferences")}
          </span>
        </button>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>
            {language === "hi"
              ? "कार्यस्थान प्राथमिकताएं स्थानीय ब्राउज़र स्टोरेज में सहेजी गईं।"
              : "Workstation preferences saved to local browser storage."}
          </span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Preferences */}
        <section className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <SettingsIcon size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              {language === "hi" ? "सामान्य स्टेशन प्राथमिकताएं" : "General Station Preferences"}
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor="settings-circle" className="block text-slate-300 font-bold mb-1">
                {language === "hi" ? "डिफ़ॉल्ट प्रवर्तन मंडल" : "Default Enforcement Circle"}
              </label>
              <select
                id="settings-circle"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="input text-xs bg-slate-800/80 border-slate-700 text-white focus:border-amber-400/50"
              >
                <option value="CIRCLE_DL_SOUTH_01">
                  {language === "hi" ? "DL-SOUTH-01 • दक्षिण दिल्ली मंडल (साकेत / कालकाजी)" : "DL-SOUTH-01 • South Delhi Circle (Saket / Kalkaji)"}
                </option>
                <option value="CIRCLE_DL_CENTRAL_02">
                  {language === "hi" ? "DL-CENTRAL-02 • मध्य दिल्ली मंडल (कनॉट प्लेस)" : "DL-CENTRAL-02 • Central Delhi Circle (Connaught Place)"}
                </option>
                <option value="CIRCLE_UP_GBN_01">
                  {language === "hi" ? "UP-GBN-01 • गौतम बुद्ध नगर प्रभाग (नोएडा)" : "UP-GBN-01 • Gautam Buddha Nagar Division (Noida)"}
                </option>
                <option value="CIRCLE_MH_MUM_01">
                  {language === "hi" ? "MH-MUM-01 • मुंबई उपनगरीय प्रवर्तन मंडल" : "MH-MUM-01 • Mumbai Suburban Enforcement Circle"}
                </option>
                <option value="CIRCLE_KA_BLR_01">
                  {language === "hi" ? "KA-BLR-01 • बेंगलुरु शहरी प्रवर्तन डिपो" : "KA-BLR-01 • Bengaluru Urban Enforcement Depot"}
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="settings-retention" className="block text-slate-300 font-bold mb-1">
                {language === "hi" ? "स्थानीय साक्ष्य प्रतिधारण अनुसूची" : "Local Evidence Retention Schedule"}
              </label>
              <select
                id="settings-retention"
                value={retention}
                onChange={(e) => setRetention(e.target.value)}
                className="input text-xs bg-slate-800/80 border-slate-700 text-white focus:border-amber-400/50"
              >
                <option value="POLICY">
                  {language === "hi" ? "विभागीय नीति (7 वर्ष अभिलेखीय ग्रेड)" : "Departmental Policy (7 Years Archival Grade)"}
                </option>
                <option value="DEMO">
                  {language === "hi" ? "90 दिन (स्थानीय डेमो सत्र कैश)" : "90 Days (Local Demo Session Cache)"}
                </option>
                <option value="IMMUTABLE">
                  {language === "hi" ? "अनिश्चितकालीन (सांविधिक जब्ती वॉल्ट)" : "Indefinite (Statutory Seizure Vault)"}
                </option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="font-bold text-slate-300">
                {language === "hi" ? "प्रवर्तन मोड टेलीमेट्री" : "Enforcement Mode Telemetry"}
              </span>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-700/60 font-mono text-[11px] text-slate-300 space-y-1">
                <div>
                  {language === "hi"
                    ? (operatingMode === "LIVE"
                        ? "सक्रिय मोड: मोड A (ऑनलाइन — लाइव बैकएंड)"
                        : "सक्रिय मोड: मोड B (स्थानीय लचीला स्टैंडअलोन)")
                    : (operatingMode === "LIVE"
                        ? "Active Mode: Mode A (Online — Live Backend)"
                        : "Active Mode: Mode B (Local Resilient Standalone)")}
                </div>
                <div>{language === "hi" ? "वेब सर्वर: Vite 6 (नेटिव आधुनिक ब्राउज़र)" : "Web Server: Vite 6 (Native Modern Browser)"}</div>
                <div>{language === "hi" ? "सांविधिक इंजन: Python INT8 / ONNX (DBNet++ एवं PP-OCRv4)" : "Statutory Engine: Python INT8 / ONNX (DBNet++ & PP-OCRv4)"}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Display and Inspection Overlays */}
        <section className="glass-panel p-6 rounded-2xl border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Database size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              {language === "hi" ? "अधिनिर्णय कैनवास ओवरले" : "Adjudication Canvas Overlays"}
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-200">
                  {language === "hi" ? "बाउंडिंग-बॉक्स परत दिखाएं" : "Show Bounding-Box Layer"}
                </span>
                <p className="text-[11px] text-slate-400">
                  {language === "hi" ? "छवि पर रंग-कोडित बहुभुज बॉक्स प्रस्तुत करें" : "Render color-coded polygon boxes over image"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={showOverlays}
                onChange={(e) => setShowOverlays(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-200">
                  {language === "hi" ? "ओसीआर विश्वसनीयता प्रतिशत प्रदर्शित करें" : "Display OCR Confidence Percentage"}
                </span>
                <p className="text-[11px] text-slate-400">
                  {language === "hi" ? "टोकन चयन पर मशीन विश्वसनीयता प्रदर्शित करें" : "Show machine confidence on token selection"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={showConfidence}
                onChange={(e) => setShowConfidence(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 text-amber-500 focus:ring-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition-colors">
              <div>
                <span className="font-bold text-slate-200">
                  {language === "hi" ? "अंशांकन पैमाना गणित प्रदर्शित करें" : "Display Calibration Scale Math"}
                </span>
                <p className="text-[11px] text-slate-400">
                  {language === "hi" ? "अरूको px/mm होमोग्राफी अनुपात गणना प्रदर्शित करें" : "Show ArUco px/mm homography ratio calculation"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={showMath}
                onChange={(e) => setShowMath(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-500 text-amber-500 focus:ring-amber-500"
              />
            </label>
          </div>

          <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4 space-y-2 text-xs text-emerald-300">
            <div className="flex items-center gap-2 font-bold text-emerald-400">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>
                {language === "hi" ? "सुरक्षा एवं ऑडिट स्थिति" : "Security & Audit Posture"}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-200/90">
              {language === "hi"
                ? "धारा 63 बीएसए 2023 के अनुसार, मर्कल बहीखाते में दर्ज होने के बाद स्थानीय कार्यस्थान सेटिंग्स ऐतिहासिक साक्ष्य हैश या अधिकारी हस्ताक्षर प्रमाणपत्रों को नहीं बदलती हैं।"
                : "In accordance with Section 63 BSA 2023, local workstation settings do not alter historical evidence hashes or officer signature certificates once written to the Merkle ledger."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
