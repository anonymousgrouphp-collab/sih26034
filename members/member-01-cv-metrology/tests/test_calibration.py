"""Comprehensive Unit Tests for Member 1 Calibration & Metrology Engine (SIH26034)
Tests ArUco 4x4 detection, ISO card fallback, homography rectification, scale derivation, and PDP geometry.
"""

from pathlib import Path
import sys
import cv2
import numpy as np
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from calibration import CalibrationEngine
from contracts.calibration.calibration_dto import CalibrationResult, CalibrationDTO, PDPGeometryDTO

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


# ============================================================================
# 1. ARUCO FIDUCIAL DETECTION & SCALE TESTS
# ============================================================================

def test_aruco_detection_on_fixture():
    fixture_path = FIXTURES_DIR / "fixture_calibration_aruco.png"
    assert fixture_path.is_file(), "ArUco calibration fixture must exist"

    img = cv2.imread(str(fixture_path))
    result = CalibrationEngine.calibrate(img, package_type="RECTANGULAR")

    assert result.is_calibrated is True
    assert result.calibration.method == "ARUCO_4X4_50"
    # Ground truth marker was generated at 250px for 50.0mm -> exactly 5.0 px/mm
    assert pytest.approx(result.calibration.px_to_mm, abs=0.15) == 5.0
    assert result.calibration.confidence >= 0.90
    assert len(result.calibration.reference_bounding_box) == 4
    assert result.homography_matrix is not None
    assert len(result.homography_matrix) == 3
    assert len(result.homography_matrix[0]) == 3


def test_aruco_scale_accuracy_synthetic():
    # Generate 50.0 mm marker at exactly 8.0 px/mm -> side = 400 pixels
    side_px = 400
    dictionary = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker = cv2.aruco.generateImageMarker(dictionary, 7, side_px)
    padded = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

    fiducial = CalibrationEngine.detect_aruco(padded, marker_size_mm=50.0)
    assert fiducial is not None
    assert fiducial["method"] == "ARUCO_4X4_50"
    # Target scale = 400 / 50 = 8.0 px/mm
    assert pytest.approx(fiducial["px_to_mm"], abs=0.05) == 8.0


# ============================================================================
# 2. ISO 7810 ID-1 CARD FALLBACK TESTS
# ============================================================================

def test_iso_card_fallback_on_fixture():
    fixture_path = FIXTURES_DIR / "fixture_calibration_iso_card.png"
    assert fixture_path.is_file(), "ISO card calibration fixture must exist"

    img = cv2.imread(str(fixture_path))
    result = CalibrationEngine.calibrate(img, package_type="RECTANGULAR")

    assert result.is_calibrated is True
    assert result.calibration.method == "ISO_7810_CARD"
    # Ground truth card was drawn with width 342px for 85.60mm -> ~4.0 px/mm
    assert pytest.approx(result.calibration.px_to_mm, abs=0.3) == 4.0
    assert result.calibration.confidence >= 0.80
    assert result.homography_matrix is not None


def test_iso_card_synthetic_detection():
    # Create canvas with card of dimensions 428 x 270 (85.60 x 53.98 at 5.0 px/mm)
    canvas = np.full((600, 800), 200, dtype=np.uint8)
    cv2.rectangle(canvas, (100, 100), (528, 370), 255, -1)
    cv2.rectangle(canvas, (100, 100), (528, 370), 40, 3)

    fiducial = CalibrationEngine.detect_iso_card(canvas)
    assert fiducial is not None
    assert fiducial["method"] == "ISO_7810_CARD"
    assert pytest.approx(fiducial["px_to_mm"], abs=0.1) == 5.0


# ============================================================================
# 3. UNRESOLVED CALIBRATION STATE TESTS
# ============================================================================

def test_unresolved_calibration_when_no_markers():
    # Plain packaging image with no ArUco marker and no ISO card
    plain_img = np.full((500, 500, 3), 220, dtype=np.uint8)
    cv2.putText(plain_img, "PLAIN PACKAGING WITHOUT MARKER", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)

    result = CalibrationEngine.calibrate(plain_img)
    assert result.is_calibrated is False
    assert result.calibration.method == "UNRESOLVED"
    assert result.calibration.confidence == 0.0
    assert result.homography_matrix is None
    assert result.principal_display_panel is not None


# ============================================================================
# 4. HOMOGRAPHY PERSPECTIVE RECTIFICATION TESTS
# ============================================================================

