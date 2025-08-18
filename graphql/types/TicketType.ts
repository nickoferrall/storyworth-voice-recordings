import { extendType, nonNull, objectType, stringArg } from 'nexus'
import { EarlyBird } from './EarlyBird'
import { Competition, Currency } from './Competition'
import { DateTime } from './DateTime'
import { RegistrationField } from './RegistrationField'
import getKysely from '../../src/db'
import { DivisionScoreType } from './Score'
import { isHeatFull } from '../../utils/isHeatFull'

export const TicketType = objectType({
  name: 'TicketType',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('name')
    t.string('description')
    t.nonNull.float('price')
    t.nonNull.int('teamSize')
    t.nonNull.boolean('isTeamNameRequired', {
      resolve: async ({ id, teamSize }, _, ctx) => {
        if (teamSize === 1) return false
        const regFields =
          await ctx.loaders.allRegistrationFieldsByTicketTypeLoader.load(id)
        const teamNameField = regFields.find((field) => field.question === 'Team Name')
        return teamNameField?.requiredStatus !== 'OFF'
      },
    })
    t.nonNull.boolean('isVolunteer')
    t.nonNull.boolean('allowHeatSelection')
    t.nonNull.boolean('hasAvailability', {
      resolve: async (
        { id, maxEntries, allowHeatSelection, teamSize, competitionId },
        _,
        ctx,
      ) => {
        // Run initial data fetching in parallel
        const [entries, scoreSetting, heats, associatedHeatIds] = await Promise.all([
          ctx.loaders.entryByTicketTypeIdLoader.load(id),
          ctx.loaders.scoreSettingByCompIdLoader.load(competitionId),
          ctx.loaders.heatsByCompetitionIdLoader.load(competitionId),
          ctx.loaders.heatsByTicketTypeLoader.load(id),
        ])

        const registered = entries.length
        if (!allowHeatSelection) {
          return maxEntries > registered
        }

        if (!scoreSetting) {
          throw new Error('ScoreSetting not found for the competition')
        }

        const filteredHeats = heats.filter(
          (heat) =>
            // If no associations exist, the heat is available to all ticket types
            associatedHeatIds.length === 0 || associatedHeatIds.includes(heat.id),
        )

        // Check all heats in parallel
        const heatFullChecks = await Promise.all(
          filteredHeats.map((heat) => isHeatFull(heat, scoreSetting, teamSize, ctx)),
        )
        return heatFullChecks.some((isFull) => !isFull)
      },
    })
    t.nonNull.int('maxEntries')
    t.nonNull.field('currency', { type: Currency })
    t.string('earlyBirdId')
    t.string('stripeProductId') // null if free
    t.string('stripePriceId')
    t.field('divisionScoreType', { type: DivisionScoreType })
    t.nonNull.list.nonNull.field('registrationFields', {
      type: RegistrationField,
      resolve: async (parent, _, ctx) => {
        const regFields = await ctx.loaders.registrationFieldsByTicketTypeLoader.load(
          parent.id,
        )
        return regFields as any
      },
    })
    t.nullable.field('earlyBird', {
      type: EarlyBird,
      resolve: async (parent, _, ctx) => {
        return (await ctx.loaders.earlyBirdByTicketTypeLoader.load(parent.id)) as any
      },
    })
    t.nonNull.field('registered', {
      type: 'Int',
      resolve: async (parent, _, ctx) => {
        const entries = await ctx.loaders.entryByTicketTypeIdLoader.load(parent.id)
        return entries.length
      },
    })
    t.nonNull.boolean('offerEarlyBird', {
      resolve: async ({ earlyBirdId }) => {
        return !!earlyBirdId
      },
    })
    t.nonNull.field('competition', {
      type: Competition,
      resolve: async (parent, _, ctx) => {
        const comp = await ctx.loaders.competitionLoader.load(parent.competitionId)
        if (!comp) {
          throw new Error('Competition not found')
        }
        return comp
      },
    })
    t.nonNull.string('competitionId')
    t.string('refundPolicy')
    t.nonNull.boolean('passOnPlatformFee')
    t.nonNull.field('createdAt', { type: DateTime })
    t.nonNull.field('updatedAt', { type: DateTime })
  },
})

export const GetTicketTypesByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getTicketTypesByCompetitionId', {
      type: TicketType,
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }) => {
        const pg = getKysely()
        const ticketTypes = await pg
          .selectFrom('TicketType')
          .where('competitionId', '=', competitionId)
          .selectAll()
          .orderBy('isVolunteer', 'asc')
          .orderBy('createdAt', 'asc')
          .orderBy('name', 'asc')
          .execute()

        return ticketTypes as any
      },
    })
  },
})

export const GetTicketTypeById = extendType({
  type: 'Query',
  definition(t) {
    t.field('getTicketTypeById', {
      type: 'TicketType',
      args: {
        ticketId: nonNull(stringArg()),
      },
      resolve: async (_parent, { ticketId }) => {
        const pg = getKysely()
        const ticket = await pg
          .selectFrom('TicketType')
          .where('id', '=', ticketId)
          .selectAll()
          .orderBy('isVolunteer', 'asc')
          .orderBy('createdAt', 'asc')
          .orderBy('name', 'asc')
          .executeTakeFirst()

        return ticket as any
      },
    })
  },
})
