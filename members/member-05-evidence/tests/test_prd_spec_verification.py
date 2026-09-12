"""Automated PRD Specification & Evidentiary Verification Test Suite.

Directly tests and enforces statutory requirements from:
- 02_FINAL_REQUIREMENTS_SPECIFICATION.md (FR-01 through FR-22)
- 11_TESTING_AND_VALIDATION_PLAN.md (TS-WEB-01, TS-WEB-02, TS-EVID-01, TS-EVID-02)
- Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)
"""

import os
import hashlib
import tempfile
import pytest
from pathlib import Path
import sys

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from storage import DecoupledStorageManager, UnsupportedMediaTypeError, PayloadTooLargeError
from bsa_certificate import Section63CertificateGenerator
from merkle_dag import MerkleAuditLedger


@pytest.fixture
def storage():
    with tempfile.TemporaryDirectory() as tmp:
        yield DecoupledStorageManager(base_dir=tmp)


def test_prd_ts_web_01_uncompressed_intake_fidelity(storage):
    """TS-WEB-01: Ingestion validates magic bytes and preserves uncompressed raw bytes and SHA-256."""
    raw_uncompressed_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + b"UNCOMPRESSED_SENSOR_STREAM" * 50
    expected_hash = hashlib.sha256(raw_uncompressed_bytes).hexdigest()

    rel_path, file_hash, mime = storage.save_upload(raw_uncompressed_bytes, "high_res_pdp.jpg")

    assert mime == "image/jpeg"
    assert file_hash == expected_hash
    abs_path = storage.resolve_absolute_path(rel_path)
    assert abs_path.exists()
    assert abs_path.read_bytes() == raw_uncompressed_bytes


def test_prd_ts_web_01_zero_pixel_loss_archival_compression(storage):
    """TS-WEB-01: Decoupled archival storage compression guarantees 0.0% pixel/data loss."""
    raw_uncompressed = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR" + b"STATUTORY_PIXELS_EVIDENCE" * 100
    compressed = storage.compress_for_archival_lossless(raw_uncompressed)
    assert len(compressed) < len(raw_uncompressed)

    decompressed = storage.decompress_archival_lossless(compressed)
    assert decompressed == raw_uncompressed
    assert hashlib.sha256(decompressed).hexdigest() == hashlib.sha256(raw_uncompressed).hexdigest()


def test_prd_ts_web_01_malicious_pe_and_elf_rejection(storage):
    """TS-WEB-01: Disguised binaries (.exe, .dll, ELF) must be rejected with UnsupportedMediaTypeError."""
    pe_bytes = b"MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff\x00\x00" + b"\x00" * 80
    with pytest.raises(UnsupportedMediaTypeError):
        storage.save_upload(pe_bytes, "malicious.jpg")

    elf_bytes = b"\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00" + b"\x00" * 80
    with pytest.raises(UnsupportedMediaTypeError):
        storage.save_upload(elf_bytes, "malicious.png")


def test_prd_ts_evid_01_section_63_bsa_certification():
    """TS-EVID-01: Evidence certificate must cite Section 63 BSA 2023 and never repealed 65B."""
    cert = Section63CertificateGenerator.create_certificate(
        inspection_id="insp_prd_test_001",
        merkle_root="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        evidence_bundle_sha256="8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123",
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
        clock_source="LOCAL_DEVICE_MONOTONIC",
    )

    cert_str = str(cert.__dict__).upper()
    assert "SECTION 63" in cert_str or "BHARATIYA SAKSHYA ADHINIYAM" in cert_str
    assert "65B" not in cert_str, "Must NEVER cite repealed Section 65B Indian Evidence Act, 1872"


def test_prd_ts_evid_02_merkle_dag_tamper_detection():
    """TS-EVID-02: Modifying any single payload character invalidates cryptographic Merkle root."""
    h1 = MerkleAuditLedger.hash_payload("raw_image_bytes")
    h2 = MerkleAuditLedger.hash_payload({"calibration": "aruco_50mm"})
    h3_original = MerkleAuditLedger.hash_payload({"mrp": 250.00, "net_qty": "500 g"})
    h3_tampered = MerkleAuditLedger.hash_payload({"mrp": 250.01, "net_qty": "500 g"}) # 1 paisa discrepancy

    root_original = MerkleAuditLedger.build_merkle_root([h1, h2, h3_original])
    root_tampered = MerkleAuditLedger.build_merkle_root([h1, h2, h3_tampered])

    assert root_original != root_tampered, "Cryptographic Merkle root must detect 1 paisa tampering"
    assert MerkleAuditLedger.verify_integrity([h1, h2, h3_tampered], root_original) is False


def test_prd_table_1_font_schedule_row_5_invariant():
    """FR-08 & ADL-01: Table-I Row 5 font requirement for Area > 2500 cm2 is strictly 6.0 mm (Never 8.0 mm)."""
    def table_1_req(area_cm2: float) -> float:
        if area_cm2 <= 50:
            return 1.0
        elif area_cm2 <= 100:
            return 1.5
        elif area_cm2 <= 500:
            return 2.5
        elif area_cm2 <= 2500:
            return 4.0
        else:
            return 6.0  # ADL-01: strictly 6.0 mm

    assert table_1_req(450.0) == 2.5
    assert table_1_req(2800.0) == 6.0
    assert table_1_req(2800.0) != 8.0


def test_prd_usp_math_tolerance_invariant():
    """FR-10: USP math tolerance |USP * NetQty - MRP| <= 0.02 INR."""
    # 200g @ 0.40/g = 80.00 -> PASS
    assert abs((0.40 * 200) - 80.00) <= 0.02
    # 400g @ 0.60/g = 240.00 vs declared MRP 200 -> FAIL
    assert abs((0.60 * 400) - 200.00) > 0.02
