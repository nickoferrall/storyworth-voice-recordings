import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { upperFirst } from '../../lib/upperFirst'
import {
  useCreatePartnerInterestMutation,
  PartnerInterestType,
  PartnerPreference,
  useGetViewerQuery,
  useUpdatePartnerInterestMutation,
  useCreatePartnerInterestTeamMembersMutation,
  useGetTicketTypesByCompetitionIdQuery,
} from '../../src/generated/graphql'
import { useUser } from '../../contexts/UserContext'
import ErrorMessage from '../Layout/ErrorMessage'
import { useRouter } from 'next/router'
import posthog from 'posthog-js'

interface Category {
  id: string
  difficulty: string
  gender: string
  teamSize: number
  isSoldOut: boolean
  tags?: string[] | null
}

interface TicketType {
  id: string
  name: string
  description?: string | null
  teamSize: number
  price: number
  currency?: string | null
  maxEntries: number
  isVolunteer: boolean
}

interface Event {
  id: string
  competitionId?: string | null
  categories: Category[]
}

interface PartnerInterestFormProps {
  event: Event
  onClose: () => void
  initialInterest?: any
}

export const PartnerInterestForm: React.FC<PartnerInterestFormProps> = ({
  event,
  onClose,
  initialInterest,
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>(
    initialInterest?.category?.id || initialInterest?.ticketType?.id || '',
  )
  const [description, setDescription] = useState(initialInterest?.description || '')
  const [phone, setPhone] = useState(initialInterest?.phone || '')
  const [instagram, setInstagram] = useState(initialInterest?.instagram || '')
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; email: string }>>(
    [],
  )
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, setUser } = useUser()
  const router = useRouter()
  const { data: viewerData } = useGetViewerQuery()

  // Track when partner interest modal opens
  useEffect(() => {
    posthog.capture('Partner Interest Modal Opened', {
      event_id: event.id,
      event_title: event.categories?.[0]?.difficulty || 'Unknown',
      is_edit: !!initialInterest,
      user_id: user?.id,
    })
  }, [event.id, event.categories, initialInterest, user?.id])

  // Determine if we should use ticket types or categories
  const useTicketTypes = Boolean(event.competitionId)

  // Fetch ticket types if this event has a linked competition
  const { data: ticketTypesData, loading: ticketTypesLoading } =
    useGetTicketTypesByCompetitionIdQuery({
      variables: { competitionId: event.competitionId! },
      skip: !useTicketTypes,
    })

  const [createPartnerInterest, { error: mutationError }] =
    useCreatePartnerInterestMutation({
      onError: (error) => {
        setError(error.message)
      },
    })

  const [updatePartnerInterest] = useUpdatePartnerInterestMutation({
    onError: (error) => {
      setError(error.message)
    },
  })

  const [createTeamMembers] = useCreatePartnerInterestTeamMembersMutation({
    onError: (error) => {
      console.error('Error creating team members:', error)
    },
  })

  useEffect(() => {
    if (viewerData?.getUser) {
      setUser(viewerData.getUser)
    }
  }, [viewerData, setUser])

  useEffect(() => {
    if (mutationError) {
      setError(mutationError.message)
    }
  }, [mutationError])

  useEffect(() => {
    if (initialInterest) {
      setSelectedDivision(
        initialInterest.category?.id || initialInterest.ticketType?.id || '',
      )
      setDescription(initialInterest.description || '')
      setPhone(initialInterest.phone || '')
      setInstagram(initialInterest.instagram || '')
    }
  }, [initialInterest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedDivision) {
      setError('Please select a division')
      return
    }

    if (!user) {
      setError('You must be logged in to submit')
      return
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user.id)) {
      console.error('Invalid user ID format:', user.id)
      setError('Invalid user ID format')
      return
    }

    // Auto-add team member if fields are filled but not yet added
    let finalTeamMembers = [...teamMembers]
    if (newMemberName.trim() && newMemberEmail.trim()) {
      finalTeamMembers.push({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
      })
    }

    setIsSubmitting(true)

    try {
      if (initialInterest) {
        // For updates, maintain the same logic (this would need backend updates too)
        const result = await updatePartnerInterest({
          variables: {
            id: initialInterest.id,
            categoryId: useTicketTypes ? null : selectedDivision,
            ticketTypeId: useTicketTypes ? selectedDivision : null,
            description: description,
            phone: phone,
            instagram: instagram || undefined,
          },
          refetchQueries: ['GetPartnerInterests'],
          awaitRefetchQueries: true,
        })
        if (result.data?.updatePartnerInterest) {
          onClose()
        }
      } else {
        // Create the partner interest
        const userIds = [user.id]

        const result = await createPartnerInterest({
          variables: {
            input: {
              userIds: userIds,
              interestType: PartnerInterestType.LookingForJoiners,
              partnerPreference: PartnerPreference.Anyone,
              // Use either categoryIds or ticketTypeIds based on event type
              ...(useTicketTypes
                ? { ticketTypeIds: [selectedDivision] }
                : { categoryIds: [selectedDivision] }),
              description: description,
              phone: phone,
              instagram: instagram || undefined,
            },
          },
          refetchQueries: ['GetPartnerInterests'],
          awaitRefetchQueries: true,
        })

        if (
          result.data?.createPartnerInterest &&
          result.data.createPartnerInterest.length > 0
        ) {
          const createdInterest = result.data.createPartnerInterest[0]

          // Track partner interest submission
          console.log('Partner Interest Submitted - Tracking:', {
            event_id: event.id,
            event_title: event.categories?.[0]?.difficulty || 'Unknown',
            division_id: selectedDivision,
            has_description: !!description,
            has_phone: !!phone,
            team_members_count: finalTeamMembers.length,
            user_id: user?.id,
            environment: process.env.NODE_ENV,
          })

          posthog.capture('Partner Interest Submitted', {
            event_id: event.id,
            event_title: event.categories?.[0]?.difficulty || 'Unknown',
            division_id: selectedDivision,
            has_description: !!description,
            has_phone: !!phone,
            has_instagram: !!instagram,
            team_members_count: finalTeamMembers.length,
            user_id: user?.id,
          })

          // If there are team members, create them
          if (finalTeamMembers.length > 0 && createdInterest) {
            try {
              await createTeamMembers({
                variables: {
                  partnerInterestId: createdInterest.id,
                  teamMembers: finalTeamMembers as any,
                },
              })
              console.log('Team members created successfully')
            } catch (teamMemberError) {
              console.error('Error creating team members:', teamMemberError)
            }
          }

          if (!user.bio) {
            setShowProfileCompletion(true)
          } else {
            onClose()
          }
        }
      }
    } catch (error) {
      console.error('Error submitting partner interest:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to submit partner interest. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteProfile = () => {
    router.push('/profile')
  }

  const [showProfileCompletion, setShowProfileCompletion] = useState(false)

  // Get available divisions (either categories or ticket types)
  const availableDivisions = useTicketTypes
    ? ticketTypesData?.getTicketTypesByCompetitionId?.filter((tt) => !tt.isVolunteer) ||
      []
    : event.categories

  const isLoading = useTicketTypes && ticketTypesLoading

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialInterest ? 'Edit Partner Interest' : 'Find Teammates'}
          </DialogTitle>
        </DialogHeader>

        {showProfileCompletion ? (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                Complete your profile to help potential partners find you!
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleCompleteProfile}
                className="w-full"
              >
                Complete Profile
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={onClose}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <ErrorMessage error={error} />

            <div className="mb-4">
              <label className="block mb-2 font-medium">
                Which division are you interested in?
              </label>

              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : availableDivisions.length === 0 ? (
                <p className="">No divisions available for this event.</p>
              ) : (
                availableDivisions.map((division) => {
                  // Handle both category and ticket type formats
                  const isCategory = 'difficulty' in division
                  const divisionId = division.id
                  const divisionName = isCategory
                    ? `${upperFirst(division.difficulty.toLowerCase())} • ${upperFirst(division.gender.toLowerCase())} • ${division.teamSize === 1 ? 'Individual' : `Team of ${division.teamSize}`}`
                    : `${division.name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())} • ${division.teamSize === 1 ? 'Individual' : `Team of ${division.teamSize}`}`

                  return (
                    <label
                      key={divisionId}
                      className="flex items-center space-x-2 mb-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="division"
                        value={divisionId}
                        checked={selectedDivision === divisionId}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="rounded border-gray-300"
                      />
                      <span>{divisionName}</span>
                    </label>
                  )
                })
              )}
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">
                About Your Competition Goals (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Share your competition goals, fitness level, and what you're looking for in teammates..."
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Phone Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs mt-1">
                Share your phone number to make it easier for partners to coordinate with
                you
              </p>
            </div>

            <div className="mb-6">
              <label className="block mb-2 font-medium">Instagram (Optional)</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="@yourhandle or instagram.com/yourhandle"
              />
              <p className="text-xs mt-1">Add your Instagram for easier connection</p>
            </div>

            {selectedDivision &&
              (() => {
                const selectedDiv = availableDivisions.find(
                  (d) => d.id === selectedDivision,
                )
                const teamSize = selectedDiv?.teamSize || 1
                const maxTeamMembers = teamSize - 2
                const canAddMore = teamMembers.length < maxTeamMembers
                const showAddMoreButton = maxTeamMembers > 1

                return teamSize > 2 && maxTeamMembers > 0 ? (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="font-medium">Team Members (Optional)</label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs cursor-help">
                              ?
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-sm">
                              Include team members here if they're already part of your
                              team
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {teamMembers.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {teamMembers.map((member, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <span className="font-medium">{member.name}</span>
                              <span className=" ml-2">({member.email})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setTeamMembers((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {canAddMore && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="p-2 border rounded"
                            placeholder="Teammate's name"
                          />
                          <input
                            type="email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                            className="p-2 border rounded"
                            placeholder="Teammate's email"
                          />
                        </div>

                        {showAddMoreButton && (
                          <button
                            type="button"
                            onClick={() => {
                              if (newMemberName.trim() && newMemberEmail.trim()) {
                                setTeamMembers((prev) => [
                                  ...prev,
                                  {
                                    name: newMemberName.trim(),
                                    email: newMemberEmail.trim(),
                                  },
                                ])
                                setNewMemberName('')
                                setNewMemberEmail('')
                              }
                            }}
                            disabled={!newMemberName.trim() || !newMemberEmail.trim()}
                            className="w-full p-2 border border-dashed border-gray-300 rounded hover:border-gray-400 disabled:opacity-50"
                          >
                            + Add More Teammates
                          </button>
                        )}
                      </div>
                    )}

                    <p className="text-xs mt-2">
                      {showAddMoreButton
                        ? `You can invite up to ${maxTeamMembers - teamMembers.length} more ${maxTeamMembers - teamMembers.length === 1 ? 'teammate' : 'teammates'}. This leaves spots for others to request to join.`
                        : `For a team of ${teamSize}, you can invite 1 teammate directly. This leaves 1 spot for partner requests.`}
                    </p>
                  </div>
                ) : null
              })()}

            <DialogFooter>
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoading || availableDivisions.length === 0}
              >
                {isSubmitting ? 'Creating...' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
