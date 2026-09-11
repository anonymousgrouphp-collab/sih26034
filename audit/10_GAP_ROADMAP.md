# 10 — PRIORITIZED DEFECT & GAP ROADMAP: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Time to Grand Finale:** 3 to 7 Days  
**Auditor:** Principal Software Engineer & Competition Strategy Lead  

---

## 1. Severity Classification System

- **P0 — Critical Blocker:** Threatens demo failure, system crash, or severe legal misinformation during judging.
- **P1 — Major Vulnerability / Defect:** Noticeable functional gap or unhandled error path that reduces project credibility.
- **P2 — Significant Polish Item:** Missing polish, edge case degradation, or unoptimized workflow.
- **P3 — Minor Enhancement:** Desirable UI refinement or documentation cleanup.
- **P4 — Nice-to-Have / Out of Scope:** Long-term roadmap item not relevant to the hackathon.

---

## 2. MUST FIX BEFORE FINAL DEMO (P0 / P1)

### Priority 1: Patch Notice Generation Unique Constraint (P0)
- **Affected File:** `members/member-05-evidence/src/server.py` (lines 1268–1285).
- **The Issue:** `generate_legal_notice` unconditionally attempts to insert a new `BSACertificate` row for `inspection_id`. Because `bsa_certificates.inspection_id` has a unique constraint, calling notice generation on an existing inspection crashes with HTTP 500 (`sqlite3.IntegrityError: UNIQUE constraint failed: bsa_certificates.inspection_id`).
- **Impact on SIH Demo:** If a judge asks: *"Now click the Form-1 PDF button to issue a notice for this product we just inspected,"* the backend will throw a 500 error!
- **Surgical Solution:**
  ```python
  # Check if certificate already exists for this inspection
  existing_cert = db.query(BSACertificate).filter_by(inspection_id=insp.id).first()
  if existing_cert:
      bsa_cert = existing_cert
      # Optionally update signature or timestamp
  else:
      bsa_cert = BSACertificate(...)
      db.add(bsa_cert)
      db.flush()
  ```
- **Effort:** 15 minutes.
- **Demo Impact:** HIGHEST. Guarantees 100% reliable PDF notice generation during live presentations.

### Priority 2: Install Missing `playwright` Package in Virtual Environment (P1)
- **Affected File:** `requirements.txt` and `.venv`.
- **The Issue:** `tests/live_e2e_playwright_accuracy_suite.py` crashes on import because `playwright` is not installed in the workspace environment.
- **Surgical Solution:** Run `pip install playwright==1.40.0 && python -m playwright install chromium`.
- **Effort:** 5 minutes.
- **Demo Impact:** Restores 100% passing state for all 54 live end-to-end browser automation tests.

---

## 3. SHOULD FIX (P2)

### Priority 3: Add Lightweight Live URL Scraper for E-Commerce Mode
- **Affected File:** `members/member-03-extraction/src/extractor.py` and `members/member-05-evidence/src/server.py`.
- **The Issue:** E-commerce inspection accepts plain text or saved HTML snippets. An evaluator might paste a live link from Blinkit or Amazon India.
- **Solution:** Add an automated HTTP fetcher using `httpx` or `BeautifulSoup4` with standard headers to grab the product title, specs table, and image gallery automatically from raw URLs.
- **Effort:** 2 to 3 hours.
- **Demo Impact:** Very High. Demonstrates live web crawling capability directly from the browser HUD.

### Priority 4: Lock Loupe Position on Mobile / Tablet
- **Affected File:** `members/member-06-ui/src/components/AdjudicationCanvas.tsx`.
- **The Issue:** When testing on a touch device or tablet, moving the pixel loupe can trigger viewport scrolling.
- **Solution:** Add a "Pin Loupe" or "Touch Lock" toggle that anchors the loupe to the center of the active token.
- **Effort:** 1 hour.
- **Demo Impact:** Improves tablet field-station presentation quality.

---

## 4. COULD FIX (P3)

### Priority 5: Export eMaap XML / JSON Package Payload
- **Affected File:** `members/member-05-evidence/src/server.py`.
- **The Issue:** `GET /api/v1/inspections/{inspection_id}/emaap-export` exists, but its output is a basic JSON payload.
- **Solution:** Add formal XML serialization matching the Government of India eMaap portal schema specifications under Rule 27.
- **Effort:** 1.5 hours.
- **Demo Impact:** Good GovTech differentiator.

---

## 5. DO NOT WASTE TIME ON (Anti-Patterns to Avoid)

| Attractive Idea | Why It Is a Dangerous Waste of Time | What to Do Instead |
| :--- | :--- | :--- |
| **Training Custom YOLO Object Detectors** | High risk of AGPL copyleft infection; training takes days; DBNet++ ONNX already passes 100%. | Use the verified INT8 DBNet++ checkpoint already in the repository. |
| **Adding Real USB Smartcard DSC Hardware** | Physical USB dongles require Windows PKCS#11 drivers, physical keys, and live CRL servers that will fail at the hackathon venue. | Rely on local Ed25519 cryptographic signing of the Merkle root with officer PIN. |
| **Building a Full E-Commerce Marketplace Spider** | Anti-bot scrapers (Cloudflare, Akamai) will block hackathon IP addresses live on stage. | Ingest clean DOM snippets or static test fixtures for live demonstration. |
| **Rewriting UI with Framer Motion or Heavy Animations**| Distracts from serious institutional GovTech aesthetics; slows down low-spec inspection laptops. | Keep the crisp, fast Tailwind institutional workstation UI. |
| **Adding Multi-Tenant Cloud Billing or Stripe** | Completely irrelevant to a Government of India enforcement agency. | Focus 100% on statutory compliance under the Legal Metrology Act. |
