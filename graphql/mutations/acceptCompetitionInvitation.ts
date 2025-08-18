import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const AcceptCompetitionInvitationMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('acceptCompetitionInvitation', {
      type: 'Boolean',
      args: {
        token: nonNull(stringArg()),
      },
      resolve: async (_parent, { token }, ctx) => {
        if (!ctx.user) {
          throw new Error('You must be logged in to accept an invitation')
        }

        const pg = getKysely()

        const invitation = await pg
          .selectFrom('CompetitionInvitation')
          .where('token', '=', token)
          .selectAll()
          .executeTakeFirst()

        if (!invitation) {
          throw new Error('Invalid or expired invitation token')
        }

        if (invitation.email.toLowerCase() !== ctx.user.email.toLowerCase()) {
          throw new Error('This invitation was not sent to your email address')
        }

        // Get the competition details
        const competition = await ctx.loaders.competitionLoader.load(
          invitation.competitionId,
        )
        if (!competition) {
          throw new Error('Competition not found')
        }

        if (invitation.status !== 'PENDING') {
          throw new Error('This invitation has already been processed or expired')
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        if (new Date(invitation.createdAt) < thirtyDaysAgo) {
          await pg
            .updateTable('CompetitionInvitation')
            .set({ status: 'EXPIRED', updatedAt: new Date() })
            .where('id', '=', invitation.id)
            .execute()
          throw new Error('This invitation has expired')
        }

        const userId = ctx.user.id

        const existingCreator = await pg
          .selectFrom('CompetitionCreator')
          .where('userId', '=', userId)
          .where('competitionId', '=', invitation.competitionId)
          .selectAll()
          .executeTakeFirst()

        if (existingCreator) {
          await pg
            .updateTable('CompetitionInvitation')
            .set({ status: 'ACCEPTED', updatedAt: new Date() })
            .where('id', '=', invitation.id)
            .execute()
          return true
        }

        await pg.transaction().execute(async (trx) => {
          await trx
            .insertInto('CompetitionCreator')
            .values({
              userId,
              competitionId: invitation.competitionId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .execute()

          await trx
            .updateTable('CompetitionInvitation')
            .set({ status: 'ACCEPTED', updatedAt: new Date() })
            .where('id', '=', invitation.id)
            .execute()
        })

        return true
      },
    })
  },
})
