import { extendType, nonNull, stringArg, booleanArg } from 'nexus'
import { Workout } from '../types'
import getKysely from '../../src/db'

export const UpdateWorkoutVisibilityMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateWorkoutVisibility', {
      type: Workout,
      args: {
        id: nonNull(stringArg()),
        isVisible: nonNull(booleanArg()),
      },
      resolve: async (_parent, { id, isVisible }, ctx) => {
        const pg = getKysely()

        try {
          const updatedWorkout = await pg
            .updateTable('Workout')
            .set({ isVisible })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          return updatedWorkout
        } catch (error) {
          console.error('Error updating workout visibility:', error)
          throw new Error('Failed to update workout visibility')
        }
      },
    })
  },
})
