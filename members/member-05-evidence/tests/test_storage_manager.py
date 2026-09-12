"""Unit tests for Decoupled File Storage Manager & Upload Hardening.
Tests enforce TS-WEB-01, ADL-19, and 10_SECURITY_AND_AUDIT_SPECIFICATION.md.
"""

import os
import tempfile
import pytest
from pathlib import Path
import sys

# Ensure src/ is importable
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

try:
    from storage import (
        DecoupledStorageManager,
        UnsupportedMediaTypeError,
        PayloadTooLargeError,
        StorageSecurityError,
    )
except ImportError:
    from .storage import (
        DecoupledStorageManager,
        UnsupportedMediaTypeError,
        PayloadTooLargeError,
        StorageSecurityError,
    )


@pytest.fixture
def storage_mgr():
    with tempfile.TemporaryDirectory() as tmpdir:
        yield DecoupledStorageManager(base_dir=tmpdir)


def test_valid_jpeg_storage(storage_mgr):
    # Minimal JPEG header + payload
    jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb" + b"X" * 100
    rel_path, file_hash, mime = storage_mgr.save_upload(jpeg_bytes, "photo.jpg")

    assert mime == "image/jpeg"
    assert rel_path.endswith(".jpg")
    abs_path = storage_mgr.resolve_absolute_path(rel_path)
    assert abs_path.exists()
    assert abs_path.read_bytes() == jpeg_bytes


def test_valid_png_storage(storage_mgr):
    # Minimal PNG magic bytes
    png_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"\x00" * 32
    rel_path, file_hash, mime = storage_mgr.save_upload(png_bytes, "scan.png")

    assert mime == "image/png"
    assert rel_path.endswith(".png")
    abs_path = storage_mgr.resolve_absolute_path(rel_path)
    assert abs_path.exists()
    assert abs_path.read_bytes() == png_bytes


def test_valid_webp_storage(storage_mgr):
    # Minimal WebP header: RIFF + 4 bytes size + WEBP
    webp_bytes = b"RIFF\x20\x00\x00\x00WEBPVP8 " + b"\x00" * 32
    rel_path, file_hash, mime = storage_mgr.save_upload(webp_bytes, "label.webp")

    assert mime == "image/webp"
    assert rel_path.endswith(".webp")
    abs_path = storage_mgr.resolve_absolute_path(rel_path)
    assert abs_path.exists()


def test_valid_pdf_storage(storage_mgr):
    pdf_bytes = b"%PDF-1.4\n%test pdf content\n%%EOF"
    rel_path, file_hash, mime = storage_mgr.save_upload(pdf_bytes, "doc.pdf")

    assert mime == "application/pdf"
    assert rel_path.endswith(".pdf")
    abs_path = storage_mgr.resolve_absolute_path(rel_path)
    assert abs_path.exists()


def test_ts_web_01_malicious_pe_disguised_as_jpg(storage_mgr):
    """TS-WEB-01: Windows PE binary (MZ header) disguised as .jpg must be rejected."""
    malicious_bytes = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00" + b"\x00" * 100
    with pytest.raises(UnsupportedMediaTypeError) as exc_info:
        storage_mgr.save_upload(malicious_bytes, "innocent_label.jpg")
    assert "Executable payload rejected: Windows PE binary" in str(exc_info.value)


def test_ts_web_01_malicious_elf_disguised_as_png(storage_mgr):
    """Linux ELF executable disguised as .png must be rejected."""
    elf_bytes = b"\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00" + b"\x00" * 100
    with pytest.raises(UnsupportedMediaTypeError) as exc_info:
        storage_mgr.save_upload(elf_bytes, "inspection_badge.png")
    assert "Executable payload rejected: Linux ELF binary" in str(exc_info.value)


def test_svg_script_injection_rejected(storage_mgr):
    """SVG / XML script payload must be strictly rejected."""
    svg_payload = b"<?xml version='1.0'?><svg xmlns='http://www.w3.org/2000/svg'><script>alert('xss')</script></svg>"
    with pytest.raises(UnsupportedMediaTypeError) as exc_info:
        storage_mgr.save_upload(svg_payload, "vector.svg")
    assert "SVG / XML script payload rejected" in str(exc_info.value)


def test_payload_too_large_rejection(storage_mgr):
    """Files exceeding 15MB statutory upload limit must raise PayloadTooLargeError."""
    oversized = b"\xff\xd8\xff" + b"\x00" * (15 * 1024 * 1024 + 10)
    with pytest.raises(PayloadTooLargeError) as exc_info:
        storage_mgr.save_upload(oversized, "huge.jpg")
    assert "exceeds maximum permitted limit" in str(exc_info.value)


def test_path_traversal_guard(storage_mgr):
    """Relative paths attempting to escape base_dir must raise StorageSecurityError."""
    with pytest.raises(StorageSecurityError) as exc_info:
        storage_mgr.resolve_absolute_path("../../windows/system32/cmd.exe")
    assert "Illegal path traversal detected" in str(exc_info.value)


def test_save_evidence_document(storage_mgr):
    pdf_bytes = b"%PDF-1.7\nCourt Form-1 statutory notice\n%%EOF"
    rel_path, file_hash = storage_mgr.save_evidence_document(pdf_bytes, filename_prefix="NOTICE-DL-2026-001")
    assert "NOTICE-DL-2026-001" in rel_path
    assert rel_path.endswith(".pdf")
    abs_path = storage_mgr.resolve_absolute_path(rel_path)
    assert abs_path.exists()
    assert abs_path.read_bytes() == pdf_bytes


def test_lossless_archival_storage_roundtrip(storage_mgr):
    """Verifies that archival storage compression produces zero pixel/data loss."""
    raw_payload = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + (b"UNCOMPRESSED_PIXEL_DATA_12345" * 100)
    compressed = storage_mgr.compress_for_archival_lossless(raw_payload)
    assert len(compressed) < len(raw_payload)

    decompressed = storage_mgr.decompress_archival_lossless(compressed)
    assert decompressed == raw_payload
    import hashlib
    assert hashlib.sha256(decompressed).hexdigest() == hashlib.sha256(raw_payload).hexdigest()

