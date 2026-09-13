"""Unit tests for CacheQueueAdapter (SIH26034 - NyayaDrishti-LM)"""

from pathlib import Path
import sys
import time
from unittest.mock import MagicMock, patch
import pytest

SRC_DIR = Path(__file__).resolve().parent.parent
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from cache_queue import (
    CacheQueueAdapter,
    InMemoryLRUCache,
)


def test_in_memory_lru_cache_basic_ops():
    """Verify in-memory LRU cache basic get, set, delete, and clear."""
    cache = InMemoryLRUCache(capacity=3, default_ttl_seconds=10)
    cache.set("key1", {"data": "val1"})
    cache.set("key2", {"data": "val2"})

    assert cache.get("key1") == {"data": "val1"}
    assert cache.get("key2") == {"data": "val2"}
    assert cache.get("nonexistent") is None

    assert cache.delete("key1") is True
    assert cache.get("key1") is None
    assert cache.delete("key1") is False


def test_in_memory_lru_cache_eviction():
    """Verify that least-recently used items are evicted when capacity is reached."""
    cache = InMemoryLRUCache(capacity=2, default_ttl_seconds=100)
    cache.set("a", 1)
    cache.set("b", 2)
    # Access "a" so "b" becomes the least recently used
    _ = cache.get("a")
    cache.set("c", 3)

    assert cache.get("a") == 1
    assert cache.get("c") == 3
    assert cache.get("b") is None  # "b" evicted


def test_in_memory_lru_cache_ttl_expiration():
    """Verify that expired items return None."""
    cache = InMemoryLRUCache(capacity=5, default_ttl_seconds=1)
    cache.set("short_lived", "alive", ttl_seconds=0.01)
    time.sleep(0.02)
    assert cache.get("short_lived") is None


def test_cache_queue_adapter_token_and_facts_caching():
    """Verify CacheQueueAdapter get/set for tokens and fused facts in in-memory mode."""
    adapter = CacheQueueAdapter(redis_url=None)
    assert not adapter.is_redis_active

    tokens = [{"text": "MRP Rs. 100", "bbox": [10, 20, 30, 40]}]
    adapter.set_tokens("img_test_123", tokens)
    cached_tokens = adapter.get_tokens("img_test_123")
    assert cached_tokens == tokens

    facts = {"generic_name": "Earbuds", "mrp": 1999.0}
    adapter.set_fused_facts("insp_abc_789", facts)
    cached_facts = adapter.get_fused_facts("insp_abc_789")
    assert cached_facts == facts


def test_cache_queue_adapter_job_status():
    """Verify pipeline batch job status tracking."""
    adapter = CacheQueueAdapter(redis_url=None)
    job_payload = {
        "job_id": "job_01",
        "status": "PROCESSING",
        "progress": 50,
        "completed_facets": 3,
        "total_facets": 6,
    }
    adapter.set_job_status("job_01", job_payload)
    status = adapter.get_job_status("job_01")
    assert status == job_payload


def test_cache_queue_adapter_mocked_redis():
    """Verify that when Redis is available, adapter reads/writes via Redis client."""
    mock_redis = MagicMock()
    mock_redis.ping.return_value = True
    mock_redis.get.return_value = '{"source": "redis_val"}'

    mock_redis_module = MagicMock()
    mock_redis_module.Redis.from_url.return_value = mock_redis

    import sys
    with patch.dict(sys.modules, {"redis": mock_redis_module}), \
         patch("cache_queue.REDIS_AVAILABLE", True), \
         patch("cache_queue.redis", mock_redis_module):
        adapter = CacheQueueAdapter(redis_url="redis://localhost:6379/0")
        assert adapter.is_redis_active
        assert adapter.redis_client is not None

        # Verify read uses redis
        res = adapter.get_tokens("img_redis_test")
        mock_redis.get.assert_called_with("tokens:img_redis_test")
        assert res == {"source": "redis_val"}

        # Verify write uses redis
        adapter.set_tokens("img_redis_test", [{"text": "ok"}])
        assert mock_redis.setex.called
