import { enumType, extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const Score = objectType({
  name: 'Score',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('entryId')
    t.nonNull.field('entry', {
      type: 'Entry',
      resolve: async ({ id, entryId }, _args, ctx) => {
        const entry = await ctx.loaders.entryLoader.load(entryId)
        if (!entry) {
          throw new Error(`Entry not found for score ${id}`)
        }
        return entry
      },
    })
    t.nonNull.string('workoutId')
    t.nonNull.field('workout', {
      type: 'Workout',
      resolve: async (parent, _args, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for score ${parent.id}`)
        }
        return workout
      },
    })
    t.nonNull.string('value')
    t.nonNull.boolean('isCompleted')
    t.string('scorecard')
    t.string('note')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const ScoreType = enumType({
  name: 'ScoreType',
  members: [
    'REPS_MORE_IS_BETTER',
    'REPS_LESS_IS_BETTER',
    'WEIGHT_MORE_IS_BETTER',
    'WEIGHT_LESS_IS_BETTER',
    'TIME_MORE_IS_BETTER',
    'TIME_LESS_IS_BETTER',
    'REPS_OR_TIME_COMPLETION_BASED',
  ],
})

export const DivisionScoreType = enumType({
  name: 'DivisionScoreType',
  members: ['POINTS_PER_PLACE', 'POINT_BASED', 'CUMULATIVE_UNITS'],
})

export const Unit = enumType({
  name: 'Unit',
  members: [
    'REPS',
    'FEET',
    'METERS',
    'KILOMETERS',
    'KILOGRAMS',
    'POUNDS',
    'MILES',
    'PLACEMENT',
    'CALORIES',
    'ROUND',
    'OTHER',
    'SECONDS',
    'MINUTES',
  ],
})

export const GetScoresByWorkoutId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getScoresByWorkoutId', {
      type: 'Score',
      args: {
        workoutId: nonNull(stringArg()),
      },
      resolve: async (_parent, { workoutId }, ctx) => {
        const pg = getKysely()

        const scores = await pg
          .selectFrom('Score')
          .where('workoutId', '=', workoutId)
          .selectAll()
          .execute()

        if (!scores.length) {
          throw new Error(`No scores found for workout ${workoutId}`)
        }

        return scores
      },
    })
  },
})
