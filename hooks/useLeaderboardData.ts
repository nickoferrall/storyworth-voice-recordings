import { useMemo } from 'react'
import { upperFirst } from '../lib/upperFirst'
import { Unit, ScoreType } from '../src/generated/graphql'

export type Workout = {
  id: string
  name: string
  unitOfMeasurement: Unit
  scoreType: ScoreType
}

export type LeaderboardEntry = {
  id: string
  name: string
  ticketTypeId: string
  ticketTypeName: string
  overallRank: number
  categoryRank: number
  totalScore?: number
  workoutsCompleted: number
  isVolunteer: boolean
  scores: {
    workoutId: string
    repsOrTime: string
    scoreType: ScoreType
    isCompleted?: boolean // New field from database
  }[]
  teamMembers?: string[]
  categoryTotalScore?: number
  overallTotalScore?: number
}

type WorkoutRankings = Record<string, Record<string, { entryId: string; rank: number }[]>>

const parseValue = (value: string, unitOfMeasurement: Unit) => {
  if (unitOfMeasurement === Unit.Minutes || unitOfMeasurement === Unit.Seconds) {
    if (value.includes(':')) {
      const timeParts = value.split(':').map(parseFloat)
      if (timeParts.length === 2) {
        const [minutes, seconds] = timeParts
        return minutes * 60 + seconds
      } else if (timeParts.length === 3) {
        const [hours, minutes, seconds] = timeParts
        return hours * 3600 + minutes * 60 + seconds
      }
    }
    return parseFloat(value)
  }
  return parseFloat(value)
}

// No more complex parsing needed! 🎉

export function useLeaderboardData(rawEntries: LeaderboardEntry[], workouts: Workout[]) {
  const nonVolunteerEntries = useMemo(
    () => rawEntries.filter((entry) => !entry.isVolunteer),
    [rawEntries],
  )

  const ticketTypes = useMemo(() => {
    const types = new Set(
      nonVolunteerEntries.map((entry) => upperFirst(entry.ticketTypeName)),
    )
    return ['All', ...Array.from(types)]
  }, [nonVolunteerEntries])

  const workoutRankings = useMemo<WorkoutRankings>(() => {
    const rankings: WorkoutRankings = {}

    for (const ticketTypeName of ticketTypes) {
      rankings[ticketTypeName] = {}

      const entriesInTicketType =
        ticketTypeName === 'All'
          ? nonVolunteerEntries
          : nonVolunteerEntries.filter(
              (entry) => upperFirst(entry.ticketTypeName) === ticketTypeName,
            )

      for (const workout of workouts) {
        const entriesWithScore = entriesInTicketType.filter((entry) =>
          entry.scores.some((s) => s.workoutId === workout.id && s.repsOrTime !== ''),
        )

        const sortedEntries = entriesWithScore.slice().sort((a, b) => {
          const aScore = a.scores.find((s) => s.workoutId === workout.id)!
          const bScore = b.scores.find((s) => s.workoutId === workout.id)!

          if (workout.scoreType === 'REPS_OR_TIME_COMPLETION_BASED') {
            const aCompleted = aScore.isCompleted || false
            const bCompleted = bScore.isCompleted || false
            const aValue = parseValue(aScore.repsOrTime, workout.unitOfMeasurement)
            const bValue = parseValue(bScore.repsOrTime, workout.unitOfMeasurement)

            // Completed always above incomplete
            if (aCompleted && !bCompleted) return -1
            if (!aCompleted && bCompleted) return 1

            // Both completed - sort by time (lower is better)
            if (aCompleted && bCompleted) {
              return aValue - bValue
            }

            // Both incomplete - sort by reps (higher is better)
            if (!aCompleted && !bCompleted) {
              return bValue - aValue
            }

            return 0
          } else {
            const aValue = parseValue(aScore.repsOrTime, workout.unitOfMeasurement)
            const bValue = parseValue(bScore.repsOrTime, workout.unitOfMeasurement)

            switch (workout.scoreType) {
              case ScoreType.RepsMoreIsBetter:
              case ScoreType.WeightMoreIsBetter:
              case ScoreType.TimeMoreIsBetter:
                return bValue - aValue
              case ScoreType.RepsLessIsBetter:
              case ScoreType.WeightLessIsBetter:
              case ScoreType.TimeLessIsBetter:
                return aValue - bValue
              default:
                return 0
            }
          }
        })

        let currentRank = 1
        let currentScore: number | null = null
        let tiedEntries = 0

        rankings[ticketTypeName][workout.id] = sortedEntries.map((entry, index) => {
          const score = parseValue(
            entry.scores.find((s) => s.workoutId === workout.id)!.repsOrTime,
            workout.unitOfMeasurement,
          )

          if (score !== currentScore) {
            currentRank += tiedEntries
            currentScore = score
            tiedEntries = 1
          } else {
            tiedEntries++
          }

          return {
            entryId: entry.id,
            rank: currentRank,
          }
        })
      }
    }

    return rankings
  }, [nonVolunteerEntries, workouts, ticketTypes])

  const entries = useMemo<LeaderboardEntry[]>(() => {
    const calculateTotalScore = (entry: LeaderboardEntry, ticketType: string) => {
      let totalRank = 0
      let workoutsCompleted = 0

      for (const workout of workouts) {
        const ranking = workoutRankings[ticketType][workout.id]
        const participantScore = entry.scores.find((s) => s.workoutId === workout.id)
        const participantRank = ranking.find((r) => r.entryId === entry.id)

        if (participantScore && participantScore.repsOrTime !== '' && participantRank) {
          totalRank += participantRank.rank
          workoutsCompleted++
        } else {
          totalRank += ranking.length + 1
        }
      }

      return { totalScore: totalRank, workoutsCompleted }
    }

    const sortEntries = (entries: LeaderboardEntry[]) => {
      return entries.slice().sort((a, b) => {
        if ((a.totalScore ?? 0) !== (b.totalScore ?? 0)) {
          return (a.totalScore ?? 0) - (b.totalScore ?? 0)
        }
        if (a.workoutsCompleted !== b.workoutsCompleted) {
          return b.workoutsCompleted - a.workoutsCompleted
        }
        return 0
      })
    }

    const entriesByTicketType = nonVolunteerEntries.reduce(
      (acc, entry) => {
        if (!acc[entry.ticketTypeName]) {
          acc[entry.ticketTypeName] = []
        }
        acc[entry.ticketTypeName].push({
          ...entry,
          categoryTotalScore: 0,
          overallTotalScore: 0,
        })
        return acc
      },
      {} as Record<string, LeaderboardEntry[]>,
    )

    const allEntries: LeaderboardEntry[] = []

    Object.entries(entriesByTicketType).forEach(([ticketType, categoryEntries]) => {
      categoryEntries.forEach((entry) => {
        const { totalScore, workoutsCompleted } = calculateTotalScore(
          entry,
          upperFirst(ticketType),
        )
        entry.categoryTotalScore = totalScore
        entry.workoutsCompleted = workoutsCompleted
      })

      const sortedEntries = sortEntries(
        categoryEntries.map((entry) => ({
          ...entry,
          totalScore: entry.categoryTotalScore,
        })),
      )

      let currentRank = 1
      let currentScore: number | null = null
      let tiedEntries = 0

      sortedEntries.forEach((entry) => {
        if ((entry.totalScore ?? 0) !== (currentScore ?? 0)) {
          currentRank += tiedEntries
          currentScore = entry.totalScore ?? 0
          tiedEntries = 1
        } else {
          tiedEntries++
        }
        entry.categoryRank = currentRank
      })

      allEntries.push(...sortedEntries)
    })

    allEntries.forEach((entry) => {
      const { totalScore, workoutsCompleted } = calculateTotalScore(entry, 'All')
      entry.overallTotalScore = totalScore
    })

    const sortedAllEntries = sortEntries(
      allEntries.map((entry) => ({
        ...entry,
        totalScore: entry.overallTotalScore,
      })),
    )

    let currentRank = 1
    let currentScore: number | null = null
    let tiedEntries = 0

    sortedAllEntries.forEach((entry) => {
      if ((entry.totalScore ?? 0) !== (currentScore ?? 0)) {
        currentRank += tiedEntries
        currentScore = entry.totalScore ?? 0
        tiedEntries = 1
      } else {
        tiedEntries++
      }
      const originalEntry = allEntries.find((e) => e.id === entry.id)
      if (originalEntry) {
        originalEntry.overallRank = currentRank
      }
    })

    return allEntries
  }, [nonVolunteerEntries, workouts, workoutRankings, ticketTypes])

  return { entries, ticketTypes, workoutRankings }
}
