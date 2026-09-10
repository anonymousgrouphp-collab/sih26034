import React, { useState, useRef, useMemo } from "react";
import { EvidenceAsset, OCRToken, ExtractedField, RuleFinding } from "../../types/inspection";
import {
  polygonToSvgPoints,
  getStatusStyle,
  findFindingsForToken,
} from "./AdjudicationTraceability";

interface EvidenceViewerProps {
  asset: EvidenceAsset;
  productName: string;
  selectedTokenId?: string;
  selectedFinding?: RuleFinding;
  selectedField?: ExtractedField;
  findings: RuleFinding[];
  extractedFields: ExtractedField[];
  onSelectToken: (tokenId: string) => void;
  onRetakeRequested?: () => void;
}

export const EvidenceViewer: React.FC<EvidenceViewerProps> = ({
  asset,
  productName,
  selectedTokenId,
  selectedFinding,
  selectedField,
  findings,
  extractedFields,
  onSelectToken,
  onRetakeRequested,
}) => {
  // Zoom state: 0.5x to 3.0x
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"ORIGINAL" | "RECTIFIED">("ORIGINAL");
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loupePos, setLoupePos] = useState<{
    containerX: number;
    containerY: number;
    imgPixelX: number;
    imgPixelY: number;
    visible: boolean;
  }>({ containerX: 0, containerY: 0, imgPixelX: 0, imgPixelY: 0, visible: false });
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const tokens: OCRToken[] = asset.ocr?.tokens || [];
  // Dynamic natural dimensions mapped from loaded image, with fallback to asset metadata
  const imgWidth = naturalDimensions?.width || asset.image_width || 1920;
  const imgHeight = naturalDimensions?.height || asset.image_height || 1080;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    }
  };

  const hasRectifiedSupport = !!asset.calibration?.homography_matrix;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleZoomReset = () => setZoomLevel(1.0);
  const handleZoomFit = () => setZoomLevel(0.85);

  // Mouse move for Loupe
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isLoupeActive || !imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    if (relX >= 0 && relX <= rect.width && relY >= 0 && relY <= rect.height) {
      // Map to native image coordinates
      const pixelX = Math.round((relX / rect.width) * imgWidth);
      const pixelY = Math.round((relY / rect.height) * imgHeight);
      setLoupePos({
        containerX: e.clientX,
        containerY: e.clientY,
        imgPixelX: Math.max(0, Math.min(imgWidth, pixelX)),
        imgPixelY: Math.max(0, Math.min(imgHeight, pixelY)),
        visible: true,
      });
    } else {
      setLoupePos((p) => ({ ...p, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setLoupePos((p) => ({ ...p, visible: false }));
    setHoveredTokenId(null);
  };

  // Determine active highlighted token IDs (direct selection or via selected finding/field)
  const activeTokenIds = useMemo(() => {
    const ids = new Set<string>();
    if (selectedTokenId) {
      ids.add(selectedTokenId);
    }
    if (selectedField?.token_ids) {
      selectedField.token_ids.forEach((id) => ids.add(id));
    }
    return ids;
  }, [selectedTokenId, selectedField]);

  // Image source URL
  const imageSrc = asset.preview_url || asset.file_path || "";

  return (
    <div className="bg-panelBg rounded-lg border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap bg-slate-50/80">
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === "ORIGINAL" ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-govNavy text-white font-mono text-[10px] font-bold border border-amber-400/50 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ORIGINAL CAPTURE (UNTOUCHED)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-800 text-white font-mono text-[10px] font-bold border border-purple-400 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-300" />
              DERIVED RECTIFIED VIEW (HOMOGRAPHY M1)
            </span>
          )}

          {/* Perspective View Toggle */}
          <div className="inline-flex rounded border border-slate-300 bg-white p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("ORIGINAL")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === "ORIGINAL"
                  ? "bg-govNavy text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Original Capture
            </button>
            <button
              type="button"
              onClick={() => setViewMode("RECTIFIED")}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                viewMode === "RECTIFIED"
                  ? "bg-purple-800 text-white font-bold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
              title={
                hasRectifiedSupport
                  ? "Planar homography rectified perspective projection (M1 Metrology)"
                  : "Planar homography perspective projection (derived)"
              }
            >
              Rectified View
            </button>
          </div>

          <span className="text-xs font-mono text-slate-600 truncate max-w-xs font-semibold" title={asset.original_filename || asset.image_id}>
            {asset.original_filename || asset.image_id}
          </span>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            ({imgWidth} × {imgHeight} px)
          </span>
          {selectedFinding && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-300 hidden md:inline">
              Finding: #{selectedFinding.finding_id}
            </span>
          )}
        </div>

        {/* Viewport Controls */}
        <div className="flex items-center gap-1.5">
          {/* Loupe Toggle */}
          <button
            type="button"
            onClick={() => setIsLoupeActive(!isLoupeActive)}
            className={`px-2 py-1 text-xs font-semibold rounded border transition-colors flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-govNavy ${
              isLoupeActive
                ? "bg-amber-100 text-amber-900 border-amber-400"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
            title="Toggle pixel magnification loupe (visual inspection only)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
            <span className="hidden md:inline">Loupe</span>
          </button>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded border border-slate-300 bg-white overflow-hidden text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="px-2 py-1 hover:bg-slate-100 text-slate-700 disabled:opacity-40 font-bold border-r border-slate-200"
              title="Zoom out"
            >
              −
            </button>
            <span className="px-2 py-1 font-mono text-[11px] text-slate-700 font-semibold min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3.0}
              className="px-2 py-1 hover:bg-slate-100 text-slate-700 disabled:opacity-40 font-bold border-r border-slate-200"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomFit}
              className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-medium border-r border-slate-200 text-[11px]"
              title="Fit to viewport"
            >
              Fit
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-medium text-[11px]"
              title="Reset 100%"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Image & SVG Polygon Overlay Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 bg-slate-950 overflow-auto min-h-[420px] max-h-[580px] p-2 flex items-center justify-center select-none"
      >
        {imageSrc ? (
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out",
            }}
            className="relative max-w-full inline-block shadow-2xl rounded"
          >
            {/* Rectified View Banner if active */}
            {viewMode === "RECTIFIED" && (
              <div className="absolute top-2 left-2 z-20 bg-purple-950/90 text-purple-200 border border-purple-500/80 px-2 py-1 rounded text-[10px] font-mono shadow-md backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span>Planar Homography Rectification (M1 Derived View)</span>
              </div>
            )}

            {/* Base Packaging Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt={`Packaging inspection evidence for ${productName}`}
              onLoad={handleImageLoad}
              className={`block max-h-[520px] w-auto h-auto object-contain rounded transition-all ${
                viewMode === "RECTIFIED" ? "ring-2 ring-purple-500/50 filter brightness-105" : ""
              }`}
              draggable={false}
            />

            {/* SVG Polygon Overlay Layer */}
            <svg
              viewBox={`0 0 ${imgWidth} ${imgHeight}`}
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ overflow: "visible" }}
              aria-label="Multilingual OCR Polygons Overlay"
            >
              {tokens.map((tok) => {
                const isSelected = activeTokenIds.has(tok.token_id);
                const isHovered = hoveredTokenId === tok.token_id;
                const linkedFindings = findFindingsForToken(tok, extractedFields, findings);
                const primaryFinding = linkedFindings[0];
                const style = getStatusStyle(primaryFinding?.status);

                const points = polygonToSvgPoints(tok.polygon);
                if (!points) return null;

                return (
                  <g key={tok.token_id}>
                    {/* Pulsing Selection Halo */}
                    {isSelected && (
                      <polygon
                        points={points}
                        fill="none"
                        stroke={style.stroke}
                        strokeWidth="8"
                        strokeDasharray="8 4"
                        className="animate-pulse opacity-75"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}

                    {/* Main Interactive Polygon */}
                    <polygon
                      points={points}
                      fill={isSelected ? style.fill : isHovered ? "rgba(59, 130, 246, 0.25)" : "rgba(30, 41, 59, 0.15)"}
                      stroke={isSelected ? style.stroke : isHovered ? "#3B82F6" : style.stroke}
                      strokeWidth={isSelected ? "3" : isHovered ? "2.5" : "1.5"}
                      vectorEffect="non-scaling-stroke"
                      className="cursor-pointer transition-all duration-150 focus:outline-none"
                      tabIndex={0}
                      role="button"
                      aria-label={`OCR Token: ${tok.text} (${tok.token_id})`}
                      onClick={() => onSelectToken(tok.token_id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectToken(tok.token_id);
                        }
                      }}
                      onMouseEnter={() => setHoveredTokenId(tok.token_id)}
                      onMouseLeave={() => setHoveredTokenId(null)}
                    >
                      <title>{`${tok.text} [${tok.model_source || "PP-OCR"}] (Confidence: ${(tok.confidence * 100).toFixed(1)}%)`}</title>
                    </polygon>

                    {/* Vertex Markers on Selected Token */}
                    {isSelected &&
                      tok.polygon.map(([px, py], vIdx) => (
                        <circle
                          key={vIdx}
                          cx={px}
                          cy={py}
                          r="5"
                          fill={style.stroke}
                          stroke="#ffffff"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="text-center p-8 text-slate-400 text-xs font-mono">
            <div>Physical package image reference unavailable</div>
            <div className="text-slate-500 mt-1">{asset.image_id}</div>
          </div>
        )}

        {/* Floating Magnifying Loupe Overlay */}
        {isLoupeActive && loupePos.visible && (
          <div
            className="fixed pointer-events-none z-50 rounded-full border-2 border-amber-400 shadow-2xl bg-slate-900 overflow-hidden flex flex-col items-center justify-center"
            style={{
              width: "160px",
              height: "160px",
              left: `${loupePos.containerX - 80}px`,
              top: `${loupePos.containerY - 80}px`,
            }}
          >
            {/* Loupe Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-amber-400/50" />
              <div className="h-full w-px bg-amber-400/50 absolute" />
            </div>

            {/* Loupe Coordinate HUD */}
            <div className="absolute bottom-2 z-10 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 font-bold border border-amber-400/40">
              X:{loupePos.imgPixelX} Y:{loupePos.imgPixelY}
            </div>
          </div>
        )}
      </div>

      {/* 3. Evidence Provenance & Calibration Strip */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono text-slate-600">
        <div className="truncate">
          <span className="font-bold text-slate-700 block text-[10px] uppercase">Canonical SHA-256 (Backend Record)</span>
          <span className="text-govNavy font-semibold truncate block text-[11px]" title={asset.raw_sha256}>
            {asset.raw_sha256}
          </span>
        </div>

        <div>
          <span className="font-bold text-slate-700 block text-[10px] uppercase">Metric Calibration</span>
          {asset.calibration?.is_calibrated ? (
            <span className="text-emerald-700 font-semibold text-[11px] block">
              {asset.calibration.method} • {asset.calibration.px_to_mm.toFixed(2)} px/mm
              {asset.calibration.margin_of_error_pct ? ` (±${asset.calibration.margin_of_error_pct}%)` : ""}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px] block">Uncalibrated / Optical Estimate</span>
          )}
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2">
          {onRetakeRequested && (
            <button
              type="button"
              onClick={onRetakeRequested}
              className="text-[11px] font-sans font-semibold text-slate-700 hover:text-slate-900 underline focus:outline-none"
            >
              Request Recapture
            </button>
          )}
          <span className="text-[11px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-sans font-bold">
            Facet: {asset.panel_type}
          </span>
        </div>
      </div>
    </div>
  );
};
