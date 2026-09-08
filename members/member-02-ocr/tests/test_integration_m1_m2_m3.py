"""Integration Verification across Member 1 (CV) -> Member 2 (OCR) -> Member 3 (Extraction)

Validates:
1. Member 1: Optical Quality Gate clearance on packaging label
2. Member 2: Multilingual OCR pipeline produces valid OCROutput contract
3. Member 3: Downstream statutory declaration parsers consume OCR tokens and extract legal fields
"""

import json
from pathlib import Path
import sys
import numpy as np
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
M1_SRC = REPO_ROOT / "members" / "member-01-cv-metrology" / "src"
M2_SRC = REPO_ROOT / "members" / "member-02-ocr" / "src"
M3_SRC = REPO_ROOT / "members" / "member-03-extraction" / "src"

for p in [REPO_ROOT, M1_SRC, M2_SRC, M3_SRC]:
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

from quality_gate import QualityGateEvaluator
from engine import MultilingualOCREngine
from contracts.ocr.ocr_dto import OCROutput
from detector import DBNetTextDetector, TextDetectionResult
from recognizer import PPOCRv4Recognizer
from parsers import StatutoryDeclarationParser

FIXTURES_DIR = REPO_ROOT / "members" / "member-02-ocr" / "fixtures"


def test_m1_m2_m3_pipeline_handoff():
    # 1. Member 1: Quality Gate Verification
    # Assume a clear rectified packaging frame
    blur_variance = 320.0  # > 150 threshold
    glare_pct = 1.2        # < 3.0% threshold
    is_valid, reason = QualityGateEvaluator.evaluate_metrics(blur_variance, glare_pct)
    assert is_valid is True
    assert reason is None

    # 2. Member 2: OCR Execution on Rectified Frame
    # Use deterministic mock perception returning statutory English declarations
    class MockDetector(DBNetTextDetector):
        def detect(self, img):
            return [
                TextDetectionResult([[10, 10], [200, 10], [200, 40], [10, 40]], 0.98),
                TextDetectionResult([[10, 50], [300, 50], [300, 80], [10, 80]], 0.97),
                TextDetectionResult([[10, 90], [450, 90], [450, 120], [10, 120]], 0.96),
            ]

    class MockRecognizer(PPOCRv4Recognizer):
        def recognize(self, crop):
            y_pos = crop.shape[0]
            # Map detected regions to statutory declarations
            return "Net Wt: 200 gms", 0.98, "en"

    # Multi-token mock recognizer
    class SequentialRecognizer(PPOCRv4Recognizer):
        def __init__(self):
            super().__init__()
            self.calls = 0
            self.lines = [
                ("Net Wt: 200 gms", 0.98, "en"),
                ("MRP Rs. 80.00 (incl. of all taxes)", 0.99, "en"),
                ("Consumer Care: care@sunfeast.com Tel: 1800-123-4567", 0.96, "en"),
            ]

        def recognize(self, crop):
            res = self.lines[self.calls % len(self.lines)]
            self.calls += 1
            return res

    ocr_engine = MultilingualOCREngine(
        detector=MockDetector(),
        recognizer=SequentialRecognizer()
    )

    rectified_frame = np.ones((150, 500, 3), dtype=np.uint8) * 255
    ocr_output = ocr_engine.process_image(rectified_frame, image_id="img_integration_01")

    assert isinstance(ocr_output, OCROutput)
    assert ocr_output.total_tokens == 3
    assert ocr_output.mean_confidence > 0.95
    assert len(ocr_output.tokens) == 3

    # 3. Member 3: Downstream Semantic Extraction Consumption
    # Token 1: Net Quantity
    net_qty_res = StatutoryDeclarationParser.parse_net_quantity(ocr_output.tokens[0].text)
    assert net_qty_res is not None
    assert net_qty_res["magnitude"] == 200.0
    assert net_qty_res["unit"] == "gms"
    assert net_qty_res["has_banned_unit"] is True
    assert net_qty_res["banned_unit_found"] == "gms"

    # Token 2: MRP
    mrp_res = StatutoryDeclarationParser.parse_mrp(ocr_output.tokens[1].text)
    assert mrp_res is not None
    assert mrp_res["amount"] == 80.00
    assert mrp_res["currency"] == "INR"
    assert mrp_res["tax_inclusive"] is True

    # Token 3: Consumer Care
    care_res = StatutoryDeclarationParser.check_consumer_care_completeness(ocr_output.full_text)
    assert care_res["has_email"] is True
    assert care_res["has_phone"] is True


def test_m1_m2_hindi_indic_handoff():
    # Test dual-language Hindi pipeline handoff with Indic numerals
    with open(FIXTURES_DIR / "fixture_ocr_hindi_label.json", "r", encoding="utf-8") as f:
        hindi_data = json.load(f)

    ocr_output = OCROutput.model_validate(hindi_data)
    assert ocr_output.total_tokens == 2

    # Verify Member 3 parses Indic numerals through conversion
    converted_full = StatutoryDeclarationParser.convert_indic_digits(ocr_output.full_text)
    assert "200" in converted_full
    assert "50.00" in converted_full
