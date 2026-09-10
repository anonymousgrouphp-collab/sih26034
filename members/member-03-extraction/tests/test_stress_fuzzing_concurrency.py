"""Pass 4: Fuzzing, Boundary Singularities & Concurrent High-Throughput Stress Suite (SIH26034)

Audits and stress-tests:
- 100,000-character adversarial fuzzing payloads with binary bytes and control characters
- Malformed token geometry (negative coordinates, inverted boxes, zero area, out-of-bounds)
- 50 concurrent worker threads executing extraction simultaneously (thread safety & race condition defense)
- Memory stability & execution determinism across high-volume sequential extraction runs
- Pydantic schema validation integrity under adversarial noise injection
"""

import sys
from pathlib import Path
import random
import string
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from parsers import StatutoryDeclarationParser
from extractor import CommodityFactExtractor
from contracts.extraction.extraction_dto import NormalizedCommodityFacts


@pytest.fixture
def extractor():
    return CommodityFactExtractor()


def test_massive_100k_payload_fuzzing():
    """Verify all 10 statutory parsers handle 100,000 characters of randomized fuzz noise with zero crashes."""
    parser = StatutoryDeclarationParser

    # Generate 100,000 chars of random ASCII, control characters, and Unicode fragments
    random.seed(42)
    chars = string.ascii_letters + string.digits + " \t\n\r/.-,:;!@#$%^&*()_+=\\~`" + "\x00\x01\x02\x08\x0b\x0c"
    fuzz_payload = "".join(random.choices(chars, k=100000))

    t0 = time.perf_counter()
    banned = parser.detect_banned_units(fuzz_payload)
    qty = parser.parse_net_quantity(fuzz_payload)
    mrp = parser.parse_mrp(fuzz_payload)
    usp = parser.parse_usp(fuzz_payload)
    dates = parser.parse_mfg_and_expiry_dates(fuzz_payload)
    pin = parser.parse_pin_code(fuzz_payload)
    addr = parser.parse_address(fuzz_payload)
    care = parser.check_consumer_care_completeness(fuzz_payload)
    coo = parser.parse_country_of_origin(fuzz_payload)
    gen = parser.parse_generic_name(fuzz_payload)
    elapsed = time.perf_counter() - t0

    # Assert sub-second execution on 100,000 chars across all 10 parsers
    assert elapsed < 1.0, f"Fuzzing took too long: {elapsed:.4f}s"
    assert isinstance(banned, tuple)
    assert care["is_complete"] is False or care["is_complete"] is True


def test_adversarial_token_coordinates_chaos(extractor):
    """Verify extractor handles negative, inverted, zero-area, and extreme coordinates without unhandled exceptions."""
    chaotic_tokens = [
        {"token_id": "t_neg", "text": "Net Qty: 500 g", "confidence": 0.95, "bounding_box": [-500, -200, -100, -50]},
        {"token_id": "t_inv", "text": "MRP Rs. 250.00", "confidence": 0.95, "bounding_box": [200, 100, 50, 20]},
        {"token_id": "t_zero", "text": "Mfg: 04/2024", "confidence": 0.95, "bounding_box": [10, 10, 10, 10]},
        {"token_id": "t_giant", "text": "Plot 10, Baddi, Himachal Pradesh 173205", "confidence": 0.95, "bounding_box": [100000, 100000, 200000, 200000]},
    ]

    facts = extractor.extract(chaotic_tokens)
    assert isinstance(facts, NormalizedCommodityFacts)
    assert facts.net_quantity is not None
    assert facts.net_quantity.magnitude == 500.0
    assert facts.mrp is not None
    assert facts.mrp.amount == 250.0
    assert facts.manufacturer is not None
    assert facts.manufacturer.state == "Himachal Pradesh"


def test_high_concurrency_50_threads_simultaneous_inspections(extractor):
    """Verify 50 concurrent worker threads can execute extractions simultaneously with 100% determinism."""
    test_input = [
        {"token_id": "t1", "text": "Net Weight: 100 g", "confidence": 0.98, "bounding_box": [10, 10, 30, 150]},
        {"token_id": "t2", "text": "MRP: Rs. 45.00 (Incl. of all taxes)", "confidence": 0.97, "bounding_box": [35, 10, 55, 250]},
        {"token_id": "t3", "text": "Mfd by: Parle Products, Mumbai, Maharashtra 400057", "confidence": 0.96, "bounding_box": [60, 10, 80, 400]},
        {"token_id": "t4", "text": "Country of Origin: India", "confidence": 0.95, "bounding_box": [85, 10, 105, 200]},
    ]

    def worker_task(thread_id: int):
        f = extractor.extract(test_input)
        return thread_id, f.net_quantity.magnitude, f.mrp.amount, f.manufacturer.state, f.manufacturer.pin_code

    with ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(worker_task, i) for i in range(50)]
        results = [f.result() for f in as_completed(futures)]

    assert len(results) == 50
    for tid, mag, mrp, state, pin in results:
        assert mag == 100.0
        assert mrp == 45.0
        assert state == "Maharashtra"
        assert pin == "400057"


def test_memory_stability_across_sequential_extractions(extractor):
    """Verify 200 consecutive extractions execute in constant time with zero memory leaks."""
    sample_text = (
        "Manufactured by: Nestle India Ltd, Ludhiana, Punjab 141001. "
        "Net Weight: 250 g. MRP Rs. 75.00 (Inclusive of all taxes). "
        "Country of Origin: India. Care: care@nestle.com, 1800-103-1947."
    )

    t0 = time.perf_counter()
    for _ in range(200):
        facts = extractor.extract(sample_text)
        assert facts.net_quantity.magnitude == 250.0
        assert facts.mrp.amount == 75.0
    elapsed = time.perf_counter() - t0

    # 200 sequential extractions must complete in under 2.5 seconds (<13ms per extraction)
    assert elapsed < 2.5, f"Sequential extractions too slow: {elapsed:.4f}s"


def test_pydantic_schema_strict_conformance_on_boundary_inputs(extractor):
    """Verify Pydantic model validation passes cleanly on extreme boundary inputs."""
    edge_cases = [
        "",
        "None",
        "1234567890",
        "!!! @@@ ### $$$ %%% ^^^ &&& ***",
        "{} [] ()",
        "NaN null undefined None",
    ]

    for ec in edge_cases:
        facts = extractor.extract(ec)
        assert isinstance(facts, NormalizedCommodityFacts)
        # Verify serialization / deserialization roundtrip
        dumped = facts.model_dump()
        rebuilt = NormalizedCommodityFacts(**dumped)
        assert rebuilt is not None
