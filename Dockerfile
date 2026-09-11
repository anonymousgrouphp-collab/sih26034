# =============================================================================
# NyayaDrishti-LM (SIH26034) - Multi-Stage Production Container
# Governed by Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)
# Permissive Licenses Only (Apache-2.0, MIT, BSD-3) - Zero AGPL-3.0
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build React 18 Frontend
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY ui-combined/package*.json ./
RUN npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit


COPY ui-combined/ ./
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Python Backend & Unified Monolith Runtime
# -----------------------------------------------------------------------------
FROM python:3.11-slim AS runner

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0

WORKDIR /app

# Install system dependencies for OpenCV, Tesseract OCR (Devanagari + English), and SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    tesseract-ocr-hin \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code, contracts, members, and integration
COPY contracts/ ./contracts/
COPY members/ ./members/
COPY integration/ ./integration/
COPY main.py .

# Copy built React frontend assets into destination served by main.py
COPY --from=frontend-builder /app/frontend/dist ./ui-combined/dist

# Ensure storage directories exist
RUN mkdir -p storage/evidence storage/uploads

EXPOSE 8000

# Healthcheck to verify system readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["python", "main.py"]
