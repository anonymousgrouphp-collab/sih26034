"""Deterministic Semantic Parsers for Statutory Packaged Commodities Declarations (SIH26034)
Fulfills Rule 6 LMPC Rules 2011, Section 11 / Rule 12 banned unit detection,
and Section 63 BSA 2023 deterministic evidence requirements.
"""

import re
from typing import Any, Dict, List, Optional, Tuple


# Devanagari numeral conversion mapping
DEVANAGARI_DIGITS_MAP = str.maketrans("०१२३४५६७८९", "0123456789")

# Banned units: Case-insensitive symbols
# Under Section 11 & Rule 12: gms, gm, g.m., Kgs, kgms, ltrs, ltr, cc, etc. are prohibited.
BANNED_UNITS_CASE_INSENSITIVE = re.compile(
    r"\b(gms|gm|g\.m\.|g\.m\.s\.|Kgs|kgms|kgs|ltrs|ltr|LTR|LTRS|cc|liters|litres)\b",
    re.IGNORECASE
)

# Banned units: Strictly capitalized 'ML' or 'Ml' (whereas lowercase 'ml' or standard 'mL' is valid)
BANNED_UNITS_CASE_SENSITIVE = re.compile(
    r"\b(ML|Ml)\b"
)

# Indian States and Union Territories for address validation
INDIAN_STATES_AND_UTS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
    "Puducherry", "New Delhi"
]

# Month name mapping
MONTH_NAMES = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "september": 9, "sept": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12
}


