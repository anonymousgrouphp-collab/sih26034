"""Unit Tests & Latency Benchmark for ReportLab Form-1 Legal Notice Generator (SIH26034)
Verifies ADR-12 (ReportLab PDF/A) and latency benchmark (< 1.5 seconds).
"""

import json
from pathlib import Path
import sys
import time
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from bsa_certificate import Section63CertificateGenerator
from notice_generator import Form1NoticePDFGenerator
from contracts.evidence.evidence_dto import LegalNoticeRecipientDTO


FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_form1_pdf_generation_and_dto():
    inspection_id = "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094"
    merkle_root = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    bundle_hash = "8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123"

    bsa_cert = Section63CertificateGenerator.create_certificate(
        inspection_id=inspection_id,
        merkle_root=merkle_root,
        evidence_bundle_sha256=bundle_hash,
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
    )

    recipient = LegalNoticeRecipientDTO(
        recipient_type="MANUFACTURER",
        name="Sunfeast Foods India Private Limited",
        registered_address="Plot No. 14, Sector 58, Gurugram, Haryana 122011",
        email="legal@sunfeast.example.com",
    )

    violations = [
        {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "required_value": ">= 4.00 mm (PDP 112 cm2)",
            "measured_value": "2.12 mm",
            "discrepancy": "-1.88 mm (-47.0%)",
        },
        {
            "rule_code": "RULE_06_1_K_USP",
            "statutory_reference": "Rule 6(1)(k), G.S.R. 779(E)",
            "required_value": "Rs. 0.23 / g",
            "measured_value": "Rs. 0.35 / g",
            "discrepancy": "+Rs. 0.12 / g (+52.1%)",
        }
    ]

    pdf_bytes, notice_dto = Form1NoticePDFGenerator.generate_form1_pdf(
        notice_ref="LMO/DL/SOUTH/2026/0842",
        inspection_id=inspection_id,
        bsa_cert=bsa_cert,
        recipient=recipient,
        violations=violations,
        compounding_fee=25000.0,
        reply_window_days=15,
    )

    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF-")
    assert notice_dto.notice_reference_number == "LMO/DL/SOUTH/2026/0842"
    assert notice_dto.compounding_fee_amount == 25000.0
    assert notice_dto.reply_window_days == 15
    assert len(notice_dto.merkle_entry_hash) == 64
    assert "Section 63 BSA 2023" in notice_dto.statutory_mandate


def test_form1_pdf_latency_benchmark():
    """Validates ADR-12: ReportLab renders court-ready Form-1 notice in < 1.5 seconds."""
    inspection_id = "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094"
    merkle_root = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    bundle_hash = "8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123"

    bsa_cert = Section63CertificateGenerator.create_certificate(
        inspection_id=inspection_id,
        merkle_root=merkle_root,
        evidence_bundle_sha256=bundle_hash,
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
    )

    recipient = LegalNoticeRecipientDTO(
        recipient_type="MANUFACTURER",
        name="Sunfeast Foods India Private Limited",
        registered_address="Plot No. 14, Sector 58, Gurugram, Haryana 122011",
        email="legal@sunfeast.example.com",
    )

    violations = [
        {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "required_value": ">= 4.00 mm",
            "measured_value": "2.12 mm",
            "discrepancy": "-1.88 mm",
        }
    ]

    start = time.perf_counter()
    pdf_bytes, _ = Form1NoticePDFGenerator.generate_form1_pdf(
        notice_ref="LMO/DL/SOUTH/2026/0842",
        inspection_id=inspection_id,
        bsa_cert=bsa_cert,
        recipient=recipient,
        violations=violations,
    )
    elapsed = time.perf_counter() - start

    # SLA target: < 1.50 seconds
    assert elapsed < 1.50, f"PDF generation took {elapsed:.3f}s, exceeding 1.50s SLA threshold"
    assert len(pdf_bytes) > 0
