import { extendType, nonNull, stringArg, booleanArg } from 'nexus'
import { Score } from '../types'
import getKysely from '../../src/db'

export const CreateScore = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createScore', {
      type: Score,
      args: {
        value: nonNull(stringArg()),
        laneId: nonNull(stringArg()),
        isCompleted: nonNull(booleanArg()),
        scorecard: stringArg(),
        note: stringArg(),
      },
      resolve: async (_parent, { value, laneId, isCompleted, scorecard, note }, ctx) => {
        const pg = getKysely()
        const lane = await pg
          .selectFrom('Lane')
          .selectAll()
          .where('id', '=', laneId)
          .executeTakeFirst()

        if (!lane) {
          throw new Error('Lane not found')
        }

        const heat = await pg
          .selectFrom('Heat')
          .selectAll()
          .where('id', '=', lane.heatId)
          .executeTakeFirst()

        if (!heat) {
          throw new Error('Heat not found')
        }

        const newScore = await pg
          .insertInto('Score')
          .values({
            value,
            entryId: lane.entryId,
            workoutId: heat.workoutId,
            isCompleted,
            scorecard,
            note,
          })
          .returningAll()
          .executeTakeFirstOrThrow()

        return newScore
      },
    })
  },
})
