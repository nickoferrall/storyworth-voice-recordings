import React from 'react'
import Details from '../../components/Overview/Details'
import ManageLayout from '../../components/Layout/ManageLayout'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true,
)

const Overview = () => {
  return (
    <ManageLayout>
      <Details />
    </ManageLayout>
  )
}

export default Overview
