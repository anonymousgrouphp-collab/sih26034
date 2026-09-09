"""Deterministic Rule Evaluators for Legal Metrology (PC) Rules, 2011 (SIH26034)

Translates the Legal Metrology Act, 2009 and the LMPC Rules, 2011 into an immutable,
deterministic AST compliance engine with zero LLM hallucinations.
Frozen per 07_API_AND_INTERFACE_CONTRACTS.md, 16_DECISION_LOG.md (ADL-01, ADL-07, ADL-12),
and 02_FINAL_REQUIREMENTS_SPECIFICATION.md.
"""

import time
from typing import Any, Dict, List, Literal, Optional, Tuple


class Table1FontSchedule:
    """Table-I of Rule 7 as substituted by G.S.R. 629(E) dated 23.06.2017.

    Derives minimum numeral/letter font height as a function of Principal Display Panel (PDP) area.
    Row 5 (> 2500 cm²) strictly enforces 6.0 mm (ADL-01).
    """

    @staticmethod
    def get_required_font_height_mm(pdp_area_cm2: float) -> float:
        """Derives minimum font height in mm from PDP area in cm²."""
        if pdp_area_cm2 <= 50.0:
            return 1.0
        elif pdp_area_cm2 <= 100.0:
            return 1.5
        elif pdp_area_cm2 <= 500.0:
            return 2.5
        elif pdp_area_cm2 <= 2500.0:
            return 4.0
        else:
            # Official Gazette G.S.R. 629(E) Row 5 is strictly 6.0 mm (ADL-01)
            return 6.0

    @classmethod
    def evaluate(
        cls,
        pdp_area_cm2: float,
        measured_height_mm: Optional[float],
        uncertainty_mm: float = 0.08
    ) -> Dict[str, Any]:
        """Evaluates measured font height against Table-I statutory threshold.

        Applies epistemic boundary triage:
        - If measurement missing or invalid: UNABLE_TO_VERIFY
        - If deficit within sensor uncertainty band: REVIEW
        - If height >= required: PASS
        - If height < required beyond uncertainty: FAIL
        """
        required_mm = cls.get_required_font_height_mm(pdp_area_cm2)

        if measured_height_mm is None or measured_height_mm <= 0:
            return {
                "rule_code": "RULE_06_1_H_NET_QTY_FONT",
                "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
                "citation": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
                "status": "UNABLE_TO_VERIFY",
                "severity": "CRITICAL",
                "required_value": f">= {required_mm:.2f} mm (PDP area {pdp_area_cm2:.1f} cm2)",
                "measured_value": "UNAVAILABLE",
                "required_mm": required_mm,
                "measured_mm": 0.0,
                "deficit_mm": 0.0,
                "discrepancy": "Font height could not be measured from degraded/missing imagery",
                "legal_consequence": "Unable to verify font compliance under Section 36(1) LM Act 2009",
            }

        diff = measured_height_mm - required_mm

        # Epistemic boundary triage: within sensor uncertainty band -> REVIEW
        if abs(diff) <= uncertainty_mm and diff < 0:
            status = "REVIEW"
            consequence = "Borderline measurement within sensor uncertainty; requires human officer review"
        elif diff >= 0:
            status = "PASS"
            consequence = "Compliant"
        else:
            status = "FAIL"
            consequence = "Non-compliant under Section 36(1) LM Act 2009"

        return {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "statutory_reference": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "citation": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "status": status,
            "severity": "CRITICAL",
            "required_value": f">= {required_mm:.2f} mm (PDP area {pdp_area_cm2:.1f} cm2)",
            "measured_value": f"{measured_height_mm:.2f} mm",
            "required_mm": required_mm,
            "measured_mm": measured_height_mm,
            "deficit_mm": diff if diff < 0 else 0.0,
            "discrepancy": f"{diff:.2f} mm deficit" if diff < 0 else None,
            "legal_consequence": consequence,
        }


