import os
import sys
from pathlib import Path
import pypdf

# Ensure Windows stdout handles UTF-8 / Indic characters safely
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Add backend to sys.path
REPO_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(REPO_ROOT))

from backend.evidence.notice_generator import Form1NoticePDFGenerator
from backend.evidence.bsa_certificate import Section63CertificateGenerator
from backend.contracts.evidence.evidence_dto import LegalNoticeRecipientDTO
from backend.ocr.engine import MultilingualOCREngine
from backend.ocr.detector import DBNetTextDetector

def test_form1_pdf_generation():
    print("--- 1. Testing Backend Form 1 PDF Generation ---")
    bsa_cert = Section63CertificateGenerator.create_certificate(
        inspection_id="INSP-20260917-REAL01",
        merkle_root="a4f3b89101adfa9280194bc0281efca891048bca120938a1ef908123bcdef012",
        evidence_bundle_sha256="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        issuing_officer_id="INSP-DL-0842",
        issuing_officer_name="Rajesh Sharma",
        device_model="Pixel 8 Pro (Gazetted Field Enclave)",
        operating_system="Android 14 / GrapheneOS Security Hardened",
        clock_source="GNSS_DISCIPLINED_PTP",
    )

    recipient = LegalNoticeRecipientDTO(
        recipient_type="MANUFACTURER",
        name="Titan Company Limited",
        registered_address="3, SIPCOT Industrial Complex, Hosur, Tamil Nadu 635126",
        email="helpdesk@titan.co.in"
    )

    violations = [
        {
            "rule_code": "Rule 6(1)(k)",
            "statutory_reference": "Rule 6(1)(k) of LMPC Rules, 2011",
            "required_value": "Unit Sale Price (USP) declared in close proximity to MRP",
            "measured_value": "USP Absent",
            "discrepancy": "No Unit Sale Price declared on Principal Display Panel",
            "legal_section": "Section 36(1) proviso of Legal Metrology Act, 2009"
        },
        {
            "rule_code": "Rule 7(1) read with Table-I",
            "statutory_reference": "Rule 7(1) read with Table-I of LMPC Rules, 2011",
            "required_value": "Minimum numeral height 3.0 mm for PDP > 50 cm²",
            "measured_value": "1.8 mm",
            "discrepancy": "Numeral height deficit of 1.2 mm (-40.0%)",
            "legal_section": "Section 36(1) proviso of Legal Metrology Act, 2009"
        }
    ]

    out_pdf_path = "tmp_test_form1.pdf"
    pdf_bytes, notice_dto = Form1NoticePDFGenerator.generate_form1_pdf(
        notice_ref="LMO/DL/SOUTH/2026/0842",
        inspection_id="INSP-20260917-REAL01",
        bsa_cert=bsa_cert,
        recipient=recipient,
        violations=violations,
        compounding_fee=5000.0,
        reply_window_days=15,
        output_path=out_pdf_path,
        commodity_name="Quartz Analog Wristwatch Model W-402",
        brand_name="Titan",
        batch_number="TC-2026-B9",
        declared_net_qty="1 Unit",
        declared_mrp="Rs. 2,425.00 (Inclusive of all taxes)",
        package_type="RECTANGULAR_RIGID_BOX",
        pdp_area_cm2=64.5,
        declared_usp="Rs. 2,425.00 per Unit",
        mfg_date="08/2026",
        country_of_origin="India",
        consumer_care="helpdesk@titan.co.in / 1800-266-0123"
    )

    print(f"Generated PDF: {out_pdf_path}, size: {len(pdf_bytes)} bytes, Notice Ref: {notice_dto.notice_reference_number}")
    assert os.path.exists(out_pdf_path), "PDF file must exist on disk"
    assert len(pdf_bytes) > 5000, "PDF size must be > 5KB"

    # Verify contents with pypdf
    reader = pypdf.PdfReader(out_pdf_path)
    num_pages = len(reader.pages)
    print(f"Total Pages: {num_pages}")
    assert num_pages >= 2, "Form 1 Notice + Section 63 BSA certificate must be at least 2 pages"

    full_text = ""
    for idx, page in enumerate(reader.pages):
        page_text = page.extract_text() or ""
        full_text += f"\n--- PAGE {idx+1} ---\n" + page_text

    print("=== FULL EXTRACTED PDF TEXT ===")
    print(full_text)
    print("===================================")

    # Statutory framing checks
    assert "Legal Metrology (Packaged Commodities) Rules, 2011" in full_text
    assert "Jan Vishwas" in full_text
    assert "Section 63" in full_text
    assert "Bharatiya Sakshya Adhiniyam, 2023" in full_text
    assert "Titan Company Limited" in full_text
    assert "Quartz Analog Wristwatch" in full_text
    assert "W-402" in full_text
    assert "Rs. 2,425.00" in full_text
    assert "helpdesk@titan.co.in" in full_text
    assert "Rule 6(1)(k)" in full_text
    assert "Rule 7(1)" in full_text
    assert "15 days" in full_text

    # Clean up test file
    try:
        os.remove(out_pdf_path)
    except Exception:
        pass

    print("SUCCESS: Backend Form-1 PDF verification passed completely!")

def test_ocr_accuracy_pipeline():
    print("\n--- 2. Testing OCR Pipeline on Real Packaging Sample ---")
    test_img_path = "Legal Metrology real product images/Legal Metrology real product images/Item 1 - Watch/back_01.jpg"
    if not os.path.exists(test_img_path):
        print(f"Skipping OCR test: {test_img_path} not found")
        return

    det = DBNetTextDetector(allow_classical_fallback=False)
    print(f"DBNet detector max_side_len: {det.max_side_len}")
    assert det.max_side_len == 1920, f"Expected detector max_side_len 1920, got {det.max_side_len}"

    engine = MultilingualOCREngine()
    result = engine.process_image(test_img_path, image_id="test_titan_01")
    print(f"Detected {result.total_tokens} tokens with mean confidence {result.mean_confidence:.3f}")
    assert result.total_tokens >= 20, f"Expected >= 20 tokens on fine-print watch back, got {result.total_tokens}"
    assert result.mean_confidence > 0.70, f"Expected mean confidence > 0.70, got {result.mean_confidence}"

    lower_text = result.full_text.lower()
    print("Recognized text snippet:")
    for line in result.full_text.splitlines()[:8]:
        print("  ", line)

    assert any(k in lower_text for k in ["titan", "mrp", "net", "qty", "india"]), "Key statutory tokens must be recognized"
    print("SUCCESS: OCR accuracy improvements verified on packaging image!")

if __name__ == "__main__":
    test_form1_pdf_generation()
    test_ocr_accuracy_pipeline()
