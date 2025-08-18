-- Add isCompleted boolean field to Score table
ALTER TABLE "Score" ADD COLUMN "isCompleted" boolean NOT NULL DEFAULT false;
