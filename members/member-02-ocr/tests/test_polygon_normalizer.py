"""Unit Tests for Polygon Normalizer, Canonicalization, and Cropping"""

import pytest
import numpy as np
from pathlib import Path
import sys

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from polygon_normalizer import PolygonNormalizer


def test_canonicalize_polygon_already_ordered():
    poly = [[10, 10], [50, 10], [50, 30], [10, 30]]
    ordered = PolygonNormalizer.canonicalize_polygon(poly)
    assert ordered == [[10, 10], [50, 10], [50, 30], [10, 30]]


def test_canonicalize_polygon_scrambled_order():
    poly = [[50, 30], [10, 10], [10, 30], [50, 10]]
    ordered = PolygonNormalizer.canonicalize_polygon(poly)
    assert ordered == [[10, 10], [50, 10], [50, 30], [10, 30]]


def test_canonicalize_polygon_rotated_quadrilateral():
    poly = [[20, 10], [60, 20], [50, 50], [10, 40]]
    ordered = PolygonNormalizer.canonicalize_polygon(poly)
    assert len(ordered) == 4
    assert ordered[0] == [20, 10]
    pts = np.array(ordered)
    x, y = pts[:, 0], pts[:, 1]
    signed_area = 0.5 * (np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
    assert signed_area != 0


def test_normalize_and_denormalize_roundtrip():
    poly = [[100, 200], [400, 200], [400, 260], [100, 260]]
    w, h = 1000, 800
    norm = PolygonNormalizer.normalize_polygon(poly, w, h)
    assert norm[0] == [0.1, 0.25]
    assert norm[2] == [0.4, 0.325]

    roundtrip = PolygonNormalizer.denormalize_polygon(norm, w, h)
    assert roundtrip == poly


def test_validate_polygon_valid():
    poly = [[10, 20], [100, 20], [100, 60], [10, 60]]
    is_valid, reason = PolygonNormalizer.validate_polygon(poly, 800, 600)
    assert is_valid is True
    assert reason is None


def test_validate_polygon_degenerate_collinear():
    poly = [[10, 10], [20, 20], [30, 30], [40, 40]]
    is_valid, reason = PolygonNormalizer.validate_polygon(poly)
    assert is_valid is False
    assert "degenerate" in reason.lower()


def test_validate_polygon_invalid_length():
    is_valid, reason = PolygonNormalizer.validate_polygon([[10, 10], [20, 20]])
    assert is_valid is False


def test_extract_crop():
    img = np.ones((400, 600, 3), dtype=np.uint8) * 255
    img[100:160, 150:450] = 0

    poly = [[150, 100], [450, 100], [450, 160], [150, 160]]
    crop = PolygonNormalizer.extract_crop(img, poly, target_height=48)
    assert crop.shape[0] == 48
    assert crop.shape[1] > 48
    assert np.mean(crop) < 50
