import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"

VIEWPORTS = [
    {"name": "mobile_360", "width": 360, "height": 800},
    {"name": "mobile_390", "width": 390, "height": 844},
    {"name": "mobile_414", "width": 414, "height": 896},
    {"name": "tablet_768", "width": 768, "height": 1024},
    {"name": "tablet_1024", "width": 1024, "height": 768},
    {"name": "desktop_1280", "width": 1280, "height": 720},
    {"name": "desktop_1440", "width": 1440, "height": 900},
    {"name": "desktop_1920", "width": 1920, "height": 1080},
]

ROUTES = [
    "/",
    "/login",
    "/acts/legal-metrology-act-2009",
    "/rules/packaged-commodities-rules-2011",
    "/standards/table-1-numeral-heights",
    "/guidelines/e-commerce-rule-6-10",
    "/circulars/legal-metrology-amendment-rules-2022",
    "/bsa/section-63-admissibility-guidelines",
    "/policies/human-in-the-loop-charter",
    "/dashboard",
    "/inspections",
    "/inspections/new",
    "/review-queue",
    "/rules",
    "/reports",
    "/settings",
    "/unauthorized",
    "/nonexistent-404-page",
]

def run_audit():
    results = {
        "pages": {},
        "console_errors": [],
        "overflow_issues": [],
        "broken_elements": [],
        "auth_test": {},
        "workflow_test": {}
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. First audit Public Pages across viewports
        print("=== STAGE 1: Public Pages & Viewport Audit ===")
        for vp in VIEWPORTS:
            print(f"Testing viewport: {vp['name']} ({vp['width']}x{vp['height']})")
            context = browser.new_context(viewport={"width": vp["width"], "height": vp["height"]})
            page = context.new_page()

            page_errors = []
            page.on("pageerror", lambda e: page_errors.append(str(e)))
            page.on("console", lambda msg: page_errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type in ["error", "warning"] and "favicon" not in msg.text else None)

            for route in ["/", "/login", "/acts/legal-metrology-act-2009", "/404"]:
                url = f"{BASE_URL}{route}"
                try:
                    page.goto(url, wait_until="networkidle", timeout=10000)
                    time.sleep(0.3)
                    scroll_w = page.evaluate("() => document.documentElement.scrollWidth")
                    client_w = page.evaluate("() => document.documentElement.clientWidth")
                    has_h_overflow = scroll_w > client_w

                    if has_h_overflow:
                        results["overflow_issues"].append({
                            "route": route,
                            "viewport": vp["name"],
                            "scrollWidth": scroll_w,
                            "clientWidth": client_w
                        })
                    
                    key = f"{route}_{vp['name']}"
                    results["pages"][key] = {
                        "status": "LOADED",
                        "has_h_overflow": has_h_overflow,
                        "title": page.title(),
                    }
                except Exception as e:
                    results["pages"][f"{route}_{vp['name']}"] = {
                        "status": "ERROR",
                        "error": str(e)
                    }

            if page_errors:
                results["console_errors"].extend([{
                    "viewport": vp["name"],
                    "error": err
                } for err in page_errors])

            context.close()

        # 2. Stage 2: Authenticated Inspection Workstation Audit
        print("=== STAGE 2: Authentication & Workstation Audit ===")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page_errors = []
        page.on("pageerror", lambda e: page_errors.append(str(e)))
        page.on("console", lambda msg: page_errors.append(f"CONSOLE {msg.type}: {msg.text}") if msg.type == "error" and "favicon" not in msg.text else None)

        # Login
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        time.sleep(0.5)

        # Fill login form
        # Check inputs
        username_input = page.locator("input#official-email, input[type='email'], input[name='officer_id'], input[type='text']").first
        password_input = page.locator("input#security-password, input[type='password']").first
        
        if username_input.is_visible() and password_input.is_visible():
            username_input.fill("rajesh.kumar@lm.gov.in")
            password_input.fill("Officer@2026")
            submit_btn = page.locator("button[type='submit']").first
            submit_btn.click()
            try:
                page.wait_for_url("**/dashboard", timeout=5000)
            except Exception:
                time.sleep(1.5)
            
            curr_url = page.url
            token = page.evaluate('() => localStorage.getItem("nyayadrishti_auth_token_v1")')
            results["auth_test"] = {
                "success": "/dashboard" in curr_url,
                "has_jwt_token": bool(token),
                "token_prefix": token[:20] if token else None,
                "current_url": curr_url
            }
            print(f"Login result: {results['auth_test']}")
        else:
            results["auth_test"] = {"success": False, "error": "Login inputs not found"}

        # Now test workstation routes
        for route in ["/dashboard", "/inspections", "/inspections/new", "/review-queue", "/rules", "/reports", "/settings"]:
            try:
                page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=10000)
                time.sleep(0.5)
                scroll_w = page.evaluate("() => document.documentElement.scrollWidth")
                client_w = page.evaluate("() => document.documentElement.clientWidth")
                results["pages"][f"auth_{route}"] = {
                    "status": "LOADED",
                    "title": page.title(),
                    "has_h_overflow": scroll_w > client_w,
                    "url": page.url
                }
            except Exception as e:
                results["pages"][f"auth_{route}"] = {
                    "status": "ERROR",
                    "error": str(e)
                }

        # Check mobile responsiveness for authenticated routes
        print("=== STAGE 3: Authenticated Mobile Responsiveness Audit ===")
        context_mobile = browser.new_context(viewport={"width": 390, "height": 844})
        page_m = context_mobile.new_page()
        # Transfer auth state
        cookies = context.cookies()
        context_mobile.add_cookies(cookies)
        storage_state = page.evaluate("() => ({ local: {...localStorage}, session: {...sessionStorage} })")
        page_m.goto(f"{BASE_URL}/login")
        for k, v in storage_state.get("local", {}).items():
            page_m.evaluate(f"([k, v]) => localStorage.setItem(k, v)", [k, v])
        for k, v in storage_state.get("session", {}).items():
            page_m.evaluate(f"([k, v]) => sessionStorage.setItem(k, v)", [k, v])

        for route in ["/dashboard", "/inspections", "/inspections/new", "/review-queue", "/rules", "/reports", "/settings"]:
            try:
                page_m.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=10000)
                time.sleep(0.5)
                scroll_w = page_m.evaluate("() => document.documentElement.scrollWidth")
                client_w = page_m.evaluate("() => document.documentElement.clientWidth")
                if scroll_w > client_w:
                    results["overflow_issues"].append({
                        "route": route,
                        "viewport": "mobile_390",
                        "scrollWidth": scroll_w,
                        "clientWidth": client_w
                    })
                results["pages"][f"mobile_{route}"] = {
                    "status": "LOADED",
                    "has_h_overflow": scroll_w > client_w,
                    "url": page_m.url
                }
            except Exception as e:
                results["pages"][f"mobile_{route}"] = {
                    "status": "ERROR",
                    "error": str(e)
                }

        # 4. Stage 4: Test Workflow (New Inspection -> Inspection Details -> Review)
        print("=== STAGE 4: Real Inspection Workflow Audit ===")
        try:
            page.goto(f"{BASE_URL}/inspections", wait_until="networkidle")
            time.sleep(0.5)
            # Find first inspection link/row
            row = page.locator("tr[data-case-id], tr[data-testid='inspection-row'], tbody tr").first
            if row.is_visible():
                row.click()
                page.wait_for_load_state("networkidle")
                time.sleep(0.8)
                details_url = page.url
                results["workflow_test"]["details_page"] = {
                    "opened": "/inspections/" in details_url,
                    "url": details_url
                }
                
                # Check Evidence link
                evidence_btn = page.locator("a[href*='evidence'], button:has-text('Evidence'), button:has-text('Dossier')").first
                if evidence_btn.is_visible():
                    evidence_btn.click()
                    page.wait_for_load_state("networkidle")
                    time.sleep(0.8)
                    results["workflow_test"]["evidence_page"] = {
                        "opened": "/evidence" in page.url,
                        "url": page.url
                    }
        except Exception as e:
            results["workflow_test"]["error"] = str(e)

        browser.close()

    Path("audit_results_e2e.json").write_text(json.dumps(results, indent=2), encoding="utf-8")

    print("=== Audit Finished. Results saved to audit_results_e2e.json ===")

if __name__ == "__main__":
    run_audit()
