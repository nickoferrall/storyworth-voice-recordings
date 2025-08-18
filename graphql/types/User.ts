import { enumType, extendType, objectType, nonNull, stringArg, list } from 'nexus'
import { Feedback } from './Feedback'
import { Referral } from './Referral'
import { Registration } from './Registration'
import { Competition } from './Competition'
import { Payment } from './Payment'
import getKysely from '../../src/db'

export const User = objectType({
  name: 'User',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('email')
    t.nonNull.string('firstName')
    t.string('lastName')
    t.string('dateOfBirth')
    t.string('gender')
    t.string('phoneNumber')
    t.string('country')
    t.string('region')
    t.string('city')
    t.string('picture')
    t.string('bio')
    t.nonNull.boolean('isSuperUser')
    t.nonNull.boolean('isVerified')
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.string('name', {
      resolve: (parent) => {
        if (parent.lastName) {
          return `${parent.firstName} ${parent.lastName}`
        }
        return parent.firstName
      },
    })
    t.nullable.string('invitationId')
    t.nullable.string('referredBy')
    t.nullable.string('referralCode')
    t.nullable.string('orgId')
    t.nonNull.list.nonNull.field('competitionsAsAthlete', {
      type: Competition,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.competitionsAsAthleteByUserIdLoader.load(parent.id)
      },
    })
    t.nonNull.list.nonNull.field('competitionsAsCreator', {
      type: Competition,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.competitionsAsCreatorByUserIdLoader.load(parent.id)
      },
    })
    t.nonNull.list.nonNull.field('registrations', {
      type: Registration,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.registrationByUserIdLoader.load(parent.id)
      },
    })
    t.nonNull.list.nonNull.field('payments', {
      type: Payment,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.paymentByUserIdLoader.load(parent.id)
      },
    })
    t.nonNull.list.nonNull.field('feedback', {
      type: Feedback,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.feedbackByUserIdLoader.load(parent.id)
      },
    })
    t.nonNull.list.nonNull.field('referrals', {
      type: Referral,
      resolve: async (parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.referralByUserIdLoader.load(parent.id)
      },
    })
  },
})

export const Tier = enumType({
  name: 'Tier',
  members: ['FREE', 'PRO'],
})

export const GetUser = extendType({
  type: 'Query',
  definition(t) {
    t.field('getUser', {
      type: 'User',
      resolve: async (_parent, args, ctx) => {
        // Return user directly from context (Redis session)
        // This avoids the database lookup that might be failing
        if (!ctx.user?.id) return null

        return ctx.user
      },
    })
  },
})

export const GetUserSchedule = extendType({
  type: 'Query',
  definition(t) {
    t.field('getUserSchedule', {
      type: nonNull(list(nonNull('UserScheduleItem'))),
      args: {
        userId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        const { userId, competitionId } = args
        const pg = getKysely()

        // Try to fetch lanes via a direct Entry for this user
        let entries = await pg
          .selectFrom('Entry')
          .innerJoin('Lane', 'Lane.entryId', 'Entry.id')
          .innerJoin('Heat', 'Heat.id', 'Lane.heatId')
          .innerJoin('Workout', 'Workout.id', 'Heat.workoutId')
          .select([
            'Entry.id as entryId',
            'Heat.id as heatId',
            'Workout.id as workoutId',
            'Workout.createdAt as workoutCreatedAt',
            'Workout.name as workoutName',
          ])
          .where('Entry.userId', '=', userId)
          .where('Workout.competitionId', '=', competitionId)
          .orderBy('Workout.createdAt', 'asc')
          .orderBy('Workout.name', 'asc')
          .execute()

        // If user has no direct Entry (team member scenario), resolve via Team membership
        if (!entries.length) {
          const team = await ctx.loaders.teamByUserIdLoader.load({
            userId,
            competitionId,
          })
          if (team?.id) {
            entries = await pg
              .selectFrom('Entry')
              .innerJoin('Lane', 'Lane.entryId', 'Entry.id')
              .innerJoin('Heat', 'Heat.id', 'Lane.heatId')
              .innerJoin('Workout', 'Workout.id', 'Heat.workoutId')
              .select([
                'Entry.id as entryId',
                'Heat.id as heatId',
                'Workout.id as workoutId',
                'Workout.createdAt as workoutCreatedAt',
                'Workout.name as workoutName',
              ])
              .where('Entry.teamId', '=', team.id)
              .where('Workout.competitionId', '=', competitionId)
              .orderBy('Workout.createdAt', 'asc')
              .orderBy('Workout.name', 'asc')
              .execute()
          }
        }

        const schedule = await Promise.all(
          entries.map(async (entry) => {
            const workout = await pg
              .selectFrom('Workout')
              .selectAll()
              .where('Workout.id', '=', entry.workoutId)
              .executeTakeFirst()

            const heat = await pg
              .selectFrom('Heat')
              .selectAll()
              .where('Heat.id', '=', entry.heatId)
              .executeTakeFirst()

            return { workout, heat }
          }),
        )

        return schedule as any
      },
    })
  },
})

// Define the UserScheduleItem type
export const UserScheduleItem = objectType({
  name: 'UserScheduleItem',
  definition(t) {
    t.nonNull.field('workout', { type: 'Workout' })
    t.nonNull.field('heat', { type: 'Heat' })
  },
})

export const Query = extendType({
  type: 'Query',
  definition(t) {
    t.field('getMyCompetitionsAsAthlete', {
      type: nonNull(list(nonNull(Competition))),
      description:
        'Fetches the competitions for which the currently authenticated user is registered as an athlete.',
      resolve: async (_parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }
        return ctx.loaders.competitionsAsAthleteByUserIdLoader.load(ctx.user.id)
      },
    })
  },
})

export const GetViewer = extendType({
  type: 'Query',
  definition(t) {
    t.field('getViewer', {
      type: 'User',
      resolve: async (_parent, args, ctx) => {
        // Return user directly from context (Redis session)
        // This avoids the database lookup that might be failing
        if (!ctx.user?.id) return null

        return ctx.user
      },
    })
  },
})

export const GetMyCompetitionsAsAthlete = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getMyCompetitionsAsAthlete', {
      type: Competition,
      description:
        'Fetches the competitions for which the currently authenticated user is registered as an athlete.',
      resolve: async (_parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }

        return ctx.loaders.competitionsAsAthleteByUserIdLoader.load(ctx.user.id)
      },
    })
  },
})

export const GetMyCompetitionsAsCreator = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getMyCompetitionsAsCreator', {
      type: Competition,
      description:
        'Fetches the competitions for which the currently authenticated user is registered as a creator.',
      resolve: async (_parent, _args, ctx) => {
        if (!ctx.user?.id) {
          return []
        }

        return ctx.loaders.competitionsAsCreatorByUserIdLoader.load(ctx.user.id)
      },
    })
  },
})
