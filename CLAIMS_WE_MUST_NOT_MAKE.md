# CLAIMS WE MUST NOT MAKE (THE 'NEVER CLAIM' BLACKLIST)

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Audience:** All 6 Team Members, Presentation Decks, Pitch Scripts, Code Documentation  
**Status:** FROZEN & NON-NEGOTIABLE  

---

### Purpose of this Document

In high-stakes judging (Department of Consumer Affairs and Legal Metrology experts), teams are often eliminated not for what their software does, but for making scientifically false, legally invalid, architecturally contradictory, or wildly exaggerated claims. Every team member must memorize this blacklist.

---

### 1. Optical & Measurement Claims We Must NEVER Make

| ❌ What We Must NEVER Say | Why It Is Dangerous & Factually False | ✅ What We Must Say Instead |
| :--- | :--- | :--- |
| _"Our AI measures font size in millimeters directly from any photo."_ | **Violates Projective Geometry:** A 2D photograph captures angular scale, not metric scale ($y \sim K[R \mid t]X$). Without a physical scale anchor, pixel height cannot be converted to physical millimeters. Domain judges with physics/CV backgrounds will disqualify us immediately. | _"We derive physical millimeter scale using planar homography anchored to a coplanar reference target of known dimensions (ArUco marker or ISO 7810 ID-1 card), achieving $\le 0.15\text{ mm}$ error on planar targets."_ |
| _"Our software works with 100% accuracy on all packaging shapes and conditions."_ | **Real-World Optical Noise:** Glossy foil specular reflections, crumpled plastic pouches, and extreme cylinder curvature degrade optical clarity. Claiming 100% accuracy exposes amateur preparation. | _"We implement an optical quality gate that rejects blurred or glared frames, and an epistemic uncertainty model that routes borderline cases to human officer verification."_ |
| _"Our model can detect whether a sealed box is short of the declared weight."_ | **Physical Impossibility:** Camera sensors capture reflected surface photons, not gravitational mass. Short-weight detection requires a physical calibrated balance under Rule 24. | _"Visual systems inspect surface declarations. Mass verification requires physical weighing under Rule 24, which our workflow prompts when net quantity syntax is verified."_ |
| _"Our system reads fine print from across the room."_ | **Nyquist Sampling Limit:** At distance, a 1.0mm character projects to sub-pixel noise. | _"Guided camera capture directs the inspector to frame the package within 15 to 25 cm, ensuring at least 15 to 25 pixels per millimeter."_ |

---

### 2. Legal & Regulatory Claims We Must NEVER Make

| ❌ What We Must NEVER Say | Why It Is Dangerous & Factually False | ✅ What We Must Say Instead |
| :--- | :--- | :--- |
| _"Our AI acts as an autonomous legal judge and issues fines/penalties."_ | **Violates Administrative Law:** Under Sections 15 & 36 of the Legal Metrology Act, 2009 and the Jan Vishwas Act, 2023, statutory power rests exclusively with gazetted Legal Metrology Officers. AI has zero legal standing. | _"NyayaDrishti-LM is an AI-assisted investigative decision-support tool. It prepares draft inspection memos citing exact Gazette clauses; final statutory sign-off rests with the authorized officer."_ |
| _"Our inspection report is automatically guaranteed to win in court."_ | **Judicial Discretion:** Courts evaluate the complete chain of custody, panchnama witnesses, and defense arguments. Software cannot guarantee judicial outcomes. | _"We generate court-admissible electronic evidence structured under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, using SHA-256 Merkle provenance hashing and officer digital credentials."_ |
| _"All packages on Amazon or Flipkart must declare the manufacturing date."_ | **Direct Legal Ignorance:** Rule 6(10) of the LMPC Rules explicitly exempts e-commerce listings from declaring the month and year of manufacture/packing. | _"Our e-commerce engine audits Rule 6(10) mandatory declarations—including Country of Origin and Unit Sale Price—while strictly respecting the statutory exemption for manufacturing date."_ |
| _"We apply the latest 2026 rules to all products inspected."_ | **Violates Constitutional Non-Retroactivity (Article 20(1)):** A product manufactured in 2022 cannot be penalized for rules enacted in 2023 or 2026. | _"Our Temporal Statutory Epoch Dispatcher matches the package's manufacturing date to the exact Gazette GSR notifications in effect at that time."_ |
| _"Table-I Row 5 mandates 8.0 mm font for blown bottles."_ | **Factually Incorrect:** Gazette Notification G.S.R. 629(E) sets Row 5 ($> 2500\text{ cm}^2$) at **6.0 mm** for both normal and blown/moulded containers. | _"We strictly implement Table-I of Rule 7 as substituted by G.S.R. 629(E), prescribing 1.0, 1.5, 2.5, 4.0, and 6.0 mm thresholds."_ |

---

