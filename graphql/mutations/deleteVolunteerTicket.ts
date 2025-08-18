import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const DeleteVolunteerTicketTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteVolunteerTicket', {
      type: 'String',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, _ctx) => {
        const pg = getKysely()
        try {
          await pg.transaction().execute(async (trx) => {
            await trx
              .deleteFrom('RegistrationFieldTicketTypes')
              .where(
                'registrationFieldId',
                'in',

                trx
                  .selectFrom('RegistrationField')
                  .select('RegistrationField.id')
                  .innerJoin(
                    'RegistrationFieldTicketTypes',
                    'RegistrationField.id',
                    'RegistrationFieldTicketTypes.registrationFieldId',
                  )
                  .innerJoin(
                    'TicketType',
                    'RegistrationFieldTicketTypes.ticketTypeId',
                    'TicketType.id',
                  )
                  .where('TicketType.competitionId', '=', competitionId)
                  .where('TicketType.isVolunteer', '=', true),
              )
              .execute()

            await trx
              .deleteFrom('RegistrationField')
              .where(
                'id',
                'in',
                trx
                  .selectFrom('RegistrationField')
                  .select('RegistrationField.id')
                  .innerJoin(
                    'RegistrationFieldTicketTypes',
                    'RegistrationField.id',
                    'RegistrationFieldTicketTypes.registrationFieldId',
                  )
                  .innerJoin(
                    'TicketType',
                    'RegistrationFieldTicketTypes.ticketTypeId',
                    'TicketType.id',
                  )
                  .where('TicketType.competitionId', '=', competitionId)
                  .where('TicketType.isVolunteer', '=', true),
              )
              .execute()

            // Delete from TicketType
            await trx
              .deleteFrom('TicketType')
              .where('competitionId', '=', competitionId)
              .where('isVolunteer', '=', true)
              .execute()
          })

          return `Volunteer TicketTypes and associated RegistrationFields for competition ID ${competitionId} successfully deleted`
        } catch (error: any) {
          console.error('Error during deletion of Volunteer TicketType:', error)
          throw new Error(error.message || error)
        }
      },
    })
  },
})
