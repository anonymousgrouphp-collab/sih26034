"""Comprehensive Unit Tests for Member 1 Optical Quality Gate (SIH26034)
Tests Laplacian blur variance, HSV specular glare, tilt thresholds, image loading, and contract DTO compliance.
"""

import json
from pathlib import Path
import sys
import cv2
import numpy as np
import pytest

# Ensure Member 1 local src is on path for isolated standalone testing
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

# Ensure root is on path for contract testing
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from quality_gate import QualityGateEvaluator, QualityGateOutput

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


# ============================================================================
# 1. LEGACY JSON FIXTURE REGRESSION TESTS
# ============================================================================

def test_clear_fixture_passes():
    with open(FIXTURES_DIR / "fixture_quality_gate_clear.json") as f:
        data = json.load(f)
    is_valid, reason = QualityGateEvaluator.evaluate_metrics(
        blur_variance=data["blur_variance"],
        glare_percentage=data["glare_percentage"],
        skew_angle_deg=data["skew_angle_deg"],
    )
    assert is_valid is True
    assert reason is None


def test_blurred_fixture_rejected():
    with open(FIXTURES_DIR / "fixture_quality_gate_blurred.json") as f:
        data = json.load(f)
    is_valid, reason = QualityGateEvaluator.evaluate_metrics(
        blur_variance=data["blur_variance"],
        glare_percentage=data["glare_percentage"],
        skew_angle_deg=data["skew_angle_deg"],
    )
    assert is_valid is False
    assert "IMAGE_BLURRED" in reason


def test_glare_fixture_rejected():
    with open(FIXTURES_DIR / "fixture_quality_gate_glare.json") as f:
        data = json.load(f)
    is_valid, reason = QualityGateEvaluator.evaluate_metrics(
        blur_variance=data["blur_variance"],
        glare_percentage=data["glare_percentage"],
        skew_angle_deg=data["skew_angle_deg"],
    )
    assert is_valid is False
    assert "SPECULAR_GLARE" in reason


def test_sharp_synthetic_image_variance():
    checkerboard = np.indices((100, 100)).sum(axis=0) % 2 * 255
    var = QualityGateEvaluator.compute_laplacian_variance(checkerboard.astype(np.uint8))
    assert var > 150.0


def test_flat_synthetic_image_variance():
    flat = np.full((100, 100), 128, dtype=np.uint8)
    var = QualityGateEvaluator.compute_laplacian_variance(flat)
    assert var == 0.0


# ============================================================================
# 2. IMAGE FILE EVALUATION TESTS
# ============================================================================

def test_clear_image_file_passes():
    img_path = FIXTURES_DIR / "fixture_quality_gate_clear.png"
    assert img_path.is_file(), "Clear image fixture must exist"

    result = QualityGateEvaluator.evaluate_image(img_path)
    assert result.passed is True
    assert result.is_valid is True
    assert result.blur_variance >= 150.0
    assert result.glare_percentage <= 3.0
    assert result.advice is None
    assert result.rejection_reason is None


def test_blurred_image_file_rejected():
    img_path = FIXTURES_DIR / "fixture_quality_gate_blurred.png"
    assert img_path.is_file(), "Blurred image fixture must exist"

    result = QualityGateEvaluator.evaluate_image(img_path)
    assert result.passed is False
    assert result.is_valid is False
    assert result.blur_variance < 150.0
    assert "IMAGE_BLURRED" in result.advice


def test_glared_image_file_rejected():
    img_path = FIXTURES_DIR / "fixture_quality_gate_glare.png"
    assert img_path.is_file(), "Glared image fixture must exist"

    result = QualityGateEvaluator.evaluate_image(img_path)
    assert result.passed is False
    assert result.is_valid is False
    assert result.glare_percentage > 3.0
    assert "SPECULAR_GLARE" in result.advice


def test_tilted_image_file_rejected():
    img_path = FIXTURES_DIR / "fixture_quality_gate_tilted.png"
    assert img_path.is_file(), "Tilted image fixture must exist"

    # Evaluated with external tilt measurement (simulating 22 deg)
    result = QualityGateEvaluator.evaluate_image(img_path, tilt_deg=22.0)
    assert result.passed is False
    assert result.is_valid is False
    assert result.skew_angle_deg == 22.0
    assert "EXCESSIVE_TILT" in result.advice


# ============================================================================
# 3. GLARE CALCULATION & COLOR SPACE TESTS
# ============================================================================

