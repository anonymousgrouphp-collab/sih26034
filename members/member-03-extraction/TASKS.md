# Member 3 Tasks — Semantic Extraction & NLP
**Assigned Engineer:** **Harsh Patel** ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab))  
**Branch:** `feat/m3-extraction`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & Regex Normalizers
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define OCR input test fixtures representing legal declarations.
- [x] Implement deterministic regex parsers for MRP, currency, and tax inclusion clause.
- [x] Implement net quantity regex parser and unit extraction.

### Day 2: Banned Units, USP & Devanagari Numerals
- [x] Implement prohibited metric symbol detector (`gms`, `gm`, `Kgs`, `ML`, `ltrs`) per Section 11 / Rule 12.
- [x] Implement Unit Sale Price (USP) extractor with unit normalization.
- [x] Implement Devanagari digit converter mapping Indic characters (०..९) to decimal values.
- [x] Write unit tests for banned units and USP extraction (`TS-UNIT-01`, `TS-UNIT-02`, `TS-UNIT-03`).

### Day 3: Postal Address & Consumer Care Completeness
- [x] Implement Indian postal address extractor matching State + 6-digit PIN code.
- [x] Implement Consumer Care 4-tuple parser (contact person/department, address, phone regex, email regex).
- [x] Implement Country of Origin detector ("Made in ...", "Country of Origin: ...").
- [x] Write unit tests verifying missing email detection (`TS-UNIT-09`).

### Day 4: Spatial Graph Linking, Golden Fixtures & DoD
- [x] Implement 2D spatial proximity key-value linking (K-D Tree or nearest-neighbor) to link labels like "Net Wt" with "150 g".
- [x] Verify Exact Field Match $\ge 95\%$ on synthetic fixtures.
- [x] Complete Definition of Done checklist.
- [x] Update `progress.md` and `memory.md`.

