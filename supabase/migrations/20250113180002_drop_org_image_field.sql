-- Drop the image field from Org table
-- This field has been migrated to Competition.logo for better architecture
-- where each competition can have its own unique image

ALTER TABLE "Org" DROP COLUMN IF EXISTS "image"; 