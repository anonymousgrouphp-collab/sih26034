# FINAL RISK AND CONTINGENCY REGISTER (RED-TEAM AUDIT)

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Audience:** Entire Engineering Team  
**Status:** FROZEN  

---

### Red-Team Threat Matrix & Mitigations

| Threat ID | Threat Description | Threat Domain | Impact (1-5) | Probability (1-5) | Risk Score | Real-Time Detection Method | Engineering & Operational Mitigation | Residual Risk |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **TR-01** | **Monocular Scale Ambiguity Failure:** Uncalibrated photo used to allege font height violation in court. | Optical / Legal | **5** | **4** | **20** | ArUco / marker detection returns null or reprojection error $> 1.2\text{ px}$. | Disallow mm calculation; assign `REQUIRES_REVIEW (NO_CALIBRATION_TARGET)`; fall back to relative ratio; mandate manual caliper check. | **LOW** |
| **TR-02** | **Specular Glare on Metallic Packaging:** Foil blooming obliterates MRP or consumer care email, causing false missing-declaration flag. | Optical / Vision | **4** | **4** | **16** | Pre-inference HSV saturation filter ($V > 245, S < 15$) intersecting text polygon. | Immediately trigger `UNABLE_TO_VERIFY (SPECULAR_GLARE)` with interactive viewfinder HUD guiding inspector to tilt camera $15^\circ$. | **LOW** |
| **TR-03** | **Retroactive Law Enforcement:** Product packed in 2022 flagged for lacking Unit Sale Price (USP) or 2026 Country of Origin filter. | Statutory / Legal | **5** | **3** | **15** | Manufacturing date parser outputting date earlier than GSR enactment date. | Temporal Statutory Epoch Dispatcher dynamically matches product Mfg Date to historical immutable rule snapshot. | **NEGLIGIBLE** |
| **TR-04** | **Dot-Matrix / Thermal Ink-Jet Coder OCR Error:** Fragmented dot characters misread (e.g., ₹48 read as ₹40, causing false USP arithmetic mismatch). | AI / OCR | **4** | **3** | **12** | OCR token confidence $< 0.85$ or discrepancy between price and category baseline. | Morphological closure filter; dual-engine consensus (PaddleOCR + Tesseract v5); route mathematical mismatch to `REQUIRES_HUMAN_REVIEW`. | **LOW** |
| **TR-05** | **Viral AGPL License Contamination:** Ultralytics YOLO code included in build, forcing open-sourcing of government proprietary logic. | IP / Legal | **5** | **2** | **10** | Pre-commit license scanner and dependency audit. | Strict architectural prohibition of Ultralytics YOLO; use Apache-2.0 DBNet++ and RT-DETR. | **ZERO** |
| **TR-06** | **Network Blackout in Remote Circle:** Field inspector unable to reach central web application due to regional cell outage. | Field Connectivity | **4** | **3** | **12** | Network ping failure or HTTP connection timeout ($> 5\text{ seconds}$). | Resilient Mode B local execution engine enables inspector to perform core inspections locally on laptop CPU, saving encrypted records and signed PDFs for later sync. | **LOW** |
| **TR-07** | **Section 63 BSA Evidence Inadmissibility:** Court or magistrate rejects digital report as unauthenticated hearsay. | Quasi-Judicial | **5** | **2** | **10** | Merkle DAG integrity verification check. | Complete SHA-256 Merkle provenance chaining linking raw capture, rectified crop, OCR tokens, and officer digital signature into a tamper-evident PDF dossier. | **NEGLIGIBLE** |
| **TR-08** | **E-Commerce Web Crawler Anti-Bot Blocking:** Scraper blocked by Cloudflare / Akamai during live hackathon demo or audit. | Demo / Scope | **5** | **4** | **20** | HTTP 403 / 429 status code or CAPTCHA page detected. | Prohibit automated web crawling bots; provide direct URL ingestion and uploaded screenshot/DOM analysis mode; bundle pre-verified offline listing fixtures. | **ZERO** |
| **TR-09** | **Cylindrical Perspective Distortion:** Text on curved cans compressed near horizons, causing false stroke width or font height flags. | Geometric | **3** | **4** | **12** | Aspect ratio check on container bounding box ($H/W$ ratio indicating cylindrical can). | Restrict physical metric measurement to the vertical unwarped axis of the cylinder; mark circumferential text as informational. | **LOW** |
| **TR-10** | **Live Evaluation Network Failure:** Venue Wi-Fi fails or throttles during hackathon jury evaluation. | Demo Critical | **5** | **3** | **15** | Browser network connection error banner in SPA. | Three-tier demo architecture: Tier 1 Online Web App (primary), Tier 2 Local Web Instance (Mode B backup on localhost), Tier 3 Static Golden Dossiers. | **ZERO** |
| **TR-11** | **Indoor / Laptop Clock & Geolocation Unavailability:** No GNSS satellite lock or NTP server available on laptops or in basements. | Telemetry / Field | **3** | **4** | **12** | Hardware sensor enumeration and network ping check. | Local monotonic system clock (`time.monotonic_ns()`); GPS set to nullable in schema with manual Circle/Premise dropdown fallback. | **ZERO** |
| **TR-12** | **Central Web Server Downtime:** Central cloud server or reverse proxy suffers outage or restarts. | Web Platform | **4** | **2** | **8** | Uptime monitoring probe failure or HTTP 502/503. | High-availability Docker container restart policies; field inspectors can seamlessly fall back to Mode B local inspection until central server recovers. | **LOW** |
| **TR-13** | **High Upload Latency on Poor Mobile Uplink:** High-resolution multi-panel image upload times out on spotty 2G/3G connections. | Network / UX | **3** | **3** | **9** | Client-side upload progress timer exceeding $8\text{ seconds}$. | Client-side pre-flight canvas downsampling (max 2048px while preserving crop fidelity); automatic retry and local caching in browser session. | **LOW** |
| **TR-14** | **Malicious File Upload / Web Ingestion Attack:** Attacker attempts to upload executable scripts or corrupted files to web backend. | Cybersecurity | **5** | **2** | **10** | Server-side MIME & magic byte inspection failure. | Nginx 15MB cap; zero-trust file validation via libmagic (rejecting executables, SVG, scripts); isolated filesystem storage decoupled from database. | **ZERO** |

