import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { requireSuperUser } from './helpers/authHelpers'

export const LinkDirectoryCompToCompetition = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('linkDirectoryCompToCompetition', {
      type: 'Boolean',
      description: 'Links a DirectoryComp to a Competition. SUPER USER ONLY.',
      args: {
        directoryCompId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_root, { directoryCompId, competitionId }, ctx) => {
        requireSuperUser(ctx)

        const pg = getKysely()

        try {
          // Update DirectoryComp to link to Competition
          await pg
            .updateTable('DirectoryComp')
            .set({ competitionId })
            .where('id', '=', directoryCompId)
            .execute()

          // Update Competition to link to DirectoryComp
          await pg
            .updateTable('Competition')
            .set({ directoryCompId })
            .where('id', '=', competitionId)
            .execute()

          return true
        } catch (error) {
          console.error('Error linking DirectoryComp to Competition:', error)
          throw new Error('Failed to link DirectoryComp to Competition')
        }
      },
    })

    t.field('unlinkDirectoryCompFromCompetition', {
      type: 'Boolean',
      description: 'Unlinks a DirectoryComp from a Competition. SUPER USER ONLY.',
      args: {
        directoryCompId: nonNull(stringArg()),
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_root, { directoryCompId, competitionId }, ctx) => {
        requireSuperUser(ctx)

        const pg = getKysely()

        try {
          // Remove link from DirectoryComp
          await pg
            .updateTable('DirectoryComp')
            .set({ competitionId: null })
            .where('id', '=', directoryCompId)
            .execute()

          // Remove link from Competition
          await pg
            .updateTable('Competition')
            .set({ directoryCompId: null })
            .where('id', '=', competitionId)
            .execute()

          return true
        } catch (error) {
          console.error('Error unlinking DirectoryComp from Competition:', error)
          throw new Error('Failed to unlink DirectoryComp from Competition')
        }
      },
    })
  },
})
