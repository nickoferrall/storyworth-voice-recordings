import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const AssignEntryToHeat = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('assignEntryToHeat', {
      type: 'Lane',
      args: {
        entryId: nonNull(stringArg()),
        heatId: nonNull(stringArg()),
      },
      resolve: async (_parent, { entryId, heatId }, ctx) => {
        const pg = getKysely()

        // Get max lane number in target heat
        const maxLaneNumber = await pg
          .selectFrom('Lane')
          .select(({ fn }) => fn.max('number').as('maxNumber'))
          .where('heatId', '=', heatId)
          .executeTakeFirst()

        const newLaneNumber = (maxLaneNumber?.maxNumber || 0) + 1

        // Create new lane for the entry
        const newLane = await pg
          .insertInto('Lane')
          .values({
            heatId,
            entryId,
            number: newLaneNumber,
          })
          .returning('id')
          .executeTakeFirstOrThrow()

        // Return the new lane with all fields
        const lane = await pg
          .selectFrom('Lane')
          .where('id', '=', newLane.id)
          .selectAll()
          .executeTakeFirstOrThrow()

        return lane as any
      },
    })
  },
})
