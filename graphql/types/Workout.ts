import { extendType, nonNull, objectType, stringArg } from 'nexus'
import { Score, ScoreType, Unit } from './Score'
import { ScoreSetting } from './ScoreSetting'
import getKysely from '../../src/db'

export const Workout = objectType({
  name: 'Workout',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.nonNull.string('description')
    t.nonNull.field('releaseDateTime', { type: 'DateTime' })
    t.nonNull.string('competitionId')
    t.nonNull.boolean('isVisible') // are the results for the workout visible to the athlete
    t.nonNull.string('location')
    t.nonNull.field('scoreType', {
      type: ScoreType,
      resolve: (parent, _args, ctx) => {
        return (parent as any).scoreType
        // stringToEnum((parent as any).scoreType, ScoreType)
      },
    })
    t.nonNull.field('unitOfMeasurement', { type: Unit })
    t.nonNull.int('timeCap', {
      resolve: (parent, _args) => {
        return (parent as any).timeCap ?? 0
      },
    })
    // t.nonNull.boolean('tiebreaker')
    t.nonNull.boolean('includeStandardsVideo')
    t.list.field('scores', {
      type: Score,
      resolve: (parent, _args, ctx) => {
        return null
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.field('scoreSetting', {
      type: ScoreSetting,
      resolve: (parent, _args, ctx) => {
        return ctx.loaders.scoreSettingByCompIdLoader.load(parent.competitionId) as any
      },
    })

    t.list.field('videos', {
      type: 'WorkoutVideo',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.videosByWorkoutIdLoader.load(parent.id)
      },
    })
  },
})

export const GetWorkoutsByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getWorkoutsByCompetitionId', {
      type: Workout,
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const pg = getKysely()
        const workouts = await pg
          .selectFrom('Workout')
          .selectAll()
          .where('competitionId', '=', competitionId)
          .orderBy('createdAt', 'asc')
          .orderBy('name', 'asc')
          .execute()
        if (!workouts) {
          throw new Error('Workouts not found')
        }
        return workouts
      },
    })
  },
})

export const GetWorkoutById = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getWorkoutById', {
      type: Workout,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(id)
        if (!workout) {
          throw new Error('Workout not found')
        }
        return workout
      },
    })
  },
})
