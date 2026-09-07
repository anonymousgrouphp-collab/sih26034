# FINAL TESTING AND VALIDATION PLAN

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Audience:** Entire Engineering Team & Quality Assurance  
**Status:** FROZEN  

---

### 1. Multi-Tier Testing Strategy Overview

The testing methodology ensures that every statutory rule, optical transformation, web API endpoint, evidentiary hash chain, and user workflow is rigorously validated under both simulated lab conditions and live network/retail conditions.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     THE 5-TIER TEST PYRAMID                                            │
├────────────────────────────────┬────────────────────────────────┬──────────────────────────────────────┤
│ TIER 1: DETERMINISTIC UNIT     │ TIER 2: METROLOGY & CV         │ TIER 3: WEB API & INTEGRATION        │
│ • Deterministic regex syntax   │ • ArUco planar homography vs   │ • FastAPI endpoints & Pydantic v2    │
│ • Statutory AST boolean logic  │   vernier caliper ground truth │ • JWT auth & RBAC route permissions  │
│ • USP floating-point math      │ • Sub-pixel font height error  │ • Multipart upload magic byte check  │
│ • Merkle DAG hash propagation  │ • Target: MAE <= 0.15 mm       │ • PostgreSQL schema & migration test │
├────────────────────────────────┴────────────────────────────────┴──────────────────────────────────────┤
│ TIER 4: WEB CLIENT E2E & RESILIENCY TESTS                                                              │
│ • Browser SPA end-to-end user workflows on Chrome/Edge/Firefox                                         │
│ • Central dashboard loading, search, filter, and pagination performance                               │
│ • Mode B offline resilience & network disruption recovery                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ TIER 5: REAL-WORLD PILOT ACCEPTANCE TESTS (50 Physical FMCG SKUs)                                      │
│ • 50 real retail packages measured with digital vernier calipers (+/- 0.02 mm)                         │
│ • Evaluating false positives (FPR) and false negatives (FNR) on market inventory                       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Comprehensive Test Suite Specification

