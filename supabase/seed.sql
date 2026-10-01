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
   'munyamuzvidziwa19@gmail.com', crypt('@@Griezmann177#$', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Munyah","phone":"+263773909307","role":"super_admin"}', now(), now()),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@carguviapp.com', crypt('@Lamineyamal19', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"full_name":"Admin1","phone":"+263770123456","role":"admin"}', now(), now()),
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
where u.email like '%@carguvi.co.zw' or u.email like '%@carguviapp.com' or u.email like '%@gmail.com'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Vehicle catalogue
-- ---------------------------------------------------------------------------

insert into public.vehicle_makes (id, name) values
  (1, 'Toyota'), (2, 'Mazda'), (3, 'Honda'), (4, 'Nissan'), (5, 'Isuzu'), (6, 'Mercedes-Benz'),
  (7, 'Subaru'), (8, 'Suzuki'), (9, 'Mitsubishi'), (10, 'Volkswagen'), (11, 'BMW'),
  (12, 'Ford'), (13, 'Kia'), (14, 'Hyundai'), (15, 'Audi'), (16, 'Peugeot'),
  (17, 'Land Rover'), (18, 'Chevrolet'), (19, 'Hino'), (20, 'Daihatsu'), (21, 'Jeep'),
  (22, 'Volvo'), (23, 'SsangYong'), (24, 'Great Wall'), (25, 'Chery'), (26, 'Renault')
on conflict do nothing;

insert into public.vehicle_models (id, make_id, name) values
  (1, 1, 'Corolla'), (2, 1, 'Hilux'), (3, 1, 'Wish'), (4, 1, 'Aqua'),
  (5, 2, 'Demio'), (6, 2, 'Axela'),
  (7, 3, 'Fit'), (8, 3, 'CR-V'),
  (9, 4, 'Note'), (10, 4, 'X-Trail'),
  (11, 5, 'D-Max'),
  (12, 6, 'C-Class'),
  -- Toyota — the dominant brand on Zim roads
  (13, 1, 'Vitz'), (14, 1, 'Fielder'), (15, 1, 'Axio'), (16, 1, 'Allion'),
  (17, 1, 'Premio'), (18, 1, 'RAV4'), (19, 1, 'Fortuner'), (20, 1, 'Hiace'),
  (21, 1, 'Mark X'), (22, 1, 'Harrier'), (23, 1, 'Vanguard'), (24, 1, 'Land Cruiser Prado'),
  (25, 1, 'Passo'), (26, 1, 'Raum'), (27, 1, 'Ractis'), (28, 1, 'Ipsum'),
  (29, 1, 'Estima'), (30, 1, 'Dyna'),
  -- Mazda
  (31, 2, 'Atenza'), (32, 2, 'CX-5'), (33, 2, 'CX-3'), (34, 2, 'Premacy'),
  (35, 2, 'Verisa'), (36, 2, 'Biante'), (37, 2, 'BT-50'), (38, 2, 'Familia Van'),
  -- Honda
  (39, 3, 'Fit Shuttle'), (40, 3, 'Vezel'), (41, 3, 'Insight'),
  (42, 3, 'Stream'), (43, 3, 'Stepwagon'), (44, 3, 'Airwave'), (45, 3, 'Grace'),
  -- Nissan
  (46, 4, 'March'), (47, 4, 'Tiida'), (48, 4, 'Serena'), (49, 4, 'NV350 Caravan'),
  (50, 4, 'Navara'), (51, 4, 'Teana'), (52, 4, 'AD Van'), (53, 4, 'Murano'),
  -- Subaru
  (54, 7, 'Forester'), (55, 7, 'Impreza'), (56, 7, 'XV / Crosstrek'), (57, 7, 'Legacy'),
  (58, 7, 'Outback'), (59, 7, 'Exiga'),
  -- Suzuki
  (60, 8, 'Swift'), (61, 8, 'Escudo / Vitara'), (62, 8, 'Solio'), (63, 8, 'Hustler'),
  (64, 8, 'Jimny'), (65, 8, 'Every'),
  -- Mitsubishi
  (66, 9, 'Outlander'), (67, 9, 'RVR / ASX'), (68, 9, 'Pajero'), (69, 9, 'Lancer'),
  (70, 9, 'Delica D:5'), (71, 9, 'Canter'),
  -- VW / Audi
  (72, 10, 'Golf'), (73, 10, 'Polo'), (74, 10, 'Tiguan'), (75, 10, 'Passat'),
  (76, 15, 'A3'), (77, 15, 'A4'), (78, 15, 'Q5'),
  -- BMW / Mercedes
  (79, 11, '1 Series'), (80, 11, '3 Series'), (81, 11, 'X1'), (82, 11, 'X3'), (83, 11, 'X5'),
  (84, 6, 'E-Class'), (85, 6, 'A-Class'), (86, 6, 'GLC'),
  -- Isuzu / Hino (commercial)
  (87, 5, 'Elf / NPR'), (88, 5, 'Forward'), (89, 5, 'Mu-X'), (90, 19, 'Dutro'), (91, 19, 'Ranger'),
  -- Ford / Kia / Hyundai
  (92, 12, 'Ranger'), (93, 12, 'Fiesta'), (94, 12, 'Focus'), (95, 12, 'Everest'),
  (96, 13, 'Sportage'), (97, 13, 'Rio'), (98, 13, 'Sorento'),
  (99, 14, 'Tucson'), (100, 14, 'Elantra / Avante'), (101, 14, 'Santa Fe'),
  (102, 14, 'Grand i10'),
  -- Others seen on Zim roads
  (103, 16, '208'), (104, 17, 'Defender'), (105, 17, 'Discovery'),
  (106, 18, 'Cruze'), (107, 20, 'Mira'), (108, 20, 'Move'), (109, 21, 'Grand Cherokee'),
  (110, 23, 'Korando'), (111, 24, 'Steed'), (112, 25, 'Tiggo'), (113, 26, 'Kwid')
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
  (10, 11, 'RT50 First Gen', 2012, 2020),
  -- Toyota additions
  (11, 13, 'XP90 Second Gen', 2005, 2010), (12, 13, 'XP130 Third Gen', 2010, 2020),
  (13, 4, 'NHP10 First Gen', 2011, 2021),
  (14, 14, 'E160/E180 Corolla Fielder', 2012, null),
  (15, 15, 'NZE141/144 Axio', 2006, 2012),
  (16, 15, 'NKE165 Hybrid Axio', 2013, null),
  (17, 16, 'NZT260 Allion', 2007, 2016),
  (18, 17, 'NZT260 Premio', 2007, 2016),
  (19, 18, 'ACA30/38 Third Gen', 2005, 2016), (20, 18, 'XA40 Fourth Gen', 2013, 2019),
  (21, 19, 'AN150/160 Fortuner', 2015, null),
  (22, 20, 'H200 Fifth Gen', 2004, null),
  (23, 21, 'GRX130 Second Gen', 2009, 2019),
  (24, 2, 'GUN125 Revo (8th Gen)', 2015, null),
  (25, 1, 'E120/E130 Runx/Fielder', 2000, 2006),
  (26, 22, 'ZSU60 Harrier', 2013, null),
  -- Mazda additions
  (27, 31, 'GJ Third Gen', 2012, 2021),
  (28, 32, 'KE First Gen', 2012, 2017),
  (29, 33, 'DK First Gen', 2015, null),
  (30, 34, 'CR Second Gen', 2005, 2018),
  (31, 35, 'DC5 Verisa', 2004, 2016),
  (32, 6, 'BL Axela Second Gen', 2009, 2013), (33, 6, 'BM Third Gen', 2013, 2019),
  (34, 37, 'UP/UR Second Gen', 2011, 2020),
  (35, 36, 'CC Biante', 2008, 2018),
  -- Honda additions
  (36, 39, 'GP7/GG Fit Shuttle', 2011, 2015),
  (37, 40, 'RU Vezel First Gen', 2013, 2021),
  (38, 42, 'RN6 Stream Second Gen', 2006, 2014),
  (39, 43, 'RK Stepwagon Fifth Gen', 2009, 2015),
  (40, 44, 'GJ Airwave', 2005, 2010),
  (41, 8, 'RE Third Gen', 2006, 2012), (42, 8, 'RM Fourth Gen', 2011, 2016),
  (43, 45, 'GM4/5 Grace', 2014, 2020),
  -- Nissan additions
  (44, 46, 'K13 Fourth Gen', 2010, null),
  (45, 47, 'C11 First Gen', 2004, 2012),
  (46, 48, 'C25 Fourth Gen', 2007, 2016), (47, 48, 'C26 Fifth Gen', 2016, null),
  (48, 49, 'E26 NV350', 2012, null),
  (49, 50, 'D23 NP300', 2014, null),
  (50, 51, 'L33 Third Gen', 2013, 2020),
  (51, 52, 'VZNY12 Wingroad/AD', 2005, 2018),
  (52, 10, 'T31 Second Gen', 2007, 2014), (53, 10, 'T32 Third Gen', 2013, 2022),
  -- Subaru
  (54, 54, 'SJ Fourth Gen', 2012, 2018),
  (55, 55, 'GP/GJ Fourth Gen', 2011, 2016),
  (56, 56, 'GP7 XV', 2012, 2017),
  (57, 57, 'BM/BR Fifth Gen', 2009, 2014),
  -- Suzuki
  (58, 60, 'ZC72 Second Gen', 2010, 2017),
  (59, 60, 'ZC32 Sport', 2011, 2017),
  (60, 62, 'MA26S Third Gen', 2011, 2015),
  (61, 64, 'JB23/64/74 Jimny', 1998, null),
  -- Mitsubishi
  (62, 66, 'GF Second Gen', 2012, 2021),
  (63, 67, 'GA RVR Third Gen', 2010, null),
  (64, 68, 'V80/90 Fourth Gen', 2006, 2021),
  (65, 70, 'CV Delica D:5', 2007, null),
  -- VW / Audi
  (66, 72, 'Golf 6', 2008, 2013), (67, 72, 'Golf 7', 2012, 2020),
  (68, 73, '6R Fifth Gen', 2009, 2018),
  (69, 74, '5N First Gen', 2007, 2016),
  (70, 75, 'B7 Passat', 2010, 2014),
  (71, 77, 'B8 A4', 2007, 2016),
  -- BMW / Mercedes
  (72, 80, 'E90 Fifth Gen', 2005, 2012), (73, 80, 'F30 Sixth Gen', 2011, 2019),
  (74, 81, 'E84 X1', 2009, 2015),
  (75, 12, 'W204 Third Gen', 2007, 2014), (76, 12, 'W205 Fourth Gen', 2014, 2021),
  (77, 84, 'W212 E-Class', 2009, 2016),
  -- Isuzu / commercial
  (78, 87, 'N-Series Sixth Gen', 2006, null),
  (89, 89, 'MU-X First Gen', 2013, 2021),
  (80, 90, 'Dutro Second Gen', 2011, null),
  -- Ford / Kia / Hyundai
  (81, 92, 'T6 Ranger', 2011, 2022),
  (82, 96, 'SL Third Gen', 2010, 2016),
  (83, 99, 'TL Third Gen', 2015, 2021),
  (84, 97, 'UB Third Gen', 2011, 2017),
  -- Others
  (85, 106, 'J300 First Gen', 2008, 2016),
  (86, 109, 'WK2 Fourth Gen', 2010, 2021),
  (87, 110, 'C200 Korando', 2011, 2019),
  (88, 104, 'L316 Def (Puma)', 2007, 2016),
  -- gens for commercial/Ford/Hyundai models (engine rows reference these ids)
  (90, 71, 'FE70/80 Eighth Gen', 2010, null),
  (91, 30, 'XZU Dyna', 2011, null),
  (92, 88, 'Forward F-Series', 2007, null),
  (93, 93, 'Mk7', 2008, 2017),
  (94, 94, 'Mk3', 2011, 2018),
  (98, 98, 'XM Second Gen', 2009, 2015),
  (99, 100, 'MD/UD Fifth Gen', 2010, 2016),
  (102, 102, 'IA/BA', 2013, 2019)
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
  (13, 10, 11, '2.5 Diesel (4JK1)', 'diesel', 'manual'),
  -- Toyota
  (14, 11, 13, '1.0 Petrol (1KR-FE)', 'petrol', 'any'),
  (15, 11, 13, '1.3 Petrol (2NZ-FE / KSP90)', 'petrol', 'any'),
  (16, 12, 13, '1.3 Petrol (1NR-FE)', 'petrol', 'any'),
  (17, 13, 4, '1.5 Hybrid (NHP10)', 'hybrid', 'cvt'),
  (18, 14, 14, '1.5 Petrol (1NZ-FE)', 'petrol', 'cvt'),
  (19, 14, 14, '1.5 Hybrid (NKE165)', 'hybrid', 'cvt'),
  (20, 15, 15, '1.5 Petrol (1NZ-FE)', 'petrol', 'cvt'),
  (21, 16, 15, '1.5 Hybrid (NKE165)', 'hybrid', 'cvt'),
  (22, 17, 16, '1.8 Petrol (2ZR-FE)', 'petrol', 'cvt'),
  (23, 18, 17, '1.8 Petrol (2ZR-FAE)', 'petrol', 'cvt'),
  (24, 19, 18, '2.0 Petrol (3ZR-FAE)', 'petrol', 'cvt'),
  (25, 19, 18, '2.4 Petrol (2AZ-FE)', 'petrol', 'cvt'),
  (26, 20, 18, '2.0 Diesel (D-4D)', 'diesel', 'any'),
  (27, 21, 19, '2.8 Diesel (1GD-FTV)', 'diesel', 'automatic'),
  (28, 24, 2, '2.8 Diesel (1GD-FTV)', 'diesel', 'any'),
  (29, 22, 20, '2.7 Diesel (1KD-FTV)', 'diesel', 'any'),
  (30, 23, 21, '2.5 V6 Petrol (4GR-FSE)', 'petrol', 'automatic'),
  (31, 24, 24, '2.7 Petrol (2TR-FE)', 'petrol', 'automatic'),
  (32, 25, 1, '2.0 Petrol (3ZZ-FE)', 'petrol', 'any'),
  (33, 25, 1, '1.6 Petrol (3ZZ-FE)', 'petrol', 'any'),
  (34, 26, 22, '2.0 Petrol (M20A)', 'petrol', 'cvt'),
  (35, 4, 1, '1.8 Petrol (2ZR-FE)', 'petrol', 'cvt'),
  -- Mazda
  (36, 27, 31, '2.0 Petrol (PE-VPS)', 'petrol', 'automatic'),
  (37, 27, 31, '2.5 Petrol (PY-VPS)', 'petrol', 'automatic'),
  (38, 28, 32, '2.0 Petrol (PE-VPS)', 'petrol', 'any'),
  (39, 28, 32, '2.5 Petrol (PY-VPS)', 'petrol', 'any'),
  (40, 28, 32, '2.2 Diesel (SH-VPTS)', 'diesel', 'any'),
  (41, 29, 33, '1.5 Petrol (P5-VPS)', 'petrol', 'any'),
  (42, 29, 33, '2.0 Petrol (PE-VPS)', 'petrol', 'any'),
  (43, 30, 34, '2.0 Petrol (LF-VD)', 'petrol', 'any'),
  (44, 32, 6, '1.5 Petrol (Z6)', 'petrol', 'any'),
  (45, 32, 6, '2.0 Petrol (LF-VD)', 'petrol', 'any'),
  (46, 33, 6, '1.5 Petrol (P5-VPS)', 'petrol', 'any'),
  (47, 33, 6, '2.0 Petrol (PE-VPS)', 'petrol', 'any'),
  (48, 34, 37, '3.2 Diesel (P5AT)', 'diesel', 'any'),
  (49, 35, 36, '2.0 Petrol (LF-VD)', 'petrol', 'any'),
  (50, 31, 35, '1.5 Petrol (ZY-VE)', 'petrol', 'any'),
  -- Honda
  (51, 36, 39, '1.5 Hybrid (LEB)', 'hybrid', 'cvt'),
  (52, 36, 39, '1.3 Petrol (L13B)', 'petrol', 'cvt'),
  (53, 37, 40, '1.5 Petrol (L15B)', 'petrol', 'cvt'),
  (54, 37, 40, '1.5 Hybrid (RU3)', 'hybrid', 'cvt'),
  (55, 38, 42, '1.8 Petrol (R18A)', 'petrol', 'automatic'),
  (56, 39, 43, '2.0 Petrol (R20A)', 'petrol', 'cvt'),
  (57, 40, 44, '1.5 Petrol (L15A)', 'petrol', 'cvt'),
  (58, 41, 8, '2.0 Petrol (R20A)', 'petrol', 'any'),
  (59, 42, 8, '2.4 Petrol (K24A)', 'petrol', 'cvt'),
  (60, 43, 45, '1.5 Petrol (L15B)', 'petrol', 'cvt'),
  (61, 7, 7, '1.3 Hybrid (GP1)', 'hybrid', 'cvt'),
  (62, 8, 7, '1.5 Petrol (L15B)', 'petrol', 'cvt'),
  -- Nissan
  (63, 44, 46, '1.2 Petrol (HR12DE)', 'petrol', 'cvt'),
  (64, 45, 47, '1.5 Petrol (HR15DE)', 'petrol', 'cvt'),
  (65, 45, 47, '1.8 Petrol (MR18DE)', 'petrol', 'cvt'),
  (66, 46, 48, '2.0 Petrol (MR20DE)', 'petrol', 'cvt'),
  (67, 47, 48, '2.0 Petrol (MR20DD)', 'petrol', 'cvt'),
  (68, 47, 48, '2.0 Hybrid (MR20DD)', 'hybrid', 'cvt'),
  (69, 48, 49, '2.0 Petrol (MR20DE)', 'petrol', 'automatic'),
  (70, 48, 49, '2.5 Diesel (YD25DDTi)', 'diesel', 'automatic'),
  (71, 49, 50, '2.5 Diesel (YS23DDT)', 'diesel', 'any'),
  (72, 50, 51, '2.5 Petrol (QR25DE)', 'petrol', 'cvt'),
  (73, 51, 52, '1.5 Petrol (HR15DE)', 'petrol', 'automatic'),
  (74, 52, 10, '2.0 Petrol (MR20DE)', 'petrol', 'cvt'),
  (75, 53, 10, '2.0 Petrol (MR20DD)', 'petrol', 'cvt'),
  (76, 53, 10, '2.5 Petrol (QR25DE)', 'petrol', 'cvt'),
  -- Subaru
  (77, 54, 54, '2.0 Boxer (FB20)', 'petrol', 'cvt'),
  (78, 54, 54, '2.5 Boxer (FB25)', 'petrol', 'cvt'),
  (79, 55, 55, '1.6 Boxer (FB16)', 'petrol', 'cvt'),
  (80, 55, 55, '2.0 Boxer (FB20)', 'petrol', 'cvt'),
  (81, 56, 56, '2.0 Boxer (FB20)', 'petrol', 'cvt'),
  (82, 57, 57, '2.5 Boxer (FB25)', 'petrol', 'cvt'),
  -- Suzuki
  (83, 58, 60, '1.2 Petrol (K12B)', 'petrol', 'any'),
  (84, 58, 60, '1.3 Petrol (M13A)', 'petrol', 'any'),
  (85, 59, 60, '1.6 Petrol (M16A)', 'petrol', 'any'),
  (86, 60, 62, '1.2 Petrol (K12B)', 'petrol', 'cvt'),
  (87, 61, 64, '0.66 Petrol (K6A)', 'petrol', 'any'),
  (88, 61, 64, '1.3 Petrol (M13A)', 'petrol', 'any'),
  (89, 61, 64, '1.5 Petrol (M15A)', 'petrol', 'any'),
  -- Mitsubishi
  (90, 62, 66, '2.0 Petrol (4B11)', 'petrol', 'cvt'),
  (91, 62, 66, '2.4 Petrol (4B12)', 'petrol', 'cvt'),
  (92, 63, 67, '1.8 Petrol (4B10)', 'petrol', 'cvt'),
  (93, 64, 68, '3.2 Diesel (4M41)', 'diesel', 'automatic'),
  (94, 64, 68, '3.0 Petrol (6B31)', 'petrol', 'automatic'),
  (95, 65, 70, '2.2 Diesel (4N14)', 'diesel', 'automatic'),
  (96, 90, 71, '3.0 Diesel (4P10)', 'diesel', 'manual'),
  -- VW / Audi
  (97, 66, 72, '1.4 TSI (CAXA)', 'petrol', 'any'),
  (98, 67, 72, '1.4 TSI (CZEA)', 'petrol', 'any'),
  (99, 68, 73, '1.2 TSI', 'petrol', 'any'),
  (100, 68, 73, '1.4 Petrol', 'petrol', 'any'),
  (101, 69, 74, '2.0 TSI (CCZB)', 'petrol', 'automatic'),
  (102, 70, 75, '1.8 TSI', 'petrol', 'automatic'),
  (103, 71, 77, '2.0 TDI (CAGA)', 'diesel', 'any'),
  (104, 71, 77, '1.8 TFSI (CDHA)', 'petrol', 'automatic'),
  -- BMW / Mercedes
  (105, 72, 80, '2.0 Petrol (N46)', 'petrol', 'automatic'),
  (106, 73, 80, '2.0 Petrol (N20)', 'petrol', 'automatic'),
  (107, 73, 80, '3.0 Petrol (N55)', 'petrol', 'automatic'),
  (108, 74, 81, '2.0 Diesel (N47)', 'diesel', 'automatic'),
  (109, 75, 12, '1.8 CGI (M271)', 'petrol', 'automatic'),
  (110, 75, 12, '3.0 Diesel (OM642)', 'diesel', 'automatic'),
  (111, 76, 12, '2.0 Petrol (M274)', 'petrol', 'automatic'),
  (112, 77, 84, '3.0 Diesel (OM642)', 'diesel', 'automatic'),
  (113, 85, 85, '1.6 Petrol (M270)', 'petrol', 'automatic'),
  -- Isuzu / trucks
  (114, 78, 87, '3.0 Diesel (4JJ1)', 'diesel', 'manual'),
  (115, 78, 87, '4.8 Diesel (4HL1)', 'diesel', 'manual'),
  (116, 92, 88, '5.2 Diesel (4HK1)', 'diesel', 'manual'),
  (117, 89, 89, '3.0 Diesel (4JJ3)', 'diesel', 'automatic'),
  (118, 80, 90, '4.0 Diesel (N04C)', 'diesel', 'manual'),
  (119, 91, 30, '4.0 Diesel (N04C)', 'diesel', 'manual'),
  (120, 10, 11, '1.5 Diesel (4JK1)', 'diesel', 'manual'),
  -- Ford / Kia / Hyundai
  (121, 81, 92, '2.2 Diesel (P4AT)', 'diesel', 'any'),
  (122, 81, 92, '3.2 Diesel (P5AT)', 'diesel', 'any'),
  (123, 93, 93, '1.4 Petrol (SPJA)', 'petrol', 'any'),
  (124, 94, 94, '1.6 Petrol', 'petrol', 'any'),
  (125, 82, 96, '2.0 Diesel (D4HA)', 'diesel', 'automatic'),
  (126, 82, 96, '2.0 Petrol (Theta II)', 'petrol', 'automatic'),
  (127, 84, 97, '1.4 Petrol (G4FA)', 'petrol', 'any'),
  (128, 83, 99, '2.0 Petrol (Nu)', 'petrol', 'automatic'),
  (129, 99, 100, '1.6 Petrol (G4FG)', 'petrol', 'any'),
  (130, 98, 98, '2.4 Petrol (Theta II)', 'petrol', 'automatic'),
  (131, 102, 102, '1.2 Petrol (Kappa)', 'petrol', 'any'),
  -- Others
  (132, 86, 109, '3.6 V6 (Pentastar)', 'petrol', 'automatic'),
  (133, 85, 106, '1.8 Petrol (2H0)', 'petrol', 'any'),
  (134, 87, 110, '2.0 Petrol', 'petrol', 'automatic'),
  (135, 88, 104, '2.2 Diesel (Puma)', 'diesel', 'manual')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

insert into public.categories (id, parent_id, name, slug, icon, sort_order) values
  (1, null, 'Engines', 'engines', 'engine', 1),
  (2, null, 'Gearboxes', 'gearboxes', 'gearbox', 2),
  (3, null, 'Brakes', 'brakes', 'brakes', 3),
  (4, null, 'Suspension', 'suspension', 'suspension', 4),
  (5, null, 'Auto Electrics', 'electrical', 'electrical', 5),
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
  (26, 10, 'Filters', 'filters', null, 2),
  -- More part categories buyers search for
  (27, null, 'Cooling & Radiators', 'cooling', 'cooling', 11),
  (28, null, 'Steering', 'steering', 'steering', 12),
  (29, null, 'Clutch & Transmission', 'clutch', 'clutch', 13),
  (30, null, 'Interior & Seats', 'interior', 'interior', 14),
  (31, null, 'Windows & Glass', 'glass', 'glass', 15),
  (32, null, 'Fuel System', 'fuel-system', 'fuel', 16),
  (33, null, 'Exhaust', 'exhaust', 'exhaust', 17),
  (34, null, 'Drivetrain & Axles', 'drivetrain', 'drivetrain', 18),
  (35, null, 'Wheels & Rims', 'wheels', 'wheels', 19),
  (36, null, 'AC & Climate', 'ac-climate', 'ac', 20),
  (37, 27, 'Radiators', 'radiators', null, 1),
  (38, 27, 'Water Pumps', 'water-pumps', null, 2),
  (39, 27, 'Thermostats', 'thermostats', null, 3),
  (40, 28, 'Steering Racks', 'steering-racks', null, 1),
  (41, 28, 'Power Steering Pumps', 'power-steering-pumps', null, 2),
  (42, 29, 'Clutch Kits', 'clutch-kits', null, 1),
  (43, 29, 'Flywheels', 'flywheels', null, 2),
  (44, 29, 'Clutch Slave/Release Cylinders', 'clutch-cylinders', null, 3),
  (45, 34, 'CV Joints & Driveshafts', 'cv-joints', null, 1),
  (46, 34, 'Propshafts', 'propshafts', null, 2),
  (47, 34, 'Differentials', 'differentials', null, 3),
  (48, 4, 'Control Arms', 'control-arms', null, 3),
  (49, 4, 'Ball Joints & Tie Rods', 'ball-joints', null, 4),
  (50, 4, 'Leaf & Coil Springs', 'springs', null, 5),
  (51, 6, 'Doors', 'doors', null, 3),
  (52, 6, 'Fenders', 'fenders', null, 4),
  (53, 6, 'Mirrors', 'mirrors', null, 5),
  (54, 6, 'Tailgates & Bonnets', 'tailgates-bonnets', null, 6),
  (55, 6, 'Taillights', 'taillights', null, 7),
  (56, 31, 'Windscreens', 'windscreens', null, 1),
  (57, 31, 'Door Glass & Regulators', 'door-glass', null, 2),
  (58, 32, 'Fuel Pumps', 'fuel-pumps', null, 1),
  (59, 32, 'Fuel Tanks', 'fuel-tanks', null, 2),
  (60, 32, 'Throttle Bodies', 'throttle-bodies', null, 3),
  (61, 33, 'Silencers & Mufflers', 'silencers', null, 1),
  (62, 33, 'Catalytic Converters', 'catalytic-converters', null, 2),
  (63, 33, 'Manifolds & Headers', 'manifolds', null, 3),
  (64, 5, 'Window Wipers & Motors', 'wipers', null, 5),
  (65, 5, 'Ignition Coils', 'ignition-coils', null, 6),
  (66, 5, 'Sensors (O2, MAF, ABS)', 'sensors', null, 7),
  (67, 30, 'Seats', 'seats', null, 1),
  (68, 30, 'Dashboards & Clusters', 'dashboards', null, 2),
  (69, 36, 'AC Compressors', 'ac-compressors', null, 1),
  (70, 36, 'Condensers & Evaporators', 'condensers', null, 2),
  (71, 1, 'Turbochargers', 'turbochargers', null, 3),
  (72, 1, 'Engine Mounts', 'engine-mounts', null, 4),
  (73, 1, 'Timing Kits & Chains', 'timing-kits', null, 5),
  (74, 1, 'Pistons, Rings & Bearings', 'internal-engine-parts', null, 6),
  (75, 35, 'Alloy Rims', 'alloy-rims', null, 1),
  (76, 35, 'Steel Rims & Caps', 'steel-rims', null, 2),
  (77, 35, 'Spare Wheel Carriers', 'spare-wheel-carriers', null, 3),
  (78, 10, 'Roof Racks & Bars', 'roof-racks', null, 3),
  (79, 10, 'Seat Covers & Mats', 'seat-covers', null, 4),
  (80, 10, 'Bullbars & Towbars', 'bullbars-towbars', null, 5),
  (81, 10, 'Dashcams & Trackers', 'dashcams', null, 6),
  (82, 9, 'Speakers & Subs', 'speakers', null, 1),
  (83, 9, 'Android Head Units', 'android-head-units', null, 2)
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
   now() - interval '45 days', now() - interval '45 days', null, true, false, 12),
  -- Cooling
  ('20000000-0000-4000-8000-000000000025', '10000000-0000-4000-8000-000000000001', 37,
   'Toyota Corolla Axio/Fielder Radiator (1NZ-FE)',
   'Used aluminium radiator, pressure tested — no leaks or fin damage. Fits Axio and Fielder 1.5 petrol.',
   'used', 55.00, 'USD', null, '16400-21300', 'in_stock', 3, 'active',
   now() - interval '4 hours', now() - interval '2 days', now() - interval '2 days', true, true, 89),
  ('20000000-0000-4000-8000-000000000026', '10000000-0000-4000-8000-000000000005', 37,
   'Mazda Demio Radiator (DE/DJ New Shape)',
   'Complete radiator with fan shroud for Demio new shape.',
   'used', 48.00, 'USD', null, null, 'in_stock', 2, 'active',
   now() - interval '6 hours', now() - interval '5 days', now() - interval '6 days', true, true, 44),
  ('20000000-0000-4000-8000-000000000027', '10000000-0000-4000-8000-000000000004', 38,
   'Toyota 1NZ/2NZ Water Pump (New)',
   'New aftermarket water pump for 1NZ-FE / 2NZ-FE engines — Corolla, Vitz, Axio, Fielder.',
   'new', 35.00, 'USD', 'WP-16100-19245', '16100-19245', 'in_stock', 12, 'active',
   now() - interval '1 day', now() - interval '3 days', now() - interval '1 day', true, true, 132),
  -- Steering
  ('20000000-0000-4000-8000-000000000028', '10000000-0000-4000-8000-000000000001', 40,
   'Honda Fit GE Steering Rack',
   'Used power steering rack for second-gen Fit. No play, no leaks.',
   'used', 110.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '9 hours', now() - interval '4 days', now() - interval '3 days', true, false, 67),
  ('20000000-0000-4000-8000-000000000029', '10000000-0000-4000-8000-000000000004', 41,
   'Toyota Hilux D4D Power Steering Pump',
   'Tested pump for KUN-series Hilux. Good pressure, quiet running.',
   'used', 95.00, 'USD', null, '44310-0K040', 'in_stock', 2, 'active',
   now() - interval '1 day', now() - interval '6 days', now() - interval '5 days', true, true, 58),
  -- Clutch
  ('20000000-0000-4000-8000-000000000030', '10000000-0000-4000-8000-000000000004', 42,
   'Mazda Demio Clutch Kit — 3-Piece (New)',
   'New complete clutch kit: plate, cover and release bearing for Demio 1.3.',
   'new', 78.00, 'USD', 'CK-ZJVE', null, 'in_stock', 8, 'active',
   now() - interval '2 hours', now() - interval '1 day', now() - interval '2 days', true, false, 203),
  ('20000000-0000-4000-8000-000000000031', '10000000-0000-4000-8000-000000000001', 42,
   'Toyota Hilux 2KD Clutch Kit (New, Exedy)',
   'Genuine Exedy 3-piece clutch kit for 2.5 D4D Hilux.',
   'new', 145.00, 'USD', 'TYK-7674', '31210-0K040', 'in_stock', 5, 'active',
   now() - interval '3 hours', now() - interval '2 days', now() - interval '1 day', true, true, 175),
  -- Electrical
  ('20000000-0000-4000-8000-000000000032', '10000000-0000-4000-8000-000000000005', 15,
   'Toyota Vitz XP130 Alternator',
   'Used alternator, tested output 14.3V. Fits third-gen Vitz 1.0/1.3.',
   'used', 60.00, 'USD', null, '27060-40030', 'in_stock', 2, 'active',
   now() - interval '7 hours', now() - interval '3 days', now() - interval '2 days', true, true, 91),
  ('20000000-0000-4000-8000-000000000033', '10000000-0000-4000-8000-000000000005', 66,
   'Honda Fit GK MAF Sensor',
   'Genuine mass airflow sensor for third-gen Fit. Tested working.',
   'used', 30.00, 'USD', null, '37980-RNA-A01', 'in_stock', 4, 'active',
   now() - interval '5 hours', now() - interval '8 days', now() - interval '9 days', true, true, 39),
  ('20000000-0000-4000-8000-000000000034', '10000000-0000-4000-8000-000000000002', 65,
   'Ignition Coil — Toyota 1NZ/2NZ (New, each)',
   'New ignition coil pack for Corolla, Vitz, Axio, Fielder 1.3/1.5 petrol.',
   'new', 22.00, 'USD', 'IGC-90919-02240', '90919-02240', 'in_stock', 25, 'active',
   now() - interval '4 hours', now() - interval '2 days', now() - interval '3 days', true, true, 167),
  -- Body
  ('20000000-0000-4000-8000-000000000035', '10000000-0000-4000-8000-000000000001', 24,
   'Toyota Hilux Front Bumper (2012 Facelift)',
   'Used front bumper in silver, minor scuffs. Includes fog light holes.',
   'used', 180.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '11 hours', now() - interval '10 days', now() - interval '12 days', true, false, 53),
  ('20000000-0000-4000-8000-000000000036', '10000000-0000-4000-8000-000000000001', 51,
   'Honda Fit GE Front Door — Left',
   'Complete front left door shell with glass and regulator. Silver.',
   'used', 150.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '1 day', now() - interval '12 days', now() - interval '15 days', true, false, 41),
  ('20000000-0000-4000-8000-000000000037', '10000000-0000-4000-8000-000000000004', 53,
   'Toyota Corolla Side Mirror — Right (Electric)',
   'Electric folding mirror for E140/E150 Corolla. Painted silver.',
   'used', 40.00, 'USD', null, null, 'in_stock', 3, 'active',
   now() - interval '6 hours', now() - interval '4 days', now() - interval '5 days', true, true, 77),
  ('20000000-0000-4000-8000-000000000038', '10000000-0000-4000-8000-000000000005', 23,
   'Toyota Hilux Headlight — Right (LED Trim)',
   'Used right headlight for AN120 facelift Hilux. All tabs intact.',
   'used', 130.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '8 hours', now() - interval '5 days', now() - interval '4 days', true, true, 62),
  -- Drivetrain
  ('20000000-0000-4000-8000-000000000039', '10000000-0000-4000-8000-000000000004', 45,
   'Toyota Corolla Outer CV Joint (New)',
   'New outer CV joint kit with boot and clips. Fits E140/E150 Corolla.',
   'new', 38.00, 'USD', 'CV-43405-E140', '43405-02130', 'in_stock', 15, 'active',
   now() - interval '2 hours', now() - interval '1 day', now() - interval '1 day', true, false, 148),
  ('20000000-0000-4000-8000-000000000040', '10000000-0000-4000-8000-000000000001', 47,
   'Isuzu D-Max Rear Differential 3.58',
   'Complete rear diff assembly, low whine. Ratio 3.58.',
   'used', 320.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '2 days', now() - interval '9 days', now() - interval '11 days', true, false, 29),
  -- Fuel system
  ('20000000-0000-4000-8000-000000000041', '10000000-0000-4000-8000-000000000005', 58,
   'Nissan Note E12 Fuel Pump',
   'Used in-tank fuel pump module. Tested pressure and sender.',
   'used', 65.00, 'USD', null, '17040-3VA0A', 'in_stock', 2, 'active',
   now() - interval '10 hours', now() - interval '4 days', now() - interval '2 days', true, true, 47),
  -- Exhaust
  ('20000000-0000-4000-8000-000000000042', '10000000-0000-4000-8000-000000000001', 62,
   'Toyota Hilux D4D Catalytic Converter',
   'Genuine OEM cat for KUN26. Not hollowed — catalyst intact.',
   'used', 210.00, 'USD', null, null, 'in_stock', 2, 'active',
   now() - interval '12 hours', now() - interval '7 days', now() - interval '6 days', true, true, 84),
  -- Suspension extras
  ('20000000-0000-4000-8000-000000000043', '10000000-0000-4000-8000-000000000004', 48,
   'Honda Fit GE Front Control Arm — Left (New)',
   'New lower control arm with bushings and ball joint.',
   'new', 45.00, 'USD', 'CA-51350-GE', '51350-TF0-000', 'in_stock', 6, 'active',
   now() - interval '3 hours', now() - interval '2 days', now() - interval '2 days', true, false, 118),
  ('20000000-0000-4000-8000-000000000044', '10000000-0000-4000-8000-000000000003', 50,
   'Isuzu D-Max Rear Leaf Springs (Pair, Used)',
   'Good used rear leaf springs, no sagging. Sold per pair.',
   'used', 95.00, 'USD', null, null, 'in_stock', 4, 'active',
   now() - interval '1 day', now() - interval '6 days', now() - interval '8 days', true, false, 36),
  -- AC
  ('20000000-0000-4000-8000-000000000045', '10000000-0000-4000-8000-000000000005', 69,
   'Toyota Corolla AC Compressor (1NZ/2NZ)',
   'Used AC compressor, clutch engages cleanly, no bearing noise.',
   'used', 85.00, 'USD', null, '88310-1A730', 'in_stock', 2, 'active',
   now() - interval '9 hours', now() - interval '5 days', now() - interval '4 days', true, true, 71),
  -- Wheels
  ('20000000-0000-4000-8000-000000000046', '10000000-0000-4000-8000-000000000003', 75,
   'Toyota Hilux 16" Alloy Rim Set (4x)',
   'Set of four genuine Hilux alloys, straight and true. Centre caps included.',
   'used', 240.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '14 hours', now() - interval '8 days', now() - interval '10 days', true, true, 96),
  -- Interior
  ('20000000-0000-4000-8000-000000000047', '10000000-0000-4000-8000-000000000001', 68,
   'Mazda Demio DE Instrument Cluster',
   'Used speedometer cluster for new-shape Demio. All gauges tested.',
   'used', 55.00, 'USD', null, null, 'in_stock', 2, 'active',
   now() - interval '5 hours', now() - interval '6 days', now() - interval '7 days', true, false, 28),
  -- More engines / gearboxes for breadth
  ('20000000-0000-4000-8000-000000000048', '10000000-0000-4000-8000-000000000001', 19,
   'Toyota 1NZ-FE Engine — Axio/Fielder/Corolla 1.5',
   'Complete used 1NZ-FE 1.5 petrol engine from a low-km ex-Japan Fielder. Hot compression tested.',
   'used', 1650.00, 'USD', '1NZ-FE', null, 'in_stock', 1, 'active',
   now() - interval '6 hours', now() - interval '5 days', now() - interval '2 days', true, true, 187),
  ('20000000-0000-4000-8000-000000000049', '10000000-0000-4000-8000-000000000004', 21,
   'Mazda Demio Manual Gearbox (5-Speed)',
   'Used 5-speed manual box for Demio new shape. Shifts clean through all gears.',
   'used', 420.00, 'USD', null, null, 'in_stock', 1, 'active',
   now() - interval '1 day', now() - interval '11 days', now() - interval '13 days', true, false, 51),
  ('20000000-0000-4000-8000-000000000050', '10000000-0000-4000-8000-000000000005', 20,
   'Toyota Hilux 2KD-FTV Cylinder Head',
   'Bare cylinder head, crack-tested and pressure-checked. Good for rebuilds.',
   'used', 280.00, 'USD', null, null, 'in_stock', 2, 'active',
   now() - interval '4 hours', now() - interval '7 days', now() - interval '5 days', true, true, 43),
  -- Accessories
  ('20000000-0000-4000-8000-000000000051', '10000000-0000-4000-8000-000000000003', 80,
   'Universal Tow Bar — Hilux/Ranger/D-Max',
   'Heavy-duty bolt-on towbar, 2.5t rated. Includes drop plate and bolts.',
   'new', 120.00, 'USD', 'TB-UNI-2500', null, 'in_stock', 7, 'active',
   now() - interval '6 hours', now() - interval '3 days', now() - interval '5 days', true, true, 64),
  ('20000000-0000-4000-8000-000000000052', '10000000-0000-4000-8000-000000000005', 83,
   'Android 10" Head Unit with Reverse Camera',
   '2GB/32GB Android head unit, GPS, Bluetooth, USB. Includes camera and harness.',
   'new', 95.00, 'USD', 'AND-10RC', null, 'in_stock', 10, 'active',
   now() - interval '2 hours', now() - interval '1 day', now() - interval '2 days', true, true, 210),
  -- Turbo / engine parts
  ('20000000-0000-4000-8000-000000000053', '10000000-0000-4000-8000-000000000004', 71,
   'Toyota Hilux 2KD Turbocharger (Refurbished)',
   'Professionally rebuilt CT16 turbo. Balanced, new cartridge bearings.',
   'refurbished', 295.00, 'USD', 'TC-17201-0L030', '17201-0L030', 'in_stock', 3, 'active',
   now() - interval '4 hours', now() - interval '4 days', now() - interval '3 days', true, true, 156),
  ('20000000-0000-4000-8000-000000000054', '10000000-0000-4000-8000-000000000002', 73,
   'Toyota 1NZ Timing Chain Kit (New)',
   'Complete kit: chain, tensioner, guides and sprockets.',
   'new', 88.00, 'USD', 'TK-1NZ', null, 'in_stock', 9, 'active',
   now() - interval '5 hours', now() - interval '2 days', now() - interval '1 day', true, true, 122)
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
  ('20000000-0000-4000-8000-000000000024', '/images/parts/tyre.svg', 0),
  ('20000000-0000-4000-8000-000000000025', '/images/parts/radiator.svg', 0),
  ('20000000-0000-4000-8000-000000000026', '/images/parts/radiator.svg', 0),
  ('20000000-0000-4000-8000-000000000027', '/images/parts/radiator.svg', 0),
  ('20000000-0000-4000-8000-000000000028', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000029', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000030', '/images/parts/gearbox.svg', 0),
  ('20000000-0000-4000-8000-000000000031', '/images/parts/gearbox.svg', 0),
  ('20000000-0000-4000-8000-000000000032', '/images/parts/alternator.svg', 0),
  ('20000000-0000-4000-8000-000000000033', '/images/parts/ecu.svg', 0),
  ('20000000-0000-4000-8000-000000000034', '/images/parts/ecu.svg', 0),
  ('20000000-0000-4000-8000-000000000035', '/images/parts/headlight.svg', 0),
  ('20000000-0000-4000-8000-000000000036', '/images/parts/headlight.svg', 0),
  ('20000000-0000-4000-8000-000000000037', '/images/parts/headlight.svg', 0),
  ('20000000-0000-4000-8000-000000000038', '/images/parts/headlight.svg', 0),
  ('20000000-0000-4000-8000-000000000039', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000040', '/images/parts/gearbox.svg', 0),
  ('20000000-0000-4000-8000-000000000041', '/images/parts/injector.svg', 0),
  ('20000000-0000-4000-8000-000000000042', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000043', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000044', '/images/parts/suspension.svg', 0),
  ('20000000-0000-4000-8000-000000000045', '/images/parts/alternator.svg', 0),
  ('20000000-0000-4000-8000-000000000046', '/images/parts/tyre.svg', 0),
  ('20000000-0000-4000-8000-000000000047', '/images/parts/ecu.svg', 0),
  ('20000000-0000-4000-8000-000000000048', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000049', '/images/parts/gearbox.svg', 0),
  ('20000000-0000-4000-8000-000000000050', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000051', '/images/parts/bearing.svg', 0),
  ('20000000-0000-4000-8000-000000000052', '/images/parts/radio.svg', 0),
  ('20000000-0000-4000-8000-000000000053', '/images/parts/engine.svg', 0),
  ('20000000-0000-4000-8000-000000000054', '/images/parts/engine.svg', 0)
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
  ('20000000-0000-4000-8000-000000000023', 2, 5, 2, null, 2007, 2014),
  -- Radiators
  ('20000000-0000-4000-8000-000000000025', 1, 15, 15, 20, 2006, 2012),
  ('20000000-0000-4000-8000-000000000025', 1, 15, 16, 21, 2013, 2019),
  ('20000000-0000-4000-8000-000000000025', 1, 14, 14, 18, 2012, 2019),
  ('20000000-0000-4000-8000-000000000026', 2, 5, 2, null, 2007, 2019),
  ('20000000-0000-4000-8000-000000000027', 1, 1, 3, 4, 2006, 2013),
  ('20000000-0000-4000-8000-000000000027', 1, 13, 11, 15, 2005, 2010),
  ('20000000-0000-4000-8000-000000000027', 1, 13, 12, 16, 2010, 2020),
  ('20000000-0000-4000-8000-000000000027', 1, 15, 15, 20, 2006, 2012),
  -- Steering
  ('20000000-0000-4000-8000-000000000028', 3, 7, 7, null, 2007, 2014),
  ('20000000-0000-4000-8000-000000000029', 1, 2, 5, null, 2005, 2015),
  -- Clutch
  ('20000000-0000-4000-8000-000000000030', 2, 5, 1, 3, 2002, 2007),
  ('20000000-0000-4000-8000-000000000030', 2, 5, 2, 1, 2007, 2014),
  ('20000000-0000-4000-8000-000000000031', 1, 2, 5, 6, 2005, 2015),
  ('20000000-0000-4000-8000-000000000031', 1, 2, 24, 28, 2015, null),
  -- Electrical
  ('20000000-0000-4000-8000-000000000032', 1, 13, 12, null, 2010, 2020),
  ('20000000-0000-4000-8000-000000000033', 3, 7, 8, null, 2013, 2020),
  ('20000000-0000-4000-8000-000000000034', 1, 1, 3, 4, 2006, 2013),
  ('20000000-0000-4000-8000-000000000034', 1, 13, 11, 14, 2005, 2010),
  ('20000000-0000-4000-8000-000000000034', 1, 13, 12, 16, 2010, 2020),
  ('20000000-0000-4000-8000-000000000034', 1, 15, 15, 20, 2006, 2012),
  -- Body
  ('20000000-0000-4000-8000-000000000035', 1, 2, 5, null, 2011, 2015),
  ('20000000-0000-4000-8000-000000000036', 3, 7, 7, null, 2007, 2014),
  ('20000000-0000-4000-8000-000000000037', 1, 1, 3, null, 2006, 2013),
  ('20000000-0000-4000-8000-000000000038', 1, 2, 5, null, 2011, 2015),
  -- Drivetrain
  ('20000000-0000-4000-8000-000000000039', 1, 1, 3, null, 2006, 2013),
  ('20000000-0000-4000-8000-000000000039', 1, 1, 4, null, 2013, 2019),
  ('20000000-0000-4000-8000-000000000040', 5, 11, 10, 13, 2012, 2020),
  -- Fuel / exhaust
  ('20000000-0000-4000-8000-000000000041', 4, 9, 9, 12, 2012, 2021),
  ('20000000-0000-4000-8000-000000000042', 1, 2, 5, 6, 2005, 2015),
  -- Suspension extras
  ('20000000-0000-4000-8000-000000000043', 3, 7, 7, null, 2007, 2014),
  ('20000000-0000-4000-8000-000000000044', 5, 11, 10, null, 2012, 2020),
  -- AC
  ('20000000-0000-4000-8000-000000000045', 1, 1, 3, 4, 2006, 2013),
  ('20000000-0000-4000-8000-000000000045', 1, 1, 4, 35, 2013, 2019),
  ('20000000-0000-4000-8000-000000000045', 1, 15, 15, 20, 2006, 2012),
  -- Wheels / interior
  ('20000000-0000-4000-8000-000000000046', 1, 2, 5, null, 2005, 2015),
  ('20000000-0000-4000-8000-000000000046', 1, 2, 24, null, 2015, null),
  ('20000000-0000-4000-8000-000000000047', 2, 5, 2, null, 2007, 2014),
  -- Engines / gearbox / head
  ('20000000-0000-4000-8000-000000000048', 1, 15, 15, 20, 2006, 2012),
  ('20000000-0000-4000-8000-000000000048', 1, 14, 14, 18, 2012, 2019),
  ('20000000-0000-4000-8000-000000000048', 1, 1, 4, 35, 2013, 2019),
  ('20000000-0000-4000-8000-000000000049', 2, 5, 2, 1, 2007, 2014),
  ('20000000-0000-4000-8000-000000000050', 1, 2, 5, 6, 2005, 2015),
  -- Accessories (universal-ish: make only)
  ('20000000-0000-4000-8000-000000000051', 1, 2, null, null, null, null),
  ('20000000-0000-4000-8000-000000000051', 12, 92, 81, null, 2011, 2022),
  ('20000000-0000-4000-8000-000000000051', 5, 11, 10, null, 2012, 2020),
  -- Turbo / timing
  ('20000000-0000-4000-8000-000000000053', 1, 2, 5, 6, 2005, 2015),
  ('20000000-0000-4000-8000-000000000053', 1, 19, 24, 28, 2015, null),
  ('20000000-0000-4000-8000-000000000054', 1, 1, 3, 4, 2006, 2013),
  ('20000000-0000-4000-8000-000000000054', 1, 15, 15, 20, 2006, 2012),
  ('20000000-0000-4000-8000-000000000054', 1, 14, 14, 18, 2012, 2019)
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

-- ---------------------------------------------------------------------------
-- Hero slides (admin-manageable landing banners)
-- ---------------------------------------------------------------------------

insert into public.hero_slides (title, description, image_url, overlay_opacity, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, sort_order) values
  ('Find the part. Trust the source.', 'Verified vehicle parts from Kaguvi Street vendors — confirmed by Carguvi field agents, not just listings.', '/images/hero/hero-1.svg', 72, 'Search parts', '/search', 'Sell on Carguvi', '/vendor/apply', 1),
  ('Mazda Demio engines in stock', 'New shape 1.3 petrol engines from $1,750 — availability confirmed by sellers this week.', '/images/hero/hero-2.svg', 70, 'View engines', '/search?q=demio+engine', 'All listings', '/search', 2),
  ('Every listing, freshness-stamped', 'See exactly when stock was last confirmed — by the seller or by a Carguvi verifier.', '/images/hero/hero-3.svg', 68, 'How it works', '/search', 'Browse verified', '/search?verified=1', 3),
  ('Carguvi Delivery across Harare', 'Order parts to your door — same-day delivery inside Harare, tracked end to end.', '/images/hero/hero-4.svg', 72, 'Order now', '/search', 'Delivery info', '/search', 4),
  ('Suspension & brakes that fit', 'Shocks, pads and bearings matched to your exact vehicle — use your garage for fitment.', '/images/hero/hero-5.svg', 70, 'Add your vehicle', '/garage', 'Shop suspension', '/search?q=suspension', 5),
  ('Vendor storefronts you can trust', 'Rated vendors, verified locations, real stock. Browse shops on Kaguvi Street.', '/images/hero/hero-6.svg', 72, 'Browse vendors', '/categories', 'Become a seller', '/vendor/apply', 6),
  ('Batteries, alternators, starters', 'Electrical parts tested and confirmed — from Kaguvi Street to your driveway.', '/images/hero/hero-7.svg', 70, 'Shop electrical', '/search?q=battery', 'Search parts', '/search', 7),
  ('Gearboxes & transmissions', 'Manual and automatic gearboxes with warranty options from trusted breakers.', '/images/hero/hero-8.svg', 72, 'Find gearboxes', '/search?q=gearbox', 'All listings', '/search', 8),
  ('Can''t find it? We''ll source it', 'Send an inquiry to verified vendors — the whole street searches for you.', '/images/hero/hero-9.svg', 68, 'Request a part', '/inquiries/new', 'Learn more', '/search', 9),
  ('Verified by Carguvi agents', 'Our physical verification network checks stock on the ground so you never chase ghosts.', '/images/hero/hero-10.svg', 75, 'Shop verified', '/search?verified=1', 'Read about us', '/', 10)
on conflict do nothing;
