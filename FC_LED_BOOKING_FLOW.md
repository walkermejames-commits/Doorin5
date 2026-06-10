# Doorin5 FC-led booking flow

Doorin5 now uses FC-led pricing as the source of truth. Customers submit a request first; payment only happens after FC has priced the errand and the customer accepts the quote.

## Customer flow

1. Customer opens `/order`.
2. Customer submits pickup, items, substitution notes, age restriction flags, dropoff, urgency and contact details.
3. The order is created with `request_submitted`.
4. Customer sees "Request sent to FC" and can open `/quote/[orderId]`.
5. If no quote exists, the quote page says FC is reviewing the request.
6. Once FC sends a quote, the customer reviews item/product estimate, delivery fee, service fee, total, FC notes and expiry.
7. Customer accepts or rejects.
8. Accepted quotes move the order toward payment; rejected quotes become `quote_rejected`.
9. Checkout can only start from an accepted quote.
10. Stripe webhook marks the order `paid`.
11. FC assigns a driver.
12. Driver progresses the job.
13. Customer tracks the delivery at `/track/[orderId]`.

## Statuses

Customer and FC statuses:

- `request_submitted`
- `fc_reviewing`
- `quote_sent`
- `quote_accepted`
- `payment_pending`
- `paid`
- `assigned`
- `accepted`
- `shopping`
- `collected`
- `en_route`
- `delivered`
- `completed`
- `cancelled`
- `quote_expired`
- `quote_rejected`

Quote statuses:

- `draft`
- `sent`
- `accepted`
- `rejected`
- `expired`

## Payment flow

`/api/checkout` now uses the accepted `delivery_quotes.total_pence`. No accepted quote means no checkout. Stripe metadata includes `orderId` and `quoteId`.

On `checkout.session.completed`, the webhook sets:

- `delivery_orders.payment_status = paid`
- `delivery_orders.status = paid`
- status event and event log entries

## Driver visibility

Drivers only see jobs once:

- the order is paid
- FC has assigned a driver
- the order is in `assigned`, `accepted`, `shopping`, `collected`, `en_route` or `delivered`

Unpaid requests and quote-pending work stay inside FC.

## Production setup still needed

- Run `supabase/schema.sql` and `supabase/seed-demo.sql` against the production Supabase project.
- Add production Supabase and Stripe environment variables.
- Configure Stripe webhook endpoint and secret.
- Decide how FC quote links are sent to customers (SMS/email/manual link copy).
- Replace demo passcodes with production access control before launch.
