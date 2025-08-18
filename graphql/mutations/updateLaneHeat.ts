import { extendType, nonNull, stringArg } from 'nexus'
import getKysely from '../../src/db'

export const UpdateLaneHeat = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateLaneHeat', {
      type: 'Lane',
      args: {
        id: nonNull(stringArg()),
        heatId: nonNull(stringArg()),
      },
      resolve: async (_parent, { id, heatId }, ctx) => {
        const pg = getKysely()

        // Get the lane's current info including heat and entry details
        const currentLane = await pg
          .selectFrom('Lane')
          .innerJoin('Entry', 'Entry.id', 'Lane.entryId')
          .innerJoin('Heat', 'Heat.id', 'Lane.heatId')
          .innerJoin('Workout', 'Workout.id', 'Heat.workoutId')
          .select([
            'Lane.heatId',
            'Lane.number',
            'Entry.ticketTypeId',
            'Entry.id as entryId',
            'Workout.competitionId',
            'Heat.workoutId',
          ])
          .where('Lane.id', '=', id)
          .executeTakeFirst()

        if (!currentLane?.ticketTypeId) {
          throw new Error('Lane has no associated ticket type')
        }

        // Get target heat info to determine heat number
        const targetHeat = await pg
          .selectFrom('Heat')
          .innerJoin('Workout', 'Workout.id', 'Heat.workoutId')
          .select(['Heat.id', 'Heat.workoutId'])
          .where('Heat.id', '=', heatId)
          .executeTakeFirst()

        if (!targetHeat) {
          throw new Error('Target heat not found')
        }

        // Get all workouts in the competition
        const workouts = await pg
          .selectFrom('Workout')
          .select(['id'])
          .where('competitionId', '=', currentLane.competitionId)
          .execute()

        // Get source and target heat numbers
        const sourceHeatIndex = await getHeatIndex(pg, currentLane.heatId)
        const targetHeatIndex = await getHeatIndex(pg, heatId)

        await pg.transaction().execute(async (trx) => {
          // For each workout in the competition
          for (const workout of workouts) {
            // Get the corresponding heats for this workout
            const workoutHeats = await trx
              .selectFrom('Heat')
              .select(['id'])
              .where('workoutId', '=', workout.id)
              .orderBy('startTime', 'asc')
              .execute()

            if (workoutHeats.length <= targetHeatIndex) {
              continue // Skip if workout doesn't have enough heats
            }

            const sourceHeatId = workoutHeats[sourceHeatIndex]?.id
            const targetHeatId = workoutHeats[targetHeatIndex]?.id

            if (!sourceHeatId || !targetHeatId) continue

            // Get the lane in this workout for the same entry
            const workoutLane = await trx
              .selectFrom('Lane')
              .select(['id', 'number', 'heatId'])
              .where('entryId', '=', currentLane.entryId)
              .where('heatId', '=', sourceHeatId)
              .executeTakeFirst()

            if (!workoutLane) continue

            // Reorder lanes in the source heat
            await trx
              .updateTable('Lane')
              .set((eb) => ({
                number: eb('number', '-', 1),
              }))
              .where('heatId', '=', sourceHeatId)
              .where('number', '>', workoutLane.number)
              .execute()

            // Get max lane number in target heat
            const maxLaneNumber = await trx
              .selectFrom('Lane')
              .select(({ fn }) => fn.max('number').as('maxNumber'))
              .where('heatId', '=', targetHeatId)
              .executeTakeFirst()

            const newLaneNumber = (maxLaneNumber?.maxNumber || 0) + 1

            // Move the lane to the target heat
            await trx
              .updateTable('Lane')
              .set({
                heatId: targetHeatId,
                number: newLaneNumber,
              })
              .where('id', '=', workoutLane.id)
              .execute()

            // Add ticket type to new heat if not already present
            const heatTicketTypes = await trx
              .selectFrom('HeatTicketTypes')
              .select('ticketTypeId')
              .where('heatId', '=', targetHeatId)
              .execute()

            const currentTicketTypeIds = heatTicketTypes.map((ht) => ht.ticketTypeId)

            if (!currentTicketTypeIds.includes(currentLane.ticketTypeId)) {
              await trx
                .insertInto('HeatTicketTypes')
                .values({
                  heatId: targetHeatId,
                  ticketTypeId: currentLane.ticketTypeId,
                })
                .execute()
            }
          }
        })

        // Return the updated lane
        const updatedLane = await pg
          .selectFrom('Lane')
          .where('id', '=', id)
          .selectAll()
          .executeTakeFirstOrThrow()

        return updatedLane as any
      },
    })
  },
})

// Helper function to get the index of a heat within its workout
export const getHeatIndex = async (pg: any, heatId: string) => {
  const heat = await pg
    .selectFrom('Heat')
    .select(['id', 'workoutId'])
    .where('id', '=', heatId)
    .executeTakeFirst()

  if (!heat) throw new Error('Heat not found')

  const heats = await pg
    .selectFrom('Heat')
    .select(['id'])
    .where('workoutId', '=', heat.workoutId)
    .orderBy('startTime', 'asc')
    .execute()

  return heats.findIndex((h) => h.id === heatId) as number
}
