import React, { useState } from 'react'
import {
  GetWorkoutsByCompetitionIdQuery,
  GetWorkoutsByCompetitionIdQueryResult,
} from '../../src/generated/graphql'
import dayjs from 'dayjs'

type Props = {
  workout: GetWorkoutsByCompetitionIdQuery['getWorkoutsByCompetitionId'][0]
}

const AthleteWorkoutItem = (props: Props) => {
  const { workout } = props

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold">{workout.name}</h3>
      <p className="text-base">
        {workout.description.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </p>
    </div>
  )
}

export default AthleteWorkoutItem
