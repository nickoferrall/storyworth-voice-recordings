import { Transaction } from 'kysely'
import { DB } from '../../../src/generated/database'

export const reuseRegistrationFields = async (
  trx: Transaction<DB>,
  ticketTypeId: string,
  competitionId: string,
  isVolunteer: boolean,
) => {
  // Start building the base query
  const existingFields = await trx
    .selectFrom('RegistrationField as rf')
    .distinctOn('rf.id') // Ensure only distinct fields are selected
    .select(['rf.id', 'rf.question'])
    .innerJoin(
      'RegistrationFieldTicketTypes as rftt',
      'rf.id',
      'rftt.registrationFieldId',
    )
    .innerJoin('TicketType as tt', 'rftt.ticketTypeId', 'tt.id')
    .where('tt.competitionId', '=', competitionId)
    .where('tt.isVolunteer', '=', isVolunteer)
    .execute()

  // Associate these existing fields with the new ticket type
  const res = await Promise.all(
    existingFields.map((field) =>
      trx
        .insertInto('RegistrationFieldTicketTypes')
        .values({
          registrationFieldId: field.id,
          ticketTypeId,
        })
        .execute(),
    ),
  )

  return existingFields
}
