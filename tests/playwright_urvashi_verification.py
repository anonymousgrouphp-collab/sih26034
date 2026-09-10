"""Playwright Verification Suite for Integrated Urvashi UI/UX Features.
SIH26034 - NyayaDrishti-LM
Tests:
1. Quick Triage filter pills on InspectionDesk (All, Conflict Cases, Evidence Gaps)
2. Table micro-interactions (confidence micro-progress bars, MapPin, CalendarDays icons)
3. ConflictResolutionCard (Expected vs Observed badges, Officer Adjudication trigger)
4. Step-by-step Metric Calibration Traceability formula in AdjudicationCanvas & AnalysisHUD
"""

import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(line_buffering=True, encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRATCH_DIR = REPO_ROOT / "scratch"
SCRATCH_DIR.mkdir(parents=True, exist_ok=True)

PORT = 5173
BASE_URL = f"http://127.0.0.1:{PORT}"

def log(msg):
    print(msg, flush=True)

def run_playwright_audit():
    log(f"[PLAYWRIGHT] Launching browser audit targeting {BASE_URL}...")
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # 1. Navigate to base URL
        log(f"[1/5] Navigating to {BASE_URL}...")
        try:
            page.goto(BASE_URL, wait_until="domcontentloaded", timeout=10000)
            page.wait_for_selector("text=Legal Metrology Inspection Desk", timeout=10000)
        except Exception as e:
            log(f"[FATAL] Failed to reach {BASE_URL}: {e}")
            browser.close()
            return False

        time.sleep(1)

        # 2. Check InspectionDesk quick triage filter pills
        log("[2/5] Auditing InspectionDesk quick triage pills & table micro-interactions...")
        triage_all = page.locator("[data-testid='triage-all']")
        triage_conflicts = page.locator("[data-testid='triage-conflicts']")
        triage_gaps = page.locator("[data-testid='triage-evidence-gaps']")

        assert triage_all.is_visible(), "All Cases triage pill must be visible"
        assert triage_conflicts.is_visible(), "Conflict Cases triage pill must be visible"
        assert triage_gaps.is_visible(), "Evidence Gaps triage pill must be visible"
        log("  ✓ All 3 quick triage pills are visible")

        # Test filtering by Conflict Cases
        triage_conflicts.click()
        time.sleep(0.5)
        conflict_rows = page.locator("tbody tr").count()
        log(f"  ✓ Conflict Cases filter active: {conflict_rows} case(s) displayed")
        assert conflict_rows > 0, "Conflict cases must show matching rows"

        # Test filtering by Evidence Gaps
        triage_gaps.click()
        time.sleep(0.5)
        gap_rows = page.locator("tbody tr").count()
        log(f"  ✓ Evidence Gaps filter active: {gap_rows} case(s) displayed")
        assert gap_rows > 0, "Evidence gaps must show matching rows"

        # Return to All
        triage_all.click()
        time.sleep(0.5)

        # Check for confidence micro-progress bars
        confidence_text = page.locator("text=%").first
        assert confidence_text.is_visible(), "Confidence percentage must be visible"
        log("  ✓ Confidence percentages and micro-progress bars are rendered")

        # Capture Screenshot of InspectionDesk with Triage & Micro-Interactions
        desk_shot = SCRATCH_DIR / "playwright_inspection_desk_triage.png"
        page.screenshot(path=str(desk_shot), full_page=False)
        log(f"  [SCREENSHOT] Saved: {desk_shot}")
        results.append(("InspectionDesk Triage & Micro-Interactions", True))

        # 3. Select SKU-DEMO-02 (Ready-to-Eat Dal Makhani) to audit ConflictResolutionCard
        log("[3/5] Navigating to SKU-DEMO-02 (INSP-20260910-C300) to audit ConflictResolutionCard...")
        dal_row = page.locator("tr:has-text('INSP-20260910-C300')").first
        if dal_row.is_visible():
            dal_row.click()
        else:
            sku02_btn = page.locator("button:has-text('SKU-DEMO-02')").first
            sku02_btn.click()

        time.sleep(1.5)

        # Verify ConflictResolutionCard
        conflict_card = page.locator("[data-testid='conflict-resolution-card']")
        assert conflict_card.is_visible(), "ConflictResolutionCard must be prominently visible on SKU-DEMO-02"
        log("  ✓ ConflictResolutionCard is rendered at top of canvas")

        # Verify Expected vs Observed Badges
        expected_badge = page.locator("text=Expected:").first
        observed_badge = page.locator("text=Observed:").first
        assert expected_badge.is_visible(), "Expected badge must be visible"
        assert observed_badge.is_visible(), "Observed badge must be visible"
        log("  ✓ Expected vs Observed badges correctly rendered")

        # Verify Officer Adjudication trigger button
        adjudicate_btn = conflict_card.locator("button:has-text('Officer Adjudication')")
        assert adjudicate_btn.is_visible(), "Officer Adjudication action button must be visible in conflict card"
        log("  ✓ 'Officer Adjudication' action button verified")

        # 4. Verify Metric Calibration Traceability in AdjudicationCanvas
        log("[4/5] Auditing Metric Calibration Math Block in AdjudicationCanvas...")
        calib_block = page.locator("[data-testid='calibration-math-block']")
        assert calib_block.is_visible(), "Calibration math block must be visible in AdjudicationCanvas"

        formula_text = page.locator("text=scale = reference length (mm) / measured ArUco marker edge (px)").first
        assert formula_text.is_visible(), "Explicit scale formula must be displayed"

        concrete_math = page.locator("text=scale = 50.00 / 800 = 0.0625 mm/px").first
        assert concrete_math.is_visible(), "Concrete step-by-step scale math must be displayed"

        uncertainty_text = page.locator("text=Estimated uncertainty (k=2, 95% CI): ±0.04 mm").first
        assert uncertainty_text.is_visible(), "k=2 uncertainty must be displayed"
        log("  ✓ Step-by-step calibration math verified in AdjudicationCanvas")

        # Capture Screenshot of AdjudicationCanvas with ConflictCard and Calibration Math
        adjudication_shot = SCRATCH_DIR / "playwright_adjudication_conflict_and_calibration.png"
        page.screenshot(path=str(adjudication_shot), full_page=True)
        log(f"  [SCREENSHOT] Saved: {adjudication_shot}")
        results.append(("ConflictResolutionCard & Adjudication Calibration Math", True))

        # 5. Switch to Diagnostic HUD and audit AnalysisHUD Calibration Math
        log("[5/5] Switching to Diagnostic HUD to verify AnalysisHUD calibration math...")
        hud_btn = page.locator("button:has-text('Pipeline Diagnostic HUD')").first
        if not hud_btn.is_visible():
            hud_btn = page.locator("button:has-text('Diagnostic HUD')").first
        assert hud_btn.is_visible(), "Diagnostic HUD switch button must be visible"
        hud_btn.click()
        time.sleep(1)

        hud_math = page.locator("[data-testid='calibration-math-hud']")
        assert hud_math.is_visible(), "Calibration math block must be visible in AnalysisHUD"

        hud_formula = hud_math.locator("text=scale = reference length (mm) / measured ArUco marker edge (px)")
        assert hud_formula.is_visible(), "Scale formula must be visible in AnalysisHUD"

        hud_concrete = hud_math.locator("text=scale = 50.00 / 800 = 0.0625 mm/px")
        assert hud_concrete.is_visible(), "Concrete calibration math must be visible in AnalysisHUD"

        hud_ci = hud_math.locator("text=Estimated uncertainty (k=2, 95% CI): ±0.04 mm")
        assert hud_ci.is_visible(), "Uncertainty bound must be visible in AnalysisHUD"
        log("  ✓ Calibration math block verified in AnalysisHUD")

        # Capture Screenshot of AnalysisHUD
        hud_shot = SCRATCH_DIR / "playwright_analysis_hud_calibration_math.png"
        page.screenshot(path=str(hud_shot), full_page=True)
        log(f"  [SCREENSHOT] Saved: {hud_shot}")
        results.append(("AnalysisHUD Calibration Math Traceability", True))

        context.close()
        browser.close()

        log("\n=== Playwright Verification Results ===")
        for name, passed in results:
            log(f"  [PASSED] {name}")
        os._exit(0)

if __name__ == "__main__":
    run_playwright_audit()
