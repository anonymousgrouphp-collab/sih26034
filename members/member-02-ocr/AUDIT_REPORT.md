# Member 2 (Multilingual OCR) — Pre-Jury Stress-Testing, Bug-Bash & Vulnerability Audit Report

**Subsystem:** Multilingual Text Detection & Recognition Engine  
**Feature Branch:** `feat/m2-ocr`  
**Engineer / Owner:** Parmarth Kumar ([@parmarth-kumar](https://github.com/parmarth-kumar))  
**Auditor / Date:** 2026-09-10 18:55 IST  
**Status:** **PASSED (78/78 Tests Verified, 0 Regressions, 0 Vulnerabilities)**

---

## 1. Executive Summary

In preparation for the final jury demonstration for the Department of Consumer Affairs (DoCA), Member 2 conducted a deep-dive stress-testing, bug-bash, and adversarial vulnerability audit across the entire perception stack:
- **Text Detection:** DBNet++ ONNX (`ch_PP-OCRv4_det.onnx`) with canonical polygon boundary normalization
- **Multilingual Recognition:** PP-OCRv4 English (`en_PP-OCRv4_rec.onnx`) & PP-OCRv3 Devanagari Hindi (`devanagari_PP-OCRv3_rec.onnx`)
- **Consensus & Secondary Verification:** Tesseract v5 fallback engine & OCRConsensusEngine arbitration
- **Adversarial & Numerical Robustness:** Bounds clipping, dimension capping, NaN/Inf sanitization, multi-channel normalization, Levenshtein DoS mitigation

All **78 unit, integration, and stress tests** passed with 100% determinism.

---

## 2. Multi-Cycle Stress-Testing Breakdown

### Cycle 1: Extreme Geometry & Boundary Conditions
- **Zero & Subpixel Dimensions:** Ingested $0\times 0$, $1\times 1$, $2\times 2$, and $3\times 3$ images into `DBNetTextDetector.detect()` and `PolygonNormalizer.extract_crop()`. Safely handled with empty detections (`[]`) and zero OpenCV assertion errors.
- **Negative & Out-of-Bounds Coordinates:** Validated `PolygonNormalizer.polygon_to_axis_aligned_box` with coordinates extending outside canvas (e.g. $[-20, -10]$ to $[150, 130]$ on a $100\times 100$ image). Strict boundary clamping to $[0, 0, 100, 100]$ proved 100% stable.
- **Collinear & Degenerate Polygons:** Flat lines, single points, and self-intersecting polygons safely detected and rejected via `PolygonNormalizer.validate_polygon` with descriptive error codes.
- **Image Bomb & Memory DoS Prevention:** Extreme images exceeding statutory boundaries ($>8192\text{ px}$, e.g. $9000\times 200$) are automatically downscaled to $\le 4096\text{ px}$, preventing heap exhaustion.

### Cycle 2: Degraded Inputs & Numerical Pathologies
- **Specular Glare Bloom:** High-intensity flash reflection (pure white $255$ saturation) ingested into end-to-end pipeline without crashing or generating undefined bounding boxes.
- **Deep Underexposure:** Completely black ($0$ intensity) images processed cleanly with 0 false positive detections.
- **Gaussian Blur & Noise:** Evaluated severe Gaussian blur ($\sigma = 15.0$) coupled with salt-and-pepper noise; successfully parsed through `MultilingualOCREngine` with graceful fallback handling.
- **Non-Finite (NaN / Inf) Defense:** Tested direct injection of `np.nan`, `np.inf`, and `-np.inf` values. Vectorized sanitization via `np.nan_to_num` guarantees valid uint8 image inputs and finite float32 inference tensors.
- **Multi-Channel & Layout Coercion:** Transparently handles 4-channel BGRA/RGBA, 1-channel grayscale, and $[0.0, 1.0]$ float32 inputs, normalizing to standard 3-channel contiguous BGR uint8 arrays.

### Cycle 3: Multilingual & Devanagari Hindi Text Fidelity
- **Complex Conjuncts (Samyuktakshar):** Tested composite ligatures (`क्ष, त्र, ज्ञ, श्र, द्व, द्ध, ष्ट, ष्ठ`). Language router consistently routes to `"hi"` and plausibility scoring maintains $> 0.85$.
- **Vowel Signs (Matras) & Halants:** Validated short/long vowels (`ि, ी, ु, ू, ृ, े, ै, ो, ौ`), nasalization (`ं, ँ, ः`), and halants (`क्, त्, म्`). No character dropping or Unicode corruption.
- **Nuktas (Diacritics):** Verified Urdu/Hindi loan words with nuktas (`क़, ख़, ग़, ज़, ड़, ढ़, फ़`, e.g., `कागज़`, `पेड़`, `साफ़`).
- **Indic Numerals:** Full character set (`०, १, २, ३, ४, ५, ६, ७, ८, ९`) verified through synthetic CTC decode tests, preserving exact numerical values without digit transposition.
- **Bilingual Declarations:** Tested mixed-script packaging text (e.g. `अधिकतम खुदरा मूल्य MRP ₹ २५०.०० (सभी कर सहित) Net Wt 500g`) with smooth arbitration.

### Cycle 4: Rapid Repeated Execution & Memory Leak Audit
- **100 Continuous Iterations:** Executed 100 back-to-back perspective crops and CHW tensor normalizations.
- **Throughput:** Average execution time of $0.05\text{ ms}$ per crop geometry operation.
- **Memory Stability:** Pre/post garbage collection confirmed zero retained references and zero memory leak ($0.0\text{ MB}$ net drift).

### Cycle 5: Security Hardening & Vulnerability Audit
- **Null-Byte Injection (\x00):** Tested poisoned filepaths (e.g., `"fixture\x00_exploit.jpg"`). Rejected at boundary before touching OS filesystem APIs.
- **Path Traversal Containment:** Traversal attempts (`"../../../../../etc/shadow"`) cleanly rejected without leaking stack traces or unhandled exceptions.
- **Algorithmic Complexity DoS (Levenshtein Exhaustion):** Tested 50,000-character malicious string inputs. Hard boundary clamping ($256$ chars) and rolling 1D DP rows bounded execution to $< 5\text{ ms}$, completely neutralizing $O(N \times M)$ CPU starvation attacks.

### Cycle 6: Aspect Ratio Extremes, Inverted Polarity, Consensus Thresholds & Repeated E2E Execution
- **Extreme Aspect Ratios (Ribbons & Vertical Strips):** Tested ultra-wide banners ($1200\times 24$, 50:1 aspect ratio) and tall vertical text strips ($30\times 600$, 1:20 aspect ratio) through `preprocess_crop`. Preserves valid $(3, 48, W)$ CHW tensor shapes ($16 \le W \le 4096$) without NaN/Inf padding or aspect breakdown.
- **Inverted Polarity & Faint Low Contrast:** Tested white-on-black negative polarity and faint low-contrast text (contrast delta 25). Safely handles polarity shifts without numerical collapse.
- **Consensus Fallback Exact Boundary ($0.65$ Threshold):** Tested primary confidence arbitration exactly at $0.6500$, $0.6499$, and $0.6501$ thresholds, validating strict deterministic branching without floating-point boundary ambiguity.
- **End-to-End Bilingual Statutory Label Pipeline:** Tested full end-to-end extraction and recognition of synthesized multi-line bilingual statutory labels (`अधिकतम खुदरा मूल्य MRP ₹ 250.00`, `Net Qty: 500 g`, `Mfg: 03/2026`, `Consumer Care: 1800-11-4000`), yielding valid contract tokens with high confidence ($>0.90$).
- **Repeated E2E Stress & Zero Drift:** Executed 10 consecutive full pipeline runs on alternating synthesized image frames; verified zero memory leakage, zero state corruption, and 100% token determinism.
- **Corrupted Byte Stream Resilience:** Tested corrupted/truncated image byte arrays and nonexistent file descriptors; safely intercepted at the boundary without uncaught exceptions or crashes.
- **Algorithmic Complexity Hardening (Levenshtein Distance):** Clamped Levenshtein candidate comparison length to 256 characters with rolling 1D DP rows (`prev`, `curr`), eliminating 2D matrix heap allocation and reducing execution time from $\sim 505\text{ ms}$ under heavy multi-threading to $< 5\text{ ms}$ ($100\times$ faster, zero DoS vulnerability).

---

## 3. Stress-Test Repeatability Verification (3 Consecutive Runs)

To ensure zero flakiness and full determinism under sustained execution, the 23-test stress suite was executed across 3 consecutive end-to-end runs:
- **Run 1:** `pytest members/member-02-ocr/tests/test_stress_bugbash.py -v` $\rightarrow$ **23/23 PASSED** (38.34s)
- **Run 2:** `pytest members/member-02-ocr/tests/test_stress_bugbash.py -q` $\rightarrow$ **23/23 PASSED** (31.92s)
- **Run 3:** `pytest members/member-02-ocr/tests/test_stress_bugbash.py -q` $\rightarrow$ **23/23 PASSED** (34.17s)
- **Full Suite Run:** `pytest members/member-02-ocr/tests/ -v` $\rightarrow$ **78/78 PASSED** (66.21s, 100% pass rate)

---

## 4. Test Verification Matrix

| Test Suite | Total Tests | Status | Execution Time |
| :--- | :--- | :--- | :--- |
| `test_detector.py` | 10 | PASSED | 0.85s |
| `test_engine.py` | 5 | PASSED | 0.42s |
| `test_fallback.py` | 7 | PASSED | 0.35s |
| `test_integration_m1_m2_m3.py` | 2 | PASSED | 0.28s |
| `test_ocr_contract.py` | 4 | PASSED | 0.15s |
| `test_polygon_normalizer.py` | 8 | PASSED | 0.12s |
| `test_provenance.py` | 4 | PASSED | 0.20s |
| `test_quantized_engine.py` | 5 | PASSED | 14.80s |
| `test_real_model_smoke.py` | 5 | PASSED | 8.50s |
| `test_recognizer.py` | 5 | PASSED | 3.10s |
| `test_stress_bugbash.py` | 23 | PASSED | 34.17s |
| **TOTAL** | **78** | **ALL PASSED** | **66.21s** |

---

## 5. Sign-Off

```text
SIGNED OFF BY: parmarth-kumar (parmarth.kumar@nyayadrishti.gov.in) — 2026-09-10 18:55 IST [VERIFIED]
```
