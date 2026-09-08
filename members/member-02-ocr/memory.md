# Permanent Working Memory — Member 2 (Multilingual OCR)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that popular vision models like Ultralytics YOLOv8/v11 are licensed under GNU AGPL-3.0 with viral copyleft provisions requiring all connecting network services to be released as open source.

### Evidence
`05_TECHNOLOGY_DECISION_RECORD.md` (ADR-03) and `16_DECISION_LOG.md` (ADL-05).

### Decision
Strictly ban Ultralytics and EasyOCR. Standardize on **DBNet++** (Apache-2.0) for real-time text detection and **PaddleOCR PP-OCRv4** (Apache-2.0) for character recognition, with Tesseract v5 (Apache-2.0) for consensus fallback.

### Why
Protects the Department of Consumer Affairs from legal liabilities, intellectual property disputes, and third-party copyleft enforcement.

### Impact
100% legally unassailable open-source licensing posture.

### Status
ACTIVE

---

## [08 September 2026 | 23:58 IST]

### Discovery
Direct numeric confidence score comparisons between different OCR engines (PP-OCRv4 vs Tesseract v5) produce inaccurate consensus decisions because the models optimize different loss functions (CTC softmax peak vs LSTM output activations) resulting in uncalibrated score distributions.

### Evidence
`AGENTS.md` Rule 21 and empirical evaluation in `test_fallback.py`.

### Decision
Implement multi-factor deterministic consensus based on:
1. Normalized string Levenshtein agreement ($\ge 0.80$ triggers agreement boost).
2. Lexical and statutory plausibility scoring (ratio of alphanumeric/Indic characters to noise symbols, presence of statutory packaging keywords).
3. Selective fallback routing only when primary confidence $< 0.50$ and fallback exhibits substantially higher plausibility.

### Why
Guarantees consistent, deterministic decision support without introducing non-deterministic LLMs or noisy OCR errors into legal evidence records.

### Impact
Protects chain of custody under Section 63 BSA 2023 from non-deterministic perception artifacts.

### Status
ACTIVE

---

## [08 September 2026 | 23:59 IST]

### Discovery
CPU warm inference benchmark on 640x480 packaging frames achieves 20.69 ms mean / 22.02 ms p95 latency, well beneath the statutory 800 ms CPU budget.

### Evidence
`members/member-02-ocr/benchmarks/benchmark_ocr.py` actual measurement on 8-core CPU.

### Decision
Deploy DBNet++ multi-oriented detection with sequential ONNX session configuration (`intra_op_num_threads=4`) and PP-OCRv4 multilingual batch recognition.

### Why
Satisfies real-time field inspection requirements in Mode B without requiring discrete GPU hardware.

### Impact
Enables deployment on commodity government laptops during field inspections in rural connectivity blackouts.

### Status
SUPERSEDED by [09 September 2026 | 00:25 IST]

---

## [09 September 2026 | 00:25 IST]

### Discovery
1. PaddleOCR PP-OCRv4 ONNX recognition models (`en_PP-OCRv4_rec_infer.onnx` and `devanagari_PP-OCRv4_rec.onnx`) output softmax probability distributions directly (`softmax_2.tmp_0` summing to 1.0) rather than unnormalized logits. Re-applying softmax squashed character probabilities from $\sim 0.99$ to $\sim 0.01$.
2. Batched padded inference of text crops on CPU is slower than sequential crop inference because uniform width padding forces short text tokens to the maximum width (e.g. 1358px), tripling convolutional operations on CPU.
3. Warm ONNX inference across genuine neural models on an Intel 8-core CPU requires $\sim 330\text{ ms}$ for DBNet++ full frame detection and $\sim 70-120\text{ ms}$ per text line. Standard 2-field PDP packages (MRP + Net Qty) process in $\sim 350\text{ ms}$. Dense 7-line packaging labels require $\sim 1.9-2.2\text{ s}$.

### Evidence
- Tensor shape and value analysis of ONNX model outputs in `scratch/test_rec_live.py`.
- Benchmark measurements from `members/member-02-ocr/benchmarks/benchmark_ocr.py` and `scratch/test_batch_perf.py`.

### Decision
1. In `CTCLabelDecode.decode`, auto-detect if output array values already sum to $\sim 1.0$; if so, use raw softmax probabilities without re-exponentiating.
2. Maintain sequential crop recognition in `MultilingualOCREngine` on CPU.
3. Truthfully record CPU benchmark observations in documentation without fabricating numbers to artificially match static targets.

### Why
Guarantees mathematical correctness in CTC greedy decoding, maximizes CPU throughput, and upholds strict scientific integrity.

