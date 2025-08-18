import { arg, extendType, inputObjectType, nonNull, list } from 'nexus'
import getKysely from '../../src/db'
import { nanoid } from 'nanoid'

export const WorkoutVideoInput = inputObjectType({
  name: 'WorkoutVideoInput',
  definition(t) {
    t.nonNull.string('title')
    t.string('description')
    t.nonNull.string('url')
    t.int('orderIndex')
  },
})

export const CreateWorkoutInput = inputObjectType({
  name: 'CreateWorkoutInput',
  definition(t) {
    t.nonNull.string('name')
    t.nonNull.string('description')
    t.nonNull.field('releaseDateTime', { type: 'DateTime' })
    t.nonNull.string('competitionId')
    t.nonNull.string('location')
    t.nonNull.field('scoreType', { type: 'ScoreType' })
    t.nonNull.field('unitOfMeasurement', { type: 'Unit' })
    t.int('timeCap')
    t.boolean('includeStandardsVideo')
    t.list.field('videos', { type: WorkoutVideoInput })
  },
})

export const CreateWorkout = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createWorkout', {
      type: 'Workout',
      args: {
        input: nonNull(
          arg({
            type: CreateWorkoutInput,
          }),
        ),
      },
      resolve: async (_parent, { input }, ctx) => {
        const pg = getKysely()

        try {
          const result = await pg.transaction().execute(async (trx) => {
            // Extract videos from input
            const inputWithVideos = input as any
            const videos = inputWithVideos.videos || []

            // Create workout data without videos
            const workoutData = {
              name: input.name,
              description: input.description,
              releaseDateTime: input.releaseDateTime,
              competitionId: input.competitionId,
              location: input.location,
              scoreType: input.scoreType,
              unitOfMeasurement: input.unitOfMeasurement,
              timeCap: input.timeCap,
              includeStandardsVideo: input.includeStandardsVideo || false,
            }

            const newWorkout = await trx
              .insertInto('Workout')
              .values(workoutData)
              .returningAll()
              .executeTakeFirstOrThrow()

            // Create videos if provided
            if (videos && videos.length > 0) {
              const videosToInsert = videos.map((video: any, index: number) => ({
                workoutId: newWorkout.id,
                title: video.title,
                description: video.description || null,
                url: video.url,
                orderIndex: video.orderIndex ?? index,
              }))

              await trx.insertInto('Video').values(videosToInsert).execute()
            }

            const ticketTypes = await trx
              .selectFrom('TicketType')
              .select('id')
              .where('competitionId', '=', input.competitionId)
              .where('isVolunteer', '=', false)
              .execute()

            // First create the heats
            const heatsToInsert = ticketTypes.map(() => ({
              workoutId: newWorkout.id,
              startTime: new Date(input.releaseDateTime),
              maxLimitPerHeat: 6,
            }))

            const insertedHeats = await trx
              .insertInto('Heat')
              .values(heatsToInsert)
              .returningAll()
              .execute()

            // Then create the heat-ticket type associations
            const heatTicketTypes = insertedHeats.flatMap((heat) =>
              ticketTypes.map((ticketType) => ({
                heatId: heat.id,
                ticketTypeId: ticketType.id,
              })),
            )

            await trx.insertInto('HeatTicketTypes').values(heatTicketTypes).execute()

            return newWorkout
          })

          return result
        } catch (error) {
          console.error('Error creating workout and heats:', error)
          throw new Error('Error creating workout and heats')
        }
      },
    })
  },
})
