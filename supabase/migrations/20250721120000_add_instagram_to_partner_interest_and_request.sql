-- Add instagram column to PartnerInterest
ALTER TABLE "PartnerInterest"
ADD COLUMN IF NOT EXISTS "instagram" text;

-- Add instagram column to PartnerRequest
ALTER TABLE "PartnerRequest"
ADD COLUMN IF NOT EXISTS "instagram" text;


