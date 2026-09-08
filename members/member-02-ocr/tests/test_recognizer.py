"""Unit Tests for PP-OCRv4 Multilingual Recognition Engine (SIH26034)"""

import pytest
import numpy as np
from pathlib import Path
import sys

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from recognizer import CTCLabelDecode, PPOCRv4Recognizer, DEFAULT_CHAR_LIST


def test_ctc_decode_skips_blank_and_collapses_duplicates():
    decoder = CTCLabelDecode()
    vocab_size = len(DEFAULT_CHAR_LIST)

    # Let's target the word "MRP"
    # Find indices of 'M', 'R', 'P'
    m_idx = DEFAULT_CHAR_LIST.index("M")
    r_idx = DEFAULT_CHAR_LIST.index("R")
    p_idx = DEFAULT_CHAR_LIST.index("P")

    # Construct synthetic logits (T=7, vocab_size)
    # Timesteps: M, M, blank, R, blank, P, P
    sequence = [m_idx, m_idx, 0, r_idx, 0, p_idx, p_idx]
    logits = np.zeros((len(sequence), vocab_size), dtype=np.float32)
    for t, idx in enumerate(sequence):
        logits[t, idx] = 10.0  # Dominant logit -> prob ~ 1.0

    text, conf, char_confs = decoder.decode(logits)
    assert text == "MRP"
    assert conf > 0.95
    assert len(char_confs) == 3


def test_ctc_decode_devanagari_and_indic_digits():
    decoder = CTCLabelDecode()
    vocab_size = len(DEFAULT_CHAR_LIST)

    # Target: "रु ५०" -> 'र', 'ु', ' ', '५', '०'
    target_chars = ["र", "ु", " ", "५", "०"]
    indices = [DEFAULT_CHAR_LIST.index(c) for c in target_chars]

    logits = np.zeros((len(indices), vocab_size), dtype=np.float32)
    for t, idx in enumerate(indices):
        logits[t, idx] = 8.0

    text, conf, _ = decoder.decode(logits)
    assert text == "रु ५०"
    assert conf > 0.90


def test_detect_language():
    assert PPOCRv4Recognizer.detect_language("Net Weight: 150 g") == "en"
    assert PPOCRv4Recognizer.detect_language("MRP Rs. 35.00") == "en"
    assert PPOCRv4Recognizer.detect_language("शुद्ध मात्रा: २०० ग्राम") == "hi"
    assert PPOCRv4Recognizer.detect_language("अधिकतम खुदरा मूल्य: रु ५०.००") == "hi"
    # Mixed language with Devanagari should flag Hindi
    assert PPOCRv4Recognizer.detect_language("Net Wt. 200 ग्राम") == "hi"


def test_preprocess_crop():
    recognizer = PPOCRv4Recognizer(rec_image_height=48)
    crop = np.ones((60, 240, 3), dtype=np.uint8) * 200
    tensor = recognizer.preprocess_crop(crop)

    assert tensor.ndim == 3
    assert tensor.shape[0] == 3  # Channels
    assert tensor.shape[1] == 48  # Height
    assert tensor.shape[2] > 48  # Width proportional to aspect ratio
    # Normalization check: (200 / 255 - 0.5) / 0.5 ~ 0.568
    assert -1.0 <= tensor.min() <= 1.0
    assert -1.0 <= tensor.max() <= 1.0


def test_recognize_empty_and_corrupted():
    recognizer = PPOCRv4Recognizer()
    assert recognizer.recognize(None) == ("", 0.0, "en")
    empty_crop = np.array([], dtype=np.uint8)
    assert recognizer.recognize(empty_crop) == ("", 0.0, "en")
    assert recognizer.recognize_batch([]) == []
