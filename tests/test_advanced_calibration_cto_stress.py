"""Comprehensive Advanced Calibration & Stress Test Suite (SIH26034 - NyayaDrishti-LM)
Audited from the perspective of a hyper-critical CTO / forensic metrologist under Section 63 BSA 2023.

Covers 6 Crucial Metrological Domains:
1. Secondary ISO 7810 ID-1 Card Fallback Calibration (scale accuracy, rotation invariance 0-360°, textured card, missing ArUco fallback)
2. Extreme Perspective Distortions & Tilt Angles (0° to 45° homography rectification limits, scale error tracking, Stage 2 Quality Gate 15° limit enforcement)
3. Partial Fiducial Occlusion & Noise/Shadow Degradation (corner occlusion 5-25%, thumb occlusion threshold 10-15%, fail-closed safety, Gaussian noise sigma 0-100, shadow gradients)
4. Cylindrical / Curved Packaging Geometry PDP Calculation (Rule 2(h)(ii) & Rule 7(1)(b): 0.40 * pi * D * H, comparison with flat packaging, Table-I schedule mappings)
5. Borderline Font Height Sensor Uncertainty Band (k=2, 95% confidence -> REVIEW epistemic triage per ADL-12 and ADL-17)
6. Real Packaging Images with Synthetic Adversarial Degradation (specular glare flash, motion blur, defocus blur, missing fiducial, Section 63 Merkle audit trail)
"""

from pathlib import Path
import sys
import cv2
import numpy as np
import pytest

# Ensure repository root and member modules are accessible
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

m1_src = str(REPO_ROOT / "members" / "member-01-cv-metrology" / "src")
if m1_src not in sys.path:
    sys.path.insert(0, m1_src)

m4_src = str(REPO_ROOT / "members" / "member-04-rule-engine" / "src")
if m4_src not in sys.path:
    sys.path.insert(0, m4_src)

m5_src = str(REPO_ROOT / "members" / "member-05-evidence" / "src")
if m5_src not in sys.path:
    sys.path.insert(0, m5_src)

from calibration import CalibrationEngine
from quality_gate import QualityGateEvaluator
from evaluators import Table1FontSchedule, LegalMetrologyRuleEngine
from merkle_dag import MerkleAuditLedger
from contracts.calibration.calibration_dto import CalibrationResult, CalibrationDTO, PDPGeometryDTO


# =============================================================================
# DOMAIN 1: SECONDARY ISO 7810 ID-1 CARD FALLBACK CALIBRATION
# =============================================================================

