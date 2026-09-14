# Nirikshak (SIH26034) — Cloud & Container Deployment Runbook

**Authoritative Hosting & Operations Guide for Team Lead, DevOps, and Hackathon Evaluators**  
**Governed by Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**  
**Version:** `1.0.0-rc1` (Post-Integration Baseline)

---

## 1. Executive Summary & Hosting Strategy

Nirikshak is an AI-powered legal metrology compliance verification web platform built for the **Department of Consumer Affairs (DoCA)**, Government of India.

Because all underlying Computer Vision, Multilingual OCR (DBNet++ / PP-OCRv4 / PP-OCRv3), and AST rule evaluation engines are optimized with **ONNX INT8 quantization for standard CPU execution (ADR-05)**, **expensive GPU infrastructure is NOT required**. A modest 2-vCPU / 4GB RAM environment effortlessly serves both live inference and tamper-evident Form-1 notice generation.

### Target Platforms Matrix

| Component | Recommended Cloud Host | Alternative Host | Local / Offline Host |
| :--- | :--- | :--- | :--- |
| **Frontend Workstation** (React 18 + Vite) | **Vercel** (Global Edge CDN) | Netlify / Cloudflare Pages | Nginx / FastAPI static mount |
| **Backend API & ML Pipeline** (FastAPI) | **Render** (Docker Web Service) | **Railway** / **Hugging Face Spaces** | `python backend/main.py` on `localhost:8000` |
| **Relational Datastore** (Mode A) | **Supabase PostgreSQL 16** | Render Managed PostgreSQL / Neon | `postgres:16-alpine` in Docker |
| **Evidence Object Storage** (Mode A) | **Supabase Cloud Storage** (`evidence-images`) | AWS S3 / Cloudflare R2 | Local File System (`uploads/`) |
| **Resilient Datastore** (Mode B) | Embedded SQLite 3.45+ | Embedded SQLite 3.45+ | Embedded `legal_metrology.db` |


---

## 2. When to Host (Timeline & Milestones)

1. **Pre-Demo Staging (Now):**
   - Deploy backend to Render/Railway and frontend to Vercel.
   - Verify live SSL endpoints (`https://...`), upload latency, and Form-1 PDF generation.
2. **Jury Evaluation & Hackathon Presentation:**
   - Keep Tier 1 (Cloud Web Application) active as primary.
   - Keep Tier 2 (Docker Compose / Local Mode B Standalone on `localhost:8000`) pre-warmed on the presenter's laptop to ensure 100% demo resilience during venue network disruptions (ADL-07 / `CONNECTIVITY_REQUIREMENTS.md`).

---

## 3. Hosting Method 1: Cloud Deployment (Vercel + Render / Railway)

### Step 1: Deploy Backend to Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** $\rightarrow$ **Blueprint**.
3. Connect your GitHub repository: `https://github.com/anonymousgrouphp-collab/sih26034`.
4. Select the `main` branch. Render will automatically detect [`render.yaml`](../render.yaml) and create:
   - A managed **PostgreSQL 16** database (`nirikshak-db`).
   - A containerized **FastAPI Web Service** (`nirikshak-backend`) built from the root [`Dockerfile`](../Dockerfile).
5. Click **Apply**.
6. Once deployed, note your live backend URL:
   `https://nirikshak-backend.onrender.com`

> **Note on Railway Alternative:** If using Railway, simply click **New Project** $\rightarrow$ **Deploy from GitHub Repo**, add a PostgreSQL database service, and set `DATABASE_URL=${{Postgres.DATABASE_URL}}`.

---

### Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import the GitHub repository: `anonymousgrouphp-collab/sih26034`.
4. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Leave as repository root (recommended; root [`vercel.json`](../vercel.json) handles building `frontend`), or select `frontend`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Set Environment Variables under **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://nirikshak-backend.onrender.com/api/v1`
   - `VITE_OPERATING_MODE`: `LIVE`
6. Click **Deploy**.
7. Vercel will build and assign an edge-cached domain:
   `https://nirikshak.vercel.app`

---

## 4. Hosting Method 2: 100% Free Docker Hosting on Hugging Face Spaces

Hugging Face Spaces provides a **free 2-vCPU / 16GB RAM CPU container** with free permanent HTTPS:

