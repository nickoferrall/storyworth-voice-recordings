'use client'
import { Portal } from '@radix-ui/react-portal'
import React, { useState, useMemo, useEffect } from 'react'
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  Row,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Info } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu'
import { Input } from '../../src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/ui/table'
import {
  useGetEntriesByCompetitionIdQuery,
  useGetWorkoutsByCompetitionIdQuery,
} from '../../src/generated/graphql'

import { Tabs, TabsList, TabsTrigger } from '../../src/components/ui/tabs'
import { upperFirst } from '../../lib/upperFirst'
import { LeaderboardEntry, useLeaderboardData } from '../../hooks/useLeaderboardData'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { Card, CardHeader, CardTitle, CardContent } from '../../src/components/ui/card'
import Dropdown from '../Dropdown'
import { Menu } from '../Menu/Menu'
import { MenuContent } from '../Menu/MenuContext'
import { MenuItem } from '../Menu/MenuItem'

const TotalScoreHeader = () => (
  <div className="flex items-center justify-center">
    Total Score
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" className="p-0 h-auto ml-1">
            <Info className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sum of ranks across all workouts. Lower is better.</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)

const WorkoutCell = ({
  row,
  workout,
  activeTab,
  workoutRankings,
  isAdminView = false,
}) => {
  const score = row.original.scores.find((s) => s.workoutId === workout.id)

  // Get the total number of participants for this workout in this category
  const totalParticipants = workoutRankings[activeTab]?.[workout.id]?.length || 0

  // If there's no score or empty score, show last place rank (totalParticipants + 1)
  if (!score || score.repsOrTime === '') {
    return (
      <div className="flex justify-between p-1">
        <span className="">{totalParticipants + 1}</span>
        <span className="">-</span>
      </div>
    )
  }

  const participantRanking =
    activeTab &&
    workoutRankings[activeTab]?.[workout.id]?.find((r) => r.entryId === row.original.id)

  const workoutRank = participantRanking ? participantRanking.rank : totalParticipants + 1

  const shouldShowScore = isAdminView || workout.isVisible

  return (
    <div className="flex justify-between p-1">
      <span className="">{shouldShowScore ? workoutRank : 'N/A'}</span>
      <span className="">{shouldShowScore ? score.repsOrTime : 'N/A'}</span>
    </div>
  )
}

type LeaderboardProps = {
  competitionId: string
  isAdminView?: boolean
}