### Senior SDE & CTO Hardening & Verification
- [x] Fix word boundary bugs for dotted banned units (`g.m.`, `g.m.s.`, `c.c.`, `ltr.`).
- [x] Fix MRP comma truncation bug (`Rs. 1,499.00` parsed as `1499.0`).
- [x] Fix intermediate tax clause extraction in MRP (`MRP (incl. of all taxes) Rs. 250`).
- [x] Implement multi-line address block aggregation preventing false Rule 6(1)(a) incomplete address flags.
- [x] Guard Consumer Care against 14-digit FSSAI numbers and barcodes.
- [x] Add commercial city-to-state and PIN-prefix-to-state mapping (OQ-02).
- [x] Add complete units suite: mass, volume, length, area, and count (`N`, `U`, `units`).
- [x] Support OCR spaced slash dates (`04 / 2024`) and named month formats (`15-Mar-2024`).
- [x] Support Unicode accented brand names (e.g. `Nestlé`).
- [x] Fix PIN code word-boundary check against false matches on words ending in `rs` (e.g. `Traders`).
- [x] Fix country of origin period truncation (`U.S.A.` -> `USA`, `P.R.C.` -> `China`).
- [x] Restrict horizontal line clustering gap to `-20px` to preserve multi-column isolation.
- [x] Implement `MANUFACTURER_AND_PACKER` joint statutory roles per Rule 6(1)(a).
- [x] Support Devanagari Hindi metric units (`ग्राम`, `मिली`, `लीटर`) and vulgar fractions (`½`, `¼`, `1/2`).
- [x] Implement Rule 6(1)(b) Generic Name parsing.
- [x] Propagate optical calibration `px_to_mm` to `ExtractedFieldDTO.measured_font_height_mm`.
- [x] Multi-pack parsing under Rule 24: calculate total quantity, capture count and piece magnitude, disallow multiplication operator as unit.
- [x] Corporate Email & URL Domain Defense: mask emails and URLs preventing false banned unit accusations under NFR-06.
- [x] Corporate Entity & Title GM Defense: prevent uppercase GM (e.g. GM Foods Ltd, GM Operations) from triggering prohibited unit violations.
- [x] Tax Inclusivity Robustness: support OCR-truncated 'inc.' and GST declarations in addition to all-taxes clauses.
- [x] USP Unit Standardization: normalize Devanagari Hindi units (ग्राम, किग्रा, मिली) and count units (N, unit) with rate denominators.
- [x] Consumer Care Extraction: extract actual redressal address lines and contact titles rather than static placeholders.
- [x] Pydantic Contract Year Guard: clamp manufacturing year to <= 2030 per NormalizedCommodityFacts schema.
- [x] Member 1 Calibration Synergy: direct injection of CalibrationDTO and CalibrationResult, propagating physical millimeter heights and measurement confidence for Member 4 Table-I compliance.
- [x] Hindi Gazette Statutory Terminology: support निवल मात्रा, निवल सामग्री, इकाई विक्रय मूल्य, and वस्तु का नाम.
- [x] Origin Address Prefix Anchors: support "Manufactured in India/Bharat by" and "Packed in India/Bharat by".
- [x] FMCG Industrial Hubs: add Kanchipuram, Hosur, Thiruvallur, Sri City, Sanand, Bhiwadi, Sonipat, Panipat.
- [x] Expand test suite to 90 comprehensive deterministic tests passing 100% (and 153 full repo tests passing with zero regressions).
- [x] Phase 4: Evidentiary defense against Latin abbreviations (e.g. with milk) and tech acronyms (AI/ML) in detect_banned_units (NFR-06 0.0% false accusation rate).
- [x] Phase 4: Fix Regd. Off and Registered Office PIN code extraction by scoping disallowed prefix to explicit registration numbers (reg no, lic no).
- [x] Phase 4: Guard Country of Origin against Hindi State names ending in 'प्रदेश' (उत्तर प्रदेश, मध्य प्रदेश) by requiring official Gazette terms (मूल देश, उत्पत्ति का देश) and fallback sanity validation.
- [x] Phase 4: Add LMPC Second Schedule count units (pair, pairs, sheet, sheets, wipe, wipes, set, sets, roll, rolls) normalized to standard unit "N".
- [x] Phase 4: Add dot-matrix inkjet printed date formats (04.2024) and standalone ISO formats (2024-05) to date fallback parser.
- [x] Phase 4: Support Customer Support Desk and Consumer Complaints Cell in Consumer Care contact department extraction.
- [x] Phase 4: Add 2D vertical spatial proximity linking and MRP priority regex for Gazette Hindi statutory declarations.
- [x] Phase 4: Expand Member 3 test suite to 98 tests passing 100% (and 161 full repo tests passing with zero regressions).
- [x] Phase 5: Implement E-Commerce Single Listing & HTML DOM Ingestion under ADL-10 and FR-14/15 in `extractor.py` without requiring OCR DTOs.
- [x] Phase 5: Implement Rule 6(10) Manufacturing Date Exemption annotator in `extract_ecommerce()` for digital marketplace compliance.
- [x] Phase 5: Decouple statutory tax inclusivity verification into standalone `StatutoryDeclarationParser.has_tax_inclusive_clause()` helper for split-line declarations.
- [x] Phase 5: Add high-precision 3-digit PIN code mapping for Union Territory of Ladakh (194xxx) and cities Leh, Kargil, and Kavaratti (Lakshadweep).
- [x] Phase 5: Expand address prefix anchors to support composite packaging titles: `Processed & Packed by`, `Formulated & Packed by`, `Marketed & Distributed by`, `Works:`, `Factory:`.
- [x] Phase 5: Support parenthesized STD telephone codes (e.g. `(022) 2831-8888`, `(011) 2345-6789`) in Consumer Care parsing.
- [x] Phase 5: Normalize mixed vulgar fractions in net quantity (e.g. `1 ½ kg` -> `1.5 kg`, `2 ½ g` -> `2.5 g`).
- [x] Phase 5: Expand Member 3 test suite to 106 tests passing 100% (and 169 full repo tests passing with zero regressions).


