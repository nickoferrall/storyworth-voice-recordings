import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the enum type
    await pg.schema.createType('HeatLimitType').asEnum(['ENTRIES', 'ATHLETES']).execute()

    // Add the new column to ScoreSetting
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('heatLimitType', sql`"HeatLimitType"`, (col) =>
        col.notNull().defaultTo('ENTRIES'),
      )
      .execute()

    // Update the Heat table
    await pg.schema
      .alterTable('Heat')
      .addColumn('maxLimitPerHeat', 'integer', (col) => col.notNull().defaultTo(0))
      .execute()

    // Copy data from maxEntriesPerHeat to maxLimitPerHeat using raw SQL
    await sql`UPDATE "Heat" SET "maxLimitPerHeat" = "maxEntriesPerHeat"`.execute(pg)

    // Note: We're not dropping the maxEntriesPerHeat column here
  } catch (error) {
    console.error('Migration failed:', error)
    throw error // Re-throw the error to ensure the migration fails
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Remove the new column from Heat
    await pg.schema.alterTable('Heat').dropColumn('maxLimitPerHeat').execute()

    // Remove the new column from ScoreSetting
    await pg.schema.alterTable('ScoreSetting').dropColumn('heatLimitType').execute()

    // Drop the enum type
    await pg.schema.dropType('HeatLimitType').execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error // Re-throw the error to ensure the rollback fails if there's an error
  }
}
