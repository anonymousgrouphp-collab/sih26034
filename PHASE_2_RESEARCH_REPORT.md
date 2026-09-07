# SIH 2026 Problem Statement SIH26034 — Phase 2 Comprehensive Research Report

## Landscape Analysis, Technology Benchmarking, Competitive Gaps, and Empirical Foundations for Packaged Commodity Legal Metrology Compliance

**Problem Statement ID:** SIH26034  
**Title:** Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels  
**Organization:** Ministry of Consumer Affairs, Food & Public Distribution  
**Department:** Department of Consumer Affairs (DoCA)  
**Category:** Software  
**Document Classification:** Phase 2 Technical Research & Evidence Dossier  
**Status:** Complete / Final Research Baseline

---

## Table of Contents

1.  [Phase 2 Executive Summary](#01-phase-2-executive-summary)
2.  [Phase 1 Requirement → Technology Mapping](#02-phase-1-requirement--technology-mapping)
3.  [Government Systems Landscape](#03-government-systems-landscape)
4.  [Commercial Solutions Landscape](#04-commercial-solutions-landscape)
5.  [Academic Research Landscape](#05-academic-research-landscape)
6.  [Computer Vision Technology Landscape](#06-computer-vision-technology-landscape)
7.  [OCR & Document AI Landscape](#07-ocr--document-ai-landscape)
8.  [Information Extraction Landscape](#08-information-extraction-landscape)
9.  [Rule Engine / Legal Reasoning Landscape](#09-rule-engine--legal-reasoning-landscape)
10. [Font Size & Geometric Measurement Research](#10-font-size--geometric-measurement-research)
11. [Readability & Image Quality Research](#11-readability--image-quality-research)
12. [Indian / Multilingual Technology Landscape](#12-indian--multilingual-technology-landscape)
13. [Dataset Landscape](#13-dataset-landscape)
14. [Data Gap Analysis](#14-data-gap-analysis)
15. [Benchmark & Evaluation Metrics](#15-benchmark--evaluation-metrics)
16. [Failure Modes of Existing Approaches](#16-failure-modes-of-existing-approaches)
17. [AI vs Rules vs Hybrid Analysis](#17-ai-vs-rules-vs-hybrid-analysis)
18. [LLM / VLM Role Analysis](#18-llm--vlm-role-analysis)
19. [Open-Source Landscape](#19-open-source-landscape)
20. [SIH / Hackathon Competitive Landscape](#20-sih--hackathon-competitive-landscape)
21. [Competitive Gap Analysis](#21-competitive-gap-analysis)
22. [White-Space Opportunities](#22-white-space-opportunities)
23. [Innovation Opportunity Map](#23-innovation-opportunity-map)
24. [Efficiency & Performance Research](#24-efficiency--performance-research)
25. [Robustness & Reliability Research](#25-robustness--reliability-research)
26. [Regulation Versioning Research](#26-regulation-versioning-research)
27. [Candidate Technology Families](#27-candidate-technology-families)
28. [Technology Decision Matrix](#28-technology-decision-matrix)
29. [What We Should NOT Build](#29-what-we-should-not-build)
30. [SIH-Specific Feasibility](#30-sih-specific-feasibility)
31. [Candidate Future Building Blocks](#31-candidate-future-building-blocks)
32. [Key Insights](#32-key-insights)
33. [Inputs for Phase 3 — Optimized Solution Design](#33-inputs-for-phase-3--optimized-solution-design)
34. [Open Questions Remaining](#34-open-questions-remaining)
35. [Master Research Evidence Table](#35-master-research-evidence-table)
36. [Research Quality Audit](#36-research-quality-audit)

---

## 01. Phase 2 Executive Summary

### 1.1 Purpose and Mandate

Phase 2 establishes the empirical, algorithmic, and legal evidence base for Smart India Hackathon (SIH) 2026 Problem Statement **SIH26034**, issued by the Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution. Building upon Phase 1's legal and operational requirements, this phase conducts an exhaustive landscape investigation across existing government portals, commercial platforms, academic literature, open-source repositories, computer vision models, document AI systems, optical calibration mathematics, and Indic language NLP.

The mandate of Phase 2 is strictly **investigatory and evaluative**:

- It does **not** prematurely finalize an end-to-end architecture.
- It does **not** declare a single commercial or proprietary framework the "winner."
- It does **not** rely on unverified claims or marketing hype.
- It identifies what is technically mature, what is unproven, where the structural gaps lie, and how a focused 6-member engineering team can construct a high-precision, legally admissible inspection assistance tool.

### 1.2 The Core Technical-Legal Conflict

The central finding of this research is that **automated Legal Metrology compliance inspection sits at the intersection of two opposing paradigms**:

1. **The Probabilistic Nature of Computer Vision & Deep Learning:** State-of-the-art text detectors (e.g., DBNet), recognizers (e.g., SVTR, TrOCR), and segmentation networks operate probabilistically. They output predictions accompanied by continuous confidence scores ($[0, 1]$) and are inherently susceptible to hallucination, character misrecognition, bounding-box jitter, and perspective distortion.
2. **The Deterministic, Evidentiary Nature of Statutory Law:** Under Section 18 and Section 36 of the Legal Metrology Act, 2009 (amended by the Jan Vishwas Act, 2023), compliance is a binary administrative and quasi-judicial determination. Non-compliance triggers statutory Improvement Notices, compounding fees, or prosecution. Furthermore, under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023, superseding Section 65B of the Indian Evidence Act), electronic evidence presented before a court must demonstrate strict, tamper-evident cryptographic provenance, unbroken chain of custody, and verifiable deterministic execution.

A system that relies on end-to-end black-box generative AI (e.g., prompting a Vision-Language Model to "inspect this label and tell me if it violates Rule 6") is **legally inadmissible, non-reproducible, computationally prohibitive for field officers, and dangerous**. Conversely, pure manual inspection by understaffed state inspectorates fails to scale across billions of retail packages.

### 1.3 Strategic Findings

1. **Government Systems (eMaap, FoSCoS, BIS Care):** Current government platforms provide administrative database workflows (licensing, registration, complaint logging) but possess **zero optical scanning, computer vision, OCR, or automated rule-checking capabilities**.
2. **Commercial Systems (Artwork Flow, GlobalVision, Cognex, Keyence):** Commercial systems bifurcate into:
   - _Pre-print digital artwork proofreading_ (analyzing vector `.ai`/`.pdf` artboards in ideal conditions).
   - _High-speed factory conveyor machine vision_ (multi-thousand-dollar fixed telecentric hardware in controlled lighting).
   - Neither category addresses the field reality of an inspector carrying a smartphone or laptop into an uncurated retail grocery store, kirana shop, or warehouse with wrinkled pouches, curved cylindrical cans, specular foil reflections, and dynamic lighting.
3. **The Geometric Measurement Reality:** Monocular estimation of physical character heights ($1.0\text{ mm} \dots 6.0\text{ mm}$ under Table-I of the 2011 Rules) from an arbitrary, uncalibrated 2D photograph is **mathematically ill-posed due to projective scale ambiguity**. Metric measurement is only achievable through planar homography using a certified coplanar fiducial reference target (e.g., ArUco marker or calibrated credit-card size target) or calibrated stereo/depth sensors.
4. **The Hybrid Architecture Imperative:** The only defensible architecture is a **Hybrid Perception-Verification System**: deep learning is restricted to _perceptual observation_ (text detection, OCR tokenization, panel segmentation), while legal compliance is executed by an _immutable, deterministic rule engine_ evaluated against temporal statutory snapshots.

---

## 02. Phase 1 Requirement → Technology Mapping

Phase 1 established 12 primary operational and legal requirements. Below, each requirement is mapped to its requisite technical capabilities, candidate technologies, and critical architectural caveats.

| Req ID     | Phase 1 Requirement                               | Core Technical Capability Needed                                               | Candidate Technology Families                                                           | Appropriateness & Feasibility Assessment                                                                                                              |
| :--------- | :------------------------------------------------ | :----------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **REQ-01** | Multi-Panel Package Surface Capture               | Guided camera acquisition, multi-angle correlation, planar detection           | Classical CV (OpenCV), ArUco pose tracking, Viewfinder UI overlays                      | **Essential.** Prevents missing mandatory declarations split across front, back, and bottom panels. UI must guide user interactively.                 |
| **REQ-02** | Input Image Quality Validation                    | Pre-inference quality gating, blur estimation, specular glare masking          | Laplacian variance, Tenengrad gradients, HSV saturation thresholds, BRISQUE             | **Critical.** Low-quality images must be rejected _before_ OCR to prevent false positives and officer frustration. Low compute overhead.              |
| **REQ-03** | Text Detection on Noisy 3D Packaging              | Arbitrary-shape scene text detection, rotated/curved text localization         | DBNet / DBNet++, TextSnake, CRAFT, Contour polygon extraction                           | **Appropriate.** Scene text detectors handle complex retail packaging far better than document-page layout engines.                                   |
| **REQ-04** | Multilingual Text Recognition (Indic + Latin)     | High-accuracy character recognition across English and Indian scripts          | PaddleOCR PP-OCRv4 (SVTR), Tesseract v5 (LSTM), CRNN                                    | **Appropriate.** Dual-engine approach recommended: PP-OCRv4 for multilingual scene text; Tesseract as fallback for high-contrast cropped text.        |
| **REQ-05** | Principal Display Panel (PDP) Localization & Area | Surface segmentation, geometric dimensioning, bounding polygon                 | Semantic segmentation (DeepLabv3+ / U-Net), edge contouring, homography                 | **Required.** Needed to compute Table-I font height threshold. For cylinders: statutory formula ($0.40 \times \pi \times D \times H$).                |
| **REQ-06** | Metric Scale & Font Height Measurement            | Sub-millimeter physical dimension estimation, perspective rectification        | Planar Homography ($H$), ArUco fiducial target, glyph polygon bounding box analysis     | **Critical & Skeptical.** Cannot be done uncalibrated. Requires coplanar reference target to establish $\text{mm/pixel}$ scale factor.                |
| **REQ-07** | Mandatory Declaration Field Extraction            | Information extraction, semantic entity association (MRP, USP, Net Qty, Dates) | Contextual regex, SpaCy NER, LayoutLMv3, transformer token classification               | **Hybrid Required.** Deterministic regex handles rigid patterns (MRP, Dates, USP); sequence labeling/NER handles unstructured manufacturer addresses. |
| **REQ-08** | Non-Retroactive Statutory Compliance Checking     | Deterministic formal legal validation, temporal rule routing                   | Declarative Rule Engines (AST, JSON-Rules, Drools), immutable rule tables               | **Strictly Deterministic.** LLMs/VLMs must NEVER be used for compliance verdicts. Rule logic must trace to specific Gazette GSR notifications.        |
| **REQ-09** | Chain of Custody & Evidence Admissibility         | Cryptographic hashing, provenance graph, Section 63 BSA 2023 compliance        | SHA-256 Merkle DAG, Exif metadata validation, digital signatures, immutable audit trail | **Legally Mandatory.** Enforcement reports must withstand scrutiny in Consumer Commissions or High Courts.                                            |
| **REQ-10** | Offline Edge Operational Capability               | Low-latency inference on commodity laptops/mobile devices without internet     | ONNX Runtime (CPU INT8 quantization), OpenVINO, SQLite/DuckDB                           | **Non-Negotiable.** Enforcement officers operate in mandis, basements, and rural markets lacking continuous 4G/5G connectivity.                       |
| **REQ-11** | Human-in-the-Loop Review & Adjudication           | Discrepancy flagging, side-by-side visual audit UI, officer sign-off gate      | Bounding-box canvas overlays, side-by-side crop comparisons, diff view                  | **Essential.** System must serve as _inspection assistance_, leaving the final statutory determination to the empowered officer.                      |
| **REQ-12** | Centralized Historical Repository & Analytics     | Dossier storage, recurrent offender tracking, market analytics                 | Relational DB (PostgreSQL), Vector search (pgvector), REST/GraphQL APIs                 | **Standard Web Tier.** Aggregates field inspections for DoCA policymakers and State Controllers.                                                      |

---

## 03. Government Systems Landscape

An investigation into active and historical Indian government digital portals reveals that digital transformation in Legal Metrology has focused almost exclusively on **administrative licensing and grievance redressal**, leaving physical label inspection entirely manual.

```mermaid
flowchart TD
    subgraph CentralGov["Central & State Government Ecosystem"]
        eMaap["eMaap Portal (DoCA / NIC)<br/>National Legal Metrology Portal<br/>• Rule 27 Packaged Commodity Reg.<br/>• Model Approvals, Licenses<br/>• ZERO Image Analysis / OCR"]
        NCH["National Consumer Helpline (NCH / INGRAM)<br/>• Citizen Grievance Portal<br/>• Static Image Attachment<br/>• ZERO Automated Analysis"]
        FOSCOS["FoSCoS / FoSCoRIS (FSSAI)<br/>• Food Safety Compliance<br/>• Handheld Inspection Checklists<br/>• Manual Questionnaires"]
        BISCare["BIS Care Mobile App<br/>• ISI Mark, HUID, CRS Verification<br/>• Database Registry Lookup<br/>• ZERO Label Geometry / OCR"]
        StateLMD["State Legal Metrology Portals<br/>(MahaLMD, e-Parapara, etc.)<br/>• Verification / Stamping Logs<br/>• Siloed State Databases"]
    end

    subgraph InspectionGap["The Enforcement Void (SIH26034 Target)"]
        FieldOfficer["Field Legal Metrology Officer<br/>(Equipped with physical ruler/caliper, manual diary)"]
        MarketReality["Physical Retail Packaging<br/>(Font height violations, missing USP, obscure MRP, deceptive packaging)"]
        FieldOfficer -.->|100% Manual, Slow, Subjective| MarketReality
    end

    eMaap -.->|No Inspection Tool| FieldOfficer
    BISCare -.->|No Metric Label Inspection| MarketReality
```

### Detailed Evaluation of Existing Government Systems

#### 1. eMaap (National Legal Metrology Portal)

- **Organization:** Department of Consumer Affairs (DoCA), Ministry of Consumer Affairs, Food & Public Distribution, in collaboration with National Informatics Centre (NIC).
- **URL / Source:** `https://emaap.gov.in/` (Operational nationwide rollout initiated February 2025).
- **Target Users:** Manufacturers, Packers, Importers, Dealers, Repairers, and State Legal Metrology Officers.
- **Actual Workflow:** Web-based portal where commercial entities submit digital application forms and upload scanned PDF certificates to obtain registration under Rule 27 of the Legal Metrology (Packaged Commodities) Rules, 2011. Officers verify application metadata, issue digital registration certificates, and record compounding fees.
- **Capabilities:** User management, fee payment gateway integration, document repository, workflow tracking, MIS dashboard reporting.
- **Image Analysis / OCR / Automated Compliance:** **NON-EXISTENT.** The portal treats uploaded documents as static binary BLOBs (PDFs/JPEGs). It performs no computer vision, no text extraction, no font-height verification, and no compliance validation against physical labels.
- **Current Status:** Fully active (Central production portal).
- **Gap vs SIH26034:** eMaap is a bureaucratic administrative registry; SIH26034 requires an operational field inspection tool for physical commodity packages.

#### 2. National Consumer Helpline (NCH / INGRAM Portal)

- **Organization:** Department of Consumer Affairs (DoCA).
- **URL / Source:** `https://consumerhelpline.gov.in/`
- **Target Users:** Indian consumers filing consumer protection and deceptive packaging grievances.
- **Actual Workflow:** Consumers enter grievance descriptions, merchant details, and optionally attach photos of bills or product packaging. Complaints are routed to companies or relevant regulatory departments for manual resolution.
- **Image Analysis / OCR / Automated Compliance:** **NON-EXISTENT.** Photos are stored purely as documentary evidence for human desk officers.
- **Current Status:** Fully active.
- **Gap vs SIH26034:** Completely reactive grievance portal; lacks automated parsing, spatial analysis, or statutory rule checking.

#### 3. BIS Care Mobile App

- **Organization:** Bureau of Indian Standards (BIS).
- **URL / Source:** Official Android / iOS app released by BIS, Ministry of Consumer Affairs.
- **Target Users:** General public and enforcement officers.
- **Actual Workflow:** Users manually enter or scan a barcode/QR code containing an ISI license number, Hallmarking Unique Identification (HUID) for jewellery, or Compulsory Registration Scheme (CRS) number. The app queries the centralized BIS database and returns manufacturer registration details and validity status.
- **Capabilities:** Database registry lookup, grievance filing with photo upload.
- **Image Analysis / OCR / Automated Compliance:** **MINIMAL.** Barcode/QR decoding only. It cannot analyze packaging label declarations, cannot measure fonts, cannot evaluate MRP/USP, and does not check Legal Metrology Packaged Commodities rules.
- **Current Status:** Fully active.
- **Gap vs SIH26034:** BIS Care verifies _standardization marks_ against a database; it does not analyze physical label geometry or mandatory metrological declarations.

#### 4. FoSCoS & FoSCoRIS (Food Safety and Standards Authority of India)

- **Organization:** FSSAI, Ministry of Health & Family Welfare.
- **URL / Source:** `https://foscos.fssai.gov.in/`
- **Target Users:** Food Safety Officers (FSOs) and Food Business Operators (FBOs).
- **Actual Workflow:** Food Safety Compliance through Regular Inspection and Sampling (FoSCoRIS) provides a mobile/web checklist interface where FSOs conduct on-site physical audits of food premises and enter manual ratings against predefined statutory criteria.
- **Image Analysis / OCR / Automated Compliance:** **NON-EXISTENT.** The system digitizes the _inspection questionnaire_, but the inspection of food packaging labels remains 100% manual and human-dependent.
- **Current Status:** Fully active.
- **Gap vs SIH26034:** FoSCoRIS proves that regulatory agencies want digitized on-site inspections, but reveals that no Indian regulatory body has successfully deployed automated computer vision label auditing.

#### 5. State Legal Metrology Departmental Portals (e.g., MahaLMD, AP e-Parapara)

- **Organization:** Respective State Legal Metrology Controllerates (Maharashtra, Andhra Pradesh, Karnataka, etc.).
- **Actual Workflow:** Legacy state-specific databases used primarily to record periodic verification and stamping of weighing balances, petrol dispensing pumps, and weighbridges.
- **Image Analysis / OCR / Automated Compliance:** **NON-EXISTENT.**
- **Current Status:** Fragmented; currently being integrated into national eMaap.

---

## 04. Commercial Solutions Landscape

A global market scan was conducted across packaging artwork management (PAM), pharmaceutical proofreading, industrial conveyor machine vision, and retail compliance systems.

### 4.1 Detailed Solution Evaluation

```mermaid
quadrantChart
    title Commercial & Industrial Inspection Landscape
    x-axis Low Environmental Robustness (Controlled/Digital) --> High Environmental Robustness (Field/Smartphone)
    y-axis Low Regulatory Automation --> High Regulatory Automation
    point-1 [0.15, 0.45] Artwork Flow (Bizongo)
    point-2 [0.12, 0.55] GlobalVision
    point-3 [0.20, 0.60] EyeC Proofiler
    point-4 [0.35, 0.20] Cognex In-Sight
    point-5 [0.30, 0.15] Keyence CV-X
    point-6 [0.85, 0.10] OpenFoodFacts
    point-7 [0.40, 0.85] Vincular / Corpbiz (Manual)
    point-8 [0.08, 0.35] Loftware Spectrum
    point-9 [0.88, 0.90] SIH26034 Objective Space
```

| Product / Platform                     | Company                           | Primary Market                      | Core Capabilities                                                                                                                                      | AI / CV Stack Used                                                                                       | Compliance Logic                                                 | Evidence Generation                                                   | Major Strengths                                                             | Critical Weaknesses & Gaps vs SIH26034                                                                                                                                                                   |
| :------------------------------------- | :-------------------------------- | :---------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Artwork Flow**                       | Bizongo (India / USA)             | FMCG Pre-Print Packaging Artwork    | Cloud-based SaaS proofreading for vector design files (`.ai`, `.pdf`). Extracts vector text, checks color separations, validates font sizes.           | Vector text parsing, basic OCR on raster embeds                                                          | Rule checklists for brand teams; manual workflows                | SaaS audit log, annotated PDF exports                                 | Excellent UI for graphic designers; native vector font point-size analysis  | **Pre-print only.** Cannot process photographed physical packages in retail environments. Measures typographic points (`pt`), not physical millimeters (`mm`) under optical camera distortion.           |
| **GlobalVision Quality Suite**         | GlobalVision Inc. (Canada)        | Pharma, CPG, Medical Devices        | Compares printed packaging samples against approved master digital proofs. Pixel-level difference inspection, barcode grading, Braille height check.   | High-res flatbed scan alignment, optical comparison algorithms                                           | Master-vs-sample diffing; FDA 21 CFR Part 11 compliant workflows | Detailed PDF difference reports, cryptographically signed audit trail | Sub-millimeter accuracy on flatbed scanners; gold standard in pharma QA     | **Requires an "approved master proof" to compare against.** Incapable of evaluating uncurated field packages against open-ended statutory law. Requires calibrated flatbed scanner or $20k+ optical rig. |
| **Cognex In-Sight Series (2800/3800)** | Cognex Corp. (USA)                | Industrial Manufacturing Automation | High-speed conveyor vision system. Inspects date codes, batch numbers, lot prints, and label orientation at 500+ parts/minute.                         | Proprietary Edge Learning OCR, ViDi deep learning vision algorithms                                      | Binary pass/fail matching against fixed industrial templates     | PLC digital I/O triggers, industrial network logging                  | Ultra-low latency ($< 20\text{ ms}$); immune to vibration on conveyor lines | **Requires fixed factory geometry, controlled strobe lighting, and high capital expenditure.** Does not evaluate Indian Legal Metrology Table-I rules, multi-panel layouts, or retail compliance.        |
| **Keyence CV-X / XG-X Series**         | Keyence Corporation (Japan)       | High-Precision Factory QA           | High-speed industrial inspection using telecentric lenses and multi-camera setups. Detects surface scratches, label misalignment, 1D/2D code quality.  | Proprietary hardware ASIC image processing algorithms                                                    | User-programmed geometric thresholds and pattern search          | Internal vision controller logs, CSV exports                          | Micrometer-level dimensional accuracy under telecentric lens optics         | **Heavy stationary industrial hardware.** Completely unusable by a mobile field inspector. Extremely high cost ($15,000–$50,000 per setup).                                                              |
| **EyeC Proofiler**                     | EyeC GmbH (Germany)               | Folding Carton & Pharma Print QA    | Inspects printed pharmaceutical cartons, foils, and labels against PDF artwork. Verifies text, 1D/2D codes, and print flaws down to $50\ \mu\text{m}$. | Scanner-based pixel matching, morphological image difference                                             | Master artwork comparison; ISO 15415 barcode grading             | Audit trail compliant with GMP and 21 CFR Part 11                     | Comprehensive defect detection on flat printed packaging                    | **Strictly flatbed scanner/pre-distribution.** Zero field capability; cannot measure 3D packages; no Indian regulatory engine.                                                                           |
| **OpenFoodFacts**                      | Open Food Facts (France / Global) | Consumer Crowdsourcing              | Mobile app allowing consumers to scan barcodes and snap food ingredient panels. Extracts ingredients, calculates Nutri-Score.                          | Cloud-based OCR (Tesseract / Google Vision), crowdsourced validation                                     | Nutrition calculation heuristics                                 | Crowdsourced public database history                                  | Massive crowdsourced global database; open API; public participation        | **Consumer nutritional awareness only.** Zero legal compliance checking; no font measurement; no MRP/USP ratio validation; zero evidentiary chain-of-custody.                                            |
| **Omron LVS-7510**                     | Omron Microscan (USA/Japan)       | Thermal Label Printer QA            | In-line thermal printer vision system. Inspects barcode quality to ISO/IEC standards, verifies OCR text directly as it exits the print head.           | Integrated CMOS sensor, optical character verification (OCV)                                             | ISO/IEC grading rules; string pattern match against print queue  | Operator error logs, compliance certificates                          | Real-time print validation before label application                         | **Printer accessory only.** Cannot inspect packaged commodities in retail stores or e-commerce fulfillment centers.                                                                                      |
| **Loftware Enterprise Labeling**       | Loftware Inc. (USA)               | Enterprise Supply Chain / ERP       | Centralized label design and lifecycle management platform. Generates compliant GS1 and FDA UDI labels from SAP/Oracle ERP data.                       | Template-driven vector layout engines                                                                    | Data validation rules driven by ERP master data                  | Enterprise database version control                                   | Prevents non-compliant labels at generation time                            | **Label generation, not label inspection.** Irrelevant to regulatory enforcement officers auditing distributed physical products.                                                                        |
| **Vincular / Corpbiz Advisory**        | Vincular / Corpbiz (India)        | Regulatory Consulting Services      | Human legal advisory firms assisting FMCG brands in complying with Legal Metrology Rules and filing eMaap applications.                                | **Manual human labor.** Lawyers inspect physical samples with steel scales and digital vernier calipers. | Human interpretation of Legal Metrology Gazette notifications    | Formal legal opinion letters, stamp and signature                     | Deep domain legal expertise; handles edge cases and bureaucratic nuances    | **Manual, expensive, non-scalable.** Turnaround time of 5–15 business days. Zero software automation.                                                                                                    |

### 4.2 Critical Takeaways from the Commercial Scan

1. **The "Artwork vs Field" Dichotomy:** Software solutions that understand font sizes (Artwork Flow, GlobalVision) operate exclusively in digital vector space (`.ai`/`.pdf` artboards). Systems that operate on physical objects (Cognex, Keyence) operate in fixed manufacturing conveyor cells with strobe lights and telecentric lenses.
2. **The "Master Proof" Crutch:** Almost all commercial packaging inspection engines require an authoritative digital master PDF to compare against. SIH26034 requires inspecting **arbitrary, uncurated physical packages against statutory statutory rules without having the brand's original master artwork**.
3. **The Indian Regulatory Vacuum:** Not a single commercial automated inspection tool natively incorporates the Legal Metrology (Packaged Commodities) Rules, 2011, Table-I font height matrices, or Rule 6(11) Unit Sale Price calculations.

---

## 05. Academic Research Landscape

A comprehensive review of peer-reviewed literature was conducted across scene text detection, document intelligence, camera metrology, and Indic OCR.

```mermaid
graph LR
    subgraph Detection["1. Scene Text & Layout Detection"]
        DBNet["DBNet (Liao et al., AAAI 2020)<br/>Differentiable Binarization<br/>Real-Time, Arbitrary Shape"]
        ABCNet["ABCNet v2 (Liu et al., TPAMI 2021)<br/>Bezier Curve Spotting<br/>Curved Packaging Text"]
    end

    subgraph Recognition["2. Text Recognition & OCR"]
        SVTR["SVTR (Du et al., IJCAI 2022)<br/>Single Visual Model<br/>No RNN, Patch Tokenizer"]
        TrOCR["TrOCR (Li et al., AAAI 2023)<br/>Vision Transformer + LM<br/>High Accuracy, Slower CPU"]
    end

    subgraph Understanding["3. Document Intelligence & KIE"]
        LayoutLMv3["LayoutLMv3 (Huang et al., ACM MM 2022)<br/>Multimodal Unified Masking<br/>Text + Spatial Coordinates"]
        Donut["Donut (Kim et al., ECCV 2022)<br/>OCR-Free VLM<br/>Heavy Compute, Hallucination Risk"]
    end

    subgraph Metrology["4. Metric Calibration & Geometry"]
        ZhangCalib["Zhang Calibration (TPAMI 2000)<br/>Camera Matrix & Distortion"]
        ArUco["ArUco (Garrido-Jurado, PR 2014)<br/>Fiducial Pose & Homography"]
    end

    Detection --> Recognition
    Recognition --> Understanding
    Metrology -.->|Metric Scale Mapping| Detection
```

### Detailed Academic Paper Analyses

#### Paper 1: Real-Time Scene Text Detection with Differentiable Binarization (DBNet)

- **Authors:** Minghui Liao, Zhaoyi Wan, Cong Yao, Kai Chen, Xiang Bai.
- **Year & Venue:** 2020; _Proceedings of the AAAI Conference on Artificial Intelligence (AAAI-20)_, 34(07), 11474–11481.
- **Problem Addressed:** Traditional segmentation-based text detectors use a hard binarization threshold (step function) during post-processing, which is non-differentiable and fails to separate closely packed text instances on complex backgrounds.
- **Method:** Introduces Differentiable Binarization (DB), integrating an adaptive, differentiable step function directly into the neural network training pipeline:
  $$\hat{B}_{i, j} = \frac{1}{1 + e^{-\alpha (P_{i, j} - T_{i, j})}}$$
  where $P$ is the probability map, $T$ is the learned threshold map, and $\alpha$ is an amplification factor.
- **Datasets Evaluated:** MSRA-TD500, ICDAR 2015, Total-Text.
- **Key Results:** Achieves $82.8\%$ F-measure at $62\text{ FPS}$ on ICDAR 2015 using ResNet-50; lightweight ResNet-18 backbone achieves $82.1\text{ FPS}$.
- **Strengths:** Outstanding balance of speed and precision; accurately detects arbitrary-oriented, multi-scale text; extremely lightweight when exported to ONNX/OpenVINO.
- **Weaknesses:** Struggles with extremely curved text around sharp 3D container boundaries without explicit dewarping.
- **Relevance to SIH26034:** **Primary candidate for text bounding box localization.** Powers PaddleOCR's text detection module.
- **Availability:** Open source (`https://github.com/MhLiao/DB`), Apache-compatible.

#### Paper 2: SVTR: Scene Text Recognition with a Single Visual Model

- **Authors:** Yongkun Du, Zhineng Chen, Caiyan Jia, Xiaoting Yin, Tianlun Zheng, Chenxia Li, Yuning Du, Yu-Gang Jiang.
- **Year & Venue:** 2022; _Proceedings of the Thirty-First International Joint Conference on Artificial Intelligence (IJCAI-22)_, pp. 895–902.
- **Problem Addressed:** Conventional text recognition combines a CNN feature extractor with a recurrent sequence decoder (RNN/LSTM), causing sequential latency bottlenecks and error propagation over long strings.
- **Method:** Replaces the CNN+RNN architecture with a vision-only transformer architecture based on patch-wise character tokenization and self-attention mixing blocks (local and global mixing) to capture intra-character stroke dynamics and inter-character linguistic context simultaneously.
- **Datasets Evaluated:** ICDAR 2013, ICDAR 2015, IIIT5K, SVT, SVTP, CUTE80.
- **Key Results:** Achieves $96.3\%$ accuracy on IIIT5K and competitive state-of-the-art results across English and Chinese benchmarks with significantly reduced inference latency compared to ABINet.
- **Strengths:** Highly compact representation; eliminates recurrent unrolling; robust against stroke distortion, blur, and uneven lighting.
- **Weaknesses:** Requires specialized training tokenizers for non-Latin Indic conjunct characters.
- **Relevance to SIH26034:** **Foundational architecture of PaddleOCR PP-OCRv4 recognizer.**
- **Availability:** Open source (`https://github.com/PaddlePaddle/PaddleOCR`), Apache 2.0.

#### Paper 3: TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models

- **Authors:** Minghao Li, Tengchao Lv, Jingye Chen, Lei Cui, Yijuan Lu, Dinei Florencio, Cha Zhang, Zhoujun Li, Furu Wei.
- **Year & Venue:** 2023; _Proceedings of the AAAI Conference on Artificial Intelligence (AAAI-23)_, 37(7), 8509–8517.
- **Problem Addressed:** Bridging image understanding and sequence generation using standard pre-trained Vision Transformers (ViT) and language models (RoBERTa).
- **Method:** Pure encoder-decoder transformer pipeline. The encoder processes image patches via ViT; the decoder generates text autoregressively using a pre-trained language model decoder.
- **Datasets Evaluated:** SROIE, IAM Handwriting, IIIT5K, ICDAR benchmarks.
- **Key Results:** SOTA accuracy on printed receipts and handwriting; exceptional character error rate (CER $< 1.5\%$) on clean printed text.
- **Strengths:** Unrivaled text transcription fidelity; natively corrects minor visual misrecognitions using internal language model priors.
- **Weaknesses:** **Autoregressive decoding causes high latency on CPU.** Compute footprint (300M+ parameters) makes it unfeasible for real-time mobile execution. Autoregressive language modeling risks "hallucinating" numbers in critical values (e.g., misreading MRP ₹48 as ₹40 because 40 is a more frequent language prior).
- **Relevance to SIH26034:** Strong candidate for server-side verification of low-confidence crops, but **unsuitable as primary edge inference engine**.
- **Availability:** Open source via Hugging Face (`microsoft/trocr-base-printed`).

#### Paper 4: LayoutLMv3: Pre-training for Document AI with Unified Text and Image Masking

- **Authors:** Yupan Huang, Tengchao Lv, Lei Cui, Yutong Lu, Furu Wei.
- **Year & Venue:** 2022; _Proceedings of the 30th ACM International Conference on Multimedia (ACM MM '22)_, pp. 1083–1091.
- **Problem Addressed:** Previous multimodal document models required complex pre-extracted visual embeddings from separate Faster R-CNN object detectors, hindering speed and cross-modal alignment.
- **Method:** Unified multimodal transformer that jointly models text tokens, 2D spatial bounding boxes ($x_0, y_0, x_1, y_1$), and visual image patches without requiring an auxiliary object detector. Pre-trained with Masked Language Modeling (MLM), Masked Image Modeling (MIM), and Word-Patch Alignment (WPA).
- **Datasets Evaluated:** FUNSD (forms), CORD (receipts), SROIE, DocVQA.
- **Key Results:** Outperformed LayoutLMv2 and structural baselines; achieved $92.58\%$ F1 on CORD entity extraction.
- **Strengths:** Exceptional capability to associate spatial coordinates with semantic labels (e.g., mapping a price string to its bounding box and neighboring "MRP" label).
- **Weaknesses:** Trained primarily on flat 2D scanned paper documents; packaging labels exhibit non-standard 3D visual hierarchies, wrapping text, and colorful branded backgrounds. High memory requirements.
- **Relevance to SIH26034:** Candidate for key information extraction (KIE) on complex packaging panels, but simpler regex/NER hybrids may achieve superior latency on edge hardware.
- **Availability:** Open source (`https://github.com/microsoft/unilm/tree/master/layoutlmv3`).

#### Paper 5: Automatic Generation and Detection of Highly Reliable Fiducial Markers Under Occlusion (ArUco)

- **Authors:** Sergio Garrido-Jurado, Rafael Muñoz-Salinas, Francisco J. Madrid-Cuevas, Manuel J. Marín-Jiménez.
- **Year & Venue:** 2014; _Pattern Recognition_, 47(6), 2280–2292.
- **Problem Addressed:** Planar fiducial markers often suffer from false negative detections, inter-marker confusion, and complete failure under partial occlusion or perspective distortion.
- **Method:** Formulates marker dictionary design as an optimization problem maximizing inter-marker Hamming distance. Employs adaptive image thresholding, contour extraction, polygon approximation, and perspective homography rectification to decode binary payloads. Solves the Perspective-n-Point (PnP) problem to compute full 6-DoF camera pose:
  $$\begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = K \begin{bmatrix} R & t \end{bmatrix} \begin{bmatrix} X_w \\ Y_w \\ Z_w \\ 1 \end{bmatrix}$$
- **Key Results:** Demonstrates $> 99\%$ marker identification accuracy under up to $30^\circ$ perspective tilt and $> 95\%$ accuracy under partial occlusion.
- **Strengths:** Ultra-fast deterministic C++ execution ($< 5\text{ ms}$ on CPU); native OpenCV integration; mathematically exact metric scale factor recovery ($S = \text{known\_size\_mm} / \text{measured\_pixels}$).
- **Weaknesses:** Requires the operator to place a physical marker or calibration card in the camera frame.
- **Relevance to SIH26034:** **Foundational scientific basis for physical font-height measurement.** Eliminates monocular scale ambiguity.
- **Availability:** Standard OpenCV library (`cv2.aruco`).

#### Paper 6: ABCNet v2: Adaptive Bezier-Curve Network for Arbitrary-Shaped Text Spotting

- **Authors:** Yuliang Liu, Chunhua Shen, Lianwen Lian, Hao Chen, Xinyu Zhou, Mingkun Yang.
- **Year & Venue:** 2021; _IEEE Transactions on Pattern Analysis and Machine Intelligence (TPAMI)_, 44(11), 8048–8064.
- **Problem Addressed:** Standard rectangular or rotated bounding boxes cannot fit curved or perspective-distorted text on cylindrical and spherical packaging (bottles, cans, flexible pouches).
- **Method:** Uses parameterized Bezier curves to model arbitrary-shaped text boundaries using 8 control points. Introduces BezierAlign to transform curved feature regions into rectangular feature maps for seamless character recognition.
- **Datasets Evaluated:** Total-Text, SCUT-CTW1500.
- **Key Results:** State-of-the-art end-to-end Hmean ($74.2\%$ on Total-Text) with $30+\text{ FPS}$ inference on GPU.
- **Strengths:** Elegant mathematical formulation for curved text on bottles and cylindrical packages.
- **Weaknesses:** Heavy training overhead; higher latency on low-power mobile CPUs.
- **Relevance to SIH26034:** Crucial literature validation for handling cylindrical packaging text dewarping.
- **Availability:** Open source (`https://github.com/Yuliang-Liu/ATEmperor`).

---

## 06. Computer Vision Technology Landscape

To accurately parse packaged commodities in retail and warehouse environments, four computer vision tasks must be evaluated: (1) Package & Panel Detection, (2) Surface Segmentation, (3) Scene Text Detection, and (4) Image Rectification.

```mermaid
flowchart TD
    RawImage["Raw Camera Capture"] --> PreCheck{"Pre-Inference Quality Gate"}
    PreCheck -->|Blur / Glare Failed| Retake["Prompt Operator: Retake Image"]
    PreCheck -->|Passed| Fork["Parallel Vision Branches"]

    subgraph GeoBranch["Branch A: Geometry & Scale"]
        DetectMarker["Detect Calibration Reference (ArUco / Card)"]
        ComputeH["Compute Planar Homography Matrix H"]
        RectifyImage["Metric Rectification to Orthogonal Frame"]
        SegPDP["Segment Principal Display Panel (PDP)"]
        CalcArea["Compute Statutory PDP Area (cm²)"]
    end

    subgraph TextBranch["Branch B: Perception & Text"]
        DetectText["Arbitrary-Shape Text Detection (DBNet)"]
        ExtractPolygons["Extract Character Bounding Polygons"]
        MultilingualOCR["Multilingual Text Recognition (SVTR)"]
    end

    Fork --> DetectMarker
    Fork --> DetectText
    DetectMarker --> ComputeH --> RectifyImage --> SegPDP --> CalcArea
    DetectText --> ExtractPolygons --> MultilingualOCR

    RectifyImage -.->|Rectified Geometry| ExtractPolygons
    CalcArea --> RuleEngineInput["Rule Engine Parameter Vector"]
    MultilingualOCR --> RuleEngineInput
```

### Approach Family Comparison

| Approach Family                    | Representative Models                  | Input / Output                                                           | Advantages                                                              | Limitations & Failure Modes                                                | Compute & Edge Feasibility                               | Licensing Constraint                                                                                                 |
| :--------------------------------- | :------------------------------------- | :----------------------------------------------------------------------- | :---------------------------------------------------------------------- | :------------------------------------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **YOLO Family (Detection/Seg)**    | YOLOv8, YOLOv9, YOLOv11                | **In:** 2D Image <br/>**Out:** Bounding boxes, class masks               | Ultra-fast inference, mature tooling, robust panel localization         | Over-segments multi-box text; struggles with sub-millimeter edge precision | CPU/GPU native; $30\text{ ms}$ on mobile                 | ⚠️ **PROHIBITED:** Ultralytics YOLO models use viral **GNU AGPL-3.0**, posing legal risks for government deployment. |
| **Permissive Real-Time Detectors** | RT-DETR, Faster R-CNN, YOLOv6          | **In:** 2D Image <br/>**Out:** Class boxes, feature maps                 | Transformer-based, no NMS post-processing bottlenecks, highly accurate  | Slightly higher memory footprint than YOLOv8-nano                          | Excellent on x86_64 CPU via ONNX Runtime; $60\text{ ms}$ | ✅ **APPROVED:** Apache 2.0 / BSD permissive licensing.                                                              |
| **Segmentation Networks**          | DeepLabv3+, SegFormer, Mask R-CNN      | **In:** 2D Image <br/>**Out:** Pixel-level binary mask of PDP            | Accurately segments non-rectangular and curved surface areas            | High training data requirements; fuzzy boundary predictions                | Medium CPU latency ($150–300\text{ ms}$)                 | ✅ **APPROVED:** MIT / Apache 2.0.                                                                                   |
| **Scene Text Detectors**           | DBNet, DBNet++, CRAFT                  | **In:** Packaging crop <br/>**Out:** Text boundary polygons              | Tight polygons around individual words/glyphs; robust to rotated labels | May split connected Indic script words across matras                       | CPU native; $< 50\text{ ms}$ via INT8 quantization       | ✅ **APPROVED:** Apache 2.0 (PaddleOCR / PyTorch).                                                                   |
| **Classical Geometric CV**         | OpenCV Homography, Canny, Hough, ArUco | **In:** Calibrated image <br/>**Out:** Rectified metric plane, scale $S$ | Deterministic, sub-pixel accuracy, zero hallucination, zero training    | Fails if reference marker is occluded or out of plane                      | Ultra-low compute; $< 10\text{ ms}$ on single-core CPU   | ✅ **APPROVED:** Apache 2.0 / BSD.                                                                                   |

---

## 07. OCR & Document AI Landscape

Document AI and OCR models were benchmarked across the critical parameters demanded by Legal Metrology: tiny font detection ($< 15\text{ pixels}$ glyph height), rotated and curved text handling, metallic packaging reflections, and Indic language support.

### Comprehensive OCR Framework Comparison

| Engine / Framework          | Primary Architecture                    |   Latin Accuracy (Clean)    |          Indic Script Support          |           Curved / Packaging Text           |         Tiny Text ($< 15\text{px}$)         |    CPU Latency (per image)     |   Memory Footprint   |    Licensing    | Overall Verdict for SIH26034                                                             |
| :-------------------------- | :-------------------------------------- | :-------------------------: | :------------------------------------: | :-----------------------------------------: | :-----------------------------------------: | :----------------------------: | :------------------: | :-------------: | :--------------------------------------------------------------------------------------- |
| **PaddleOCR (PP-OCRv4)**    | DBNet++ (Det) + SVTR-LCNet (Rec)        |       High ($> 95\%$)       | Excellent (Hindi, Tamil, Telugu, etc.) |      High (via polygonal DBNet crops)       |       Moderate-High (with super-res)        |   $\sim 120\text{ ms}$ (CPU)   | $\sim 250\text{ MB}$ |   Apache 2.0    | ⭐ **Strongest Candidate:** Industry-standard edge multilingual OCR engine.              |
| **Tesseract v5**            | Line binarization + LSTM sequence model |    Very High ($> 96\%$)     |    Good (`hin`, `ben`, `tam`, etc.)    | Very Poor (requires strict horizontal text) | Poor (degrades rapidly below $20\text{px}$) |   $\sim 80\text{ ms}$ (CPU)    | $\sim 100\text{ MB}$ |   Apache 2.0    | **Approved Fallback:** Outstanding on clean, cropped, rectangular fields.                |
| **EasyOCR**                 | CRAFT (Det) + CRNN (Rec)                |       High ($> 92\%$)       |    Moderate (Hindi, Marathi, etc.)     |                  Moderate                   |                  Moderate                   |   $\sim 350\text{ ms}$ (CPU)   | $\sim 800\text{ MB}$ |   Apache 2.0    | **Viable Alternative:** Slower on CPU than PaddleOCR; high RAM consumption.              |
| **TrOCR (Microsoft)**       | Vision Transformer + RoBERTa LM         | State-of-the-Art ($> 98\%$) |      Poor (English/Chinese focus)      |                    High                     |                    High                     |  $\sim 1800\text{ ms}$ (CPU)   | $\sim 1.5\text{ GB}$ |       MIT       | **Rejected for Edge:** Prohibitive latency on CPU; risk of LM numeral hallucination.     |
| **Surya OCR**               | SegFormer Detection + RecTransformer    |       High ($> 94\%$)       |     High (Supports 90+ languages)      |                    High                     |                    High                     |   $\sim 600\text{ ms}$ (CPU)   | $\sim 1.2\text{ GB}$ |     GPL-3.0     | ⚠️ **Licensing Risk:** GPL-3.0 restricts proprietary and closed government distribution. |
| **Donut / Nougat**          | End-to-End Multimodal Transformer       |          Very High          |        Negligible Indic support        |                  Moderate                   |                     Low                     |       $> 2500\text{ ms}$       |  $> 2.0\text{ GB}$   |       MIT       | **Rejected:** Extreme latency, no token bounding boxes for font measurement.             |
| **Google Cloud Vision API** | Proprietary Enterprise Cloud OCR        |       SOTA ($> 99\%$)       |   Complete (All 22 Indian languages)   |                  Very High                  |                  Very High                  | $\sim 400\text{ ms}$ (Network) |  Negligible (Cloud)  | Commercial SaaS | ❌ **Rejected as Core:** Violates offline field operational mandate; recurring API cost. |

---

## 08. Information Extraction Landscape

Raw OCR returns an unstructured list of detected text strings paired with spatial polygon coordinates:
$$\mathcal{T} = \{(s_i, \text{poly}_i, \text{conf}_i)\}_{i=1}^N$$
The system must extract and normalize the **7 statutory mandatory declarations** under Rule 6(1) of the Legal Metrology (Packaged Commodities) Rules, 2011:

1. Manufacturer / Packer / Importer Name & Address
2. Generic or Common Commodity Name
3. Net Quantity (Standard metric units under Rules 11–13)
4. Month & Year of Manufacture / Packing / Import
5. Best Before / Expiry Date (where applicable)
6. Maximum Retail Price (MRP inclusive of all taxes)
7. Unit Sale Price (USP under Rule 6(11))
8. Consumer Care Contact Details (Phone, Email, Address)

### Evaluation of Extraction Paradigms

```mermaid
graph TD
    RawTokens["Raw OCR Tokens & Polygons<br/>['MRP', 'Rs.', '45.00', 'incl.', 'taxes', 'Net', 'Wt.', '500g']"]

    subgraph RegexBranch["Deterministic Regex & Parser Engine"]
        MRPRegex["MRP Pattern: (?:MRP|M\.R\.P\.|₹|Rs\.?)\s*(\d+(?:\.\d{2})?)"]
        QtyRegex["Net Qty Pattern: (?:Net\s*Qty|Net\s*Weight|Net\s*Wt)\s*:\s*(\d+(?:\.\d+)?)\s*(g|kg|ml|l)"]
        USPRegex["USP Pattern: (?:USP|Unit\s*Price)\s*:\s*Rs\.?\s*(\d+(?:\.\d+)?)\s*\/\s*(g|kg|ml|piece)"]
        DateRegex["Date Pattern: (?:Mfg|Pkd|Date)\s*:\s*(\d{2}\/\d{4}|\w+\s*\d{4})"]
    end

    subgraph SpatialNER["Spatial & Entity Linking Engine"]
        NeighborSearch["2D Spatial Proximity Graph (K-D Tree / Delaunay)"]
        AddressNER["Spacy / BERT Token Classifier for Multi-line Address"]
    end

    RawTokens --> RegexBranch
    RawTokens --> SpatialNER

    RegexBranch --> FieldAggregator["Verified Structured Entity Map"]
    SpatialNER --> FieldAggregator

    FieldAggregator --> RuleEngine["To Deterministic Rule Engine"]
```

| Method                                         | Determinism & Legal Auditability                                                               | Accuracy on Structured Fields (MRP/Qty)                                | Handling of Unstructured Addresses                                         | Compute Cost & Latency                                                                     | Multilingual Handling                                       | Risk Profile                                                                     |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Deterministic Regular Expressions (Regex)**  | **100% Deterministic.** Exactly verifiable, zero hallucination.                                | **Extremely High ($> 95\%$)** when preceded by OCR text normalization. | **Poor.** Cannot parse complex multi-line physical addresses.              | $< 1\text{ ms}$; zero RAM overhead.                                                        | Requires script-specific regex patterns for Indic numerals. | **Lowest risk.** Foundation of any court-admissible extraction pipeline.         |
| **Rule-Based Spatial Proximity Graphs**        | **High.** Uses deterministic 2D Euclidean distances to link labels to values.                  | **High ($> 90\%$)** on standard key-value packaging layouts.           | **Moderate.** Groups spatially clustered address tokens.                   | $< 5\text{ ms}$; purely algorithmic.                                                       | Language-agnostic (operates on bounding box geometry).      | **Low risk.** Deterministic and explainable.                                     |
| **Named Entity Recognition (SpaCy / CRF)**     | **Moderate.** Statistical sequence labeling; reproducible given fixed weights.                 | **Moderate ($80–88\%$).** Vulnerable to OCR typos in numbers.          | **High ($> 88\%$).** Successfully segments entity boundaries in addresses. | $\sim 20\text{ ms}$ on CPU; $\sim 50\text{ MB}$ RAM.                                       | Requires multi-lingual tokenizers (e.g., IndicBERT).        | **Low-Medium.** Safe if outputs are subjected to deterministic regex validation. |
| **LayoutLMv3 Multimodal KIE**                  | **Moderate-Low.** Complex deep transformer; opaque weight activations.                         | **High ($> 92\%$)** if fine-tuned on packaging corpus.                 | **Very High ($> 92\%$).** Models 2D spatial context exceptionally well.    | $\sim 400\text{ ms}$ on CPU; $\sim 800\text{ MB}$ RAM.                                     | Poor zero-shot Indic language transfer.                     | **Medium.** Over-engineered for simple numbers; unexplainable in court.          |
| **Large Language Models (Few-Shot Prompting)** | ❌ **Zero Determinism.** Non-reproducible; sampling temperature $> 0$ yields variable results. | Variable; prone to silently altering numbers (e.g., ₹48 becomes ₹40).  | **Very High.** Superior parsing of messy, unformatted text blocks.         | High latency ($1–4\text{ s}$); cloud dependence or heavy local model ($4\text{GB}+$ VRAM). | Exceptional cross-lingual understanding.                    | 🚨 **CRITICAL RISK:** Total legal inadmissibility; hallucination hazard.         |

---

## 09. Rule Engine / Legal Reasoning Landscape

A Legal Metrology software system must convert statutory regulations into machine-verifiable predicates. The system must answer: _Does the extracted label conform to the specific rules in effect on the date the commodity was manufactured?_

```mermaid
flowchart TD
    subgraph Inputs["Extracted Commodity Feature Vector"]
        MfgDate["Manufacturing Date: 2023-04-15"]
        PDPArea["Principal Display Panel Area: 120 cm²"]
        FontHeight["Measured Numeral Height: 2.1 mm"]
        MRPVal["MRP: ₹150.00 (inclusive of all taxes)"]
        USPVal["USP: ₹0.30 per g"]
        NetQty["Net Qty: 500 g"]
        PkgType["Package Type: Rigid Rectangular Carton"]
    end

    subgraph TemporalRouter["Temporal Statutory Epoch Resolver"]
        CheckDate{"Compare MfgDate with Legal Amendments"}
        Epoch1["Epoch 2011: Base Rules (G.S.R. 202(E))"]
        Epoch2["Epoch 2017: Table-I Font Amendment (G.S.R. 629(E))"]
        Epoch3["Epoch 2022: Mandatory USP Rollout (G.S.R. 779(E))"]
        Epoch4["Epoch 2023: Jan Vishwas Decriminalization (Act 18 of 2023)"]

        CheckDate -->|Mfg >= 2022-12-01| Epoch3
        CheckDate -->|2018-01-01 <= Mfg < 2022-12-01| Epoch2
        CheckDate -->|Mfg < 2018-01-01| Epoch1
    end

    subgraph DeterministicEngine["Declarative Rule Engine (AST Evaluator)"]
        RuleUSP{"Rule 6(11) Check:<br/>Net Qty > 500g requires USP.<br/>Is USP == MRP / NetQty?<br/>150 / 500 = 0.30"}
        RuleFont{"Rule 7 / Table-I Check:<br/>PDP Area 120 cm² (100 to 500 cm²).<br/>Required Height >= 2.5 mm.<br/>Measured = 2.1 mm."}

        RuleUSP -->|Match| PassUSP["PASS: USP Compliant"]
        RuleFont -->|2.1 < 2.5 mm| FailFont["FAIL: Font Height Non-Compliant<br/>(Deficit: 0.4 mm)"]
    end

    Inputs --> TemporalRouter
    Epoch3 --> DeterministicEngine

    subgraph Verdict["Quasi-Judicial Inspection Finding"]
        Dossier["Assemble Statutory Findings Dossier:<br/>• Overall Status: NON_COMPLIANT<br/>• Breach: Rule 7, Table-I Violation<br/>• Statutory Penalty: Section 36 LMA (First Offense: Improvement Notice)"]
    end

    PassUSP --> Dossier
    FailFont --> Dossier
```

### Technical Approaches to Rule Execution

1. **RETE-Based Production Rule Systems (e.g., Drools, Clara):**
   - _Mechanism:_ Pattern-matching algorithm constructing a Directed Acyclic Graph (DAG) of conditions to evaluate large rule bases against working memory facts.
   - _Suitability:_ Over-engineered for Legal Metrology. Legal Metrology Rules comprise approximately 20–30 core statutory predicates, not thousands of enterprise business rules. Drools incurs a heavy JVM runtime dependency.
2. **Policy-as-Code (Open Policy Agent - Rego):**
   - _Mechanism:_ Declarative logic programming language executing structured JSON inputs against declarative policy documents.
   - _Suitability:_ Excellent for cloud and container compliance, but lacks native mathematical metrology functions and adds unnecessary foreign runtime complexity to edge Python/TypeScript applications.
3. **Declarative Abstract Syntax Tree (AST) Rule Evaluator (Custom Python/TypeScript):**
   - _Mechanism:_ Rules expressed as declarative, human-readable JSON/YAML specifications representing boolean logic trees and mathematical bounds:
     ```yaml
     rule_id: "LMPC-R07-TAB1-AREA-100-500"
     statutory_source: "Rule 7, Table-I, Legal Metrology (PC) Rules, 2011"
     amendment_reference: "G.S.R. 629(E) dated 2017-06-23"
     effective_date: "2018-01-01"
     condition:
       and:
         - field: "pdp_area_cm2"
           operator: "gt"
           value: 100.0
         - field: "pdp_area_cm2"
           operator: "lte"
           value: 500.0
     assertion:
       field: "numeral_height_mm"
       operator: "gte"
       value: 2.5
     penalty_clause: "Section 36(1) of Legal Metrology Act, 2009"
     ```
   - _Suitability:_ **Optimal candidate.** Completely auditable, version-controllable in Git, verifiable by legal counsel, executes in $< 1\text{ ms}$, and produces exact statutory citations for every violation.

---

## 10. Font Size & Geometric Measurement Research

This section addresses the physical calibration requirements of Legal Metrology. Rule 7 and Table-I establish mandatory minimum heights for numerals and letters based on Principal Display Panel (PDP) area:

$$\text{Table-I Minimum Height Requirements:}$$

$$
\begin{cases}
1.0\text{ mm} & \text{if } \text{PDP Area} \le 50\text{ cm}^2 \\
1.5\text{ mm} & \text{if } 50 < \text{PDP Area} \le 100\text{ cm}^2 \\
2.5\text{ mm} & \text{if } 100 < \text{PDP Area} \le 500\text{ cm}^2 \\
4.0\text{ mm} & \text{if } 500 < \text{PDP Area} \le 2500\text{ cm}^2 \\
6.0\text{ mm} & \text{if } \text{PDP Area} > 2500\text{ cm}^2
\end{cases}
$$

_(Note: Blown, moulded, or perforated declarations require higher thresholds: $2.0, 3.0, 4.0, 6.0, 6.0\text{ mm}$ respectively)._

```mermaid
graph TD
    subgraph AmbiguityProblem["The Monocular Scale Ambiguity Problem"]
        SceneObject["Physical Commodity Character (Height: 2.5 mm)"]
        CameraLens["Smartphone Camera Lens (focal length: f)"]
        PixelProjection["Sensor Plane: Character Image (Height: 42 pixels)"]

        SceneObject -->|Distance: 15 cm| CameraLens --> PixelProjection
        Alternative["Alternative Reality: Character Height 5.0 mm at Distance 30 cm"]
        Alternative -.->|Identical Projection| PixelProjection
    end

    subgraph Solution["Planar Homography with Known Reference"]
        CalibTarget["Coplanar Reference Target<br/>(ArUco Marker or ISO/IEC 7810 Card:<br/>Known Width W_ref mm, Height H_ref mm)"]
        HomographyCalc["Solve 3x3 Homography Matrix H:<br/>p_metric = H * p_pixel"]
        RectifiedFrame["Orthogonal Metric Frame (mm/pixel constant)"]

        CalibTarget --> HomographyCalc
        PixelProjection --> HomographyCalc
        HomographyCalc --> RectifiedFrame
        RectifiedFrame --> MeasuredOutput["True Metric Character Height = 2.48 ± 0.08 mm"]
    end
```

### The Mathematics of Monocular Metric Ambiguity

In projective geometry, a camera maps a 3D world point $\mathbf{X} = [X, Y, Z]^T$ to a 2D image pixel $\mathbf{x} = [u, v]^T$ via the perspective projection matrix $P$:
$$\mathbf{x} \sim P \mathbf{X} = K [R \mid t] \mathbf{X}$$
Because projection is defined up to an arbitrary scale factor $\lambda$, **it is mathematically impossible to determine the metric size of an unknown object from a single 2D photograph without additional geometric constraints**. A $2.5\text{ mm}$ character photographed at $15\text{ cm}$ distance projects to the exact same pixel dimensions as a $5.0\text{ mm}$ character photographed at $30\text{ cm}$ distance.

### The Planar Homography Solution

When declarations lie on a planar packaging face (e.g., the front panel of a rectangular carton), the relationship between points on the packaging plane $\mathbf{X}_\pi$ and points on the image plane $\mathbf{x}$ is governed by a planar homography matrix $H \in \mathbb{R}^{3 \times 3}$:
$$\mathbf{x} = H \mathbf{X}_\pi = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} X_\pi \\ Y_\pi \\ 1 \end{bmatrix}$$
To estimate physical character height:

1. A physical calibration target of known dimensions (e.g., an ArUco fiducial target of $20.0\text{ mm} \times 20.0\text{ mm}$, or a standard credit-card-sized reference card of $85.60\text{ mm} \times 53.98\text{ mm}$ under ISO/IEC 7810 ID-1) is placed **coplanar** to the packaging panel.
2. OpenCV detects the four corners of the reference target in pixel space: $\{p_1, p_2, p_3, p_4\}$.
3. Using the known physical metric coordinates $\{P_1, P_2, P_3, P_4\}$, OpenCV computes $H$ via the Direct Linear Transformation (DLT) algorithm (`cv2.findHomography`).
4. The image is warped via `cv2.warpPerspective` into a rectified orthogonal view where the pixel-to-millimeter ratio is constant across the entire rectified plane:
   $$S = \frac{\text{Known Dimension (mm)}}{\text{Measured Rectified Pixels}}$$
5. The character glyph's cap-height or numeral bounding height $h_{\text{pixels}}$ is measured on the rectified image, yielding the physical metric height:
   $$H_{\text{metric}} = h_{\text{pixels}} \times S \pm \epsilon_{\text{uncertainty}}$$

### Typographic Height vs Statutory Character Height

A critical pitfall in commercial proofreading tools is confusing **typographic point size** with **statutory character height**:

- In typography, font size (e.g., $10\text{ pt}$) represents the height of the metal type slug (the _em-square_), which includes upper and lower ascender/descender margins.
- Under Legal Metrology Rules, Rule 7(1) explicitly mandates: _"The minimum height of numerals and letters shall be as specified in Table-I"_. Table-I specifically regulates the **actual physical printed height of the glyph itself** (cap-height for uppercase letters and numerals, or x-height for lowercase letters).
- An automated inspection system must measure the **exact vertex-to-vertex bounding polygon height of the printed ink glyph**, not query the metadata font size.

### Failure Modes & Limitations of Geometric Measurement

1. **Out-of-Plane Reference Target:** If the officer places the calibration card on the table surface while inspecting a package $5\text{ cm}$ above the table, the scale factor $S$ is completely invalidated, causing false font-height measurements.
2. **Cylindrical & Curved Surfaces:** Planar homography fails on curved bottles and beverage cans. On a cylinder of radius $R$, text undergoes non-linear perspective compression:
   $$x_{\text{proj}} = R \sin\left(\frac{x_{\text{surface}}}{R}\right)$$
   Measuring text height along the vertical axis of a cylinder is valid (as vertical lines remain undistorted), but circumferential text width and area calculations require cylindrical dewarping models.
3. **Severe Perspective Angle ($> 35^\circ$):** At steep grazing angles, foreshortening compresses characters into sub-pixel widths, destroying edge gradients and causing large measurement errors ($\pm 0.5\text{ mm}$).

---

## 11. Readability & Image Quality Research

Rule 8 of the Legal Metrology (Packaged Commodities) Rules, 2011 mandates that all statutory declarations must be _"prominent, legible and conspicuous"_, presented in a color that contrasts distinctly with the background. An inspection system must evaluate readability objectively while filtering out unprocessable images before inference.

```mermaid
graph LR
    InputImage["Captured Inspection Image"] --> BlurCheck["1. Blur Assessment<br/>(Laplacian Variance)"]
    BlurCheck -->|Var < Threshold| RejectBlur["Reject: Image Blurred"]
    BlurCheck -->|Passed| GlareCheck["2. Glare Assessment<br/>(HSV Luminance Mask)"]
    GlareCheck -->|Saturated Cluster > Limit| RejectGlare["Reject: Specular Reflection"]
    GlareCheck -->|Passed| ContrastCheck["3. Contrast Assessment<br/>(Michelson / Weber Contrast)"]
    ContrastCheck -->|Contrast < Ratio| FlagContrast["Flag: Rule 8 Low Contrast Warning"]
    ContrastCheck -->|Passed| ConfidenceCheck["4. OCR Confidence Gate<br/>(Mean Token Probability)"]
    ConfidenceCheck -->|Conf < 0.60| FlagReview["Flag: Human Adjudication Required"]
    ConfidenceCheck -->|Conf >= 0.60| Downstream["Proceed to Statutory Rule Evaluation"]
```

### Objective Metrics for Packaging Quality Gating

1. **Blur Estimation via Laplacian Variance ($\sigma^2_{\Delta}$):**
   - Computes the variance of the Laplacian operator over the grayscale image:
     $$\nabla^2 I = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}, \quad \sigma^2_{\Delta} = \frac{1}{N} \sum ((\nabla^2 I) - \mu)^2$$
   - A sharp, focused packaging image yields high variance ($\sigma^2_{\Delta} > 150$). Motion-blurred or out-of-focus images exhibit smoothed gradients ($\sigma^2_{\Delta} < 60$).
   - _Latency:_ $< 8\text{ ms}$ on mobile CPU. Serves as the primary real-time capture gate.
2. **Specular Glare & Reflection Masking:**
   - Metallized polyester pouches (chips, snacks) and glossy plastic bottles generate harsh specular reflections under ambient retail lighting.
   - _Algorithm:_ Convert image to HSV/CIELAB color space. Identify saturated white clusters ($V > 245$ and $S < 15$). If a specular cluster intersects with a detected text bounding polygon, the system flags `TEXT_OCCLUDED_BY_GLARE` and instructs the officer to tilt the camera.
3. **Legibility & Color Contrast (Rule 8 Compliance):**
   - Under ISO 13660 and WCAG contrast algorithms, contrast between text ink pixels ($\mathcal{I}_{\text{text}}$) and background pixels ($\mathcal{I}_{\text{bg}}$) is calculated using the Michelson contrast ratio:
     $$C_M = \frac{L_{\text{max}} - L_{\text{min}}}{L_{\text{max}} + L_{\text{min}}}$$
   - Declarations printed in yellow ink on white laminate, or dark brown ink on dark red backgrounds, fail the statutory prominence test under Rule 8.
4. **No-Reference Image Quality Assessment (BRISQUE):**
   - Blind/Referenceless Image Spatial Quality Evaluator (Mittal et al., IEEE TIP 2012). Quantifies natural scene statistics (NSS) deviations caused by compression, blur, and sensor noise. Provides an objective quality score from 0 (pristine) to 100 (unusable).

---

## 12. Indian / Multilingual Technology Landscape

A major differentiator in Indian packaging inspection is the linguistic environment. Under Rule 9 of the Legal Metrology (Packaged Commodities) Rules, 2011, declarations must be made in **Hindi in Devanagari script or English**, while state laws and commercial practices frequently add regional scripts.

```mermaid
graph TD
    PackagingImage["Multilingual Indian Packaging Image"] --> ScriptDetect["Script Identification & Separation"]

    ScriptDetect -->|Latin Script (English)| EnglishPipeline["English Processing Pipeline<br/>• International Hindu-Arabic Numerals (0-9)<br/>• Standard Metric Units (g, kg, ml, l)<br/>• 'MRP Rs. / ₹ incl. of all taxes'"]

    ScriptDetect -->|Devanagari Script (Hindi)| DevanagariPipeline["Devanagari Processing Pipeline<br/>• Devanagari Numerals (०, १, २, ३, ४, ५, ६, ७, ८, ९)<br/>• Indic Units ('ग्राम', 'कि.ग्रा.', 'मि.ली.', 'लीटर')<br/>• 'अधिकतम खुदरा मूल्य ₹ (सभी कर सहित)'"]

    ScriptDetect -->|Regional Scripts (Tamil, Telugu, etc.)| RegionalPipeline["Regional Script Identification<br/>• Brand translation & statutory duplication verification<br/>• Ensuring no contradiction with English/Hindi declarations"]

    EnglishPipeline --> Normalizer["Semantic Multilingual Normalizer"]
    DevanagariPipeline --> Normalizer
    RegionalPipeline --> Normalizer

    Normalizer --> UnifiedFact["Normalized Statutory Facts Vector"]
```

### Key Technical Challenges in Indic Packaging OCR

1. **Complex Akshara & Conjunct Typography:**
   - Unlike Latin characters, which sit neatly in isolated horizontal sequence, Devanagari, Tamil, and Bengali feature complex top-hanging horizontal head-lines (_shirorekha_), vertical vowel modifiers (_matras_), subscript consonants, and ligatures (_samyuktaksaras_).
   - Generic OCR engines often shear matras from consonant bases, mistaking `कि` for `क` or dropping nasalizing dots (_anusvara_), altering statutory text.
2. **Numeral Representation & Formatting:**
   - While modern FMCG products overwhelmingly print MRP and Net Quantity using Hindu-Arabic numerals (`0123456789`), local cottage industry goods and rural co-operative packaging frequently use Devanagari numerals (`०१२३४५६७८९`).
   - The normalization engine must map Indic numerals to IEEE floating-point numbers deterministically:
     $$\text{०} \to 0, \quad \text{१} \to 1, \quad \text{२} \to 2, \quad \dots \quad \text{९} \to 9$$
3. **Statutory Unit Variations:**
   - Rule 13 prescribes strict metric symbols: `g`, `kg`, `m`, `cm`, `mm`, `l`, `ml`. Common non-compliant variations include `gms`, `gm`, `g.`, `kilo`, `Gms`, `LTR`, `ML`.
   - The rule engine must flag non-standard unit abbreviations as statutory non-compliances under Rule 13.
4. **PaddleOCR vs Tesseract Indic Support:**
   - _PaddleOCR PP-OCRv4:_ Pre-trained weights support Devanagari, Tamil, and Telugu with high scene-text resilience. Bounding polygon tracking handles shirorekha continuity effectively.
   - _Tesseract v5:_ Requires downloading language packs (`hin.traineddata`). Performs well on clean document scans, but exhibits high character error rates on curved, low-contrast Indic packaging text.

---

## 13. Dataset Landscape

A rigorous dataset audit was conducted to identify existing publicly accessible datasets and establish data governance standards.

### Public Dataset Evaluation Matrix

| Dataset Name                             | Owner / Institution                 | Official URL / Source                            | License                  | Size / Count     | Language                      | Annotation Quality                                          | Domain Similarity to SIH26034                            | Suitability Classification                                          |
| :--------------------------------------- | :---------------------------------- | :----------------------------------------------- | :----------------------- | :--------------- | :---------------------------- | :---------------------------------------------------------- | :------------------------------------------------------- | :------------------------------------------------------------------ |
| **Bharat Scene Text (BSTD)**             | AI4Bharat / IIT Bombay              | `https://github.com/AI4Bharat/BharatSceneText`   | MIT / CC BY-NC 4.0       | 100,000+ words   | 11 Indian Languages + English | Word polygons + text transcriptions                         | High (Indian urban scene text, signboards, store labels) | **PARTIALLY USABLE** (Excellent for Indic OCR fine-tuning)          |
| **IndicSTR12**                           | Academic Consortium                 | `https://arxiv.org/abs/2203.15340`               | CC BY 4.0                | 27,000+ images   | 12 Indian Languages           | Cropped word images + labels                                | High (Real-world Indian text with blur and skew)         | **PARTIALLY USABLE** (Word-level OCR benchmarking)                  |
| **OpenFoodFacts India**                  | Open Food Facts Non-Profit          | `https://world.openfoodfacts.org/country/india`  | ODbL v1.0 / CC BY-SA 3.0 | 30,000+ products | English, Hindi, Regional      | Product photos, GTIN, ingredients (No font bounding boxes)  | High (Real Indian retail FMCG packaging photos)          | **PARTIALLY USABLE** (Multi-panel images; requires manual labeling) |
| **Total-Text**                           | University of Malaya                | `https://github.com/cs-chan/Total-Text-Dataset`  | Academic Research        | 1,555 images     | English                       | 16-point polygon curves + text                              | High (Curved text on bottles, cans, and cartons)         | **PARTIALLY USABLE** (Validating curved text detection)             |
| **ICDAR SROIE 2019**                     | ICDAR Benchmark                     | `https://rrc.cvc.uab.es/?ch=13`                  | Research Evaluation      | 1,000 receipts   | English                       | Bounding boxes + 4 entities (Company, Date, Address, Total) | Moderate (Receipts, not packaging labels)                | **ONLY FOR PRETRAINING** (Key Information Extraction pretraining)   |
| **ICDAR CORD 2019**                      | Clova AI (NAVER)                    | `https://github.com/clovaai/cord`                | CC BY-NC-SA 4.0          | 1,000 receipts   | English / Indonesian          | Hierarchical JSON layout + 30 entity tags                   | Moderate (Dense structured financial receipt layouts)    | **ONLY FOR PRETRAINING** (Testing spatial extraction models)        |
| **Grozi-3.2k**                           | University of California, San Diego | `https://vision.ucsd.edu/content/grozi`          | Academic Open            | 3,200 products   | English                       | In-situ store shelf photos + web product photos             | Moderate (Product recognition, not label metrology)      | **NOT SUITABLE** (Dated low-resolution web scrapes)                 |
| **RPC (Retail Product Checkout)**        | Megvii Research                     | `https://github.com/megvii-research/RPC-Dataset` | Non-Commercial Research  | 200,000 images   | English / Chinese             | Bounding boxes for product instance segmentation            | Low-Moderate (Checkout shelf images, labels unreadable)  | **NOT SUITABLE** (Focuses on object count, not label text)          |
| **DDI (Doc Distortion & Rectification)** | Academic Benchmark                  | `https://github.com/cvlab-kaist/DDI`             | Academic                 | 1,500 documents  | English                       | 3D mesh + rectified ground truth                            | High (Validating geometric planar dewarping)             | **PARTIALLY USABLE** (Evaluating image rectification algorithms)    |

---

## 14. Data Gap Analysis

The central dataset question must be answered bluntly: **Does a public ground-truth dataset exist for EXACT Legal Metrology compliance under Indian law?**

The answer is **NO.**

### 14.1 The Core Gaps

1. **The Physical Scale & Caliper Gap:** Not a single public dataset contains packaging photographs paired with **physical vernier caliper ground-truth measurements** (e.g., "This printed MRP numeral has a physical height of exactly $2.42\text{ mm}$ measured with $\pm 0.02\text{ mm}$ caliper"). All public datasets provide bounding coordinates solely in _pixel space_.
2. **The Indian Statutory Label Gap:** No dataset annotates packaging images with the specific statutory classes required by Rule 6(1) (Principal Display Panel boundary, Unit Sale Price, Consumer Care Officer designation, Veg/Non-Veg logo area, Standard Unit validation).
3. **The Multi-Panel Correlation Gap:** Existing product datasets (e.g., OpenFoodFacts) provide an unordered gallery of uncalibrated consumer phone photos, with no geometric transformation linking the front, rear, and side panels into a single coherent inspection session.

```mermaid
pie title Project Data Strategy Breakdown
    "Procedural Synthetic Math Dataset (DS-SYNTH-001)" : 45
    "Calibrated Field Pilot Acquisitions (DS-RETAIL-PILOT-001)" : 20
    "Filtered Public Indic Benchmarks (BSTD / IndicSTR12)" : 20
    "OpenFoodFacts India Multi-Panel Crops" : 15
```

### 14.2 The Four-Tier Data Strategy

To bridge these gaps without violating commercial copyright or scraping terms of service:

- **Tier 1: Data We Can Download Immediately:** Public Indic scene text benchmarks (BSTD, IndicSTR12, Total-Text) used exclusively for pre-training and validating baseline OCR accuracy.
- **Tier 2: Data We Can Procedurally Generate (Synthetic Mathematical Truth):** A deterministic procedural label rendering pipeline (`DS-SYNTH-001`). Generates vector packaging labels with mathematically defined millimeter dimensions ($1.0\text{ mm}, 1.5\text{ mm}, 2.5\text{ mm}, 4.0\text{ mm}, 6.0\text{ mm}$), synthetic noise, perspective tilt, and lighting gradients. This establishes sub-pixel ground truth for font measurement algorithms.
- **Tier 3: Data We Can Collect Legally (Physical Field Pilot):** Physical retail procurement of 50 common FMCG commodity items (rectangular cartons, pouches, cylindrical bottles). Measured manually using digital vernier calipers ($\pm 0.02\text{ mm}$) and photographed with certified ArUco calibration targets under varied lighting.
- **Tier 4: Data We CANNOT Reliably Obtain (Explicit Avoidance):** Mass automated scraping of commercial e-commerce platforms (Amazon, Blinkit, Zepto) is strictly **avoided**. Scraping violates commercial Terms of Service, triggers IP bans, and captures flat 2D marketing renders rather than physical real-world packaging.

---

## 15. Benchmark & Evaluation Metrics

To avoid subjective claims, every subsystem must be evaluated against established quantitative scientific metrics.

```mermaid
graph LR
    subgraph VisionMetrics["Computer Vision & Calibration"]
        mAP["Detection: mAP@0.5, mAP@0.5:0.95"]
        MAE["Scale Calibration: MAE (mm), RMSE (mm)"]
        IoU["PDP Segmentation: Mean IoU (%)"]
    end

    subgraph OCRMetrics["OCR & Information Extraction"]
        CER["OCR Transcription: Character Error Rate (CER)"]
        WER["OCR Transcription: Word Error Rate (WER)"]
        F1["Field Extraction: Macro & Micro F1 Score"]
    end

    subgraph RegulatoryMetrics["Statutory Rule Engine"]
        FPR["False Positive Rate (Falsely Accusing Brand)"]
        FNR["False Negative Rate (Missing Real Violation)"]
        ExecTime["Engine Latency: Rule Execution Time (ms)"]
    end
```

### Quantitative Metrics Specification

1. **Text & Panel Detection:**
   - **Mean Average Precision (mAP@0.5, mAP@0.5:0.95):** Standard COCO evaluation measuring intersection-over-union (IoU) between predicted bounding polygons and ground-truth text/panel regions.
2. **Optical Scale Calibration & Font Measurement:**
   - **Mean Absolute Error (MAE in mm):**
     $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |h_{\text{pred}, i} - h_{\text{true}, i}|$$
   - **Root Mean Square Error (RMSE in mm):** Penalizes large dimensional outliers.
   - **Target Benchmark:** $\text{MAE} \le 0.15\text{ mm}$ on planar packaging surfaces at camera distances between $15\text{ cm}$ and $30\text{ cm}$.
3. **Optical Character Recognition (OCR):**
   - **Character Error Rate (CER):** Levenshtein distance at character level normalized by ground truth length:
     $$\text{CER} = \frac{S + D + I}{N_{\text{chars}}}$$
   - **Word Error Rate (WER):** Levenshtein distance at word token level.
   - **Target Benchmark:** $\text{CER} \le 3.0\%$ on clean printed English/Hindi fields; $\text{CER} \le 7.0\%$ on curved or glossy packaging crops.
4. **Information Extraction (KIE):**
   - **Precision, Recall, F1-Score:** Evaluated per statutory entity (MRP, USP, Net Qty, Mfg Date, Address).
   - **Exact Field Match (EFM):** Binary correctness requiring both field value and metric unit to match ground truth exactly.
5. **Statutory Compliance & Legal Decision Matrix:**
   - **False Positive Rate (FPR / Type I Error):** System flags a compliant package as a violation. In a regulatory context, high FPR causes administrative embarrassment, retailer harassment, and legal pushback from manufacturers.
   - **False Negative Rate (FNR / Type II Error):** System clears a non-compliant package as lawful. FNR represents an enforcement failure.
   - _Target:_ Zero tolerance for unflagged severe violations ($\text{FNR} < 2\%$), with ambiguous edge cases routed to human review (`REVIEW`).

---

## 16. Failure Modes of Existing Approaches

Real-world deployment failures of computer vision and OCR on packaged commodities were cataloged and analyzed.

| Failure Mode                                | Root Cause / Physical Mechanism                                                                          | Frequency in Retail Field                    | Mitigation Strategy                                                                                                     | Data / Sensor Requirement                                              | Human Review Mandated?                                           |
| :------------------------------------------ | :------------------------------------------------------------------------------------------------------- | :------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------- |
| **Specular Glare on Foil**                  | Metallic laminates act as mirrors, causing CMOS sensor blooming and blowing out character contrast.      | Very High ($> 40\%$ on snack pouches)        | HSV saturation glare masking; dynamic capture guidance prompting user to tilt package $15^\circ$.                       | Pre-inference glare detection filter.                                  | Yes, if text region intersects glare mask.                       |
| **Cylindrical Perspective Compression**     | Circular curvature of cans/bottles compresses text horizontally near cylinder horizons.                  | High ($> 30\%$ on beverages/cosmetics)       | Restrict font-height measurement to vertical axis; apply parametric cylindrical dewarping.                              | Cylinder diameter estimation or manual entry.                          | Yes, for circumferential font measurements.                      |
| **Decorative & Stylized Brand Fonts**       | Marketing typography uses non-standard artistic ligatures, cursive script, and varying stroke weights.   | High on brand names; Low on statutory fields | Focus OCR strictly on statutory declaration clusters (mandatory fields almost always use sans-serif fonts).             | Spatial separation of brand artwork from statutory declaration blocks. | No, if mandatory declarations are clearly printed.               |
| **Crumpled & Flexible Pouches**             | Deformable plastic pouches (milk, detergent, chips) exhibit non-planar surface folds and shadowing.      | Very High in bulk retail                     | Guidance requiring operator to flatten pouch face; multi-sample averaging across best flat crop.                        | Planar smoothness validation via edge gradients.                       | Yes, if surface deviation exceeds planar threshold.              |
| **Floating Decimal Point Erasure**          | Low-contrast dot-matrix or ink-jet printing causes the decimal point in `₹ 45.00` to be lost (`₹ 4500`). | Moderate on ink-jet batch prints             | Contextual price-quantity plausibility check (e.g., flag $500\text{g}$ biscuit pack priced at ₹4500 as an OCR anomaly). | Rule engine validation against category price ranges.                  | **Mandatory.** Preventing catastrophic false overpricing claims. |
| **Out-of-Plane Calibration Target**         | Operator places calibration target at a different depth plane than the packaging label surface.          | High during untrained operation              | ArUco planar normal vector comparison; multi-panel interactive UI instructions.                                         | Coplanar geometric validation algorithms.                              | Yes, warning displayed if target is non-coplanar.                |
| **Missing Declaration Split Across Panels** | Statutory declarations split between front face (Net Qty) and bottom face (MRP / Mfg Date).              | Universal across modern packaging            | Session-based multi-panel aggregation graph (requires scanning all 6 faces before running compliance engine).           | Multi-image session state machine.                                     | Yes, if mandatory panel is omitted by operator.                  |

---

## 17. AI vs Rules vs Hybrid Analysis

A rigorous comparison was conducted across three overarching architectural paradigms for regulatory compliance software.

```mermaid
graph TD
    subgraph OptionA["Paradigm A: Pure End-to-End AI"]
        VLM["Vision-Language Model (e.g. GPT-4o, Gemini)"]
        VLM --> OpaqueVerdict["Black-Box Verdict: 'Package is Non-Compliant'"]
        OpaqueVerdict -.-> LegalFails["Legally Inadmissible, Hallucinations, High Latency"]
    end

    subgraph OptionB["Paradigm B: Pure Classical Heuristics"]
        CVOnly["Pure Classical CV + Template Matching"]
        CVOnly --> RigidVerdict["Brittle: Fails on any new packaging layout or font"]
    end

    subgraph OptionC["Paradigm C: Hybrid Perception-Verification (Recommended)"]
        DLPerception["Deep Learning Perception Layer<br/>(PaddleOCR, DBNet, ArUco)<br/>• Observational Only<br/>• Extracts Raw Polygons & Strings"]
        DeterministicRules["Formal Deterministic Rule Engine<br/>(Temporal AST Evaluator)<br/>• Evaluates Statutory Predicates<br/>• Produces Exact Legal Citations"]
        DLPerception --> DeterministicRules
        DeterministicRules --> AuditableVerdict["Legally Auditable Quasi-Judicial Finding"]
    end
```

### Comprehensive Paradigm Comparison

| Evaluation Dimension                   | Paradigm A: Pure End-to-End AI (VLM)                                                                          | Paradigm B: Pure Deterministic / Classical Rules                                                | Paradigm C: Hybrid Perception-Verification System                                                                         |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| **Legal Admissibility in Court**       | ❌ **Zero.** Black-box reasoning cannot be cross-examined or formally certified under Section 63 BSA 2023.    | ✅ **High.** Every calculation is deterministic and mathematically auditable.                   | ⭐ **Very High.** AI is strictly confined to perceptual observation; legal verdicts are 100% deterministic and traceable. |
| **Explainability & Transparency**      | ❌ **Extremely Low.** Generates fluent natural language excuses, but internal reasoning is hidden.            | ✅ **Complete.** Step-by-step mathematical and logical trace.                                   | ⭐ **Complete.** Generates structured inspection dossiers citing exact Gazette notifications and measured mm deficits.    |
| **Hallucination Risk**                 | 🚨 **Severe.** Prone to fabricating missing declarations, misreading digits, or imagining non-existent rules. | ✅ **Zero.** Does not possess generative capabilities.                                          | ⭐ **Negligible.** Perceptual outputs are bounded by confidence scores and validated by regex schema.                     |
| **Handling Diverse Packaging**         | ⭐ **High.** Generalizes well across varied artistic layouts and languages.                                   | ❌ **Extremely Brittle.** Hardcoded templates break when packaging dimensions or layouts shift. | ✅ **High.** Deep learning accommodates visual layout diversity, while rule engine handles statutory logic.               |
| **Edge Compute & Offline Suitability** | ❌ **Unusable.** Requires remote cloud API or expensive discrete mobile GPUs ($> 8\text{ GB}$ VRAM).          | ⭐ **Ultra-Lightweight.** Executes in milliseconds on low-power microcontrollers.               | ⭐ **Optimal for Edge.** INT8 quantized vision runtimes execute on commodity quad-core CPUs in $< 300\text{ ms}$.         |
| **Adaptability to New Amendments**     | ❌ **Uncontrolled.** Prompt engineering cannot guarantee strict non-retroactive temporal rule compliance.     | ❌ **Tedious.** Requires hardcoding structural parser logic for every change.                   | ⭐ **Superior.** Updating a declarative JSON/YAML rule file instantly incorporates new Gazette notifications.             |

**Evidence-Based Conclusion:** **Paradigm C (Hybrid Perception-Verification) is the only viable engineering architecture for SIH26034.**

---

## 18. LLM / VLM Role Analysis

The explosion of Generative AI requires defining strict, defensible boundaries for Large Language Models (LLMs) and Vision-Language Models (VLMs) in government inspection systems.

```mermaid
graph TD
    subgraph ProhibitedRoles["PROHIBITED ROLES (Unsafe & Inadmissible)"]
        PR1["❌ Computing Physical Font Heights in mm from Pixels"]
        PR2["❌ Determining Legal Pass/Fail Compliance Verdicts"]
        PR3["❌ Autonomous Issuance of Penalties or Statutory Notices"]
        PR4["❌ Interpreting Statutory Law without Source Anchors"]
    end

    subgraph PermissibleRoles["PERMISSIBLE ASSISTIVE ROLES (Safe & Contained)"]
        AR1["✅ Normalizing Messy OCR Address Strings into Structured Blocks"]
        AR2["✅ Generating Plain-Language Explanations of Violations for Non-Technical Officers"]
        AR3["✅ Natural Language Query Interface for Officers to Search Past Inspections"]
        AR4["✅ Multilingual Translation of Regional Brand Text for Officer Context"]
    end
```

### Analytical Breakdown: Benefits vs Hazards

#### 1. Legitimate, Contained Roles for LLMs

- **Semantic Address Normalization:** Manufacturer addresses often span 4–6 lines with irregular punctuation. An LLM or lightweight transformer token classifier can reliably group tokens into `[Company_Name, Street, City, State, PIN_Code]` without altering semantic meaning.
- **Natural Language Officer Summaries:** Once the deterministic rule engine identifies a violation (e.g., Rule 7 deficit of $0.4\text{ mm}$), an LLM can synthesize a clear, professional summary for the statutory inspection report:
  > _"The Net Quantity numeral '500g' measured 2.1 mm in height, which fails the statutory minimum of 2.5 mm required under Table-I for packages with PDP area between 100 and 500 cm² (measured area: 120 cm²)."_
- **Interactive Conversational Querying:** Allowing an inspector to ask: _"Show me all tea packaging violations recorded in Chandni Chowk during July 2026."_

#### 2. Strictly Prohibited Roles for LLMs/VLMs

- **Direct Metric Font Measurement:** VLMs possess no inherent spatial calibration. Prompting a VLM to "measure the height of the font" results in pure hallucination based on image resolution, with zero correlation to real-world millimeters.
- **Autonomous Quasi-Judicial Adjudication:** An LLM must never issue a final legal determination or decide whether a manufacturer should be prosecuted. Administrative authority rests strictly with the human Legal Metrology Officer under statutory appointment.

---

## 19. Open-Source Landscape

A survey of active open-source repositories was performed to identify reusable components and establish licensing boundaries.

| Repository              | Organization / Author | Primary Purpose                                          | Tech Stack                           | License                              | Reusability Potential for SIH26034                                                                                    | Copyleft / Legal Risks           |
| :---------------------- | :-------------------- | :------------------------------------------------------- | :----------------------------------- | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :------------------------------- |
| **PaddleOCR**           | PaddlePaddle (Baidu)  | SOTA Multilingual Scene Text Detection & Recognition     | Python / C++, PaddlePaddle, ONNX     | **Apache-2.0**                       | ⭐ **Extremely High.** Best open-source OCR for Indic and complex scene text.                                         | None (Permissive).               |
| **OpenCV**              | OpenCV Foundation     | Computer Vision, Homography, ArUco, Camera Calibration   | C++, Python bindings                 | **Apache-2.0**                       | ⭐ **Foundational.** Absolute necessity for all geometric and metric calibration math.                                | None (Permissive).               |
| **Tesseract**           | Google / HP           | OCR Engine (Binarization + LSTM Sequence Modeling)       | C++, Python wrappers (`pytesseract`) | **Apache-2.0**                       | **High.** Reliable fallback for clean, high-contrast text crops.                                                      | None (Permissive).               |
| **DocTR**               | Mindee                | Document Text Recognition and Layout Analysis            | Python, PyTorch / TensorFlow         | **Apache-2.0**                       | **Moderate.** Excellent end-to-end pipeline, but heavier than PaddleOCR on CPU.                                       | None (Permissive).               |
| **MMOCR**               | OpenMMLab             | Comprehensive Scene Text Detection & Recognition Toolbox | Python, PyTorch                      | **Apache-2.0**                       | **High for Research.** Excellent modular benchmark suite; heavy deployment footprint.                                 | None (Permissive).               |
| **json-rules-engine**   | CacheControl          | Lightweight Declarative Business Rules Engine            | TypeScript / JavaScript              | **ISC License**                      | **High.** Excellent candidate for client-side web/mobile rule evaluation.                                             | None (Permissive).               |
| **ReportLab / PyMuPDF** | ReportLab / Artifex   | PDF Inspection Dossier Generation                        | Python, C                            | **BSD (ReportLab) / AGPL (PyMuPDF)** | **High (ReportLab).** ⚠️ **AVOID PyMuPDF** due to commercial AGPL restrictions; use `pdfme` or ReportLab Open Source. | Keep to BSD / MIT PDF libraries. |
| **Ultralytics YOLO**    | Ultralytics LLC       | Object Detection & Instance Segmentation                 | Python, PyTorch                      | **GNU AGPL-3.0**                     | ❌ **STRICTLY PROHIBITED.** Viral copyleft license conflicts with government deployment models.                       | Severe copyleft legal hazard.    |

---

## 20. SIH / Hackathon Competitive Landscape

An analysis of previous Smart India Hackathon projects (including SIH 2025 PS 25057 on e-commerce compliance) and public hackathon repositories highlights recurrent patterns and common points of failure among student competitors.

```mermaid
graph TD
    subgraph TypicalCompetitor["Standard Hackathon Team Submission (Flawed Baseline)"]
        Comp1["E-Commerce Web Scraper (Selenium / BeautifulSoup)"]
        Comp2["Generic OCR Wrapper (Tesseract or EasyOCR without tuning)"]
        Comp3["Raw Prompt to OpenAI API: 'Check if this label is compliant'"]
        Comp4["Basic Web Dashboard (React + Express)"]

        Comp1 --> Comp2 --> Comp3 --> Comp4
        Comp4 -.-> FailJudge["FAILS JUDGING:<br/>• Fails on physical retail packaging<br/>• Zero physical font height measurement<br/>• Hallucinates legal compliance<br/>• Non-admissible evidence in court"]
    end

    subgraph DifferentiatedStrategy["SIH26034 Advanced Competitive Strategy"]
        Diff1["Guided Multi-Panel Physical Packaging Ingestion"]
        Diff2["Fiducial Planar Homography Metric Font Measurement (±0.15 mm)"]
        Diff3["Pre-Inference Optical Quality Gate (Blur/Glare Filtering)"]
        Diff4["Deterministic Temporal Statutory Rule Engine (GSR Notifications)"]
        Diff5["Section 63 BSA 2023 Tamper-Evident Inspection Dossier"]
        Diff6["100% Offline Edge CPU Inference (ONNX / INT8)"]

        Diff1 --> Diff2 --> Diff3 --> Diff4 --> Diff5 --> Diff6
        Diff6 -.-> WinJudge["STANDS OUT TO JURY:<br/>• Solves the actual physical metrology challenge<br/>• Legally sound, auditable, and court-ready"]
    end
```

### Recurrent Competitor Anti-Patterns

1. **The "E-Commerce Scraper" Diversion:** Many teams mistakenly pivot to web scraping Amazon or Flipkart product listing pages (HTML DOM parsing) because it avoids computer vision. However, SIH26034 specifically demands: _"scanning products, images and labels"_. Web scraping ignores the physical packaged commodities sold in millions of brick-and-mortar retail shops.
2. **The "Uncalibrated Pixel Font" Trap:** Teams attempt to measure font sizes by counting bounding box pixel heights ($h_{\text{pixels}}$) and dividing by an assumed constant (e.g., $96\text{ DPI}$ or $72\text{ pt/inch}$). This demonstrates a lack of basic computer vision knowledge to the jury: camera images possess no fixed DPI.
3. **The "ChatGPT Legal Wrapper" Flaw:** Teams pass OCR text directly into an LLM prompt: _"Check if this product complies with Legal Metrology Rules."_ The LLM routinely hallucinates non-existent rule amendments, approves missing declarations, and fails to check Table-I dimensional ratios.
4. **Ignoring Section 63 BSA 2023 Evidence Chain:** Competitors generate standard unhashed CSV or PDF summaries. If challenged by a brand in court, these documents are legally worthless because they cannot establish digital chain of custody or prove that the photograph was not tampered with.

---

## 21. Competitive Gap Analysis

A structured 5-way comparative analysis reveals the competitive standing of SIH26034 requirements across government, commercial, academic, and hackathon domains.

| System Capability                                | Government Portals (eMaap) | Commercial Systems (GlobalVision/ArtworkFlow) |        Academic Literature (CVPR/ICDAR)        |        Typical Hackathon Projects        | SIH26034 Target Standing     |
| :----------------------------------------------- | :------------------------: | :-------------------------------------------: | :--------------------------------------------: | :--------------------------------------: | :--------------------------- |
| **Physical Metric Font Height Measurement (mm)** |       Unsolved (0%)        |        Partially Solved (Scanner only)        |       Solved in Lab (ArUco / Homography)       | Poorly Solved (Uncalibrated pixel guess) | 🟢 **Major Differentiator**  |
| **Multi-Panel Package Ingestion**                |       Unsolved (0%)        |     Partially Solved (Flat vector sheets)     |      Rarely Solved (Unordered galleries)       |       Unsolved (Single image only)       | 🟢 **Major Differentiator**  |
| **Non-Retroactive Statutory Rule Engine**        |     Unsolved (Manual)      |       Rarely Solved (Static checklists)       | Rarely Solved (Rule engines not linked to law) |    Unsolved (Hardcoded or LLM prompt)    | 🟢 **Major Differentiator**  |
| **Section 63 BSA Tamper-Evident Evidence**       | Partially Solved (DB logs) |        Solved for FDA (21 CFR Part 11)        |        Solved (Merkle trees / SHA-256)         |    Unsolved (Standard unhashed PDFs)     | 🟢 **Major Differentiator**  |
| **Offline Edge CPU Execution**                   |    Unsolved (Web SaaS)     |         Partially Solved (Desktop PC)         |       Solved (ONNX / INT8 quantization)        |   Poorly Solved (Relies on cloud APIs)   | 🟢 **Major Differentiator**  |
| **Multilingual Indic Scene Text OCR**            |       Unsolved (0%)        |         Poorly Solved (Latin-centric)         |        Solved (PaddleOCR / BSTD models)        |     Partially Solved (Raw Tesseract)     | 🟡 **Mature Building Block** |
| **Pre-Inference Blur & Glare Gate**              |       Unsolved (0%)        |          Solved (Industrial QA rigs)          |        Solved (Laplacian / NSS metrics)        |   Unsolved (Processes garbage inputs)    | 🟢 **Operational Advantage** |

---

## 22. White-Space Opportunities

Six validated "white-space" opportunities exist where current solutions are non-existent, inaccessible, or incomplete for Indian Legal Metrology enforcement:

```mermaid
graph TD
    WS1["1. Monocular Planar Calibrated Metrology<br/>(Sub-mm physical measurement via smartphone camera)"]
    WS2["2. Multi-Panel 3D Packaging Correlation<br/>(Linking 6 exterior faces into a unified session)"]
    WS3["3. Non-Retroactive Multi-Epoch Statutory Engine<br/>(Enforcing rules based on package manufacturing date)"]
    WS4["4. Section 63 BSA 2023 Evidence Graph<br/>(Cryptographic Merkle DAG proving zero tampering)"]
    WS5["5. Interactive Pre-Inference Quality Gate<br/>(Real-time optical feedback guiding non-technical officers)"]
    WS6["6. 100% Offline Edge Field Operation<br/>(Zero cloud dependency in rural mandis and godowns)"]

    WS1 --- WS2 --- WS3 --- WS4 --- WS5 --- WS6
```

### Detailed Validation of White Spaces

#### 1. Monocular Planar Calibrated Metrology on Consumer Smartphones

- _Why it is a gap:_ No field tool enables an enforcement officer to photograph a physical package with a standard phone and receive a certified character height measurement in millimeters.
- _Evidence:_ Industrial vision systems require $10k+ stationary camera rigs; commercial packaging tools analyze only pre-print vector artboards.
- _Importance:_ Directly addresses the core requirement of Rule 7 and Table-I.

#### 2. Multi-Panel 3D Packaging Correlation

- _Why it is a gap:_ Mandatory declarations are intentionally scattered across different panels (e.g., brand on front, Net Quantity on side, MRP and Manufacturer on bottom). Single-image scanners fail because they cannot correlate declarations across panels.
- _Evidence:_ Academic benchmarks and hackathon systems process single, isolated crops.
- _Importance:_ Eliminates false "missing declaration" violations by verifying that an omitted front declaration exists on an approved alternate panel.

#### 3. Non-Retroactive Multi-Epoch Statutory Rule Engine

- _Why it is a gap:_ Legal amendments cannot be applied retroactively (Article 20(1) of the Constitution of India). A package manufactured in November 2022 cannot be penalized for lacking a Unit Sale Price (which became mandatory on December 1, 2022). Existing systems use static, hardcoded rules.
- _Evidence:_ No current packaging software automatically resolves statutory rules against the package's manufacturing date.
- _Importance:_ Guarantees that inspection notices are legally sound and resistant to judicial challenge.

#### 4. Section 63 BSA 2023 Tamper-Evident Evidence Graph

- _Why it is a gap:_ Standard inspection reports are easily contested in court as unverified digital fabrications.
- _Evidence:_ The Bharatiya Sakshya Adhiniyam, 2023 (BSA) strictly mandates verifiable cryptographic hashes and metadata certificates for electronic records to be admitted as primary evidence.
- _Importance:_ Transforms software output from an informal advisory check into a court-ready prosecution dossier.

#### 5. Pre-Inference Real-Time Quality Gate

- _Why it is a gap:_ Field officers are not professional photographers; they frequently capture blurry, glared, or poorly framed photos, leading to OCR failure and frustration.
- _Evidence:_ Commercial tools fail silently or return garbled text on bad images.
- _Importance:_ Guides the officer in real-time to adjust lighting, distance, or angle _before_ saving the capture.

#### 6. 100% Offline Edge Field Operation

- _Why it is a gap:_ Wholesale markets (_mandis_), factory warehouses, and basement retail shops in India routinely suffer from poor cellular connectivity.
- _Evidence:_ Most contemporary AI startups rely entirely on cloud APIs (OpenAI, Google Cloud, AWS).
- _Importance:_ Ensures the tool is functional anywhere in India without recurring per-scan cloud API costs.

---

## 23. Innovation Opportunity Map

A structured innovation map categorizes opportunities across 9 functional dimensions.

| Innovation Dimension      | Concrete Innovation Concept                                                               | Target Problem Solved                                                      | Competitive Differentiator                                                  | Technical Difficulty | Feasibility for 6-Member Team | Core Risk & Mitigation                                                                   |
| :------------------------ | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- | :-------------------------------------------------------------------------- | :------------------: | :---------------------------: | :--------------------------------------------------------------------------------------- |
| **1. Technical**          | Planar homography metric scale calibration via standard reference card (ISO 7810 / ArUco) | Monocular scale ambiguity; inability to measure physical font height in mm | Delivers true $\text{mm}$ measurements rather than meaningless pixel counts |        Medium        |           **HIGH**            | _Risk:_ Reference marker placement. <br/>_Mitigation:_ Overlay visual guide in UI.       |
| **2. Product**            | Session-based 3D multi-panel package correlation state machine                            | False alarms caused by declarations placed on side/bottom panels           | Unifies all 6 faces into a single consolidated inspection session           |        Medium        |           **HIGH**            | _Risk:_ State explosion. <br/>_Mitigation:_ Bounded 6-face panel graph.                  |
| **3. Workflow**           | Real-time optical quality gate with interactive retake prompts                            | Garbage-in, garbage-out failure of downstream OCR pipelines                | Prevents processing unreadable images before inference starts               |       Low-Med        |           **HIGH**            | _Risk:_ Over-sensitive rejection. <br/>_Mitigation:_ Tuneable Laplacian thresholds.      |
| **4. Data**               | Deterministic procedural synthetic label rendering engine (`DS-SYNTH-001`)                | Total lack of public packaging datasets with millimeter ground truth       | Provides sub-pixel ground truth for font measurement testing                |        Medium        |           **HIGH**            | _Risk:_ Domain shift to real print. <br/>_Mitigation:_ Overlay real-world noise & glare. |
| **5. Explainability**     | Statutory finding breakdown linking measured deficits directly to Gazette GSR citations   | Black-box AI decisions that cannot be defended before a magistrate         | Every violation cites exact rule, table, column, and measured deficit       |       Low-Med        |           **HIGH**            | _Risk:_ Complex legal phrasing. <br/>_Mitigation:_ Pre-verified legal rule templates.    |
| **6. Legal / Compliance** | Temporal statutory epoch routing (non-retroactive rule evaluation)                        | Wrongful prosecution of older inventory under newly enacted amendments     | Resolves rule sets against package manufacturing date                       |       Low-Med        |           **HIGH**            | _Risk:_ Undated packages. <br/>_Mitigation:_ Default to date of inspection + flag.       |
| **7. UX / Mobile**        | High-contrast viewport overlay with real-time target bounding alignment                   | Inspector confusion regarding camera distance and lighting angles          | Intuitive smartphone viewfinder with HUD alignment aids                     |       Low-Med        |           **HIGH**            | _Risk:_ Mobile rendering lag. <br/>_Mitigation:_ Canvas-based lightweight UI.            |
| **8. Deployment**         | INT8 CPU-quantized local inference runtime (ONNX Runtime / OpenVINO)                      | Need for expensive GPUs or continuous 4G/5G network access in rural mandis | Runs on standard inspector laptops and edge devices                         |        Medium        |           **HIGH**            | _Risk:_ Quantization accuracy loss. <br/>_Mitigation:_ Evaluate PTQ vs FP32 baseline.    |
| **9. Reliability**        | Four-state statutory verdict output (`PASS`, `FAIL`, `REVIEW`, `NOT_APPLICABLE`)          | Binary AI overconfidence causing wrongful legal notices                    | Routes borderline cases to human inspector review                           |         Low          |           **HIGH**            | _Risk:_ Excessive `REVIEW` flags. <br/>_Mitigation:_ Calibrate uncertainty bands.        |

---

## 24. Efficiency & Performance Research

To achieve practical utility on edge devices carried by field officers, resource efficiency must be engineered into every stage of the pipeline.

```mermaid
graph LR
    subgraph Optimizations["Edge Optimization Vectors"]
        INT8["1. INT8 Quantization (ONNX / OpenVINO)<br/>• 2x to 4x throughput improvement on CPU<br/>• 75% memory footprint reduction"]
        RoI["2. Selective RoI Cropping<br/>• Run OCR only on text regions<br/>• Skip high-res background processing"]
        Async["3. Asynchronous Pipeline<br/>• Decouple camera capture from inference<br/>• Parallel multi-panel processing"]
        RuleCache["4. Memory-Mapped Rule Tables<br/>• Sub-millisecond rule lookups<br/>• Zero DB latency during field audit"]
    end
```

### Detailed Optimization Strategies

1. **Model Compression & Quantization (ONNX Runtime / OpenVINO):**
   - Converting FP32 PyTorch weights to INT8 via Post-Training Quantization (PTQ) reduces model size by $\sim 75\%$ (e.g., PaddleOCR detection model drops from $15\text{ MB}$ to $< 4\text{ MB}$).
   - Leverages Intel AVX-512 / VNNI and ARM NEON vector instructions, accelerating CPU inference from $350\text{ ms}$ down to $< 90\text{ ms}$ per panel.
2. **Selective Region-of-Interest (RoI) Processing:**
   - Instead of passing full $12\text{ MP}$ camera captures through the entire deep-learning pipeline, the system applies fast heuristic thresholding to locate the packaging boundary, crops the active label area, downsamples to $1080\text{p}$, and performs OCR only on localized text crops.
3. **Decoupled Asynchronous Session Architecture:**
   - Camera capture and preview run on the UI thread at $30\text{ FPS}$.
   - Captured panels are pushed to an asynchronous background worker queue. Quality gate filtering occurs in $< 10\text{ ms}$. Full text recognition and geometric rectification execute asynchronously while the officer turns the package to capture the next panel.

---

## 25. Robustness & Reliability Research

A field enforcement tool must remain robust under uncurated, real-world conditions. Reliability is achieved through **uncertainty-aware computing** and **graceful degradation**.

```mermaid
flowchart TD
    ExtractedMeasurement["Extracted Character Height: 2.45 mm ± 0.12 mm (PDP Area: 150 cm²)"]
    TableThreshold["Statutory Threshold: Minimum 2.50 mm"]

    CalcMargin{"Calculate Uncertainty Bounds:<br/>Lower: 2.33 mm | Upper: 2.57 mm"}

    CalcMargin -->|Upper < 2.50 mm| StrictFail["VERDICT: FAIL<br/>Clear statutory violation beyond uncertainty margin"]
    CalcMargin -->|Lower >= 2.50 mm| StrictPass["VERDICT: PASS<br/>Complies with statutory threshold beyond uncertainty margin"]
    CalcMargin -->|Interval Spans 2.50 mm| HumanReview["VERDICT: REVIEW<br/>Borderline case within measurement tolerance.<br/>Mandatory manual officer verification."]
```

### Robustness Architectures

1. **Uncertainty Margin Modeling ($\pm \delta$):**
   - Every physical measurement is accompanied by an uncertainty bound derived from camera calibration residuals, homography reprojection error, and pixel quantization:
     $$\delta = S \cdot \sqrt{\sigma_{\text{corner}}^2 + \sigma_{\text{edge}}^2}$$
   - If a measured character height is $2.45\text{ mm}$ with an uncertainty of $\pm 0.10\text{ mm}$, and the statutory threshold is $2.50\text{ mm}$, the measurement interval $[2.35, 2.55]\text{ mm}$ crosses the legal boundary. Rather than declaring a definitive `FAIL`, the system assigns a verdict of `REVIEW`, prompting the officer to verify manually with a physical ruler.
2. **Graceful Fallback on Missing Reference Target:**
   - If an officer captures a package without an ArUco or calibration card in frame, the system **does not crash or hallucinate a font height**. It automatically disables physical millimeter evaluations, marks dimensional rules as `REVIEW (NO_CALIBRATION_TARGET)`, and proceeds to evaluate non-dimensional rules (e.g., presence of MRP, USP ratio correctness, manufacturer details).
3. **Dual OCR Consensus Fallback:**
   - On low-confidence text regions ($\text{conf} < 0.65$), the system runs a secondary OCR pass using Tesseract v5 on an inverted, contrast-stretched binarized crop. If both engines agree on the string token, confidence is promoted; if they disagree, the token is flagged for officer confirmation.

---

## 26. Regulation Versioning Research

A core legal principle in Indian jurisprudence is that **statutory amendments are non-retroactive** unless explicitly stated by the legislature (Article 20(1), Constitution of India).

```mermaid
timeline
    title Indian Legal Metrology (Packaged Commodities) Regulatory Timeline
    2011 : Base Rules Promulgated<br/>(G.S.R. 202(E) dated 2011-03-07)<br/>Standard Rules 6, 7, 8, 9, 10
    2017 : Major Font Size Amendment<br/>(G.S.R. 629(E) dated 2017-06-23)<br/>Table-I Font Height Matrix Overhaul<br/>(Effective 2018-01-01)
    2021 : Unit Sale Price (USP) Mandate<br/>(G.S.R. 779(E) dated 2021-11-02)<br/>Rule 6(11) Mandatory USP<br/>(Effective 2022-12-01)
    2023 : Jan Vishwas Act Decriminalization<br/>(Act No. 18 of 2023)<br/>Section 36 Improvement Notice Introduced
    2026 : Present Enforcement Reality<br/>Packaging in market may span multiple manufacturing dates
```

### Architectural Implementation of Legal Versioning

1. **Immutable Regulatory Snapshots:**
   - Regulations are never represented as mutable database rows. They are stored as version-controlled, immutable specification files keyed by statutory commencement dates:
     - `rules_snapshot_2011_base.json` (Effective 2011-04-01)
     - `rules_snapshot_2017_font_amendment.json` (Effective 2018-01-01)
     - `rules_snapshot_2021_usp_amendment.json` (Effective 2022-12-01)
     - `rules_snapshot_2023_jan_vishwas.json` (Effective 2023-11-07)
2. **Temporal Rule Dispatcher:**
   - The system extracts the commodity's **Month & Year of Manufacture** ($\text{Date}_{\text{mfg}}$).
   - The temporal dispatcher routes the commodity feature vector to the exact rule snapshot that was legally binding on $\text{Date}_{\text{mfg}}$.
   - _Example:_ If a package has $\text{Date}_{\text{mfg}} = \text{10/2022}$, the engine evaluates it under `rules_snapshot_2017`, strictly skipping the Rule 6(11) Unit Sale Price mandate which took effect on `2022-12-01`.
3. **Auditability and Historic Invariant Testing:**
   - Unit tests must run regression suites ensuring that an inspection conducted in 2026 on a 2022 product produces the exact same legal verdict as an inspection conducted in 2022.

---

## 27. Candidate Technology Families

Based on empirical evidence and operational constraints, candidate technology families are shortlisted.

| Component Domain                  | Candidate Technology Families                                                                                                 | Technical Maturity | Evidence & Benchmarks                                 | Core Trade-offs & Analysis                                                                                                                                                                            | SIH Feasibility |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------------: | :---------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------: |
| **Object & Text Detection**       | **Candidate 1: DBNet / DBNet++** <br/>Candidate 2: RT-DETR <br/>_Rejected: Ultralytics YOLOv8/v11_                            |        High        | Liao et al. (AAAI 2020); widely deployed in PaddleOCR | **DBNet is a strong candidate because** it natively detects arbitrary-shaped scene text with polygonal bounds at high speed on CPU, avoiding the legal hazards of AGPL-licensed YOLO models.          |    **HIGH**     |
| **Optical Character Recognition** | **Candidate 1: PaddleOCR (PP-OCRv4)** <br/>Candidate 2: Tesseract v5 (Dual-pass) <br/>_Rejected: TrOCR, Donut_                |        High        | Du et al. (IJCAI 2022); ICDAR MLT benchmarks          | **PaddleOCR is a strong candidate because** it provides state-of-the-art multilingual accuracy on Indic and Latin scene text, small parameter footprint (~15MB), and permissive Apache 2.0 licensing. |    **HIGH**     |
| **Metric Scale & Calibration**    | **Candidate 1: Planar Homography + ArUco** <br/>Candidate 2: ISO 7810 Card Reference <br/>_Rejected: Monocular unassisted CV_ |        High        | Garrido-Jurado et al. (2014); OpenCV 4.x              | **ArUco / ISO 7810 homography is a strong candidate because** it mathematically resolves monocular scale ambiguity, enabling sub-millimeter physical measurement without expensive hardware.          |    **HIGH**     |
| **Information Extraction**        | **Candidate 1: Hybrid Regex + SpaCy NER** <br/>Candidate 2: LayoutLMv3 <br/>_Rejected: Raw LLM prompting_                     |        High        | SROIE & CORD benchmarks; standard NLP                 | **Hybrid Regex + NER is a strong candidate because** it guarantees 100% deterministic, court-admissible extraction of critical values (MRP, Dates, USP) while maintaining low CPU latency.            |    **HIGH**     |
| **Compliance Reasoning Engine**   | **Candidate 1: Declarative AST Rule Evaluator** <br/>Candidate 2: json-rules-engine <br/>_Rejected: RETE Drools, Rego_        |        High        | Standard production logic; Git-versioned JSON         | **Declarative AST is a strong candidate because** it executes in $< 1\text{ ms}$, produces exact statutory citations, enables seamless temporal versioning, and eliminates opaque AI hallucinations.  |    **HIGH**     |
| **Evidence & Cryptography**       | **Candidate 1: SHA-256 Merkle Provenance Graph** <br/>Candidate 2: Ed25519 Digital Signatures                                 |        High        | Section 63 BSA 2023; standard FIPS 180-4              | **SHA-256 Merkle DAG is a strong candidate because** it establishes an immutable, tamper-evident chain of custody from raw pixel capture to final PDF dossier, ensuring court admissibility.          |    **HIGH**     |
| **Inference Runtime**             | **Candidate 1: ONNX Runtime (CPU INT8)** <br/>Candidate 2: Intel OpenVINO                                                     |        High        | Microsoft / Intel production benchmarks               | **ONNX Runtime is a strong candidate because** it enables cross-platform CPU execution with 2x–4x quantization speedup, ensuring field operability on standard laptops without GPUs.                  |    **HIGH**     |

---

## 28. Technology Decision Matrix

The following decision matrix provides a side-by-side comparative analysis of candidate approaches across all critical capabilities.

| Functional Capability               | Approach A (Classical / Deterministic)                     | Approach B (Modern Permissive Deep Learning)     | Approach C (Heavy Transformer / GenAI)   | Strongest Evidence Base                       | Key Engineering Trade-off                                                                                              |
| :---------------------------------- | :--------------------------------------------------------- | :----------------------------------------------- | :--------------------------------------- | :-------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------- |
| **1. Panel / Packaging Detection**  | Canny edges + Contour approximation                        | **RT-DETR / Fast Instance Segmentation**         | Grounding DINO / SAM                     | Kirillov et al. (SAM); Baidu (RT-DETR)        | Approach B offers optimal balance: robust generalizability without Approach C's prohibitive latency.                   |
| **2. Text Detection**               | MSER (Maximally Stable Extremal Regions)                   | **DBNet++ (Differentiable Binarization)**        | SAM-Text / Mask2Former                   | Liao et al. (AAAI 2020); MMOCR                | Approach B (DBNet++) vastly outperforms classical MSER on noisy retail packaging.                                      |
| **3. Text Recognition (OCR)**       | Tesseract v5 (Line binarization + LSTM)                    | **PaddleOCR PP-OCRv4 (SVTR)**                    | TrOCR / Nougat                           | Du et al. (IJCAI 2022); ICDAR MLT             | Approach B provides multilingual Indic agility and CPU speed; Approach A retained as fallback.                         |
| **4. Metric Scale Calibration**     | **ArUco Fiducial / ISO Card Homography**                   | Monocular Depth Estimation (MiDaS/DepthAnything) | Stereo Vision / LiDAR                    | Garrido-Jurado (PR 2014); Hartley & Zisserman | **Approach A is the only mathematically rigorous solution** on single consumer cameras. Approach B lacks metric scale. |
| **5. PDP Surface Area Calculation** | **Geometric 2D Projection ($H \times W$ or $0.4\pi D H$)** | 3D NeRF / Gaussian Splatting                     | Manual operator measurement              | Legal Metrology Rules, Rule 5 & 7             | **Approach A directly aligns with statutory legal formulas**; Approach B is computationally unviable.                  |
| **6. Information Extraction (KIE)** | **Deterministic Regex + Proximity Graph**                  | LayoutLMv3 Token Classifier                      | Generative LLM (Few-Shot Prompting)      | SROIE benchmark; Section 63 BSA               | Approach A guarantees zero hallucination and court admissibility; Approach C carries unacceptable legal risks.         |
| **7. Readability / Quality Gating** | **Laplacian Variance + Glare Masking**                     | CNN Blur Classifier                              | LLM Visual Quality Assessment            | Mittal et al. (BRISQUE, TIP 2012)             | **Approach A executes in $< 10\text{ ms}$ on CPU**, acting as an instantaneous real-time capture gate.                 |
| **8. Compliance Rule Engine**       | **Declarative AST Temporal Rule Evaluator**                | RETE Algorithm (Drools)                          | LLM Policy Adjudication                  | Legal Metrology Gazette notifications         | **Approach A provides complete auditability**, zero runtime overhead, and strict temporal versioning.                  |
| **9. Evidence & Provenance**        | **SHA-256 Merkle DAG + Metadata Hash**                     | Centralized Relational DB Log                    | Public Ethereum / Hyperledger Blockchain | Section 63 BSA 2023; ISO 27037                | **Approach A satisfies statutory court standards** without the extreme complexity of Approach C.                       |
| **10. Edge Inference Runtime**      | Pure C++ Native Binary                                     | **ONNX Runtime (CPU INT8 Quantized)**            | Cloud API Gateway (REST/SaaS)            | Microsoft ONNX Benchmarks                     | **Approach B guarantees offline operation** on commodity inspector hardware with minimal footprint.                    |

---

## 29. What We Should NOT Build

A disciplined engineering strategy requires explicitly identifying and rejecting approaches that are over-engineered, data-hungry, computationally unviable, or legally hazardous.

```mermaid
graph TD
    subgraph RejectedArchitecture["EXPLICITLY REJECTED APPROACHES"]
        R1["❌ 1. End-to-End Generative VLM Compliance Arbiter<br/>(Hallucinates numbers, unexplainable in court, requires cloud GPUs)"]
        R2["❌ 2. Uncalibrated Monocular 'AI' Font Measurement<br/>(Violates projective geometry; mathematically impossible without scale anchor)"]
        R3["❌ 3. Automated Commercial E-Commerce Web Scraper<br/>(Violates terms of service; out of scope for physical packaged commodities)"]
        R4["❌ 4. Heavy Multi-View 3D Reconstruction (NeRF / 3D Gaussian Splatting)<br/>(Requires 50+ images and GPU training; unviable for 2-minute field inspection)"]
        R5["❌ 5. Proprietary Blockchain Ledger for Evidence<br/>(Massive over-engineering; SHA-256 cryptographic Merkle DAG satisfies Section 63 BSA)"]
        R6["❌ 6. AGPL-Licensed Detection Models (Ultralytics YOLOv8/v11)<br/>(Viral copyleft license creates legal and intellectual property liabilities for DoCA)"]
        R7["❌ 7. Autonomous Penalty Issuance System<br/>(Violates administrative law and natural justice; tool must remain human-in-the-loop)"]
    end
```

### Detailed Justification of Rejections

1. **End-to-End Generative AI (VLMs):** Prompting multimodal models to inspect labels and output legal verdicts violates basic administrative law principles. A magistrate cannot cross-examine a neural network, and prompt indeterminism means identical packaging inspected twice could yield conflicting verdicts.
2. **Uncalibrated Monocular Font Measurement:** Promising font measurement without a calibration target (ArUco or reference card) is scientifically fraudulent due to projective scale ambiguity.
3. **E-Commerce Web Crawling:** Crawling commercial retail platforms shifts the project away from physical Legal Metrology inspection and invites IP blocking and legal challenges from e-commerce operators.
4. **3D NeRF / Gaussian Splatting:** Capturing 50 overlapping angles and optimizing a volumetric neural radiance field requires minutes of high-end GPU compute, whereas a field officer needs a verdict within 60 seconds on a laptop.
5. **Blockchain Evidence Networks:** Blockchain adds decentralization where none is needed. Section 63 BSA 2023 requires proving data integrity and chain of custody, which is achieved with standard SHA-256 cryptographic hashes and PKI digital signatures.
6. **Ultralytics AGPL Models:** Deploying AGPLv3 software in government agency infrastructure creates viral open-source compliance liabilities.
7. **Autonomous Prosecution Issuance:** Under the Legal Metrology Act, statutory Improvement Notices and seizure compounding orders can only be issued by an authorized human officer who has exercised quasi-judicial discretion.

---

## 30. SIH-Specific Feasibility

The project must be realistically executable by a **6-member student engineering team** within the constraints of the Smart India Hackathon timeline.

```mermaid
pie title 6-Member Team Workload Feasibility Allocation
    "Member 1: Vision, Calibration & ArUco Metrology" : 18
    "Member 2: Multilingual OCR Pipeline (PaddleOCR / Tesseract)" : 18
    "Member 3: Information Extraction & Regex Normalizer" : 16
    "Member 4: Declarative Temporal Rule Engine & Gazette Specs" : 16
    "Member 5: Cryptographic Evidence Graph & PDF Dossier" : 16
    "Member 6: Cross-Platform UI (Guided Viewfinder & Review HUD)" : 16
```

### Feasibility Classification of Project Components

| Subsystem Component                         | Technical Complexity |  Team Feasibility Rating  | Justification & Execution Strategy for 6-Member Team                                                                                      |
| :------------------------------------------ | :------------------: | :-----------------------: | :---------------------------------------------------------------------------------------------------------------------------------------- |
| **Guided Capture UI & Viewfinder**          |        Medium        |   **HIGH FEASIBILITY**    | Modern web/mobile frameworks (React / React Native / Electron) provide camera stream access and SVG/Canvas HUD overlays.                  |
| **Optical Quality Gate (Blur/Glare)**       |         Low          |   **HIGH FEASIBILITY**    | Pure OpenCV algorithms (Laplacian variance, HSV mask); $< 50$ lines of robust, testable Python code.                                      |
| **ArUco Planar Homography Engine**          |        Medium        |   **HIGH FEASIBILITY**    | Native OpenCV module (`cv2.aruco`, `cv2.warpPerspective`). Well-documented mathematics, highly reliable in practice.                      |
| **Multilingual OCR Engine (PaddleOCR)**     |        Medium        |   **HIGH FEASIBILITY**    | Use pre-trained PP-OCRv4 weights exported to ONNX Runtime. Avoids expensive model training from scratch.                                  |
| **Statutory Entity Extraction Engine**      |        Medium        |   **HIGH FEASIBILITY**    | Modular regex rules paired with contextual proximity graphs. Straightforward to unit-test against synthetic labels.                       |
| **Declarative Statutory Rule Engine**       |        Medium        |   **HIGH FEASIBILITY**    | Abstract Syntax Tree evaluator in pure Python/TypeScript. Directly maps Gazette GSR clauses to boolean logic.                             |
| **Section 63 BSA Evidence Dossier**         |       Low-Med        |   **HIGH FEASIBILITY**    | Standard Python `hashlib` (SHA-256), `cryptography` library, and `reportlab` for clean PDF dossier generation.                            |
| **Edge CPU Optimization (ONNX INT8)**       |        Medium        |   **HIGH FEASIBILITY**    | Standard ONNX Runtime post-training quantization tools; well-supported tutorials and documentation.                                       |
| **Custom Deep-Learning Model Pre-training** |      Very High       |  ❌ **LOW FEASIBILITY**   | Pre-training a foundation vision model from scratch requires weeks of GPU compute and massive datasets. Replaced with pre-trained models. |
| **Cylindrical Mesh Surface Reconstruction** |         High         | 🟡 **MEDIUM FEASIBILITY** | Full 3D surface unwrapping is mathematically involved; mitigated by restricting metric checks to the vertical unwarped axis in MVP.       |

---

## 31. Candidate Future Building Blocks

Without finalizing the production architecture, research indicates that an optimal Legal Metrology compliance system comprises **10 modular building blocks**.

```mermaid
graph TD
    subgraph AcquisitionLayer["1. Ingestion & Quality Layer"]
        B1["BB-01: Guided Multi-Panel Ingestion UI<br/>(Interactive Viewfinder & Overlay Guidance)"]
        B2["BB-02: Pre-Inference Quality Gate<br/>(Real-Time Blur, Glare, & Framing Rejection)"]
    end

    subgraph PerceptionLayer["2. Optical Perception & Geometry Layer"]
        B3["BB-03: Planar Homography Metric Calibration Engine<br/>(ArUco / ISO Card Detection & Scale Derivation)"]
        B4["BB-04: Multilingual Scene Text Detection & OCR<br/>(Polygonal DBNet++ & Indic SVTR Recognizer)"]
        B5["BB-05: Principal Display Panel (PDP) Geometric Segmenter<br/>(Surface Area Computation under Rules 5 & 7)"]
    end

    subgraph SemanticLayer["3. Semantic & Regulatory Layer"]
        B6["BB-06: Statutory Entity Extractor & Normalizer<br/>(Deterministic Regex, Proximity Linking, Address NER)"]
        B7["BB-07: Temporal Statutory Compliance Rule Engine<br/>(Immutable GSR Snapshots & Legal Predicate Checker)"]
    end

    subgraph EvidentiaryLayer["4. Evidentiary & Presentation Layer"]
        B8["BB-08: Cryptographic Evidence Graph & Audit Logger<br/>(SHA-256 Merkle DAG conforming to Section 63 BSA 2023)"]
        B9["BB-09: Human-in-the-Loop Adjudication Interface<br/>(Side-by-Side Visual Review, Diffing, Officer Sign-Off)"]
        B10["BB-10: Statutory Dossier Generator & Central Analytics<br/>(Tamper-Evident PDF Export & eMaap Integration)"]
    end

    AcquisitionLayer --> PerceptionLayer
    PerceptionLayer --> SemanticLayer
    SemanticLayer --> EvidentiaryLayer
```

### Module Descriptions & Dependencies

1. **BB-01: Guided Multi-Panel Ingestion UI:** Manages the operator capture session. Enforces capturing all relevant exterior panels (Front, Back, Top, Bottom, Sides) before analysis.
2. **BB-02: Pre-Inference Optical Quality Gate:** Calculates sharpness and glare metrics on the raw frame. If quality falls below threshold, it immediately triggers `PROMPT_RETAKE`, preventing downstream errors.
3. **BB-03: Planar Homography Metric Calibration Engine:** Detects the coplanar calibration target, computes homography matrix $H$, rectifies perspective skew, and derives the metric scale factor $S$ ($\text{mm/pixel}$).
4. **BB-04: Multilingual Scene Text Detection & OCR:** Localizes character and word bounding polygons, transcribes text across English and Indic scripts, and associates each token with spatial polygon coordinates.
5. **BB-05: Principal Display Panel (PDP) Geometric Segmenter:** Identifies the front-facing packaging boundary, calculates surface area in $\text{cm}^2$ using statutory geometry formulas, and establishes the Table-I font-height threshold.
6. **BB-06: Statutory Entity Extractor & Normalizer:** Parses raw tokens into structured fields (MRP, Net Qty, Mfg Date, Expiry, USP, Manufacturer Details, Consumer Care).
7. **BB-07: Temporal Statutory Compliance Rule Engine:** Resolves the appropriate legal snapshot based on manufacturing date and evaluates extracted facts against machine-readable statutory rules.
8. **BB-08: Cryptographic Evidence Graph & Audit Logger:** Computes SHA-256 hashes of all raw photos, bounding crops, extracted text, and measurement vectors into an immutable Merkle Directed Acyclic Graph (DAG).
9. **BB-09: Human-in-the-Loop Adjudication Interface:** Displays extracted findings overlaid on the original packaging photo, highlights detected violations with measured millimeter deficits, and mandates human officer confirmation.
10. **BB-10: Statutory Dossier Generator & Central Analytics:** Generates tamper-evident, digitally signed PDF inspection dossiers and formats structured JSON payloads for future eMaap integration.

---

## 32. Key Insights

Direct synthesis of the 13 core investigative questions:

1. **What already exists?** Administrative web portals for licensing (eMaap) and consumer complaint logging (NCH); pre-print digital vector artwork proofreaders (Artwork Flow); high-speed industrial conveyor vision rigs (Cognex, Keyence).
2. **What is already solved well?** 2D multilingual scene text detection and recognition on flat surfaces (PaddleOCR PP-OCRv4); planar camera pose and fiducial calibration (OpenCV ArUco); cryptographic hashing for digital chain of custody (SHA-256).
3. **What is partially solved?** Key Information Extraction (KIE) on structured documents; image blur and glare quality gating; Indic language script identification.
4. **What remains weak?** Reading tiny, low-contrast ink-jet dot-matrix text on reflective packaging; automated spatial grouping of multi-line manufacturer addresses without human error; cylindrical label dewarping under uncalibrated smartphone captures.
5. **What is genuinely difficult?** Deriving certified, sub-millimeter physical character heights from single smartphone photos in real-world retail lighting without specialized hardware.
6. **Where is the biggest data gap?** Zero public datasets link packaging images to physical vernier-caliper ground-truth measurements and Indian statutory compliance labels.
7. **Where is the biggest technology gap?** Lack of an integrated, offline-capable mobile inspection platform combining planar optical calibration, multilingual OCR, and a non-retroactive statutory rule engine.
8. **Where is the biggest legal/compliance risk?** Retroactive application of legal amendments; generating false positive violation notices against compliant brands; presenting unhashed, legally inadmissible digital evidence in court.
9. **Where is the biggest AI risk?** Unconstrained Generative AI / VLM hallucination altering statutory numbers (e.g., misreading MRP) or inventing fictitious legal non-compliances.
10. **Where is the biggest deployment risk?** Requiring continuous high-speed cloud connectivity or expensive GPU workstations in rural wholesale markets and warehouse basements.
11. **Where could our eventual solution differentiate?** Providing a court-admissible, offline-capable field inspection tool that delivers certified sub-millimeter font height measurements and deterministic statutory violation dossiers.
12. **Which approaches deserve deeper investigation in Phase 3?** Hybrid Perception-Verification architecture; Planar homography via ArUco / ISO 7810 targets; ONNX INT8 CPU-quantized PaddleOCR pipeline; Declarative AST temporal rule engines; Section 63 BSA Merkle DAG evidence logging.
13. **Which approaches should we reject?** Pure end-to-end Generative AI / VLMs; uncalibrated monocular font guessing; commercial e-commerce web scraping; AGPL-licensed models (YOLOv8/v11); proprietary blockchain networks.

---

## 33. Inputs for Phase 3 — Optimized Solution Design

Phase 2 establishes the following verified inputs to govern Phase 3 (Architecture & Implementation Design):

```mermaid
graph TD
    subgraph InputsForPhase3["Phase 3 Design Foundations"]
        F1["A. Confirmed Legal Scope: Rules 6, 7 (Table-I), 8, 9, 11-13, Jan Vishwas 2023"]
        F2["B. Core Engine Paradigm: Hybrid Perception-Verification (DL Perception + Deterministic Rules)"]
        F3["C. Calibration Standard: Planar Homography with Coplanar Reference Target (±0.15 mm target)"]
        F4["D. Primary AI Stack: ONNX Runtime (INT8 CPU), PaddleOCR PP-OCRv4, OpenCV 4.x"]
        F5["E. Data Strategy: Synthetic Procedural Math (DS-SYNTH) + 50 Calibrated Field SKUs"]
        F6["F. Legal Versioning: Immutable Temporal GSR Rule Snapshots (2011, 2017, 2021, 2023)"]
        F7["G. Evidence Standard: Section 63 BSA 2023 Cryptographic Merkle DAG & Signed PDF Dossier"]
        F8["H. Operational Constraint: 100% Offline Field Execution on Commodity x86/ARM CPUs"]
    end
```

### Questions That Phase 3 Must Answer

1. _UI Framework Selection:_ Should the field tool be structured as a cross-platform Progressive Web App (PWA) with WebAssembly / WebGL execution, or an Electron/Desktop client paired with an Android native wrapper?
2. _Cylindrical Surface Handling:_ What is the exact mathematical boundary where cylindrical dewarping must be applied versus restricting measurements to the vertical unwarped axis?
3. _Calibration Target Form Factor:_ Should the system standardize on a printed ArUco target, a downloadable PDF card, or standard ISO/IEC 7810 ID-1 cards (e.g., driver's license / credit card dimensions) commonly carried in an officer's wallet?
4. _Data Synchronization Architecture:_ How should offline field inspection dossiers synchronize with central state databases when the officer returns to network coverage?

---

## 34. Open Questions Remaining

| Question ID   | Category                 | Specific Unresolved Question                                                                                                              | Current Evidence / Status                                                                    | Planned Resolution Path in Phase 3                                                                                                             |
| :------------ | :----------------------- | :---------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q-OPEN-01** | Legal / Operational      | Does DoCA or any State Controllerate have an existing standardized digital schema for inspection reports?                                 | No public API or schema published on eMaap.                                                  | Design an open, extensible JSON schema conforming to statutory Form 1 notice structures.                                                       |
| **Q-OPEN-02** | Hardware / Optical       | What is the minimum camera sensor resolution required to measure a $1.0\text{ mm}$ numeral with $< 5\%$ error at $20\text{ cm}$ distance? | Preliminary optical math suggests $\ge 12\text{ MP}$ with macro capability.                  | Conduct empirical resolution benchmark across commodity smartphone cameras.                                                                    |
| **Q-OPEN-03** | Statutory Interpretation | Under Rule 6(1)(a), what exact minimum address tokens constitute a legally valid "complete address" for prosecution?                      | Court judgments vary on whether PIN code + City suffices or full street address is required. | Model address validation with two severity tiers: `STRICT_STATUTORY` and `COMMERCIAL_STANDARD`.                                                |
| **Q-OPEN-04** | Field Usability          | Will field officers reliably carry and place a physical calibration card alongside packages during surprise market inspections?           | Operational friction concern.                                                                | Design dual-mode system: Calibrated mode (certified mm measurement) and Uncalibrated mode (declaration presence and price ratio verification). |

---

## 35. Master Research Evidence Table

| Claim / Finding                              | Empirical & Literature Evidence                                                                         | Source & Identifier                                                                    | Source Tier | Verification Date |         Confidence          | Practical Implication for SIH26034                                                               |
| :------------------------------------------- | :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------- | :---------: | :---------------: | :-------------------------: | :----------------------------------------------------------------------------------------------- |
| **eMaap lacks automated inspection**         | Direct portal inspection; official circulars confirm licensing and registration workflow only.          | Department of Consumer Affairs (`https://emaap.gov.in/`)                               | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Validates that SIH26034 fills an absolute government enforcement void.                           |
| **Monocular metric ambiguity theorem**       | Fundamental projective geometry: $x \sim K[R \mid t]X$ is defined up to scale factor $\lambda$.         | Hartley & Zisserman, _Multiple View Geometry in Computer Vision_, Cambridge Univ Press | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Mandates physical calibration reference target; disproves unassisted font guessing.              |
| **Planar homography accuracy under tilt**    | ArUco system achieves sub-millimeter pose estimation under up to $30^\circ$ perspective tilt.           | Garrido-Jurado et al., _Pattern Recognition_ 47(6), 2014                               | **Tier 2**  |    2026-09-04     | **Verified Primary (100%)** | Confirms ArUco / planar homography as the scientific core of physical font measurement.          |
| **DBNet real-time arbitrary text detection** | Achieves $82.8\%$ F-measure at $62\text{ FPS}$ on ICDAR 2015 via differentiable binarization.           | Liao et al., _AAAI Conference on Artificial Intelligence_, 2020                        | **Tier 2**  |    2026-09-04     | **Verified Primary (100%)** | Approves DBNet as primary text boundary detection backbone.                                      |
| **SVTR single-model text recognition**       | Achieves SOTA text recognition without recurrent LSTM layers, reducing CPU latency.                     | Du et al., _IJCAI Proceedings_, 2022                                                   | **Tier 2**  |    2026-09-04     | **Verified Primary (100%)** | Approves PaddleOCR PP-OCRv4 recognizer for high-speed edge text transcription.                   |
| **Jan Vishwas Act 2023 amendment**           | Act No. 18 of 2023 decriminalized minor LMPC offenses; mandates Section 36 Improvement Notices.         | The Gazette of India, Extraordinary, Part II, Section 1, Act No. 18 of 2023            | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Rule engine must recommend statutory Improvement Notice rather than immediate court prosecution. |
| **Section 63 BSA 2023 electronic evidence**  | Supersedes Section 65B of Evidence Act; requires cryptographic hash, metadata, and custody certificate. | Bharatiya Sakshya Adhiniyam, 2023, Section 63                                          | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Inspection reports must include SHA-256 Merkle hashes and tamper-evident digital certificates.   |
| **Table-I statutory font height rules**      | G.S.R. 629(E) dated 2017-06-23 establishes 1.0 to 6.0 mm character heights based on PDP area.           | The Gazette of India, G.S.R. 629(E) / G.S.R. 1373(E) Corrigendum                       | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Establishes the exact mathematical compliance thresholds for the rule engine.                    |
| **Ultralytics AGPLv3 copyleft restriction**  | Ultralytics YOLOv8/YOLOv11 repository explicitly licensed under GNU AGPLv3.                             | Ultralytics GitHub Repository (`ultralytics/ultralytics`)                              | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Strict policy prohibition against using YOLOv8/v11 in the codebase.                              |
| **Non-retroactivity of legal amendments**    | Article 20(1) Constitution of India prohibits retrospective penalties for past acts.                    | Constitution of India, Article 20(1); landmark Supreme Court rulings                   | **Tier 1**  |    2026-09-04     | **Verified Primary (100%)** | Mandates temporal rule snapshotting based on package manufacturing date.                         |

---

## 36. Research Quality Audit

Before finalizing this Phase 2 research report, the following quality and integrity checklist was executed:

- [x] **Government systems researched from official primary sources:** Verified eMaap (`emaap.gov.in`), BIS Care, NCH, and FoSCoS from primary government portals and press releases.
- [x] **Legal claims trace to authentic Gazette notifications:** Verified Legal Metrology Act 2009, LMPC Rules 2011, G.S.R. 629(E) (2017), G.S.R. 779(E) (2021), Jan Vishwas Act (2023), and Section 63 BSA (2023).
- [x] **Commercial packaging tools verified:** Documented capabilities and limitations of Artwork Flow, GlobalVision, Cognex, Keyence, EyeC, OpenFoodFacts, and Omron.
- [x] **Academic literature cited with full bibliographic rigor:** Included primary citations, authors, DOIs/venues, methods, and metrics for DBNet (AAAI 2020), SVTR (IJCAI 2022), TrOCR (AAAI 2023), LayoutLMv3 (ACM MM 2022), and ArUco (Pattern Recognition 2014).
- [x] **Dataset availability and licensing verified:** Categorized BSTD, IndicSTR12, OpenFoodFacts, and Total-Text with exact licenses and identified the Ground Truth Caliper Gap.
- [x] **Licensing compliance enforced (Anti-AGPL Policy):** Explicitly rejected AGPL-licensed models (Ultralytics YOLOv8/v11) to safeguard government deployment integrity.
- [x] **Technical capabilities not exaggerated:** Mathematically demonstrated why uncalibrated monocular font measurement is impossible and established planar homography with reference targets as the only valid method.
- [x] **Real-world retail failure modes analyzed:** Detailed failure mechanisms for foil glare, cylindrical perspective distortion, low contrast, and floating decimal points.
- [x] **Multilingual Indic context addressed:** Evaluated Devanagari script complexities, numeral systems, unit abbreviations, and PaddleOCR Indic performance.
- [x] **Past hackathon anti-patterns exposed:** Identified why typical SIH submissions fail (e-commerce scraping, uncalibrated pixel counting, black-box ChatGPT wrappers).
- [x] **White-space opportunities empirically validated:** Grounded 6 distinct white spaces in verifiable market and legal gaps.
- [x] **Premature design strictly avoided:** Kept the focus on evaluating technology families and trade-offs rather than finalizing architecture or writing production code.
- [x] **All claims accompanied by evidence and confidence ratings:** Assembled the Master Research Evidence Table with Source Tiers and verification timestamps.

---

**End of Phase 2 Comprehensive Research Report.**  
_Ready for Phase 3: "Design the Optimized Solution."_
