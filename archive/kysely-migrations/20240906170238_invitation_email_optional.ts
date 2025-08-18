import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('Invitation')
      .alterColumn('email', (col) => col.dropNotNull())
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('Invitation')
      .alterColumn('email', (col) => col.setNotNull())
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
