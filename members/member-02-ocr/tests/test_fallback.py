"""Unit Tests for Tesseract Fallback and Deterministic Consensus Engine (SIH26034)"""

import pytest
from pathlib import Path
import sys

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from fallback import TesseractFallback, OCRConsensusEngine
from polygon_normalizer import PolygonNormalizer


def test_tesseract_availability_does_not_crash():
    fb = TesseractFallback()
    avail = fb.is_available()
    assert isinstance(avail, bool)


def test_levenshtein_similarity():
    assert OCRConsensusEngine.compute_levenshtein_similarity("MRP Rs. 50", "MRP Rs. 50") == 1.0
    assert OCRConsensusEngine.compute_levenshtein_similarity("", "test") == 0.0

    # Slight whitespace / punctuation difference
    sim = OCRConsensusEngine.compute_levenshtein_similarity("Net Wt. 200g", "Net Wt: 200 g")
    assert sim >= 0.80


def test_score_plausibility():
    clean_packaging = "MRP Rs. 35.00 (incl. of all taxes)"
    noisy_artifact = "##$$%^&*??~~~"

    score_clean = OCRConsensusEngine.score_plausibility(clean_packaging)
    score_noise = OCRConsensusEngine.score_plausibility(noisy_artifact)

    assert score_clean > 0.80
    assert score_noise < 0.20


def test_consensus_agreement_boosts_confidence():
    p_text = "Net Weight: 150 g"
    p_conf = 0.60
    f_text = "Net Weight 150 g"
    f_conf = 0.62

    resolved_text, resolved_conf, verdict = OCRConsensusEngine.resolve(
        p_text, p_conf, f_text, f_conf
    )

    assert verdict == "CONSENSUS_AGREED"
    assert resolved_conf > 0.70  # Boosted


def test_consensus_fallback_accepted_when_primary_noisy():
    p_text = "N%t W# 2@@ g"
    p_conf = 0.35
    f_text = "Net Wt. 200 g"
    f_conf = 0.85

    resolved_text, resolved_conf, verdict = OCRConsensusEngine.resolve(
        p_text, p_conf, f_text, f_conf
    )

    assert verdict == "FALLBACK_ACCEPTED"
    assert resolved_text == "Net Wt. 200 g"


def test_consensus_primary_accepted_when_fallback_unavailable():
    p_text = "Made in India"
    p_conf = 0.95

    resolved_text, resolved_conf, verdict = OCRConsensusEngine.resolve(
        p_text, p_conf, None, None
    )

    assert verdict == "PRIMARY_ACCEPTED"
    assert resolved_text == "Made in India"
    assert resolved_conf == 0.95


def test_consensus_primary_accepted_when_fallback_is_garbage():
    p_text = "Net Qty: 500 ml"
    p_conf = 0.62
    f_text = "!@#$%^&*"
    f_conf = 0.40

    resolved_text, resolved_conf, verdict = OCRConsensusEngine.resolve(
        p_text, p_conf, f_text, f_conf
    )

    assert verdict == "PRIMARY_ACCEPTED"
    assert resolved_text == "Net Qty: 500 ml"
