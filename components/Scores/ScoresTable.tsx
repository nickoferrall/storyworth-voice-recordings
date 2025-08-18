import React, { useMemo, useState, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  Row,
  Column,
} from '@tanstack/react-table'
import { ArrowUpDown, Edit2, Info } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/ui/table'
import {
  useGetEntriesByWorkoutIdQuery,
  useUpdateScoreByIdMutation,
  useCreateScoreMutation,
  useGetWorkoutByIdQuery,
  useUpdateWorkoutVisibilityMutation,
} from '../../src/generated/graphql'
import { formatUnitOfMeasurement } from '../../utils/formatUnitOfMeasurement'
import TimerCell from './TimerCell'
import dayjs from 'dayjs'
import { Switch } from '../../src/components/ui/switch'
import { Label } from '../../src/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import ScoreInput from './ScoreInput'

type Score = {
  id: string
  athleteName: string
  teamMembers: (string | undefined)[]
  ticketType: string
  heat: string
  heatTime: string | null
  score: number | string
  isCompleted?: boolean
}

interface ScoresTableProps {
  searchInput: string
  selectedWorkoutId?: string | null
}

const ScoresTable: React.FC<ScoresTableProps> = ({ searchInput, selectedWorkoutId }) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'heat', desc: false },
  ])
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const { data, loading, refetch } = useGetEntriesByWorkoutIdQuery({
    variables: { workoutId: selectedWorkoutId as string },
    skip: !selectedWorkoutId,
  })
  const { data: workoutsData } = useGetWorkoutByIdQuery({
    variables: { id: selectedWorkoutId as string },
    skip: !selectedWorkoutId,
  })
  const workout = workoutsData?.getWorkoutById
  const [updateScore] = useUpdateScoreByIdMutation()
  const [createScore] = useCreateScoreMutation()
  const [optimisticScores, setOptimisticScores] = useState<Record<string, string>>({})
  const [optimisticCompletions, setOptimisticCompletions] = useState<
    Record<string, boolean>
  >({})
  const [updateWorkoutVisibility] = useUpdateWorkoutVisibilityMutation()

  // Add this effect to refetch data when selectedWorkoutId changes
  useEffect(() => {
    if (selectedWorkoutId) {
      refetch({ workoutId: selectedWorkoutId })
      setOptimisticScores({}) // Clear optimistic scores when changing workouts
      setOptimisticCompletions({}) // Clear optimistic completions when changing workouts
    }
  }, [selectedWorkoutId, refetch])

  const scores = useMemo(() => {
    if (!data?.getEntriesByWorkoutId) return []

    // Create a Map to store unique entries, using athleteName as the key
    const uniqueScores = new Map()

    data?.getEntriesByWorkoutId.forEach((entry) => {
      const score = {
        id: entry.id,
        athleteName: entry.name,
        teamMembers: entry.team?.members.map((member) => member.user?.name!) || [],
        ticketType: entry.ticketType.name,
        heat: entry.laneByWorkoutId?.heat?.name || 'N/A',
        heatTime: entry.laneByWorkoutId?.heat?.startTime || null,
        score: entry.score
          ? optimisticScores[entry.id] || entry.score.value
          : optimisticScores[entry.id] || 'N/A',
        isCompleted:
          entry.id in optimisticCompletions
            ? optimisticCompletions[entry.id]
            : entry.score?.isCompleted || false,
      }

      // Only add the entry if we haven't seen this athlete name before
      if (!uniqueScores.has(entry.name)) {
        uniqueScores.set(entry.name, score)
      }
    })

    return Array.from(uniqueScores.values())
  }, [data, optimisticScores])

  const filteredScores = useMemo(() => {
    return scores.filter((score) =>
      score.athleteName.toLowerCase().includes(searchInput.toLowerCase()),
    )
  }, [scores, searchInput])

  const handleScoreChange = async (
    entryId: string,
    newScore: string,
    isCompleted?: boolean,
  ) => {
    setOptimisticScores((prev) => ({ ...prev, [entryId]: newScore }))
    if (isCompleted !== undefined) {
      setOptimisticCompletions((prev) => ({ ...prev, [entryId]: isCompleted }))
    }

    try {
      const entry = data?.getEntriesByWorkoutId.find((e) => e.id === entryId)
      if (!entry) {
        console.error('❌ Entry not found:', entryId)
        return
      }

      const scoreIsCompleted =
        isCompleted !== undefined ? isCompleted : entry.score?.isCompleted || false

      if (entry?.score) {
        await updateScore({
          variables: {
            id: entry.score.id,
            value: newScore,
            isCompleted: scoreIsCompleted,
          },
          refetchQueries: ['GetEntriesByWorkoutId'],
        })
      } else {
        if (!entry.laneByWorkoutId?.id) {
          console.error('❌ No lane ID found for entry:', entryId)
          alert(
            '❌ Cannot enter score: This entry has not been assigned to a heat yet.\n\nPlease go to the Workouts tab and use "Auto-Assign All" to assign all entries to heats before entering scores.',
          )
          return
        }

        await createScore({
          variables: {
            laneId: entry.laneByWorkoutId?.id,
            value: newScore,
            isCompleted: scoreIsCompleted,
          },
          refetchQueries: ['GetEntriesByWorkoutId'],
        })
      }

      await refetch()
    } catch (error) {
      console.error('❌ Failed to update/create score:', error)

      setOptimisticScores((prev) => {
        const { [entryId]: _, ...rest } = prev
        return rest
      })
      if (isCompleted !== undefined) {
        setOptimisticCompletions((prev) => {
          const { [entryId]: _, ...rest } = prev
          return rest
        })
      }
    }
  }

  // Calculate unit label outside of columns for better reactivity
  const getScoreUnitLabel = () => {
    if (workout?.scoreType === 'REPS_OR_TIME_COMPLETION_BASED') {
      if (editingScore) {
        const isCompleted =
          editingScore in optimisticCompletions
            ? optimisticCompletions[editingScore]
            : scores.find((s) => s.id === editingScore)?.isCompleted

        return isCompleted ? '(Time)' : '(Reps)'
      }
      return '(Reps/Time)'
    }
    return workout?.unitOfMeasurement
      ? `(${formatUnitOfMeasurement(workout.unitOfMeasurement)})`
      : ''
  }

  const columns = useMemo(
    () =>
      [
        {
          accessorKey: 'athleteName',
          header: ({ column }: { column: any }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-gray-100 hover:text-gray-500"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }: { row: Row<Score> }) => (
            <div>
              <div>{row.original.athleteName}</div>
              {row.original.teamMembers.length > 0 && (
                <div className="text-sm">{row.original.teamMembers.join(', ')}</div>
              )}
            </div>
          ),
        },
        {
          accessorKey: 'ticketType',
          header: 'Ticket Type',
        },
        {
          accessorKey: 'heat',
          header: ({ column }: { column: Column<Score> }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-gray-100 hover:text-gray-500"
            >
              Heat
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }: { row: Row<Score> }) => (
            <div className="text-center">
              <div>{row.original.heat}</div>
              {row.original.heatTime && (
                <div className="text-sm">
                  {dayjs(row.original.heatTime).format('HH:mm')}
                </div>
              )}
            </div>
          ),
        },
        {
          accessorKey: 'score',
          header: ({ column }: { column: any }) => (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
              className="hover:bg-gray-100 hover:text-gray-500"
            >
              Score {getScoreUnitLabel()}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          ),
          cell: ({ row }: { row: Row<Score> }) => (
            <div className="flex items-center justify-center space-x-2">
              {editingScore === row.original.id ? (
                <ScoreInput
                  scoreId={row.original.id}
                  currentScore={
                    row.original.id in optimisticScores
                      ? optimisticScores[row.original.id]
                      : row.original.score === 'N/A'
                        ? ''
                        : row.original.score.toString()
                  }
                  isCompleted={
                    row.original.id in optimisticCompletions
                      ? optimisticCompletions[row.original.id]
                      : row.original.isCompleted || false
                  }
                  isCompletionBased={
                    workout?.scoreType === 'REPS_OR_TIME_COMPLETION_BASED'
                  }
                  unitLabel={getScoreUnitLabel()}
                  placeholder={
                    workout?.scoreType === 'REPS_OR_TIME_COMPLETION_BASED'
                      ? (
                          row.original.id in optimisticCompletions
                            ? optimisticCompletions[row.original.id]
                            : row.original.isCompleted
                        )
                        ? 'e.g. 12:34'
                        : 'e.g. 485'
                      : ''
                  }
                  onSave={(score, isCompleted) => {
                    handleScoreChange(row.original.id, score, isCompleted)
                    setEditingScore(null)
                  }}
                  onCancel={() => {
                    setEditingScore(null)
                    setOptimisticScores((prev) => {
                      const { [row.original.id]: _, ...rest } = prev
                      return rest
                    })
                    setOptimisticCompletions((prev) => {
                      const { [row.original.id]: _, ...rest } = prev
                      return rest
                    })
                  }}
                  onCompletionChange={(isCompleted) => {
                    console.log('🔄 Completion changed in table:', {
                      rowId: row.original.id,
                      newStatus: isCompleted,
                    })
                    setOptimisticCompletions((prev) => ({
                      ...prev,
                      [row.original.id]: isCompleted,
                    }))
                  }}
                />
              ) : (
                <>
                  <div className="flex flex-col items-center">
                    <span>{row.original.score}</span>
                    {workout?.scoreType === 'REPS_OR_TIME_COMPLETION_BASED' && (
                      <span className="text-xs">
                        {row.original.isCompleted ? '✓ Completed' : '○ Incomplete'}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingScore(row.original.id)
                      setOptimisticScores((prev) => ({
                        ...prev,
                        [row.original.id]:
                          row.original.score === 'N/A'
                            ? ''
                            : row.original.score.toString(),
                      }))
                      setOptimisticCompletions((prev) => ({
                        ...prev,
                        [row.original.id]: row.original.isCompleted || false,
                      }))
                    }}
                    className="p-0 h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ),
        },
        ...(workout?.unitOfMeasurement === 'MINUTES' ||
        workout?.unitOfMeasurement === 'SECONDS'
          ? [
              {
                id: 'timer',
                header: 'Timer',
                cell: ({ row }: { row: Row<Score> }) => (
                  <TimerCell
                    id={row.original.id}
                    workoutId={selectedWorkoutId as string}
                  />
                ),
              },
            ]
          : []),
      ] as any,
    [
      editingScore,
      optimisticCompletions,
      optimisticScores,
      workout,
      scores,
      selectedWorkoutId,
    ],
  )

  const table = useReactTable({
    data: filteredScores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  // Force table key to change when completion status changes to ensure re-render
  const tableKey = `${editingScore}-${JSON.stringify(optimisticCompletions)}`

  if (loading) {
    return <div>Loading scores...</div>
  }

  const handleVisibilityToggle = async (isVisible: boolean) => {
    if (!selectedWorkoutId) return

    try {
      await updateWorkoutVisibility({
        variables: { id: selectedWorkoutId, isVisible },
      })
    } catch (error) {
      console.error('Failed to update workout visibility:', error)
    }
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md flex flex-col h-fit">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="workout-visibility"
            checked={workout?.isVisible || false}
            onCheckedChange={handleVisibilityToggle}
          />
          <Label htmlFor="workout-visibility" className="flex items-center">
            Share Results
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-1 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    When enabled, workout results will be visible in the leaderboard. You
                    need to enable this for each workout.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
        </div>
      </div>
      <Table key={tableKey}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="h-10 hover:bg-gray-100">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="px-4 text-gray-500 hover:bg-gray-100 hover:text-gray-500"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="h-12 bg-white hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default ScoresTable
