"""Deterministic Semantic Parsers for Statutory Packaged Commodities Declarations (SIH26034)

Fulfills:
- Rule 6 of the Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules, 2011)
- Section 11 & Rule 12: Prohibited non-standard metric symbols and unit standardization
- Section 63 Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023): Deterministic, auditable evidence
- Working Default OQ-02: State + 6-digit PIN is statutory minimum for complete address
"""

import re
from typing import Any, Dict, List, Optional, Set, Tuple


# Devanagari numeral conversion mapping (०-९ -> 0-9)
DEVANAGARI_DIGITS_MAP = str.maketrans("०१२३४५६७८९", "0123456789")

# Prohibited units: Strictly capitalized 'ML' or 'Ml' or 'M.L.' (whereas lowercase 'ml' or standard 'mL' is valid)
# Under Section 11 & Rule 12, capitalized 'ML' represents Mega-Litre (1,000,000 litres), an illegal declaration.
# Detects ML, Ml, M.L., M.L, M.l., M.l without trailing character bounds.
BANNED_UNITS_CASE_SENSITIVE = re.compile(
    r"(?<![a-zA-Z])(?:ML|Ml|M\.?\s*L\.?|M\.?\s*l\.?)(?![a-zA-Z])"
)

# Prohibited non-standard metric symbols (case-insensitive)
# Under Section 11 & Rule 12: gms, gm, g.m., g.m.s., Kgs, kgms, ltrs, ltr, LTR, cc, c.c., etc. are strictly prohibited.
# Punctuation on units: Under Rule 12(b), symbols of units shall not be followed by a period or pluralized (e.g. 'g.', 'kg.', 'ml.', 'l.').
BANNED_UNITS_CASE_INSENSITIVE = re.compile(
    r"(?<![a-zA-Z\.])(?:g\.?\s*m\.?\s*s+\.?|gms\.?|g\.m\.s?\.?|g\.m\.?|g\.|kgms\.?|kgs\.?|k\.\s*g\.?|kg\.|ltrs\.?|ltr\.?|l\.\s*t\.\s*r\.?\s*s?\.?|l\.|ml\.|liters|litres|kilos?|mtrs?|cms|mms|ग्राम्स|जी\.?\s*एम\.?)(?![a-zA-Z])",
    re.IGNORECASE
)

# Prohibited lowercase or mixed 'gm' / 'g.m.' symbols (strictly guarding against uppercase 'GM' which denotes General Manager or GM Foods)
BANNED_GM_GENERAL = re.compile(
    r"(?<![a-zA-Z])(?:gm\.?|g\.m\.?)(?![a-zA-Z])"
)

# Prohibited uppercase 'GM' or 'G.M.' strictly when accompanied by numeric quantity, slash, or rate
BANNED_GM_UPPERCASE_WITH_QTY = re.compile(
    r"(?:(?<=[0-9])\s*|(?<=/)\s*|(?<=per\s))\s*G\.?M\.?(?![a-zA-Z])"
)

# Prohibited 'cc' or 'c.c.' strictly when accompanied by numeric quantity, slash, or rate (guards against 'CC: email')
BANNED_CC_WITH_QTY = re.compile(
    r"(?:(?<=[0-9])\s*|(?<=/)\s*|(?<=per\s))\s*c\.?\s*c\.?(?![a-zA-Z])",
    re.IGNORECASE
)


# Standardized Indian States and Union Territories (28 States + 8 UTs + historical variants)
INDIAN_STATES_AND_UTS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
    "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep",
    "Puducherry", "New Delhi", "Orissa", "Pondicherry", "Uttaranchal",
    # Hindi Devanagari state names
    "आंध्र प्रदेश", "अरुणाचल प्रदेश", "असम", "बिहार", "छत्तीसगढ़", "गोवा", "गुजरात",
    "हरियाणा", "हिमाचल प्रदेश", "झारखंड", "कर्नाटक", "केरल", "मध्य प्रदेश", "महाराष्ट्र",
    "मणिपुर", "मेघालय", "मिजोरम", "नागालैंड", "ओडिशा", "पंजाब", "राजस्थान", "सिक्किम",
    "तमिलनाडु", "तेलंगाना", "त्रिपुरा", "उत्तर प्रदेश", "उत्तराखंड", "पश्चिम बंगाल", "दिल्ली"
]

# State two-letter postal abbreviations
STATE_ABBREVIATIONS: Dict[str, str] = {
    "MH": "Maharashtra", "DL": "Delhi", "KA": "Karnataka", "TN": "Tamil Nadu", "WB": "West Bengal",
    "TS": "Telangana", "TG": "Telangana", "AP": "Andhra Pradesh", "GJ": "Gujarat", "RJ": "Rajasthan",
    "UP": "Uttar Pradesh", "U.P.": "Uttar Pradesh", "MP": "Madhya Pradesh", "M.P.": "Madhya Pradesh",
    "BR": "Bihar", "JH": "Jharkhand", "CG": "Chhattisgarh", "OD": "Odisha", "OR": "Odisha",
    "HR": "Haryana", "PB": "Punjab", "UK": "Uttarakhand", "UA": "Uttarakhand", "AS": "Assam",
    "KL": "Kerala", "GA": "Goa", "HP": "Himachal Pradesh", "H.P.": "Himachal Pradesh", "JK": "Jammu and Kashmir",
    "J&K": "Jammu and Kashmir", "CH": "Chandigarh", "PY": "Puducherry"
}

# Major commercial cities and FMCG manufacturing hubs unambiguously mapped to Indian States
MAJOR_CITIES_TO_STATE: Dict[str, str] = {
    "mumbai": "Maharashtra", "bombay": "Maharashtra", "pune": "Maharashtra", "nagpur": "Maharashtra",
    "thane": "Maharashtra", "nashik": "Maharashtra", "aurangabad": "Maharashtra", "navi mumbai": "Maharashtra",
    "delhi": "Delhi", "new delhi": "Delhi",
    "bengaluru": "Karnataka", "bangalore": "Karnataka", "mysore": "Karnataka", "mysuru": "Karnataka", "hubli": "Karnataka",
    "chennai": "Tamil Nadu", "madras": "Tamil Nadu", "coimbatore": "Tamil Nadu", "madurai": "Tamil Nadu",
    "kolkata": "West Bengal", "calcutta": "West Bengal", "howrah": "West Bengal", "siliguri": "West Bengal",
    "hyderabad": "Telangana", "secunderabad": "Telangana", "warangal": "Telangana",
    "ahmedabad": "Gujarat", "surat": "Gujarat", "vadodara": "Gujarat", "baroda": "Gujarat", "rajkot": "Gujarat", "anand": "Gujarat",
    "vapi": "Gujarat", "ankleshwar": "Gujarat",
    "jaipur": "Rajasthan", "jodhpur": "Rajasthan", "kota": "Rajasthan", "udaipur": "Rajasthan",
    "lucknow": "Uttar Pradesh", "kanpur": "Uttar Pradesh", "noida": "Uttar Pradesh", "greater noida": "Uttar Pradesh",
    "ghaziabad": "Uttar Pradesh", "varanasi": "Uttar Pradesh", "agra": "Uttar Pradesh", "prayagraj": "Uttar Pradesh",
    "patna": "Bihar", "ranchi": "Jharkhand", "jamshedpur": "Jharkhand", "bhopal": "Madhya Pradesh",
    "indore": "Madhya Pradesh", "gwalior": "Madhya Pradesh", "jabalpur": "Madhya Pradesh", "raipur": "Chhattisgarh",
    "bhubaneswar": "Odisha", "cuttack": "Odisha",
    "chandigarh": "Chandigarh", "gurgaon": "Haryana", "gurugram": "Haryana", "faridabad": "Haryana", "manesar": "Haryana",
    "ludhiana": "Punjab", "amritsar": "Punjab",
    "dehradun": "Uttarakhand", "haridwar": "Uttarakhand", "roorkee": "Uttarakhand", "pantnagar": "Uttarakhand", "rudrapur": "Uttarakhand",
    "baddi": "Himachal Pradesh", "solan": "Himachal Pradesh", "nalagarh": "Himachal Pradesh", "parwanoo": "Himachal Pradesh",
    "guwahati": "Assam", "silvassa": "Dadra and Nagar Haveli", "daman": "Daman and Diu",
    "visakhapatnam": "Andhra Pradesh", "vizag": "Andhra Pradesh", "vijayawada": "Andhra Pradesh", "sri city": "Andhra Pradesh", "chittoor": "Andhra Pradesh",
    "kochi": "Kerala", "cochin": "Kerala", "thiruvananthapuram": "Kerala", "trivandrum": "Kerala", "panaji": "Goa", "bicholim": "Goa",
    "kanchipuram": "Tamil Nadu", "hosur": "Tamil Nadu", "thiruvallur": "Tamil Nadu", "sriperumbudur": "Tamil Nadu",
    "sanand": "Gujarat", "morbi": "Gujarat", "mehsana": "Gujarat",
    "bhiwadi": "Rajasthan", "alwar": "Rajasthan", "neemrana": "Rajasthan",
    "sonipat": "Haryana", "panipat": "Haryana", "kundli": "Haryana"
}

