import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Remove the firstHeatStartTime column from ScoreSetting
    await pg.schema.alterTable('ScoreSetting').dropColumn('firstHeatStartTime').execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Add back the firstHeatStartTime column if needed
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('firstHeatStartTime', 'varchar(255)')
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
