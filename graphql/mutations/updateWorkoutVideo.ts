import { mutationField, nonNull, stringArg, intArg } from 'nexus'
import getKysely from '../../src/db'
import withAuth from '../../utils/withAuth'

export const UpdateWorkoutVideo = mutationField('updateWorkoutVideo', {
  type: 'WorkoutVideo',
  args: {
    id: nonNull(stringArg()),
    title: stringArg(),
    description: stringArg(),
    url: stringArg(),
    orderIndex: intArg(),
  },
  resolve: withAuth(async (_, { id, title, description, url, orderIndex }, ctx) => {
    const pg = getKysely()

    // Build update object with only provided fields
    const updateData: any = {}
    if (title !== null && title !== undefined) updateData.title = title
    if (description !== null && description !== undefined)
      updateData.description = description
    if (url !== null && url !== undefined) updateData.url = url
    if (orderIndex !== null && orderIndex !== undefined)
      updateData.orderIndex = orderIndex

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields provided to update')
    }

    updateData.updatedAt = new Date()

    const video = await pg
      .updateTable('Video')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow()

    return video
  }),
})
