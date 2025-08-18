import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Score table
    await pg.schema
      .createTable('Score')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('value', 'float8', (col) => col.notNull()) // Float for the score value
      .addColumn('entryId', 'uuid', (col) => col.notNull())
      .addColumn('workoutId', 'uuid', (col) => col.notNull())
      .addColumn('scorecard', 'text') // Optional scorecard field
      .addColumn('note', 'text') // Optional note field
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_score_entryId', // Foreign key constraint name
        ['entryId'], // Column(s) in the current table
        'Entry', // Referenced table (make sure the table name matches your setup)
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_score_workoutId', // Foreign key constraint name
        ['workoutId'], // Column(s) in the current table
        'Workout', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Create a unique index on entryId and workoutId
    await pg.schema
      .createIndex('idx_score_unique_entryId_workoutId')
      .on('Score')
      .columns(['entryId', 'workoutId'])
      .unique()
      .execute()

    // Create an index on entryId and workoutId
    await pg.schema
      .createIndex('idx_score_entryId_workoutId')
      .on('Score')
      .columns(['entryId', 'workoutId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_score_unique_entryId_workoutId').execute()
  await pg.schema.dropIndex('idx_score_entryId_workoutId').execute()

  // Drop the Score table
  await pg.schema.dropTable('Score').ifExists().execute()
}
