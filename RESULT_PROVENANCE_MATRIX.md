# RESULT PROVENANCE MATRIX
## Provenance, Source of Truth, and Data Flow Traceability

**System:** NyayaDrishti-LM (SIH26034)  
**Standard:** Section 63 BSA 2023 Digital Evidence Admissibility  
**Date:** 12 September 2026  

---

## 1. System Provenance Architecture

In statutory metrology enforcement, every number and text field must trace back to verifiable electronic evidence. The table below documents the exact mathematical and algorithmic provenance for every output field rendered in NyayaDrishti-LM.

| Output Field | Pipeline Source | Algorithm / Engine | Provenance Verification | Storage Location |
| :--- | :--- | :--- | :--- | :--- |
| **Image Focus / Blur** | Member 1 | Laplacian Operator Variance ($\sigma^2$) | Computed directly from OpenCV gray-scale matrix | `evidence_images.blur_variance` |
| **Glare Saturation %** | Member 1 | Specular pixel intensity ratio ($I > 250$) | Percentage of high-luminance pixels in packaging mask | `evidence_images.glare_percentage` |
| **Physical Scale ($mm/px$)** | Member 1 | ArUco 4x4_50 Fiducial / Planar Homography | Euclidean pixel distance of 50.0 mm reference square | `evidence_images.scale_px_per_mm` |
| **Principal Display Area** | Member 1 | Homography polygon surface calculation | Rectified surface quadrilateral integral ($cm^2$) | `evidence_images.pdp_area_cm2` |
| **Raw Text & Boxes** | Member 2 | DBNet++ Detection + PP-OCR Recognition | Normalized bounding coordinates $[x_1, y_1, x_2, y_2]$ | `bounding_boxes` table |
| **Net Quantity Magnitude** | Member 3 | Statutory Regex Parser + Unit Normalizer | Regex extraction with Indic numeral normalization | `commodity_facts.net_quantity` |
| **Prohibited Unit Flag** | Member 3 | Banned Unit Filter (Rule 12 / Sec 11) | Lexical match against `gms`, `ML`, `ltrs` | `commodity_facts.has_banned_unit` |
| **MRP Amount & Tax** | Member 3 | Price Extraction + Tax Clause Filter | Pattern matching against ₹ / Rs / MRP / incl. taxes | `commodity_facts.mrp` |
| **Unit Sale Price (USP)** | Member 3 & 4 | Arithmetic verification: $\vert (USP \times Qty) - MRP \vert \le 0.02$ | Mathematical cross-check against declared USP | `compliance_evaluations` |
| **Table-I Font Schedule** | Member 4 | Schedule Table-I Area-to-Height Thresholds | Comparison of measured millimeter height vs schedule threshold | `compliance_evaluations` |
| **Statutory Sanction** | Member 4 | Jan Vishwas Act, 2023 Section 36 Calculator | Offense history (1st, 2nd, 3rd) to compounding fee mapping | `compliance_evaluations` |
| **Electronic Evidence SHA** | Member 5 | SHA-256 Digest of raw upload bytes | RFC 6234 standard cryptographic hashing | `evidence_images.sha256_hash` |
| **Merkle Root Digest** | Member 5 | 7-Stage Pipeline Evidence DAG | Hierarchical SHA-256 hashing across all stage nodes | `audit_logs.entry_hash` |
| **Section 63 Certificate** | Member 5 | Section 63 BSA 2023 Certificate Generator | Monotonic timestamp + Device hash + Officer HMAC | `bsa_certificates` table |
| **Adjudication State** | Member 6 / User | Human-in-the-Loop Officer Decision | Officer click event + mandatory written rationale | `inspections.status` |

---

## 2. Integrity Guarantees

1. **Zero Client-Side Calculation of Law:** The frontend React application is strictly an evidentiary viewer. All legal evaluations, font schedules, and compounding fees are generated exclusively by the Python backend.
2. **Immutable Chain of Custody:** Any alteration of an image pixel, bounding box coordinate, or extracted fact changes the leaf hash and corrupts the Section 63 BSA Merkle root, immediately alerting the court of tampering.
3. **No Mock Interference:** Production routes query PostgreSQL (Mode A) or local SQLite (Mode B). Synthetic fixtures are restricted to automated testing harnesses and the judge demo preview.
