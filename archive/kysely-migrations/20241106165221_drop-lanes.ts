import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema.alterTable('ScoreSetting').dropColumn('lanes').execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('lanes', 'integer', (col) => col.notNull().defaultTo(0))
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