def test_compute_glare_percentage_synthetic():
    # Create 100x100 BGR image (10,000 pixels)
    # Background: dark grey (50, 50, 50)
    img = np.full((100, 100, 3), 50, dtype=np.uint8)

    # Insert exactly 500 white glare pixels (V=255, S=0) -> exactly 5.0%
    img[:5, :, :] = (255, 255, 255)

    glare_pct = QualityGateEvaluator.compute_glare_percentage(img, is_bgr=True)
    assert pytest.approx(glare_pct, abs=0.01) == 5.0


def test_rgb_vs_bgr_glare_conversion():
    # Pure red in RGB is (255, 0, 0), which is NOT glare (High saturation S=255)
    rgb_red = np.zeros((50, 50, 3), dtype=np.uint8)
    rgb_red[:, :] = [255, 0, 0]

    glare_rgb = QualityGateEvaluator.compute_glare_percentage(rgb_red, is_bgr=False)
    assert glare_rgb == 0.0

    # Pure white in RGB is (255, 255, 255), which IS glare (V=255, S=0)
    rgb_white = np.full((50, 50, 3), 255, dtype=np.uint8)
    glare_white = QualityGateEvaluator.compute_glare_percentage(rgb_white, is_bgr=False)
    assert pytest.approx(glare_white, abs=0.1) == 100.0


# ============================================================================
# 4. STATUTORY THRESHOLD BOUNDARY TESTS
# ============================================================================

def test_blur_threshold_boundary():
    # 149.99 fails
    valid_low, reason_low = QualityGateEvaluator.evaluate_metrics(149.99, 1.0, 0.0)
    assert valid_low is False
    assert "IMAGE_BLURRED" in reason_low

    # 150.00 passes
    valid_exact, reason_exact = QualityGateEvaluator.evaluate_metrics(150.00, 1.0, 0.0)
    assert valid_exact is True
    assert reason_exact is None


def test_glare_threshold_boundary():
    # 3.00% passes
    valid_exact, reason_exact = QualityGateEvaluator.evaluate_metrics(200.0, 3.00, 0.0)
    assert valid_exact is True
    assert reason_exact is None

    # 3.01% fails
    valid_high, reason_high = QualityGateEvaluator.evaluate_metrics(200.0, 3.01, 0.0)
    assert valid_high is False
    assert "SPECULAR_GLARE" in reason_high


def test_tilt_threshold_boundary():
    # 15.00 deg passes
    valid_exact, reason_exact = QualityGateEvaluator.evaluate_metrics(200.0, 1.0, 15.00)
    assert valid_exact is True
    assert reason_exact is None

    # 15.01 deg fails
    valid_high, reason_high = QualityGateEvaluator.evaluate_metrics(200.0, 1.0, 15.01)
    assert valid_high is False
    assert "EXCESSIVE_TILT" in reason_high


# ============================================================================
# 5. INPUT ROBUSTNESS & ERROR HANDLING
# ============================================================================

def test_invalid_file_path_raises():
    with pytest.raises(FileNotFoundError):
        QualityGateEvaluator.load_image("non_existent_image_path_12345.png")


def test_empty_array_raises():
    with pytest.raises(ValueError):
        QualityGateEvaluator.load_image(np.array([]))


def test_corrupt_bytes_raises():
    with pytest.raises(ValueError):
        QualityGateEvaluator.load_image(b"not a valid image format byte string")


def test_bytes_input_success():
    img_path = FIXTURES_DIR / "fixture_quality_gate_clear.png"
    with open(img_path, "rb") as f:
        img_bytes = f.read()

    result = QualityGateEvaluator.evaluate_image(img_bytes)
    assert result.passed is True


def test_grayscale_array_input():
    gray = np.full((100, 100), 200, dtype=np.uint8)
    cv2.rectangle(gray, (20, 20), (80, 80), 30, -1)

    result = QualityGateEvaluator.evaluate_image(gray)
    assert isinstance(result.blur_variance, float)
    assert result.glare_percentage == 0.0


# ============================================================================
# 6. CONTRACT DTO COMPATIBILITY & SERIALIZATION
# ============================================================================

