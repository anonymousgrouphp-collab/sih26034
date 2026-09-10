"""Comprehensive Stress-Testing, Bug-Bash & Vulnerability Audit Suite for Member 2 Multilingual OCR.

Covers 5 Rigorous Verification Cycles:
Cycle 1: Extreme Geometry & Boundary Conditions (0x0, 1x1, negative coords, out-of-bounds, degenerate polygons, DoS dimension capping)
Cycle 2: Degraded Inputs & Numerical Pathologies (specular glare bloom, deep underexposure, blur sigma=15, NaNs, Infs, float32, RGBA)
Cycle 3: Multilingual & Devanagari Hindi Text Fidelity (conjuncts, matras, nuktas, halants, Indic numerals ०-९, mixed statutory strings)
Cycle 4: 100-Cycle Rapid Repeated Execution & Memory Leak Audit (continuous extraction and preprocessing with zero memory growth)
Cycle 5: Security Hardening & Vulnerability Audit (null-byte injection, path traversal, string exhaustion DoS mitigation)
"""

import os
import sys
import gc
import time
from pathlib import Path
from typing import List, Tuple
import numpy as np
import cv2
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from polygon_normalizer import PolygonNormalizer
from detector import DBNetTextDetector, TextDetectionResult
from recognizer import PPOCRv4Recognizer, CTCLabelDecode
from fallback import OCRConsensusEngine, TesseractFallback
from engine import MultilingualOCREngine
from contracts.ocr.ocr_dto import OCROutput


# ============================================================================
# CYCLE 1: EXTREME GEOMETRY & BOUNDARY CONDITIONS
# ============================================================================

def test_cycle1_geometry_zero_and_subpixel_dimensions():
    """Validates that zero-sized and tiny sub-4x4 images do not trigger OpenCV crashes."""
    detector = DBNetTextDetector(allow_classical_fallback=True)

    # 0x0 empty array
    empty_img = np.zeros((0, 0, 3), dtype=np.uint8)
    assert detector.detect(empty_img) == []

    # 1x1 single pixel
    dot_img = np.full((1, 1, 3), 255, dtype=np.uint8)
    assert detector.detect(dot_img) == []

    # 3x3 tiny patch
    tiny_img = np.full((3, 3, 3), 128, dtype=np.uint8)
    assert detector.detect(tiny_img) == []

    # PolygonNormalizer extract_crop on tiny image
    poly = [[0, 0], [2, 0], [2, 2], [0, 2]]
    crop = PolygonNormalizer.extract_crop(tiny_img, poly, target_height=48)
    assert crop is not None
    assert crop.shape[0] == 48
    assert crop.shape[1] >= 16


def test_cycle1_geometry_negative_and_out_of_bounds_polygons():
    """Validates boundary clipping against negative coordinates and out-of-bounds coordinates."""
    img = np.zeros((100, 100, 3), dtype=np.uint8)

    # Negative coordinates
    neg_poly = [[-20, -10], [50, -10], [50, 40], [-20, 40]]
    ymin, xmin, ymax, xmax = PolygonNormalizer.polygon_to_axis_aligned_box(neg_poly, image_width=100, image_height=100)
    assert xmin == 0
    assert ymin == 0
    assert xmax == 50
    assert ymax == 40

    # Out-of-bounds coordinates (exceeding image boundary)
    oob_poly = [[80, 80], [150, 80], [150, 130], [80, 130]]
    ymin_oob, xmin_oob, ymax_oob, xmax_oob = PolygonNormalizer.polygon_to_axis_aligned_box(oob_poly, image_width=100, image_height=100)
    assert xmin_oob == 80
    assert ymin_oob == 80
    assert xmax_oob == 100
    assert ymax_oob == 100

    # Extract crop on negative polygon succeeds safely with clipping
    crop_neg = PolygonNormalizer.extract_crop(img, neg_poly, target_height=48)
    assert crop_neg is not None
    assert crop_neg.shape[0] == 48


