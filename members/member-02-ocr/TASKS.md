# Member 2 Tasks — Multilingual OCR Engine
**Assigned Engineer:** **Parmarth Kumar** ([@parmarth-kumar](https://github.com/parmarth-kumar))  
**Branch:** `feat/m2-ocr`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & ONNX Model Setup
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define OCR test fixtures for English and Devanagari Hindi packaging text.
- [ ] Implement polygon bounding box extraction and coordinate normalizer.
- [ ] Set up ONNX Runtime CPU session runner for text detection and recognition.

### Day 2: DBNet++ Detection & Polygon Normalization
- [ ] Implement DBNet++ pre-processing (resize to $640 \times 640$ / $1024 \times 1024$, normalization).
- [ ] Implement post-processing (probability map thresholding, polygon contour extraction).
- [ ] Write unit tests verifying IoU $\ge 0.50$ on synthetic label fixtures.

### Day 3: PP-OCRv4 Recognition & Tesseract Fallback
- [ ] Implement PP-OCRv4 recognition with character dictionary decoding (English + Hindi).
- [ ] Implement character-level confidence score computation.
- [ ] Implement Tesseract v5 fallback on crops with confidence $< 0.65$.
- [ ] Write unit tests verifying CER $\le 2.5\%$ on clean printed packaging text.

### Day 4: Benchmarking, CPU Optimization & DoD
- [ ] Measure CPU execution latency across quad-core targets (budget: $\le 800\text{ ms}$).
- [ ] Verify 100% compliance with Apache-2.0 licensing (zero AGPL-3.0).
- [ ] Complete Definition of Done checklist.
- [ ] Update `progress.md` and `memory.md`.