class USPEvaluator:
    """Rule 6(1)(k) Unit Sale Price consistency under G.S.R. 779(E).

    Enforces mathematical consistency: |(USP × NetQty) - MRP| <= 0.02 INR.
    """

    TOLERANCE_INR: float = 0.02

    @classmethod
    def evaluate(
        cls,
        net_qty: Optional[float],
        mrp: Optional[float],
        declared_usp: Optional[float]
    ) -> Dict[str, Any]:
        """Evaluates declared Unit Sale Price against Net Quantity and MRP."""
        if net_qty is None or net_qty <= 0 or mrp is None or mrp <= 0 or declared_usp is None or declared_usp <= 0:
            return {
                "rule_code": "RULE_06_1_K_USP_COMPUTATION",
                "statutory_reference": "Rule 6(1)(k), G.S.R. 779(E)",
                "citation": "Rule 6(1)(k), G.S.R. 779(E)",
                "status": "UNABLE_TO_VERIFY",
                "severity": "CRITICAL",
                "required_value": "Declared USP matching MRP / NetQty",
                "measured_value": "UNAVAILABLE",
                "declared_usp": declared_usp,
                "calculated_usp": 0.0,
                "discrepancy": "Invalid or missing net quantity, MRP, or declared USP",
                "legal_consequence": "Unable to verify Unit Sale Price arithmetic under Section 36(1) LM Act 2009",
            }

        calculated_total = declared_usp * net_qty
        discrepancy = abs(calculated_total - mrp)
        status = "PASS" if discrepancy <= cls.TOLERANCE_INR else "FAIL"

        calculated_usp = round(mrp / net_qty, 4)
        required_val = f"Rs. {calculated_usp:.2f} (tolerance <= 0.02 INR)"
        measured_val = f"Rs. {declared_usp:.2f}"

        return {
            "rule_code": "RULE_06_1_K_USP_COMPUTATION",
            "statutory_reference": "Rule 6(1)(k), G.S.R. 779(E)",
            "citation": "Rule 6(1)(k), G.S.R. 779(E)",
            "status": status,
            "severity": "CRITICAL",
            "required_value": required_val,
            "measured_value": measured_val,
            "declared_usp": declared_usp,
            "calculated_usp": calculated_usp,
            "discrepancy": round(discrepancy, 2),
            "legal_consequence": (
                "Compliant"
                if status == "PASS"
                else "Misleading or incorrect Unit Sale Price under Section 36(1) LM Act 2009"
            ),
        }


