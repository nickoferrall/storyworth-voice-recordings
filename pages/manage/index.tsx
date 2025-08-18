import React, { useState, useMemo } from 'react'
import {
  Competition,
  useCloneCompetitionMutation,
  useDeleteCompetitionMutation,
  useGetViewerCompsQuery,
} from '../../src/generated/graphql'
import { formatHumanReadableDate } from '../../utils/makeDateReadable'
import { useRouter } from 'next/router'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../src/components/ui/table'
import { Button } from '../../src/components/ui/button'
import {
  MoreHorizontal,
  Copy,
  Trash2,
  ArrowUpDown,
  UserPlus,
  Loader2,
} from 'lucide-react'
import { toast } from '../../src/hooks/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu'
import DeleteModal from '../../components/DeleteModal'
import { InviteToCompetitionModal } from '../../components/Competition/InviteToCompetitionModal'
import {
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

export const getServerSideProps = withAuth(async function (context: Context) {
  return {
    props: { user: context.user },
  }
})

const ManageCompsTable = () => {
  const { data, loading, refetch } = useGetViewerCompsQuery()
  const comps = data?.getCompetitionsByUser
  const router = useRouter()
  const [cloneComp] = useCloneCompetitionMutation()
  const [deleteComp] = useDeleteCompetitionMutation()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [competitionToDelete, setCompetitionToDelete] = useState<string | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [competitionToInvite, setCompetitionToInvite] = useState<{
    id: string
    name: string
  } | null>(null)
  const [cloningCompetitions, setCloningCompetitions] = useState<Set<string>>(new Set())
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])

  const compsData = useMemo(() => {
    if (!comps) return []
    return comps.map((comp) => ({
      id: comp.id,
      name: comp.name,
      date: comp.startDateTime ? new Date(comp.startDateTime) : null,
      dateString: comp.startDateTime
        ? formatHumanReadableDate(comp.startDateTime)
        : 'N/A',
      participants: comp.registrationsCount,
    }))
  }, [comps])

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }: { column: any }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: any }) => (
        <Link
          href={`/${row.original.id}/overview`}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline text-inherit"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'date',
      header: ({ column }: { column: any }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date of Comp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }: { row: any }) => row.original.dateString,
    },
    {
      accessorKey: 'participants',
      header: 'Participants',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-1">
          {/* Desktop: Show individual buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setCompetitionToInvite({ id: row.original.id, name: row.original.name })
                setInviteModalOpen(true)
              }}
              className="h-8 px-3"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Invite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleClone(row.original.id)
              }}
              disabled={cloningCompetitions.has(row.original.id)}
              className="h-8 px-3"
            >
              {cloningCompetitions.has(row.original.id) ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Copy className="h-4 w-4 mr-1.5" />
              )}
              {cloningCompetitions.has(row.original.id) ? 'Cloning...' : 'Clone'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setCompetitionToDelete(row.original.id)
                setDeleteModalOpen(true)
              }}
              className="h-8 px-3"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>

          {/* Mobile: Show dropdown menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompetitionToInvite({
                      id: row.original.id,
                      name: row.original.name,
                    })
                    setInviteModalOpen(true)
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Manager
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClone(row.original.id)
                  }}
                  disabled={cloningCompetitions.has(row.original.id)}
                >
                  {cloningCompetitions.has(row.original.id) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {cloningCompetitions.has(row.original.id) ? 'Cloning...' : 'Clone'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setCompetitionToDelete(row.original.id)
                    setDeleteModalOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: compsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  })

  const handleRowClick = (row: Competition) => {
    const id = row.id
    router.push(`/${id}/overview`)
  }

  const handleClone = async (id: string) => {
    setCloningCompetitions((prev) => new Set(prev).add(id))

    try {
      const result = await cloneComp({
        variables: { id },
        refetchQueries: ['GetViewerComps'],
        awaitRefetchQueries: true,
      })

      toast({
        title: 'Competition Cloned',
        description: 'The competition has been successfully cloned.',
      })
    } catch (error) {
      toast({
        title: 'Clone Failed',
        description: 'Failed to clone the competition. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setCloningCompetitions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleDelete = async (id: string) => {
    await deleteComp({ variables: { id } })
    setDeleteModalOpen(false)
    setCompetitionToDelete(null)
    refetch()
  }

  return (
    <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 xl:pt-12 h-full w-full">
      <div className="w-full md:w-3/4 flex justify-between items-center pb-6">
        <h2 className="text-2xl font-semibold">Your Competitions</h2>
        <Button asChild>
          <Link href="/create">Create New Competition</Link>
        </Button>
      </div>
      <div className="w-full md:w-3/4 overflow-x-auto">
        <div className="w-full bg-white p-6 rounded-lg shadow-md flex flex-col h-fit">
          <Table>
            <TableHeader className="hover:bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-gray-100">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="hover:bg-gray-100">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading || !data ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading competitions...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    You need to{' '}
                    <Link href="/create" className="text-purple-500 underline">
                      create
                    </Link>{' '}
                    your first competition.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleRowClick(row.original as any)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        handleDelete={handleDelete}
        id={competitionToDelete || ''}
        title="Delete Competition"
        description="Are you sure you want to delete this competition? This action cannot be undone."
      />

      {competitionToInvite && (
        <InviteToCompetitionModal
          open={inviteModalOpen}
          onClose={() => {
            setInviteModalOpen(false)
            setCompetitionToInvite(null)
          }}
          competitionId={competitionToInvite.id}
          competitionName={competitionToInvite.name}
        />
      )}
    </div>
  )
}

export default ManageCompsTable
