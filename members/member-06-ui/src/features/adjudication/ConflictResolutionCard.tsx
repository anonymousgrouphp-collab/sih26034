import React from "react";
import { AlertTriangle, ArrowRight, UserRoundCheck } from "lucide-react";

export interface EvidenceConflict {
  id: string;
  field: string;
  expected: string;
  observed: string;
  description: string;
  requiresHumanDecision?: boolean;
  resolved?: boolean;
  resolutionNote?: string;
  selectedDecision?: string;
}

export interface ConflictResolutionCardProps {
  conflicts: EvidenceConflict[];
  onOpenAdjudication?: () => void;
  onReview?: () => void;
}

export const ConflictResolutionCard: React.FC<ConflictResolutionCardProps> = ({
  conflicts,
  onOpenAdjudication,
  onReview,
}) => {
  const handleAction = onOpenAdjudication || onReview;

  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="conflict-resolution-card"
      className="overflow-hidden rounded-lg border border-amber-300 bg-amber-50 shadow-workstation"
    >
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-100/60 px-5 py-3.5">
        <div className="rounded-md bg-white p-2 text-amber-700 shadow-xs shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-amber-950">
              Human Review Required ({conflicts.length} Contradictory {conflicts.length === 1 ? "Marking" : "Markings"})
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-300">
              SECTION 63 BSA 2023 · HITL GATE
            </span>
          </div>
          <p className="mt-0.5 text-xs text-amber-900/90 leading-relaxed">
            Automated processing identified contradictory declarations or dual markings that cannot be deterministically resolved without human officer adjudication.
          </p>
        </div>
      </div>

      {/* Conflict Items List */}
      <div className="divide-y divide-amber-200/70">
        {conflicts.map((c) => (
          <div key={c.id} className="p-4 sm:p-5 hover:bg-amber-100/30 transition-colors">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr] items-start">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-900 bg-white px-2.5 py-1 rounded border border-amber-200 shadow-xs">
                  {c.field}
                </span>
                {c.resolved && (
                  <div className="mt-2">
                    <span className="inline-flex items-start gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-300 shadow-2xs font-mono leading-tight">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-0.5"></span>
                      <span className="break-words">
                        {c.resolutionNote || c.selectedDecision
                          ? `LMO Adjudicated: ${c.resolutionNote || c.selectedDecision}`
                          : "Resolved by LMO"}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {(c.expected || c.observed) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {c.expected && (
                      <span className="rounded bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 border border-amber-200/80 shadow-xs font-mono">
                        Expected: {c.expected}
                      </span>
                    )}
                    {c.expected && c.observed && (
                      <ArrowRight className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    )}
                    {c.observed && (
                      <span className="rounded bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-800 shadow-xs font-mono">
                        Observed: {c.observed}
                      </span>
                    )}
                  </div>
                )}

                <p className="text-xs leading-relaxed text-amber-950 font-medium">
                  {c.description}
                </p>

                {c.requiresHumanDecision !== false && !c.resolved && handleAction && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAction}
                      className="inline-flex items-center gap-2 rounded-md bg-amber-700 hover:bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <UserRoundCheck className="w-4 h-4" />
                      <span>Officer Adjudication</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictResolutionCard;
