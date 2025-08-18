import { Insertable, Selectable, Transaction } from 'kysely'
import { DB, Heat, ScoreSetting, Workout } from '../../../src/generated/database'

export const createNewLanes = async (
  trx: Transaction<DB>,
  entries: Array<{
    entryId: string
    ticketTypeId: string | null
    teamSize: number
  }>,
  newHeats: Selectable<Heat>[],
  scoreSetting: Selectable<ScoreSetting>,
  workouts: Selectable<Workout>[],
  ticketTypeOrder: string[],
) => {
  const lanesToInsert: Insertable<DB['Lane']>[] = []

  // Group entries by ticketTypeId according to the ticketTypeOrder
  const globalEntriesByTicketType = new Map<
    string,
    Array<{ entryId: string; ticketTypeId: string | null; teamSize: number }>
  >()
  ticketTypeOrder.forEach((ticketTypeId) => {
    globalEntriesByTicketType.set(ticketTypeId, [])
  })
  entries.forEach((entry) => {
    if (entry.ticketTypeId !== null) {
      if (!globalEntriesByTicketType.has(entry.ticketTypeId)) {
        globalEntriesByTicketType.set(entry.ticketTypeId, [])
      }
      globalEntriesByTicketType.get(entry.ticketTypeId)!.push(entry)
    }
  })

  // For each workout
  for (const workout of workouts) {
    const heatsForWorkout = newHeats
      .filter((heat) => heat.workoutId === workout.id)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) // Sort heats by startTime

    if (heatsForWorkout.length === 0) continue

    // Create a copy of entriesByTicketType for this workout
    const entriesByTicketType = new Map(
      Array.from(globalEntriesByTicketType.entries()).map(([key, value]) => [
        key,
        [...value], // Shallow copy for this workout
      ]),
    )

    // Query allowed ticket types for all heats concurrently
    const heatTicketTypeQueries = heatsForWorkout.map(async (heat) => {
      const allowedTicketTypes = await trx
        .selectFrom('HeatTicketTypes')
        .select('ticketTypeId')
        .where('heatId', '=', heat.id)
        .execute()
      return {
        heat,
        allowedTicketTypeIds: allowedTicketTypes.map((t) => t.ticketTypeId),
      }
    })

    const heatsWithTicketTypes = await Promise.all(heatTicketTypeQueries)

    // Process each heat
    for (const { heat, allowedTicketTypeIds } of heatsWithTicketTypes) {
      const heatEntries: Array<{
        entryId: string
        ticketTypeId: string | null
        teamSize: number
      }> = []
      let heatAthleteCount = 0
      const maxLimitPerHeat = heat.maxLimitPerHeat
      let laneNumber = 1

      const isHeatFull = (entryTeamSize: number) => {
        if (scoreSetting.heatLimitType === 'ATHLETES') {
          return heatAthleteCount + entryTeamSize > maxLimitPerHeat
        } else {
          return heatEntries.length >= maxLimitPerHeat
        }
      }

      // Assign entries to lanes based on allowed ticket types
      if (scoreSetting.oneTicketPerHeat) {
        const ticketTypeId = allowedTicketTypeIds?.[0]
        if (!ticketTypeId) continue

        const entriesOfType = entriesByTicketType.get(ticketTypeId) || []
        while (entriesOfType.length > 0) {
          const entry = entriesOfType[0]
          if (isHeatFull(entry.teamSize)) break

          heatEntries.push(entry)
          heatAthleteCount += entry.teamSize
          lanesToInsert.push({
            heatId: heat.id,
            entryId: entry.entryId,
            number: laneNumber++,
          })
          entriesOfType.shift()
        }
      } else {
        let ticketTypeIndex = 0

        while (true) {
          if (isHeatFull(1)) break

          const ticketTypeId = ticketTypeOrder[ticketTypeIndex % ticketTypeOrder.length]
          ticketTypeIndex++

          if (!allowedTicketTypeIds?.includes(ticketTypeId)) continue

          const entriesOfType = entriesByTicketType.get(ticketTypeId)
          if (entriesOfType && entriesOfType.length > 0) {
            const entry = entriesOfType[0]
            if (isHeatFull(entry.teamSize)) break

            heatEntries.push(entry)
            heatAthleteCount += entry.teamSize
            lanesToInsert.push({
              heatId: heat.id,
              entryId: entry.entryId,
              number: laneNumber++,
            })
            entriesOfType.shift()
          } else {
            const entriesRemaining = Array.from(entriesByTicketType.entries()).some(
              ([ttId, arr]) => allowedTicketTypeIds.includes(ttId) && arr.length > 0,
            )
            if (!entriesRemaining) break
          }
        }
      }
    }
  }

  if (lanesToInsert.length > 0) {
    try {
      const existingLaneNumbers = await trx
        .selectFrom('Lane')
        .select(['heatId', 'number'])
        .where(
          'heatId',
          'in',
          newHeats.map((h) => h.id),
        )
        .execute()

      const maxLaneByHeat = new Map<string, number>()
      existingLaneNumbers.forEach((lane) => {
        const current = maxLaneByHeat.get(lane.heatId) || 0
        maxLaneByHeat.set(lane.heatId, Math.max(current, lane.number))
      })

      lanesToInsert.forEach((lane) => {
        const currentMax = maxLaneByHeat.get(lane.heatId) || 0
        lane.number += currentMax
      })

      await trx.insertInto('Lane').values(lanesToInsert).execute()
    } catch (error) {
      console.error('Error inserting lanes:', error)
      return {
        success: false,
        error: 'Error inserting lanes',
      }
    }
  }

  return { success: true }
}
