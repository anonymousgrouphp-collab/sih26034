"""Deterministic Rule Evaluators for Legal Metrology (PC) Rules, 2011 (SIH26034)"""

from typing import Dict, List, Literal, Optional, Tuple


class Table1FontSchedule:
    """Table-I of Rule 7 as substituted by G.S.R. 629(E) dated 23.06.2017."""

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
            # Official Gazette G.S.R. 629(E) Row 5 is 6.0 mm (ADL-01)
            return 6.0

    @classmethod
    def evaluate(
        cls,
        pdp_area_cm2: float,
        measured_height_mm: float,
        uncertainty_mm: float = 0.08
    ) -> Dict[str, any]:
        required_mm = cls.get_required_font_height_mm(pdp_area_cm2)
        diff = measured_height_mm - required_mm

        # Epistemic boundary triage: within uncertainty band -> REVIEW
        if abs(diff) <= uncertainty_mm and diff < 0:
            status = "REVIEW"
        elif diff >= 0:
            status = "PASS"
        else:
            status = "FAIL"

        return {
            "rule_code": "RULE_06_1_H_NET_QTY_FONT",
            "citation": "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
            "status": status,
            "required_mm": required_mm,
            "measured_mm": measured_height_mm,
            "deficit_mm": diff if diff < 0 else 0.0,
            "legal_consequence": "Compliant" if status == "PASS" else "Non-compliant under Section 36(1) LM Act 2009",
        }


class USPEvaluator:
    """Rule 6(1)(k) Unit Sale Price consistency under G.S.R. 779(E)."""

    TOLERANCE_INR: float = 0.02

    @classmethod
    def evaluate(
        cls,
        net_qty: float,
        mrp: float,
        declared_usp: float
    ) -> Dict[str, any]:
        if net_qty <= 0:
            return {
                "rule_code": "RULE_06_1_K_USP",
                "citation": "Rule 6(1)(k), G.S.R. 779(E)",
                "status": "UNABLE_TO_VERIFY",
                "discrepancy": "Invalid net quantity magnitude <= 0",
            }

        calculated_total = declared_usp * net_qty
        discrepancy = abs(calculated_total - mrp)
        status = "PASS" if discrepancy <= cls.TOLERANCE_INR else "FAIL"

        return {
            "rule_code": "RULE_06_1_K_USP_COMPUTATION",
            "citation": "Rule 6(1)(k), G.S.R. 779(E)",
            "status": status,
            "declared_usp": declared_usp,
            "calculated_usp": round(mrp / net_qty, 4),
            "discrepancy": round(discrepancy, 2),
            "legal_consequence": "Compliant" if status == "PASS" else "Misleading or incorrect Unit Sale Price under Section 36(1) LM Act 2009",
        }


class TemporalEpochDispatcher:
    """Non-retroactive statutory epoch router matching Mfg Date per Article 20(1) (ADL-07)."""

    @staticmethod
    def get_epoch(mfg_date_iso: str) -> str:
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
