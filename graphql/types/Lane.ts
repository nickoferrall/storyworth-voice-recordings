import { extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { Entry } from './Entry'
import { Score } from './Score'

export const Lane = objectType({
  name: 'Lane',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.int('number')
    t.nonNull.string('entryId')
    t.nonNull.string('heatId')
    t.nonNull.field('heat', {
      type: 'Heat',
      resolve: async (parent, _args, ctx) => {
        const heat = await ctx.loaders.heatLoader.load(parent.heatId)
        if (!heat) {
          throw new Error(`Heat not found for id: ${parent.heatId}`)
        }
        return heat
      },
    })
    t.nonNull.field('entry', {
      type: Entry,
      resolve: async (parent, _args, ctx) => {
        const entry = await ctx.loaders.entryLoader.load(parent.entryId)
        if (!entry) {
          throw new Error(`Entry not found for id: ${parent.entryId}`)
        }
        return entry
      },
    })
    t.field('score', {
      type: Score,
      resolve: async (parent, _args, ctx) => {
        const heat = await ctx.loaders.heatLoader.load(parent.heatId)

        if (!heat) {
          throw new Error(`Heat not found for id: ${parent.heatId}`)
        }

        const score = await ctx.loaders.scoresByEntryAndWorkoutIdsLoader.load({
          entryId: parent.entryId,
          workoutId: heat.workoutId,
        })

        return score
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const GetLaneById = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getLaneById', {
      type: 'Lane',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        const pg = getKysely()
        const lane = await pg
          .selectFrom('Lane')
          .selectAll()
          .where('id', '=', id)
          .executeTakeFirst()

        if (!lane) {
          throw new Error('Lane not found')
        }

        return lane
      },
    })
  },
})

export const GetLanesByHeatId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getLanesByHeatId', {
      type: 'Lane',
      args: {
        heatId: nonNull(stringArg()),
      },
      resolve: async (_parent, { heatId }, ctx) => {
        const lanes = await ctx.loaders.laneByHeatIdLoader.load(heatId)
        return lanes
      },
    })
  },
})
