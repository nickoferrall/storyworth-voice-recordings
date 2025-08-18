import { extendType, nonNull, objectType, stringArg } from 'nexus'
import { Team } from './Team'
import getKysely from '../../src/db'
import generateToken from '../../utils/createToken'
import StravaManager from '../../lib/StravaManager'

export const Entry = objectType({
  name: 'Entry',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.string('name', {
      resolve: async ({ id, userId, teamId }, _args, ctx) => {
        if (teamId) {
          const team = await ctx.loaders.teamLoader.load(teamId)
          if (team?.name) {
            return team.name
          }
        }
        const user = await ctx.loaders.userByIdLoader.load(userId)
        return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName
      },
    })
    // bug where there's no lane so i've made this nullable
    t.field('laneByWorkoutId', {
      type: 'Lane',
      args: {
        workoutId: nonNull(stringArg()),
      },
      resolve: async ({ id }, { workoutId }, ctx) => {
        const lane = await ctx.loaders.laneByEntryIdAndWorkoutIdLoader.load({
          entryId: id,
          workoutId,
        })
        // if (!lane) {
        //   throw new Error('Lane not found')
        // }
        return lane
      },
    })
    t.string('invitationToken', {
      resolve: async ({ teamId }, _, ctx) => {
        if (!teamId) return null

        const pg = getKysely()

        // Check if an invitation already exists for this team
        const invitation = await ctx.loaders.invitationByTeamIdLoader.load(teamId)

        if (invitation) {
          return invitation.token
        }

        // If no invitation exists, create a new one
        if (!ctx.user?.id) {
          throw new Error('User not authenticated')
        }
        const token = generateToken(ctx.user.id)
        const newInvitation = await pg
          .insertInto('Invitation')
          .values({
            teamId,
            token,
            email: null,
            sentByUserId: ctx.user.id,
          })
          .returning('token')
          .executeTakeFirst()

        return newInvitation?.token ?? null
      },
    })
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.userId) return null
        return ctx.loaders.userByIdLoader.load(parent.userId) as any
      },
    })
    t.string('teamId')
    t.field('team', {
      type: Team,
      resolve: async (parent, _args, ctx) => {
        if (!parent.teamId) return null
        const team = await ctx.loaders.teamLoader.load(parent.teamId)

        return team || null
      },
    })
    t.nonNull.string('ticketTypeId')
    t.nonNull.field('ticketType', {
      type: 'TicketType',
      resolve: async (parent, _args, ctx) => {
        return ctx.loaders.ticketTypeLoader.load(parent.ticketTypeId) as any
      },
    })
    t.nonNull.list.nonNull.field('scores', {
      type: 'Score',
      resolve: async ({ id, userId, ticketTypeId }, _, ctx) => {
        return await ctx.loaders.scoresByEntryIdLoader.load(id)
      },
    })
    t.field('score', {
      type: 'Score',
      args: {
        workoutId: nonNull(stringArg()),
      },
      resolve: async ({ id }, { workoutId }, ctx) => {
        const res = await ctx.loaders.scoresByEntryAndWorkoutIdsLoader.load({
          entryId: id,
          workoutId,
        })
        return res
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const GetEntriesByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getEntriesByCompetitionId', {
      type: 'Entry',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const entries = await ctx.loaders.entriesByCompetitionIdLoader.load(competitionId)

        return entries ?? []
      },
    })
  },
})

export const GetEntryByUserAndCompetition = extendType({
  type: 'Query',
  definition(t) {
    t.field('getEntryByUserAndCompetition', {
      type: 'Entry',
      args: {
        userId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { userId, competitionId }) => {
        const pg = getKysely()

        const registration = await pg
          .selectFrom('Registration')
          .where('competitionId', '=', competitionId)
          .where('userId', '=', userId)
          .select(['ticketTypeId', 'id'])
          .executeTakeFirst()

        if (!registration) {
          throw new Error('Registration not found')
        }

        // First, try to find an individual entry
        let entry = await pg
          .selectFrom('Entry')
          .where('userId', '=', userId)
          .where('ticketTypeId', '=', registration.ticketTypeId)
          .selectAll()
          .executeTakeFirst()

        if (!entry) {
          // If no individual entry found, check for a team entry
          const teamMember = await pg
            .selectFrom('TeamMember')
            .where('userId', '=', userId)
            .select('teamId')
            .executeTakeFirst()

          if (teamMember) {
            entry = await pg
              .selectFrom('Entry')
              .where('teamId', '=', teamMember.teamId)
              .where('ticketTypeId', '=', registration.ticketTypeId)
              .selectAll()
              .executeTakeFirst()
          }
        }

        return entry || null
      },
    })
  },
})

export const GetEntriesByWorkoutId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getEntriesByWorkoutId', {
      type: 'Entry',
      args: {
        workoutId: nonNull(stringArg()),
      },
      resolve: async (_parent, { workoutId }, ctx) => {
        const workout = await ctx.loaders.workoutLoader.load(workoutId)
        if (!workout) {
          throw new Error(`Workout not found for id: ${workoutId}`)
        }

        const entries = await ctx.loaders.entriesByCompetitionIdLoader.load(
          workout.competitionId,
        )

        return entries as any
      },
    })
  },
})

export const GetUnassignedEntriesByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getUnassignedEntriesByCompetitionId', {
      type: 'Entry',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const pg = getKysely()

        const unassignedEntries = await pg
          .selectFrom('Entry')
          .innerJoin('TicketType', 'TicketType.id', 'Entry.ticketTypeId')
          .leftJoin('Lane', 'Lane.entryId', 'Entry.id')
          .where('TicketType.competitionId', '=', competitionId)
          .where('Lane.id', 'is', null)
          .selectAll('Entry')
          .execute()

        return unassignedEntries
      },
    })
  },
})
