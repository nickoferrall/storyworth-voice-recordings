import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema
      .alterTable('Workout')
      .alterColumn('isVisible', (col) => col.setDefault(true))
      .execute()

    console.log('Successfully updated isVisible default value to true')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    await pg.schema
      .alterTable('Workout')
      .alterColumn('isVisible', (col) => col.setDefault(false))
      .execute()

    console.log('Successfully reverted isVisible default value to false')
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
