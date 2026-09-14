# Nirikshak Frontend — Legal Metrology Inspection Workstation

<p align="center">
  <a href="https://sih26034.vercel.app/"><img src="https://img.shields.io/badge/Live%20Site-sih26034.vercel.app-success.svg?style=flat-square&logo=vercel" alt="Live Workstation" /></a>&nbsp;
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat-square&logo=react&logoColor=white" alt="React 18" /></a>&nbsp;
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.0-646CFF.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite 5" /></a>&nbsp;
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>&nbsp;
  <img src="https://img.shields.io/badge/Tests-142%20Passed-brightgreen.svg?style=flat-square" alt="Tests: 142 Passed" />
</p>

## Overview

The Nirikshak Frontend is a statutory digital inspection workstation designed for Legal Metrology Officers (LMOs) and Controllers under the **Department of Consumer Affairs (DoCA)**. It delivers a fast, responsive, bilingual (English & Hindi) single-page application (SPA) running on the **Vercel Global Edge Network**.

- **Live Production URL:** [https://sih26034.vercel.app](https://sih26034.vercel.app)
- **Backend API Integration:** Proxied via Vercel Edge Rewrites directly to the **Oracle Cloud Always Free VPS** (`68.233.117.16:8000/api/v1`).

---

## Key Feature Modules

1. **Guided Intake HUD (`src/features/case/`):**
   - Live camera viewfinder with real-time blur, glare, and framing guides.
   - Multi-facet packaging photo ingestion (`PDP_FRONT`, `BACK_PANEL`, `SIDE_PANEL`).
   - Rule 6(10) E-Commerce marketplace listing scraper and digital audit.
2. **Inspection Vision Canvas (`src/components/nirikshak/InspectionVisionCanvas.tsx`):**
   - High-resolution zoomable packaging inspection canvas.
   - Non-destructive SVG bounding polygon overlays showing detected statutory declarations.
   - Multi-image facet switcher with instant photographic previews.
3. **Adjudication Canvas (`src/features/adjudication/`):**
   - Human-in-the-Loop decision review interface for statutory officers.
   - Mandatory written justification logging on any automated finding override.
   - Officer PIN authorization and digital sign-off.
4. **Physical Metrology Calibration:**
   - Visual planar homography overlays for ArUco 50mm markers and standard ISO-7810 credit/debit cards (85.60mm x 53.98mm).
   - Millimeter font height verification against Table-I schedules.
5. **Section 63 BSA Evidentiary Dossier:**
   - Cryptographic Merkle DAG audit trail inspection.
   - Form-1 Statutory Notice PDF viewer and legal memo export.

---

## Architecture & Edge Routing

```
[Browser Client]
       │
       ▼ HTTPS (Port 443)
[Vercel Global Edge CDN] (sih26034.vercel.app)
       │
       ├── /               ──> React 18 SPA (Vite Static Build from dist/)
       │
       └── /api/:path*     ──> Serverless Rewrite Proxy (Sub-300ms)
                                     │
                                     ▼ HTTP (Port 8000)
                       [Oracle Cloud Always Free VPS] (68.233.117.16:8000)
                                     │
                                     ├── FastAPI Application Monolith
                                     └── PostgreSQL 16 Dedicated Container
```

---

## Local Development

### Prerequisites
- Node.js 18.x or 20.x LTS
- npm 9+

### Quickstart

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server with HMR
npm run dev
```

*Open your browser at `http://localhost:5173`. Local Vite development server automatically proxies `/api` and `/storage` requests to `http://127.0.0.1:8000`.*

### Testing

```bash
# Run all 142 automated frontend tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Production Build

```bash
npm run build
```
*Compiles the production artifact into `frontend/dist` with minification, tree-shaking, and code splitting.*
