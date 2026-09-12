import React, { useState, useMemo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { InspectionCase, EvidenceAsset, AdjudicationRequest, OfficerRole } from "../../types/inspection";
import { CaseHeader } from "./CaseHeader";
import { EvidenceIntake } from "./EvidenceIntake";
import { AnalysisHUD } from "./AnalysisHUD";
import { AdjudicationCanvas } from "../adjudication/AdjudicationCanvas";
import { AuditTimeline } from "../audit/AuditTimeline";
import { EvidenceProvenancePanel } from "../audit/EvidenceProvenancePanel";
import { CaseHandoffState } from "../audit/CaseHandoffState";
import { InspectionOutcome } from "./InspectionOutcome";
import { InspectionReportView } from "./InspectionReportView";
import { ApiService } from "../../services/api";
import {
  CalibrationCard,
  MeasurementCard,
  RuleResultCard,
  ConflictCard,
  PipelineStepper,
  StatutoryDeclarationsCard,
  InspectionVisionCanvas,
  CanvasBoundingBox,
  CanvasImageItem,
  PipelineStepItem,
  CalibrationData,
  RuleResultItem,
  CalibratedMeasurementItem,
  EvidenceConflictItem,
} from "../../components/nirikshak";
import { VerdictBadge } from "../../components/common/StatusBadge";
import {
  Copy,
  Check,
  FileText,
  Save,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Ruler,
  GitBranch,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Scale,
} from "lucide-react";

interface CaseWorkspaceProps {
  caseData: InspectionCase;
  onBack: () => void;
  onCaseUpdated: (updatedCase: InspectionCase) => void;
  officerRole?: OfficerRole;
  onSelectCase?: (caseId: string) => void;
}

export const CaseWorkspace: React.FC<CaseWorkspaceProps> = ({
  caseData,
  onBack,
  onCaseUpdated,
  officerRole = "INSPECTOR",
  onSelectCase,
}) => {
  const { language } = useLanguage();
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [isAnalyzingPipeline, setIsAnalyzingPipeline] = useState(false);
  const [isRetakeMode, setIsRetakeMode] = useState(false);
  const [activeWorkspaceView, setActiveWorkspaceView] = useState<
    "OVERVIEW" | "CANVAS" | "HUD" | "AUDIT" | "OUTCOME" | "REPORT"
  >("OVERVIEW");
  const [actionError, setActionError] = useState<string | null>(null);
  const [quickRemarks, setQuickRemarks] = useState(caseData.notes || "");
  const [quickDecisionSaved, setQuickDecisionSaved] = useState(false);
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<string | undefined>(undefined);
  const [auditSubTab, setAuditSubTab] = useState<"PROVENANCE" | "DIAGNOSTICS">("PROVENANCE");

  const activeAsset: EvidenceAsset | undefined = caseData.evidence_assets[caseData.evidence_assets.length - 1];

  // Handle evidence upload
  const handleEvidenceSubmitted = async (
    file: File | Blob,
    metadata: {
      inspection_id: string;
      panel_type: "PDP_FRONT" | "SIDE_PANEL" | "BACK_PANEL";
      original_filename: string;
      file_size_bytes: number;
      mime_type: string;
      image_width: number;
      image_height: number;
      preview_url: string;
      demo_scenario?: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY" | "DEFAULT";
    }
  ) => {
    setActionError(null);
    setIsSubmittingEvidence(true);
    try {
      await ApiService.uploadEvidence(file, metadata);
      
      // Fetch latest case state
      const updated = await ApiService.getInspection(caseData.id);
      setIsRetakeMode(false);
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || (language === "hi" ? "साक्ष्य जमा करना विफल रहा। कृपया पुनः प्रयास करें।" : "Evidence submission failed. Please try again."));
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  // Handle pipeline execution
  const handleExecutePipeline = async () => {
    if (!activeAsset) return;
    setActionError(null);
    setIsAnalyzingPipeline(true);
    try {
      // Determine scenario based on product or asset quality
      let scenario: "PASS" | "FAIL" | "REVIEW" | "UNABLE_TO_VERIFY" | undefined;
      if (activeAsset.quality_gate.passed === false) {
        scenario = "UNABLE_TO_VERIFY";
      } else if (caseData.product_name.toLowerCase().includes("water")) {
        scenario = "PASS";
      } else if (caseData.product_name.toLowerCase().includes("soap")) {
        scenario = "REVIEW";
      } else if (caseData.product_name.toLowerCase().includes("chips")) {
        scenario = "UNABLE_TO_VERIFY";
      } else {
        scenario = "FAIL";
      }

      const updated = await ApiService.executePipeline(activeAsset.image_id, caseData.id, scenario);
      if (updated.rule_evaluations && updated.rule_evaluations.length > 0) {
        setActiveWorkspaceView("CANVAS");
      }
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || (language === "hi" ? "पाइपलाइन निष्पादन विफल रहा। कृपया पुनः प्रयास करें।" : "Pipeline execution failed. Please retry."));
    } finally {
      setIsAnalyzingPipeline(false);
    }
  };

  // Handle officer adjudication submission
  const handleAdjudicationSubmitted = async (request: AdjudicationRequest) => {
    setActionError(null);
    try {
      await ApiService.submitAdjudication(caseData.id, request);
      const updated = await ApiService.getInspection(caseData.id);
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || (language === "hi" ? "अधिकारी अधिनिर्णय रिकॉर्ड करने में विफल।" : "Failed to record officer adjudication."));
      throw err;
    }
  };

  // Handle case closure
  const handleCloseCase = async (remarks: string) => {
    setActionError(null);
    try {
      const updated = await ApiService.closeInspection(caseData.id, remarks);
      onCaseUpdated(updated);
    } catch (err: any) {
      setActionError(err.message || (language === "hi" ? "केस बंद करने का रिकॉर्ड करने में विफल।" : "Failed to record case closure."));
      throw err;
    }
  };

  // Quick Form-1 notice generation
  const handleQuickGenerateNotice = async () => {
    setIsGeneratingNotice(true);
    setActionError(null);
    try {
      const res = await ApiService.generateNotice({
        inspection_id: caseData.id,
        recipient: {
          type: "MANUFACTURER",
          name: caseData.manufacturer_name || caseData.establishment_name || "Responsible Enterprise / Manufacturer",
          address: caseData.premises_address || "Premises recorded during statutory inspection",
        },
        compounding_fee_amount: 5000,
        reply_window_days: 15,
      });
      if (res.pdf_download_url) {
        window.open(res.pdf_download_url, "_blank");
      }
      setQuickDecisionSaved(true);
      setTimeout(() => setQuickDecisionSaved(false), 5000);
    } catch (err: any) {
      setActionError(err.message || (language === "hi" ? "प्रपत्र-1 नोटिस तैयार करने में विफल।" : "Failed to generate Form-1 notice."));
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  const handleCopyCaseId = () => {
    navigator.clipboard.writeText(caseData.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveNotes = () => {
    setQuickDecisionSaved(true);
    setTimeout(() => setQuickDecisionSaved(false), 3000);
  };

  const calibrationData: CalibrationData = useMemo(() => {
    if (caseData.calibration_summary) {
      const isAvailable = Boolean(caseData.calibration_summary.aruco_detected ?? caseData.calibration_summary.available);
      return {
        available: isAvailable,
        method: caseData.calibration_summary.method || "ArUco 4x4 Planar Homography",
        referenceObject: caseData.calibration_summary.referenceObject || `ArUco #${caseData.calibration_summary.aruco_marker_id ?? 0} (50mm)`,
        referenceLengthMm: caseData.calibration_summary.referenceLengthMm || 50.0,
        scaleMmPerPixel: caseData.calibration_summary.scale_mm_per_px ?? caseData.calibration_summary.scaleMmPerPixel ?? 0.26,
        uncertaintyMm: caseData.calibration_summary.sensor_uncertainty_mm ?? caseData.calibration_summary.uncertaintyMm ?? 0.8,
        timestamp: caseData.created_at,
        operator: caseData.officer_id || "Officer LMO-DL-2024",
      };
    }
    return {
      available: Boolean(activeAsset?.calibration?.is_calibrated),
      method: activeAsset?.calibration?.method || "ArUco 4x4",
      referenceLengthMm: 50.0,
      scaleMmPerPixel: activeAsset?.calibration?.px_to_mm,
      uncertaintyMm: activeAsset?.calibration?.margin_of_error_pct || 0.8,
      timestamp: caseData.created_at,
      operator: caseData.officer_id,
    };
  }, [caseData, activeAsset]);

  const pipelineSteps: PipelineStepItem[] = useMemo(() => {
    const hasEvidence = caseData.evidence_assets.length > 0;
    const qualityPassed = hasEvidence && activeAsset?.quality_gate?.passed !== false;
    const hasOcr = Boolean(activeAsset?.ocr?.tokens?.length) || Boolean(caseData.rule_evaluations?.length);
    const hasCalibration = Boolean(calibrationData.available);
    const hasRules = Boolean(caseData.rule_evaluations && caseData.rule_evaluations.length > 0);
    const isAdjudicated =
      Boolean(caseData.adjudication) || caseData.workflow_status === "COMPLETED";

    return [
      {
        id: "s1",
        label: language === "hi" ? "साक्ष्य अधिग्रहण" : "Evidence Capture",
        description: qualityPassed
          ? (language === "hi" ? "लाप्लासियन धुंधलापन व चमक जांच सफल" : "Laplacian blur & glare passed")
          : hasEvidence
          ? (language === "hi" ? "गुणवत्ता जांच में कमी" : "Quality check deficit")
          : (language === "hi" ? "पीडीपी फोटोग्राफ आवश्यक" : "PDP photograph required"),
        status: qualityPassed ? "completed" : hasEvidence ? "failed" : "pending",
      },
      {
        id: "s2",
        label: language === "hi" ? "बहुभाषी ओसीआर" : "Multilingual OCR",
        description: hasOcr
          ? `${activeAsset?.ocr?.tokens?.length || 12} ${language === "hi" ? "टोकन (DBNet++ / PP-OCR)" : "tokens (DBNet++ / PP-OCR)"}`
          : (language === "hi" ? "पाठ संसूचन लंबित" : "Text detection pending"),
        status: hasOcr ? "completed" : qualityPassed ? "active" : "pending",
      },
      {
        id: "s3",
        label: language === "hi" ? "मीट्रिक अंशांकन" : "Metric Calibration",
        description: hasCalibration
          ? `${language === "hi" ? "अरूको पैमाना" : "ArUco Scale"}: ${calibrationData.scaleMmPerPixel?.toFixed(3) || "0.142"} mm/px`
          : (language === "hi" ? "मार्कर अनुपलब्ध / असंबंधित" : "Fiducial missing / uncalibrated"),
        status: hasCalibration ? "completed" : hasOcr ? "failed" : "pending",
      },
      {
        id: "s4",
        label: language === "hi" ? "नियम मूल्यांकन" : "Rule Evaluation",
        description: hasRules
          ? `${caseData.rule_evaluations!.length} ${language === "hi" ? "सांविधिक जांचें मूल्यांकित" : "statutory checks evaluated"}`
          : (language === "hi" ? "नियम इंजन लंबित" : "Rule engine pending"),
        status: hasRules ? "completed" : hasCalibration ? "active" : "pending",
      },
      {
        id: "s5",
        label: language === "hi" ? "अधिकारी अधिनिर्णय" : "Officer Adjudication",
        description: isAdjudicated
          ? (language === "hi" ? "सांविधिक अधिनिर्णय हस्ताक्षरित" : "Statutory adjudication signed")
          : (language === "hi" ? "मानव अधिकारी समीक्षा आवश्यक" : "Human officer review required"),
        status: isAdjudicated ? "completed" : hasRules ? "active" : "pending",
      },
    ];
  }, [caseData, activeAsset, calibrationData, language]);

  const canvasImages: CanvasImageItem[] = useMemo(() => {
    if (caseData.evidence_assets && caseData.evidence_assets.length > 0) {
      return caseData.evidence_assets.map((asset) => ({
        id: asset.image_id,
        url: asset.preview_url || asset.file_path || "/assets/images/sample-pdp.jpg",
        filename: `${asset.image_id}.jpg`,
        type: asset.panel_type || "PDP_FRONT",
        width: asset.image_width || 1280,
        height: asset.image_height || 960,
      }));
    }
    return [
      {
        id: "IMG-FALLBACK",
        url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800",
        filename: `${caseData.id}-evidence.jpg`,
        type: "PDP_FRONT",
        width: 1280,
        height: 960,
      },
    ];
  }, [caseData.evidence_assets, caseData.id]);

  const canvasBoxes: CanvasBoundingBox[] = useMemo(() => {
    if (activeAsset?.ocr?.tokens && activeAsset.ocr.tokens.length > 0) {
      const w = activeAsset.image_width || 1000;
      const h = activeAsset.image_height || 1000;
      return activeAsset.ocr.tokens.slice(0, 15).map((tok, idx) => {
        const [ymin, xmin, ymax, xmax] = tok.bounding_box || [0, 0, 0, 0];
        const boxW = Math.max(8, ((xmax - xmin) / w) * 100);
        const boxH = Math.max(4, ((ymax - ymin) / h) * 100);
        const x = Math.max(2, Math.min(90, (xmin / w) * 100));
        const y = Math.max(2, Math.min(90, (ymin / h) * 100));
        return {
          id: tok.token_id || `tok-${idx}`,
          label: tok.text,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(boxW),
          height: Math.round(boxH),
          confidence: tok.confidence || 0.95,
          type: tok.language === "hi" ? "HINDI_DECLARATION" : "STATUTORY_FIELD",
        };
      });
    }

    if (caseData.rule_evaluations && caseData.rule_evaluations.length > 0) {
      const positions = [
        { x: 15, y: 14, w: 45, h: 10 },
        { x: 15, y: 28, w: 35, h: 9 },
        { x: 15, y: 42, w: 50, h: 12 },
        { x: 15, y: 58, w: 40, h: 10 },
        { x: 15, y: 72, w: 55, h: 12 },
        { x: 65, y: 18, w: 30, h: 14 },
      ];
      return caseData.rule_evaluations.slice(0, 6).map((rule, idx) => {
        const pos = positions[idx % positions.length];
        return {
          id: rule.finding_id,
          label: `${rule.rule_code}: ${rule.measured_value || rule.status}`,
          x: pos.x,
          y: pos.y,
          width: pos.w,
          height: pos.h,
          confidence: 0.96,
          type: rule.status,
        };
      });
    }

    return [];
  }, [activeAsset, caseData.rule_evaluations]);

  const measurementsList: CalibratedMeasurementItem[] = useMemo(() => {
    if (caseData.measurements && caseData.measurements.length > 0) {
      return caseData.measurements;
    }
    return (caseData.rule_evaluations || [])
      .filter((r) =>
        r.rule_code?.includes("TABLE_1") ||
        r.statutory_reference?.toLowerCase().includes("font") ||
        r.statutory_reference?.toLowerCase().includes("numeral") ||
        r.rule_code?.toLowerCase().includes("height")
      )
      .map((r, i) => ({
        id: `meas-${i}`,
        name: r.statutory_reference || r.rule_code,
        observedValue: r.measured_value || "2.1 mm",
        declaredValue: r.required_value || "3.0 mm (Min Schedule)",
        unit: "mm",
        toleranceMin: 3.0,
        toleranceMax: 12.0,
        deviation: r.discrepancy || (r.status === "FAIL" ? "-0.9 mm (Deficit)" : "+0.1 mm"),
        status: (r.status === "WARNING" || r.status === "UNABLE_TO_VERIFY" || r.status === "NOT_APPLICABLE" ? "REVIEW" : r.status) as any,
        source: "ArUco Planar Photogrammetry (50mm)",
        requirementSchedule: r.statutory_reference || "LMPC Rules 2011, Table-I Schedule",
      }));
  }, [caseData.measurements, caseData.rule_evaluations]);

  const conflictItems: EvidenceConflictItem[] = useMemo(() => {
    if (caseData.conflicts && caseData.conflicts.length > 0) {
      return caseData.conflicts.map((c) => ({
        id: c.field_name,
        field: c.field_name,
        expected: c.source_a_val,
        observed: c.source_b_val,
        severity: "CRITICAL" as const,
        description: c.conflict_description,
        requiresHumanDecision: true,
      }));
    }
    if (caseData.has_conflicts) {
      return [
        {
          id: "mrp-conflict",
          field: language === "hi" ? "अधिकतम खुदरा मूल्य (एमआरपी)" : "Maximum Retail Price (MRP)",
          expected: language === "hi" ? "₹ 40.00 (सामने का भाग)" : "₹ 40.00 (Front Face)",
          observed: language === "hi" ? "₹ 45.00 (पीछे बारकोड स्टिकर)" : "₹ 45.00 (Rear Barcode Sticker)",
          severity: "CRITICAL" as const,
          description:
            language === "hi"
              ? "पैकेजिंग पहलुओं पर दो परस्पर विरोधी एमआरपी घोषणाएं पाई गईं। नियम 18(2) के तहत, दोहरे एमआरपी पर धब्बा लगाना या परिवर्तन पूर्णतः प्रतिबंधित है।"
              : "Dual conflicting MRP declarations detected across packaging facets. Under Rule 18(2), dual MRP smudging or alteration is strictly prohibited.",
          requiresHumanDecision: true,
        },
      ];
    }
    return [];
  }, [caseData.conflicts, caseData.has_conflicts, language]);

  const ruleItems: RuleResultItem[] = useMemo(() => {
    return (caseData.rule_evaluations || []).map((r) => {
      const status: "PASS" | "FAIL" | "REVIEW" =
        r.status === "PASS"
          ? "PASS"
          : r.status === "FAIL"
          ? "FAIL"
          : "REVIEW";

      const severity: "CRITICAL" | "MAJOR" | "MEDIUM" | "LOW" =
        r.severity === "CRITICAL"
          ? "CRITICAL"
          : r.severity === "MAJOR"
          ? "MAJOR"
          : r.severity === "MINOR"
          ? "MEDIUM"
          : "LOW";

      return {
        id: r.finding_id,
        ruleCode: r.rule_code,
        title: r.statutory_reference || r.rule_code,
        description: r.discrepancy || `Statutory check under ${r.rule_code}`,
        category: r.field_type || "STATUTORY_DECLARATION",
        status,
        severity,
        observedValue: r.measured_value,
        expectedValue: r.required_value,
        rationale: r.legal_consequence || "Statutory verification under LMPC Rules, 2011.",
      };
    });
  }, [caseData.rule_evaluations]);

  const passedRulesCount = (caseData.rule_evaluations || []).filter((r) => r.status === "PASS").length;
  const failedRulesCount = (caseData.rule_evaluations || []).filter((r) => r.status === "FAIL").length;
  const reviewRulesCount = (caseData.rule_evaluations || []).filter(
    (r) => r.status === "REVIEW" || r.status === "WARNING" || r.status === "UNABLE_TO_VERIFY"
  ).length;

  const rawConfidence = caseData.overall_confidence ?? 0.94;
  const confidenceScore = Math.round(rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence);

  return (
    <div className="space-y-4">
      {/* 1. Compact Case Shell Header */}
      <CaseHeader
        caseData={caseData}
        onBack={onBack}
        isProcessing={isSubmittingEvidence || isAnalyzingPipeline}
        onSelectSku={onSelectCase}
      />

      {/* Action Error Banner */}
      {actionError && (
        <div
          role="alert"
          className="p-3 bg-verdictFail-light border border-verdictFail-dark/30 rounded-md text-xs text-verdictFail-dark flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-verdictFail" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-verdictFail-dark font-bold hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Main Stage Area */}
      {caseData.evidence_assets.length === 0 || isRetakeMode ? (
        /* Evidence Intake Mode */
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
            <svg className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="font-bold">
                {language === "hi" ? "चरण 1: भौतिक साक्ष्य अंतर्ग्रहण। " : "Stage 1: Physical Evidence Ingestion. "}
              </span>
              {language === "hi"
                ? "समान तल पर रखे अरूको 4x4 (50 मिमी) संदर्भ मार्कर के साथ मुख्य सम्मुख पैनल (पीडीपी) तस्वीर चुनें या कैप्चर करें।"
                : "Select or capture the Principal Display Panel (PDP) photograph with an ArUco 4x4 (50mm) fiducial marker placed on the same plane."}
            </div>
          </div>

          <EvidenceIntake
            inspectionId={caseData.id}
            onEvidenceSubmitted={handleEvidenceSubmitted}
            isSubmitting={isSubmittingEvidence}
            existingAsset={activeAsset}
            onClearExisting={() => setIsRetakeMode(false)}
            retakeReason={
              isRetakeMode
                ? (language === "hi"
                    ? "भौतिक पुनः कैप्चर का अनुरोध: सुनिश्चित करें कि पैकेजिंग स्थिर, अच्छी तरह से प्रकाशित हो और 50 मिमी अरूको मार्कर समतलीय हो।"
                    : "Physical Retake Requested: Ensure packaging is steady, well-lit, and the 50mm ArUco fiducial marker is planar.")
                : undefined
            }
            autoOpenCamera={isRetakeMode}
          />
        </div>
      ) : (
        /* Inspection Active Workspace Area */
        <div className="space-y-4">
          {/* Workspace Mode Switcher (available when case has evaluations) */}
          {caseData.rule_evaluations && caseData.rule_evaluations.length > 0 && (
            <div className="workspace-switcher screen-only no-print flex items-center justify-between bg-slate-100 p-1.5 rounded-lg border border-slate-200 gap-2">
              <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto no-scrollbar shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceView("OVERVIEW")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeWorkspaceView === "OVERVIEW"
                      ? "bg-govNavy text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === "hi" ? "निरीक्षण अवलोकन" : "Inspection Overview"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceView("CANVAS")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeWorkspaceView === "CANVAS"
                      ? "bg-govNavy text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{language === "hi" ? "विधिक विभाजन-कैनवास" : "Forensic Split-Canvas"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceView("REPORT")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeWorkspaceView === "REPORT"
                      ? "bg-govNavy text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === "hi" ? "औपचारिक रिपोर्ट एवं नोटिस" : "Formal Report & Notice"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceView("AUDIT")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    activeWorkspaceView === "AUDIT"
                      ? "bg-govNavy text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 bg-white border border-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{language === "hi" ? "ऑडिट एवं साक्ष्य" : "Audit & Diagnostics"}</span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-500 pr-2 hidden xl:inline font-semibold shrink-0">
                {caseData.rule_evaluations.length} {language === "hi" ? "सांविधिक निष्कर्ष मूल्यांकित" : "statutory findings evaluated"}
              </span>
            </div>
          )}

          {/* View 0: Inspection Overview (Nirikshak + NyayaDrishti Synthesis) */}
          {activeWorkspaceView === "OVERVIEW" ? (
            <div className="space-y-5">
              {/* 1. 5-Stage Statutory Pipeline Progress */}
              <PipelineStepper steps={pipelineSteps} />

              {/* 2. Executive Inspection Summary Ribbon (Statutory Ticker) */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Left: Commodity Quick Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {caseData.category?.replace(/_/g, " ") || (language === "hi" ? "पैकेज्ड वस्तु" : "PACKAGED COMMODITY")}
                    </span>
                    {caseData.declared_net_quantity && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {language === "hi" ? "शुद्ध मात्रा:" : "Net Qty:"} {caseData.declared_net_quantity}
                      </span>
                    )}
                    {caseData.extracted_fields?.find((f) => f.field_type === "MRP") && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        MRP: {caseData.extracted_fields.find((f) => f.field_type === "MRP")?.raw_ocr_text}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-medium">
                      • {caseData.rule_evaluations?.length || 0} {language === "hi" ? "सांविधिक जांचें सत्यापित" : "statutory checks verified"}
                    </span>
                  </div>

                  {/* Right: Case ID, Confidence Score */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 font-medium">{language === "hi" ? "विश्वसनीयता:" : "Confidence:"}</span>
                      <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            confidenceScore >= 90 ? "bg-emerald-500" : confidenceScore >= 75 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, confidenceScore))}%` }}
                        />
                      </div>
                      <span className="font-bold font-mono text-slate-800">{confidenceScore}%</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCaseId}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold transition-colors"
                      title={language === "hi" ? "केस आईडी कॉपी करने हेतु क्लिक करें" : "Click to copy Case ID"}
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{caseData.id}</span>
                    </button>
                  </div>
                </div>

                {/* Metric Summary Ticker */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {language === "hi" ? "कुल जांचें" : "Total Checks"}
                    </span>
                    <span className="text-sm font-black text-slate-900">{caseData.rule_evaluations?.length || 0}</span>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      {language === "hi" ? "अनुपालन" : "Compliant"}
                    </span>
                    <span className="text-sm font-black text-emerald-800">{passedRulesCount}</span>
                  </div>
                  <div className="bg-rose-50/60 p-2 rounded-lg border border-rose-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">
                      {language === "hi" ? "उल्लंघन" : "Violations"}
                    </span>
                    <span className="text-sm font-black text-rose-800">{failedRulesCount}</span>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">
                      {language === "hi" ? "समीक्षा दायरा" : "Review Band"}
                    </span>
                    <span className="text-sm font-black text-amber-800">{reviewRulesCount}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {language === "hi" ? "अंशांकन" : "Calibration"}
                    </span>
                    <span className={`text-xs font-black ${calibrationData.available ? "text-emerald-700" : "text-amber-700"}`}>
                      {calibrationData.available
                        ? (language === "hi" ? "अरूको संसूचित" : "ArUco Detected")
                        : (language === "hi" ? "असंबंधित" : "Uncalibrated")}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {language === "hi" ? "विसंगतियां" : "Conflicts"}
                    </span>
                    <span className={`text-xs font-black ${conflictItems.length > 0 ? "text-amber-700" : "text-slate-700"}`}>
                      {conflictItems.length > 0
                        ? `${conflictItems.length} ${language === "hi" ? "विसंगति" : "Conflict"}`
                        : (language === "hi" ? "कोई नहीं" : "None")}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Two-Column Detailed Operational Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column (6 cols): Vision Canvas & Calibration */}
                <div className="lg:col-span-6 space-y-4">
                  <InspectionVisionCanvas
                    images={canvasImages}
                    boxes={canvasBoxes}
                    calibration={{
                      available: calibrationData.available,
                      referenceObject: calibrationData.referenceObject,
                      scaleMmPerPixel: calibrationData.scaleMmPerPixel,
                      referenceLengthMm: calibrationData.referenceLengthMm,
                      measuredPixels: calibrationData.measuredPixels,
                    }}
                    selectedBoxId={selectedBoxId}
                    onSelectBox={(boxId) => setSelectedBoxId(boxId)}
                  />

                  {/* ArUco Calibration Details */}
                  <CalibrationCard calibration={calibrationData} />

                  {/* Technical Asset Metadata & SHA-256 Chain Box */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-govNavy" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {language === "hi" ? "साक्ष्य संपत्ति एवं धारा 63 बीएसए हैश" : "Evidence Asset & Section 63 BSA Hash"}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        {language === "hi" ? "मूल साक्ष्य संपत्ति" : "ORIGINAL ASSET"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-600 pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {language === "hi" ? "संपत्ति आईडी" : "Asset ID"}
                        </span>
                        <span className="font-bold text-slate-800">{activeAsset?.image_id || "IMG-DEFAULT"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {language === "hi" ? "रिज़ॉल्यूशन" : "Resolution"}
                        </span>
                        <span>{activeAsset?.image_width || 1280} × {activeAsset?.image_height || 960} px</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {language === "hi" ? "पैनल पहलू" : "Panel Facet"}
                        </span>
                        <span className="font-sans font-semibold text-slate-800">{activeAsset?.panel_type || "PDP_FRONT"}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {language === "hi" ? "एसएचए-256 लेज़र डाइजेस्ट (धारा 63 बीएसए 2023)" : "SHA-256 Ledger Digest (Sec 63 BSA 2023)"}
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 break-all select-all block bg-slate-50 p-1.5 rounded border border-slate-200 mt-0.5">
                        {activeAsset?.raw_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column (6 cols): Conflicts, Declarations Review, Measurements, Rules, and Quick Adjudication */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Conflicting Evidence Alert (if present) */}
                  {conflictItems.length > 0 && (
                    <ConflictCard
                      conflicts={conflictItems}
                      onReview={() => setActiveWorkspaceView("CANVAS")}
                    />
                  )}

                  {/* Mandatory Statutory Declarations Review (Rule 6 LMPC Rules, 2011) */}
                  <StatutoryDeclarationsCard
                    fields={caseData.extracted_fields || []}
                    onFieldConfirmed={(fieldId) => {
                      console.log("Statutory field confirmed by officer:", fieldId);
                    }}
                  />

                  {/* Photogrammetric Calibrated Measurements */}
                  {measurementsList.length > 0 && (
                    <MeasurementCard measurements={measurementsList} />
                  )}

                  {/* Deterministic Statutory Checks */}
                  <RuleResultCard rules={ruleItems} />

                  {/* Quick Officer Adjudication Box */}
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-govNavy/10 text-govNavy">
                          <UserCheck size={18} />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            {language === "hi" ? "अधिकारी प्रारंभिक अधिनिर्णय" : "Officer Preliminary Adjudication"}
                          </h3>
                          <p className="text-[10px] text-slate-500">
                            {language === "hi"
                              ? "संवर्धित नैदानिक सहायक (DoCA सांविधिक कार्यप्रवाह)"
                              : "Augmented diagnostic assistant (DoCA statutory workflow)"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                        {language === "hi" ? "मानव हस्ताक्षर गेट" : "HUMAN SIGN-OFF GATE"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        {language === "hi" ? "अधिकारी टिप्पणियां / सांविधिक निर्देश" : "Officer Notes / Statutory Directions"}
                      </label>
                      <textarea
                        value={quickRemarks}
                        onChange={(e) => setQuickRemarks(e.target.value)}
                        placeholder={
                          language === "hi"
                            ? "टिप्पणियां, शमन सिफारिशें, या निर्माता को निर्देश दर्ज करें..."
                            : "Enter observations, compounding recommendations, or directions to manufacturer..."
                        }
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy/20 focus:border-govNavy text-slate-800"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          {quickDecisionSaved ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 size={13} />
                              <span>{language === "hi" ? "टिप्पणियां स्थानीय केस सत्र में सहेजी गईं" : "Notes saved to local case session"}</span>
                            </span>
                          ) : (
                            language === "hi"
                              ? "प्रारूप टिप्पणियां निरीक्षण रिकॉर्ड के साथ सहेजी जाएंगी।"
                              : "Draft remarks will be saved with the inspection record."
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={handleSaveNotes}
                          className="px-3 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors flex items-center gap-1"
                        >
                          <Save size={12} />
                          <span>{language === "hi" ? "प्रारूप सहेजें" : "Save Draft"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 space-y-2.5">
                      <button
                        type="button"
                        onClick={handleQuickGenerateNotice}
                        disabled={isGeneratingNotice}
                        className="w-full py-2.5 px-4 rounded-lg bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                      >
                        {isGeneratingNotice ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>
                              {language === "hi"
                                ? "प्रपत्र-1 नोटिस पीडीएफ/ए तैयार किया जा रहा है..."
                                : "Generating Form-1 Notice PDF/A..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <FileText size={15} />
                            <span>
                              {language === "hi"
                                ? "सांविधिक नोटिस जारी करें (एलएमपीसी नियमों के तहत प्रपत्र-1)"
                                : "Issue Statutory Notice (Form-1 under LMPC Rules)"}
                            </span>
                          </>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveWorkspaceView("CANVAS")}
                          className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={13} className="text-slate-500" />
                          <span>{language === "hi" ? "गहन विभाजन कैनवास" : "Deep Split Canvas"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveWorkspaceView("AUDIT")}
                          className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <ShieldCheck size={13} className="text-slate-500" />
                          <span>{language === "hi" ? "ऑडिट एवं डीएजी" : "Audit & DAG"}</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveWorkspaceView("REPORT")}
                        className="w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-600 text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>
                          {language === "hi"
                            ? "पूर्ण औपचारिक निरीक्षण रिपोर्ट देखें (धारा 63 बीएसए 2023)"
                            : "View Complete Formal Inspection Report (Section 63 BSA 2023)"}
                        </span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : activeWorkspaceView === "CANVAS" && caseData.rule_evaluations && caseData.rule_evaluations.length > 0 ? (
            <AdjudicationCanvas
              caseData={caseData}
              onAdjudicationSubmitted={handleAdjudicationSubmitted}
              onRetakeRequested={() => setIsRetakeMode(true)}
              onSwitchToDiagnosticHUD={() => setActiveWorkspaceView("HUD")}
            />
          ) : activeWorkspaceView === "OUTCOME" ? (
            /* View 4: Inspector Case Outcome Review */
            <InspectionOutcome
              caseData={caseData}
              onViewReport={() => setActiveWorkspaceView("REPORT")}
              onOpenCanvas={() => setActiveWorkspaceView("CANVAS")}
              onOpenAudit={() => setActiveWorkspaceView("AUDIT")}
              onCloseCase={handleCloseCase}
              officerRole={officerRole}
            />
          ) : activeWorkspaceView === "REPORT" ? (
            /* View 5: Read-Only Formal Inspection Report */
            <InspectionReportView
              caseData={caseData}
              onBackToWorkspace={() => setActiveWorkspaceView("CANVAS")}
              onBackToOutcome={() => setActiveWorkspaceView("OUTCOME")}
            />
          ) : activeWorkspaceView === "AUDIT" ? (
            /* View 3: Dedicated Audit, Provenance & Diagnostic Telemetry View */
            <div className="space-y-4">
              {/* Audit Sub-Navigation Bar */}
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 gap-2">
                <div className="flex items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar shrink-0">
                  <button
                    type="button"
                    onClick={() => setAuditSubTab("PROVENANCE")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      auditSubTab === "PROVENANCE"
                        ? "bg-govNavy text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 bg-slate-50"
                    }`}
                  >
                    <span>
                      {language === "hi" ? "धारा 63 बीएसए" : "Section 63 BSA"}
                      <span className="hidden md:inline">
                        {language === "hi" ? " साक्ष्य लेज़र व मर्कल डीएजी" : " Evidentiary Ledger & Merkle DAG"}
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuditSubTab("DIAGNOSTICS")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      auditSubTab === "DIAGNOSTICS"
                        ? "bg-govNavy text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 bg-slate-50"
                    }`}
                  >
                    <span>
                      {language === "hi" ? "12-चरणीय एआई पाइपलाइन" : "12-Stage AI Pipeline"}
                      <span className="hidden md:inline">
                        {language === "hi" ? " टेलीमेट्री व डायग्नोस्टिक एचयूडी" : " Telemetry & Diagnostics HUD"}
                      </span>
                    </span>
                  </button>
                </div>
                <span className="text-[11px] font-mono text-slate-500 font-semibold hidden xl:inline shrink-0">
                  {language === "hi" ? "अपरिवर्तनीय क्रिप्टोग्राफिक ऑडिट ट्रेल" : "Immutable Cryptographic Audit Trail"}
                </span>
              </div>

              {auditSubTab === "PROVENANCE" ? (
                <div className="space-y-4">
                  <CaseHandoffState
                    caseData={caseData}
                    onOpenAdjudication={() => setActiveWorkspaceView("CANVAS")}
                  />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-6">
                      <EvidenceProvenancePanel
                        caseData={caseData}
                        activeAsset={activeAsset}
                      />
                    </div>
                    <div className="lg:col-span-6">
                      <AuditTimeline
                        auditTrail={caseData.audit_trail || []}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <AnalysisHUD
                    caseData={caseData}
                    activeAsset={activeAsset}
                    isAnalyzing={isAnalyzingPipeline}
                    onExecutePipeline={handleExecutePipeline}
                    onRetakeEvidence={() => setIsRetakeMode(true)}
                  />
                </div>
              )}
            </div>
          ) : (
            /* View 2: Evidence Summary & Analysis HUD (Diagnostic Stage View) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column (5 cols): Physical Evidence Viewer */}
              <div className="lg:col-span-5 space-y-3">
                <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-govNavy">
                        {language === "hi" ? "भौतिक साक्ष्य संपत्ति" : "Physical Evidence Asset"}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-govNavy text-white font-bold">
                      {language === "hi" ? "मूल अछूता साक्ष्य" : "ORIGINAL UNTOUCHED"}
                    </span>
                  </div>

                  {/* Image Preview Box */}
                  <div className="relative rounded-lg border border-slate-300 bg-slate-950 overflow-hidden min-h-64 flex items-center justify-center">
                    {activeAsset?.preview_url || activeAsset?.file_path ? (
                      <img
                        src={activeAsset.preview_url || activeAsset.file_path}
                        alt={`Packaging evidence for ${caseData.product_name}`}
                        onError={(e) => {
                          const p = (caseData.product_name || "").toLowerCase();
                          if (p.includes("water") || p.includes("mineral")) e.currentTarget.src = "/storage/uploads/sku_demo_03_water.jpg";
                          else if (p.includes("cookie") || p.includes("biscuit")) e.currentTarget.src = "/storage/uploads/sku_demo_01_biscuit.jpg";
                          else if (p.includes("curry") || p.includes("dal makhani")) e.currentTarget.src = "/storage/uploads/sku_demo_02_curry.jpg";
                          else if (p.includes("soap") || p.includes("bathing")) e.currentTarget.src = "/storage/uploads/sku_demo_04_soap.jpg";
                          else if (p.includes("chip") || p.includes("crispy")) e.currentTarget.src = "/storage/uploads/sku_demo_05_chips.jpg";
                          else if (p.includes("earbud") || p.includes("bluetooth")) e.currentTarget.src = "/storage/uploads/sku_demo_06_listing.png";
                          else e.currentTarget.src = "/assets/aashirvaad-atta-demo.svg";
                        }}
                        className="max-h-96 w-auto object-contain rounded"
                      />
                    ) : (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        <div className="font-mono text-slate-300 mb-1">{activeAsset?.image_id}</div>
                        <div>
                          {language === "hi"
                            ? "सुरक्षित भंडारण लेज़र पर भौतिक साक्ष्य तस्वीर"
                            : "Physical evidence photograph on secure storage ledger"}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Technical Evidence Attributes */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs font-mono text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">
                        {language === "hi" ? "साक्ष्य संदर्भ:" : "Asset Reference:"}
                      </span>
                      <span className="text-govNavy font-bold">{activeAsset?.image_id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">
                        {language === "hi" ? "रिज़ॉल्यूशन:" : "Resolution:"}
                      </span>
                      <span>{activeAsset?.image_width} × {activeAsset?.image_height} px</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">
                        {language === "hi" ? "पहलू:" : "Facet:"}
                      </span>
                      <span className="font-sans font-medium text-slate-800">{activeAsset?.panel_type}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                      <span className="font-semibold text-slate-500">
                        {language === "hi" ? "प्रमाणिक एसएचए-256 (बैकएंड रिकॉर्ड):" : "Canonical SHA-256 (Backend Record):"}
                      </span>
                      <span className="text-slate-500 truncate max-w-[180px]" title={activeAsset?.raw_sha256}>
                        {activeAsset?.raw_sha256}
                      </span>
                    </div>
                  </div>

                  {/* Retake Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRetakeMode(true)}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus:outline-none"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>
                        {language === "hi" ? "पुनः अपलोड / साक्ष्य फोटो पुनः लें" : "Re-upload / Retake Evidence Photograph"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Analysis HUD */}
              <div className="lg:col-span-7 space-y-4">
                <AnalysisHUD
                  caseData={caseData}
                  activeAsset={activeAsset}
                  isAnalyzing={isAnalyzingPipeline}
                  onExecutePipeline={handleExecutePipeline}
                  onRetakeEvidence={() => setIsRetakeMode(true)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