# High-precision 3-digit PIN prefix overrides for sub-state regions and Union Territories
PIN_3DIGIT_TO_STATE: Dict[str, str] = {
    "403": "Goa",
    "248": "Uttarakhand", "249": "Uttarakhand", "263": "Uttarakhand",
    "605": "Puducherry", "609": "Puducherry",
    "737": "Sikkim",
    "744": "Andaman and Nicobar Islands",
    "790": "Arunachal Pradesh", "791": "Arunachal Pradesh", "792": "Arunachal Pradesh",
    "793": "Meghalaya", "794": "Meghalaya",
    "795": "Manipur",
    "796": "Mizoram",
    "797": "Nagaland",
    "799": "Tripura"
}

# PIN prefix (first 2 digits) deterministic mapping to Indian State/UT
PIN_PREFIX_TO_STATE: Dict[str, str] = {
    "11": "Delhi",
    "12": "Haryana", "13": "Haryana",
    "14": "Punjab", "15": "Punjab",
    "16": "Chandigarh",
    "17": "Himachal Pradesh",
    "18": "Jammu and Kashmir", "19": "Jammu and Kashmir",
    "20": "Uttar Pradesh", "21": "Uttar Pradesh", "22": "Uttar Pradesh", "23": "Uttar Pradesh",
    "24": "Uttar Pradesh", "25": "Uttar Pradesh", "26": "Uttar Pradesh", "27": "Uttar Pradesh", "28": "Uttar Pradesh",
    "30": "Rajasthan", "31": "Rajasthan", "32": "Rajasthan", "33": "Rajasthan", "34": "Rajasthan",
    "36": "Gujarat", "37": "Gujarat", "38": "Gujarat", "39": "Gujarat",
    "40": "Maharashtra", "41": "Maharashtra", "42": "Maharashtra", "43": "Maharashtra", "44": "Maharashtra",
    "45": "Madhya Pradesh", "46": "Madhya Pradesh", "47": "Madhya Pradesh", "48": "Madhya Pradesh",
    "49": "Chhattisgarh",
    "50": "Telangana",
    "51": "Andhra Pradesh", "52": "Andhra Pradesh", "53": "Andhra Pradesh",
    "56": "Karnataka", "57": "Karnataka", "58": "Karnataka", "59": "Karnataka",
    "60": "Tamil Nadu", "61": "Tamil Nadu", "62": "Tamil Nadu", "63": "Tamil Nadu", "64": "Tamil Nadu",
    "67": "Kerala", "68": "Kerala", "69": "Kerala",
    "70": "West Bengal", "71": "West Bengal", "72": "West Bengal", "73": "West Bengal", "74": "West Bengal",
    "75": "Odisha", "76": "Odisha", "77": "Odisha",
    "78": "Assam", "79": "Assam",
    "80": "Bihar", "81": "Bihar", "82": "Bihar", "83": "Jharkhand", "84": "Bihar", "85": "Bihar"
}

# Multilingual month names (English and Hindi)
MONTH_NAMES: Dict[str, int] = {
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
    "dec": 12, "december": 12,
    "जनवरी": 1, "फ़रवरी": 2, "फरवरी": 2, "मार्च": 3, "अप्रैल": 4, "मई": 5,
    "जून": 6, "जुलाई": 7, "अगस्त": 8, "सितंबर": 9, "अक्टूबर": 10, "नवंबर": 11, "दिसंबर": 12
}

# Word to number mapping for best before duration
WORD_TO_MONTHS: Dict[str, int] = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
    "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12,
    "eighteen": 18, "twenty four": 24, "twenty-four": 24, "thirty six": 36
}

# Recognized countries for origin isolation
RECOGNIZED_COUNTRIES = [
    "India", "Bharat", "China", "Thailand", "Vietnam", "Bangladesh", "USA", "United States",
    "Germany", "Japan", "United Kingdom", "UK", "France", "Italy", "Switzerland", "Sri Lanka",
    "Nepal", "Bhutan", "Malaysia", "Indonesia", "Taiwan", "South Korea", "Korea", "Brazil",
    "Mexico", "Canada", "Australia", "New Zealand", "Spain", "Netherlands", "Turkey", "UAE",
    "PRC", "P.R.C."
]

# Complete suite of recognized statutory valid units (SI, length, area, volume, count, and Devanagari)
RECOGNIZED_VALID_UNITS: Set[str] = {
    # Mass
    "g", "gram", "grams", "gramme", "grammes", "kg", "kilogram", "kilograms", "mg", "milligram", "milligrams",
    # Volume
    "ml", "l", "litre", "litres", "liter", "liters", "cl", "centilitre", "centilitres",
    # Length
    "m", "meter", "meters", "metre", "metres", "cm", "centimeter", "centimeters", "centimetre", "centimetres", "mm", "millimeter", "millimeters",
    # Area
    "sq m", "sq cm", "sq mm", "sq.m", "sq.cm", "sq.mm", "m2", "cm2", "mm2", "m²", "cm²", "mm²",
    "square metre", "square metres", "square meter", "square meters", "square centimetre", "square centimetres", "square centimeter", "square centimeters",
    # Count / Units (LMPC Second Schedule)
    "n", "u", "units", "unit", "pcs", "piece", "pieces", "nos", "nos.", "no", "no.", "items", "item",
    "sachets", "sachet", "tablets", "tablet", "capsules", "capsule", "packs", "pack",
    "pair", "pairs", "sheet", "sheets", "wipe", "wipes", "set", "sets", "roll", "rolls",
    # Hindi Devanagari units
    "ग्राम", "ग्रा", "ग्रा.", "किग्रा", "कि.ग्रा.", "कि.ग्रा", "किलोग्राम", "मिली", "मि.ली.", "मि.ली", "मिलीलीटर", "लीटर", "ली", "ली.", "मीटर", "मी", "मी.", "सेंटीमीटर", "सेमी", "से.मी.", "से.मी", "नग", "इकाई"
}


class StatutoryDeclarationParser:
    """Deterministic, auditable parsers for statutory packaging declarations."""

    @staticmethod
    def convert_indic_digits(text: str) -> str:
        """Converts Devanagari numerals (०-९) and fractions to standard ASCII decimal digits (0-9)."""
        if not text:
            return ""
        converted = text.translate(DEVANAGARI_DIGITS_MAP)
        # Normalize Unicode vulgar fractions
        converted = converted.replace("½", "0.5").replace("¼", "0.25").replace("¾", "0.75")
        return converted

    @classmethod
    def detect_banned_units(cls, text: str) -> Tuple[bool, Optional[str]]:
        """Flags non-standard prohibited unit symbols under Section 11 & Rule 12.

        Distinguishes banned capitalized 'ML' from statutory valid 'ml' or 'mL'.
        Detects prohibited 'gms', 'gm', 'g.m.', 'g.m', 'g.m.s.', 'g.m.s', 'Kgs', 'kgms',
        'k.g.', 'k.g', 'ltrs', 'ltr', 'LTR', 'cc', 'c.c.', 'c.c', 'g.', 'kg.', 'ml.', 'l.', etc.
        Guards strictly against false positives inside:
        - Email domains (e.g. 'care@ml.com')
        - Website URLs (e.g. 'www.ml.com')
        - Latin abbreviations (e.g. 'e.g.', 'i.e.', 'etc.')
        - Technology terms (e.g. 'AI/ML', 'Machine Learning')
        - Corporate titles/entities ('GM Foods', 'GM Operations', 'Non-GM')
        - Email recipient headers ('CC: care@...')
        """
        if not text:
            return False, None

        # Mask email addresses and web URLs to avoid false positives on domains (e.g. care@ml.com, www.ml.com)
        masked_text = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", " ", text)
        masked_text = re.sub(r"https?://\S+|www\.[A-Za-z0-9.-]+\.[A-Za-z]{2,}\S*", " ", masked_text)

        # Mask Latin abbreviations containing periods or 'g' to prevent false positive 'g.' (e.g. 'e.g. with milk', 'i.e.')
        masked_text = re.sub(r"\b(?:e\.?\s*g\.?|i\.?\s*e\.?|etc\.?)\b", " ", masked_text, flags=re.IGNORECASE)

        # Mask AI/ML technology acronyms to prevent false positive 'ML' on smart IoT / devices
        masked_text = re.sub(
            r"(?:\bAI\s*/\s*ML\b|\bML\s*/\s*AI\b|\bMachine\s*Learning\s*(?:\(\s*ML\s*\)|\b)|\bML\s*model\b|\bML\s*algorithm\b)",
            " ",
            masked_text,
            flags=re.IGNORECASE
        )

        # Mask corporate names and designations starting with uppercase GM (e.g. GM Foods, GM - Operations, Non-GM)
        masked_text = re.sub(
            r"\b(?:Non-GM|GM\s*(?:-|:)?\s*(?:Foods|Enterprises|Motors|Breweries|Laboratories|Pharma|Products|Industries|Operations|Sales|Quality|Plant|Director|Manager|Executive|Officer|Unit|Works|Ltd|Limited|Pvt|LLP|Corp|Inc|Tech)\b)",
            " ",
            masked_text,
            flags=re.IGNORECASE
        )

        # 1. Check case-sensitive banned symbols first (capitalized 'ML', 'Ml', 'M.L.', 'M.L')
        cs_match = BANNED_UNITS_CASE_SENSITIVE.search(masked_text)
        if cs_match:
            return True, cs_match.group(0).strip()

        # 2. Check general prohibited symbols (case-insensitive)
        ci_match = BANNED_UNITS_CASE_INSENSITIVE.search(masked_text)
        if ci_match:
            return True, ci_match.group(0).strip()

        # 3. Check prohibited lowercase or mixed 'gm' / 'g.m.'
        gm_match = BANNED_GM_GENERAL.search(masked_text)
        if gm_match:
            return True, gm_match.group(0).strip()

        # 4. Check prohibited uppercase 'GM' when accompanied by quantity or unit position
        gm_num_match = BANNED_GM_UPPERCASE_WITH_QTY.search(masked_text)
        if gm_num_match:
            return True, gm_num_match.group(0).strip()

        # 5. Check prohibited 'cc' / 'c.c.' accompanied by quantity
        cc_match = BANNED_CC_WITH_QTY.search(masked_text)
        if cc_match:
            return True, cc_match.group(0).strip()

        return False, None

    @classmethod
    def parse_net_quantity(cls, text: str) -> Optional[Dict[str, Any]]:
        """Extracts net quantity magnitude and metric unit, evaluating prohibited symbols.

        Handles mass (g, kg, mg), volume (ml, l, cl), length (m, cm, mm),
        area (sq m, sq cm, m²), count (N, U, units, pcs, nos), and Devanagari Hindi units.
        Supports:
        - Multi-pack and wholesale declarations under Rule 24: '4 x 50 g', '4 N x 50 g = 200 g',
          'Pack of 3 x 100 g', '10 sachets x 2 g each', computing total mass/volume and disallowing 'x' as unit.
        - Dual bracketed quantities: '500 ml (450 g)'.
        - Comma-separated numbers (1,000 or 1, 000), fractions (1/2, ½),
          leading-dot decimals (.5), and Devanagari numerals.
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)

        # 0. Check Multi-Pack / Multi-Piece Wholesale Syntax (Rule 24 & Rule 6(1)(c))
        # e.g. "Net Qty: 4 x 50 g", "4 N x 50 g = 200 g", "Pack of 3 x 100 g", "10 sachets x 2 g", "2 pairs x 1 set"
        multipack_pattern = re.compile(
            r"(?:Net\s*(?:Quantity|Qty\.?|Weight|Wt\.?|Content|Contents|Volume|Vol\.?|Mass)|Quantity|Qty\.?|Pack\s*of|शुद्ध\s*(?:मात्रा|भार|वजन|सामग्री)|निवल\s*(?:मात्रा|भार|वजन|सामग्री))?\s*[:\-]?\s*"
            r"(?:([0-9]+)\s*(?:N|U|units?|pcs|nos?|pieces?|sachets?|packs?|bars?|bottles?|cans?|pairs?|sheets?|wipes?|sets?|rolls?|tablets?|capsules?|नग|इकाई)?\s*(?:of)?\s*[xX*×]\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z²³\.\u0900-\u097F]+))"
            r"(?:\s*(?:=|Total\s*[:\-]?|\(Total\s*[:\-]?)\s*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z²³\.\u0900-\u097F]+)\)?)?",
            re.IGNORECASE
        )
        multi_match = multipack_pattern.search(norm_text)
        if multi_match:
            count_str, piece_mag_str, piece_unit_raw, total_mag_str, total_unit_raw = multi_match.groups()
            try:
                count_val = float(count_str)
                piece_mag_val = float(piece_mag_str)
                if count_val > 0 and piece_mag_val > 0:
                    cand_unit_word = piece_unit_raw.strip().split()[0].lower() if piece_unit_raw.strip() else ""
                    has_banned_multi, banned_sym_multi = cls.detect_banned_units(piece_unit_raw)

                    # Only proceed if piece unit is recognized or banned
                    if has_banned_multi or cand_unit_word in RECOGNIZED_VALID_UNITS:
                        if total_mag_str:
                            total_mag = float(total_mag_str.replace(",", ""))
                            clean_unit_str = total_unit_raw or piece_unit_raw
                        else:
                            total_mag = round(count_val * piece_mag_val, 4)
                            clean_unit_str = piece_unit_raw

                        clean_unit_word = clean_unit_str.strip().split()[0]
                        has_banned, banned_sym = cls.detect_banned_units(clean_unit_word)
                        if not has_banned and clean_unit_word.lower() in ("gm", "gms", "kgms", "kgs", "ltrs", "ltr", "cc"):
                            has_banned = True
                            banned_sym = clean_unit_word
                        if not has_banned:
                            has_banned, banned_sym = cls.detect_banned_units(clean_unit_str)
                        if not has_banned and multi_match:
                            has_banned, banned_sym = cls.detect_banned_units(multi_match.group(0))

                        # Standardize valid units
                        if not has_banned:
                            u_lower = clean_unit_word.lower()
                            if u_lower in ("g", "gram", "grams", "gramme", "grammes", "ग्राम", "ग्रा", "ग्रा."):
                                clean_unit_word = "g"
                            elif u_lower in ("kg", "kilogram", "kilograms", "किग्रा", "कि.ग्रा.", "कि.ग्रा", "किलोग्राम"):
                                clean_unit_word = "kg"
                            elif u_lower in ("mg", "milligram", "milligrams"):
                                clean_unit_word = "mg"
                            elif u_lower in ("ml", "millilitre", "millilitres", "मिली", "मि.ली.", "मि.ली", "मिलीलीटर"):
                                clean_unit_word = "ml"
                            elif u_lower in ("l", "litre", "litres", "liter", "liters", "लीटर", "ली", "ली."):
                                clean_unit_word = "l"
                            elif u_lower in ("cl", "centilitre", "centilitres"):
                                clean_unit_word = "cl"
                            elif u_lower in ("m", "meter", "meters", "metre", "metres", "मीटर", "मी", "मी."):
                                clean_unit_word = "m"
                            elif u_lower in ("cm", "centimeter", "centimeters", "centimetre", "centimetres", "सेंटीमीटर", "सेमी", "से.मी.", "से.मी"):
                                clean_unit_word = "cm"
                            elif u_lower in ("mm", "millimeter", "millimeters"):
                                clean_unit_word = "mm"

                        return {
                            "magnitude": total_mag,
                            "unit": clean_unit_word,
                            "has_banned_unit": has_banned,
                            "banned_unit_found": banned_sym,
                            "piece_count": int(count_val),
                            "piece_magnitude": piece_mag_val,
                        }
            except (ValueError, IndexError):
                pass

        # Regex for magnitude supporting standard floats, comma numbers (with spaces), leading dots, and simple fractions
        mag_pattern = r"(?:([0-9]+)\s*/\s*([0-9]+)|([0-9]+(?:,\s*[0-9]+)*(?:\.[0-9]+)?|\.[0-9]+))"
        unit_pattern = r"([a-zA-Z²³\.\u0900-\u097F]+(?:\s+[a-zA-Z²³\.\u0900-\u097F]+)?|\b[NU]\b)"

        # 1. Match with explicit quantity prefix (highest priority)
        prefix_pattern = (
            r"(?:Net\s*(?:Quantity|Qty\.?|Weight|Wt\.?|Content|Contents|Volume|Vol\.?|Mass|Area)|Quantity|Qty\.?|शुद्ध\s*(?:मात्रा|भार|वजन|सामग्री)|निवल\s*(?:मात्रा|भार|वजन|सामग्री)|मात्रा|वजन)"
            r"\s*[:\-]?\s*"
            rf"{mag_pattern}"
            r"\s*"
            rf"{unit_pattern}"
        )
        match = re.search(prefix_pattern, norm_text, re.IGNORECASE)

        # 2. Fallback to standalone magnitude + unit if recognized
        if not match:
            standalone_pattern = re.compile(
                rf"(?<![a-zA-Z0-9]){mag_pattern}\s*{unit_pattern}"
            )
            for m in standalone_pattern.finditer(norm_text):
                f_num, f_den, f_dec, cand_unit_raw = m.group(1), m.group(2), m.group(3), m.group(4)
                words = cand_unit_raw.strip().split()
                first_w = words[0].lower() if words else ""
                two_w = f"{words[0]} {words[1]}".lower() if len(words) >= 2 else ""

                has_banned_cand, _ = cls.detect_banned_units(cand_unit_raw)
                if (has_banned_cand or
                    first_w in RECOGNIZED_VALID_UNITS or
                    two_w in RECOGNIZED_VALID_UNITS or
                    cand_unit_raw in ("N", "U")):
                    match = m
                    break

        if not match:
            return None

        frac_num, frac_den, decimal_raw, unit_raw = match.group(1), match.group(2), match.group(3), match.group(4)

        if frac_num and frac_den:
            try:
                magnitude = float(frac_num) / float(frac_den)
            except (ValueError, ZeroDivisionError):
                return None
        elif decimal_raw:
            clean_num_str = decimal_raw.replace(",", "").replace(" ", "")
            try:
                magnitude = float(clean_num_str)
            except ValueError:
                return None
        else:
            return None

        if magnitude <= 0:
            return None

        # Resolve unit: avoid greedily consuming trailing packaging words (e.g. 'g when packed')
        unit_words = unit_raw.strip().split()
        if not unit_words:
            return None

        clean_unit = unit_words[0]

        # Strictly disallow multiplication operators 'x', 'X', '×' as units
        if clean_unit.lower() in ("x", "×", "*"):
            return None

        if len(unit_words) >= 2:
            candidate_two_word = f"{unit_words[0]} {unit_words[1]}".lower()
            if candidate_two_word in RECOGNIZED_VALID_UNITS:
                clean_unit = f"{unit_words[0]} {unit_words[1]}"

        # Check for banned units in clean_unit, the full unit_raw, and the matched quantity declaration
        has_banned, banned_sym = cls.detect_banned_units(clean_unit)
        if not has_banned and clean_unit.lower() in ("gm", "gms", "kgms", "kgs", "ltrs", "ltr", "cc"):
            has_banned = True
            banned_sym = clean_unit
        if not has_banned:
            has_banned, banned_sym = cls.detect_banned_units(unit_raw)
        if not has_banned and match:
            has_banned, banned_sym = cls.detect_banned_units(match.group(0))

        # Standardize metric units when valid
        if not has_banned:
            u_lower = clean_unit.lower()
            if u_lower in ("g", "gram", "grams", "gramme", "grammes", "ग्राम", "ग्रा", "ग्रा."):
                clean_unit = "g"
            elif u_lower in ("kg", "kilogram", "kilograms", "किग्रा", "कि.ग्रा.", "कि.ग्रा", "किलोग्राम"):
                clean_unit = "kg"
            elif u_lower in ("mg", "milligram", "milligrams"):
                clean_unit = "mg"
            elif u_lower in ("ml", "millilitre", "millilitres", "मिली", "मि.ली.", "मि.ली", "मिलीलीटर"):
                clean_unit = "ml"
            elif u_lower in ("l", "litre", "litres", "liter", "liters", "लीटर", "ली", "ली."):
                clean_unit = "l"
            elif u_lower in ("cl", "centilitre", "centilitres"):
                clean_unit = "cl"
            elif u_lower in ("m", "meter", "meters", "metre", "metres", "मीटर", "मी", "मी."):
                clean_unit = "m"
            elif u_lower in ("cm", "centimeter", "centimeters", "centimetre", "centimetres", "सेंटीमीटर", "सेमी", "से.मी.", "से.मी"):
                clean_unit = "cm"
            elif u_lower in ("mm", "millimeter", "millimeters"):
                clean_unit = "mm"
            elif u_lower in ("sq m", "m2", "m²", "sq.m", "square metre", "square metres", "square meter", "square meters"):
                clean_unit = "sq m"
            elif u_lower in ("sq cm", "cm2", "cm²", "sq.cm", "square centimetre", "square centimetres", "square centimeter", "square centimeters"):
                clean_unit = "sq cm"
            elif u_lower in ("sq mm", "mm2", "mm²", "sq.mm"):
                clean_unit = "sq mm"
            elif u_lower in (
                "n", "u", "units", "unit", "pcs", "piece", "pieces", "nos", "nos.", "no", "no.",
                "items", "item", "sachets", "sachet", "tablets", "tablet", "capsules", "capsule",
                "packs", "pack", "pair", "pairs", "sheet", "sheets", "wipe", "wipes", "set", "sets", "roll", "rolls",
                "नग", "इकाई"
            ):
                clean_unit = "N"

        return {
            "magnitude": magnitude,
            "unit": clean_unit,
            "has_banned_unit": has_banned,
            "banned_unit_found": banned_sym,
        }

    @classmethod
    def parse_mrp(cls, text: str) -> Optional[Dict[str, Any]]:
        """Parses Maximum Retail Price (MRP) amount and checks mandatory tax inclusivity clause.

        Under Rule 6(1)(e), declaration must state '(incl. of all taxes)'.
        Guards strictly against Unit Sale Price (USP) declarations (e.g. 'USP: Rs. 0.40/g')
        falsely evaluated as MRP amounts.
        Handles intermediate tax clauses, currency indicators (Rs., INR, ₹),
        Indian comma formatting (1,499.00 or 1, 499.00), and Devanagari numerals.
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)

        # Tax inclusivity clause patterns per Rule 6(1)(e)
        tax_inclusive_patterns = [
            r"inc[l]?(?:usive|\.)?\s*(?:of)?\s*all\s*(?:taxes?|gst)",
            r"inc[l]?(?:usive|\.)?\s*(?:of)?\s*(?:taxes?|gst)",
            r"all\s*(?:taxes?|gst)\s*inc[l]?(?:uded|usive|\.)?",
            r"(?:taxes?|gst)\s*inc[l]?(?:uded|usive|\.)?",
            r"including\s*(?:of)?\s*all\s*(?:taxes?|gst)",
            r"including\s*(?:taxes?|gst)",
            r"inclusive\s*(?:of)?\s*(?:all\s*)?(?:taxes?|gst)",
            r"inc[l]?\.?\s*(?:taxes?|gst)",
            r"कर\s*सहित",
            r"सभी\s*कर(?:ों)?\s*सहित",
            r"कुल\s*कर\s*सहित",
            r"कर\s*शामिल",
            r"अतिरिक्त\s*कर\s*नहीं",
        ]
        tax_inclusive = any(re.search(p, norm_text, re.IGNORECASE) for p in tax_inclusive_patterns)

        mrp_prefix = r"(?:M\.?\s*R\.?\s*P\.?|Maximum\s*Retail\s*Price|Max\.?\s*Retail\s*Price|अ\.वि\.मू\.?|अधिकतम\s*खुदरा\s*मूल्य)"
        tax_clause_group = (
            r"(?:\([^)]*(?:tax|taxes|gst|कर)[^)]*\)|"
            r"inc[l]?(?:usive|\.)?\s*(?:of)?\s*all\s*(?:taxes?|gst)|"
            r"inc[l]?(?:usive|\.)?\s*(?:of)?\s*(?:taxes?|gst)|"
            r"all\s*(?:taxes?|gst)\s*included|"
            r"including\s*(?:of)?\s*all\s*(?:taxes?|gst)|"
            r"कर\s*सहित|सभी\s*कर(?:ों)?\s*सहित)"
        )
        curr = r"(?:Rs?\.?|R\s*s\.?|Re\.?|INR|₹|रु\.?|रू\.?|रुपये|रुपए)"
        amount_re = r"([0-9]+(?:,\s*[0-9]+)*(?:\s*\.\s*[0-9]{1,2})?)"

        # Pattern 1: Explicit MRP prefix, with optional intervening tax clause or currency
        p1 = re.compile(
            rf"{mrp_prefix}\s*(?:{tax_clause_group})?\s*[:\-]?\s*(?:{tax_clause_group})?\s*(?:{curr})?\s*[:\-]?\s*(?:{tax_clause_group})?\s*{amount_re}\s*(?:/-)?",
            re.IGNORECASE
        )
        match = p1.search(norm_text)

        # Pattern 2: Standalone currency symbol followed by amount (ONLY if NOT part of a USP declaration or discount)
        if not match:
            # Reject if string is explicitly marked as USP or contains unit denominator (/g, /ml, per unit)
            is_usp = bool(re.search(r"(?:USP|Unit\s*Sale\s*Price|/(?:\s*[a-zA-Z²³\.]+)|\bper\b)", norm_text, re.IGNORECASE))
            is_discount = bool(re.search(r"\b(?:save|discount|off|cashback)\b", norm_text, re.IGNORECASE))

            if not is_usp and not is_discount:
                p2 = re.compile(
                    rf"{curr}\s*[:\-]?\s*{amount_re}\s*(?:/-)?",
                    re.IGNORECASE
                )
                match = p2.search(norm_text)

        if not match:
            return None

        amount_str = match.group(1).replace(",", "").replace(" ", "")
        try:
            amount = float(amount_str)
            if amount <= 0:
                return None
        except ValueError:
            return None

        return {
            "amount": amount,
            "currency": "INR",
            "tax_inclusive": tax_inclusive,
        }

    @classmethod
    def parse_usp(cls, text: str) -> Optional[Dict[str, Any]]:
        """Extracts Unit Sale Price (USP) under Rule 6(1)(k) (G.S.R. 779(E)).

        Validates that denominator is a recognized metric or count unit
        (g, ml, 100g, 100ml, kg, l, piece, unit, N, U, etc.), guarding against
        arbitrary words or dates falsely parsed as units.
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)

        usp_prefix = r"(?:Unit\s*Sale\s*Price|USP|इकाई\s*विक्रय\s*मूल्य|इकाई\s*बिक्री\s*मूल्य)"
        curr = r"(?:Rs\.?|INR|₹|रु\.?|रू\.?|रुपये)?"
        amount_re = r"([0-9]+(?:,\s*[0-9]+)*(?:\.[0-9]{1,4})?)"
        # Restrict denominator strictly to recognized statutory metric and count units (with Unicode-safe word boundary for Indic matras)
        denom_re = r"((?:100\s*)?(?:g|kg|mg|ml|l|cl|m|cm|mm|sq\s*m|sq\s*cm|sq\s*mm|n|u|pieces?|pcs|units?|items?|nos?|tablets?|capsules?|sachets?|packs?|ग्राम|किग्रा|मिली|लीटर|मीटर|नग|इकाई))(?!\w|[\u0900-\u097F])"

        # Pattern 1: Explicit USP prefix
        p1 = re.compile(
            rf"{usp_prefix}\s*[:\-]?\s*{curr}\s*{amount_re}\s*(?:/|per|प्रति)\s*{denom_re}",
            re.IGNORECASE
        )
        match = p1.search(norm_text)

        # Pattern 2: Standalone 'Rs. X / g' or '₹ X per ml' or '₹ X / ग्राम'
        if not match:
            p2 = re.compile(
                rf"(?:Rs\.?|INR|₹|रु\.?|रू\.?|रुपये)\s*{amount_re}\s*(?:/|per|प्रति)\s*{denom_re}",
                re.IGNORECASE
            )
            match = p2.search(norm_text)

        if not match:
            return None

        price_str, unit_raw = match.groups()
        try:
            price = float(price_str.replace(",", "").replace(" ", ""))
            if price <= 0:
                return None
        except ValueError:
            return None

        clean_unit = unit_raw.strip().lower()
        clean_unit = re.sub(r"\s+", "", clean_unit)
        # Normalize piece/pieces -> piece, units -> unit, nos -> unit
        if clean_unit in ("pieces", "piece", "pcs"):
            clean_unit = "piece"
        elif clean_unit in ("units", "unit", "nos", "no"):
            clean_unit = "unit"
        elif clean_unit in ("n", "u"):
            clean_unit = "N"

        # Normalize Hindi Devanagari units
        hindi_usp_map = {
            "ग्राम": "g", "किग्रा": "kg", "मिली": "ml", "लीटर": "l", "मीटर": "m", "नग": "N", "इकाई": "N"
        }
        if clean_unit in hindi_usp_map:
            clean_unit = hindi_usp_map[clean_unit]
        elif clean_unit.startswith("100") and clean_unit[3:] in hindi_usp_map:
            clean_unit = f"100{hindi_usp_map[clean_unit[3:]]}"

        return {
            "price_per_unit": price,
            "unit": clean_unit,
        }

    @classmethod
    def parse_mfg_and_expiry_dates(cls, text: str) -> Dict[str, Any]:
        """Extracts manufacturing and expiry/best before dates under Rule 6(1)(d).

        Supports multiple date formats:
        - ISO 8601: YYYY-MM, YYYY/MM, YYYY-MM-DD
        - Standard: MM/YYYY, MM-YYYY, MM.YYYY, MM / YYYY (with spaces around delimiters)
        - Day dates: DD/MM/YYYY, DD-MM-YYYY, MM/DD/YYYY, DD/MM/YY
        - Alpha month dates: '15-Mar-2024', 'Mar 2024', 'March 2024'
        - Devanagari numerals and Hindi dates: 'उत्पादन तिथि: ०५/२०२४', 'मार्च २०२४'
        - Best before duration: 'Best before 12 months', 'Best before 180 days'
        """
        result: Dict[str, Any] = {
            "mfg_month": None,
            "mfg_year": None,
            "exp_month": None,
            "exp_year": None,
            "best_before_months": None,
        }

        if not text:
            return result

        norm_text = cls.convert_indic_digits(text)

        # 1. Best before duration (months or days)
        bb_pattern = re.compile(
            r"(?:best\s*before|use\s*before|best\s*by|within)\s*([0-9]+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|eighteen|twenty\s*four|twenty-four|thirty\s*six)\s*(months?|days?)",
            re.IGNORECASE
        )
        bb_match = bb_pattern.search(norm_text)
        if bb_match:
            bb_val = bb_match.group(1).lower().strip()
            bb_unit = bb_match.group(2).lower().strip()
            if bb_unit.startswith("month"):
                if bb_val.isdigit():
                    result["best_before_months"] = int(bb_val)
                elif bb_val in WORD_TO_MONTHS:
                    result["best_before_months"] = WORD_TO_MONTHS[bb_val]
            elif bb_unit.startswith("day") and bb_val.isdigit():
                # Convert days to approximate whole months (e.g. 90 days = 3 months, 180 days = 6 months)
                result["best_before_months"] = max(1, round(int(bb_val) / 30.0))

        # Prefixes for Manufacturing and Expiry
        mfg_prefix = (
            r"(?:Manufactured(?:\s*Date)?|Mfg(?:\s*Date)?|Mfg\.?|Mfd(?:\s*Date)?|Mfd\.?|"
            r"Packed(?:\s*Date)?|Pkd(?:\s*Date)?|Packaging(?:\s*Date)?|Packing(?:\s*Date)?|"
            r"Date\s*of\s*(?:Mfg|Mfd|Manufacture|Packaging|Packing|Pkg\.?|Pkd\.?)|"
            r"उत्पादन\s*(?:तिथि|माह(?:\s*एवं\s*वर्ष)?|का\s*महीना)?|पैकिंग\s*(?:तिथि|माह)?|निर्माण\s*तिथि)"
        )
        exp_prefix = (
            r"(?:Exp(?:\s*Date)?|Expiry(?:\s*Date)?|Use\s*by|Use\s*before|Best\s*before|"
            r"Date\s*of\s*(?:Expiry|Exp\.?)|अवसान\s*तिथि|समाप्ति\s*तिथि|उपयोग\s*तिथि)"
        )

        def extract_date_from_text(prefix_re: str, target_text: str) -> Tuple[Optional[int], Optional[int]]:
            # Sub-pattern A: Named/Alpha month (e.g. '15-Mar-2024', 'Mar 2024', 'March 2024')
            alpha_re = re.compile(
                rf"{prefix_re}\s*[:\-]?\s*(?:(\d{{1,2}})\s*[\/\-\.\s]\s*)?([a-zA-Z\u0900-\u097F]+)\s*[\/\-\.\s,]?\s*(\d{{2,4}})",
                re.IGNORECASE
            )
            m_alpha = alpha_re.search(target_text)
            if m_alpha:
                _, m_name, yr_str = m_alpha.groups()
                m_clean = m_name.lower()[:3] if m_name.isascii() else m_name
                month = MONTH_NAMES.get(m_clean) or MONTH_NAMES.get(m_name.lower())
                yr = int(yr_str)
                year = yr + (2000 if yr < 100 else 0)
                if month and 2000 <= year <= 2035:
                    return month, year

            # Sub-pattern B: ISO numeric date (e.g. '2024-04', '2024/04', '2024-04-15')
            iso_re = re.compile(
                rf"{prefix_re}\s*[:\-]?\s*(20[2-3][0-9])\s*[\/\-\.]\s*(0[1-9]|1[0-2])(?:\s*[\/\-\.]\s*(?:[0-3]?[0-9]))?(?!\d)",
                re.IGNORECASE
            )
            m_iso = iso_re.search(target_text)
            if m_iso:
                year = int(m_iso.group(1))
                month = int(m_iso.group(2))
                return month, year

            # Sub-pattern C: Standard numeric date (e.g. '15/04/2024', '04/2024', '04 / 2024', '04-24')
            num_re = re.compile(
                rf"{prefix_re}\s*[:\-]?\s*(?:(\d{{1,2}})\s*[\/\-\.\s]\s*)?(\d{{1,2}})\s*[\/\-\.\s]\s*(\d{{2,4}})",
                re.IGNORECASE
            )
            m_num = num_re.search(target_text)
            if m_num:
                d1, d2, yr_str = m_num.groups()
                yr = int(yr_str)
                year = yr + (2000 if yr < 100 else 0)
                if d1 is not None:
                    val1, val2 = int(d1), int(d2)
                    # Disambiguate DD/MM/YYYY vs MM/DD/YYYY
                    if val2 > 12 and 1 <= val1 <= 12:
                        month = val1  # MM/DD/YYYY
                    elif 1 <= val2 <= 12:
                        month = val2  # DD/MM/YYYY
                    else:
                        month = None
                else:
                    val2 = int(d2)
                    month = val2 if 1 <= val2 <= 12 else None

                if month and 2000 <= year <= 2035:
                    return month, year

            return None, None

        # 2. Extract Manufacturing Date
        m_mfg, y_mfg = extract_date_from_text(mfg_prefix, norm_text)
        if m_mfg and y_mfg and 2000 <= y_mfg <= 2030:
            result["mfg_month"] = m_mfg
            result["mfg_year"] = y_mfg
        else:
            # Standalone fallback date check (e.g. '03/2024', '03 / 2024', '04.2024', '2024-04')
            sa_re = re.compile(r"(?<![0-9])(0[1-9]|1[0-2])\s*[\/\-\.]\s*(20[2-3][0-9]|[2-3][0-9])(?![0-9])")
            m_sa = sa_re.search(norm_text)
            if m_sa:
                month = int(m_sa.group(1))
                yr = int(m_sa.group(2))
                year = yr + (2000 if yr < 100 else 0)
                if 1 <= month <= 12 and 2000 <= year <= 2030:
                    result["mfg_month"] = month
                    result["mfg_year"] = year
            else:
                # Standalone ISO format: YYYY-MM or YYYY/MM or YYYY.MM (e.g. '2024-04')
                iso_sa_re = re.compile(r"(?<![0-9])(20[2-3][0-9])\s*[\/\-\.]\s*(0[1-9]|1[0-2])(?![0-9])")
                m_iso_sa = iso_sa_re.search(norm_text)
                if m_iso_sa:
                    year = int(m_iso_sa.group(1))
                    month = int(m_iso_sa.group(2))
                    if 1 <= month <= 12 and 2000 <= year <= 2030:
                        result["mfg_month"] = month
                        result["mfg_year"] = year

        # 3. Extract Expiry Date
        m_exp, y_exp = extract_date_from_text(exp_prefix, norm_text)
        if m_exp and y_exp:
            result["exp_month"] = m_exp
            result["exp_year"] = y_exp
        elif (not result["exp_month"] or not result["exp_year"]) and result["mfg_month"] and result["mfg_year"] and result["best_before_months"]:
            # Derive expiration date from manufacturing date + best before months
            total_months = result["mfg_month"] + result["best_before_months"]
            derived_year = result["mfg_year"] + (total_months - 1) // 12
            derived_month = ((total_months - 1) % 12) + 1
            if 2000 <= derived_year <= 2035:
                result["exp_month"] = derived_month
                result["exp_year"] = derived_year
                result["is_derived_expiry"] = True

        return result

    @classmethod
    def parse_pin_code(cls, text: str) -> Optional[str]:
        """Extracts a valid 6-digit Indian PIN code (100000 - 999999).

        Supports:
        - Standalone 6 digits: '700017', '400057'
        - Formatted with space/hyphen: '110 020', '560-001'
        Guards strictly against:
        - 10-digit phone numbers ('9876543210' must NOT match '987654')
        - 14-digit FSSAI numbers ('10014022001234' must NOT match '100140')
        - 15-character GSTINs ('27AAPFU0939F1ZV')
        - Batch numbers / Lot numbers ('Batch No: 110020' must NOT match)
        - Pricing values ('MRP: Rs. 100020' or '100020/-' must NOT match)
        - Metric or count quantities ('100020 units', '100020 kg' must NOT match)
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)

        disallowed_prefix_re = re.compile(
            r"\b(?:tel|phone|mob|call|fssai|lic(?:ence|ense)?\.?\s*(?:no\.?|number)|lic\.?\s*no\.?|batch|b\.?no|lot|invoice|barcode|ean|upc|cin(?:\s*no\.?)?|reg(?:n|d)?\.?\s*no\.?|registration\s*(?:no\.?|number)|mrp|rs|inr|price|exp|mfg|pkg)\b|[₹]",
            re.IGNORECASE
        )
        disallowed_suffix_tokens = [
            "/-", "₹", "rs", "inr", "g", "kg", "ml", "l", "pcs", "pieces",
            "units", "unit", "tablets", "capsules", "nos"
        ]

        pin_re = re.compile(r"(?<![a-zA-Z0-9])([1-9][0-9]{2})\s*[\-]?\s*([0-9]{3})(?![a-zA-Z0-9])")
        for m in pin_re.finditer(norm_text):
            cand = m.group(1) + m.group(2)
            start, end = m.span()

            prefix_window = norm_text[max(0, start - 20):start]
            suffix_window = norm_text[end:min(len(norm_text), end + 15)].lower().strip()

            # Disallow matches immediately preceded by telephone, batch, price, or license keywords
            if disallowed_prefix_re.search(prefix_window):
                continue

            # Disallow matches followed by price or measurement units
            if any(suffix_window.startswith(k) for k in disallowed_suffix_tokens):
                continue

            return cand

        return None

    @classmethod
    def parse_address(cls, text: str) -> Optional[Dict[str, Any]]:
        """Parses address tokens into entity name, address line, State, and 6-digit PIN code.

        Statutory completeness per Working Default OQ-02: State + 6-digit PIN code.
        Resolves State from:
        1. Explicit full State / UT names (English & Hindi)
        2. High-precision 3-digit PIN prefix mapping (e.g. 403 -> Goa, 248/249/263 -> Uttarakhand)
        3. Two-letter State abbreviations (MH, DL, KA, TN, WB, UP, MP, GJ, RJ, etc.)
        4. Major commercial Indian cities (Mumbai, Bengaluru, Kolkata, Haridwar, etc.)
        5. 2-digit PIN prefix fallback mapping (e.g. 40... -> Maharashtra)
        Extracts corporate/entity name from address starters or corporate suffixes.
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)

        # 1. Extract PIN code
        pin_code = cls.parse_pin_code(norm_text)

        # 2. Detect Indian State / UT
        detected_state: Optional[str] = None

        # Check explicit State names
        for state in INDIAN_STATES_AND_UTS:
            pattern = re.compile(r"\b" + re.escape(state) + r"\b", re.IGNORECASE)
            if pattern.search(norm_text):
                # Standardize variant names
                if state.lower() == "orissa":
                    detected_state = "Odisha"
                elif state.lower() == "pondicherry":
                    detected_state = "Puducherry"
                elif state.lower() == "uttaranchal":
                    detected_state = "Uttarakhand"
                elif state.lower() in ("new delhi", "दिल्ली"):
                    detected_state = "Delhi"
                elif state == "उत्तर प्रदेश":
                    detected_state = "Uttar Pradesh"
                elif state == "महाराष्ट्र":
                    detected_state = "Maharashtra"
                elif state == "गुजरात":
                    detected_state = "Gujarat"
                else:
                    detected_state = state
                break

        # Check high-precision 3-digit PIN prefix overrides first (e.g. 403 -> Goa, 249 -> Uttarakhand)
        if not detected_state and pin_code:
            prefix3 = pin_code[:3]
            if prefix3 in PIN_3DIGIT_TO_STATE:
                detected_state = PIN_3DIGIT_TO_STATE[prefix3]

        # Check State Abbreviations if not found
        if not detected_state:
            for abbr, full_state in STATE_ABBREVIATIONS.items():
                if re.search(r"\b" + re.escape(abbr) + r"\b", norm_text):
                    detected_state = full_state
                    break

        # Check major commercial cities mapped to states
        if not detected_state:
            for city, mapped_state in MAJOR_CITIES_TO_STATE.items():
                if re.search(r"\b" + re.escape(city) + r"\b", norm_text, re.IGNORECASE):
                    detected_state = mapped_state
                    break

        # Fallback: Infer State from 2-digit PIN code prefix
        if not detected_state and pin_code:
            prefix2 = pin_code[:2]
            if prefix2 in PIN_PREFIX_TO_STATE:
                detected_state = PIN_PREFIX_TO_STATE[prefix2]

        # 3. Detect Registered Corporate Entity Name
        entity_name: Optional[str] = None

        # Approach A: Extract entity anchored to address prefix (e.g. "Manufactured by: Krishna Dairy, ...", "Manufactured in India by: ABC Ltd")
        pref_anchor_re = re.compile(
            r"(?:Manufactured\s*(?:&|and)?\s*Packed\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|"
            r"Manufactured\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Mfd\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Mfg\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|"
            r"Packed\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Pkd\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Marketed\s*by|Imported\s*by|निर्माता(?:\s*एवं\s*पैकर)?|पैकर|निर्मित|आयातकर्ता)\s*[:\-]?\s*"
            r"([^,\n\r]+?)(?:,|\n|\r|Plot|Sector|Road|Phase|Industrial|Village|Dist|Taluka|City|Area|Ward|No\.|\b(?=[A-Z][a-z]+\s*-\s*[1-9]))",
            re.IGNORECASE
        )
        anchor_match = pref_anchor_re.search(norm_text)
        if anchor_match:
            cand_name = anchor_match.group(1).strip()
            # Clean trailing periods or dashes
            cand_name = cand_name.strip("- :")
            if len(cand_name) >= 3 and not cand_name.isdigit():
                entity_name = cand_name

        # Approach B: Fallback to corporate suffix pattern (English & Hindi)
        if not entity_name:
            corp_name_match = re.search(
                r"([a-zA-Z\u00C0-\u024F\u0900-\u097F0-9\s.,&'\-]+?(?:(?:Industries|Enterprises|Foods|Beverages|Consumer\s*Care|Laboratories|Pharma|Products|Dairy|Mills|Bakery|Herbals|Cosmetics|Naturals|उद्योग|फूड्स)\s+)?(?:Pvt\.?\s*Ltd\.?|Private\s*Limited|Ltd\.?|Limited|LLP|Inc\.?|Corp\.?|Cooperative|लिमिटेड|प्राइवेट\s*लिमिटेड)(?:\.|\b))",
                norm_text,
                re.IGNORECASE
            )
            if corp_name_match:
                raw_entity = corp_name_match.group(1).strip()
                cleaned_entity = re.sub(
                    r"^(?:Manufactured\s*(?:&|and)?\s*Packed\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|"
                    r"Manufactured\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Mfd\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Mfg\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|"
                    r"Packed\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Pkd\.?\s*(?:in\s+[a-zA-Z\u0900-\u097F]+\s*)?by|Marketed\s*by|Imported\s*by|Address|निर्माता|पैकर)\s*[:\-]?\s*",
                    "",
                    raw_entity,
                    flags=re.IGNORECASE
                ).strip()
                entity_name = cleaned_entity if cleaned_entity else None

        # Statutory completeness per OQ-02: State + 6-digit PIN code
        is_complete = bool(detected_state and pin_code)

        if not detected_state and not pin_code and not entity_name:
            address_keywords = ["plot", "sector", "road", "phase", "street", "industrial", "area", "village", "taluka", "dist", "district", "estate"]
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

        Tuples:
        1. Contact Person / Department
        2. Postal Address / Reference to Manufacturer Address
        3. Telephone / Toll-free Contact Number
        4. Valid Email Address
        Guards strictly against FSSAI license numbers and barcodes falsely detected as phone numbers.
        """
        if not full_text:
            return {
                "has_email": False, "has_phone": False, "has_address": False,
                "has_contact_name": False, "is_complete": False, "email": None, "phone": None
            }

        norm_text = cls.convert_indic_digits(full_text)

        # 1. Email pattern
        email_pattern = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
        email_match = email_pattern.search(norm_text)
        has_email = bool(email_match)
        email_str = email_match.group(0).strip() if email_match else None

        # 2. Phone pattern: Toll-free 1800/1860 or telephone with explicit keyword prefix
        phone_match_str: Optional[str] = None

        toll_free_pattern = re.compile(r"\b(1800|1860)[-\s]?[0-9]{2,4}[-\s]?[0-9]{3,4}\b")
        tf_match = toll_free_pattern.search(norm_text)

        if tf_match:
            phone_match_str = tf_match.group(0).strip()
        else:
            std_phone_pattern = re.compile(
                r"(?:tel|phone|contact|toll[- ]free|helpline|call|care\s*no|customer\s*care|ph|mob|whatsapp|t:|फोन)\s*[:\-]?\s*"
                r"(\+?91[-\s]?)?([1-9][0-9\s\-]{8,12}[0-9]|0\d{2,4}[-\s]?[0-9\s\-]{6,10}[0-9])\b",
                re.IGNORECASE
            )
            sp_match = std_phone_pattern.search(norm_text)
            if sp_match:
                prefix = sp_match.group(1) or ""
                raw_num = sp_match.group(2)
                # Ensure it's not an FSSAI 14-digit number
                clean_digits = re.sub(r"\D", "", raw_num)
                if 8 <= len(clean_digits) <= 12 and not any(k in norm_text[max(0, sp_match.start() - 15):sp_match.start()].lower() for k in ["fssai", "lic"]):
                    phone_match_str = f"{prefix}{raw_num}".strip()

        has_phone = bool(phone_match_str)

        # 3. Postal Address or Reference to Address (English and Hindi)
        has_address = bool(re.search(
            r"\b(address|plot|sector|road|phase|delhi|mumbai|bangalore|bengaluru|haryana|pune|chennai|kolkata|"
            r"office|cell|consumer\s*care\s*cell|at\s*above\s*address|at\s*the\s*address\s*given\s*above|"
            r"manufacturer'?s\s*address|packer'?s\s*address|registered\s*office|पते\s*पर|उपरोक्त\s*पते|निर्माता\s*के\s*पते|पता)\b",
            norm_text,
            re.IGNORECASE
        ))

        address_text: Optional[str] = None
        if has_address:
            if re.search(r"\b(?:at\s*(?:the\s*)?above\s*address|at\s*the\s*address\s*given\s*above|address\s*given\s*above|manufacturer'?s\s*address|packer'?s\s*address|same\s*as\s*manufacturer|उपरोक्त\s*पते|पते\s*पर)\b", norm_text, re.IGNORECASE):
                address_text = "At manufacturer's address given on pack"
            else:
                addr_clause_match = re.search(
                    r"(?:write\s*to\s*(?:us\s*at)?|postal\s*address|address|post\s*box|p\.?o\.?\s*box)\s*[:\-]?\s*([^;\n\r]+?)(?=\s*(?:phone|tel|call|helpline|toll|email|contact|ph|t:)|$)",
                    norm_text,
                    re.IGNORECASE
                )
                if addr_clause_match and len(addr_clause_match.group(1).strip()) >= 3:
                    address_text = addr_clause_match.group(0).strip()
                elif re.search(r"\b(?:consumer\s*care\s*cell|registered\s*office)\b", norm_text, re.IGNORECASE):
                    address_text = "Consumer Care Cell, Registered Office"
                else:
                    address_text = "Consumer Care Address on pack"

        # 4. Contact Person or Department Name (English and Hindi)
        name_match = re.search(
            r"\b(Nodal\s*Officer|Grievance\s*Officer|Customer\s*Care\s*Executive|Consumer\s*Care\s*Executive|"
            r"Customer\s*Care\s*Manager|Consumer\s*Care\s*Manager|Manager\s*-\s*Customer\s*Care|"
            r"Manager\s*-\s*Consumer\s*Relations|Customer\s*Care|Consumer\s*Care|Executive|Manager|Officer|"
            r"Consumer\s*Complaints(?:\s*Cell|\s*Desk)?|Customer\s*Support|Consumer\s*Grievance|Customer\s*Service|"
            r"Consumer\s*Relations|Helpdesk|Grievance\s*Redressal|"
            r"नोडल\s*अधिकारी|ग्राहक\s*सेवा\s*अधिकारी|प्रबंधक)\b",
            norm_text,
            re.IGNORECASE
        )
        has_contact_name = bool(name_match)
        contact_name_str = name_match.group(0).strip() if name_match else None

        is_complete = bool(has_email and has_phone and has_address and has_contact_name)

        return {
            "has_email": has_email,
            "has_phone": has_phone,
            "has_address": has_address,
            "has_contact_name": has_contact_name,
            "is_complete": is_complete,
            "email": email_str,
            "phone": phone_match_str,
            "address": address_text,
            "contact_name": contact_name_str,
        }

    @classmethod
    def parse_country_of_origin(cls, text: str) -> Optional[str]:
        """Extracts Country of Origin under Rule 6(1)(p) and GSR 128(E).

        Preserves dotted acronyms (e.g. 'U.S.A.', 'U.K.', 'P.R.C.') and normalizes:
        - 'Country of Origin: U.S.A.' -> 'USA'
        - 'Country of Origin: P.R.C.' -> 'China'
        - 'Made in India by XYZ Ltd' -> 'India'
        - 'Imported from: Thailand' -> 'Thailand'
        - 'मूल देश: भारत' -> 'India'
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)
        origin_pattern = re.compile(
            r"(?<![a-zA-Z\u0900-\u097F])(?:Country\s*of\s*Origin|Made\s*in|Product\s*of|Manufactured\s*in|Packed\s*in|Produce\s*of|Imported\s*from|Origin|COO|मूल\s*देश|उत्पत्ति\s*का\s*देश)\s*[:\-]?\s*([^\n\r,;]+)",
            re.IGNORECASE
        )
        match = origin_pattern.search(norm_text)
        if not match:
            return None

        raw = match.group(1).strip()

        # Check canonical country mappings
        if "भारत" in raw:
            return "भारत"
        if re.search(r"\b(?:India|Bharat)\b", raw, re.IGNORECASE):
            return "India"
        if re.search(r"\b(?:U\.?S\.?A\.?|United\s*States(?:\s*of\s*America)?)\b", raw, re.IGNORECASE):
            return "USA"
        if re.search(r"\b(?:U\.?K\.?|United\s*Kingdom|Great\s*Britain)\b", raw, re.IGNORECASE):
            return "United Kingdom"
        if re.search(r"\b(?:P\.?R\.?C\.?|China|People'?s\s*Republic\s*of\s*China)\b", raw, re.IGNORECASE):
            return "China"
        if re.search(r"\b(?:U\.?A\.?E\.?|United\s*Arab\s*Emirates)\b", raw, re.IGNORECASE):
            return "UAE"

        # Check recognized country names
        for country in RECOGNIZED_COUNTRIES:
            if re.search(r"\b" + re.escape(country) + r"\b", raw, re.IGNORECASE):
                return country

        # Fallback: Strip stop words like 'by ...', 'for ...'
        cleaned = re.split(r"\b(?:by|for|under|at)\b", raw, flags=re.IGNORECASE)[0].strip()
        cleaned = cleaned.strip(".- :")
        # Validate that fallback candidate is a reasonable country name (not a sentence, no digits)
        if cleaned and len(cleaned.split()) <= 3 and not re.search(r"\d", cleaned):
            disallowed_words = {"accordance", "compliance", "standard", "facility", "premises", "licence", "license"}
            if not any(w in cleaned.lower() for w in disallowed_words):
                return cleaned
        return None

    @classmethod
    def parse_generic_name(cls, text: str) -> Optional[str]:
        """Extracts commodity generic/common name under Rule 6(1)(b).

        Matches declarations like:
        - 'Generic Name: Biscuits'
        - 'Common Name: Potato Chips'
        - 'Name of Commodity: Wheat Flour'
        - 'Commodity: Bath Soap'
        """
        if not text:
            return None

        norm_text = cls.convert_indic_digits(text)
        generic_pattern = re.compile(
            r"(?:Generic\s*Name|Common\s*Name|Name\s*of\s*Commodity|Commodity|Product\s*Name|वस्तु\s*का\s*नाम|सामान्य\s*नाम|उत्पाद\s*का\s*नाम|सामग्री\s*का\s*नाम|वस्तु|उत्पाद)\s*[:\-]?\s*([^\n\r,;]+)",
            re.IGNORECASE
        )
        match = generic_pattern.search(norm_text)
        if not match:
            return None

        cleaned = match.group(1).strip().strip(".- :")
        return cleaned if cleaned and len(cleaned) >= 2 else None
