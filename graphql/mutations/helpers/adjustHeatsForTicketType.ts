import dayjs from 'dayjs'
import getKysely from '../../../src/db'
import { Context } from '../../context'

type Props = {
  competitionId: string
  ticketTypeId: string
  maxEntries: number
  ctx: Context
}

export const adjustHeatsForTicketType = async (props: Props) => {
  const { competitionId, ticketTypeId, maxEntries, ctx } = props
  const pg = getKysely()

  // Fetch the ScoreSetting to get the heatLimitType and maxLimitPerHeat
  const scoreSetting = await pg
    .selectFrom('ScoreSetting')
    .select(['heatLimitType', 'maxLimitPerHeat', 'heatsEveryXMinutes'])
    .where('competitionId', '=', competitionId)
    .executeTakeFirst()

  if (!scoreSetting || !scoreSetting.maxLimitPerHeat) {
    throw new Error(
      'ScoreSetting not found or maxLimitPerHeat not set for the competition',
    )
  }

  // Update the existing heats query to use the joiner table
  const existingHeats = await pg
    .selectFrom('Heat')
    .innerJoin('HeatTicketTypes', 'Heat.id', 'HeatTicketTypes.heatId')
    .select(['Heat.id', 'Heat.startTime'])
    .where('HeatTicketTypes.ticketTypeId', '=', ticketTypeId)
    .execute()

  const numberOfExistingHeats = existingHeats.length
  const numberOfNewHeats = Math.ceil(maxEntries / scoreSetting.maxLimitPerHeat)

  if (numberOfNewHeats < numberOfExistingHeats) {
    const heatsToRemove = existingHeats.slice(numberOfNewHeats)

    for (const heat of heatsToRemove) {
      // Check if there are any registrations for this heat
      const registrations = await pg
        .selectFrom('Lane')
        .select(['id'])
        .where('heatId', '=', heat.id)
        .execute()

      if (registrations.length > 0) {
        throw new Error(`Cannot remove heat with registrations: ${heat.id}`)
      }

      // Delete the heat-ticket type relationship first
      await pg.deleteFrom('HeatTicketTypes').where('heatId', '=', heat.id).execute()

      // Delete the heat if no registrations
      await pg.deleteFrom('Heat').where('id', '=', heat.id).execute()
    }
  } else if (numberOfNewHeats > numberOfExistingHeats) {
    const competition = await ctx.loaders.competitionLoader.load(competitionId)
    const { startDateTime } = competition

    // Fetch workouts for the competition
    const workouts = await pg
      .selectFrom('Workout')
      .select(['id', 'name'])
      .where('competitionId', '=', competitionId)
      .orderBy('createdAt', 'asc')
      .execute()

    // Create heats and their ticket type relationships
    for (let i = numberOfExistingHeats; i < numberOfNewHeats; i++) {
      const intervals = scoreSetting.heatsEveryXMinutes
      const startTime = dayjs(startDateTime)
        .add(i * intervals, 'minute')
        .toDate()

      const workout = workouts[i % workouts.length]

      // Insert the heat first
      const newHeat = await pg
        .insertInto('Heat')
        .values({
          startTime,
          workoutId: workout.id,
          maxLimitPerHeat: scoreSetting.maxLimitPerHeat,
        })
        .returningAll()
        .executeTakeFirstOrThrow()

      // Then create the relationship
      await pg
        .insertInto('HeatTicketTypes')
        .values({
          heatId: newHeat.id,
          ticketTypeId,
        })
        .execute()
    }
  }
}
