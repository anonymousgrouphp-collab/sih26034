# PAGE_ASSET_MAP.md — NyayaDrishti-LM Page-by-Page Visual Asset Mapping

**Product:** NyayaDrishti-LM (SIH26034)  
**Authority:** Department of Consumer Affairs (DoCA), Government of India  
**Date:** 11 September 2026  
**Status:** COMPLETE & AUDITED  

---

## 1. Overview

This document maps every primary route and major feature component across the NyayaDrishti-LM frontend (`ui-combined/`) to the specific visual assets embedded within it. Each mapping defines the route path, component name, asset file path, render trigger, layout position, and accessibility metadata.

---

## 2. Route & Component Asset Mapping Table

| Route Path | React Component | Asset Embedded | Trigger / State | Layout Placement | Accessibility Alt Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `Landing.tsx` | `public/assets/brand/nyayadrishti_logo_primary.svg` | Always | Sticky Portal Header | "NyayaDrishti-LM Official Brand Logo" |
| `/` | `Landing.tsx` | `IndiaGateHeroBackdrop.tsx` | Always | Hero Section Background | Sovereign architectural backdrop |
| `/` | `Landing.tsx` | `public/assets/goi_metrology_inspection_hero.jpg` | Always | Lab Inspection Showcase | "Legal Metrology Officer Conducting Verified Packaging Adjudication" |
| `/` | `StatutoryPipelineInfographic.tsx` | `public/assets/guidance/evidence_extraction_pipeline.svg` | Always | Architecture Showcase Panel | "NyayaDrishti-LM 5-Stage Statutory Evidence Extraction Pipeline Architecture" |
| `/login` | `Login.tsx` | `public/assets/photography/officer_field_inspection.jpg` | Always | Left Hero Authentication Card | "Indian Legal Metrology Officer conducting retail packaging inspection with tablet" |
| `/login` | `Login.tsx` | `StateEmblem.tsx` | Always | Authentication Masthead | "State Emblem of India - Satyameva Jayate" |
| `/dashboard` | `Dashboard.tsx` | `StateEmblem.tsx` | Always | Global Header Bar | "State Emblem of India" |
| `/inspections` | `InspectionDesk.tsx` | `public/assets/empty-states/empty_search.svg` | Filter with 0 results | Centered Case Table Container | "Zero commodity inspection cases matched filter" |
| `/inspections` | `InspectionDesk.tsx` | `public/assets/empty-states/empty_dossiers.svg` | Register has 0 cases | Main Dossier Feed Container | "No commodity inspection cases logged" |
| `/inspections/new` | `NewInspection.tsx` | `public/assets/guidance/camera_framing_guide.svg` | Always & in Framing Modal | Sidebar Guidance Card & Modal | "Statutory Field Camera Framing Protocol Guide" |
| `/inspections/:id` | `CalibrationCard.tsx` | `public/assets/guidance/calibration_scale_guide.svg` | Uncalibrated sensor state | Metric Calibration Tab Card | "ArUco 50mm Metric Calibration and Scale Ratio Diagram" |
| `/inspections/:id/report` | `InspectionReportView.tsx` | `public/assets/reports/bsa_merkle_seal.svg` | Always in Report & Print | Section 8 Statutory Evidence Box | "Section 63 BSA 2023 Tamper-Evident Digital Evidence Seal" |
| `/inspections/:id/report` | `InspectionReportView.tsx` | `GovStampSeal.tsx` | Always | Adjudication Sign-Off Footer | "Official Gazetted Officer Seal" |
| `/queue` | `ReviewQueue.tsx` | `public/assets/empty-states/empty_review_queue.svg` | Queue is empty (0 pending) | Centered Review Queue Container | "All pending borderline adjudications completed" |
| `/reports` | `Reports.tsx` | `public/assets/reports/bsa_merkle_seal.svg` | Always | Cryptographic Evidence Banner | "Section 63 BSA 2023 Tamper-Evident Digital Evidence Seal" |
| `/unauthorized` | `Unauthorized.tsx` | `public/assets/errors/error_403_restricted.svg` | 403 HTTP / RBAC clearance fail | Centered Card Header | "403 Statutory Clearance Boundary Illustration" |
| `*` (Catch-all) | `NotFound.tsx` | `public/assets/errors/error_404_dossier.svg` | 404 HTTP / Unknown route | Centered Error Body Container | "404 Case Dossier Not Found Illustration" |

---

## 3. Dynamic Modal & Overlay Asset Mapping

| Modal Component | Parent Route | Asset Path | Trigger Event | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `FramingGuidanceModal` | `/inspections/new` | `camera_framing_guide.svg` | Clicking "Framing Guide" in Step 1 | Full-screen interactive inspection tutorial explaining 90° planar angle, diffuse lighting, and ArUco placement. |
| `LiveCameraModal` | `/inspections/new` | Vector HUD Reticle & Corner Brackets | Clicking "Open Camera" | Live optical guidance with real-time blur and glare telemetry overlays. |
| `AdjudicationTraceabilityModal` | `/inspections/:id` | Bounding Box Crop Overlays | Clicking any statutory rule finding | Shows exact pixel coordinates and normalized millimeter heights against physical packaging. |

---

## 4. Verification Checkpoints

- **Zero Missing Assets:** All 15 referenced assets exist at their exact relative paths under `ui-combined/public/assets/`.
- **Zero Broken Links:** Verified via `tsc -b && vite build` and browser testing on port 5174.
- **Cross-Resolution Uniformity:** Verified responsive scaling from 390px (mobile) to 1440px (desktop) without any layout distortion.
