# 07_API_AND_INTERFACE_CONTRACTS.md

# SIH26034 - Legal Metrology Automated Compliance System

## Complete API Contracts, OpenAPI 3.1 Schemas & Pipeline Data Transfer Objects (DTOs)

---

### 1. API Architecture & Standards

- **Specification:** OpenAPI 3.1.0 / RESTful JSON over TLS 1.3
- **Base URI:** `/api/v1`
- **Internal Contract Modeling:** Pydantic v2 (Strict Typing, Zero Implicit Coercion)
- **Authentication:** RFC 7519 Bearer JWT (`Authorization: Bearer <token>`) containing `user_id`, `role`, `jurisdiction_id`
- **Standard Header Contract:**
  - `X-Request-ID`: UUID4 for distributed tracing across pipeline stages.
  - `X-Client-Version`: Version of mobile capture app or web portal.
  - `X-Device-Fingerprint`: Forensic hardware identifier for Section 63 BSA 2023 chain of custody.

---

### 2. External REST API Endpoint Catalog

```
+--------------------------------------------------------------------------------------------------+
| VERB   | ENDPOINT                             | DESCRIPTION                                      |
+--------------------------------------------------------------------------------------------------+
| POST   | /api/v1/auth/login                   | Officer login; returns access JWT & permissions  |
| GET    | /api/v1/auth/me                      | Retrieves authenticated user profile & role      |
| POST   | /api/v1/inspections/upload           | Uploads raw packaging image + capture metadata   |
| POST   | /api/v1/inspections/ecommerce        | Ingests e-commerce listing URL or DOM snapshot   |
| POST   | /api/v1/pipeline/execute/{image_id}  | Triggers synchronous 12-stage AI pipeline        |
| GET    | /api/v1/inspections                  | Lists inspections (paginated, circle/status filter)|
| GET    | /api/v1/inspections/{id}             | Retrieves complete inspection report and audit   |
| PATCH  | /api/v1/inspections/{id}/adjudicate  | Human officer adjudication approval or override  |
| POST   | /api/v1/notices/generate             | Emits Form-1/2 Legal Notice & BSA Certificate    |
| GET    | /api/v1/notices/{id}/pdf             | Downloads tamper-proof signed PDF/A bundle       |
| GET    | /api/v1/dashboard/summary            | Aggregates violation statistics & circle metrics |
| GET    | /api/v1/audit/chain-verify           | Audits cryptographic hash integrity of logs      |
| GET    | /api/v1/system/status                | System connectivity & database health check      |
| POST   | /api/v1/inspections/sync-bundle      | Ingests offline inspection bundle from Mode B    |
+--------------------------------------------------------------------------------------------------+
```

---

### 3. Concrete REST Request/Response Schemas

#### 3.1 POST `/api/v1/inspections/upload`

**Request:** `multipart/form-data`

- `image`: Binary image file (JPEG/PNG, $\ge 1920 \times 1080$, max 25 MB).
- `metadata`: Serialized JSON string conforming to `UploadMetadata`:

```json
{
  "capture_source": "PHYSICAL_FIELD",
  "product_name": "Crunchy Almond Cookies 200g",
  "brand_name": "Sunfeast",
  "category": "FOOD_SNACKS",
  "package_type": "RECTANGULAR",
  "reference_marker": {
    "marker_type": "ARUCO_4X4_50",
    "known_dimension_mm": 50.0
  },
  "clock_source": "LOCAL_DEVICE_MONOTONIC",
  "jurisdiction_circle_id": "CIRCLE_DL_SOUTH_01",
  "gps_coordinates": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "altitude": 216.5
  },
  "device_telemetry": {
    "device_model": "Samsung Galaxy Tab Active4 Pro",
    "os_version": "Android 14",
    "app_build": "v1.4.0-sih"
  }
}
```

*Note: `gps_coordinates` is optional/nullable (`null` when running indoors or on laptop hardware without GNSS sensors, with fallback to `jurisdiction_circle_id`).*

**Response:** `201 Created`

