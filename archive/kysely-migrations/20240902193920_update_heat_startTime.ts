import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Step 1: Drop the existing column
    await pg.schema.alterTable('ScoreSetting').dropColumn('firstHeatStartTime').execute()

    // Step 2: Add the new timestamptz column
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('firstHeatStartTime', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`TIMESTAMP WITH TIME ZONE '2024-09-02 08:00:00+00'`),
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Step 1: Drop the timestamptz column
    await pg.schema.alterTable('ScoreSetting').dropColumn('firstHeatStartTime').execute()

    // Step 2: Add back the varchar column
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('firstHeatStartTime', 'varchar(255)', (col) =>
        col.notNull().defaultTo('08:00'),
      )
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
