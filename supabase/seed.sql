-- Carguvi demo seed data.
-- All demo accounts use password: password123

-- ---------------------------------------------------------------------------
-- Demo auth users
-- ---------------------------------------------------------------------------

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'superadmin@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Carguvi Super Admin","role":"super_admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Tariro Chikafu","role":"admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'enumerator@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Blessing Moyo","role":"enumerator"}', now(), now()),
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'mambo@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Tinashe Mambo","role":"vendor"}', now(), now()),
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'batteries@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Rudo Nyathi","role":"vendor"}', now(), now()),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'tyres@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Farai Dube","role":"vendor"}', now(), now()),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'bearings@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Chipo Zvobgo","role":"vendor"}', now(), now()),
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'cashier@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Nyasha Mambo","role":"staff"}', now(), now()),
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'customer@carguvi.co.zw', crypt('password123', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Takudzwa Chirwa","role":"customer"}', now(), now())
on conflict (id) do nothing;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', now(), now(), now()
from auth.users u
where u.email like '%@carguvi.co.zw'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Vehicle catalogue
-- ---------------------------------------------------------------------------

insert into public.vehicle_makes (id, name) values
  (1, 'Toyota'), (2, 'Mazda'), (3, 'Honda'), (4, 'Nissan'), (5, 'Isuzu'), (6, 'Mercedes-Benz')
on conflict do nothing;

insert into public.vehicle_models (id, make_id, name) values
  (1, 1, 'Corolla'), (2, 1, 'Hilux'), (3, 1, 'Wish'), (4, 1, 'Aqua'),
  (5, 2, 'Demio'), (6, 2, 'Axela'),
  (7, 3, 'Fit'), (8, 3, 'CR-V'),
  (9, 4, 'Note'), (10, 4, 'X-Trail'),
  (11, 5, 'D-Max'),
  (12, 6, 'C-Class')
on conflict do nothing;

insert into public.vehicle_generations (id, model_id, name, year_start, year_end) values
  (1, 5, 'Old Shape (DY)', 2002, 2007),
  (2, 5, 'New Shape (DE/DJ)', 2007, 2019),
  (3, 1, 'E140/E150 Runx Shape', 2006, 2013),
  (4, 1, 'E170 Prestige', 2013, 2019),
  (5, 2, 'KUN/AN120 D4D', 2005, 2015),
  (6, 3, 'ZE10/20', 2009, 2014),
  (7, 7, 'GE/GP Second Gen', 2007, 2014),
  (8, 7, 'GK/GP Third Gen', 2013, 2020),
  (9, 9, 'E12 Second Gen', 2012, 2021),
  (10, 11, 'RT50 First Gen', 2012, 2020)
on conflict do nothing;

insert into public.vehicle_engines (id, generation_id, model_id, name, fuel_type, transmission) values
  (1, 2, 5, '1.3 Petrol (ZJ-VE)', 'petrol', 'any'),
  (2, 2, 5, '1.5 Petrol (ZY-VE)', 'petrol', 'any'),
  (3, 1, 5, '1.3 Petrol (13-DE)', 'petrol', 'any'),
  (4, 3, 1, '1.5 Petrol (1NZ-FE)', 'petrol', 'automatic'),
  (5, 3, 1, '1.8 Petrol (2ZR-FE)', 'petrol', 'automatic'),
  (6, 5, 2, '2.5 D4D (2KD-FTV)', 'diesel', 'manual'),
  (7, 5, 2, '3.0 D4D (1KD-FTV)', 'diesel', 'any'),
  (8, 6, 3, '1.8 Petrol (R18A)', 'petrol', 'cvt'),
  (9, 7, 7, '1.3 Petrol (L13A)', 'petrol', 'cvt'),
  (10, 8, 7, '1.5 Petrol (L15B)', 'petrol', 'cvt'),
  (11, 8, 7, '1.5 Hybrid (GP5)', 'hybrid', 'cvt'),
  (12, 9, 9, '1.2 Petrol (HR12DE)', 'petrol', 'cvt'),
  (13, 10, 11, '2.5 Diesel (4JK1)', 'diesel', 'manual')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

insert into public.categories (id, parent_id, name, slug, icon, sort_order) values
  (1, null, 'Engines', 'engines', 'engine', 1),
  (2, null, 'Gearboxes', 'gearboxes', 'gearbox', 2),
  (3, null, 'Brakes', 'brakes', 'brakes', 3),
  (4, null, 'Suspension', 'suspension', 'suspension', 4),
  (5, null, 'Electrical', 'electrical', 'electrical', 5),
  (6, null, 'Body Parts', 'body-parts', 'body', 6),
  (7, null, 'Tyres', 'tyres', 'tyre', 7),
  (8, null, 'Batteries', 'batteries', 'battery', 8),
  (9, null, 'Car Audio', 'car-audio', 'audio', 9),
  (10, null, 'Accessories', 'accessories', 'accessory', 10),
  (11, 3, 'Brake Pads', 'brake-pads', null, 1),
  (12, 3, 'Brake Discs', 'brake-discs', null, 2),
  (13, 4, 'Shock Absorbers', 'shock-absorbers', null, 1),
  (14, 4, 'Suspension Bushes', 'suspension-bushes', null, 2),
  (15, 5, 'Alternators', 'alternators', null, 1),
  (16, 5, 'Starter Motors', 'starter-motors', null, 2),
  (17, 5, 'ECUs', 'ecus', null, 3),
  (18, 5, 'Injectors', 'injectors', null, 4),
  (19, 1, 'Complete Engines', 'complete-engines', null, 1),
  (20, 1, 'Cylinder Heads', 'cylinder-heads', null, 2),
  (21, 2, 'Manual Gearboxes', 'manual-gearboxes', null, 1),
  (22, 2, 'Automatic Gearboxes', 'automatic-gearboxes', null, 2),
  (23, 6, 'Headlights', 'headlights', null, 1),
  (24, 6, 'Bumpers', 'bumpers', null, 2),
  (25, 10, 'Wheel Bearings', 'wheel-bearings', null, 1),
  (26, 10, 'Filters', 'filters', null, 2)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Vendors
-- ---------------------------------------------------------------------------

insert into public.vendors (id, owner_user_id, business_name, slug, description, phone, whatsapp, email,
  status, physical_address, operating_area, city, is_verified, verified_at, rating, review_count) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000010',
   'Mambo Auto Parts', 'mambo-auto-parts',
   'Japanese engine and gearbox specialists. Stripping a wide range of ex-Japanese imports for quality used parts.',
   '+263 77 200 1001', '+263 77 200 1001', 'sales@mamboparts.co.zw',
   'approved', 'Stand 12, Kaguvi Street, Harare', 'Kaguvi Street', 'Harare',
   true, now() - interval '30 days', 4.8, 26),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000011',
   'Zimbabwe Batteries', 'zimbabwe-batteries',
   'New and reconditioned batteries for all makes. Free fitting on Kaguvi Street.',
   '+263 77 200 1002', '+263 77 200 1002', 'info@zimbabwebatteries.co.zw',
   'approved', 'Shop 4, Kaguvi Street, Harare', 'Kaguvi Street', 'Harare',
   true, now() - interval '60 days', 4.6, 41),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000012',
   'Harare Tyres', 'harare-tyres',
   'New and quality used tyres, wheel alignment and balancing.',
   '+263 77 200 1003', '+263 77 200 1003', 'sales@hararetyres.co.zw',
   'approved', 'Cnr Kaguvi & Cameron Street, Harare', 'Kaguvi Street', 'Harare',
   false, null, 4.3, 18),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000013',
   'Kaguvi Bearings', 'kaguvi-bearings',
   'Bearings, seals, belts and drivetrain components for Japanese and European vehicles.',
   '+263 77 200 1004', '+263 77 200 1004', 'kaguvibearings@gmail.com',
   'approved', 'Stand 7, Kaguvi Street, Harare', 'Kaguvi Street', 'Harare',
   true, now() - interval '14 days', 4.9, 33),
  ('10000000-0000-4000-8000-000000000005', null,
   'Southerton Auto Electrical', 'southerton-auto-electrical',
   'Alternators, starters, ECUs and wiring specialists.',
   '+263 77 200 1005', '+263 77 200 1005', 'southertonelectrical@gmail.com',
   'approved', 'Southerton Industrial Area, Harare', 'Southerton', 'Harare',
   false, null, 4.1, 9)
