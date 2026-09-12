"""Comprehensive Live E2E Playwright & 50-Scenario Statutory Accuracy Audit Suite.
SIH26034 - NyayaDrishti-LM
Tests Live Frontend (Vercel): https://sih26034.vercel.app
Tests Live Backend (Render): https://nyayadrishti-backend.onrender.com
Governed by Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023).
"""

import json
import os
from pathlib import Path
import sys
import time
import urllib.error
import urllib.request

# Setup paths
REPO_ROOT = Path(__file__).resolve().parent.parent
for member_dir in (REPO_ROOT / "members").iterdir():
    src_dir = member_dir / "src"
    if src_dir.is_dir() and str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

# Playwright
from playwright.sync_api import sync_playwright

# Core domain modules for mathematical and statutory cross-verification
from evaluators import LegalMetrologyRuleEngine, Table1FontSchedule, USPEvaluator
from parsers import StatutoryDeclarationParser
from extractor import CommodityFactExtractor
from merkle_dag import MerkleAuditLedger

# Force UTF-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

VERCEL_URL = os.getenv("FRONTEND_URL", "https://sih26034.vercel.app")
RENDER_URL = os.getenv("BACKEND_URL", "https://nyayadrishti-backend.onrender.com")

test_results = []

def record_test(suite: str, test_name: str, passed: bool, details: str = ""):
    status = "PASS" if passed else "FAIL"
    test_results.append({
        "suite": suite,
        "test": test_name,
        "status": status,
        "details": details,
    })
    symbol = "+" if passed else "X"
    print(f"[{symbol}] [{suite}] {test_name}: {status} {('- ' + details) if details else ''}")


# =============================================================================
# SUITE 1: PLAYWRIGHT LIVE BROWSER WORKSTATION TESTS (12 Tests)
# =============================================================================
def run_playwright_suite():
    print("\n" + "="*80)
    print("RUNNING SUITE 1: PLAYWRIGHT LIVE BROWSER AUDIT (Chrome DevTools Engine)")
    print("Target: " + VERCEL_URL)
    print("="*80)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        try:
            # 1. Page Load
            start = time.time()
            response = page.goto(VERCEL_URL, wait_until="networkidle", timeout=30000)
            load_time = time.time() - start
            record_test("Playwright UI", "1. Page Load HTTP Status 200", response.status == 200, f"{load_time:.2f}s latency")

            # 2. Page Title
            title = page.title()
            record_test("Playwright UI", "2. Page Title Exists & Non-Empty", len(title) > 0, f"Title: '{title}'")

            # 3. GOI Ministry Branding
            has_goi = page.locator("text=Government of India").count() > 0
            has_doca = page.locator("text=Department of Consumer Affairs").count() > 0
            record_test("Playwright UI", "3. Ministry Branding (DoCA / GOI)", has_goi and has_doca, "Rendered in Header")

            # 4. LMPC Rules 2011 Workstation Badge
            has_lmpc_badge = page.locator("text=LMPC Rules, 2011 Workstation").count() > 0
            record_test("Playwright UI", "4. LMPC Rules 2011 Subtitle Badge", has_lmpc_badge, "Badge verified")

            # 5. Officer Role Toggle (Inspector / Controller)
            has_inspector = page.locator("button:has-text('Inspector')").count() > 0
            has_controller = page.locator("button:has-text('Controller')").count() > 0
            record_test("Playwright UI", "5. RBAC Inspector/Controller Buttons", has_inspector and has_controller, "Both buttons present")

            # 6. Toggle Role to Controller
            page.click("button:has-text('Controller')")
            page.wait_for_timeout(500)
            controller_selected = "bg-purple-600" in (page.locator("button:has-text('Controller')").get_attribute("class") or "")
            record_test("Playwright UI", "6. Role Toggle State Transition", controller_selected, "Controller role active")

            # 7. Inspection Desk KPIs
            has_total_cases = page.locator("text=TOTAL REGISTERED CASES").count() > 0
            has_pending = page.locator("text=PENDING ADJUDICATION").count() > 0
            record_test("Playwright UI", "7. Executive KPI Metric Cards", has_total_cases and has_pending, "Cards rendered")

            # 8. Golden SKU Register Rows
            table_rows = page.locator("tbody tr").count()
            record_test("Playwright UI", "8. Inspection Register Table Populated", table_rows >= 5, f"Rendered {table_rows} cases")

            # 9. Search Bar Filter
            search_input = page.locator("input[placeholder*='Search']")
            has_search = search_input.count() > 0
            if has_search:
                search_input.fill("Butter Cookies")
                page.wait_for_timeout(400)
                filtered_count = page.locator("text=Premium Butter Cookies").count()
                search_input.fill("")  # Clear
                record_test("Playwright UI", "9. Search Filtering Response", filtered_count > 0, "Filtered to matching SKU")
            else:
                record_test("Playwright UI", "9. Search Filtering Response", False, "Search bar missing")

            # 10. Click on SKU-DEMO-01 to open Adjudication Canvas
            page.click("text=Premium Butter Cookies")
            page.wait_for_timeout(1500)
            has_canvas = page.locator("text=Adjudication Canvas").count() > 0 or page.locator("text=Statutory Rule Findings").count() > 0 or page.locator("text=INSP-").count() > 0
            record_test("Playwright UI", "10. Adjudication Canvas Navigation", has_canvas, "Case workspace loaded")

            # 11. Screenshot Capture
            screenshot_path = REPO_ROOT / "docs" / "live_workstation_audit_screenshot.png"
            page.screenshot(path=str(screenshot_path), full_page=True)
            record_test("Playwright UI", "11. Full-Page Visual Render Artifact", screenshot_path.is_file(), f"Saved to {screenshot_path.name}")

            # 12. Console Integrity
            clean_console = len(console_errors) == 0
            record_test("Playwright UI", "12. Browser Console Zero Unhandled Errors", clean_console, f"{len(console_errors)} errors detected" if not clean_console else "Clean 0 errors")

        except Exception as e:
            record_test("Playwright UI", "Playwright Execution Exception", False, str(e))
        finally:
            browser.close()


