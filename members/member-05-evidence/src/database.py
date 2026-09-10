"""SQLAlchemy 2.0 Datastore & Cryptographic Audit Ledger (SIH26034 - NyayaDrishti-LM)
Complete Relational DDL & Models conforming to 08_DATABASE_SPECIFICATION.md.
Dual-Engine compatibility: PostgreSQL 16+ (Mode A Server) & SQLite 3.45+ (Mode B Local).
"""

from datetime import datetime, timezone
from enum import Enum
import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, Generator, List, Optional, Tuple, Type
import uuid

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    create_engine,
    select,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)


class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    CONTROLLER = "CONTROLLER"
    INSPECTOR = "INSPECTOR"
    VIEWER = "VIEWER"


class Base(DeclarativeBase):
    pass


class Jurisdiction(Base):
    __tablename__ = "jurisdictions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    state_code: Mapped[str] = mapped_column(String(10), nullable=False)  # 'DL', 'MH'
    district_name: Mapped[str] = mapped_column(String(100), nullable=False)
    zone: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    office_address: Mapped[str] = mapped_column(Text, nullable=False)
    contact_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_jurisdictions_state_district", "state_code", "district_name"),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    badge_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(30), nullable=False)  # 'INSPECTOR', 'CONTROLLER', 'DIRECTOR', 'ADMIN', 'VIEWER'
    jurisdiction_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("jurisdictions.id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_users_role", "role"),
        Index("idx_users_badge", "badge_number"),
    )


class Inspection(Base):
    __tablename__ = "inspections"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_number: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)  # 'INSP-YYYYMMDD-XXXX'
    officer_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    jurisdiction_id: Mapped[str] = mapped_column(String(64), ForeignKey("jurisdictions.id"), nullable=False)
    capture_source: Mapped[str] = mapped_column(String(30), nullable=False)  # 'PHYSICAL_FIELD', 'ECOMMERCE_URL', etc.
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand_name: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    manufacturer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    package_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'RECTANGULAR', 'CYLINDRICAL', 'FLEXIBLE_POUCH'
    ecommerce_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    overall_status: Mapped[str] = mapped_column(String(20), nullable=False)  # 'PASS', 'FAIL', 'WARNING', 'PENDING_REVIEW'
    ai_verdict: Mapped[str] = mapped_column(String(20), nullable=False)  # 'PASS', 'FAIL', 'WARNING'
    adjudication_override: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    adjudication_officer_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("users.id"), nullable=True)
    adjudication_remarks: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    adjudication_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    gps_latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gps_longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    gps_altitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    clock_source: Mapped[str] = mapped_column(String(50), default="LOCAL_DEVICE_MONOTONIC", nullable=False)
    synced_to_central: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    device_fingerprint: Mapped[str] = mapped_column(String(255), nullable=False)
    inspection_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_inspections_number", "inspection_number"),
        Index("idx_inspections_officer", "officer_id"),
        Index("idx_inspections_status", "overall_status"),
        Index("idx_inspections_timestamp", "inspection_timestamp"),
        Index("idx_inspections_jurisdiction_time", "jurisdiction_id", "inspection_timestamp"),
    )


class EvidenceImage(Base):
    __tablename__ = "evidence_images"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id: Mapped[str] = mapped_column(String(64), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    panel_type: Mapped[str] = mapped_column(String(50), nullable=False)  # 'PDP_FRONT', 'BACK_LABEL', etc.
    file_path: Mapped[str] = mapped_column(Text, nullable=False)  # Relative filesystem path (NO BLOBs)
    raw_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    image_width: Mapped[int] = mapped_column(Integer, nullable=False)
    image_height: Mapped[int] = mapped_column(Integer, nullable=False)
    color_channels: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    calibration_method: Mapped[str] = mapped_column(String(50), nullable=False)
    calibration_reference_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    px_to_mm_scale: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    calibration_error_margin_pct: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    blur_laplacian_variance: Mapped[float] = mapped_column(Float, nullable=False)
    glare_pixel_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    perspective_skew_angle_deg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_evidence_images_inspection", "inspection_id"),
        Index("idx_evidence_images_hash", "raw_sha256"),
    )


