import React from 'react'
import { Badge } from '../../src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { upperFirst } from '../../lib/upperFirst'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const formatRequestTime = (dateString: string) => {
  return dayjs.utc(dateString).local().format('MMM D, YYYY [at] h:mm A')
}

interface MyInterest {
  id?: string
  status?: string
  createdAt?: string
  description?: string | null
  category?: {
    id?: string
    difficulty?: string
    gender?: string
    teamSize?: number
    directoryComp?: {
      title?: string
    } | null
  } | null
}

interface OutgoingRequest {
  id?: string
  fromInterest?: {
    id?: string
  } | null
}

interface PartnerRequest {
  id?: string
  toInterestId?: string
  status?: string
}

interface MyCompsTabProps {
  myInterests: MyInterest[] | undefined
  outgoingRequests: OutgoingRequest[] | undefined
  partnerRequestsData:
    | {
        getPartnerRequests?: PartnerRequest[] | null
      }
    | undefined
  interestsLoading: boolean
}

export const MyCompsTab: React.FC<MyCompsTabProps> = ({
  myInterests,
  outgoingRequests,
  partnerRequestsData,
  interestsLoading,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">My Comps</CardTitle>
        <p className="text-sm text-muted-foreground">
          Competitions you're looking for partners in
        </p>
      </CardHeader>
      <CardContent>
        {interestsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 animate-pulse h-24 bg-muted"
              />
            ))}
          </div>
        ) : myInterests && myInterests.length > 0 ? (
          <div className="space-y-6">
            {myInterests.map((interest) => {
              // Find outgoing requests for this interest
              const relatedOutgoingRequests = outgoingRequests?.filter(
                (req) => req?.fromInterest?.id === interest?.id,
              )

              return (
                <div key={interest?.id} className="border rounded-lg p-6 bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-2">
                        {interest?.category?.directoryComp?.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge variant="secondary" className="font-medium">
                          {interest?.category?.difficulty}
                        </Badge>
                        <Badge variant="outline">{interest?.category?.gender}</Badge>
                        <Badge variant="outline">
                          {interest?.category?.teamSize === 1
                            ? 'Individual'
                            : `Team of ${interest?.category?.teamSize}`}
                        </Badge>
                      </div>
                      {interest?.description && (
                        <p className="text-muted-foreground mt-2">
                          {interest.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={interest?.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="ml-4"
                    >
                      {upperFirst(interest?.status?.toLowerCase() || '')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Created {formatRequestTime(interest?.createdAt || '')}</span>
                    <div className="flex gap-4">
                      {(() => {
                        const requestsForThisInterest =
                          partnerRequestsData?.getPartnerRequests?.filter(
                            (req) =>
                              req?.toInterestId === interest?.id &&
                              req?.status === 'PENDING',
                          ) ?? []
                        if (requestsForThisInterest.length > 0) {
                          return (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700"
                            >
                              {requestsForThisInterest.length} request(s) received
                            </Badge>
                          )
                        }
                        return null
                      })()}
                      {relatedOutgoingRequests && relatedOutgoingRequests.length > 0 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {relatedOutgoingRequests.length} request(s) sent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No partner listings yet</h3>
            <p className="text-sm">
              Visit an event page to create your first partner listing!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
