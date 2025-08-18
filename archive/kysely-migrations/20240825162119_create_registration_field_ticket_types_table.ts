import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    // Create the RegistrationFieldTicketTypes table
    await pg.schema
      .createTable('RegistrationFieldTicketTypes')
      .ifNotExists()
      .addColumn('id', 'uuid', (col) =>
        col.primaryKey().defaultTo(sql`uuid_generate_v4()`),
      )
      .addColumn('registrationFieldId', 'uuid', (col) => col.notNull())
      .addColumn('ticketTypeId', 'uuid', (col) => col.notNull())
      .addForeignKeyConstraint(
        'fk_registrationFieldId', // Foreign key constraint name
        ['registrationFieldId'], // Column(s) in the current table
        'RegistrationField', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .addForeignKeyConstraint(
        'fk_ticketTypeId', // Foreign key constraint name
        ['ticketTypeId'], // Column(s) in the current table
        'TicketType', // Referenced table
        ['id'], // Column(s) in the referenced table
        (constraint) => constraint.onDelete('cascade'), // Behavior on delete
      )
      .execute()

    // Optionally, you can add indexes if you need them
    await pg.schema
      .createIndex('idx_registrationfield_tickettype')
      .on('RegistrationFieldTicketTypes')
      .columns(['registrationFieldId', 'ticketTypeId'])
      .execute()
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  // Drop index first
  await pg.schema.dropIndex('idx_registrationfield_tickettype').execute()

  // Drop the RegistrationFieldTicketTypes table
  await pg.schema.dropTable('RegistrationFieldTicketTypes').ifExists().execute()
}
