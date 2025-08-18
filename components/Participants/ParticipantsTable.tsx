'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  Column,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus } from 'lucide-react'

import { Button } from '../../src/components/ui/button'
import { Checkbox } from '../../src/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  GetHeatsByCompetitionIdDocument,
  useCheckInAthleteMutation,
  useGetRegistrationsByCompetitionIdQuery,
  useGetRegistrationsForExportLazyQuery,
  QuestionType,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import { formatHumanReadableDateNoYear } from '../../utils/makeDateReadable'
import ParticipantsRow from './ParticipantsRow'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import ParticipantModal from './ParticipantModal'
import { parseISO } from 'date-fns'
import { Toaster } from '../../src/components/ui/toaster'
import UploadParticipantsModal from './UploadParticipantsModal'
import {
  WhiteBgDropdownMenu,
  WhiteBgDropdownMenuContent,
  WhiteBgDropdownMenuItem,
  WhiteBgDropdownMenuTrigger,
} from '../../src/components/ui/white-bg-dropdown-menu'

export type Participant = {
  id: string
  name: string
  teamName?: string | null
  division: string
  isVolunteer: boolean
  isTeam: boolean
  members?: string[]
  registeredAt: string
  registeredAtDate: Date
  isCheckedIn: boolean
  teamId?: string
  userId: string
  userEmail: string
}

