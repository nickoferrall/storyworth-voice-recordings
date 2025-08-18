import { extendType, nonNull, inputObjectType } from 'nexus'
import { DateTime } from '../types'
import getKysely from '../../src/db'
import dayjs from 'dayjs'
import { updateSubsequentHeatTimes } from '../../utils/updateSubsequentHeatTimes'

const CreateBreakInput = inputObjectType({
  name: 'CreateBreakInput',
  definition(t) {
    t.nonNull.field('startTime', { type: DateTime })
    t.nonNull.int('duration')
    t.nonNull.string('competitionId')
  },
})

export const CreateBreak = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('createBreak', {
      args: {
        input: nonNull(CreateBreakInput),
      },
      resolve: async (_parent, { input }, ctx) => {
        const pg = getKysely()

        // Start a transaction
        return await pg.transaction().execute(async (trx) => {
          // Get all heats after the break start time
          const heatsToUpdate = await trx
            .selectFrom('Heat')
            .innerJoin('Workout', 'Heat.workoutId', 'Workout.id')
            .select(['Heat.id', 'Heat.startTime'])
            .where('Workout.competitionId', '=', input.competitionId)
            // .where('Heat.startTime', '>', input.startTime)
            .orderBy('Heat.startTime', 'asc')
            .execute()
          const heatsToUpdateTwo = await trx
            .selectFrom('Heat')
            .innerJoin('Workout', 'Heat.workoutId', 'Workout.id')
            .select(['Heat.id', 'Heat.startTime'])
            .where('Workout.competitionId', '=', input.competitionId)
            .where('Heat.startTime', '>', input.startTime)
            .orderBy('Heat.startTime', 'asc')
            .execute()

          // Update all heats' start times concurrently
          await Promise.all(
            heatsToUpdate.map((heat) => {
              const newStartTime = dayjs(heat.startTime)
                .add(input.duration, 'minutes')
                .toDate()
              return trx
                .updateTable('Heat')
                .set({ startTime: newStartTime })
                .where('id', '=', heat.id)
                .execute()
            }),
          )

          return true // Return true if the operation was successful
        })
      },
    })
  },
})
