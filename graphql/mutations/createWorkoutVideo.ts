import { mutationField, nonNull, stringArg, intArg } from 'nexus'
import getKysely from '../../src/db'
import withAuth from '../../utils/withAuth'

export const CreateWorkoutVideo = mutationField('createWorkoutVideo', {
  type: 'WorkoutVideo',
  args: {
    workoutId: nonNull(stringArg()),
    title: nonNull(stringArg()),
    description: stringArg(),
    url: nonNull(stringArg()),
    orderIndex: intArg(),
  },
  resolve: withAuth(
    async (_, { workoutId, title, description, url, orderIndex }, ctx) => {
      const pg = getKysely()

      // Verify user has access to this workout's competition
      const workout = await ctx.loaders.workoutLoader.load(workoutId)
      if (!workout) {
        throw new Error('Workout not found')
      }

      const competition = await ctx.loaders.competitionLoader.load(workout.competitionId)
      if (!competition) {
        throw new Error('Competition not found')
      }

      // Check if user is a creator of this competition
      const creators = await pg
        .selectFrom('CompetitionCreator')
        .where('competitionId', '=', competition.id)
        .where('userId', '=', ctx.user.id)
        .selectAll()
        .execute()

      if (creators.length === 0) {
        throw new Error('You do not have permission to add videos to this workout')
      }

      // If no orderIndex provided, set it to be last
      let finalOrderIndex = orderIndex
      if (finalOrderIndex === null || finalOrderIndex === undefined) {
        const existingVideos = await ctx.loaders.videosByWorkoutIdLoader.load(workoutId)
        finalOrderIndex = existingVideos.length
      }

      const video = await pg
        .insertInto('Video')
        .values({
          workoutId,
          title,
          description,
          url,
          orderIndex: finalOrderIndex,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      return video
    },
  ),
})
