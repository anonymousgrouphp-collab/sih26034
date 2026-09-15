import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2, Loader2, Clock,
  FileText,
  Info,
  ScanLine,
  ShieldCheck,
  UploadCloud,
  FileImage,
  X,
  Sparkles,
  Sun,
  Maximize2,
  Square,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Building2,
  MapPin,
  Scale,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";
import { ApiService } from "../services/api";
import { GoldenSkuQuickSelector } from "../features/desk/GoldenSkuQuickSelector";
import { PackagingType, InspectionType } from "../types/inspection";
import { InspectionCameraModal } from "../components/camera";
import { StatutoryPipelineRail } from "../components/nirikshak";
import { useCircle } from "../context/CircleContext";
import { useLanguage } from "../context/LanguageContext";
import { StorageService } from "../services/storage";
import { resetScrollToTop } from "../components/common/ScrollToTop";

interface PipelineStepItem {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "completed" | "failed";
}

const INITIAL_STEPS: PipelineStepItem[] = [
  { id: "capture", label: "Evidence Capture", description: "Package photograph with ArUco marker.", status: "active" },
  { id: "quality", label: "Quality Gate", description: "Sharpness and surface glare checks.", status: "pending" },
  { id: "calibration", label: "Metric Calibration", description: "Millimeter scale via 50mm fiducial.", status: "pending" },
  { id: "ocr", label: "Text Recognition", description: "Multilingual declarations extraction.", status: "pending" },
  { id: "rules", label: "Rule Evaluation", description: "Table-I font schedule and Rule 6 checks.", status: "pending" },
  { id: "review", label: "Officer Adjudication", description: "Findings sign-off and Form-1 notice.", status: "pending" },
];

