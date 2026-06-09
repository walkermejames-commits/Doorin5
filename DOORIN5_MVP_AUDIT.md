# Doorin5 MVP Audit

## Executive Summary

Doorin5 has moved from a technical prototype into a credible local courier MVP demo. The App Router issue is fixed, the core public routes load, demo mode works without Supabase, and the customer, driver, and FC surfaces now show a coherent manual-dispatch workflow.

The product is suitable for founder-led demos, customer discovery, and a tightly controlled manual pilot. It is not ready for unattended public launch, live card charging, or real driver operations without authentication, persistent dispatch state, production Stripe checkout, and operational controls.

## Readiness Scores

| Area | Score |
| --- | ---: |
| Overall MVP readiness | 76% |
| Customer UX readiness | 78% |
| Driver UX readiness | 68% |
| FC operations readiness | 70% |
| Revenue readiness | 42% |
| Production readiness | 48% |
| Estimated completion to pilot-ready MVP | 72% |

## 1. What Currently Exists?

- Next.js App Router app using `src/app` as the only routing root.
- Public homepage at `/` with FC branding, courier positioning, service area, trust signals, and CTAs.
- Multi-step customer order form at `/order`.
- Driver dashboard at `/driver` with demo active jobs, available jobs, estimated earnings, status progression, and proof-of-delivery placeholder.
- FC dashboard at `/fc` with today's orders, active drivers, revenue estimate, exceptions, and dispatch queue.
- Demo-safe APIs for order creation, checkout placeholder, dispatch, driver jobs, driver status progression, proof placeholder, age verification, operations summary, readiness, suitcase config, secure links, and demo tracking.
- Supabase schema and seed files for the initial data model.
- README, demo setup docs, demo checklist, MVP walkthrough, and route screenshots.

## 2. What Is Unfinished?

- Stripe checkout is not wired into the customer order flow.
- Payment completion and webhook handling are still demo/mock oriented.
- Supabase persistence is partial: order creation can write to Supabase, but driver progress, dispatch state, proof details, and FC dashboard actions are not fully persisted through the visible UI.
- No authentication or authorization for customers, drivers, or FC/admin users.
- No driver onboarding, approval, shift controls, or payout flow.
- No live tracking, route navigation integration, or customer notification channel.
- No production monitoring, analytics, rate limiting, or abuse prevention.
- No automated end-to-end smoke tests.

## 3. What Looks Like Placeholder or Demo Code?

- `/api/checkout` returns a mock checkout session pointing to `/track-demo`.
- `/api/complete-demo` is explicitly demo payment completion.
- `/driver` and `/fc` initialize from in-memory `demoOrders`.
- Driver accept/progress actions update local UI state and demo API responses, not durable server state in demo mode.
- Proof of delivery is a text/confirmation placeholder; there is no photo upload or storage.
- Driver names, earnings, active jobs, ETAs, and FC driver list are hard-coded demo data.
- Readiness endpoints report demo mode when Supabase or Stripe values are missing.

## 4. What Prevents Real Customer Use Today?

- Customers cannot complete a real payment.
- Submitted demo orders are not durable unless Supabase is configured and the specific path writes to it.
- No customer notifications, confirmation SMS/email, cancellation flow, or support escalation.
- No live service availability rules beyond postcode validation.
- No clear terms for restricted items, refunds, substitutions, failed pickup, or delivery disputes.
- No privacy policy, terms, or customer support contact details.

## 5. What Prevents Real Driver Use Today?

- Drivers cannot sign in, identify themselves, or protect their job queue.
- Jobs are not assigned to authenticated driver accounts.
- Status progression is not fully persisted for real operations through the UI.
- No navigation link to pickup/dropoff apps.
- No payout ledger, shift controls, insurance/compliance checks, or driver profile management.
- Proof of delivery lacks file upload, storage, and review tooling.

## 6. What Prevents Deployment Today?

- Deployment can technically run, but production launch is blocked by missing environment configuration and operational controls.
- Required production env vars are not confirmed: Supabase URL/key, service role handling, Stripe secret/publishable keys, webhook secret, public app URL.
- No authentication guard for `/driver` or `/fc`.
- No RLS policies are defined in the committed Supabase schema.
- No production observability, error logging, uptime checks, or alerting.
- No CI workflow is present for automated build/smoke verification.

## 7. What Prevents Charging Customers Today?

- Stripe checkout is mocked and not connected to the customer form.
- No Stripe Checkout Session creation with real line items, service fees, metadata, and success/cancel URLs.
- No webhook route to verify Stripe events and mark orders paid.
- No refund, failed-payment, or payment reconciliation flow.
- No customer receipt or payment terms.
- No clear split between delivery fee, service fee, item reimbursement, and restricted-item surcharge.

## Revenue Readiness Audit

### Stripe Readiness

Status: **Not revenue-ready**

- Env placeholders exist for Stripe keys and webhook secret.
- Current checkout route returns a mock session only.
- No real Stripe SDK call is made from the visible order flow.
- No webhook handler persists paid status.
- No pricing model is enforced server-side.

### Supabase Readiness

Status: **Partially ready**

- Schema and seed data exist.
- Order creation can use Supabase when configured.
- Demo mode works without Supabase.
- RLS policies are missing.
- Driver/FC state transitions need durable Supabase-backed implementations.

### Authentication Readiness

Status: **Not ready**

- No auth UI.
- No customer sessions.
- No driver sessions.
- No FC/admin access control.
- `/driver` and `/fc` are public demo routes.

### Production Deployment Readiness

Status: **Partially ready**

- `npm run build` passes.
- App Router is clean.
- `.env.local.example` documents required keys.
- Production deployment needs real env vars, protected routes, RLS, Stripe webhooks, monitoring, and smoke tests.

## Missing Features

- Real Stripe Checkout integration.
- Stripe webhook payment confirmation.
- Authenticated driver and FC access.
- Supabase RLS and persistence for dispatch/status/proof.
- Customer notification flow.
- Driver navigation deep links.
- Proof photo upload.
- Terms, privacy, and support pages.
- Admin order detail view.
- Automated E2E smoke tests.

## Recommended Next 10 Tasks

1. Add real Stripe Checkout Session creation behind `/api/checkout`.
2. Add Stripe webhook route and payment-state persistence.
3. Persist FC dispatch and driver status updates in Supabase.
4. Add Supabase RLS policies for all exposed tables.
5. Add basic FC/admin and driver authentication.
6. Add order detail pages for FC and drivers.
7. Add customer SMS/email confirmation hooks.
8. Add proof photo upload with Supabase Storage and storage policies.
9. Add legal/support pages: terms, privacy, restricted item policy, refund policy.
10. Add Playwright smoke tests for `/`, `/order`, `/driver`, `/fc`, and core API happy paths.

## Current Verdict

Doorin5 is demo-ready and close to a manual pilot, but not yet revenue-ready. The fastest route to charging customers is to keep the current architecture, wire real Stripe checkout plus webhook confirmation, persist operational actions in Supabase, and protect `/driver` and `/fc` behind authentication.
