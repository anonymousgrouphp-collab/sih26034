# STRICTLY BOUNDED OPEN QUESTIONS

**Project ID:** SIH26034  
**Product:** NyayaDrishti-LM  
**Status:** ALL QUESTIONS BOUNDED BY SAFE DEFAULTS (ZERO DEVELOPMENT BLOCKERS)  
**Last Updated:** 07 September 2026  

---

### Context

At the Architecture Freeze stage, no question may remain open that blocks day-to-day engineering. Every open question below is assigned a **Working Default Decision** that allows developers to proceed immediately without ambiguity.

---

### Bounded Open Questions Matrix

| ID | Category | Specific Unresolved Question | Working Default Decision (Safe for Dev) | Assigned Owner | Resolution Deadline | Impact If Unresolved |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| **OQ-01** | Optical / UX | Should the primary calibration marker be an **ArUco marker** or a standard **credit-card-sized reference (ISO 7810 ID-1)**? | **Implement dual detection in OpenCV:** ArUco dictionary 4x4_50 is primary (fastest, most robust under perspective tilt); ISO 7810 card rectangle detector is automatic fallback. | Member 1 | 09 Sept 2026 | None. Code supports both seamlessly. |
| **OQ-02** | Legal / Data | Under Rule 6(1)(a), what exact minimum address tokens constitute a legally valid 'complete address' for prosecution? | **Implement two configurable severity tiers:** (1) _Strict Statutory:_ Must have State + 6-digit Indian PIN code; (2) _Warning:_ Missing street line triggers `REQUIRES_REVIEW` rather than hard fail. | Member 3 & 4 | 09 Sept 2026 | Prevents false violation notices against legitimate brands using registered corporate office names. |
| **OQ-03** | Government Integration | What exact REST API payload schema does DoCA's national `e-maap.gov.in` portal require for external inspection ingestion? | **Export standardized Form 1 JSON schema:** Since eMaap has no public external API, NyayaDrishti-LM exports an open, fully documented JSON structure matching statutory inspection memo fields, ready for future NIC webhook ingestion. | Member 5 | 10 Sept 2026 | Zero risk. Deliver standalone export and mock synchronization endpoint for demo. |
| **OQ-04** | Geometry / MVP | How should cylindrical packaging text dewarping be handled within the 6-day timeline? | **Restrict font-height measurement to the vertical unwarped axis:** On a cylinder, vertical lines suffer minimal perspective distortion ($y_{\text{proj}} \approx y_{\text{metric}}$). Full 3D surface mesh unwrapping is marked P2/deferred. | Member 1 | 08 Sept 2026 | Completely eliminates mathematical schedule risk while preserving 100% Table-I verification on cans and bottles. |
| **OQ-05** | UI Architecture | Should the application deploy as an **Electron desktop package**, a **mobile APK**, or an **Online-First Web Application (SPA)**? | **Deploy responsive React 18 + Vite Web SPA:** Accessed via standard web browsers (Chrome, Edge, Firefox), served by Nginx / FastAPI in production. Eliminates Electron packaging overhead and allows universal multi-device access across desktops, laptops, tablets, and smartphones. | Member 6 | 08 Sept 2026 | Maximizes demo versatility: runs immediately in browser with zero client-side installation barrier. |
| **OQ-06** | Data Sync | Should Mode B offline field inspections be synced via automated background polling or explicit officer bundle upload? | **Deliver explicit bundle export/upload first with background detection:** UI includes explicit "Export / Upload Sync Bundle" button (`.bundle.json` / `.tar.gz`) for guaranteed reliability, backed by automatic sync detection when online connection is active. | Member 5 & 6 | 09 Sept 2026 | Guarantees transparent officer control over synchronization without silent background transmission failures. |

---

### Non-Blocking Verification Protocol

1. Developers must build against the **Working Default Decision**.
2. If an open question is resolved before its deadline, the module owner updates the parameter file.
3. If a question is not resolved by the deadline, the **Working Default becomes permanently frozen**.
