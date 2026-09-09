"""Unit & Integration Tests for INT8 Quantized OCR Engine (SIH26034)

Verifies:
1. Manifest integrity: int8_manifest.json specifies all 3 models with matching SHA-256 and byte sizes.
2. Canonical Devanagari provenance remains PP-OCRv3 even in INT8 mode.
3. Execution mode propagation: MultilingualOCREngine correctly propagates FP32/INT8 modes.
4. Strict mode integrity: Missing INT8 models raise FileNotFoundError without silent fallback.
5. End-to-end smoke inference with INT8 execution mode producing contract-valid OCROutput.
"""

import os
import sys
import json
import hashlib
from pathlib import Path
import pytest
import numpy as np

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
INT8_DIR = MODELS_DIR / "int8"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from detector import DBNetTextDetector
from recognizer import PPOCRv4Recognizer
from engine import MultilingualOCREngine
from contracts.ocr.ocr_dto import OCROutput


def test_int8_manifest_integrity():
    """Asserts that int8_manifest.json accurately reflects the generated INT8 ONNX models."""
    manifest_path = INT8_DIR / "int8_manifest.json"
    assert manifest_path.exists(), f"Missing manifest: {manifest_path}"

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert manifest["method"] == "static_ptq_qdq"
    models_info = manifest["models"]

    for key, expected_name in [
        ("detector", "ch_PP-OCRv4_det_int8.onnx"),
        ("english_recognizer", "en_PP-OCRv4_rec_infer_int8.onnx"),
        ("devanagari_recognizer", "devanagari_PP-OCRv4_rec_int8.onnx"),
    ]:
        assert key in models_info
        model_entry = models_info[key]
        assert model_entry["canonical_name"] == expected_name

        model_file = INT8_DIR / expected_name
        assert model_file.exists(), f"INT8 model file missing: {model_file}"

        # Verify SHA-256
        with open(model_file, "rb") as f:
            actual_sha = hashlib.sha256(f.read()).hexdigest()
        assert actual_sha == model_entry["int8_sha256"], f"SHA256 mismatch for {expected_name}"
        assert model_file.stat().st_size == model_entry["int8_size_bytes"]

    # Assert Devanagari provenance in manifest
    hi_entry = models_info["devanagari_recognizer"]
    assert hi_entry.get("canonical_version") == "PP-OCRv3"
    assert "PP-OCRv3" in hi_entry.get("provenance_note", "")


def test_execution_mode_propagation():
    """Asserts that MultilingualOCREngine propagates execution_mode correctly."""
    # FP32 Mode
    engine_fp32 = MultilingualOCREngine(execution_mode="FP32")
    assert engine_fp32.execution_mode == "FP32"
    assert engine_fp32.detector.execution_mode == "FP32"
    assert engine_fp32.detector.backend == "DBNet++_ONNX"
    assert engine_fp32.recognizer.execution_mode == "FP32"
    assert engine_fp32.recognizer.backend == "PPOCR_ONNX_FP32"

    # INT8 Mode
    engine_int8 = MultilingualOCREngine(execution_mode="INT8")
    assert engine_int8.execution_mode == "INT8"
    assert engine_int8.detector.execution_mode == "INT8"
    assert engine_int8.detector.backend == "DBNet++_ONNX_INT8"
    assert engine_int8.recognizer.execution_mode == "INT8"
    assert engine_int8.recognizer.backend == "PPOCR_ONNX_INT8"


def test_int8_provenance_preserved():
    """Asserts that Devanagari recognition model remains identified as PP-OCRv3 in INT8 mode."""
    rec_int8 = PPOCRv4Recognizer(execution_mode="INT8")
    assert rec_int8.hi_model_version == "PP-OCRv3"
    assert "PP-OCRv3" in rec_int8.hi_model_identity
    assert "PP-OCRv4" not in rec_int8.hi_model_identity
    assert rec_int8.execution_mode == "INT8"


def test_strict_no_silent_fallback_missing_int8():
    """Asserts that requesting nonexistent INT8 models raises FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        DBNetTextDetector(
            execution_mode="INT8",
            model_path="/nonexistent/path/det_int8.onnx",
            allow_classical_fallback=False
        )

    with pytest.raises(FileNotFoundError):
        PPOCRv4Recognizer(
            execution_mode="INT8",
            en_model_path="/nonexistent/path/en_int8.onnx"
        )

    with pytest.raises(FileNotFoundError):
        PPOCRv4Recognizer(
            execution_mode="INT8",
            hi_model_path="/nonexistent/path/hi_int8.onnx"
        )


def test_int8_end_to_end_smoke():
    """Asserts that INT8 engine runs end-to-end on synthetic image and produces valid OCROutput."""
    engine_int8 = MultilingualOCREngine(execution_mode="INT8")
    img = np.full((300, 600, 3), 245, dtype=np.uint8)

    # Use cv2.putText to draw high-contrast text
    import cv2
    cv2.putText(img, "MRP Rs. 250.00", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
    cv2.putText(img, "Net Qty: 500 g", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)

    output = engine_int8.process_image(img, image_id="test_int8_smoke")
    assert isinstance(output, OCROutput)
    assert output.image_id == "test_int8_smoke"
    assert output.execution_time_ms > 0
    assert output.total_tokens >= 1
    assert all(0.0 <= t.confidence <= 1.0 for t in output.tokens)
