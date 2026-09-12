"""Decoupled File Storage Manager & Upload Security Hardening (SIH26034)
Enforces ADL-19 (Storage Decoupling), 10_SECURITY_AND_AUDIT_SPECIFICATION.md, and TS-WEB-01.
Zero binary BLOBs in database tables; content-addressed storage keyed by SHA-256.
"""

from datetime import datetime, timezone
import hashlib
import os
from pathlib import Path
from typing import Optional, Tuple


class StorageSecurityError(Exception):
    """Base exception for storage security failures."""
    pass


class UnsupportedMediaTypeError(StorageSecurityError):
    """Raised when file magic bytes do not match permitted image or PDF specifications."""
    pass


class PayloadTooLargeError(StorageSecurityError):
    """Raised when uploaded file exceeds the statutory 15MB upload cap."""
    pass


class DecoupledStorageManager:
    """Manages secure filesystem storage decoupled from relational datastore."""

    MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB statutory limit (TS-WEB-01)

    ALLOWED_MIME_SIGNATURES = {
        "image/jpeg": (b"\xff\xd8\xff", ".jpg"),
        "image/png": (b"\x89PNG\r\n\x1a\n", ".png"),
        "application/pdf": (b"%PDF-", ".pdf"),
    }

    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = Path(base_dir).resolve()
        else:
            # Default to repo/storage
            repo_root = Path(__file__).resolve().parent.parent.parent.parent
            self.base_dir = (repo_root / "storage").resolve()

        self.uploads_dir = self.base_dir / "uploads"
        self.evidence_dir = self.base_dir / "evidence"

        # Ensure directories exist
        self.uploads_dir.mkdir(parents=True, exist_ok=True)
        self.evidence_dir.mkdir(parents=True, exist_ok=True)

    @classmethod
    def detect_and_validate_mime(cls, data: bytes) -> Tuple[str, str]:
        """Inspects file magic bytes using strict zero-trust validation.
        
        Returns: (mime_type, file_extension)
        Raises: UnsupportedMediaTypeError if file is invalid or prohibited.
        """
        if not data:
            raise UnsupportedMediaTypeError("Empty file payload rejected.")

        # Prohibited signatures (Executables, scripts, SVG vectors)
        if data.startswith(b"MZ"):
            raise UnsupportedMediaTypeError("Executable payload rejected: Windows PE binary.")
        if data.startswith(b"\x7fELF"):
            raise UnsupportedMediaTypeError("Executable payload rejected: Linux ELF binary.")
        if data.startswith(b"#!"):
            raise UnsupportedMediaTypeError("Script payload rejected: Shell script.")
        if data.startswith(b"<?xml") or b"<svg" in data[:512].lower() or b"<script" in data[:1024].lower():
            raise UnsupportedMediaTypeError("SVG / XML script payload rejected per 10_SECURITY_AND_AUDIT_SPECIFICATION.md.")

        # Allowed signatures
        if data.startswith(b"\xff\xd8\xff"):
            return "image/jpeg", ".jpg"
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            return "image/png", ".png"
        if data.startswith(b"%PDF-"):
            return "application/pdf", ".pdf"

        # WebP signature: RIFF....WEBP
        if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            return "image/webp", ".webp"

        raise UnsupportedMediaTypeError("File signature not recognized as permitted image (JPEG/PNG/WebP) or PDF.")

    def save_upload(
        self,
        raw_bytes: bytes,
        original_filename: Optional[str] = None
    ) -> Tuple[str, str, str]:
        """Validates, hashes, and stores an incoming upload stream.
        
        Returns: (relative_file_path, sha256_hash, detected_mime)
        """
        if len(raw_bytes) > self.MAX_FILE_SIZE_BYTES:
            raise PayloadTooLargeError(
                f"File size {len(raw_bytes)} bytes exceeds maximum permitted limit of {self.MAX_FILE_SIZE_BYTES} bytes (15 MB)."
            )

        mime_type, ext = self.detect_and_validate_mime(raw_bytes)
        file_hash = hashlib.sha256(raw_bytes).hexdigest()

        now = datetime.now(timezone.utc)
        date_dir = self.uploads_dir / now.strftime("%Y") / now.strftime("%m") / now.strftime("%d")
        date_dir.mkdir(parents=True, exist_ok=True)

        target_file = date_dir / f"{file_hash}{ext}"
        if not target_file.exists():
            with open(target_file, "wb") as f:
                f.write(raw_bytes)

        relative_path = str(target_file.relative_to(self.base_dir)).replace("\\", "/")
        return relative_path, file_hash, mime_type

    def save_evidence_document(
        self,
        doc_bytes: bytes,
        filename_prefix: str = "notice"
    ) -> Tuple[str, str]:
        """Stores a generated PDF evidence notice into the decoupled evidence directory."""
        if not doc_bytes.startswith(b"%PDF-"):
            raise UnsupportedMediaTypeError("Evidence document must be valid PDF bytes.")

        file_hash = hashlib.sha256(doc_bytes).hexdigest()
        now = datetime.now(timezone.utc)
        date_dir = self.evidence_dir / now.strftime("%Y") / now.strftime("%m") / now.strftime("%d")
        date_dir.mkdir(parents=True, exist_ok=True)

        safe_prefix = "".join(c for c in filename_prefix if c.isalnum() or c in ("-", "_"))
        target_file = date_dir / f"{safe_prefix}_{file_hash[:16]}.pdf"

        with open(target_file, "wb") as f:
            f.write(doc_bytes)

        relative_path = str(target_file.relative_to(self.base_dir)).replace("\\", "/")
        return relative_path, file_hash

    def resolve_absolute_path(self, relative_path: str) -> Path:
        """Resolves a stored relative path to its absolute filesystem location."""
        clean_rel = relative_path.lstrip("/").replace("\\", "/")
        resolved = (self.base_dir / clean_rel).resolve()
        # Path traversal guard
        if not str(resolved).startswith(str(self.base_dir)):
            raise StorageSecurityError("Illegal path traversal detected.")
        return resolved

    def get_file_path(self, relative_path: str) -> Path:
        """Alias for resolve_absolute_path."""
        return self.resolve_absolute_path(relative_path)
