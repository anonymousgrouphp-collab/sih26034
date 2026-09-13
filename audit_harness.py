import os, sys, json, time, cv2
from pathlib import Path
REPO_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(REPO_ROOT))
for d in (REPO_ROOT / "members").iterdir():
    if (d / "src").is_dir(): sys.path.insert(0, str(d / "src"))
from engine import MultilingualOCREngine
from extractor import CommodityFactExtractor
from quality_gate import QualityGateEvaluator
IMAGE_DIR = REPO_ROOT / "Legal Metrology real product images"
RESULTS_FILE = REPO_ROOT / "audit_results.json"
def main():
    if not IMAGE_DIR.exists(): return
    ocr_engine = MultilingualOCREngine(execution_mode="FP32")
    extractor = CommodityFactExtractor()
    results = []
    print("Starting processing...")
    for img_path in IMAGE_DIR.rglob("*.*"):
        if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]: continue
        print(f"Processing: {img_path.name}")
        img_bgr = cv2.imread(str(img_path))
        if img_bgr is None: continue
        t0 = time.time()
        ocr_ready = QualityGateEvaluator.preprocess_for_ocr(img_bgr)
        try:
            ocr_output = ocr_engine.process_image(ocr_ready, image_id=img_path.name)
            facts = extractor.extract(ocr_output, calibration=None)
            found = 0
            if facts.manufacturer: found += 1
            if facts.net_quantity: found += 1
            if facts.mrp: found += 1
            if facts.mfg_date_year: found += 1
            if facts.consumer_care: found += 1
            if facts.country_of_origin: found += 1
            results.append({"file": img_path.name, "found": found})
            print(f"  -> Found {found} fields in {(time.time()-t0)*1000:.0f}ms")
        except Exception as e:
            print(f"  -> Error: {e}")
if __name__ == "__main__": main()
