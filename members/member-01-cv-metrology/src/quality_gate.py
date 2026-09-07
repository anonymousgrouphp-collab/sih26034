"""Optical Quality Gate Implementation (SIH26034 - NyayaDrishti-LM)
Evaluates Laplacian blur variance (>= 150), specular glare (<= 3.0%), and perspective skew (<= 15 deg).
"""

from typing import Optional, Tuple
import numpy as np


class QualityGateEvaluator:
    BLUR_THRESHOLD: float = 150.0
    GLARE_MAX_PERCENTAGE: float = 3.0
    TILT_MAX_DEG: float = 15.0

    @classmethod
    def evaluate_metrics(
        cls,
        blur_variance: float,
        glare_percentage: float,
        skew_angle_deg: float = 0.0
    ) -> Tuple[bool, Optional[str]]:
        reasons = []
        if blur_variance < cls.BLUR_THRESHOLD:
            reasons.append(
                f"IMAGE_BLURRED: Laplacian variance {blur_variance:.2f} is below threshold {cls.BLUR_THRESHOLD:.1f}. Hold steady and refocus."
            )
        if glare_percentage > cls.GLARE_MAX_PERCENTAGE:
            reasons.append(
                f"SPECULAR_GLARE: Glare coverage {glare_percentage:.2f}% exceeds maximum {cls.GLARE_MAX_PERCENTAGE:.1f}%. Adjust lighting or angle."
            )
        if skew_angle_deg > cls.TILT_MAX_DEG:
            reasons.append(
                f"EXCESSIVE_TILT: Skew angle {skew_angle_deg:.1f} deg exceeds maximum {cls.TILT_MAX_DEG:.1f} deg. Align camera perpendicular to label."
            )

        if reasons:
            return False, " | ".join(reasons)
        return True, None

    @classmethod
    def compute_laplacian_variance(cls, gray_image: np.ndarray) -> float:
        """Computes Laplacian variance as a focus/blur metric."""
        if gray_image is None or gray_image.size == 0:
            return 0.0
        # Compute Laplacian kernel manually with numpy if cv2 not available or using convolution
        kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        # Pad image
        padded = np.pad(gray_image.astype(np.float32), 1, mode="edge")
        lap = (
            padded[:-2, 1:-1] + padded[2:, 1:-1] + padded[1:-1, :-2] + padded[1:-1, 2:] - 4 * padded[1:-1, 1:-1]
        )
        return float(np.var(lap))

    @classmethod
    def compute_glare_percentage(cls, bgr_image: np.ndarray) -> float:
        """Computes specular glare percentage (high brightness, low saturation)."""
        if bgr_image is None or bgr_image.size == 0:
            return 0.0
        # Convert BGR to approximate V and S
        # V = max(R, G, B), S = (max - min) / max
        img_float = bgr_image.astype(np.float32)
        v = np.max(img_float, axis=2)
        min_c = np.min(img_float, axis=2)
        denom = np.where(v == 0, 1.0, v)
        s = ((v - min_c) / denom) * 255.0

        # Glare mask: V > 245 and S < 15
        glare_mask = (v > 245.0) & (s < 15.0)
        total_pixels = bgr_image.shape[0] * bgr_image.shape[1]
        glare_pixels = np.count_nonzero(glare_mask)
        return float((glare_pixels / total_pixels) * 100.0)
