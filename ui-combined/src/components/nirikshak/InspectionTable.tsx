import React from "react";
import { ArrowRight, CalendarDays, MapPin, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { VerdictBadge } from "../common/StatusBadge";
import { EpistemicVerdict } from "../../types/inspection";

export interface InspectionTableItem {
  id: string;
  caseNumber: string;
  productName: string;
  category?: string;
  manufacturer?: string;
  packSize?: string;
  batchNumber?: string;
  mrp?: string;
  location: string;
  createdAt: string;
  status: EpistemicVerdict | string;
  overallConfidence: number;
  hasConflicts?: boolean;
}

interface InspectionTableProps {
  inspections: InspectionTableItem[];
  className?: string;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({ inspections, className = "" }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50/75">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === "hi" ? "प्रकरण एवं वस्तु" : "Case & Commodity"}
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === "hi" ? "निरीक्षण स्थल" : "Inspection Location"}
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === "hi" ? "तिथि" : "Date"}
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === "hi" ? "विश्वसनीयता" : "Confidence"}
              </th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === "hi" ? "सांविधिक स्थिति" : "Statutory Status"}
              </th>
              <th className="px-5 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inspections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-400">
                  {language === "hi" ? "कोई निरीक्षण उपलब्ध नहीं है" : "No inspections available"}
                </td>
              </tr>
            )}
            {inspections.map((item) => {
              const confPct = Math.round(
                item.overallConfidence > 1 ? item.overallConfidence : item.overallConfidence * 100
              );

              // Map status to 4-state EpistemicVerdict
              let verdict: EpistemicVerdict = "PASS";
              if (item.status === "FAIL" || item.status === "FAILED") verdict = "FAIL";
              else if (item.status === "REVIEW" || item.status === "MANUAL_REVIEW_REQUIRED") verdict = "REVIEW";
              else if (item.status === "UNABLE_TO_VERIFY" || item.status === "INSUFFICIENT_EVIDENCE") verdict = "UNABLE_TO_VERIFY";

              return (
                <tr
                  key={item.id}
                  onClick={() => navigate(`/inspections/${item.id}`)}
                  className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-xs text-slate-900 group-hover:text-govNavy">
                            {item.productName}
                          </p>
                          {item.hasConflicts && (
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-black text-amber-800 border border-amber-300">
                              <AlertTriangle size={10} />
                              {language === "hi" ? "विसंगति" : "CONFLICT"}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] font-mono text-slate-500">{item.caseNumber}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.packSize || (language === "hi" ? "पैक" : "Pack")} · {language === "hi" ? "बैच" : "Batch"}{" "}
                          {item.batchNumber || (language === "hi" ? "लागू नहीं" : "N/A")} · {item.mrp || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate max-w-[200px]" title={item.location}>
                        {item.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <CalendarDays size={13} className="text-slate-400 shrink-0" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="w-24">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                        <span>{confPct}%</span>
                        <span className="text-[9px] font-normal text-slate-400">
                          {language === "hi" ? "सेंसर" : "sensor"}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                        <div
                          className={`h-full rounded-full ${
                            confPct >= 90
                              ? "bg-emerald-500"
                              : confPct >= 75
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${confPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <VerdictBadge verdict={verdict} size="sm" />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/inspections/${item.id}`);
                      }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-govNavy/10 hover:text-govNavy transition-colors"
                      title={language === "hi" ? "निरीक्षण प्रकरण खोलें" : "Open Inspection Case"}
                    >
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InspectionTable;
