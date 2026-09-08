"""Unit tests for Mode B Offline Inspection Sync Bridge.
Enforces TS-SYS-04 (Sync Idempotency) and Section 63 BSA 2023 tamper evidence.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
import sys
import uuid
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

# Ensure src/ is importable
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

try:
    from database import (
        Base,
        BoundingBox,
        ComplianceEvaluation,
        EvidenceImage,
        Inspection,
        Jurisdiction,
        User,
        init_database,
        seed_default_platform_data,
    )
    from sync_bridge import ModeBSyncBridge, BundleTamperError
except ImportError:
    from .database import (
        Base,
        BoundingBox,
        ComplianceEvaluation,
        EvidenceImage,
        Inspection,
        Jurisdiction,
        User,
        init_database,
        seed_default_platform_data,
    )
    from .sync_bridge import ModeBSyncBridge, BundleTamperError


@pytest.fixture
def db_sessions():
    """Provides two separate database instances representing Mode B (Field) and Central Datastore."""
    engine_field = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    engine_central = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})

    init_database(engine_field)
    init_database(engine_central)

    with Session(engine_field) as s_field, Session(engine_central) as s_central:
        seed_default_platform_data(s_field)
        seed_default_platform_data(s_central)
        yield s_field, s_central


def test_export_and_import_offline_bundle(db_sessions):
    s_field, s_central = db_sessions

    # Create local inspection on field device
    insp_id = f"insp_{uuid.uuid4()}"
    insp = Inspection(
        id=insp_id,
        inspection_number="INSP-OFFLINE-2026-001",
        officer_id="usr_01_rajesh",
        jurisdiction_id="CIRCLE_DL_SOUTH_01",
        capture_source="PHYSICAL_FIELD",
        product_name="Atta Whole Wheat 5kg",
        category="FOOD_GRAINS",
        package_type="FLEXIBLE_POUCH",
        overall_status="FAIL",
        ai_verdict="FAIL",
        device_fingerprint="TABLET-FIELD-01",
    )
    s_field.add(insp)

    ev_img = EvidenceImage(
        id=f"img_{uuid.uuid4()}",
        inspection_id=insp.id,
        panel_type="PDP_FRONT",
        file_path="uploads/2026/09/08/atta_front.jpg",
        raw_sha256="11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
        image_width=1920,
        image_height=1080,
        color_channels=3,
        calibration_method="ARUCO_4X4_50",
        blur_laplacian_variance=310.5,
        glare_pixel_percentage=0.4,
    )
    s_field.add(ev_img)

    eval_rec = ComplianceEvaluation(
        id=f"eval_{uuid.uuid4()}",
        inspection_id=insp.id,
        rule_code="RULE_06_1_H_NET_QTY_FONT",
        rule_legal_citation="Rule 6(1)(h), Table-I",
        status="FAIL",
        severity="CRITICAL",
        required_value=">= 6.00 mm",
        measured_value="3.85 mm",
        discrepancy="-2.15 mm",
        penalty_provision="Section 36(1) LM Act 2009",
    )
    s_field.add(eval_rec)
    s_field.commit()

    # 1. Export bundle from field
    bundle = ModeBSyncBridge.export_offline_bundle(
        session=s_field,
        inspection_ids=[insp.id],
        device_identifier="TABLET-FIELD-01",
    )
    assert bundle["inspection_count"] == 1
    assert "bundle_digest" in bundle

    # 2. Import bundle into central
    result = ModeBSyncBridge.import_offline_bundle(
        session=s_central,
        bundle_payload=bundle,
        actor_id="usr_01_rajesh",
    )
    assert result["status"] == "SUCCESS"
    assert result["inspections_synced"] == 1

    # Verify central database has record with synced_to_central = True
    central_insp = s_central.execute(
        select(Inspection).where(Inspection.inspection_number == "INSP-OFFLINE-2026-001")
    ).scalar_one_or_none()
    assert central_insp is not None
    assert central_insp.synced_to_central is True


def test_ts_sys_04_idempotent_bundle_sync(db_sessions):
    """TS-SYS-04: Resynchronizing the same bundle must skip idempotently without error."""
    s_field, s_central = db_sessions

    insp_id = f"insp_{uuid.uuid4()}"
    insp = Inspection(
        id=insp_id,
        inspection_number="INSP-OFFLINE-2026-002",
        officer_id="usr_01_rajesh",
        jurisdiction_id="CIRCLE_DL_SOUTH_01",
        capture_source="PHYSICAL_FIELD",
        product_name="Pure Basmati Rice 1kg",
        category="FOOD_GRAINS",
        package_type="RECTANGULAR",
        overall_status="PASS",
        ai_verdict="PASS",
        device_fingerprint="TABLET-FIELD-01",
    )
    s_field.add(insp)
    s_field.commit()

    bundle = ModeBSyncBridge.export_offline_bundle(session=s_field, inspection_ids=[insp.id])

    # First sync
    res1 = ModeBSyncBridge.import_offline_bundle(session=s_central, bundle_payload=bundle, actor_id="usr_01_rajesh")
    assert res1["status"] == "SUCCESS"
    assert res1["inspections_synced"] == 1

    # Second sync of identical bundle
    res2 = ModeBSyncBridge.import_offline_bundle(session=s_central, bundle_payload=bundle, actor_id="usr_01_rajesh")
    assert res2["status"] == "IDEMPOTENT_SKIPPED"
    assert res2["inspections_synced"] == 0


def test_bundle_tamper_detection(db_sessions):
    """Tampered bundle payload must be rejected with BundleTamperError."""
    s_field, s_central = db_sessions

    insp_id = f"insp_{uuid.uuid4()}"
    insp = Inspection(
        id=insp_id,
        inspection_number="INSP-OFFLINE-2026-003",
        officer_id="usr_01_rajesh",
        jurisdiction_id="CIRCLE_DL_SOUTH_01",
        capture_source="PHYSICAL_FIELD",
        product_name="Soybean Oil 1L",
        category="EDIBLE_OIL",
        package_type="RECTANGULAR",
        overall_status="FAIL",
        ai_verdict="FAIL",
        device_fingerprint="TABLET-FIELD-01",
    )
    s_field.add(insp)
    s_field.commit()

    bundle = ModeBSyncBridge.export_offline_bundle(session=s_field, inspection_ids=[insp.id])

    # Tamper with the inspection status in the bundle
    bundle["inspections"][0]["overall_status"] = "PASS"  # Tampered!

    with pytest.raises(BundleTamperError) as exc_info:
        ModeBSyncBridge.import_offline_bundle(
            session=s_central,
            bundle_payload=bundle,
            actor_id="usr_01_rajesh",
        )
    assert "Bundle tamper detected" in str(exc_info.value)
