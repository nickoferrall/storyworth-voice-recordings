import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('User')
      .addColumn('isSuperUser', 'boolean', (col) => col.notNull().defaultTo(false))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  await pg.schema.alterTable('User').dropColumn('isSuperUser').execute()
}
