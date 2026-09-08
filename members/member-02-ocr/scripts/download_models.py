"""Model Provisioning & Verification Script (SIH26034 - NyayaDrishti-LM)

Downloads and verifies SHA-256 checksums for all Member 2 OCR neural models.
All models are licensed under Apache-2.0 or BSD/MIT.

Usage:
    python download_models.py           # Download and verify models
    python download_models.py --verify  # Verify existing models only
"""

import os
import sys
import hashlib
import urllib.request
import argparse
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"

MODEL_REGISTRY = {
    "ch_PP-OCRv4_det.onnx": {
        "role": "text_detection",
        "identity": "DBNet++ / PP-OCRv4 detection",
        "local_filename": "ch_PP-OCRv4_det.onnx",
        "url": "https://huggingface.co/Heliosoph/paddleocr-v4-det-onnx/resolve/main/ch_PP-OCRv4_det.onnx",
        "upstream": "https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_infer.tar (Baidu Inc.)",
        "sha256": "30a86f5731181461d08021402766601e4302a9b9b9666be8aff402696339cdff",
        "size": 4745517,
        "license": "Apache-2.0",
        "desc": "DBNet++ Real-Time Text Detection Model (Apache-2.0)"
    },
    "en_PP-OCRv4_rec_infer.onnx": {
        "role": "english_recognition",
        "identity": "PP-OCRv4 English recognition",
        "local_filename": "en_PP-OCRv4_rec_infer.onnx",
        "url": "https://huggingface.co/breezedeus/cnocr-ppocr-en_PP-OCRv4/resolve/main/en_PP-OCRv4_rec_infer.onnx",
        "upstream": "https://paddleocr.bj.bcebos.com/PP-OCRv4/english/en_PP-OCRv4_rec_infer.tar (Baidu Inc.)",
        "sha256": "5ca59a096cf493d5fd5044b9ccc1bdea9229fbcf656bd76040ff80a00201ee16",
        "size": 7656802,
        "license": "Apache-2.0",
        "desc": "PP-OCRv4 English Text Recognition Model (Apache-2.0)"
    },
    "en_dict.txt": {
        "role": "english_vocabulary",
        "identity": "PP-OCR English Dictionary (95 characters)",
        "local_filename": "en_dict.txt",
        "url": "https://raw.githubusercontent.com/PaddlePaddle/PaddleOCR/release/2.7/ppocr/utils/en_dict.txt",
        "upstream": "PaddleOCR upstream en_dict.txt",
        "sha256": "f27a6aa993c9cb67a588e7ea9aea90bb96b8e51dec6ce98bd7e76c104c1829fe",
        "size": 285,
        "license": "Apache-2.0",
        "desc": "PP-OCR English Character Vocabulary (95 chars, Apache-2.0)"
    },
    "devanagari_PP-OCRv4_rec.onnx": {
        "role": "devanagari_recognition",
        "identity": "PP-OCRv3 Devanagari recognition",
        "canonical_model_version": "PP-OCRv3",
        "local_filename": "devanagari_PP-OCRv4_rec.onnx",
        "url": "https://huggingface.co/xberg-io/paddleocr-onnx-models/resolve/main/rec/devanagari/model.onnx",
        "upstream": "https://paddleocr.bj.bcebos.com/PP-OCRv3/multilingual/devanagari_PP-OCRv3_rec_infer.tar (Baidu Inc.)",
        "sha256": "2e895a63a7e08932c8b7b65d8bdb87f96b6f075a80c329ab98298ea0915ebf85",
        "size": 7935595,
        "license": "Apache-2.0",
        "desc": "PP-OCRv3 Devanagari Hindi Text Recognition Model (Upstream devanagari_PP-OCRv3_rec, Apache-2.0)",
        "reason": "Local filename is inherited from downstream ONNX distribution; actual upstream model is officially devanagari_PP-OCRv3_rec."
    },
    "devanagari_dict.txt": {
        "role": "devanagari_vocabulary",
        "identity": "PP-OCR Devanagari Dictionary (568 characters)",
        "local_filename": "devanagari_dict.txt",
        "url": "https://huggingface.co/xberg-io/paddleocr-onnx-models/resolve/main/rec/devanagari/dict.txt",
        "upstream": "PaddleOCR upstream devanagari_dict.txt",
        "sha256": "09c7440bfc5477e5c41052304b6b185aff8c4a5e8b2b4c23c1c706f6fe1ee9fc",
        "size": 1943,
        "license": "Apache-2.0",
        "desc": "PP-OCR Devanagari Character Vocabulary (568 chars, Apache-2.0)"
    },
    "hin.traineddata": {
        "role": "ocr_fallback_hindi",
        "identity": "Tesseract v5 Hindi Traineddata",
        "local_filename": "hin.traineddata",
        "url": "https://github.com/tesseract-ocr/tessdata_fast/raw/main/hin.traineddata",
        "upstream": "https://github.com/tesseract-ocr/tessdata_fast (Google / Tesseract OCR)",
        "sha256": "4c73ffc59d497c186b19d1e90f5d721d678ea6b2e277b719bee4e2af12271825",
        "size": 1122751,
        "license": "Apache-2.0",
        "desc": "Tesseract v5 Hindi Fast LSTM Traineddata (Apache-2.0)"
    }
}


def compute_sha256(filepath: Path) -> str:
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()


def verify_models() -> bool:
    print(f"Verifying models in {MODELS_DIR}...")
    all_ok = True
    for filename, info in MODEL_REGISTRY.items():
        filepath = MODELS_DIR / filename
        if not filepath.exists():
            print(f"  [MISSING] {filename}")
            all_ok = False
            continue
        actual_hash = compute_sha256(filepath)
        if actual_hash.lower() == info["sha256"].lower():
            print(f"  [OK]      {filename} (verified SHA-256)")
        else:
            print(f"  [FAILED]  {filename} (hash mismatch: expected {info['sha256'][:10]}..., got {actual_hash[:10]}...)")
            all_ok = False
    return all_ok


def download_models() -> bool:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Provisioning Member 2 OCR models to {MODELS_DIR}...")
    for filename, info in MODEL_REGISTRY.items():
        filepath = MODELS_DIR / filename
        if filepath.exists():
            actual_hash = compute_sha256(filepath)
            if actual_hash.lower() == info["sha256"].lower():
                print(f"  [EXISTS]  {filename} (hash verified, skipping download)")
                continue
            else:
                print(f"  [INVALID] {filename} (hash mismatch, re-downloading...)")
                filepath.unlink()

        print(f"  [DOWNLOADING] {filename} ({info['desc']})...")
        urllib.request.urlretrieve(info["url"], filepath)
        actual_hash = compute_sha256(filepath)
        if actual_hash.lower() != info["sha256"].lower():
            print(f"  [ERROR] Downloaded file corrupted for {filename}!")
            return False
        print(f"  [DOWNLOADED]  {filename} ({info['size']} bytes, verified SHA-256)")

    print("All models successfully provisioned and verified.")
    return True


def main():
    parser = argparse.ArgumentParser(description="Provision and verify Member 2 OCR neural weights.")
    parser.add_argument("--verify", action="store_true", help="Verify checksums without downloading.")
    args = parser.parse_args()

    if args.verify:
        success = verify_models()
    else:
        success = download_models()

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
