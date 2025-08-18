import React from 'react'
import { TableCell, TableRow } from '../../src/components/ui/table'
import { Button } from '../../src/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '../../src/lib/utils'
import {
  GetLanesByHeatIdQuery,
  useGetHeatsByWorkoutIdQuery,
  useUpdateLaneHeatMutation,
  useGetLanesByHeatIdQuery,
  useUpdateLaneOrderMutation,
  useUnassignEntryMutation,
  GetLanesByHeatIdDocument,
} from '../../src/generated/graphql'
import { toast } from '../../src/hooks/use-toast'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from '../../src/components/ui/dropdown-menu'

type Lane = GetLanesByHeatIdQuery['getLanesByHeatId'][0]

interface LaneRowProps {
  lane: Lane
  heatId: string
  workoutId: string
  setOpenHeatId: (heatId: string | null) => void
}

const LaneRow = ({ lane, heatId, workoutId, setOpenHeatId }: LaneRowProps) => {
  const { data: heatsData, refetch: refetchHeats } = useGetHeatsByWorkoutIdQuery({
    variables: { workoutId },
    fetchPolicy: 'network-only',
  })
  const [updateLaneHeat] = useUpdateLaneHeatMutation()
  const [unassignEntry] = useUnassignEntryMutation()
  const { refetch: refetchLanes } = useGetLanesByHeatIdQuery({
    variables: { heatId },
    fetchPolicy: 'network-only',
  })

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: lane.id,
      data: {
        type: 'lane',
        heatId,
        sortable: {
          index: lane.number - 1,
        },
      },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleHeatChange = async (newHeatId: string) => {
    try {
      if (newHeatId === 'unassign') {
        await unassignEntry({
          variables: {
            laneId: lane.id,
          },
          refetchQueries: [
            {
              query: GetLanesByHeatIdDocument,
              variables: { heatId },
            },
            'GetUnassignedEntriesByCompetitionId',
            'GetHeatsByWorkoutId',
            'GetHeatById',
            'GetHeatsByCompetitionId',
          ],
          awaitRefetchQueries: true,
        })

        await Promise.all([refetchLanes(), refetchHeats()])

        toast({
          title: 'Entry unassigned',
          description: 'Entry has been unassigned from heat.',
        })
      } else {
        await updateLaneHeat({
          variables: {
            id: lane.id,
            heatId: newHeatId,
          },
          refetchQueries: [
            {
              query: GetLanesByHeatIdDocument,
              variables: { heatId },
            },
            {
              query: GetLanesByHeatIdDocument,
              variables: { heatId: newHeatId },
            },
          ],
        })

        setOpenHeatId(newHeatId)

        await Promise.all([refetchLanes(), refetchHeats()])

        toast({
          title: 'Lane moved',
          description: 'Lane has been moved to new heat successfully.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error updating lane',
        description: 'Failed to update lane.',
        variant: 'destructive',
      })
    }
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white hover:bg-gray-100 cursor-grab active:cursor-grabbing"
    >
      <TableCell className="w-20">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4" />
          {lane.number}
        </div>
      </TableCell>
      <TableCell className="w-1/3">
        {lane.entry ? (
          <div>
            <div>{lane.entry.name}</div>
            {lane.entry.team?.members && lane.entry.team.members.length > 0 && (
              <div className="text-sm">
                {lane.entry.team.members
                  .map((member) => member.user?.name)
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
          </div>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="w-1/3">
        {lane.entry?.ticketType.name || 'Lane available'}
      </TableCell>
      <TableCell className="w-1/3">
        <div onClick={(e) => e.stopPropagation()} className="cursor-default">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  'w-[180px] justify-between truncate',
                  !heatsData?.getHeatsByWorkoutId.find((h) => h.id === heatId)?.name &&
                    'text-muted-foreground',
                )}
              >
                <span className="truncate mr-2">
                  {heatsData?.getHeatsByWorkoutId.find((h) => h.id === heatId)?.name ||
                    'Move to heat...'}
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit max-h-none">
              <DropdownMenuRadioGroup
                value={heatId}
                onValueChange={(newHeatId) => handleHeatChange(newHeatId)}
              >
                <DropdownMenuRadioItem value="unassign">
                  Unassign from Heat
                </DropdownMenuRadioItem>
                <DropdownMenuSeparator />
                {heatsData?.getHeatsByWorkoutId.map((heat) => (
                  <DropdownMenuRadioItem
                    key={heat.id}
                    value={heat.id}
                    disabled={heat.id === heatId}
                  >
                    Move to {heat.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  )
}

export default LaneRow
