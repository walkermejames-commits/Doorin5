# Doorin5 MVP Walkthrough

Doorin5 is now a demo-safe courier MVP for Tunbridge Wells. It can be shown to customers, drivers, and an FC dispatcher without Supabase credentials because the visible routes use local demo data and the existing demo-safe API responses.

## User-Facing Routes

| Route | Audience | MVP status | Notes |
| --- | --- | --- | --- |
| `/` | Customers, FC, drivers | Usable landing page | Professional courier positioning, clear CTA, service area, trust indicators, and navigation to order, driver, and FC views. |
| `/order` | Customers | Usable multi-step order flow | Covers pickup, delivery, item details, urgency, contact details, validation, summary, loading, API error, and success states. Posts to `POST /api/orders`. |
| `/driver` | Driver | Usable demo dashboard | Shows active jobs, available jobs, estimated earnings, status progression via `POST /api/driver/progress`, empty states, and proof placeholder via `POST /api/driver/complete`. |
| `/fc` | FC dispatcher | Usable demo dashboard | Shows today's orders, active drivers, estimated revenue, exceptions, and dispatch queue. Dispatch action uses `POST /api/dispatch`. |

## API Route Audit

| API route | Status | Demo behavior |
| --- | --- | --- |
| `POST /api/orders` | Usable | Validates customer order input and returns a paid demo order when Supabase is not configured. |
| `POST /api/checkout` | Demo-only | Returns a mock checkout session. The current customer flow submits an order request rather than redirecting to checkout. |
| `POST /api/complete-demo` | Demo-only | Completes a mock payment workflow for demo order data. |
| `POST /api/dispatch` | Usable demo action | Assigns a demo driver to a demo order. |
| `GET /api/driver/jobs` | Usable | Returns demo jobs and dashboard rows without Supabase. |
| `POST /api/driver/progress` | Usable demo action | Moves an order to the next status. |
| `POST /api/driver/complete` | Usable demo action | Saves proof-of-delivery placeholder details. |
| `POST /api/driver/verify` | Demo-only | Saves verification details for restricted-item flows. |
| `GET /api/operations/summary` | Usable | Returns demo operations cards and summary totals. |
| `GET /api/readiness` | Usable | Reports local app readiness and environment warnings. |
| `GET /api/suitcase` | Usable | Reports suitcase/config readiness. |
| `GET /api/track-demo` | Demo-only | Public demo tracking response. |
| `POST /api/link` | Demo support | Creates secure customer link/share text. |

## Fixed MVP Gaps

- Placeholder homepage replaced with courier landing page and FC branding.
- Customer order flow expanded from a three-screen mock to a validated five-step form.
- Missing FC dashboard added at `/fc`.
- Driver dashboard expanded to active jobs, available jobs, earnings, status updates, and proof placeholder.
- Navigation added across customer, driver, and FC surfaces.
- Demo mode remains functional without Supabase credentials.
- Empty states, loading states, API error states, and success states are present in the visible MVP flows.

## Demo Walkthrough

1. Open `/` and confirm the courier proposition, service area, trust indicators, and CTA are visible.
2. Select `Book a delivery`.
3. In `/order`, complete pickup, delivery, items, contact, and summary steps.
4. Submit the order. In demo mode, the app returns a local demo order reference.
5. Open `/fc` and review today's orders, exceptions, active drivers, and dispatch queue.
6. Dispatch an available order from `/fc`.
7. Open `/driver`, accept or progress jobs, and save a proof-of-delivery placeholder.

## Screenshot Checklist

Screenshots are stored in:

- `docs/screenshots/home.png`
- `docs/screenshots/order.png`
- `docs/screenshots/driver.png`
- `docs/screenshots/fc.png`

## Production Readiness Score

**72 / 100**

Doorin5 is now usable as a real MVP demo and a manual local courier pilot, but it is not ready for unattended production.

### Ready

- Customer-facing order intake is coherent and mobile-first.
- Driver and FC workflows have complete demo states.
- App builds cleanly.
- Demo mode works without Supabase.
- Existing APIs are reused instead of bypassed.

### Not Ready

- Stripe checkout is still mock/demo-only.
- No customer authentication or driver authentication.
- Supabase persistence needs a live configured project and production data checks.
- Dispatch actions are local UI state in demo mode and not persisted across reloads.
- Proof-of-delivery file upload is a placeholder.
- No automated E2E test suite yet.
- No production monitoring, incident handling, or admin access controls.

## Recommended Next Milestones

1. Wire `/order` to mock checkout completion or real Stripe checkout depending on environment.
2. Add persistent Supabase-backed dispatch and driver status updates.
3. Add driver authentication and FC-only dashboard access.
4. Add proof photo upload and storage rules.
5. Add Playwright smoke tests for `/`, `/order`, `/driver`, and `/fc`.
