import { extendType, nonNull, idArg, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const DeleteCompetitionMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteCompetition', {
      type: 'Boolean',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx) => {
        console.log('🚀 ~ ctx.user:', ctx.user)
        if (!ctx.user) {
          throw new Error('You must be logged in to delete a competition')
        }

        const pg = getKysely()

        // Check if user is a super user first
        const user = await pg
          .selectFrom('UserProfile')
          .select(['isSuperUser'])
          .where('id', '=', ctx.user.id)
          .executeTakeFirst()

        const isSuperUser = user?.isSuperUser || false

        // Super users can delete any competition, others need ownership
        if (!isSuperUser) {
          const ownershipResult = await ctx.loaders.competitionOwnershipLoader.load({
            competitionId: id,
            userId: ctx.user.id,
          })
          if (!ownershipResult.hasAccess) {
            throw new Error('You do not have permission to delete this competition')
          }
        }

        try {
          const result = await pg
            .updateTable('Competition')
            .set({ isActive: false })
            .where('id', '=', id)
            .executeTakeFirst()

          if (!result || Number(result.numUpdatedRows) === 0) {
            throw new Error('Competition not found')
          }

          return true
        } catch (error) {
          console.error('Error soft deleting competition:', error)
          throw new Error('Failed to delete competition')
        }
      },
    })
  },
})
