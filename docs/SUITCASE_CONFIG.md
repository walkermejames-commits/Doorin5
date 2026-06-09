# Doorin5 suitcase configuration

The suitcase configuration is the portable setup layer for Doorin5.

It answers one question:

> Can this repo be picked up, moved to another machine or hosting platform, and still explain how to run the demo?

## Files added

- `.env.local.example` - environment variable template
- `src/lib/suitcase.ts` - runtime configuration helper
- `src/app/api/suitcase/route.ts` - configuration health endpoint
- `docs/DEMO_SETUP.md` - demo walkthrough
- `supabase/schema.sql` - database structure
- `supabase/seed-demo.sql` - demo data

## Suitcase endpoint

Run the app and open:

```bash
/api/suitcase
```

It returns:

```json
{
  "ok": true,
  "data": {
    "appName": "Doorin5",
    "mode": "demo",
    "serviceArea": "Tunbridge Wells",
    "driverName": "Doorin5 Driver",
    "appUrl": "http://localhost:3000",
    "demoTrackingPath": "/track-demo",
    "supabaseConfigured": false,
    "stripeConfigured": false
  }
}
```

## Modes

### demo

Used when Supabase is not configured. APIs return mock/demo data.

### hosted

Used when Supabase environment variables are present. Order creation and driver jobs can use Supabase.

## Required variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
DEMO_DRIVER_NAME=
DEMO_SERVICE_AREA=
```

## Optional payment variables

```bash
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Demo checklist

1. Clone repo.
2. Run `npm install`.
3. Copy `.env.local.example` to `.env.local`.
4. Run `npm run dev`.
5. Check `/api/suitcase`.
6. Check `/api/driver/jobs`.
7. POST to `/api/orders`.
8. POST to `/api/checkout`.
9. POST to `/api/driver/progress`.
10. Show the flow to one local business.

## Next wiring target

The visible route files need to consume the existing components and APIs:

- home page reads `/api/suitcase`
- order page posts to `/api/orders`
- driver page reads `/api/driver/jobs`
- tracking page reads `/api/track-demo`

The backend is now much more ready than the UI.
