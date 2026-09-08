"""Unit Tests for Section 63 BSA 2023 Certificate & Evidence Bundle Generation (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from bsa_certificate import Section63CertificateGenerator
from merkle_dag import PipelineEvidenceDAG


FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_section_63_certificate_generation():
    inspection_id = "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094"
    merkle_root = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    bundle_hash = "8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123"

    cert = Section63CertificateGenerator.create_certificate(
        inspection_id=inspection_id,
        merkle_root=merkle_root,
        evidence_bundle_sha256=bundle_hash,
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
        clock_source="LOCAL_DEVICE_MONOTONIC",
    )

    assert cert.statutory_law_ref == "Section 63 of Bharatiya Sakshya Adhiniyam, 2023"
    assert cert.certificate_number.startswith("CERT-BSA2023-")
    assert cert.inspection_id == inspection_id
    assert cert.raw_images_merkle_root == merkle_root
    assert cert.evidence_bundle_sha256 == bundle_hash
    assert len(cert.officer_signature_token) == 64
    assert cert.clock_source == "LOCAL_DEVICE_MONOTONIC"


def test_compile_evidence_bundle_dto():
    with open(FIXTURES_DIR / "fixture_pipeline_output.json") as f:
        pipe_data = json.load(f)

    inspection_id = pipe_data["inspection_id"]
    raw_bytes = b"SIMULATED_PACKAGING_RAW_IMAGE_BYTES_FOR_DEMO_01"

    dag = PipelineEvidenceDAG.build_standard_7_node_dag(
        inspection_id=inspection_id,
        raw_image_bytes=raw_bytes,
        calibration_data=pipe_data["calibration"],
        rectified_frame_meta=pipe_data["principal_display_panel"],
        ocr_tokens=pipe_data["extracted_fields"],
        extracted_facts=pipe_data["extracted_fields"],
        rule_findings=pipe_data["rule_evaluations"],
        officer_signoff={"officer_id": "INSP-DL-0842", "verdict": pipe_data["ai_verdict"]},
    )

    bundle = Section63CertificateGenerator.compile_evidence_bundle(
        inspection_id=inspection_id,
        raw_image_bytes=raw_bytes,
        dag=dag,
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
    )

    assert bundle.inspection_id == inspection_id
    assert len(bundle.raw_image_sha256) == 64
    assert len(bundle.merkle_root) == 64
    assert len(bundle.merkle_nodes) == 7
    assert bundle.bsa_certificate.statutory_law_ref == "Section 63 of Bharatiya Sakshya Adhiniyam, 2023"
    assert bundle.bsa_certificate.raw_images_merkle_root == bundle.merkle_root