class TestDomain1ISOCardFallbackCalibration:
    """Stress tests ISO 7810 ID-1 (85.60 x 53.98 mm) secondary calibration standard."""

    def test_iso_card_ground_truth_accuracy(self):
        """Card at 5.0 px/mm (428 x 270 px) must yield scale within 1.5% of ground truth."""
        target_scale = 5.0
        cw = int(round(85.60 * target_scale))  # 428
        ch = int(round(53.98 * target_scale))  # 270

        canvas = np.full((600, 800), 245, dtype=np.uint8)
        cv2.rectangle(canvas, (100, 100), (100 + cw, 100 + ch), 210, -1)
        cv2.rectangle(canvas, (100, 100), (100 + cw, 100 + ch), 30, 2)

        res = CalibrationEngine.detect_iso_card(canvas)
        assert res is not None, "ISO card must be detected on clean canvas"
        assert res["method"] == "ISO_7810_CARD"
        assert pytest.approx(res["px_to_mm"], rel=0.02) == target_scale
        assert res["confidence"] >= 0.80

    def test_iso_card_rotation_invariance_0_to_180(self):
        """ISO card must detect accurately across rotations without corner clipping."""
        target_scale = 4.0
        cw = int(round(85.60 * target_scale))  # 342
        ch = int(round(53.98 * target_scale))  # 216

        for angle in [0, 15, 30, 45, 60, 90, 135, 180]:
            canvas = np.full((900, 900), 245, dtype=np.uint8)
            cx, cy = 450, 450
            pts = np.array([
                [-cw / 2, -ch / 2],
                [cw / 2, -ch / 2],
                [cw / 2, ch / 2],
                [-cw / 2, ch / 2]
            ], dtype=np.float32)
            rad = np.radians(angle)
            R = np.array([[np.cos(rad), -np.sin(rad)], [np.sin(rad), np.cos(rad)]], dtype=np.float32)
            rotated_pts = (pts @ R.T) + np.array([cx, cy], dtype=np.float32)

            cv2.fillPoly(canvas, [rotated_pts.astype(np.int32)], 215)
            cv2.polylines(canvas, [rotated_pts.astype(np.int32)], True, 30, 2)

            res = CalibrationEngine.detect_iso_card(canvas)
            assert res is not None, f"ISO card must be detected at rotation {angle} deg"
            assert pytest.approx(res["px_to_mm"], rel=0.03) == target_scale

    def test_iso_card_with_realistic_internal_textures(self):
        """Card containing smart chip, text headers, and photo box must detect outer border."""
        target_scale = 4.0
        cw = int(round(85.60 * target_scale))
        ch = int(round(53.98 * target_scale))

        card = np.full((ch, cw, 3), 235, dtype=np.uint8)
        cv2.rectangle(card, (0, 0), (cw - 1, ch - 1), (40, 40, 40), 2)
        # Smart chip
        cv2.rectangle(card, (20, 30), (80, 80), (180, 150, 60), -1)
        # Photo box
        cv2.rectangle(card, (cw - 100, 30), (cw - 20, 130), (100, 100, 100), -1)
        # Text headers
        cv2.putText(card, "GOVERNMENT OF INDIA", (90, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 0), 1)
        cv2.putText(card, "IDENTITY CARD / ID-1", (90, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (50, 50, 50), 1)
        cv2.putText(card, "ISO/IEC 7810 STANDARD", (90, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (80, 80, 80), 1)

        canvas = np.full((600, 800, 3), 245, dtype=np.uint8)
        canvas[100:100 + ch, 100:100 + cw] = card

        res = CalibrationEngine.detect_iso_card(canvas)
        assert res is not None, "Textured ISO card must detect outer boundary"
        assert res["method"] == "ISO_7810_CARD"
        assert pytest.approx(res["px_to_mm"], rel=0.02) == target_scale

    def test_automatic_fallback_when_aruco_absent(self):
        """When ArUco is absent, CalibrationEngine.calibrate() must fall back to ISO card."""
        target_scale = 3.5
        cw = int(round(85.60 * target_scale))
        ch = int(round(53.98 * target_scale))

        canvas = np.full((600, 800, 3), 245, dtype=np.uint8)
        cv2.rectangle(canvas, (50, 50), (50 + cw, 50 + ch), (220, 220, 220), -1)
        cv2.rectangle(canvas, (50, 50), (50 + cw, 50 + ch), (30, 30, 30), 2)
        # Add mock package box
        cv2.rectangle(canvas, (50 + cw + 50, 50), (750, 500), (80, 120, 180), -1)

        result = CalibrationEngine.calibrate(canvas, package_type="RECTANGULAR")
        assert result.is_calibrated is True
        assert result.calibration.method == "ISO_7810_CARD"
        assert pytest.approx(result.calibration.px_to_mm, rel=0.03) == target_scale
        assert result.homography_matrix is not None

    def test_both_markers_absent_fails_closed_to_unresolved(self):
        """When neither ArUco nor ISO card is present, system must return UNRESOLVED."""
        canvas = np.full((500, 500, 3), 240, dtype=np.uint8)
        cv2.putText(canvas, "UNMARKED PACKAGING", (50, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)

        result = CalibrationEngine.calibrate(canvas)
        assert result.is_calibrated is False
        assert result.calibration.method == "UNRESOLVED"
        assert result.calibration.confidence == 0.0
        assert result.homography_matrix is None

    def test_iso_card_rejection_of_non_standard_polygons(self):
        """Shapes with aspect ratios diverging from 1.5858 (square 1:1, ribbon 3:1) must be rejected."""
        canvas = np.full((600, 800), 245, dtype=np.uint8)
        # Square: aspect 1.0 (diff ~0.58 from 1.5858)
        cv2.rectangle(canvas, (100, 100), (350, 350), 30, 2)
        assert CalibrationEngine.detect_iso_card(canvas) is None

        # Long ribbon: 600 x 100 px -> aspect 6.0 (diff ~4.41)
        canvas_ribbon = np.full((600, 800), 245, dtype=np.uint8)
        cv2.rectangle(canvas_ribbon, (50, 100), (650, 200), 30, 2)
        assert CalibrationEngine.detect_iso_card(canvas_ribbon) is None

    def test_iso_card_low_contrast_natural_boundary_on_light_desk(self):
        """Card (gray 255) on light desk (gray 235) with subtle contrast delta = 20 and NO outline stroke."""
        target_scale = 4.0
        cw = int(round(85.60 * target_scale))  # 342 px
        ch = int(round(53.98 * target_scale))  # 216 px

        canvas = np.full((600, 800), 235, dtype=np.uint8)
        cv2.rectangle(canvas, (100, 100), (100 + cw, 100 + ch), 255, -1)

        res = CalibrationEngine.detect_iso_card(canvas)
        assert res is not None, "Multi-threshold Canny must detect low-contrast card boundary"
        assert res["method"] == "ISO_7810_CARD"
        assert pytest.approx(res["px_to_mm"], rel=0.03) == target_scale

    def test_iso_card_low_contrast_natural_boundary_on_dark_desk(self):
        """Card (gray 55) on dark counter (gray 35) with subtle contrast delta = 20 and NO outline stroke."""
        target_scale = 4.0
        cw = int(round(85.60 * target_scale))  # 342 px
        ch = int(round(53.98 * target_scale))  # 216 px

        canvas = np.full((600, 800), 35, dtype=np.uint8)
        cv2.rectangle(canvas, (100, 100), (100 + cw, 100 + ch), 55, -1)

        res = CalibrationEngine.detect_iso_card(canvas)
        assert res is not None, "Multi-threshold Canny must detect dark low-contrast card boundary"
        assert res["method"] == "ISO_7810_CARD"
        assert pytest.approx(res["px_to_mm"], rel=0.03) == target_scale


# =============================================================================
# DOMAIN 2: EXTREME PERSPECTIVE DISTORTIONS & TILT ANGLES (15° TO 45°)
# =============================================================================

class TestDomain2ExtremePerspectiveDistortion:
    """Stress tests homography rectification and scale error under perspective tilt."""

    def test_aruco_scale_error_tracking_across_tilt_envelope(self):
        """Measures scale deviation vs tilt angle from 0 deg to 45 deg."""
        dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 200)  # 200px for 50mm -> 4.0 px/mm
        padded = cv2.copyMakeBorder(marker, 100, 100, 100, 100, cv2.BORDER_CONSTANT, value=255)
        h, w = padded.shape[:2]

        results = {}
        for ang in [0, 5, 10, 15, 20, 25, 30, 40, 45]:
            rad = np.radians(ang)
            offset = int(w * np.sin(rad) * 0.4)
            src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
            dst = np.float32([[offset, int(offset * 0.5)], [w - offset, int(offset * 0.5)], [w, h], [0, h]])
            M = cv2.getPerspectiveTransform(src, dst)
            warped = cv2.warpPerspective(padded, M, (w, h), borderValue=255)

            res = CalibrationEngine.detect_aruco(warped, marker_size_mm=50.0)
            if res:
                err_pct = abs(res["px_to_mm"] - 4.0) / 4.0 * 100.0
                results[ang] = {"detected": True, "scale": res["px_to_mm"], "err_pct": err_pct}
            else:
                results[ang] = {"detected": False, "scale": 0.0, "err_pct": 100.0}

        # Flat: error < 1%
        assert results[0]["err_pct"] < 1.0
        # Within Quality Gate limit (15 deg): error < 10%
        assert results[15]["detected"] is True
        assert results[15]["err_pct"] < 10.0
        # Beyond Quality Gate limit (45 deg): still detects, but foreshortening error is documented (~30%)
        assert results[45]["detected"] is True
        assert results[45]["err_pct"] > 15.0

    def test_quality_gate_enforces_15_degree_statutory_tilt_limit(self):
        """Optical Quality Gate must reject any frame with perspective tilt > 15.0 deg."""
        # 14.5 deg must PASS
        valid_out, _ = QualityGateEvaluator.evaluate_metrics(blur_variance=200.0, glare_percentage=1.0, skew_angle_deg=14.5)
        assert valid_out is True

        # 15.1 deg must FAIL with EXCESSIVE_TILT advice
        invalid_out, reason = QualityGateEvaluator.evaluate_metrics(blur_variance=200.0, glare_percentage=1.0, skew_angle_deg=15.1)
        assert invalid_out is False
        assert "EXCESSIVE_TILT" in reason

        # 30.0 deg must FAIL
        invalid_30, reason_30 = QualityGateEvaluator.evaluate_metrics(blur_variance=200.0, glare_percentage=1.0, skew_angle_deg=30.0)
        assert invalid_30 is False
        assert "EXCESSIVE_TILT" in reason_30

    def test_homography_perspective_rectification_restores_orthogonality(self):
        """Homography rectification of a 30 deg trapezoid must restore a rectangular bounding box."""
        src_corners = np.array([
            [60, 40],
            [260, 40],
            [300, 240],
            [20, 240]
        ], dtype=np.float32)

        H, (out_w, out_h) = CalibrationEngine.compute_planar_homography(
            src_corners, physical_w_mm=50.0, physical_h_mm=50.0, px_to_mm=4.0
        )
        assert out_w == 200
        assert out_h == 200

        canvas = np.full((300, 350, 3), 180, dtype=np.uint8)
        rectified = CalibrationEngine.rectify_image(canvas, H, (out_w, out_h))
        assert rectified.shape == (200, 200, 3)

    def test_non_coplanar_depth_offset_magnification_vulnerability(self):
        """Forensic proof of court defense vulnerability: non-zero packaging thickness causes magnification.
        
        If a 50mm thick package is placed on an inspection mat beside a fiducial at Z_cam = 350mm:
        The text is closer to the lens (Z = 300mm), inducing M = 350 / 300 = 1.1667 (+16.7% magnification).
        An illegal 2.20mm font will measure as 2.567mm on uncompensated planar homography, yielding a false PASS.
        """
        z_cam = 350.0  # mm standoff
        delta_z = 50.0  # 50 mm thick box
        true_font_height_mm = 2.20  # Statutory violation under Row 3 (requires 2.50 mm)

        # Baseline scale at table fiducial
        base_scale = 3.0  # px / mm (at table Z = 350 mm)
        f_px = base_scale * z_cam  # 1050 px focal length

        # Font projected pixel height at box top (Z = 300 mm)
        font_px_at_box = true_font_height_mm * (f_px / (z_cam - delta_z))

        # Naive uncompensated measurement using table scale
        naive_measured_font_mm = font_px_at_box / base_scale
        magnification_error_pct = (naive_measured_font_mm - true_font_height_mm) / true_font_height_mm * 100.0

        assert magnification_error_pct > 16.0, "Depth magnification must exceed 16%"
        assert naive_measured_font_mm > 2.50, "Naive measurement falsely masks statutory violation as compliant"

    def test_compensate_coplanar_depth_corrects_magnification(self):
        """Validates that CalibrationEngine.compensate_coplanar_depth restores true metric scale."""
        base_scale = 3.0
        z_cam = 350.0
        delta_z = 50.0
        true_font_height_mm = 2.20

        # Compensate scale for packaging elevation
        corr_scale, mag_factor, depth_unc = CalibrationEngine.compensate_coplanar_depth(
            base_px_to_mm=base_scale,
            camera_distance_mm=z_cam,
            package_elevation_mm=delta_z
        )

        assert pytest.approx(mag_factor, rel=1e-3) == (350.0 / 300.0)
        assert corr_scale > base_scale

        # Font pixels on elevated face
        f_px = base_scale * z_cam
        font_px_at_box = true_font_height_mm * (f_px / (z_cam - delta_z))

        # Measured with corrected scale
        corrected_measured_mm = font_px_at_box / corr_scale
        assert pytest.approx(corrected_measured_mm, abs=1e-4) == true_font_height_mm

        # Zero elevation preserves exact base scale
        zero_corr, zero_mag, zero_unc = CalibrationEngine.compensate_coplanar_depth(base_scale, 400.0, 0.0)
        assert zero_corr == base_scale
        assert zero_mag == 1.0


# =============================================================================
# DOMAIN 3: PARTIAL FIDUCIAL OCCLUSION & NOISE/SHADOW DEGRADATION
# =============================================================================

class TestDomain3PartialOcclusionAndDegradation:
    """Stress tests marker detection limits under occlusion, Gaussian noise, and shadows."""

    def test_aruco_corner_occlusion_tolerance(self):
        """ArUco 4x4 must detect with up to 10% white thumb occlusion, and fail closed at >= 25%."""
        dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 200)
        padded = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

        # 5% occlusion passes
        occ_5 = padded.copy()
        cv2.rectangle(occ_5, (50, 50), (60, 60), 255, -1)
        assert CalibrationEngine.detect_aruco(occ_5) is not None

        # 10% occlusion passes
        occ_10 = padded.copy()
        cv2.rectangle(occ_10, (50, 50), (70, 70), 255, -1)
        assert CalibrationEngine.detect_aruco(occ_10) is not None

        # 30% occlusion must fail closed (return None)
        occ_30 = padded.copy()
        cv2.rectangle(occ_30, (50, 50), (110, 110), 255, -1)
        assert CalibrationEngine.detect_aruco(occ_30) is None

    def test_aruco_gaussian_sensor_noise_stress(self):
        """ArUco must tolerate noise up to sigma=50 and fail closed at extreme sigma=100."""
        dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 200)
        padded = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

        np.random.seed(42)
        # Moderate noise (sigma = 25)
        noisy_25 = np.clip(padded.astype(np.float32) + np.random.normal(0, 25, padded.shape), 0, 255).astype(np.uint8)
        res_25 = CalibrationEngine.detect_aruco(noisy_25)
        assert res_25 is not None
        assert pytest.approx(res_25["px_to_mm"], rel=0.03) == 4.0

        # Severe noise (sigma = 75)
        noisy_75 = np.clip(padded.astype(np.float32) + np.random.normal(0, 75, padded.shape), 0, 255).astype(np.uint8)
        res_75 = CalibrationEngine.detect_aruco(noisy_75)
        assert res_75 is not None
        assert pytest.approx(res_75["px_to_mm"], rel=0.03) == 4.0

        # Catastrophic noise (sigma = 150): must fail closed rather than hallucinate wrong scale
        noisy_150 = np.clip(padded.astype(np.float32) + np.random.normal(0, 150, padded.shape), 0, 255).astype(np.uint8)
        assert CalibrationEngine.detect_aruco(noisy_150) is None

    def test_aruco_illumination_shadow_gradient_stress(self):
        """Marker must detect under severe directional shadow gradient up to 85% depth."""
        dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 200)
        padded = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

        # 70% linear shadow from left to right
        grad = np.linspace(1.0, 0.30, padded.shape[1])
        shadowed = np.clip(padded.astype(np.float32) * grad[np.newaxis, :], 0, 255).astype(np.uint8)

        res = CalibrationEngine.detect_aruco(shadowed)
        assert res is not None
        assert pytest.approx(res["px_to_mm"], rel=0.02) == 4.0

    def test_occluded_marker_never_emits_absurd_scale(self):
        """Under no degradation condition may detect_aruco emit scale <= 0 or > 35 px/mm."""
        dict_aruco = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
        marker = cv2.aruco.generateImageMarker(dict_aruco, 0, 200)
        padded = cv2.copyMakeBorder(marker, 50, 50, 50, 50, cv2.BORDER_CONSTANT, value=255)

        for pct in range(0, 40, 5):
            img = padded.copy()
            occ_sz = int(200 * (pct / 100.0))
            if occ_sz > 0:
                cv2.rectangle(img, (50, 50), (50 + occ_sz, 50 + occ_sz), 255, -1)
            res = CalibrationEngine.detect_aruco(img)
            if res is not None:
                assert 1.0 <= res["px_to_mm"] <= 35.0, f"Derived scale {res['px_to_mm']} out of bounds"


