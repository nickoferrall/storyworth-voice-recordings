import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the existing status check constraint
  await pg.schema
    .alterTable('PartnerInterest')
    .dropConstraint('partnerinterest_status_check')
    .ifExists()
    .execute()

  // Add the new status check constraint with PARTIALLY_FILLED
  await pg.schema
    .alterTable('PartnerInterest')
    .addCheckConstraint(
      'partnerinterest_status_check',
      sql`"status" IN ('ACTIVE', 'PARTIALLY_FILLED', 'FILLED', 'EXPIRED', 'CANCELLED')`,
    )
    .execute()

  console.log('Added PARTIALLY_FILLED status to PartnerInterest table')
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the new constraint
  await pg.schema
    .alterTable('PartnerInterest')
    .dropConstraint('partnerinterest_status_check')
    .ifExists()
    .execute()

  // Restore the original constraint without PARTIALLY_FILLED
  await pg.schema
    .alterTable('PartnerInterest')
    .addCheckConstraint(
      'partnerinterest_status_check',
      sql`"status" IN ('ACTIVE', 'FILLED', 'EXPIRED', 'CANCELLED')`,
    )
    .execute()

  console.log('Removed PARTIALLY_FILLED status from PartnerInterest table')
}
