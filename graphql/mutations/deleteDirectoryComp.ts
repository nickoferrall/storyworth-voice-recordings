import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { requireSuperUser } from './helpers/authHelpers'

export const DeleteDirectoryComp = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('deleteDirectoryComp', {
      type: 'Boolean',
      description:
        'Deletes a DirectoryComp and its associated categories. SUPER USER ONLY.',
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_root, { id }, ctx) => {
        requireSuperUser(ctx)

        const pg = getKysely()

        // Delete categories first due to foreign key constraint
        await pg.deleteFrom('Category').where('directoryCompId', '=', id).execute()

        // Then delete the directory comp
        await pg.deleteFrom('DirectoryComp').where('id', '=', id).execute()
        return true
      },
    })
  },
})
