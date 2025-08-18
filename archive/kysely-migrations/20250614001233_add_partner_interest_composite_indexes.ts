import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(): Promise<void> {
  const pg = getKysely()

  // Composite indexes for common query patterns

  // For user's own interests (userId + status + createdAt for ordering)
  await pg.schema
    .createIndex('idx_partner_interest_user_status_created')
    .on('PartnerInterest')
    .columns(['userId', 'status', 'createdAt'])
    .execute()

  // For directory comp filtering (categoryId + status + createdAt)
  await pg.schema
    .createIndex('idx_partner_interest_category_status_created')
    .on('PartnerInterest')
    .columns(['categoryId', 'status', 'createdAt'])
    .execute()

  // For interest type filtering (interestType + status + createdAt)
  await pg.schema
    .createIndex('idx_partner_interest_type_status_created')
    .on('PartnerInterest')
    .columns(['interestType', 'status', 'createdAt'])
    .execute()
}

export async function down(): Promise<void> {
  const pg = getKysely()

  await pg.schema
    .dropIndex('idx_partner_interest_user_status_created')
    .ifExists()
    .execute()
  await pg.schema
    .dropIndex('idx_partner_interest_category_status_created')
    .ifExists()
    .execute()
  await pg.schema
    .dropIndex('idx_partner_interest_type_status_created')
    .ifExists()
    .execute()
}
