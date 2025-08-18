import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Alter the Score table to change the value column to string
    await pg.schema
      .alterTable('Score')
      .alterColumn('value', (col) => col.setDataType('varchar(255)'))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Revert the value column back to number
    await pg.schema
      .alterTable('Score')
      .alterColumn('value', (col) => col.setDataType('numeric'))
      .execute()
  } catch (error) {
    console.error('Rollback failed:', error)
  }
}
