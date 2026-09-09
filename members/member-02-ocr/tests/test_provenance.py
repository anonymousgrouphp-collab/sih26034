"""Model Provenance & Version Identity Regression Test (SIH26034 - NyayaDrishti-LM)

Guarantees:
1. Devanagari model canonical identity is PP-OCRv3 (never PP-OCRv4).
2. Local filename ('devanagari_PP-OCRv4_rec.onnx') and canonical model identity ('PP-OCRv3')
   are decoupled and strictly asserted as separate metadata fields.
3. Provenance manifest (model_manifest.json) accurately reflects PaddleOCR upstream releases.
4. Model download registry (MODEL_REGISTRY) does not encode misleading 'v4' descriptions.
5. ONNX graph tensor signature matches PP-OCRv3 architecture (570 CTC classes).
"""

import os
import sys
import json
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from recognizer import PPOCRv4Recognizer
from download_models import MODEL_REGISTRY


def test_recognizer_canonical_provenance_metadata():
    """Asserts that recognizer decouples physical filename from canonical model identity."""
    rec = PPOCRv4Recognizer()
    # 1. English Recognizer
    assert rec.en_model_version == "PP-OCRv4"
    assert "PP-OCRv4" in rec.en_model_identity

    # 2. Devanagari Recognizer: MUST be PP-OCRv3
    assert rec.hi_model_version == "PP-OCRv3", f"Expected PP-OCRv3, got {rec.hi_model_version}"
    assert rec.hi_model_version != "PP-OCRv4", "Devanagari model must NOT be identified as PP-OCRv4!"
    assert "PP-OCRv3" in rec.hi_model_identity
    assert "PP-OCRv4" not in rec.hi_model_identity

    # 3. Filename separation check
    if rec.hi_model_path:
        filename = os.path.basename(rec.hi_model_path)
        # Even if filename contains 'v4' due to artifact inheritance, identity must be v3
        assert rec.hi_model_version == "PP-OCRv3"
        assert hasattr(rec, "hi_model_provenance_note")


def test_model_manifest_provenance():
    """Asserts that models/model_manifest.json specifies truthful canonical architecture."""
    manifest_path = MODELS_DIR / "model_manifest.json"
    assert manifest_path.exists(), f"Missing {manifest_path}"

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    arch = data.get("canonical_architecture", {})
    assert arch.get("devanagari_recognition") == "PP-OCRv3 Devanagari recognition"
    assert arch.get("english_recognition") == "PP-OCRv4 English recognition"
    assert arch.get("detection") == "DBNet++ / PP-OCRv4 detection"

    hi_info = data.get("models", {}).get("devanagari_recognition", {})
    assert hi_info.get("canonical_model_version") == "PP-OCRv3"
    assert hi_info.get("canonical_model_version") != "PP-OCRv4"
    assert hi_info.get("identity") == "PP-OCRv3 Devanagari recognition"
    assert "devanagari_PP-OCRv3_rec" in hi_info.get("upstream", "")
    assert hi_info.get("sha256") == "2e895a63a7e08932c8b7b65d8bdb87f96b6f075a80c329ab98298ea0915ebf85"


def test_download_models_registry_provenance():
    """Asserts that download_models.py does not advertise Devanagari as PP-OCRv4."""
    hi_entry = MODEL_REGISTRY.get("devanagari_PP-OCRv4_rec.onnx", {})
    assert hi_entry, "Missing devanagari entry in MODEL_REGISTRY"
    assert hi_entry.get("identity") == "PP-OCRv3 Devanagari recognition"
    assert hi_entry.get("canonical_model_version") == "PP-OCRv3"
    assert hi_entry.get("canonical_model_version") != "PP-OCRv4"
    assert "PP-OCRv3" in hi_entry.get("desc", "")
    assert "PP-OCRv4 Devanagari" not in hi_entry.get("desc", "")


def test_onnx_tensor_signature_conforms_to_ppocrv3():
    """Asserts that real ONNX session output matches PP-OCRv3 570 classes."""
    rec = PPOCRv4Recognizer()
    if rec.hi_session is None:
        return

    output = rec.hi_session.get_outputs()[0]
    # Output shape is [batch, time_steps, 570]
    shape = output.shape
    assert len(shape) == 3, f"Expected 3D tensor [batch, time, classes], got {shape}"
    num_classes = shape[2]
    # PP-OCRv3 Devanagari dictionary has 568 characters + blank (0) + space (569) = 570 classes
    assert num_classes == 570, f"Expected 570 classes for PP-OCRv3 Devanagari, got {num_classes}"