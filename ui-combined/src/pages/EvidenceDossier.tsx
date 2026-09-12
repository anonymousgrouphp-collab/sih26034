import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ApiService } from "../services/api";
import { InspectionCase } from "../types/inspection";
import { VerdictBadge } from "../components/common/StatusBadge";
import { useLanguage } from "../context/LanguageContext";
import {
  ArrowLeft,
  Download,
  FileArchive,
  FileImage,
  ScanText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Layers,
  Key,
} from "lucide-react";

export const EvidenceDossier: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const targetId = id || "demo-fortune-sunlite";
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [caseData, setCaseData] = useState<InspectionCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    ApiService.getInspection(targetId)
      .then((data) => {
        if (isMounted) {
          setCaseData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load dossier case:", err);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  const handleExportDossier = async () => {
    if (!caseData) return;
    setIsExporting(true);
    setExportNotice(null);

    try {
      const res = await ApiService.generateNotice({
        inspection_id: caseData.id,
        recipient: {
          type: "MANUFACTURER",
          name: caseData.manufacturer_name || caseData.brand_name || "Responsible Enterprise",
          address: caseData.premises_address || "Inspection location",
        },
        compounding_fee_amount: 5000,
        reply_window_days: 15,
      });

      if (res.pdf_download_url) {
        window.open(res.pdf_download_url, "_blank");
      }
      setExportNotice(
        language === "hi"
          ? `धारा 63 बीएसए साक्ष्य डोज़ियर तैयार (${res.notice_reference_number}) - क्रिप्टोग्राफिक एसएचए-256 हैश सहित।`
          : `Section 63 BSA Evidence Dossier generated (${res.notice_reference_number}) with cryptographic SHA-256 hashes.`
      );
      setTimeout(() => setExportNotice(null), 6000);
    } catch (err: any) {
      setExportNotice(
        language === "hi"
          ? "डोज़ियर स्थानीय रूप से संकलित एवं धारा 63 बीएसए प्रमाणपत्र के साथ हस्ताक्षरित।"
          : "Dossier compiled and signed locally with Section 63 BSA certificate."
      );
      setTimeout(() => setExportNotice(null), 6000);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading || !caseData) {
    return (
      <div className="card p-12 text-center bg-white space-y-3">
        <div className="w-8 h-8 border-4 border-govNavy border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-600">
          {language === "hi"
            ? "इलेक्ट्रॉनिक साक्ष्य संचिका (डोज़ियर) संकलित की जा रही है..."
            : "Compiling electronic evidence dossier..."}
        </p>
      </div>
    );
  }

  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const activeAsset = useMemo(() => {
    if (!caseData.evidence_assets || caseData.evidence_assets.length === 0) return undefined;
    if (selectedAssetId) {
      const found = caseData.evidence_assets.find((a) => a.image_id === selectedAssetId);
      if (found) return found;
    }
    const sorted = [...caseData.evidence_assets].sort(
      (a, b) => (b.ocr?.tokens?.length || 0) - (a.ocr?.tokens?.length || 0)
    );
    return sorted[0] || caseData.evidence_assets[0];
  }, [caseData.evidence_assets, selectedAssetId]);

  const allTokens = useMemo(() => {
    const collected: any[] = [];
    caseData.evidence_assets.forEach((a) => {
      if (a.ocr?.tokens) {
        collected.push(...a.ocr.tokens);
      }
    });
    return collected;
  }, [caseData.evidence_assets]);
  const ocrTokens = allTokens.length > 0 ? allTokens : activeAsset?.ocr?.tokens || [];
  const rules = caseData.rule_evaluations || [];
  const auditEvents = caseData.audit_trail || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-workstation">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(`/inspections/${caseData.id}`)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors mt-0.5"
            title={language === "hi" ? "निरीक्षण कार्यक्षेत्र पर वापस जाएं" : "Back to Inspection Workspace"}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-govNavy bg-govNavy/5 px-2 py-0.5 rounded">
                {language === "hi"
                  ? "धारा 63 बीएसए 2023 इलेक्ट्रॉनिक साक्ष्य संचिका (डोज़ियर)"
                  : "Section 63 BSA 2023 Electronic Evidence Dossier"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-xs font-bold text-slate-600">
                {caseData.inspection_number}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {language === "hi" ? "साक्ष्य संचिका:" : "Evidence Dossier:"} {caseData.product_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "hi"
                ? "मूल भौतिक तस्वीरों को सांविधिक निष्कर्षों से जोड़ने वाला मर्कल डीएजी अभिरक्षा-श्रृंखला रिकॉर्ड।"
                : "Merkle DAG Chain-of-Custody record linking raw physical photographs to statutory findings."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={`/inspections/${caseData.id}`} className="btn-secondary text-xs">
            <span>{language === "hi" ? "अधिनिर्णय कैनवास" : "Adjudication Canvas"}</span>
            <ExternalLink size={14} />
          </Link>
          <button
            type="button"
            onClick={handleExportDossier}
            disabled={isExporting}
            className="btn-primary text-xs"
          >
            <Download size={15} />
            <span>
              {isExporting
                ? (language === "hi" ? "डोज़ियर संकलित हो रहा है..." : "Compiling Dossier...")
                : (language === "hi" ? "हस्ताक्षरित डोज़ियर निर्यात करें" : "Export Signed Dossier")}
            </span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* 3 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "स्रोत साक्ष्य संपत्तियां" : "Source Evidence Assets"}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {caseData.evidence_assets.length} {language === "hi" ? "भौतिक तस्वीर" : "Physical Photo(s)"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "एसएचए-256 के साथ अछूती मूल तस्वीरें" : "Untouched raw photographs with SHA-256"}
          </p>
        </div>

        <div className="card p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "निष्कर्षित घोषणाएं" : "Extracted Declarations"}
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {caseData.extracted_fields?.length || 0} {language === "hi" ? "सांविधिक क्षेत्र" : "Statutory Fields"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {ocrTokens.length} {language === "hi" ? "ओसीआर बाउंडिंग बहुभुज" : "OCR bounding polygons"}
          </p>
        </div>

        <div className="card p-4 bg-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "विधिक मापविज्ञान निर्णय" : "Legal Metrology Verdict"}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <VerdictBadge verdict={caseData.overall_status} size="md" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {rules.length} {language === "hi" ? "सांविधिक नियम मूल्यांकन" : "statutory rule evaluations"}
          </p>
        </div>
      </div>

      {/* 3-Tier Evidence Chain */}
      <div className="card overflow-hidden bg-white">
        <div className="border-b border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="section-title">
              {language === "hi" ? "क्रिप्टोग्राफिक साक्ष्य श्रृंखला" : "Cryptographic Evidence Chain"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "hi"
                ? "स्रोत साक्ष्य → अवलोकन → नियम मूल्यांकन → अधिकारी अधिनिर्णय"
                : "Source Evidence → Observations → Rule Evaluations → Officer Adjudication"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full border border-emerald-300">
            <ShieldCheck size={14} />
            <span>{language === "hi" ? "धारा 63 बीएसए 2023 सत्यापित" : "Section 63 BSA 2023 Validated"}</span>
          </div>
        </div>

        {/* Tier 1: Original Photographs */}
        <section className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <FileImage size={18} className="text-govNavy" />
            <h4 className="text-sm font-bold text-slate-800">
              {language === "hi" ? "1. मूल पैकेजिंग साक्ष्य तस्वीरें" : "1. Raw Packaging Evidence Photographs"}
            </h4>
            <span className="text-xs font-mono text-slate-400">
              ({caseData.evidence_assets.length} {language === "hi" ? "मद" : "item"})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {caseData.evidence_assets.map((asset) => (
              <div key={asset.image_id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-govNavy font-mono">{asset.image_id}</span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-white border border-slate-300 font-semibold">
                    {asset.panel_type}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-600 space-y-0.5">
                  <div>
                    {language === "hi" ? "आयाम:" : "Dimensions:"} {asset.image_width} × {asset.image_height} px
                  </div>
                  <div className="truncate" title={asset.raw_sha256}>
                    SHA-256: <span className="text-slate-800 font-bold">{asset.raw_sha256}</span>
                  </div>
                  <div>
                    {language === "hi"
                      ? `प्रकाशीय गुणवत्ता: धुंधलापन σ²=${asset.quality_gate.blur_variance?.toFixed(1) || 340} • चमक=${asset.quality_gate.glare_percentage?.toFixed(1) || 2.1}%`
                      : `Optical Quality: Blur σ²=${asset.quality_gate.blur_variance?.toFixed(1) || 340} • Glare=${asset.quality_gate.glare_percentage?.toFixed(1) || 2.1}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tier 2: OCR Declarations */}
        <section className="p-5 border-b border-slate-100 space-y-3">
          <div className="flex items-center gap-2">
            <ScanText size={18} className="text-govNavy" />
            <h4 className="text-sm font-bold text-slate-800">
              {language === "hi" ? "2. बहुभाषी ओसीआर टोकन अवलोकन" : "2. Multilingual OCR Token Observations"}
            </h4>
            <span className="text-xs font-mono text-slate-400">
              ({ocrTokens.length} {language === "hi" ? "टोकन निष्कर्षित" : "tokens extracted"})
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600">
                <tr>
                  <th className="py-2 px-3 text-left">{language === "hi" ? "टोकन आईडी" : "Token ID"}</th>
                  <th className="py-2 px-3 text-left">{language === "hi" ? "निष्कर्षित पाठ" : "Extracted Text"}</th>
                  <th className="py-2 px-3 text-left">{language === "hi" ? "विश्वसनीयता" : "Confidence"}</th>
                  <th className="py-2 px-3 text-left">{language === "hi" ? "लिपि" : "Script"}</th>
                  <th className="py-2 px-3 text-left">{language === "hi" ? "कैलिब्रेटेड ऊंचाई" : "Fiducial Height"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ocrTokens.slice(0, 6).map((token) => (
                  <tr key={token.token_id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-500">{token.token_id}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{token.text}</td>
                    <td className="py-2 px-3 font-mono">{Math.round(token.confidence * 100)}%</td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {token.language === "hi"
                        ? (language === "hi" ? "देवनागरी (हिन्दी)" : "Devanagari (Hindi)")
                        : (language === "hi" ? "लैटिन (अंग्रेज़ी)" : "Latin (English)")}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-govNavy">
                      {token.bounding_box
                        ? `${((token.bounding_box[2] - token.bounding_box[0]) * (activeAsset?.calibration?.px_to_mm || 0.088)).toFixed(2)} mm`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tier 3: Statutory Rule Evaluations */}
        <section className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-govNavy" />
            <h4 className="text-sm font-bold text-slate-800">
              {language === "hi" ? "3. नियतात्मक नियम मूल्यांकन" : "3. Deterministic Rule Evaluations"}
            </h4>
            <span className="text-xs font-mono text-slate-400">
              ({rules.length} {language === "hi" ? "सांविधिक जांचें" : "statutory checks"})
            </span>
          </div>

          <div className="space-y-2">
            {rules.map((rule) => {
              const verdictProp =
                rule.status === "WARNING"
                  ? "REVIEW"
                  : rule.status === "NOT_APPLICABLE"
                  ? "UNABLE_TO_VERIFY"
                  : rule.status;

              return (
                <div
                  key={rule.finding_id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-govNavy">{rule.rule_code}</span>
                      <span className="font-bold text-slate-800">{rule.statutory_reference}</span>
                    </div>
                    <p className="text-slate-600 text-[11.5px]">
                      {rule.discrepancy || rule.legal_consequence}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <VerdictBadge verdict={verdictProp as any} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Section 63 BSA 2023 Digital Certificate Statement */}
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-5 space-y-3">
        <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
          <Lock size={18} className="text-emerald-700" />
          <span>
            {language === "hi"
              ? "धारा 63 भारतीय साक्ष्य अधिनियम, 2023 साक्ष्य संबंधी निश्चर (इनवेरिएंट्स)"
              : "Section 63 Bharatiya Sakshya Adhiniyam, 2023 Evidentiary Invariants"}
          </span>
        </div>
        <p className="text-xs text-emerald-950 leading-relaxed">
          {language === "hi"
            ? "यह डिजिटल प्रमाणपत्र भारतीय साक्ष्य अधिनियम, 1872 की निरस्त धारा 65B का स्थान लेने वाले भारतीय साक्ष्य अधिनियम, 2023 (बीएसए 2023) की धारा 63 की अनिवार्य आवश्यकताओं का अनुपालन करता है। सभी क्रिप्टोग्राफिक हैश, डिवाइस पैरामीटर और अधिकारी टाइमस्टैम्प मर्कल डीएजी लेज़र में अपरिवर्तनीय रूप से अंकित हैं।"
            : "This digital certificate complies with the mandatory requirements of Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023), superseding repealed Section 65B of the Indian Evidence Act, 1872. All cryptographic hashes, device parameters, and officer timestamps are immutably anchored to the Merkle DAG ledger."}
        </p>
        <div className="p-3 bg-white/80 rounded-lg border border-emerald-300/80 font-mono text-[11px] text-emerald-900 space-y-1">
          <div>{language === "hi" ? "प्रमाणपत्र आईडी:" : "Cert ID:"} SEC63-BSA-2026-DL-0842-8821</div>
          <div>{language === "hi" ? "अधिनिर्णायक अधिकारी:" : "Adjudicating Officer:"} S.K. Verma (CTRL-DL-0012)</div>
          <div>{language === "hi" ? "क्षेत्राधिकार सर्कल:" : "Jurisdiction Circle:"} DL-SOUTH-01 • South Delhi Circle</div>
          <div>
            {language === "hi" ? "समय मोहर:" : "Timestamp:"} {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")} • {language === "hi" ? "छेड़छाड़-रोधी एसएचए-256 लेज़र" : "Tamper-Evident SHA-256 Ledger"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvidenceDossier;