```json
{
  "status": "SUCCESS",
  "inspection_id": "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094",
  "image_id": "img_3a1e9b20-1123-4567-89ab-cdef01234567",
  "raw_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "quality_gate": {
    "passed": true,
    "blur_variance": 342.18,
    "glare_percentage": 0.84,
    "skew_angle_deg": 1.45
  },
  "message": "Image successfully ingested, hashed, and queued for pipeline execution."
}
```

---

#### 3.2 POST `/api/v1/pipeline/execute/{image_id}`

**Request:** Empty body (or optional pipeline tuning overrides).
**Response:** `200 OK`

```json
{
  "inspection_id": "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094",
  "execution_time_ms": 782,
  "calibration": {
    "method": "ARUCO_4X4_50",
    "px_to_mm": 12.45,
    "margin_of_error_pct": 1.2
  },
  "principal_display_panel": {
    "package_area_cm2": 280.0,
    "pdp_area_cm2": 112.0,
    "pdp_area_percentage": 40.0,
    "bounding_box": [120, 80, 1850, 1020]
  },
  "extracted_fields": [
    {
      "field_type": "NET_QUANTITY",
      "raw_ocr_text": "Net Weight: 150 g",
      "normalized_value": {
        "magnitude": 150.0,
        "unit": "g"
      },
      "detection_confidence": 0.984,
      "ocr_confidence": 0.971,
      "bounding_box": [820, 210, 880, 540],
      "measured_font_height_mm": 2.12,
      "measurement_confidence": 0.94
    },
    {
      "field_type": "MRP",
      "raw_ocr_text": "MRP Rs. 35.00 (incl. of all taxes)",
      "normalized_value": {
        "amount": 35.0,
        "currency": "INR",
        "tax_inclusive": true
      },
      "detection_confidence": 0.991,
      "ocr_confidence": 0.985,
      "bounding_box": [910, 210, 960, 680],
      "measured_font_height_mm": 3.45,
      "measurement_confidence": 0.96
    },
    {
      "field_type": "UNIT_SALE_PRICE",
      "raw_ocr_text": "Rs. 0.23 / g",
      "normalized_value": {
        "price_per_unit": 0.23,
        "unit": "g"
      },
      "detection_confidence": 0.962,
      "ocr_confidence": 0.954,
      "bounding_box": [975, 210, 1015, 430],
      "measured_font_height_mm": 2.8,
      "measurement_confidence": 0.92
    }
  ],
  "rule_evaluations": [
    {
      "rule_code": "RULE_06_1_H_NET_QTY_FONT",
      "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
      "status": "FAIL",
      "severity": "CRITICAL",
      "required_value": ">= 4.00 mm (PDP area 112 cm2)",
      "measured_value": "2.12 mm",
      "discrepancy": "-1.88 mm (-47.0%)",
      "legal_consequence": "Misbranded / Non-compliant under Section 36(1) LM Act 2009"
    },
    {
      "rule_code": "RULE_06_1_K_USP_COMPUTATION",
      "statutory_reference": "Rule 6(1)(k), G.S.R. 779(E)",
      "status": "PASS",
      "severity": "CRITICAL",
      "required_value": "Rs. 0.23 / g (MRP 35 / 150g)",
      "measured_value": "Rs. 0.23 / g",
      "discrepancy": "0.00",
      "legal_consequence": "Compliant"
    }
  ],
  "ai_verdict": "FAIL",
  "adjudication_required": true
}
```

---

#### 3.3 PATCH `/api/v1/inspections/{id}/adjudicate`

**Request Body:**

```json
{
  "adjudication_verdict": "CONFIRM_VIOLATION",
  "override_applied": false,
  "officer_remarks": "Visual verification on calibrated display confirms Net Quantity font height is 2.12 mm, which is below the statutory 4.0 mm requirement for a 112 cm² PDP.",
  "action_order": "GENERATE_LEGAL_NOTICE_FORM_1",
  "officer_pin_hash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
}
```

**Response:** `200 OK`

