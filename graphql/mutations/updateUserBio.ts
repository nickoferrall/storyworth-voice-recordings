import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdateUserBio = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateUserBio', {
      type: 'User',
      args: {
        bio: nonNull(stringArg()),
      },
      resolve: async (_parent, { bio }, ctx) => {
        if (!ctx.user) {
          throw new Error('Not authenticated')
        }

        const pg = getKysely()

        const updatedUser = await pg
          .updateTable('UserProfile')
          .set({
            bio,
            updatedAt: new Date(),
          })
          .where('id', '=', ctx.user.id)
          .returningAll()
          .executeTakeFirstOrThrow()

        return updatedUser
      },
    })
  },
})
