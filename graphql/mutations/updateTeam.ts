import { extendType, nonNull, stringArg } from 'nexus'
import { Team } from '../types'
import getKysely from '../../src/db'

export const UpdateTeamMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateTeam', {
      type: Team,
      args: {
        id: nonNull(stringArg()),
        name: nonNull(stringArg()),
      },
      resolve: async (_parent, { id, name }, ctx) => {
        const pg = getKysely()

        try {
          const updatedTeam = await pg
            .updateTable('Team')
            .set({ name })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow()

          return updatedTeam
        } catch (error) {
          console.error('Error updating team:', error)
          throw new Error('Failed to update team')
        }
      },
    })
  },
})
