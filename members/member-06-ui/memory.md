# Permanent Working Memory — Member 6 (Frontend & Web UX)

## [07 September 2026 | 18:35 IST]

### Discovery
Found that packaging the frontend inside an Electron container adds unnecessary binary size (~120 MB), complicates cross-platform field deployment, and conflicts with DoCA's core requirement for an enterprise online web platform.

### Evidence
`05_TECHNOLOGY_DECISION_RECORD.md` (ADR-02), `16_DECISION_LOG.md` (ADL-18), and `17_OPEN_QUESTIONS.md` (OQ-05).

### Decision
Standardize on an **Online-First React 18 + Vite Web SPA** running in standard modern browsers (Chrome 120+, Edge, Firefox) across desktop, laptop, tablet, and mobile devices.

### Why
Zero client installation overhead; instantaneous updates; accessible across any device in the field or office.

### Impact
Universal accessibility and simplified demonstration architecture.

### Status
ACTIVE
