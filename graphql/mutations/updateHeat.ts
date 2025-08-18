import { extendType, nonNull, stringArg, arg, list, intArg } from 'nexus'
import { DateTime } from '../types'
import getKysely from '../../src/db'

export const UpdateHeat = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateHeat', {
      type: 'Heat',
      args: {
        id: nonNull(stringArg()),
        startTime: arg({ type: DateTime }),
        ticketTypeIds: list(nonNull(stringArg())),
        maxLimitPerHeat: intArg(),
      },
      resolve: async (
        _parent,
        { id, startTime, ticketTypeIds, maxLimitPerHeat },
        ctx,
      ) => {
        try {
          const pg = getKysely()

          await pg.transaction().execute(async (trx) => {
            // If we're updating maxLimitPerHeat, we need to update all heats with the same name
            if (maxLimitPerHeat !== undefined) {
              // First get the current heat to find its name
              const currentHeat = await trx
                .selectFrom('Heat')
                .where('id', '=', id)
                .selectAll()
                .executeTakeFirst()

              if (currentHeat) {
                // Get all heats from the same competition
                const workout = await ctx.loaders.workoutLoader.load(
                  currentHeat.workoutId,
                )
                if (!workout) {
                  throw new Error('Workout not found')
                }

                // Get all workouts in the competition
                const workouts = await ctx.loaders.workoutsByCompetitionIdLoader.load(
                  workout.competitionId,
                )

                // For each workout, get its heats and update the one with the same position
                for (const w of workouts) {
                  const workoutHeats = await ctx.loaders.heatsByWorkoutIdLoader.load(w.id)
                  const currentHeatIndex = workoutHeats.findIndex((h) => h.id === id)

                  if (currentHeatIndex !== -1) {
                    // Found our reference heat, now update all heats at this same index
                    for (const w2 of workouts) {
                      const heatsToUpdate = await ctx.loaders.heatsByWorkoutIdLoader.load(
                        w2.id,
                      )
                      const matchingHeat = heatsToUpdate[currentHeatIndex]
                      console.log('🚀 ~ matchingHeat:', matchingHeat)
                      if (matchingHeat) {
                        await trx
                          .updateTable('Heat')
                          .set({
                            maxLimitPerHeat: maxLimitPerHeat as number,
                          })
                          .where('id', '=', matchingHeat.id)
                          .execute()
                      }
                    }
                    break // We found our reference heat, no need to continue the outer loop
                  }
                }
              }
            }

            // Handle other updates (startTime and ticketTypes) for just this heat
            if (startTime !== undefined) {
              await trx
                .updateTable('Heat')
                .set({ startTime })
                .where('id', '=', id)
                .execute()
            }

            // Update ticket type associations if provided
            if (ticketTypeIds !== undefined) {
              // Delete existing associations
              await trx.deleteFrom('HeatTicketTypes').where('heatId', '=', id).execute()

              // Insert new associations
              if (ticketTypeIds && ticketTypeIds.length > 0) {
                await trx
                  .insertInto('HeatTicketTypes')
                  .values(
                    ticketTypeIds.map((ticketTypeId) => ({
                      heatId: id,
                      ticketTypeId,
                    })),
                  )
                  .execute()
              }
            }
          })

          // Fetch and return the updated heat
          const updatedHeat = await pg
            .selectFrom('Heat')
            .where('id', '=', id)
            .selectAll()
            .executeTakeFirstOrThrow()

          return updatedHeat as any
        } catch (error: any) {
          console.error('Error updating heat:', error)
          throw new Error(error.message || 'Error updating heat')
        }
      },
    })
  },
})
