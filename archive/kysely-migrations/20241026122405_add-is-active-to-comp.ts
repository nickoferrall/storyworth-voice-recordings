import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema
      .alterTable('Competition')
      .addColumn('isActive', 'boolean', (col) => col.notNull().defaultTo(true))
      .execute()

    console.log('Successfully added isActive column to Competition table')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema.alterTable('Competition').dropColumn('isActive').execute()

    console.log('Successfully removed isActive column from Competition table')
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
