import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UnassignAllEntries = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.boolean('unassignAllEntries', {
      args: {
        competitionId: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId }, ctx) => {
        const pg = getKysely()

        const workouts = await pg
          .selectFrom('Workout')
          .select('id')
          .where('competitionId', '=', competitionId)
          .execute()

        if (workouts.length === 0) return true

        const workoutIds = workouts.map((w) => w.id)

        const heats = await pg
          .selectFrom('Heat')
          .select('id')
          .where('workoutId', 'in', workoutIds)
          .execute()

        if (heats.length === 0) return true

        const heatIds = heats.map((h) => h.id)

        await pg.deleteFrom('Lane').where('heatId', 'in', heatIds).execute()

        return true
      },
    })
  },
})