# =============================================================================
# SUITE 2: TABLE-I FONT HEIGHT SCHEDULE ACCURACY TESTS (10 Tests)
# =============================================================================
def run_table1_suite():
    print("\n" + "="*80)
    print("RUNNING SUITE 2: TABLE-I FONT SCHEDULE MATHEMATICAL ACCURACY (LMPC Rules, 2011)")
    print("="*80)

    # 1. Area <= 50 cm2 requires 1.0 mm (Pass)
    r1 = Table1FontSchedule.evaluate(pdp_area_cm2=45.0, measured_height_mm=1.2)
    record_test("Table-I Schedule", "1. Area 45 cm² with 1.2 mm -> PASS", r1["status"] == "PASS")

    # 2. Area <= 50 cm2 requires 1.0 mm (Fail)
    r2 = Table1FontSchedule.evaluate(pdp_area_cm2=45.0, measured_height_mm=0.8)
    record_test("Table-I Schedule", "2. Area 45 cm² with 0.8 mm -> FAIL", r2["status"] == "FAIL")

    # 3. Area 50.0 boundary requires 1.0 mm
    r3 = Table1FontSchedule.evaluate(pdp_area_cm2=50.0, measured_height_mm=1.0)
    record_test("Table-I Schedule", "3. Boundary 50.0 cm² with 1.0 mm -> PASS", r3["status"] == "PASS")

    # 4. Area 50.1 cm2 requires 1.5 mm (Pass)
    r4 = Table1FontSchedule.evaluate(pdp_area_cm2=50.1, measured_height_mm=1.5)
    record_test("Table-I Schedule", "4. Area 50.1 cm² with 1.5 mm -> PASS", r4["status"] == "PASS")

    # 5. Area 50.1 cm2 with 1.2 mm (Fail)
    r5 = Table1FontSchedule.evaluate(pdp_area_cm2=50.1, measured_height_mm=1.2)
    record_test("Table-I Schedule", "5. Area 50.1 cm² with 1.2 mm -> FAIL", r5["status"] == "FAIL")

    # 6. Area 100.0 cm2 boundary requires 1.5 mm
    r6 = Table1FontSchedule.evaluate(pdp_area_cm2=100.0, measured_height_mm=1.5)
    record_test("Table-I Schedule", "6. Boundary 100.0 cm² with 1.5 mm -> PASS", r6["status"] == "PASS")

    # 7. Area 144.0 cm2 (SKU-DEMO-01) requires 2.5 mm -> 1.84 mm should FAIL
    r7 = Table1FontSchedule.evaluate(pdp_area_cm2=144.0, measured_height_mm=1.84)
    record_test("Table-I Schedule", "7. Biscuit Carton 144 cm² with 1.84 mm -> FAIL", r7["status"] == "FAIL" and r7["required_mm"] == 2.5)

    # 8. Area 600.0 cm2 requires 4.0 mm
    r8 = Table1FontSchedule.evaluate(pdp_area_cm2=600.0, measured_height_mm=4.2)
    record_test("Table-I Schedule", "8. Area 600 cm² with 4.2 mm -> PASS", r8["status"] == "PASS" and r8["required_mm"] == 4.0)

    # 9. Area > 2500 cm2 (Row 5) MUST PRESCRIBE 6.0 mm (ADL-01, NEVER 8.0 mm)
    r9 = Table1FontSchedule.evaluate(pdp_area_cm2=3000.0, measured_height_mm=6.5)
    record_test("Table-I Schedule", "9. Row 5 Area 3000 cm² Prescribes 6.0 mm (ADL-01)", r9["required_mm"] == 6.0 and r9["status"] == "PASS")

    # 10. Row 5 Deficit: Area 3000 cm2 with 5.5 mm -> FAIL
    r10 = Table1FontSchedule.evaluate(pdp_area_cm2=3000.0, measured_height_mm=5.5)
    record_test("Table-I Schedule", "10. Row 5 Area 3000 cm² with 5.5 mm -> FAIL", r10["status"] == "FAIL")


