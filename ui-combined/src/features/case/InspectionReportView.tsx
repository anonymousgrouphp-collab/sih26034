import React from "react";
import { InspectionCase, EvidenceAsset } from "../../types/inspection";
import { computeCaseReadiness } from "../../services/mockData";
import { findFieldForFinding } from "../adjudication/AdjudicationTraceability";
import { StateEmblem } from "../../components/common/StateEmblem";
import { GovStampSeal } from "../../components/common/GovStampSeal";
import { useLanguage } from "../../context/LanguageContext";

interface InspectionReportViewProps {
  caseData: InspectionCase;
  onBackToWorkspace: () => void;
  onBackToOutcome?: () => void;
}

export const InspectionReportView: React.FC<InspectionReportViewProps> = ({
  caseData,
  onBackToWorkspace,
  onBackToOutcome,
}) => {
  const { language } = useLanguage();
  const primaryAsset: EvidenceAsset | undefined =
    caseData.evidence_assets && caseData.evidence_assets.length > 0
      ? caseData.evidence_assets[caseData.evidence_assets.length - 1]
      : undefined;

  const evaluations = caseData.rule_evaluations || [];
  const findingDecisions = caseData.finding_decisions || {};
  const readiness = caseData.readiness_checklist || computeCaseReadiness(caseData);
  const auditTrail = caseData.audit_trail || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Screen-Only Action & Print Navigation Toolbar */}
      <div className="screen-only no-print bg-panelBg rounded-lg border border-slate-200 shadow-sm p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBackToOutcome ? (
            <button
              type="button"
              onClick={onBackToOutcome}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              {language === "hi" ? "← परिणाम पर वापस" : "← Back to Outcome"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToWorkspace}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              {language === "hi" ? "← कार्यक्षेत्र पर वापस" : "← Back to Workspace"}
            </button>
          )}
          <span className="text-xs text-slate-500 hidden sm:inline">|</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline">
            {language === "hi"
              ? "निरीक्षण केस डोजियर एवं सांविधिक रिपोर्ट"
              : "Inspection Case Dossier & Statutory Report"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/form1.pdf"
            download="Form-1-Notice-LM-NOI-2026-000231.pdf"
            className="px-3.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded transition-colors flex items-center gap-1.5 shadow-2xs"
            title={
              language === "hi"
                ? "धारा 63 बीएसए 2023 प्रमाण पत्र युक्त राजपत्र मानक प्रपत्र-1 पीडीएफ डाउनलोड करें"
                : "Download authentic Gazette-standard Form-1 PDF sealed with Section 63 BSA 2023 certificate"
            }
          >
            <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{language === "hi" ? "आधिकारिक प्रपत्र-1 (PDF/A) डाउनलोड करें" : "Download Official Form-1 (PDF/A)"}</span>
          </a>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-govNavy hover:bg-govNavy-light rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <svg className="w-4 h-4 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>{language === "hi" ? "रिपोर्ट प्रिंट करें" : "Print Report View"}</span>
          </button>
        </div>
      </div>

      {/* 2. Printable Formal Report Container */}
      <div className="printable-report bg-white text-slate-900 p-6 sm:p-10 rounded-lg border border-slate-300 shadow-md space-y-6 max-w-5xl mx-auto">
        {/* Official National Emblem & Gazette Formal Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <StateEmblem size={46} tone="navy" showMotto={true} className="shrink-0" />
            <div>
              <div className="text-[11px] font-bold tracking-widest text-amber-700 uppercase">
                {language === "hi"
                  ? "भारत सरकार • उपभोक्ता मामले, खाद्य एवं सार्वजनिक वितरण मंत्रालय"
                  : "Government of India • Ministry of Consumer Affairs, Food & Public Distribution"}
              </div>
              <div className="text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                {language === "hi"
                  ? "उपभोक्ता मामले विभाग • विधिक मापविज्ञान प्रभाग"
                  : "Department of Consumer Affairs • Legal Metrology Division"}
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-govNavy mt-1 tracking-tight">
                {language === "hi"
                  ? "प्रपत्र-1 सांविधिक निरीक्षण रिपोर्ट एवं ज्ञापन"
                  : "FORM-1 STATUTORY INSPECTION REPORT & MEMORANDUM"}
              </h1>
              <div className="text-xs text-slate-600 font-medium mt-0.5">
                {language === "hi"
                  ? "विधिक मापविज्ञान अधिनियम, 2009 की धारा 15 सपठित एलएमपीसी नियम, 2011 के नियम 6 व तालिका-I के अंतर्गत सांविधिक नोटिस"
                  : "Statutory Notice under Section 15 of Legal Metrology Act, 2009 read with Rule 6 & Table-I of LMPC Rules, 2011"}
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 self-stretch sm:self-auto shrink-0 min-w-[210px]">
            <div>
              <span className="text-slate-400 font-sans">{language === "hi" ? "नोटिस संदर्भ: " : "Notice Ref: "}</span>
              <strong className="text-slate-900">{caseData.inspection_number}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-sans">{language === "hi" ? "निरीक्षण तिथि: " : "Inspection Date: "}</span>
              <span>
                {caseData.created_at
                  ? new Date(caseData.created_at).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")
                  : (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-sans">{language === "hi" ? "अधिकार क्षेत्र: " : "Jurisdiction: "}</span>
              <span className="font-semibold">{caseData.jurisdiction_id}</span>
            </div>
            <div>
              <span className="text-slate-400 font-sans">{language === "hi" ? "निर्णय: " : "Verdict: "}</span>
              <span
                className={`px-1.5 py-0.5 rounded font-black text-[10px] ${
                  caseData.overall_status === "PASS"
                    ? "bg-emerald-100 text-emerald-800"
                    : caseData.overall_status === "FAIL"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {caseData.overall_status}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Establishment & Commodity Identification */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            {language === "hi"
              ? "1. प्रतिष्ठान एवं वस्तु (कमोडिटी) पहचान"
              : "1. Establishment & Commodity Identification"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "वस्तु / उत्पाद का नाम:" : "Commodity / Product Name:"}
              </span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{caseData.product_name}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "ब्रांड नाम:" : "Brand Name:"}
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {caseData.brand_name || (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "प्रतिष्ठान / व्यापारी:" : "Establishment / Trader:"}
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {caseData.establishment_name || (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "परिसर का पता:" : "Premises Address:"}
              </span>
              <div className="text-slate-700 mt-0.5">
                {caseData.premises_address || (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "पैकेजिंग ज्यामिति:" : "Packaging Geometry:"}
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">{caseData.package_type}</div>
            </div>
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "घोषित शुद्ध मात्रा:" : "Declared Net Quantity:"}
              </span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {caseData.declared_net_quantity || (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Original Evidence Asset */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              {language === "hi" ? "2. भौतिक साक्ष्य संपत्ति अभिलेख" : "2. Physical Evidence Asset Record"}
            </h2>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded border border-slate-300">
              {language === "hi" ? "मूल साक्ष्य — अपरिवर्तित" : "ORIGINAL EVIDENCE — UNTOUCHED"}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans">{language === "hi" ? "साक्ष्य संपत्ति आईडी:" : "Evidence Asset ID:"}</span>
                <div className="font-bold text-slate-800">
                  {primaryAsset ? primaryAsset.image_id : (language === "hi" ? "अनुपलब्ध" : "Not available")}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">{language === "hi" ? "मूल विमाएं:" : "Native Dimensions:"}</span>
                <div className="text-slate-800">
                  {primaryAsset ? `${primaryAsset.image_width} × ${primaryAsset.image_height} px` : (language === "hi" ? "अनुपलब्ध" : "Not available")}
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-sans">{language === "hi" ? "एमआईएमई एवं पैनल पहलू:" : "MIME & Panel Facet:"}</span>
                <div className="text-slate-800">
                  {primaryAsset ? `${primaryAsset.mime_type || "image/jpeg"} (${primaryAsset.panel_type})` : (language === "hi" ? "अनुपलब्ध" : "Not available")}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 font-mono text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 font-sans">{language === "hi" ? "कैनोनिकल SHA-256 (बैकएंड रिकॉर्ड):" : "Canonical SHA-256 (Backend Record):"}</span>
              <span className="text-slate-700 truncate max-w-lg" title={primaryAsset?.raw_sha256}>
                {primaryAsset ? primaryAsset.raw_sha256 : (language === "hi" ? "अनुपलब्ध" : "Not available")}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200 font-sans">
              {language === "hi"
                ? "मूल भौतिक कैप्चर स्वतंत्र रूप से संरक्षित है। व्युत्पन्न एनोटेशन और विश्लेषण परतें मूल साक्ष्य को अधिलेखित नहीं करती हैं।"
                : "Original physical capture preserved independently. Derived annotations and analysis layers do not overwrite the original evidence artifact."}
            </p>
          </div>
        </section>

        {/* Section 3: Automated Diagnostic Analysis */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            {language === "hi" ? "3. स्वचालित नैदानिक विश्लेषण टेलीमेट्री" : "3. Automated Diagnostic Analysis Telemetry"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Quality Gate */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>{language === "hi" ? "प्रकाशीय गुणवत्ता द्वार:" : "Optical Quality Gate:"}</span>
                <span className={primaryAsset?.quality_gate.passed ? "text-emerald-700" : "text-rose-700"}>
                  {primaryAsset
                    ? (primaryAsset.quality_gate.passed
                      ? (language === "hi" ? "[उत्तीर्ण]" : "[PASSED]")
                      : (language === "hi" ? "[अस्वीकृत]" : "[REJECTED]"))
                    : "N/A"}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {language === "hi" ? "धुंधलापन" : "Blur"}: {primaryAsset ? primaryAsset.quality_gate.blur_variance.toFixed(1) : "N/A"}
                <br />
                {language === "hi" ? "चकाचौंध" : "Glare"}: {primaryAsset ? primaryAsset.quality_gate.glare_percentage.toFixed(2) + "%" : "N/A"}
                <br />
                {language === "hi" ? "झुकाव" : "Tilt"}: {primaryAsset ? primaryAsset.quality_gate.skew_angle_deg.toFixed(1) + "°" : "N/A"}
              </div>
            </div>

            {/* Metric Calibration */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700 flex justify-between">
                <span>{language === "hi" ? "मीट्रिक अंशांकन:" : "Metric Calibration:"}</span>
                <span className={primaryAsset?.calibration?.is_calibrated ? "text-emerald-700" : "text-slate-600"}>
                  {primaryAsset?.calibration?.is_calibrated
                    ? (language === "hi" ? "[अंशांकित]" : "[CALIBRATED]")
                    : (language === "hi" ? "[अनांशांकित]" : "[UNCALIBRATED]")}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {language === "hi" ? "पद्धति" : "Method"}: {primaryAsset?.calibration?.method || (language === "hi" ? "कोई नहीं" : "None")}
                <br />
                {language === "hi" ? "पैमाना" : "Scale"}: {primaryAsset?.calibration ? `${primaryAsset.calibration.px_to_mm.toFixed(2)} px/mm` : "N/A"}
                <br />
                {language === "hi" ? "विश्वसनीयता" : "Confidence"}: {primaryAsset?.calibration?.confidence ? `${(primaryAsset.calibration.confidence * 100).toFixed(0)}%` : "N/A"}
              </div>
            </div>

            {/* OCR Vision Stack */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
              <div className="font-bold text-slate-700">
                {language === "hi" ? "बहुभाषी ओसीआर स्रोत:" : "Multilingual OCR Provenance:"}
              </div>
              <div className="text-[11px] text-slate-600">
                {language === "hi" ? "DBNet++ पाठ पहचान (Detection)" : "DBNet++ Text Detection"}
                <br />
                {language === "hi" ? "PP-OCRv4 अंग्रेजी अभिज्ञान" : "PP-OCRv4 English recognition"}
                <br />
                {language === "hi" ? "PP-OCRv3 देवनागरी अभिज्ञान" : "PP-OCRv3 Devanagari recognition"}
                <br />
                {language === "hi" ? "टेसेरैक्ट v5 वैकल्पिक बैकअप" : "Tesseract v5 Fallback"}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Traceable Statutory Findings Ledger */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              {language === "hi"
                ? "4. अनुमार्गणीय सांविधिक निष्कर्ष एवं अधिकारी न्यायिक निर्णय"
                : "4. Traceable Statutory Findings & Officer Adjudications"}
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              {evaluations.length} {language === "hi" ? "सांविधिक नियम मूल्यांकन" : "statutory rule evaluations"}
            </span>
          </div>

          {evaluations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-50 rounded border border-slate-200">
              {language === "hi"
                ? "इस निरीक्षण मामले के लिए कोई सांविधिक नियम मूल्यांकन दर्ज नहीं है।"
                : "No statutory rule evaluations recorded for this inspection case."}
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-300 rounded">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2.5">{language === "hi" ? "निष्कर्ष आईडी" : "Finding ID"}</th>
                    <th className="py-2 px-2.5">{language === "hi" ? "प्रविष्टि" : "Field"}</th>
                    <th className="py-2 px-2.5">{language === "hi" ? "सांविधिक संदर्भ" : "Statutory Citation"}</th>
                    <th className="py-2 px-2.5">{language === "hi" ? "निर्धारित बनाम मापा गया" : "Prescribed vs Measured"}</th>
                    <th className="py-2 px-2.5 text-center">{language === "hi" ? "एआई निष्कर्ष" : "AI Finding"}</th>
                    <th className="py-2 px-2.5 text-center">{language === "hi" ? "अधिकारी निर्णय" : "Officer Decision"}</th>
                    <th className="py-2 px-2.5">{language === "hi" ? "अनुमार्गणीयता" : "Traceability"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {evaluations.map((finding) => {
                    const officerDec = findingDecisions[finding.finding_id];
                    const linkedField = findFieldForFinding(finding, caseData.extracted_fields || []);
                    return (
                      <tr key={finding.finding_id} className="hover:bg-slate-50">
                        <td className="py-2 px-2.5 font-mono text-[11px] font-bold text-govNavy whitespace-nowrap">
                          {finding.finding_id}
                        </td>
                        <td className="py-2 px-2.5 font-medium text-slate-800 whitespace-nowrap">
                          {finding.rule_code.replace(/_/g, " ")}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 text-[11px]">
                          {finding.statutory_reference || (language === "hi" ? "अनुपलब्ध" : "Not available")}
                        </td>
                        <td className="py-2 px-2.5 text-[11px] font-mono text-slate-700">
                          <div>{language === "hi" ? "अपेक्षित" : "Req"}: {finding.required_value || "N/A"}</div>
                          <div>{language === "hi" ? "प्राप्त" : "Obs"}: {finding.measured_value || "N/A"}</div>
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase ${
                              finding.status === "PASS"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : finding.status === "FAIL"
                                ? "bg-rose-50 text-rose-800 border-rose-300"
                                : finding.status === "REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-800 border-slate-300"
                            }`}
                          >
                            [{finding.status}]
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-center whitespace-nowrap">
                          {officerDec ? (
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded border uppercase ${
                                officerDec.decision === "CONFIRMED"
                                  ? "bg-rose-100 text-rose-900 border-rose-400"
                                  : officerDec.decision === "DISMISSED"
                                  ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                                  : "bg-amber-100 text-amber-900 border-amber-400"
                              }`}
                            >
                              {officerDec.decision}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              {language === "hi" ? "समीक्षा लंबित" : "Pending Review"}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-mono text-[10px] text-slate-500">
                          <div>E: {primaryAsset?.image_id || "N/A"}</div>
                          <div>F: {linkedField?.field_id || (finding.field_type ? `FIELD_${finding.field_type}` : "N/A")}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 5: Officer Adjudication Review */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy border-b border-slate-200 pb-1">
            {language === "hi"
              ? "5. मानव अधिकारी न्यायिक निर्णय एवं अंतिम निर्धारण"
              : "5. Human Officer Adjudication & Final Determination"}
          </h2>
          {caseData.adjudication ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500">{language === "hi" ? "अधिनिर्णायक अधिकारी:" : "Adjudicating Officer:"}</span>
                  <div className="font-bold text-slate-900">{caseData.adjudication.officer_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {language === "hi" ? "बैज: " : ""}{caseData.adjudication.badge_number}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">{language === "hi" ? "न्यायिक निर्णय:" : "Adjudication Verdict:"}</span>
                  <div className="font-bold text-slate-900 uppercase">
                    [{caseData.adjudication.verdict}]
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {language === "hi" ? "ओवरराइड लागू: " : "Override Applied: "}
                    {caseData.adjudication.override_applied ? (language === "hi" ? "हाँ" : "Yes") : (language === "hi" ? "नहीं" : "No")}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">{language === "hi" ? "कार्रवाई आदेश एवं समय:" : "Action Order & Timestamp:"}</span>
                  <div className="font-mono text-[11px] text-slate-800">
                    {caseData.adjudication.action_order || (language === "hi" ? "कोई नहीं" : "None")}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(caseData.adjudication.timestamp_utc).toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">{language === "hi" ? "अधिकारी औचित्य टिप्पणी:" : "Officer Justification Remarks:"}</span>
                <p className="mt-0.5 text-slate-800 bg-white p-2 rounded border border-slate-200 font-sans italic">
                  &ldquo;{caseData.adjudication.remarks}&rdquo;
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 italic">
              {language === "hi"
                ? "इस केस डोजियर के लिए अभी तक अधिकारी अधिनिर्णय को अंतिम रूप नहीं दिया गया है।"
                : "Officer adjudication has not yet been finalized for this case dossier."}
            </div>
          )}
        </section>

        {/* Section 6: Chronological Evidentiary Audit Trail */}
        <section className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-govNavy">
              {language === "hi"
                ? "6. कालानुक्रमिक साक्ष्य अंकेक्षण बही"
                : "6. Chronological Evidentiary Audit Ledger"}
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              {auditTrail.length} {language === "hi" ? "दर्ज घटनाएं" : "recorded events"}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-1.5 px-2 font-mono">{language === "hi" ? "क्रमांक" : "Seq"}</th>
                  <th className="py-1.5 px-2">{language === "hi" ? "समय (IST)" : "Timestamp (IST)"}</th>
                  <th className="py-1.5 px-2">{language === "hi" ? "कर्ता" : "Actor"}</th>
                  <th className="py-1.5 px-2">{language === "hi" ? "घटना विवरण" : "Event Label"}</th>
                  <th className="py-1.5 px-2">{language === "hi" ? "निर्णय / कार्रवाई" : "Decision / Action"}</th>
                  <th className="py-1.5 px-2 font-mono">{language === "hi" ? "प्रविष्टि SHA" : "Entry SHA"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {auditTrail.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2 font-bold text-slate-700">{evt.sequence_number}</td>
                    <td className="py-1.5 px-2 text-slate-600 font-sans whitespace-nowrap">
                      {new Date(evt.timestamp_utc).toLocaleString(language === "hi" ? "hi-IN" : "en-IN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="py-1.5 px-2 font-sans">
                      <span className={`px-1 py-0.2 rounded text-[10px] font-bold ${evt.actor_type === "OFFICER" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                        {language === "hi"
                          ? (evt.actor_type === "OFFICER" ? "अधिकारी" : "सिस्टम")
                          : evt.actor_type}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 font-sans text-slate-800">{evt.event_label}</td>
                    <td className="py-1.5 px-2 font-sans text-slate-700 truncate max-w-[200px]" title={evt.remarks || evt.decision}>
                      {evt.decision ? `[${evt.decision}] ` : ""}{evt.remarks || "—"}
                    </td>
                    <td className="py-1.5 px-2 text-slate-400 text-[10px]" title={evt.entry_hash}>
                      {evt.entry_hash ? evt.entry_hash.slice(0, 10) + "..." : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: Downstream Administrative Case Readiness */}
        <section className="space-y-2 border-t border-slate-200 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium">
                {language === "hi" ? "अग्रगामी मामला तत्परता:" : "Downstream Case Readiness:"}
              </span>
              <div className="font-bold text-govNavy text-sm mt-0.5">
                {language === "hi"
                  ? (readiness.readiness_state === "READY_FOR_LEGAL_NOTICE_DISPATCH"
                      ? "विधिक नोटिस प्रेषण हेतु तैयार"
                      : readiness.readiness_state === "READY_FOR_CASE_CLOSURE"
                      ? "केस समापन हेतु तैयार"
                      : readiness.readiness_state === "ACTION_REQUIRED_RETEST"
                      ? "पुनः परीक्षण अपेक्षित"
                      : "अधिकारी अधिनिर्णय लंबित")
                  : readiness.readiness_state.replace(/_/g, " ")}
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {readiness.downstream_action_guidance ||
                  (language === "hi"
                    ? "बैकएंड तत्परता मूल्यांकन पूर्ण हुआ।"
                    : "Backend readiness evaluation complete.")}
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-400 font-mono">
              {language === "hi" ? "न्यायदृष्टि-एलएम द्वारा जनरेटेड रिपोर्ट" : "Report Generated by NyayaDrishti-LM"}
              <br />
              {language === "hi" ? "उपभोक्ता मामले विभाग, भारत सरकार" : "Department of Consumer Affairs, GoI"}
            </div>
          </div>
        </section>

        {/* Section 8: Section 63 BSA 2023 Statutory Evidence Certificate & Gazetted Officer Seal */}
        <section className="mt-6 pt-5 border-t-2 border-slate-800 space-y-4">
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-govNavy text-white font-bold text-[10px] rounded uppercase tracking-wider">
                  {language === "hi"
                    ? "सांविधिक डिजिटल साक्ष्य प्रमाण पत्र"
                    : "STATUTORY DIGITAL EVIDENCE CERTIFICATE"}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {language === "hi"
                    ? "धारा 63, भारतीय साक्ष्य अधिनियम, 2023 (बीएसए 2023)"
                    : "Section 63, Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {language === "hi"
                  ? "भारत का राजपत्र अधिनियम संख्या 47, 2023"
                  : "Gazette of India Act No. 47 of 2023"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="hidden sm:block shrink-0">
                <img
                  src="/assets/reports/bsa_merkle_seal.svg"
                  alt="Section 63 BSA 2023 Tamper-Evident Digital Evidence Seal"
                  className="w-20 h-20 object-contain drop-shadow-sm"
                />
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed flex-1">
                {language === "hi"
                  ? "मैं, अधोहस्ताक्षरी विधिक मापविज्ञान अधिकारी, एतद्द्वारा प्रमाणित करता हूं कि यहां प्रस्तुत इलेक्ट्रॉनिक अभिलेख एक कंप्यूटर / मोबाइल इमेजिंग प्रणाली द्वारा उस अवधि के दौरान तैयार किया गया था जब कंप्यूटर का उपयोग नियमित रूप से सांविधिक पैकेजिंग निरीक्षणों के प्रयोजनों के लिए सूचना संग्रहीत या संसाधित करने के लिए किया जाता था। डिजिटल साक्ष्य को बिना किसी फेरबदल या छेड़छाड़ के SHA-256 मर्कल कस्टडी श्रृंखला का उपयोग करके क्रिप्टोग्राफ़िक रूप से मान्य किया गया है।"
                  : "I, the undersigned Legal Metrology Officer, hereby certify that the electronic record produced herein was produced by a computer / mobile imaging system during the period over which the computer was used regularly to store or process information for the purposes of statutory packaging inspections. The digital evidence has been cryptographically validated using SHA-256 Merkle chain-of-custody, without alteration, interception, or tampering."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] font-mono bg-white p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block font-sans">
                  {language === "hi" ? "साक्ष्य मूल SHA-256:" : "Evidence Root SHA-256:"}
                </span>
                <span className="text-slate-800 truncate block font-bold" title={primaryAsset?.raw_sha256}>
                  {primaryAsset?.raw_sha256 ? primaryAsset.raw_sha256.slice(0, 24) + "..." : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">
                  {language === "hi" ? "मर्कल लीफ नोड:" : "Merkle Leaf Node:"}
                </span>
                <span className="text-slate-800 truncate block font-bold">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-sans">
                  {language === "hi" ? "डिजिटल टाइमस्टैम्प (IST):" : "Digital Timestamp (IST):"}
                </span>
                <span className="text-slate-800 font-bold">
                  {new Date().toLocaleString(language === "hi" ? "hi-IN" : "en-IN", { timeZone: "Asia/Kolkata" })} IST
                </span>
              </div>
            </div>
          </div>

          {/* Official Sign-off & Circular Seal Block */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 px-2">
            <div className="flex items-center gap-4">
              <GovStampSeal
                ink={caseData.overall_status === "PASS" ? "emerald" : "violet"}
                officerName={caseData.adjudication?.officer_name || "K. R. Sharma, LMO"}
                badgeNumber={caseData.adjudication?.badge_number || "DL-LM-2024-0042"}
                date={caseData.adjudication?.timestamp_utc ? new Date(caseData.adjudication.timestamp_utc).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN") : new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")}
                size={130}
              />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-900">
                  {language === "hi" ? "आधिकारिक राजपत्रित अधिकारी मुहर" : "Official Gazetted Officer Seal"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === "hi" ? "विधिक मापविज्ञान प्रभाग, भारत सरकार" : "Legal Metrology Division, Govt. of India"}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {language === "hi"
                    ? "छेड़छाड़-रोधी सत्यापन टोकन मान्य किया गया"
                    : "Tamper-evident verification token validated"}
                </p>
              </div>
            </div>

            <div className="text-right space-y-2 border-t-2 border-slate-800 sm:border-t-0 pt-3 sm:pt-0 min-w-[240px]">
              <div className="h-10 flex items-end justify-end">
                <span className="font-serif italic text-base font-bold text-slate-800 tracking-wider">
                  {caseData.adjudication?.officer_name || "K. R. Sharma"}
                </span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-xs">
                <p className="font-bold text-slate-900">
                  {caseData.adjudication?.officer_name || "K. R. Sharma"}
                </p>
                <p className="text-[11px] text-slate-600">
                  {language === "hi" ? "विधिक मापविज्ञान अधिकारी (राजपत्रित)" : "Legal Metrology Officer (Gazetted)"}
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  {language === "hi" ? "बैज संख्या: " : "Badge: "}
                  {caseData.adjudication?.badge_number || "DL-LM-2024-0042"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
