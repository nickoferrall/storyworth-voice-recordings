import React from 'react'
import { Dialog, DialogContent, DialogTitle } from '../../src/components/ui/dialog'
import { useGetCompetitionScheduleQuery } from '../../src/generated/graphql'
import dayjs from 'dayjs'

type Props = {
  open: boolean
  onClose: () => void
  userId: string
  competitionId: string
}

const ScheduleModal: React.FC<Props> = ({ open, onClose, userId, competitionId }) => {
  const { data, loading, error } = useGetCompetitionScheduleQuery({
    variables: { competitionId },
    skip: !open,
    fetchPolicy: 'network-only',
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading schedule</div>

  const heats = data?.getHeatsByCompetitionId || []

  // Group heats by workout including lanes
  const heatsByWorkout = heats.reduce(
    (acc, heat) => {
      const workoutName = heat.workout?.name || 'Workout'
      if (!acc[workoutName]) acc[workoutName] = []
      acc[workoutName].push(heat)
      return acc
    },
    {} as Record<string, typeof heats>,
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogTitle>Your Schedule</DialogTitle>
        <div className="mt-4 space-y-6">
          {heats.length === 0 ? (
            <div className="text-center text-slate-300 text-base py-8">
              You'll see your schedule here on competition day once your heats are
              assigned.
            </div>
          ) : (
            <>
              {Object.entries(heatsByWorkout).map(([workoutName, workoutHeats]) => (
                <div key={workoutName} className="border-b pb-4">
                  <h3 className="font-semibold">{workoutName}</h3>
                  <div className="mt-2 space-y-3">
                    {workoutHeats
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.startTime).getTime() -
                          new Date(b.startTime).getTime(),
                      )
                      .map((heat) => (
                        <div key={heat.id}>
                          <h4 className="font-medium">
                            {heat.name} - {dayjs(heat.startTime).format('h:mm A')}
                          </h4>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {(heat.lanes || []).map((lane, idx) => {
                              const teamName = (lane.entry.team?.name || '').trim()
                              const members = (lane.entry.team?.members ?? [])
                                .map((m) => m.user?.name)
                                .filter((n): n is string => Boolean(n))

                              const formatMembers = (names: string[]) => {
                                if (names.length <= 1) return names[0] || ''
                                if (names.length === 2) return `${names[0]} & ${names[1]}`
                                return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
                              }

                              const display = teamName
                                ? teamName
                                : members.length > 0
                                  ? formatMembers(members)
                                  : lane.entry.name

                              return (
                                <li key={`${heat.id}-${idx}`} className="text-sm">
                                  {display}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleModal
