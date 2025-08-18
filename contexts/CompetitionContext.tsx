import React, { createContext, useContext, useEffect, useState } from 'react'
import { useGetCompetitionNameByIdQuery } from '../src/generated/graphql' // Adjust this import as necessary
import useCompetitionId from '../hooks/useCompetitionId'

type CompetitionContextProps = {
  competitionName: string | null
  startDateTime: string | null
  loading: boolean
}

export const CompetitionContext = createContext<CompetitionContextProps>({
  competitionName: null,
  startDateTime: null,
  loading: false,
})

export const CompetitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const competitionId = useCompetitionId()
  const [competitionName, setCompetitionName] = useState<string | null>(null)
  const [startDateTime, setStartDateTime] = useState<string | null>(null)

  // Fetch the competition name using the regular query
  const { data, loading } = useGetCompetitionNameByIdQuery({
    variables: { id: competitionId },
    skip: !competitionId, // Skip the query if competitionId is not available
  })

  // Update the competition data when fetched
  useEffect(() => {
    if (data?.getCompetitionById) {
      const { name, startDateTime: fetchedStartDateTime } = data.getCompetitionById
      if (name && competitionName !== name) {
        setCompetitionName(name)
      }
      if (fetchedStartDateTime && fetchedStartDateTime !== startDateTime) {
        setStartDateTime(fetchedStartDateTime || null)
      }
    }
  }, [data, competitionName, startDateTime])

  return (
    <CompetitionContext.Provider value={{ competitionName, startDateTime, loading }}>
      {children}
    </CompetitionContext.Provider>
  )
}

export const useCompetition = () => useContext(CompetitionContext)
