import React, { useState } from "react";
import {
  Check,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCheck,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { CapturedPhoto } from "./useCameraStream";
import { useLanguage } from "../../context/LanguageContext";

interface PhotoReviewProps {
  photo: CapturedPhoto;
  onRetake: () => void;
  onAccept: (photo: CapturedPhoto) => void;
  isSubmitting?: boolean;
}

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  photo,
  onRetake,
  onAccept,
  isSubmitting = false,
}) => {
  const { language } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white select-none">
      {/* 1. Top Review Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-slate-200">
            {language === "hi" ? "निरीक्षण साक्ष्य समीक्षा" : "Inspection Evidence Review"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
          title={isZoomed ? (language === "hi" ? "ज़ूम रीसेट करें" : "Reset zoom") : (language === "hi" ? "सांविधिक घोषणाओं पर ज़ूम करें" : "Zoom in on statutory declarations")}
        >
          {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
          <span>{isZoomed ? (language === "hi" ? "1× सामान्य" : "1× Fit") : (language === "hi" ? "2.5× ज़ूम" : "2.5× Zoom")}</span>
        </button>
      </div>

      {/* 2. Photo Display Container (Scrollable / Zoomable) */}
      <div className="flex-1 relative overflow-auto bg-black flex items-center justify-center p-2 sm:p-4">
        {/* Untouched Legal Integrity Watermark Tag */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-govNavy/90 border border-amber-400/80 text-[10.5px] font-mono font-bold text-white shadow-md">
            <ShieldCheck size={13} className="text-amber-400" />
            <span>{language === "hi" ? "मूल साक्ष्य कैप्चर" : "ORIGINAL EVIDENCE CAPTURE"}</span>
          </span>
        </div>

        <div
          className={`transition-all duration-200 cursor-pointer ${
            isZoomed ? "scale-175 sm:scale-200 origin-center" : "scale-100"
          }`}
          onClick={() => setIsZoomed((prev) => !prev)}
        >
          <img
            src={photo.previewUrl}
            alt={language === "hi" ? "कैप्चर किया गया कमोडिटी पैकेजिंग साक्ष्य" : "Captured commodity packaging evidence"}
            className="max-h-[62vh] sm:max-h-[68vh] w-auto rounded-lg object-contain shadow-2xl border border-slate-800"
          />
        </div>
      </div>

      {/* 3. Technical Metadata Ticker Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400">
        <div>
          <span className="text-slate-500 font-sans block text-[10px]">
            {language === "hi" ? "सेंसर रिज़ॉल्यूशन:" : "Sensor Resolution:"}
          </span>
          <span className="font-bold text-slate-200">{photo.width} × {photo.height} px</span>
        </div>
        <div>
          <span className="text-slate-500 font-sans block text-[10px]">
            {language === "hi" ? "पेलोड आकार:" : "Payload Size:"}
          </span>
          <span className="font-bold text-slate-200">{formatFileSize(photo.sizeBytes)}</span>
        </div>
        <div>
          <span className="text-slate-500 font-sans block text-[10px]">
            {language === "hi" ? "एन्कोडिंग / माइम:" : "Encoding / Mime:"}
          </span>
          <span className="font-bold text-slate-200">
            {language === "hi" ? "JPEG (दोषरहित-अनुकूलित)" : "JPEG (Lossless-Optimized)"}
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-sans block text-[10px]">
            {language === "hi" ? "कैप्चर समय-मुहर:" : "Captured Timestamp:"}
          </span>
          <span className="font-bold text-slate-200">
            {new Date(photo.timestamp).toLocaleTimeString(language === "hi" ? "hi-IN" : "en-IN", { hour12: false })} IST
          </span>
        </div>
      </div>

      {/* 4. Bottom Sticky Action Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 sm:py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          {/* Retake Button */}
          <button
            type="button"
            onClick={onRetake}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            <RotateCcw size={16} />
            <span>{language === "hi" ? "फोटो पुनः लें" : "Retake Photo"}</span>
          </button>

          {/* Accept / Use Photo Button */}
          <button
            type="button"
            onClick={() => onAccept(photo)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>{language === "hi" ? "साक्ष्य संचय हो रहा है..." : "Staging Evidence..."}</span>
            ) : (
              <>
                <Check size={16} />
                <span>{language === "hi" ? "इस फोटो का उपयोग करें" : "Use This Photo"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
