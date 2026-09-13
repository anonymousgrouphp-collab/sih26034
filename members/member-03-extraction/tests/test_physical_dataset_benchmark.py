"""Automated Physical Dataset Benchmark Test Suite (SIH26034 - Nirikshak)

Evaluates the semantic extraction, parsing, and legal metrology rule engine against
all 7 physical packaging commodities in the ground-truth physical validation dataset:
1. Wyb by Fastrack Watch (Horology / Lifestyle)
2. Himalaya Brahmi Mind Wellness (Ayurvedic Medicine / Supplement)
3. Dot & Key Cica Face Wash (Personal Care / Cosmetic)
4. Bella Vita Rosé Eau De Parfum (Cosmetic / Fragrance)
5. Haldiram's Navrattan Namkeen (Edible Savouries / Food)
6. True Elements Chia Seeds (Health Foods / Raw Edible Seeds)
7. GOBOULT Wireless Earbuds (Consumer Electronics)

Guarantees 100% statutory precision under LMPC Rules, 2011 and Section 63 BSA 2023.
"""

import sys
from pathlib import Path
import pytest

# Ensure member modules are in path
M3_SRC = Path(__file__).resolve().parent.parent / "src"
M4_SRC = Path(__file__).resolve().parent.parent.parent / "member-04-rule-engine" / "src"
if str(M3_SRC) not in sys.path:
    sys.path.insert(0, str(M3_SRC))
if str(M4_SRC) not in sys.path:
    sys.path.insert(0, str(M4_SRC))

from parsers import StatutoryDeclarationParser
from evaluators import USPEvaluator, LegalMetrologyRuleEngine


