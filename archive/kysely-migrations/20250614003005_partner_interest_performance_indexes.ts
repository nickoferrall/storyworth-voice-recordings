import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Add specific indexes for the most common query patterns

  // Index for filtering by status + directoryCompId (via category join)
  // This covers the main partner matching query: status=ACTIVE + directoryCompId
  await pg.schema
    .createIndex('idx_partner_interest_status_category_created')
    .on('PartnerInterest')
    .columns(['status', 'categoryId', 'createdAt'])
    .execute()

  // Index for user's own interests (status + userId)
  await pg.schema
    .createIndex('idx_partner_interest_status_user_created')
    .on('PartnerInterest')
    .columns(['status', 'userId', 'createdAt'])
    .execute()

  // Index for interest type filtering
  await pg.schema
    .createIndex('idx_partner_interest_status_type_created')
    .on('PartnerInterest')
    .columns(['status', 'interestType', 'createdAt'])
    .execute()

  console.log('✅ Added partner interest performance indexes')
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema
    .dropIndex('idx_partner_interest_status_category_created')
    .ifExists()
    .execute()
  await pg.schema
    .dropIndex('idx_partner_interest_status_user_created')
    .ifExists()
    .execute()
  await pg.schema
    .dropIndex('idx_partner_interest_status_type_created')
    .ifExists()
    .execute()

  console.log('✅ Removed partner interest performance indexes')
}
