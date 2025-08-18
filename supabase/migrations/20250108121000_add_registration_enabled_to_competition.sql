-- Add registrationEnabled field to Competition table
-- This allows competition organizers to quickly enable/disable registrations

ALTER TABLE "Competition" 
ADD COLUMN "registrationEnabled" boolean NOT NULL DEFAULT true;

-- Add index for performance when filtering by registration status
CREATE INDEX IF NOT EXISTS idx_competition_registration_enabled 
ON "Competition" ("registrationEnabled", "isActive"); 