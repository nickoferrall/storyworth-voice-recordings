import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Heat table
    await pg.schema
      .createTable('Heat')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('startTime', 'timestamptz', (col) => col.notNull())
      .addColumn('workoutId', 'uuid', (col) => col.notNull())
      .addColumn('maxEntriesPerHeat', 'int4', (col) => col.notNull())
      .addColumn('ticketTypeId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_heat_workoutId', // Foreign key constraint name
        ['workoutId'], // Column(s) in the current table
        'Workout', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_heat_ticketTypeId', // Foreign key constraint name
        ['ticketTypeId'], // Column(s) in the current table
        'TicketType', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop the Heat table
  await pg.schema.dropTable('Heat').ifExists().execute()
}
