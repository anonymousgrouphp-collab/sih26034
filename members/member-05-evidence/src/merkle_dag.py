"""SHA-256 Merkle Directed Acyclic Graph (DAG) for Section 63 BSA 2023 Evidence (SIH26034)"""

import hashlib
import json
from typing import Any, List, Optional, Tuple


class MerkleAuditLedger:
    @staticmethod
    def hash_payload(data: Any) -> str:
        """Computes deterministic SHA-256 hash of a dictionary, string, or byte payload."""
        if isinstance(data, bytes):
            payload_bytes = data
        elif isinstance(data, str):
            payload_bytes = data.encode("utf-8")
        else:
            # Deterministic sorted JSON string
            payload_bytes = json.dumps(data, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hashlib.sha256(payload_bytes).hexdigest()

    @classmethod
    def build_merkle_root(cls, leaf_hashes: List[str]) -> str:
        """Constructs a binary SHA-256 Merkle root from ordered list of stage hashes."""
        if not leaf_hashes:
            return hashlib.sha256(b"").hexdigest()
        if len(leaf_hashes) == 1:
            return leaf_hashes[0]

        current_level = list(leaf_hashes)
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                combined = hashlib.sha256((left + right).encode("utf-8")).hexdigest()
                next_level.append(combined)
            current_level = next_level

        return current_level[0]

    @classmethod
    def verify_integrity(cls, leaf_hashes: List[str], expected_root: str) -> bool:
        """Verifies if the computed Merkle root matches the expected cryptographic root."""
        computed_root = cls.build_merkle_root(leaf_hashes)
        return computed_root == expected_root
