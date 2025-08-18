import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await sql`ALTER TYPE "QuestionType" ADD VALUE IF NOT EXISTS 'INTEGRATION'`.execute(pg)

    console.log('Migration successful: Added INTEGRATION to QuestionType enum')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  console.log('Cannot remove enum value in PostgreSQL - skipping rollback')
  // PostgreSQL doesn't support removing enum values
  // The only way would be to create a new type without the value and migrate all data
}
