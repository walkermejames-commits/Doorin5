# Doorin5 demo test checklist

Use this checklist to prove the current demo spine works end to end.

## Before testing

Run the app locally:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Base URL:

```bash
http://localhost:3000
```

## 1. Readiness check

Request:

```bash
GET /api/readiness
```

Expected:

- `ok: true`
- `status: ok`
- mode is either `demo` or `hosted`
- warnings explain missing Supabase or Stripe config

Proves:

- app booted
- environment can be inspected
- demo mode is intentional, not a crash

## 2. Suitcase config

Request:

```bash
GET /api/suitcase
```

Expected:

- app name is Doorin5
- service area is Tunbridge Wells unless overridden
- Supabase readiness is reported
- Stripe readiness is reported

Proves:

- portable deployment config works

## 3. Create secure customer link

Request:

```bash
POST /api/link
```

Body:

```json
{
  "orderId": "demo-1001",
  "itemTitle": "Milk and tea bags",
  "customerName": "Demo Customer",
  "pickupHint": "Local shop collection"
}
```

Expected:

- token
- tokenHash
- link
- shareText

Proves:

- secure link generation works
- share text can be sent to a customer

## 4. Create order

Request:

```bash
POST /api/orders
```

Body:

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

Expected:

- mode is `demo` or `supabase`
- order is returned
- estimated fee is present
- status is created safely

Proves:

- customer request intake works
- postcode/item validation works
- Supabase fallback logic works

## 5. Checkout session

Request:

```bash
POST /api/checkout
```

Body:

```json
{ "orderId": "demo-1001" }
```

Expected:

- mock checkout session
- amount total in pence
- GBP currency
- URL points to demo tracking path

Proves:

- checkout-ready structure works

## 6. Complete demo payment

Request:

```bash
POST /api/complete-demo
```

Body:

```json
{
  "orderId": "demo-1001",
  "providerSessionId": "mock_session_demo-1001",
  "providerPaymentId": "mock_payment_demo-1001"
}
```

Expected:

- updated order
- status event
- event log entry

Proves:

- payment completion pattern works
- workflow event creation works

## 7. Dispatch demo driver

Request:

```bash
POST /api/dispatch
```

Body:

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

Expected:

- assigned order
- driver id/name
- status event
- event log entry

Proves:

- FC-style driver assignment pattern works

## 8. Driver jobs

Request:

```bash
GET /api/driver/jobs
```

Expected:

- jobs list
- dashboard rows in demo mode
- Supabase orders in hosted mode

Proves:

- driver dashboard data source works

## 9. Operations summary

Request:

```bash
GET /api/operations/summary
```

Expected:

- visibleJobs
- paidCount
- assignedCount
- unassignedPaidCount
- totalEstimatedFeesPence
- cards

Proves:

- FC-style operations summary works

## 10. Progress driver status

Request:

```bash
POST /api/driver/progress
```

Body:

```json
{ "orderId": "demo-1001", "status": "paid" }
```

Expected:

- next status
- status event

Proves:

- driver status lifecycle works

## 11. Completion details

Request:

```bash
POST /api/driver/complete
```

Body:

```json
{
  "orderId": "demo-1001",
  "proofNote": "Left with recipient at front door.",
  "recipientConfirmed": true
}
```

Expected:

- completion proof object

Proves:

- delivery completion record works

## 12. Verification details

Request:

```bash
POST /api/driver/verify
```

Body:

```json
{
  "orderId": "demo-1002",
  "checked": true,
  "checkedBy": "driver",
  "checkNote": "Checked before handover."
}
```

Expected:

- verification object

Proves:

- restricted-item verification pattern works

## 13. Public demo tracking

Request:

```bash
GET /api/track-demo
```

Expected:

- public order summary
- status label
- timeline

Proves:

- customer tracking model works

## Demo pass criteria

A demo pass means:

- readiness endpoint works
- suitcase endpoint works
- secure link endpoint works
- order endpoint works
- checkout endpoint works
- completion endpoint works
- dispatch endpoint works
- driver jobs endpoint works
- operations summary endpoint works
- progress endpoint works
- complete endpoint works
- verify endpoint works
- tracking endpoint works

## Current known limitation

The app still needs polished visible pages. The API spine is the working demo layer.
