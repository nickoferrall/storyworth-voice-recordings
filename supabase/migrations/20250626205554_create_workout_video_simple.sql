

-- Simple Video table for workout movement standards
CREATE TABLE "Video" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "workoutId" UUID NOT NULL REFERENCES "Workout"("id") ON DELETE CASCADE,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "url" TEXT NOT NULL, -- YouTube URL or other video URL
  "orderIndex" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance
CREATE INDEX "idx_video_workout_id" ON "Video"("workoutId");
CREATE INDEX "idx_video_order" ON "Video"("workoutId", "orderIndex");