export function Leaderboard({ competitionId, isAdminView = false }: LeaderboardProps) {
  const { data, loading } = useGetEntriesByCompetitionIdQuery({
    variables: { competitionId },
  })
  const { data: workoutsData } = useGetWorkoutsByCompetitionIdQuery({
    variables: { competitionId },
  })

  const workouts = useMemo(
    () =>
      workoutsData?.getWorkoutsByCompetitionId.map((workout) => ({
        id: workout.id,
        name: workout.name,
        unitOfMeasurement: workout.unitOfMeasurement,
        scoreType: workout.scoreType,
        isVisible: workout.isVisible,
      })) ?? [],
    [workoutsData],
  )

  const rawEntries = useMemo(() => {
    return (
      data?.getEntriesByCompetitionId.map((entry) => ({
        id: entry.id,
        name: entry.name,
        teamMembers: entry.team?.members.map((member) => member.user?.name!) || [],
        overallRank: 0,
        categoryRank: 0,
        totalScore: 0,
        workoutsCompleted: 0,
        ticketTypeId: entry.ticketType.id,
        ticketTypeName: entry.ticketType.name,
        isVolunteer: entry.ticketType.isVolunteer,
        scores: entry.scores.map((score) => ({
          workoutId: score.workout.id,
          repsOrTime: score.value,
          scoreType: score.workout.scoreType,
          isCompleted: score.isCompleted,
        })),
      })) ?? []
    )
  }, [data])

  const filteredWorkouts = useMemo(
    () => workouts.filter((workout) => isAdminView || workout.isVisible),
    [workouts, isAdminView],
  )

  const { entries, ticketTypes, workoutRankings } = useLeaderboardData(
    rawEntries,
    filteredWorkouts,
  )

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchInput, setSearchInput] = useState<string>('')
  const [activeTab, setActiveTab] = useState<string | null>(null)

  useEffect(() => {
    if (ticketTypes.length > 0 && !activeTab) {
      setActiveTab(ticketTypes[0])
    }
  }, [ticketTypes, activeTab])

  const filteredEntries = useMemo(() => {
    // Create a Map to store unique entries, using name as the key
    const uniqueEntries = new Map()

    entries
      .filter((entry) => {
        const entryName = entry.name.toLowerCase()
        const searchValue = searchInput.toLowerCase()
        const matchesSearch = entryName.includes(searchValue)
        const matchesTab =
          activeTab === 'All' || upperFirst(entry.ticketTypeName) === activeTab
        return matchesSearch && matchesTab
      })
      .sort((a, b) => {
        if (activeTab === 'All') {
          return a.overallRank - b.overallRank
        }
        return a.categoryRank - b.categoryRank
      })
      .forEach((entry) => {
        // Only add the entry if we haven't seen this name before
        if (!uniqueEntries.has(entry.name)) {
          uniqueEntries.set(entry.name, entry)
        }
      })

    return Array.from(uniqueEntries.values()).slice(0, 100) // Limit to top 100 entries
  }, [entries, searchInput, activeTab])

  // Ensure all hooks are called before any conditional returns
  const columns = useMemo<ColumnDef<LeaderboardEntry>[]>(
    () => [
      {
        accessorKey: 'rank',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Rank
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            {activeTab === 'All' ? row.original.overallRank : row.original.categoryRank}
          </div>
        ),
      },
      ...(workouts.length > 1
        ? [
            {
              accessorKey: 'totalScore',
              header: TotalScoreHeader,
              cell: ({ row }) => (
                <div className="flex justify-center">
                  {activeTab === 'All'
                    ? row.original.overallTotalScore
                    : row.original.categoryTotalScore}
                </div>
              ),
            },
          ]
        : []),
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <div className="text-white">{row.getValue('name')}</div>
            {Array.isArray(row.original.teamMembers) &&
              row.original.teamMembers.length > 0 && (
                <div className="text-sm" style={{ color: '#9ca3af' }}>
                  {row.original.teamMembers.join(', ')}
                </div>
              )}
          </div>
        ),
      },
      ...workouts.map((workout) => ({
        accessorKey: workout.name,
        header: () => (
          <div className="p-1">
            <span className="text-md">{upperFirst(workout.name)}</span>
            <div className="flex pt-1 justify-between text-xs">
              <span>Rank</span>
              <span>
                {workout.scoreType === 'REPS_OR_TIME_COMPLETION_BASED'
                  ? 'Reps/Time'
                  : upperFirst(workout.unitOfMeasurement)}
              </span>
            </div>
          </div>
        ),
        cell: ({ row }) => (
          <WorkoutCell
            row={row}
            workout={workout}
            activeTab={activeTab}
            workoutRankings={workoutRankings}
            isAdminView={isAdminView}
          />
        ),
      })),
    ],
    [workouts, activeTab, workoutRankings],
  )

  const table = useReactTable({
    data: filteredEntries,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const columnLabels: Record<string, string> = {
    overallRank: 'Overall Rank',
    name: 'Team Name',
    ...(workouts.length > 1 ? { totalScore: 'Total Score' } : {}),
  }

  // Move conditional returns after all hooks
  if (loading) {
    return (
      <div className="w-full bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold mb-4 text-white">Loading Leaderboard</h2>
        <p className="text-center max-w-md text-slate-300">
          Please wait while we fetch the latest leaderboard data...
        </p>
      </div>
    )
  }

  if (!workouts.length || entries.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-full">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-base text-muted-foreground">
              The leaderboard will be displayed here once participants start signing up
              for the event. Check back later to see how everyone is performing!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!activeTab) {
    return null
  }
  return (
    <div className="w-full bg-card text-card-foreground p-6 rounded-lg shadow-md flex flex-col h-full">
      <h2 className="text-xl text-center w-full font-semibold mb-1 text-white">
        Leaderboard
      </h2>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search..."
          value={searchInput}
          onChange={handleSearchChange}
          className="max-w-sm placeholder:text-gray-600"
        />
      </div>
      <div className="overflow-x-auto pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-max min-w-full">
          <TabsList>
            {ticketTypes.map((type) => (
              <TabsTrigger key={type} value={type}>
                {upperFirst(type)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="text-sm pb-3">Showing results for: {upperFirst(activeTab)}</div>
      <div className="flex-grow overflow-auto">
        <div className="rounded-md border h-full">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-card-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-card-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-card-foreground"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard
