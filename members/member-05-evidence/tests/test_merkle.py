"""Unit Tests for Member 5 Merkle DAG Evidence Integrity (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest

# Ensure local src is on path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from merkle_dag import MerkleAuditLedger

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_hash_payload_deterministic():
    data1 = {"b": 2, "a": 1}
    data2 = {"a": 1, "b": 2}
    hash1 = MerkleAuditLedger.hash_payload(data1)
    hash2 = MerkleAuditLedger.hash_payload(data2)
    assert hash1 == hash2
    assert len(hash1) == 64


def test_merkle_root_construction_and_verification():
    h1 = MerkleAuditLedger.hash_payload("raw_image_bytes")
    h2 = MerkleAuditLedger.hash_payload({"calibration": "aruco_50mm"})
    h3 = MerkleAuditLedger.hash_payload({"ocr": ["150g", "Rs. 35"]})
    h4 = MerkleAuditLedger.hash_payload({"verdict": "FAIL"})

    leaves = [h1, h2, h3, h4]
    root = MerkleAuditLedger.build_merkle_root(leaves)
    assert len(root) == 64
    assert MerkleAuditLedger.verify_integrity(leaves, root) is True


def test_tamper_detection():
    h1 = MerkleAuditLedger.hash_payload("raw_image_bytes")
    h2 = MerkleAuditLedger.hash_payload({"calibration": "aruco_50mm"})
    h3 = MerkleAuditLedger.hash_payload({"ocr": ["150g", "Rs. 35"]})
    h4 = MerkleAuditLedger.hash_payload({"verdict": "FAIL"})

    original_leaves = [h1, h2, h3, h4]
    root = MerkleAuditLedger.build_merkle_root(original_leaves)

    # Tamper with h3 (e.g. changing price in database)
    h3_tampered = MerkleAuditLedger.hash_payload({"ocr": ["150g", "Rs. 40"]})
    tampered_leaves = [h1, h2, h3_tampered, h4]

    # Tampered verification must fail
    assert MerkleAuditLedger.verify_integrity(tampered_leaves, root) is False


def test_pipeline_output_fixture_hash():
    with open(FIXTURES_DIR / "fixture_pipeline_output.json") as f:
        data = json.load(f)
    digest = MerkleAuditLedger.hash_payload(data)
    assert len(digest) == 64
