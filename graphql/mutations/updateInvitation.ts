import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdateInvitation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateInvitation', {
      type: 'Invitation',
      args: {
        id: nonNull(stringArg()),
        email: nonNull(stringArg()),
      },
      resolve: async (_parent, { id, email }, ctx) => {
        const pg = getKysely()

        // Check if the user has permission to update the invitation
        // You may want to add additional checks here

        // Update the invitation
        const updatedInvitation = await pg
          .updateTable('Invitation')
          .set({
            email,
            updatedAt: new Date(),
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst()

        if (!updatedInvitation) {
          throw new Error('Invitation not found or could not be updated')
        }

        return updatedInvitation
      },
    })
  },
})
