"""Multilingual OCR Pipeline Engine (SIH26034 - NyayaDrishti-LM)

Architecture & Specification Compliance:
- Stages 6 & 7: DBNet++ Detection -> PP-OCRv4 Multilingual Recognition -> Tesseract Fallback
- Strict conformance to contracts/ocr/ocr_dto.py and contracts/ocr/ocr_schema.json
- CPU execution with ONNX Runtime optimizations
- Preserves raw observed packaging strings (Zero semantic auto-correction per Rule 19)
- Downstream handoff to Member 3 (parsers.py) and Member 4 (Table-I font evaluation)
"""

import os
import time
import logging
from pathlib import Path
import sys
from typing import Any, Dict, List, Optional, Union
import numpy as np
import cv2

# Ensure contracts is accessible
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

SRC_DIR = Path(__file__).resolve().parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from contracts.ocr.ocr_dto import OCROutput, OCRToken
from polygon_normalizer import PolygonNormalizer
from detector import DBNetTextDetector, TextDetectionResult
from recognizer import PPOCRv4Recognizer
from fallback import TesseractFallback, OCRConsensusEngine

logger = logging.getLogger(__name__)


class MultilingualOCREngine:
    """Orchestrates DBNet++ multi-oriented detection, PP-OCRv4 multilingual recognition,
    and Tesseract consensus fallback into validated OCROutput contract objects.
    """

    def __init__(
        self,
        detector: Optional[DBNetTextDetector] = None,
        recognizer: Optional[PPOCRv4Recognizer] = None,
        fallback: Optional[TesseractFallback] = None,
        fallback_threshold: float = 0.65,
        det_num_threads: int = 4,
        rec_num_threads: int = 6,
        num_threads: Optional[int] = None,
        execution_mode: str = "FP32",
        allow_classical_fallback: bool = False
    ):
        self.execution_mode = execution_mode.upper()
        if num_threads is not None:
            det_num_threads = num_threads
            rec_num_threads = num_threads
        self.detector = detector if detector is not None else DBNetTextDetector(
            num_threads=det_num_threads,
            execution_mode=self.execution_mode,
            allow_classical_fallback=allow_classical_fallback
        )
        self.recognizer = recognizer if recognizer is not None else PPOCRv4Recognizer(
            num_threads=rec_num_threads,
            execution_mode=self.execution_mode
        )
        self.fallback = fallback if fallback is not None else TesseractFallback()
        self.fallback_threshold = fallback_threshold

    def _load_image(self, image_input: Union[np.ndarray, str, Path]) -> Optional[np.ndarray]:
        """Loads and normalizes image input into a standard BGR uint8 NumPy array."""
        img: Optional[np.ndarray] = None

        if isinstance(image_input, (str, Path)):
            path_str = str(image_input)
            if "\x00" in path_str:
                logger.error("Rejected image path containing null byte")
                return None
            if not os.path.exists(path_str):
                logger.error(f"Image path does not exist: {path_str}")
                return None
            img = cv2.imread(path_str)
            if img is None:
                return None

        elif isinstance(image_input, np.ndarray):
            if image_input.size == 0 or len(image_input.shape) < 2:
                return None
            img = image_input

        if img is None:
            return None

        # Sanitize non-finite values
        if not np.isfinite(img).all():
            img = np.nan_to_num(img, nan=0.0, posinf=255.0, neginf=0.0)

        # Decompression / allocation bomb guard (cap max dimension to 4096)
        h, w = img.shape[:2]
        if max(h, w) > 8192:
            scale = 4096.0 / max(h, w)
            new_w = max(int(round(w * scale)), 16)
            new_h = max(int(round(h * scale)), 16)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)

        # Coerce floating-point arrays to uint8
        if np.issubdtype(img.dtype, np.floating):
            if img.max() <= 1.0 and img.min() >= 0.0:
                img = (img * 255.0).clip(0, 255).astype(np.uint8)
            else:
                img = np.clip(img, 0, 255).astype(np.uint8)
        elif img.dtype != np.uint8:
            img = np.clip(img, 0, 255).astype(np.uint8)

        # Ensure standard 3-channel BGR layout
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif len(img.shape) == 3:
            if img.shape[2] == 4:
                img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            elif img.shape[2] == 1:
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            elif img.shape[2] > 3:
                img = img[:, :, :3]

        return np.ascontiguousarray(img)

    def process_image(
        self,
        image_input: Union[np.ndarray, str, Path],
        image_id: str = "img_01"
    ) -> OCROutput:
        """Executes end-to-end multilingual text detection and recognition on rectified image.

        Args:
            image_input: BGR/RGB NumPy array or filesystem path to image
            image_id: Unique identifier for inspection tracking

        Returns:
            OCROutput: Fully populated and contract-validated DTO
        """
        start_time = time.perf_counter()
        image = self._load_image(image_input)

        if image is None or image.size == 0 or len(image.shape) < 2:
            return OCROutput(
                image_id=image_id,
                total_tokens=0,
                mean_confidence=0.0,
                tokens=[],
                full_text="",
                execution_time_ms=0
            )

        orig_h, orig_w = image.shape[:2]

        # 1. Multi-oriented text detection (DBNet++)
        detections = self.detector.detect(image)

        tokens: List[OCRToken] = []
        for i, det in enumerate(detections):
            token_id = f"tok_{i + 1:02d}"

            # Validate polygon area and bounds
            is_valid, _ = PolygonNormalizer.validate_polygon(det.polygon, orig_w, orig_h)
            if not is_valid:
                continue

            # 2. Extract perspective-rectified crop
            try:
                crop = PolygonNormalizer.extract_crop(image, det.polygon, target_height=48)
            except Exception as e:
                logger.warning(f"Crop extraction failed for token {token_id}: {e}")
                continue

            # 3. Multilingual recognition (PP-OCRv4)
            p_text, p_conf, p_lang = self.recognizer.recognize(crop)

            # 4. Consensus fallback on low confidence
            final_text = p_text
            final_conf = p_conf
            final_lang = p_lang

            if PolygonNormalizer.requires_consensus_fallback(p_conf, self.fallback_threshold):
                if self.fallback.is_available():
                    fb_res = self.fallback.recognize(crop)
                    if fb_res is not None:
                        fb_text, fb_conf = fb_res
                        final_text, final_conf, _ = OCRConsensusEngine.resolve(
                            p_text, p_conf, fb_text, fb_conf
                        )
                        final_lang = PPOCRv4Recognizer.detect_language(final_text)

            # Ensure polygon is canonicalized and bounding box is computed
            canonical_polygon = PolygonNormalizer.canonicalize_polygon(det.polygon)
            bbox = PolygonNormalizer.polygon_to_axis_aligned_box(canonical_polygon)

            # Clamp confidence to [0.0, 1.0]
            bounded_conf = float(min(max(final_conf, 0.0), 1.0))

            token = OCRToken(
                token_id=token_id,
                text=final_text,
                confidence=round(bounded_conf, 4),
                polygon=canonical_polygon,
                bounding_box=bbox,
                language=final_lang
            )
            tokens.append(token)

        # Compute aggregate metrics
        total_tokens = len(tokens)
        mean_conf = (
            float(round(float(np.mean([t.confidence for t in tokens])), 4))
            if tokens
            else 0.0
        )
        full_text = "\n".join(t.text for t in tokens if t.text.strip())
        execution_time_ms = int(round((time.perf_counter() - start_time) * 1000))

        return OCROutput(
            image_id=image_id,
            total_tokens=total_tokens,
            mean_confidence=mean_conf,
            tokens=tokens,
            full_text=full_text,
            execution_time_ms=execution_time_ms
        )
