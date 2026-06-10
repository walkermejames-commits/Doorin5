-- Doorin5 FC-led demo seed data
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
  customer_email,
  pickup_hint,
  pickup_address,
  dropoff_address,
  dropoff_postcode,
  postcode,
  urgency,
  notes,
  status,
  estimated_fee_pence,
  age_check_required,
  payment_status
) VALUES (
  '00000000-0000-4000-8000-000000001001',
  'Mr Tibbs',
  '07593 331380',
  'demo@doorin5.local',
  'Any local shop with decent tea bags and milk',
  'Camden Road or nearby',
  'The Pantiles, Tunbridge Wells',
  'TN2 5TN',
  'TN2 5TN',
  'Tonight',
  'Ring on arrival. Customer prefers contactless handover.',
  'quote_sent',
  599,
  false,
  'unpaid'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_orders (
  id,
  customer_name,
  customer_phone,
  customer_email,
  pickup_hint,
  pickup_address,
  dropoff_address,
  dropoff_postcode,
  postcode,
  urgency,
  notes,
  status,
  estimated_fee_pence,
  age_check_required,
  payment_status,
  driver_id,
  driver_name,
  assigned_at
) VALUES (
  '00000000-0000-4000-8000-000000001002',
  'Test Customer',
  '07000 000000',
  'test@doorin5.local',
  'Topps Pizza or closest open takeaway',
  'High Brooms / St Johns corridor',
  'High Brooms, Tunbridge Wells',
  'TN4 9AA',
  'TN4 9AA',
  'ASAP',
  'Contains age restricted item. ID check required before handover.',
  'assigned',
  799,
  true,
  'paid',
  '00000000-0000-4000-8000-00000000d001',
  'Doorin5 Driver',
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_orders (
  id,
  customer_name,
  customer_phone,
  customer_email,
  pickup_hint,
  pickup_address,
  dropoff_address,
  dropoff_postcode,
  postcode,
  urgency,
  notes,
  status,
  estimated_fee_pence,
  age_check_required,
  payment_status
) VALUES (
  '00000000-0000-4000-8000-000000001003',
  'Queue Customer',
  '07000 333333',
  'queue@doorin5.local',
  'Closest open pharmacy',
  'Southborough or Tunbridge Wells',
  'High Brooms, Tunbridge Wells',
  'TN4 9AA',
  'TN4 9AA',
  'Within 60 minutes',
  'Customer asked for non-drowsy cold medicine if available.',
  'request_submitted',
  0,
  false,
  'unpaid'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_order_items (
  order_id,
  name,
  quantity,
  notes,
  age_restricted
) VALUES
  ('00000000-0000-4000-8000-000000001001', 'Milk', 1, 'Semi-skimmed if possible', false),
  ('00000000-0000-4000-8000-000000001001', 'Tea bags', 1, 'Decent brand please', false),
  ('00000000-0000-4000-8000-000000001001', 'Chocolate biscuits', 2, NULL, false),
  ('00000000-0000-4000-8000-000000001002', 'Pizza order', 1, 'Pepperoni if available', false),
  ('00000000-0000-4000-8000-000000001002', 'Bottle of wine', 1, 'Requires valid photo ID.', true),
  ('00000000-0000-4000-8000-000000001003', 'Cold medicine', 1, 'Non-drowsy if available.', false),
  ('00000000-0000-4000-8000-000000001003', 'Tissues', 2, NULL, false)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_quotes (
  id,
  order_id,
  item_estimate_pence,
  delivery_fee_pence,
  service_fee_pence,
  total_pence,
  fc_notes,
  quote_status,
  expires_at,
  accepted_at
) VALUES
  (
    '00000000-0000-4000-8000-00000000a001',
    '00000000-0000-4000-8000-000000001001',
    1425,
    599,
    150,
    2174,
    'We found everything at a nearby shop. Tea bags may be substituted for Yorkshire Tea if needed.',
    'sent',
    now() + interval '30 minutes',
    NULL
  ),
  (
    '00000000-0000-4000-8000-00000000a002',
    '00000000-0000-4000-8000-000000001002',
    2899,
    799,
    200,
    3898,
    'Paid demo job. Driver must check ID before handing over the wine.',
    'accepted',
    now() + interval '30 minutes',
    now()
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO delivery_status_events (
  order_id,
  from_status,
  to_status,
  actor,
  note
) VALUES
  ('00000000-0000-4000-8000-000000001001', NULL, 'request_submitted', 'customer', 'Customer submitted request.'),
  ('00000000-0000-4000-8000-000000001001', 'request_submitted', 'quote_sent', 'fc', 'FC sent quote.'),
  ('00000000-0000-4000-8000-000000001002', NULL, 'request_submitted', 'customer', 'Customer submitted request.'),
  ('00000000-0000-4000-8000-000000001002', 'quote_sent', 'paid', 'system', 'Demo order paid.'),
  ('00000000-0000-4000-8000-000000001002', 'paid', 'assigned', 'fc', 'Demo order assigned to Doorin5 Driver.'),
  ('00000000-0000-4000-8000-000000001003', NULL, 'request_submitted', 'customer', 'New request ready for FC review.');
