---
name: legal-metrology-semantic-invariants
description: Statutory extraction invariants, evidentiary defense rules, and Python runtime guidelines for NyayaDrishti-LM
trigger: always_on
---

# Legal Metrology Semantic Invariants & Evidentiary Defense Standards

## 1. Python Environment Enforcement (Windows Host)
- Always execute Python tools and pytest suites using the project-configured Python 3.13 binary:
  `& "C:\Users\ceoha\AppData\Local\Programs\Python\Python313\python.exe" -m pytest <args>`
- Never use naked `python` on this host, as it resolves to Python 3.14 which lacks `pytest` and required dependencies.

## 2. Section 63 BSA 2023 Evidentiary Defense (0.0% False Accusation Rate)
In digital statutory compliance enforcement, false accusations violate Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023) and trigger immediate judicial dismissal:
- **Latin Abbreviations Defense:** Always mask Latin abbreviations containing periods or unit letters (`e.g.`, `i.e.`, `etc.`) before scanning for banned units to prevent `g.` from falsely flagging serving suggestions (e.g. `with milk`).
- **Tech Acronyms Defense:** Always mask modern technology descriptors (`AI/ML`, `ML/AI`, `Machine Learning`) to prevent uppercase `ML` (Mega-Litre) violation flags on smart IoT packaging.
- **Corporate Entity Defense:** Never flag uppercase `GM` as prohibited unit unless accompanied by an explicit numeric quantity or rate denominator; always mask corporate suffixes (`GM Foods`, `GM Operations`, `Non-GM`).

## 3. Indic Script & Vernacular Text Boundaries
- Never use loose suffix patterns such as naked `देश` in regexes, because Indian states such as `उत्तर प्रदेश` or `मध्य प्रदेश` end with `देश` and will falsely leak the address city into `country_of_origin`.
- Always require statutory Gazette terms (`मूल\s*देश|उत्पत्ति\s*का\s*देश`) and use script boundaries `(?<![a-zA-Z\u0900-\u097F])`.
- Indic vowel signs (matras, e.g. `ी` in `मिली`) belong to Unicode category `Mc` (non-word). Word boundary `\b` fails across matras; use `(?!\w|[\u0900-\u097F])` for Indic boundaries.

## 4. Address Entity & PIN Code Invariants (Working Default OQ-02)
- **Registered Office PINs:** Never disallow `regd?` naively in PIN code prefix scans. Require explicit registration number keywords (`reg no`, `lic no`) to preserve valid manufacturer addresses like `Regd Off: Bengaluru 560001`.
- **City Precedence Over Shared PIN Prefixes:** In India, postal divisions frequently cross state boundaries (e.g., prefix `396` covers both Valsad, Gujarat and Silvassa, DNH; prefix `682` covers Kochi, Kerala and Lakshadweep). Explicit city names in text must always take precedence over 3-digit PIN prefix fallbacks.

## 5. E-Commerce Single Listing Inspections (ADL-10 & Rule 6(10))
- **Flexible Ingestion:** Extractor pipelines must accept raw plain text strings and HTML DOM snippets without requiring pre-tokenized bounding boxes.
- **Rule 6(10) Statutory Exemption:** Under Rule 6(10) / GSR 594(E), digital marketplace listings are statutory exempt from declaring the date of manufacture. The system must record an archival statutory exemption entry rather than flagging a missing declaration as a non-compliance violation.
- **Decoupled Tax Inclusivity:** Tax inclusivity verification must be decoupled from price parsing to allow verification across split-line packaging where price and the tax clause appear on separate lines.
