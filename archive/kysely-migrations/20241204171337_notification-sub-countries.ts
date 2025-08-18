import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('NotificationSubscription')
      .addColumn('countries', sql`text[]`, (col) => col.defaultTo(sql`ARRAY[]::text[]`))
      .addColumn('locations', sql`text[]`, (col) => col.defaultTo(sql`ARRAY[]::text[]`))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('NotificationSubscription')
      .dropColumn('countries')
      .dropColumn('locations')
      .execute()
  } catch (error) {
    console.error('Migration rollback failed:', error)
    throw error
  }
}
