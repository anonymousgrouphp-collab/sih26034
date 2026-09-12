# 08_DATABASE_SPECIFICATION.md

# SIH26034 - Legal Metrology Automated Compliance System

## Complete Database Schema, Relational DDL, Indexing Strategy & Data Integrity Specifications

---

### 1. Database & Storage Architecture

To provide scalable multi-user support for the online web application while retaining standalone field resilience, the database and persistence architecture follows a decoupled, dual-tier strategy:

1. **Central Online Production Datastore (Primary Product - Mode A):**
   - Engine: **PostgreSQL 16+** with `pgcrypto` and `uuid-ossp` extensions.
   - Purpose: Authoritative system of record for all user authentication, circle jurisdictions, inspection dossiers, compliance findings, legal notices, and cryptographic audit ledgers.
   - Concurrency: High-throughput connection pooling via PgBouncer.
   - Multi-Tenant & Scalable: Centralized search across circles, districts, and time periods with compound indexes.
2. **Local Edge Datastore (Optional Resiliency - Mode B & Local Dev):**
   - Engine: **SQLite 3.45+ with SQLCipher** (AES-256 transparent file encryption).
   - Purpose: Self-contained embedded database (`legal_metrology.db`) for standalone local execution when inspecting remote areas with zero internet access.
   - Zero Configuration: No external daemons, ports, or credentials required for local offline execution.
3. **Image & Evidence File Storage Decoupling:**
   - **Crucial Rule:** High-resolution packaging photos ($\ge 1080\text{p}$) and generated PDF notices are **NEVER stored as binary BLOBs inside relational database tables**.
   - Storage Location: Structured server filesystem directories (`/storage/uploads/YYYY/MM/DD/` and `/storage/evidence/YYYY/MM/DD/`) or S3-compatible object storage.
   - Database Role: Stores relative file paths/URIs, image dimensions, calibration scale, and cryptographic SHA-256 hashes in `evidence_images` and `legal_notices`.
   - Ingestion Pipeline: `UPLOAD -> VALIDATION -> PROCESSING -> STORAGE -> EVIDENCE LINK -> REPORT`.
4. **Offline Synchronization Protocol (Mode B to Mode A):**
   - Local inspections in Mode B generate globally unique UUIDv4 primary keys and compute SHA-256 hashes upon creation.
   - When network connectivity is re-established, the officer triggers an export/sync bundle.
   - The central API endpoint (`POST /api/v1/inspections/sync-bundle`) verifies the cryptographic Merkle root of each inspection and idempotently inserts new records without duplicates or table locking.
5. **ORM & Migration Framework:**
   - **SQLAlchemy 2.0+ Core & ORM** with **Alembic** migrations guaranteeing strict schema parity across PostgreSQL and SQLite.

---

### 2. Entity-Relationship Model (ERD) Overview

```
+------------------+         +--------------------+         +-----------------------+
|  jurisdictions   | 1     * |       users        | 1     * |      audit_logs       |
+------------------+<--------+--------------------+<--------+-----------------------+
                             | id (PK)            |         | id (PK)               |
                             | role               |         | actor_id (FK)         |
                             +--------------------+         | previous_hash         |
                                       │ 1                  | entry_hash (SHA-256)  |
                                       │                    +-----------------------+
                                       ▼ *
                             +--------------------+
                             |    inspections     |
                             +--------------------+
                             | id (PK)            |
                             | officer_id (FK)    |
                             | jurisdiction_id(FK)|
                             | status (PASS/FAIL) |
                             +--------------------+
                                 │ 1          │ 1
                 ┌───────────────┘            └────────────────┐
                 ▼ *                                           ▼ 1
      +--------------------+                         +--------------------+
      |  evidence_images   |                         |   legal_notices    |
      +--------------------+                         +--------------------+
      | id (PK)            |                         | id (PK)            |
      | inspection_id (FK) |                         | inspection_id (FK) |
      | raw_sha256         |                         | notice_ref_num     |
      | px_to_mm_scale     |                         | bsa_cert_id (FK)   |
      +--------------------+                         +--------------------+
          │ 1                                                  │ 1
          ▼ *                                                  ▼ 1
+--------------------+                               +--------------------+
|   bounding_boxes   |                               |  bsa_certificates  |
+--------------------+                               +--------------------+
| id (PK)            |                               | id (PK)            |
| image_id (FK)      |                               | section_63_hash    |
| field_type         |                               | officer_signature  |
| ocr_text           |                               +--------------------+
| measured_font_mm   |
+--------------------+
    │ 1
    ▼ *
+-------------------------+
| compliance_evaluations  |
+-------------------------+
| id (PK)                 |
| inspection_id (FK)      |
| rule_id (e.g. RULE_06)  |
| status (PASS/FAIL)      |
| discrepancy             |
+-------------------------+
```

