import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Add indexes for the common query patterns in getPartnerRequests

  // Index for fromUserId queries (direct user requests)
  await pg.schema
    .createIndex('idx_partner_request_from_user_id')
    .on('PartnerRequest')
    .column('fromUserId')
    .execute()

  // Index for fromInterestId queries (interest-to-interest requests)
  await pg.schema
    .createIndex('idx_partner_request_from_interest_id')
    .on('PartnerRequest')
    .column('fromInterestId')
    .execute()

  // Index for toInterestId queries (receiving requests)
  await pg.schema
    .createIndex('idx_partner_request_to_interest_id')
    .on('PartnerRequest')
    .column('toInterestId')
    .execute()

  // Composite index for status + createdAt for sorting pending requests
  await pg.schema
    .createIndex('idx_partner_request_status_created_at')
    .on('PartnerRequest')
    .columns(['status', 'createdAt'])
    .execute()

  // Composite index for status + updatedAt for sorting accepted requests
  await pg.schema
    .createIndex('idx_partner_request_status_updated_at')
    .on('PartnerRequest')
    .columns(['status', 'updatedAt'])
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema.dropIndex('idx_partner_request_from_user_id').ifExists().execute()
  await pg.schema.dropIndex('idx_partner_request_from_interest_id').ifExists().execute()
  await pg.schema.dropIndex('idx_partner_request_to_interest_id').ifExists().execute()
  await pg.schema.dropIndex('idx_partner_request_status_created_at').ifExists().execute()
  await pg.schema.dropIndex('idx_partner_request_status_updated_at').ifExists().execute()
}