class BoundingBox(Base):
    __tablename__ = "bounding_boxes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    image_id: Mapped[str] = mapped_column(String(64), ForeignKey("evidence_images.id", ondelete="CASCADE"), nullable=False)
    field_type: Mapped[str] = mapped_column(String(50), nullable=False)
    ymin_px: Mapped[int] = mapped_column(Integer, nullable=False)
    xmin_px: Mapped[int] = mapped_column(Integer, nullable=False)
    ymax_px: Mapped[int] = mapped_column(Integer, nullable=False)
    xmax_px: Mapped[int] = mapped_column(Integer, nullable=False)
    detection_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    raw_ocr_text: Mapped[str] = mapped_column(Text, nullable=False)
    normalized_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ocr_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    measured_font_height_px: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    measured_font_height_mm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    font_measurement_method: Mapped[str] = mapped_column(String(50), default="CONNECTED_COMPONENTS")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_bounding_boxes_image", "image_id"),
        Index("idx_bounding_boxes_field", "field_type"),
    )


class ComplianceEvaluation(Base):
    __tablename__ = "compliance_evaluations"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    inspection_id: Mapped[str] = mapped_column(String(64), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    bounding_box_id: Mapped[Optional[str]] = mapped_column(String(64), ForeignKey("bounding_boxes.id", ondelete="SET NULL"), nullable=True)
    rule_code: Mapped[str] = mapped_column(String(50), nullable=False)
    rule_legal_citation: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)  # 'PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE'
    severity: Mapped[str] = mapped_column(String(20), nullable=False)  # 'CRITICAL', 'MAJOR', 'MINOR'
    required_value: Mapped[str] = mapped_column(Text, nullable=False)
    measured_value: Mapped[str] = mapped_column(Text, nullable=False)
    discrepancy: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    penalty_provision: Mapped[str] = mapped_column(String(255), nullable=False)
    eval_timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_compliance_evals_inspection", "inspection_id"),
        Index("idx_compliance_evals_rule", "rule_code"),
        Index("idx_compliance_evals_status", "status"),
    )


class BSACertificate(Base):
    __tablename__ = "bsa_certificates"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    certificate_number: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    inspection_id: Mapped[str] = mapped_column(String(64), ForeignKey("inspections.id"), unique=True, nullable=False)
    issuing_officer_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    statutory_law_ref: Mapped[str] = mapped_column(String(100), default="Section 63 of Bharatiya Sakshya Adhiniyam, 2023", nullable=False)
    device_make_model: Mapped[str] = mapped_column(String(150), nullable=False)
    device_serial_mac: Mapped[str] = mapped_column(String(150), nullable=False)
    operating_system: Mapped[str] = mapped_column(String(100), nullable=False)
    hash_algorithm: Mapped[str] = mapped_column(String(30), default="SHA-256", nullable=False)
    raw_images_merkle_root: Mapped[str] = mapped_column(String(64), nullable=False)
    evidence_bundle_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    officer_digital_signature: Mapped[str] = mapped_column(Text, nullable=False)
    certificate_pdf_path: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_bsa_cert_inspection", "inspection_id"),
        Index("idx_bsa_cert_number", "certificate_number"),
    )


