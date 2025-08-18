import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import WorkoutModal from './WorkoutModal'
import { GetWorkoutsByCompetitionIdQuery } from '../../src/generated/graphql'
import dayjs from 'dayjs'
import { Badge } from '../../src/components/ui/badge'

type Props = {
  workout: GetWorkoutsByCompetitionIdQuery['getWorkoutsByCompetitionId'][0]
  refetch: () => void
  workoutsCount: number
}

const WorkoutCard = (props: Props) => {
  const { workout, refetch, workoutsCount } = props
  const [showModal, setShowModal] = useState(false)

  const handleClickEdit = () => {
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
  }

  const isReleased = workout.releaseDateTime
    ? dayjs(workout.releaseDateTime).isBefore(dayjs())
    : false

  return (
    <>
      <div className="relative bg-white shadow-md rounded-lg p-6 w-72 h-40">
        <button
          onClick={handleClickEdit}
          className="absolute top-4 right-4 hover: focus:outline-none"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <div className="mb-4 pr-8">
          <h2 className="text-md pb-1.5 font-semibold">{workout.name}</h2>
          <p className="text-sm line-clamp-2">{workout.description}</p>
        </div>
        <div className="absolute bottom-2 right-2 text-sm">
          <Badge
            data-badge
            className={`py-1 border-0 font-medium !text-white ${
              isReleased ? 'bg-primary hover:bg-primary' : 'bg-gray-600 hover:bg-gray-600'
            }`}
          >
            {isReleased ? 'Released' : 'Coming Soon'}
          </Badge>
        </div>
      </div>
      <WorkoutModal
        workout={workout}
        open={showModal}
        onClose={handleClose}
        refetch={refetch}
      />
    </>
  )
}

export default WorkoutCard
