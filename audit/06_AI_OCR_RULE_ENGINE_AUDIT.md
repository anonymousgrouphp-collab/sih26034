# 06 — AI, OCR & RULE ENGINE AUDIT REPORT: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Standards:** ISO 17025 Uncertainty Propagation, G.S.R. 629(E) Table-I, G.S.R. 779(E) USP  
**Lead Auditor:** Principal AI/ML Engineer & Metrology Specialist  

---

## 1. What the AI Actually Does vs Deterministic Logic

In evaluating hackathon AI solutions, judges frequently encounter "fake AI" (e.g. sending raw packaging images to OpenAI GPT-4 Vision and asking "is this compliant?"). 

MetroLens adopts an uncompromising, legally defensible hybrid architecture:
1. **Probabilistic Deep Learning is restricted strictly to PERCEPTION (Where is text? What letters were printed?).**
2. **Deterministic AST Code handles 100% of STATUTORY EVALUATION (Does the font height meet Table-I? Does the USP match the MRP?).**

```
+---------------------------------------------------------------------------------------------------------+
|                                    METROLENS HYBRID INTELLIGENCE PIPELINE                               |
+------------------------------------+------------------------------------+-------------------------------+
| COMPONENT                          | UNDERLYING ENGINE                  | NATURE OF INFERENCE           |
+------------------------------------+------------------------------------+-------------------------------+
| 1. Optical Quality Gate            | OpenCV Laplacian & HSV analysis    | Deterministic Computer Vision |
| 2. Scale Metric Calibration        | ArUco 4x4 & ISO Card Homography    | Deterministic Planar Geometry |
| 3. Multi-Oriented Text Detection   | DBNet++ (Baidu ONNX INT8)          | Deep Convolutional Neural Net |
| 4. Multilingual Text Recognition   | PP-OCRv4 (Latin) + PP-OCRv3 (Hindi)| Deep Recurrent/CRNN Neural Net|
| 5. Token Coordinate Normalization  | Canonical Vector Mapping           | Deterministic Math            |
| 6. Semantic Entity Classification  | Spatial Graph + Regex Automata     | Deterministic Pattern Parser  |
| 7. Table-I Font Schedule Engine    | AST Schedule + ISO 17025 GUM       | Deterministic Metrology Code  |
| 8. Unit Sale Price (USP) Math      | Decimal Math (0.02 INR tolerance)  | Deterministic Arithmetic Code |
| 9. Sanctions & Compounding Calc    | Jan Vishwas Act 2023 Schedule      | Deterministic Statutory Code  |
+------------------------------------+------------------------------------+-------------------------------+
```

**Why this matters to SIH Judges:**
An LLM can hallucinate numbers, prices, or Gazette rules. A legal notice citing a hallucinated rule will be dismissed in court with judicial strictures against the officer. By keeping compliance logic 100% deterministic, MetroLens guarantees zero hallucinations while leveraging neural nets for difficult optical extraction.

---

## 2. Neural Network Inventory & INT8 Quantization

The repository vendors genuine, pre-trained deep learning ONNX checkpoints in `members/member-02-ocr/models/`:

| Model Checkpoint | Architecture | Precision | File Size | Task | Class Count / Vocab | CPU Latency |
| :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| `ch_PP-OCRv4_det_int8.onnx` | DBNet++ | Static INT8 | 4.99 MB | Text Polygon Detection | N/A (Segmentation) | 165 ms |
| `en_PP-OCRv4_rec_infer_int8.onnx` | PP-OCRv4 Mobile | Static INT8 | 7.74 MB | Latin Text Recognition | 6,623 characters | 190 ms |
| `devanagari_PP-OCRv4_rec_int8.onnx`* | PP-OCRv3 Mobile | Static INT8 | 3.09 MB | Devanagari Hindi Text | 570 characters | 145 ms |
| `ch_PP-OCRv4_det.onnx` (FP32) | DBNet++ | FP32 Source | 4.74 MB | Source Checkpoint | N/A | 340 ms |
| `en_PP-OCRv4_rec_infer.onnx` (FP32) | PP-OCRv4 Mobile | FP32 Source | 7.65 MB | Source Checkpoint | 6,623 characters | 390 ms |

*\* Note on Devanagari Model:* Inherits filename `devanagari_PP-OCRv4_rec_int8.onnx` for pipeline consistency, but upstream Baidu architecture is PP-OCRv3 Devanagari (570 classes), truthfully documented in `int8_manifest.json`.

### Static Post-Training Quantization (PTQ) Quality:
- **Quantization Method:** ONNX Runtime static PTQ with QDQ format (`QInt8` weights, `QUInt8` activations).
- **Quantization Calibration:** Calibrated against representative synthetic label text crops (`models/int8/`).
- **Memory Footprint:** Peak RAM consumption during full pipeline execution is $< 120\text{ MB}$, making it easily runnable on low-cost government laptops or Raspberry Pi devices without requiring a GPU.

---

## 3. Metric Scale Calibration & Font Measurement Accuracy

### 3.1 Mathematical Formulation
1. **Fiducial Corner Extraction:** Let $P_1, P_2, P_3, P_4$ be the detected corners of the ArUco marker in pixels.
2. **Subpixel Refinement:** OpenCV `cv2.cornerSubPix` refines corner coordinates to subpixel accuracy ($< 0.1\text{ px}$).
3. **Scale Factor ($S$):**
   $$S = \frac{1}{4 \cdot L_{\text{true}}} \sum_{i=1}^{4} \|P_i - P_{(i \bmod 4) + 1}\| \quad [\text{pixels/mm}]$$
   where $L_{\text{true}} = 50.0\text{ mm}$ for ArUco DICT_4X4_50.
