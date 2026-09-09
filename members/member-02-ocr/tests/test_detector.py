"""Unit Tests for DBNet++ Text Detection Engine (SIH26034)"""

import pytest
import numpy as np
import cv2
from pathlib import Path
import sys

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from detector import DBNetTextDetector, TextDetectionResult
from polygon_normalizer import PolygonNormalizer


def test_text_detection_result_canonicalization():
    raw_poly = [[200, 100], [50, 100], [50, 50], [200, 50]]
    res = TextDetectionResult(raw_poly, 0.92)
    assert res.confidence == 0.92
    assert res.polygon[0] == [50, 50]  # Canonical Top-Left
    assert res.bounding_box == [50, 50, 100, 200]
    d = res.to_dict()
    assert "polygon" in d
    assert "confidence" in d
    assert "bounding_box" in d


def test_detector_preprocess_shape_and_normalization():
    detector = DBNetTextDetector(max_side_len=640)
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    tensor, orig_shape, scaled_shape = detector.preprocess(img)

    assert tensor.ndim == 4
    assert tensor.shape[0] == 1
    assert tensor.shape[1] == 3
    # Check multiples of 32
    assert scaled_shape[0] % 32 == 0
    assert scaled_shape[1] % 32 == 0
    assert orig_shape == (480, 640)


def test_detector_unclip():
    detector = DBNetTextDetector()
    box = np.array([[10, 10], [50, 10], [50, 30], [10, 30]], dtype=np.int32)
    unclipped = detector.unclip(box, unclip_ratio=1.5)
    assert unclipped is not None
    assert len(unclipped) >= 4
    # Area of unclipped should be larger than original box
    orig_area = 40 * 20
    unclipped_pts = unclipped.reshape(-1, 2)
    x, y = unclipped_pts[:, 0], unclipped_pts[:, 1]
    unclipped_area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
    assert unclipped_area > orig_area


def test_detector_box_score_fast():
    detector = DBNetTextDetector()
    bitmap = np.ones((100, 100), dtype=np.float32) * 0.9
    contour = np.array([[20, 20], [60, 20], [60, 40], [20, 40]])
    score = detector.box_score_fast(bitmap, contour)
    assert 0.85 <= score <= 0.95


def test_detector_postprocess_extracts_canonical_polygons():
    detector = DBNetTextDetector(conf_thresh=0.3, box_thresh=0.5)
    # Synthetic probability map with two text boxes
    prob_map = np.zeros((200, 300), dtype=np.float32)
    # Box 1
    prob_map[30:60, 50:180] = 0.95
    # Box 2
    prob_map[100:130, 50:240] = 0.90

    results = detector.postprocess(prob_map, orig_shape=(400, 600), scaled_shape=(200, 300))
    assert len(results) >= 2
    for res in results:
        assert len(res.polygon) == 4
        assert res.confidence >= 0.5
        # Verify coordinates are in original 400x600 space
        assert res.bounding_box[2] <= 400
        assert res.bounding_box[3] <= 600


def test_detector_empty_and_corrupted_inputs():
    detector = DBNetTextDetector()
    assert detector.detect(None) == []
    empty_img = np.array([], dtype=np.uint8)
    assert detector.detect(empty_img) == []


def test_detector_algorithmic_detect_on_rendered_label():
    detector = DBNetTextDetector()
    # Create white canvas with black text line rectangles
    img = np.ones((300, 500, 3), dtype=np.uint8) * 255
    cv2.putText(img, "NET WT. 200 g", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    cv2.putText(img, "MRP Rs. 50.00", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)

    detections = detector.detect(img)
    assert len(detections) >= 2
    for det in detections:
        assert len(det.polygon) == 4
        assert len(det.bounding_box) == 4
        # Validate polygon
        is_valid, _ = PolygonNormalizer.validate_polygon(det.polygon, 500, 300)
        assert is_valid is True


def test_detector_prohibits_silent_classical_fallback():
    """Ensures uninitialized detector raises RuntimeError rather than silently faking DBNet++."""
    # Force detector without model session and without fallback enabled
    det = DBNetTextDetector(model_path="nonexistent_model.onnx", allow_classical_fallback=False)
    det.session = None  # Ensure uninitialized
    img = np.ones((100, 200, 3), dtype=np.uint8) * 255

    with pytest.raises(RuntimeError, match="DBNet\\+\\+ neural weights not initialized"):
        det.detect(img)


def test_detector_explicit_classical_fallback_reports_backend():
    """Ensures when classical fallback is explicitly permitted, the backend is labeled accurately."""
    det = DBNetTextDetector(model_path="nonexistent_model.onnx", allow_classical_fallback=True)
    det.session = None
    assert det.backend == "OPENCV_ALGORITHMIC"
    img = np.ones((300, 500, 3), dtype=np.uint8) * 255
    cv2.putText(img, "NET WT 200 g", (50, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
    results = det.detect(img)
    assert len(results) >= 1
    assert results[0].backend == "OPENCV_ALGORITHMIC"


def test_detector_neural_inference_reports_dbnet_backend():
    """Ensures that true neural inference exposes backend as DBNet++_ONNX."""
    det = DBNetTextDetector()
    if det.session is not None:
        assert det.backend == "DBNet++_ONNX"
        img = np.ones((100, 300, 3), dtype=np.uint8) * 255
        cv2.putText(img, "MRP 50", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 0), 2)
        results = det.detect(img)
        if results:
            assert results[0].backend == "DBNet++_ONNX"
