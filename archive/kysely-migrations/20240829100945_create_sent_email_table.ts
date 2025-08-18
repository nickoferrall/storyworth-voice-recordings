import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Create the SentEmail table
    await pg.schema
      .createTable('SentEmail')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('recipients', sql`text[]`, (col) => col.notNull())
      .addColumn('subject', 'varchar(255)', (col) => col.notNull())
      .addColumn('message', 'text', (col) => col.notNull())
      .addColumn('sentAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  // Drop SentEmail table
  await pg.schema.dropTable('SentEmail').execute()
}
