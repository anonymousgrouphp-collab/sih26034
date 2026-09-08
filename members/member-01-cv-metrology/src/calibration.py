"""Metric Scale Calibration & Planar Homography Engine (SIH26034 - NyayaDrishti-LM)
Member 1 — Computer Vision, Optics & Metrology

Resolves physical metric scale (pixels per millimeter) and rectifies perspective distortion
using coplanar fiducials under ADL-03, ADR-06, and LMPC Rule 2(h) & Rule 7:
- Primary Standard: ArUco 4x4_50 (50.0 mm)
- Automatic Secondary Fallback: ISO 7810 ID-1 card (85.60 mm x 53.98 mm)
- Perspective Rectification: 3x3 Planar Homography (cv2.warpPerspective)
- Metric Scaling: pixels_per_mm (px_to_mm)
- Principal Display Panel (PDP): 40% surface area schedule for rectangular/cylindrical packaging
"""

from pathlib import Path
import sys
from typing import Any, Dict, List, Literal, Optional, Tuple, Union
import cv2
import numpy as np

# Dynamically resolve repository root for shared contracts
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from contracts.calibration.calibration_dto import (
    CalibrationDTO,
    CalibrationResult,
    PDPGeometryDTO,
)


class CalibrationEngine:
    """Detects metric fiducials, derives pixels-per-mm scale, computes planar homography, and estimates PDP area."""

    ARUCO_SIZE_MM: float = 50.0
    ISO_CARD_WIDTH_MM: float = 85.60
    ISO_CARD_HEIGHT_MM: float = 53.98
    ISO_CARD_ASPECT_RATIO: float = 85.60 / 53.98  # ~1.5858

    @classmethod
    def order_corners(cls, pts: np.ndarray) -> np.ndarray:
        """Orders 4 (x, y) coordinates clockwise: [top-left, top-right, bottom-right, bottom-left]."""
        pts = pts.reshape(4, 2).astype(np.float32)
        rect = np.zeros((4, 2), dtype=np.float32)

        # Top-left has smallest sum (x + y), bottom-right has largest sum
        s = pts.sum(axis=1)
        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        # Top-right has smallest diff (y - x), bottom-left has largest diff
        diff = np.diff(pts, axis=1).flatten()
        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect

    @classmethod
    def detect_aruco(cls, gray_or_bgr: np.ndarray, marker_size_mm: float = ARUCO_SIZE_MM) -> Optional[Dict[str, Any]]:
        """Detects official ArUco 4x4_50 marker in scene.

        Returns detection dictionary or None if no valid marker is detected.
        """
        if gray_or_bgr is None or gray_or_bgr.size == 0:
            return None

        # Convert to grayscale if color
        if gray_or_bgr.ndim == 3:
            gray = cv2.cvtColor(gray_or_bgr, cv2.COLOR_BGR2GRAY)
        else:
            gray = gray_or_bgr

        try:
            dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
            if hasattr(cv2.aruco, "DetectorParameters"):
                params = cv2.aruco.DetectorParameters()
                if hasattr(cv2.aruco, "CORNER_REFINE_SUBPIX"):
                    params.cornerRefinementMethod = cv2.aruco.CORNER_REFINE_SUBPIX
            else:
                params = None

            if hasattr(cv2.aruco, "ArucoDetector"):
                detector = cv2.aruco.ArucoDetector(dictionary, params) if params is not None else cv2.aruco.ArucoDetector(dictionary)
                corners, ids, rejected = detector.detectMarkers(gray)
            else:
                corners, ids, rejected = cv2.aruco.detectMarkers(gray, dictionary, parameters=params)

            if ids is None or len(corners) == 0:
                return None

            # Select primary marker (first detected)
            marker_corners = corners[0][0]  # shape (4, 2)
            ordered = cls.order_corners(marker_corners)

            # Compute Euclidean lengths of all 4 edges
            top_len = float(np.linalg.norm(ordered[0] - ordered[1]))
            right_len = float(np.linalg.norm(ordered[1] - ordered[2]))
            bottom_len = float(np.linalg.norm(ordered[2] - ordered[3]))
            left_len = float(np.linalg.norm(ordered[3] - ordered[0]))

            mean_side_px = (top_len + right_len + bottom_len + left_len) / 4.0
            if mean_side_px <= 1.0:
                return None

            px_to_mm = float(mean_side_px / marker_size_mm)

            # Calculate reprojection/distortion error margin (% variation in side lengths)
            side_std = float(np.std([top_len, right_len, bottom_len, left_len]))
            margin_of_error_pct = float((side_std / mean_side_px) * 100.0)

            # Bounding box in [ymin, xmin, ymax, xmax]
            xmin = int(np.floor(np.min(ordered[:, 0])))
            xmax = int(np.ceil(np.max(ordered[:, 0])))
            ymin = int(np.floor(np.min(ordered[:, 1])))
            ymax = int(np.ceil(np.max(ordered[:, 1])))

            # Corner sharpness & confidence
            confidence = max(0.0, min(1.0, 1.0 - (margin_of_error_pct / 50.0)))

            # Geometric perspective tilt estimation from square foreshortening
            avg_w = (top_len + bottom_len) / 2.0
            avg_h = (left_len + right_len) / 2.0
            aspect = min(avg_w, avg_h) / max(avg_w, avg_h) if max(avg_w, avg_h) > 0 else 1.0
            tilt_angle_deg = float(np.degrees(np.arccos(min(1.0, aspect))))

            return {
                "method": "ARUCO_4X4_50",
                "px_to_mm": round(px_to_mm, 4),
                "confidence": round(confidence, 4),
                "corners": ordered,
                "reference_bounding_box": [ymin, xmin, ymax, xmax],
                "margin_of_error_pct": round(margin_of_error_pct, 2),
                "marker_id": int(ids[0][0]) if hasattr(ids[0], "__len__") else int(ids[0]),
                "tilt_angle_deg": round(tilt_angle_deg, 2),
            }
        except Exception:
            return None

    @classmethod
    def detect_iso_card(
        cls,
        gray_or_bgr: np.ndarray,
        card_w_mm: float = ISO_CARD_WIDTH_MM,
        card_h_mm: float = ISO_CARD_HEIGHT_MM,
    ) -> Optional[Dict[str, Any]]:
        """Detects ISO 7810 ID-1 reference card (85.60 x 53.98 mm) as automatic secondary standard."""
        if gray_or_bgr is None or gray_or_bgr.size == 0:
            return None

        if gray_or_bgr.ndim == 3:
            gray = cv2.cvtColor(gray_or_bgr, cv2.COLOR_BGR2GRAY)
        else:
            gray = gray_or_bgr

        try:
            # Multi-threshold Canny edge detection
            edges = cv2.Canny(gray, 40, 140)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
            edges_closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)

            contours, _ = cv2.findContours(edges_closed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            target_aspect = card_w_mm / card_h_mm  # 1.5858
            best_candidate = None
            min_aspect_diff = 0.15  # Tolerance on card aspect ratio (within 10%)

            h_img, w_img = gray.shape[:2]
            min_card_area = (w_img * h_img) * 0.005  # At least 0.5% of total frame
            max_card_area = (w_img * h_img) * 0.35   # At most 35% of total frame (distinguishes reference card from packaging)

            for cnt in contours:
                peri = cv2.arcLength(cnt, True)
                approx = cv2.approxPolyDP(cnt, 0.025 * peri, True)
                if len(approx) == 4 and cv2.isContourConvex(approx):
                    area = cv2.contourArea(approx)
                    if min_card_area < area < max_card_area:
                        ordered = cls.order_corners(approx)

                        # Orthogonality check: interior angles must be approximately 90 deg (|cos| <= 0.35)
                        orthogonal = True
                        for i in range(4):
                            v1 = ordered[(i - 1) % 4] - ordered[i]
                            v2 = ordered[(i + 1) % 4] - ordered[i]
                            n1, n2 = np.linalg.norm(v1), np.linalg.norm(v2)
                            if n1 > 0 and n2 > 0:
                                if abs(float(np.dot(v1, v2) / (n1 * n2))) > 0.35:
                                    orthogonal = False
                                    break
                        if not orthogonal:
                            continue

                        w1 = np.linalg.norm(ordered[0] - ordered[1])
                        w2 = np.linalg.norm(ordered[2] - ordered[3])
                        h1 = np.linalg.norm(ordered[1] - ordered[2])
                        h2 = np.linalg.norm(ordered[3] - ordered[0])

                        avg_w = (w1 + w2) / 2.0
                        avg_h = (h1 + h2) / 2.0
                        if avg_h <= 1.0 or avg_w <= 1.0:
                            continue

                        long_side = max(avg_w, avg_h)
                        short_side = min(avg_w, avg_h)
                        aspect = long_side / short_side

                        aspect_diff = abs(aspect - target_aspect)
                        if aspect_diff < min_aspect_diff:
                            min_aspect_diff = aspect_diff
                            best_candidate = {
                                "corners": ordered,
                                "long_side_px": long_side,
                                "short_side_px": short_side,
                                "aspect_diff": aspect_diff,
                            }

            if best_candidate is None:
                return None

            ordered = best_candidate["corners"]
            px_to_mm = (
                (best_candidate["long_side_px"] / card_w_mm)
                + (best_candidate["short_side_px"] / card_h_mm)
            ) / 2.0

            # Scale sanity check: typical camera capture (30-60 cm) yields scale in [1.0, 35.0] px/mm
            if not (1.0 <= px_to_mm <= 35.0):
                return None

            margin_of_error_pct = float(best_candidate["aspect_diff"] / target_aspect * 100.0)
            # Secondary standard confidence is capped at 0.85-0.90 per metrology hierarchy
            confidence = max(0.0, min(0.90, 0.85 - (best_candidate["aspect_diff"] * 2.0)))

            xmin = int(np.floor(np.min(ordered[:, 0])))
            xmax = int(np.ceil(np.max(ordered[:, 0])))
            ymin = int(np.floor(np.min(ordered[:, 1])))
            ymax = int(np.ceil(np.max(ordered[:, 1])))

            return {
                "method": "ISO_7810_CARD",
                "px_to_mm": round(px_to_mm, 4),
                "confidence": round(confidence, 4),
                "corners": ordered,
                "reference_bounding_box": [ymin, xmin, ymax, xmax],
                "margin_of_error_pct": round(margin_of_error_pct, 2),
            }
        except Exception:
            return None

    @classmethod
    def compute_planar_homography(
        cls,
        src_corners: np.ndarray,
        physical_w_mm: float,
        physical_h_mm: float,
        px_to_mm: float,
    ) -> Tuple[np.ndarray, Tuple[int, int]]:
        """Computes 3x3 planar homography matrix H to rectify perspective distortion."""
        ordered_src = cls.order_corners(src_corners)

        target_w_px = int(round(physical_w_mm * px_to_mm))
        target_h_px = int(round(physical_h_mm * px_to_mm))

        # Orthogonal planar coordinates: [0, 0], [W, 0], [W, H], [0, H]
        dst_corners = np.array(
            [
                [0, 0],
                [target_w_px - 1, 0],
                [target_w_px - 1, target_h_px - 1],
                [0, target_h_px - 1],
            ],
            dtype=np.float32,
        )

        H = cv2.getPerspectiveTransform(ordered_src, dst_corners)
        return H, (target_w_px, target_h_px)

    @classmethod
    def rectify_image(
        cls, image: np.ndarray, H: np.ndarray, output_size: Tuple[int, int]
    ) -> np.ndarray:
        """Applies 3x3 homography matrix H to remove perspective distortion."""
        return cv2.warpPerspective(image, H, output_size, flags=cv2.INTER_LINEAR)

    @classmethod
    def estimate_pdp_geometry(
        cls,
        image: np.ndarray,
        px_to_mm: float,
        package_type: Literal["RECTANGULAR", "CYLINDRICAL", "FLEXIBLE_POUCH", "UNSPECIFIED"] = "RECTANGULAR",
    ) -> PDPGeometryDTO:
        """Calculates package outer surface area and Principal Display Panel (PDP) under LMPC Rule 2(h) & Rule 7.

        - RECTANGULAR: PDP is 40% of total surface area (height x width of front face).
        - CYLINDRICAL: PDP is 40% of height x circumference (0.40 * H * C).
        - FLEXIBLE_POUCH: PDP is 40% of front face area.
        """
        h_px, w_px = image.shape[:2]

        # Extract major packaging bounding contour
        if image.ndim == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image

        # Find packaging boundary via morphological edge closure
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        closed = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        box_ymin, box_xmin, box_ymax, box_xmax = 0, 0, h_px, w_px
        if contours:
            largest = max(contours, key=cv2.contourArea)
            if cv2.contourArea(largest) > (w_px * h_px * 0.10):
                x, y, w, h = cv2.boundingRect(largest)
                box_xmin, box_ymin, box_xmax, box_ymax = x, y, x + w, y + h

        # Physical dimensions in cm: (pixels / px_to_mm) / 10.0
        width_cm = float(((box_xmax - box_xmin) / px_to_mm) / 10.0) if px_to_mm > 0 else 10.0
        height_cm = float(((box_ymax - box_ymin) / px_to_mm) / 10.0) if px_to_mm > 0 else 10.0

        if package_type == "CYLINDRICAL":
            # Diameter D = width_cm, Circumference C = pi * D
            circumference_cm = np.pi * width_cm
            # Total curved surface = height * circumference
            total_surface_cm2 = float(height_cm * circumference_cm)
            # Rule 2(h)(ii) & Rule 7(1)(b): 40% of the product of height and circumference
            pdp_area_cm2 = float(0.40 * total_surface_cm2)
        elif package_type == "FLEXIBLE_POUCH":
            # Pouch has two primary display faces (front and back)
            front_face_cm2 = float(width_cm * height_cm)
            total_surface_cm2 = float(2.0 * front_face_cm2)
            # Rule 2(h)(iii) & Rule 7(1)(c): 40% of information-bearing face or 20% of total
            pdp_area_cm2 = float(0.40 * front_face_cm2)
        elif package_type == "UNSPECIFIED":
            front_face_cm2 = float(width_cm * height_cm)
            total_surface_cm2 = float(2.5 * front_face_cm2)
            pdp_area_cm2 = float(0.40 * front_face_cm2)
        else:
            # RECTANGULAR
            # Front face surface area = width * height
            front_face_cm2 = float(width_cm * height_cm)
            # Statutory Table-I / Rule 7 standard: 40% of packaging surface
            total_surface_cm2 = float(front_face_cm2 / 0.40)  # total package estimated area
            pdp_area_cm2 = front_face_cm2  # Rule 2(h)(i): PDP is the entire front side presenting information

        return PDPGeometryDTO(
            package_type=package_type,
            package_area_cm2=round(total_surface_cm2, 2),
            pdp_area_cm2=round(pdp_area_cm2, 2),
            pdp_area_percentage=40.0,
            bounding_box=[box_ymin, box_xmin, box_ymax, box_xmax],
        )

    @classmethod
    def pixels_to_mm(cls, pixels: float, px_to_mm: Optional[float], is_calibrated: bool = True) -> float:
        """Converts pixel measurement to physical millimeters.

        Args:
            pixels: Pixel distance or height.
            px_to_mm: Resolved scale factor in pixels per mm.
            is_calibrated: Whether frame was calibrated.

        Returns:
            float: Physical dimension in millimeters.

        Raises:
            ValueError: If frame is uncalibrated or px_to_mm is invalid.
        """
        if not is_calibrated or px_to_mm is None or px_to_mm <= 0.0:
            raise ValueError("Cannot derive millimeter measurement: frame is uncalibrated.")
        return float(pixels / px_to_mm)

    @classmethod
    def mm_to_pixels(cls, mm: float, px_to_mm: Optional[float], is_calibrated: bool = True) -> float:
        """Converts millimeter measurement to pixel dimension.

        Args:
            mm: Physical dimension in millimeters.
            px_to_mm: Resolved scale factor in pixels per mm.
            is_calibrated: Whether frame was calibrated.

        Returns:
            float: Coordinate span in pixels.

        Raises:
            ValueError: If frame is uncalibrated or px_to_mm is invalid.
        """
        if not is_calibrated or px_to_mm is None or px_to_mm <= 0.0:
            raise ValueError("Cannot derive pixel coordinate: frame is uncalibrated.")
        return float(mm * px_to_mm)

    @classmethod
    def calibrate(
        cls,
        image: np.ndarray,
        package_type: Literal["RECTANGULAR", "CYLINDRICAL", "FLEXIBLE_POUCH", "UNSPECIFIED"] = "RECTANGULAR",
    ) -> CalibrationResult:
        """Executes full metric calibration pipeline on an inspection frame.

        Tries ArUco 4x4_50 primary standard first; falls back to ISO 7810 ID-1 card if absent.
        Returns canonical CalibrationResult conforming to contracts/calibration/calibration_dto.py.
        """
        # 1. Primary detection: ArUco 4x4_50
        fiducial = cls.detect_aruco(image)

        # 2. Secondary fallback: ISO 7810 Card
        if fiducial is None:
            fiducial = cls.detect_iso_card(image)

        # 3. Handle unresolved state
        if fiducial is None:
            unresolved_calib = CalibrationDTO(
                method="UNRESOLVED",
                px_to_mm=1.0,  # Minimum sentinel > 0.0 required by frozen CalibrationDTO Pydantic schema
                confidence=0.0,
                reference_bounding_box=[0, 0, 0, 0],
                margin_of_error_pct=None,
            )
            # Safe default PDP sentinel
            h, w = image.shape[:2]
            pdp = PDPGeometryDTO(
                package_type=package_type,
                package_area_cm2=1.0,  # Sentinel value > 0.0 required by frozen PDPGeometryDTO
                pdp_area_cm2=1.0,
                pdp_area_percentage=40.0,
                bounding_box=[0, 0, h, w],
            )
            return CalibrationResult(
                is_calibrated=False,
                calibration=unresolved_calib,
                principal_display_panel=pdp,
                homography_matrix=None,
            )

        # 4. Compute homography matrix H from detected fiducial corners
        px_to_mm = fiducial["px_to_mm"]
        if fiducial["method"] == "ARUCO_4X4_50":
            phys_w = cls.ARUCO_SIZE_MM
            phys_h = cls.ARUCO_SIZE_MM
        else:
            phys_w = cls.ISO_CARD_WIDTH_MM
            phys_h = cls.ISO_CARD_HEIGHT_MM

        H, _ = cls.compute_planar_homography(
            fiducial["corners"], phys_w, phys_h, px_to_mm
        )
        h_matrix_list = H.tolist()

        calib_dto = CalibrationDTO(
            method=fiducial["method"],
            px_to_mm=px_to_mm,
            confidence=fiducial["confidence"],
            reference_bounding_box=fiducial["reference_bounding_box"],
            margin_of_error_pct=fiducial.get("margin_of_error_pct"),
        )

        # 5. Estimate Principal Display Panel area
        pdp_dto = cls.estimate_pdp_geometry(image, px_to_mm, package_type)

        return CalibrationResult(
            is_calibrated=True,
            calibration=calib_dto,
            principal_display_panel=pdp_dto,
            homography_matrix=h_matrix_list,
        )
