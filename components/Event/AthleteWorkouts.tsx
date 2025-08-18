import React from 'react'
import useCompetitionId from '../../hooks/useCompetitionId'
import { useGetWorkoutsByCompetitionIdQuery } from '../../src/generated/graphql'
import AthleteWorkoutItem from './AthleteWorkoutItem'
import dayjs from 'dayjs'
import { formatHumanReadableDate } from '../../utils/makeDateReadable'

const Workouts = () => {
 const competitionId = useCompetitionId()
 const { data, loading } = useGetWorkoutsByCompetitionIdQuery({
  variables: {
   competitionId,
  },
 })

 const workouts = data?.getWorkoutsByCompetitionId
 const isReleased = workouts?.some((workout) =>
  dayjs().isAfter(dayjs(workout.releaseDateTime)),
 )

 const releaseDate = workouts?.[0]?.releaseDateTime
 const readableReleaseDate = releaseDate && formatHumanReadableDate(releaseDate)

 if (!loading && !workouts?.length) return null
 return (
  <div>
   <div>
    <h2 className="text-xl font-bold font-montserrat text-white not-prose pb-2 pt-6">
     {workouts?.length && workouts?.length > 1 ? 'Workouts' : 'Workout'}
    </h2>
    <hr className="mb-2 border-gray-200 w-full" />
   </div>
   <div className="overflow-y-auto">
    {isReleased ? (
     workouts?.map((workout) => (
      <AthleteWorkoutItem key={workout.id} workout={workout} />
     ))
    ) : (
     <p className="text-base">
      The workouts will be released on {readableReleaseDate}
     </p>
    )}
   </div>
  </div>
 )
}

export default Workouts
