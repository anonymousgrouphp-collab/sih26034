import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Eye,
  EyeOff,
  ScanSearch,
  Ruler,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";

export interface CanvasBoundingBox {
  id: string;
  label: string;
  x: number; // percentage [0 - 100]
  y: number; // percentage [0 - 100]
  width: number; // percentage [0 - 100]
  height: number; // percentage [0 - 100]
  confidence: number;
  type?: string;
}

export interface CanvasImageItem {
  id: string;
  url: string;
  filename: string;
  type: string;
  width: number;
  height: number;
}

interface InspectionVisionCanvasProps {
  images: CanvasImageItem[];
  boxes: CanvasBoundingBox[];
  calibration?: {
    available: boolean;
    referenceObject?: string;
    scaleMmPerPixel?: number;
    referenceLengthMm?: number;
    measuredPixels?: number;
  };
  onSelectBox?: (boxId: string) => void;
  selectedBoxId?: string;
  className?: string;
}

export const InspectionVisionCanvas: React.FC<InspectionVisionCanvasProps> = ({
  images,
  boxes,
  calibration,
  onSelectBox,
  selectedBoxId,
  className = "",
}) => {
  const { language } = useLanguage();
  const [selectedImageId, setSelectedImageId] = useState<string>(images[0]?.id || "");
  const [zoom, setZoom] = useState<number>(1);
  const [showBoxes, setShowBoxes] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"image" | "annotations" | "calibration">("image");

  const activeImage = images.find((img) => img.id === selectedImageId) || images[0];

  const handleZoomIn = () => setZoom((v) => Math.min(2.5, Number((v + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom((v) => Math.max(0.5, Number((v - 0.15).toFixed(2))));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 bg-slate-50/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-govNavy/10 text-govNavy">
            <ScanSearch size={17} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              {activeImage?.filename || (language === "hi" ? "भौतिक पैकेजिंग छायाचित्र" : "Physical Packaging Photograph")}
            </h3>
            <p className="text-[10px] text-slate-400">
              {activeImage
                ? `${activeImage.width} × ${activeImage.height}px · ${activeImage.type.replace(/_/g, " ")}`
                : language === "hi"
                ? "उच्च-रिज़ॉल्यूशन सेंसर साक्ष्य"
                : "High-resolution sensor evidence"}
            </p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "image" ? "bg-white text-govNavy shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "छवि दृश्य" : "Image View"}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("annotations");
              setShowBoxes(true);
            }}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "annotations" ? "bg-white text-govNavy shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "एनोटेशन" : "Annotations"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("calibration")}
            className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
              activeTab === "calibration" ? "bg-white text-govNavy shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "अंशांकन दृश्य" : "Calibration View"}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative min-h-[480px] bg-slate-950 flex items-center justify-center overflow-auto p-6 sm:min-h-[540px]">
        {/* Floating Zoom Toolbar */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-1 rounded-lg bg-white/95 p-1 shadow-lg backdrop-blur-xs border border-slate-200">
          <button
            type="button"
            onClick={handleZoomIn}
            title={language === "hi" ? "ज़ूम इन करें" : "Zoom In"}
            className="rounded p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ZoomIn size={16} />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title={language === "hi" ? "ज़ूम आउट करें" : "Zoom Out"}
            className="rounded p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            title={language === "hi" ? "ज़ूम रीसेट करें (1:1)" : "Reset Zoom (1:1)"}
            className="rounded p-1.5 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => setShowBoxes((v) => !v)}
            title={
              showBoxes
                ? language === "hi"
                  ? "पहचान ओवरले छिपाएं"
                  : "Hide Detection Overlays"
                : language === "hi"
                ? "पहचान ओवरले दिखाएं"
                : "Show Detection Overlays"
            }
            className={`rounded p-1.5 transition-colors ${
              showBoxes ? "bg-govNavy text-white" : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            {showBoxes ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {/* The Packaging Canvas Content */}
        <div
          className="relative shrink-0 transition-transform duration-200 select-none shadow-2xl"
          style={{
            width: `${Math.min(640 * zoom, 1200)}px`,
            aspectRatio: activeImage ? `${activeImage.width} / ${activeImage.height}` : "4 / 3",
          }}
        >
          {activeImage ? (
            <img
              src={activeImage.url}
              alt={activeImage.filename}
              className="h-full w-full rounded-md object-contain pointer-events-none"
            />
          ) : (
            <div className="h-full w-full rounded-md bg-slate-900 flex items-center justify-center text-slate-500 text-xs">
              {language === "hi" ? "कोई साक्ष्य छवि लोड नहीं है" : "No evidence image loaded"}
            </div>
          )}

          {/* Bounding Box Annotations Overlay */}
          {showBoxes && activeTab !== "calibration" && (
            <div className="absolute inset-0 pointer-events-none">
              {boxes.map((b) => {
                const isSelected = selectedBoxId === b.id;
                const isFiducial = b.type === "FIDUCIAL_STANDARD" || b.label.toLowerCase().includes("aruco");
                const isFail = b.type === "FAIL" || b.label.toLowerCase().includes("deficit") || b.label.toLowerCase().includes("missing");
                const isReview = b.type === "REVIEW" || b.label.toLowerCase().includes("review") || b.label.toLowerCase().includes("borderline");
                const isMrp = b.type === "MRP" || b.label.toLowerCase().includes("mrp") || b.label.toLowerCase().includes("usp");
                const isNetQty = b.type === "NET_QUANTITY" || b.label.toLowerCase().includes("net");
                const isPass = b.type === "PASS";

                const borderClass = isSelected
                  ? "border-amber-400 bg-amber-400/25 ring-4 ring-amber-400/40 z-30"
                  : isFiducial
                  ? "border-amber-400 border-dashed bg-amber-400/10 hover:bg-amber-400/20 z-10"
                  : isFail
                  ? "border-rose-500 bg-rose-500/20 hover:bg-rose-500/30 z-20"
                  : isReview
                  ? "border-amber-400 bg-amber-400/20 hover:bg-amber-400/30 z-20"
                  : isMrp
                  ? "border-sky-400 bg-sky-400/15 hover:bg-sky-400/30 z-10"
                  : isNetQty || isPass
                  ? "border-emerald-400 bg-emerald-400/15 hover:bg-emerald-400/30 z-10"
                  : "border-indigo-400 bg-indigo-400/15 hover:bg-indigo-400/30 z-10";

                const badgeClass = isSelected
                  ? "bg-amber-500 text-slate-950 font-black"
                  : isFiducial
                  ? "bg-amber-900/90 text-amber-300 border border-amber-400/50"
                  : isFail
                  ? "bg-rose-700 text-white"
                  : isReview
                  ? "bg-amber-600 text-white"
                  : isMrp
                  ? "bg-sky-700 text-white"
                  : isNetQty || isPass
                  ? "bg-emerald-700 text-white"
                  : "bg-indigo-700 text-white";

                const displayLabel = b.label.length > 38 ? `${b.label.slice(0, 36)}…` : b.label;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBox?.(b.id)}
                    title={`${b.label} (${Math.round(b.confidence * 100)}% ${language === "hi" ? "विश्वसनीयता" : "confidence"})`}
                    className={`absolute border-2 pointer-events-auto transition-all cursor-pointer ${borderClass}`}
                    style={{
                      left: `${b.x}%`,
                      top: `${b.y}%`,
                      width: `${b.width}%`,
                      height: `${b.height}%`,
                    }}
                  >
                    <span
                      className={`absolute -top-6 left-0 whitespace-nowrap rounded px-1.5 py-0.5 text-[9px] font-black shadow-md ${badgeClass}`}
                    >
                      {displayLabel} · {Math.round(b.confidence * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Calibration Overlay Mode */}
          {activeTab === "calibration" && (
            <div className="absolute inset-0 bg-govNavy/40 backdrop-blur-xs flex flex-col items-center justify-center p-6 rounded-md text-white border-2 border-dashed border-amber-400/60">
              <div className="rounded-full bg-amber-400/20 p-3 border border-amber-400 text-amber-300 mb-3 animate-pulse">
                <Ruler size={32} />
              </div>
              <h4 className="text-sm font-black text-white">
                {language === "hi" ? "फोटोग्राममेट्रिक अंशांकन ग्रिड" : "Photogrammetric Calibration Grid"}
              </h4>
              <p className="text-xs text-slate-200 mt-1 max-w-sm text-center">
                {language === "hi"
                  ? "फिड्यूशियल मार्कर पहचान से समतलीय पैमाना संदर्भ स्थापित होता है:"
                  : "Fiducial marker detection establishes planar scale reference:"}
              </p>
              <div className="mt-3 rounded-lg bg-black/60 p-3 border border-white/10 font-mono text-[11px] text-amber-300 space-y-1">
                <div>
                  {language === "hi" ? "संदर्भ मानक:" : "Reference Standard:"}{" "}
                  {calibration?.available
                    ? calibration?.referenceObject || "ArUco 4x4 (50.0mm)"
                    : language === "hi"
                    ? "कोई वैध संदर्भ नहीं"
                    : "No Valid Fiducial"}
                </div>
                <div>
                  {language === "hi" ? "समाधानित पैमाना:" : "Resolved Scale:"}{" "}
                  {calibration?.available && calibration?.scaleMmPerPixel
                    ? `${calibration.scaleMmPerPixel.toFixed(4)} mm/px`
                    : calibration?.available
                    ? "Calibrated via fiducial standard"
                    : language === "hi"
                    ? "अंशांकित नहीं (निरस्त/अनुपलब्ध)"
                    : "Not Calibrated (Aborted/Unavailable)"}
                </div>
                <div>
                  {language === "hi" ? "समतलीय होमोग्राफी:" : "Planar Homography:"}{" "}
                  {calibration?.available
                    ? language === "hi"
                      ? "सत्यापित (झुकाव < 15°)"
                      : "Verified (Tilt < 15°)"
                    : language === "hi"
                    ? "अस्वीकृत / अप्रयुक्त"
                    : "Rejected / Inactive"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Viewport Info Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 border-t border-white/10 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                showBoxes ? "bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>
              {showBoxes
                ? `${boxes.length} ${language === "hi" ? "पहचान ओवरले सक्रिय" : "Detection Overlays Active"}`
                : language === "hi"
                ? "ओवरले छिपे हुए हैं"
                : "Overlays Hidden"}
            </span>
          </div>
          <div>
            <span>
              {language === "hi" ? "ज़ूम" : "Zoom"}: {Math.round(zoom * 100)}% ·{" "}
              {language === "hi" ? "पैन और ज़ूम करने के लिए नियंत्रणों का उपयोग करें" : "Use controls to pan & zoom"}
            </span>
          </div>
        </div>
      </div>

      {/* Thumbnail Selector Strip (Multi-Image packages) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto border-t border-slate-200 p-3 bg-slate-50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            {language === "hi" ? "दृश्य:" : "Views:"}
          </span>
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedImageId(img.id)}
              className={`group relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                img.id === activeImage?.id
                  ? "border-govNavy ring-2 ring-govNavy/30"
                  : "border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt={img.filename} className="h-full w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-[8px] font-bold uppercase text-white truncate">
                {img.type.replace(/_/g, " ")}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InspectionVisionCanvas;
