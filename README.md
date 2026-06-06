# Doran Local Delivery - Tunbridge Wells

**Single driver "buy anything & deliver" app** for Tunbridge Wells and nearby towns.

## Features (MVP)
- Customer order form with categories + custom notes
- Age restricted item handling (cigarettes, alcohol)
- Mock Stripe checkout
- Driver dashboard with live status updates
- ID check confirmation
- Delivery proof simulation
- Mobile-first UI

## Quick Start
```bash
npm install
cp .env.local.example .env.local
# Fill in Supabase + Stripe keys
# Run schema in Supabase SQL editor
npm run dev