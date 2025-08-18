import React, { useState, useEffect } from 'react'
import { Badge } from '../../src/components/ui/badge'
import { Button } from '../../src/components/ui/button'
import { PartnerInterestForm } from './PartnerInterestForm'
import SignUpModal from '../SignUp/SignUpModal'
import { RequestToJoinModal } from './RequestToJoinModal'
import { useUser } from '../../contexts/UserContext'
import {
  useGetPartnerInterestsQuery,
  useGetPartnerRequestsQuery,
  useCreatePartnerRequestMutation,
  PartnerRequestStatus,
  GetDirectoryCompsQuery,
} from '../../src/generated/graphql'
import { PartnerInterestCard } from './PartnerInterestCard'

// Test comment for Supabase Branching

type DirectoryComp = NonNullable<GetDirectoryCompsQuery['getDirectoryComps'][0]>

// Keep compatible interface for existing components
interface Event {
  id: string
  categories: Array<{
    id: string
    gender: string
    teamSize: number
    difficulty: string
    isSoldOut: boolean
    tags?: string[] | null
  }>
}

interface PartnerMatchingSectionProps {
  event: DirectoryComp
}

interface PendingRequest {
  fromInterestId: string
  toInterestId: string
}

interface RequestToJoinState {
  targetInterest: any // Keep as any for now to avoid breaking existing modals
  show: boolean
}

export const PartnerMatchingSection: React.FC<PartnerMatchingSectionProps> = ({
  event,
}) => {
  const [showInterestForm, setShowInterestForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null)
  const [optimisticRequests, setOptimisticRequests] = useState<Set<string>>(new Set())
  const [requestToJoinModal, setRequestToJoinModal] = useState<RequestToJoinState>({
    targetInterest: null,
    show: false,
  })
  const [requestSent, setRequestSent] = useState(false)
  const { user, loading } = useUser()
  const [editInterest, setEditInterest] = useState<null | {
    id: string
    category?: { id: string }
    description?: string
  }>(null)

  const {
    data: partnerInterestsData,
    loading: queryLoading,
    refetch,
  } = useGetPartnerInterestsQuery({
    variables: {
      // Use competitionId if available (for competition pages), otherwise use directoryCompId (for directory comp pages)
      directoryCompId: event.competitionId ? undefined : event.id,
      competitionId: event.competitionId || undefined,
      // Remove status filter to get all interests (ACTIVE, PARTIALLY_FILLED, FILLED)
    },
  })
  const interests = partnerInterestsData?.getPartnerInterests ?? []

  const { data: partnerRequestsData, loading: requestsLoading } =
    useGetPartnerRequestsQuery({
      skip: !user?.id,
    })

  const [createPartnerRequest] = useCreatePartnerRequestMutation()

  // Handle pending request after user logs in/signs up
  useEffect(() => {
    if (user && pendingRequest && !loading) {
      createPartnerRequest({
        variables: {
          input: {
            toInterestId: pendingRequest.toInterestId,
            // Don't include fromInterestId for direct user requests
          },
        },
      }).then(() => {
        refetch() // Refetch to update UI
      })
      setPendingRequest(null)
    }
  }, [user, pendingRequest, loading, createPartnerRequest, refetch])

  const handleFindPartner = () => {
    if (loading) return // Don't show modal while loading user
    if (!user) {
      setShowAuthModal(true)
    } else {
      setShowInterestForm(true)
    }
  }

  const handleRequestToJoin = async (
    fromInterestId: string | null,
    toInterestId: string,
  ) => {
    if (loading) return // Don't show modal while loading user
    if (!user) {
      setPendingRequest({ fromInterestId: '', toInterestId }) // Always empty fromInterestId for direct requests
      setShowAuthModal(true)
      return
    }

    // Find the target interest
    const targetInterest = interests.find((i) => i?.id === toInterestId)
    if (!targetInterest) return

    // Don't add optimistic update here - only when user actually sends the request

    // Show the request modal
    setRequestToJoinModal({
      targetInterest,
      show: true,
    })
  }

  const handleSendRequest = async (
    message?: string,
    phone?: string,
    instagram?: string,
  ) => {
    if (!requestToJoinModal.targetInterest || !user) return

    const targetInterestId = requestToJoinModal.targetInterest.id

    // Mark that request was sent (not cancelled)
    setRequestSent(true)

    // Add optimistic update when user actually sends the request
    setOptimisticRequests((prev) => new Set(prev).add(targetInterestId))

    // Don't close the modal here - let the modal handle it after loading is done

    // Send direct user-to-interest request (no fromInterestId needed)
    try {
      const result = await createPartnerRequest({
        variables: {
          input: {
            toInterestId: targetInterestId,
            message: message || undefined,
            phone: phone || undefined,
            instagram: instagram || undefined,
          },
        },
        optimisticResponse: {
          createPartnerRequest: {
            __typename: 'PartnerRequest',
            id: `temp-${Date.now()}`,
            fromInterestId: null,
            fromUserId: user.id,
            toInterestId: targetInterestId,
            message: message || null,
            status: PartnerRequestStatus.Pending,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        update: (_, { data }) => {
          if (data?.createPartnerRequest) {
            // Real data is now available, optimistic state can remain since it shows the correct state
            console.log('Partner request created successfully!')
          }
        },
        refetchQueries: ['GetPartnerInterests', 'GetPartnerRequests'],
      })

      console.log('Request created successfully:', result.data?.createPartnerRequest)
    } catch (error) {
      console.error('Error creating partner request:', error)
      // Remove from optimistic state on error
      setOptimisticRequests((prev) => {
        const newSet = new Set(prev)
        newSet.delete(targetInterestId)
        return newSet
      })
      // Re-throw error so the modal can handle it
      throw error
    }
  }

  const handleCreateInterestFromModal = () => {
    // No optimistic update to remove since it only gets added when request is actually sent
    setRequestToJoinModal({ targetInterest: null, show: false })
    setRequestSent(false) // Reset the flag
    setShowInterestForm(true)
  }

  const handleModalClose = () => {
    // No optimistic update to remove since it only gets added when request is actually sent
    setRequestToJoinModal({ targetInterest: null, show: false })
    setRequestSent(false) // Reset the flag
  }

  const handleAuthModalClose = () => {
    setShowAuthModal(false)
    // Clear pending request if user cancels auth
    if (!user) {
      setPendingRequest(null)
    }
  }

  const hasInterests =
    (partnerInterestsData?.getPartnerInterests?.filter(Boolean).length ?? 0) > 0

  return (
    <div className="mt-6 space-y-6">
      <div className="bg-card rounded-xl p-4 mt-4 text-foreground shadow-md">
        <h2 className="text-lg font-bold text-white mb-1">Find Teammates</h2>
        <p className="text-sm mb-2">
          {hasInterests
            ? 'Register your interest to find partners for this competition or request to partner up with athletes below'
            : 'Register your interest to find partners for this competition'}
        </p>
        <button
          className="w-full bg-primary/10 text-primary font-semibold text-base px-4 py-2 mt-4 rounded-xl shadow-sm hover:bg-primary/20 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20"
          onClick={handleFindPartner}
        >
          Looking for teammates?
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {queryLoading &&
        (!partnerInterestsData?.getPartnerInterests ||
          partnerInterestsData.getPartnerInterests.length === 0) ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded p-3 animate-pulse h-24 bg-muted" />
          ))
        ) : partnerInterestsData?.getPartnerInterests?.filter(Boolean).length === 0 ? (
          <></>
        ) : (
          interests
            .filter((interest): interest is NonNullable<typeof interest> =>
              Boolean(interest),
            )
            .map((interest) => {
              const isOwnInterest = !!(
                user &&
                interest.user &&
                interest.user.id === user.id
              )
              const myInterest =
                interests.find(
                  (i) => i?.userId === user?.id && i?.categoryId === interest.categoryId,
                ) || null
              const pendingRequest =
                optimisticRequests.has(interest.id) ||
                (partnerRequestsData?.getPartnerRequests ?? []).some((req: any) => {
                  const isMatch =
                    req &&
                    req.status === 'PENDING' &&
                    req.toInterestId === interest.id &&
                    // For direct user requests, check fromUserId first
                    // For interest-based requests, check fromInterestId
                    (req.fromUserId === user?.id ||
                      req.fromInterestId === myInterest?.id ||
                      req.fromInterest?.userId === user?.id)

                  return isMatch
                })

              const acceptedRequest = (
                partnerRequestsData?.getPartnerRequests ?? []
              ).some((req: any) => {
                const isMatch =
                  req &&
                  req.status === 'ACCEPTED' &&
                  req.toInterestId === interest.id &&
                  // For direct user requests, check fromUserId first
                  // For interest-based requests, check fromInterestId
                  (req.fromUserId === user?.id ||
                    req.fromInterestId === myInterest?.id ||
                    req.fromInterest?.userId === user?.id)

                return isMatch
              })

              const alreadyRequested = pendingRequest || acceptedRequest
              return (
                <PartnerInterestCard
                  key={interest.id}
                  interest={interest}
                  currentUserId={user?.id || null}
                  myInterest={myInterest}
                  alreadyRequested={alreadyRequested}
                  hasAcceptedRequest={acceptedRequest}
                  isOwnInterest={isOwnInterest}
                  setEditInterest={setEditInterest}
                  setShowAuthModal={setShowAuthModal}
                  onRequestToJoin={handleRequestToJoin}
                  loading={loading}
                />
              )
            })
        )}
      </div>

      {showAuthModal && (
        <SignUpModal
          open={showAuthModal}
          onClose={handleAuthModalClose}
          refetch={() => {}}
        />
      )}

      <RequestToJoinModal
        open={requestToJoinModal.show}
        onClose={handleModalClose}
        targetInterest={requestToJoinModal.targetInterest}
        userHasInterest={true} // Always allow sending requests
        onCreateInterest={handleCreateInterestFromModal}
        onSendRequest={handleSendRequest}
      />

      {showInterestForm && (
        <PartnerInterestForm
          event={event as Event}
          onClose={() => setShowInterestForm(false)}
        />
      )}
      {editInterest && (
        <PartnerInterestForm
          event={event as Event}
          onClose={() => setEditInterest(null)}
          initialInterest={editInterest}
        />
      )}
    </div>
  )
}
