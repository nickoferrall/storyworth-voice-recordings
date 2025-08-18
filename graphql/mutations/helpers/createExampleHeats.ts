import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import getKysely from '../../../src/db'
import { Heat } from '../../../src/generated/database'
import { Insertable } from 'kysely'

type CreateHeatsAndLanesProps = {
  workouts: { id: string }[] // Array of workout objects with their IDs
  startDateTime: Date
  ticketTypeId: string
}

export const createHeats = async ({
  workouts,
  startDateTime,
  ticketTypeId,
}: CreateHeatsAndLanesProps) => {
  const pg = getKysely()
  let currentStartTime = dayjs(startDateTime)
  const heatsToInsert: Insertable<Heat>[] = []

  // Process workouts sequentially
  for (const workout of workouts) {
    // Create 2 heats for each workout
    for (let i = 0; i < 2; i++) {
      heatsToInsert.push({
        id: uuidv4(),
        startTime: currentStartTime.toDate(),
        workoutId: workout.id,
        maxLimitPerHeat: 6,
      })

      currentStartTime = currentStartTime.add(30, 'minutes')
    }

    currentStartTime = currentStartTime.add(30, 'minutes')
  }

  // Insert the new Heat records
  const insertedHeats = await pg
    .insertInto('Heat')
    .values(heatsToInsert)
    .returningAll()
    .execute()

  // Insert records into the HeatTicketTypes joiner table
  for (const heat of insertedHeats) {
    await pg
      .insertInto('HeatTicketTypes')
      .values({
        heatId: heat.id,
        ticketTypeId,
      })
      .execute()
  }

  return {
    heats: heatsToInsert,
  }
}