on conflict do nothing;

insert into public.vendor_locations (id, vendor_id, name, address, area, city, latitude, longitude, is_primary, pickup_available, pickup_instructions, delivery_available) values
  ('11000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Mambo Auto Parts — Kaguvi', 'Stand 12, Kaguvi Street', 'Kaguvi Street', 'Harare', -17.8292, 31.0496, true, true, 'Ask for Tinashe at the counter. Bring your order number.', true),
  ('11000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'Zimbabwe Batteries — Kaguvi', 'Shop 4, Kaguvi Street', 'Kaguvi Street', 'Harare', -17.8285, 31.0482, true, true, 'Free battery fitting while you wait.', true),
  ('11000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'Harare Tyres — Kaguvi Corner', 'Cnr Kaguvi & Cameron Street', 'Kaguvi Street', 'Harare', -17.8301, 31.0510, true, true, 'Tyres fitted on the spot.', true),
  ('11000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000004', 'Kaguvi Bearings', 'Stand 7, Kaguvi Street', 'Kaguvi Street', 'Harare', -17.8290, 31.0489, true, true, 'Counter service only.', false),
  ('11000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000005', 'Southerton Auto Electrical', '14 Coventry Rd, Southerton', 'Southerton', 'Harare', -17.8620, 31.0220, true, true, null, true)
on conflict do nothing;

insert into public.vendor_staff (vendor_id, user_id, staff_role, permissions) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000014', 'cashier',
   '{"manage_orders": true, "confirm_listings": true, "manage_products": false}'::jsonb)
on conflict do nothing;

insert into public.vendor_metrics (vendor_id, stock_accuracy, fulfilment_rate, cancellation_rate, avg_response_minutes, confirmation_consistency, verification_consistency) values
  ('10000000-0000-4000-8000-000000000001', 98, 96, 2, 25, 94, 97),
  ('10000000-0000-4000-8000-000000000002', 97, 99, 1, 15, 91, 95),
  ('10000000-0000-4000-8000-000000000003', 91, 93, 5, 60, 82, 88),
  ('10000000-0000-4000-8000-000000000004', 99, 98, 1, 20, 96, 98),
  ('10000000-0000-4000-8000-000000000005', 88, 90, 7, 90, 75, 80)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Products — the canonical Mazda Demio engine scenario plus catalogue breadth
-- ---------------------------------------------------------------------------

insert into public.products (id, vendor_id, category_id, title, description, condition, price, currency,
  part_number, oem_number, availability, quantity, status,
  seller_updated_at, seller_confirmed_at, carguvi_verified_at, pickup_available, delivery_available, view_count) values
  -- Vendor A: Mambo — $1,850, Carguvi confirmed 2 days ago
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 19,
   'Mazda Demio New Shape 1.3 Petrol Engine',
   'Complete ZJ-VE engine removed from a low-mileage ex-Japanese 2011 Demio. Compression tested on arrival — all cylinders within spec. Sold complete with intake manifold, throttle body and injectors. Gearbox not included. 30-day startup warranty.',
   'used', 1850.00, 'USD', 'ZJ-VE', 'ZJ-VE-2011', 'in_stock', 1, 'active',
   now() - interval '6 hours', now() - interval '8 days', now() - interval '2 days', true, true, 143),
  -- Vendor B: Southerton — $1,900, Carguvi confirmed yesterday
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000005', 19,
   'Mazda Demio 1.3 Engine (New Shape) — ZJ-VE',
   'Tested 1.3 petrol engine for Demio new shape (2008–2014). We bench-test every engine before sale. ECU available separately if required.',
   'used', 1900.00, 'USD', 'ZJ-VE', null, 'in_stock', 1, 'active',
   now() - interval '3 hours', now() - interval '4 days', now() - interval '1 day', true, true, 98),
  -- Vendor C: Kaguvi Bearings — $1,750, seller confirmed 5 days ago, stale
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', 19,
   'Demio New Shape Engine 1.3 Petrol',
   '1.3 petrol engine suit Mazda Demio new shape. Good runner — heard it running before the donor was stripped.',
   'used', 1750.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '9 days', now() - interval '5 days', now() - interval '21 days', true, false, 67),
  -- Toyota Corolla brake pads (two vendors)
  ('20000000-0000-4000-8000-000000000010', '10000000-0000-4000-8000-000000000001', 11,
   'Toyota Corolla Front Brake Pads (E140 Runx Shape)',
   'Quality aftermarket front brake pad set for Corolla E140/E150. Fits Runx shape models. Set of four pads.',
   'new', 28.00, 'USD', 'BP-04465-E140', '04465-02220', 'in_stock', 24, 'active',
   now() - interval '2 hours', now() - interval '2 days', now() - interval '2 days', true, true, 311),
  ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000004', 11,
   'Corolla E140 Brake Pad Set — Front',
   'Genuine-spec ceramic brake pads. Low dust formulation.',
   'new', 32.00, 'USD', null, '04465-02220', 'in_stock', 40, 'active',
   now() - interval '1 day', now() - interval '10 days', now() - interval '14 days', true, false, 190),
  -- Hilux D4D injectors
  ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000005', 18,
   'Toyota Hilux D4D Injector (2KD-FTV) — Refurbished',
   'Professionally refurbished common-rail injector for 2.5 D4D. Flow tested and coded. Sold per unit — set of 4 available.',
   'refurbished', 145.00, 'USD', 'INJ-23670-0L020', '23670-0L020', 'in_stock', 6, 'active',
   now() - interval '5 hours', now() - interval '3 days', now() - interval '1 day', true, true, 256),
  -- Honda Fit gearbox
  ('20000000-0000-4000-8000-000000000013', '10000000-0000-4000-8000-000000000001', 22,
   'Honda Fit (GE) CVT Gearbox',
   'Complete CVT automatic gearbox for Honda Fit second generation. Torque converter included. Tested smooth shift before removal.',
   'used', 950.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '12 hours', now() - interval '6 days', now() - interval '3 days', true, true, 88),
  -- Batteries
  ('20000000-0000-4000-8000-000000000014', '10000000-0000-4000-8000-000000000002', 8,
   'Car Battery 628 — 12V 55Ah (New)',
   'New maintenance-free calcium battery, 628 size. 18-month warranty. Free fitting.',
   'new', 85.00, 'USD', 'BAT-628', null, 'in_stock', 30, 'active',
   now() - interval '1 hour', now() - interval '1 day', now() - interval '4 days', true, true, 402),
  ('20000000-0000-4000-8000-000000000015', '10000000-0000-4000-8000-000000000002', 8,
   'Car Battery 646 — 12V 65Ah (New)',
   'Heavy duty 646 battery for larger sedans and SUVs. 18-month warranty.',
   'new', 110.00, 'USD', 'BAT-646', null, 'in_stock', 18, 'active',
   now() - interval '1 hour', now() - interval '1 day', now() - interval '4 days', true, true, 178),
  -- Tyres
  ('20000000-0000-4000-8000-000000000016', '10000000-0000-4000-8000-000000000003', 7,
   'Bridgestone 175/65R14 Tyre (New)',
   'New Bridgestone Ecopia. Price per tyre, fitting and balancing included.',
   'new', 55.00, 'USD', 'TYR-1756514', null, 'in_stock', 40, 'active',
   now() - interval '4 hours', now() - interval '7 days', now() - interval '11 days', true, true, 145),
  ('20000000-0000-4000-8000-000000000017', '10000000-0000-4000-8000-000000000003', 7,
   'Dunlop 185/70R14 Tyre (Used, 70% tread)',
   'Quality used Dunlop with approximately 70% tread remaining. Inspected for sidewall damage.',
   'used', 25.00, 'USD', null, null, 'low_stock', 3, 'active',
   now() - interval '2 days', now() - interval '12 days', now() - interval '25 days', true, false, 76),
  -- Bearings
  ('20000000-0000-4000-8000-000000000018', '10000000-0000-4000-8000-000000000004', 25,
   'Front Wheel Bearing — Toyota Corolla/Vitz (Koyo)',
   'Genuine Koyo front wheel bearing. Fits most Toyota small cars including Corolla E140, Vitz, Belta.',
   'new', 18.00, 'USD', 'BRG-90363-40066', '90363-40066', 'in_stock', 60, 'active',
   now() - interval '3 hours', now() - interval '4 days', now() - interval '2 days', true, false, 234),
  -- Car radio
  ('20000000-0000-4000-8000-000000000019', '10000000-0000-4000-8000-000000000005', 9,
   'Bluetooth Car Radio with USB & Aux',
   'Single-DIN head unit with Bluetooth hands-free, USB charging and FM radio. Universal fitment.',
   'new', 35.00, 'USD', 'RAD-BT1', null, 'in_stock', 15, 'active',
   now() - interval '7 hours', now() - interval '9 days', null, true, true, 129),
  -- Alternator (stale listing needing confirmation)
  ('20000000-0000-4000-8000-000000000020', '10000000-0000-4000-8000-000000000001', 15,
   'Toyota Corolla 1NZ-FE Alternator',
   'Used alternator for Corolla 1.5. Bench tested, charges at 14.2V.',
   'used', 65.00, 'USD', null, '27060-21030', 'in_stock', 2, 'active',
   now() - interval '31 days', now() - interval '31 days', now() - interval '40 days', true, true, 54),
  -- Shock absorbers
  ('20000000-0000-4000-8000-000000000021', '10000000-0000-4000-8000-000000000004', 13,
   'Hilux D4D Front Shock Absorbers (Pair, KYB)',
   'KYB Excel-G front shocks for Hilux KUN25/26. Sold as a pair.',
   'new', 96.00, 'USD', 'KYB-341372', null, 'in_stock', 8, 'active',
   now() - interval '1 day', now() - interval '5 days', now() - interval '8 days', true, false, 112),
  -- Demio ECU
  ('20000000-0000-4000-8000-000000000022', '10000000-0000-4000-8000-000000000005', 17,
   'Mazda Demio ZJ-VE ECU',
   'Engine control unit matched to ZJ-VE engines. Tested.',
   'used', 120.00, 'USD', null, null, 'available_on_order', null, 'active',
   now() - interval '2 days', now() - interval '15 days', null, true, true, 33),
  -- Headlight
  ('20000000-0000-4000-8000-000000000023', '10000000-0000-4000-8000-000000000001', 23,
   'Mazda Demio New Shape Right Headlight',
   'Genuine used right-side headlight for Demio new shape. Lens clear, no cracks. Bulbs not included.',
   'used', 45.00, 'USD', null, null, 'in_stock', 2, 'active',
   now() - interval '8 hours', now() - interval '7 days', now() - interval '3 days', true, false, 61),
  -- Stale: old listing that needs confirmation
  ('20000000-0000-4000-8000-000000000024', '10000000-0000-4000-8000-000000000003', 7,
   'Michelin 195/65R15 (Used, 60% tread)',
   'Used Michelin Energy. Even wear.',
   'used', 30.00, 'USD', null, null, 'unknown', 1, 'active',
   now() - interval '45 days', now() - interval '45 days', null, true, false, 12)
