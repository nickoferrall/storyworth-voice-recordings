import { Kysely, sql } from 'kysely'
import getKysely from '../../db'

export async function up(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('RegistrationFieldTicketTypes')
      .addUniqueConstraint('unique_registration_field_ticket_type', [
        'registrationFieldId',
        'ticketTypeId',
      ])
      .execute()

    console.log(
      'Migration successful: Added unique constraint to RegistrationFieldTicketTypes',
    )
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  const pg = getKysely()

  try {
    await pg.schema
      .alterTable('RegistrationFieldTicketTypes')
      .dropConstraint('unique_registration_field_ticket_type')
      .execute()

    console.log(
      'Rollback successful: Removed unique constraint from RegistrationFieldTicketTypes',
    )
  } catch (error) {
    console.error('Rollback failed:', error)
  }
}