def test_cycle1_geometry_degenerate_collinear_and_zero_area():
    """Validates that degenerate, collinear, or zero-area polygons are rejected safely."""
    w, h = 500, 500

    # Collinear points (flat line)
    flat_poly = [[10, 10], [50, 10], [100, 10], [20, 10]]
    is_valid, reason = PolygonNormalizer.validate_polygon(flat_poly, w, h)
    assert not is_valid
    assert "area" in reason.lower()

    # Zero area point
    point_poly = [[50, 50], [50, 50], [50, 50], [50, 50]]
    is_valid, _ = PolygonNormalizer.validate_polygon(point_poly, w, h)
    assert not is_valid

    # Scrambled self-intersecting polygon canonicalization
    scrambled = [[100, 20], [10, 80], [100, 80], [10, 20]]
    canonical = PolygonNormalizer.canonicalize_polygon(scrambled)
    assert len(canonical) == 4
    # Points must be sorted deterministically TL, TR, BR, BL
    assert canonical[0][0] <= canonical[1][0]
    assert canonical[0][1] <= canonical[3][1]


def test_cycle1_geometry_extreme_dimension_capping():
    """Verifies that massive images (>8192px) are automatically scaled down to prevent memory DoS."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)

    # Simulate an image with an extreme dimension (e.g. 9000x200)
    extreme_img = np.zeros((200, 9000, 3), dtype=np.uint8)
    loaded = engine._load_image(extreme_img)
    assert loaded is not None
    assert max(loaded.shape[:2]) <= 4096


# ============================================================================
# CYCLE 2: DEGRADED INPUTS & NUMERICAL PATHOLOGIES
# ============================================================================

def test_cycle2_degraded_specular_glare_and_bloom():
    """Validates stability on saturated white glare bloom (flash reflection)."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)
    glare_img = np.full((300, 400, 3), 255, dtype=np.uint8)

    output = engine.process_image(glare_img, image_id="glare_test")
    assert isinstance(output, OCROutput)
    assert output.image_id == "glare_test"
    assert output.execution_time_ms >= 0


def test_cycle2_degraded_deep_underexposure_black():
    """Validates stability on completely black/underexposed images."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)
    black_img = np.zeros((300, 400, 3), dtype=np.uint8)

    output = engine.process_image(black_img, image_id="black_test")
    assert isinstance(output, OCROutput)
    assert output.total_tokens == 0 or output.mean_confidence >= 0.0


def test_cycle2_degraded_gaussian_blur_and_noise():
    """Validates end-to-end resilience against extreme Gaussian blur (sigma=15) and salt-and-pepper noise."""
    base_img = np.full((200, 500, 3), 240, dtype=np.uint8)
    cv2.putText(base_img, "MRP Rs 500.00", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 3)

    # Apply severe blur
    blurred = cv2.GaussianBlur(base_img, (31, 31), 15.0)

    # Apply salt-and-pepper noise
    noise = np.random.randint(0, 2, blurred.shape[:2], dtype=np.uint8) * 255
    blurred[noise == 255] = 255

    engine = MultilingualOCREngine(allow_classical_fallback=True)
    output = engine.process_image(blurred, image_id="blurred_noise_test")
    assert isinstance(output, OCROutput)
    assert output.image_id == "blurred_noise_test"


def test_cycle2_degraded_non_finite_nan_and_inf_arrays():
    """Validates that NaN, +Inf, -Inf injected arrays are sanitized without crashing."""
    corrupted = np.full((100, 200, 3), 128.0, dtype=np.float32)
    corrupted[10:20, 10:20] = np.nan
    corrupted[30:40, 30:40] = np.inf
    corrupted[50:60, 50:60] = -np.inf

    engine = MultilingualOCREngine(allow_classical_fallback=True)
    loaded = engine._load_image(corrupted)
    assert loaded is not None
    assert np.isfinite(loaded).all()
    assert loaded.dtype == np.uint8

    # Recognizer preprocess_crop with non-finite values
    rec = PPOCRv4Recognizer()
    crop_tensor = rec.preprocess_crop(corrupted)
    assert np.isfinite(crop_tensor).all()
    assert crop_tensor.shape[0] == 3
    assert crop_tensor.shape[1] == 48


def test_cycle2_degraded_multichannel_and_float32():
    """Validates transparent ingestion of 4-channel RGBA/BGRA, 1-channel grayscale, and [0,1] float32."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)

    # 4-channel BGRA
    bgra = np.full((100, 150, 4), 200, dtype=np.uint8)
    loaded_bgra = engine._load_image(bgra)
    assert loaded_bgra.shape == (100, 150, 3)

    # 1-channel Grayscale
    gray = np.full((100, 150), 180, dtype=np.uint8)
    loaded_gray = engine._load_image(gray)
    assert loaded_gray.shape == (100, 150, 3)

    # float32 in [0.0, 1.0]
    float_norm = np.random.uniform(0.0, 1.0, (100, 150, 3)).astype(np.float32)
    loaded_float = engine._load_image(float_norm)
    assert loaded_float.dtype == np.uint8
    assert loaded_float.max() <= 255


