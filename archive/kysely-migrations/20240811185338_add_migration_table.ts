import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  try {
    const pg = getKysely()

    await pg.schema
      .createTable('migrations')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('executed_at', 'timestamptz', (col) =>
        col.notNull().defaultTo(sql`now()`),
      )
      .execute()

    console.log('Migration table created successfully.')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  try {
    await db.schema.dropTable('migrations').execute()
    console.log('Migration table dropped successfully.')
  } catch (error) {
    console.error('Rollback failed:', error)
  }
}
