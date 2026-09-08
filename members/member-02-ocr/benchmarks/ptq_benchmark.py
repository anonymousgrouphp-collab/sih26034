"""Full Comprehensive Benchmark & Validation for Member 2 FP32 vs INT8 PTQ.
SIH26034 NyayaDrishti-LM
"""

import os
import sys
import time
import json
import numpy as np
import cv2
from pathlib import Path

SRC_DIR = Path(__file__).resolve().parent / "members" / "member-02-ocr" / "src"
MODELS_DIR = Path(__file__).resolve().parent / "members" / "member-02-ocr" / "models"
INT8_DIR = MODELS_DIR / "int8"
REPO_ROOT = Path(__file__).resolve().parent

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from detector import DBNetTextDetector
from recognizer import PPOCRv4Recognizer
from engine import MultilingualOCREngine
from fallback import TesseractFallback

def compute_levenshtein(s1: str, s2: str) -> int:
    dp = [[0] * (len(s2) + 1) for _ in range(len(s1) + 1)]
    for i in range(len(s1) + 1):
        dp[i][0] = i
    for j in range(len(s2) + 1):
        dp[0][j] = j
    for i in range(1, len(s1) + 1):
        for j in range(1, len(s2) + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[len(s1)][len(s2)]

def calc_cer_wer(refs, hyps):
    total_chars = sum(len(r) for r in refs)
    char_errs = sum(compute_levenshtein(r, h) for r, h in zip(refs, hyps))
    cer = (char_errs / total_chars) * 100 if total_chars > 0 else 0.0

    total_words = 0
    word_errs = 0
    for r, h in zip(refs, hyps):
        r_words = r.split()
        h_words = h.split()
        total_words += len(r_words)
        word_errs += compute_levenshtein(r_words, h_words)
    wer = (word_errs / total_words) * 100 if total_words > 0 else 0.0
    return cer, wer

def create_scenarios():
    scenarios = {}

    # Scenario 1: Standard 2-field PDP
    img1 = np.full((320, 640, 3), 245, dtype=np.uint8)
    cv2.putText(img1, "Net Qty: 500 g", (40, 100), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    cv2.putText(img1, "MRP Rs. 150.00", (40, 220), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    scenarios["Scenario 1 (Standard 2-field PDP)"] = {
        "image": img1,
        "ground_truth": ["Net Qty: 500 g", "MRP Rs. 150.00"],
        "crops": 2
    }

    # Scenario 2: Standard 3-field PDP (Authoritative Benchmark Input)
    img2 = np.full((480, 640, 3), 245, dtype=np.uint8)
    cv2.putText(img2, "PARLE-G ORIGINAL GLUCOSE BISCUITS", (30, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (10, 10, 10), 2)
    cv2.putText(img2, "Net Qty: 500 g", (30, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.95, (10, 10, 10), 2)
    cv2.putText(img2, "MRP Rs. 50.00 (Incl. of all taxes)", (30, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (10, 10, 10), 2)
    scenarios["Scenario 2 (Standard 3-field PDP)"] = {
        "image": img2,
        "ground_truth": ["PARLE-G ORIGINAL GLUCOSE BISCUITS", "Net Qty: 500 g", "MRP Rs. 50.00 (Incl. of all taxes)"],
        "crops": 3
    }

    # Scenario 3: 5-field Dense PDP
    img3 = np.full((640, 640, 3), 245, dtype=np.uint8)
    cv2.putText(img3, "HERITAGE PURE COW GHEE", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (10, 10, 10), 2)
    cv2.putText(img3, "Net Qty: 1 L", (30, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (10, 10, 10), 2)
    cv2.putText(img3, "MRP Rs. 650.00", (30, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (10, 10, 10), 2)
    cv2.putText(img3, "Mfg Date: 12/2024", (30, 360), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (10, 10, 10), 2)
    cv2.putText(img3, "Consumer Care: care@heritage.com", (30, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.70, (10, 10, 10), 2)
    scenarios["Scenario 3 (5-field Dense PDP)"] = {
        "image": img3,
        "ground_truth": [
            "HERITAGE PURE COW GHEE",
            "Net Qty: 1 L",
            "MRP Rs. 650.00",
            "Mfg Date: 12/2024",
            "Consumer Care: care@heritage.com"
        ],
        "crops": 5
    }

    # Scenario 4: Hindi-Only 2-field PDP
    # For Hindi, render high-resolution Devanagari text via PIL
    from PIL import Image, ImageDraw, ImageFont
    pil_img4 = Image.new("RGB", (640, 320), color=(245, 245, 245))
    draw4 = ImageDraw.Draw(pil_img4)
    # Use standard system font or PIL default
    try:
        font_hi = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttf", 36)
    except Exception:
        font_hi = ImageFont.load_default()
    draw4.text((40, 80), "शुद्ध मात्रा: ५०० ग्राम", fill=(10, 10, 10), font=font_hi)
    draw4.text((40, 180), "अधिकतम खुदरा मूल्य: रु ५०.००", fill=(10, 10, 10), font=font_hi)
    img4 = cv2.cvtColor(np.array(pil_img4), cv2.COLOR_RGB2BGR)
    scenarios["Scenario 4 (Hindi-Only 2-field PDP)"] = {
        "image": img4,
        "ground_truth": ["शुद्ध मात्रा: ५०० ग्राम", "अधिकतम खुदरा मूल्य: रु ५०.००"],
        "crops": 2
    }

    # Scenario 5: Bilingual 4-field PDP
    pil_img5 = Image.new("RGB", (640, 540), color=(245, 245, 245))
    draw5 = ImageDraw.Draw(pil_img5)
    try:
        font_hi_med = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttf", 32)
    except Exception:
        font_hi_med = ImageFont.load_default()
    draw5.text((30, 50), "शुद्ध मात्रा: ५०० ग्राम", fill=(10, 10, 10), font=font_hi_med)
    draw5.text((30, 140), "Net Qty: 500 g", fill=(10, 10, 10), font=font_hi_med)
    draw5.text((30, 230), "अधिकतम मूल्य: रु १००", fill=(10, 10, 10), font=font_hi_med)
    draw5.text((30, 320), "MRP Rs. 100.00", fill=(10, 10, 10), font=font_hi_med)
    img5 = cv2.cvtColor(np.array(pil_img5), cv2.COLOR_RGB2BGR)
    scenarios["Scenario 5 (Bilingual 4-field PDP)"] = {
        "image": img5,
        "ground_truth": [
            "शुद्ध मात्रा: ५०० ग्राम",
            "Net Qty: 500 g",
            "अधिकतम मूल्य: रु १००",
            "MRP Rs. 100.00"
        ],
        "crops": 4
    }

    # Scenario 6: Small-Text 6-field Dense PDP
    img6 = np.full((640, 640, 3), 245, dtype=np.uint8)
    cv2.putText(img6, "BRAND: TATA TEA PREMIUM", (30, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    cv2.putText(img6, "Net Weight: 250 g", (30, 140), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    cv2.putText(img6, "MRP Rs. 140.00 (Incl. of all taxes)", (30, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    cv2.putText(img6, "Unit Sale Price: Rs. 0.56 / g", (30, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    cv2.putText(img6, "Mfg Date: 01/2024", (30, 380), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    cv2.putText(img6, "Country of Origin: India", (30, 460), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (10, 10, 10), 2)
    scenarios["Scenario 6 (Small-Text 6-field Dense PDP)"] = {
        "image": img6,
        "ground_truth": [
            "BRAND: TATA TEA PREMIUM",
            "Net Weight: 250 g",
            "MRP Rs. 140.00 (Incl. of all taxes)",
            "Unit Sale Price: Rs. 0.56 / g",
            "Mfg Date: 01/2024",
            "Country of Origin: India"
        ],
        "crops": 6
    }

    return scenarios

def run_isolated_component_benchmarks():
    print("=== RUNNING ISOLATED COMPONENT BENCHMARKS (15 RUNS EACH) ===")
    results = {}

    # 1. Detector (FP32 vs INT8)
    sample_img = np.full((480, 640, 3), 245, dtype=np.uint8)
    cv2.putText(sample_img, "Net Qty: 500 g", (30, 150), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)
    cv2.putText(sample_img, "MRP Rs. 50.00", (30, 300), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (10, 10, 10), 2)

    for mode in ["FP32", "INT8"]:
        det = DBNetTextDetector(num_threads=4, execution_mode=mode)
        # Warmup
        for _ in range(3):
            det.detect(sample_img)
        # 15 runs
        lats = []
        for _ in range(15):
            t0 = time.perf_counter()
            det.detect(sample_img)
            lats.append((time.perf_counter() - t0) * 1000.0)
        results[f"det_{mode}"] = {
            "mean": float(np.mean(lats)),
            "median": float(np.median(lats)),
            "p95": float(np.percentile(lats, 95)),
            "min": float(np.min(lats)),
            "max": float(np.max(lats)),
        }

    # 2. English Recognizer (3 crops)
    crop_en = np.full((48, 250, 3), 245, dtype=np.uint8)
    cv2.putText(crop_en, "Net Qty: 500 g", (10, 34), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (10, 10, 10), 2)

    for mode in ["FP32", "INT8"]:
        rec = PPOCRv4Recognizer(num_threads=6, execution_mode=mode)
        for _ in range(3):
            rec.recognize(crop_en, lang="en")
        lats = []
        for _ in range(15):
            t0 = time.perf_counter()
            rec.recognize(crop_en, lang="en")
            lats.append((time.perf_counter() - t0) * 1000.0)
        results[f"rec_en_single_{mode}"] = {
            "mean": float(np.mean(lats)),
            "median": float(np.median(lats)),
            "p95": float(np.percentile(lats, 95)),
            "min": float(np.min(lats)),
            "max": float(np.max(lats)),
        }

    # 3. Devanagari Recognizer
    from PIL import Image, ImageDraw, ImageFont
    pil_crop = Image.new("RGB", (280, 48), color=(245, 245, 245))
    d = ImageDraw.Draw(pil_crop)
    try:
        f = ImageFont.truetype("C:/Windows/Fonts/Nirmala.ttf", 28)
    except Exception:
        f = ImageFont.load_default()
    d.text((10, 6), "शुद्ध मात्रा: ५०० ग्राम", fill=(10, 10, 10), font=f)
    crop_hi = cv2.cvtColor(np.array(pil_crop), cv2.COLOR_RGB2BGR)

    for mode in ["FP32", "INT8"]:
        rec = PPOCRv4Recognizer(num_threads=6, execution_mode=mode)
        for _ in range(3):
            rec.recognize(crop_hi, lang="hi")
        lats = []
        for _ in range(15):
            t0 = time.perf_counter()
            rec.recognize(crop_hi, lang="hi")
            lats.append((time.perf_counter() - t0) * 1000.0)
        results[f"rec_hi_single_{mode}"] = {
            "mean": float(np.mean(lats)),
            "median": float(np.median(lats)),
            "p95": float(np.percentile(lats, 95)),
            "min": float(np.min(lats)),
            "max": float(np.max(lats)),
        }

    return results

def run_pipeline_benchmarks(scenarios):
    print("=== RUNNING STANDARD PIPELINE BENCHMARKS (15 RUNS) ===")
    std_img = scenarios["Scenario 2 (Standard 3-field PDP)"]["image"]
    pipeline_results = {}

    for mode in ["FP32", "INT8"]:
        engine = MultilingualOCREngine(det_num_threads=4, rec_num_threads=6, execution_mode=mode)
        # Warmup
        for _ in range(3):
            engine.process_image(std_img)

        run_totals = []
        det_times = []
        rect_times = []
        rec_times = []
        cons_times = []

        for _ in range(15):
            t_total_0 = time.perf_counter()

            t0 = time.perf_counter()
            dets = engine.detector.detect(std_img)
            t_det = (time.perf_counter() - t0) * 1000.0

            t_rect_accum = 0.0
            t_rec_accum = 0.0
            t_cons_accum = 0.0

            from polygon_normalizer import PolygonNormalizer
            for det in dets:
                t0 = time.perf_counter()
                crop = PolygonNormalizer.extract_crop(std_img, det.polygon, target_height=48)
                t_rect_accum += (time.perf_counter() - t0) * 1000.0

                t0 = time.perf_counter()
                p_text, p_conf, p_lang = engine.recognizer.recognize(crop)
                t_rec_accum += (time.perf_counter() - t0) * 1000.0

                t0 = time.perf_counter()
                if PolygonNormalizer.requires_consensus_fallback(p_conf, engine.fallback_threshold):
                    if engine.fallback.is_available():
                        engine.fallback.recognize(crop)
                t_cons_accum += (time.perf_counter() - t0) * 1000.0

            t_total = (time.perf_counter() - t_total_0) * 1000.0
            run_totals.append(t_total)
            det_times.append(t_det)
            rect_times.append(t_rect_accum)
            rec_times.append(t_rec_accum)
            cons_times.append(t_cons_accum)

        pipeline_results[mode] = {
            "total": {
                "mean": float(np.mean(run_totals)),
                "median": float(np.median(run_totals)),
                "p95": float(np.percentile(run_totals, 95)),
                "min": float(np.min(run_totals)),
                "max": float(np.max(run_totals)),
                "runs": run_totals
            },
            "detection": {
                "mean": float(np.mean(det_times)),
                "median": float(np.median(det_times)),
                "p95": float(np.percentile(det_times, 95)),
            },
            "rectification": {
                "mean": float(np.mean(rect_times)),
                "median": float(np.median(rect_times)),
                "p95": float(np.percentile(rect_times, 95)),
            },
            "recognition": {
                "mean": float(np.mean(rec_times)),
                "median": float(np.median(rec_times)),
                "p95": float(np.percentile(rec_times, 95)),
            },
            "consensus": {
                "mean": float(np.mean(cons_times)),
                "median": float(np.median(cons_times)),
                "p95": float(np.percentile(cons_times, 95)),
            }
        }

    # 45-run aggregate for FP32 and INT8
    print("=== RUNNING 45-RUN AGGREGATE (3 SETS OF 15) ===")
    aggregate_results = {}
    for mode in ["FP32", "INT8"]:
        engine = MultilingualOCREngine(det_num_threads=4, rec_num_threads=6, execution_mode=mode)
        # We already have set 1 (15 runs)
        all_45 = list(pipeline_results[mode]["total"]["runs"])
        for batch_idx in range(2):
            for _ in range(15):
                t0 = time.perf_counter()
                engine.process_image(std_img)
                all_45.append((time.perf_counter() - t0) * 1000.0)
        aggregate_results[mode] = {
            "mean": float(np.mean(all_45)),
            "median": float(np.median(all_45)),
            "p95": float(np.percentile(all_45, 95)),
            "min": float(np.min(all_45)),
            "max": float(np.max(all_45)),
            "count": len(all_45)
        }

    return pipeline_results, aggregate_results

def run_scenario_benchmarks(scenarios):
    print("=== RUNNING 6 PACKAGING SCENARIOS BENCHMARK ===")
    scenario_eval = {}

    for name, s_data in scenarios.items():
        img = s_data["image"]
        gt = s_data["ground_truth"]

        s_res = {}
        for mode in ["FP32", "INT8"]:
            engine = MultilingualOCREngine(det_num_threads=4, rec_num_threads=6, execution_mode=mode)
            # Run 5 iterations for stable timing
            lats = []
            last_out = None
            for _ in range(5):
                t0 = time.perf_counter()
                last_out = engine.process_image(img, image_id="scen_eval")
                lats.append((time.perf_counter() - t0) * 1000.0)

            hyp_texts = [t.text for t in last_out.tokens]
            # Match hyp with GT
            matched_hyps = []
            for g in gt:
                # Find best matching hyp
                best_h = ""
                best_dist = 9999
                for h in hyp_texts:
                    dist = compute_levenshtein(g, h)
                    if dist < best_dist:
                        best_dist = dist
                        best_h = h
                matched_hyps.append(best_h)

            cer, wer = calc_cer_wer(gt, matched_hyps)

            s_res[mode] = {
                "mean_latency_ms": float(np.mean(lats)),
                "median_latency_ms": float(np.median(lats)),
                "p95_latency_ms": float(np.percentile(lats, 95)),
                "tokens_detected": len(last_out.tokens),
                "cer": cer,
                "wer": wer,
                "transcriptions": matched_hyps,
                "mean_confidence": last_out.mean_confidence
            }
        scenario_eval[name] = s_res

    return scenario_eval

if __name__ == "__main__":
    scenarios = create_scenarios()
    isolated = run_isolated_component_benchmarks()
    pipeline, aggregate = run_pipeline_benchmarks(scenarios)
    scenario_eval = run_scenario_benchmarks(scenarios)

    full_output = {
        "isolated": isolated,
        "pipeline": pipeline,
        "aggregate": aggregate,
        "scenarios": scenario_eval
    }

    out_file = REPO_ROOT / "ptq_benchmark_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(full_output, f, indent=2)

    print("\nBENCHMARK COMPLETE. Results saved to ptq_benchmark_results.json")
