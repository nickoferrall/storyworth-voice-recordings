import { extendType, nonNull, stringArg, booleanArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdateScoreById = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateScoreById', {
      type: 'Score',
      args: {
        id: nonNull(stringArg()),
        value: nonNull(stringArg()),
        isCompleted: nonNull(booleanArg()),
        scorecard: stringArg(),
        note: stringArg(),
      },
      resolve: async (_parent, { id, value, isCompleted, scorecard, note }, ctx) => {
        const pg = getKysely()

        const updatedScore = await pg
          .updateTable('Score')
          .set({
            value,
            isCompleted,
            scorecard,
            note,
          })
          .where('id', '=', id)
          .returningAll()
          .executeTakeFirst()

        if (!updatedScore) {
          throw new Error('Score not found or could not be updated')
        }

        return updatedScore
      },
    })
  },
})
