import React from 'react'
import ManageLayout from '../../components/Layout/ManageLayout'
import TicketTypes from '../../components/Registration/Tickets'
import RegistrationQuestions from '../../components/Registration/RegistrationQuestions'
import VolunteerQuestions from '../../components/Registration/VolunteerQuestions'
import RegistrationToggle from '../../components/Registration/RegistrationToggle'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true, // Enable ownership check
)

const Registration = () => {
  return (
    <ManageLayout>
      <div className="flex flex-col justify-start items-center  h-full">
        <div className="w-full  space-y-6">
          <RegistrationToggle />
          <TicketTypes />
          <RegistrationQuestions />
          <VolunteerQuestions />
        </div>
      </div>
    </ManageLayout>
  )
}

export default Registration
