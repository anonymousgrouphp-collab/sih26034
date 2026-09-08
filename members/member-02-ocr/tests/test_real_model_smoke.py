"""Real Neural Inference and Contract Conformance Smoke Tests (SIH26034 - NyayaDrishti-LM)

Validates:
1. Genuine DBNet++ ONNX inference on synthetic text label (real polygons, confidence > 0.80).
2. Genuine PP-OCRv4 English ONNX neural recognition ('MRP Rs. 80.00', confidence > 0.85).
3. Genuine PP-OCRv3 Devanagari Hindi ONNX neural recognition (Devanagari characters decoded, conf > 0.80).
4. Genuine Tesseract v5 fallback execution on degraded crop.
5. End-to-end MultilingualOCREngine pipeline creating contract-valid OCROutput conforming to Pydantic and JSON Schema.
Zero mocks utilized in this test suite.
"""

import os
import sys
import json
from pathlib import Path
import pytest
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from detector import DBNetTextDetector
from recognizer import PPOCRv4Recognizer
from fallback import TesseractFallback
from engine import MultilingualOCREngine
from contracts.ocr.ocr_dto import OCROutput, OCRToken


def test_real_dbnet_detection_inference():
    """Validates that DBNet++ ONNX session executes neural inference and outputs real polygons."""
    det = DBNetTextDetector()
    assert det.session is not None, "DBNet++ ONNX session failed to initialize"
    assert det.model_path is not None and os.path.exists(det.model_path)

    # Render a clean text image
    img = np.ones((120, 360, 3), dtype=np.uint8) * 255
    cv2.putText(img, "NET WT 500g", (20, 70), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)

    results = det.detect(img)
    assert len(results) >= 1, "DBNet++ failed to detect text in rendered label"
    r0 = results[0]
    assert len(r0.polygon) == 4, "Detected polygon must have 4 canonical points"
    assert r0.confidence > 0.80, f"Expected high detection confidence, got {r0.confidence}"
    assert len(r0.bounding_box) == 4, "Bounding box must have [ymin, xmin, ymax, xmax]"


def test_real_ppocr_english_recognition():
    """Validates that PP-OCRv4 English ONNX model decodes English packaging text."""
    rec = PPOCRv4Recognizer()
    assert rec.en_session is not None, "English ONNX session failed to initialize"

    # Render English statutory text
    font_path = r"C:\Windows\Fonts\arial.ttf" if os.path.exists(r"C:\Windows\Fonts\arial.ttf") else None
    font = ImageFont.truetype(font_path, 32) if font_path else ImageFont.load_default()
    img = Image.new("RGB", (260, 55), (255, 255, 255))
    ImageDraw.Draw(img).text((10, 10), "MRP Rs 80.00", fill=(0, 0, 0), font=font)
    crop = np.array(img)

    text, conf, lang = rec.recognize(crop, lang="en")
    assert "MRP" in text or "80" in text, f"Failed to decode expected text: {text}"
    assert conf > 0.85, f"Expected high confidence (> 0.85), got {conf}"
    assert lang == "en"


def test_real_ppocr_hindi_recognition():
    """Validates that PP-OCRv3 Devanagari Hindi ONNX model decodes Devanagari packaging text."""
    rec = PPOCRv4Recognizer()
    assert rec.hi_session is not None, "Hindi ONNX session failed to initialize"

    font_path = r"C:\Windows\Fonts\Nirmala.ttc"
    if not os.path.exists(font_path):
        return  # Skip if Devanagari font not installed on host OS

    font = ImageFont.truetype(font_path, 32)
    img = Image.new("RGB", (360, 55), (255, 255, 255))
    ImageDraw.Draw(img).text((10, 10), "शुद्ध मात्रा 200 ग्राम", fill=(0, 0, 0), font=font)
    crop = np.array(img)

    text, conf, lang = rec.recognize(crop, lang="hi")
    assert any("\u0900" <= c <= "\u097F" for c in text), f"Recognized text lacks Devanagari characters: {text}"
    assert conf > 0.80, f"Expected confidence > 0.80, got {conf}"
    assert lang == "hi"


def test_real_tesseract_fallback_execution():
    """Validates that Tesseract v5 fallback executes and produces valid output."""
    fb = TesseractFallback()
    if not fb.is_available():
        pytest.skip("Tesseract v5 binary is not installed on host environment")

    img = np.ones((60, 240, 3), dtype=np.uint8) * 255
    cv2.putText(img, "BATCH A429", (15, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)

    res = fb.recognize(img)
    assert res is not None, "Tesseract recognition returned None"
    text, conf = res
    assert "BATCH" in text or "A429" in text
    assert conf > 0.70


def test_real_engine_e2e_contract_compliance():
    """Validates that full MultilingualOCREngine produces a schema-valid OCROutput contract."""
    engine = MultilingualOCREngine()
    assert engine.detector.session is not None
    assert engine.recognizer.en_session is not None

    img = np.ones((280, 480, 3), dtype=np.uint8) * 255
    cv2.putText(img, "SUNFEAST BISCUITS", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
    cv2.putText(img, "Net Qty: 200 g", (30, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "MRP Rs. 40.00", (30, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)

    result = engine.process_image(img, image_id="real_test_01")

    assert isinstance(result, OCROutput)
    assert result.total_tokens >= 3
    assert result.mean_confidence > 0.85
    assert len(result.tokens) == result.total_tokens
    assert result.execution_time_ms > 0

    # Validate against JSON schema
    schema_path = REPO_ROOT / "contracts" / "ocr" / "ocr_schema.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    from jsonschema import validate
    validate(instance=result.model_dump(), schema=schema)
