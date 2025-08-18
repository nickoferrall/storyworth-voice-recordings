import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('Team')
      .addColumn('status', 'varchar(50)', (col) =>
        col
          .notNull()
          .defaultTo('ACTIVE')
          .check(sql`"status" IN ('ACTIVE', 'COMPLETED', 'CANCELLED')`),
      )
      .execute()

    // Create an index on status for faster filtering
    await pg.schema.createIndex('idx_team_status').on('Team').column('status').execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop index first
  await pg.schema.dropIndex('idx_team_status').execute()

  // Remove the status column
  await pg.schema.alterTable('Team').dropColumn('status').execute()
}
