import { extendType, nonNull, objectType, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { Lane } from './Lane'
import { Selectable } from 'kysely'
import { Heat as THeat } from '../../src/generated/database'
import { HeatLimitType } from './ScoreSetting'

export const Heat = objectType({
  name: 'Heat',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('workoutId')
    t.nonNull.list.nonNull.field('ticketTypes', {
      type: 'TicketType',
      resolve: async (parent, _args, ctx) => {
        const res = await ctx.loaders.heatTicketTypesLoader.load(parent.id)
        return res as any
      },
    })
    t.nonNull.list.nonNull.field('allTicketTypes', {
      type: 'TicketType',
      resolve: async (parent, _args, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${parent.workoutId}`)
        }
        const allTicketTypes = await ctx.loaders.ticketTypesByCompetitionIdLoader.load(
          workout.competitionId,
        )
        return allTicketTypes.filter((ticketType: any) => !ticketType.isVolunteer) as any
      },
    })
    t.nonNull.int('registrationsCount', {
      resolve: async (parent, _args, ctx) => {
        // Get workout to find competitionId
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${parent.workoutId}`)
        }

        const count = await ctx.loaders.heatRegistrationsCountLoader.load({
          competitionId: workout.competitionId,
          heatId: parent.id,
        })

        return count
      },
    })
    t.nonNull.int('maxLimitPerHeat', {
      resolve: async (parent, _args, ctx) => {
        if ('maxLimitPerHeat' in parent) {
          return parent.maxLimitPerHeat as number
        }
        return 0
      },
    })
    t.nonNull.field('heatLimitType', {
      type: HeatLimitType,
      resolve: async (parent, _args, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${parent.workoutId}`)
        }

        const scoreSetting = await ctx.loaders.scoreSettingByCompIdLoader.load(
          workout.competitionId,
        )

        return scoreSetting?.heatLimitType || 'ENTRIES'
      },
    })
    t.field('workout', {
      type: 'Workout',
      resolve: async (parent, _args, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${parent.workoutId}`)
        }
        return workout
      },
    })

    t.nonNull.string('name', {
      resolve: async (parent, _, ctx) => {
        const heats = await ctx.loaders.heatsByWorkoutIdLoader.load(parent.workoutId)

        const currentHeatIdx = heats.findIndex((heat: any) => heat.id === parent.id)
        return `Heat ${currentHeatIdx + 1}`
      },
    })
    t.nonNull.field('startTime', { type: 'DateTime' })
    t.nonNull.list.nonNull.field('lanes', {
      type: Lane,
      resolve: async (parent, _args, ctx) => {
        const lanes = await ctx.loaders.laneByHeatIdLoader.load(parent.id)
        return lanes
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.int('availableLanes', {
      resolve: async (parent, _args, ctx) => {
        // Get the ScoreSetting to check the limit type
        const workout = await ctx.loaders.workoutLoader.load(parent.workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${parent.workoutId}`)
        }

        const scoreSetting = await ctx.loaders.scoreSettingByCompIdLoader.load(
          workout.competitionId,
        )

        // Get current lanes
        const lanes = await ctx.loaders.laneByHeatIdLoader.load(parent.id)
        const currentLaneCount = lanes.length

        if (scoreSetting?.heatLimitType === 'ENTRIES') {
          // For ENTRIES, it's straightforward - just subtract current lanes from max
          const maxLimit =
            'maxLimitPerHeat' in parent ? (parent.maxLimitPerHeat as number) : 0
          return maxLimit - currentLaneCount
        } else {
          // For ATHLETES, we need to count total athletes in current lanes
          const entries = await Promise.all(
            lanes.map((lane) => ctx.loaders.entryLoader.load(lane.entryId)),
          )

          const ticketTypes = await Promise.all(
            entries.map((entry) =>
              entry ? ctx.loaders.ticketTypeLoader.load(entry.ticketTypeId) : null,
            ),
          )

          const currentAthleteCount = ticketTypes.reduce(
            (sum, tt) => sum + (tt ? tt.teamSize : 0),
            0,
          )

          const maxLimit =
            'maxLimitPerHeat' in parent ? (parent.maxLimitPerHeat as number) : 0
          return Math.floor((maxLimit - currentAthleteCount) / 1) // Divide by 1 as default team size
        }
      },
    })
  },
})

export const GetHeatsByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getHeatsByCompetitionId', {
      type: 'Heat',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const heats = await ctx.loaders.heatsByCompetitionIdLoader.load(competitionId)

        if (!heats) {
          throw new Error('Heats not found')
        }

        return heats as any
      },
    })
  },
})

export const GetHeatById = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getHeatById', {
      type: 'Heat',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        const heat = await ctx.loaders.heatLoader.load(id)
        if (!heat) {
          throw new Error('Heat not found')
        }
        return heat as any
      },
    })
  },
})

export const GetHeatsByWorkoutId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getHeatsByWorkoutId', {
      type: 'Heat',
      args: {
        workoutId: nonNull(stringArg()),
      },
      resolve: async (_parent, { workoutId }, ctx) => {
        const heats = await ctx.loaders.heatsByWorkoutIdLoader.load(workoutId)

        if (!heats) {
          throw new Error('Heats not found')
        }

        return heats
      },
    })
  },
})

export const GetAvailableHeatsByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getAvailableHeatsByCompetitionId', {
      type: 'Heat',
      args: {
        competitionId: nonNull(stringArg()),
        ticketTypeId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId, ticketTypeId }, ctx) => {
        const pg = getKysely()

        // Fetch the ScoreSetting for the competition
        const scoreSetting = await pg
          .selectFrom('ScoreSetting')
          .select(['heatLimitType', 'maxLimitPerHeat'])
          .where('competitionId', '=', competitionId)
          .executeTakeFirst()

        if (!scoreSetting) {
          throw new Error('ScoreSetting not found for the competition')
        }

        const heats = await ctx.loaders.heatsByCompetitionIdLoader.load(competitionId)

        // Filter heats based on ticket type associations
        const filteredHeats = (
          await Promise.all(
            heats.map(async (heat) => {
              const ticketTypes = await pg
                .selectFrom('HeatTicketTypes')
                .select('ticketTypeId')
                .where('heatId', '=', heat.id)
                .execute()

              return ticketTypes.length === 0 ||
                ticketTypes.some((tt) => tt.ticketTypeId === ticketTypeId)
                ? heat
                : null
            }),
          )
        ).filter((heat) => heat !== null)

        const availableHeats: Selectable<THeat>[] = []

        for (const heat of filteredHeats) {
          if (scoreSetting.heatLimitType === 'ENTRIES') {
            const lanes = await ctx.loaders.laneByHeatIdLoader.load(heat.id)

            if (lanes.length < (heat as any).maxLimitPerHeat) {
              availableHeats.push(heat)
            }
          } else {
            const entries = await pg
              .selectFrom('Lane')
              .innerJoin('Entry', 'Entry.id', 'Lane.entryId')
              .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
              .where('Lane.heatId', '=', heat.id)
              .select(['TicketType.teamSize'])
              .execute()

            const totalAthletes = entries.reduce((sum, entry) => sum + entry.teamSize, 0)
            const newEntryTicketType = await pg
              .selectFrom('TicketType')
              .select('teamSize')
              .where('id', '=', ticketTypeId)
              .executeTakeFirst()
            if (!newEntryTicketType) {
              throw new Error('TicketType not found')
            }
            const newEntryTeamSize = newEntryTicketType.teamSize

            if (totalAthletes + newEntryTeamSize <= (heat as any).maxLimitPerHeat) {
              availableHeats.push(heat)
            }
          }
        }

        return availableHeats
      },
    })
  },
})
