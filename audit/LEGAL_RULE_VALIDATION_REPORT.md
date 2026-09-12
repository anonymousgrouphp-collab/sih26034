# LEGAL RULE VALIDATION REPORT
## Statutory Mapping, Rule Engine Accuracy, and Judicial Defensibility

**Project:** NyayaDrishti-LM (SIH26034)  
**Legal Framework:** Legal Metrology Act, 2009 | Legal Metrology (Packaged Commodities) Rules, 2011 | Jan Vishwas (Amendment of Provisions) Act, 2023 | Section 63 Bharatiya Sakshya Adhiniyam, 2023  
**Date:** 12 September 2026  

---

## 1. Statutory Rule Engine Implementation

NyayaDrishti-LM encodes the mandatory statutory rules of the LMPC Rules, 2011 into an Abstract Syntax Tree (AST) evaluation engine with zero heuristic guessing or hallucinated provisions.

### Statutory Rule Verification Matrix

| Rule Citation | Statutory Requirement | Implementation Engine | Verification Condition | Severity |
| :--- | :--- | :--- | :--- | :--- |
| **Rule 6(1)(a)** | Manufacturer / Packer / Importer Name & Complete Address | `Rule6DeclarationsEvaluator` | Validates presence of registered name, street/area address, and 6-digit PIN code. | HIGH |
| **Rule 6(1)(b)** | Generic Name of the Commodity | `Rule6DeclarationsEvaluator` | Ensures common/generic commodity identity is prominently declared on PDP. | HIGH |
| **Rule 6(1)(c)** | Net Quantity in Standard SI Units | `StatutoryDeclarationParser` | Rejects non-standard units (`gms`, `ML`, `ltrs`, `g.`) under Section 11 / Rule 12. | CRITICAL |
| **Rule 6(1)(d)** | Month & Year of Manufacture / Pre-packing / Import | `Rule6DeclarationsEvaluator` | Validates date formatting; enforces temporal epoch routing (Rule 6(10) digital listing exemption). | MEDIUM |
| **Rule 6(1)(da)** | Unit Sale Price (USP) | `USPEvaluator` | Enforces $|(\text{USP} \times \text{NetQty}) - \text{MRP}| \le 0.02\text{ INR}$. Mandatory for goods packaged after 01 Jan 2022. | HIGH |
| **Rule 6(1)(e)** | Maximum Retail Price (MRP) | `StatutoryDeclarationParser` | Enforces inclusion of "Inclusive of all taxes" clause and valid Rupee symbol / numeric amount. | CRITICAL |
| **Rule 6(1)(f)** | Size / Dimensions (where applicable) | `Rule6DeclarationsEvaluator` | Checks length, width, diameter for consumer commodities where dimension governs usage. | LOW |
| **Rule 6(1)(g)** | Consumer Care Details (Phone, Email, Address) | `Rule6DeclarationsEvaluator` | Verifies presence of helpline phone, grievance email, or physical consumer care desk. | HIGH |
| **Rule 6(10)** | E-Commerce Single Product Listing Disclosures | `Rule6DeclarationsEvaluator` | Enforces digital marketplace declarations; confirms statutory exemption for date of manufacture. | HIGH |
| **Rule 7 / Table-I** | Minimum Numeral Font Height Schedule | `Table1FontSchedule` | Computes required font height from calibrated PDP area ($cm^2$): $\le 50\text{ cm}^2 \to 1.0\text{ mm}$, $50–100 \to 1.5\text{ mm}$, $100–500 \to 2.5\text{ mm}$, $500–2500 \to 4.0\text{ mm}$, $>2500 \to 6.0\text{ mm}$. | HIGH |
| **Section 36** | Penalty & Compounding Schedule | `JanVishwasCompoundingCalculator` | Computes compounding fines under Jan Vishwas Act, 2023: First offense up to ₹25,000; Second up to ₹50,000; Subsequent up to ₹1,00,000. | ADVISORY |

---

## 2. Mathematical Precision & Boundary Testing

1. **Table-I Row 5 Schedule Precision:** Strictly enforces 6.0 mm (never 8.0 mm per ADL-01 and Gazette notification GSR 779(E)).
2. **USP Rounding Tolerance:** Evaluates $|(USP \times Qty) - MRP| \le 0.02\text{ INR}$ to accommodate commercial half-paisa rounding while flagging deliberate retail price inflation.
3. **Sensor Uncertainty Band ($k=2$):** Font measurements within $\pm 0.04\text{ mm}$ of the statutory boundary are routed to epistemic state `REVIEW` rather than premature failure, preventing unjust manufacturer harassment.

---

## 3. Judicial Evidentiary Defensibility

All rule evaluation records conform strictly to **Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023)**:
- Zero references to repealed Section 65B of the Indian Evidence Act, 1872.
- Every rule failure references the exact token, calibrated millimeter measurement, and statutory rule paragraph.
- The human Legal Metrology Officer retains final adjudicative authority (Strict Human-in-the-Loop).
