# Local demo start guide

This project is designed to run locally in demo mode even when Supabase or Stripe are not configured yet.

## 1) Clone, switch branches, install, and start

```bash
git clone https://github.com/walkermejames-commits/Doorin5.git
cd Doorin5
git checkout main
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

The file `.env.example` includes safe local demo passcodes, so the FC and driver pages open directly on localhost.

## 2) Open the demo pages

Open these links in your browser:

- http://localhost:3000
- http://localhost:3000/order
- http://localhost:3000/fc
- http://localhost:3000/driver
- http://localhost:3000/track/demo-1002

## 3) What to expect

- The app will run in demo mode if Supabase or Stripe are not configured yet.
- The FC and driver pages stay usable for a quick pilot walkthrough.
- You can still create orders, view readiness, and inspect the tracking flow.

If you want an extra check before starting, run:

```bash
npm run build
npm run smoke
```