def test_homography_perspective_rectification():
    # Create a 200x200 square tilted into a trapezoid
    src_corners = np.array([
        [50, 40],
        [240, 20],
        [270, 260],
        [20, 230],
    ], dtype=np.float32)

    H, (out_w, out_h) = CalibrationEngine.compute_planar_homography(
        src_corners, physical_w_mm=50.0, physical_h_mm=50.0, px_to_mm=4.0
    )
    assert H.shape == (3, 3)
    assert out_w == 200
    assert out_h == 200

    # Test warping an image
    test_img = np.full((300, 300, 3), 100, dtype=np.uint8)
    rectified = CalibrationEngine.rectify_image(test_img, H, (out_w, out_h))
    assert rectified.shape == (200, 200, 3)


# ============================================================================
# 5. PACKAGING GEOMETRY & PDP TESTS
# ============================================================================

def test_rectangular_pdp_calculation():
    # Create an image representing a 1000px x 800px box at 10.0 px/mm
    # Width = 100 mm = 10 cm, Height = 80 mm = 8 cm
    # Front face area = 10 * 8 = 80 cm²
    test_img = np.full((1000, 1200, 3), 240, dtype=np.uint8)
    cv2.rectangle(test_img, (100, 100), (1100, 900), (50, 50, 50), -1)

    pdp = CalibrationEngine.estimate_pdp_geometry(test_img, px_to_mm=10.0, package_type="RECTANGULAR")
    assert pdp.package_type == "RECTANGULAR"
    assert pdp.pdp_area_percentage == 40.0
    assert pytest.approx(pdp.pdp_area_cm2, abs=5.0) == 80.0
    assert pytest.approx(pdp.package_area_cm2, abs=15.0) == 200.0


def test_cylindrical_pdp_calculation():
    # Cylinder: diameter 60 mm (6 cm), height 120 mm (12 cm) at 10.0 px/mm
    # Width px = 600, Height px = 1200
    # Circumference = pi * 6 cm = 18.85 cm
    # Surface area = 12 cm * 18.85 cm = 226.19 cm²
    # PDP = 40% of 226.19 = 90.48 cm²
    test_img = np.full((1400, 800, 3), 240, dtype=np.uint8)
    cv2.rectangle(test_img, (100, 100), (700, 1300), (80, 80, 80), -1)

    pdp = CalibrationEngine.estimate_pdp_geometry(test_img, px_to_mm=10.0, package_type="CYLINDRICAL")
    assert pdp.package_type == "CYLINDRICAL"
    assert pdp.pdp_area_percentage == 40.0
    assert pytest.approx(pdp.package_area_cm2, abs=10.0) == 226.19
    assert pytest.approx(pdp.pdp_area_cm2, abs=5.0) == 90.48


# ============================================================================
# 6. CONTRACT DTO VALIDATION TESTS
# ============================================================================

def test_calibration_result_schema_validates():
    fixture_path = FIXTURES_DIR / "fixture_calibration_aruco.png"
    img = cv2.imread(str(fixture_path))
    result = CalibrationEngine.calibrate(img)

    # Validate that it is a valid CalibrationResult Pydantic model
    assert isinstance(result, CalibrationResult)
    data = result.model_dump()
    assert "is_calibrated" in data
    assert "calibration" in data
    assert "principal_display_panel" in data
    assert data["calibration"]["method"] in ("ARUCO_4X4_50", "ISO_7810_CARD")


# ============================================================================
# 7. HARDENED POST-AUDIT VALIDATION TESTS
# ============================================================================

def test_flexible_pouch_pdp_calculation():
    """Validates statutory 40% rule for flexible pouches under LMPC Rule 2(h)(iii) & Rule 7(1)(c)."""
    # 1000px x 800px pouch at 10.0 px/mm -> W = 10cm, H = 8cm -> Front face = 80 cm²
    # Pouch PDP = 40% of front face = 32 cm², Total surface = 2 * 80 = 160 cm²
    test_img = np.full((1000, 1200, 3), 240, dtype=np.uint8)
    cv2.rectangle(test_img, (100, 100), (1100, 900), (50, 50, 50), -1)

    pdp = CalibrationEngine.estimate_pdp_geometry(test_img, px_to_mm=10.0, package_type="FLEXIBLE_POUCH")
    assert pdp.package_type == "FLEXIBLE_POUCH"
    assert pdp.pdp_area_percentage == 40.0
    assert pytest.approx(pdp.pdp_area_cm2, abs=2.0) == 32.0
    assert pytest.approx(pdp.package_area_cm2, abs=5.0) == 160.0