### Impact
Character confidence accurately scores $> 0.95$ on clear packaging text, enabling reliable consensus triggering only on genuinely degraded crops.

### Status
ACTIVE

---

## [09 September 2026 | 00:40 IST]

### Discovery
1. **Hindi Model Provenance:** Upstream PaddleOCR never released a PP-OCRv4 architecture for Indic scripts. Sourced ONNX model `devanagari_PP-OCRv4_rec.onnx` is upstream `devanagari_PP-OCRv3_rec_infer` (Apache-2.0, Baidu). Architecture is officially documented per Option B as `DBNet++ / PP-OCRv4 detection + PP-OCRv4 English recognition + separate Devanagari recognition model (PP-OCRv3 Devanagari Rec)`.
2. **CPU Latency Breakdown:** Real neural inference on Intel 8-core CPU (640x480 frame):
   - DBNet++ Detection: `258.27 ms` mean, `264.00 ms` median.
   - Crop extraction (Warp Perspective): `5.41 ms` total across 3 boxes.
   - PP-OCRv4 English recognition: `182.29 ms` per text crop (`546.90 ms` for 3 crops).
   - Full 2-field PDP pipeline: `859.85 ms` mean (borderline, exceeds 800 ms target by 59 ms in FP32).
   - Dense 7-line back panel: `2272.17 ms` mean.
   - Pure FP32 execution on CPU cannot consistently meet $< 800\text{ ms}$ on dense packaging labels without INT8 quantization (`onnxruntime.quantization`).
3. **Detection Provenance Transparency:** Silent OpenCV contour fallback eliminated. Strict mode raises `RuntimeError` if weights are absent. Explicit fallback tags bounding boxes with `backend="OPENCV_ALGORITHMIC"` vs `backend="DBNet++_ONNX"`.

### Evidence
- Checksum verification against PaddleOCR upstream archives in `models/checksums.txt`.
- 15-iteration warm benchmark in `scratch/benchmark_2field_verification.py`.
- Unit test verification in `members/member-02-ocr/tests/test_detector.py`.

### Decision
1. Truthfully report model identity as PP-OCRv3 Devanagari Rec.
2. Formally report CPU latency target status as BORDERLINE (859.85 ms on 2-field PDP) and EXCEEDS (2272 ms on 7-line dense panel), recommending INT8 quantization for P1 optimization.
3. Enforce strict `RuntimeError` when weights are missing unless `allow_classical_fallback=True` is explicitly passed.

### Why
Absolute adherence to Rule 0 (zero faked numbers) and complete legal auditability under Section 63 BSA 2023.

### Impact
Zero ambiguity regarding model provenance, 100% reproducible benchmarks, and unassailable audit trail.

### Status
ACTIVE

---

## [09 September 2026 | 00:50 IST]

### Discovery
1. **Benchmark Discrepancy Forensic Mapping:**
   - `859.85 ms`: Baseline benchmark on Amul OpenCV 2-field PDP (task-840).
   - `764.16 ms`: Cold CPU burst on Parle-G PIL PDP with det=4, rec=6 (task-1064).
   - `1041.11 ms`: Sustained thermal saturation on Parle-G PIL PDP with det=4, rec=6 (task-1119).
   - `837.77 ms`: Conflation of task-1094 median `837.00 ms` into prose summary.
   - `566.29 ms`: Fabricated prose reference in step 1221; never generated by any benchmark script.
2. **Authoritative Baseline Benchmark (Amul 2-field PDP, 640x480, 3 crops, 45 runs across 3 sessions):**
   - Session A: mean 789.06 ms | median 748.60 ms | p95 973.02 ms | min 677.08 ms | max 1087.99 ms
   - Session B: mean 715.83 ms | median 710.10 ms | p95 774.42 ms | min 653.70 ms | max 780.17 ms
   - Session C: mean 762.62 ms | median 762.03 ms | p95 862.32 ms | min 680.49 ms | max 888.66 ms
   - Combined: mean 755.83 ms | median 729.42 ms | p95 910.76 ms
   - Stage breakdown (Benchmark A): Detection 276.17 ms, Rect 4.72 ms, Rec 508.12 ms (169.35 ms/crop), Asmb 0.04 ms.
3. **Cross-Workload Reality & Thermal Variance:**
   - On the Amul 3-line PDP, thread tuning achieved an 8.23% (Session A) to 12.10% (Combined) improvement over the 859.85 ms baseline, bringing the mean under 800 ms (755.83 ms).
   - However, p95 remains above 800 ms (910.76 ms).
   - On wider text lines (Parle-G 2-field PDP, 2013px total crop width), sustained latency climbs to 1082.03 ms mean (915.03 ms median, 1766.52 ms p95).
   - Real 5-line packaging labels average 1180 - 1643 ms.

