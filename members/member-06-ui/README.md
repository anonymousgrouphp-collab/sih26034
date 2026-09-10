# Member 6 — Frontend, Web UX & Integration

**Assigned Engineer:** **Parmarth Kumar** ([@parmarth-kumar](https://github.com/parmarth-kumar)) *(Reassigned by Team Lead)*  
**Assigned Workstream:** React 18 SPA, Officer Viewfinder HUD, Split-View Adjudication Canvas, Central Dashboard, Standalone Zero-Build HUD & Mode B Resilient UX  
**Assigned Folder:** `members/member-06-ui/`  
**Git Feature Branch:** `feat/m6-ui`  

---

## 1. What is my job?
Your job is to build the web user interface for field inspectors and supervisory controllers.
You build:
- Responsive Single Page Application (SPA) using React 18, Vite, and Tailwind CSS.
- Inspector Mobile/Tablet Capture HUD with real-time optical quality indicator (`FRAME_OPTIMAL`, `IMAGE_BLURRED`, `SPECULAR_GLARE`).
- Split-View Adjudication Canvas: calibrated image zoom/pan with visual bounding box overlays on the left; structured statutory rule ledger on the right.
- Pixel loupe tool with real-time millimeter readout.
- Central Enforcement Dashboard with KPI cards, circle filtering, search, and historical inspection list.
- Connection Status Indicator badge (`ONLINE`, `LOCAL RESILIENT MODE`, `DISRUPTED`) with offline session caching.
- Standalone Mock API Client that allows the UI to run 100% independently without waiting for the backend.

---

## 2. What files am I allowed to change?
You are allowed to create and edit files strictly inside:
- `members/member-06-ui/**`

You may read shared contracts in `contracts/ui/` and `09_UI_UX_BLUEPRINT.md`.
You must NOT edit other member directories or root specification files.

---

## 3. What documents must I read?
1. `AGENTS.md` (Root team rules)
2. `03_FINAL_ARCHITECTURE.md` (Stage 11: HITL Adjudication Gate)
3. `05_TECHNOLOGY_DECISION_RECORD.md` (ADR-02: React 18 Vite, ADR-08: HITL, ADR-13: Online-First)
4. `07_API_AND_INTERFACE_CONTRACTS.md` (REST Request/Response Schemas)
5. `09_UI_UX_BLUEPRINT.md` (Design Tokens, Color Palette, Screen Inventory)
6. `11_TESTING_AND_VALIDATION_PLAN.md` (`TS-SYS-01` to `TS-SYS-03`)
7. `12_DEMO_PLAN.md` (3-Tier demo flow & 3-minute pitch script)
8. `16_DECISION_LOG.md` (ADL-13, ADL-18)
9. `17_OPEN_QUESTIONS.md` (OQ-05, OQ-06)
10. `CLAIMS_WE_MUST_NOT_MAKE.md` (Section 4: Connectivity Claims)

---

## 4. What inputs do I use?
- Mock API response fixtures in `members/member-06-ui/fixtures/api/`.
- Design tokens and wireframes from `09_UI_UX_BLUEPRINT.md`.

---

## 5. What outputs do I produce?
- Accessible, responsive React 18 web application bundle.
- Conforms to REST API contracts in `contracts/ui/ui_contract_schema.json`.

---

## 6. What contract do I follow?
- `contracts/ui/ui_contract_schema.json`.

---

## 7. How do I run my module?
```bash
cd members/member-06-ui
npm install
npm run dev
```

---

## 8. How do I run tests?
```bash
npm test
```

---

## 9. What counts as complete?
Your module is complete when:
1. Executive Dashboard renders KPI cards and recent inspections accurately.
2. Adjudication Canvas renders calibrated bounding overlays with zoom/pan and pixel loupe.
3. Officer override requires mandatory justification remarks before generating notice.
4. Connection status badge correctly indicates `ONLINE` vs `LOCAL RESILIENT MODE`.
5. All component tests pass.
6. `progress.md` is marked `COMPLETE — YYYY-MM-DD HH:MM IST`.
7. `memory.md` is updated.

---

## 10. What must I NOT depend on?
- You must NOT wait for Member 5's live backend server.
- The UI must run completely against mock API fixtures in `fixtures/api/`!
