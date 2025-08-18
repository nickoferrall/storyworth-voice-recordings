import { extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const EarlyBird = objectType({
  name: 'EarlyBird',
  definition(t) {
    t.nonNull.string('id')
    t.field('startDateTime', { type: 'DateTime' })
    t.field('endDateTime', { type: 'DateTime' })
    t.nonNull.float('price')
    t.int('limit')
    t.string('ticketTypeId')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const GetEarlyBirdById = extendType({
  type: 'Query',
  definition(t) {
    t.field('earlyBirdById', {
      type: EarlyBird,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, _ctx) => {
        const pg = getKysely()

        const earlyBird = await pg
          .selectFrom('EarlyBird')
          .where('id', '=', id)
          .selectAll()
          .executeTakeFirst()

        if (!earlyBird) {
          throw new Error('Early Bird not found')
        }

        return earlyBird
      },
    })
  },
})
