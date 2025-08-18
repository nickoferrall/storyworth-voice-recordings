import React, { useState, useEffect, useRef } from 'react'
import {
  useUpdateHeatMutation,
  useDeleteHeatMutation,
  useGetHeatsByWorkoutIdQuery,
  GetLanesByHeatIdDocument,
  useUpdateLaneHeatMutation,
  useGetScoreSettingByCompetitionIdQuery,
  useGetTicketTypesByCompetitionIdQuery,
  useUnassignEntryMutation,
} from '../../src/generated/graphql'
import { Table, TableBody, TableCell, TableRow } from '../../src/components/ui/table'
import { Button } from '../../src/components/ui/button'
import dayjs from 'dayjs'
import TicketSelector from '../Layout/TicketSelector'
import { MoreHorizontal, Trash, Eye, CalendarIcon } from 'lucide-react'
import { Badge } from '../../src/components/ui/badge'
import { Input } from '../../src/components/ui/input'
import { toast } from '../../src/hooks/use-toast'
import { Toaster } from '../../src/components/ui/toaster'
import DeleteModal from '../DeleteModal'
import { Calendar } from '../../src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import { format } from 'date-fns'
import { cn } from '../../src/lib/utils'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../src/components/ui/accordion'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import useCompetitionId from '../../hooks/useCompetitionId'
import dynamic from 'next/dynamic'

interface HeatsTableProps {
  workoutId: string | null
  openHeatId: string | null
  setOpenHeatId: (heatId: string | null) => void
}

// Lazy load LanesList
const LanesList = dynamic(() => import('./LanesList'), {
  loading: () => (
    <div className="p-4 animate-pulse">
      <div className="h-12 bg-gray-100 rounded mb-2"></div>
      <div className="h-12 bg-gray-100 rounded mb-2"></div>
      <div className="h-12 bg-gray-100 rounded"></div>
    </div>
  ),
})

