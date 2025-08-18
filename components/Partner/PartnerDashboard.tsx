import React, { useState } from 'react'
import { useUser } from '../../contexts/UserContext'
import {
  useGetPartnerRequestsQuery,
  useUpdatePartnerRequestMutation,
  PartnerRequestStatus,
} from '../../src/generated/graphql'
import { Badge } from '../../src/components/ui/badge'
import { Button } from '../../src/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../src/components/ui/tabs'
import { UserProfileModal } from './UserProfileModal'
import { PartnerMatchModal } from './PartnerMatchModal'
import { IncomingRequestsTab } from './IncomingRequestsTab'
import { MyTeamsTab } from './MyTeamsTab'

export const PartnerDashboard: React.FC = () => {
  const { user, loading: userLoading } = useUser()
  const [activeTab, setActiveTab] = useState('incoming')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [matchedPartner, setMatchedPartner] = useState<{
    partner: any
    phone?: string | null
  } | null>(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
  const [optimisticActions, setOptimisticActions] = useState<Set<string>>(new Set())

  const {
    data: partnerRequestsData,
    loading: requestsLoading,
    refetch: refetchRequests,
  } = useGetPartnerRequestsQuery({
    skip: !user?.id,
  })

  const [updatePartnerRequest] = useUpdatePartnerRequestMutation()

  const incomingRequests = partnerRequestsData?.getPartnerRequests
    ?.filter(
      (request) =>
        request?.toInterest?.userId === user?.id &&
        request?.status === 'PENDING' &&
        !optimisticActions.has(request?.id || ''),
    )
    .filter(Boolean)
    .sort((a, b) => {
      if (!a?.createdAt || !b?.createdAt) return 0
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Get accepted matches where user was either the requester or the recipient
  const myMatches = partnerRequestsData?.getPartnerRequests
    ?.filter(
      (request) =>
        request?.status === 'ACCEPTED' &&
        (request?.toInterest?.userId === user?.id ||
          request?.fromUserId === user?.id ||
          request?.fromInterest?.userId === user?.id),
    )
    .filter(Boolean)
    .sort((a, b) => {
      if (!a?.updatedAt || !b?.updatedAt) return 0
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const handleRequestAction = async (requestId: string, status: PartnerRequestStatus) => {
    try {
      // Find the request to get partner info before updating
      const request = incomingRequests?.find((req) => req?.id === requestId)
      const partner = request?.fromUser || request?.fromInterest?.user

      // Optimistically remove the request from the UI immediately
      setOptimisticActions((prev) => new Set(prev).add(requestId))

      // Show success modal immediately if request was accepted
      if (status === PartnerRequestStatus.Accepted && partner) {
        setMatchedPartner({ partner, phone: request?.phone })
        setShowMatchModal(true)
      }

      await updatePartnerRequest({
        variables: {
          input: {
            id: requestId,
            status: status,
          },
        },
        optimisticResponse: {
          updatePartnerRequest: {
            __typename: 'PartnerRequest',
            id: requestId,
            fromInterestId: request?.fromInterestId || null,
            fromUserId: request?.fromUserId || null,
            toInterestId: request?.toInterestId || '',
            message: request?.message || null,
            status: status,
            createdAt: request?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        refetchQueries: ['GetPartnerRequests', 'GetPartnerInterests'],
      })

      // Remove from optimistic state after successful update
      setOptimisticActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    } catch (error) {
      console.error('Error updating request:', error)
      // Remove from optimistic state on error to show the request again
      setOptimisticActions((prev) => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleUserClick = (userData: any) => {
    setSelectedUser(userData)
    setShowUserModal(true)
  }

  const closeUserModal = () => {
    setShowUserModal(false)
    setSelectedUser(null)
  }

  const closeMatchModal = () => {
    setShowMatchModal(false)
    setMatchedPartner(null)
    // Navigate to My Teams tab
    setActiveTab('matches')
  }

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Please log in</h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view your partner dashboard.
          </p>
          <Button asChild>
            <a href="/login">Log In</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Partner Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-card rounded-xl p-1">
          <TabsTrigger
            value="incoming"
            className="cursor-pointer text-base rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground transition"
          >
            Incoming Requests
            {incomingRequests && incomingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {incomingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="matches"
            className="cursor-pointer text-base rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground transition"
          >
            My Teams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="mt-0">
          <IncomingRequestsTab
            incomingRequests={incomingRequests as any}
            requestsLoading={requestsLoading}
            onRequestAction={handleRequestAction}
            onUserClick={handleUserClick}
          />
        </TabsContent>

        <TabsContent value="matches" className="mt-0">
          <MyTeamsTab
            myMatches={myMatches as any}
            requestsLoading={requestsLoading}
            currentUserId={user.id}
            onUserClick={handleUserClick}
          />
        </TabsContent>
      </Tabs>

      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          open={showUserModal}
          onClose={closeUserModal}
        />
      )}

      {matchedPartner && (
        <PartnerMatchModal
          open={showMatchModal}
          onClose={closeMatchModal}
          partner={matchedPartner?.partner || null}
          phone={matchedPartner?.phone || null}
          competition={null}
        />
      )}
    </div>
  )
}
