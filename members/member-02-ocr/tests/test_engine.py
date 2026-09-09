"""Unit & Integration Tests for MultilingualOCREngine (SIH26034)"""

import json
from pathlib import Path
import sys
import numpy as np
import cv2
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from engine import MultilingualOCREngine
from contracts.ocr.ocr_dto import OCROutput, OCRToken
from detector import DBNetTextDetector, TextDetectionResult
from recognizer import PPOCRv4Recognizer
from fallback import TesseractFallback

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"
CONTRACTS_DIR = REPO_ROOT / "contracts" / "ocr"


def test_engine_initialization():
    engine = MultilingualOCREngine()
    assert engine.detector is not None
    assert engine.recognizer is not None
    assert engine.fallback is not None
    assert engine.fallback_threshold == 0.65


def test_engine_empty_and_corrupted_inputs():
    engine = MultilingualOCREngine()

    # None input
    res_none = engine.process_image(None, image_id="img_none")
    assert res_none.total_tokens == 0
    assert res_none.tokens == []
    assert res_none.mean_confidence == 0.0
    assert res_none.full_text == ""
    assert res_none.image_id == "img_none"

    # Empty array
    empty_arr = np.array([], dtype=np.uint8)
    res_empty = engine.process_image(empty_arr, image_id="img_empty")
    assert res_empty.total_tokens == 0

    # Non-existent file path
    res_missing = engine.process_image("non_existent_file_123.jpg")
    assert res_missing.total_tokens == 0


def test_engine_e2e_with_mocked_perception():
    # Test orchestration flow with deterministic mock detector and recognizer
    class MockDetector(DBNetTextDetector):
        def detect(self, img):
            return [
                TextDetectionResult([[10, 10], [100, 10], [100, 30], [10, 30]], 0.95),
                TextDetectionResult([[10, 40], [120, 40], [120, 60], [10, 60]], 0.92),
            ]

    class MockRecognizer(PPOCRv4Recognizer):
        def recognize(self, crop):
            # Return English for first, Hindi for second
            if crop.shape[0] == 48:
                return "MRP Rs. 50.00", 0.96, "en"
            return "शुद्ध मात्रा: १०० ग्राम", 0.94, "hi"

    engine = MultilingualOCREngine(
        detector=MockDetector(),
        recognizer=MockRecognizer()
    )

    test_img = np.ones((100, 200, 3), dtype=np.uint8) * 255
    output = engine.process_image(test_img, image_id="img_test_e2e")

    assert isinstance(output, OCROutput)
    assert output.total_tokens == 2
    assert output.mean_confidence == 0.96
    assert len(output.tokens) == 2
    assert output.tokens[0].text == "MRP Rs. 50.00"
    assert output.tokens[0].language == "en"
    assert output.tokens[0].bounding_box == [10, 10, 30, 100]
    assert output.tokens[0].polygon == [[10, 10], [100, 10], [100, 30], [10, 30]]
    assert output.execution_time_ms >= 0


def test_engine_low_confidence_triggers_consensus():
    class MockLowConfRecognizer(PPOCRv4Recognizer):
        def recognize(self, crop):
            return "Net Wt: 20O gms", 0.55, "en"  # Low confidence < 0.65

    class MockTesseract(TesseractFallback):
        def is_available(self):
            return True

        def recognize(self, crop):
            return "Net Wt: 200 gms", 0.88

    class MockDetector(DBNetTextDetector):
        def detect(self, img):
            return [TextDetectionResult([[20, 20], [80, 20], [80, 40], [20, 40]], 0.90)]

    engine = MultilingualOCREngine(
        detector=MockDetector(),
        recognizer=MockLowConfRecognizer(),
        fallback=MockTesseract(),
        fallback_threshold=0.65
    )

    test_img = np.ones((100, 200, 3), dtype=np.uint8) * 255
    output = engine.process_image(test_img, image_id="img_fallback_test")

    assert output.total_tokens == 1
    # Consensus should have agreed or improved confidence
    assert output.tokens[0].confidence > 0.65


def test_engine_output_validates_json_schema():
    with open(CONTRACTS_DIR / "ocr_schema.json", "r", encoding="utf-8") as f:
        schema = json.load(f)

    # Validate against existing demo fixtures
    for fixture_name in ["fixture_ocr_english_label.json", "fixture_ocr_hindi_label.json"]:
        with open(FIXTURES_DIR / fixture_name, "r", encoding="utf-8") as f:
            data = json.load(f)

        output = OCROutput.model_validate(data)
        serialized = output.model_dump()

        # Check required schema fields
        for field in schema["required"]:
            assert field in serialized

        for token in serialized["tokens"]:
            for t_field in schema["properties"]["tokens"]["items"]["required"]:
                assert t_field in token
            assert len(token["polygon"]) == 4
            assert len(token["bounding_box"]) == 4
            assert 0.0 <= token["confidence"] <= 1.0