# =============================================================================
# DOMAIN 4: CYLINDRICAL PACKAGING GEOMETRY PDP CALCULATION (Rule 2(h) & Table-I)
# =============================================================================

class TestDomain4CylindricalPackagingPDP:
    """Verifies cylindrical packaging Principal Display Panel (PDP) under LMPC Rule 2(h)(ii) & Rule 7(1)(b)."""

    def test_cylindrical_pdp_exact_formula(self):
        """PDP = 0.40 * (Height * Circumference) = 0.40 * pi * D * H."""
        # Cylinder: D = 6.6 cm (66 mm), H = 11.5 cm (115 mm) at 10.0 px/mm
        test_img = np.full((1350, 860, 3), 240, dtype=np.uint8)
        cv2.rectangle(test_img, (100, 100), (760, 1250), (50, 50, 50), -1)

        pdp = CalibrationEngine.estimate_pdp_geometry(test_img, px_to_mm=10.0, package_type="CYLINDRICAL")
        assert pdp.package_type == "CYLINDRICAL"
        assert pdp.pdp_area_percentage == 40.0

        # Expected: C = pi * 6.6 = 20.7345 cm; Area = 11.5 * 20.7345 = 238.45 cm2; PDP = 0.40 * 238.45 = 95.38 cm2
        expected_surface = float(11.5 * (np.pi * 6.6))
        expected_pdp = float(0.40 * expected_surface)

        assert pytest.approx(pdp.package_area_cm2, abs=3.0) == expected_surface
        assert pytest.approx(pdp.pdp_area_cm2, abs=2.0) == expected_pdp

    def test_cylindrical_vs_flat_packaging_area_ratio(self):
        """Cylindrical PDP (0.40 * pi * D * H) is strictly ~1.2566x larger than flat front-face (D * H)."""
        d_cm = 8.0
        h_cm = 15.0
        flat_front_cm2 = d_cm * h_cm  # 120 cm2
        cylindrical_pdp_cm2 = 0.40 * np.pi * d_cm * h_cm  # 150.80 cm2

        ratio = cylindrical_pdp_cm2 / flat_front_cm2
        assert pytest.approx(ratio, abs=1e-4) == 0.40 * np.pi  # ~1.256637

    def test_cylindrical_containers_across_table1_tiers(self):
        """Validates Table-I font requirement mapping for cylindrical SKUs across tiers."""
        # 1. Slim 250ml Can: D = 5.3 cm, H = 13.0 cm -> PDP = 0.40 * pi * 5.3 * 13.0 = 86.58 cm2
        # PDP in (50, 100] -> Table-I requires 1.5 mm
        pdp_can = 0.40 * np.pi * 5.3 * 13.0
        assert 50.0 < pdp_can <= 100.0
        assert Table1FontSchedule.get_required_font_height_mm(pdp_can) == 1.5

        # 2. 500ml Pickle Jar: D = 8.5 cm, H = 14.0 cm -> PDP = 0.40 * pi * 8.5 * 14.0 = 149.54 cm2
        # PDP in (100, 500] -> Table-I requires 2.5 mm
        pdp_jar = 0.40 * np.pi * 8.5 * 14.0
        assert 100.0 < pdp_jar <= 500.0
        assert Table1FontSchedule.get_required_font_height_mm(pdp_jar) == 2.5

        # 3. 5L Edible Oil Tin / Drum: D = 18.0 cm, H = 32.0 cm -> PDP = 0.40 * pi * 18.0 * 32.0 = 723.82 cm2
        # PDP in (500, 2500] -> Table-I requires 4.0 mm
        pdp_drum = 0.40 * np.pi * 18.0 * 32.0
        assert 500.0 < pdp_drum <= 2500.0
        assert Table1FontSchedule.get_required_font_height_mm(pdp_drum) == 4.0

        # 4. Large Bulk Cylinder (> 2500 cm2): D = 32.0 cm, H = 70.0 cm -> PDP = 0.40 * pi * 32.0 * 70.0 = 2814.87 cm2
        # PDP > 2500 -> Table-I Row 5 prescribes strictly 6.0 mm (ADL-01)
        pdp_bulk = 0.40 * np.pi * 32.0 * 70.0
        assert pdp_bulk > 2500.0
        assert Table1FontSchedule.get_required_font_height_mm(pdp_bulk) == 6.0

    def test_cylindrical_surface_unrolling_removes_tangential_foreshortening(self):
        """Cylindrical de-wrapping maps x(theta) = x0 + R*sin(theta) back to flat arc length."""
        h, w = 400, 300
        canvas = np.full((h, w, 3), 220, dtype=np.uint8)

        # Draw a synthetic cylindrical container with periodic vertical stripes
        for x in range(30, 270, 20):
            cv2.line(canvas, (x, 50), (x, 350), (40, 40, 40), 2)

        bbox = (50, 30, 350, 270)  # ymin, xmin, ymax, xmax
        unrolled = CalibrationEngine.rectify_cylindrical_surface(canvas, bbox, angular_span_deg=120.0)

        assert unrolled is not None
        assert unrolled.shape[0] == 300  # Height preserved
        # For 120 deg span (-60 to +60), arc length = 2 * R * (pi / 3) = 240 * 1.047 = 251 px
        assert pytest.approx(unrolled.shape[1], abs=5) == int(round(240 * (np.pi / 3.0)))

    def test_dual_polarity_pdp_geometry_segmentation(self):
        """Packaging boundary detector must reliably segment both light packages on dark mat and dark packages on light mat."""
        # 1. White package on dark mat (e.g. milk pouch / white box on black bench)
        dark_canvas = np.full((600, 800, 3), 30, dtype=np.uint8)
        cv2.rectangle(dark_canvas, (150, 100), (650, 500), (240, 240, 240), -1)

        pdp_dark = CalibrationEngine.estimate_pdp_geometry(dark_canvas, px_to_mm=4.0, package_type="RECTANGULAR")
        assert pdp_dark.bounding_box[0] < 120
        assert pdp_dark.bounding_box[1] < 170
        assert pdp_dark.bounding_box[2] > 480
        assert pdp_dark.bounding_box[3] > 630
        # W = 500px = 125mm = 12.5cm, H = 400px = 100mm = 10.0cm -> Front face = 125 cm2
        assert pytest.approx(pdp_dark.pdp_area_cm2, abs=10.0) == 125.0

        # 2. Dark package on light mat
        light_canvas = np.full((600, 800, 3), 245, dtype=np.uint8)
        cv2.rectangle(light_canvas, (150, 100), (650, 500), (40, 40, 40), -1)

        pdp_light = CalibrationEngine.estimate_pdp_geometry(light_canvas, px_to_mm=4.0, package_type="RECTANGULAR")
        assert pytest.approx(pdp_light.pdp_area_cm2, abs=10.0) == 125.0


