import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ApiService } from "../services/api";
import { InspectionCase } from "../types/inspection";
import { CaseWorkspace } from "../features/case/CaseWorkspace";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

export const InspectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [caseData, setCaseData] = useState<InspectionCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    ApiService.getInspection(id)
      .then((data) => {
        if (isMounted) {
          setCaseData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Failed to load inspection case:", err);
          setError(
            err.message ||
              (language === "hi"
                ? "निरीक्षण केस नहीं मिला।"
                : "Inspection case not found.")
          );
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, language]);

  if (isLoading) {
    return (
      <div className="card p-12 text-center bg-white space-y-3">
        <div className="w-8 h-8 border-4 border-govNavy border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-600">
          {language === "hi"
            ? "सांविधिक केस फ़ाइल और क्रिप्टोग्राफ़िक साक्ष्य संपत्तियां लोड हो रही हैं..."
            : "Loading statutory case file and cryptographic evidence assets..."}
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="card p-10 text-center bg-white space-y-4 max-w-xl mx-auto">
        <AlertCircle size={36} className="text-rose-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">
          {language === "hi" ? "निरीक्षण केस नहीं मिला" : "Inspection Case Not Found"}
        </h2>
        <p className="text-xs text-slate-500">
          {language === "hi" ? (
            <>
              केस संदर्भ आईडी{" "}
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{id}</code>{" "}
              स्थानीय डेटास्टोर से पुनर्प्राप्त नहीं की जा सकी।
            </>
          ) : (
            <>
              Case reference ID{" "}
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">{id}</code> could
              not be retrieved from local datastore.
            </>
          )}
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/inspections" className="btn-secondary text-xs">
            {language === "hi" ? "केस पंजी पर वापस जाएं" : "Back to Case Register"}
          </Link>
          <Link to="/inspections/demo-fortune-sunlite" className="btn-primary text-xs">
            {language === "hi" ? "फॉर्च्यून सनलाइट डेमो लोड करें" : "Load Fortune Sunlite Demo"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CaseWorkspace
        caseData={caseData}
        onBack={() => navigate("/inspections")}
        onCaseUpdated={(updated) => setCaseData(updated)}
        officerRole={user?.officerRole || "INSPECTOR"}
        onSelectCase={(caseId) => navigate(`/inspections/${caseId}`)}
      />
    </div>
  );
};

export default InspectionDetails;
