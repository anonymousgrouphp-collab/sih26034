import React, { useState, useEffect } from "react";
import {
  useCameraStream,
  CapturedPhoto,
} from "./useCameraStream";
import { CameraPreview } from "./CameraPreview";
import { CameraControls } from "./CameraControls";
import { PhotoReview } from "./PhotoReview";
import { CameraPermissionCard } from "./CameraPermissionCard";
import { ShieldCheck, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface InspectionCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (file: File, previewUrl: string, width: number, height: number) => void;
  onFallbackToUpload: () => void;
  retakeReason?: string;
}

export const InspectionCameraModal: React.FC<InspectionCameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onFallbackToUpload,
  retakeReason,
}) => {
  const { language } = useLanguage();
  const {
    videoRef,
    status,
    error,
    guidance,
    videoDevices,
    facingMode,
    torchSupported,
    torchOn,
    requestCamera,
    stopCamera,
    switchCamera,
    toggleTorch,
    capturePhoto,
  } = useCameraStream();

  const [currentPhoto, setCurrentPhoto] = useState<CapturedPhoto | null>(null);
  const [showFramingGuide, setShowFramingGuide] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Handle opening / closing
  useEffect(() => {
    if (isOpen) {
      setCurrentPhoto(null);
      setIsCapturing(false);
      setIsAccepting(false);
      // Automatically request rear camera on mount if not in review
      requestCamera("environment");
    } else {
      stopCamera();
      setCurrentPhoto(null);
    }
  }, [isOpen]);

  // Handle capture trigger
  const handleCapture = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    try {
      const photo = await capturePhoto();
      setCurrentPhoto(photo);
    } catch (err) {
      console.error("Capture failed:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Handle retake trigger
  const handleRetake = () => {
    if (currentPhoto) {
      URL.revokeObjectURL(currentPhoto.previewUrl);
      setCurrentPhoto(null);
    }
    requestCamera(facingMode);
  };

  // Handle accept photo
  const handleAccept = (photo: CapturedPhoto) => {
    setIsAccepting(true);
    const filename = `package_capture_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.jpg`;
    const file = new File([photo.blob], filename, { type: "image/jpeg" });

    onPhotoCaptured(file, photo.previewUrl, photo.width, photo.height);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === "hi" ? "विधिक मापविज्ञान कैमरा साक्ष्य कैप्चर" : "Legal Metrology Camera Evidence Capture"}
      className="fixed inset-0 z-50 bg-black/90 sm:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden animate-fade-in"
    >
      {/* Smartphone-first Fullscreen / Desktop Contained Modal Shell */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-slate-950 sm:rounded-2xl sm:border sm:border-slate-800 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Mini Government Bar (Screen reader & Officer HUD) */}
        <div className="bg-[#091422] text-white px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span className="font-bold tracking-wide">
              {language === "hi"
                ? "न्यायदृष्टि-एलएम • फील्ड कैमरा निरीक्षण"
                : "NyayaDrishti-LM • Field Camera Inspection"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title={language === "hi" ? "कैमरा बंद करें" : "Close camera"}
            aria-label={language === "hi" ? "कैमरा बंद करें" : "Close camera"}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body State Switcher */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {currentPhoto ? (
            /* State 1: Photo Review Screen */
            <PhotoReview
              photo={currentPhoto}
              onRetake={handleRetake}
              onAccept={handleAccept}
              isSubmitting={isAccepting}
            />
          ) : status === "STREAMING" ? (
            /* State 2: Live Video Stream & Real-time Framing HUD */
            <>
              <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                <CameraPreview
                  videoRef={videoRef}
                  guidance={guidance}
                  showFramingGuide={showFramingGuide}
                  retakeReason={retakeReason}
                  facingMode={facingMode}
                />
              </div>

              {/* Bottom Touch-Friendly Controls */}
              <CameraControls
                onCapture={handleCapture}
                onSwitchCamera={switchCamera}
                onToggleTorch={toggleTorch}
                onToggleFramingGuide={() => setShowFramingGuide((prev) => !prev)}
                onClose={onClose}
                isCapturing={isCapturing}
                canSwitchCamera={videoDevices.length > 1}
                torchSupported={torchSupported}
                torchOn={torchOn}
                showFramingGuide={showFramingGuide}
              />
            </>
          ) : (
            /* State 3: Permission Request / Educational Prompt / Error Card */
            <div className="flex-1 flex items-center justify-center p-4 bg-white sm:rounded-b-2xl">
              <CameraPermissionCard
                error={error}
                onRequestPermission={() => requestCamera("environment")}
                onFallbackToUpload={() => {
                  stopCamera();
                  onClose();
                  onFallbackToUpload();
                }}
                onClose={onClose}
                isLoading={status === "REQUESTING"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