export function ParticipantsTable() {
  const [filterType, setFilterType] = useState<string>('All')
  const competitionId = useCompetitionId()
  const { data, loading } = useGetRegistrationsByCompetitionIdQuery({
    variables: { competitionId: competitionId || '' },
    skip: !competitionId,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [searchInput, setSearchInput] = useState<string>('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [viewingRegistrantId, setViewingRegistrantId] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [getRegistrationsForExport] = useGetRegistrationsForExportLazyQuery()

  const handleViewMore = (registrantId: string) => {
    setViewingRegistrantId(registrantId)
  }

  const handleExportCsv = async () => {
    try {
      setIsExporting(true)
      const exportRes = await getRegistrationsForExport({
        variables: { competitionId: competitionId || '' },
        fetchPolicy: 'network-only',
      })
      const regs = exportRes.data?.getRegistrationsByCompetitionId || []
      const headers = ['Name', 'Email', 'Ticket Type', 'Team', 'Checked In']
      const allQuestions = new Set<string>()
      regs.forEach((r) => {
        r.registrationAnswers
          ?.filter((ra) => {
            const isStatement = ra.registrationField?.type === QuestionType.Statement
            const isCustom = ra.registrationField?.isEditable === true
            return isCustom && !isStatement && Boolean(ra.answer && ra.answer.trim())
          })
          .forEach((ra) => {
            if (ra.registrationField?.question)
              allQuestions.add(ra.registrationField.question)
          })
      })
      const questionHeaders = Array.from(allQuestions)
      const csvHeaders = [...headers, ...questionHeaders]

      const rows = regs.map((r) => {
        const base = [
          r.user.name || '',
          r.user.email || '',
          r.ticketType.name || '',
          r.team?.name || r.teamName || '',
          r.isCheckedIn ? 'Yes' : 'No',
        ]
        const answerMap = new Map<string, string>()
        r.registrationAnswers
          ?.filter((ra) => {
            const isStatement = ra.registrationField?.type === QuestionType.Statement
            const isCustom = ra.registrationField?.isEditable === true
            return isCustom && !isStatement && Boolean(ra.answer && ra.answer.trim())
          })
          .forEach((ra) => {
            const q = ra.registrationField?.question || ''
            let a = ra.answer
            const t = ra.registrationField?.type
            if (
              t === QuestionType.MultipleChoice ||
              t === QuestionType.MultipleChoiceSelectOne
            ) {
              a =
                (ra.registrationField?.options || []).find((o) => o === ra.answer) ||
                ra.answer
            }
            answerMap.set(q, a)
          })
        const answers = questionHeaders.map((q) => answerMap.get(q) || '')
        return [...base, ...answers]
      })

      const escapeVal = (val: string) => {
        const s = String(val ?? '')
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
      }

      const csv = [csvHeaders, ...rows]
        .map((row) => row.map(escapeVal).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'participants.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    if (data?.getRegistrationsByCompetitionId) {
      const participantsList: Participant[] = data.getRegistrationsByCompetitionId.map(
        (registration) => ({
          id: registration.id,
          name: `${registration.user.name}`,
          teamName: registration.teamName,
          division: registration.ticketType.name,
          isVolunteer: registration.ticketType.isVolunteer,
          isTeam: registration.ticketType.teamSize > 1,
          registeredAt: formatHumanReadableDateNoYear(registration.createdAt),
          registeredAtDate: parseISO(registration.createdAt),
          isCheckedIn: registration.isCheckedIn,
          teamId: registration?.team?.id,
          userId: registration.user.id,
          userEmail: registration.user.email,
        }),
      )
      setParticipants(participantsList)
    }
  }, [data])

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      if (filterType === 'Teams') {
        return a.teamName?.localeCompare(b.teamName || '') || 0
      } else {
        return a.name.localeCompare(b.name)
      }
    })
  }, [participants, filterType])

  const groupedParticipants = useMemo(() => {
    if (filterType !== 'Teams') {
      return sortedParticipants
    }

    const teamMap = new Map<string, Participant>()
    sortedParticipants.forEach((participant) => {
      if (participant.isTeam) {
        const teamKey = `${participant.teamName || 'Unnamed Team'}-${participant.teamId}`
        const existingTeam = teamMap.get(teamKey)
        if (!existingTeam) {
          teamMap.set(teamKey, {
            ...participant,
            name: participant.teamName || 'Unnamed Team',
            members: [participant.name],
          })
        } else {
          existingTeam.members = [...(existingTeam.members || []), participant.name]
        }
      }
    })

    return Array.from(teamMap.values())
  }, [sortedParticipants, filterType])

  const filteredParticipants = useMemo(() => {
    return groupedParticipants.filter((participant) => {
      const participantName = participant.name.toLowerCase()
      const searchValue = searchInput.toLowerCase()
      const matchesSearch = participantName.includes(searchValue)

      switch (filterType) {
        case 'Athletes':
          return !participant.isVolunteer && matchesSearch
        case 'Volunteers':
          return participant.isVolunteer && matchesSearch
        case 'Teams':
          // Show all team registrations, including incomplete teams
          return participant.isTeam && matchesSearch
        default:
          return matchesSearch
      }
    })
  }, [groupedParticipants, searchInput, filterType])

  const [deletingId, setDeletingId] = useState<null | string>(null)
  const [checkInAthlete] = useCheckInAthleteMutation()

  const handleCheckIn = async (registrationId: string, isCheckedIn: boolean) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === registrationId ? { ...p, isCheckedIn } : p)),
    )

    try {
      await checkInAthlete({
        variables: {
          isCheckedIn,
          registrationId,
        },
        refetchQueries: [
          {
            query: GetHeatsByCompetitionIdDocument,
            variables: { competitionId },
          },
        ],
      })
    } catch (error) {
      console.error('Error checking in athlete:', error)
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === registrationId ? { ...p, isCheckedIn: !isCheckedIn } : p,
        ),
      )
    }
  }

  const columns: ColumnDef<Participant>[] = [
    {
      id: 'order',
      header: () => <div className="w-12 text-center">#</div>,
      cell: ({ row }: { row: Row<Participant> }) => (
        <div className="w-12 text-center">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }: { column: Column<Participant> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="pl-0 justify-start hover:bg-gray-100 hover:text-gray-500"
        >
          {filterType === 'Teams' ? 'Team Name' : 'Name'}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: Row<Participant> }) =>
        filterType === 'Teams' ? row.original.teamName : row.original.name,
    },
    {
      accessorKey: 'members',
      header: 'Team Members',
      cell: ({ row }: { row: Row<Participant> }) => {
        const members = row.original.members
        if (!members || members.length === 0) return null
        const displayText =
          members.length > 2 ? `${members[0]}, ${members[1]}...` : members.join(', ')
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-sm cursor-pointer">
                {displayText}
              </TooltipTrigger>
              <TooltipContent>
                <ul className="list-disc pl-4">
                  {members.map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      accessorKey: 'division',
      header: ({ column }: { column: Column<Participant> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="pl-0 justify-start hover:bg-gray-100 hover:text-gray-500"
        >
          Ticket Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'isVolunteer',
      header: 'Type',
      cell: ({ row }: { row: Row<Participant> }) =>
        row.getValue('isVolunteer') ? 'Volunteer' : 'Athlete',
    },
    {
      accessorKey: 'registeredAtDate',
      header: ({ column }: { column: Column<Participant> }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="pl-0 justify-start hover:bg-gray-100 hover:text-gray-500"
        >
          Registered At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: Row<Participant> }) => (
        <div className="pl-0">{row.original.registeredAt}</div>
      ),
    },
    {
      accessorKey: 'isCheckedIn',
      header: 'Checked In',
      cell: ({ row }: { row: Row<Participant> }) => (
        <div className="flex justify-center align-middle">
          <Checkbox
            checked={row.original.isCheckedIn}
            onCheckedChange={(value) => handleCheckIn(row.original.id, Boolean(value))}
            aria-label="Check in"
          />
        </div>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: { row: Row<Participant> }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewMore(row.original.id)}>
              View More Info
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setDeletingId(row.original.id)}>
              {filterType === 'Teams' ? 'Delete Team' : 'Delete Participant'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ].filter((column) => (filterType === 'Teams' ? true : column.accessorKey !== 'members'))

  const table = useReactTable({
    data: filteredParticipants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row gap-2 py-4">
          <div className="flex gap-2 sm:ml-auto order-1 w-fit sm:order-2">
            <Button variant="outline" onClick={handleExportCsv} disabled={isExporting}>
              {isExporting ? 'Exporting…' : 'Download CSV'}
            </Button>
            <Button variant="outline" onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Athlete
            </Button>
          </div>
          <div className="flex gap-2 order-2 sm:order-1 w-full sm:w-auto sm:flex-1">
            <Input
              placeholder="Filter names..."
              value={searchInput}
              onChange={handleSearchChange}
              className="bg-white w-full placeholder:text-gray-500"
            />
            <WhiteBgDropdownMenu>
              <WhiteBgDropdownMenuTrigger asChild>
                <Button variant="outline" className="w-fit whitespace-nowrap">
                  {filterType} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </WhiteBgDropdownMenuTrigger>
              <WhiteBgDropdownMenuContent align="end">
                {['All', 'Athletes', 'Volunteers', 'Teams'].map((type) => (
                  <WhiteBgDropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                    {type}
                  </WhiteBgDropdownMenuItem>
                ))}
              </WhiteBgDropdownMenuContent>
            </WhiteBgDropdownMenu>
          </div>
        </div>
        <div className="rounded-xl border bg-white overflow-hidden">
          <Table className="rounded-xl">
            <TableHeader className="rounded-xl">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="bg-white rounded-xl hover:bg-gray-100"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-gray-500 hover:bg-gray-100 hover:text-gray-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="rounded-xl">
              {table.getRowModel().rows?.length ? (
                table
                  .getRowModel()
                  .rows.map((row, index) => (
                    <ParticipantsRow
                      key={row.id}
                      row={row}
                      deletingId={deletingId}
                      setDeletingId={setDeletingId}
                      registrant={row.original}
                      filterType={filterType}
                      orderNumber={index + 1}
                    />
                  ))
              ) : (
                <TableRow className="bg-white">
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <ParticipantModal
        open={!!viewingRegistrantId}
        onClose={() => setViewingRegistrantId(null)}
        registrantId={viewingRegistrantId}
      />
      <UploadParticipantsModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
      <Toaster />
    </>
  )
}

export default ParticipantsTable