---

### Contingency Action Protocols

1. **Protocol ALPHA (Camera / Calibration Target Lost):**
   - If inspector cannot place or system cannot detect the calibration marker, the application smoothly switches to **Uncalibrated Audit Mode**. All mandatory textual declarations (Rule 6(1)(a)-(h)), prohibited units (`gms`), and Unit Sale Price mathematical consistency are evaluated normally. Font height rules are automatically set to `REQUIRES_REVIEW (UNAUDITED_DIMENSIONS)` with an on-screen prompt for physical caliper verification.
2. **Protocol BETA (Persistent Lighting / Glare Issue):**
   - If retail fluorescent lighting creates severe glare across a glossy metallic pouch, the system enters **Guided Multi-Angle Merge**. The inspector takes two photos from slightly different angles ($15^\circ$ offset); the system mosaics non-glared crops into a unified OCR evaluation surface.
3. **Protocol GAMMA (OCR Misread on Critical Number):**
   - If extracted USP arithmetic does not match MRP ($\Delta > 0.02$), the system does not immediately declare `VIOLATION_FLAG` if OCR confidence is $< 0.85$. Instead, it crops the numeral region, presents an enlarged side-by-side zoom in the Review HUD, and asks the officer: _"Confirm extracted MRP: ₹80.00?"_. If corrected by the officer, the rule engine re-evaluates instantly.
4. **Protocol DELTA (Venue Wi-Fi or Cloud Server Drop During Demo):**
   - If the jury evaluation room suffers internet blackout, the presenter immediately switches browser URL from the remote server domain to `http://localhost:8000` (Tier 2 Local Web Instance). All inspection capabilities, ONNX CPU inference, and PDF report generation continue seamlessly on localhost without disrupting the evaluation flow.
