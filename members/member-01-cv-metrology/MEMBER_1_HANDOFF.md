# Member 1 Handoff — Computer Vision, Optics & Metrology

**Subsystem:** NyayaDrishti-LM — Member 1 (CV, Optics & Metrology)  
**Assigned Engineer:** Kunal Raj ([@kunal-raj-dev](https://github.com/kunal-raj-dev))  
**Branch:** `feat/m1-cv-metrology`  
**Repository:** `SIH26034 - Legal Metrology`  
**Target Integration Branch:** `dev`  
**Document Version:** 1.0.0 (Post-Audit Hardened Baseline)  
**Date:** 08 September 2026  

---

## 1. Subsystem Overview

Member 1 provides the foundational computer vision, optical quality screening, metric scale calibration, perspective rectification, and Principal Display Panel (PDP) surface area measurement for NyayaDrishti-LM. It operates at Stages 2 through 5 of the 12-stage pipeline.

```
+-----------------------------------------------------------------------------+
| Raw Packaging Image (File / Bytes / BGR Array)                              |
+-----------------------------------------------------------------------------+
                                       |
                                       v
                     [ Stage 2: Optical Quality Gate ]
                     - Laplacian Blur Variance (>= 150.0)
                     - HSV Specular Glare (V>245, S<15, <= 3.0%)
                     - Perspective Tilt Screening (<= 15.0 deg)
                                       |
                     +-----------------+-----------------+
                     | PASS                              | REJECT
                     v                                   v
       [ Stage 3: Fiducial Calibration ]     QualityGateError / Fail DTO
       - Primary: ArUco 4x4_50 (50.0 mm)     (Requires retake in HUD)
       - Secondary: ISO 7810 ID-1 Card
       - Derives px_to_mm & Homography H
                     |
                     v
       [ Stage 4: Metric Rectification ]
       - cv2.warpPerspective (INTER_LINEAR)
       - Orthogonal Metric Image Plane
                     |
                     v
       [ Stage 5: Packaging Geometry & PDP ]
       - Package Edge Boundary Segmentation
       - LMPC Rule 2(h) / Rule 7 Statutory 40% Area
                                       |
                                       v
         +-------------------------------------------+
         | CVPipelineOutput -> Member 2 Multilingual |
         | OCR & Member 4 Table-I Statutory Engine   |
         +-------------------------------------------+
```

---

## 2. Inputs

The subsystem accepts packaging imagery in three flexible formats:

1. **In-Memory NumPy Array (`numpy.ndarray`):**
   - Format: uint8 BGR (standard OpenCV format) or RGB / Grayscale.
   - 4-channel BGRA/RGBA images are automatically stripped to 3-channel BGR.
2. **Raw Encoded File Bytes (`bytes`):**
   - Encoded formats: JPEG, PNG, WebP, BMP.
3. **Local File Path (`str` or `pathlib.Path`):**
   - Absolute or relative file path to an existing image.

### Image Sizing & Security Constraints
- **Minimum Resolution:** $480 \times 480\text{ px}$ (Production recommended: $\ge 1920 \times 1080\text{ px}$).
- **Maximum Dimension:** $8192\text{ px}$ along any axis (DoS / Decompression Bomb protection).
- **Maximum Pixels:** $40,000,000\text{ px}$ ($40\text{ MP}$).
- **Maximum File Byte Size:** $50\text{ MB}$.
- **Data Integrity:** Arrays containing `NaN` or `Inf` floating-point values are rejected immediately.

### Physical Calibration Targets Supported
- **Primary Standard:** ArUco Marker Dictionary `DICT_4X4_50` (ID: 0, physical side width: $50.0\text{ mm}$).
- **Secondary Fallback:** ISO/IEC 7810 ID-1 Standard Dimensions ($85.60 \times 53.98\text{ mm}$, aspect ratio $1.5858$).

### Packaging Geometry Classifications Supported
- `PackagingType.RECTANGULAR` (Boxes, cartons, flat packages)
- `PackagingType.CYLINDRICAL` (Bottles, cans, cylindrical tins)
- `PackagingType.FLEXIBLE_POUCH` (Chips, pouches, snack laminates)
- `PackagingType.UNSPECIFIED` (General packaging default)

---

## 3. Outputs

Member 1 produces two primary structured results encapsulated in a single execution output:

### A. `QualityGateOutput` (Stage 2)
Dual-compatible object satisfying both `contracts/quality_gate/QualityCheckDTO` and `QualityGateResult`:
- `passed` / `is_valid` (`bool`): True if frame meets sharpness, glare, and tilt standards.
- `blur_variance` / `laplacian_blur` (`float`): Laplacian variance focus metric ($\sigma^2$).
- `glare_percentage` / `specular_glare_pct` (`float`): Specular highlight percentage ($0.0 - 100.0\%$).
- `tilt_angle_deg` / `tilt_angle` (`float`): Estimated perspective foreshortening angle in degrees.
- `rejection_reasons` (`list[str]`): Descriptive rejection codes (`BLUR_DETECTED`, `GLARE_DETECTED`, `TILT_EXCEEDED`).
- `resolution` (`tuple[int, int]`): Image `(width, height)` in pixels.

### B. `CalibrationResult` (Stages 3 to 5)
Conforms to `contracts/calibration/calibration_dto.py`:
- `is_calibrated` (`bool`): True if an in-scene fiducial reference was identified and resolved.
- `calibration_method` (`str`): `"ARUCO_4X4_50"`, `"ISO_7810_CARD"`, or `"UNRESOLVED"`.
- `px_to_mm` (`Optional[float]`): Scale factor $S = \text{pixels per mm}$. **Returns `None` if uncalibrated.**
- `margin_of_error_mm` (`float`): Measurement uncertainty bound ($k=2, 95\%$ confidence).
- `confidence` (`float`): Calibration quality score ($0.0 - 1.0$).
- `pdp_surface_area_cm2` (`Optional[float]`): Statutory Principal Display Panel area in cm². **Returns `None` if uncalibrated.**
- `homography_matrix_3x3` (`Optional[list[list[float]]]`): $3 \times 3$ Direct Linear Transform matrix.
- `uncalibrated_reason` (`Optional[str]`): Reason if unresolved (e.g., `"NO_FIDUCIAL_FOUND"`).

### C. `CVPipelineOutput` (Unified Container)
- `quality_gate`: `QualityGateOutput` instance.
- `calibration`: `CalibrationResult` instance.
- `rectified_image`: Orthogonal metric perspective-corrected BGR `numpy.ndarray` for downstream OCR.
- `scale_factor`: `Optional[float]` ($S = \text{px\_to\_mm}$).
- `pdp_area_cm2`: `Optional[float]` ($A_{\text{PDP}}$ in cm²).
- `pixels_to_mm(pixels: float) -> float`: Safe conversion method (raises `ValueError` if uncalibrated).
- `mm_to_pixels(mm: float) -> float`: Safe conversion method (raises `ValueError` if uncalibrated).
- `to_contract_dtos() -> dict`: Direct export to Pydantic contract DTOs.

---

## 4. Stable Interfaces

All stable interfaces are available directly via `members/member-01-cv-metrology/src/`:

```python
from members.member_01_cv_metrology.src.quality_gate import (
    QualityGateEvaluator,
    QualityGateOutput,
    QualityGateError,
    evaluate_metrics,  # Legacy 2-tuple helper
)

from members.member_01_cv_metrology.src.calibration import (
    CalibrationEngine,
    CalibrationResult,
    CalibrationMethod,
    PackagingType,
    PDPGeometry,
    pixels_to_mm,  # Directional conversion helper
    mm_to_pixels,  # Directional conversion helper
)

from members.member_01_cv_metrology.src.pipeline_cv import (
    Member1CVPipeline,
    CVPipelineOutput,
)
```

### Key Signatures

```python
# Stage 2: Optical Quality Gate
evaluator = QualityGateEvaluator(
    blur_threshold: float = 150.0,
    glare_threshold_pct: float = 3.0,
    tilt_threshold_deg: float = 15.0,
)
qg_output: QualityGateOutput = evaluator.evaluate_image(
    image_input: Union[str, Path, bytes, np.ndarray],
    auto_detect_tilt: bool = False,
)

# Stage 3-5: Calibration & Metrology Engine
calibrator = CalibrationEngine(
    aruco_marker_size_mm: float = 50.0,
    aruco_dict_id: int = cv2.aruco.DICT_4X4_50,
)
calib_res: CalibrationResult = calibrator.calibrate_scene(
    image: np.ndarray,
    packaging_type: PackagingType = PackagingType.RECTANGULAR,
)

# End-to-End CV Pipeline (Stages 2-5)
pipeline = Member1CVPipeline()
cv_output: CVPipelineOutput = pipeline.process_frame(
    image_input: Union[str, Path, bytes, np.ndarray],
    packaging_type: PackagingType = PackagingType.RECTANGULAR,
    bypass_quality_gate: bool = False,
)
```

---

## 5. Guarantees

1. **Scale Convention:** Canonical convention across all modules is:
   $$\text{Scale } S = \text{px\_to\_mm} = \frac{\text{pixels}}{\text{mm}}$$
   $$\text{Physical Size (mm)} = \frac{\text{Bounding Box Height (pixels)}}{S}$$
   $$\text{Pixel Dimension} = \text{Dimension (mm)} \times S$$
2. **Safe Uncalibrated Sentinels:** If no fiducial is detected, `is_calibrated` is strictly `False`, `px_to_mm` is `None`, and `pdp_surface_area_cm2` is `None`. Calling `cv_output.pixels_to_mm(...)` or `cv_output.mm_to_pixels(...)` will raise an explicit `ValueError`. Downstream modules will never receive arbitrary fallback numbers that could cause illegal enforcement citations.
3. **Statutory PDP Calculations (LMPC Rule 2(h) & Rule 7):**
   - **Rectangular:** $A_{\text{PDP}} = 0.40 \times W \times H$ (40% of height $\times$ width of front face).
   - **Cylindrical:** $A_{\text{PDP}} = 0.40 \times H \times (\pi D) = 0.40 \times H \times C$ (40% of height $\times$ circumference).
   - **Flexible Pouch / Unspecified:** $A_{\text{PDP}} = 0.40 \times W \times H$ (Statutory 40% of front face, preventing 2.5x area overestimation).
4. **Latency Budget:** Total CPU pipeline latency is strictly under $80\text{ ms}$:
   - Quality Gate: $\sim 18.06\text{ ms}$
   - Calibration & Homography: $\sim 16.32\text{ ms}$
   - Metric Linear Rectification: $\sim 2.75\text{ ms}$
   - PDP Geometry & Segmentation: $\sim 8.63\text{ ms}$
   - **Total Pipeline Execution:** $45.76\text{ ms}$ mean / $58.46\text{ ms}$ p95.
5. **Algorithmic Consistency:** Subpixel corner refinement (`cv2.aruco.CORNER_REFINE_SUBPIX`) provides a synthetic planar accuracy MAE of $0.0051\text{ mm}$ (exceeding the statutory $\le 0.15\text{ mm}$ requirement).
6. **Thread & Memory Safety:** Stateless functional transforms with zero global mutable state. All OpenCV memory buffers are returned as pure NumPy arrays.
7. **Permissive Licensing:** 100% BSD-3-Clause and Apache-2.0 compliant. Zero AGPL-3.0 dependencies (no Ultralytics YOLO).

---

## 6. Do NOT Assume

1. **DO NOT assume monocular camera frames without a fiducial can provide millimeter scale.** Without a coplanar fiducial, single-view geometry suffers from scale ambiguity ($y \sim K[R \mid t]X$). Any attempt to guess scale without a reference is legally inadmissible under Section 63 of the BSA 2023.
2. **DO NOT assume `pdp_surface_area_cm2` is 100% total surface area.** Under Rule 2(h) of the LMPC Rules, 2011, PDP area is strictly the statutory 40% usable declaration area. Feeding 100% area to Member 4's Table-I rule engine will trigger false font height deficit violations.
3. **DO NOT run downstream OCR on raw tilted frames when `rectified_image` is available.** Using `rectified_image` eliminates perspective foreshortening and ensures that vertical text heights in pixels directly map to physical millimeters via $H_{\text{mm}} = H_{\text{px}} / S$.
4. **DO NOT assume `px_to_mm` means millimeters per pixel.** It represents pixels per millimeter ($S \approx 2.0 - 25.0\text{ px/mm}$ under typical mobile macro imaging).
5. **DO NOT assume packaging contour tilt can be measured on uncalibrated rectangular packaging without an ArUco fiducial.** True perspective tilt requires an orthogonal square fiducial with known $1:1$ aspect ratio.

---

## 7. Known Limitations

1. **Planar Fiducial Coplanarity:** The ArUco marker or ISO card must lie in or near the plane of the label being measured. If a marker is placed 10 cm in front of or behind the packaging, projective scale variation will degrade measurement accuracy.
2. **Retail Pilot Physical Accuracy:** The $0.0051\text{ mm}$ MAE is demonstrated on synthetic planar rasters with subpixel refinement. Retail validation against vernier calipers on the 50-item physical pilot dataset (`DS-PILOT-050`) is currently pending physical laboratory data collection.
3. **Severe Holographic Specularity:** Highly reflective holographic laminates (e.g., silver metallized pouches) can trigger false glare rejections under direct flash lighting. Inspection officers should tilt the package slightly or diffuse ambient light.
4. **Cylindrical 360° Unrolling:** For curved bottles and cans, PDP calculation uses front-face projection and diameter derivation. Full 360-degree cylindrical unrolling requires multi-camera stitching, which is deferred to Phase 2.

---

## 8. Test Commands

To verify Member 1 functionality independently or run the full test suite:

```bash
# Run Member 1 tests standalone (43 tests)
python -m pytest members/member-01-cv-metrology/tests/ -v

# Run full repository test suite (69 tests)
python -m pytest -v
```

Expected result: **43/43 passed for Member 1, 69/69 passed repository-wide.**

---

## 9. Benchmark Commands

To verify synthetic planar measurement accuracy and CPU latency profiles:

```bash
# Run automated benchmark harness
python members/member-01-cv-metrology/src/benchmark.py
```

Expected outputs:
- **Synthetic Accuracy:** `MAE <= 0.0051 mm` (Target: $\le 0.15\text{ mm}$) $\rightarrow$ `[PASS]`
- **CPU Latency:** `Mean <= 46 ms, P95 <= 59 ms` (Budget: $\le 80\text{ ms}$) $\rightarrow$ `[PASS]`
- **Resolution Invariance:** 720p, 1080p, and 1440p scale factors stay linear within $0.05\%$.

---

## 10. How to Use Member 1 Locally (Integration Examples)

### Example A: Downstream Member 2 (Multilingual OCR) Integration

Member 2 receives the unwarped, orthogonal `rectified_image` directly from Member 1:

```python
from members.member_01_cv_metrology.src.pipeline_cv import Member1CVPipeline
from members.member_01_cv_metrology.src.calibration import PackagingType

pipeline = Member1CVPipeline()

# Process captured frame
cv_result = pipeline.process_frame("path/to/captured_package.jpg", PackagingType.RECTANGULAR)

if not cv_result.quality_gate.passed:
    print(f"HUD Retake Prompt: {cv_result.quality_gate.rejection_reasons}")
else:
    # Pass clean, rectified image to Member 2 DBNet++ / PP-OCRv4
    ocr_input_image = cv_result.rectified_image
    scale_factor = cv_result.scale_factor  # S (px/mm)
    print(f"Image rectified and ready for OCR. Metric Scale: {scale_factor:.2f} px/mm")
```

---

### Example B: Downstream Member 4 (Table-I Statutory Rule Engine) Integration

Member 4 receives `pdp_area_cm2` and `scale_factor` to evaluate minimum numeral font heights:

```python
# Convert OCR bounding box pixel height to physical millimeters
ocr_box_height_px = 42.0

if cv_result.calibration.is_calibrated:
    numeral_height_mm = cv_result.pixels_to_mm(ocr_box_height_px)
    pdp_area = cv_result.pdp_area_cm2
    
    # Member 4 Table-I Evaluation
    # e.g., Area 150 cm2 requires min 2.5 mm numeral font height
    print(f"Statutory PDP Area: {pdp_area:.1f} cm2")
    print(f"Measured Numeral Height: {numeral_height_mm:.2f} mm")
else:
    print("Warning: Uncalibrated frame. Font height check must be marked UNABLE_TO_VERIFY.")
```

---

### Example C: Direct Pydantic Contract Export for Member 5 (FastAPI / Evidence Backend)

```python
# Export contract DTOs for Section 63 BSA 2023 Merkle hashing
dtos = cv_result.to_contract_dtos()

quality_dto = dtos["quality_check"]      # Conforms to QualityCheckDTO
calib_dto = dtos["calibration_result"]   # Conforms to CalibrationDTO

print(f"Quality Check DTO: {quality_dto.model_dump_json(indent=2)}")
print(f"Calibration DTO: {calib_dto.model_dump_json(indent=2)}")
```

---

*NyayaDrishti-LM — Confidential & Statutory Enforcement Baseline — Department of Consumer Affairs (DoCA)*
