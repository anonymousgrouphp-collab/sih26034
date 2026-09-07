"""Unit Tests for Member 1 Quality Gate (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest
import numpy as np

# Ensure Member 1 local src is on path for isolated standalone testing
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from quality_gate import QualityGateEvaluator

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


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
