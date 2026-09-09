# Member 2 Tasks — Multilingual OCR Engine
**Assigned Engineer:** **Parmarth Kumar** ([@parmarth-kumar](https://github.com/parmarth-kumar))  
**Branch:** `feat/m2-ocr`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & ONNX Model Setup
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define OCR test fixtures for English and Devanagari Hindi packaging text.
- [x] Implement polygon bounding box extraction and coordinate normalizer.
- [x] Set up ONNX Runtime CPU session runner for text detection and recognition.

### Day 2: DBNet++ Detection & Polygon Normalization
- [x] Implement DBNet++ pre-processing (resize to $640 \times 640$ / $1024 \times 1024$, normalization).
- [x] Implement post-processing (probability map thresholding, polygon contour extraction).
- [x] Write unit tests verifying IoU $\ge 0.50$ on synthetic label fixtures.

### Day 3: PP-OCRv4 Recognition & Tesseract Fallback
- [x] Implement multilingual recognition with character dictionary decoding (PP-OCRv4 English + PP-OCRv3 Devanagari Hindi).
- [x] Implement character-level confidence score computation.
- [x] Implement Tesseract v5 fallback on crops with confidence $< 0.65$.
- [x] Write unit tests verifying CER $\le 2.5\%$ on clean printed packaging text.

### Day 4: Benchmarking, CPU Optimization & DoD
- [x] Measure CPU execution latency across quad-core targets (budget: $\le 800\text{ ms}$).
- [x] Verify 100% compliance with Apache-2.0 licensing (zero AGPL-3.0).
- [x] Complete Definition of Done checklist.
- [x] Update `progress.md` and `memory.md`.

### Day 5: Real Neural Model Provisioning & Verification
- [x] Provision real DBNet++ ONNX model weights (`ch_PP-OCRv4_det.onnx`).
- [x] Provision real PP-OCRv4 English and PP-OCRv3 Devanagari Hindi ONNX model weights (`en_PP-OCRv4_rec_infer.onnx`, `devanagari_PP-OCRv4_rec.onnx`).
- [x] Provision Tesseract v5 Devanagari traineddata (`hin.traineddata`).
- [x] Create reproducible model provisioning script with SHA-256 validation (`scripts/download_models.py`).
- [x] Run real neural inference smoke suite (`tests/test_real_model_smoke.py`).
- [x] Conduct truthful CPU benchmarking without perception stubs.

### Day 6: Static INT8 Post-Training Quantization (PTQ) & Validation
- [x] Build reproducible INT8 PTQ quantization script with calibration dataset (`scripts/quantize_models.py`).
- [x] Generate static INT8 QDQ models for detector, English recognizer, and Devanagari recognizer (`models/int8/`).
- [x] Generate verifiable manifest (`models/int8/int8_manifest.json`) with SHA-256 and sizes.
- [x] Implement explicit `execution_mode="FP32"|"INT8"` in detector, recognizer, and engine with strict error handling.
- [x] Write unit & smoke test suite for INT8 engine (`tests/test_quantized_engine.py`).
- [x] Conduct 15-run isolated, 15-run standard, 45-run sustained, and 6-scenario benchmarks.
- [x] Perform hardware instruction analysis (AVX2 vs AVX-512 VNNI) and statutory accuracy regression analysis.
- [x] Record formal verdict and deployment decision.

### Special Assignment: Temporary Test Frontend & Inspection HUD (feat/m2-parmarth-test-ui)
- [ ] Implement standalone zero-build test UI in `integration/test_ui/` for end-to-end team testing.
- [ ] Connect to FastAPI `/api/v1/` endpoints for auth, upload, pipeline execution, adjudication, and PDF notice download.
- [ ] Provide quick-load interactive presets for the 6 Golden Demonstration SKUs.
- [ ] Deliver automated integration tests and documentation (`TASK_TEMP_UI.md`).
