import { Kysely } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Create the new joiner table HeatTicketTypes
    await pg.schema
      .createTable('HeatTicketTypes')
      .addColumn('heatId', 'uuid', (col) =>
        col.notNull().references('Heat.id').onDelete('cascade'),
      )
      .addColumn('ticketTypeId', 'uuid', (col) =>
        col.notNull().references('TicketType.id').onDelete('cascade'),
      )
      .addPrimaryKeyConstraint('pk_HeatTicketTypes', ['heatId', 'ticketTypeId'])
      .execute()

    // Add indexes for better performance
    await pg.schema
      .createIndex('idx_heat_ticketType_heatId')
      .on('HeatTicketTypes')
      .column('heatId')
      .execute()

    await pg.schema
      .createIndex('idx_heat_ticketType_ticketTypeId')
      .on('HeatTicketTypes')
      .column('ticketTypeId')
      .execute()

    console.log('Successfully created HeatTicketTypes table and indexes')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()
  try {
    // Drop the HeatTicketTypes table and indexes
    await pg.schema.dropTable('HeatTicketTypes').execute()
    await pg.schema.dropIndex('idx_heat_ticketType_heatId').execute()
    await pg.schema.dropIndex('idx_heat_ticketType_ticketTypeId').execute()

    console.log('Successfully dropped HeatTicketTypes table and indexes')
  } catch (error) {
    console.error('Migration rollback failed:', error)
  }
}
