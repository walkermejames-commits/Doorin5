# Doorin5 MVP Audit

## Executive Summary

Doorin5 has moved from a technical prototype into a credible local courier MVP demo. The App Router issue is fixed, the core public routes load, demo mode works without Supabase, and the customer, driver, FC, and tracking surfaces now show a coherent manual-dispatch workflow.

The product is suitable for founder-led demos, customer discovery, and a tightly controlled manual pilot. The first Supabase-backed operational artery now exists for order creation, dispatch, driver status progression, proof capture, completion, and customer tracking. It is not ready for unattended public launch or live card charging without authentication, production Stripe checkout, notifications, and operational controls.

## Readiness Scores

| Area | Score |
| --- | ---: |
| Overall MVP readiness | 82% |
| Customer UX readiness | 78% |
| Driver UX readiness | 74% |
| FC operations readiness | 78% |
| Revenue readiness | 48% |
| Production readiness | 58% |
| Estimated completion to pilot-ready MVP | 80% |

## 1. What Currently Exists?

- Next.js App Router app using `src/app` as the only routing root.
- Public homepage at `/` with FC branding, courier positioning, service area, trust signals, and CTAs.
- Multi-step customer order form at `/order`.
- Driver dashboard at `/driver` with demo active jobs, available jobs, estimated earnings, status progression, and proof-of-delivery placeholder.
- FC dashboard at `/fc` with today's orders, active drivers, revenue estimate, exceptions, and dispatch queue.
- Demo-safe APIs for order creation, checkout placeholder, dispatch, driver jobs, driver status progression, proof placeholder, age verification, operations summary, readiness, suitcase config, secure links, and customer tracking.
- Supabase schema, seed files, and repository functions for the initial durable operational workflow.
- README, demo setup docs, demo checklist, MVP walkthrough, and route screenshots.

## 2. What Is Unfinished?

- Stripe checkout is not wired into the customer order flow.
- Payment completion and webhook handling are still demo/mock oriented.
- Supabase persistence now covers the first operational lifecycle, but it still needs production environment verification against a live seeded Supabase project.
- No authentication or authorization for customers, drivers, or FC/admin users.
- No driver onboarding, approval, shift controls, or payout flow.
- No live tracking, route navigation integration, or customer notification channel.
- No production monitoring, analytics, rate limiting, or abuse prevention.
- No automated end-to-end smoke tests.

## 3. What Looks Like Placeholder or Demo Code?

- `/api/checkout` returns a mock checkout session pointing to `/track-demo`.
- `/api/complete-demo` is explicitly demo payment completion.
- Demo fallback still uses realistic fixture orders and drivers when Supabase is unavailable.
- Driver accept/progress actions persist in Supabase production mode and return demo API responses in fallback mode.
- Proof of delivery is a text/confirmation placeholder; there is no photo upload or storage.
- Driver names, earnings, active jobs, ETAs, and FC driver list are hard-coded demo data.
- Readiness endpoints report demo mode when Supabase or Stripe values are missing.

## 4. What Prevents Real Customer Use Today?

- Customers cannot complete a real payment.
- Submitted orders are durable when Supabase is configured with the service-role key; demo fallback orders are not production persistence.
- No customer notifications, confirmation SMS/email, cancellation flow, or support escalation.
- No live service availability rules beyond postcode validation.
- No clear terms for restricted items, refunds, substitutions, failed pickup, or delivery disputes.
- No privacy policy, terms, or customer support contact details.

## 5. What Prevents Real Driver Use Today?

- Drivers cannot sign in, identify themselves, or protect their job queue.
- Jobs can be assigned to Supabase driver profiles, but drivers are not yet authenticated users.
- Status progression persists for production Supabase mode, but the driver identity is not yet secured.
- No navigation link to pickup/dropoff apps.
- No payout ledger, shift controls, insurance/compliance checks, or driver profile management.
- Proof of delivery lacks file upload, storage, and review tooling.

## 6. What Prevents Deployment Today?

- Deployment can technically run, but production launch is blocked by missing environment configuration and operational controls.
- Required production env vars are not confirmed: Supabase URL/key, service role handling, Stripe secret/publishable keys, webhook secret, public app URL.
- No authentication guard for `/driver` or `/fc`.
- RLS is enabled in the committed Supabase schema, but user-role policies still need to be added once authentication exists.
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

Status: **Operational artery ready**

- Schema and seed data exist.
- Order creation can use Supabase when configured.
- FC assignment, driver progression, proof capture, completion, and customer tracking can use Supabase when configured.
- Demo mode works without Supabase.
- RLS is enabled; role-specific policies are still pending authentication.

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
- Role-specific Supabase RLS policies after auth is added.
- Customer notification flow.
- Driver navigation deep links.
- Proof photo upload.
- Terms, privacy, and support pages.
- Admin order detail view.
- Automated E2E smoke tests.

## Recommended Next 10 Tasks

1. Add real Stripe Checkout Session creation behind `/api/checkout`.
2. Add Stripe webhook route and payment-state persistence.
3. Apply and verify the operational Supabase schema against a live project.
4. Add role-specific Supabase RLS policies for authenticated customers, drivers, and FC.
5. Add basic FC/admin and driver authentication.
6. Add order detail pages for FC and drivers.
7. Add customer SMS/email confirmation hooks.
8. Add proof photo upload with Supabase Storage and storage policies.
9. Add legal/support pages: terms, privacy, restricted item policy, refund policy.
10. Add Playwright smoke tests for `/`, `/order`, `/driver`, `/fc`, and core API happy paths.

## Current Verdict

Doorin5 is demo-ready and closer to a manual pilot, but not yet revenue-ready. The fastest route to charging customers is to keep the current architecture, verify the Supabase operational artery in a live project, wire real Stripe checkout plus webhook confirmation, and protect `/driver` and `/fc` behind authentication.
