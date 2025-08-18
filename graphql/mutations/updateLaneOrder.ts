import { extendType, nonNull, intArg, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { sql } from 'kysely'

export const UpdateLaneOrder = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateLaneOrder', {
      type: 'Lane',
      args: {
        laneId: nonNull(stringArg()),
        newPosition: nonNull(intArg()),
      },
      resolve: async (_parent, { laneId, newPosition }) => {
        const pg = getKysely()

        // Fetch the lane being moved
        const draggedLane = await pg
          .selectFrom('Lane')
          .selectAll()
          .where('id', '=', laneId)
          .executeTakeFirst()

        if (!draggedLane) {
          throw new Error('Lane not found')
        }

        const oldPosition = draggedLane.number

        if (oldPosition === newPosition) {
          // No changes needed
          return draggedLane
        }

        await pg.transaction().execute(async (trx) => {
          // First, temporarily move the dragged lane out of the way (to a very high number)
          await trx
            .updateTable('Lane')
            .set({ number: 9999 })
            .where('id', '=', laneId)
            .execute()

          // Then, shift other lanes to make space
          if (oldPosition < newPosition) {
            // Moving down
            await trx
              .updateTable('Lane')
              .set((eb) => ({
                number: sql`${eb.ref('number')} - 1`,
              }))
              .where('heatId', '=', draggedLane.heatId)
              .where('number', '>', oldPosition)
              .where('number', '<=', newPosition)
              .execute()
          } else {
            // Moving up
            await trx
              .updateTable('Lane')
              .set((eb) => ({
                number: sql`${eb.ref('number')} + 1`,
              }))
              .where('heatId', '=', draggedLane.heatId)
              .where('number', '>=', newPosition)
              .where('number', '<', oldPosition)
              .execute()
          }

          // Finally, move the dragged lane to its new position
          await trx
            .updateTable('Lane')
            .set({ number: newPosition })
            .where('id', '=', laneId)
            .execute()
        })

        // Fetch and return the updated lane
        const updatedLane = await pg
          .selectFrom('Lane')
          .selectAll()
          .where('id', '=', laneId)
          .executeTakeFirstOrThrow()

        return updatedLane
      },
    })
  },
})
