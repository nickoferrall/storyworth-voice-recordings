import { extendType, nonNull, list, inputObjectType } from 'nexus'
import getKysely from '../../src/db'

const UpdateHeatLimitsInput = inputObjectType({
  name: 'UpdateHeatLimitsInput',
  definition(t) {
    t.nonNull.string('heatId')
    t.nonNull.int('maxEntries')
  },
})

export const UpdateHeatLimits = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.list.nonNull.field('updateHeatLimits', {
      type: 'Heat',
      args: {
        input: nonNull(list(nonNull(UpdateHeatLimitsInput))),
      },
      resolve: async (_parent, { input }, ctx) => {
        console.log('🚀 ~ input:', input)
        const pg = getKysely()

        const updatedHeats = await pg.transaction().execute(async (trx) => {
          const results = []

          for (const { heatId, maxEntries } of input) {
            const updatedHeat = await trx
              .updateTable('Heat')
              .set({
                maxLimitPerHeat: maxEntries,
              })
              .where('id', '=', heatId)
              .returningAll()
              .executeTakeFirst()

            console.log('🚀 ~ updatedHeat:', updatedHeat)
            if (updatedHeat) {
              results.push(updatedHeat)
            }
          }

          return results
        })

        return updatedHeats
      },
    })
  },
})
