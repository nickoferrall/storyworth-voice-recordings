-- Drop the logo column from Competition table
-- This field was only used by scraped competitions and is confusing
-- Real competitions should use org.image or org.logo instead

ALTER TABLE "Competition" DROP COLUMN IF EXISTS "logo"; 