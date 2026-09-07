# Member 1 — Computer Vision, Optics & Metrology

**Assigned Workstream:** Optical Quality Gate, Scale Calibration, Planar Homography, Packaging Geometry & PDP Measurement  
**Assigned Folder:** `members/member-01-cv-metrology/`  
**Git Feature Branch:** `feat/m1-cv-metrology`  

---

## 1. What is my job?
Your job is to build the computer vision and optical measurement foundation for NyayaDrishti-LM.
You ensure that incoming images are sharp, free of severe glare bloom, and properly aligned.
You detect reference calibration markers (ArUco 4x4_50 or ISO 7810 card), compute the planar homography matrix to remove perspective tilt, derive the physical metric scale ($S = \text{pixels per mm}$), and calculate the Principal Display Panel (PDP) surface area in cm².

---

## 2. What files am I allowed to change?
You are allowed to create and edit files strictly inside:
- `members/member-01-cv-metrology/**`

You may read shared contracts in `contracts/quality_gate/` and `contracts/calibration/`.
You must NOT edit other member directories or root specification files.

---

## 3. What documents must I read?
1. `AGENTS.md` (Root team rules)
2. `01_MASTER_PROJECT_BLUEPRINT.md`
3. `03_FINAL_ARCHITECTURE.md` (Stages 1 through 5)
4. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-06: ArUco Fiducials & Homography)
5. `07_API_AND_INTERFACE_CONTRACTS.md` (`QualityCheckDTO`, `CalibrationDTO`, `/api/v1/inspections/upload`)
6. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-CALIB-01`, `TS-CALIB-02`, `TS-OPTIC-01`, `TS-OPTIC-02`)
7. `16_DECISION_LOG.md` (ADL-03, ADL-17)
8. `17_OPEN_QUESTIONS.md` (OQ-01, OQ-04)
9. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 1: Optical & Measurement Claims)

---

## 4. What inputs do I use?
- High-resolution packaging images ($\ge 1920 \times 1080$, JPEG/PNG).
- Standard fiducial markers in the scene: ArUco 4x4_50 ($50.0\text{ mm}$) or ISO 7810 ID-1 card ($85.60 \times 53.98\text{ mm}$).
- Standalone test fixtures in `members/member-01-cv-metrology/fixtures/`.

---

## 5. What outputs do I produce?
- `QualityCheckDTO` / `QualityGateResult` JSON containing blur score, glare percentage, tilt angle, and pass/fail flag.
- `CalibrationDTO` / `CalibrationResult` JSON containing calibration method, `px_to_mm` scale factor, confidence, PDP area in cm², and homography matrix.

---

## 6. What contract do I follow?
- `contracts/quality_gate/quality_gate_dto.py`
- `contracts/calibration/calibration_dto.py`

---

## 7. How do I run my module?
```bash
python -m members.member_01_cv_metrology.src.pipeline_cv
```

---

## 8. How do I run tests?
```bash
pytest members/member-01-cv-metrology/tests/ -v
```

---

## 9. What counts as complete?
Your module is complete when:
1. Laplacian blur estimator correctly rejects images with $\sigma^2 < 150$.
2. Glare detector correctly flags specular highlights $> 3\%$.
3. Planar homography rectifies perspective tilt up to $15^\circ$.
4. Metric scale MAE is $\le 0.15\text{ mm}$ on synthetic targets and $\le 0.30\text{ mm}$ on retail pilot items.
5. All unit tests pass with $> 85\%$ coverage.
6. `progress.md` is marked `COMPLETE — YYYY-MM-DD HH:MM IST`.
7. `memory.md` is updated.

---

## 10. What must I NOT depend on?
- You must NOT depend on Member 2's OCR engine.
- You must NOT depend on Member 3's regex extractor.
- You must NOT depend on Member 4's legal rules.
- You must NOT depend on Member 5's database or PDF generator.
- You must NOT depend on Member 6's web UI.
Your module runs completely on standalone image fixtures!
