"""Unit Tests for Member 2 OCR Output and Polygon Normalization (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest

# Ensure local src and contracts are on path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from contracts.ocr.ocr_dto import OCROutput
from polygon_normalizer import PolygonNormalizer

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_english_ocr_fixture_validates():
    with open(FIXTURES_DIR / "fixture_ocr_english_label.json", encoding="utf-8") as f:
        data = json.load(f)
    output = OCROutput.model_validate(data)
    assert output.total_tokens == 4
    assert output.mean_confidence > 0.95
    assert len(output.tokens) == 4


def test_hindi_ocr_fixture_validates():
    with open(FIXTURES_DIR / "fixture_ocr_hindi_label.json", encoding="utf-8") as f:
        data = json.load(f)
    output = OCROutput.model_validate(data)
    assert output.total_tokens == 2
    assert "२००" in output.full_text


def test_polygon_to_axis_aligned_box():
    polygon = [[210, 820], [540, 820], [540, 880], [210, 880]]
    box = PolygonNormalizer.polygon_to_axis_aligned_box(polygon)
    assert box == [820, 210, 880, 540]


def test_low_confidence_fallback_trigger():
    with open(FIXTURES_DIR / "fixture_ocr_low_confidence.json") as f:
        data = json.load(f)
    token = data["tokens"][0]
    needs_fallback = PolygonNormalizer.requires_consensus_fallback(token["confidence"])
    assert needs_fallback is True