class StatutoryDeclarationParser:
    """Deterministic, auditable parsers for statutory packaging declarations."""

    @staticmethod
    def convert_indic_digits(text: str) -> str:
        """Converts Devanagari numerals (०-९) to standard ASCII decimal digits (0-9)."""
        if not text:
            return ""
        return text.translate(DEVANAGARI_DIGITS_MAP)

    @classmethod
    def detect_banned_units(cls, text: str) -> Tuple[bool, Optional[str]]:
        """Flags non-standard prohibited unit symbols under Section 11 & Rule 12.

        Distinguishes banned capitalized 'ML' from statutory valid 'ml'.
        Detects prohibited 'gms', 'gm', 'Kgs', 'ltrs', 'cc', etc.
        """
        # 1. Check case-sensitive banned symbols first (e.g. capitalized 'ML')
        cs_match = BANNED_UNITS_CASE_SENSITIVE.search(text)
        if cs_match:
            return True, cs_match.group(1)

        # 2. Check general banned symbols (case-insensitive)
        ci_match = BANNED_UNITS_CASE_INSENSITIVE.search(text)
        if ci_match:
            return True, ci_match.group(1)

        return False, None

    @classmethod
    def parse_net_quantity(cls, text: str) -> Optional[Dict[str, Any]]:
        """Extracts net quantity magnitude and metric unit, evaluating banned symbols."""
        norm_text = cls.convert_indic_digits(text)

        recognized_units = {
            "g", "kg", "mg", "ml", "l", "cl", "m", "cm", "mm", "n", "u", "units", "pcs", "piece", "pieces",
            "gms", "gm", "g.m.", "g.m.s.", "kgs", "kgms", "ltrs", "ltr", "cc", "liters", "litres"
        }

        # Look for quantity with explicit prefix, or standalone quantity with recognized metric unit
        explicit_pattern = re.compile(
            r"(?:Net\s*(?:Qty|Quantity|Wt|Weight)|Volume|शुद्ध\s*मात्रा)\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)",
            re.IGNORECASE
        )
        match = explicit_pattern.search(norm_text)
        if not match:
            # Fallback to standalone magnitude + unit only if unit is recognized
            standalone_pattern = re.compile(
                r"\b(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\b"
            )
            for m in standalone_pattern.finditer(norm_text):
                cand_mag, cand_unit = m.groups()
                if cand_unit.lower() in recognized_units or cand_unit in ("ML", "Ml"):
                    match = m
                    break

        if not match:
            return None

        magnitude_str, unit_str = match.groups()
        has_banned, banned_sym = cls.detect_banned_units(unit_str)

        # If the unit string was not in unit_str alone (e.g. full token had banned unit)
        if not has_banned:
            has_banned, banned_sym = cls.detect_banned_units(norm_text)

        # Standardize metric unit symbol if valid
        clean_unit = unit_str.strip()
        if not has_banned:
            if clean_unit.lower() == "ml":
                clean_unit = "ml"
            elif clean_unit.lower() == "g":
                clean_unit = "g"
            elif clean_unit.lower() == "kg":
                clean_unit = "kg"
            elif clean_unit.lower() == "l":
                clean_unit = "l"
            elif clean_unit.upper() in ("N", "U"):
                clean_unit = clean_unit.upper()

        return {
            "magnitude": float(magnitude_str),
            "unit": clean_unit,
            "has_banned_unit": has_banned,
            "banned_unit_found": banned_sym,
        }

    @classmethod
    def parse_mrp(cls, text: str) -> Optional[Dict[str, Any]]:
        """Parses Maximum Retail Price (MRP) amount and checks mandatory tax inclusivity clause.

        Under Rule 6(1)(e), declaration must state '(incl. of all taxes)'.
        Requires an explicit MRP keyword or currency indicator to prevent false number matches.
        """
        norm_text = cls.convert_indic_digits(text)

        # Currency and MRP amount regex - requiring either MRP label OR currency symbol
        mrp_pattern = re.compile(
            r"(?:(?:MRP|M\.R\.P\.?|Maximum\s*Retail\s*Price|Max\.?\s*Retail\s*Price|अ\.वि\.मू\.)\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:\.\d{1,2})?)|(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?))\s*(?:/-)?",
            re.IGNORECASE
        )
        match = mrp_pattern.search(norm_text)
        if not match:
            return None

        amount_str = match.group(1) or match.group(2)
        if not amount_str:
            return None

        try:
            amount = float(amount_str)
            if amount <= 0:
                return None
        except ValueError:
            return None

        # Tax inclusivity clause detection per Rule 6(1)(e)
        tax_inclusive_patterns = [
            r"incl(?:usive|\.)?\s*(?:of)?\s*all\s*taxes",
            r"incl(?:usive|\.)?\s*(?:of)?\s*taxes",
            r"all\s*taxes\s*included",
            r"कर\s*सहित",
        ]
        tax_inclusive = any(re.search(p, norm_text, re.IGNORECASE) for p in tax_inclusive_patterns)

        return {
            "amount": amount,
            "currency": "INR",
            "tax_inclusive": tax_inclusive,
        }

    @classmethod
    def parse_usp(cls, text: str) -> Optional[Dict[str, Any]]:
        """Extracts Unit Sale Price (USP) under Rule 6(1)(k).

        Examples: 'Unit Sale Price: Rs. 0.40 / g', 'USP: Rs. 1.20/ml', '₹ 0.50 per g'.
        """
        norm_text = cls.convert_indic_digits(text)

        usp_pattern = re.compile(
            r"(?:Unit\s*Sale\s*Price|USP)\s*[:\-]?\s*(?:Rs\.?|INR|₹)?\s*(\d+(?:\.\d{1,4})?)\s*(?:/|per)\s*([a-zA-Z0-9]+)",
            re.IGNORECASE
        )
        match = usp_pattern.search(norm_text)
        if not match:
            # Also try matching standalone 'Rs. X / g' or '₹ X / ml'
            standalone_pattern = re.compile(
                r"(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,4})?)\s*(?:/|per)\s*([a-zA-Z0-9]+)",
                re.IGNORECASE
            )
            match = standalone_pattern.search(norm_text)
            if not match:
                return None

        price_str, unit_str = match.groups()
        try:
            price = float(price_str)
            if price <= 0:
                return None
        except ValueError:
            return None

        clean_unit = unit_str.strip().lower()
        return {
            "price_per_unit": price,
            "unit": clean_unit,
        }

    @classmethod
    def parse_mfg_and_expiry_dates(cls, text: str) -> Dict[str, Any]:
        """Extracts manufacturing and expiry/best before dates under Rule 6(1)(d).

        Returns month (1-12) and year (2000-2030) if identifiable.
        """
        norm_text = cls.convert_indic_digits(text)
        result: Dict[str, Any] = {
            "mfg_month": None,
            "mfg_year": None,
            "exp_month": None,
            "exp_year": None,
            "best_before_months": None,
        }

        # 1. Best before X months
        bb_pattern = re.compile(
            r"best\s*before\s*(\d+)\s*months?",
            re.IGNORECASE
        )
        bb_match = bb_pattern.search(norm_text)
        if bb_match:
            result["best_before_months"] = int(bb_match.group(1))

        # 2. Manufacturing date patterns
        # e.g., 'Mfg Date: 03/2024', 'Mfg: 03/24', 'Pkd: 05/2023', 'Date of Pkg: March 2024', '03/2024'
        mfg_date_pattern = re.compile(
            r"(?:Mfg(?:\s*Date)?|Mfg\.?|Packed|Pkd\.?|Date\s*of\s*(?:Mfg|Packaging|Packing))\s*[:\-]?\s*"
            r"(?:(\d{1,2})[\/\-\.](?:(\d{1,2})[\/\-\.])?(\d{2,4})|([a-zA-Z]+)[\s,]+(\d{2,4}))",
            re.IGNORECASE
        )
        mfg_match = mfg_date_pattern.search(norm_text)
        if mfg_match:
            d1, d2, y_num, m_name, y_named = mfg_match.groups()
            if y_num:
                month = int(d2) if d2 else int(d1)
                year = int(y_num)
                if year < 100:
                    year += 2000
                if 1 <= month <= 12 and 2000 <= year <= 2030:
                    result["mfg_month"] = month
                    result["mfg_year"] = year
            elif m_name and y_named:
                m_lower = m_name.lower()[:3]
                if m_lower in MONTH_NAMES:
                    month = MONTH_NAMES[m_lower]
                    year = int(y_named)
                    if year < 100:
                        year += 2000
                    if 2000 <= year <= 2030:
                        result["mfg_month"] = month
                        result["mfg_year"] = year
        else:
            # Standalone date check e.g. '03/2024' or '03-2024'
            standalone_date_pattern = re.compile(
                r"\b(0[1-9]|1[0-2])[\/\-](20[2-3][0-9]|[2-3][0-9])\b"
            )
            sa_match = standalone_date_pattern.search(norm_text)
            if sa_match:
                month = int(sa_match.group(1))
                year = int(sa_match.group(2))
                if year < 100:
                    year += 2000
                if 1 <= month <= 12 and 2000 <= year <= 2030:
                    result["mfg_month"] = month
                    result["mfg_year"] = year

        # 3. Expiry date pattern
        exp_date_pattern = re.compile(
            r"(?:Exp(?:\s*Date)?|Expiry|Use\s*by|Best\s*before)\s*[:\-]?\s*"
            r"(?:(\d{1,2})[\/\-\.](?:(\d{1,2})[\/\-\.])?(\d{2,4})|([a-zA-Z]+)[\s,]+(\d{2,4}))",
            re.IGNORECASE
        )
        exp_match = exp_date_pattern.search(norm_text)
        if exp_match:
            d1, d2, y_num, m_name, y_named = exp_match.groups()
            if y_num:
                month = int(d2) if d2 else int(d1)
                year = int(y_num)
                if year < 100:
                    year += 2000
                if 1 <= month <= 12 and 2000 <= year <= 2030:
                    result["exp_month"] = month
                    result["exp_year"] = year
            elif m_name and y_named:
                m_lower = m_name.lower()[:3]
                if m_lower in MONTH_NAMES:
                    month = MONTH_NAMES[m_lower]
                    year = int(y_named)
                    if year < 100:
                        year += 2000
                    if 2000 <= year <= 2030:
                        result["exp_month"] = month
                        result["exp_year"] = year

        return result

    @classmethod
    def parse_pin_code(cls, text: str) -> Optional[str]:
        """Extracts a valid 6-digit Indian PIN code (100000 - 999999).

        Guards against false positives from 10-digit phone numbers, GSTINs, and dates.
        """
        norm_text = cls.convert_indic_digits(text)

        # Standalone 6-digit number starting with 1-9
        pin_pattern = re.compile(
            r"(?:(?<=\b)|(?<=[^\d]))([1-9][0-9]{5})(?=[^\d]|$)"
        )
        for match in pin_pattern.finditer(norm_text):
            candidate = match.group(1)
            start, end = match.span(1)
            prefix = norm_text[max(0, start - 4):start]
            suffix = norm_text[end:min(len(norm_text), end + 4)]
            # If adjacent characters are digits, it's part of a phone or longer number
            if re.search(r"\d", prefix[-1:]) or re.search(r"\d", suffix[:1]):
                continue
            return candidate

        return None

    @classmethod
    def parse_address(cls, text: str) -> Optional[Dict[str, Any]]:
        """Parses address tokens into entity name, address line, State, and 6-digit PIN code.

        Per working default OQ-02, an address is complete if State + 6-digit PIN are present.
        """
        norm_text = cls.convert_indic_digits(text)

        # Extract PIN code
        pin_code = cls.parse_pin_code(norm_text)

        # Detect Indian State / UT
        detected_state: Optional[str] = None
        for state in INDIAN_STATES_AND_UTS:
            pattern = re.compile(r"\b" + re.escape(state) + r"\b", re.IGNORECASE)
            if pattern.search(norm_text):
                detected_state = state
                break

        # Check for registered corporate name keywords
        corp_name_match = re.search(
            r"([A-Za-z0-9\s.,&'\-]+(?:Pvt\.?\s*Ltd\.?|Private\s*Limited|Ltd\.?|Limited|LLP|Industries|Enterprises|Foods|Beverages|Consumer\s*Care))",
            norm_text,
            re.IGNORECASE
        )
        entity_name = corp_name_match.group(1).strip() if corp_name_match else None

        # Statutory completeness per OQ-02: State + 6-digit PIN code
        is_complete = bool(detected_state and pin_code)

        if not detected_state and not pin_code and not entity_name:
            address_keywords = ["plot", "sector", "road", "phase", "street", "industrial", "area", "village", "taluka", "dist", "district"]
            if not any(k in norm_text.lower() for k in address_keywords):
                return None

        return {
            "name": entity_name,
            "address_line": norm_text.strip(),
            "state": detected_state,
            "pin_code": pin_code,
            "is_complete": is_complete,
        }

    @classmethod
    def check_consumer_care_completeness(cls, full_text: str) -> Dict[str, Any]:
        """Validates presence of all 4 Consumer Care tuples under Rule 6(1)(n).

        Tuples: Contact Person/Department, Postal Address, Phone Number, Email.
        """
        norm_text = cls.convert_indic_digits(full_text)

        email_pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
        phone_pattern = re.compile(
            r"(?:(?:tel|phone|contact|toll[- ]free|helpline|call)?\s*[:\-]?\s*)?"
            r"(\+?91[-\s]?)?(?:1800[-\s]?[0-9]{2,4}[-\s]?[0-9]{3,4}|[1-9][0-9]{9}|0\d{2,4}[-\s]?[0-9]{6,8})",
            re.IGNORECASE
        )

        email_match = email_pattern.search(norm_text)
        phone_match = phone_pattern.search(norm_text)

        has_email = bool(email_match)
        has_phone = bool(phone_match)
        has_address = bool(re.search(
            r"\b(address|plot|sector|road|phase|delhi|mumbai|bangalore|bengaluru|haryana|pune|chennai|kolkata)\b",
            norm_text,
            re.IGNORECASE
        ))
        has_contact_name = bool(re.search(
            r"\b(manager|executive|officer|customer\s*care|consumer\s*care|nodal\s*officer)\b",
            norm_text,
            re.IGNORECASE
        ))

        is_complete = has_email and has_phone and has_address and has_contact_name
        return {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_address": has_address,
            "has_contact_name": has_contact_name,
            "is_complete": is_complete,
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0).strip() if phone_match else None,
        }

    @classmethod
    def parse_country_of_origin(cls, text: str) -> Optional[str]:
        """Extracts Country of Origin under Rule 6(1)(p).

        Matches: 'Country of Origin: India', 'Made in India', 'Product of India'.
        """
        norm_text = cls.convert_indic_digits(text)
        origin_pattern = re.compile(
            r"(?:Country\s*of\s*Origin|Made\s*in|Product\s*of)\s*[:\-]?\s*([A-Za-z\s]+)",
            re.IGNORECASE
        )
        match = origin_pattern.search(norm_text)
        if match:
            country = match.group(1).strip()
            country = re.split(r"[,;.\n]", country)[0].strip()
            if country:
                return country
        return None