export const NewInspection: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const getStepLabel = (id: string) => {
    if (language !== "hi") {
      switch (id) {
        case "capture": return "Evidence Capture";
        case "quality": return "Quality Gate";
        case "calibration": return "Metric Calibration";
        case "ocr": return "Text Recognition";
        case "rules": return "Rule Evaluation";
        case "review": return "Officer Adjudication";
        default: return id;
      }
    }
    switch (id) {
      case "capture": return "साक्ष्य अधिग्रहण";
      case "quality": return "गुणवत्ता द्वार";
      case "calibration": return "मीट्रिक अंशांकन";
      case "ocr": return "पाठ पहचान (OCR)";
      case "rules": return "नियम मूल्यांकन";
      case "review": return "अधिकारी न्यायनिर्णयन";
      default: return id;
    }
  };

  const getStepDesc = (id: string) => {
    if (language !== "hi") {
      switch (id) {
        case "capture": return "Package photograph with ArUco marker.";
        case "quality": return "Sharpness and surface glare checks.";
        case "calibration": return "Millimeter scale via 50mm fiducial.";
        case "ocr": return "Multilingual declarations extraction.";
        case "rules": return "Table-I font schedule and Rule 6 checks.";
        case "review": return "Findings sign-off and Form-1 notice.";
        default: return "";
      }
    }
    switch (id) {
      case "capture": return "ArUco संदर्भ के साथ पैकेज फोटोग्राफ।";
      case "quality": return "स्पष्टता एवं सतह चमक परीक्षण।";
      case "calibration": return "50 मिमी संदर्भ द्वारा मिलीमीटर स्केल।";
      case "ocr": return "बहुभाषी विधिक घोषणा निष्कर्षण।";
      case "rules": return "तालिका-I फॉन्ट एवं नियम 6 अनुपालन।";
      case "review": return "विधिक निष्कर्ष हस्ताक्षर एवं प्रपत्र-1।";
      default: return "";
    }
  };

  // Mode: Field Capture vs Benchmark Scenarios
  const [activeTab, setActiveTab] = useState<"FIELD_CAPTURE" | "BENCHMARK_SKUS">("FIELD_CAPTURE");
  const { activeCircle, setActiveCircle, allCircles } = useCircle();

  useEffect(() => {
    resetScrollToTop();
  }, [activeTab]);

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [steps, setSteps] = useState<PipelineStepItem[]>(INITIAL_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgressMessage, setUploadProgressMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorFileIndex, setErrorFileIndex] = useState<number | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [completedUploads, setCompletedUploads] = useState<Set<number>>(new Set());
  const [showGuidanceModal, setShowGuidanceModal] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields (Rule 6)
  const [productName, setProductName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("FOOD_SNACKS");
  const [declaredNetQty, setDeclaredNetQty] = useState("");
  const [packageType, setPackageType] = useState<PackagingType>("RECTANGULAR");
  const [inspectionType, setInspectionType] = useState<InspectionType>("ROUTINE_MARKET_SURVEILLANCE");
  const [showManualFields, setShowManualFields] = useState(false);

  // Dashboard "E-Commerce Listing Audit" quick action deep-links here with
  // ?mode=ecommerce — preset the packaging type to the canonical Rule 6(10) value.
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Load draft on mount
    const draft = StorageService.getDraft();
    if (draft) {
      if (draft.product_name) {
        setProductName(draft.product_name);
        setShowManualFields(true);
      }
      if (draft.brand_name) setBrandName(draft.brand_name);
      if (draft.category) setCategory(draft.category);
      if (draft.package_type) setPackageType(draft.package_type as PackagingType);
      if (draft.declared_net_qty) setDeclaredNetQty(draft.declared_net_qty);
    }
    
    // Override if e-commerce deep-link
    if (searchParams.get("mode") === "ecommerce") {
      setPackageType("ECOMMERCE_LISTING");
      setShowManualFields(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Save draft when form fields change
    StorageService.saveDraft({
      product_name: productName,
      brand_name: brandName,
      category,
      package_type: packageType,
      jurisdiction_id: activeCircle || "CIRCLE_DL_SOUTH_01",
      declared_net_qty: declaredNetQty,
      saved_at: new Date().toISOString()
    });
  }, [productName, brandName, category, packageType, declaredNetQty, activeCircle]);

  const getPersistentPreview = (file: File, fallbackPreview?: string): Promise<string> => {
    if (fallbackPreview && fallbackPreview.startsWith("data:image/")) {
      return Promise.resolve(fallbackPreview);
    }
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith("image/")) {
        resolve(fallbackPreview || URL.createObjectURL(file));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve(fallbackPreview || URL.createObjectURL(file));
          return;
        }
        const img = new Image();
        img.onload = () => {
          try {
            const maxDim = 1024;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL("image/jpeg", 0.75));
              return;
            }
          } catch {
            // Fallback to dataUrl
          }
          resolve(dataUrl);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = () => resolve(fallbackPreview || URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelected = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    const fileList = Array.from(newFiles);
    const startIdx = files.length;
    // Preserve original, uncompressed File objects in state for statutory analysis
    setFiles((prev) => [...prev, ...fileList]);
    const previews = fileList.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);

    // Generate lightweight thumbnail previews for UI display without altering original File objects
    fileList.forEach((f, idx) => {
      getPersistentPreview(f).then((persistentUrl) => {
        setFilePreviews((prev) => {
          const next = [...prev];
          const pos = startIdx + idx;
          if (pos < next.length) {
            next[pos] = persistentUrl;
          }
          return next;
        });
      });
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    setErrorMessage(null);
    setErrorFileIndex(null);
    setUploadingIndex(null);
    setCompletedUploads(new Set());

    if (files.length === 0) {
      setErrorMessage(
        language === "hi"
          ? "विधिक अनुपालन विश्लेषण शुरू करने हेतु कम से कम एक पैकेजिंग फोटोग्राफ (मुख्य PDP या बैक पैनल) संलग्न करना अनिवार्य है।"
          : "At least one packaging photograph (Front PDP or Back Panel) is required before statutory compliance analysis can be initiated."
      );
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Update pipeline visual steps
      const currentSteps = [...INITIAL_STEPS];
      currentSteps[0].status = "completed";
      currentSteps[1].status = "active";
      setSteps([...currentSteps]);

      // 2. Create the inspection case
      const newCase = await ApiService.createInspection({
        product_name: productName.trim() || "Statutory Seized Commodity",
        brand_name: brandName.trim() || undefined,
        category,
        package_type: packageType,
        inspection_type: inspectionType,
        jurisdiction_circle_id: activeCircle || "CIRCLE_DL_SOUTH_01",
        declared_net_quantity: declaredNetQty.trim() || undefined,
      });

      // 3. Upload evidence files if provided (all selected photographs)
      // STATUTORY REQUIREMENT: 1st time upload and analysis MUST run on original, non-compressed
      // images at native sensor resolution to prevent ArUco scale and OCR token discrepancy.
      const uploadedImageIds: string[] = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadingIndex(i);
          const rawFile = files[i];
          setUploadProgressMessage(
            language === "hi"
              ? `साक्ष्य फोटो अपलोड हो रहा है (${i + 1}/${files.length}): ${rawFile.name}`
              : `Uploading photo (${i + 1}/${files.length}): ${rawFile.name}`
          );

          let previewUrl = filePreviews[i];
          let imgWidth = 1920;
          let imgHeight = 1080;

          try {
            const dims = await new Promise<{ width: number; height: number }>((resolve) => {
              const img = new Image();
              const tempUrl = URL.createObjectURL(rawFile);
              img.onload = () => {
                const w = img.naturalWidth || 1920;
                const h = img.naturalHeight || 1080;
                URL.revokeObjectURL(tempUrl);
                resolve({ width: w, height: h });
              };
              img.onerror = () => {
                URL.revokeObjectURL(tempUrl);
                resolve({ width: 1920, height: 1080 });
              };
              img.src = tempUrl;
            });
            imgWidth = dims.width;
            imgHeight = dims.height;
          } catch {
            // Default fallback dimensions
          }

          if (!previewUrl) {
            previewUrl = await getPersistentPreview(rawFile, filePreviews[i]);
          }

          const panelType =
            i === 0
              ? "PDP_FRONT"
              : i === 1
              ? "BACK_PANEL"
              : "SIDE_PANEL";

          // Transmit untouched original image to uploadEvidence for pristine statutory analysis
          try {
            const uploadResult = await ApiService.uploadEvidence(rawFile, {
              inspection_id: newCase.id,
              panel_type: panelType,
              original_filename: rawFile.name,
              file_size_bytes: rawFile.size,
              mime_type: rawFile.type || "image/jpeg",
              image_width: imgWidth,
              image_height: imgHeight,
              preview_url: previewUrl,
            });
            if (uploadResult?.image_id) {
              uploadedImageIds.push(uploadResult.image_id);
            }
            setCompletedUploads(prev => new Set(prev).add(i));
          } catch (uploadErr) {
            setErrorFileIndex(i);
            throw uploadErr;
          }
        }
      }

      setUploadingIndex(null);
      setUploadProgressMessage(
        language === "hi"
          ? "विधिक AI पाइपलाइन विश्लेषित की जा रही है..."
          : "Analyzing statutory AI pipeline..."
      );

      // Step simulation for visual feedback
      for (let i = 1; i < currentSteps.length; i++) {
        currentSteps.forEach((s, idx) => {
          s.status = idx < i ? "completed" : idx === i ? "active" : "pending";
        });
        setSteps([...currentSteps]);
        await new Promise((r) => setTimeout(r, 220));
      }

      // Final: Execute parallel batch pipeline across all uploaded packaging facets in one coordinated pass
      try {
        await ApiService.executeBatchPipeline(newCase.id);
      } catch (batchErr) {
        console.warn("Batch pipeline execution deferred or backgrounded:", batchErr);
        setErrorFileIndex(0);
        throw batchErr;
      }
      
      // Clear draft since submission succeeded
      StorageService.clearDraft();

      // Navigate directly into the Adjudication Canvas for this case
      resetScrollToTop();
      navigate(`/inspections/${newCase.id}`);
    } catch (err: any) {
      console.error("Failed to execute inspection:", err);
      const msg =
        err?.message ||
        err?.remediation ||
        (language === "hi"
          ? "निरीक्षण प्रारंभ करने में असमर्थ। कृपया विवरण जांचें और पुनः प्रयास करें।"
          : "Unable to start statutory analysis. Please check packaging particulars and retry.");
      setErrorMessage(msg);
      setSteps(INITIAL_STEPS);
    } finally {
      setIsProcessing(false);
      setUploadProgressMessage(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Official Government of India Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Tricolor National Identity Strip */}
        <div className="h-1.5 w-full flex">
          <div className="h-full flex-1 bg-[#FF9933]" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-[#138808]" />
        </div>

        <div className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mt-0.5 sm:mt-0 p-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 shadow-2xs transition-colors shrink-0"
              title={language === "hi" ? "पीछे जाएं" : "Back"}
              aria-label={language === "hi" ? "पिछले पृष्ठ पर वापस जाएं" : "Back to previous page"}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B365D] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                  {language === "hi" ? "विधिक मापविज्ञान प्रभाग" : "Legal Metrology Division"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] font-semibold text-slate-600">
                  {language === "hi" ? "उपभोक्ता मामले विभाग, भारत सरकार" : "Dept. of Consumer Affairs, Govt. of India"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
                  {language === "hi" ? "धारा 15 • वैधानिक अंतर्ग्रहण" : "Sec. 15 • Statutory Intake"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {language === "hi" ? "नई वस्तु का विधिक निरीक्षण एवं साक्ष्य अधिग्रहण" : "New Commodity Statutory Inspection Intake"}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {language === "hi"
                  ? "विधिक मापविज्ञान अधिनियम, 2009 एवं पैकेज्ड कमोडिटीज नियम, 2011 के अंतर्गत साक्ष्य ग्रहण एवं सत्यापन"
                  : "Rule 6 Mandatory Declarations & Table-I Schedule Verification under Legal Metrology Act, 2009"}
              </p>
            </div>
          </div>

          {/* Mode Switcher: Field Package Capture vs Benchmark Test Cases */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("FIELD_CAPTURE")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "FIELD_CAPTURE"
                  ? "bg-[#1B365D] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Camera size={15} />
              <span>{language === "hi" ? "भौतिक पैकेज अधिग्रहण" : "Field Package Capture"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("BENCHMARK_SKUS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "BENCHMARK_SKUS"
                  ? "bg-[#1B365D] text-white shadow-xs"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Sparkles size={15} className={activeTab === "BENCHMARK_SKUS" ? "text-amber-300" : "text-amber-600"} />
              <span>{language === "hi" ? "मानक परीक्षण मामले" : "Benchmark Test Cases"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Verification Pipeline Rail (Compact, Animated, Single-line Stepper) */}
      <StatutoryPipelineRail steps={steps} language={language} />

      {/* MODE 1: FIELD PACKAGE CAPTURE */}
      {activeTab === "FIELD_CAPTURE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Packaging Metadata (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Statutory Authority & Jurisdiction */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#1B365D] bg-blue-50 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      {language === "hi" ? "चरण 1 • सांविधिक प्राधिकार" : "Step 1 • Statutory Authority"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {language === "hi" ? "विधिक मापविज्ञान अधिनियम, 2009 धारा 15" : "Legal Metrology Act, 2009 Sec. 15"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                    <Scale size={18} className="text-[#1B365D]" />
                    <span>{language === "hi" ? "प्रवर्तन अधिकार क्षेत्र एवं निरीक्षण अधिदेश" : "Enforcement Jurisdiction & Mandate"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "hi"
                      ? "साक्ष्य संग्रह से पूर्व विधिक क्षेत्र एवं निरीक्षण का प्रकार निर्धारित करें (भारतीय साक्ष्य अधिनियम, 2023 धारा 63 अनुपालन)।"
                      : "Establish statutory jurisdiction and inspection mandate prior to evidence acquisition (BSA 2023 Sec. 63 compliance)."}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-start bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span className="font-mono font-bold text-slate-700">INSP-DL-0842</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {language === "hi" ? "सत्यापित अधिकारी" : "Authorized"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Jurisdiction Enforcement Circle Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <Building2 size={15} className="text-[#1B365D]" />
                    <span>{language === "hi" ? "प्रवर्तन अधिकार क्षेत्र मंडल" : "Enforcement Jurisdiction Circle"}</span>
                    <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <select
                    value={activeCircle}
                    onChange={(e) => setActiveCircle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                  >
                    {allCircles.map((circle) => (
                      <option key={circle.id} value={circle.id}>
                        {language === "hi" ? circle.labelHi : circle.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === "hi"
                      ? "विधिक मापविज्ञान अधिनियम, 2009 की धारा 15 के अंतर्गत विधिक अधिकार क्षेत्र।"
                      : "Official statutory jurisdiction circle under Section 15 of LMA 2009."}
                  </p>
                </div>

                {/* Inspection Purpose / Mandate */}
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    <FileText size={15} className="text-[#1B365D]" />
                    <span>{language === "hi" ? "निरीक्षण का उद्देश्य / अधिदेश" : "Inspection Purpose / Mandate"}</span>
                    <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                  >
                    <option value="ROUTINE_MARKET_SURVEILLANCE">{language === "hi" ? "नियमित बाजार निगरानी" : "Routine Market Surveillance"}</option>
                    <option value="COMPLAINT_VERIFICATION">{language === "hi" ? "उपभोक्ता शिकायत / निवारण" : "Consumer Grievance / Complaint"}</option>
                    <option value="MANUFACTURER_PACKER_DEPOT">{language === "hi" ? "निर्माता / पैकर / डिपो ऑडिट" : "Manufacturer / Packer / Depot Audit"}</option>
                    <option value="SURPRISE_ENFORCEMENT_RAID">{language === "hi" ? "औचक प्रवर्तन छापा" : "Surprise Enforcement Raid"}</option>
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === "hi"
                      ? "विधिक कार्यवाही एवं नोटिस प्रारूप का प्रकार।"
                      : "Determines notice protocol and statutory escalation path."}
                  </p>
                </div>
              </div>
            </section>

            {/* Step 2: Field Camera & Photograph Evidence Intake */}
            <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#1B365D] bg-blue-50 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      {language === "hi" ? "चरण 2 • साक्ष्य अधिग्रहण" : "Step 2 • Evidence Intake"}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {language === "hi" ? "नियम 2(h) मुख्य प्रदर्शन फलक" : "Rule 2(h) Principal Display Panel"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {language === "hi" ? "पैकेज फोटोग्राफ लें अथवा साक्ष्य अपलोड करें" : "Capture or Upload Package Photograph"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "hi"
                      ? "समान सतह पर ArUco 4x4 (50mm) संदर्भ मार्कर के साथ मुख्य प्रदर्शन फलक (PDP) का स्पष्ट फोटो लें।"
                      : "Photograph the Principal Display Panel (PDP) with an ArUco 4x4 (50mm) reference marker on the same surface."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuidanceModal(!showGuidanceModal)}
                  className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-bold bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors shrink-0 self-start"
                >
                  <HelpCircle size={14} className="text-[#1B365D]" />
                  <span>{language === "hi" ? "फ्रेमिंग निर्देश" : "Framing Guide"}</span>
                </button>
              </div>

              {/* Upload & Evidence Intake Area */}
              <div className="space-y-4">
                {/* Split Upload & Evidence Intake Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Touch Target: Live Field Camera */}
                  <div
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl bg-[#1B365D] hover:bg-[#132742] text-white shadow-sm cursor-pointer transition-all active:scale-[0.98] group border border-blue-900 h-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 mb-4 group-hover:scale-110 transition-transform">
                      <Camera size={32} />
                    </div>
                    <h4 className="text-lg font-bold tracking-tight mb-2">
                      {language === "hi" ? "फोटो लें" : "Take Photo"}
                    </h4>
                    <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs mb-2">
                      {language === "hi" ? "अनुशंसित" : "Recommended"}
                    </span>
                    <p className="text-xs text-blue-100/80 text-center max-w-[200px]">
                      {language === "hi"
                        ? "ArUco 50mm संदर्भ के साथ लाइव कैमरा कैप्चर"
                        : "Live capture with ArUco 50mm reticle & lighting"}
                    </p>
                  </div>

                  {/* Secondary Touch Target: Upload from Gallery */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        handleFilesSelected(e.dataTransfer.files);
                      }
                    }}
                    className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 text-slate-900 cursor-pointer transition-all active:scale-[0.98] group h-full"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[#1B365D] border border-slate-200 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} />
                    </div>
                    <h4 className="text-lg font-bold tracking-tight mb-2">
                      {language === "hi" ? "गैलरी से अपलोड करें" : "Upload from Gallery"}
                    </h4>
                    <p className="text-xs text-slate-500 text-center max-w-[200px] mb-3">
                      {language === "hi" ? "या फ़ाइलें यहाँ खींचें (JPEG, PNG)" : "Or drag & drop files (JPEG, PNG)"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>{language === "hi" ? "SHA-256 सुरक्षित" : "SHA-256 Secured"}</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesSelected(e.target.files)}
                    />
                  </div>
                </div>

                {/* Uploaded File Previews */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2.5">
                    <p className="text-xs font-bold text-slate-800">
                      {language === "hi" ? `चयनित पैकेज फोटोग्राफ (${files.length}):` : `Selected Package Photographs (${files.length}):`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((file, i) => {
                        const isError = errorFileIndex === i;
                        const isCompleted = completedUploads.has(i);
                        const isUploading = uploadingIndex === i;

                        return (
                          <div
                            key={`${file.name}-${i}`}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs shadow-2xs transition-colors ${
                              isError
                                ? "bg-rose-50 border-rose-400 shadow-[0_0_0_1px_rgba(251,113,133,0.4)]"
                                : isCompleted
                                ? "bg-emerald-50 border-emerald-300"
                                : isUploading
                                ? "bg-blue-50 border-blue-300 shadow-[0_0_0_1px_rgba(147,197,253,0.5)]"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="relative shrink-0">
                                {filePreviews[i] ? (
                                  <img
                                    src={filePreviews[i]}
                                    alt="Package thumbnail"
                                    className={`w-12 h-12 rounded-lg object-cover border bg-white transition-opacity ${
                                      isUploading ? "opacity-70 border-blue-400" : "border-slate-200"
                                    }`}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                                    <FileImage size={20} />
                                  </div>
                                )}
                                {isCompleted && (
                                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                                    <CheckCircle2 size={12} strokeWidth={3} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{file.name}</p>
                                <p className={`text-[11px] font-mono font-semibold ${isCompleted ? "text-emerald-700" : "text-slate-500"}`}>
                                  {file.size >= 1024 * 1024
                                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                    : `${(file.size / 1024).toFixed(0)} KB`} • {language === "hi" ? "मूल असंपीड़ित PDP" : "Original Uncompressed PDP"}
                                </p>
                              </div>
                            </div>
                            
                            {isError ? (
                              <button
                                type="button"
                                onClick={() => {
                                  handleRemoveFile(i);
                                  setIsCameraModalOpen(true);
                                  setErrorMessage(null);
                                  setErrorFileIndex(null);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-sm shrink-0"
                              >
                                <Camera size={14} />
                                <span>{language === "hi" ? "फिर से फोटो लें" : "Retake Photo"}</span>
                              </button>
                            ) : isCompleted ? (
                              <div className="p-1.5 px-3 rounded-lg text-emerald-700 bg-emerald-100/50 border border-emerald-200 font-bold shrink-0 flex items-center gap-1.5">
                                <CheckCircle2 size={14} />
                                <span>{language === "hi" ? "अपलोड हो गया" : "Uploaded"}</span>
                              </div>
                            ) : isUploading ? (
                              <div className="p-1.5 px-3 rounded-lg text-blue-700 bg-blue-50 border border-blue-200 font-bold shrink-0 flex items-center gap-1.5">
                                <Loader2 size={14} className="animate-spin" />
                                <span>{language === "hi" ? "अपलोड हो रहा है..." : "Uploading..."}</span>
                              </div>
                            ) : isProcessing ? (
                              <div className="p-1.5 rounded-lg text-slate-300 shrink-0">
                                <Clock size={16} />
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(i)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                title={language === "hi" ? "फ़ाइल हटाएं" : "Remove file"}
                                aria-label="Remove image"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Error Alert Banner */}
                {errorMessage && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3 shadow-2xs">
                    <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-1.5">
                      <div className="font-bold text-rose-950">
                        {language === "hi" ? "निरीक्षण विश्लेषण प्रारंभ करने में समस्या" : "Inspection Pipeline Issue"}
                      </div>
                      <p className="text-[11.5px] leading-relaxed text-rose-800">{errorMessage}</p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage(null);
                            handleStartAnalysis();
                          }}
                          className="text-[11px] font-bold text-slate-800 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <RefreshCw size={12} />
                          <span>{language === "hi" ? "लाइव पुनः प्रयास करें" : "Retry Live Analysis"}</span>
                        </button>
                        {ApiService.getOperatingMode() === "LIVE" && (
                          <button
                            type="button"
                            onClick={() => {
                              ApiService.setOperatingMode("MOCK", { persist: false });
                              setErrorMessage(null);
                              handleStartAnalysis();
                            }}
                            className="text-[11px] font-bold text-[#1B365D] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{language === "hi" ? "स्थानीय रेजिलिएंट मोड में आज़माएं" : "Try Local Resilient Mode"}</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                      aria-label="Dismiss error"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Primary Action Button & Readiness Status */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
                      uploadProgressMessage
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : files.length === 0
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    {uploadProgressMessage ? (
                      <>
                        <ScanLine size={14} className="text-blue-600 animate-scan-vertical shrink-0" />
                        <span className="font-medium">{uploadProgressMessage}</span>
                      </>
                    ) : files.length === 0 ? (
                      <>
                        <Info size={14} className="text-amber-600 shrink-0" />
                        <span>
                          {language === "hi"
                            ? "विधिक विश्लेषण शुरू करने के लिए कम से कम 1 पैकेजिंग फोटो अपलोड करें।"
                            : "Upload at least 1 packaging photograph to start statutory analysis."}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>
                          {language === "hi"
                            ? `${files.length} तस्वीर(एं) विधिक विश्लेषण हेतु तैयार हैं।`
                            : `${files.length} photograph(s) ready for statutory analysis.`}
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartAnalysis}
                    disabled={isProcessing || files.length === 0}
                    className={`w-full sm:w-auto py-3 px-7 shadow-sm flex items-center justify-center gap-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      files.length === 0 || isProcessing
                        ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed"
                        : "bg-[#1B365D] hover:bg-[#132742] text-white cursor-pointer active:scale-98"
                    }`}
                    title={files.length === 0 ? "Upload at least 1 packaging photo to begin" : ""}
                  >
                    {isProcessing ? (
                      <>
                        <ScanLine size={18} className="animate-scan-vertical text-amber-300" />
                        <span>{uploadProgressMessage || (language === "hi" ? "विधिक पाइपलाइन निष्पादित हो रही है..." : "Running Statutory Pipeline...")}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === "hi" ? "निरीक्षण विश्लेषण प्रारंभ करें" : "Start Statutory Inspection"}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* Optional / Secondary Section: Packaged Commodity Particulars & Packaging Geometry */}
            <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all">
              <button
                type="button"
                onClick={() => setShowManualFields(!showManualFields)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1B365D] flex items-center justify-center border border-blue-200 shrink-0 mt-0.5">
                    <SlidersHorizontal size={16} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-[#1B365D] bg-blue-50 border border-blue-200 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                        {language === "hi" ? "वैकल्पिक • नियम 6 घोषणाएं" : "Optional • Rule 6 Declarations"}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {language === "hi" ? "एआई ओसीआर स्वतः निष्कर्षण" : "Auto-extracted by AI OCR"}
                      </span>
                      {(productName || brandName || declaredNetQty) && (
                        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {language === "hi" ? "मैन्युअल मान सक्रिय" : "Manual values set"}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {language === "hi" ? "वस्तु विवरण एवं पैकेजिंग ज्यामिति" : "Commodity Particulars & Packaging Geometry"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === "hi"
                        ? "ओसीआर इंजन स्वचालित रूप से सभी विवरण निकालेगा। यदि आप पहले से विशिष्ट मान दर्ज करना चाहते हैं तो यहां क्लिक करें।"
                        : "All fields are automatically extracted from the packaging photo by AI OCR. Click to pre-fill or override manually."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                    {showManualFields
                      ? (language === "hi" ? "छिपाएं" : "Hide")
                      : (language === "hi" ? "मैन्युअल रूप से भरें" : "Fill Manually")}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                    {showManualFields ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </button>

              {showManualFields && (
                <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="text-xs text-slate-600 bg-blue-50/60 border border-blue-200 p-3 rounded-lg flex items-center gap-2">
                    <Info size={16} className="text-[#1B365D] shrink-0" />
                    <span>
                      {language === "hi"
                        ? "नोट: ये फ़ील्ड वैकल्पिक हैं। यदि खाली छोड़ दिया जाए, तो NIRIKSHAK फोटो से विवरण स्वचालित रूप से निकाल लेगा।"
                        : "Note: These fields are optional. When left blank, NIRIKSHAK automatically populates them from the uploaded PDP photograph."}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === "hi" ? "वस्तु / उत्पाद का नाम" : "Commodity / Product Name"}
                      </label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder={language === "hi" ? "उदा., आशीर्वाद सुपीरियर एमपी आटा 500g (या रिक्त छोड़ें)" : "e.g., Aashirvaad Superior MP Atta 500g (or leave blank)"}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === "hi"
                          ? "पैकेज्ड वस्तु का सामान्य या व्यापारिक नाम"
                          : "Generic or common trade name of packaged goods"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === "hi" ? "ब्रांड नाम / ट्रेडमार्क" : "Brand Name / Trade Mark"}
                      </label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder={language === "hi" ? "उदा., आईटीसी लिमिटेड / आशीर्वाद" : "e.g., ITC Limited / Aashirvaad"}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === "hi"
                          ? "निर्माता या विपणन संस्था का ब्रांड"
                          : "Manufacturer or marketing entity brand"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === "hi" ? "वस्तु श्रेणी" : "Commodity Category"}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                      >
                        <option value="FOOD_SNACKS">{language === "hi" ? "पैकेज्ड खाद्य एवं स्नैक्स" : "Packaged Food & Snacks"}</option>
                        <option value="EDIBLE_OIL">{language === "hi" ? "खाद्य तेल / वनस्पति / घी" : "Edible Oil / Ghee"}</option>
                        <option value="BEVERAGES">{language === "hi" ? "पैकेज्ड पेयजल एवं पेय पदार्थ" : "Packaged Drinking Water & Beverages"}</option>
                        <option value="PERSONAL_CARE">{language === "hi" ? "व्यक्तिगत देखभाल एवं सौंदर्य प्रसाधन" : "Personal Care & Cosmetics"}</option>
                        <option value="ELECTRONICS">{language === "hi" ? "पैकेज्ड इलेक्ट्रॉनिक उत्पाद" : "Packaged Electronics"}</option>
                        <option value="HOUSEHOLD_CHEMICALS">{language === "hi" ? "घरेलू डिटर्जेंट एवं स्वच्छता उत्पाद" : "Household Detergents & Cleaners"}</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === "hi"
                          ? "लागू तालिका-I फॉन्ट क्षेत्रफल अनुसूची निर्धारित करता है"
                          : "Defines applicable Table-I font area schedule"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === "hi" ? "घोषित शुद्ध मात्रा" : "Declared Net Quantity"}
                      </label>
                      <input
                        type="text"
                        value={declaredNetQty}
                        onChange={(e) => setDeclaredNetQty(e.target.value)}
                        placeholder={language === "hi" ? "उदा., 500 g, 1 L, 250 ml" : "e.g., 500 g, 1 L, 250 ml"}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === "hi"
                          ? "धारा 11 के तहत मानक SI मात्रक आवश्यक हैं"
                          : "Must use standard SI units under Section 11"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === "hi" ? "पैकेजिंग ज्यामिति / आकार" : "Packaging Geometry"}
                      </label>
                      <select
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value as PackagingType)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#1B365D] focus:border-[#1B365D]"
                      >
                        <option value="RECTANGULAR">{language === "hi" ? "आयताकार डिब्बा / पाउच" : "Rectangular Box / Pouch"}</option>
                        <option value="CYLINDRICAL">{language === "hi" ? "बेलनाकार बोतल / कैन" : "Cylindrical Bottle / Can"}</option>
                        <option value="FLEXIBLE_POUCH">{language === "hi" ? "लचीला पाउच" : "Flexible Pouch"}</option>
                        <option value="SPECIAL">{language === "hi" ? "विशेष / अनियमित आकार का पैकेज" : "Special / Irregular Contoured Package"}</option>
                        <option value="ECOMMERCE_LISTING">{language === "hi" ? "ई-कॉमर्स लिस्टिंग (नियम 6(10))" : "E-Commerce Listing (Rule 6(10))"}</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {language === "hi"
                          ? "PDP सतह क्षेत्रफल गणना का गणितीय मॉडल निर्धारित करता है"
                          : "Determines mathematical surface formula for PDP area"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Physical Positioning Guide & Principles (4 cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Visual Photography Guidance Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1B365D] flex items-center justify-center border border-blue-200">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {language === "hi" ? "क्षेत्रीय फोटोग्राफी नियम" : "Field Photography Rules"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === "hi" ? "धारा 15 साक्ष्य संग्रह मानक" : "Sec. 15 Evidence Collection Standards"}
                  </p>
                </div>
              </div>

              {/* Instructional Framing Guide Graphic */}
              <div className="rounded-xl border border-slate-200 shadow-2xs bg-white p-2">
                <img
                  src="/assets/guidance/camera_framing_guide.svg"
                  alt="Instructional package framing diagram with 50mm ArUco fiducial placement"
                  className="w-full h-auto block rounded-lg"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Maximize2 size={15} className="text-[#1B365D]" />
                    <span>{language === "hi" ? "1. संपूर्ण PDP फ्रेम करें" : "1. Frame the Entire PDP"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "किनारों को काटे बिना संपूर्ण मुख्य लेबल की तस्वीर लें। तालिका-I अनुसूची हेतु पूर्ण सतह क्षेत्र आवश्यक है।"
                      : "Capture the whole front label face without cutting off edges. The system needs the full surface area to compute Table-I font schedules."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Square size={15} className="text-emerald-700" />
                    <span>{language === "hi" ? "2. ArUco 50mm संदर्भ रखें" : "2. Place ArUco 50mm Reference"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "ArUco संदर्भ को पैकेज की सतह पर सपाट रखें। विधिक पाठ (MRP, शुद्ध मात्रा, दिनांक) को कभी न ढकें।"
                      : "Place the ArUco fiducial flat on the package surface. Never cover statutory text (MRP, Net Qty, Dates)."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Sun size={15} className="text-amber-600" />
                    <span>{language === "hi" ? "3. अत्यधिक चमक से बचें" : "3. Avoid Specular Glare"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "कैमरा फ्लैश सीधे न मारें और सफेद चमक से बचने के लिए पैकेज को तेज रोशनी से थोड़ा तिरछा रखें।"
                      : "Diffuse direct camera flash and tilt the package slightly away from harsh overhead ceiling lights to prevent white glare bloom."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Camera size={15} className="text-blue-600" />
                    <span>{language === "hi" ? "4. लंबवत तल (90°)" : "4. Orthogonal Plane (90°)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "पर्सपेक्टिव विरूपण से बचने के लिए उपकरण को सीधे पैकेज की सतह के समानांतर ऊपर रखें।"
                      : "Hold device directly parallel above package surface to prevent perspective keystoning distortion."}
                  </p>
                </div>
              </div>
            </div>

            {/* Human-in-the-Loop Officer Guardrail */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2 text-xs text-emerald-950 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                <span>{language === "hi" ? "संवर्धित नैदानिक सहायक" : "Augmented Diagnostic Assistant"}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-emerald-800">
                {language === "hi"
                  ? "निरीक्षक कभी भी स्वायत्त रूप से विधिक नोटिस या जुर्माना जारी नहीं करता है। धारा 63 बीएसए 2023 के तहत सभी निष्कर्ष अधिकृत अधिकारी की समीक्षा हेतु हैं।"
                  : "NIRIKSHAK never issues legal notices, compounding orders, or fines autonomously. All findings are recommendations for human officer review under Section 63 BSA 2023."}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* MODE 2: BENCHMARK TEST SCENARIOS (GOLDEN SKUS) */}
      {activeTab === "BENCHMARK_SKUS" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {language === "hi" ? "पूर्व-लोड किए गए मानक प्रदर्शन मामले" : "Pre-Loaded Benchmark Demonstration Cases"}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  {language === "hi" ? "मानकीकृत परीक्षण डेटासेट • LMPC नियम 6 व तालिका-I" : "Standardized Test Matrix • LMPC Rule 6 & Table-I"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed mt-2">
              {language === "hi"
                ? "मानक पैकेज्ड वस्तुओं पर सत्यापित ArUco अंशांकन, ओसीआर बाउंडिंग बॉक्स और तालिका-I अनुपालन रिकॉर्ड के साथ संपूर्ण विधिक सत्यापन का अन्वेषण करें:"
                : "Explore end-to-end statutory verification with verified ArUco calibration, OCR bounding boxes, and Table-I compliance records across standard packaged commodities:"}
            </p>
          </div>

          <GoldenSkuQuickSelector
            onSelectSku={(id) => {
              resetScrollToTop();
              navigate(`/inspections/${id}`);
            }}
          />
        </div>
      )}

      {/* Real-time Field Camera Modal */}
      <InspectionCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onPhotoCaptured={(file, previewUrl) => {
          setFiles((prev) => [...prev, file]);
          setFilePreviews((prev) => [...prev, previewUrl]);
        }}
        onPhotosCaptured={(photos) => {
          setFiles((prev) => [...prev, ...photos.map((p) => p.file)]);
          setFilePreviews((prev) => [...prev, ...photos.map((p) => p.previewUrl)]);
        }}
        onFallbackToUpload={() => fileInputRef.current?.click()}
      />

      {/* Interactive Framing Guidance Modal */}
      {showGuidanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-[#1B365D] text-white">
              <div className="flex items-center gap-2">
                <Camera size={18} className="text-amber-300" />
                <div>
                  <h3 className="text-sm font-bold">
                    {language === "hi" ? "क्षेत्रीय फोटोग्राफी नियम एवं फ्रेमिंग प्रोटोकॉल" : "Field Photography Rules & Framing Protocol"}
                  </h3>
                  <p className="text-[10.5px] text-blue-100">
                    {language === "hi" ? "धारा 15 साक्ष्य संग्रह मानक (LMA 2009)" : "Sec. 15 Evidence Collection Standards (LMA 2009)"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuidanceModal(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2 shadow-2xs">
                <img
                  src="/assets/guidance/camera_framing_guide.svg"
                  alt="Instructional package framing diagram with 50mm ArUco fiducial placement"
                  className="w-full h-auto block rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Maximize2 size={15} className="text-[#1B365D]" />
                    <span>{language === "hi" ? "1. संपूर्ण PDP फ्रेम करें" : "1. Frame the Entire PDP"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "किनारों को काटे बिना संपूर्ण मुख्य लेबल की तस्वीर लें। तालिका-I अनुसूची हेतु पूर्ण सतह क्षेत्र आवश्यक है।"
                      : "Capture the whole front label face without cutting off edges. The system needs the full surface area to compute Table-I font schedules."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Square size={15} className="text-emerald-700" />
                    <span>{language === "hi" ? "2. ArUco 50mm संदर्भ रखें" : "2. Place ArUco 50mm Reference"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "ArUco संदर्भ को पैकेज की सतह पर सपाट रखें। विधिक पाठ (MRP, शुद्ध मात्रा, दिनांक) को कभी न ढकें।"
                      : "Place the ArUco fiducial flat on the package surface next to label declarations. Never cover statutory text (MRP, Net Qty, Dates)."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Sun size={15} className="text-amber-600" />
                    <span>{language === "hi" ? "3. अत्यधिक चमक से बचें" : "3. Avoid Specular Glare"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "कैमरा फ्लैश सीधे न मारें और सफेद चमक से बचने के लिए पैकेज को तेज रोशनी से थोड़ा तिरछा रखें।"
                      : "Diffuse direct camera flash and tilt the package slightly away from harsh overhead ceiling lights to prevent white glare bloom."}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Camera size={15} className="text-blue-600" />
                    <span>{language === "hi" ? "4. लंबवत तल (90°)" : "4. Orthogonal Plane (90°)"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "पर्सपेक्टिव विरूपण से बचने के लिए उपकरण को सीधे पैकेज की सतह के समानांतर ऊपर रखें।"
                      : "Hold device directly parallel above package surface to prevent perspective keystoning distortion."}
                  </p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuidanceModal(false)}
                  className="bg-[#1B365D] hover:bg-[#132742] text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer"
                >
                  {language === "hi" ? "समझ गया • फॉर्म पर वापस जाएं" : "Understood • Return to Intake"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewInspection;
