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
- Demo tracking API: http://localhost:3000/api/track-demo
- Driver jobs API: http://localhost:3000/api/driver/jobs

## 2. Supabase setup

Create a Supabase project, then open the SQL editor and run:

1. `supabase/schema.sql`
2. `supabase/seed-demo.sql`

Then copy the Supabase URL and keys into `.env.local`.

## 3. Demo flow to show a local business

Use this story:

1. A customer needs local items collected.
2. The app validates postcode and item details.
3. The app estimates a local delivery fee.
4. Checkout creates a mock payment session.
5. Driver dashboard shows paid jobs.
6. Driver progresses the order status.
7. Driver records completion details.
8. Customer can see a simple tracking timeline.

## 4. Existing demo endpoints

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

### Create checkout session

`POST /api/checkout`

```json
{ "orderId": "demo-1001" }
```

### Driver jobs

`GET /api/driver/jobs`

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

## 5. What is still mocked

- Real Stripe payment capture
- Authentication
- Driver identity
- Live location
- Customer-facing polished screens

## 6. What is real enough for a first pitch

- Order model
- Fee estimate logic
- Driver job workflow
- Status progression
- Completion record structure
- Supabase schema
- Demo data
