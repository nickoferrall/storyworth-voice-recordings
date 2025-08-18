import React from 'react'
import { flexRender } from '@tanstack/react-table'
import {
  GetHeatsByCompetitionIdDocument,
  GetRegistrationsByCompetitionIdDocument,
  useDeleteRegistrationMutation,
  useDeleteTeamMutation,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import { TableCell, TableRow } from '../../src/components/ui/table'
import DeleteModal from '../DeleteModal'
import { Participant } from './ParticipantsTable'
import { Row } from '@tanstack/react-table'

type Props = {
  row: Row<Participant>
  registrant: Participant
  setDeletingId: (id: string | null) => void
  deletingId: string | null
  filterType: string
  orderNumber: number
}

const ParticipantsRow = (props: Props) => {
  const { row, registrant, deletingId, setDeletingId, filterType, orderNumber } = props
  const [deleteRegistration, { error: deleteRegistrationError }] =
    useDeleteRegistrationMutation()
  const [deleteTeam, { error: deleteTeamError }] = useDeleteTeamMutation()
  const competitionId = useCompetitionId()
  const isTeamFilter = filterType === 'Teams'

  const isOpen = deletingId === registrant.id

  const handleDelete = async () => {
    try {
      if (isTeamFilter) {
        await deleteTeam({
          variables: {
            teamId: registrant.teamId!,
            competitionId,
          },
          refetchQueries: [
            {
              query: GetHeatsByCompetitionIdDocument,
              variables: { competitionId },
            },
            {
              query: GetRegistrationsByCompetitionIdDocument,
              variables: { competitionId },
            },
          ],
        })
      } else {
        await deleteRegistration({
          variables: {
            userId: registrant.userId,
            registrationId: registrant.id,
            competitionId,
          },
          refetchQueries: [
            {
              query: GetHeatsByCompetitionIdDocument,
              variables: { competitionId },
            },
            {
              query: GetRegistrationsByCompetitionIdDocument,
              variables: { competitionId },
            },
          ],
        })
      }

      onClose()
    } catch (error) {
      console.error(`Error deleting ${isTeamFilter ? 'team' : 'registration'}:`, error)
      // Handle error (e.g., show error message to user)
    }
  }

  const onClose = () => {
    setDeletingId(null)
  }

  return (
    <>
      <TableRow
        className="bg-white rounded-xl hover:bg-gray-100"
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
      >
        {row.getVisibleCells().map((cell) => {
          if (cell.column.id === 'order') {
            return (
              <TableCell key={cell.id} className="w-12 text-center">
                {orderNumber}
              </TableCell>
            )
          }
          return (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
      <DeleteModal
        open={isOpen}
        id={registrant.id}
        handleDelete={handleDelete}
        title={`Remove ${isTeamFilter ? 'Team' : 'User'}`}
        description={`Are you sure you want to remove ${
          isTeamFilter ? registrant.teamName : registrant.name
        }?`}
        onClose={onClose}
        error={(isTeamFilter ? deleteTeamError : deleteRegistrationError)?.message}
      />
    </>
  )
}

export default ParticipantsRow
