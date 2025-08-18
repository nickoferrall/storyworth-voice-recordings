import { User } from './User'
import { extendType, nonNull, stringArg, objectType } from 'nexus'
import { Competition } from './Competition'
import { TicketType } from './TicketType'
import { RegistrationAnswer } from './RegistrationAnswer'
import { RegistrationField } from './RegistrationField'
import getKysely from '../../src/db'
import { Team } from './Team'

export const Registration = objectType({
  name: 'Registration',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('userId')
    t.nonNull.field('user', {
      type: User,
      resolve: async (parent, _args, ctx) => {
        const res = await ctx.loaders.userByIdLoader.load(parent.userId)
        if (!res) {
          throw new Error('User not found')
        }
        // TODO: fix type
        return res as any
      },
    })
    t.nonNull.boolean('isCheckedIn')
    t.nonNull.string('competitionId')
    t.nonNull.field('competition', {
      type: Competition,
      resolve: async (parent, _args, ctx) => {
        const comp = await ctx.loaders.competitionLoader.load(parent.competitionId)
        return comp || null
      },
    })
    t.nonNull.string('ticketTypeId')
    t.nonNull.field('ticketType', {
      type: TicketType,
      resolve: async (parent, _args, ctx) => {
        const ticketType = await ctx.loaders.ticketTypeLoader.load(parent.ticketTypeId)
        if (!ticketType) {
          throw new Error('Ticket Type not found')
        }
        return ticketType as any
      },
    })
    t.field('team', {
      type: Team,
      resolve: async ({ competitionId, userId }, _, ctx) => {
        const team = await ctx.loaders.teamByUserIdLoader.load({ userId, competitionId })
        return team || null
      },
    })
    t.nullable.field('teamName', {
      type: 'String',
      resolve: async ({ userId, competitionId }, _, ctx) => {
        const team = await ctx.loaders.teamByUserIdLoader.load({ userId, competitionId })

        return team?.name ?? null
      },
    })

    t.nonNull.list.nonNull.field('registrationAnswers', {
      type: RegistrationAnswer,
      resolve: async (parent, _args, ctx) => {
        const answers = await ctx.loaders.registrationAnswersLoader.load(parent.id)
        return answers as any
      },
    }),
      t.nonNull.list.nonNull.field('registrationFields', {
        type: RegistrationField,
        resolve: async (parent, _, ctx) => {
          const regFields = await ctx.loaders.registrationFieldsByTicketTypeLoader.load(
            parent.ticketTypeId,
          )
          return regFields as any
        },
      })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})
export const GetRegistrationsByCompetitionId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getRegistrationsByCompetitionId', {
      type: 'Registration',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }) => {
        const pg = getKysely()
        const registrations = await pg
          .selectFrom('Registration as r')
          .innerJoin('UserProfile as u', 'u.id', 'r.userId')
          .where('r.competitionId', '=', competitionId)
          .selectAll('r')
          .execute()

        if (!registrations) {
          throw new Error('Registrations not found')
        }

        return registrations
      },
    })

    t.nonNull.field('getRegistrantById', {
      type: 'Registration',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }) => {
        const pg = getKysely()
        const registrant = await pg
          .selectFrom('Registration')
          .where('id', '=', id)
          .selectAll()
          .orderBy('createdAt', 'asc')
          .orderBy('id', 'asc')
          .executeTakeFirst()

        if (!registrant) {
          throw new Error('Registrant not found')
        }

        return registrant
      },
    })
  },
})

export const IsUserRegisteredForCompetition = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('isUserRegisteredForCompetition', {
      type: 'Boolean',
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        if (!ctx.user?.id) {
          return false
        }

        const pg = getKysely()

        const registration = await pg
          .selectFrom('Registration')
          .where('userId', '=', ctx.user.id)
          .where('competitionId', '=', competitionId)
          .select('id')
          .executeTakeFirst()

        return !!registration
      },
    })
  },
})