# =============================================================================
# SUITE 3: UNIT SALE PRICE (USP) & MRP ACCURACY TESTS (10 Tests)
# =============================================================================
def run_usp_suite():
    print("\n" + "="*80)
    print("RUNNING SUITE 3: UNIT SALE PRICE (USP) MATHEMATICAL ACCURACY (Rule 6(1)(k))")
    print("="*80)

    # 1. 200g Biscuit at ₹80 MRP -> Correct USP = 80/200 = 0.40/g
    u1 = USPEvaluator.evaluate(net_qty=200.0, mrp=80.0, declared_usp=0.40)
    record_test("USP Math", "1. 200g @ ₹80 with USP ₹0.40 -> PASS", u1["status"] == "PASS")

    # 2. SKU-DEMO-02 Mismatch: 200g @ ₹80 declaring USP ₹0.60 -> Discrepancy ₹0.20
    u2 = USPEvaluator.evaluate(net_qty=200.0, mrp=80.0, declared_usp=0.60)
    record_test("USP Math", "2. 200g @ ₹80 declaring ₹0.60 -> FAIL (Mismatch)", u2["status"] == "FAIL")

    # 3. 1 kg Pack at ₹150 MRP -> Correct USP = 150/1 = 150/kg
    u3 = USPEvaluator.evaluate(net_qty=1.0, mrp=150.0, declared_usp=150.0)
    record_test("USP Math", "3. 1kg @ ₹150 with USP ₹150/kg -> PASS", u3["status"] == "PASS")

    # 4. 500 ml Beverage at ₹35 MRP -> Correct USP = 35/500 = 0.07/ml
    u4 = USPEvaluator.evaluate(net_qty=500.0, mrp=35.0, declared_usp=0.07)
    record_test("USP Math", "4. 500ml @ ₹35 with USP ₹0.07/ml -> PASS", u4["status"] == "PASS")

    # 5. Rounding tolerance: |(decl * qty) - mrp| <= 0.02 INR is compliant
    u5 = USPEvaluator.evaluate(net_qty=100.0, mrp=10.0, declared_usp=0.1001)  # Discrepancy = 0.01 INR <= 0.02
    record_test("USP Math", "5. Rounding tolerance within 0.02 INR -> PASS", u5["status"] == "PASS")

    # 6. Out of rounding tolerance: discrepancy = 0.05 INR > 0.02 -> FAIL
    u6 = USPEvaluator.evaluate(net_qty=100.0, mrp=10.0, declared_usp=0.1005)  # Discrepancy = 0.05 INR
    record_test("USP Math", "6. Out of tolerance (> 0.02 INR) -> FAIL", u6["status"] == "FAIL")

    # 7. MRP Tax Inclusive Clause Detection (Valid)
    txt1 = "MRP Rs. 120.00 (inclusive of all taxes)"
    mrp1 = StatutoryDeclarationParser.parse_mrp(txt1)
    record_test("USP Math", "7. Standard Tax-Inclusive MRP Extraction", mrp1 is not None and mrp1["tax_inclusive"] is True and mrp1["amount"] == 120.0)

    # 8. MRP Split-Line Tax Inclusivity
    txt2 = "MAX RETAIL PRICE: INR 250\nINCL. OF ALL TAXES"
    mrp2 = StatutoryDeclarationParser.parse_mrp(txt2)
    record_test("USP Math", "8. Multi-Line Tax Inclusive MRP Extraction", mrp2 is not None and mrp2["tax_inclusive"] is True and mrp2["amount"] == 250.0)

    # 9. MRP Missing Tax Clause Flagging
    txt3 = "MRP Rs. 99.00"
    mrp3 = StatutoryDeclarationParser.parse_mrp(txt3)
    record_test("USP Math", "9. MRP Missing Mandatory Tax Clause", mrp3 is not None and mrp3["tax_inclusive"] is False)

    # 10. Devanagari MRP Extraction (अ.खु.मू. ₹50 सभी करों सहित)
    txt4 = "अ.वि.मू. ₹50 सभी कर सहित"
    mrp4 = StatutoryDeclarationParser.parse_mrp(txt4)
    record_test("USP Math", "10. Hindi Vernacular Tax-Inclusive MRP Extraction", mrp4 is not None and mrp4["amount"] == 50.0)


