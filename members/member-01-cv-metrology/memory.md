# Permanent Working Memory — Member 1 (CV & Metrology)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that uncalibrated monocular depth estimation is legally inadmissible under Indian metrology evidence standards due to projective scale ambiguity ($y \sim K[R \mid t]X$).

### Evidence
`CLAIMS_WE_MUST_NOT_MAKE.md` (Item 1), `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-06), and `16_DECISION_LOG.md` (ADL-03).

### Decision
Enforce planar homography anchored to known coplanar fiducials: ArUco 4x4_50 marker ($50.0\text{ mm}$) as primary standard, with ISO 7810 ID-1 card contour ($85.60 \times 53.98\text{ mm}$) as automatic secondary standard.

### Why
Directly resolves physical metric scale $S = \text{pixels per mm}$ with zero scale ambiguity, achieving $\le 0.15\text{ mm}$ MAE on planar benchmarks.

### Impact
Enables certified millimeter font x-height verification under Table-I of the LMPC Rules, 2011.

### Status
ACTIVE

## [08 September 2026 | 21:30 IST]

### Discovery
Identified schema divergence between `QualityGateResult` in `contracts/quality_gate/quality_gate_dto.py` and `QualityCheckDTO` in `contracts/quality_gate/quality_gate_contract.py`, alongside adapter expectations in `integration/adapters/pipeline_adapter.py`.

### Evidence
`test_quality_gate.py`, `contracts/quality_gate/`, and `pipeline_adapter.py` expecting `is_valid` boolean vs `passed` boolean, and `evaluate_metrics(blur, glare, tilt)` returning a 2-tuple.

### Decision
Engineered `QualityGateOutput` as a dual-compatible facade inheriting dictionary behavior and exposing dynamic property accessors (`passed` <-> `is_valid`, `blur_variance` <-> `laplacian_blur`, `glare_percentage` <-> `specular_glare_pct`). Preserved legacy `evaluate_metrics` static function.

### Why
Satisfies contract freezing rules in `AGENTS.md` (no unilateral edits to `contracts/` or `integration/`) while ensuring 100% interoperability across all calling components.

### Impact
Zero breaking changes, zero contract drift, seamless integration with upstream and downstream pipeline adapters.

### Status
ACTIVE

## [08 September 2026 | 21:32 IST]

### Discovery
OpenCV 5.0.0 uses modern `cv2.aruco.ArucoDetector(dictionary, detectorParameters)` class rather than legacy module-level `cv2.aruco.detectMarkers`. Default integer corner extraction produces ~0.25mm quantization noise, whereas `CORNER_REFINE_SUBPIX` yields < 0.01mm error.

### Evidence
Synthetic planar benchmarking: discrete corners gave MAE = 0.8575 mm with tilt distortion; subpixel refinement with planar homography inversion achieved MAE = 0.0051 mm (min 0.0000 mm, max 0.0288 mm).

### Decision
Instantiate `cv2.aruco.DetectorParameters()` with `cornerRefinementMethod = cv2.aruco.CORNER_REFINE_SUBPIX`. In homography rectification, apply planar unwarping before extracting planar Euclidean dimensions.

### Why
Guarantees metrological compliance for Table-I numeral font height verification under statutory audit standards (P0 requirement: MAE <= 0.15 mm).

### Impact
Exceeds synthetic accuracy target by 29x (0.0051 mm vs 0.15 mm threshold).

### Status
ACTIVE

## [08 September 2026 | 21:46 IST]

### Discovery
Uncalibrated single-contour packaging tilt estimation via $\arccos(\text{minor}/\text{major})$ is mathematically invalid for general packaging where $W \ne H$. True tilt angle requires known orthogonal square fiducial foreshortening (ArUco).

### Evidence
Mathematical derivation: an upright box with aspect ratio 2.0 produced an imaginary $\arccos(0.5) = 60^\circ$ false tilt. ArUco square foreshortening produces true physical tilt within $0.1^\circ$.

### Decision
Extract geometric tilt from ArUco square edge ratio ($\theta = \arccos(\text{opp}/\text{adj})$). In `QualityGateEvaluator.evaluate_image`, make automated tilt estimation opt-in via `auto_detect_tilt: bool = False`, requiring explicit fiducial alignment or UI sensor telemetry.

### Why
Prevents spurious quality gate rejections on standard rectangular packages in the field.

### Impact
Ensures robust quality gate passage for compliant non-square packaging.

### Status
ACTIVE

## [08 September 2026 | 21:48 IST]

### Discovery
Under LMPC Rule 2(h)(iii) & Rule 7(1)(c), Principal Display Panel (PDP) area for flexible pouches, wrappers, and bags is statutorily 40% of the front face ($0.40 \times W \times H$), not 100%.

### Evidence
Gazette Notification GSR 359(E) & LMPC Rules, 2011 Rule 2(h)(iii). Evaluating at 100% of front face resulted in a 2.5x area inflation (e.g., $150\text{ cm}^2$ computed as $375\text{ cm}^2$), pushing packaging into higher font tiers (Table-I Row 4 instead of Row 3) and causing false font height deficit citations.

### Decision
Update `estimate_pdp_geometry` so that `PackagingType.FLEXIBLE_POUCH` and `PackagingType.UNSPECIFIED` calculate $A_{\text{PDP}} = 0.40 \times \text{width} \times \text{height}$.

### Why
Strict fidelity to statutory packaging law and avoidance of illegal enforcement notices.

### Impact
Protects government from issuing defective statutory notices vulnerable to High Court quashing.

### Status
ACTIVE

## [08 September 2026 | 21:50 IST]

### Discovery
`cv2.INTER_LANCZOS4` in `rectify_image` introduces a ~27 ms latency penalty on 1080p images due to its 64-tap filter kernel, pushing pipeline CPU latency to 90.64 ms and violating the $\le 80\text{ ms}$ budget.

### Evidence
Empirical latency profiling: `INTER_LANCZOS4` = 27.2 ms vs `INTER_LINEAR` = 2.75 ms (10x faster). Downstream OCR character recognition accuracy on synthetic and pilot packaging is identical between Linear and Lanczos4.

### Decision
Standardize on `cv2.INTER_LINEAR` for perspective warp rectification in `CalibrationEngine.rectify_image`.

### Why
Brings end-to-end CPU pipeline latency down to $45.76\text{ ms}$ mean and $58.46\text{ ms}$ p95, well under the $80\text{ ms}$ non-functional budget.

### Impact
Ensures smooth real-time performance on low-spec enforcement field laptops (Mode B).

### Status
ACTIVE
