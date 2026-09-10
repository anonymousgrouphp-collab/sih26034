"""Automated Test Battery for NyayaDrishti-LM Field Inspector CLI (inspect_cli.py).

Verifies:
1. All 6 Golden Demonstration SKUs (SKU-DEMO-01 to SKU-DEMO-06) produce exact statutory verdicts.
2. CLI exit codes: 0 for PASS, 1 for FAIL, 0 for REVIEW / UNABLE_TO_VERIFY (diagnostic completion), 2 for ERROR.
3. Machine-readable JSON output conforms strictly to canonical schema.
4. Section 63 BSA 2023 tamper-evident Merkle DAG root computation (64 hex characters).
5. Execution latency strictly < 1500 ms (< 1.5s) on standard CPU in Resilient Mode B.
6. Real physical FMCG packaging samples (REAL-PKG-01).
7. E-Commerce Rule 6(10) marketplace listing audits (both PASS and FAIL flows).
8. One-Click Form-1 Show Cause Notice PDF generation (--issue-notice).
9. Rich terminal dashboard rendering without exceptions.
"""

import json
from pathlib import Path
import subprocess
import sys
import tempfile
import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
PYTHON_EXE = r"C:\Users\ceoha\AppData\Local\Programs\Python\Python313\python.exe"
CLI_SCRIPT = str(REPO_ROOT / "inspect_cli.py")

# Ensure imports work directly
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from inspect_cli import FieldInspectorCLI, GOLDEN_SKUS, REAL_SAMPLES


class TestFieldInspectorCLI:
    """Test suite for FieldInspectorCLI class methods and direct pipeline invocation."""

    @pytest.fixture
    def cli(self):
        return FieldInspectorCLI(no_color=True)

    @pytest.mark.parametrize(
        "sku_id, expected_verdict",
        [
            ("SKU-DEMO-01", "FAIL"),
            ("SKU-DEMO-02", "FAIL"),
            ("SKU-DEMO-03", "PASS"),
            ("SKU-DEMO-04", "REVIEW"),
            ("SKU-DEMO-05", "UNABLE_TO_VERIFY"),
            ("SKU-DEMO-06", "FAIL"),
        ],
    )
    def test_golden_skus_statutory_verdicts(self, cli, sku_id, expected_verdict):
        """Validates that all 6 Golden SKUs evaluate to their exact specified verdicts."""
        result = cli.evaluate_inspection(sku_id=sku_id)

        assert result["sku_id"] == sku_id
        assert result["overall_verdict"] == expected_verdict, (
            f"Expected {expected_verdict} for {sku_id}, got {result['overall_verdict']}"
        )
        assert "merkle_root" in result
        assert len(result["merkle_root"]) == 64
        assert result["execution_time_ms"] < 1500, f"Execution latency exceeded 1.5s: {result['execution_time_ms']}ms"

    def test_json_schema_contract(self, cli):
        """Verifies that evaluation output contains all mandatory contract keys."""
        result = cli.evaluate_inspection(sku_id="SKU-DEMO-01")

        required_keys = [
            "inspection_id",
            "sku_id",
            "commodity_name",
            "overall_verdict",
            "quality_gate",
            "calibration",
            "ocr_tokens",
            "evaluations",
            "jan_vishwas_sanction",
            "merkle_root",
            "execution_time_ms",
            "notice_generated",
        ]
        for key in required_keys:
            assert key in result, f"Mandatory schema key '{key}' missing from result"

        assert isinstance(result["quality_gate"], dict)
        assert isinstance(result["calibration"], dict)
        assert isinstance(result["ocr_tokens"], list)
        assert isinstance(result["evaluations"], list)
        assert isinstance(result["jan_vishwas_sanction"], dict)

    def test_merkle_dag_sha256_integrity(self, cli):
        """Ensures the Merkle root is a valid 64-character lowercase hexadecimal hash."""
        result = cli.evaluate_inspection(sku_id="SKU-DEMO-03")
        root = result["merkle_root"]

        assert isinstance(root, str)
        assert len(root) == 64
        assert all(c in "0123456789abcdef" for c in root)

    def test_real_fmcg_sample_parle_g(self, cli):
        """Tests physical packaging evaluation on REAL-PKG-01 (Parle-G 45g with banned unit 'gm')."""
        result = cli.evaluate_inspection(sku_id="REAL-PKG-01")

        assert result["overall_verdict"] == "FAIL"
        assert result["quality_gate"]["passed"] is True
        assert result["calibration"]["is_calibrated"] is True
        # Verify banned unit was detected in evaluations
        eval_codes = [e["rule_code"] for e in result["evaluations"]]
        assert any("NET_QUANTITY" in c or "UNIT" in c for c in eval_codes)

    def test_ecommerce_audit_compliant(self, cli):
        """Tests e-commerce listing audit on a 100% compliant declaration under Rule 6(10)."""
        listing = (
            "Manufacturer: Organic India Pvt Ltd, Plot 12, Sector 58, Noida 201301, Uttar Pradesh. "
            "Net Qty: 100g, MRP: Rs. 250 (inclusive of all taxes), "
            "Consumer Care: care@organic.in 1800123456, Country of Origin: India"
        )
        result = cli.evaluate_inspection(ecom_input=listing)

        assert result["overall_verdict"] == "PASS"
        assert result["category"] == "E-COMMERCE_RULE_6_10"
        # Mfg date should be statutorily exempt
        mfg_eval = next((e for e in result["evaluations"] if "RULE_06_10" in e["rule_code"]), None)
        assert mfg_eval is not None
        assert mfg_eval["status"] == "PASS"

    def test_ecommerce_audit_missing_origin(self, cli):
        """Tests e-commerce listing audit with missing Country of Origin (mandatory under Rule 6(10))."""
        listing = (
            "Manufacturer: Global Goods Ltd, Mumbai 400001, "
            "Net Qty: 500g, MRP: Rs. 999 (inclusive of all taxes), "
            "Consumer Care: support@global.in 1800111222"
        )
        result = cli.evaluate_inspection(ecom_input=listing)

        assert result["overall_verdict"] == "FAIL"
        origin_eval = next((e for e in result["evaluations"] if "COUNTRY_OF_ORIGIN" in e["rule_code"]), None)
        assert origin_eval is not None
        assert origin_eval["status"] == "FAIL"

    def test_form1_notice_pdf_generation(self, cli):
        """Tests one-click Form-1 Show Cause Notice PDF generation with custom path."""
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp_pdf = tmp.name

        try:
            result = cli.evaluate_inspection(
                sku_id="SKU-DEMO-01",
                issue_notice=True,
                output_pdf=tmp_pdf,
            )

            assert result["notice_generated"] is True
            assert result["notice_pdf_path"] == tmp_pdf

            pdf_path = Path(tmp_pdf)
            assert pdf_path.exists()
            assert pdf_path.stat().st_size > 1000  # Valid non-empty PDF
        finally:
            Path(tmp_pdf).unlink(missing_ok=True)

    def test_rich_dashboard_rendering_does_not_crash(self, cli):
        """Validates that render_rich_dashboard executes cleanly for all verdict types."""
        for sku_id in ["SKU-DEMO-01", "SKU-DEMO-03", "SKU-DEMO-04", "SKU-DEMO-05"]:
            result = cli.evaluate_inspection(sku_id=sku_id)
            # Should not raise any formatting or encoding exceptions
            cli.render_rich_dashboard(result)


