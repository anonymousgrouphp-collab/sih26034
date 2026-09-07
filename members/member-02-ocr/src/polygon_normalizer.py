"""Coordinate Normalizer and Bounding Box Utilities for OCR Polygons (SIH26034)"""

from typing import List, Tuple


class PolygonNormalizer:
    @staticmethod
    def polygon_to_axis_aligned_box(polygon: List[List[int]]) -> List[int]:
        """Converts 4-point polygon [[x1, y1], [x2, y2], [x3, y3], [x4, y4]] to [ymin, xmin, ymax, xmax]."""
        if len(polygon) < 4:
            raise ValueError("Polygon must contain at least 4 coordinate pairs")
        xs = [pt[0] for pt in polygon]
        ys = [pt[1] for pt in polygon]
        return [min(ys), min(xs), max(ys), max(xs)]

    @staticmethod
    def normalize_coordinates(
        box: List[int],
        image_width: int,
        image_height: int
    ) -> List[float]:
        """Normalizes pixel coordinates [ymin, xmin, ymax, xmax] to [0.0, 1.0]."""
        ymin, xmin, ymax, xmax = box
        return [
            ymin / image_height,
            xmin / image_width,
            ymax / image_height,
            xmax / image_width,
        ]

    @staticmethod
    def requires_consensus_fallback(confidence: float, threshold: float = 0.65) -> bool:
        """Determines if a crop needs secondary consensus verification."""
        return confidence < threshold