1. Create a new Space at [huggingface.co/spaces](https://huggingface.co/spaces).
2. Set Space Name: `nirikshak-api`.
3. Select SDK: **Docker** (Blank).
4. Set Space Hardware: **CPU Basic • 2 vCPU • 16GB RAM • Free**.
5. Push the repo to the Hugging Face Space Git remote (or configure GitHub Actions sync).
6. The root [`Dockerfile`](../Dockerfile) will build and launch the API and UI automatically on port 8000!

---

## 5. Hosting Method 3: Single Cloud VM / On-Premise (Docker Compose)

For deploying on AWS EC2, DigitalOcean, Azure, or private server hardware:

```bash
# 1. Clone repository
git clone https://github.com/anonymousgrouphp-collab/sih26034.git
cd sih26034

# 2. Launch production stack with zero configuration
docker compose up --build -d

# 3. Verify running containers
docker compose ps
```

The stack exposes:
- **Port 8000:** Unified FastAPI Backend + Built React 18 SPA + Swagger Docs (`/docs`).
- **Port 3000:** Decoupled Nginx Frontend Workstation.
- **Port 5432:** PostgreSQL 16 Datastore.

To tear down:
```bash
docker compose down
```

---

## 6. Hosting Method 4: Local Standalone Resilient Mode (Mode B)

For offline field inspections or laptop demonstrations with zero external dependencies:

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Build frontend assets (or use pre-built dist/)
cd frontend && npm run build && cd ..

# 3. Launch unified server (SQLite storage activates automatically)
python backend/main.py
```

Open browser at:
- React 18 Workstation: `http://localhost:8000/`
- Interactive Testing HUD: `http://localhost:8000/test-ui/`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

## 7. Configuration & Environment Variables Reference

| Variable | Default Value | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///legal_metrology.db` | PostgreSQL connection string (Mode A) or SQLite URI (Mode B). Auto-normalizes `postgres://` to `postgresql://`. |
| `NYAYADRISHTI_SECRET_KEY` | *(Internal Default Salt)* | Cryptographic key used to sign JWT auth tokens per Section 63 BSA 2023. |
| `SUPABASE_URL` | `None` | Supabase Cloud project URL (e.g. `https://ihqhfusgkullpbjfmjiy.supabase.co`). |
| `SUPABASE_SERVICE_ROLE_KEY` | `None` | Backend service-role secret key for uploading/deleting evidence in Supabase Storage bucket. |
| `SUPABASE_BUCKET_NAME` | `evidence-images` | Supabase Object Storage bucket name for persistent packaging evidence. |
| `PORT` | `8000` | Port for the Uvicorn web server. |
| `HOST` | `0.0.0.0` | Bind host address. |
| `VITE_API_BASE_URL` | `/api/v1` | Base URL used by the React client to contact the API (e.g. `https://api.example.com/api/v1`). |
| `VITE_OPERATING_MODE` | `MOCK` | Default UI operating mode (`LIVE`, `MOCK`, or `DEMO_FIXTURE`). Can be toggled at runtime in the UI. |
| `VITE_SUPABASE_URL` | `None` | Public Supabase URL configured in Vercel for frontend asset resolution. |
| `VITE_SUPABASE_ANON_KEY` | `None` | Public anonymous publishable key configured in Vercel. |


---

## 8. Seed Administrative Accounts

The platform automatically seeds official administrative credentials on first startup:

| Role | Username | Password | Circle / Jurisdiction |
| :--- | :--- | :--- | :--- |
| **Central Admin** | `admin_central` | `Officer@2026` | `CIRCLE_DL_SOUTH_01` |
| **Controller** (Notice Issuing Authority) | `controller_south` | `Officer@2026` | `CIRCLE_DL_SOUTH_01` |
| **Inspector** (Field LMO) | `inspector_rajesh` | `Officer@2026` | `CIRCLE_DL_SOUTH_01` |
| **Viewer** (Analyst / Auditor) | `viewer_analyst` | `Officer@2026` | `CIRCLE_DL_SOUTH_01` |

---

## 9. Pre-Flight Verification Checklist

Before presenting to evaluators or going live, execute these commands to verify operational readiness:

```bash
# 1. Health Probe
curl -f http://localhost:8000/api/v1/health
# Expected: {"status": "ONLINE", ...}

# 2. Statutory System Status
curl -f http://localhost:8000/api/v1/system/status
# Expected: Cites Section 63 Bharatiya Sakshya Adhiniyam, 2023

# 3. Officer Authentication
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"inspector_rajesh","password":"Officer@2026"}'
# Expected: Returns JWT bearer token with 8-hour expiry
```
