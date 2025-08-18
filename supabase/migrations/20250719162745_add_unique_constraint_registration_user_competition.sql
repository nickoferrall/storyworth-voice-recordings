-- Add unique constraint to prevent duplicate registrations
-- This ensures one registration per user per competition

-- Add unique constraint to prevent future duplicates
ALTER TABLE "Registration" 
ADD CONSTRAINT "Registration_userId_competitionId_unique" 
UNIQUE ("userId", "competitionId");

-- Add index for better performance (the unique constraint creates an index, but being explicit)
CREATE INDEX IF NOT EXISTS "idx_registration_user_competition" 
ON "Registration" ("userId", "competitionId");