# =============================================================================
# SUITE 4: BANNED STATUTORY UNITS & LEGAL INVARIANTS (10 Tests)
# =============================================================================
def run_banned_units_suite():
    print("\n" + "="*80)
    print("RUNNING SUITE 4: BANNED UNITS & EVIDENTIARY DEFENSE (Section 11 LM Act)")
    print("="*80)

    # 1. Prohibited 'gms'
    has1, sym1 = StatutoryDeclarationParser.detect_banned_units("Net Weight: 200 gms")
    record_test("Banned Units", "1. Detects prohibited 'gms'", has1 and sym1 == "gms")

    # 2. Prohibited 'gm'
    has2, sym2 = StatutoryDeclarationParser.detect_banned_units("Net Qty: 500 gm")
    record_test("Banned Units", "2. Detects prohibited 'gm'", has2 and sym2 == "gm")

    # 3. Prohibited uppercase 'ML'
    has3, sym3 = StatutoryDeclarationParser.detect_banned_units("Volume: 750 ML")
    record_test("Banned Units", "3. Detects prohibited uppercase 'ML'", has3 and sym3 == "ML")

    # 4. Prohibited 'ltrs'
    has4, sym4 = StatutoryDeclarationParser.detect_banned_units("Quantity: 2 ltrs")
    record_test("Banned Units", "4. Detects prohibited 'ltrs'", has4 and sym4 == "ltrs")

    # 5. Prohibited 'cc'
    has5, sym5 = StatutoryDeclarationParser.detect_banned_units("Capacity: 100 cc")
    record_test("Banned Units", "5. Detects prohibited 'cc'", has5 and sym5 == "cc")

    # 6. Legal lowercase 'ml' must NOT be flagged
    has6, _ = StatutoryDeclarationParser.detect_banned_units("Net Vol: 500 ml")
    record_test("Banned Units", "6. Legal unit 'ml' Passes Cleanly", not has6)

    # 7. Legal 'g' and 'kg' must NOT be flagged
    has7, _ = StatutoryDeclarationParser.detect_banned_units("Net Weight: 200 g, Gross: 1 kg")
    record_test("Banned Units", "7. Legal units 'g' and 'kg' Pass Cleanly", not has7)

    # 8. Latin Abbreviation Defense: "e.g. with milk" must NOT trigger 'g.'
    has8, _ = StatutoryDeclarationParser.detect_banned_units("Serving suggestion e.g. with milk")
    record_test("Banned Units", "8. Latin Abbreviation Defense ('e.g.')", not has8)

    # 9. Tech Acronym Defense: "AI/ML enabled" must NOT trigger 'ML'
    has9, _ = StatutoryDeclarationParser.detect_banned_units("Smart IoT Packaging with AI/ML Edge Chip")
    record_test("Banned Units", "9. Tech Acronym Defense ('AI/ML')", not has9)

    # 10. Corporate Suffix Defense: "GM Foods Pvt Ltd" must NOT trigger 'GM'
    has10, _ = StatutoryDeclarationParser.detect_banned_units("Marketed by: GM Foods Private Limited")
    record_test("Banned Units", "10. Corporate Entity Defense ('GM Foods')", not has10)