class TestCLIProcessExecution:
    """Subprocess integration tests executing inspect_cli.py via command line."""

    def _run_cli(self, args):
        cmd = [PYTHON_EXE, CLI_SCRIPT] + args
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding="utf-8",
            errors="replace",
            cwd=str(REPO_ROOT),
        )
        return proc

    def test_cli_exit_code_pass(self):
        """PASS verdict must exit with code 0."""
        proc = self._run_cli(["--sku", "SKU-DEMO-03", "--json"])
        assert proc.returncode == 0
        data = json.loads(proc.stdout)
        assert data["overall_verdict"] == "PASS"

    def test_cli_exit_code_fail(self):
        """FAIL verdict must exit with code 1."""
        proc = self._run_cli(["--sku", "SKU-DEMO-01", "--json"])
        assert proc.returncode == 1
        data = json.loads(proc.stdout)
        assert data["overall_verdict"] == "FAIL"

    def test_cli_exit_code_review(self):
        """REVIEW verdict must exit with code 0 (diagnostic completion)."""
        proc = self._run_cli(["--sku", "SKU-DEMO-04", "--json"])
        assert proc.returncode == 0
        data = json.loads(proc.stdout)
        assert data["overall_verdict"] == "REVIEW"

    def test_cli_exit_code_unable_to_verify(self):
        """UNABLE_TO_VERIFY verdict must exit with code 0 (diagnostic completion)."""
        proc = self._run_cli(["--sku", "SKU-DEMO-05", "--json"])
        assert proc.returncode == 0
        data = json.loads(proc.stdout)
        assert data["overall_verdict"] == "UNABLE_TO_VERIFY"

    def test_cli_invalid_sku_exit_code_error(self):
        """Unknown SKU ID must exit with code 2."""
        proc = self._run_cli(["--sku", "SKU-NON-EXISTENT", "--json"])
        assert proc.returncode == 2
        data = json.loads(proc.stdout)
        assert "error" in data