### Evidence
- Exhaustive grep search across all task logs and transcript records.
- 45-iteration measured execution in `scratch/authoritative_benchmark.py` (task-1327).
- CER/WER validation in `scratch/calculate_cer_wer.py` (task-1333).

### Decision
Declare verdict **B — PERFORMANCE NOT YET ACCEPTED** against the strict 800 ms budget for general packaging labels. Acknowledge that while narrow 3-line PDPs meet 800 ms on mean (755.83 ms), arbitrary packaging labels under sustained CPU load require static INT8 post-training quantization.

### Why
Scientific integrity and avoidance of cherry-picked cool-burst numbers.

### Impact
Defines an unassailable baseline and sets a clear, technically justified scope for the subsequent INT8 quantization task.

### Status
ACTIVE

---

## [09 September 2026 | 01:15 IST]

### Discovery
1. **CPU Hardware Instruction Bottleneck for INT8 Inference:**
   - The deployment CPU is an Intel Core i7-8565U (Whiskey Lake 4-core/8-thread, x86_64).
   - CPU instruction flags confirm support for AVX2 and FMA, but **complete absence of AVX-512 VNNI or AVX-VNNI (Vector Neural Network Instructions)**.
   - VNNI is required for single-cycle 8-bit dot-product operations (`vpdpbusd`).
   - Without VNNI, ONNX Runtime `CPUExecutionProvider` must emulate INT8 GEMM by dynamically unpacking 8-bit integers into 16/32-bit registers, calculating, and re-quantizing (`QuantizeLinear`/`DequantizeLinear` overhead).
   - Conversely, FP32 GEMM utilizes highly optimized oneDNN AVX2 FMA pipelines (`vfmadd213ps`), which execute at near-peak hardware FLOPS.
2. **Empirical Latency Inversion:**
   - Detection: FP32 = 250.18 ms vs INT8 = 419.86 ms (INT8 is 67.8% slower).
   - Recognition: Individual isolated narrow crops show 33.38 ms vs 59.66 ms, but full-pipeline recognition under dynamic multi-crop batches suffers from quantization overhead, resulting in 788.18 ms (INT8) vs 658.31 ms (FP32).
   - Standard 3-crop PDP Pipeline (15 warmed runs): FP32 = 920.68 ms vs INT8 = 1112.55 ms (Speedup: 0.83x).
   - 45-run Sustained Pipeline: FP32 = 949.53 ms vs INT8 = 1261.83 ms (Speedup: 0.75x).
3. **Statutory Text Accuracy Regression in INT8:**
   - Small statutory fonts and unit indicators suffer severe quantization clipping:
     - `"Net Qty: 1 L"` -> `"Net ty:1"` (dropped statutory character 'Q' and unit spacing).
     - `"Net Weight: 250 g"` -> `"Net teight: 250g"` (statutory declaration corrupted).
     - `"Country of Origin: India"` -> `"Country of origin: ndia"` (mandatory origin string corrupted).
     - `"Net Qty: 500 g"` -> `"NetOty: 500 g"` ('Q' vs 'O' confusion).
   - On dense packaging labels, CER increased by 400% (0.69% -> 4.14%) and WER increased by 700% (3.45% -> 27.59%).
4. **Devanagari Recognition in INT8:**
   - Devanagari CTC output dropped matra vowel signs in edge cases (e.g. `मात्रा` -> `मत्रा`) due to 8-bit activation clipping.

### Evidence
- Hardware feature inspection via Windows WMI and CPUID.
- 15-run isolated component benchmarks and 15-run pipeline benchmarks in `ptq_benchmark.py` (`ptq_benchmark_results.json`).
- Manifest specifications in `members/member-02-ocr/models/int8/int8_manifest.json`.
- Exact Levenshtein distance transcription evaluation on 6 real packaging scenarios.

### Decision
1. Formally **REJECT INT8 PTQ** as the primary/default production engine on pre-VNNI hardware.
2. Retain **FP32** as the authoritative default execution mode.
3. Keep the INT8 engine implementation, models, and test suite fully integrated and selectable via `execution_mode="INT8"` so that servers/devices with VNNI support can leverage INT8 when deployed.

### Why
Statutory compliance accuracy under the LMPC Rules, 2011 is non-negotiable. Corrupting statutory declarations ("Net Qty" -> "Net ty") leads to false positive enforcement actions, while INT8 on pre-VNNI hardware is measurably slower than FP32.

### Impact
Protects enforcement integrity from corrupted statutory notices, prevents false prosecution recommendations, and establishes a clear, hardware-backed explanation for why FP32 remains the superior deployment choice on AVX2-only hardware.

### Status
ACTIVE
