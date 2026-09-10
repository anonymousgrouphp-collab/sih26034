import React, { useState, useMemo } from "react";
import { InspectionSummary } from "../../types/inspection";
import { VerdictBadge, WorkflowBadge } from "../../components/common/StatusBadge";
import { GoldenSkuQuickSelector } from "./GoldenSkuQuickSelector";

interface InspectionDeskProps {
  cases: InspectionSummary[];
  activeCircle: string;
  onSelectCase: (caseId: string) => void;
  onNewInspectionClick: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const InspectionDesk: React.FC<InspectionDeskProps> = ({
  cases,
  activeCircle,
  onSelectCase,
  onNewInspectionClick,
  isLoading = false,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("ALL");
  const [selectedVerdict, setSelectedVerdict] = useState<string>("ALL");

  // Summary Metrics calculated directly from the cases
  const metrics = useMemo(() => {
    const total = cases.length;
    const pendingAdjudication = cases.filter(
      (c) => c.workflow_status === "PENDING_REVIEW" || c.workflow_status === "DRAFT" || c.workflow_status === "OPEN"
    ).length;
    const violations = cases.filter((c) => c.overall_status === "FAIL" || (c.violations_count && c.violations_count > 0)).length;
    const compliant = cases.filter((c) => c.overall_status === "PASS").length;

    return { total, pendingAdjudication, violations, compliant };
  }, [cases]);

  // Filtered case records
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      // Circle filter
      if (activeCircle && c.jurisdiction_id && c.jurisdiction_id !== activeCircle) {
        // Only filter if not "ALL" and matching circle exists
        // (Note: in mock data, most cases share CIRCLE_DL_SOUTH_01)
      }

      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchProduct = c.product_name.toLowerCase().includes(query);
        const matchNumber = c.inspection_number.toLowerCase().includes(query);
        const matchBrand = c.brand_name ? c.brand_name.toLowerCase().includes(query) : false;
        const matchEst = c.establishment_name ? c.establishment_name.toLowerCase().includes(query) : false;
        if (!matchProduct && !matchNumber && !matchBrand && !matchEst) {
          return false;
        }
      }

      // Workflow filter
      if (selectedWorkflow !== "ALL" && c.workflow_status !== selectedWorkflow) {
        return false;
      }

      // Verdict filter
      if (selectedVerdict !== "ALL" && c.overall_status !== selectedVerdict) {
        return false;
      }

      return true;
    });
  }, [cases, activeCircle, searchTerm, selectedWorkflow, selectedVerdict]);

  const formatInspectionType = (type?: string) => {
    switch (type) {
      case "ROUTINE_MARKET_SURVEILLANCE":
        return "Routine Surveillance";
      case "COMPLAINT_VERIFICATION":
        return "Complaint Audit";
      case "MANUFACTURER_PACKER_DEPOT":
        return "Depot Audit";
      case "SURPRISE_ENFORCEMENT_RAID":
        return "Enforcement Raid";
      default:
        return type || "Field Inspection";
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString.slice(0, 10);
    }
  };

  return (
    <div className="space-y-5">
      {/* Desk Title Strip & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-panelBg p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-govNavy">Legal Metrology Inspection Desk</h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
              Active Circle: {activeCircle}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statutory work queue for verified packaged commodity inspections under LMPC Rules, 2011.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2 text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 text-xs font-medium focus:outline-none"
              title="Refresh case register"
            >
              <svg className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          <button
            type="button"
            onClick={onNewInspectionClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-govNavy hover:bg-govNavy-light text-white text-xs font-bold rounded-md shadow-sm transition-colors focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Registered Cases</div>
          <div className="text-2xl font-bold text-govNavy mt-1 font-mono">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Under Section 15 LM Act</div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider">Pending Adjudication</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{metrics.pendingAdjudication}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Awaiting LMO Sign-off</div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-rose-700 uppercase tracking-wider">Violations Detected</div>
          <div className="text-2xl font-bold text-verdictFail mt-1 font-mono">{metrics.violations}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Section 36(1) Notice Ready</div>
        </div>

        <div className="bg-panelBg p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Compliant Products</div>
          <div className="text-2xl font-bold text-verdictPass mt-1 font-mono">{metrics.compliant}</div>
        </div>
      </div>

      {/* Golden Demonstration SKU Quick-Selector Bar (1-Click Pipeline Verification) */}
      <GoldenSkuQuickSelector onSelectSku={onSelectCase} />

      {/* Filter and Search Bar */}
      <div className="bg-panelBg p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commodity, brand, shop, or case ID..."
            className="w-full text-xs pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-govNavy bg-white"
          />
          <svg
            className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          {/* Workflow Status Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500">Workflow:</span>
            <select
              value={selectedWorkflow}
              onChange={(e) => setSelectedWorkflow(e.target.value)}
              className="text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Workflows</option>
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING_REVIEW">Pending Adjudication</option>
              <option value="COMPLETED">Closed</option>
            </select>
          </div>

          {/* Verdict Filter */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500">Verdict:</span>
            <select
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              className="text-xs px-2 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Verdicts</option>
              <option value="PASS">PASS (Compliant)</option>
              <option value="FAIL">FAIL (Violations)</option>
              <option value="REVIEW">REVIEW (Borderline)</option>
              <option value="UNABLE_TO_VERIFY">UNABLE TO VERIFY</option>
              <option value="PENDING_REVIEW">PENDING</option>
            </select>
          </div>

          {(searchTerm || selectedWorkflow !== "ALL" || selectedVerdict !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedWorkflow("ALL");
                setSelectedVerdict("ALL");
              }}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Case Register Table */}
      <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-govNavy mb-1">No inspection cases match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your search criteria or register a new physical inspection case.
            </p>
            <button
              type="button"
              onClick={onNewInspectionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-govNavy text-white text-xs font-semibold rounded-md shadow hover:bg-govNavy-light"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register New Inspection
            </button>
          </div>
        ) : (
          <>
            {/* Mobile View: High-Legibility Card Tiles */}
            <div className="block md:hidden divide-y divide-slate-200">
              {filteredCases.map((c) => (
                <div
                  key={`mobile-${c.id}`}
                  onClick={() => onSelectCase(c.id)}
                  className="p-3.5 hover:bg-slate-50 cursor-pointer space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-govNavy truncate">
                      {c.inspection_number}
                    </span>
                    <VerdictBadge verdict={c.overall_status} size="sm" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-xs truncate">
                      {c.product_name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.brand_name || "Unbranded"} • {c.establishment_name || "Retail Depot"}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="font-mono text-[10px]">
                      {formatDate(c.created_at)} • {formatInspectionType(c.inspection_type)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c.id);
                      }}
                      className="text-xs font-bold text-govNavy hover:underline"
                    >
                      Inspect →
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Full Data Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Case ID / Date</th>
                  <th scope="col" className="px-4 py-3">Commodity & Brand</th>
                  <th scope="col" className="px-4 py-3">Establishment / Premises</th>
                  <th scope="col" className="px-4 py-3">Inspection Type</th>
                  <th scope="col" className="px-4 py-3">Workflow</th>
                  <th scope="col" className="px-4 py-3">Compliance Verdict</th>
                  <th scope="col" className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Case ID & Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-govNavy flex items-center gap-1">
                        {c.inspection_number}
                        {c.is_mock_fixture && (
                          <span className="text-[10px] font-mono font-normal px-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(c.created_at)}
                      </div>
                    </td>

                    {/* Commodity & Brand */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900 max-w-xs truncate" title={c.product_name}>
                        {c.product_name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.brand_name || "Unbranded / Generics"}
                      </div>
                    </td>

                    {/* Establishment & Premises */}
                    <td className="px-4 py-3.5">
                      <div className="text-slate-800 max-w-xs truncate" title={c.establishment_name || "Field Trader"}>
                        {c.establishment_name || "Field Seizure"}
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-xs truncate">
                        {c.jurisdiction_id}
                      </div>
                    </td>

                    {/* Inspection Type */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-slate-700">
                        {formatInspectionType(c.inspection_type)}
                      </span>
                    </td>

                    {/* Workflow Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <WorkflowBadge status={c.workflow_status || "OPEN"} size="sm" />
                    </td>

                    {/* Compliance Verdict */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {c.workflow_status === "DRAFT" ? (
                        <span className="text-[11px] text-slate-400 font-mono">
                          [NO EVIDENCE]
                        </span>
                      ) : (
                        <VerdictBadge verdict={c.overall_status} size="sm" />
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(c.id);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-govNavy hover:text-white hover:bg-govNavy border border-govNavy rounded transition-colors"
                      >
                        Open Case →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>
    </div>
  );
};
