import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .createTable('PartnerInterest')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('interestType', 'varchar(50)', (col) =>
        col
          .notNull()
          .check(sql`"interestType" IN ('LOOKING_FOR_JOINERS', 'LOOKING_TO_JOIN')`),
      )
      .addColumn('partnerPreference', 'varchar(50)', (col) =>
        col.notNull().check(sql`"partnerPreference" IN ('ANYONE', 'SAME_GYM')`),
      )
      .addColumn('categoryId', 'text', (col) => col.notNull())
      .addColumn('description', 'text')
      .addColumn('status', 'varchar(50)', (col) =>
        col
          .notNull()
          .check(sql`"status" IN ('ACTIVE', 'FILLED', 'EXPIRED', 'CANCELLED')`),
      )
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Create indexes
    await pg.schema
      .createIndex('idx_partner_interest_user_id')
      .on('PartnerInterest')
      .column('userId')
      .execute()

    await pg.schema
      .createIndex('idx_partner_interest_category_id')
      .on('PartnerInterest')
      .column('categoryId')
      .execute()

    await pg.schema
      .createIndex('idx_partner_interest_status')
      .on('PartnerInterest')
      .column('status')
      .execute()

    await pg.schema
      .createIndex('idx_partner_interest_interest_type')
      .on('PartnerInterest')
      .column('interestType')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indexes first, with error handling
  const indexes = [
    'idx_partner_interest_user_id',
    'idx_partner_interest_category_id',
    'idx_partner_interest_status',
    'idx_partner_interest_interest_type',
  ]

  for (const index of indexes) {
    try {
      await pg.schema.dropIndex(index).execute()
    } catch (error) {
      console.log(`Index ${index} does not exist, skipping...`)
    }
  }

  // Drop the table
  await pg.schema.dropTable('PartnerInterest').ifExists().execute()
}