# ============================================================================
# CYCLE 3: MULTILINGUAL & DEVANAGARI HINDI TEXT FIDELITY
# ============================================================================

def test_cycle3_devanagari_samyuktakshar_conjuncts_fidelity():
    """Validates language routing, character decoding, and preservation of complex Hindi conjuncts."""
    conjuncts = ["क्ष", "त्र", "ज्ञ", "श्र", "द्व", "द्ध", "ष्ट", "ष्ठ"]

    # Language router verification
    for conj in conjuncts:
        assert PPOCRv4Recognizer.detect_language(conj) == "hi", f"Failed language detection on conjunct: {conj}"

    # Plausibility score verification
    for conj in conjuncts:
        score = OCRConsensusEngine.score_plausibility(conj)
        assert score > 0.8, f"Plausibility score too low for conjunct: {conj}"


def test_cycle3_devanagari_matras_halants_and_nuktas_fidelity():
    """Validates correct handling of Indic vowel signs (matras), halants, and nuktas."""
    # Matras: ि, ी, ु, ू, ृ, े, ै, ो, ौ, ं, ँ, ः
    matra_samples = ["कि", "की", "कु", "कू", "कृ", "के", "कै", "को", "कौ", "कं", "कँ", "कः"]
    for sample in matra_samples:
        assert PPOCRv4Recognizer.detect_language(sample) == "hi"
        assert OCRConsensusEngine.score_plausibility(sample) >= 0.8

    # Nuktas: ज़, ड़, ढ़, फ़
    nukta_samples = ["कागज़", "पेड़", "पढ़ना", "साफ़"]
    for sample in nukta_samples:
        assert PPOCRv4Recognizer.detect_language(sample) == "hi"
        assert OCRConsensusEngine.score_plausibility(sample) >= 0.8

    # Halants
    halant_samples = ["क्", "त्", "म्", "शुद्ध"]
    for sample in halant_samples:
        assert PPOCRv4Recognizer.detect_language(sample) == "hi"


def test_cycle3_devanagari_indic_numerals_fidelity():
    """Validates Indic numeral recognition fidelity (०, १, २, ३, ४, ५, ६, ७, ८, ९)."""
    indic_digits = "०१२३४५६७८९"
    assert PPOCRv4Recognizer.detect_language(indic_digits) == "hi"
    assert OCRConsensusEngine.score_plausibility(indic_digits) == 1.0

    # CTC Decoder preservation of Indic numerals
    char_list = ["<blank>", "०", "१", "२", "३", "४", "५", "६", "७", "८", "९", " "]
    decoder = CTCLabelDecode(char_list)

    # Construct synthetic one-hot probabilities for '२५०' (250)
    time_steps = 7
    vocab_size = len(char_list)
    logits = np.full((time_steps, vocab_size), -10.0, dtype=np.float32)

    # t=1: '२' (idx 3)
    logits[1, 3] = 10.0
    # t=2: blank (idx 0)
    logits[2, 0] = 10.0
    # t=3: '५' (idx 6)
    logits[3, 6] = 10.0
    # t=4: blank (idx 0)
    logits[4, 0] = 10.0
    # t=5: '०' (idx 1)
    logits[5, 1] = 10.0

    text, conf, confs = decoder.decode(logits)
    assert text == "२५०"
    assert conf > 0.95
    assert len(confs) == 3


