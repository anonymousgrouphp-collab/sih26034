import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
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
} from "lucide-react";
import { ApiService } from "../services/api";
import { GoldenSkuQuickSelector } from "../features/desk/GoldenSkuQuickSelector";
import { PackagingType, InspectionType } from "../types/inspection";
import { InspectionCameraModal } from "../components/camera";
import { useCircle } from "../context/CircleContext";
import { useLanguage } from "../context/LanguageContext";
import { compressPackagingImage } from "../services/imageCompression";

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
  const { activeCircle } = useCircle();

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [steps, setSteps] = useState<PipelineStepItem[]>(INITIAL_STEPS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setFiles((prev) => [...prev, ...fileList]);
    const previews = fileList.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);

    fileList.forEach((f, idx) => {
      compressPackagingImage(f, { maxDimension: 1280, quality: 0.8 })
        .then((comp) => {
          setFilePreviews((prev) => {
            const next = [...prev];
            const pos = startIdx + idx;
            if (pos < next.length) {
              next[pos] = comp.dataUrl;
            }
            return next;
          });
          setFiles((prev) => {
            const next = [...prev];
            const pos = startIdx + idx;
            if (pos < next.length) {
              next[pos] = comp.file;
            }
            return next;
          });
        })
        .catch(() => {
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
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    setErrorMessage(null);
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
      const uploadedImageIds: string[] = [];
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const rawFile = files[i];
          let fileToUpload = rawFile;
          let previewUrl = filePreviews[i];
          let imgWidth = 1920;
          let imgHeight = 1080;

          try {
            const compressed = await compressPackagingImage(rawFile, { maxDimension: 1280, quality: 0.8 });
            fileToUpload = compressed.file;
            imgWidth = compressed.width;
            imgHeight = compressed.height;
            if (compressed.dataUrl) {
              previewUrl = compressed.dataUrl;
            }
          } catch (compErr) {
            console.warn("Pre-upload compression fallback:", compErr);
            previewUrl = await getPersistentPreview(rawFile, filePreviews[i]);
          }

          const panelType =
            i === 0
              ? "PDP_FRONT"
              : i === 1
              ? "SIDE_PANEL"
              : i === 2
              ? "BACK_PANEL"
              : "SIDE_PANEL";
          const uploadResult = await ApiService.uploadEvidence(fileToUpload, {
            inspection_id: newCase.id,
            panel_type: panelType,
            original_filename: fileToUpload.name,
            file_size_bytes: fileToUpload.size,
            mime_type: fileToUpload.type || "image/jpeg",
            image_width: imgWidth,
            image_height: imgHeight,
            preview_url: previewUrl,
          });
          if (uploadResult?.image_id) {
            uploadedImageIds.push(uploadResult.image_id);
          }
        }
      }

      // Step simulation for visual feedback
      for (let i = 1; i < currentSteps.length; i++) {
        currentSteps.forEach((s, idx) => {
          s.status = idx < i ? "completed" : idx === i ? "active" : "pending";
        });
        setSteps([...currentSteps]);
        await new Promise((r) => setTimeout(r, 220));
      }

      // Final: Execute pipeline across all evidence assets
      if (uploadedImageIds.length > 0) {
        for (const imgId of uploadedImageIds) {
          await ApiService.executePipeline(imgId, newCase.id);
        }
      } else if (newCase.evidence_assets[0]?.image_id) {
        await ApiService.executePipeline(newCase.evidence_assets[0].image_id, newCase.id);
      }

      // Navigate directly into the Adjudication Canvas for this case
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
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-200 hover:text-govNavy transition-colors"
            title={language === "hi" ? "पीछे जाएं" : "Back"}
            aria-label={language === "hi" ? "पिछले पृष्ठ पर वापस जाएं" : "Back to previous page"}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-amber-700 font-mono">
                {language === "hi" ? "विधिक मापविज्ञान प्रवर्तन" : "Legal Metrology Enforcement"}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10.5px] font-bold text-slate-500">
                {language === "hi" ? "नियम 6 एवं तालिका-I अधिग्रहण" : "Rule 6 & Table-I Intake"}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 leading-tight mt-0.5">
              {language === "hi" ? "नई वस्तु का विधिक निरीक्षण" : "New Commodity Inspection"}
            </h1>
          </div>
        </div>

        {/* Tab Switcher: Field Capture vs Golden SKUs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("FIELD_CAPTURE")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "FIELD_CAPTURE"
                ? "bg-govNavy text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Camera size={15} />
            <span>{language === "hi" ? "भौतिक पैकेज अधिग्रहण" : "Field Package Capture"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BENCHMARK_SKUS")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "BENCHMARK_SKUS"
                ? "bg-govNavy text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={15} className="text-amber-400" />
            <span>{language === "hi" ? "मानक परीक्षण मामले" : "Benchmark Test Cases"}</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stepper (Visual Progress Indicator) */}
      <div className="card p-4 sm:p-5 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="section-title">
              {language === "hi" ? "विधिक प्रवर्तन सत्यापन चरण" : "Enforcement Verification Stages"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === "hi"
                ? "विधिक मापविज्ञान अधिनियम, 2009 की धारा 15 के अंतर्गत स्वचालित सहायता प्रणाली।"
                : "Automated assistance pipeline under Section 15 of Legal Metrology Act, 2009."}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-govNavy bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {language === "hi" ? "चरण 1 / 6 सक्रिय" : "Stage 1 of 6 Active"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {steps.map((s, idx) => {
            const isCompleted = s.status === "completed";
            const isActive = s.status === "active";
            return (
              <div
                key={s.id}
                className={`p-3 rounded-xl border transition-all ${
                  isActive
                    ? "border-govNavy bg-blue-50/50 ring-1 ring-govNavy/20"
                    : isCompleted
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-slate-200 bg-slate-50/60 opacity-80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isActive
                        ? "bg-govNavy text-white ring-2 ring-blue-200"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 size={12} /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate">{getStepLabel(s.id)}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1 leading-tight">
                  {getStepDesc(s.id)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODE 1: FIELD PACKAGE CAPTURE */}
      {activeTab === "FIELD_CAPTURE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Upload & Packaging Metadata (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Field Camera & Photograph Upload */}
            <section className="card p-5 bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">
                    {language === "hi" ? "चरण 1 • साक्ष्य अधिग्रहण" : "Step 1 • Evidence Intake"}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {language === "hi" ? "पैकेज फोटोग्राफ लें अथवा अपलोड करें" : "Capture or Upload Package Photograph"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "hi"
                      ? "समान सतह पर ArUco 4x4 (50mm) संदर्भ मार्कर के साथ मुख्य प्रदर्शन फलक (PDP) का फोटो लें।"
                      : "Photograph the Principal Display Panel (PDP) with an ArUco 4x4 (50mm) reference marker on the same surface."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuidanceModal(!showGuidanceModal)}
                  className="flex items-center gap-1.5 text-xs text-govNavy hover:text-amber-700 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  <HelpCircle size={14} className="text-amber-600" />
                  <span>{language === "hi" ? "फ्रेमिंग निर्देश" : "Framing Guide"}</span>
                </button>
              </div>

              {/* Upload & Evidence Intake Area: Field Camera (Primary) & Upload (Secondary) */}
              <div className="space-y-3">
                {/* Primary: Live Field Camera */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-govNavy to-blue-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/10 shrink-0">
                      <Camera size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold tracking-tight">
                          {language === "hi" ? "सजीव क्षेत्रीय निरीक्षण कैमरा" : "Live Field Inspection Camera"}
                        </h4>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-900">
                          {language === "hi" ? "अनुशंसित" : "Recommended"}
                        </span>
                      </div>
                      <p className="text-xs text-blue-100/80 mt-0.5">
                        {language === "hi"
                          ? "ArUco 50mm संरेखण जाली एवं तत्काल प्रकाश सहायता के साथ उच्च-रिज़ॉल्यूशन अधिग्रहण।"
                          : "High-resolution capture with ArUco 50mm alignment reticle and instant lighting assist."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 shrink-0"
                  >
                    <Camera size={15} />
                    <span>{language === "hi" ? "कैमरा खोलें" : "Open Camera"}</span>
                  </button>
                </div>

                {/* Secondary: Upload & Dropzone Area */}
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-32 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-4 text-center hover:border-govNavy hover:bg-govNavy/5 cursor-pointer transition-all group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-govNavy shadow-sm border border-slate-200 group-hover:scale-105 transition-transform">
                      <UploadCloud size={20} className="text-govNavy" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-800">
                      {language === "hi" ? "अथवा फ़ोटो अपलोड करें / फ़ाइल यहां खींचें" : "Or Upload Existing Photo / Drag & Drop"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {language === "hi"
                        ? "मोबाइल गैलरी अथवा स्कैनर से JPEG, PNG, WEBP समर्थित"
                        : "Supports JPEG, PNG, WEBP from mobile gallery or external scanners"}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>
                        {language === "hi"
                          ? "अधिग्रहण पर SHA-256 मर्कल साक्ष्य अखंडता सुरक्षित"
                          : "SHA-256 Merkle Provenance Captured on Intake"}
                      </span>
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
                    <p className="text-xs font-bold text-slate-700">
                      {language === "hi" ? `चयनित पैकेज फोटोग्राफ (${files.length}):` : `Selected Package Photographs (${files.length}):`}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {files.map((file, i) => (
                        <div
                          key={`${file.name}-${i}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {filePreviews[i] ? (
                              <img
                                src={filePreviews[i]}
                                alt="Package thumbnail"
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                                <FileImage size={20} />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{file.name}</p>
                              <p className="text-[10px] font-mono text-slate-500">
                                {(file.size / 1024).toFixed(0)} KB • High-Res PDP
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(i)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title={language === "hi" ? "हटाएं" : "Remove file"}
                            aria-label="Remove image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Packaged Commodity Particulars Form */}
            <section className="card p-5 bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">
                  {language === "hi" ? "चरण 2 • वस्तु पहचान" : "Step 2 • Commodity Identification"}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {language === "hi" ? "पैकेज्ड वस्तु का विधिक विवरण" : "Packaged Commodity Particulars"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === "hi"
                    ? "नियम 6 सत्यापन हेतु लेबल विवरण दर्ज करें। ओसीआर इंजन द्वारा सभी विवरण स्वचालित रूप से भी निकाले जा सकते हैं।"
                    : "Enter label details for Rule 6 verification. All fields can also be extracted automatically by the OCR engine."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "वस्तु / उत्पाद का नाम" : "Commodity / Product Name"}{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={language === "hi" ? "उदा., आशीर्वाद सुपीरियर एमपी आटा 500g" : "e.g., Aashirvaad Superior MP Atta 500g"}
                    className="input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    {language === "hi"
                      ? "पैकेज्ड वस्तु का सामान्य या व्यापारिक नाम"
                      : "Generic or common trade name of packaged goods"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "ब्रांड नाम / ट्रेडमार्क" : "Brand Name / Trade Mark"}
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder={language === "hi" ? "उदा., आईटीसी लिमिटेड / आशीर्वाद" : "e.g., ITC Limited / Aashirvaad"}
                    className="input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    {language === "hi"
                      ? "निर्माता या विपणन संस्था का ब्रांड"
                      : "Manufacturer or marketing entity brand"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "वस्तु श्रेणी" : "Commodity Category"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input text-xs w-full"
                  >
                    <option value="FOOD_SNACKS">{language === "hi" ? "पैकेज्ड खाद्य एवं स्नैक्स" : "Packaged Food & Snacks"}</option>
                    <option value="EDIBLE_OIL">{language === "hi" ? "खाद्य तेल / वनस्पति / घी" : "Edible Oil / Ghee"}</option>
                    <option value="BEVERAGES">{language === "hi" ? "पैकेज्ड पेयजल एवं पेय पदार्थ" : "Packaged Drinking Water & Beverages"}</option>
                    <option value="PERSONAL_CARE">{language === "hi" ? "व्यक्तिगत देखभाल एवं सौंदर्य प्रसाधन" : "Personal Care & Cosmetics"}</option>
                    <option value="ELECTRONICS">{language === "hi" ? "पैकेज्ड इलेक्ट्रॉनिक उत्पाद" : "Packaged Electronics"}</option>
                    <option value="HOUSEHOLD_CHEMICALS">{language === "hi" ? "घरेलू डिटर्जेंट एवं स्वच्छता उत्पाद" : "Household Detergents & Cleaners"}</option>
                  </select>
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    {language === "hi"
                      ? "लागू तालिका-I फॉन्ट क्षेत्रफल अनुसूची निर्धारित करता है"
                      : "Defines applicable Table-I font area schedule"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "घोषित शुद्ध मात्रा" : "Declared Net Quantity"}
                  </label>
                  <input
                    type="text"
                    value={declaredNetQty}
                    onChange={(e) => setDeclaredNetQty(e.target.value)}
                    placeholder={language === "hi" ? "उदा., 500 g, 1 L, 250 ml" : "e.g., 500 g, 1 L, 250 ml"}
                    className="input text-xs w-full"
                  />
                  <p className="text-[10.5px] text-slate-400 mt-1">
                    {language === "hi"
                      ? "धारा 11 के तहत मानक SI मात्रक आवश्यक हैं"
                      : "Must use standard SI units under Section 11"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "पैकेजिंग ज्यामिति / आकार" : "Packaging Geometry"}
                  </label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value as PackagingType)}
                    className="input text-xs w-full"
                  >
                    <option value="RECTANGULAR">{language === "hi" ? "आयताकार डिब्बा / पाउच" : "Rectangular Box / Pouch"}</option>
                    <option value="CYLINDRICAL">{language === "hi" ? "बेलनाकार बोतल / कैन" : "Cylindrical Bottle / Can"}</option>
                    <option value="SPECIAL">{language === "hi" ? "विशेष / अनियमित आकार का पैकेज" : "Special / Irregular Contoured Package"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === "hi" ? "निरीक्षण का उद्देश्य" : "Inspection Purpose"}
                  </label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as InspectionType)}
                    className="input text-xs w-full"
                  >
                    <option value="ROUTINE_MARKET_SURVEILLANCE">{language === "hi" ? "नियमित बाजार निगरानी" : "Routine Market Surveillance"}</option>
                    <option value="CONSUMER_COMPLAINT">{language === "hi" ? "उपभोक्ता शिकायत / निवारण" : "Consumer Grievance / Complaint"}</option>
                    <option value="PORT_OF_ENTRY_IMPORT">{language === "hi" ? "सीमा शुल्क / प्रवेश बंदरगाह ऑडिट" : "Customs / Port of Entry Audit"}</option>
                  </select>
                </div>
              </div>

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
                  <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="font-bold">
                      {language === "hi" ? "निरीक्षण विश्लेषण प्रारंभ करने में समस्या" : "Inspection Pipeline Issue"}
                    </div>
                    <p className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</p>
                    {ApiService.getOperatingMode() === "LIVE" && (
                      <button
                        type="button"
                        onClick={() => {
                          ApiService.setOperatingMode("MOCK");
                          setErrorMessage(null);
                          handleStartAnalysis();
                        }}
                        className="mt-1 text-[11px] font-bold text-govNavy underline hover:text-blue-900 flex items-center gap-1"
                      >
                        <span>{language === "hi" ? "मोड बी (स्थानीय लचीला मोड) में पुनः प्रयास करें" : "Switch to Mode B (Local Resilient) & Retry Analysis"}</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-400 hover:text-rose-700 p-1"
                    aria-label="Dismiss error"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {files.length === 0
                    ? (language === "hi" ? "सुझाव: फोटोग्राफ अपलोड करने से स्वचालित ऑप्टिकल गुणवत्ता एवं फॉन्ट सत्यापन सक्षम हो जाता है।" : "Tip: Uploading a photograph enables automated optical quality and font verification.")
                    : (language === "hi" ? `${files.length} तस्वीर(एं) विश्लेषण हेतु तैयार हैं।` : `${files.length} photograph(s) ready for analysis.`)}
                </p>

                <button
                  type="button"
                  onClick={handleStartAnalysis}
                  disabled={isProcessing}
                  className="btn-primary w-full sm:w-auto py-2.5 px-6 shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <ScanLine size={18} className="animate-spin text-amber-300" />
                      <span>{language === "hi" ? "विधिक पाइपलाइन निष्पादित हो रही है..." : "Running Statutory Pipeline..."}</span>
                    </>
                  ) : (
                    <>
                      <span>{language === "hi" ? "निरीक्षण विश्लेषण प्रारंभ करें" : "Start Inspection Analysis"}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Physical Positioning Guide & Principles (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Visual Photography Guidance Card */}
            <div className="card p-5 bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-govNavy font-bold text-xs uppercase tracking-wider">
                <Camera size={16} className="text-amber-600" />
                <span>{language === "hi" ? "क्षेत्रीय फोटोग्राफी नियम" : "Field Photography Rules"}</span>
              </div>

              {/* Instructional Framing Guide Graphic */}
              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                <img
                  src="/assets/guidance/camera_framing_guide.svg"
                  alt="Instructional package framing diagram with 50mm ArUco fiducial placement"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Maximize2 size={14} className="text-blue-600" />
                    <span>{language === "hi" ? "1. संपूर्ण PDP फ्रेम करें" : "1. Frame the Entire PDP"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "किनारों को काटे बिना संपूर्ण मुख्य लेबल की तस्वीर लें। तालिका-I अनुसूची हेतु पूर्ण सतह क्षेत्र आवश्यक है।"
                      : "Capture the whole front label face without cutting off edges. The system needs the full surface area to compute Table-I font schedules."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Square size={14} className="text-emerald-600" />
                    <span>{language === "hi" ? "2. ArUco 50mm संदर्भ रखें" : "2. Place ArUco 50mm Reference"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "ArUco संदर्भ को पैकेज की सतह पर सपाट रखें। विधिक पाठ (MRP, शुद्ध मात्रा, दिनांक) को कभी न ढकें।"
                      : "Place the ArUco fiducial flat on the package surface. Never cover statutory text (MRP, Net Qty, Dates)."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <Sun size={14} className="text-amber-600" />
                    <span>{language === "hi" ? "3. अत्यधिक चमक से बचें" : "3. Avoid Specular Glare"}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === "hi"
                      ? "कैमरा फ्लैश सीधे न मारें और सफेद चमक से बचने के लिए पैकेज को तेज रोशनी से थोड़ा तिरछा रखें।"
                      : "Diffuse direct camera flash and tilt the package slightly away from harsh overhead ceiling tube lights to prevent white glare bloom."}
                  </p>
                </div>
              </div>
            </div>

            {/* Human-in-the-Loop Officer Guardrail */}
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <ShieldCheck size={17} className="text-emerald-700 shrink-0" />
                <span>{language === "hi" ? "संवर्धित नैदानिक सहायक" : "Augmented Diagnostic Assistant"}</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-emerald-900/90">
                {language === "hi"
                  ? "न्यायदृष्टि-एलएम कभी भी स्वायत्त रूप से विधिक नोटिस या जुर्माना जारी नहीं करता है। धारा 63 बीएसए 2023 के तहत सभी निष्कर्ष अधिकृत अधिकारी की समीक्षा हेतु हैं।"
                  : "NyayaDrishti-LM never issues legal notices, compounding orders, or fines autonomously. All findings are recommendations for human officer review under Section 63 BSA 2023."}
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* MODE 2: BENCHMARK TEST SCENARIOS (GOLDEN SKUS) */}
      {activeTab === "BENCHMARK_SKUS" && (
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/80 border border-amber-300 shadow-xs">
            <div className="flex items-center gap-2.5 mb-2">
              <Sparkles size={20} className="text-amber-600" />
              <h2 className="text-base font-black text-slate-900">
                {language === "hi" ? "पूर्व-लोड किए गए मानक प्रदर्शन मामले" : "Pre-Loaded Benchmark Demonstration Cases"}
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              {language === "hi"
                ? "मानक पैकेज्ड वस्तुओं पर सत्यापित ArUco अंशांकन, ओसीआर बाउंडिंग बॉक्स और तालिका-I अनुपालन रिकॉर्ड के साथ संपूर्ण विधिक सत्यापन का अन्वेषण करें:"
                : "Explore end-to-end statutory verification with verified ArUco calibration, OCR bounding boxes, and Table-I compliance records across standard packaged commodities:"}
            </p>
          </div>

          <GoldenSkuQuickSelector onSelectSku={(id) => navigate(`/inspections/${id}`)} />
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
        onFallbackToUpload={() => fileInputRef.current?.click()}
      />

      {/* Interactive Framing Guidance Modal */}
      {showGuidanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-govNavy text-white">
              <div className="flex items-center gap-2">
                <HelpCircle size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold">
                  {language === "hi" ? "विधिक क्षेत्रीय अधिग्रहण एवं फ्रेमिंग प्रोटोकॉल" : "Statutory Field Capture & Framing Protocol"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuidanceModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <img
                src="/assets/guidance/camera_framing_guide.svg"
                alt="Framing and ArUco placement instructions"
                className="w-full rounded-xl border border-slate-200"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    {language === "hi" ? "1. लंबवत तल (90°)" : "1. Orthogonal Plane (90°)"}
                  </span>
                  {language === "hi"
                    ? "पर्सपेक्टिव विरूपण से बचने के लिए उपकरण को सीधे पैकेज की सतह के ऊपर रखें।"
                    : "Hold device directly above package surface to prevent perspective keystoning."}
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-0.5">
                    {language === "hi" ? "2. 50mm ArUco संदर्भ" : "2. 50mm ArUco Fiducial"}
                  </span>
                  {language === "hi"
                    ? "अनिवार्य विधिक पाठ को ढके बिना लेबल घोषणाओं के पास सपाट रखें।"
                    : "Place flat next to label declarations without obscuring mandatory text."}
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowGuidanceModal(false)}
                  className="btn-primary text-xs px-5 py-2"
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
