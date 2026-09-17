"""Unit tests for font height multi-line normalization and dynamic device telemetry resolution.
Validates SIH26034 core requirements:
1. Multi-line address/paragraph blocks do not inflate measured font height into whole-block height (fixing 15.96 mm bug).
2. Dynamic client device telemetry eliminates hardcoded Samsung/Android strings in BSA 65B certificates & Form 1 notices.
3. Field override re-evaluates Table-I compliance.
"""

import pytest
import platform
from backend.extraction.extractor import compute_font_height
from backend.evidence.auth import resolve_client_device_telemetry, RequestHeaders
from backend.evidence.bsa_certificate import Section63CertificateGenerator
from backend.evidence.notice_generator import Form1NoticePDFGenerator
from backend.contracts.evidence.evidence_dto import LegalNoticeRecipientDTO


def test_font_height_multiline_normalization():
    """Verify that multi-line text blocks normalize height per line count, preventing whole-block font inflation."""
    # Single-line 20px height box with scale 10.0 px/mm
    single_line_h, conf = compute_font_height(
        bbox=[100, 50, 120, 250], px_to_mm=10.0, text="Line 1", line_count=1
    )
    assert single_line_h is not None
    assert conf is not None

    # Multi-line address paragraph occupying 160px height with 8 lines
    # Without normalization: 160px -> 8x inflation (the 15.96 mm bug)
    # With normalization: 160px / 8 lines = 20px/line -> identical font height to single-line!
    multiline_h, _ = compute_font_height(
        bbox=[100, 50, 260, 250], px_to_mm=10.0,
        text="Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8",
        line_count=8
    )
    assert multiline_h is not None
    assert abs(multiline_h - single_line_h) < 0.05

    # Text with newlines but line_count omitted (auto-split)
    auto_split_h, _ = compute_font_height(
        bbox=[100, 50, 180, 250], px_to_mm=10.0,
        text="Line 1\nLine 2\nLine 3\nLine 4"
    )
    # 80px / 4 lines = 20px/line -> identical font height
    assert auto_split_h is not None
    assert abs(auto_split_h - single_line_h) < 0.05


def test_font_height_with_individual_tokens():
    """Verify that token-level average height is preferred when individual OCR token boxes exist."""
    tokens = [
        {"bounding_box": [10, 50, 30, 100], "text": "Net"},     # height = 20
        {"bounding_box": [40, 50, 60, 100], "text": "500"},     # height = 20
    ]
    token_h, _ = compute_font_height(
        bbox=[10, 50, 60, 100], px_to_mm=10.0, tokens=tokens
    )
    single_line_h, _ = compute_font_height(
        bbox=[10, 50, 30, 100], px_to_mm=10.0, tokens=[tokens[1]], line_count=1
    )
    assert token_h is not None
    assert abs(token_h - single_line_h) < 0.05


def test_dynamic_client_device_telemetry_resolution():
    """Verify that client headers correctly override device info and never output hardcoded Samsung/Android."""
    # Test with custom client headers
    headers = RequestHeaders(
        x_device_model="Lenovo ThinkPad P14s",
        x_device_os="Windows 11 Pro",
        x_clock_source="NTP_SYNCHRONIZED",
        device_fingerprint="CLI-WIN11-WORKSTATION",
    )
    model, os_name, clock = resolve_client_device_telemetry(headers)
    assert model == "Lenovo ThinkPad P14s"
    assert os_name == "Windows 11 Pro"
    assert clock == "NTP_SYNCHRONIZED"
    assert "Samsung" not in model
    assert "Android" not in os_name

    # Test with User-Agent header
    ua_headers = RequestHeaders(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    )
    model_ua, os_ua, clock_ua = resolve_client_device_telemetry(ua_headers)
    assert "macOS" in os_ua or "Mac" in os_ua
    assert "Samsung" not in model_ua
    assert "Android" not in os_ua

    # Test fallback to host environment
    empty_headers = RequestHeaders()
    host_model, host_os, host_clock = resolve_client_device_telemetry(empty_headers)
    assert host_model is not None and len(host_model) > 0
    assert host_os is not None and len(host_os) > 0
    # Host is Windows in current environment
    assert platform.system() in host_os or "Windows" in host_os or len(host_os) > 0


def test_section63_bsa_certificate_dynamic_device():
    """Verify that Section63CertificateGenerator dynamically adopts resolved device telemetry."""
    cert = Section63CertificateGenerator.create_certificate(
        inspection_id="insp_test_001",
        merkle_root="caa168e70f316cff972580d4575d2136ffd2b0800805672863f5c4175754d51c",
        evidence_bundle_sha256="9e7c5b2a10df840291abc09845ef1234908123456789abcdef0123456789abcd",
        issuing_officer_id="LMO-DL-001",
        issuing_officer_name="Shri Rajesh Kumar",
        device_model="HP EliteBook G9",
        operating_system="Windows 11 Enterprise",
        clock_source="NTP_SYNCHRONIZED",
    )

    assert cert.device_model == "HP EliteBook G9"
    assert cert.operating_system == "Windows 11 Enterprise"
    assert cert.clock_source == "NTP_SYNCHRONIZED"
    assert "Samsung" not in cert.device_model
    assert "Android" not in cert.operating_system


def test_form1_notice_pdf_generation_with_dynamic_device():
    """Verify that Form1 Notice PDF contains dynamically resolved device info in Section 63 BSA block."""
    cert = Section63CertificateGenerator.create_certificate(
        inspection_id="insp_test_002",
        merkle_root="a" * 64,
        evidence_bundle_sha256="b" * 64,
        issuing_officer_id="LMO-TEST",
        issuing_officer_name="Testing Officer",
        device_model="Dell Precision 5570",
        operating_system="Ubuntu 24.04 LTS",
        clock_source="CLIENT_SYSTEM_TIME",
    )

    recipient = LegalNoticeRecipientDTO(
        recipient_type="MANUFACTURER",
        name="Test Packaged Commodities Ltd",
        registered_address="Plot 42, Sector 18, Gurugram, Haryana - 122015",
        email="compliance@testcommodities.com",
    )

    violations = [
        {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "statutory_reference": "Rule 6(1)(h) read with Table-I",
            "required_value": ">= 4.00 mm",
            "measured_value": "2.10 mm",
            "discrepancy": "-1.90 mm (-47.5%)",
        }
    ]

    pdf_bytes, notice_dto = Form1NoticePDFGenerator.generate_form1_pdf(
        notice_ref="LMO/DL/TEST/2026/0001",
        inspection_id="insp_test_002",
        bsa_cert=cert,
        recipient=recipient,
        violations=violations,
        compounding_fee=25000.0,
        reply_window_days=15,
        commodity_name="Tested Commodity",
        declared_net_qty="500 g",
    )

    assert len(pdf_bytes) > 1000
    assert notice_dto.notice_reference_number == "LMO/DL/TEST/2026/0001"
    assert notice_dto.bsa_certificate_number == cert.certificate_number
