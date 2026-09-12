# Final Real Data Handoff

## 1. How to run the Real SKU Test Suite
The full adversarial and physical validation test suite is automated via the `generate_reports.py` script. 
To execute the suite, run the following command from the project root:
```bash
python generate_reports.py
```

## 2. Where the Real Images Are
All 75 physical packaging images used for validation are located in:
`C:\Users\kunal\Desktop\updated SIH26034 - 10th sep\Legal Metrology real product images`

## 3. How SKUs are Mapped
The system no longer relies on arbitrary filename or directory-based SKU mapping. Instead, the `inspect_cli.py` and `server.py` endpoints treat every image as a raw visual input, stripping away any directory inferences to guarantee pure OCR/CV processing.

## 4. How to Run One SKU
To evaluate a single image through the complete pipeline without any mock fallbacks:
```bash
python inspect_cli.py --image "Legal Metrology real product images\Earbuds\Earbuds\img (1).jpeg" --json
```

## 5. How to Run All SKUs
Run the test runner to sequentially inspect all images:
```bash
python generate_reports.py
```
This will automatically generate the `REAL_SKU_TEST_MATRIX.csv` detailing the telemetry of every single image.

## 6. How to Reproduce Failures
To reproduce an extraction or legal logic failure, pass the specific failing image into `inspect_cli.py` or upload it directly through the UI. Because all `sku_demo_*.json` short-circuits have been severed, the system will reliably reproduce the exact error state in the OCR or Extraction layer.

## 7. How to Inspect Evidence
Evidence crops and confidence scores are embedded directly in the JSON output from `inspect_cli.py` under the `statutory_findings` and `evidence_bundle` keys. They can also be viewed by uploading the image via the React Dashboard (Mode A).

## 8. How to Interpret Results
*   **PASS**: All mandatory statutory declarations (MRP, Net Qty, Dates, Address) were found and adhere to LMPC Rules, 2011 formatting standards.
*   **FAIL**: A declaration was found but violates a specific Legal Metrology rule (e.g., incorrect Unit of Measurement, missing manufacturer details).
*   **REVIEW**: The image quality degraded (glare/blur) preventing absolute algorithmic certainty, or a field was partially obscured.
*   **UNABLE_TO_VERIFY**: Absolute failure to detect any package boundary or text.

## 9. Known Limitations
*   Severely curved text (e.g., small cylindrical bottles) occasionally drops characters if the OCR perspective rectification fails.
*   Reflective metallic packaging (like silver foil wrappers) heavily depends on ambient lighting; severe glare bloom causes the OCR to return fragmented tokens.
*   The system cannot verify physical volumetric properties (e.g., if a bottle says 500mL but actually contains 450mL). It only verifies the *labeling compliance*.

## 10. Physical Validation Still Pending
*   Geometric surface area calculation (Table-I Font Schedule) relies on a physical reference object (like a standardized ID card or coin) for pixel-to-mm calibration. End-users must provide a reference object in frame for 100% accurate spatial measurement.

## 11. Recommended Next Steps
*   Integrate a dynamic glare-reduction filter in the camera capture UI before the image is submitted to the backend.
*   Expand the OCR training data specifically targeting regional Devanagari script on low-contrast backgrounds.
*   Implement a guided retake prompt in the UI when the `QualityGate` detects sub-optimal focus or illumination.
