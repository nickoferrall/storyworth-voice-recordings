import { nanoid } from 'nanoid'

export const getWorkoutsToInsert = (
  numberOfWorkouts: number,
  competitionId: string,
  competitionStartDateTime: Date,
) => {
  const workouts = [
    {
      name: 'CINDY',
      description: 'AMRAP 20 minutes: 5 Pull-ups, 10 Push-ups, 15 Air Squats',
      timeCap: 20,
    },
    {
      name: 'FRAN',
      description: '21-15-9 Thrusters 42.5kg (M) / 30kg (F), Pull-ups',
      timeCap: 15,
    },
    {
      name: 'HELEN',
      description: '3 Rounds: 400m Run, 21 Kettlebell Swings, 12 Pull-ups',
      timeCap: 15,
    },
    {
      name: 'GRACE',
      description: '30 Clean and Jerks for Time (60kg/40kg)',
      timeCap: 10,
    },
    {
      name: 'ISABEL',
      description: '30 Snatches for Time (60kg/40kg)',
      timeCap: 10,
    },
    {
      name: 'KAREN',
      description: '150 Wall Balls for Time (9kg/6kg)',
      timeCap: 12,
    },
    {
      name: 'JACKIE',
      description: '1000m Row, 50 Thrusters (20kg), 30 Pull-ups',
      timeCap: 15,
    },
    {
      name: 'DIANE',
      description: '21-15-9 Deadlifts (102kg/70kg), Handstand Push-ups',
      timeCap: 12,
    },
    {
      name: 'ELIZABETH',
      description: '21-15-9 Cleans (60kg/40kg), Ring Dips',
      timeCap: 15,
    },
    {
      name: 'MURPH',
      description: '1 Mile Run, 100 Pull-ups, 200 Push-ups, 300 Air Squats, 1 Mile Run',
      timeCap: 45,
    },
  ]

  const releaseDate = new Date(competitionStartDateTime)
  releaseDate.setDate(releaseDate.getDate() - 1)

  return workouts.slice(0, numberOfWorkouts).map(
    (workout) =>
      ({
        name: workout.name,
        description: workout.description,
        releaseDateTime: releaseDate,
        competitionId,
        scoreType: 'TIME_LESS_IS_BETTER',
        unitOfMeasurement: 'MINUTES',
        location: 'Competition Floor',
        includeStandardsVideo: false,
      }) as const,
  )
}
