import { extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const HeatTicketTypes = objectType({
  name: 'HeatTicketTypes',
  definition(t) {
    t.nonNull.string('heatId', {
      description: 'The ID of the Heat',
    })
    t.nonNull.string('ticketTypeId', {
      description: 'The ID of the TicketType',
    })
  },
})

export const GetHeatTicketTypesByHeatId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getHeatTicketTypesByHeatId', {
      type: HeatTicketTypes,
      args: {
        heatId: nonNull(stringArg()),
      },
      resolve: async (_parent, { heatId }, ctx) => {
        const pg = getKysely()
        const heatTicketTypes = await pg
          .selectFrom('HeatTicketTypes')
          .selectAll()
          .where('heatId', '=', heatId)
          .execute()

        if (!heatTicketTypes) {
          throw new Error('HeatTicketTypes not found')
        }

        return heatTicketTypes as any
      },
    })
  },
})
