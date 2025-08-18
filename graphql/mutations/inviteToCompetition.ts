import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { v4 as uuidv4 } from 'uuid'
import shortUUID from 'short-uuid'
import { sendCompetitionInvitationEmail } from '../../emails/inviteToCompetition'

export const InviteToCompetitionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('inviteToCompetition', {
      type: 'Boolean',
      args: {
        competitionId: nonNull(stringArg()),
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId, email }, ctx) => {
        if (!ctx.user) {
          throw new Error('You must be logged in to invite someone')
        }

        const pg = getKysely()

        const ownershipResult = await ctx.loaders.competitionOwnershipLoader.load({
          competitionId,
          userId: ctx.user.id,
        })

        if (!ownershipResult.hasAccess) {
          throw new Error(
            'You do not have permission to invite others to this competition',
          )
        }

        const competition = await ctx.loaders.competitionLoader.load(competitionId)
        if (!competition) {
          throw new Error('Competition not found')
        }

        const existingUser = await ctx.loaders.userByEmailLoader.load(email)
        if (existingUser) {
          const existingCreator = await pg
            .selectFrom('CompetitionCreator')
            .where('userId', '=', existingUser.id)
            .where('competitionId', '=', competitionId)
            .selectAll()
            .executeTakeFirst()

          if (existingCreator) {
            throw new Error('User is already a creator of this competition')
          }
        }

        const existingInvitation = await pg
          .selectFrom('CompetitionInvitation')
          .where((eb) => eb.fn('LOWER', ['email']), '=', email.toLowerCase())
          .where('competitionId', '=', competitionId)
          .where('status', '=', 'PENDING')
          .selectAll()
          .executeTakeFirst()

        if (existingInvitation) {
          throw new Error(
            'An invitation has already been sent to this email for this competition',
          )
        }

        const token = shortUUID.generate()

        await pg
          .insertInto('CompetitionInvitation')
          .values({
            id: uuidv4(),
            email,
            competitionId,
            token,
            status: 'PENDING',
            sentByUserId: ctx.user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .execute()

        // Send invitation email
        const senderName = ctx.user.lastName
          ? `${ctx.user.firstName} ${ctx.user.lastName}`
          : ctx.user.firstName

        const emailSent = await sendCompetitionInvitationEmail(
          email,
          competition.name || 'Competition',
          token,
          senderName,
        )

        if (!emailSent) {
          console.error('Failed to send competition invitation email')
          // Don't throw error - invitation record is still created
        }

        return true
      },
    })
  },
})
