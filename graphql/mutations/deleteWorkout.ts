import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const DeleteWorkout = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteWorkout', {
      type: 'Workout',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        const pg = getKysely()

        try {
          const result = await pg.transaction().execute(async (trx) => {
            // Find associated heats
            const associatedHeats = await trx
              .selectFrom('Heat')
              .select('id')
              .where('workoutId', '=', id)
              .execute()

            // Collect heat IDs to delete associated lanes
            const heatIds = associatedHeats.map((heat) => heat.id)

            // Delete associated lanes first
            if (heatIds.length > 0) {
              await trx.deleteFrom('Lane').where('heatId', 'in', heatIds).execute()

              // Delete associated heats
              await trx.deleteFrom('Heat').where('workoutId', '=', id).execute()
            }

            // Finally, delete the workout
            const deletedWorkout = await trx
              .deleteFrom('Workout')
              .where('id', '=', id)
              .returningAll()
              .executeTakeFirstOrThrow()

            return deletedWorkout
          })

          return result
        } catch (error: any) {
          console.error('Error deleting workout:', error)
          throw new Error(error.message || 'Error deleting workout')
        }
      },
    })
  },
})
