import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Add maxLimitPerHeat to ScoreSetting
    await pg.schema
      .alterTable('ScoreSetting')
      .addColumn('maxLimitPerHeat', 'integer', (col) => col.notNull().defaultTo(6))
      .execute()

    // Drop maxLimitPerHeat from Heat
    await pg.schema.alterTable('Heat').dropColumn('maxLimitPerHeat').execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error // Re-throw the error to ensure the migration fails
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Add maxLimitPerHeat back to Heat
    await pg.schema
      .alterTable('Heat')
      .addColumn('maxLimitPerHeat', 'integer', (col) => col.notNull().defaultTo(6))
      .execute()

    // Remove maxLimitPerHeat from ScoreSetting
    await pg.schema.alterTable('ScoreSetting').dropColumn('maxLimitPerHeat').execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error // Re-throw the error to ensure the rollback fails if there's an error
  }
}
