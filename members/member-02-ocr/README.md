# Member 2 — Deep Learning & Multilingual OCR

**Assigned Workstream:** Scene Text Detection (DBNet++), Multilingual Recognition (PP-OCRv4), ONNX INT8 CPU Optimization, Tesseract Fallback  
**Assigned Folder:** `members/member-02-ocr/`  
**Git Feature Branch:** `feat/m2-ocr`  

---

## 1. What is my job?
Your job is to build the optical text recognition engine.
You detect text polygons on packaging labels using DBNet++ and recognize characters across English and Devanagari Hindi using PP-OCRv4.
You optimize models for fast CPU execution using ONNX Runtime INT8 quantization.
You provide a secondary consensus fallback pass with Tesseract v5 on low-confidence crops ($\text{conf} < 0.65$).
You ensure zero AGPL-3.0 licenses are used.

---

## 2. What files am I allowed to change?
You are allowed to create and edit files strictly inside:
- `members/member-02-ocr/**`

You may read shared contracts in `contracts/ocr/`.
You must NOT edit other member directories or root specification files.

---

## 3. What documents must I read?
1. `AGENTS.md` (Root team rules)
2. `03_FINAL_ARCHITECTURE.md` (Stages 6 & 7: DBNet++ & PP-OCRv4)
3. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-03: AGPL Ban, ADR-05: ONNX INT8, ADR-06: Multilingual OCR)
4. `06_DATA_AND_MODEL_STRATEGY.md` (Quantization and Latency Budgets)
5. `07_API_AND_INTERFACE_CONTRACTS.md` (`OCROutput`, `OCRToken`)
6. `11_TESTING_AND_VALIDATION_PLAN.md` (Text Recognition CER $\le 2.5\%$)
7. `16_DECISION_LOG.md` (ADL-05, ADL-06, ADL-09)
8. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 3: AI & Architecture Claims)

---

## 4. What inputs do I use?
- Packaging label image crops (`.png`, `.jpg`).
- Standalone label fixtures in `members/member-02-ocr/fixtures/`.
- Permissive ONNX model weights colocated in `./models/onnx/`.

---

## 5. What outputs do I produce?
- `OCROutput` conforming to `contracts/ocr/ocr_dto.py` with bounding polygons, recognized text strings, confidence scores, and token lists.

---

## 6. What contract do I follow?
- `contracts/ocr/ocr_dto.py` and `contracts/ocr/ocr_schema.json`.

---

## 7. How do I run my module?
```bash
python -m members.member_02_ocr.src.ocr_pipeline
```

---

## 8. How do I run tests?
```bash
pytest members/member-02-ocr/tests/ -v
```

---

## 9. What counts as complete?
Your module is complete when:
1. DBNet++ extracts bounding polygons with IoU $\ge 0.50$.
2. PP-OCRv4 transcribes text with CER $\le 2.5\%$ on clean packaging.
3. CPU inference executes within the $\le 800\text{ ms}$ budget.
4. Tesseract fallback triggers smoothly on low-confidence crops.
5. All unit tests pass with $> 85\%$ coverage.
6. `progress.md` is marked `COMPLETE — YYYY-MM-DD HH:MM IST`.
7. `memory.md` is updated.

---

## 10. What must I NOT depend on?
- You must NOT depend on Member 1's live homography module; use standalone label fixtures.
- You must NOT perform semantic entity parsing (that belongs to Member 3).
- You must NOT evaluate legal rules (that belongs to Member 4).
Your module runs completely independently!
