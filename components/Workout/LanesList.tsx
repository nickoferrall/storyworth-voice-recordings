import React, { useMemo, useState, useEffect, use } from 'react'
import {
  useGetLanesByHeatIdQuery,
  GetLanesByHeatIdQuery,
  useUpdateLaneOrderMutation,
  GetLanesByHeatIdDocument,
  useGetHeatByIdQuery,
  useUpdateLaneHeatMutation,
  useUpdateHeatMutation,
  GetHeatsByWorkoutIdDocument,
  useGetScoreSettingByCompetitionIdQuery,
  useGetTicketTypesByCompetitionIdQuery,
} from '../../src/generated/graphql'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '../../src/components/ui/table'

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import LaneRow from './LaneRow'
import { cn } from '../../src/lib/utils'
import { toast } from '../../src/hooks/use-toast'
import { Plus, Trash } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import useCompetitionId from '../../hooks/useCompetitionId'

type Lane = GetLanesByHeatIdQuery['getLanesByHeatId'][0]

interface LanesListProps {
  heatId: string
  workoutId: string
  setOpenHeatId: (heatId: string | null) => void
  refetch?: () => Promise<any>
  maxLanes: number
}

const LanesList = ({
  heatId,
  workoutId,
  setOpenHeatId,
  refetch,
  maxLanes,
}: LanesListProps) => {
  const [lanes, setLanes] = useState<Lane[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: heatData } = useGetHeatByIdQuery({
    variables: { id: heatId },
    fetchPolicy: 'network-only',
  })
  const { data: lanesData, refetch: refetchLanes } = useGetLanesByHeatIdQuery({
    variables: { heatId },
    fetchPolicy: 'network-only',
  })
  const [updateLaneOrder] = useUpdateLaneOrderMutation()
  const [updateHeat] = useUpdateHeatMutation()
  const competitionId = useCompetitionId()
  const { data: scoreSettingData } = useGetScoreSettingByCompetitionIdQuery({
    variables: { competitionId },
  })
  const { data: ticketTypesData } = useGetTicketTypesByCompetitionIdQuery({
    variables: { competitionId },
  })

  useEffect(() => {
    if (lanesData?.getLanesByHeatId) {
      const sortedLanes = [...lanesData.getLanesByHeatId].sort(
        (a, b) => a.number - b.number,
      )
      setLanes(sortedLanes)
    }
  }, [lanesData])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    if (
      active.data.current?.type === 'lane' &&
      active.data.current?.sortable?.index !== undefined
    ) {
      const oldIndex = active.data.current.sortable.index
      const newIndex = over.data.current?.sortable?.index ?? oldIndex

      if (oldIndex !== newIndex) {
        // Store original lanes state in case we need to revert
        const originalLanes = [...lanes]

        // Optimistically update the UI
        const updatedLanes = [...lanes]
        const [movedLane] = updatedLanes.splice(oldIndex, 1)
        updatedLanes.splice(newIndex, 0, movedLane)

        // Update numbers
        const finalLanes = updatedLanes.map((lane, index) => ({
          ...lane,
          number: index + 1,
        }))

        // Update UI immediately
        setLanes(finalLanes)

        try {
          await updateLaneOrder({
            variables: {
              laneId: active.id as string,
              newPosition: newIndex + 1,
            },
            refetchQueries: [
              {
                query: GetLanesByHeatIdDocument,
                variables: { heatId },
              },
              {
                query: GetHeatsByWorkoutIdDocument,
                variables: { workoutId },
              },
            ],
          })
        } catch (error) {
          // Revert to original state if mutation fails
          setLanes(originalLanes)
          console.error('Error reordering lane:', error)
          toast({
            title: 'Error reordering lane',
            description: 'Failed to reorder lane. Please try again.',
            variant: 'destructive',
          })
        }
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Create array of empty lanes with their numbers
  const emptyLanes = useMemo(() => {
    const heat = heatData?.getHeatById
    if (!heat?.maxLimitPerHeat) return []

    const scoreSetting = scoreSettingData?.getScoreSettingByCompetitionId
    const ticketTypes = ticketTypesData?.getTicketTypesByCompetitionId || []

    if (!scoreSetting || scoreSetting.heatLimitType !== 'ATHLETES') {
      // For ENTRIES type, use the heat's specific limit
      const currentLaneCount = lanes.length
      const maxLimit = heat.maxLimitPerHeat
      return Array(Math.max(0, maxLimit - currentLaneCount))
        .fill(null)
        .map((_, index) => currentLaneCount + index + 1)
    }

    // For ATHLETES type, calculate remaining slots based on team sizes
    let usedAthletes = 0
    lanes.forEach((lane) => {
      if (lane.entry) {
        const ticketType = ticketTypes.find((tt) => tt.id === lane.entry.ticketType.id)
        usedAthletes += ticketType?.teamSize || 1
      }
    })

    // Use the heat's specific athlete limit
    const remainingAthletes = Math.max(0, heat.maxLimitPerHeat - usedAthletes)
    const minTeamSize = Math.min(...ticketTypes.map((tt) => tt.teamSize || 1))
    const possibleLanes = Math.floor(remainingAthletes / minTeamSize)

    return Array(possibleLanes)
      .fill(null)
      .map((_, index) => lanes.length + index + 1)
  }, [heatData?.getHeatById, lanes, scoreSettingData, ticketTypesData])

  console.log('🚀 ~ emptyLanes:', emptyLanes)

  const handleAddLane = async () => {
    if (!heatData?.getHeatById) return

    const currentMaxLimit = heatData.getHeatById.maxLimitPerHeat

    try {
      await updateHeat({
        variables: {
          id: heatId,
          maxLimitPerHeat: (currentMaxLimit || 0) + 1, // Ensure it's a number
        },
        refetchQueries: ['GetHeatById'],
      })

      await refetchLanes()

      toast({
        title: 'Lane space added',
        description: 'New lane space has been added successfully.',
      })
    } catch (error) {
      console.error('Error adding lane space:', error)
      toast({
        title: 'Error adding lane',
        description: 'Failed to add new lane space. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveLane = async () => {
    if (!heatData?.getHeatById) return
    const currentMaxLimit = heatData.getHeatById.maxLimitPerHeat

    if (currentMaxLimit <= lanes.length) {
      toast({
        title: 'Cannot remove lane',
        description: 'Cannot remove lanes that are in use.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateHeat({
        variables: {
          id: heatId,
          maxLimitPerHeat: currentMaxLimit - 1,
        },
        refetchQueries: ['GetHeatById'],
      })

      await refetchLanes()

      toast({
        title: 'Lane space removed',
        description: 'Lane space has been removed successfully.',
      })
    } catch (error) {
      console.error('Error removing lane space:', error)
      toast({
        title: 'Error removing lane',
        description: 'Failed to remove lane space. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div
      className={cn('p-4', isUpdating && 'opacity-50 pointer-events-none')}
      data-heat-id={`heat-${heatId}`}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lanes.map((lane) => lane.id)}
          strategy={verticalListSortingStrategy}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Lane</TableHead>
                <TableHead className="w-1/3">Entry</TableHead>
                <TableHead className="w-1/3">Ticket Type</TableHead>
                <TableHead className="w-1/3">Move To Heat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lanes.map((lane) => (
                <LaneRow
                  key={lane.id}
                  lane={lane}
                  heatId={heatId}
                  workoutId={workoutId}
                  setOpenHeatId={setOpenHeatId}
                />
              ))}
              {emptyLanes.map((laneNumber) => (
                <TableRow key={`empty-${laneNumber}`} className="h-12">
                  <TableCell className="w-20">{laneNumber}</TableCell>
                  <TableCell className="w-1/3">-</TableCell>
                  <TableCell className="w-1/3">Lane available</TableCell>
                  <TableCell className="w-1/3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      onClick={handleRemoveLane}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove lane</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {maxLanes > 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Button
                      variant="outline"
                      className="w-full text-gray-900 border-gray-300 hover:bg-gray-100 hover:text-gray-900"
                      onClick={handleAddLane}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lane
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default LanesList
