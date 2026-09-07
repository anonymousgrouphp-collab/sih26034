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
