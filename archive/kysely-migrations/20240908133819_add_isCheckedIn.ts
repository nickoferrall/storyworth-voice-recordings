import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('Registration')
      .addColumn('isCheckedIn', 'boolean', (col) => col.notNull().defaultTo(false))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema.alterTable('Registration').dropColumn('isCheckedIn').execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
