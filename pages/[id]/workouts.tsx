import React from 'react'
import ManageLayout from '../../components/Layout/ManageLayout'
import WorkoutsComponent from '../../components/Workout/Workouts'
import Heats from '../../components/Workout/Heats'
import withAuth from '../../utils/withAuth'
import { Context } from '@apollo/client'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true, // Enable ownership check
)

const Workouts = () => {
  return (
    <ManageLayout>
      <div className="flex flex-col justify-start items-center h-full md:w-full w-screen overflow-scroll">
        <div className="space-y-8 w-full pb-12 p-0 md:p-4">
          <WorkoutsComponent />
          <Heats />
        </div>
      </div>
    </ManageLayout>
  )
}

export default Workouts