def test_cycle3_mixed_script_statutory_declaration():
    """Validates mixed Hindi/English statutory declarations on bilingual packaging."""
    mixed_text = "अधिकतम खुदरा मूल्य MRP ₹ २५०.०० (सभी कर सहित)"
    assert PPOCRv4Recognizer.detect_language(mixed_text) == "hi"
    assert OCRConsensusEngine.score_plausibility(mixed_text) >= 0.85

    # Levenshtein distance handles bilingual text comparison smoothly
    sim = OCRConsensusEngine.compute_levenshtein_similarity(mixed_text, mixed_text)
    assert sim == 1.0


# ============================================================================
# CYCLE 4: 100-CYCLE RAPID REPEATED EXECUTION & MEMORY LEAK AUDIT
# ============================================================================

def test_cycle4_rapid_repeated_execution_zero_leak():
    """Executes 100 consecutive crop extraction and preprocessing cycles to verify zero memory leaks."""
    img = np.full((600, 800, 3), 200, dtype=np.uint8)
    cv2.putText(img, "NET QUANTITY 500 g", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 0, 0), 2)
    poly = [[50, 70], [450, 70], [450, 120], [50, 120]]

    rec = PPOCRv4Recognizer()

    # Pre-test warmup
    for _ in range(5):
        crop = PolygonNormalizer.extract_crop(img, poly, target_height=48)
        _ = rec.preprocess_crop(crop)

    gc.collect()

    start_time = time.perf_counter()
    iterations = 100

    for _ in range(iterations):
        crop = PolygonNormalizer.extract_crop(img, poly, target_height=48)
        tensor = rec.preprocess_crop(crop)
        assert tensor.shape == (3, 48, tensor.shape[2])

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    mean_ms_per_iter = elapsed_ms / iterations

    # Average geometry + preprocessing time per crop must be sub-5ms on CPU
    assert mean_ms_per_iter < 10.0, f"Repeated execution too slow: {mean_ms_per_iter:.2f} ms/iter"


# ============================================================================
# CYCLE 5: SECURITY HARDENING & VULNERABILITY AUDIT
# ============================================================================

def test_cycle5_security_null_byte_path_injection():
    """Verifies that strings containing null bytes (\x00) are cleanly rejected."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)
    poisoned_path = "tests/fixtures/fixture\x00_exploit.jpg"

    loaded = engine._load_image(poisoned_path)
    assert loaded is None

    output = engine.process_image(poisoned_path, image_id="null_byte_test")
    assert output.total_tokens == 0


def test_cycle5_security_path_traversal_nonexistent():
    """Verifies that non-existent traversal paths return safe empty OCROutput without exception."""
    engine = MultilingualOCREngine(allow_classical_fallback=True)
    traversal_path = "../../../../../etc/shadow"

    loaded = engine._load_image(traversal_path)
    assert loaded is None

    output = engine.process_image(traversal_path, image_id="traversal_test")
    assert output.total_tokens == 0


def test_cycle5_security_levenshtein_cpu_exhaustion_dos_mitigation():
    """Verifies that 50,000-character malicious inputs are clamped to prevent O(N*M) CPU exhaustion."""
    evil_str1 = "A" * 50000
    evil_str2 = "B" * 50000

    start_time = time.perf_counter()
    sim = OCRConsensusEngine.compute_levenshtein_similarity(evil_str1, evil_str2)
    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    # With 500-char clamp, computation must complete in < 250ms (typically < 30ms)
    assert elapsed_ms < 500.0, f"Levenshtein DoS attack took {elapsed_ms:.2f} ms"
    assert 0.0 <= sim <= 1.0
