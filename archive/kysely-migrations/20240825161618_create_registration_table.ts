import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the Registration table
    await pg.schema
      .createTable('Registration')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('userId', 'uuid', (col) => col.notNull())
      .addColumn('competitionId', 'varchar(8)', (col) => col.notNull())
      .addColumn('ticketTypeId', 'uuid', (col) => col.notNull())
      .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
      .addForeignKeyConstraint(
        'fk_registration_userId',
        ['userId'],
        'User',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        'fk_registration_competitionId',
        ['competitionId'],
        'Competition',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .addForeignKeyConstraint(
        'fk_registration_ticketTypeId',
        ['ticketTypeId'],
        'TicketType',
        ['id'],
        (constraint) => constraint.onDelete('cascade'),
      )
      .execute()

    // Create index on userId, competitionId, and ticketTypeId
    await pg.schema
      .createIndex('idx_registration_userId_competitionId_ticketTypeId')
      .on('Registration')
      .columns(['userId', 'competitionId', 'ticketTypeId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop index first
  await pg.schema
    .dropIndex('idx_registration_userId_competitionId_ticketTypeId')
    .execute()

  // Drop the Registration table
  await pg.schema.dropTable('Registration').ifExists().execute()
}
