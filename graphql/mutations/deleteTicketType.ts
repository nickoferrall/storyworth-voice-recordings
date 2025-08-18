import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const DeleteTicketTypeMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteTicketType', {
      type: 'TicketType',
      args: {
        id: nonNull(stringArg()), // Ticket Type ID
      },
      resolve: async (_parent, { id }, ctx) => {
        const pg = getKysely()

        try {
          // Step 1: Check if there are any registrations for this ticket type
          const registrationCount = await pg
            .selectFrom('Registration')
            .where('ticketTypeId', '=', id)
            .select(pg.fn.count('id').as('count'))
            .executeTakeFirst()

          if (Number(registrationCount?.count) > 0) {
            throw new Error('Cannot delete ticket type with existing registrations.')
          }

          // Step 2: Delete records in RegistrationFieldTicketTypes join table
          await pg
            .deleteFrom('RegistrationFieldTicketTypes')
            .where('ticketTypeId', '=', id)
            .execute()

          // Step 3: Delete the ticket type
          const deletedTicketType = await pg
            .deleteFrom('TicketType')
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          return deletedTicketType as any
        } catch (error: any) {
          console.error('Error deleting ticket type:', error)
          throw new Error(error.message || 'Error deleting ticket type')
        }
      },
    })
  },
})
