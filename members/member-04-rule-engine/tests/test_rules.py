"""Unit Tests for Member 4 Statutory Rule Engine (SIH26034)"""

import json
from pathlib import Path
import sys
import pytest

# Ensure local src and contracts are on path
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from evaluators import (
    Table1FontSchedule,
    USPEvaluator,
    TemporalEpochDispatcher,
)

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"


def test_table_1_pass_fixture():
    with open(FIXTURES_DIR / "fixture_rule_table_1_pass.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "PASS"
    assert result["required_mm"] == 2.50


def test_table_1_fail_fixture():
    with open(FIXTURES_DIR / "fixture_rule_table_1_fail.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "FAIL"
    assert result["required_mm"] == 2.50
    assert result["deficit_mm"] < 0


def test_table_1_row_5_large_container_6mm():
    with open(FIXTURES_DIR / "fixture_rule_row_5_large_container.json") as f:
        data = json.load(f)
    result = Table1FontSchedule.evaluate(
        pdp_area_cm2=data["pdp_area_cm2"],
        measured_height_mm=data["measured_font_height_mm"],
    )
    assert result["status"] == "PASS"
    assert result["required_mm"] == 6.00  # Statutory 6.0 mm per G.S.R. 629(E) (ADL-01)


def test_usp_mismatch_fixture():
    with open(FIXTURES_DIR / "fixture_rule_usp_mismatch.json") as f:
        data = json.load(f)
    result = USPEvaluator.evaluate(
        net_qty=data["net_quantity_magnitude"],
        mrp=data["mrp_amount"],
        declared_usp=data["declared_usp"],
    )
    assert result["status"] == "FAIL"
    assert result["discrepancy"] == 40.0


def test_temporal_epoch_pre_2021():
    epoch = TemporalEpochDispatcher.get_epoch("2019-04-10")
    assert epoch == "EPOCH_2017_GSR_629"


def test_temporal_epoch_post_2021():
    epoch = TemporalEpochDispatcher.get_epoch("2023-08-20")
    assert epoch == "EPOCH_2021_GSR_779"
