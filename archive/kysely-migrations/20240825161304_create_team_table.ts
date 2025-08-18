import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Team table
    await pg.schema
      .createTable('Team')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('name', 'varchar(255)')
      .addColumn('teamCaptainId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .execute()

    // Optionally, create an index if needed (e.g., on teamCaptainId)
    await pg.schema
      .createIndex('idx_team_teamCaptainId')
      .on('Team')
      .column('teamCaptainId')
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop index first
  await pg.schema.dropIndex('idx_team_teamCaptainId').execute()

  // Drop the Team table
  await pg.schema.dropTable('Team').ifExists().execute()
}
