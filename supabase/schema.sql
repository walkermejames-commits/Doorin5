-- Doorin5 FC-led local delivery schema
-- Run this in the Supabase SQL editor for a fresh project.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  pickup_hint TEXT NOT NULL,
  pickup_address TEXT,
  dropoff_address TEXT NOT NULL,
  dropoff_postcode TEXT,
  postcode TEXT,
  urgency TEXT NOT NULL DEFAULT 'ASAP',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'request_submitted',
  estimated_fee_pence INTEGER NOT NULL DEFAULT 0,
  age_check_required BOOLEAN NOT NULL DEFAULT false,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  stripe_session_id TEXT,
  driver_id UUID,
  driver_name TEXT,
  assigned_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  secure_token_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  age_restricted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  item_estimate_pence INTEGER NOT NULL DEFAULT 0 CHECK (item_estimate_pence >= 0),
  delivery_fee_pence INTEGER NOT NULL DEFAULT 0 CHECK (delivery_fee_pence >= 0),
  service_fee_pence INTEGER NOT NULL DEFAULT 0 CHECK (service_fee_pence >= 0),
  total_pence INTEGER NOT NULL DEFAULT 0 CHECK (total_pence >= 0),
  fc_notes TEXT,
  quote_status TEXT NOT NULL DEFAULT 'draft',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS delivery_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'driver',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL DEFAULT 'text',
  proof_note TEXT,
  photo_url TEXT,
  recipient_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS age_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES delivery_orders(id) ON DELETE CASCADE,
  checked BOOLEAN NOT NULL DEFAULT false,
  checked_by TEXT,
  check_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS delivery_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES delivery_orders(id) ON DELETE SET NULL,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL DEFAULT 'customer_intake',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','active','paused','rejected')),
  available BOOLEAN NOT NULL DEFAULT true,
  active_jobs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS dropoff_postcode TEXT;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'ASAP';
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE delivery_orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'delivery_orders_status_check'
      AND conrelid = 'delivery_orders'::regclass
  ) THEN
    ALTER TABLE delivery_orders DROP CONSTRAINT delivery_orders_status_check;
  END IF;

  ALTER TABLE delivery_orders
    ADD CONSTRAINT delivery_orders_status_check
    CHECK (status IN (
      'request_submitted','fc_reviewing','quote_sent','quote_accepted','payment_pending','paid',
      'assigned','accepted','shopping','collected','en_route','delivered','completed','cancelled',
      'quote_expired','quote_rejected'
    ));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'delivery_orders_payment_status_check'
      AND conrelid = 'delivery_orders'::regclass
  ) THEN
    ALTER TABLE delivery_orders DROP CONSTRAINT delivery_orders_payment_status_check;
  END IF;

  ALTER TABLE delivery_orders
    ADD CONSTRAINT delivery_orders_payment_status_check
    CHECK (payment_status IN ('unpaid','mock_paid','pending','paid','refunded','failed'));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'delivery_quotes_quote_status_check'
      AND conrelid = 'delivery_quotes'::regclass
  ) THEN
    ALTER TABLE delivery_quotes DROP CONSTRAINT delivery_quotes_quote_status_check;
  END IF;

  ALTER TABLE delivery_quotes
    ADD CONSTRAINT delivery_quotes_quote_status_check
    CHECK (quote_status IN ('draft','sent','accepted','rejected','expired'));
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'delivery_orders_driver_id_fkey'
      AND conrelid = 'delivery_orders'::regclass
  ) THEN
    ALTER TABLE delivery_orders
      ADD CONSTRAINT delivery_orders_driver_id_fkey
      FOREIGN KEY (driver_id)
      REFERENCES driver_profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_payment_status ON delivery_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_postcode ON delivery_orders(COALESCE(dropoff_postcode, postcode));
CREATE INDEX IF NOT EXISTS idx_delivery_orders_driver_id ON delivery_orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_driver_status ON delivery_orders(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_created_at ON delivery_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_completed_at ON delivery_orders(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_secure_token_hash ON delivery_orders(secure_token_hash);
CREATE INDEX IF NOT EXISTS idx_delivery_order_items_order_id ON delivery_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_quotes_order_id ON delivery_quotes(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_quotes_status ON delivery_quotes(quote_status);
CREATE INDEX IF NOT EXISTS idx_delivery_status_events_order_id ON delivery_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_events_order_created_at ON delivery_status_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_links_token_hash ON delivery_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_event_log_entries_target ON event_log_entries(target_type, target_id);

ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log_entries ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
