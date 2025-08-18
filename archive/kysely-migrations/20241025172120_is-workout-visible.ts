import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema
      .alterTable('Workout')
      .addColumn('isVisible', 'boolean', (col) => col.notNull().defaultTo(false))
      .execute()

    console.log('Successfully added isVisible column to Workout table')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema.alterTable('Workout').dropColumn('isVisible').execute()

    console.log('Successfully removed isVisible column from Workout table')
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
