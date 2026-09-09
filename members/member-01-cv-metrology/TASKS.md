# Member 1 Tasks — CV, Optics & Metrology
**Assigned Engineer:** **Kunal Raj** ([@kunal-raj-dev](https://github.com/kunal-raj-dev))  
**Branch:** `feat/m1-cv-metrology`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & Quality Gate Skeleton
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Create synthetic test fixtures (clear, blurred, glared, tilted, ArUco, ISO card).
- [x] Implement Laplacian variance blur estimator ($\sigma^2 \ge 150$).
- [x] Implement HSV specular glare detector ($V > 245, S < 15, \le 3.0\%$).
- [x] Write and pass unit tests for optical quality gate (`test_quality_gate.py` - 21/21 passing).

### Day 2: ArUco Fiducial & Planar Homography
- [x] Implement OpenCV ArUco detector (Dictionary 4x4_50, 50.0 mm) with subpixel refinement (`CORNER_REFINE_SUBPIX`).
- [x] Implement contour-based fallback for ISO 7810 ID-1 card ($85.60 \times 53.98\text{ mm}$).
- [x] Compute $3 \times 3$ planar homography matrix $H$ via OpenCV Direct Linear Transform (`cv2.getPerspectiveTransform`).
- [x] Implement perspective warp rectification (`cv2.warpPerspective`).
- [x] Compute metric scale factor $S = \text{pixels per mm}$ (`px_to_mm`).

### Day 3: Packaging Geometry & PDP Measurement
- [x] Implement contour/Canny packaging edge locator.
- [x] Calculate total surface area in cm².
- [x] Implement 40% Principal Display Panel (PDP) rule for rectangular and cylindrical containers.
- [x] Write unit tests verifying area calculation against vernier caliper benchmarks (`test_calibration.py` - 9/9 passing).

### Day 4: Optimization, Calibration Tolerances & DoD
- [x] Benchmark scale derivation accuracy against ground truth: target MAE $\le 0.15\text{ mm}$ (Achieved: $0.0051\text{ mm}$).
- [x] Optimize execution latency: $< 80\text{ ms}$ total on CPU (Achieved: $45.76\text{ ms}$ mean, $58.46\text{ ms}$ p95).
- [x] Complete Definition of Done checklist (69/69 repo tests passing, zero AGPL-3.0 dependencies, dual contract DTO compatibility).
- [x] Update `progress.md` and `memory.md`.

### Post-Implementation Audit & Hardening (08 September 2026)
- [x] Red-team metrology, geometric tilt, and uncalibrated metric fallback (DEF-01, DEF-02).
- [x] Fix flexible pouch and unspecified geometry statutory PDP formula under LMPC Rule 2(h)(iii) (DEF-03).
- [x] Harden ISO card contour discrimination (aspect ratio, orthogonal angles, area fraction) (DEF-04).
- [x] Implement input security validation against DoS / decompression bombs / non-finite arrays (DEF-05).
- [x] Formally label synthetic benchmark vs pending retail pilot ground truth (DEF-06).
- [x] Optimize warp perspective interpolation to `INTER_LINEAR` to satisfy $\le 80\text{ ms}$ budget (DEF-07).
- [x] Expand unit tests from 30 to 43 passing tests (`test_calibration.py` 17 tests, `test_quality_gate.py` 26 tests).
- [x] Verify 100% pass rate across entire repository (69/69 tests passing).
- [x] Publish comprehensive `FINAL_VALIDATION_REPORT.md` (31 sections).
- [x] Publish authoritative `MEMBER_1_HANDOFF.md`.
