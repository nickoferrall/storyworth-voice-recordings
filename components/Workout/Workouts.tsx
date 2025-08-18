import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import WorkoutCard from './WorkoutCard'
import { useGetWorkoutsByCompetitionIdQuery } from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import WorkoutModal from './WorkoutModal'
import { Button } from '../../src/components/ui/button'

const Workouts = () => {
 const competitionId = useCompetitionId()
 const { data, loading, refetch } = useGetWorkoutsByCompetitionIdQuery({
  variables: {
   competitionId,
  },
 })
 const [showModal, setShowModal] = useState(false)

 const handleClick = () => {
  setShowModal(true)
 }

 const handleClose = () => {
  setShowModal(false)
 }

 const workouts = data?.getWorkoutsByCompetitionId

 if (loading) return null

 return (
  <div className="flex flex-wrap w-full gap-4 justify-start">
   <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 w-full">
    <div className="flex justify-between items-center w-full pb-4">
     <h2 className="text-xl font-semibold">Workouts</h2>
     <Button variant="default" onClick={handleClick}>
      <Plus className="mr-1 h-4 w-4" />
      Create Workout
     </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
     {workouts?.map((workout) => (
      <WorkoutCard
       key={workout.id}
       workout={workout}
       refetch={refetch}
       workoutsCount={workouts.length}
      />
     ))}
    </div>
   </div>
   <WorkoutModal open={showModal} onClose={handleClose} refetch={refetch} />
  </div>
 )
}

export default Workouts
