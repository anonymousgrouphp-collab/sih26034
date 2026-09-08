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
- [x] Expand test suite to 84 comprehensive deterministic tests passing 100% (and 147 full repo tests passing).

