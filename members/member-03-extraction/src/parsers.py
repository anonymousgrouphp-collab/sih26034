"""Deterministic Semantic Parsers for Statutory Packaged Commodities Declarations (SIH26034)"""

import re
from typing import Dict, List, Optional, Tuple


BANNED_UNITS_REGEX = re.compile(
    r"\b(gms|gm|Kgs|kgms|ML|ltrs|LTR|cc)\b",
    re.IGNORECASE
)

DEVANAGARI_DIGITS_MAP = str.maketrans("०१२३४५६७८९", "0123456789")


class StatutoryDeclarationParser:
    @staticmethod
    def convert_indic_digits(text: str) -> str:
        """Converts Devanagari numerals to standard ASCII digits."""
        return text.translate(DEVANAGARI_DIGITS_MAP)

    @classmethod
    def detect_banned_units(cls, text: str) -> Tuple[bool, Optional[str]]:
        """Flags non-standard prohibited unit symbols under Section 11 & Rule 12."""
        match = BANNED_UNITS_REGEX.search(text)
        if match:
            return True, match.group(1)
        return False, None

    @classmethod
    def parse_net_quantity(cls, text: str) -> Optional[Dict[str, any]]:
        """Extracts net quantity magnitude and unit, checking for banned unit symbols."""
        norm_text = cls.convert_indic_digits(text)
        # Matches patterns like 'Net Wt: 500 g', '500g', '750 ml', '1 kg', etc.
        pattern = re.compile(
            r"(?:Net\s*(?:Qty|Quantity|Wt|Weight)?\s*[:\-]?\s*)?(\d+(?:\.\d+)?)\s*([a-zA-Z]+)",
            re.IGNORECASE
        )
        match = pattern.search(norm_text)
        if not match:
            return None

        magnitude_str, unit_str = match.groups()
        has_banned, banned_sym = cls.detect_banned_units(unit_str)

        return {
            "magnitude": float(magnitude_str),
            "unit": unit_str,
            "has_banned_unit": has_banned,
            "banned_unit_found": banned_sym,
        }

    @classmethod
    def parse_mrp(cls, text: str) -> Optional[Dict[str, any]]:
        """Parses MRP amount and checks mandatory '(incl. of all taxes)' clause."""
        norm_text = cls.convert_indic_digits(text)
        mrp_pattern = re.compile(
            r"(?:MRP|M\.R\.P\.?|Maximum\s*Retail\s*Price)?\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:\.\d{1,2})?)",
            re.IGNORECASE
        )
        match = mrp_pattern.search(norm_text)
        if not match:
            return None

        amount = float(match.group(1))
        tax_inclusive = bool(re.search(r"incl(?:usive|\.)?\s*(?:of)?\s*all\s*taxes", norm_text, re.IGNORECASE))

        return {
            "amount": amount,
            "currency": "INR",
            "tax_inclusive": tax_inclusive,
        }

    @classmethod
    def check_consumer_care_completeness(cls, full_text: str) -> Dict[str, any]:
        """Validates presence of all 4 Consumer Care tuples under Rule 6(1)(n)."""
        email_pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
        phone_pattern = re.compile(r"(?:(?:tel|phone|contact|toll[- ]free)?\s*[:\-]?\s*)?(\+?91[-\s]?)?(?:[1-9][0-9]{9}|1800[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,4})", re.IGNORECASE)

        has_email = bool(email_pattern.search(full_text))
        has_phone = bool(phone_pattern.search(full_text))
        has_address = bool(re.search(r"\b(address|plot|sector|road|phase|delhi|mumbai|bangalore|haryana)\b", full_text, re.IGNORECASE))
        has_contact_name = bool(re.search(r"\b(manager|executive|officer|customer\s*care|consumer\s*care)\b", full_text, re.IGNORECASE))

        is_complete = has_email and has_phone and has_address and has_contact_name
        return {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_address": has_address,
            "has_contact_name": has_contact_name,
            "is_complete": is_complete,
        }
