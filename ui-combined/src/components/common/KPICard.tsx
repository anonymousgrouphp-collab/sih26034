import React, { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: ReactNode;
  tone?: "normal" | "success" | "warning" | "danger";
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  trend,
  trendPositive,
  icon,
  tone = "normal",
  onClick,
}) => {
  const toneClasses = {
    normal: "bg-white border-slate-200 text-govNavy",
    success: "bg-verdictPass-light border-emerald-300 text-verdictPass-dark",
    warning: "bg-verdictReview-light border-amber-300 text-verdictReview-dark",
    danger: "bg-verdictFail-light border-rose-300 text-verdictFail-dark",
  };

  const iconBgClasses = {
    normal: "bg-govNavy/10 text-govNavy",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
  };

  return (
    <div
      onClick={onClick}
      className={`card p-4 sm:p-5 transition-all ${toneClasses[tone]} ${
        onClick ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-sans">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-bold ${
                  trendPositive ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {trend}
              </span>
            )}
          </div>
          {subtext && <p className="mt-1 text-xs text-slate-500 truncate">{subtext}</p>}
        </div>
        {icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${iconBgClasses[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
