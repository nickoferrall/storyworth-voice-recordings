import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Entry table with ticketTypeId as uuid (matching the TicketType table)
    await pg.schema
      .createTable('Entry')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('teamId', 'uuid')
      .addColumn('ticketTypeId', 'uuid', (col) => col.notNull()) // Changed to uuid
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_ticketTypeId', // Foreign key constraint name
        ['ticketTypeId'], // Column(s) in the current table
        'TicketType', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Create a unique index on userId and teamId
    await pg.schema
      .createIndex('idx_entry_unique_userId_teamId')
      .on('Entry')
      .columns(['userId', 'teamId'])
      .unique()
      .execute()

    // Create an index on userId, teamId, and ticketTypeId
    await pg.schema
      .createIndex('idx_entry_userId_teamId_ticketTypeId')
      .on('Entry')
      .columns(['userId', 'teamId', 'ticketTypeId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop indices first
  await pg.schema.dropIndex('idx_entry_unique_userId_teamId').execute()
  await pg.schema.dropIndex('idx_entry_userId_teamId_ticketTypeId').execute()

  // Drop the Entry table
  await pg.schema.dropTable('Entry').ifExists().execute()
}
