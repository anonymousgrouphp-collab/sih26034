# NIRIKSHAK — METROLENS AI

SIH 2026 frontend prototype for an AI-assisted Legal Metrology Package Inspection Workstation.

## UX update in this version

- Official-looking responsive landing page inspired by Indian government portal information hierarchy and eMaap-style service presentation.
- Responsive design for laptop, tablet and smartphone.
- Role-based mock login with four roles:
  - Legal Metrology Inspector
  - Senior Officer
  - System Administrator
  - Audit Officer
- Role-aware navigation and default workspace routing.
- Mobile sidebar drawer and compact topbar.
- Human-in-the-loop language: AI assists evidence extraction/checking; the officer retains final decision authority.
- Existing inspection dashboard, analysis, evidence dossier, rules, reports and settings remain integrated.

## Demo login

All demo roles use password: `Demo@123`

| Role | User ID | Landing workspace |
|---|---|---|
| Inspector | `inspector@metrolens.gov.in` | Dashboard |
| Senior Officer | `senior.officer@metrolens.gov.in` | Review Queue |
| Administrator | `admin@metrolens.gov.in` | Settings |
| Auditor | `audit@metrolens.gov.in` | Reports |

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Production hardening

The login is intentionally mock-only. A real deployment should replace it with official government SSO/MFA, RBAC enforcement on the backend, secure session management, tamper-evident audit logs, secure evidence storage, approved rule/version management, device identity, monitoring, tests and accessibility validation.

The landing-page imagery uses remote Unsplash images for the prototype. Replace these with approved government/department imagery before production.


## UI/UX V3 — Premium Inspection Analysis

The Inspection Analysis screen has been rebuilt as an integrated computer-vision workstation inspired by the supplied reference:
- dark image-analysis canvas with zoom/fit/reset/overlay tools
- selectable image evidence strip
- annotation overlays with confidence labels
- OCR extraction panel
- calibration and measurement math
- deterministic rule evaluation
- detected issue / human-review panel
- analysis timeline
- confidence score visualization
- evidence integrity summary
- officer assessment and review actions
- responsive layout for laptop, tablet and smartphone
- local demo SVG assets so the core analysis image does not break when internet access is unavailable

The frontend remains a prototype: production authentication, RBAC enforcement, secure evidence storage, approved legal rules, audit integrity and backend validation are required before deployment.