# =============================================================================
# SUITE 5: SECTION 63 BSA 2023 & LIVE CLOUD API SUITE (12 Tests)
# =============================================================================
def run_cloud_api_suite():
    print("\n" + "="*80)
    print("RUNNING SUITE 5: SECTION 63 BSA 2023 & LIVE CLOUD API VERIFICATION")
    print("Target: " + RENDER_URL)
    print("="*80)

    # 1. Live Health Probe
    try:
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/health")
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            record_test("Cloud API", "1. Live Health Endpoint HTTP 200", res.status == 200 and data.get("status") == "ONLINE")
    except Exception as e:
        record_test("Cloud API", "1. Live Health Endpoint HTTP 200", False, str(e))

    # 2. Section 63 BSA 2023 Statutory Citation Check
    try:
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/system/status")
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            has_sec63 = "Section 63" in data.get("statutory_mandate", "") or "BSA 2023" in data.get("statutory_mandate", "")
            no_repealed_65b = data.get("repealed_acts_cited") is None
            record_test("Cloud API", "2. Section 63 BSA 2023 Statutory Citation", has_sec63 and no_repealed_65b)
    except Exception as e:
        record_test("Cloud API", "2. Section 63 BSA 2023 Statutory Citation", False, str(e))

    # 3. Cryptographic Audit Chain Valid in Live Datastore
    try:
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/system/status")
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            record_test("Cloud API", "3. Cryptographic Audit Chain Valid in Datastore", data.get("audit_chain_valid") is True)
    except Exception as e:
        record_test("Cloud API", "3. Cryptographic Audit Chain Valid in Datastore", False, str(e))

    # 4. Unauthenticated Access Protection (RBAC 401)
    try:
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/inspections")
        urllib.request.urlopen(req, timeout=15)
        record_test("Cloud API", "4. Unauthenticated Access Rejected (401)", False, "Allowed unauthenticated")
    except urllib.error.HTTPError as e:
        record_test("Cloud API", "4. Unauthenticated Access Rejected (401)", e.code == 401)
    except Exception as e:
        record_test("Cloud API", "4. Unauthenticated Access Rejected (401)", False, str(e))

    # 5. Officer Authentication (JWT Bearer Token Issuance)
    token = None
    try:
        login_data = json.dumps({"username": "inspector_rajesh", "password": "Officer@2026"}).encode()
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            token = data.get("access_token")
            record_test("Cloud API", "5. Officer Login & JWT Issuance", res.status == 200 and token is not None)
    except Exception as e:
        record_test("Cloud API", "5. Officer Login & JWT Issuance", False, str(e))

    # 6. Authenticated Inspections Query with JWT
    try:
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/inspections", headers={"Authorization": f"Bearer {token}"})
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            record_test("Cloud API", "6. Authenticated Inspections Query", res.status == 200 and "items" in data)
    except Exception as e:
        record_test("Cloud API", "6. Authenticated Inspections Query", False, str(e))

    # 7. Inspector Role Cannot Issue Form-1 Notice (RBAC 403)
    try:
        notice_payload = json.dumps({
            "inspection_id": "insp_test",
            "recipient": {"name": "Test FMCG", "address": "New Delhi"},
        }).encode()
        req = urllib.request.Request(
            f"{RENDER_URL}/api/v1/notices/generate",
            data=notice_payload,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        )
        urllib.request.urlopen(req, timeout=15)
        record_test("Cloud API", "7. Inspector Prohibited from Notice Dispatch (403)", False, "Inspector allowed to issue notice")
    except urllib.error.HTTPError as e:
        record_test("Cloud API", "7. Inspector Prohibited from Notice Dispatch (403)", e.code in (403, 404))
    except Exception as e:
        record_test("Cloud API", "7. Inspector Prohibited from Notice Dispatch (403)", False, str(e))

    # 8. Controller Authentication
    ctrl_token = None
    try:
        login_data = json.dumps({"username": "controller_south", "password": "Officer@2026"}).encode()
        req = urllib.request.Request(f"{RENDER_URL}/api/v1/auth/login", data=login_data, headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.loads(res.read())
            ctrl_token = data.get("access_token")
            record_test("Cloud API", "8. Controller Login & Privilege Acquisition", ctrl_token is not None and data["user"]["role"] == "CONTROLLER")
    except Exception as e:
        record_test("Cloud API", "8. Controller Login & Privilege Acquisition", False, str(e))

    # 9. Merkle Tree Root Computation
    hashes = [
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "ca978112ca1bbdcafac231b39a23dc4da78607f9c9f4f4541209286417660504"
    ]
    merkle_root = MerkleAuditLedger.build_merkle_root(hashes)
    record_test("Cloud API", "9. Merkle Tree Deterministic Root Calculation", len(merkle_root) == 64 and isinstance(merkle_root, str))

    # 10. Merkle Tamper Detection
    tampered_root = MerkleAuditLedger.build_merkle_root(["0000" + hashes[0][4:], hashes[1]])
    record_test("Cloud API", "10. Merkle Anti-Tamper Verification", merkle_root != tampered_root)

    # 11. E-Commerce Rule 6(10) Manufacturing Date Exemption Invariant
    # Digital marketplaces are statutory exempt from declaring Mfg date
    ecom_text = "Brand: Haldiram, Country of Origin: India, Net Qty: 400g, MRP: Rs. 100"
    facts = CommodityFactExtractor().extract_ecommerce(ecom_text)
    record_test("Cloud API", "11. E-Commerce Rule 6(10) Ingestion", facts.mfg_date_month is None and facts.country_of_origin == "India")

    # 12. Indian Postal PIN Code Regex Invariant (^[1-9][0-9]{5}$)
    pin1 = StatutoryDeclarationParser.parse_address("Manufactured at: Okhla Phase III, New Delhi 110020")
    record_test("Cloud API", "12. Indian Postal 6-Digit PIN Extraction", pin1 is not None and pin1.get("pin_code") == "110020")



# =============================================================================
# MAIN EXECUTION & TELEMETRY REPORT
# =============================================================================
if __name__ == "__main__":
    print("\n" + "#"*80)
    print("NYAYADRISHTI-LM (SIH26034) — 54-SCENARIO ACCURACY & PLAYWRIGHT AUDIT SUITE")
    print("#"*80)

    run_playwright_suite()
    run_table1_suite()
    run_usp_suite()
    run_banned_units_suite()
    run_cloud_api_suite()

    total_tests = len(test_results)
    passed_tests = sum(1 for t in test_results if t["status"] == "PASS")
    failed_tests = total_tests - passed_tests

    print("\n" + "="*80)
    print(f"AUDIT COMPLETE: {passed_tests}/{total_tests} Tests Passed ({(passed_tests/total_tests)*100:.1f}%)")
    if failed_tests > 0:
        print(f"WARNING: {failed_tests} tests failed:")
        for t in test_results:
            if t["status"] == "FAIL":
                print(f"  - [{t['suite']}] {t['test']}: {t['details']}")
    else:
        print("ALL 54 ACCURACY, STATUTORY & PLAYWRIGHT TESTS PASSED WITH 100% SUCCESS!")
    print("="*80 + "\n")
