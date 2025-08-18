import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Lane table
    await pg.schema
      .createTable('Lane')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('number', 'int4', (col) => col.notNull())
      .addColumn('entryId', 'uuid', (col) => col.notNull())
      .addColumn('heatId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_lane_entryId', // Foreign key constraint name
        ['entryId'], // Column(s) in the current table
        'Entry', // Referenced table (make sure the table name matches your setup)
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_lane_heatId', // Foreign key constraint name
        ['heatId'], // Column(s) in the current table
        'Heat', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Create index on heatId and entryId for Lane table
    await pg.schema
      .createIndex('idx_lane_heatId_entryId')
      .on('Lane')
      .columns(['heatId', 'entryId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_lane_heatId_entryId').execute()

  // Drop the Lane table
  await pg.schema.dropTable('Lane').ifExists().execute()
}