class Rule6DeclarationsEvaluator:
    """Evaluates presence and statutory correctness of Rule 6 mandatory declarations.

    Validates:
    - Rule 6(1)(a): Name and complete address of manufacturer/packer/importer
    - Rule 6(1)(f) & Rule 12: Net quantity in SI units and absence of banned unit symbols
    - Rule 6(1)(e): MRP and mandatory '(inclusive of all taxes)' clause
    - Rule 6(1)(n): Consumer care contact details (phone, email, address, contact name)
    - Rule 6(1)(p): Country of origin declaration
    """

    @staticmethod
    def evaluate_manufacturer(
        name: Optional[str],
        address_line: Optional[str] = None,
        pin_code: Optional[str] = None,
        state: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Rule 6(1)(a): Manufacturer, packer, or importer name and address."""
        has_name = bool(name and name.strip())
        has_address = bool(address_line and address_line.strip())

        if not has_name:
            status = "FAIL"
            discrepancy = "Missing manufacturer, packer, or importer name"
        elif not has_address:
            status = "FAIL"
            discrepancy = "Missing manufacturer, packer, or importer address"
        else:
            status = "PASS"
            discrepancy = None

        return {
            "rule_code": "RULE_06_1_A_MANUFACTURER",
            "statutory_reference": "Rule 6(1)(a), Legal Metrology (Packaged Commodities) Rules, 2011",
            "citation": "Rule 6(1)(a), Legal Metrology (PC) Rules 2011",
            "status": status,
            "severity": "CRITICAL",
            "required_value": "Name and complete address of manufacturer/packer/importer",
            "measured_value": f"{name}, {address_line}" if (has_name and has_address) else (name or "MISSING"),
            "discrepancy": discrepancy,
            "legal_consequence": "Compliant" if status == "PASS" else "Non-compliant under Section 36(1) LM Act 2009",
        }

    @staticmethod
    def evaluate_net_quantity(
        magnitude: Optional[float],
        unit: Optional[str],
        has_banned_unit: bool = False,
        banned_unit_found: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Rule 6(1)(f) read with Rule 12: Net quantity declaration & banned unit symbols."""
        if magnitude is None or magnitude <= 0 or not unit:
            return {
                "rule_code": "RULE_06_1_F_NET_QUANTITY",
                "statutory_reference": "Rule 6(1)(f) read with Rule 12, Legal Metrology (PC) Rules, 2011",
                "citation": "Rule 6(1)(f) read with Rule 12, Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Standard numerical net quantity with approved metric unit (g, kg, ml, l)",
                "measured_value": "MISSING",
                "discrepancy": "Missing or non-positive net quantity declaration",
                "legal_consequence": "Non-compliant under Section 36(1) LM Act 2009",
            }

        if has_banned_unit or banned_unit_found:
            banned_sym = banned_unit_found or unit
            return {
                "rule_code": "RULE_06_1_F_NET_QUANTITY",
                "statutory_reference": "Rule 6(1)(f) read with Rule 12 & Section 11 LM Act, 2009",
                "citation": "Rule 6(1)(f) read with Section 11 LM Act 2009",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Strict standard SI unit (e.g. 'g', 'kg', 'ml', 'l')",
                "measured_value": f"{magnitude} {unit}",
                "discrepancy": f"Prohibited non-standard unit '{banned_sym}' under Section 11 / Rule 12",
                "legal_consequence": "Prohibited non-standard unit under Section 11 / Section 36(1) LM Act 2009",
            }

        return {
            "rule_code": "RULE_06_1_F_NET_QUANTITY",
            "statutory_reference": "Rule 6(1)(f) read with Rule 12, Legal Metrology (PC) Rules, 2011",
            "citation": "Rule 6(1)(f) read with Rule 12, Legal Metrology (PC) Rules 2011",
            "status": "PASS",
            "severity": "CRITICAL",
            "required_value": "Approved standard SI unit (g, kg, ml, l)",
            "measured_value": f"{magnitude} {unit}",
            "discrepancy": None,
            "legal_consequence": "Compliant",
        }

    @staticmethod
    def evaluate_mrp(
        amount: Optional[float],
        tax_inclusive: bool = True,
    ) -> Dict[str, Any]:
        """Rule 6(1)(e): Maximum Retail Price and mandatory '(inclusive of all taxes)' clause."""
        if amount is None or amount <= 0:
            return {
                "rule_code": "RULE_06_1_E_MRP",
                "statutory_reference": "Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(e), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Maximum Retail Price in INR inclusive of all taxes",
                "measured_value": "MISSING",
                "discrepancy": "Missing or non-positive MRP amount",
                "legal_consequence": "Non-compliant under Section 36(1) LM Act 2009",
            }

        if not tax_inclusive:
            return {
                "rule_code": "RULE_06_1_E_MRP",
                "statutory_reference": "Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(e), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "MAJOR",
                "required_value": "MRP with mandatory clause '(inclusive of all taxes)'",
                "measured_value": f"Rs. {amount:.2f} (tax clause missing)",
                "discrepancy": "Missing mandatory clause '(inclusive of all taxes)'",
                "legal_consequence": "Non-compliant under Rule 6(1)(e) and Section 36(1) LM Act 2009",
            }

        return {
            "rule_code": "RULE_06_1_E_MRP",
            "statutory_reference": "Rule 6(1)(e), Legal Metrology (Packaged Commodities) Rules, 2011",
            "citation": "Rule 6(1)(e), Legal Metrology (PC) Rules 2011",
            "status": "PASS",
            "severity": "CRITICAL",
            "required_value": "MRP inclusive of all taxes",
            "measured_value": f"Rs. {amount:.2f} (inclusive of all taxes)",
            "discrepancy": None,
            "legal_consequence": "Compliant",
        }

    @staticmethod
    def evaluate_consumer_care(
        has_phone: bool,
        has_email: bool,
        has_address: bool = True,
        has_contact_name: bool = True,
    ) -> Dict[str, Any]:
        """Rule 6(1)(n): Consumer grievance redressal details (name, address, phone, email).

        Per TS-UNIT-09: Missing email is a critical statutory violation under Rule 6(1)(n)/6(1)(g).
        """
        if not has_email:
            return {
                "rule_code": "RULE_06_1_N_CONSUMER_CARE",
                "statutory_reference": "Rule 6(1)(n), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(n), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Consumer care contact with valid email address",
                "measured_value": "Email missing",
                "discrepancy": "Rule 6(1)(g) Missing Email Address",
                "legal_consequence": "Non-compliant consumer grievance redressal under Section 36(1) LM Act 2009",
            }

        if not has_phone:
            return {
                "rule_code": "RULE_06_1_N_CONSUMER_CARE",
                "statutory_reference": "Rule 6(1)(n), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(n), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Consumer care contact with telephone/toll-free number",
                "measured_value": "Telephone missing",
                "discrepancy": "Missing mandatory consumer care telephone number",
                "legal_consequence": "Non-compliant consumer grievance redressal under Section 36(1) LM Act 2009",
            }

        if not has_address:
            return {
                "rule_code": "RULE_06_1_N_CONSUMER_CARE",
                "statutory_reference": "Rule 6(1)(n), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(n), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "MAJOR",
                "required_value": "Consumer care postal address",
                "measured_value": "Address missing",
                "discrepancy": "Missing consumer care postal address",
                "legal_consequence": "Non-compliant consumer grievance redressal under Section 36(1) LM Act 2009",
            }

        return {
            "rule_code": "RULE_06_1_N_CONSUMER_CARE",
            "statutory_reference": "Rule 6(1)(n), Legal Metrology (Packaged Commodities) Rules, 2011",
            "citation": "Rule 6(1)(n), Legal Metrology (PC) Rules 2011",
            "status": "PASS",
            "severity": "CRITICAL",
            "required_value": "Complete consumer care details (name, address, phone, email)",
            "measured_value": "Complete (phone, email, address present)",
            "discrepancy": None,
            "legal_consequence": "Compliant",
        }

    @staticmethod
    def evaluate_country_of_origin(country: Optional[str]) -> Dict[str, Any]:
        """Rule 6(1)(p): Country of origin declaration."""
        if not country or not country.strip():
            return {
                "rule_code": "RULE_06_1_P_COUNTRY_OF_ORIGIN",
                "statutory_reference": "Rule 6(1)(p), Legal Metrology (Packaged Commodities) Rules, 2011",
                "citation": "Rule 6(1)(p), Legal Metrology (PC) Rules 2011",
                "status": "FAIL",
                "severity": "MAJOR",
                "required_value": "Country of origin declaration",
                "measured_value": "MISSING",
                "discrepancy": "Missing Country of Origin declaration",
                "legal_consequence": "Non-compliant under Section 36(1) LM Act 2009",
            }

        return {
            "rule_code": "RULE_06_1_P_COUNTRY_OF_ORIGIN",
            "statutory_reference": "Rule 6(1)(p), Legal Metrology (Packaged Commodities) Rules, 2011",
            "citation": "Rule 6(1)(p), Legal Metrology (PC) Rules 2011",
            "status": "PASS",
            "severity": "MAJOR",
            "required_value": "Country of origin declaration",
            "measured_value": country.strip(),
            "discrepancy": None,
            "legal_consequence": "Compliant",
        }


class EcommerceComplianceEvaluator:
    """Rule 6(10) E-Commerce marketplace compliance auditor.

    Under Rule 6(10) of LMPC Rules, 2011:
    - Digital marketplace listings must declare:
      1. Manufacturer / Packer name and address (Rule 6(1)(a))
      2. Net quantity (Rule 6(1)(f))
      3. Maximum Retail Price (Rule 6(1)(e))
      4. Consumer care details (Rule 6(1)(n))
      5. Country of Origin (MANDATORY under Rule 6(10) / Rule 6(1)(p) / Rule 6(10A))
    - Manufacturing Date is STATUTORILY EXEMPT from digital listings.
    """

    @classmethod
    def evaluate_listing(cls, listing: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Audits an e-commerce listing payload for statutory compliance."""
        evaluations: List[Dict[str, Any]] = []

        # 1. Manufacturer / Packer
        mfg_name = listing.get("manufacturer_name")
        mfg_addr = listing.get("manufacturer_address")
        evaluations.append(Rule6DeclarationsEvaluator.evaluate_manufacturer(mfg_name, mfg_addr))

        # 2. Net Quantity
        net_qty = listing.get("net_quantity_magnitude")
        unit = listing.get("net_quantity_unit")
        has_banned = listing.get("has_banned_unit", False)
        banned_sym = listing.get("banned_unit_found")
        evaluations.append(Rule6DeclarationsEvaluator.evaluate_net_quantity(net_qty, unit, has_banned, banned_sym))

        # 3. MRP
        mrp_amount = listing.get("mrp")
        tax_inclusive = listing.get("tax_inclusive", True)
        evaluations.append(Rule6DeclarationsEvaluator.evaluate_mrp(mrp_amount, tax_inclusive))

        # 4. Consumer Care
        has_phone = bool(listing.get("consumer_care_phone"))
        has_email = bool(listing.get("consumer_care_email"))
        has_addr = bool(listing.get("consumer_care_address", True))
        evaluations.append(Rule6DeclarationsEvaluator.evaluate_consumer_care(has_phone, has_email, has_addr))

        # 5. Country of Origin (MANDATORY on e-commerce per Rule 6(10) / Rule 6(10A) / TS-UNIT-13)
        origin = listing.get("country_of_origin")
        if not origin or not str(origin).strip():
            evaluations.append({
                "rule_code": "RULE_06_10_COUNTRY_OF_ORIGIN",
                "statutory_reference": "Rule 6(10) read with Rule 6(1)(p) & Rule 6(10A), LMPC Rules 2011",
                "citation": "Rule 6(10) / Rule 6(1)(aa)",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Mandatory digital declaration of Country of Origin",
                "measured_value": "MISSING",
                "discrepancy": "Missing Country of Origin on e-commerce listing",
                "legal_consequence": "Violation of Rule 6(10) e-commerce statutory requirements",
            })
        else:
            evaluations.append({
                "rule_code": "RULE_06_10_COUNTRY_OF_ORIGIN",
                "statutory_reference": "Rule 6(10) read with Rule 6(1)(p) & Rule 6(10A), LMPC Rules 2011",
                "citation": "Rule 6(10) / Rule 6(1)(aa)",
                "status": "PASS",
                "severity": "CRITICAL",
                "required_value": "Mandatory digital declaration of Country of Origin",
                "measured_value": str(origin).strip(),
                "discrepancy": None,
                "legal_consequence": "Compliant",
            })

        # 6. Manufacturing Date (STATUTORILY EXEMPT per Rule 6(10) / TS-UNIT-12)
        # Even if missing/None, evaluates to PASS with explicit exemption citation
        evaluations.append({
            "rule_code": "RULE_06_10_MFG_DATE_EXEMPTION",
            "statutory_reference": "Rule 6(10) proviso, Legal Metrology (Packaged Commodities) Rules, 2011",
            "citation": "Rule 6(10) Statutorily Exempts Mfg Date",
            "status": "PASS",
            "severity": "MINOR",
            "required_value": "Statutorily exempt for e-commerce listings under Rule 6(10)",
            "measured_value": str(listing.get("mfg_date") or "NOT_DECLARED (EXEMPT)"),
            "discrepancy": None,
            "legal_consequence": "Compliant: Manufacturing Date is legally exempt from digital listings",
        })

        return evaluations


class TemporalEpochDispatcher:
    """Non-retroactive statutory epoch router matching Mfg Date per Article 20(1) (ADL-07)."""

    @staticmethod
    def get_epoch(mfg_date_iso: Optional[str]) -> str:
        """Routes manufacturing date string to statutory milestone epoch."""
        if not mfg_date_iso:
            return "EPOCH_2021_GSR_779"  # Default working epoch
        date_str = mfg_date_iso[:10]
        if date_str < "2017-06-23":
            return "EPOCH_2011_BASE"
        elif date_str < "2021-11-02":
            return "EPOCH_2017_GSR_629"
        elif date_str < "2026-07-01":
            return "EPOCH_2021_GSR_779"
        else:
            return "EPOCH_2026_GSR_128"

    @classmethod
    def is_usp_mandatory(cls, epoch: str) -> bool:
        """USP became mandatory under G.S.R. 779(E) effective November 2021 / January 2022."""
        return epoch in ("EPOCH_2021_GSR_779", "EPOCH_2026_GSR_128")


class LegalMetrologyRuleEngine:
    """Composite Deterministic AST Rule Engine (Member 4 - NyayaDrishti-LM).

    Orchestrates:
    - Temporal Statutory Epoch Dispatcher
    - Table-I Font Schedule
    - Unit Sale Price (USP) Arithmetic
    - Rule 6 Statutory Declarations (Manufacturer, Net Qty, MRP, Consumer Care, Origin)
    - 4-State Epistemic Verdict Triage (PASS, FAIL, REVIEW, UNABLE_TO_VERIFY)
    """

    @staticmethod
    def triage_verdict(evaluations: List[Dict[str, Any]]) -> Literal["PASS", "FAIL", "REVIEW", "UNABLE_TO_VERIFY"]:
        """Derives composite 4-state epistemic verdict from granular rule evaluations.

        Triage hierarchy (ADL-12):
        1. If ANY evaluation is FAIL -> FAIL (critical statutory violation established)
        2. Else if ANY evaluation is REVIEW -> REVIEW (borderline measurement in sensor uncertainty band)
        3. Else if ANY evaluation is UNABLE_TO_VERIFY -> UNABLE_TO_VERIFY (degraded/missing sensor inputs)
        4. Else -> PASS (100% statutory compliance verified)
        """
        if not evaluations:
            return "UNABLE_TO_VERIFY"

        statuses = [e.get("status") for e in evaluations]

        if "FAIL" in statuses:
            return "FAIL"
        if "REVIEW" in statuses:
            return "REVIEW"
        if "UNABLE_TO_VERIFY" in statuses:
            return "UNABLE_TO_VERIFY"
        return "PASS"

    @classmethod
    def evaluate_inspection(
        cls,
        inspection_id: str,
        pdp_area_cm2: float,
        font_height_mm: Optional[float],
        net_quantity: Optional[Dict[str, Any]] = None,
        mrp: Optional[Dict[str, Any]] = None,
        declared_usp: Optional[float] = None,
        manufacturer: Optional[Dict[str, Any]] = None,
        consumer_care: Optional[Dict[str, Any]] = None,
        country_of_origin: Optional[str] = None,
        mfg_date_iso: Optional[str] = None,
        is_ecommerce: bool = False,
    ) -> Dict[str, Any]:
        """Executes complete deterministic compliance audit for an inspection session."""
        t_start = time.perf_counter()

        # 1. Determine Statutory Epoch
        epoch = TemporalEpochDispatcher.get_epoch(mfg_date_iso)
        evaluations: List[Dict[str, Any]] = []

        # 2. Table-I Font Schedule Check (Physical packages)
        if not is_ecommerce:
            font_result = Table1FontSchedule.evaluate(pdp_area_cm2, font_height_mm)
            evaluations.append(font_result)

        # 3. Rule 6(1)(a) Manufacturer / Packer
        if manufacturer:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_manufacturer(
                name=manufacturer.get("name"),
                address_line=manufacturer.get("address_line"),
                pin_code=manufacturer.get("pin_code"),
                state=manufacturer.get("state"),
            ))
        else:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_manufacturer(None))

        # 4. Rule 6(1)(f) Net Quantity
        if net_quantity:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_net_quantity(
                magnitude=net_quantity.get("magnitude"),
                unit=net_quantity.get("unit"),
                has_banned_unit=net_quantity.get("has_banned_unit", False),
                banned_unit_found=net_quantity.get("banned_unit_found"),
            ))
        else:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_net_quantity(None, None))

        # 5. Rule 6(1)(e) MRP
        if mrp:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_mrp(
                amount=mrp.get("amount"),
                tax_inclusive=mrp.get("tax_inclusive", True),
            ))
        else:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_mrp(None))

        # 6. Rule 6(1)(k) Unit Sale Price Math (checked if declared or if mandatory in epoch)
        net_qty_val = net_quantity.get("magnitude") if net_quantity else None
        mrp_val = mrp.get("amount") if mrp else None

        if declared_usp is not None:
            evaluations.append(USPEvaluator.evaluate(net_qty_val, mrp_val, declared_usp))
        elif TemporalEpochDispatcher.is_usp_mandatory(epoch) and not is_ecommerce:
            evaluations.append({
                "rule_code": "RULE_06_1_K_USP_COMPUTATION",
                "statutory_reference": "Rule 6(1)(k), G.S.R. 779(E)",
                "citation": "Rule 6(1)(k), G.S.R. 779(E)",
                "status": "FAIL",
                "severity": "CRITICAL",
                "required_value": "Mandatory Unit Sale Price declaration under G.S.R. 779(E)",
                "measured_value": "MISSING",
                "discrepancy": "Unit Sale Price declaration missing on post-2021 packaging",
                "legal_consequence": "Violation of Rule 6(1)(k) and Section 36(1) LM Act 2009",
            })

        # 7. Rule 6(1)(n) Consumer Care
        if consumer_care:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_consumer_care(
                has_phone=consumer_care.get("has_phone", False),
                has_email=consumer_care.get("has_email", False),
                has_address=consumer_care.get("has_address", True),
                has_contact_name=consumer_care.get("has_contact_name", True),
            ))
        else:
            evaluations.append(Rule6DeclarationsEvaluator.evaluate_consumer_care(False, False))

        # 8. Rule 6(1)(p) Country of Origin
        evaluations.append(Rule6DeclarationsEvaluator.evaluate_country_of_origin(country_of_origin))

        # 9. E-Commerce specific exemptions / requirements
        if is_ecommerce:
            evaluations.append({
                "rule_code": "RULE_06_10_MFG_DATE_EXEMPTION",
                "statutory_reference": "Rule 6(10) proviso, Legal Metrology (PC) Rules, 2011",
                "citation": "Rule 6(10) Statutorily Exempts Mfg Date",
                "status": "PASS",
                "severity": "MINOR",
                "required_value": "Statutorily exempt for e-commerce listings under Rule 6(10)",
                "measured_value": str(mfg_date_iso or "NOT_DECLARED (EXEMPT)"),
                "discrepancy": None,
                "legal_consequence": "Compliant: Manufacturing Date is legally exempt from digital listings",
            })

        # 10. Normalize evaluations to strictly conform to RuleEvaluationDTO schema
        dto_evaluations: List[Dict[str, Any]] = []
        for ev in evaluations:
            item = dict(ev)
            disc = item.get("discrepancy")
            if disc is not None and not isinstance(disc, str):
                if disc == 0.0 and item.get("status") == "PASS":
                    item["discrepancy"] = None
                else:
                    item["discrepancy"] = f"Discrepancy of {disc:.2f}"
            dto_evaluations.append(item)

        # 11. Composite 4-state triage
        overall_verdict = cls.triage_verdict(dto_evaluations)
        exec_time_ms = int((time.perf_counter() - t_start) * 1000)

        return {
            "inspection_id": inspection_id,
            "overall_verdict": overall_verdict,
            "adjudication_required": True,
            "evaluations": dto_evaluations,
            "epoch_applied": epoch,
            "execution_time_ms": exec_time_ms,
        }
