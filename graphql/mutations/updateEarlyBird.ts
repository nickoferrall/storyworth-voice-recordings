import { extendType, arg, inputObjectType, nonNull } from 'nexus'
import getKysely from '../../src/db'
import { sanitizeInput } from '../../utils/sanitizeInput'

export const EarlyBirdInput = inputObjectType({
  name: 'EarlyBirdInput',
  definition(t) {
    t.string('id')
    t.field('startDateTime', { type: 'DateTime' })
    t.field('endDateTime', { type: 'DateTime' })
    t.float('price')
    t.int('limit')
    t.nonNull.string('ticketTypeId')
  },
})

export const UpdateEarlyBirdMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateEarlyBird', {
      type: 'EarlyBird',
      args: {
        earlyBird: nonNull(arg({ type: EarlyBirdInput })),
      },
      resolve: async (_parent, { earlyBird }, ctx) => {
        try {
          const pg = getKysely()

          // Sanitize the input to remove null or undefined values
          const input = sanitizeInput(earlyBird)

          if (!input?.id) {
            throw new Error('ID is required for updating EarlyBird')
          }

          const updatedEarlyBird = await pg
            .updateTable('EarlyBird')
            .set(
              Object.fromEntries(
                Object.entries(input ?? {}).filter(([_, v]) => v !== undefined),
              ),
            )
            .where('id', '=', input.id)
            .returningAll()
            .executeTakeFirstOrThrow()

          return updatedEarlyBird
        } catch (error: any) {
          console.error('Error during EarlyBird update:', error)
          throw new Error(error.message || 'Error updating EarlyBird')
        }
      },
    })
  },
})
