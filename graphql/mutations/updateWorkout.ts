import { arg, extendType, inputObjectType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'
import { sanitizeInput } from '../../utils/sanitizeInput'

// Import the WorkoutVideoInput from createWorkout
import { WorkoutVideoInput } from './createWorkout'

export const UpdateWorkoutInput = inputObjectType({
  name: 'UpdateWorkoutInput',
  definition(t) {
    t.string('name')
    t.string('description')
    t.field('releaseDateTime', { type: 'DateTime' })
    t.string('competitionId')
    t.string('location')
    t.field('scoreType', { type: 'ScoreType' })
    t.field('unitOfMeasurement', { type: 'Unit' })
    t.int('timeCap')
    t.boolean('tiebreaker')
    t.boolean('includeStandardsVideo')
    t.list.field('videos', { type: WorkoutVideoInput })
  },
})

export const UpdateWorkout = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateWorkout', {
      type: 'Workout',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(
          arg({
            type: UpdateWorkoutInput,
          }),
        ),
      },
      resolve: async (_parent, { id, input }, ctx) => {
        const pg = getKysely()

        try {
          const result = await pg.transaction().execute(async (trx) => {
            // Extract videos from input
            const inputWithVideos = input as any
            const videos = inputWithVideos.videos

            // Create workout update data without videos
            const workoutUpdateData: any = {}
            if (input.name !== null && input.name !== undefined)
              workoutUpdateData.name = input.name
            if (input.description !== null && input.description !== undefined)
              workoutUpdateData.description = input.description
            if (input.releaseDateTime !== null && input.releaseDateTime !== undefined)
              workoutUpdateData.releaseDateTime = input.releaseDateTime
            if (input.competitionId !== null && input.competitionId !== undefined)
              workoutUpdateData.competitionId = input.competitionId
            if (input.location !== null && input.location !== undefined)
              workoutUpdateData.location = input.location
            if (input.scoreType !== null && input.scoreType !== undefined)
              workoutUpdateData.scoreType = input.scoreType
            if (input.unitOfMeasurement !== null && input.unitOfMeasurement !== undefined)
              workoutUpdateData.unitOfMeasurement = input.unitOfMeasurement
            if (input.timeCap !== null && input.timeCap !== undefined)
              workoutUpdateData.timeCap = input.timeCap
            if (
              input.includeStandardsVideo !== null &&
              input.includeStandardsVideo !== undefined
            )
              workoutUpdateData.includeStandardsVideo = input.includeStandardsVideo

            // Update the workout
            const updatedWorkout = await trx
              .updateTable('Workout')
              .set(workoutUpdateData)
              .where('id', '=', id)
              .returningAll()
              .executeTakeFirstOrThrow()

            // Handle videos if provided
            if (videos !== null && videos !== undefined) {
              // Delete existing videos
              await trx.deleteFrom('Video').where('workoutId', '=', id).execute()

              // Create new videos
              if (videos.length > 0) {
                const videosToInsert = videos.map((video: any, index: number) => ({
                  workoutId: id,
                  title: video.title,
                  description: video.description || null,
                  url: video.url,
                  orderIndex: video.orderIndex ?? index,
                }))

                await trx.insertInto('Video').values(videosToInsert).execute()
              }
            }

            return updatedWorkout
          })

          return result
        } catch (error) {
          console.error('Error updating workout:', error)
          throw new Error('Error updating workout')
        }
      },
    })
  },
})
