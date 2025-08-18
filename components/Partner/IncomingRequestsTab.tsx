import React from 'react'
import { Badge } from '../../src/components/ui/badge'
import { Button } from '../../src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import { PartnerRequestStatus } from '../../src/generated/graphql'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const formatRequestTime = (dateString: string) => {
  return dayjs.utc(dateString).local().format('MMM D, YYYY [at] h:mm A')
}

interface IncomingRequest {
  id?: string
  createdAt?: string
  message?: string | null
  phone?: string | null
  fromUser?: {
    firstName?: string
    lastName?: string
    picture?: string
  } | null
  fromInterest?: {
    user?: {
      firstName?: string
      lastName?: string
      picture?: string
    } | null
  } | null
  toInterest?: {
    category?: {
      difficulty?: string
      gender?: string
      directoryComp?: {
        title?: string
      } | null
    } | null
  } | null
}

interface IncomingRequestsTabProps {
  incomingRequests: IncomingRequest[] | undefined
  requestsLoading: boolean
  onRequestAction: (requestId: string, status: PartnerRequestStatus) => Promise<void>
  onUserClick: (userData: any) => void
}

export const IncomingRequestsTab: React.FC<IncomingRequestsTabProps> = ({
  incomingRequests,
  requestsLoading,
  onRequestAction,
  onUserClick,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Incoming Requests</CardTitle>
        <p className="text-sm text-muted-foreground">
          People who want to team up with you
        </p>
      </CardHeader>
      <CardContent>
        {requestsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 animate-pulse h-24 bg-muted"
              />
            ))}
          </div>
        ) : incomingRequests && incomingRequests.length > 0 ? (
          <div className="space-y-4">
            {incomingRequests.map((request) => (
              <div key={request?.id} className="border rounded-lg p-6 bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar
                      className="w-12 h-12 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                      onClick={() =>
                        onUserClick(request?.fromUser || request?.fromInterest?.user)
                      }
                    >
                      <AvatarImage
                        src={
                          request?.fromUser?.picture ||
                          request?.fromInterest?.user?.picture ||
                          undefined
                        }
                      />
                      <AvatarFallback className="text-sm">
                        {request?.fromUser?.firstName?.[0] ||
                          request?.fromInterest?.user?.firstName?.[0] ||
                          '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">
                        {request?.fromUser
                          ? `${request.fromUser.firstName} ${request.fromUser.lastName || ''}`.trim()
                          : `${request?.fromInterest?.user?.firstName} ${request?.fromInterest?.user?.lastName || ''}`.trim()}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        wants to join your{' '}
                        <span className="font-medium text-foreground">
                          {request?.toInterest?.category?.difficulty}{' '}
                          {request?.toInterest?.category?.gender}
                        </span>{' '}
                        listing for{' '}
                        <span className="font-medium text-foreground">
                          {request?.toInterest?.category?.directoryComp?.title}
                        </span>
                      </p>
                      {request?.message && (
                        <div className="bg-muted/50 rounded-md p-3 mb-3">
                          <p className="text-sm italic">"{request.message}"</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatRequestTime(request?.createdAt || '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() =>
                        onRequestAction(request?.id!, PartnerRequestStatus.Accepted)
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onRequestAction(request?.id!, PartnerRequestStatus.Rejected)
                      }
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No incoming requests</h3>
            <p className="text-sm">
              When people want to join your partner listings, they'll appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