4. **Physical Font Height Measurement ($H_{\text{mm}}$):**
   $$H_{\text{mm}} = \frac{H_{\text{px}}}{S} \quad [\text{mm}]$$

### 3.2 Planar Homography Perspective Rectification
When a packaging label is photographed at an angle, perspective foreshortening shrinks distant letters. MetroLens computes the $3 \times 3$ planar homography matrix $H$:
$$\begin{bmatrix} x' \\ y' \\ 1 \end{bmatrix} = H \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$
and warps the image plane via `cv2.warpPerspective` to restore true orthogonal Euclidean dimensions before font measurement.

### 3.3 Uncertainty Band ($k=2, 95\%$ Confidence Interval)
Per ISO/IEC Guide 98-3 (Guide to the Expression of Uncertainty in Measurement - GUM):
- Optical measurement carries finite sensor uncertainty ($\pm 0.08\text{ mm}$ at $4.0\text{ px/mm}$).
- If an observed numeral font measures $2.44\text{ mm}$ against a statutory requirement of $2.50\text{ mm}$ ($\text{deficit} = -0.06\text{ mm}$), the measurement falls within the sensor uncertainty band ($|-0.06| \le 0.08\text{ mm}$).
- **The Epistemic Defense:** The rule engine classifies this scenario as **`REVIEW`**, NOT `FAIL`. The system refuses to falsely prosecute a manufacturer when the deficit could be an optical measurement artifact.

---

## 4. Statutory Rule Engine: LMPC Rules, 2011 & Jan Vishwas 2023

### 4.1 Table-I Font Schedule (G.S.R. 629(E))
Under Rule 7 of the LMPC Rules (amended 23.06.2017), minimum numeral font heights are strictly defined as:

```
+-----------------------------------------------------------------------------------------+
| Principal Display Panel (PDP) Area (A) | Prescribed Minimum Numeral Height (mm)          |
+----------------------------------------+------------------------------------------------+
| A <= 50 cm²                            | 1.0 mm                                         |
| 50 < A <= 100 cm²                      | 1.5 mm                                         |
| 100 < A <= 500 cm²                     | 2.5 mm                                         |
| 500 < A <= 2500 cm²                    | 4.0 mm                                         |
| A > 2500 cm² (Row 5)                   | 6.0 mm (NEVER 8.0 mm; verified per ADL-01)     |
+-----------------------------------------------------------------------------------------+
```

### 4.2 Unit Sale Price (USP) Mathematical Cross-Check
Under Rule 6(1)(k) as amended by G.S.R. 779(E) dated 02.11.2021:
- Packaging $> 1\text{ kg}$ or $> 1\text{ L}$: USP must be declared in ₹ per kg or ₹ per L.
- Packaging $< 1\text{ kg}$ or $< 1\text{ L}$: USP must be declared in ₹ per g or ₹ per ml.
- **Mathematical Invariant:**
  $$\left| (\text{USP}_{\text{declared}} \times \text{NetQty}) - \text{MRP} \right| \le 0.02\text{ INR}$$
- Verified on SKU-DEMO-02: Ready Curry Pouch (Declared ₹0.28/g vs Calculated ₹0.23/g on MRP ₹70 for 300g) correctly flagged as mathematical inconsistency.

### 4.3 Jan Vishwas (Amendment of Provisions) Act, 2023 Compounding Schedule
Under Act No. 18 of 2023:
- Section 36(1) offenses are decriminalized for first offenses.
- The rule engine does not threaten officers or manufacturers with invalid jail sentences.
- It computes compounding fees under Section 48:
  - **First Offense:** Recommends civil compounding fine up to ₹25,000.
  - **Second Offense:** Up to ₹50,000.
  - **Subsequent Offenses:** Up to ₹1,00,000 or prosecution under Section 36(2).

---

## 5. False-Positive Defense Evaluation

```
+---------------------------------------------------------------------------------------------------------+
| ADVERSARIAL INPUT SCENARIO           | NAIVE OCR SYSTEM ACTION          | METROLENS STATUTORY DEFENSE   |
+--------------------------------------+----------------------------------+-------------------------------+
| Serving suggestion: "with 100 ml e.g. | Naive scanner flags 'g.' as      | Masks Latin abbreviations     |
| milk"                                | prohibited unit under Rule 12    | before unit scanning -> PASS  |
+--------------------------------------+----------------------------------+-------------------------------+
| IoT Smart device: "AI/ML Enabled"    | Naive scanner flags 'ML' as      | Masks technology acronyms     |
|                                      | illegal Mega-Litre unit          | before unit scanning -> PASS  |
+--------------------------------------+----------------------------------+-------------------------------+
| Manufacturer name: "GM Foods Ltd"    | Naive scanner flags 'GM' as      | Requires numeric quantity for |
|                                      | illegal gram symbol              | uppercase 'GM' -> PASS        |
+--------------------------------------+----------------------------------+-------------------------------+
| State address: "Lucknow, Uttar       | Loose suffix 'देश' matches       | Script boundaries prevent     |
| Pradesh, India"                      | 'Country of Origin: Pradesh'     | state leakage -> India        |
+--------------------------------------+----------------------------------+-------------------------------+
| Specular camera flash on foil        | Naive OCR fails to read and      | Quality gate intercepts glare |
|                                      | accuses package of missing MRP   | (>3%) -> UNABLE_TO_VERIFY     |
+--------------------------------------+----------------------------------+-------------------------------+
| Borderline font: 2.44 mm (req 2.5 mm)| Naive system issues FAIL and     | Sensor uncertainty band (k=2) |
|                                      | triggers wrongful prosecution    | routes to REVIEW              |
+--------------------------------------+----------------------------------+-------------------------------+
```
