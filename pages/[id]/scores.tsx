import React, { useState, useMemo, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import ManageLayout from '../../components/Layout/ManageLayout'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'
import { Input } from '../../src/components/ui/input'
import { Button } from '../../src/components/ui/button'
import { ChevronDown } from 'lucide-react'
import ScoresTable from '../../components/Scores/ScoresTable'
import useCompetitionId from '../../hooks/useCompetitionId'
import {
  GetWorkoutsByCompetitionIdQuery,
  useGetWorkoutsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../src/components/ui/dropdown-menu'
import LeaderboardModal from '../../components/Event/LeaderboardModal'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true, // Enable ownership check
)

type Workout = GetWorkoutsByCompetitionIdQuery['getWorkoutsByCompetitionId'][0]

const Scores = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [searchInput, setSearchInput] = useState<string>('')
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const competitionId = useCompetitionId()

  const { data: workoutsData, loading: workoutsLoading } =
    useGetWorkoutsByCompetitionIdQuery({
      variables: { competitionId: competitionId || '' },
      skip: !competitionId,
    })

  const workouts = useMemo(() => {
    return workoutsData?.getWorkoutsByCompetitionId || []
  }, [workoutsData])

  useEffect(() => {
    if (workouts.length > 0 && !selectedWorkout) {
      setSelectedWorkout(workouts[0])
    }
  }, [workouts, selectedWorkout])

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  return (
    <ManageLayout>
      <div className="flex flex-col justify-start items-center h-full">
        <div className="w-full space-y-2">
          <div className="flex justify-between items-start w-full">
            <div>
              <h2 className="text-xl text-left w-full font-semibold">Scores</h2>
              <p className="text-sm text-left w-full mt-1">
                This is where you can view and manage scores for each workout
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-3xl py-1 h-6"
              onClick={() => setShowLeaderboard(true)}
            >
              Leaderboard
              <ExternalLink className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center py-2">
            <Input
              placeholder="Filter names..."
              value={searchInput}
              onChange={handleSearchChange}
              className="bg-white max-w-sm placeholder:text-gray-600"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  {selectedWorkout?.name || 'Select Workout'}{' '}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {workoutsLoading ? (
                  <DropdownMenuItem>Loading workouts...</DropdownMenuItem>
                ) : (
                  workouts.map((workout) => (
                    <DropdownMenuItem
                      key={workout.id}
                      onClick={() => setSelectedWorkout(workout)}
                    >
                      {workout.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <ScoresTable
            searchInput={searchInput}
            selectedWorkoutId={selectedWorkout?.id}
          />
        </div>
      </div>
      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        competitionId={competitionId || ''}
        isAdminView={true}
      />
    </ManageLayout>
  )
}

export default Scores
