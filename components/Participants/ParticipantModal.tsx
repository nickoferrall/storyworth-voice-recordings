import React, { useState } from 'react'
import {
  useGetRegistrationByIdQuery,
  useUpdateTeamMutation,
  useGetInvitationsByTeamIdQuery,
  useResendInvitationMutation,
  useUpdateInvitationMutation,
  useGetAvailableTeamsForMoveLazyQuery,
  useMoveAthleteToTeamMutation,
} from '../../src/generated/graphql'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { format } from 'date-fns'
import { Pencil, Check, X, Users } from 'lucide-react'
import { Input } from '../../src/components/ui/input'
import { useToast } from '../../src/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'
import { useUpdateUserByIdMutation } from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import MoveAthleteConfirmDialog from './MoveAthleteConfirmDialog'

interface Props {
  open: boolean
  onClose: () => void
  registrantId?: string | null
}

const ParticipantModal = ({ open, onClose, registrantId }: Props) => {
  const competitionId = useCompetitionId() || ''
  const { data, loading, refetch } = useGetRegistrationByIdQuery({
    variables: {
      id: registrantId!,
    },
    skip: !registrantId,
  })
  const registrant = data?.getRegistrantById

  // Determine if this is a team based on actual data
  const isTeam = (registrant?.ticketType?.teamSize || 0) > 1 || !!registrant?.team

  const [isEditingTeamName, setIsEditingTeamName] = useState(false)
  const [editedTeamName, setEditedTeamName] = useState('')
  const [updateTeam] = useUpdateTeamMutation()

  // Team moving state
  const [showMoveTeamSection, setShowMoveTeamSection] = useState(false)
  const [selectedTargetTeam, setSelectedTargetTeam] = useState<string>('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Lazy load available teams for moving
  const [
    getAvailableTeams,
    {
      data: availableTeamsData,
      loading: availableTeamsLoading,
      error: availableTeamsError,
    },
  ] = useGetAvailableTeamsForMoveLazyQuery()

  const { data: invitationsData, loading: invitationsLoading } =
    useGetInvitationsByTeamIdQuery({
      variables: {
        teamId: registrant?.team?.id || '',
      },
      skip: !registrant?.team?.id,
    })
  const [resendInvitation] = useResendInvitationMutation()
  const { toast } = useToast()
  const [editingInvitationId, setEditingInvitationId] = useState<string | null>(null)
  const [editedInvitationEmail, setEditedInvitationEmail] = useState('')
  const [updateInvitation] = useUpdateInvitationMutation()
  const [moveAthleteToTeam] = useMoveAthleteToTeamMutation()
  const [updateUserById] = useUpdateUserByIdMutation()
  const [isEditingUserName, setIsEditingUserName] = useState(false)
  const [editedUserName, setEditedUserName] = useState('')

  const handleEditTeamName = () => {
    setIsEditingTeamName(true)
    setEditedTeamName(registrant?.teamName || '')
  }

  const handleSaveTeamName = async () => {
    if (editedTeamName.trim() !== '' && registrant?.team?.id) {
      try {
        await updateTeam({
          variables: {
            id: registrant.team.id,
            name: editedTeamName.trim(),
          },
        })
        setIsEditingTeamName(false)
        refetch()
      } catch (error) {
        console.error('Error updating team name:', error)
      }
    } else {
      setIsEditingTeamName(false)
    }
  }

  const handleMoveToTeam = async () => {
    if (!selectedTargetTeam || !registrant?.user?.id) return

    try {
      await moveAthleteToTeam({
        variables: {
          userId: registrant.user.id,
          competitionId,
          targetTeamId: selectedTargetTeam,
        },
      })

      toast({
        title: 'Success',
        description: `${registrant.user.name} has been moved to ${getSelectedTeamName()} successfully.`,
        variant: 'success',
      })

      setShowConfirmDialog(false)
      setShowMoveTeamSection(false)
      setSelectedTargetTeam('')
      refetch()
    } catch (error: any) {
      console.error('Error moving athlete to team:', error)
      toast({
        title: 'Error',
        description:
          error.message ||
          'Failed to move athlete to the selected team. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmMove = () => {
    if (!selectedTargetTeam) return
    setShowConfirmDialog(true)
  }

  // Get the display name for the selected team from real data
  const getSelectedTeamName = () => {
    const selectedTeam = availableTeamsData?.getAvailableTeamsForMove?.find(
      (team) => team.id === selectedTargetTeam,
    )
    return selectedTeam?.name || 'Unknown Team'
  }

  const handleClose = () => {
    setIsEditingTeamName(false)
    setShowMoveTeamSection(false)
    setSelectedTargetTeam('')
    onClose()
  }

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitation({
        variables: {
          invitationId,
        },
      })
      handleClose()
      toast({
        title: 'Invitation Resent',
        description: 'The invitation has been resent successfully.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Error resending invitation:', error)
      toast({
        title: 'Error',
        description: 'Failed to resend the invitation. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleEditInvitation = (invitationId: string, email: string) => {
    setEditingInvitationId(invitationId)
    setEditedInvitationEmail(email)
  }

  const handleSaveInvitation = async (invitationId: string) => {
    if (editedInvitationEmail.trim() !== '') {
      try {
        await updateInvitation({
          variables: {
            id: invitationId,
            email: editedInvitationEmail.trim(),
          },
        })
        setEditingInvitationId(null)
        // Optionally refetch the invitations data or update the local cache
        toast({
          title: 'Invitation Updated',
          description: 'The invitation email has been updated successfully.',
          variant: 'success',
        })
      } catch (error) {
        console.error('Error updating invitation email:', error)
        toast({
          title: 'Error',
          description: 'Failed to update the invitation email. Please try again.',
          variant: 'destructive',
        })
      }
    } else {
      setEditingInvitationId(null)
    }
  }

  const handleCancelEditInvitation = () => {
    setEditingInvitationId(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {loading ? (
                'Loading...'
              ) : isTeam && registrant?.team ? (
                isEditingTeamName ? (
                  <div className="flex items-center">
                    <Input
                      value={editedTeamName}
                      onChange={(e) => setEditedTeamName(e.target.value)}
                      onBlur={handleSaveTeamName}
                      className="mr-2"
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleSaveTeamName}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    Team: {registrant?.teamName || 'Unnamed Team'}
                    <Pencil
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={handleEditTeamName}
                    />
                  </div>
                )
              ) : isEditingUserName ? (
                <div className="flex items-center">
                  <Input
                    value={editedUserName}
                    onChange={(e) => setEditedUserName(e.target.value)}
                    onBlur={async () => {
                      const trimmed = editedUserName.trim()
                      if (!trimmed || !registrant?.user?.id) {
                        setIsEditingUserName(false)
                        return
                      }
                      const [firstName, ...last] = trimmed.split(' ')
                      try {
                        await updateUserById({
                          variables: {
                            userId: registrant.user.id,
                            competitionId,
                            firstName,
                            lastName: last.join(' ') || undefined,
                          },
                        })
                        setIsEditingUserName(false)
                        refetch()
                      } catch (err) {
                        setIsEditingUserName(false)
                      }
                    }}
                    className="mr-2"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const trimmed = editedUserName.trim()
                      if (!trimmed || !registrant?.user?.id) {
                        setIsEditingUserName(false)
                        return
                      }
                      const [firstName, ...last] = trimmed.split(' ')
                      try {
                        await updateUserById({
                          variables: {
                            userId: registrant.user.id,
                            competitionId,
                            firstName,
                            lastName: last.join(' ') || undefined,
                          },
                        })
                        setIsEditingUserName(false)
                        refetch()
                      } catch (err) {
                        setIsEditingUserName(false)
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  {registrant?.user?.name || 'Loading...'}
                  {(!isTeam || !registrant?.team) && (
                    <Pencil
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={() => {
                        setEditedUserName(registrant?.user?.name || '')
                        setIsEditingUserName(true)
                      }}
                    />
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">
                  Loading participant details...
                </div>
              </div>
            ) : registrant ? (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium col-span-2">
                    Registration Date:
                  </span>
                  <span className="text-sm col-span-2">
                    {format(new Date(registrant.createdAt), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="text-sm font-medium col-span-2">Ticket Type:</span>
                  <span className="text-sm col-span-2">{registrant.ticketType.name}</span>
                </div>
                {!isTeam && registrant.team?.name && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <span className="text-sm font-medium col-span-2">Team Name:</span>
                    <span className="text-sm col-span-2">{registrant.team.name}</span>
                  </div>
                )}
                {registrant.team && (
                  <>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm font-medium col-span-4">
                        Team Members:
                      </span>
                      <ul className="list-disc pl-5 col-span-4">
                        {registrant.team.members.map((member) => (
                          <li key={member.id} className="text-sm">
                            {member.user?.name} - {member.user?.email}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {invitationsLoading ? (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm font-medium col-span-4">
                          Invited Members:
                        </span>
                        <div className="text-sm text-gray-500 col-span-4">
                          Loading invitations...
                        </div>
                      </div>
                    ) : invitationsData?.getInvitationsByTeamId &&
                      invitationsData.getInvitationsByTeamId.length > 0 ? (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <span className="text-sm font-medium col-span-4">
                          Invited Members:
                        </span>
                        <ul className="list-none col-span-4">
                          {invitationsData.getInvitationsByTeamId.map((invitation) => (
                            <li
                              key={invitation.id}
                              className="text-sm flex items-center justify-between mb-2"
                            >
                              {editingInvitationId === invitation.id ? (
                                <div className="flex items-center space-x-2 w-full">
                                  <Input
                                    value={editedInvitationEmail}
                                    onChange={(e) =>
                                      setEditedInvitationEmail(e.target.value)
                                    }
                                    className="flex-grow"
                                    autoFocus
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSaveInvitation(invitation.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEditInvitation}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  {invitation.email && (
                                    <div className="flex items-center">
                                      {invitation.email}
                                      <Pencil
                                        className="ml-2 h-4 w-4 cursor-pointer"
                                        onClick={() =>
                                          handleEditInvitation(
                                            invitation.id,
                                            invitation.email!,
                                          )
                                        }
                                      />
                                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                        Pending
                                      </span>
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleResendInvitation(invitation.id)}
                                  >
                                    Resend Email
                                  </Button>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                )}

                {/* Team Moving Section - Show for individual athletes in teams OR team tickets without proper teams */}
                {((!isTeam && registrant.team?.name) || (isTeam && !registrant.team)) && (
                  <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-4">
                    <div className="col-span-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Team Management</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                          onClick={() => {
                            const newShowState = !showMoveTeamSection
                            setShowMoveTeamSection(newShowState)

                            // Lazy load teams when opening the section for the first time
                            if (
                              newShowState &&
                              !availableTeamsData &&
                              registrant?.ticketType?.id
                            ) {
                              getAvailableTeams({
                                variables: {
                                  competitionId,
                                  ticketTypeId: registrant.ticketType.id,
                                  excludeTeamId: registrant?.team?.id || undefined,
                                },
                              })
                            }
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {showMoveTeamSection ? 'Cancel' : 'Move to Different Team'}
                        </Button>
                      </div>

                      {showMoveTeamSection && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700 block">
                                Select Target Team
                              </label>
                              <Select
                                value={selectedTargetTeam}
                                onValueChange={setSelectedTargetTeam}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a team..." />
                                </SelectTrigger>
                                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                                  {availableTeamsLoading ? (
                                    <SelectItem value="__loading__" disabled>
                                      Loading teams...
                                    </SelectItem>
                                  ) : availableTeamsError ? (
                                    <SelectItem value="__error__" disabled>
                                      Error loading teams
                                    </SelectItem>
                                  ) : availableTeamsData?.getAvailableTeamsForMove
                                      ?.length === 0 ? (
                                    <SelectItem value="__no_teams__" disabled>
                                      No teams available
                                    </SelectItem>
                                  ) : (
                                    availableTeamsData?.getAvailableTeamsForMove?.map(
                                      (team) => (
                                        <SelectItem
                                          key={team.id}
                                          value={team.id}
                                          className="hover:bg-gray-100 focus:bg-gray-100"
                                        >
                                          {team.name}
                                        </SelectItem>
                                      ),
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="text-xs text-gray-600">
                              ⚠️ This will move the athlete from their current team to the
                              selected team. This action allows temporary capacity changes
                              for team reorganization.
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={handleConfirmMove}
                                disabled={!selectedTargetTeam}
                              >
                                Move Athlete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                                onClick={() => {
                                  setShowMoveTeamSection(false)
                                  setSelectedTargetTeam('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {registrant.registrationAnswers &&
                  registrant.registrationAnswers.length > 0 && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <span className="text-sm font-medium col-span-4">
                        Registration Answers:
                      </span>
                      <ul className="list-disc pl-5 col-span-4">
                        {registrant.registrationAnswers.map((answer) => (
                          <li key={answer.id} className="text-sm">
                            <span className="font-medium">
                              {answer.registrationField?.question}:
                            </span>{' '}
                            {answer.registrationField?.type === 'MULTIPLE_CHOICE' ||
                            answer.registrationField?.type ===
                              'MULTIPLE_CHOICE_SELECT_ONE'
                              ? answer.registrationField.options?.find(
                                  (option) => option === answer.answer,
                                ) || answer.answer
                              : answer.answer}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">No participant data found</div>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              className="hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Move Confirmation Dialog */}
      <MoveAthleteConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        athleteName={registrant?.user?.name || ''}
        currentTeamName={registrant?.team?.name || ''}
        targetTeamName={getSelectedTeamName()}
        onConfirm={handleMoveToTeam}
      />
    </>
  )
}

export default ParticipantModal
