import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/ui/table'
import { Button } from '../../src/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '../../src/lib/utils'
import {
  useGetUnassignedEntriesByCompetitionIdQuery,
  useGetHeatsByWorkoutIdQuery,
  useGenerateHeatsFromSettingsMutation,
  useGetScoreSettingByCompetitionIdQuery,
  useAssignEntryToHeatMutation,
  HeatLimitType,
  GetLanesByHeatIdDocument,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import { Suspense } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '../../src/components/ui/dropdown-menu'

const UnassignedEntriesContent = ({
  unassignedEntries,
  heats,
  onAssignToHeat,
  onAutoAssign,
}: {
  unassignedEntries: any[]
  heats: any[]
  onAssignToHeat: (entryId: string, heatId: string) => void
  onAutoAssign: () => void
}) => {
  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md flex flex-col h-fit">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Unassigned Entries</h2>
          <p className="text-sm mt-1">
            When athletes sign up, they are added to the unassigned entries list.
          </p>
          <p className="text-sm mt-1">
            Assign these entries to heats by selecting a heat from the dropdown or
            clicking "Auto-Assign All".
          </p>
        </div>
        <Button onClick={onAutoAssign} disabled={!unassignedEntries.length}>
          Auto-Assign All
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entry</TableHead>
            <TableHead>Ticket Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {unassignedEntries.map((entry) => (
            <TableRow key={entry.id} className="bg-white hover:bg-gray-100">
              <TableCell>
                <div>{entry.name}</div>
                {entry.team?.members && entry.team.members.length > 0 && (
                  <div className="text-sm">
                    {entry.team.members
                      .map((member) => member.user?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </TableCell>
              <TableCell>{entry.ticketType.name}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        'w-[180px] justify-between truncate',
                        !entry.heat?.name && 'text-muted-foreground',
                      )}
                    >
                      <span className="truncate mr-2">
                        {entry.heat?.name || 'Assign to heat...'}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit max-h-none">
                    <DropdownMenuRadioGroup
                      value={entry.heat?.id || ''}
                      onValueChange={(heatId) => onAssignToHeat(entry.id, heatId)}
                    >
                      {heats.map((heat) => (
                        <DropdownMenuRadioItem key={heat.id} value={heat.id}>
                          {heat.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {!unassignedEntries.length && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8">
                No unassigned entries
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

type Props = {
  selectedWorkoutId: string | null
}

const UnassignedEntriesTable = (props: Props) => {
  const { selectedWorkoutId } = props
  const competitionId = useCompetitionId()
  const [assignEntryToHeat] = useAssignEntryToHeatMutation()
  const [generateHeats] = useGenerateHeatsFromSettingsMutation()

  const { data: unassignedData, refetch: refetchUnassigned } =
    useGetUnassignedEntriesByCompetitionIdQuery({
      variables: { competitionId },
    })

  const { data: heatsData } = useGetHeatsByWorkoutIdQuery({
    variables: { workoutId: selectedWorkoutId as string },
    skip: !selectedWorkoutId,
  })

  const { data: scoreSettingData } = useGetScoreSettingByCompetitionIdQuery({
    variables: { competitionId },
  })

  const unassignedEntries = unassignedData?.getUnassignedEntriesByCompetitionId ?? []
  const heats = heatsData?.getHeatsByWorkoutId ?? []
  const scoreSetting = scoreSettingData?.getScoreSettingByCompetitionId

  const handleAssignToHeat = async (entryId: string, heatId: string) => {
    try {
      await assignEntryToHeat({
        variables: {
          entryId,
          heatId,
        },
        refetchQueries: [
          'GetUnassignedEntriesByCompetitionId',
          'GetHeatsByWorkoutId',
          'GetHeatsByCompetitionId',
          {
            query: GetLanesByHeatIdDocument,
            variables: { heatId },
            fetchPolicy: 'network-only',
          },
        ],
        awaitRefetchQueries: true,
      })
    } catch (error) {
      console.error('Failed to assign entry to heat:', error)
    }
  }

  const handleAutoAssign = async () => {
    try {
      await generateHeats({
        variables: {
          competitionId,
          input: {
            heatLimitType: scoreSetting?.heatLimitType || HeatLimitType.Entries,
            maxLimitPerHeat: scoreSetting?.maxLimitPerHeat || 0,
            ticketTypeOrderIds: scoreSetting?.ticketTypeOrderIds || [],
            oneTicketPerHeat: scoreSetting?.oneTicketPerHeat || false,
          },
        },
        refetchQueries: ['GetUnassignedEntriesByCompetitionId', 'GetHeatsByWorkoutId'],
      })
    } catch (error) {
      console.error('Failed to auto-assign entries:', error)
    }
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnassignedEntriesContent
        unassignedEntries={unassignedEntries}
        heats={heats}
        onAssignToHeat={handleAssignToHeat}
        onAutoAssign={handleAutoAssign}
      />
    </Suspense>
  )
}

export default UnassignedEntriesTable
