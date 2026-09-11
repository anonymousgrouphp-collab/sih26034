# 11 — SIH GRAND FINALE JUDGE SIMULATION & DEFENSE DOSSIER: SIH26034

**Project Identifier:** SIH26034  
**Date:** 10 September 2026  
**Simulation Target:** SIH Grand Finale Jury (Senior MoCA/DoCA Officials, Senior AI Architects, Senior Legal Metrology Controllers)  
**Lead Auditor:** Skeptical Evaluator & Competition Defense Specialist  

---

## 1. Demo Pitch Script & Timeline Architecture

### 1.1 The First 30 Seconds: The Hook & Core Problem
> *"Good morning, respected judges. In India today, over 50 crore pre-packaged commodities are sold daily. Under the Legal Metrology Act, 2009 and LMPC Rules, 2011, every single package must carry mandatory declarations—net weight, MRP, manufacturer address, and minimum numeral font heights.  
> Today, field officers inspect packages with handheld plastic rulers and paper gazette tables. It takes 15 minutes per product, human measurement error leads to courtroom dismissals, and e-commerce platforms routinely violate Country of Origin rules.  
> We present **MetroLens (NyayaDrishti-LM)**: an AI-augmented legal metrology compliance workstation that verifies packaging in under 2 seconds, calculates millimeter font heights to sub-millimeter precision, and produces court-admissible show cause notices under Section 63 of the new Bharatiya Sakshya Adhiniyam, 2023."*

### 1.2 The 2-Minute Workflow Demonstration
1. **Show the Workstation (`http://localhost:3000`):** Explain the dual-persona switch (Inspector vs Citizen).
2. **Select SKU-DEMO-01 (Butter Cookies):**
   - Point out the detected **ArUco 4x4 fiducial card** ($50.0\text{ mm}$ ground truth).
   - Show the **Digital Vernier Caliper Overlay**: The numeral font measures $1.84\text{ mm}$ against a required $2.50\text{ mm}$ for this $144\text{ cm}^2$ Principal Display Panel—a statutory deficit of $-0.66\text{ mm}$.
   - Show the **Banned Unit Flagger**: The Net Qty declares `200 gms`. Under Section 11 and Rule 12, `gms` is an illegal non-standard unit.
3. **Show the Epistemic Triaging:** Explain why blurry images route to `UNABLE_TO_VERIFY` (no false penalties) and borderline measurements route to `REVIEW` ($k=2$ uncertainty band).

### 1.3 The 5-Minute Technical Deep-Dive
1. **Explain the Architecture:** Zero cloud dependencies for core inference; DBNet++ and PP-OCRv4 INT8 models run locally on standard CPU in $< 450\text{ ms}$.
2. **Demonstrate Mode B (Resilient Offline Runner):** Disconnect Wi-Fi, run `python local_runner.py --verify-offline`, proving 0 bytes transmitted and complete offline SQLite storage.
3. **Generate Official Form-1 Notice:** Display the generated ReportLab PDF/A show cause notice featuring the embedded evidence photograph, SHA-256 Merkle root, Section 63 BSA 2023 certificate, and Jan Vishwas Act 2023 compounding recommendation (₹25,000 fine).

---

## 2. The Top 10 Reasons This Project Could Lose (And How to Prevent Them)