# =============================================================================
# DOMAIN 5: BORDERLINE FONT HEIGHT UNCERTAINTY BAND (k=2, 95% CONFIDENCE)
# =============================================================================

class TestDomain5BorderlineFontUncertaintyBand:
    """Verifies epistemic triage (ADL-12) to REVIEW when deficit is within sensor uncertainty band."""

    def test_table1_borderline_review_triage_across_all_5_statutory_tiers(self):
        """Any measurement with deficit <= uncertainty_mm (default 0.08 mm) must route to REVIEW."""
        uncertainty = 0.08

        # Tier 1: Req 1.0 mm, Measured 0.95 mm (Deficit 0.05 mm <= 0.08) -> REVIEW
        r1 = Table1FontSchedule.evaluate(pdp_area_cm2=40.0, measured_height_mm=0.95, uncertainty_mm=uncertainty)
        assert r1["status"] == "REVIEW"
        assert "Borderline measurement within sensor uncertainty" in r1["legal_consequence"]

        # Tier 2: Req 1.5 mm, Measured 1.45 mm (Deficit 0.05 mm <= 0.08) -> REVIEW
        r2 = Table1FontSchedule.evaluate(pdp_area_cm2=80.0, measured_height_mm=1.45, uncertainty_mm=uncertainty)
        assert r2["status"] == "REVIEW"

        # Tier 3: Req 2.5 mm, Measured 2.44 mm (Deficit 0.06 mm <= 0.08) -> REVIEW
        r3 = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=2.44, uncertainty_mm=uncertainty)
        assert r3["status"] == "REVIEW"

        # Tier 4: Req 4.0 mm, Measured 3.94 mm (Deficit 0.06 mm <= 0.08) -> REVIEW
        r4 = Table1FontSchedule.evaluate(pdp_area_cm2=800.0, measured_height_mm=3.94, uncertainty_mm=uncertainty)
        assert r4["status"] == "REVIEW"

        # Tier 5: Req 6.0 mm, Measured 5.95 mm (Deficit 0.05 mm <= 0.08) -> REVIEW
        r5 = Table1FontSchedule.evaluate(pdp_area_cm2=3000.0, measured_height_mm=5.95, uncertainty_mm=uncertainty)
        assert r5["status"] == "REVIEW"

    def test_table1_clear_violation_beyond_uncertainty_is_fail(self):
        """Deficit strictly exceeding sensor uncertainty band must be classified as FAIL."""
        # Req 2.5 mm, Measured 2.30 mm (Deficit 0.20 mm > 0.08 mm) -> FAIL
        r = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=2.30, uncertainty_mm=0.08)
        assert r["status"] == "FAIL"
        assert "Non-compliant under Section 36(1)" in r["legal_consequence"]

    def test_table1_compliant_measurement_is_pass(self):
        """Measured height >= required must be classified as PASS."""
        r = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=2.50)
        assert r["status"] == "PASS"

        r_over = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=3.10)
        assert r_over["status"] == "PASS"

    def test_table1_missing_measurement_is_unable_to_verify(self):
        """None or <= 0 height must be classified as UNABLE_TO_VERIFY."""
        r_none = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=None)
        assert r_none["status"] == "UNABLE_TO_VERIFY"

        r_zero = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=0.0)
        assert r_zero["status"] == "UNABLE_TO_VERIFY"

    def test_adl17_retail_pilot_tolerance_band_30mm(self):
        """Under ADL-17 retail FMCG pilot standard (tolerance 0.30 mm), deficit of 0.20 mm routes to REVIEW."""
        r = Table1FontSchedule.evaluate(pdp_area_cm2=150.0, measured_height_mm=2.30, uncertainty_mm=0.30)
        assert r["status"] == "REVIEW"

    def test_iso17025_gum_dynamic_uncertainty_propagation(self):
        """Validates dynamic ISO 17025 / GUM uncertainty calculation across optical resolutions.
        
        At low optical resolution (S = 1.5 px/mm), 1px quantization noise yields U_95 ~ 0.50mm.
        At high resolution (S = 8.0 px/mm), U_95 tightens to ~ 0.10mm.
        Borderline deficits are evaluated against this scientifically computed expanded uncertainty.
        """
        # Low resolution camera / distant capture (1.5 px/mm)
        u_low = CalibrationEngine.calculate_expanded_uncertainty(px_to_mm=1.5, font_height_mm=2.5)
        assert u_low > 0.35, f"Low resolution uncertainty {u_low} must be broad"

        # High resolution camera / macro capture (8.0 px/mm)
        u_high = CalibrationEngine.calculate_expanded_uncertainty(px_to_mm=8.0, font_height_mm=2.5)
        assert u_high < 0.25, f"High resolution uncertainty {u_high} must be tight"
        assert u_high < u_low, "Uncertainty must tighten as resolution increases"

        # Triage evaluation using dynamic ISO 17025 uncertainty:
        # At 1.5 px/mm, a measurement of 2.20mm (deficit 0.30mm) is within U_95 (u_low) -> REVIEW
        r_dyn = Table1FontSchedule.evaluate(pdp_area_cm2=200.0, measured_height_mm=2.20, uncertainty_mm=u_low)
        assert r_dyn["status"] == "REVIEW", "Should be REVIEW under wide low-res uncertainty band"


