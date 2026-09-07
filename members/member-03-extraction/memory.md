# Permanent Working Memory — Member 3 (Semantic Extraction & NLP)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that generative LLMs hallucinate numbers on packaging declarations (e.g. converting ₹48 to ₹40) and make non-deterministic predictions unacceptable under Section 63 BSA electronic evidence rules.

### Evidence
`05_TECHNOLOGY_DECISION_RECORD.md` (ADR-04), `16_DECISION_LOG.md` (ADL-04), and `CLAIMS_WE_MUST_NOT_MAKE.md`.

### Decision
Rely 100% on deterministic regex token matching, Indic numeral conversion tables, and 2D spatial proximity graphs. Generative AI is strictly forbidden from inferring missing legal values.

### Why
Ensures mathematical reproducibility and legal auditability: the same OCR token input will produce the exact same normalized commodity facts 100 out of 100 times.

### Impact
Zero legal hallucinations and court-admissible extraction pipeline.

### Status
ACTIVE
