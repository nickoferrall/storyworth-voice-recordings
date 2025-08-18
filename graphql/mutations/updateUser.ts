import { extendType, stringArg, nullable } from 'nexus'
import getKysely from '../../src/db'

export const UpdateUserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateUser', {
      type: 'User',
      args: {
        firstName: nullable(stringArg()),
        lastName: nullable(stringArg()),
      },
      resolve: async (_parent, { firstName, lastName }, ctx) => {
        if (!ctx.user) {
          throw new Error('Not authenticated')
        }

        const pg = getKysely()

        const updatedUser = await pg
          .updateTable('UserProfile')
          .set({
            firstName: firstName || undefined,
            lastName: lastName || undefined,
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
