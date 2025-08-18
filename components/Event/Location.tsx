import React from 'react'
import { GetCompetitionByIdQuery } from '../../src/generated/graphql'

type Props = {
  competition: GetCompetitionByIdQuery['getCompetitionById']
}

const Location = (props: Props) => {
  const { competition } = props
  const venue = competition?.address?.venue
  const city = competition?.address?.city
  const country = competition?.address?.country
  const addressParts = [
    competition?.address?.street,
    city,
    country,
    competition?.address?.postcode,
  ].filter(Boolean)
  const address = addressParts.join(', ')
  return (
    <div>
      <h2 className="text-xl font-bold font-montserrat text-white not-prose pb-2 pt-6">
        Location
      </h2>
      <hr className="mb-2 border-gray-200 w-full" />

      <p className="text-base font-semibold pt-3 mb-1">{venue}</p>

      <p className="text-base mb-4">{address}</p>
    </div>
  )
}

export default Location
