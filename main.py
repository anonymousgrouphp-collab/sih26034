"""NyayaDrishti-LM (SIH26034) - Production Monolith Application Server.
Orchestrates FastAPI REST API (Mode A & B), Central Pipeline, and React 18 Production Web App.
Governed by Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023).
"""

import os
from pathlib import Path
import sys

# 1. Register repository root and member src packages in sys.path
REPO_ROOT = Path(__file__).resolve().parent
for member_dir in (REPO_ROOT / "members").iterdir():
    src_dir = member_dir / "src"
    if src_dir.is_dir() and str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# 2. Import FastAPI application from Member 5 Evidence & Backend
from server import app

# 3. Mount Test UI HUD at /test-ui for lightweight diagnostics
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

TEST_UI_DIR = REPO_ROOT / "integration" / "test_ui"
if TEST_UI_DIR.is_dir():
    app.mount("/test-ui", StaticFiles(directory=str(TEST_UI_DIR), html=True), name="test_ui")

# 3b. Mount Decoupled Evidence Storage
STORAGE_DIR = REPO_ROOT / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/storage", StaticFiles(directory=str(STORAGE_DIR)), name="storage")

# 4. Mount React 18 Production Build (from ui-combined/dist)
DIST_DIR = REPO_ROOT / "ui-combined" / "dist"
if not DIST_DIR.is_dir():
    DIST_DIR = REPO_ROOT / "members" / "member-06-ui" / "dist"
if DIST_DIR.is_dir():
    # Mount assets folder
    assets_dir = DIST_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="spa_assets")

    # Catch-all route to serve index.html for client-side routing (SPA)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Allow API, docs, test-ui, and storage endpoints to pass through to FastAPI handlers
        if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "test-ui", "storage/")):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found.")
        file_path = DIST_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(DIST_DIR / "index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=False)
