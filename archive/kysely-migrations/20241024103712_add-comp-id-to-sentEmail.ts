import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema.alterTable('SentEmail').addColumn('competitionId', 'text').execute()

    // Create index on competitionId
    await pg.schema
      .createIndex('idx_sent_email_competition_id')
      .on('SentEmail')
      .column('competitionId')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Drop the index
    await pg.schema.dropIndex('idx_sent_email_competition_id').execute()

    // Remove competitionId column
    await pg.schema.alterTable('SentEmail').dropColumn('competitionId').execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
