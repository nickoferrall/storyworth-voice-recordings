import { Insertable, Selectable } from 'kysely'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  Competition,
  Heat,
  ScoreSetting,
  TicketType,
  Workout,
} from '../../../src/generated/database'

dayjs.extend(utc)
dayjs.extend(timezone)

export const generateHeats = async (
  workouts: Selectable<Workout>[],
  ticketTypes: Selectable<TicketType>[],
  scoreSetting: Selectable<ScoreSetting>,
  competition: Selectable<Competition>,
  firstHeatStartTime: Date,
  entryCounts: Record<string, number>,
  ticketTypeOrder: string[],
  trx: any,
) => {
  const heats: Insertable<Heat>[] = []
  const heatTicketTypes: Insertable<{ heatId: string; ticketTypeId: string }>[] = []
  const timezone = competition.timezone ?? 'Europe/London'

  for (const workout of workouts) {
    const existingWorkoutHeats = await trx
      .selectFrom('Heat')
      .where('workoutId', '=', workout.id)
      .selectAll()
      .execute()

    let currentStartTime = dayjs(firstHeatStartTime).tz(timezone)
    if (existingWorkoutHeats.length > 0) {
      const latestHeatTime = existingWorkoutHeats.reduce((latest, heat) => {
        const heatTime = dayjs(heat.startTime).tz(timezone)
        return heatTime.isAfter(latest) ? heatTime : latest
      }, currentStartTime)

      currentStartTime = latestHeatTime.add(
        scoreSetting.heatsEveryXMinutes || 0,
        'minute',
      )
    }

    const heatsForWorkout: Insertable<Heat>[] = []
    const activeTicketTypes = ticketTypeOrder.filter((id) =>
      ticketTypes.some((tt) => tt.id === id),
    )

    for (const ticketTypeId of activeTicketTypes) {
      const ticketType = ticketTypes.find((tt) => tt.id === ticketTypeId)
      if (!ticketType) continue

      const entriesForTicketType = entryCounts[ticketType.id] || 0
      const teamSize = ticketType.teamSize || 1
      const maxLimitPerHeat = scoreSetting.maxLimitPerHeat

      let heatsNeeded =
        scoreSetting.heatLimitType === 'ATHLETES'
          ? Math.ceil((entriesForTicketType * teamSize) / maxLimitPerHeat)
          : Math.ceil(entriesForTicketType / maxLimitPerHeat)

      heatsNeeded = Math.max(heatsNeeded, 1)

      for (let i = 0; i < heatsNeeded; i++) {
        if (scoreSetting.heatsEveryXMinutes) {
          currentStartTime = currentStartTime.add(
            scoreSetting.heatsEveryXMinutes,
            'minute',
          )
        }
        const newHeatId = uuidv4()
        heatsForWorkout.push({
          id: newHeatId,
          workoutId: workout.id,
          maxLimitPerHeat,
          startTime: currentStartTime.toDate(),
        })
        heatTicketTypes.push({ heatId: newHeatId, ticketTypeId })
      }
    }

    heats.push(...heatsForWorkout)
  }

  return { heats, heatTicketTypes }
}
