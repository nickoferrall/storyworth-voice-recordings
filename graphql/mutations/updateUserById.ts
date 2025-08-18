import { extendType, nonNull, nullable, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdateUserByIdMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateUserById', {
      type: 'User',
      args: {
        userId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
        firstName: nullable(stringArg()),
        lastName: nullable(stringArg()),
      },
      resolve: async (_parent, { userId, competitionId, firstName, lastName }, ctx) => {
        if (!ctx.user?.id) {
          throw new Error('Not authenticated')
        }

        // Authorize: organiser must own or be a creator of this competition
        const ownership = await ctx.loaders.competitionOwnershipLoader.load({
          competitionId,
          userId: ctx.user.id,
        })
        if (!ownership?.hasAccess) {
          throw new Error('You do not have permission to update this user')
        }

        const pg = getKysely()
        const updatedUser = await pg
          .updateTable('UserProfile')
          .set({
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            updatedAt: new Date(),
          })
          .where('id', '=', userId)
          .returningAll()
          .executeTakeFirstOrThrow()

        return updatedUser
      },
    })
  },
})
