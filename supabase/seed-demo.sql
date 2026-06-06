-- Doorin5 demo seed data
-- Run after supabase/schema.sql.

INSERT INTO delivery_orders (
  id,
  customer_name,
  customer_phone,
  pickup_hint,
  dropoff_address,
  postcode,
  notes,
  status,
  estimated_fee_pence,
  age_check_required,
  payment_status
) VALUES (
  '00000000-0000-4000-8000-000000001001',
  'Demo Customer',
  '07000 000000',
  'Local shop collection',
  'The Pantiles, Tunbridge Wells',
  'TN2 5TN',
  'Demo order for showing the full driver workflow.',
  'paid',
  599,
  false,
  'mock_paid'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_order_items (
  order_id,
  name,
  quantity,
  notes,
  age_restricted
) VALUES
  ('00000000-0000-4000-8000-000000001001', 'Milk', 1, NULL, false),
  ('00000000-0000-4000-8000-000000001001', 'Tea bags', 1, NULL, false),
  ('00000000-0000-4000-8000-000000001001', 'Biscuits', 2, NULL, false)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_status_events (
  order_id,
  from_status,
  to_status,
  actor,
  note
) VALUES (
  '00000000-0000-4000-8000-000000001001',
  'draft',
  'paid',
  'system',
  'Demo order marked as paid.'
);
