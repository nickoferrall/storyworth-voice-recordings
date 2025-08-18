import { extendType, nonNull, list, inputObjectType } from 'nexus'
import { DateTime } from '../types'
import getKysely from '../../src/db'

const CreateHeatInput = inputObjectType({
  name: 'CreateHeatInput',
  definition(t) {
    t.nonNull.field('startTime', { type: DateTime })
    t.nonNull.string('workoutId')
  },
})

export const CreateHeats = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.list.nonNull.field('createHeats', {
      type: 'Heat',
      args: {
        input: nonNull(list(nonNull(CreateHeatInput))),
        competitionId: nonNull('String'),
      },
      resolve: async (_parent, { input, competitionId }, ctx) => {
        const pg = getKysely()

        const scoreSettings = await pg
          .selectFrom('ScoreSetting')
          .selectAll()
          .where('competitionId', '=', competitionId)
          .executeTakeFirstOrThrow()

        const ticketTypes = (await ctx.loaders.ticketTypesByCompetitionIdLoader.load(
          competitionId,
        )) as any
        const ticketTypeIds = ticketTypes
          .filter((tt: any) => !tt.isVolunteer)
          .map((tt: any) => tt.id)

        // Prepare the values to insert into the Heat table
        const heatValues = input.map((heat: any) => ({
          startTime: heat.startTime,
          workoutId: heat.workoutId,
          maxLimitPerHeat: scoreSettings.maxLimitPerHeat,
        }))

        // Insert the new Heat records and get the resulting heats
        const insertedHeats = await pg
          .insertInto('Heat')
          .values(heatValues)
          .returningAll()
          .execute()

        // Insert records into the HeatTicketTypes joiner table for each heat and its ticket types
        for (const heat of insertedHeats) {
          const heatTicketTypeValues = ticketTypeIds.map((ticketTypeId: string) => ({
            heatId: heat.id,
            ticketTypeId,
          }))

          await pg.insertInto('HeatTicketTypes').values(heatTicketTypeValues).execute()
        }

        return insertedHeats
      },
    })
  },
})
