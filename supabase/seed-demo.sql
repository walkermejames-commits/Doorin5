-- Doorin5 demo seed data
-- Run after supabase/schema.sql.

INSERT INTO driver_profiles (
  id,
  name,
  phone,
  status,
  available,
  active_jobs
) VALUES
  ('00000000-0000-4000-8000-00000000d001', 'Doorin5 Driver', '07000 111111', 'active', true, 1),
  ('00000000-0000-4000-8000-00000000d002', 'Backup rider', '07000 222222', 'approved', true, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  available = EXCLUDED.available,
  active_jobs = EXCLUDED.active_jobs;

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
  payment_status,
  driver_id,
  driver_name,
  assigned_at
) VALUES (
  '00000000-0000-4000-8000-000000001001',
  'Demo Customer',
  '07000 000000',
  'Local shop collection',
  'The Pantiles, Tunbridge Wells',
  'TN2 5TN',
  'Demo order for showing the full driver workflow.',
  'assigned',
  599,
  false,
  'mock_paid',
  '00000000-0000-4000-8000-00000000d001',
  'Doorin5 Driver',
  now()
) ON CONFLICT (id) DO NOTHING;

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
  '00000000-0000-4000-8000-000000001002',
  'Queue Customer',
  '07000 333333',
  'Closest open pharmacy',
  'High Brooms, Tunbridge Wells',
  'TN4 9AA',
  'Unassigned order for FC dispatch queue testing.',
  'draft',
  799,
  true,
  'unpaid'
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
  ('00000000-0000-4000-8000-000000001001', 'Biscuits', 2, NULL, false),
  ('00000000-0000-4000-8000-000000001002', 'Cold medicine', 1, 'Customer requested non-drowsy if available.', false),
  ('00000000-0000-4000-8000-000000001002', 'Age restricted item', 1, 'Requires FC review before dispatch.', true)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_status_events (
  order_id,
  from_status,
  to_status,
  actor,
  note
) VALUES
  (
    '00000000-0000-4000-8000-000000001001',
    'draft',
    'paid',
    'system',
    'Demo order marked as paid.'
  ),
  (
    '00000000-0000-4000-8000-000000001001',
    'paid',
    'assigned',
    'fc',
    'Demo order assigned to Doorin5 Driver.'
  ),
  (
    '00000000-0000-4000-8000-000000001002',
    NULL,
    'draft',
    'customer',
    'Demo queue order created.'
  );
