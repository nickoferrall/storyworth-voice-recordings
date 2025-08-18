-- Create CompetitionEditSuggestion table for user-submitted edit suggestions
CREATE TABLE "CompetitionEditSuggestion" (
    "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    "competitionId" character varying(8) NOT NULL REFERENCES "Competition"("id") ON DELETE CASCADE,
    "userId" uuid NOT NULL REFERENCES "auth"."users"("id") ON DELETE CASCADE,
    "suggestedChanges" jsonb NOT NULL, -- Store the suggested field changes
    "reason" text, -- Optional reason for the suggestion
    "status" text NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    "reviewedBy" uuid REFERENCES "auth"."users"("id"),
    "reviewedAt" timestamp with time zone,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE "CompetitionEditSuggestion" ENABLE ROW LEVEL SECURITY;

-- Users can view their own suggestions
CREATE POLICY "Users can view own edit suggestions" ON "CompetitionEditSuggestion"
    FOR SELECT USING (auth.uid() = "userId");

-- Users can create their own suggestions
CREATE POLICY "Users can create edit suggestions" ON "CompetitionEditSuggestion"
    FOR INSERT WITH CHECK (auth.uid() = "userId");

-- Super users can view all suggestions
CREATE POLICY "Super users can view all edit suggestions" ON "CompetitionEditSuggestion"
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM "User" 
            WHERE "User"."id" = auth.uid() 
            AND "User"."isSuperUser" = true
        )
    );

-- Add indexes for performance
CREATE INDEX "idx_competition_edit_suggestion_competition_id" ON "CompetitionEditSuggestion"("competitionId");
CREATE INDEX "idx_competition_edit_suggestion_user_id" ON "CompetitionEditSuggestion"("userId");
CREATE INDEX "idx_competition_edit_suggestion_status" ON "CompetitionEditSuggestion"("status");
CREATE INDEX "idx_competition_edit_suggestion_created_at" ON "CompetitionEditSuggestion"("createdAt"); 