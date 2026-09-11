import React from "react";
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Scan,
  X,
  FlipHorizontal,
  Circle,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface CameraControlsProps {
  onCapture: () => void;
  onSwitchCamera: () => void;
  onToggleTorch: () => void;
  onToggleFramingGuide: () => void;
  onClose: () => void;
  isCapturing?: boolean;
  canSwitchCamera?: boolean;
  torchSupported?: boolean;
  torchOn?: boolean;
  showFramingGuide?: boolean;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  onCapture,
  onSwitchCamera,
  onToggleTorch,
  onToggleFramingGuide,
  onClose,
  isCapturing = false,
  canSwitchCamera = true,
  torchSupported = false,
  torchOn = false,
  showFramingGuide = true,
}) => {
  const { language } = useLanguage();

  return (
    <div className="bg-slate-950/95 text-white border-t border-slate-800/80 px-4 py-3 sm:py-4 pb-[max(1rem,env(safe-area-inset-bottom))] select-none">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        {/* Left Action: Close / Dismiss */}
        <div className="flex items-center gap-1.5 min-w-[70px]">
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-slate-500"
            title={language === "hi" ? "कैमरा रद्द करें और बंद करें" : "Cancel and close camera"}
            aria-label={language === "hi" ? "कैमरा रद्द करें और बंद करें" : "Cancel and close camera"}
          >
            <X size={20} />
            <span className="text-[10px] font-medium hidden sm:inline">
              {language === "hi" ? "बंद करें" : "Close"}
            </span>
          </button>

          {/* Framing Guide Toggle */}
          <button
            type="button"
            onClick={onToggleFramingGuide}
            className={`p-3 rounded-full transition-colors flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              showFramingGuide
                ? "text-amber-400 bg-amber-950/40 border border-amber-500/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={
              showFramingGuide
                ? (language === "hi" ? "फ्रेमिंग गाइड छिपाएं" : "Hide framing reticle")
                : (language === "hi" ? "फ्रेमिंग गाइड दिखाएं" : "Show framing reticle")
            }
            aria-label={
              showFramingGuide
                ? (language === "hi" ? "फ्रेमिंग गाइड छिपाएं" : "Hide framing reticle")
                : (language === "hi" ? "फ्रेमिंग गाइड दिखाएं" : "Show framing reticle")
            }
          >
            <Scan size={20} />
            <span className="text-[10px] font-medium hidden sm:inline">
              {language === "hi" ? "गाइड" : "Guide"}
            </span>
          </button>
        </div>

        {/* Center Action: Dominant Thumb-Friendly Circular Capture Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onCapture}
            disabled={isCapturing}
            className="group relative w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-white/20 border-4 border-white/60 p-1 flex items-center justify-center transition-transform active:scale-95 hover:border-white shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title={language === "hi" ? "पैकेजिंग फोटो कैप्चर करें (स्पेसबार)" : "Capture packaging photograph (Spacebar)"}
            aria-label={language === "hi" ? "पैकेजिंग फोटो कैप्चर करें" : "Capture packaging photograph"}
          >
            {/* Inner White Capture Disc */}
            <div
              className={`w-full h-full rounded-full bg-white flex items-center justify-center transition-all ${
                isCapturing
                  ? "bg-amber-400 scale-90 animate-pulse"
                  : "group-hover:bg-slate-100"
              }`}
            >
              {isCapturing ? (
                <RefreshCw size={24} className="text-slate-900 animate-spin" />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-slate-900/40" />
              )}
            </div>
          </button>
        </div>

        {/* Right Action: Torch Toggle & Switch Camera */}
        <div className="flex items-center justify-end gap-1.5 min-w-[70px]">
          {/* Torch / Flash Toggle (if hardware supported) */}
          {torchSupported && (
            <button
              type="button"
              onClick={onToggleTorch}
              className={`p-3 rounded-full transition-colors flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                torchOn
                  ? "text-amber-300 bg-amber-950/50 border border-amber-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
              title={
                torchOn
                  ? (language === "hi" ? "टॉर्च बंद करें" : "Turn off torch")
                  : (language === "hi" ? "टॉर्च चालू करें" : "Turn on torch")
              }
              aria-label={
                torchOn
                  ? (language === "hi" ? "टॉर्च बंद करें" : "Turn off torch")
                  : (language === "hi" ? "टॉर्च चालू करें" : "Turn on torch")
              }
            >
              {torchOn ? <Zap size={20} /> : <ZapOff size={20} />}
              <span className="text-[10px] font-medium hidden sm:inline">
                {language === "hi" ? "टॉर्च" : "Torch"}
              </span>
            </button>
          )}

          {/* Switch Camera Button (Front / Back / Multiple Devices) */}
          {canSwitchCamera && (
            <button
              type="button"
              onClick={onSwitchCamera}
              className="p-3 rounded-full text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex flex-col items-center gap-1 focus:outline-none focus:ring-2 focus:ring-govNavy-light"
              title={language === "hi" ? "कैमरा सेंसर बदलें" : "Switch camera sensor"}
              aria-label={language === "hi" ? "कैमरा सेंसर बदलें" : "Switch camera sensor"}
            >
              <FlipHorizontal size={20} />
              <span className="text-[10px] font-medium hidden sm:inline">
                {language === "hi" ? "बदलें" : "Flip"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
