import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApiService } from "../services/api";
import { InspectionSummary, InspectionCase } from "../types/inspection";
import { InspectionDesk } from "../features/desk/InspectionDesk";
import { NewInspectionModal } from "../features/new-inspection/NewInspectionModal";
import { useCircle } from "../context/CircleContext";

export const Inspections: React.FC = () => {
  const [cases, setCases] = useState<InspectionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeCircle } = useCircle();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.listInspections({ circleId: activeCircle });
      setCases(res.items);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCircle]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  const handleSelectCase = (caseId: string) => {
    navigate(`/inspections/${caseId}`);
  };

  const handleCaseCreated = (newCase: InspectionCase) => {
    setIsModalOpen(false);
    navigate(`/inspections/${newCase.id}`);
  };

  return (
    <div className="space-y-4">
      <InspectionDesk
        cases={cases}
        activeCircle={activeCircle}
        onSelectCase={handleSelectCase}
        onNewInspectionClick={() => navigate("/inspections/new")}
        isLoading={isLoading}
        onRefresh={loadCases}
      />

      <NewInspectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCircleId={activeCircle}
        onSuccess={handleCaseCreated}
      />
    </div>
  );
};

export default Inspections;
