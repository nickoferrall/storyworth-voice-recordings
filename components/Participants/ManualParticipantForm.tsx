// components/Participants/ManualParticipantForm.tsx
import React, { useState, useEffect } from 'react'
import { Input } from '../../src/components/ui/input'
import { Button } from '../../src/components/ui/button'
import {
  WhiteBgSelect as Select,
  WhiteBgSelectContent as SelectContent,
  WhiteBgSelectItem as SelectItem,
  WhiteBgSelectTrigger as SelectTrigger,
  WhiteBgSelectValue as SelectValue,
} from '../../src/components/ui/white-bg-select'
import { TicketTypeUploader } from './UploadParticipantsModal'
import { v4 as uuidv4 } from 'uuid'
import { Loader2 } from 'lucide-react'
import {
  GetHeatsByCompetitionIdDocument,
  GetRegistrationsByCompetitionIdDocument,
  GetTicketTypesByCompetitionIdQuery,
  GetUnassignedEntriesByCompetitionIdDocument,
} from '../../src/generated/graphql'
import ErrorMessage from '../Layout/ErrorMessage'
import useCompetitionId from '../../hooks/useCompetitionId'

type Props = {
  onCancel: () => void
  selectedTicketType: TicketTypeUploader | null
  setSelectedTicketType: (ticketType: TicketTypeUploader) => void
  ticketTypesData: GetTicketTypesByCompetitionIdQuery | undefined
  createBulkRegistrations: any
  onClose: () => void
}

const ManualParticipantForm = ({
  onCancel,
  selectedTicketType,
  setSelectedTicketType,
  ticketTypesData,
  createBulkRegistrations,
  onClose,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [participants, setParticipants] = useState<
    Array<{ name: string; email: string }>
  >([{ name: '', email: '' }])
  const [teamName, setTeamName] = useState('')
  const isTeam = (selectedTicketType?.teamSize || 1) > 1
  const safeTeamSize = selectedTicketType?.teamSize ?? 1
  const [error, setError] = useState<string | null>(null)
  const competitionId = useCompetitionId()

  const handleTicketTypeChange = (ticketId: string) => {
    const ticket = ticketTypesData?.getTicketTypesByCompetitionId?.find(
      (t: TicketTypeUploader) => t.id === ticketId,
    )
    if (ticket) {
      setSelectedTicketType(ticket)
    }
  }

  useEffect(() => {
    if (selectedTicketType) {
      const teamSize = selectedTicketType.teamSize || 1
      setParticipants((current) => {
        const newParticipants = [...current]
        while (newParticipants.length < teamSize) {
          newParticipants.push({ name: '', email: '' })
        }
        while (newParticipants.length > teamSize) {
          newParticipants.pop()
        }
        return newParticipants
      })
    }
  }, [selectedTicketType])

  const getValidationError = () => {
    if (!selectedTicketType) {
      return 'Please select a ticket type'
    }
    // Team name should not be required in manual add flow
    if (participants.some((p) => !p.name.trim())) {
      return 'All participant names are required'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = getValidationError()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    if (!selectedTicketType) {
      setError('Please select a ticket type')
      return
    }

    const teamId = safeTeamSize > 1 ? uuidv4() : undefined
    setIsSubmitting(true)
    try {
      const registrations = participants.map((participant) => {
        const [firstName, ...lastNameParts] = participant.name.trim().split(' ')
        const lastName = lastNameParts.join(' ')

        return {
          firstName,
          lastName,
          email: participant.email || '',
          ticketTypeId: selectedTicketType.id,
          teamName: teamId ? teamName : undefined,
          teamGroupId: teamId,
        }
      })

      await createBulkRegistrations({
        variables: {
          input: registrations,
        },
        refetchQueries: [
          {
            query: GetRegistrationsByCompetitionIdDocument,
            variables: { competitionId },
          },
          {
            query: GetHeatsByCompetitionIdDocument,
            variables: { competitionId },
          },
          {
            query: GetUnassignedEntriesByCompetitionIdDocument,
            variables: { competitionId },
            fetchPolicy: 'network-only',
          },
        ],
        awaitRefetchQueries: true,
      })

      onClose()
    } catch (error: any) {
      console.error('Error creating registrations:', error)
      setError(error.message || 'Failed to create registrations')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage error={error} />}

      <div className="space-y-2">
        <label className="text-sm font-medium">Ticket Type</label>
        <Select
          value={selectedTicketType?.id || ''}
          onValueChange={handleTicketTypeChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            {ticketTypesData?.getTicketTypesByCompetitionId?.map(
              (ticket: TicketTypeUploader) => (
                <SelectItem key={ticket.id} value={ticket.id}>
                  {ticket.name}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {isTeam && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Team Name</label>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name"
          />
        </div>
      )}

      {participants.map((participant, index) => (
        <div key={index} className="space-y-4 pt-4 border-t first:border-t-0 first:pt-0">
          <h3 className="font-medium">
            {safeTeamSize > 1 ? `Team Member ${index + 1}` : 'Participant'}
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              required
              value={participant.name}
              onChange={(e) => {
                const newParticipants = [...participants]
                newParticipants[index].name = e.target.value
                setParticipants(newParticipants)
              }}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email (Optional)</label>
            <Input
              type="email"
              value={participant.email}
              onChange={(e) => {
                const newParticipants = [...participants]
                newParticipants[index].email = e.target.value
                setParticipants(newParticipants)
              }}
              placeholder="Enter email address"
            />
          </div>
        </div>
      ))}

      {safeTeamSize > 1 && (
        <p className="text-sm text-muted-foreground">
          This ticket type requires {safeTeamSize} team members.
        </p>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !!getValidationError()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Add ${safeTeamSize > 1 ? 'Team' : 'Participant'}`
          )}
        </Button>
      </div>
    </form>
  )
}

export default ManualParticipantForm
