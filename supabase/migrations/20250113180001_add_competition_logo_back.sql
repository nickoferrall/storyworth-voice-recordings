-- Add logo field back to Competition table
-- Each competition should have its own logo/branding
-- even if organized by the same org

ALTER TABLE "Competition" ADD COLUMN "logo" TEXT;

-- Copy existing org images to competition logo field
-- This preserves existing images while allowing future flexibility
UPDATE "Competition" 
SET "logo" = "Org"."image"
FROM "Org" 
WHERE "Competition"."orgId" = "Org"."id" 
AND "Org"."image" IS NOT NULL 
AND "Competition"."logo" IS NULL; 