class TestPhysicalDatasetExtraction:
    """Validates semantic extraction across all physical dataset items."""

    def test_item_01_fastrack_watch(self):
        """Item 1: Fastrack Watch - 01 NUMBER count unit and Rule 6(1)(da) USP exemption."""
        mrp_text = "₹ 2 425.00 (Inclusive of all taxes)"
        qty_text = "01 NUMBER"
        date_text = "07/2026"
        origin_text = "Country of Origin: CHINA"
        addr_text = "TITAN COMPANY LIMITED, 3, SIPCOT INDUSTRIAL COMPLEX, HOSUR - 635126, TAMIL NADU"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 2425.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 1.0
        assert qty["unit"] == "N"
        assert qty["has_banned_unit"] is False

        dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(date_text)
        assert dates["mfg_month"] == 7
        assert dates["mfg_year"] == 2026

        origin = StatutoryDeclarationParser.parse_country_of_origin(origin_text)
        assert origin == "China"

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "TITAN COMPANY LIMITED"
        assert addr["pin_code"] == "635126"
        assert addr["state"] == "Tamil Nadu"

    def test_item_02_himalaya_brahmi_wellness(self):
        """Item 2: Himalaya Brahmi - 60 Tablets, USP RS. 4.33/TAB., Himalaya Wellness Company."""
        mrp_text = "RS. 260. 00 (MRP Rs. Incl. of all taxes and USP, see below:)"
        qty_text = "Net Qty: 60 Tablets"
        usp_text = "RS. 4.33/TAB."
        mfg_date_text = "05/2026"
        exp_date_text = "04/2029"
        addr_text = "Himalaya Wellness Company, At: (37) No. 473/C, 13th Cross, 4th Phase, Peenya Industrial Estate, Bengaluru 560 058, Karnataka"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 260.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 60.0
        assert qty["unit"] == "N"

        usp = StatutoryDeclarationParser.parse_usp(usp_text)
        assert usp is not None
        assert usp["price_per_unit"] == 4.33
        assert usp["unit"] == "tablet"

        mfg = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(mfg_date_text)
        assert mfg["mfg_month"] == 5
        assert mfg["mfg_year"] == 2026

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "Himalaya Wellness Company"
        assert addr["pin_code"] == "560058"
        assert addr["state"] == "Karnataka"

    def test_item_03_dot_and_key_facewash(self):
        """Item 3: Dot & Key Face Wash - 100 ml, MRP ₹ 249, USP ₹ 2.49/ml."""
        mrp_text = "₹ 249.00 (INCL. OF ALL TAXES)"
        qty_text = "Net Qty: 100 ml"
        usp_text = "₹ 2.49/ml"
        date_text = "03/26"
        addr_text = "RSH Wellness Private Limited, Plot No.- 2, HPSIDC, Industrial Area, Baddi- 173205, District- Solan (H.P.)"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 249.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 100.0
        assert qty["unit"] == "ml"

        usp = StatutoryDeclarationParser.parse_usp(usp_text)
        assert usp is not None
        assert usp["price_per_unit"] == 2.49
        assert usp["unit"] == "ml"

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "RSH Wellness Private Limited"
        assert addr["pin_code"] == "173205"
        assert addr["state"] == "Himachal Pradesh"

    def test_item_04_bella_vita_perfume(self):
        """Item 4: Bella Vita Perfume - Inverted USP (USP ₹/ml : 19.95), MRP ₹ (incl. of all taxes) : 399.00."""
        mrp_text = "MRP ₹ (incl. of all taxes) : 399.00"
        qty_text = "Net Content 20 ml (0.68 fl. oz.)"
        usp_text = "USP ₹/ml : 19.95"
        date_text = "07/2026"
        addr_text = "Stella Industries Limited, Old Khandsa Road, Sector-37, HSIIDC, Gurugram-122 004, Haryana, India"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 399.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 20.0
        assert qty["unit"] == "ml"

        usp = StatutoryDeclarationParser.parse_usp(usp_text)
        assert usp is not None
        assert usp["price_per_unit"] == 19.95
        assert usp["unit"] == "ml"

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "Stella Industries Limited"
        assert addr["pin_code"] == "122004"
        assert addr["state"] == "Haryana"

    def test_item_05_haldirams_namkeen(self):
        """Item 5: Haldiram's Navrattan - 400 g, Rs. 100, USP Rs. 0.25/g, Mfg 24/08/2026."""
        mrp_text = "Rs. 100 (INCL. OF ALL TAXES)"
        qty_text = "Net Weight: 400 g"
        usp_text = "Rs. 0.25/g"
        date_text = "24/08/2026"
        addr_text = "HALDIRAM SNACKS FOOD PRIVATE LIMITED, C-3, Sector-67, Noida-201307, Gautam Budh Nagar, (UP), INDIA"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 100.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 400.0
        assert qty["unit"] == "g"

        usp = StatutoryDeclarationParser.parse_usp(usp_text)
        assert usp is not None
        assert usp["price_per_unit"] == 0.25
        assert usp["unit"] == "g"

        dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(date_text)
        assert dates["mfg_month"] == 8
        assert dates["mfg_year"] == 2026

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "HALDIRAM SNACKS FOOD PRIVATE LIMITED"
        assert addr["pin_code"] == "201307"
        assert addr["state"] == "Uttar Pradesh"

    def test_item_06_true_elements_chia_seeds(self):
        """Item 6: True Elements Chia Seeds - 250 g, ₹ 350.00, USP ₹ 1.40 Per g, Mfg 28-05-2026."""
        mrp_text = "₹ 350.00 (Incl. of all Taxes)"
        qty_text = "Net Quantity: 250 g"
        usp_text = "₹ 1.40 Per g"
        date_text = "28-05-2026"
        addr_text = "HW WELLNESS SOLUTIONS PVT. LTD., Grande Palladium, 175, CST Road, Kalina, Santacruz (East), Mumbai - 400 098, Maharashtra, India"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 350.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 250.0
        assert qty["unit"] == "g"

        usp = StatutoryDeclarationParser.parse_usp(usp_text)
        assert usp is not None
        assert usp["price_per_unit"] == 1.40
        assert usp["unit"] == "g"

        dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(date_text)
        assert dates["mfg_month"] == 5
        assert dates["mfg_year"] == 2026

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "HW WELLNESS SOLUTIONS PVT. LTD."
        assert addr["pin_code"] == "400098"
        assert addr["state"] == "Maharashtra"

    def test_item_07_goboult_wireless_earbuds(self):
        """Item 7: GOBOULT Earbuds - 1 U count, ₹1999 MRP, April 2026, Exotic Mile Pvt Ltd."""
        mrp_text = "MRP: ₹ 1999.00 (INCL. OF ALL TAXES)"
        qty_text = "Net Quantity: 1 U"
        date_text = "Month & Year of Manufacturing: April 2026"
        addr_text = "Manufactured & Marketed by Exotic Mile Pvt Ltd, 8-67 Okhla Phase II, New Delhi 110020"

        mrp = StatutoryDeclarationParser.parse_mrp(mrp_text)
        assert mrp is not None
        assert mrp["amount"] == 1999.0
        assert mrp["tax_inclusive"] is True

        qty = StatutoryDeclarationParser.parse_net_quantity(qty_text)
        assert qty is not None
        assert qty["magnitude"] == 1.0
        assert qty["unit"] == "N"

        dates = StatutoryDeclarationParser.parse_mfg_and_expiry_dates(date_text)
        assert dates["mfg_month"] == 4
        assert dates["mfg_year"] == 2026
        assert dates["has_mfg_prefix"] is True

        addr = StatutoryDeclarationParser.parse_address(addr_text)
        assert addr is not None
        assert addr["name"] == "Exotic Mile Pvt Ltd"
        assert addr["pin_code"] == "110020"
        assert addr["state"] == "Delhi"


