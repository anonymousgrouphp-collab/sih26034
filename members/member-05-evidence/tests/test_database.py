"""Unit Tests & Latency Benchmark for SQLAlchemy 2.0 Datastore & Cryptographic Audit Ledger (SIH26034)
Verifies 08_DATABASE_SPECIFICATION.md, ADR-04, ADR-09, and TS-WEB-03 (P95 < 100 ms query benchmark).
"""

from datetime import datetime, timezone
from pathlib import Path
import sys
import time
import uuid
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from database import (
    AuditLedgerService,
    AuditLog,
    Base,
    BSACertificate,
    BoundingBox,
    ComplianceEvaluation,
    EvidenceImage,
    Inspection,
    Jurisdiction,
    LegalNotice,
    User,
    init_database,
    seed_default_platform_data,
)


@pytest.fixture
def db_session():
    """Provides an isolated in-memory SQLite database session for testing."""
    engine = create_engine("sqlite:///:memory:", echo=False)
    init_database(engine)
    with Session(engine) as session:
        seed_default_platform_data(session)
        yield session


def test_database_models_initialization_and_seed(db_session: Session):
    # Check default seeded circle
    jur = db_session.execute(select(Jurisdiction)).scalar_one()
    assert jur.id == "CIRCLE_DL_SOUTH_01"
    assert jur.state_code == "DL"

    # Check seeded users
    users = db_session.execute(select(User)).scalars().all()
    assert len(users) >= 4
    roles = {u.role for u in users}
    assert {"ADMIN", "CONTROLLER", "INSPECTOR", "VIEWER"}.issubset(roles)


def test_inspection_lifecycle_persistence(db_session: Session):
    insp_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    # 1. Inspection record
    insp = Inspection(
        id=insp_id,
        inspection_number="INSP-20260908-9999",
        officer_id="usr_01_rajesh",
        jurisdiction_id="CIRCLE_DL_SOUTH_01",
        capture_source="PHYSICAL_FIELD",
        product_name="Almond Biscuits 200g",
        category="FOOD_SNACKS",
        package_type="RECTANGULAR",
        overall_status="FAIL",
        ai_verdict="FAIL",
        device_fingerprint="DEV-FPRINT-9842",
        inspection_timestamp=now,
    )
    db_session.add(insp)
    db_session.flush()

    # 2. Decoupled Evidence Image (relative path, NO BLOB)
    img = EvidenceImage(
        id=str(uuid.uuid4()),
        inspection_id=insp_id,
        panel_type="PDP_FRONT",
        file_path="/storage/uploads/2026/09/08/sample_raw.jpg",
        raw_sha256="a" * 64,
        image_width=1920,
        image_height=1080,
        calibration_method="ARUCO_MARKER",
        blur_laplacian_variance=340.5,
        glare_pixel_percentage=0.5,
    )
    db_session.add(img)
    db_session.flush()

    # 3. Compliance Evaluation
    eval_row = ComplianceEvaluation(
        id=str(uuid.uuid4()),
        inspection_id=insp_id,
        rule_code="RULE_06_1_H_NET_QTY_FONT",
        rule_legal_citation="Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
        status="FAIL",
        severity="CRITICAL",
        required_value=">= 4.00 mm",
        measured_value="2.12 mm",
        discrepancy="-1.88 mm (-47.0%)",
        penalty_provision="Section 36(1) of Legal Metrology Act, 2009",
    )
    db_session.add(eval_row)
    db_session.commit()

    # Query back
    saved_insp = db_session.get(Inspection, insp_id)
    assert saved_insp is not None
    assert saved_insp.product_name == "Almond Biscuits 200g"


def test_cryptographic_audit_ledger_chaining(db_session: Session):
    actor_id = "usr_01_rajesh"
    insp_id = str(uuid.uuid4())

    # Record three chronological actions
    e1 = AuditLedgerService.record_action(
        db_session, actor_id, "INSPECTION_CREATED", "INSPECTION", insp_id, {"status": "CREATED"}
    )
    e2 = AuditLedgerService.record_action(
        db_session, actor_id, "IMAGE_UPLOADED", "EVIDENCE_IMAGE", str(uuid.uuid4()), {"sha256": "abc"}
    )
    e3 = AuditLedgerService.record_action(
        db_session, actor_id, "AI_INFERENCE_EXECUTED", "INSPECTION", insp_id, {"verdict": "FAIL"}
    )
    db_session.commit()

    assert e1.sequence_number == 1
    assert e2.sequence_number == 2
    assert e3.sequence_number == 3

    assert e1.previous_hash == AuditLedgerService.GENESIS_HASH
    assert e2.previous_hash == e1.entry_hash
    assert e3.previous_hash == e2.entry_hash

    # Verify unbroken chain
    is_valid, bad_seq = AuditLedgerService.verify_audit_chain(db_session)
    assert is_valid is True
    assert bad_seq is None


def test_tamper_detection_in_audit_ledger(db_session: Session):
    actor_id = "usr_01_rajesh"
    insp_id = str(uuid.uuid4())

    e1 = AuditLedgerService.record_action(
        db_session, actor_id, "INSPECTION_CREATED", "INSPECTION", insp_id, {"status": "CREATED"}
    )
    e2 = AuditLedgerService.record_action(
        db_session, actor_id, "AI_INFERENCE_EXECUTED", "INSPECTION", insp_id, {"verdict": "FAIL"}
    )
    db_session.commit()

    # Tamper with e1 payload
    e1.payload_json = '{"status":"TAMPERED_PASS"}'
    db_session.commit()

    # Chain verification MUST fail on e1 or e2
    is_valid, bad_seq = AuditLedgerService.verify_audit_chain(db_session)
    assert is_valid is False
    assert bad_seq == 1


def test_paginated_query_latency_benchmark(db_session: Session):
    """Validates TS-WEB-03: Paginated inspections query over 1,000 synthetic records with P95 < 100 ms."""
    officer_id = "usr_01_rajesh"
    jur_id = "CIRCLE_DL_SOUTH_01"
    now = datetime.now(timezone.utc)

    # Bulk insert 1,000 synthetic inspection records
    inspections = [
        Inspection(
            id=str(uuid.uuid4()),
            inspection_number=f"INSP-SYNTH-{i:05d}",
            officer_id=officer_id,
            jurisdiction_id=jur_id,
            capture_source="PHYSICAL_FIELD",
            product_name=f"Synthetic FMCG Product {i}",
            category="FOOD_SNACKS",
            package_type="RECTANGULAR",
            overall_status="FAIL" if i % 4 == 0 else "PASS",
            ai_verdict="FAIL" if i % 4 == 0 else "PASS",
            device_fingerprint="DEV-BENCHMARK-001",
            inspection_timestamp=now,
        )
        for i in range(1000)
    ]
    db_session.add_all(inspections)
    db_session.commit()

    # Execute 50 paginated queries and measure latencies
    latencies = []
    for page in range(50):
        t0 = time.perf_counter()
        q = (
            select(Inspection)
            .where(Inspection.jurisdiction_id == jur_id)
            .where(Inspection.overall_status == "FAIL")
            .order_by(Inspection.inspection_timestamp.desc())
            .offset(page * 10)
            .limit(10)
        )
        results = db_session.execute(q).scalars().all()
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed_ms)
        assert len(results) <= 10

    latencies.sort()
    p95_latency = latencies[int(len(latencies) * 0.95)]

    # SLA target: P95 < 100 ms (TS-WEB-03)
    assert p95_latency < 100.0, f"P95 query latency was {p95_latency:.2f} ms, exceeding 100 ms target"