1. **Backend Notice Generation Crash (Bug #1):**
   - *Risk:* An evaluator asks the presenter to click "Form-1 Notice PDF" on an already-evaluated case, and the screen displays an HTTP 500 toast.
   - *Fix:* Apply the 2-line certificate query fix in `server.py` immediately.
2. **Judge Suspects "Fake AI" or Cloud API Wrapper:**
   - *Risk:* Judge asks: *"Are you just calling OpenAI GPT-4 Vision behind the scenes?"*
   - *Defense:* Pull up `members/member-02-ocr/models/`, show physical INT8 ONNX checkpoints, open task manager, show 0 outbound network traffic during inspection.
3. **Judge Questions Optical Font Height Accuracy:**
   - *Risk:* *"How can a smartphone camera measure 2.5 millimeters accurately on curved or tilted packaging?"*
   - *Defense:* Demonstrate planar homography matrix rectification ($3 \times 3$ warp) and show the GUM Guide / ISO 17025 uncertainty propagation ($k=2$) which safely routes borderline cases within $\pm 0.08\text{ mm}$ to `REVIEW`.
4. **Judge Points Out Repealed Evidence Act:**
   - *Risk:* Many hackathon teams still cite Section 65B of the Indian Evidence Act, 1872.
   - *Defense:* Proudly state that Section 65B was repealed on 1 July 2024, and MetroLens strictly complies with **Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**.
5. **Over-Claiming Autonomous Legal Action:**
   - *Risk:* Claiming the AI "fines companies automatically" violates administrative law and natural justice.
   - *Defense:* Emphasize the **Human-in-the-Loop (HITL)** architecture: The AI is an Augmented Diagnostic Assistant. Only an authenticated human officer can sign and authorize notices.
6. **Venue Wi-Fi Failure:**
   - *Risk:* Venue internet collapses during live presentation.
   - *Defense:* Switch instantly to **Tier 2 (Mode B Standalone Runner)** on `localhost:8000` with local SQLite storage.
7. **Curved Container Measurement Challenge:**
   - *Risk:* *"Cylindrical cans don't have flat rectangular PDPs."*
   - *Defense:* Cite Rule 2(h)(ii): PDP for a cylindrical container is strictly $40\%$ of $\pi \times D \times H$. Show benchmark suite 4 results proving 6 cylindrical geometries.
8. **E-Commerce Live Scraper Failure:**
   - *Risk:* Attempting to scrape a live Amazon India link fails due to Cloudflare bot protection.
   - *Defense:* Use pre-saved commercial DOM listings and explain that in production, DoCA establishes an official API bridge with e-commerce compliance portals.
9. **Criminal Threat Inaccuracy:**
   - *Risk:* Threatening manufacturers with imprisonment for first offenses.
   - *Defense:* Cite the **Jan Vishwas (Amendment of Provisions) Act, 2023**, which decriminalized Section 36(1) into civil compounding under Section 48.
10. **Lack of Ground-Truth Caliper Data:**
    - *Risk:* *"Did you test this on actual market products?"*
    - *Defense:* Show `tests/run_real_packaging_physical_tests.py` verifying 8 real FMCG commercial products (Parle-G, Amul Butter, Tata Salt) with vernier caliper ground truth.

---

## 3. The Top 10 Reasons MetroLens Will Win

1. **Airtight Legal Metrology Domain Fidelity:** Table-I Row 5 ($6.0\text{ mm}$), G.S.R. 779(E) USP math, Rule 6(10) digital exemptions, and Jan Vishwas Act 2023 compounding schedules are 100% accurate.
2. **Genuine Sub-Second CPU Neural Inference:** DBNet++ and PP-OCRv4 running INT8 on CPU with $< 120\text{ MB}$ RAM.
3. **Dual Metric Calibration:** ArUco $50\text{ mm}$ marker + standard ISO 7810 payment card fallback.
4. **Section 63 BSA 2023 Legal Chain-of-Custody:** Merkle DAG parent-child hashing guaranteeing tamper-evident court admissibility.
5. **4-State Epistemic Triaging:** Eliminates false accusations through `REVIEW` and `UNABLE_TO_VERIFY` safety boundaries.
6. **Dual Inspector & Citizen Personas:** Transparently serves both technical enforcement officers and ordinary consumers.
7. **Offline Mode B Resilience:** Complete inspection capability without internet connectivity.
8. **Interactive Visual Adjudication Canvas:** Caliper overlay, ArUco grid, and draggable pixel loupe.
9. **Zero Copyleft AGPL/GPL Licensing:** Safe for direct Government of India adoption.
10. **Extensive Automated Verification:** 570 passing tests covering unit, stress, concurrency, and physical FMCG benchmarks.

---

## 4. 14 Hostile Judge Attack Questions & Defensible Answers

### Q1: "Why can't this problem be solved with simple OCR like Tesseract?"
**Answer:** Tesseract only performs basic text recognition; it has zero concept of physical metrology. It cannot measure font height in millimeters, cannot calculate PDP surface area under Rule 2(h), cannot detect perspective tilt or specular glare, and cannot enforce complex statutory cross-checks like Unit Sale Price arithmetic.

### Q2: "What happens when an officer photographs packaging in a dark shop with heavy glare?"
**Answer:** The Optical Quality Gate intercepts the image in $< 100\text{ ms}$. If specular glare exceeds $3.0\%$ or Laplacian blur is below $150$, the system issues an **`UNABLE_TO_VERIFY`** status with actionable advice (*"Diffuse direct flash light to eliminate specular bloom"*). It never makes a false non-compliance accusation on degraded imagery.

### Q3: "How do you calibrate millimeters without specialized laser hardware?"
**Answer:** We use coplanar fiducial metric calibration. Field officers place an ArUco 4x4 card ($50.0\text{ mm}$) or any standard ISO 7810 ID-1 card ($85.60 \times 53.98\text{ mm}$) in the frame. Using OpenCV subpixel corner refinement, we derive the exact pixels-per-millimeter ratio and compute a $3 \times 3$ planar homography matrix that rectifies perspective foreshortening.

### Q4: "What if a company prints font height at 2.48 mm when the requirement is 2.5 mm?"
**Answer:** Optical sensors have finite measurement uncertainty. Under ISO/IEC Guide 98-3 (GUM), our expanded uncertainty at $k=2$ ($95\%$ confidence) is $\pm 0.08\text{ mm}$. A measurement of $2.48\text{ mm}$ falls within the uncertainty band ($|-0.02| \le 0.08\text{ mm}$). The system routes this to **`REVIEW`**, requiring human physical caliper verification, completely preventing wrongful prosecution.

### Q5: "Is your system allowed to issue notices on its own?"
**Answer:** **Strictly NO.** Under Indian administrative law and the Principles of Natural Justice, automated software cannot act as prosecutor, judge, and jury. MetroLens is an **Augmented Diagnostic Assistant**. Automated findings are recommendations presented on the Adjudication Canvas. Only an authenticated Legal Metrology Officer (LMO) can adjudicate, and only the Controller can authorize notice issuance.

### Q6: "Why do you cite Section 63 BSA 2023 instead of Section 65B?"
**Answer:** The Indian Evidence Act, 1872—including Section 65B—was formally repealed by Parliament on 1 July 2024 and replaced by the **Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**. Any electronic notice citing Section 65B today is legally defective and will be quashed by the High Court. Section 63 of BSA 2023 is the current governing law.

### Q7: "How do you verify Unit Sale Price (USP) under 2021 amendments?"
**Answer:** Under G.S.R. 779(E), packages over $1\text{ kg}$ must declare USP per kg; packages under $1\text{ kg}$ must declare USP per gram. We extract Net Qty and MRP, compute the theoretical USP, and enforce $|(\text{USP}_{\text{calc}} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$. For example, on SKU-DEMO-02, a declared USP of ₹0.28/g on a 300g pack costing ₹70 fails because the true unit price is ₹0.23/g.

### Q8: "How does the system handle e-commerce listings under Rule 6(10)?"
**Answer:** E-commerce platforms must display manufacturer name, net quantity, MRP, consumer care, and country of origin. Crucially, under Rule 6(10), e-commerce listings are **statutorily exempt from declaring the month and year of manufacture**. Naive scanners falsely flag e-commerce listings for missing mfg dates; MetroLens codifies this statutory exemption.

### Q9: "What if an officer makes a mistake and overrides the AI finding?"
**Answer:** Natural justice permits officer overrides, but every override requires the officer's PIN and **mandatory written justification remarks**. Both the original AI finding and the officer's determination are permanently preserved in the append-only Merkle DAG ledger with the officer's badge number and monotonic timestamp.

### Q10: "Can this system run on an inspector's laptop in a rural mandi without internet?"
**Answer:** **Yes.** That is our **Mode B Resilient Architecture**. Field laptops run `local_runner.py` with embedded SQLite storage and local ONNX models. 0 bytes are transmitted over the internet. When the officer returns to the circle office, the signed inspection bundles sync securely to Mode A.

### Q11: "What prevents an officer from tampering with the database to dismiss a notice?"
**Answer:** Every inspection event is hashed into a SHA-256 Merkle DAG. Modifying a single character in the database or replacing an image on disk alters the cryptographic root hash. When the Controller or Judge verifies the chain (`GET /api/v1/audit/chain-verify`), the ledger immediately flags the tampering.

### Q12: "Why do you use Baidu PaddleOCR rather than Tesseract?"
**Answer:** Standard Tesseract 5 has a Character Error Rate (CER) exceeding $12\%$ on dense packaging fonts and poor performance on Indic scripts. PaddleOCR PP-OCRv4 Latin and PP-OCRv3 Devanagari achieve CER $\le 2.1\%$ and run in $< 200\text{ ms}$ on CPU with INT8 quantization, and are fully permissively licensed under Apache-2.0.

### Q13: "How does the Jan Vishwas Act 2023 change the penalty calculations?"
**Answer:** Under the Jan Vishwas (Amendment of Provisions) Act, 2023 (Act No. 18 of 2023), imprisonment under Section 36(1) was repealed for first offenses. The law now provides for civil compounding under Section 48. Our system automatically computes compounding fee recommendations up to ₹25,000 for first offenses and flags repeat offenses for higher compounding or prosecution.

### Q14: "What is your differentiation over other hackathon teams?"
**Answer:** Other teams built generic OCR wrappers that say "PASS" or "FAIL" without statutory basis. MetroLens provides:
1. True millimeter font measurement via coplanar ArUco/Card homography.
2. 100% deterministic AST rules strictly citing Gazette numbers and Table-I schedules.
3. Cryptographic Section 63 BSA 2023 certification with Merkle DAG chain-of-custody.
4. Dual Inspector/Citizen personas with interactive caliper and loupe tools.
5. Mode B offline resilience ensuring zero downtime during network blackouts.
