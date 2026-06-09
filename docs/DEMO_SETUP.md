# Doorin5 demo setup

This guide gets the app ready for a local or hosted MVP demonstration.

## 1. Install and run

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open:

- Home: http://localhost:3000
- Suitcase config: http://localhost:3000/api/suitcase
- Demo tracking API: http://localhost:3000/api/track-demo
- Driver jobs API: http://localhost:3000/api/driver/jobs
- Operations summary API: http://localhost:3000/api/operations/summary

## 2. Supabase setup

Create a Supabase project, then open the SQL editor and run:

1. `supabase/schema.sql`
2. `supabase/seed-demo.sql`

Then copy the Supabase URL and keys into `.env.local`.

If Supabase is not configured, the app stays in demo mode and returns mock data.

## 3. Demo flow to show a local business

Use this story:

1. A shop or driver creates a secure customer link.
2. A customer gives local delivery details.
3. The app validates postcode and item details.
4. The app estimates a local delivery fee.
5. Checkout creates a mock payment session.
6. Payment completion marks the order as paid.
7. Dispatch assigns a demo driver.
8. Driver jobs and operations summary show the job.
9. Driver progresses the order status.
10. Driver records completion details.
11. Customer can see a simple tracking timeline.

## 4. Demo endpoints

### Suitcase config

`GET /api/suitcase`

Reports app mode, Supabase readiness, Stripe readiness, service area, driver name, app URL, and tracking path.

### Create secure customer link

`POST /api/link`

```json
{
  "orderId": "demo-1001",
  "itemTitle": "Milk and tea bags",
  "customerName": "Demo Customer",
  "pickupHint": "Local shop collection"
}
```

Returns:

- token
- tokenHash
- public link
- share text

### Create an order

`POST /api/orders`

Example body:

```json
{
  "customerName": "Demo Customer",
  "customerPhone": "07000 000000",
  "pickupHint": "Local shop collection",
  "dropoffAddress": "The Pantiles, Tunbridge Wells",
  "postcode": "TN2 5TN",
  "items": [
    { "name": "Milk", "quantity": 1 },
    { "name": "Tea bags", "quantity": 1 }
  ]
}
```

In demo mode this returns a mock paid order. In Supabase mode it writes the order and items to the database.

### Create checkout session

`POST /api/checkout`

```json
{ "orderId": "demo-1001" }
```

### Complete demo payment

`POST /api/complete-demo`

```json
{
  "orderId": "demo-1001",
  "providerSessionId": "mock_session_demo-1001",
  "providerPaymentId": "mock_payment_demo-1001"
}
```

Returns:

- updated order
- status event
- event log entry

### Dispatch demo driver

`POST /api/dispatch`

```json
{
  "orderId": "demo-1001",
  "driver": {
    "id": "demo-driver-1",
    "name": "Doorin5 Driver",
    "status": "active",
    "available": true
  }
}
```

Returns:

- assigned order
- status event
- event log entry

### Driver jobs

`GET /api/driver/jobs`

Returns demo jobs when Supabase is not configured. Returns open Supabase orders when Supabase is configured.

### Operations summary

`GET /api/operations/summary`

Returns:

- visible jobs
- paid count
- assigned count
- unassigned paid count
- estimated fee total
- available drivers
- busy drivers
- job cards

### Progress driver status

`POST /api/driver/progress`

```json
{ "orderId": "demo-1001", "status": "paid" }
```

### Driver completion details

`POST /api/driver/complete`

```json
{
  "orderId": "demo-1001",
  "proofNote": "Left with recipient at front door.",
  "recipientConfirmed": true
}
```

### Driver verification

`POST /api/driver/verify`

```json
{
  "orderId": "demo-1002",
  "checked": true,
  "checkedBy": "driver",
  "checkNote": "Checked before handover."
}
```

### Demo tracking

`GET /api/track-demo`

Returns a public tracking summary for the demo order.

## 5. What is still mocked

- Real Stripe payment capture
- Authentication
- Driver identity enforcement
- Live location
- Customer-facing polished screens

## 6. What is real enough for a first pitch

- Secure customer link model
- Order model
- Fee estimate logic
- Payment guard pattern
- Payment completion pattern
- Driver dispatch pattern
- Driver job workflow
- Status progression
- Completion record structure
- Operations summary
- Supabase schema
- Demo data
