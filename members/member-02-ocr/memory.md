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