class LegalNotice(Base):
    __tablename__ = "legal_notices"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    notice_reference_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    inspection_id: Mapped[str] = mapped_column(String(64), ForeignKey("inspections.id"), nullable=False)
    bsa_certificate_id: Mapped[str] = mapped_column(String(64), ForeignKey("bsa_certificates.id"), nullable=False)
    issuing_officer_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    recipient_type: Mapped[str] = mapped_column(String(50), nullable=False)
    recipient_name: Mapped[str] = mapped_column(String(255), nullable=False)
    recipient_registered_address: Mapped[str] = mapped_column(Text, nullable=False)
    recipient_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    statutory_section: Mapped[str] = mapped_column(String(100), default="Section 36(1) of Legal Metrology Act, 2009", nullable=False)
    violations_summary: Mapped[str] = mapped_column(Text, nullable=False)
    compounding_fee_amount: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reply_window_days: Mapped[int] = mapped_column(Integer, default=15, nullable=False)
    notice_dispatch_status: Mapped[str] = mapped_column(String(30), default="DRAFT", nullable=False)  # 'DRAFT', 'SIGNED', etc.
    generated_pdf_path: Mapped[str] = mapped_column(Text, nullable=False)
    dispatched_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_legal_notices_ref", "notice_reference_number"),
        Index("idx_legal_notices_inspection", "inspection_id"),
        Index("idx_legal_notices_status", "notice_dispatch_status"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    sequence_number: Mapped[int] = mapped_column(Integer, unique=True, nullable=False)
    actor_id: Mapped[str] = mapped_column(String(64), ForeignKey("users.id"), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(64), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    previous_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    entry_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        Index("idx_audit_logs_seq", "sequence_number"),
        Index("idx_audit_logs_actor", "actor_id"),
        Index("idx_audit_logs_entity", "entity_type", "entity_id"),
    )


class AuditLedgerService:
    """Appends cryptographically chained audit log events (ADR-09, 08_DATABASE_SPECIFICATION.md)."""

    GENESIS_HASH = "0" * 64

    @classmethod
    def compute_entry_hash(
        cls,
        sequence_number: int,
        actor_id: str,
        action_type: str,
        payload_json: str,
        previous_hash: str,
    ) -> str:
        raw_msg = f"{sequence_number}:{actor_id}:{action_type}:{payload_json}:{previous_hash}"
        return hashlib.sha256(raw_msg.encode("utf-8")).hexdigest()

    @classmethod
    def record_action(
        cls,
        session: Session,
        actor_id: str,
        action_type: str,
        entity_type: str,
        entity_id: str,
        payload: Dict[str, Any],
    ) -> AuditLog:
        """Appends an event to the audit ledger, maintaining the SHA-256 chain."""
        last_entry = session.execute(
            select(AuditLog).order_by(AuditLog.sequence_number.desc()).limit(1)
        ).scalar_one_or_none()

        if last_entry is None:
            seq = 1
            prev_hash = cls.GENESIS_HASH
        else:
            seq = last_entry.sequence_number + 1
            prev_hash = last_entry.entry_hash

        payload_str = json.dumps(payload, sort_keys=True, separators=(",", ":"))
        entry_hash = cls.compute_entry_hash(seq, actor_id, action_type, payload_str, prev_hash)

        audit_entry = AuditLog(
            id=str(uuid.uuid4()),
            sequence_number=seq,
            actor_id=actor_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            payload_json=payload_str,
            previous_hash=prev_hash,
            entry_hash=entry_hash,
            created_at=datetime.now(timezone.utc),
        )
        session.add(audit_entry)
        session.flush()
        return audit_entry

    @classmethod
    def append_audit_entry(
        cls,
        session: Session,
        actor_id: str,
        action_type: str,
        payload_dict: Dict[str, Any],
        entity_type: str = "SYSTEM",
        entity_id: str = "GLOBAL",
        device_fingerprint: Optional[str] = None,
    ) -> AuditLog:
        """Convenience method for appending audit records with optional device fingerprint."""
        payload = dict(payload_dict)
        if device_fingerprint:
            payload["device_fingerprint"] = device_fingerprint
        return cls.record_action(
            session=session,
            actor_id=actor_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            payload=payload,
        )


    @classmethod
    def verify_audit_chain(cls, session: Session) -> Tuple[bool, Optional[int]]:
        """Verifies the unbroken cryptographic integrity of the entire audit trail."""
        entries = session.execute(select(AuditLog).order_by(AuditLog.sequence_number.asc())).scalars().all()
        if not entries:
            return True, None

        prev_hash = cls.GENESIS_HASH
        for entry in entries:
            expected_hash = cls.compute_entry_hash(
                entry.sequence_number,
                entry.actor_id,
                entry.action_type,
                entry.payload_json,
                entry.previous_hash,
            )
            if entry.previous_hash != prev_hash or entry.entry_hash != expected_hash:
                return False, entry.sequence_number
            prev_hash = entry.entry_hash

        return True, None


def get_database_engine(url: Optional[str] = None):
    """Creates a SQLAlchemy engine supporting SQLite and PostgreSQL."""
    db_url = url or os.getenv("DATABASE_URL", "sqlite:///legal_metrology.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}
    return create_engine(db_url, connect_args=connect_args, echo=False)


def init_database(engine):
    """Initializes all database tables."""
    Base.metadata.create_all(bind=engine)


def seed_default_platform_data(session: Session):
    """Seeds default jurisdiction circle and administrative accounts if database is fresh."""
    existing_jur = session.execute(select(Jurisdiction)).first()
    if not existing_jur:
        jur = Jurisdiction(
            id="CIRCLE_DL_SOUTH_01",
            state_code="DL",
            district_name="South Delhi",
            zone="South Zone",
            office_address="Office of the Assistant Controller of Legal Metrology, South Zone, Pushp Vihar, New Delhi - 110017",
            contact_email="aclm.south@dl.gov.in",
        )
        session.add(jur)
        session.flush()

    existing_user = session.execute(select(User)).first()
    if not existing_user:
        # Default pass: 'Officer@2026' -> hashed via hash_password('Officer@2026', salt_bytes=b'nyayadrishti_salt')
        pwd_hash = "pbkdf2_sha256$100000$6e79617961647269736874695f73616c74$037d6171d6dbc02d8740de592b43fb7c38f1844d238b1d719295a7900fcedd81"

        users = [
            User(
                id="usr_admin_01",
                username="admin_central",
                email="admin@doca.gov.in",
                password_hash=pwd_hash,
                badge_number="ADMIN-DOCA-0001",
                full_name="Dr. Alok Verma",
                role="ADMIN",
                jurisdiction_id="CIRCLE_DL_SOUTH_01",
            ),
            User(
                id="usr_ctrl_01",
                username="controller_south",
                email="controller.south@dl.gov.in",
                password_hash=pwd_hash,
                badge_number="CTRL-DL-0101",
                full_name="Sunita Deshmukh",
                role="CONTROLLER",
                jurisdiction_id="CIRCLE_DL_SOUTH_01",
            ),
            User(
                id="usr_01_rajesh",
                username="inspector_rajesh",
                email="rajesh.sharma@dl.gov.in",
                password_hash=pwd_hash,
                badge_number="INSP-DL-0842",
                full_name="Rajesh Sharma",
                role="INSPECTOR",
                jurisdiction_id="CIRCLE_DL_SOUTH_01",
            ),
            User(
                id="usr_viewer_01",
                username="viewer_analyst",
                email="analyst@doca.gov.in",
                password_hash=pwd_hash,
                badge_number="VIEW-DOCA-0042",
                full_name="Kavita Iyer",
                role="VIEWER",
                jurisdiction_id="CIRCLE_DL_SOUTH_01",
            ),
        ]
        session.add_all(users)
        session.commit()


_default_engine = None
_default_sessionmaker = None


def get_session_factory(engine=None):
    """Returns a singleton or configured sessionmaker instance."""
    global _default_engine, _default_sessionmaker
    if engine is not None:
        return sessionmaker(bind=engine, autoflush=False, autocommit=False)
    if _default_sessionmaker is None:
        if _default_engine is None:
            _default_engine = get_database_engine()
        _default_sessionmaker = sessionmaker(bind=_default_engine, autoflush=False, autocommit=False)
    return _default_sessionmaker


def get_db_session() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a managed transactional database session."""
    factory = get_session_factory()
    session = factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

