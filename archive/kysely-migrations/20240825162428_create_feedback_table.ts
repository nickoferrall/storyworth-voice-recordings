import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Feedback table
    await pg.schema
      .createTable('Feedback')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('userId', 'uuid')
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('text', 'text', (col) => col.notNull())
      .addForeignKeyConstraint(
        'fk_feedback_userId', // Foreign key constraint name
        ['userId'], // Column(s) in the current table
        'User', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('set null'), // Set userId to null on user deletion
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the Feedback table
  await pg.schema.dropTable('Feedback').ifExists().execute()
}
