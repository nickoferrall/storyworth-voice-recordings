import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { Selectable } from 'kysely'
import { getHeatIndex } from './updateLaneHeat'

export const DeleteHeat = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteHeat', {
      type: 'Heat',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        try {
          const pg = getKysely()

          // Get the target heat's info and workout
          const targetHeat = await pg
            .selectFrom('Heat')
            .select(['id', 'workoutId'])
            .where('id', '=', id)
            .executeTakeFirstOrThrow()

          // Get heat index in its workout
          const heatIndex = await getHeatIndex(pg, id)

          // Get competition info
          const workout = await ctx.loaders.workoutLoader.load(targetHeat.workoutId)
          if (!workout) throw new Error('Workout not found')

          // Get all workouts in the competition
          const workouts = await pg
            .selectFrom('Workout')
            .select(['id'])
            .where('competitionId', '=', workout.competitionId)
            .execute()

          // Find corresponding heats across all workouts
          const heatsToDelete: string[] = []
          for (const workout of workouts) {
            const workoutHeats = await pg
              .selectFrom('Heat')
              .select(['id'])
              .where('workoutId', '=', workout.id)
              .orderBy('startTime', 'asc')
              .execute()

            if (workoutHeats.length > heatIndex) {
              heatsToDelete.push(workoutHeats[heatIndex].id)
            }
          }

          // Check if any of these heats have lanes with entries
          const lanesWithEntries = await pg
            .selectFrom('Lane')
            .select('id')
            .where('heatId', 'in', heatsToDelete)
            .execute()

          if (lanesWithEntries.length > 0) {
            throw new Error(
              'Cannot delete heats because one or more heats have registered athletes',
            )
          }

          // Delete all lanes and heats with the same number
          await pg.deleteFrom('Lane').where('heatId', 'in', heatsToDelete).execute()
          const deletedHeats = await pg
            .deleteFrom('Heat')
            .where('id', 'in', heatsToDelete)
            .returningAll()
            .execute()

          return deletedHeats[0] // Return the first deleted heat for compatibility
        } catch (error: any) {
          console.error('Error deleting heats:', error)
          throw new Error(error.message || 'Error deleting heats')
        }
      },
    })
  },
})