| Test Suite ID | Subsystem Tested | Test Scenario Description | Test Input Fixture | Expected Deterministic Output | Owner |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TS-UNIT-01** | Banned Units Parser | Package label contains `Net Wt: 500 gms` | String `"Net Wt: 500 gms"` | `VIOLATION_FLAG: Section 11 / Rule 12 Banned Unit 'gms'` | M3 |
| **TS-UNIT-02** | Banned Units Parser | Package label contains `Volume: 750 ML` | String `"Volume: 750 ML"` | `VIOLATION_FLAG: Section 11 / Rule 12 Banned Unit 'ML'` | M3 |
| **TS-UNIT-03** | Valid Units Parser | Package label contains `Net Quantity: 500 g` | String `"Net Quantity: 500 g"` | `PASS: Valid SI unit 'g'` | M3 |
| **TS-UNIT-04** | USP Math Validator | $200\text{ g}$ pack, MRP ₹80, declared USP ₹0.40/g | Qty: 200, MRP: 80, USP: 0.40 | `PASS: \|(0.40 * 200) - 80\| = 0.00 <= 0.02` | M4 |
| **TS-UNIT-05** | USP Math Validator | $400\text{ g}$ pack, MRP ₹200, declared USP ₹0.60/g | Qty: 400, MRP: 200, USP: 0.60 | `VIOLATION_FLAG: \|(0.60 * 400) - 200\| = 40.00 > 0.02` | M4 |
| **TS-UNIT-06** | Table-I Font Schedule | PDP Area $450\text{ cm}^2$ (Row 3), measured font $2.8\text{ mm}$ | PDP: 450, Height: 2.8, Req: 2.5 | `PASS: 2.8 mm >= 2.5 mm Table-I Row 3` | M4 |
| **TS-UNIT-07** | Table-I Font Schedule | PDP Area $450\text{ cm}^2$ (Row 3), measured font $1.8\text{ mm}$ | PDP: 450, Height: 1.8, Req: 2.5 | `VIOLATION_FLAG: Deficit 0.7 mm citing Row 3` | M4 |
| **TS-UNIT-08** | Table-I Row 5 Blown | PDP Area $2800\text{ cm}^2$, Blown container, font $6.2\text{ mm}$ | PDP: 2800, Blown, Height: 6.2, Req: 6.0 | `PASS: 6.2 mm >= 6.0 mm (Row 5 verified)` | M4 |
| **TS-UNIT-09** | Consumer Care Check | Declaration has Tel, Address, Contact, but **no email** | Consumer care text block | `VIOLATION_FLAG: Rule 6(1)(g) Missing Email Address` | M3 |
| **TS-UNIT-10** | Temporal Epoch Router | Package manufactured 10/2021 (pre-USP amendment) | Mfg Date: 2021-10-15 | `ROUTE: EPOCH_2017_GSR_629 (Skip Rule 6(1)(f))` | M4 |
| **TS-UNIT-11** | Temporal Epoch Router | Package manufactured 03/2023 (post-USP amendment) | Mfg Date: 2023-03-20 | `ROUTE: EPOCH_2021_GSR_779 (Enforce Rule 6(1)(f))` | M4 |
| **TS-UNIT-12** | E-Commerce Engine | Online listing missing Manufacturing Date | E-com listing payload | `PASS: Rule 6(10) Statutorily Exempts Mfg Date` | M4 |
| **TS-UNIT-13** | E-Commerce Engine | Online listing missing Country of Origin | E-com listing payload | `VIOLATION_FLAG: Rule 6(10) / Rule 6(1)(aa)` | M4 |
| **TS-CALIB-01** | ArUco Homography | Planar target tilted $25^\circ$ with known $20\text{ mm}$ marker | Synthetic tilted render | Scale factor $S$ derived within $\pm 0.05\text{ mm/px}$ | M1 |
| **TS-CALIB-02** | Font Caliper Parity | Rectified image of physical pack with caliper baseline | Physical pack crop (caliper: 2.45 mm) | Predicted height $2.45 \pm 0.12\text{ mm}$ (MAE $\le 0.15\text{ mm}$) | M1 |
| **TS-OPTIC-01** | Quality Gate Blur | Blurred photo caused by camera movement | Laplacian variance $\sigma^2 = 32.4$ | `UNABLE_TO_VERIFY (IMAGE_BLURRED)` with retake prompt | M1 |
| **TS-OPTIC-02** | Quality Gate Glare | Specular reflection bloom over MRP text | HSV mask ($V > 245, S < 15$) on text crop | `UNABLE_TO_VERIFY (SPECULAR_GLARE)` with tilt prompt | M1 |
| **TS-EVID-01** | Merkle DAG Integrity | Full inspection session hashed into DAG | Node payloads from Stage 1 to 6 | Merkle Root matches cryptographic recalculation | M5 |
| **TS-EVID-02** | Tamper Detection | Manually alter 1 character in extracted MRP in JSON | Corrupted JSON payload | Merkle verification fails; flag `RECORD_TAMPERED` | M5 |
| **TS-WEB-01** | File Upload Security | Upload `.exe` renamed to `.jpg` or file $> 15\text{ MB}$ | Malicious file payload | Backend rejects with `415 Unsupported Media Type` or `413 Payload Too Large` | M5 |
| **TS-WEB-02** | Web Auth & RBAC | Field LMO tries to access Controller compounding endpoint | JWT with `role: FIELD_LMO` | Backend returns `403 Forbidden` | M5 |
| **TS-WEB-03** | Central Dashboard & History | Query paginated inspections with filters (state, date, circle) | 1,000 synthetic records in PostgreSQL | Response within $< 100\text{ ms}$; correct pagination & counts | M5 |
| **TS-SYS-01** | Mode A Online E2E | End-to-end inspection via web browser SPA | Browser upload of retail pack | Inspection completes in $< 1800\text{ ms}$; PDF dossier downloadable | M6 |
| **TS-SYS-02** | Mode B Local Resilience | Disconnect network on field laptop (airplane mode) | Local execution script/UI | Core inspection executes locally; generates signed local PDF | M6 |
| **TS-SYS-03** | Network Disruption Recovery | Cut network connection during multipart upload / analysis | Simulated socket drop | Client notifies user gracefully; cached state saved locally in session | M6 |
| **TS-SYS-04** | Mode B to A Sync Bundle | Upload offline-generated `.bundle.json` to central server | Valid signed sync bundle | Server validates Merkle root, stores in PostgreSQL, updates dashboard | M5 |

---

### 3. Quantitative Acceptance Benchmarks

1. **Optical Metric Accuracy:** Mean Absolute Error (MAE) $\le 0.15\text{ mm}$ on planar packaging at camera distances between $15\text{ cm}$ and $25\text{ cm}$.
2. **Text Recognition Accuracy:** Character Error Rate (CER) $\le 3.0\%$ on clean printed packaging text; CER $\le 7.0\%$ on curved or glossy foil crops.
3. **Statutory Extraction F1-Score:** Macro F1 $\ge 0.95$ across mandatory declarations (MRP, Net Qty, Dates, Origin, Consumer Care).
4. **False Positive Violation Rate (FPR):** $\le 2.0\%$ on compliant packs (zero false accusations against lawful brands).
5. **False Negative Violation Rate (FNR):** $\le 1.0\%$ on unambiguous statutory violations (prohibited units, missing origin, USP math error).
6. **Online Web Response Latency (TARGET):** $\le 1800\text{ ms}$ total round-trip time (network upload + server CPU inference + rule evaluation + JSON payload return) over standard broadband / 4G connections.
7. **Local CPU Engine Latency (BENCHMARK):** $\le 1200\text{ ms}$ cold-start / warm-run inference on standard 4-core Intel Core i5 / AMD Ryzen 5 processor.
8. **Web Portal Concurrency:** $\ge 20$ concurrent active inspection sessions per Uvicorn worker without memory exhaustion ($< 2\text{ GB}$ RSS memory per worker).
