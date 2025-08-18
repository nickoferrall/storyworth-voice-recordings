-- Add indexes to optimize competition ownership checks

-- Composite index for CompetitionCreator lookups (more efficient than separate indexes)
CREATE INDEX IF NOT EXISTS idx_competition_creator_comp_user 
ON "CompetitionCreator" ("competitionId", "userId");

-- Index for Competition creator lookups (doesn't exist yet)
CREATE INDEX IF NOT EXISTS idx_competition_created_by 
ON "Competition" ("createdByUserId");

-- Composite index optimized for our ownership query pattern
CREATE INDEX IF NOT EXISTS idx_competition_ownership 
ON "Competition" (id, "createdByUserId", "isActive"); 