---

### 3. Complete Relational DDL Specification (PostgreSQL / SQLite Compatible)

```sql
-- ============================================================================
-- 1. JURISDICTIONS TABLE
-- ============================================================================
CREATE TABLE jurisdictions (
    id VARCHAR(36) PRIMARY KEY,
    state_code VARCHAR(10) NOT NULL, -- e.g., 'DL', 'MH', 'KA'
    district_name VARCHAR(100) NOT NULL,
    zone VARCHAR(100),
    office_address TEXT NOT NULL,
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_jurisdictions_state_district ON jurisdictions (state_code, district_name);

-- ============================================================================
-- 2. USERS & OFFICERS TABLE
-- ============================================================================
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    badge_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('INSPECTOR', 'CONTROLLER', 'DIRECTOR', 'ADMIN', 'VIEWER')),
    jurisdiction_id VARCHAR(36) REFERENCES jurisdictions(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_badge ON users (badge_number);

-- ============================================================================
-- 3. INSPECTIONS TABLE
-- ============================================================================
CREATE TABLE inspections (
    id VARCHAR(36) PRIMARY KEY,
    inspection_number VARCHAR(60) UNIQUE NOT NULL, -- Format: INSP-YYYYMMDD-XXXX
    officer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    jurisdiction_id VARCHAR(36) NOT NULL REFERENCES jurisdictions(id) ON DELETE RESTRICT,
    capture_source VARCHAR(30) NOT NULL CHECK (capture_source IN ('PHYSICAL_FIELD', 'ECOMMERCE_URL', 'ECOMMERCE_DOM', 'MANUAL_UPLOAD')),
    product_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(150),
    manufacturer_name VARCHAR(255),
    category VARCHAR(100) NOT NULL, -- e.g. 'FOOD_SNACKS', 'COSMETICS', 'COMMODITY'
    package_type VARCHAR(50) NOT NULL, -- 'RECTANGULAR', 'CYLINDRICAL', 'FLEXIBLE_POUCH'
    ecommerce_url TEXT,
    overall_status VARCHAR(20) NOT NULL CHECK (overall_status IN ('PASS', 'FAIL', 'WARNING', 'PENDING_REVIEW')),
    ai_verdict VARCHAR(20) NOT NULL CHECK (ai_verdict IN ('PASS', 'FAIL', 'WARNING')),
    adjudication_override BOOLEAN DEFAULT FALSE NOT NULL,
    adjudication_officer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    adjudication_remarks TEXT,
    adjudication_timestamp TIMESTAMP WITH TIME ZONE,
    gps_latitude DECIMAL(10, 8), -- Nullable for indoor / non-GNSS hardware
    gps_longitude DECIMAL(11, 8), -- Nullable for indoor / non-GNSS hardware
    gps_altitude DECIMAL(8, 2),
    clock_source VARCHAR(50) DEFAULT 'LOCAL_DEVICE_MONOTONIC' NOT NULL CHECK (clock_source IN ('LOCAL_DEVICE_MONOTONIC', 'NTP_SYNCHRONIZED', 'MANUAL_DECLARED')),
    synced_to_central BOOLEAN DEFAULT FALSE NOT NULL,
    device_fingerprint VARCHAR(255) NOT NULL,
    inspection_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_inspections_number ON inspections (inspection_number);
CREATE INDEX idx_inspections_officer ON inspections (officer_id);
CREATE INDEX idx_inspections_status ON inspections (overall_status);
CREATE INDEX idx_inspections_timestamp ON inspections (inspection_timestamp);

-- ============================================================================
-- 4. EVIDENCE IMAGES TABLE
-- ============================================================================
CREATE TABLE evidence_images (
    id VARCHAR(36) PRIMARY KEY,
    inspection_id VARCHAR(36) NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    panel_type VARCHAR(50) NOT NULL CHECK (panel_type IN ('PDP_FRONT', 'BACK_LABEL', 'SIDE_PANEL', 'TOP_LID', 'BOTTOM', 'ECOMM_GALLERY')),
    file_path TEXT NOT NULL,
    raw_sha256 VARCHAR(64) NOT NULL, -- Immutable forensic SHA-256 hash of raw input
    image_width INTEGER NOT NULL,
    image_height INTEGER NOT NULL,
    color_channels INTEGER DEFAULT 3 NOT NULL,
    calibration_method VARCHAR(50) NOT NULL CHECK (calibration_method IN ('ARUCO_MARKER', 'STANDARD_COIN', 'FIXED_RIG', 'MANUAL_BENCHMARK', 'UNRESOLVED')),
    calibration_reference_id VARCHAR(50),
    px_to_mm_scale DECIMAL(10, 4), -- e.g. 12.4500 pixels per millimeter
    calibration_error_margin_pct DECIMAL(5, 2), -- e.g. 1.25%
    blur_laplacian_variance DECIMAL(10, 2) NOT NULL,
    glare_pixel_percentage DECIMAL(5, 2) NOT NULL,
    perspective_skew_angle_deg DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_evidence_images_inspection ON evidence_images (inspection_id);
CREATE INDEX idx_evidence_images_hash ON evidence_images (raw_sha256);

-- ============================================================================
-- 5. BOUNDING BOXES & EXTRACTED FIELDS TABLE
-- ============================================================================
CREATE TABLE bounding_boxes (
    id VARCHAR(36) PRIMARY KEY,
    image_id VARCHAR(36) NOT NULL REFERENCES evidence_images(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN (
        'MANUFACTURER_ADDRESS', 'PACKER_ADDRESS', 'IMPORTER_ADDRESS',
        'COUNTRY_OF_ORIGIN', 'NET_QUANTITY', 'MRP', 'UNIT_SALE_PRICE',
        'DATE_OF_MANUFACTURE', 'DATE_OF_EXPIRY', 'BEST_BEFORE',
        'CONSUMER_CARE_CONTACT', 'GENERIC_NAME', 'BARCODE_QR'
    )),
    ymin_px INTEGER NOT NULL,
    xmin_px INTEGER NOT NULL,
    ymax_px INTEGER NOT NULL,
    xmax_px INTEGER NOT NULL,
    detection_confidence DECIMAL(5, 4) NOT NULL, -- e.g. 0.9842
    raw_ocr_text TEXT NOT NULL,
    normalized_text TEXT,
    ocr_confidence DECIMAL(5, 4) NOT NULL,
    measured_font_height_px DECIMAL(8, 2),
    measured_font_height_mm DECIMAL(6, 2), -- Derived via px_to_mm_scale
    font_measurement_method VARCHAR(50) DEFAULT 'CONNECTED_COMPONENTS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bounding_boxes_image ON bounding_boxes (image_id);
CREATE INDEX idx_bounding_boxes_field ON bounding_boxes (field_type);

-- ============================================================================
-- 6. COMPLIANCE EVALUATIONS TABLE (RULE ENGINE LEDGER)
-- ============================================================================
CREATE TABLE compliance_evaluations (
    id VARCHAR(36) PRIMARY KEY,
    inspection_id VARCHAR(36) NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    bounding_box_id VARCHAR(36) REFERENCES bounding_boxes(id) ON DELETE SET NULL,
    rule_code VARCHAR(50) NOT NULL, -- e.g. 'RULE_06_1_H_NET_QTY_FONT', 'RULE_06_1_K_USP'
    rule_legal_citation VARCHAR(255) NOT NULL, -- 'Rule 6(1)(h) read with Table-I, G.S.R. 629(E)'
    status VARCHAR(20) NOT NULL CHECK (status IN ('PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('CRITICAL', 'MAJOR', 'MINOR')),
    required_value TEXT NOT NULL,
    measured_value TEXT NOT NULL,
    discrepancy TEXT,
    penalty_provision VARCHAR(255) NOT NULL, -- 'Section 36(1) of Legal Metrology Act, 2009'
    eval_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_compliance_evals_inspection ON compliance_evaluations (inspection_id);
CREATE INDEX idx_compliance_evals_rule ON compliance_evaluations (rule_code);
CREATE INDEX idx_compliance_evals_status ON compliance_evaluations (status);

-- ============================================================================
-- 7. SECTION 63 BSA 2023 ELECTRONIC CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE bsa_certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_number VARCHAR(80) UNIQUE NOT NULL, -- Format: CERT-BSA2023-YYYYMMDD-XXXX
    inspection_id VARCHAR(36) UNIQUE NOT NULL REFERENCES inspections(id) ON DELETE RESTRICT,
    issuing_officer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    statutory_law_ref VARCHAR(100) DEFAULT 'Section 63 of Bharatiya Sakshya Adhiniyam, 2023' NOT NULL,
    device_make_model VARCHAR(150) NOT NULL,
    device_serial_mac VARCHAR(150) NOT NULL,
    operating_system VARCHAR(100) NOT NULL,
    hash_algorithm VARCHAR(30) DEFAULT 'SHA-256' NOT NULL,
    raw_images_merkle_root VARCHAR(64) NOT NULL,
    evidence_bundle_sha256 VARCHAR(64) NOT NULL,
    officer_digital_signature TEXT NOT NULL, -- Base64 encoded RSA/ECDSA signature or DSC token
    certificate_pdf_path TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bsa_cert_inspection ON bsa_certificates (inspection_id);
CREATE INDEX idx_bsa_cert_number ON bsa_certificates (certificate_number);

-- ============================================================================
-- 8. LEGAL NOTICES TABLE (SECTION 36(1) FORM-1/2 DISPATCH)
-- ============================================================================
CREATE TABLE legal_notices (
    id VARCHAR(36) PRIMARY KEY,
    notice_reference_number VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'LMO/DL/SOUTH/2026/0842'
    inspection_id VARCHAR(36) NOT NULL REFERENCES inspections(id) ON DELETE RESTRICT,
    bsa_certificate_id VARCHAR(36) NOT NULL REFERENCES bsa_certificates(id) ON DELETE RESTRICT,
    issuing_officer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('MANUFACTURER', 'PACKER', 'IMPORTER', 'ECOMMERCE_PLATFORM', 'SELLER')),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_registered_address TEXT NOT NULL,
    recipient_email VARCHAR(255),
    statutory_section VARCHAR(100) DEFAULT 'Section 36(1) of Legal Metrology Act, 2009' NOT NULL,
    violations_summary TEXT NOT NULL,
    compounding_fee_amount DECIMAL(10, 2), -- e.g. Up to Rs. 25,000 for first offence
    reply_window_days INTEGER DEFAULT 15 NOT NULL,
    notice_dispatch_status VARCHAR(30) DEFAULT 'DRAFT' NOT NULL CHECK (notice_dispatch_status IN ('DRAFT', 'SIGNED', 'DISPATCHED', 'ACKNOWLEDGED', 'HEARING_SCHEDULED', 'COMPOUNDED', 'PROSECUTED')),
    generated_pdf_path TEXT NOT NULL,
    dispatched_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_legal_notices_ref ON legal_notices (notice_reference_number);
CREATE INDEX idx_legal_notices_inspection ON legal_notices (inspection_id);
CREATE INDEX idx_legal_notices_status ON legal_notices (notice_dispatch_status);

-- ============================================================================
-- 9. IMMUTABLE AUDIT LOG (CRYPTOGRAPHIC CHAIN / MERKLE CHRONOLOGY)
-- ============================================================================
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    sequence_number BIGINT UNIQUE NOT NULL, -- Monotonically increasing sequence
    actor_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
        'USER_LOGIN', 'INSPECTION_CREATED', 'IMAGE_UPLOADED',
        'AI_INFERENCE_EXECUTED', 'OFFICER_OVERRIDE_APPLIED',
        'BSA_CERTIFICATE_ISSUED', 'LEGAL_NOTICE_GENERATED',
        'NOTICE_STATUS_UPDATED', 'DATABASE_EXPORTED'
    )),
    entity_type VARCHAR(50) NOT NULL, -- e.g. 'INSPECTION', 'LEGAL_NOTICE'
    entity_id VARCHAR(36) NOT NULL,
    payload_json TEXT NOT NULL, -- Serialized JSON state snapshot
    previous_hash VARCHAR(64) NOT NULL, -- Hash of previous block
    entry_hash VARCHAR(64) NOT NULL, -- SHA-256(sequence_number || actor_id || action_type || payload_json || previous_hash)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_seq ON audit_logs (sequence_number);
CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
```