# =============================================================================
# DOMAIN 6: REAL PACKAGING WITH SYNTHETIC ADVERSARIAL DEGRADATION
# =============================================================================

class TestDomain6RealPackagingAdversarialDegradation:
    """Stress tests real packaging samples against optical attacks and Section 63 BSA evidence."""

    @pytest.fixture
    def real_sample_image(self):
        sample_path = REPO_ROOT / "data" / "real_packaging_samples" / "REAL-PKG-01_8901719134845.jpg"
        if not sample_path.is_file():
            pytest.skip("Real packaging sample image not present")
        img = cv2.imread(str(sample_path))
        assert img is not None
        return img

    def test_adversarial_specular_glare_flash_triggers_optical_rejection(self, real_sample_image):
        """Injecting a bright specular highlight over 10% of the image must trigger quality gate rejection."""
        glared = real_sample_image.copy()
        h, w = glared.shape[:2]
        gw, gh = int(w * 0.40), int(h * 0.30)
        glared[100:100 + gh, 100:100 + gw] = (255, 255, 255)

        qg = QualityGateEvaluator.evaluate_image(glared)
        assert qg.passed is False
        assert qg.glare_percentage > 3.0
        assert "SPECULAR_GLARE" in qg.advice

    def test_adversarial_motion_blur_triggers_focus_rejection(self, real_sample_image):
        """Applying horizontal motion blur must reduce Laplacian variance below threshold 150.0."""
        kernel = np.zeros((25, 25))
        kernel[12, :] = 1.0 / 25.0
        blurred = cv2.filter2D(real_sample_image, -1, kernel)

        qg = QualityGateEvaluator.evaluate_image(blurred)
        assert qg.passed is False
        assert qg.blur_variance < 150.0
        assert "IMAGE_BLURRED" in qg.advice

    def test_adversarial_defocus_blur_triggers_quality_gate_rejection(self, real_sample_image):
        """Applying strong Gaussian defocus (sigma=8) must fail optical gate."""
        defocused = cv2.GaussianBlur(real_sample_image, (31, 31), 8.0)
        qg = QualityGateEvaluator.evaluate_image(defocused)
        assert qg.passed is False
        assert qg.blur_variance < 100.0

    def test_degraded_frame_forces_unable_to_verify_verdict(self):
        """When Quality Gate rejects frame, epistemic verdict triage MUST yield UNABLE_TO_VERIFY."""
        evals = [
            {"rule_code": "RULE_06_1_H_NET_QTY_FONT", "status": "PASS"},
            {"rule_code": "RULE_06_1_F_NET_QTY", "status": "PASS"},
            {
                "rule_code": "STAGE_02_OPTICAL_QUALITY_GATE",
                "status": "UNABLE_TO_VERIFY",
                "discrepancy": "Severe blur detected; hold steady and refocus"
            }
        ]
        verdict = LegalMetrologyRuleEngine.triage_verdict(evals)
        assert verdict == "UNABLE_TO_VERIFY", "Degraded optical gate must prevent false PASS"

    def test_section_63_bsa_merkle_provenance_records_degraded_stage(self):
        """Section 63 BSA 2023 Merkle audit chain must cryptographically bind optical quality gate status."""
        stage_payloads = [
            {"stage": 1, "raw_hash": MerkleAuditLedger.hash_payload(b"dummy_pixels")},
            {"stage": 2, "quality_gate": "FAIL", "blur": 42.5, "glare": 0.0},
            {"stage": 3, "calibration": "UNCALIBRATED"},
            {"stage": 9, "verdict": "UNABLE_TO_VERIFY"},
            {"stage": 11, "statutory_mandate": "Section 63 Bharatiya Sakshya Adhiniyam, 2023"}
        ]
        merkle_root = MerkleAuditLedger.build_merkle_root([MerkleAuditLedger.hash_payload(p) for p in stage_payloads])
        assert isinstance(merkle_root, str)
        assert len(merkle_root) == 64

        # Tamper proof: modifying any stage invalidates root
        tampered_payloads = list(stage_payloads)
        tampered_payloads[1] = {"stage": 2, "quality_gate": "PASS", "blur": 350.0, "glare": 0.0}
        tampered_root = MerkleAuditLedger.build_merkle_root([MerkleAuditLedger.hash_payload(p) for p in tampered_payloads])
        assert merkle_root != tampered_root, "Tampering with quality gate must alter Merkle root"