```json
{
  "inspection_id": "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094",
  "final_status": "FAIL",
  "adjudicated_by": "INSP-DL-0842 (Rajesh Sharma)",
  "adjudicated_at": "2026-09-07T11:45:00Z",
  "next_action": "/api/v1/notices/generate"
}
```

---

#### 3.4 POST `/api/v1/notices/generate`

**Request Body:**

```json
{
  "inspection_id": "insp_8f7b2c14-9d1a-4d2b-a312-c7f3e82d1094",
  "recipient": {
    "type": "MANUFACTURER",
    "name": "Sunfeast Foods India Private Limited",
    "address": "Plot No. 14, Industrial Area, Sector 58, Gurugram, Haryana 122011",
    "email": "legal.compliance@sunfeast.example.com"
  },
  "compounding_fee_amount": 25000.0,
  "reply_window_days": 15
}
```

**Response:** `201 Created`

```json
{
  "notice_reference_number": "LMO/DL/SOUTH/2026/0842",
  "bsa_certificate_number": "CERT-BSA2023-20260907-0842",
  "statutory_mandate": "Section 36(1) of Legal Metrology Act, 2009 read with Section 63 BSA 2023",
  "pdf_download_url": "/api/v1/notices/not_4e2a1b90/pdf",
  "merkle_entry_hash": "8c42b9101adfa9280194bc0281efca891048bca120938a1ef908123bcdef0123"
}
```

---

### 4. Internal Pipeline Data Transfer Objects (Pydantic v2 Python Schemas)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from enum import Enum

class QualityCheckDTO(BaseModel):
    is_valid: bool
    laplacian_blur: float
    glare_percentage: float
    tilt_angle_deg: float
    rejection_reason: Optional[str] = None

class CalibrationDTO(BaseModel):
    method: Literal["ARUCO_4X4_50", "STANDARD_COIN", "MANUAL_FIXED", "UNRESOLVED"]
    px_to_mm: float
    confidence: float
    reference_bounding_box: List[int] # [ymin, xmin, ymax, xmax]

class ExtractedFieldDTO(BaseModel):
    field_name: str
    raw_text: str
    cleaned_value: str
    ocr_confidence: float
    detection_box: List[int] # Coordinates in pixels
    measured_height_mm: Optional[float] = None

class RuleEvaluationDTO(BaseModel):
    rule_id: str
    citation: str
    verdict: Literal["PASS", "FAIL", "WARNING", "NOT_APPLICABLE"]
    severity: Literal["CRITICAL", "MAJOR", "MINOR"]
    expected_value: str
    actual_value: str
    discrepancy: Optional[str] = None
    legal_section: str = "Section 36(1) Legal Metrology Act, 2009"

class PipelineOutputDTO(BaseModel):
    inspection_id: str
    raw_sha256: str
    quality: QualityCheckDTO
    calibration: CalibrationDTO
    fields: List[ExtractedFieldDTO]
    evaluations: List[RuleEvaluationDTO]
    composite_verdict: Literal["PASS", "FAIL", "WARNING"]
    execution_time_ms: int
```

---

### 5. Error Handling & HTTP Status Standards

```json
{
  "error_code": "CALIBRATION_MARKER_NOT_FOUND",
  "status": 422,
  "message": "ArUco 4x4 reference marker or fiducial benchmark could not be resolved in the captured image.",
  "remediation": "Ensure the official 50mm reference calibration card is placed on the same focal plane as the principal label and not obscured.",
  "timestamp": "2026-09-07T11:32:00Z"
}
```

- Standard Codes:
  - `400 Bad Request`: Malformed JSON or missing mandatory fields.
  - `401 Unauthorized`: Missing or expired Bearer JWT token.
  - `403 Forbidden`: Role permission violation (e.g. Viewer attempting to sign notice).
  - `422 Unprocessable Entity`: Quality gate failed (severe blur, glare, missing marker).
  - `500 Internal Server Error`: Unhandled pipeline exception (logged to Merkle audit).
