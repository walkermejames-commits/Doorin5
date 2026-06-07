# Doorin5 - Tunbridge Wells Local Delivery MVP

Doorin5 is a focused single-driver local delivery app for Tunbridge Wells and nearby towns.

It reuses the strongest Door in Four ideas in a smaller demoable product:

- Secure customer delivery links
- Customer order request
- Local postcode/service-area check
- Delivery fee estimate
- Mock checkout
- Demo payment completion
- Driver dispatch
- Driver job queue
- Driver status progression
- Completion record
- Verification flow for restricted items
- Operations summary
- Public demo tracking summary
- Supabase schema and seed data
- Suitcase configuration endpoint

## Current status

The backend/demo spine is now in place. The visible customer and driver pages still need final UI wiring, but the API and data model are ready for local demonstration.

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Supabase setup

Run these files in the Supabase SQL editor:

```bash
supabase/schema.sql
supabase/seed-demo.sql
```

Then fill in `.env.local` with your Supabase URL and keys.

If Supabase is not configured, Doorin5 stays demoable with mock data.

## Demo endpoints

- `GET /api/suitcase` - report deployment/config readiness
- `POST /api/link` - create secure customer link and share text
- `POST /api/orders` - create a local delivery order
- `POST /api/checkout` - create a mock checkout session
- `POST /api/complete-demo` - complete demo payment and create workflow events
- `POST /api/dispatch` - assign a demo driver
- `GET /api/driver/jobs` - list demo or Supabase driver jobs
- `GET /api/operations/summary` - show FC-style job summary
- `POST /api/driver/progress` - move an order to the next driver status
- `POST /api/driver/complete` - save completion details
- `POST /api/driver/verify` - save verification details
- `GET /api/track-demo` - show a public demo tracking summary

## Demo guide

See:

```bash
docs/DEMO_SETUP.md
```

## Not production-ready yet

Before taking live orders, the app still needs:

- Polished page UI
- Real Stripe checkout completion
- Authentication
- Driver account controls
- Live location
- Error monitoring
- Basic admin controls

## First commercial goal

Use the demo to pitch one local takeaway, shop, or independent driver workflow. The first milestone is not national scale. The first milestone is one real local business saying yes.
