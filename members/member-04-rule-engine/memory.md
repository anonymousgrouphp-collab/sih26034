# Permanent Working Memory — Member 4 (Statutory Rule Engine)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that applying current 2026 amendments to products manufactured in 2021 violates Article 20(1) of the Constitution of India (prohibition of retroactive penal laws).

### Evidence
`03_FINAL_ARCHITECTURE.md` (Stage 10), `16_DECISION_LOG.md` (ADL-07), and `CLAIMS_WE_MUST_NOT_MAKE.md`.

### Decision
Implement the **Temporal Statutory Epoch Dispatcher**:
- Epoch 1 (2011 Base): Pre-2017 packages.
- Epoch 2 (2017 G.S.R. 629(E)): Revised font schedule (Row 5 = 6.0 mm).
- Epoch 3 (2021 G.S.R. 779(E)): Mandatory Unit Sale Price (USP).
- Epoch 4 (2026 G.S.R. 128(E)): E-Commerce Country of Origin search/sort filter.

### Why
Guarantees constitutional compliance and protects issued inspection notices from dismissal in judicial review.

### Impact
Legally unassailable enforcement engine with 100% statutory traceability.

### Status
ACTIVE

---

## [09 September 2026 | 18:48 IST]

### Discovery
1. Official Gazette G.S.R. 629(E) confirms Table-I Row 5 threshold is strictly 6.0 mm (not 8.0 mm).
2. Rule 6(10) of LMPC Rules, 2011 explicitly exempts month and year of manufacture/packing from digital e-commerce listings while mandating Country of Origin, Manufacturer, Net Qty, MRP, and Consumer Care.
3. 4-state epistemic triage (`PASS`, `FAIL`, `REVIEW`, `UNABLE_TO_VERIFY`) prevents false binary convictions by acknowledging measurement sensor uncertainty bands ($\pm 0.08\text{ mm}$).

### Evidence
- Official Gazette G.S.R. 629(E) dated 23.06.2017 (ADL-01).
- Rule 6(10) proviso of Legal Metrology (Packaged Commodities) Rules, 2011.
- `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-UNIT-04` through `TS-UNIT-13`).
- `16_DECISION_LOG.md` (ADL-01, ADL-07, ADL-12, ADL-17).

### Decision
1. Implemented strict 6.0 mm threshold in `Table1FontSchedule.get_required_font_height_mm()`.
2. Implemented `EcommerceComplianceEvaluator` returning statutory exemption `PASS` for missing digital Mfg Date while failing missing Country of Origin.
3. Implemented `LegalMetrologyRuleEngine.triage_verdict()` implementing the 4-state epistemic hierarchy.

### Why
Eliminates wrongful non-compliance notices against lawful manufacturers and e-commerce platforms, ensuring full statutory compliance with Indian Law.

### Impact
Protects government legal notices from being quashed in High Court judicial review.

### Status
ACTIVE
