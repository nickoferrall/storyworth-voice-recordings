import React, { useEffect, useState, Suspense, lazy } from 'react'
import { Menu } from '../Menu/Menu'
import { MenuContent } from '../Menu/MenuContext'
import { MenuItem } from '../Menu/MenuItem'
import {
  useGetHeatsByCompetitionIdQuery,
  useGetWorkoutNamesByCompetitionIdQuery,
  useGetScoreSettingByCompetitionIdQuery,
  useGenerateHeatsFromSettingsMutation,
  HeatLimitType,
  useCreateHeatsMutation,
  GetLanesByHeatIdDocument,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import dayjs from 'dayjs'
import { Button } from '../../src/components/ui/button'
import HeatsTable from './HeatsTable'
import { Plus, ChevronDown } from 'lucide-react'
import { Input } from '../../src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Separator } from '../../src/components/ui/separator'
import {
  WhiteBgSelect,
  WhiteBgSelectContent,
  WhiteBgSelectItem,
  WhiteBgSelectTrigger,
  WhiteBgSelectValue,
} from '../../src/components/ui/white-bg-select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../src/components/ui/dropdown-menu'
import { gql, useMutation, useApolloClient } from '@apollo/client'
const UnassignedEntriesTable = lazy(() => import('./UnassignedEntriesTable'))

const UNASSIGN_ALL_ENTRIES = gql`
  mutation UnassignAllEntries($competitionId: String!) {
    unassignAllEntries(competitionId: $competitionId)
  }
`

const Heats = () => {
  const [openHeatId, setOpenHeatId] = useState<string | null>(null)
  const competitionId = useCompetitionId()
  const apolloClient = useApolloClient()

  const { data: heatsData } = useGetHeatsByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })
  console.log('🚀 ~ heatsData:', heatsData)

  const { data: workoutNamesData } = useGetWorkoutNamesByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })

  const { data: scoreSettingData } = useGetScoreSettingByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })

  const [createHeats] = useCreateHeatsMutation()
  const [unassignAllEntries] = useMutation(UNASSIGN_ALL_ENTRIES)

  const workouts = workoutNamesData?.getWorkoutsByCompetitionId ?? []
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)

  useEffect(() => {
    if (workouts.length > 0 && !selectedWorkoutId) {
      setSelectedWorkoutId(workouts[0]?.id)
    }
  }, [workouts, selectedWorkoutId])

  const scoreSetting = scoreSettingData?.getScoreSettingByCompetitionId
  const [localMaxLimit, setLocalMaxLimit] = useState<string>('')

  useEffect(() => {
    setLocalMaxLimit(scoreSetting?.maxLimitPerHeat?.toString() || '')
  }, [scoreSetting?.maxLimitPerHeat])

  const selectedWorkoutName = workouts.find(
    (workout) => workout.id === selectedWorkoutId,
  )?.name

  const heats =
    heatsData?.getHeatsByCompetitionId.filter(
      (heat) => heat.workoutId === selectedWorkoutId,
    ) ?? []
  console.log('🚀 ~ heats:', heats)

  const isMultiDay = heats.some(
    (heat, index, array) =>
      index > 0 &&
      !dayjs(heat.startTime)
        .startOf('day')
        .isSame(dayjs(array[0].startTime).startOf('day')),
  )

  useEffect(() => {
    if (heats.length > 0 && openHeatId === null) {
      setOpenHeatId(heats[0].id)
    }
  }, [heats])

  const handleMenuClick = (workoutId: string) => {
    setSelectedWorkoutId(workoutId)
    setOpenHeatId(null)
  }

  const handleSettingChange = async (
    field: 'maxLimitPerHeat' | 'heatLimitType',
    value: number | string,
  ) => {
    try {
      if (!scoreSetting) return

      const inputSettings = {
        heatLimitType:
          field === 'heatLimitType'
            ? (value as HeatLimitType)
            : scoreSetting.heatLimitType,
        maxLimitPerHeat:
          field === 'maxLimitPerHeat' ? (value as number) : scoreSetting.maxLimitPerHeat,
        ticketTypeOrderIds: scoreSetting.ticketTypeOrderIds || [],
        oneTicketPerHeat: scoreSetting.oneTicketPerHeat,
      }

      await generateHeats({
        variables: {
          competitionId: competitionId as string,
          input: inputSettings,
        },
        refetchQueries: ['GetScoreSettingByCompetitionId', 'GetHeatsByWorkoutId'],
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleMaxLimitBlur = () => {
    const numValue = parseInt(localMaxLimit, 10)
    if (!isNaN(numValue)) {
      handleSettingChange('maxLimitPerHeat', numValue)
    } else {
      setLocalMaxLimit(scoreSetting?.maxLimitPerHeat?.toString() || '')
    }
  }

  const handleAddHeat = async () => {
    try {
      const heatsInput = workouts.map((workout) => {
        const workoutHeats =
          heatsData?.getHeatsByCompetitionId.filter(
            (heat) => heat.workoutId === workout.id,
          ) || []

        const lastHeat = workoutHeats.reduce((latest, current) => {
          return !latest || dayjs(current.startTime).isAfter(dayjs(latest.startTime))
            ? current
            : latest
        }, workoutHeats[0])

        const startTime = lastHeat
          ? dayjs(lastHeat.startTime).add(30, 'minutes').toDate()
          : dayjs().startOf('day').add(9, 'hours').toDate()

        return {
          workoutId: workout.id,
          startTime,
        }
      })

      await createHeats({
        variables: {
          input: heatsInput,
          competitionId: competitionId as string,
        },
        refetchQueries: ['GetHeatsByWorkoutId'],
      })

      refetch()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAutoAssign = async () => {
    try {
      await generateHeats({
        variables: {
          competitionId: competitionId as string,
          input: {
            heatLimitType: scoreSetting?.heatLimitType || HeatLimitType.Entries,
            maxLimitPerHeat: scoreSetting?.maxLimitPerHeat || 0,
            ticketTypeOrderIds: scoreSetting?.ticketTypeOrderIds || [],
            oneTicketPerHeat: scoreSetting?.oneTicketPerHeat || false,
          },
        },
        refetchQueries: ['GetUnassignedEntriesByWorkoutId', 'GetHeatsByWorkoutId'],
      })
    } catch (error) {}
  }

  const handleUnassignAll = async () => {
    try {
      if (!competitionId) return
      await unassignAllEntries({
        variables: { competitionId },
        refetchQueries: [
          'GetUnassignedEntriesByCompetitionId',
          'GetHeatsByWorkoutId',
          'GetHeatsByCompetitionId',
        ],
      })
    } catch (error) {}
  }

  const handleDownloadCsv = async () => {
    if (!competitionId || !heatsData) return
    const allHeats = heatsData.getHeatsByCompetitionId
      .slice()
      .sort(
        (a: any, b: any) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
    const workoutColumns = (workoutNamesData?.getWorkoutsByCompetitionId || []).map(
      (w) => w.name,
    )
    const headers = ['Entry', 'Ticket Type', 'Heat', 'Start Time', ...workoutColumns]
    const rows: string[][] = []
    for (const heat of allHeats) {
      const lanesRes = await apolloClient.query({
        query: GetLanesByHeatIdDocument,
        variables: { heatId: heat.id },
        fetchPolicy: 'network-only',
      })
      const lanes = lanesRes.data?.getLanesByHeatId || []
      for (const lane of lanes) {
        const teamMembers = (lane.entry?.team?.members || [])
          .map((m: any) => m.user?.name)
          .filter(Boolean)
        const entryName =
          teamMembers.length > 0 ? teamMembers.join(' & ') : lane.entry?.name || ''
        const ticketTypeName = lane.entry?.ticketType?.name || ''
        const startTime = dayjs(heat.startTime).format('HH:mm')
        const row = [
          entryName,
          ticketTypeName,
          heat.name,
          startTime,
          ...workoutColumns.map(() => ''),
        ]
        rows.push(row)
      }
    }
    const escape = (val: string) => {
      const v = val ?? ''
      if (v.includes(',') || v.includes('"') || v.includes('\n')) {
        return '"' + v.replace(/"/g, '""') + '"'
      }
      return v
    }
    const csv = [
      headers.map(escape).join(','),
      ...rows.map((r) => r.map(escape).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heats-${competitionId}-${dayjs().format('YYYYMMDD-HHmmss')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const [generateHeats] = useGenerateHeatsFromSettingsMutation()
  const { refetch } = useGetHeatsByCompetitionIdQuery({
    variables: { competitionId: competitionId as string },
    skip: !competitionId,
  })

  return (
    <div className="flex flex-col justify-start items-center w-full">
      <div className="flex flex-col w-full mb-4">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-semibold">Heats</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadCsv} disabled={!heatsData}>
              Download CSV
            </Button>
            <Button onClick={handleUnassignAll}>Unassign All</Button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm w-full text-left mt-1">
          By default, heats have a limit of
          <Input
            type="number"
            value={localMaxLimit}
            onChange={(e) => setLocalMaxLimit(e.target.value)}
            onBlur={handleMaxLimitBlur}
            className="w-16 h-6 text-sm"
          />
          <WhiteBgSelect
            value={scoreSetting?.heatLimitType || 'ENTRIES'}
            onValueChange={(value) => handleSettingChange('heatLimitType', value)}
          >
            <WhiteBgSelectTrigger className="w-24 h-6 text-sm">
              <WhiteBgSelectValue />
            </WhiteBgSelectTrigger>
            <WhiteBgSelectContent>
              <WhiteBgSelectItem value="ENTRIES">Entries</WhiteBgSelectItem>
              <WhiteBgSelectItem value="ATHLETES">Athletes</WhiteBgSelectItem>
            </WhiteBgSelectContent>
          </WhiteBgSelect>
          per heat
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircledIcon className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                Entries are registrations. A team of two is one entry. Athletes are
                individual competitors. You can adjust this for each heat by
                adding/deleting lanes.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col items-start w-full pb-3">
        <div className="flex justify-between items-center w-full">
          <Menu
            trigger={
              <button className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-700 focus:outline-none border border-purple-600 rounded-xl px-2 py-0.5 whitespace-nowrap">
                {selectedWorkoutName}
                <ChevronDown className="h-4 w-4" />
              </button>
            }
          >
            <MenuContent className="w-min" align="start">
              {workouts.map((workout) => (
                <MenuItem
                  key={workout.id}
                  className="py-2"
                  onClick={() => handleMenuClick(workout.id)}
                >
                  {workout.name}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        </div>
      </div>

      <HeatsTable
        workoutId={selectedWorkoutId}
        openHeatId={openHeatId}
        setOpenHeatId={setOpenHeatId}
      />
      <div className="w-full pt-6">
        <Button variant="outline" onClick={handleAddHeat}>
          <Plus className="mr-1" />
          Add Heat
        </Button>
      </div>

      <Separator className="my-8" />

      <UnassignedEntriesTable selectedWorkoutId={selectedWorkoutId} />
    </div>
  )
}

export default Heats
