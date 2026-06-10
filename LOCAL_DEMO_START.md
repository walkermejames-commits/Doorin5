# Local demo start guide

This project is designed to run locally in demo mode even when Supabase or Stripe are not configured yet.

## 1) Clone and switch to the reconciliation branch

```bash
git clone https://github.com/walkermejames-commits/Doorin5.git
cd Doorin5
git checkout demo-ready-reconciliation
```

## 2) Install dependencies and create your local env file

```bash
npm install
cp .env.example .env.local
```

The file `.env.example` already includes safe placeholder values so the demo can start without real secrets.

## 3) Start the app

```bash
npm run dev
```

## 4) Open the demo pages

Open these links in your browser:

- http://localhost:3000
- http://localhost:3000/order
- http://localhost:3000/fc
- http://localhost:3000/driver
- http://localhost:3000/track/demo-1002

## 5) What to expect

- The app will run in demo mode if Supabase or Stripe are not configured yet.
- The FC and driver pages stay usable for a quick pilot walkthrough.
- You can still create orders, view readiness, and inspect the tracking flow.

If you want an extra check before starting, run:

```bash
npm run smoke:pilot
```
