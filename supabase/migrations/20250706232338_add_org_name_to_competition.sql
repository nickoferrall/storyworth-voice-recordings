-- Add orgName field to Competition table for competition-specific organization names
ALTER TABLE "public"."Competition" ADD COLUMN "orgName" character varying(255);
