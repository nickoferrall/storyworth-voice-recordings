-- Seed data for Supabase Branching E2E testing
-- This file is automatically run by Supabase when a preview branch is created
-- Test trigger: verifying Supabase Branching setup

-- Test users
INSERT INTO "UserProfile" (id, email, "firstName", "lastName", "isSuperUser") 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@fitlo.co', 'Test', 'User', false),
  ('00000000-0000-0000-0000-000000000002', 'admin@fitlo.co', 'Admin', 'User', true),
  ('00000000-0000-0000-0000-000000000003', 'nickoferrall+new@gmail.com', 'Nick', 'Ferrall', false)
ON CONFLICT (email) DO NOTHING;

-- Test address
INSERT INTO "Address" (id, venue, city, country) 
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Test Venue', 'London', 'United Kingdom')
ON CONFLICT (id) DO NOTHING;

-- Test competition (Competition.id must be 8 characters or less)
INSERT INTO "Competition" (id, name, description, "startDateTime", "endDateTime", "addressId", "createdByUserId", logo) 
VALUES (
  'e2etest1', 
  'E2E Test Competition', 
  'A test competition for E2E tests',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '2 days',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000002',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
)
ON CONFLICT (id) DO NOTHING;

-- Test directory competitions that match E2E test searches (DirectoryComp.id can be longer)
INSERT INTO "DirectoryComp" (id, title, location, country, "startDate", "competitionId") 
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Hells Bells CrossFit Competition', 'London, UK', 'United Kingdom', '2024-12-01', 'e2etest1'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Test HYROX Simulation', 'Manchester, UK', 'United Kingdom', '2024-12-15', NULL)
ON CONFLICT (id) DO NOTHING;

-- Test categories for partner matching
INSERT INTO "Category" (id, "directoryCompId", difficulty, gender, "teamSize") 
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'RX', 'MALE', 2),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'RX', 'FEMALE', 2),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'RX', 'MIXED', 2),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'RX', 'MALE', 1),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'RX', 'FEMALE', 1)
ON CONFLICT (id) DO NOTHING;

-- Test ticket types for registration flow
INSERT INTO "TicketType" (id, "competitionId", name, price, currency, "maxEntries", "teamSize") 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'e2etest1', 'Mixed RX Pairs Example', 25.00, 'USD', 100, 2),
  ('22222222-2222-2222-2222-222222222222', 'e2etest1', 'Individual RX', 35.00, 'USD', 50, 1)
ON CONFLICT (id) DO NOTHING; 