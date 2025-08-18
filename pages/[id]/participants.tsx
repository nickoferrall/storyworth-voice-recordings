import React from 'react'
import { GetRegistrationsByCompetitionIdQueryResult } from '../../src/generated/graphql'
import ManageLayout from '../../components/Layout/ManageLayout'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'
import ParticipantsTable from '../../components/Participants/ParticipantsTable'

export type Athlete = NonNullable<
  GetRegistrationsByCompetitionIdQueryResult['data']
>['getRegistrationsByCompetitionId'][number]

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true, // Enable ownership check
)

const Participants = () => {
  return (
    <ManageLayout>
      <ParticipantsTable />
    </ManageLayout>
  )
}

export default Participants
