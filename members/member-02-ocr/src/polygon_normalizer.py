"""Coordinate Normalizer and Bounding Box Utilities for OCR Polygons (SIH26034)

Statutory & Metrology alignment:
- Preserves 4-point oriented polygon coordinates in rectified pixel space
- Provides canonical clockwise point ordering: [TL, TR, BR, BL]
- Normalizes coordinates to [0.0, 1.0] for scale-invariant downstream processing
- Perspective-rectifies oriented text patches for PP-OCRv4 / Tesseract recognition
"""

import math
from typing import Any, List, Optional, Tuple, Union
import numpy as np
import cv2


class PolygonNormalizer:
    @staticmethod
    def polygon_to_axis_aligned_box(
        polygon: List[List[Union[int, float]]],
        image_width: Optional[int] = None,
        image_height: Optional[int] = None
    ) -> List[int]:
        """Converts 4-point polygon [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] to [ymin, xmin, ymax, xmax] with bounds clipping."""
        if len(polygon) < 4:
            raise ValueError("Polygon must contain at least 4 coordinate pairs")
        xs = [float(pt[0]) for pt in polygon]
        ys = [float(pt[1]) for pt in polygon]
        ymin = int(round(min(ys)))
        xmin = int(round(min(xs)))
        ymax = int(round(max(ys)))
        xmax = int(round(max(xs)))

        if image_height is not None and image_height > 0:
            ymin = max(0, min(ymin, image_height))
            ymax = max(ymin, min(ymax, image_height))
        if image_width is not None and image_width > 0:
            xmin = max(0, min(xmin, image_width))
            xmax = max(xmin, min(xmax, image_width))

        return [ymin, xmin, ymax, xmax]

    @staticmethod
    def normalize_coordinates(
        box: List[int],
        image_width: int,
        image_height: int
    ) -> List[float]:
        """Normalizes pixel coordinates [ymin, xmin, ymax, xmax] to [0.0, 1.0]."""
        if image_width <= 0 or image_height <= 0:
            raise ValueError(f"Invalid image dimensions: {image_width}x{image_height}")
        ymin, xmin, ymax, xmax = box
        return [
            float(max(0.0, min(1.0, ymin / image_height))),
            float(max(0.0, min(1.0, xmin / image_width))),
            float(max(0.0, min(1.0, ymax / image_height))),
            float(max(0.0, min(1.0, xmax / image_width))),
        ]

    @staticmethod
    def requires_consensus_fallback(confidence: float, threshold: float = 0.65) -> bool:
        """Determines if a crop needs secondary consensus verification."""
        return confidence < threshold

    @classmethod
    def canonicalize_polygon(cls, polygon: List[List[Union[int, float]]]) -> List[List[int]]:
        """Orders 4-point polygon vertices in canonical clockwise order:
        [Top-Left, Top-Right, Bottom-Right, Bottom-Left].

        Handles rotated and tilted packaging text boxes deterministically.
        """
        if len(polygon) != 4:
            raise ValueError(f"Expected exactly 4 points for polygon, got {len(polygon)}")

        pts = np.array(polygon, dtype=np.float32)
        if not np.all(np.isfinite(pts)):
            raise ValueError("Polygon coordinates contain non-finite values (NaN or Inf)")

        # 1. Order points cyclically in clockwise order around centroid
        centroid = np.mean(pts, axis=0)
        angles = np.arctan2(pts[:, 1] - centroid[1], pts[:, 0] - centroid[0])
        sort_idx = np.argsort(angles)
        cw_pts = pts[sort_idx]

        # 2. Identify the Top-Left vertex (smallest sum x + y or closest to origin)
        sums = cw_pts[:, 0] + cw_pts[:, 1]
        tl_idx = int(np.argmin(sums))

        # Roll array so Top-Left is at index 0
        ordered_pts = np.roll(cw_pts, -tl_idx, axis=0)

        # Ensure clockwise orientation: cross-product of edge 0->1 and 0->3
        v01 = ordered_pts[1] - ordered_pts[0]
        v03 = ordered_pts[3] - ordered_pts[0]
        cross = v01[0] * v03[1] - v01[1] * v03[0]
        if cross < 0:  # Counter-clockwise, swap points 1 and 3
            ordered_pts[[1, 3]] = ordered_pts[[3, 1]]

        return [[int(round(pt[0])), int(round(pt[1]))] for pt in ordered_pts]

    @classmethod
    def normalize_polygon(
        cls,
        polygon: List[List[Union[int, float]]],
        image_width: int,
        image_height: int
    ) -> List[List[float]]:
        """Normalizes 4-point polygon coordinates to [0.0, 1.0]."""
        if image_width <= 0 or image_height <= 0:
            raise ValueError(f"Invalid image dimensions: {image_width}x{image_height}")
        if len(polygon) != 4:
            raise ValueError(f"Expected 4 points, got {len(polygon)}")

        norm_pts = []
        for pt in polygon:
            nx = max(0.0, min(1.0, float(pt[0]) / image_width))
            ny = max(0.0, min(1.0, float(pt[1]) / image_height))
            norm_pts.append([round(nx, 5), round(ny, 5)])
        return norm_pts

    @classmethod
    def denormalize_polygon(
        cls,
        norm_polygon: List[List[float]],
        image_width: int,
        image_height: int
    ) -> List[List[int]]:
        """Converts normalized [0.0, 1.0] polygon coordinates back to integer pixels."""
        if image_width <= 0 or image_height <= 0:
            raise ValueError(f"Invalid image dimensions: {image_width}x{image_height}")
        if len(norm_polygon) != 4:
            raise ValueError(f"Expected 4 points, got {len(norm_polygon)}")

        pixel_pts = []
        for pt in norm_polygon:
            px = int(round(pt[0] * image_width))
            py = int(round(pt[1] * image_height))
            pixel_pts.append([px, py])
        return pixel_pts

    @classmethod
    def validate_polygon(
        cls,
        polygon: Any,
        image_width: Optional[int] = None,
        image_height: Optional[int] = None,
        min_area: float = 1.0
    ) -> Tuple[bool, Optional[str]]:
        """Validates polygon geometry, integrity, non-degeneracy, and positive area."""
        if not isinstance(polygon, (list, tuple)):
            return False, "Polygon must be a list or tuple of points"
        if len(polygon) != 4:
            return False, f"Polygon must contain exactly 4 points, got {len(polygon)}"

        for i, pt in enumerate(polygon):
            if not isinstance(pt, (list, tuple)) or len(pt) != 2:
                return False, f"Point {i} must be a 2-element coordinate pair [x, y]"
            if not all(isinstance(c, (int, float, np.integer, np.floating)) for c in pt):
                return False, f"Point {i} contains non-numeric coordinates: {pt}"

        pts = np.array(polygon, dtype=np.float32)

        # Shoelace formula for polygon area
        x = pts[:, 0]
        y = pts[:, 1]
        area = 0.5 * abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
        if area < min_area:
            return False, f"Polygon is degenerate with area {area:.2f} < {min_area}"

        # Check bounds if dimensions provided
        if image_width is not None and image_height is not None:
            if (pts[:, 0] < -image_width).any() or (pts[:, 0] > 2 * image_width).any():
                return False, "Polygon coordinates significantly exceed image width boundaries"
            if (pts[:, 1] < -image_height).any() or (pts[:, 1] > 2 * image_height).any():
                return False, "Polygon coordinates significantly exceed image height boundaries"

        return True, None

    @classmethod
    def extract_crop(
        cls,
        image: np.ndarray,
        polygon: List[List[int]],
        target_height: Optional[int] = None
    ) -> np.ndarray:
        """Perspective-rectifies an oriented 4-point polygon text patch into a horizontal patch.

        Takes:
            image: HxWxC or HxW numpy array
            polygon: 4-point polygon [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
            target_height: Optional fixed output height (e.g. 48 for PP-OCRv4)
        Returns:
            rectified horizontal image patch
        """
        if image is None or image.size == 0:
            raise ValueError("Input image is empty or None")

        img = np.ascontiguousarray(image)
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif len(img.shape) == 3 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
        elif len(img.shape) == 3 and img.shape[2] == 1:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
        elif len(img.shape) != 3 or img.shape[2] != 3:
            raise ValueError(f"Unsupported image shape for crop extraction: {img.shape}")

        canonical_pts = cls.canonicalize_polygon(polygon)
        src_pts = np.array(canonical_pts, dtype=np.float32)

        # Compute width: max distance between top and bottom edges
        width_top = np.linalg.norm(src_pts[1] - src_pts[0])
        width_bot = np.linalg.norm(src_pts[2] - src_pts[3])
        max_width = int(max(width_top, width_bot))

        # Compute height: max distance between left and right edges
        height_left = np.linalg.norm(src_pts[3] - src_pts[0])
        height_right = np.linalg.norm(src_pts[2] - src_pts[1])
        max_height = int(max(height_left, height_right))

        if max_width <= 0 or max_height <= 0:
            raise ValueError(f"Degenerate polygon dimensions: {max_width}x{max_height}")

        # Guard against pathological allocation bomb
        max_width = min(max_width, 8192)
        max_height = min(max_height, 8192)

        dst_pts = np.array([
            [0, 0],
            [max_width - 1, 0],
            [max_width - 1, max_height - 1],
            [0, max_height - 1]
        ], dtype=np.float32)

        transform_matrix = cv2.getPerspectiveTransform(src_pts, dst_pts)
        crop = cv2.warpPerspective(
            img,
            transform_matrix,
            (max_width, max_height),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE
        )

        # If text crop is oriented vertically along the packaging, rotate 90 degrees clockwise
        # so that downstream multilingual PP-OCR receives horizontal text lines
        if max_height > max_width * 1.2:
            crop = cv2.rotate(crop, cv2.ROTATE_90_CLOCKWISE)
            max_width, max_height = max_height, max_width

        if target_height is not None and target_height > 0:
            aspect_ratio = max_width / max_height
            scaled_width = max(min(int(round(target_height * aspect_ratio)), 4096), 16)
            crop = cv2.resize(crop, (scaled_width, target_height), interpolation=cv2.INTER_CUBIC)

        return crop
