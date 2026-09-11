import React from "react";
import { Camera, ShieldCheck, AlertCircle, RefreshCw, UploadCloud, X } from "lucide-react";
import { CameraError } from "./useCameraStream";
import { useLanguage } from "../../context/LanguageContext";

interface CameraPermissionCardProps {
  error: CameraError | null;
  onRequestPermission: () => void;
  onFallbackToUpload: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const CameraPermissionCard: React.FC<CameraPermissionCardProps> = ({
  error,
  onRequestPermission,
  onFallbackToUpload,
  onClose,
  isLoading = false,
}) => {
  const { language } = useLanguage();

  const getLocalizedErrorCode = (code: string) => {
    if (language !== "hi") return code.replace(/_/g, " ");
    switch (code) {
      case "NOT_ALLOWED":
        return "कैमरा अनुमति अस्वीकृत";
      case "NOT_FOUND":
        return "कैमरा हार्डवेयर नहीं मिला";
      case "NOT_READABLE":
        return "कैमरा सेंसर व्यस्त अथवा अनुपलब्ध";
      case "OVERCONSTRAINED":
        return "अति-बाधित कैमरा रिज़ॉल्यूशन";
      case "SECURITY":
        return "सुरक्षा नीति प्रतिबंध";
      default:
        return "अज्ञात कैमरा त्रुटि";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] p-6 text-center max-w-md mx-auto space-y-5">
      {/* Top Close Icon for mobile */}
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={language === "hi" ? "कैमरा बंद करें" : "Close camera"}
          aria-label={language === "hi" ? "कैमरा बंद करें" : "Close camera"}
        >
          <X size={20} />
        </button>
      </div>

      {error ? (
        /* State 2: Error / Denied State */
        <>
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
            <AlertCircle size={32} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              {getLocalizedErrorCode(error.code)}
            </span>
            <h3 className="text-lg font-black text-slate-900">{error.message}</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {error.userGuidance}
            </p>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onRequestPermission}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>{language === "hi" ? "सेंसर से कनेक्ट हो रहा है..." : "Connecting Sensor..."}</span>
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>{language === "hi" ? "पुनः प्रयास करें" : "Try Again"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onFallbackToUpload}
              className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <UploadCloud size={15} className="text-slate-500" />
              <span>{language === "hi" ? "इसके बजाय पैकेजिंग फोटो अपलोड करें" : "Upload Packaging Photo Instead"}</span>
            </button>
          </div>
        </>
      ) : (
        /* State 1: Pre-Permission Educational Explanation */
        <>
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-govNavy flex items-center justify-center shadow-xs">
            <Camera size={32} />
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-govNavy bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {language === "hi" ? "सांविधिक साक्ष्य अंतर्ग्रहण" : "Statutory Evidence Intake"}
            </span>
            <h3 className="text-lg font-black text-slate-900">
              {language === "hi" ? "फील्ड कैमरा एक्सेस आवश्यक" : "Field Camera Access Required"}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              {language === "hi"
                ? "विधिक मापविज्ञान अधिनियम, 2009 के तहत सांविधिक अनुपालन सत्यापन हेतु पैकेज्ड वस्तु एवं अरूको मार्कर का फोटो लेने के लिए कैमरा एक्सेस आवश्यक है।"
                : "Camera access is needed to photograph the packaged commodity and ArUco fiducial marker for statutory compliance verification under the Legal Metrology Act, 2009."}
            </p>
          </div>

          {/* Privacy & Evidentiary Assurance Badges */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left space-y-2 text-[11px] text-slate-700">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                {language === "hi" ? (
                  <><strong>केवल वीडियो:</strong> कोई माइक्रोफ़ोन या ऑडियो रिकॉर्डिंग नहीं।</>
                ) : (
                  <><strong>Video Only:</strong> Zero microphone or audio recording.</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                {language === "hi" ? (
                  <><strong>गोपनीयता की गारंटी:</strong> कैप्चर के तुरंत बाद कैमरा बंद हो जाता है।</>
                ) : (
                  <><strong>Privacy Guaranteed:</strong> Camera stops immediately after capture.</>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>
                {language === "hi" ? (
                  <><strong>धारा 63 बीएसए 2023:</strong> मूल साक्ष्य को क्रिप्टोग्राफ़िक रूप से हैश किया जाता है।</>
                ) : (
                  <><strong>Section 63 BSA 2023:</strong> Raw evidence cryptographically hashed.</>
                )}
              </span>
            </div>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onRequestPermission}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>{language === "hi" ? "कैमरा एक्सेस का अनुरोध किया जा रहा है..." : "Requesting Camera Access..."}</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>{language === "hi" ? "कैमरा की अनुमति दें व कैप्चर शुरू करें" : "Allow Camera & Start Capture"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onFallbackToUpload}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <UploadCloud size={14} className="text-slate-400" />
              <span>{language === "hi" ? "मौजूदा फ़ाइल / गैलरी से चुनें" : "Choose Existing File / Gallery"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
