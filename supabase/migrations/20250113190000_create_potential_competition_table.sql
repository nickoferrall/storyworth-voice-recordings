-- Create PotentialCompetition table for scraped competitions pending approval
-- This mirrors the Competition table structure but for staging

CREATE TABLE "PotentialCompetition" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" character varying(255) NOT NULL,
    "description" text,
    "startDateTime" timestamp with time zone NOT NULL,
    "endDateTime" timestamp with time zone,
    "addressId" uuid,
    "timezone" character varying(255),
    "logo" character varying(255),
    "website" text,
    "email" text,
    "instagramHandle" text,
    "currency" text,
    "price" numeric,
    "source" text NOT NULL,
    "country" text,
    "state" text,
    "region" text,
    "orgName" text,
    "scrapedData" jsonb, -- Store original scraped data for reference
    "status" text NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    "reviewedBy" uuid REFERENCES "auth"."users"("id"),
    "reviewedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    FOREIGN KEY ("addressId") REFERENCES "Address"("id")
);

-- Create PotentialTicketType table for staging ticket types
CREATE TABLE "PotentialTicketType" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "potentialCompetitionId" uuid NOT NULL REFERENCES "PotentialCompetition"("id") ON DELETE CASCADE,
    "name" character varying(255) NOT NULL,
    "description" character varying(255),
    "price" numeric NOT NULL,
    "currency" text,
    "maxEntries" integer NOT NULL,
    "teamSize" integer NOT NULL,
    "isVolunteer" boolean NOT NULL DEFAULT false,
    "allowHeatSelection" boolean NOT NULL DEFAULT false,
    "passOnPlatformFee" boolean NOT NULL DEFAULT true,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE "PotentialCompetition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PotentialTicketType" ENABLE ROW LEVEL SECURITY;

-- Only super users can access potential competitions
CREATE POLICY "Super users can view potential competitions" ON "PotentialCompetition"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid() 
            AND "User"."isSuperUser" = true
        )
    );

CREATE POLICY "Super users can view potential ticket types" ON "PotentialTicketType"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid() 
            AND "User"."isSuperUser" = true
        )
    );

-- Add indexes for performance
CREATE INDEX "idx_potential_competition_status" ON "PotentialCompetition"("status");
CREATE INDEX "idx_potential_competition_created_at" ON "PotentialCompetition"("createdAt");
CREATE INDEX "idx_potential_ticket_type_competition_id" ON "PotentialTicketType"("potentialCompetitionId"); 