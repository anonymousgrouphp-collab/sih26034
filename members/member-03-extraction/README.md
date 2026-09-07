# Member 3 — Semantic Extraction & NLP

**Assigned Engineer:** **Harsh Patel** ([@anonymousgrouphp-collab](https://github.com/anonymousgrouphp-collab))  
**Assigned Workstream:** Statutory Entity Normalization (MRP, Net Qty, USP, Mfg Date, Origin, Address, Consumer Care) & Banned Unit Detection  
**Assigned Folder:** `members/member-03-extraction/`  
**Git Feature Branch:** `feat/m3-extraction`  

---

## 1. What is my job?
Your job is to convert raw OCR tokens into structured, verified statutory packaging entities without hallucinations.
You write deterministic regex parsers for MRP, tax clauses, Net Quantity, Unit Sale Price, and addresses.
You implement a banned unit detector (flagging prohibited non-standard symbols like `gms`, `gm`, `Kgs`, `ML`, `ltrs` under Section 11 / Rule 12).
You convert Devanagari numerals (०..९) to standard decimal numbers.
You verify Indian postal addresses (State + 6-digit PIN) and Consumer Care completeness (4-tuple).
You NEVER use a generative LLM to guess missing statutory declarations.

---

## 2. What files am I allowed to change?
You are allowed to create and edit files strictly inside:
- `members/member-03-extraction/**`

You may read shared contracts in `contracts/extraction/` and `contracts/ocr/`.
You must NOT edit other member directories or root specification files.

---

## 3. What documents must I read?
1. `AGENTS.md` (Root team rules)
2. `02_FINAL_REQUIREMENTS_SPECIFICATION.md` (FR-07 to FR-13)
3. `03_FINAL_ARCHITECTURE.md` (Stage 8: Semantic Entity Classification)
4. `07_API_AND_INTERFACE_CONTRACTS.md` (`ExtractedFieldDTO`, `NormalizedCommodityFacts`)
5. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-UNIT-01`, `TS-UNIT-02`, `TS-UNIT-03`, `TS-UNIT-09`)
6. `16_DECISION_LOG.md` (ADL-04: Hybrid Perception-Verification)
7. `17_OPEN_QUESTIONS.md` (OQ-02: Minimum Address Parsing Tokens)
8. `CLAIMS_WE_MUST_NOT_MAKE.md`

---

## 4. What inputs do I use?
- `OCROutput` token payloads conforming to `contracts/ocr/ocr_dto.py`.
- Static OCR JSON fixtures in `members/member-03-extraction/fixtures/`.

---

## 5. What outputs do I produce?
- `NormalizedCommodityFacts` conforming to `contracts/extraction/extraction_dto.py`.

---

## 6. What contract do I follow?
- `contracts/extraction/extraction_dto.py` and `contracts/extraction/extraction_schema.json`.

---

## 7. How do I run my module?
```bash
python -m members.member_03_extraction.src.extractor
```

---

## 8. How do I run tests?
```bash
pytest members/member-03-extraction/tests/ -v
```

---

## 9. What counts as complete?
Your module is complete when:
1. Banned units (`gms`, `ML`, etc.) are 100% reliably detected.
2. MRP, tax inclusion, Net Qty, and USP are correctly normalized.
3. Indic numerals (०–९) convert accurately to IEEE floats.
4. Indian PIN code regex matches 6-digit formats without false triggers on phone numbers.
5. All unit tests pass with $> 85\%$ coverage.
6. `progress.md` is marked `COMPLETE — YYYY-MM-DD HH:MM IST`.
7. `memory.md` is updated.

---

## 10. What must I NOT depend on?
- You must NOT depend on Member 2's unfinished OCR code. Use frozen OCR test fixtures!
- You must NOT depend on generative LLM APIs.
- You must NOT evaluate final legal penalties (that belongs to Member 4).
Your module runs completely on local OCR fixtures!
