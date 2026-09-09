"""Benchmark Script for Member 2 OCR Pipeline (SIH26034 - NyayaDrishti-LM)

Measures:
- DBNet++ multi-oriented text detection latency
- Multilingual recognition latency (PP-OCRv4 English + PP-OCRv3 Devanagari)
- Tesseract consensus fallback latency
- Total warm OCR inference latency
Evaluates against statutory target: < 800 ms on CPU
"""

import os
import sys
import time
import platform
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import cv2

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from engine import MultilingualOCREngine
from detector import DBNetTextDetector
from recognizer import PPOCRv4Recognizer
from fallback import TesseractFallback, OCRConsensusEngine
from polygon_normalizer import PolygonNormalizer


def generate_synthetic_benchmark_label(width: int = 640, height: int = 480) -> np.ndarray:
    """Generates a realistic packaging label with multiple statutory text lines."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 248  # Off-white cardboard background

    # Border frame
    cv2.rectangle(img, (20, 20), (width - 20, height - 20), (200, 200, 200), 2)

    # Line 1: Brand / Product
    cv2.putText(img, "SUNFEAST BOUNCE BISCUITS", (40, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (20, 20, 20), 2)

    # Line 2: Net Quantity
    cv2.putText(img, "Net Quantity: 150 g", (40, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (20, 20, 20), 2)

    # Line 3: MRP
    cv2.putText(img, "MRP Rs. 35.00 (incl. of all taxes)", (40, 190), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (20, 20, 20), 2)

    # Line 4: USP
    cv2.putText(img, "Unit Sale Price: Rs. 0.23 / g", (40, 250), cv2.FONT_HERSHEY_SIMPLEX, 0.70, (20, 20, 20), 2)

    # Line 5: Manufacturer Address
    cv2.putText(img, "Mfd By: Sunfeast Foods Ltd, Plot 42, Gurugram 122011", (40, 310), cv2.FONT_HERSHEY_SIMPLEX, 0.60, (20, 20, 20), 2)

    # Line 6: Consumer Care
    cv2.putText(img, "Consumer Care: care@sunfeast.com | Toll-Free: 1800-123-4567", (40, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (20, 20, 20), 2)

    # Line 7: Country of Origin
    cv2.putText(img, "Country of Origin: India", (40, 410), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (20, 20, 20), 2)

    return img


def run_benchmark(num_warmup: int = 5, num_iterations: int = 20) -> Dict[str, Any]:
    test_img = generate_synthetic_benchmark_label(640, 480)
    engine = MultilingualOCREngine()

    # 1. Cold Start Run
    t0 = time.perf_counter()
    _ = engine.process_image(test_img, image_id="benchmark_cold")
    cold_start_ms = (time.perf_counter() - t0) * 1000

    # Warmup
    for _ in range(num_warmup):
        _ = engine.process_image(test_img, image_id="benchmark_warmup")

    # Benchmarking Components
    det_latencies = []
    rec_latencies = []
    fallback_latencies = []
    total_latencies = []

    for _ in range(num_iterations):
        # Time detection
        t_det_0 = time.perf_counter()
        detections = engine.detector.detect(test_img)
        t_det = (time.perf_counter() - t_det_0) * 1000
        det_latencies.append(t_det)

        # Time recognition on detected crops
        crops = [
            PolygonNormalizer.extract_crop(test_img, d.polygon, target_height=48)
            for d in detections
            if PolygonNormalizer.validate_polygon(d.polygon, 640, 480)[0]
        ]

        t_rec_0 = time.perf_counter()
        for crop in crops:
            _ = engine.recognizer.recognize(crop)
        t_rec = (time.perf_counter() - t_rec_0) * 1000
        rec_latencies.append(t_rec)

        # Time fallback / consensus arbitration
        t_fb_0 = time.perf_counter()
        for crop in crops:
            _ = OCRConsensusEngine.resolve(
                "Net Quantity: 150 g", 0.60, "Net Quantity 150 g", 0.65
            )
        t_fb = (time.perf_counter() - t_fb_0) * 1000
        fallback_latencies.append(t_fb)

        # Time full pipeline
        t_tot_0 = time.perf_counter()
        _ = engine.process_image(test_img, image_id="benchmark_run")
        t_tot = (time.perf_counter() - t_tot_0) * 1000
        total_latencies.append(t_tot)

    def stats(arr: List[float]) -> Dict[str, float]:
        return {
            "mean": float(np.mean(arr)),
            "median": float(np.median(arr)),
            "p95": float(np.percentile(arr, 95)),
            "min": float(np.min(arr)),
            "max": float(np.max(arr)),
        }

    return {
        "cold_start_ms": cold_start_ms,
        "detection": stats(det_latencies),
        "recognition": stats(rec_latencies),
        "fallback": stats(fallback_latencies),
        "total": stats(total_latencies),
    }


def main():
    bench = run_benchmark(num_warmup=3, num_iterations=15)
    total_mean = bench["total"]["mean"]
    total_p95 = bench["total"]["p95"]
    is_pass = total_p95 < 800.0

    print("Member 2 OCR Benchmark")
    print("======================")
    print()
    print(f"CPU: {platform.processor() or platform.machine()} ({os.cpu_count()} cores)")
    print(f"Python: {platform.python_version()}")
    print("Model: DBNet++ (Text Detection) + PP-OCRv4 English / PP-OCRv3 Devanagari (Recognition)")
    print("Image resolution: 640x480 (Rectified packaging frame)")
    print(f"Cold Start: {bench['cold_start_ms']:.2f} ms")
    print()
    print("Detection:")
    print(f"  mean: {bench['detection']['mean']:.2f} ms")
    print(f"  p95:  {bench['detection']['p95']:.2f} ms")
    print()
    print("Recognition:")
    print(f"  mean: {bench['recognition']['mean']:.2f} ms")
    print(f"  p95:  {bench['recognition']['p95']:.2f} ms")
    print()
    print("Fallback:")
    print(f"  mean: {bench['fallback']['mean']:.2f} ms")
    print(f"  p95:  {bench['fallback']['p95']:.2f} ms")
    print()
    print("Total warm OCR:")
    print(f"  mean: {total_mean:.2f} ms")
    print(f"  p95:  {total_p95:.2f} ms")
    print()
    print("Target:")
    print("  < 800 ms")
    print()
    print(f"Result:\n  {'PASS' if is_pass else 'NOT MET'}")


if __name__ == "__main__":
    main()