---

### 4. Indexing & Query Optimization Strategy

1. **Compound Multi-Tenant & Chronological Indexes:**
   - Fast filtering for dashboard: `(jurisdiction_id, inspection_timestamp DESC)`.
   - Rapid lookups on legal notices: `(notice_dispatch_status, reply_window_days)`.
2. **Forensic Integrity Constraints:**
   - `ON DELETE RESTRICT` on all users, inspections, and evidence records associated with issued legal notices or BSA certificates. This guarantees no officer can delete an inspection record after an adverse finding has been signed.
   - `raw_sha256` has a unique check constraint per image to prevent redundant identical processing and establish chain of custody.
3. **Audit Log Cryptographic Chaining:**
   - Every row in `audit_logs` includes `previous_hash` and `entry_hash = SHA256(...)`. Any tampering or out-of-band deletion inside SQLite/PostgreSQL causes the Merkle chain verification algorithm to immediately fail.

---

### 5. Data Retention & Archival Policies

- **Inspection Records & Evidence Bundles:**
  - Standard retention: Minimum **7 years** (aligned with statutory limitation periods under the Legal Metrology Act and Indian criminal jurisprudence).
  - Storage footprint: ~2.5 MB per inspection (1x Raw Full Resolution Image @ 1.8 MB + 4x Cropped Panels @ 400 KB + 1x PDF Evidence Report @ 300 KB).
  - 10,000 inspections = ~25 GB storage (easily accommodated on standard NVMe EBS or local storage).