### 3. AI & Technical Architecture Claims We Must NEVER Make

| ❌ What We Must NEVER Say | Why It Is Dangerous & Factually False | ✅ What We Must Say Instead |
| :--- | :--- | :--- |
| _"We feed the label photo into GPT-4o / Gemini and ask it to find violations."_ | **Opaque, Hallucinatory, Legally Inadmissible:** LLMs hallucinate numbers, fail at geometric measurement, cannot be audited deterministically, and cannot be certified under Section 63 BSA. | _"We employ a Hybrid Perception-Verification Architecture: deep learning is confined strictly to OCR perception (DBNet++ and PP-OCRv4), while legal compliance is evaluated by a deterministic Abstract Syntax Tree rule engine."_ |
| _"We trained our own foundation computer vision model from scratch."_ | **Resource Impossibility:** Pre-training foundation vision models requires millions of images and months of multi-GPU compute. Claiming this will destroy our credibility. | _"We fine-tune and optimize proven open-source architectures (PaddleOCR PP-OCRv4 and DBNet++) using INT8 CPU quantization via ONNX Runtime."_ |
| _"We crawl and scrape millions of products daily from Amazon India."_ | **TOS Violation & Anti-Bot Blocking:** Automated mass crawling violates commercial Terms of Service, triggers IP bans, and scrapes marketing renders rather than physical products. | _"Our e-commerce module ingests direct listing URLs, HTML DOM snapshots, or uploaded listing screenshots provided by enforcement officers for targeted scrutiny."_ |
| _"Our software uses a blockchain ledger for tamper-proof storage."_ | **Unnecessary Over-Engineering:** Blockchain is decentralized consensus; regulatory evidence requires centralized integrity and non-repudiation. | _"We implement a SHA-256 Merkle Directed Acyclic Graph (DAG) conforming to Section 63 BSA 2023, delivering cryptographic tamper-evidence without blockchain overhead."_ |
| _"Our inspection report is digitally signed with an official licensed DSC token."_ | **Hardware & PKI Infrastructure Limits:** Licensed Class-3 DSC tokens require physical USB cryptographic dongles and online CRL servers; a canvas drawing is not a PKI signature. | _"The Merkle root is cryptographically signed using an on-device officer private key (Ed25519) and accompanied by a visual handwritten signature canvas block on the Form-1 PDF."_ |

---

### 4. Connectivity & Product Type Claims We Must NEVER Make

| ❌ What We Must NEVER Say | Why It Is Dangerous & Factually False | ✅ What We Must Say Instead |
| :--- | :--- | :--- |
| _"Our primary product is a 100% offline desktop application."_ | **Contradicts Deliverable Requirements:** The authoritative product requested by DoCA is an enterprise online web application with multi-user RBAC, centralized history, and state-wide analytics. | _"NyayaDrishti-LM is an online-first web application accessed via standard web browsers, with an optional local inspection capability for field officers in network-deprived circles."_ |
| _"Our entire website works without internet."_ | **Technically Impossible:** A web browser cannot load web assets from a remote server without an active network connection. | _"The web application runs on standard web connectivity. When field officers operate in dead zones, our optional local engine (Mode B) allows standalone offline inspection on local hardware."_ |
| _"Our backend is completely offline."_ | **Architectural Absurdity:** The primary backend is a FastAPI server connected to a centralized PostgreSQL datastore serving web clients over HTTPS. | _"Our primary production backend runs as an online service. For field resiliency, the core inspection pipeline can also execute locally via an embedded CPU runner."_ |
| _"Zero internet dependency across the entire system."_ | **Factually Untrue:** Centralized reporting, user authentication, multi-inspector audits, and e-commerce URL fetching inherently depend on network connectivity. | _"The system is designed with an Online-First Web Architecture, backed by local execution resiliency for core optical inspection when field networks drop."_ |
| _"No server is required to use NyayaDrishti-LM."_ | **False for Enterprise Operations:** Centralized compliance monitoring, user administration, and state-level audit trails mandate a centralized server. | _"The primary system deploys on server infrastructure with PostgreSQL. A lightweight local runner is available for disconnected field inspections."_ |
| _"Users access the web app without connectivity."_ | **Nonsensical Web Semantics:** Accessing a remote web URL requires connectivity. | _"Users access the web portal over HTTPS. Cached offline sessions and local mode instances provide operational continuity when network access is severed."_ |

---

### 5. Summary: The Golden Rule of Demo Presentation

> **"NyayaDrishti-LM is an online-first web enforcement application built for the Ministry of Consumer Affairs, backed by an optional local inspection capability for field officers in remote circles. Computer vision accurately observes packaging, deterministic mathematics verifies statutory rules, cryptographic hashing seals electronic evidence under Section 63 BSA 2023, and authorized Legal Metrology Officers make all legal enforcement decisions."**
