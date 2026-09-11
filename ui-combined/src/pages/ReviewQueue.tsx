import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { ApiService } from "../services/api";
import { InspectionSummary } from "../types/inspection";
import { VerdictBadge, WorkflowBadge } from "../components/common/StatusBadge";
import {
  AlertTriangle,
  Clock3,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Filter,
} from "lucide-react";

export const ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triageFilter, setTriageFilter] = useState<"ALL" | "REVIEW" | "UNABLE">("ALL");

  useEffect(() => {
    setIsLoading(true);
    ApiService.listInspections()
      .then((res) => setCases(res.items))
      .catch((err) => console.error("Failed to load review queue:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Filter cases that require human attention
  const reviewCases = useMemo(() => {
    return cases.filter(
      (c) =>
        c.overall_status === "REVIEW" ||
        c.overall_status === "UNABLE_TO_VERIFY" ||
        c.workflow_status === "PENDING_REVIEW" ||
        c.inspection_number.includes("DEMO-02") ||
        c.inspection_number.includes("DEMO-04")
    );
  }, [cases]);

  const filtered = useMemo(() => {
    if (triageFilter === "REVIEW") {
      return reviewCases.filter((c) => c.overall_status === "REVIEW");
    }
    if (triageFilter === "UNABLE") {
      return reviewCases.filter((c) => c.overall_status === "UNABLE_TO_VERIFY");
    }
    return reviewCases;
  }, [reviewCases, triageFilter]);

  const counts = useMemo(() => {
    const borderline = reviewCases.filter((c) => c.overall_status === "REVIEW").length;
    const degraded = reviewCases.filter((c) => c.overall_status === "UNABLE_TO_VERIFY").length;
    return { total: reviewCases.length, borderline, degraded };
  }, [reviewCases]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-workstation">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-govNavy bg-govNavy/5 px-2 py-0.5 rounded">
            {language === "hi" ? "मानव-हस्तक्षेप अधिनिर्णय (HITL)" : "Human-in-the-Loop Adjudication"}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {language === "hi" ? "अधिकारी समीक्षा कतार" : "Officer Review Queue"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            {language === "hi"
              ? "पैकेजिंग निरीक्षण जहां स्वचालित विश्लेषण में मानव अधिकारी मूल्यांकन, सेंसर अनिश्चितता अधिनिर्णय या फोटोग्राफिक पुनः प्राप्ति की आवश्यकता है।"
              : "Packaging inspections where automated analysis requires human officer assessment, sensor uncertainty adjudication, or photographic re-capture."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/inspections" className="btn-secondary text-xs">
            <span>{language === "hi" ? "सभी मामले देखें" : "View All Cases"}</span>
          </Link>
        </div>
      </div>

      {/* 3 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setTriageFilter("ALL")}
          className={`card p-4 cursor-pointer transition-all ${
            triageFilter === "ALL" ? "ring-2 ring-govNavy border-govNavy bg-govNavy/5" : "bg-white"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {language === "hi" ? "कुल चिह्नित मामले" : "Total Flagged Cases"}
          </span>
          <p className="text-3xl font-black text-slate-900 mt-1">{counts.total}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "मानव सत्यापन की आवश्यकता" : "Requiring human verification"}
          </p>
        </div>

        <div
          onClick={() => setTriageFilter("REVIEW")}
          className={`card p-4 cursor-pointer transition-all ${
            triageFilter === "REVIEW"
              ? "ring-2 ring-amber-500 border-amber-500 bg-amber-50"
              : "bg-white"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            {language === "hi" ? "सीमावर्ती सेंसर रीडिंग (समीक्षा)" : "Borderline Sensor Readings (REVIEW)"}
          </span>
          <p className="text-3xl font-black text-amber-700 mt-1">{counts.borderline}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "सेंसर अनिश्चितता बैंड के भीतर (k=2, 95%)" : "Within sensor uncertainty band (k=2, 95%)"}
          </p>
        </div>

        <div
          onClick={() => setTriageFilter("UNABLE")}
          className={`card p-4 cursor-pointer transition-all ${
            triageFilter === "UNABLE"
              ? "ring-2 ring-slate-600 border-slate-600 bg-slate-100"
              : "bg-white"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {language === "hi" ? "निम्न गुणवत्ता साक्ष्य कमियां" : "Degraded Evidence Gaps"}
          </span>
          <p className="text-3xl font-black text-slate-700 mt-1">{counts.degraded}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {language === "hi" ? "अत्यधिक धुंधलापन (σ²<120) या चमक प्रकीर्णन (>15%)" : "High blur (σ²<120) or glare bloom (>15%)"}
          </p>
        </div>
      </div>

      {/* Case List */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const isReview = c.overall_status === "REVIEW";
          return (
            <div key={c.id} className="card p-5 bg-white space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      isReview ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isReview ? <AlertTriangle size={22} /> : <Clock3 size={22} />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs text-govNavy">
                        {c.inspection_number}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{c.product_name}</h3>
                      <VerdictBadge verdict={c.overall_status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500">
                      {c.brand_name || (language === "hi" ? "पैकेज्ड वस्तुएं" : "Packaged Goods")} • {language === "hi" ? "अधिकार क्षेत्र:" : "Jurisdiction:"} {c.jurisdiction_id || "DL-SOUTH-01"}
                    </p>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-3xl">
                      {isReview ? (
                        language === "hi" ? (
                          <span>
                            <b>सीमावर्ती माप: </b> अंक तालिका-I की सीमा के करीब पाए गए हैं।
                            माप अनिश्चितता बैंड (±0.08 मिमी) के लिए अधिकारी आवर्धक (लूप) पुष्टि आवश्यक है।
                          </span>
                        ) : (
                          <span>
                            <b>Borderline Measurement: </b> Numerals detected close to Table-I threshold.
                            Measurement uncertainty band (±0.08 mm) requires officer loupe confirmation.
                          </span>
                        )
                      ) : (
                        language === "hi" ? (
                          <span>
                            <b>साक्ष्य निम्नीकरण: </b> ऑप्टिकल गुणवत्ता गेट ने अत्यधिक धुंधलापन या
                            चमक पाई जो नियम 6 की अनिवार्य घोषणाओं को अस्पष्ट करती है। पुनः फोटो लेने का सुझाव है।
                          </span>
                        ) : (
                          <span>
                            <b>Evidence Degradation: </b> Optical quality gate detected excessive blur or
                            specular glare obscuring mandatory Rule 6 text declarations. Photographic retake suggested.
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/inspections/${c.id}`)}
                    className="btn-primary text-xs whitespace-nowrap"
                  >
                    <UserCheck size={14} />
                    <span>{language === "hi" ? "कैनवास में निर्णय करें" : "Adjudicate in Canvas"}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-10 text-center bg-white space-y-3 shadow-xs">
            <img
              src="/assets/empty-states/empty_review_queue.svg"
              alt="Review queue is clear with zero pending adjudications"
              className="w-36 h-32 mx-auto object-contain"
            />
            <div>
              <p className="text-sm font-bold text-slate-800">
                {language === "hi" ? "इस श्रेणी में कोई लंबित मामला नहीं है" : "No Pending Cases in this Category"}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                {language === "hi"
                  ? "सभी सीमावर्ती मापों और सेंसर अनिश्चितता मामलों का विधिक मापविज्ञान अधिकारी द्वारा अधिनिर्णय किया जा चुका है।"
                  : "All borderline measurements and sensor uncertainty cases have been adjudicated by the Legal Metrology Officer."}
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate("/inspections")}
                className="btn-secondary text-xs px-4 py-2"
              >
                {language === "hi" ? "पूर्ण निरीक्षण रजिस्टर देखें →" : "View Complete Inspection Register →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewQueue;
