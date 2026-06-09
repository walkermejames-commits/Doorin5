# Doorin5 mining pass from Door in Four / Doran 4

This note records the reusable ideas extracted from the selected Door in Four commits and how they were ported into Doorin5 without copying the monorepo.

## Source commits mined

- `52d5fa5bac5503f6814833fe64b3575b77d90bce` - buyer delivery details form
- `fd14cde2175462aae8f6bc5aaca9a5ec5f666722` - secure delivery link creation
- `23b488abf73c2829f79d4b6186aece2e3c2a309a` - Stripe completion webhook pattern
- `55ac468961b68d78fb47c637b02ab587c82d45e5` - checkout guard before payment
- `0ca3712a62510228f39aa67ffed9e1fa64df000b` - FC operations board concepts
- `d73d005f163af674b5896828807ac88adb780513` - FC driver assignment API

## What was ported

### Secure delivery links

Doorin5 now has `src/lib/secure-links.ts` for:

- random token generation
- SHA-256 token hashing
- public delivery link creation
- share text generation

### Intake model

Doorin5 now has `src/lib/intake.ts` for:

- customer details
- pickup details
- dropoff details
- delivery window
- stairs/access notes
- item details
- conversion into order notes/items

### Payment safety

Doorin5 now has `src/lib/payment-safety.ts` for:

- blocking checkout if an order is not payable
- preventing duplicate paid checkout
- marking draft orders as paid after completion

### Payment completion pattern

Doorin5 now has `src/lib/payment-completion.ts` for:

- order status update
- status-event creation
- event-log entry creation

### Event log

Doorin5 now has `src/lib/event-log.ts` for:

- payment confirmed records
- driver assignment records
- generic workflow event records

### Driver assignment

Doorin5 now has `src/lib/driver-assignment.ts` for:

- driver eligibility checks
- availability checks
- assignment result creation
- status and event-log generation

### Operations board summary

Doorin5 now has `src/lib/operations-board.ts` for:

- job card view models
- paid count
- assigned count
- unassigned paid count
- estimated fee totals
- driver availability summary

### Schema expansion

`supabase/schema.sql` now includes:

- `delivery_links`
- `driver_profiles`
- `event_log_entries`
- driver fields on `delivery_orders`
- secure token hash fields
- indexes for driver, token, and event-log lookup

## What was intentionally not copied

- Full monorepo structure
- Seller/admin/mobile split
- Old booking table shape
- Large UI route files
- App-specific FC operations screen markup
- Full Stripe webhook implementation

Doorin5 remains single-driver, local-first, and demo-friendly.

## Next recommended mining pass

Build simple API wrappers around the new helper modules:

- `POST /api/links/create`
- `POST /api/payment/complete-demo`
- `POST /api/driver/assign`
- `GET /api/operations/summary`

If connector route writes are blocked, add lib helpers first and wire routes locally with Codex.