def test_unspecified_geometry_pdp_calculation():
    """Validates statutory 40% rule for unspecified container shapes under Rule 7(1)(c)."""
    test_img = np.full((1000, 1200, 3), 240, dtype=np.uint8)
    cv2.rectangle(test_img, (100, 100), (1100, 900), (50, 50, 50), -1)

    pdp = CalibrationEngine.estimate_pdp_geometry(test_img, px_to_mm=10.0, package_type="UNSPECIFIED")
    assert pdp.package_type == "UNSPECIFIED"
    assert pytest.approx(pdp.pdp_area_cm2, abs=2.0) == 32.0
    assert pytest.approx(pdp.package_area_cm2, abs=10.0) == 200.0


def test_scale_direction_helpers():
    """Verifies that pixels_to_mm and mm_to_pixels enforce correct mathematical conversion."""
    scale = 5.0  # 5 px per mm
    # 50 pixels at 5 px/mm -> 10.0 mm
    mm_val = CalibrationEngine.pixels_to_mm(50.0, px_to_mm=scale, is_calibrated=True)
    assert pytest.approx(mm_val, abs=1e-5) == 10.0

    # 10.0 mm at 5 px/mm -> 50.0 pixels
    px_val = CalibrationEngine.mm_to_pixels(10.0, px_to_mm=scale, is_calibrated=True)
    assert pytest.approx(px_val, abs=1e-5) == 50.0


def test_uncalibrated_scale_raises_on_conversion():
    """Ensures that attempting metric conversion on uncalibrated frames raises ValueError."""
    with pytest.raises(ValueError, match="frame is uncalibrated"):
        CalibrationEngine.pixels_to_mm(50.0, px_to_mm=10.0, is_calibrated=False)

    with pytest.raises(ValueError, match="frame is uncalibrated"):
        CalibrationEngine.mm_to_pixels(10.0, px_to_mm=None, is_calibrated=True)


def test_uncalibrated_pipeline_output_properties_are_none():
    """Ensures that CVPipelineOutput properties return None rather than fake metric measurements when uncalibrated."""
    from pipeline_cv import Member1CVPipeline
    blank = np.full((500, 500, 3), 200, dtype=np.uint8)
    output = Member1CVPipeline.process_frame(blank)

    assert output.is_calibrated is False
    assert output.px_to_mm is None
    assert output.pdp_area_cm2 is None


def test_aruco_geometric_tilt_estimation():
    """Tests that ArUco marker detection accurately estimates geometric tilt angle from square foreshortening."""
    dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
    marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 300)
    canvas = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

    # 0 deg tilt on flat canvas
    fid_flat = CalibrationEngine.detect_aruco(canvas)
    assert fid_flat is not None
    assert "tilt_angle_deg" in fid_flat
    assert fid_flat["tilt_angle_deg"] <= 3.0

    # Warp with ~10 deg perspective tilt
    h, w = canvas.shape[:2]
    offset = 12
    src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
    dst = np.float32([[offset, 0], [w - offset, offset], [w - offset, h - offset], [offset, h]])
    M = cv2.getPerspectiveTransform(src, dst)
    warped = cv2.warpPerspective(canvas, M, (w, h), borderValue=255)

    fid_tilted = CalibrationEngine.detect_aruco(warped)
    assert fid_tilted is not None
    assert fid_tilted["tilt_angle_deg"] > 3.0


def test_iso_card_rejection_of_non_orthogonal_quad():
    """Ensures that skewed/irregular quadrilaterals (trapezoids) are rejected by orthogonality checks."""
    img = np.full((1000, 1000, 3), 240, dtype=np.uint8)
    # Draw a non-orthogonal polygon (trapezoid with top edge 100px, bottom edge 300px)
    trapezoid = np.array([[450, 200], [550, 200], [650, 400], [350, 400]], dtype=np.int32)
    cv2.fillPoly(img, [trapezoid], (20, 20, 20))

    result = CalibrationEngine.detect_iso_card(img)
    # Must be rejected because interior angles diverge severely from 90 deg
    assert result is None


def test_iso_card_rejection_of_absurd_scale():
    """Ensures that an object with impossible scale (< 1.0 or > 35.0 px/mm) is rejected."""
    # A tiny quad 10px wide would give ~0.1 px/mm, which must be rejected
    img = np.full((1000, 1000, 3), 240, dtype=np.uint8)
    tiny_box = np.array([[100, 100], [116, 100], [116, 110], [100, 110]], dtype=np.int32)
    cv2.fillPoly(img, [tiny_box], (20, 20, 20))

    result = CalibrationEngine.detect_iso_card(img)
    assert result is None