def test_quality_gate_output_indexing_and_properties():
    out = QualityGateOutput(
        passed=True,
        blur_variance=250.45,
        glare_percentage=1.20,
        skew_angle_deg=4.50,
        advice=None,
    )
    # Object attribute access
    assert out.passed is True
    assert out.is_valid is True
    assert out.blur_variance == 250.45
    assert out.laplacian_blur == 250.45
    assert out.skew_angle_deg == 4.50
    assert out.tilt_angle_deg == 4.50
    assert out.advice is None
    assert out.rejection_reason is None

    # Dictionary-style access (backward compatibility)
    assert out["passed"] is True
    assert out["is_valid"] is True
    assert out["blur_variance"] == 250.45
    assert out["laplacian_blur"] == 250.45
    assert out["glare_percentage"] == 1.20
    assert out["skew_angle_deg"] == 4.50
    assert out["tilt_angle_deg"] == 4.50
    assert out["advice"] is None


def test_contract_dto_pydantic_export():
    out = QualityGateOutput(
        passed=True,
        blur_variance=342.18,
        glare_percentage=0.84,
        skew_angle_deg=1.45,
        advice=None,
    )

    # Convert to QualityGateResult
    qg_res = out.to_quality_gate_result()
    assert qg_res.passed is True
    assert qg_res.blur_variance == 342.18
    assert qg_res.glare_percentage == 0.84
    assert qg_res.skew_angle_deg == 1.45
    assert qg_res.advice is None

    # Convert to QualityCheckDTO
    qc_dto = out.to_quality_check_dto()
    assert qc_dto.is_valid is True
    assert qc_dto.laplacian_blur == 342.18
    assert qc_dto.glare_percentage == 0.84
    assert qc_dto.tilt_angle_deg == 1.45
    assert qc_dto.rejection_reason is None


# ============================================================================
# 7. HARDENED POST-AUDIT INPUT SECURITY & INVARIANT TESTS
# ============================================================================

def test_4k_resolution_normalization_preserves_input_matrix():
    """Verifies that 4K normalization creates an internal copy without modifying the raw input matrix."""
    h_4k, w_4k = 2160, 3840
    img_4k = np.full((h_4k, w_4k, 3), 200, dtype=np.uint8)
    cv2.putText(img_4k, "SHARP TEXT", (500, 1000), cv2.FONT_HERSHEY_SIMPLEX, 4.0, (20, 20, 20), 8)

    original_shape = img_4k.shape
    original_sum = int(np.sum(img_4k))

    result = QualityGateEvaluator.evaluate_image(img_4k)
    # The input matrix must NOT have been resized or mutated
    assert img_4k.shape == original_shape
    assert int(np.sum(img_4k)) == original_sum
    assert result.blur_variance > 0.0


def test_decompression_bomb_dimension_rejection():
    """Ensures that an image exceeding maximum dimension limits is rejected with ValueError."""
    huge_mock = np.zeros((9000, 100, 3), dtype=np.uint8)
    with pytest.raises(ValueError, match="exceed maximum safe dimension limit"):
        QualityGateEvaluator.load_image(huge_mock)


def test_rgba_4channel_input_handled_cleanly():
    """Ensures that 4-channel BGRA/RGBA images are converted cleanly without error."""
    rgba = np.full((200, 200, 4), 220, dtype=np.uint8)
    rgba[:, :, 3] = 255  # Alpha channel
    cv2.putText(rgba, "LABEL", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (30, 30, 30, 255), 2)

    loaded = QualityGateEvaluator.load_image(rgba)
    assert loaded.shape == (200, 200, 3)

    result = QualityGateEvaluator.evaluate_image(rgba)
    assert result.passed is True


def test_non_finite_nan_inf_rejection():
    """Ensures that float images containing NaN or Inf raise ValueError cleanly."""
    corrupt_array = np.full((100, 100, 3), np.nan, dtype=np.float32)
    with pytest.raises(ValueError, match="contains non-finite"):
        QualityGateEvaluator.load_image(corrupt_array)


def test_automatic_fiducial_tilt_detection_in_quality_gate():
    """Ensures that if tilt_deg is 0.0, evaluate_image automatically derives tilt from ArUco if present."""
    dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 300)
    canvas = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

    # Warp with ~18 deg perspective tilt (exceeds 15 deg threshold)
    h, w = canvas.shape[:2]
    offset = 24
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[offset, 0], [w - offset, offset], [w - offset, h - offset], [offset, h]])
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(canvas, M, (w, h), borderValue=255)

    # Calling with auto_detect_tilt=True should detect the fiducial tilt automatically
    result = QualityGateEvaluator.evaluate_image(warped, tilt_deg=0.0, auto_detect_tilt=True)
    assert result.skew_angle_deg > 5.0
