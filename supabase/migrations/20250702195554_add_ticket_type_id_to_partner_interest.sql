-- Add ticketTypeId column to PartnerInterest table
ALTER TABLE "PartnerInterest" 
ADD COLUMN "ticketTypeId" uuid;

-- Add foreign key constraint to TicketType table
ALTER TABLE "PartnerInterest" 
ADD CONSTRAINT "PartnerInterest_ticketTypeId_fkey" 
FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE;

-- Make categoryId nullable (it was required before)
ALTER TABLE "PartnerInterest" 
ALTER COLUMN "categoryId" DROP NOT NULL;

-- Add constraint to ensure either categoryId OR ticketTypeId is set (but not both)
ALTER TABLE "PartnerInterest" 
ADD CONSTRAINT "PartnerInterest_category_or_ticket_type_check" 
CHECK (
  (("categoryId" IS NOT NULL AND "ticketTypeId" IS NULL) OR 
   ("categoryId" IS NULL AND "ticketTypeId" IS NOT NULL))
);
