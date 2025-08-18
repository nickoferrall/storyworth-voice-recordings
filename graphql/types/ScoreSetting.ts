import { enumType, extendType, nonNull, objectType, stringArg } from 'nexus'
import { DivisionScoreType } from './Score'

export const HeatLimitType = enumType({
  name: 'HeatLimitType',
  members: ['ENTRIES', 'ATHLETES'],
})

export const ScoreSetting = objectType({
  name: 'ScoreSetting',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('competitionId')
    t.nonNull.boolean('penalizeIncomplete')
    t.nonNull.boolean('penalizeScaled')
    t.nonNull.int('maxLimitPerHeat')
    t.nullable.int('totalHeatsPerWorkout')
    t.nonNull.list.nonNull.string('ticketTypeOrderIds', {
      resolve: async ({ ticketTypeOrderIds }: any, _args, ctx) => {
        return ticketTypeOrderIds
      },
    })
    t.nonNull.field('heatLimitType', { type: HeatLimitType })
    t.nonNull.boolean('oneTicketPerHeat')
    t.nonNull.field('firstHeatStartTime', {
      type: 'DateTime',
      resolve: async (parent, _args, ctx) => {
        const [heats, comp] = await Promise.all([
          ctx.loaders.heatsByCompetitionIdLoader.load(parent.competitionId),
          ctx.loaders.competitionLoader.load(parent.competitionId),
        ])

        const validHeats = heats
          .filter((heat: any) => heat.startTime != null)
          .sort((a: any, b: any) => a.startTime.getTime() - b.startTime.getTime())

        if (validHeats.length === 0) {
          throw new Error('No heats found with valid start times')
        }

        const firstHeatStartTime = validHeats[0].startTime
        const compStartTime = comp.startDateTime

        // Return the later of the two times
        return firstHeatStartTime > compStartTime ? firstHeatStartTime : compStartTime
      },
    })
    t.nonNull.int('heatsEveryXMinutes')
    t.nonNull.field('scoring', {
      type: DivisionScoreType,
      resolve: (parent, _args, ctx) => {
        return (parent as any).scoring
      },
    })
    t.nonNull.field('handleTie', {
      type: Tiebreaker,
      resolve: (parent, _args, ctx) => {
        return (parent as any).handleTie
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const Tiebreaker = enumType({
  name: 'Tiebreaker',
  members: ['BEST_OVERALL_FINISH', 'NONE', 'SPECIFIC_WORKOUT'],
})

export const GetScoreSettingById = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getScoreSettingById', {
      type: 'ScoreSetting',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        const scoreSetting = await ctx.loaders.scoreSettingByIdLoader.load(id)

        if (!scoreSetting) {
          throw new Error('ScoreSetting not found')
        }

        return scoreSetting as any
      },
    })
  },
})

export const GetScoreSettingByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getScoreSettingByCompetitionId', {
      type: 'ScoreSetting',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const scoreSetting =
          await ctx.loaders.scoreSettingByCompIdLoader.load(competitionId)

        if (!scoreSetting) {
          throw new Error('ScoreSetting not found')
        }

        return scoreSetting as any
      },
    })
  },
})
