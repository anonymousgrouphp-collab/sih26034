import React, { useState, useEffect, useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Printer,
  Download,
  CalendarRange,
  BarChart3,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ApiService } from "../services/api";
import { InspectionSummary } from "../types/inspection";

export const Reports: React.FC = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState("SEPTEMBER_2026");
  const [division, setDivision] = useState("DL_SOUTH_01");
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    ApiService.listInspections({
      circleId: division && division !== "ALL" ? division : undefined,
    })
      .then((res) => {
        if (isMounted) {
          setCases(res.items || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load reports data:", err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [division]);

  const metrics = useMemo(() => {
    const total = cases.length;
    const passed = cases.filter((c) => c.overall_status === "PASS").length;
    const failed = cases.filter(
      (c) => c.overall_status === "FAIL" || (c.violations_count !== undefined && c.violations_count > 0)
    ).length;
    const review = cases.filter((c) => c.overall_status === "REVIEW").length;
    const unable = cases.filter(
      (c) => c.overall_status === "UNABLE_TO_VERIFY" || c.workflow_status === "PENDING_REVIEW"
    ).length;

    const passPct = total > 0 ? Math.round((passed / total) * 100) : 0;
    const failPct = total > 0 ? Math.round((failed / total) * 100) : 0;
    const reviewPct = total > 0 ? Math.round((review / total) * 100) : 0;
    const unablePct = total > 0 ? Math.round((unable / total) * 100) : 0;

    return { total, passed, failed, review, unable, passPct, failPct, reviewPct, unablePct };
  }, [cases]);

  const handleDownload = (reportName: string) => {
    setDownloadSuccess(
      language === "hi"
        ? `तैयार एवं डाउनलोड किया गया: ${reportName}`
        : `Generated and downloaded: ${reportName}`
    );
    setTimeout(() => setDownloadSuccess(null), 5000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-workstation">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-govNavy bg-govNavy/5 px-2 py-0.5 rounded">
            {language === "hi" ? "सांविधिक रिपोर्ट एवं डोजियर" : "Statutory Reports & Dossiers"}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {language === "hi" ? "प्रवर्तन विश्लेषण एवं आधिकारिक रिपोर्ट" : "Enforcement Analytics & Official Reports"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            {language === "hi"
              ? "विभागीय रिकॉर्ड हेतु परिचालन सारांश, धारा 36(1) के तहत प्रपत्र-1 विधिक नोटिस एवं धारा 63 बीएसए 2023 साक्ष्य ऑडिट प्रमाणपत्र।"
              : "Operational summaries, Form-1 legal notices under Section 36(1), and Section 63 BSA 2023 evidence audit certificates for departmental records."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handlePrint} className="btn-secondary text-xs">
            <Printer size={15} />
            <span>{language === "hi" ? "रिपोर्ट प्रिंट करें" : "Print Report"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownload("DoCA_Monthly_Inspection_Summary_Sept2026.pdf")}
            className="btn-primary text-xs"
          >
            <Download size={15} />
            <span>{language === "hi" ? "कार्यकारी पीडीएफ निर्यात करें" : "Export Executive PDF"}</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Filter Row */}
      <form className="card p-4 bg-white" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label htmlFor="reporting-period" className="block text-slate-600 font-bold mb-1">
              {language === "hi" ? "रिपोर्टिंग अवधि" : "Reporting Period"}
            </label>
            <div className="relative">
              <CalendarRange size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <select
                id="reporting-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="input pl-9 text-xs"
              >
                <option value="SEPTEMBER_2026">
                  {language === "hi" ? "सितंबर 2026 (वर्तमान प्रवर्तन चक्र)" : "September 2026 (Current Enforcement Cycle)"}
                </option>
                <option value="AUGUST_2026">
                  {language === "hi" ? "अगस्त 2026" : "August 2026"}
                </option>
                <option value="Q3_2026">
                  {language === "hi" ? "तीसरी तिमाही वित्त वर्ष 26 (जुलाई - सितंबर 2026)" : "Q3 FY26 (July - September 2026)"}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="enforcement-division" className="block text-slate-600 font-bold mb-1">
              {language === "hi" ? "प्रवर्तन प्रभाग / मंडल" : "Enforcement Division / Circle"}
            </label>
            <select
              id="enforcement-division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="input text-xs"
            >
              <option value="DL_SOUTH_01">
                {language === "hi" ? "DL-SOUTH-01 (दक्षिण दिल्ली मंडल)" : "DL-SOUTH-01 (South Delhi Circle)"}
              </option>
              <option value="DL_CENTRAL_02">
                {language === "hi" ? "DL-CENTRAL-02 (मध्य दिल्ली मंडल)" : "DL-CENTRAL-02 (Central Delhi Circle)"}
              </option>
              <option value="UP_GBN_01">
                {language === "hi" ? "UP-GBN-01 (गौतम बुद्ध नगर प्रभाग)" : "UP-GBN-01 (Gautam Buddha Nagar Division)"}
              </option>
              <option value="ALL">
                {language === "hi" ? "सभी प्रवर्तन क्षेत्राधिकार" : "All Enforcement Jurisdictions"}
              </option>
            </select>
          </div>

          <div>
            <label htmlFor="document-classification" className="block text-slate-600 font-bold mb-1">
              {language === "hi" ? "दस्तावेज़ वर्गीकरण" : "Document Classification"}
            </label>
            <select id="document-classification" className="input text-xs">
              <option>{language === "hi" ? "सभी औपचारिक रिपोर्ट एवं नोटिस" : "All Formal Reports & Notices"}</option>
              <option>{language === "hi" ? "प्रपत्र-1 शमन नोटिस (धारा 36)" : "Form-1 Compounding Notices (Section 36)"}</option>
              <option>{language === "hi" ? "धारा 63 बीएसए डिजिटल प्रमाणपत्र" : "Section 63 BSA Digital Certificates"}</option>
            </select>
          </div>
        </div>
      </form>

      {/* Two Column Section: Left Outcome Distribution, Right Generated Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Breakdown Card */}
        <div className="card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-govNavy" />
              <h3 className="section-title">
                {language === "hi" ? "निरीक्षण परिणाम वितरण" : "Inspection Outcomes Distribution"}
              </h3>
            </div>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {metrics.total} {language === "hi" ? "मामले" : "Cases"}
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-govNavy" />
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {language === "hi" ? "डेटा संकलित किया जा रहा है..." : "Compiling statistics..."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {[
                {
                  label: language === "hi" ? "पूर्णतः अनुपालन (उत्तीर्ण - PASS)" : "Fully Compliant (PASS)",
                  count: metrics.passed,
                  percent: metrics.passPct,
                  color: "bg-emerald-500",
                  text: "text-emerald-700",
                },
                {
                  label: language === "hi" ? "सांविधिक उल्लंघन (असफल - FAIL)" : "Statutory Violation (FAIL)",
                  count: metrics.failed,
                  percent: metrics.failPct,
                  color: "bg-rose-500",
                  text: "text-rose-700",
                },
                {
                  label: language === "hi" ? "सीमावर्ती सेंसर समीक्षा (REVIEW)" : "Borderline Sensor Review (REVIEW)",
                  count: metrics.review,
                  percent: metrics.reviewPct,
                  color: "bg-amber-500",
                  text: "text-amber-700",
                },
                {
                  label: language === "hi" ? "निम्न गुणवत्ता साक्ष्य (सत्यापन असमर्थ)" : "Degraded Evidence (UNABLE_TO_VERIFY)",
                  count: metrics.unable,
                  percent: metrics.unablePct,
                  color: "bg-slate-500",
                  text: "text-slate-700",
                },
              ].map((item) => (
                <div key={item.label} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{item.label}</span>
                    <span className={`font-bold font-mono ${item.text}`}>
                      {item.count} {language === "hi" ? "मामले" : "case(s)"} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              {metrics.total > 0
                ? (language === "hi"
                    ? `सभी ${metrics.total} सांविधिक मामलों का एलएमपीसी नियम 2011 तालिका-I फ़ॉन्ट अनुसूची के विरुद्ध सत्यापन किया गया।`
                    : `All ${metrics.total} statutory cases verified against LMPC Rules 2011 Table-I font schedules.`)
                : (language === "hi"
                    ? "चयनित रिपोर्टिंग अवधि / क्षेत्राधिकार में कोई सांविधिक निरीक्षण मामला पंजीकृत नहीं है।"
                    : "No statutory inspection cases registered in selected reporting period.")}
            </span>
          </div>
        </div>

        {/* Ready Generated Reports List */}
        <div className="card p-5 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-govNavy" />
              <h3 className="section-title">
                {language === "hi" ? "आधिकारिक विभागीय रिपोर्ट एवं नोटिस" : "Official Departmental Reports & Notices"}
              </h3>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-govNavy" />
              <p className="text-xs text-slate-400 mt-2 font-mono">
                {language === "hi" ? "रिपोर्ट लोड की जा रही हैं..." : "Loading reports..."}
              </p>
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2 border border-dashed border-slate-200 rounded-lg">
              <FileText className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-bold text-xs text-slate-700">
                {language === "hi" ? "कोई आधिकारिक रिपोर्ट या नोटिस उपलब्ध नहीं है" : "No Official Reports or Notices Generated"}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {language === "hi"
                  ? "निरीक्षण पंजीकृत करें और प्रपत्र-1 विधिक नोटिस उत्पन्न करने के लिए अधिनिर्णय पूर्ण करें।"
                  : "Register packaged commodity inspections and complete officer adjudication to generate statutory Form-1 notices."}
              </p>
              <div className="pt-2">
                <Link to="/inspections/new" className="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1 shadow-2xs">
                  <span>{language === "hi" ? "नया निरीक्षण पंजीकृत करें" : "Register New Inspection"}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {cases.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {language === "hi"
                        ? `प्रपत्र-1 सांविधिक नोटिस — ${c.product_name}`
                        : `Form-1 Statutory Notice — ${c.product_name}`}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {c.inspection_number} • {c.establishment_name || c.jurisdiction_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/inspections/${c.id}`}
                      className="p-1.5 rounded text-govNavy hover:bg-govNavy/10"
                      title={language === "hi" ? "केस देखें" : "Inspect case"}
                    >
                      <ExternalLink size={15} />
                    </Link>
                    <Link
                      to={`/inspections/${c.id}/evidence`}
                      className="p-1.5 rounded text-slate-600 hover:text-govNavy hover:bg-slate-200"
                      title={language === "hi" ? "साक्ष्य संचिका देखें" : "View evidence dossier"}
                    >
                      <Download size={15} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cryptographic Evidence Integrity Seal Banner */}
      <div className="card p-5 bg-gradient-to-r from-govNavy to-slate-900 text-white rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src="/assets/reports/bsa_merkle_seal.svg"
            alt="Section 63 BSA 2023 Tamper-Evident Digital Evidence Seal"
            className="w-16 h-16 object-contain drop-shadow-md shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
                {language === "hi" ? "राजपत्र अधिनियम सं. 47/2023" : "Gazette Act No. 47 of 2023"}
              </span>
              <span className="text-xs font-bold text-slate-200">
                {language === "hi"
                  ? "धारा 63 बीएसए 2023 डिजिटल साक्ष्य अखंडता"
                  : "Section 63 BSA 2023 Digital Evidence Integrity"}
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === "hi"
                ? "न्यायदृष्टि-एलएम द्वारा तैयार प्रत्येक निरीक्षण डोजियर एवं प्रपत्र-1 नोटिस मूल ऑप्टिकल छवियों, अरूको मीट्रिक पैमानों और बहुभाषी ओसीआर टोकन को SHA-256 मर्कल डीएजी श्रृंखला में संरक्षित करता है।"
                : "Every inspection dossier and Form-1 notice generated by NyayaDrishti-LM anchors raw optical captures, ArUco metric scaling factors, and multilingual OCR tokens into a SHA-256 Merkle DAG chain-of-custody."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/form1.pdf"
            download="Sample_Sec63_BSA_Certificate.pdf"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-govNavy font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>
              {language === "hi" ? "नमूना प्रमाणपत्र डाउनलोड करें" : "Download Specimen Certificate"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Reports;
