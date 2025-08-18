import { mutationField, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import withAuth from '../../utils/withAuth'

export const DeleteWorkoutVideo = mutationField('deleteWorkoutVideo', {
  type: 'Boolean',
  args: {
    id: nonNull(stringArg()),
  },
  resolve: withAuth(async (_, { id }, ctx) => {
    const pg = getKysely()

    const result = await pg.deleteFrom('Video').where('id', '=', id).execute()

    return result.length > 0
  }),
})
