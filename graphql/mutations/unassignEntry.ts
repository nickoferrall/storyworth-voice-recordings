import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UnassignEntry = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('unassignEntry', {
      type: 'Lane',
      args: {
        laneId: nonNull(stringArg()),
      },
      resolve: async (_parent, { laneId }, ctx) => {
        const pg = getKysely()

        // Get the initial lane and its heat before deletion
        const initialLane = await pg
          .selectFrom('Lane')
          .where('Lane.id', '=', laneId)
          .selectAll()
          .executeTakeFirstOrThrow()

        // Delete ALL lanes for this entry across all workouts
        await pg.deleteFrom('Lane').where('entryId', '=', initialLane.entryId).execute()

        // Get remaining lanes in the same heat and reorder them
        const remainingLanes = await pg
          .selectFrom('Lane')
          .where('heatId', '=', initialLane.heatId)
          .orderBy('number', 'asc')
          .selectAll()
          .execute()

        // Update lane numbers to be sequential starting from 1
        for (let i = 0; i < remainingLanes.length; i++) {
          await pg
            .updateTable('Lane')
            .set({ number: i + 1 })
            .where('id', '=', remainingLanes[i].id)
            .execute()
        }

        return initialLane as any
      },
    })
  },
})
