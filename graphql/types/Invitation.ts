import { enumType, extendType, nonNull, objectType, stringArg, arg, list } from 'nexus'
import { stringToEnum } from '../../utils/stringToEnum'
import { InvitationStatus as TInvitationStatus } from '../../src/generated/graphql'
import getKysely from '../../src/db'

export const Invitation = objectType({
  name: 'Invitation',
  definition(t) {
    t.nonNull.string('id')
    t.nullable.string('email')
    t.nonNull.string('token')
    t.nonNull.field('status', {
      type: InvitationStatus,
      resolve: (parent) => {
        return stringToEnum((parent as any).status, TInvitationStatus) as any
      },
    })
    t.nonNull.string('teamId')
    t.field('team', {
      type: 'Team',
      resolve: async (parent, _args, ctx) => {
        const pg = getKysely()
        const team = await pg
          .selectFrom('Team')
          .where('id', '=', parent.teamId)
          .selectAll()
          .executeTakeFirst()

        return team || null
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
    t.nonNull.string('sentByUserId')
    t.field('sentBy', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        const user = await ctx.loaders.userByIdLoader.load(parent.sentByUserId)
        return (user as any) || null
      },
    })
  },
})

export const InvitationStatus = enumType({
  name: 'InvitationStatus',
  members: ['PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED'],
})

export const GetInvitationByToken = extendType({
  type: 'Query',
  definition(t) {
    t.field('getInvitationByToken', {
      type: Invitation,
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, { token }, ctx) => {
        const pg = getKysely()
        const invitation = await pg
          .selectFrom('Invitation')
          .where('token', '=', token)
          .selectAll()
          .executeTakeFirst()

        if (!invitation) {
          throw new Error('Invitation not found')
        }

        return invitation
      },
    })
  },
})

export const GetInvitationsByTeamId = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('getInvitationsByTeamId', {
      type: Invitation,
      args: {
        teamId: nonNull(stringArg()),
      },
      resolve: async (_parent, { teamId }, ctx) => {
        const pg = getKysely()
        const invitations = await pg
          .selectFrom('Invitation')
          .where('teamId', '=', teamId)
          .where('status', '=', 'PENDING')
          .where('email', '!=', '')
          .selectAll()
          .execute()

        return invitations
      },
    })
  },
})