const HeatsTable = ({ workoutId, openHeatId, setOpenHeatId }: HeatsTableProps) => {
  const competitionId = useCompetitionId()
  const { data: heatsData, refetch: refetchHeats } = useGetHeatsByWorkoutIdQuery({
    variables: { workoutId: workoutId as string },
    skip: !workoutId || workoutId === '',
    fetchPolicy: 'network-only',
  })
  const [updateHeat] = useUpdateHeatMutation()
  const [deleteHeat] = useDeleteHeatMutation()
  const [updateLaneHeat] = useUpdateLaneHeatMutation()
  const [unassignEntry] = useUnassignEntryMutation()

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedHeatId, setSelectedHeatId] = useState<string | null>(null)
  const [allSameDay, setAllSameDay] = useState(true)
  const [draggedOverHeatId, setDraggedOverHeatId] = useState<string | null>(null)
  const heats = (heatsData?.getHeatsByWorkoutId ?? []).slice().sort((a, b) => {
    const t1 = new Date(a.startTime).getTime()
    const t2 = new Date(b.startTime).getTime()
    return t1 - t2
  })

  const { data: scoreSettingData } = useGetScoreSettingByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })

  const { data: ticketTypesData } = useGetTicketTypesByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })

  const calculateAvailableLanes = (heat: any) => {
    const scoreSetting = scoreSettingData?.getScoreSettingByCompetitionId
    const ticketTypes = ticketTypesData?.getTicketTypesByCompetitionId || []

    if (!scoreSetting || scoreSetting.heatLimitType !== 'ATHLETES') {
      const existingLanes = heat.lanes?.length || 0
      return Math.max(0, (scoreSetting?.maxLimitPerHeat || 0) - existingLanes)
    }

    const athleteLimit = scoreSetting.maxLimitPerHeat
    const existingLanes = heat.lanes || []
    let usedAthletes = 0

    existingLanes.forEach((lane: any) => {
      const entry = lane.entry
      if (entry) {
        const ticketType = ticketTypes.find((tt) => tt.id === entry.ticketTypeId)
        usedAthletes += ticketType?.teamSize || 1
      }
    })

    const remainingAthletes = Math.max(0, athleteLimit - usedAthletes)

    const minTeamSize = Math.min(...ticketTypes.map((tt) => tt.teamSize || 1))

    return Math.floor(remainingAthletes / minTeamSize)
  }

  useEffect(() => {
    if (heats && heats.length > 0) {
      if (!openHeatId || !heats.find((heat) => heat.id === openHeatId)) {
        setOpenHeatId(heats[0].id)
      }
    }
  }, [heats, openHeatId, setOpenHeatId])

  const handleDateTimeChange = async (
    heatId: string,
    newDate: Date | undefined,
    newTime: string,
  ) => {
    if (!newDate && !allSameDay) return

    try {
      let updatedDateTime
      if (allSameDay) {
        updatedDateTime =
          dayjs(heats.find((h) => h.id === heatId)?.startTime).format('YYYY-MM-DD') +
          ' ' +
          newTime
      } else {
        updatedDateTime = dayjs(newDate).format('YYYY-MM-DD') + ' ' + newTime
      }

      await updateHeat({
        variables: {
          id: heatId,
          startTime: dayjs(updatedDateTime).toDate(),
        },
      })
      toast({
        title: 'Heat time updated',
        description: "The heat's start time has been successfully updated.",
        duration: 3000,
      })
      refetchHeats()
    } catch (error) {
      console.error('Error updating heat time:', error)
      toast({
        title: 'Error',
        description: "Failed to update the heat's start time. Please try again.",
        variant: 'destructive',
        duration: 3000,
      })
    }
  }

  const handleDeleteClick = (heat: any) => {
    setSelectedHeatId(heat.id)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedHeatId) {
      try {
        await deleteHeat({ variables: { id: selectedHeatId } })
        toast({
          title: 'Heat deleted',
          description: 'The heat has been successfully deleted.',
          duration: 3000,
        })
        refetchHeats()
      } catch (error) {
        console.error('Error deleting heat:', error)
        toast({
          title: 'Error',
          description: 'Failed to delete the heat. Please try again.',
          variant: 'destructive',
          duration: 3000,
        })
      }
    }
    setDeleteModalOpen(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const openTimerRef = useRef<NodeJS.Timeout>()

  const handleDragEnd = (event: DragEndEvent) => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current)
    }
    setDraggedOverHeatId(null)

    const { active, over } = event
    if (!over) return

    if (active.data.current?.type === 'lane' && over.data.current?.type === 'heat') {
      const targetHeatId = over.id as string
      const sourceHeatId = active.data.current.heatId
      const laneId = active.id as string

      if (targetHeatId !== sourceHeatId) {
        handleUpdateLaneHeat(laneId, sourceHeatId, targetHeatId)
      }
    }
  }

  const handleUpdateLaneHeat = async (
    laneId: string,
    sourceHeatId: string,
    targetHeatId: string | null,
  ) => {
    try {
      if (targetHeatId === null) {
        await unassignEntry({
          variables: {
            laneId,
          },
          refetchQueries: [
            'GetUnassignedEntriesByCompetitionId',
            'GetHeatsByWorkoutId',
            'GetHeatsByCompetitionId',
          ],
        })

        toast({
          title: 'Entry unassigned',
          description: 'Entry has been removed from heat.',
        })
      } else {
        await updateLaneHeat({
          variables: {
            id: laneId,
            heatId: targetHeatId,
          },
          refetchQueries: [
            'GetHeatByIdTicketSelector',
            {
              query: GetLanesByHeatIdDocument,
              variables: { heatId: targetHeatId },
            },
            {
              query: GetLanesByHeatIdDocument,
              variables: { heatId: sourceHeatId },
            },
          ],
        })

        setOpenHeatId(targetHeatId)

        toast({
          title: 'Lane moved',
          description: 'Lane has been moved to new heat successfully.',
        })
      }
    } catch (error) {
      console.error('Error updating lane:', error)
      toast({
        title: 'Error updating lane',
        description: 'Failed to update lane. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md flex flex-col h-full">
      <DndContext sensors={sensors} collisionDetection={closestCenter}>
        <Accordion
          type="single"
          collapsible
          value={openHeatId || undefined}
          onValueChange={(value) => setOpenHeatId(value)}
        >
          {heats.map((heat) => {
            const availableLanes = calculateAvailableLanes(heat)

            return (
              <AccordionItem
                key={heat.id}
                value={heat.id}
                data-heat-id={heat.id}
                data-type="heat"
                className={cn(
                  draggedOverHeatId === heat.id && 'bg-gray-50',
                  'transition-colors duration-200',
                )}
              >
                <Table className="cursor-pointer">
                  <TableBody>
                    <TableRow className="hover:bg-gray-100">
                      <TableCell className="py-2 w-full" colSpan={5}>
                        <AccordionTrigger className="w-full hover:no-underline">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex-1 flex items-center justify-between gap-4 mr-4">
                              <div>{heat.name}</div>
                              <div onClick={(e) => e.stopPropagation()}>
                                {!allSameDay && (
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant={'outline'}
                                        className={cn(
                                          'w-[120px] justify-start text-left font-normal',
                                          !heat.startTime && 'text-muted-foreground',
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {heat.startTime ? (
                                          format(new Date(heat.startTime), 'MMM d')
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={
                                          heat.startTime
                                            ? new Date(heat.startTime)
                                            : undefined
                                        }
                                        onSelect={(date) =>
                                          handleDateTimeChange(
                                            heat.id,
                                            date,
                                            dayjs(heat.startTime).format('HH:mm'),
                                          )
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                )}
                                <Input
                                  type="time"
                                  defaultValue={dayjs(heat.startTime).format('HH:mm')}
                                  className="w-24"
                                  key={`${heat.id}-${new Date(heat.startTime).getTime()}`}
                                  onBlur={(e) =>
                                    handleDateTimeChange(
                                      heat.id,
                                      new Date(heat.startTime),
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <TicketSelector heatId={heat.id} />
                              </div>
                              <div className="flex items-center space-x-2">
                                {heat.registrationsCount === 0 ? (
                                  <Badge variant="outline">Empty</Badge>
                                ) : (
                                  <Badge variant="default">
                                    {heat.registrationsCount}/{heat.maxLimitPerHeat}
                                    {heat.heatLimitType === 'ATHLETES'
                                      ? ' Athletes'
                                      : ' Entries'}
                                  </Badge>
                                )}
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleDeleteClick(heat)}
                                >
                                  <Trash className="h-4 w-4" />
                                  <span className="sr-only">Delete heat</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <AccordionContent>
                  <LanesList
                    heatId={heat.id}
                    workoutId={workoutId as string}
                    maxLanes={availableLanes}
                    refetch={refetchHeats}
                    setOpenHeatId={setOpenHeatId}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </DndContext>
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        handleDelete={confirmDelete}
        id={selectedHeatId || ''}
        title="Delete Heat"
        description={
          (heats.find((h) => h.id === selectedHeatId)?.registrationsCount ?? 0) > 0
            ? ''
            : 'Are you sure you want to delete this heat? This action cannot be undone.'
        }
        error={
          (heats.find((h) => h.id === selectedHeatId)?.registrationsCount ?? 0) > 0
            ? 'Cannot delete heat with registered athletes. Please reassign all entries to other heats first.'
            : null
        }
        disabled={
          (heats.find((h) => h.id === selectedHeatId)?.registrationsCount ?? 0) > 0
        }
      />

      <Toaster />
    </div>
  )
}

export default HeatsTable