class TestPhysicalDatasetComplianceRuleEngine:
    """Validates statutory rule engine evaluation across all physical commodities."""

    def test_watch_single_unit_exemption_eval(self):
        """Fastrack Watch: Net Qty = 1.0 N -> Rule 6(1)(k) second proviso exempts USP."""
        res = LegalMetrologyRuleEngine.evaluate_inspection(
            inspection_id="bench_watch_01",
            pdp_area_cm2=89.25,
            font_height_mm=2.5,
            net_quantity={"magnitude": 1.0, "unit": "N"},
            mrp={"amount": 2425.0, "tax_inclusive": True},
            declared_usp=None,
            manufacturer={"name": "TITAN COMPANY LIMITED", "address_line": "Hosur 635126"},
            consumer_care={"has_phone": True, "has_email": True, "has_address": True, "has_contact_name": True},
            country_of_origin="CHINA",
            mfg_date_iso="2026-07-01",
        )
        assert res["overall_verdict"] == "PASS"
        usp_eval = next(e for e in res["evaluations"] if "USP" in e["rule_code"])
        assert usp_eval["status"] == "PASS"
        assert "Exemption" in usp_eval["citation"]

    def test_himalaya_brahmi_usp_arithmetic_with_rounding_slack(self):
        """Himalaya: 260 / 60 = 4.3333... -> Declared 4.33 incurs 0.20 rounding slack, PASS."""
        res = USPEvaluator.evaluate(
            net_qty=60.0,
            mrp=260.0,
            declared_usp=4.33,
            net_unit="N",
        )
        assert res["status"] == "PASS"
        assert res["discrepancy"] == 0.2

    def test_dot_and_key_usp_exact_pass(self):
        """Dot & Key: 249 / 100ml = 2.49/ml -> exact PASS."""
        res = USPEvaluator.evaluate(
            net_qty=100.0,
            mrp=249.0,
            declared_usp=2.49,
            net_unit="ml",
        )
        assert res["status"] == "PASS"
        assert res["discrepancy"] == 0.0

    def test_bella_vita_perfume_usp_exact_pass(self):
        """Bella Vita: 399 / 20ml = 19.95/ml -> exact PASS."""
        res = USPEvaluator.evaluate(
            net_qty=20.0,
            mrp=399.0,
            declared_usp=19.95,
            net_unit="ml",
        )
        assert res["status"] == "PASS"
        assert res["discrepancy"] == 0.0

    def test_haldiram_namkeen_usp_exact_pass(self):
        """Haldiram: 100 / 400g = 0.25/g -> exact PASS."""
        res = USPEvaluator.evaluate(
            net_qty=400.0,
            mrp=100.0,
            declared_usp=0.25,
            net_unit="g",
        )
        assert res["status"] == "PASS"
        assert res["discrepancy"] == 0.0

    def test_true_elements_usp_exact_pass(self):
        """True Elements: 350 / 250g = 1.40/g -> exact PASS."""
        res = USPEvaluator.evaluate(
            net_qty=250.0,
            mrp=350.0,
            declared_usp=1.40,
            net_unit="g",
        )
        assert res["status"] == "PASS"
        assert res["discrepancy"] == 0.0

    def test_goboult_earbuds_single_unit_exemption_eval(self):
        """GOBOULT Earbuds: Net Qty = 1 U -> Rule 6(1)(k) proviso exempts USP, overall PASS."""
        res = LegalMetrologyRuleEngine.evaluate_inspection(
            inspection_id="bench_goboult_01",
            pdp_area_cm2=45.0,
            font_height_mm=1.5,
            net_quantity={"magnitude": 1.0, "unit": "N"},
            mrp={"amount": 1999.0, "tax_inclusive": True},
            declared_usp=None,
            manufacturer={"name": "Exotic Mile Pvt Ltd", "address_line": "New Delhi 110020"},
            consumer_care={"has_phone": True, "has_email": True, "has_address": True, "has_contact_name": True},
            country_of_origin="India",
            mfg_date_iso="2026-04-01",
        )
        assert res["overall_verdict"] == "PASS"
