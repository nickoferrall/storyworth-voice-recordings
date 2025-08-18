import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Workout table
    await pg.schema
      .createTable('Workout')
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('description', 'text', (col) => col.notNull())
      .addColumn('releaseDateTime', 'timestamptz', (col) => col.notNull())
      .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
      .addColumn('location', 'varchar(255)', (col) => col.notNull())
      .addColumn('scoreType', sql`"ScoreType"`, (col) => col.notNull()) // Enum type
      .addColumn('unitOfMeasurement', sql`"Unit"`, (col) => col.notNull()) // Enum type
      .addColumn('timeCap', 'int4')
      .addColumn('includeStandardsVideo', 'boolean', (col) =>
        col.notNull().defaultTo(false),
      )
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_workout_competitionId', // Foreign key constraint name
        ['competitionId'], // Column(s) in the current table
        'Competition', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Create index on id and name for Workout table
    await pg.schema
      .createIndex('idx_workout_id_name')
      .on('Workout')
      .columns(['id', 'name'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_workout_id_name').execute()

  // Drop the Workout table
  await pg.schema.dropTable('Workout').ifExists().execute()
}
