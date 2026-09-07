# Member 1 Tasks — CV, Optics & Metrology

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & Quality Gate Skeleton
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Create synthetic test fixtures (clear, blurred, glared, tilted).
- [ ] Implement Laplacian variance blur estimator ($\sigma^2 \ge 150$).
- [ ] Implement HSV specular glare detector ($V > 245, S < 15$).
- [ ] Write and pass unit tests for optical quality gate (`test_quality_gate.py`).

### Day 2: ArUco Fiducial & Planar Homography
- [ ] Implement OpenCV ArUco detector (Dictionary 4x4_50, 50.0 mm).
- [ ] Implement contour-based fallback for ISO 7810 ID-1 card ($85.60 \times 53.98\text{ mm}$).
- [ ] Compute $3 \times 3$ planar homography matrix $H$ via OpenCV Direct Linear Transform (`cv2.getPerspectiveTransform` / `cv2.findHomography`).
- [ ] Implement perspective warp rectification (`cv2.warpPerspective`).
- [ ] Compute metric scale factor $S = \text{pixels per mm}$.

### Day 3: Packaging Geometry & PDP Measurement
- [ ] Implement contour/Canny packaging edge locator.
- [ ] Calculate total surface area in cm².
- [ ] Implement 40% Principal Display Panel (PDP) rule for rectangular and cylindrical containers.
- [ ] Write unit tests verifying area calculation against vernier caliper benchmarks.

### Day 4: Optimization, Calibration Tolerances & DoD
- [ ] Benchmark scale derivation accuracy against ground truth: target MAE $\le 0.15\text{ mm}$.
- [ ] Optimize execution latency: $< 80\text{ ms}$ total on CPU.
- [ ] Complete Definition of Done checklist.
- [ ] Update `progress.md` and `memory.md`.
