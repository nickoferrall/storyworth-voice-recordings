import { Selectable } from 'kysely'
import { Heat, Workout, ScoreSetting, TicketType } from '../../../src/generated/database'
import getKysely from '../../../src/db'
import dayjs from 'dayjs'
import { isHeatFull } from '../../../utils/isHeatFull'
import { updateSubsequentHeatTimes } from '../../../utils/updateSubsequentHeatTimes'
import { Context } from '../../context'

type Props = {
  selectedHeatId: string | null
  heats: Selectable<Heat>[]
  ticketType: Selectable<TicketType>
  entryId: string
  scoreSetting: Selectable<ScoreSetting>
  workouts: Selectable<Workout>[]
  context: Context
}

export const addRegistrantToHeat = async (props: Props) => {
  const {
    selectedHeatId,
    heats,
    ticketType,
    entryId,
    scoreSetting,
    workouts,
    context: ctx,
  } = props
  const { id: ticketTypeId, teamSize, isVolunteer } = ticketType
  if (isVolunteer) return
  const pg = getKysely()

  if (selectedHeatId) {
    const heat = heats.find((heat) => heat.id === selectedHeatId)
    if (!heat) {
      throw new Error('Invalid heat selection')
    }

    const heatIsFull = await isHeatFull(heat, scoreSetting, teamSize, ctx)
    if (heatIsFull) {
      throw new Error('Selected heat is full')
    }
    const lanesInSelectedHeat = await ctx.loaders.laneByHeatIdLoader.load(heat.id)

    // Insert the user into the selected heat
    await pg
      .insertInto('Lane')
      .values({
        entryId,
        heatId: selectedHeatId,
        number: lanesInSelectedHeat.length + 1,
      })
      .execute()
  } else {
    // If no heat was selected, proceed with assigning the user to available heats for each workout
    await Promise.all(
      workouts.map(async (workout) => {
        // Query available heats that match the ticketTypeId using the joiner table HeatTicketTypes
        const availableHeatsByWorkout = await pg
          .selectFrom('Heat')
          .innerJoin('HeatTicketTypes', 'HeatTicketTypes.heatId', 'Heat.id')
          .selectAll('Heat')
          .where('Heat.workoutId', '=', workout.id)
          .where('HeatTicketTypes.ticketTypeId', '=', ticketTypeId)
          .execute()

        const heatFullChecks = await Promise.all(
          availableHeatsByWorkout.map((heat) =>
            isHeatFull(heat, scoreSetting, teamSize, ctx),
          ),
        )

        let selectedHeat =
          availableHeatsByWorkout[heatFullChecks.findIndex((isFull) => !isFull)]

        if (!selectedHeat) {
          // Create a new heat for this workout
          const latestHeat = heats
            .filter(
              (heat) =>
                heat.workoutId === workout.id &&
                availableHeatsByWorkout.some((h) => h.id === heat.id),
            )
            .sort((a, b) => dayjs(b.startTime).unix() - dayjs(a.startTime).unix())[0]

          const newStartTime = latestHeat
            ? dayjs(latestHeat.startTime).add(
                scoreSetting.heatsEveryXMinutes ?? 30,
                'minutes',
              )
            : dayjs().startOf('day').add(9, 'hours') // Default to 9:00 AM if no heats exist

          const [newHeat] = await pg
            .insertInto('Heat')
            .values({
              workoutId: workout.id,
              startTime: newStartTime.toDate(),
              maxLimitPerHeat: scoreSetting.maxLimitPerHeat,
            })
            .returningAll()
            .execute()

          // Add the corresponding ticketTypeId to the HeatTicketTypes joiner table
          await pg
            .insertInto('HeatTicketTypes')
            .values({
              heatId: newHeat.id,
              ticketTypeId: ticketTypeId,
            })
            .execute()

          selectedHeat = newHeat

          // Update subsequent heat times without awaiting
          updateSubsequentHeatTimes(
            workout.competitionId,
            newStartTime.toDate(),
            ctx,
          ).catch((error) => {
            console.error('Error updating subsequent heat times:', error)
          })
        }

        const lanesInSelectedHeat = await ctx.loaders.laneByHeatIdLoader.load(
          selectedHeat.id,
        )
        await pg
          .insertInto('Lane')
          .values({
            entryId,
            heatId: selectedHeat.id,
            number: lanesInSelectedHeat.length + 1,
          })
          .execute()
      }),
    )
  }
}

export default addRegistrantToHeat
