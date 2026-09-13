"""Unit tests for SupabaseStorageAdapter and DecoupledStorageManager cloud sync."""

import os
from pathlib import Path
import tempfile
import sys
import pytest

# Ensure src/ is importable
SRC_DIR = Path(__file__).resolve().parent.parent / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from storage import DecoupledStorageManager, SupabaseStorageAdapter


@pytest.fixture
def storage_adapter():
    return SupabaseStorageAdapter()


def test_supabase_adapter_configuration(storage_adapter):
    """Verify that Supabase adapter is properly configured with project URL and credentials."""
    assert storage_adapter.is_configured is True
    assert "ihqhfusgkullpbjfmjiy.supabase.co" in storage_adapter.url
    assert storage_adapter.bucket == "evidence-images"
    assert "apikey" in storage_adapter._headers
    assert "Authorization" in storage_adapter._headers


def test_supabase_upload_download_and_delete_cycle(storage_adapter):
    """Verify end-to-end cloud storage lifecycle: upload, public fetch, and permanent delete."""
    test_key = "tests/test_lifecycle_image.jpg"
    fake_jpeg_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb"

    # 1. Upload
    public_url = storage_adapter.upload_file(test_key, fake_jpeg_bytes, content_type="image/jpeg")
    assert public_url is not None
    assert "evidence-images" in public_url
    assert "test_lifecycle_image.jpg" in public_url

    # 2. Download
    downloaded_bytes = storage_adapter.download_file(test_key)
    assert downloaded_bytes is not None
    assert downloaded_bytes == fake_jpeg_bytes

    # 3. Delete
    delete_result = storage_adapter.delete_file(test_key)
    assert delete_result is True


def test_decoupled_storage_manager_cloud_rehydration():
    """Verify that DecoupledStorageManager can rehydrate missing local files from Supabase."""
    with tempfile.TemporaryDirectory() as temp_dir:
        manager = DecoupledStorageManager(base_dir=temp_dir)
        fake_jpeg = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00\x43\x00"

        # 1. Save upload (saves locally and uploads to Supabase)
        rel_path, file_hash, mime = manager.save_upload(fake_jpeg, "test_rehydration.jpg")
        assert mime == "image/jpeg"

        # 2. Verify local file exists
        local_path = manager.resolve_absolute_path(rel_path)
        assert local_path.exists()

        # 3. Simulate container reboot / disk wipe by deleting the local file
        local_path.unlink()
        assert not local_path.exists()

        # 4. resolve_absolute_path should seamlessly re-download from Supabase Storage
        rehydrated_path = manager.resolve_absolute_path(rel_path)
        assert rehydrated_path.exists()
        assert rehydrated_path.read_bytes() == fake_jpeg

        # 5. Clean up both locally and on Supabase
        del_success = manager.delete_file(rel_path)
        assert del_success is True
        assert not rehydrated_path.exists()