on conflict do nothing;

insert into public.product_images (product_id, url, sort_order) values
  ('20000000-0000-4000-8000-000000000001', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000002', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000003', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000010', '/images/parts/brake-pads.svg', 0),
  ('20000000-0000-4000-8000-000000000011', '/images/parts/brake-pads.svg', 0),
  ('20000000-0000-4000-8000-000000000012', '/images/parts/injector.svg', 0),
  ('20000000-0000-4000-8000-000000000013', '/images/parts/gearbox.svg', 0),
  ('20000000-0000-4000-8000-000000000014', '/images/parts/battery.svg', 0),
  ('20000000-0000-4000-8000-000000000015', '/images/parts/battery.svg', 0),
  ('20000000-0000-4000-8000-000000000016', '/images/parts/tyre.svg', 0),
  ('20000000-0000-4000-8000-000000000017', '/images/parts/tyre.svg', 0),
  ('20000000-0000-4000-8000-000000000018', '/images/parts/bearing.svg', 0),
  ('20000000-0000-4000-8000-000000000019', '/images/parts/radio.svg', 0),
  ('20000000-0000-4000-8000-000000000020', '/images/parts/alternator.svg', 0),
  ('20000000-0000-4000-8000-000000000021', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000022', '/images/parts/ecu.svg', 0),
  ('20000000-0000-4000-8000-000000000023', '/images/parts/headlight.svg', 0),
  ('20000000-0000-4000-8000-000000000024', '/images/parts/tyre.svg', 0)
on conflict do nothing;

-- Compatibility
insert into public.product_compatibility (product_id, make_id, model_id, generation_id, engine_id, year_start, year_end) values
  ('20000000-0000-4000-8000-000000000001', 2, 5, 2, 1, 2007, 2014),
  ('20000000-0000-4000-8000-000000000002', 2, 5, 2, 1, 2008, 2014),
  ('20000000-0000-4000-8000-000000000003', 2, 5, 2, null, 2007, 2014),
  ('20000000-0000-4000-8000-000000000010', 1, 1, 3, null, 2006, 2013),
  ('20000000-0000-4000-8000-000000000011', 1, 1, 3, null, 2006, 2013),
  ('20000000-0000-4000-8000-000000000012', 1, 2, 5, 6, 2005, 2015),
  ('20000000-0000-4000-8000-000000000013', 3, 7, 7, null, 2007, 2014),
  ('20000000-0000-4000-8000-000000000018', 1, 1, null, null, null, null),
  ('20000000-0000-4000-8000-000000000020', 1, 1, 3, 4, 2006, 2013),
  ('20000000-0000-4000-8000-000000000021', 1, 2, 5, null, 2005, 2015),
  ('20000000-0000-4000-8000-000000000022', 2, 5, 2, 1, 2007, 2014),
  ('20000000-0000-4000-8000-000000000023', 2, 5, 2, null, 2007, 2014)
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Verification records (produce "Carguvi confirmed" freshness)
-- ---------------------------------------------------------------------------

insert into public.verification_tasks (id, enumerator_id, vendor_id, product_id, task_type, status, assigned_by, due_date, started_at, completed_at, created_at) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'product_availability', 'completed', '00000000-0000-4000-8000-000000000002', current_date - 2, now() - interval '2 days', now() - interval '2 days', now() - interval '3 days'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'product_availability', 'completed', '00000000-0000-4000-8000-000000000002', current_date - 1, now() - interval '1 day', now() - interval '1 day', now() - interval '2 days'),
  ('30000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', 'product_availability', 'assigned', '00000000-0000-4000-8000-000000000002', current_date + 1, null, null, now() - interval '1 day'),
  ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000020', 'product_availability', 'assigned', '00000000-0000-4000-8000-000000000002', current_date, null, null, now() - interval '1 day'),
  ('30000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', null, 'shop_check', 'assigned', '00000000-0000-4000-8000-000000000002', current_date, null, null, now() - interval '2 days')
on conflict do nothing;

insert into public.carguvi_verifications (task_id, enumerator_id, vendor_id, product_id, observed_availability, observed_price, price_discrepancy, notes, shop_verified, created_at) values
  ('30000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'in_stock', 1850.00, false, 'Engine physically on the shelf at stand 12. Price tag matches listing.', true, now() - interval '2 days'),
  ('30000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000002', 'in_stock', 1900.00, false, 'Confirmed on bench. Vendor ran compression test in front of me.', true, now() - interval '1 day')
on conflict do nothing;

insert into public.seller_confirmations (product_id, vendor_id, confirmed_by, response, source, created_at) values
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000013', 'available', 'reminder', now() - interval '5 days'),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000010', 'available', 'dashboard', now() - interval '8 days')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Customer garage
-- ---------------------------------------------------------------------------

insert into public.customer_vehicles (id, user_id, make_id, model_id, generation_id, engine_id, year, nickname, is_primary) values
  ('40000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 2, 5, 2, 1, 2011, 'My Demio', true)
on conflict do nothing;

insert into public.addresses (id, user_id, label, recipient_name, phone, line1, area, city, is_default) values
  ('41000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 'Home', 'Takudzwa Chirwa', '+263 77 555 0123', '14 Mbuya Nehanda Close', 'Borrowdale', 'Harare', true)
on conflict do nothing;

insert into public.product_favourites (user_id, product_id) values
  ('00000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000020', '20000000-0000-4000-8000-000000000014')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Sample order (completed, reviewable)
-- ---------------------------------------------------------------------------

insert into public.orders (id, customer_id, status, currency, subtotal, delivery_fee, total, created_at, updated_at) values
  ('50000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000020', 'completed', 'USD', 85.00, 5.00, 90.00, now() - interval '20 days', now() - interval '19 days')
on conflict do nothing;

insert into public.vendor_orders (id, order_id, vendor_id, status, fulfillment_type, pickup_location_id, subtotal, delivery_fee, created_at, updated_at) values
  ('51000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'completed', 'delivery', null, 85.00, 5.00, now() - interval '20 days', now() - interval '19 days')
on conflict do nothing;

insert into public.order_items (vendor_order_id, product_id, title, condition, unit_price, quantity) values
  ('51000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000014', 'Car Battery 628 — 12V 55Ah (New)', 'new', 85.00, 1)
on conflict do nothing;

insert into public.payments (order_id, provider, method, amount, currency, status, reference, created_at) values
  ('50000000-0000-4000-8000-000000000001', 'mock', 'ecocash', 90.00, 'USD', 'confirmed', 'DEMO-ECO-0001', now() - interval '20 days')
on conflict do nothing;

insert into public.deliveries (vendor_order_id, provider, status, address_id, fee, distance_km, created_at) values
  ('51000000-0000-4000-8000-000000000001', 'carguvi_local', 'delivered', '41000000-0000-4000-8000-000000000001', 5.00, 9.4, now() - interval '20 days')
on conflict do nothing;

insert into public.reviews (vendor_order_id, vendor_id, product_id, user_id, rating, product_rating, vendor_rating, comment) values
  ('51000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000020', 5, 5, 5, 'Battery fitted same afternoon. Professional service.'),
  ('51000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', null, '00000000-0000-4000-8000-000000000020', 4, null, 4, 'Quick delivery to Borrowdale.')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

insert into public.notifications (user_id, type, title, body, data) values
  ('00000000-0000-4000-8000-000000000010', 'listing_confirmation', '2 listings need confirmation',
   'Customers are searching for parts on your storefront. Confirm availability to keep your listings fresh.',
   '{"product_ids": ["20000000-0000-4000-8000-000000000020"]}'),
  ('00000000-0000-4000-8000-000000000020', 'order', 'Order delivered',
   'Your battery order from Zimbabwe Batteries was delivered.', '{"order_id": "50000000-0000-4000-8000-000000000001"}'),
  ('00000000-0000-4000-8000-000000000003', 'verification_assignment', '5 verification tasks assigned',
   'New tasks for Kaguvi Street vendors due this week.', '{}')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Platform settings
-- ---------------------------------------------------------------------------

insert into public.platform_settings (key, value) values
  ('delivery', '{"radius_km": 40, "base_fee_usd": 3, "per_km_usd": 0.5, "provider": "carguvi_local"}'),
  ('payments', '{"providers": ["mock"], "methods": ["ecocash", "zipit", "cash_on_pickup"]}'),
  ('freshness', '{"carguvi_fresh_days": 7, "seller_fresh_days": 14, "stale_days": 21}'),
  ('reminders', '{"max_listings_per_reminder": 3}')
on conflict do nothing;
