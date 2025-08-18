import { objectType } from 'nexus'
import getKysely from '../../src/db'

export const TeamMember = objectType({
  name: 'TeamMember',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.string('teamId')
    t.nonNull.field('team', {
      type: 'Team',
      resolve: async (parent, _args, ctx) => {
        const pg = getKysely()
        const team = await pg
          .selectFrom('Team')
          .where('id', '=', parent.teamId)
          .selectAll()
          .executeTakeFirstOrThrow()
        return team
      },
    })
    t.nonNull.boolean('isCaptain', {
      resolve: async (parent) => {
        const pg = getKysely()
        const team = await pg
          .selectFrom('Team')
          .where('id', '=', parent.teamId)
          .select('teamCaptainId')
          .executeTakeFirstOrThrow()
        return team.teamCaptainId === parent.userId
      },
    })
    t.string('userId')
    t.field('user', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        // TODO fix type
        return (
          parent.userId ? ctx.loaders.userByIdLoader.load(parent.userId) : null
        ) as any
      },
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})
