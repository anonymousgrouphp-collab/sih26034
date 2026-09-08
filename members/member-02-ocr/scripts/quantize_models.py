#!/usr/bin/env python3
"""Static Post-Training Quantization (PTQ) Harness for Member 2 OCR Models.

SIH26034 — NyayaDrishti-LM
Architecture: DBNet++ Detection -> PP-OCRv4 English Rec -> PP-OCRv3 Devanagari Rec
Method: ONNX Runtime Static Quantization (QDQ format, Int8 weights and activations)

Usage:
    python members/member-02-ocr/scripts/quantize_models.py
"""

import os
import sys
import time
import json
import hashlib
from pathlib import Path
from typing import List, Dict, Any, Tuple
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

import onnx
import onnxruntime as ort
from onnxruntime.quantization import (
    quantize_static,
    CalibrationDataReader,
    QuantType,
    QuantFormat,
    CalibrationMethod
)

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
INT8_DIR = MODELS_DIR / "int8"

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from detector import DBNetTextDetector
from recognizer import PPOCRv4Recognizer
from polygon_normalizer import PolygonNormalizer


def compute_sha256(file_path: str) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def generate_calibration_images() -> List[Tuple[str, np.ndarray]]:
    images = []

    # 1. Standard English Biscuit PDP (Parle-G style)
    img1 = Image.new("RGB", (640, 480), (245, 245, 245))
    d1 = ImageDraw.Draw(img1)
    f_t = ImageFont.load_default()
    d1.text((30, 40), "PARLE-G ORIGINAL GLUCOSE BISCUITS", fill=(20, 20, 20), font=f_t)
    d1.text((30, 120), "Net Quantity: 250 g", fill=(10, 10, 10), font=f_t)
    d1.text((30, 200), "MRP Rs. 25.00 (incl. of all taxes)", fill=(10, 10, 10), font=f_t)
    d1.text((30, 280), "Unit Sale Price: Rs. 0.10 / g", fill=(10, 10, 10), font=f_t)
    d1.text((30, 360), "Mfg Date: 01/2026 | Exp Date: 12/2026", fill=(10, 10, 10), font=f_t)
    images.append(("english_pdp", np.array(img1)))

    # 2. Pure Hindi Dairy PDP (Patanjali Ghee style)
    img2 = Image.new("RGB", (640, 480), (250, 248, 240))
    cv_img2 = np.array(img2)
    cv2.putText(cv_img2, "PATANJALI COW GHEE", (40, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(cv_img2, "Net Qty: 1000 ml", (40, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
    cv2.putText(cv_img2, "MRP Rs. 650.00 (INCL OF TAXES)", (40, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)
    cv2.putText(cv_img2, "BATCH: AG-9022 EXP: 12/2027", (40, 330), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)
    images.append(("hindi_dairy_pdp", cv_img2))

    # 3. Dense Small-Text Back Panel (Haldiram style - 7 statutory lines)
    img3 = np.ones((480, 640, 3), dtype=np.uint8) * 252
    cv2.putText(img3, "HALDIRAM BHUJIA SEV", (30, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (15, 15, 15), 2)
    cv2.putText(img3, "Net Quantity: 150 g", (30, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)
    cv2.putText(img3, "MRP Rs. 45.00 (incl. of all taxes)", (30, 170), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (10, 10, 10), 2)
    cv2.putText(img3, "Manufactured by: Haldiram Snacks Pvt Ltd", (30, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 10, 10), 2)
    cv2.putText(img3, "Plot 14, Sector 68, Noida, UP 201307", (30, 290), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (10, 10, 10), 2)
    cv2.putText(img3, "Customer Care: 1800-102-1212 support@haldiram.com", (30, 350), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (10, 10, 10), 2)
    cv2.putText(img3, "Country of Origin: India | Food Grade", (30, 410), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (10, 10, 10), 2)
    images.append(("dense_small_text", img3))

    # 4. Rotated Packaging Panel (Cadbury style - 15 deg)
    img4_base = np.ones((480, 640, 3), dtype=np.uint8) * 240
    cv2.putText(img4_base, "CADBURY DAIRY MILK", (100, 120), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (40, 10, 60), 2)
    cv2.putText(img4_base, "Net Wt: 130 g", (100, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (20, 20, 20), 2)
    cv2.putText(img4_base, "MRP Rs. 85.00", (100, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (20, 20, 20), 2)
    M = cv2.getRotationMatrix2D((320, 240), 15, 1.0)
    img4 = cv2.warpAffine(img4_base, M, (640, 480), borderValue=(240, 240, 240))
    images.append(("rotated_15deg", img4))

    # 5. Baseline Amul 2-field PDP
    img5 = np.ones((480, 640, 3), dtype=np.uint8) * 255
    cv2.putText(img5, "AMUL PURE GHEE", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.1, (20, 20, 20), 2)
    cv2.putText(img5, "Net Qty: 500 ml", (50, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    cv2.putText(img5, "MRP Rs. 295.00 (incl. of all taxes)", (50, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (10, 10, 10), 2)
    images.append(("baseline_amul", img5))

    return images


class DetectorCalibrationDataReader(CalibrationDataReader):
    def __init__(self, frames: List[np.ndarray]):
        self.frames = frames
        self.idx = 0
    def get_next(self) -> Any:
        if self.idx < len(self.frames):
            data = {"x": self.frames[self.idx]}
            self.idx += 1
            return data
        return None
    def rewind(self):
        self.idx = 0


class RecognizerCalibrationDataReader(CalibrationDataReader):
    def __init__(self, crop_tensors: List[np.ndarray]):
        self.crop_tensors = crop_tensors
        self.idx = 0
    def get_next(self) -> Any:
        if self.idx < len(self.crop_tensors):
            data = {"x": self.crop_tensors[self.idx]}
            self.idx += 1
            return data
        return None
    def rewind(self):
        self.idx = 0


def quantize_dbnet_detector(fp32_model_path: str, output_int8_path: str, calibration_frames: List[np.ndarray]) -> Dict[str, Any]:
    print(f"\n[1/3] Quantizing DBNet++ Text Detector ({fp32_model_path})...")
    reader = DetectorCalibrationDataReader(calibration_frames)
    quantize_static(
        model_input=fp32_model_path,
        model_output=output_int8_path,
        calibration_data_reader=reader,
        quant_format=QuantFormat.QDQ,
        per_channel=True,
        activation_type=QuantType.QInt8,
        weight_type=QuantType.QInt8,
        calibrate_method=CalibrationMethod.MinMax
    )
    model = onnx.load(output_int8_path)
    onnx.checker.check_model(model)

    fp32_size = os.path.getsize(fp32_model_path)
    int8_size = os.path.getsize(output_int8_path)
    fp32_hash = compute_sha256(fp32_model_path)
    int8_hash = compute_sha256(output_int8_path)

    print(f"  DBNet++ INT8 graph validated successfully. Size: {fp32_size/(1024*1024):.2f} MB -> {int8_size/(1024*1024):.2f} MB")
    return {
        "model_role": "text_detection",
        "canonical_name": "ch_PP-OCRv4_det_int8.onnx",
        "fp32_source": os.path.basename(fp32_model_path),
        "fp32_sha256": fp32_hash,
        "int8_sha256": int8_hash,
        "fp32_size_bytes": fp32_size,
        "int8_size_bytes": int8_size,
        "quant_format": "QDQ",
        "weight_type": "QInt8",
        "activation_type": "QInt8",
        "calibration_samples": len(calibration_frames)
    }


def quantize_english_recognizer(fp32_model_path: str, output_int8_path: str, calibration_crops: List[np.ndarray]) -> Dict[str, Any]:
    print(f"\n[2/3] Quantizing PP-OCRv4 English Recognizer ({fp32_model_path})...")
    reader = RecognizerCalibrationDataReader(calibration_crops)
    quantize_static(
        model_input=fp32_model_path,
        model_output=output_int8_path,
        calibration_data_reader=reader,
        quant_format=QuantFormat.QDQ,
        op_types_to_quantize=["Conv"],
        per_channel=True,
        activation_type=QuantType.QUInt8,
        weight_type=QuantType.QInt8,
        calibrate_method=CalibrationMethod.MinMax
    )
    model = onnx.load(output_int8_path)
    onnx.checker.check_model(model)

    fp32_size = os.path.getsize(fp32_model_path)
    int8_size = os.path.getsize(output_int8_path)
    fp32_hash = compute_sha256(fp32_model_path)
    int8_hash = compute_sha256(output_int8_path)

    print(f"  PP-OCRv4 English INT8 graph validated successfully. Size: {fp32_size/(1024*1024):.2f} MB -> {int8_size/(1024*1024):.2f} MB")
    return {
        "model_role": "english_recognition",
        "canonical_name": "en_PP-OCRv4_rec_infer_int8.onnx",
        "fp32_source": os.path.basename(fp32_model_path),
        "fp32_sha256": fp32_hash,
        "int8_sha256": int8_hash,
        "fp32_size_bytes": fp32_size,
        "int8_size_bytes": int8_size,
        "quant_format": "QDQ",
        "weight_type": "QInt8",
        "activation_type": "QUInt8",
        "calibration_samples": len(calibration_crops)
    }


def quantize_devanagari_recognizer(fp32_model_path: str, output_int8_path: str, calibration_crops: List[np.ndarray]) -> Dict[str, Any]:
    print(f"\n[3/3] Quantizing PP-OCRv3 Devanagari Recognizer ({fp32_model_path})...")
    reader = RecognizerCalibrationDataReader(calibration_crops)
    quantize_static(
        model_input=fp32_model_path,
        model_output=output_int8_path,
        calibration_data_reader=reader,
        quant_format=QuantFormat.QDQ,
        op_types_to_quantize=["Conv"],
        per_channel=True,
        activation_type=QuantType.QUInt8,
        weight_type=QuantType.QInt8,
        calibrate_method=CalibrationMethod.MinMax
    )
    model = onnx.load(output_int8_path)
    onnx.checker.check_model(model)

    fp32_size = os.path.getsize(fp32_model_path)
    int8_size = os.path.getsize(output_int8_path)
    fp32_hash = compute_sha256(fp32_model_path)
    int8_hash = compute_sha256(output_int8_path)

    print(f"  PP-OCRv3 Devanagari INT8 graph validated successfully. Size: {fp32_size/(1024*1024):.2f} MB -> {int8_size/(1024*1024):.2f} MB")
    return {
        "model_role": "devanagari_recognition",
        "canonical_name": "devanagari_PP-OCRv4_rec_int8.onnx",
        "canonical_version": "PP-OCRv3",
        "provenance_note": "Inherits legacy filename devanagari_PP-OCRv4_rec_int8.onnx, but upstream architecture is Baidu PP-OCRv3 Devanagari (570 classes).",
        "fp32_source": os.path.basename(fp32_model_path),
        "fp32_sha256": fp32_hash,
        "int8_sha256": int8_hash,
        "fp32_size_bytes": fp32_size,
        "int8_size_bytes": int8_size,
        "quant_format": "QDQ",
        "weight_type": "QInt8",
        "activation_type": "QUInt8",
        "calibration_samples": len(calibration_crops)
    }


def main():
    print("=" * 80)
    print("SIH26034 MEMBER 2: STATIC INT8 POST-TRAINING QUANTIZATION")
    print("=" * 80)

    INT8_DIR.mkdir(parents=True, exist_ok=True)

    det_fp32 = str(MODELS_DIR / "ch_PP-OCRv4_det.onnx")
    en_fp32 = str(MODELS_DIR / "en_PP-OCRv4_rec_infer.onnx")
    hi_fp32 = str(MODELS_DIR / "devanagari_PP-OCRv4_rec.onnx")

    for p in [det_fp32, en_fp32, hi_fp32]:
        if not os.path.exists(p):
            print(f"ERROR: Missing FP32 source model {p}. Run download_models.py first.")
            sys.exit(1)

    print("Generating representative calibration dataset...")
    calib_images = generate_calibration_images()
    print(f"Generated {len(calib_images)} packaging label facets.")

    detector = DBNetTextDetector(model_path=det_fp32)
    recognizer = PPOCRv4Recognizer()

    det_frames = []
    en_crop_tensors = []
    hi_crop_tensors = []

    for name, img in calib_images:
        inp, _, _ = detector.preprocess(img)
        det_frames.append(inp)

        h, w = img.shape[:2]
        dets = detector.detect(img)
        for d in dets:
            valid, _ = PolygonNormalizer.validate_polygon(d.polygon, w, h)
            if valid:
                crop = PolygonNormalizer.extract_crop(img, d.polygon, target_height=48)
                t = recognizer.preprocess_crop(crop)
                t = np.expand_dims(t, axis=0)
                en_crop_tensors.append(t)
                if "hindi" in name:
                    hi_crop_tensors.append(t)

    print(f"Calibration data summary:")
    print(f"  - Detector frames:    {len(det_frames)}")
    print(f"  - English crops:      {len(en_crop_tensors)}")
    print(f"  - Devanagari crops:   {len(hi_crop_tensors)}")

    out_det = str(INT8_DIR / "ch_PP-OCRv4_det_int8.onnx")
    out_en = str(INT8_DIR / "en_PP-OCRv4_rec_infer_int8.onnx")
    out_hi = str(INT8_DIR / "devanagari_PP-OCRv4_rec_int8.onnx")

    meta_det = quantize_dbnet_detector(det_fp32, out_det, det_frames)
    meta_en = quantize_english_recognizer(en_fp32, out_en, en_crop_tensors)
    meta_hi = quantize_devanagari_recognizer(hi_fp32, out_hi, hi_crop_tensors if hi_crop_tensors else en_crop_tensors)

    manifest = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S IST"),
        "method": "static_ptq_qdq",
        "onnx_version": onnx.__version__,
        "onnxruntime_version": ort.__version__,
        "models": {
            "detector": meta_det,
            "english_recognizer": meta_en,
            "devanagari_recognizer": meta_hi
        }
    }

    manifest_path = INT8_DIR / "int8_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nQuantization complete! Metadata written to {manifest_path}")
    print("=" * 80)


if __name__ == "__main__":
    main()
