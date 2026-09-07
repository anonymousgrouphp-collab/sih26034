# Member 3 Tasks — Semantic Extraction & NLP
**Assigned Engineer:** **Harsh Patel** ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab))  
**Branch:** `feat/m3-extraction`

## Sprint Checklist (07–13 September 2026)

### Day 1: Foundations, Fixtures & Regex Normalizers
- [x] Read `AGENTS.md` and required reading documents.
- [x] Create directory structure: `fixtures/`, `tests/`, `src/`.
- [x] Define OCR input test fixtures representing legal declarations.
- [ ] Implement deterministic regex parsers for MRP, currency, and tax inclusion clause.
- [ ] Implement net quantity regex parser and unit extraction.

### Day 2: Banned Units, USP & Devanagari Numerals
- [ ] Implement prohibited metric symbol detector (`gms`, `gm`, `Kgs`, `ML`, `ltrs`) per Section 11 / Rule 12.
- [ ] Implement Unit Sale Price (USP) extractor with unit normalization.
- [ ] Implement Devanagari digit converter mapping Indic characters (०..९) to decimal values.
- [ ] Write unit tests for banned units and USP extraction (`TS-UNIT-01`, `TS-UNIT-02`, `TS-UNIT-03`).

### Day 3: Postal Address & Consumer Care Completeness
- [ ] Implement Indian postal address extractor matching State + 6-digit PIN code.
- [ ] Implement Consumer Care 4-tuple parser (contact person/department, address, phone regex, email regex).
- [ ] Implement Country of Origin detector ("Made in ...", "Country of Origin: ...").
- [ ] Write unit tests verifying missing email detection (`TS-UNIT-09`).

### Day 4: Spatial Graph Linking, Golden Fixtures & DoD
- [ ] Implement 2D spatial proximity key-value linking (K-D Tree or nearest-neighbor) to link labels like "Net Wt" with "150 g".
- [ ] Verify Exact Field Match $\ge 95\%$ on synthetic fixtures.
- [ ] Complete Definition of Done checklist.
- [ ] Update `progress.md` and `memory.md`.
