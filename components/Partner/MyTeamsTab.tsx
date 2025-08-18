import React from 'react'
import { Badge } from '../../src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../src/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const formatRequestTime = (dateString: string) => {
  return dayjs.utc(dateString).local().format('MMM D, YYYY [at] h:mm A')
}

interface MyMatch {
  id?: string
  updatedAt?: string
  message?: string | null
  phone?: string | null
  fromUser?: {
    firstName?: string
    lastName?: string
    picture?: string
    email?: string
  } | null
  fromInterest?: {
    id?: string
    user?: {
      firstName?: string
      lastName?: string
      picture?: string
      email?: string
    } | null
    status?: string
    category?: {
      difficulty?: string
      gender?: string
      teamSize?: number
      directoryComp?: {
        title?: string
      } | null
    } | null
    ticketType?: {
      id?: string
      name?: string
      teamSize?: number
      competition?: {
        id?: string
        name?: string
      } | null
    } | null
    teamMembers?: Array<{
      id?: string
      name?: string
      email?: string
      status?: string
    }> | null
  } | null
  toInterest?: {
    id?: string
    user?: {
      firstName?: string
      lastName?: string
      picture?: string
      email?: string
    } | null
    userId?: string
    status?: string
    category?: {
      difficulty?: string
      gender?: string
      teamSize?: number
      directoryComp?: {
        title?: string
      } | null
    } | null
    ticketType?: {
      id?: string
      name?: string
      teamSize?: number
      competition?: {
        id?: string
        name?: string
      } | null
    } | null
    teamMembers?: Array<{
      id?: string
      name?: string
      email?: string
      status?: string
    }> | null
  } | null
}

interface MyTeamsTabProps {
  myMatches: MyMatch[] | undefined
  requestsLoading: boolean
  currentUserId: string
  onUserClick: (userData: any) => void
}

export const MyTeamsTab: React.FC<MyTeamsTabProps> = ({
  myMatches,
  requestsLoading,
  currentUserId,
  onUserClick,
}) => {
  // Group matches by team (interest ID) to avoid showing duplicate team entries
  const groupedTeams = React.useMemo(() => {
    if (!myMatches) return []

    const teamMap = new Map<
      string,
      {
        interest: any
        members: any[]
        latestUpdate: string
        category: any
        ticketType: any
      }
    >()

    myMatches.forEach((match) => {
      // Always use toInterest as the team, since that's where the team is formed
      const relevantInterest = match?.toInterest
      const interestId = relevantInterest?.id

      if (!interestId) return

      // Determine who the partner is based on whether current user owns the interest
      const isUserTeamOwner = match?.toInterest?.userId === currentUserId
      const partner = isUserTeamOwner
        ? match?.fromUser || match?.fromInterest?.user // User owns team, partner is the requester
        : match?.toInterest?.user // User joined someone's team, partner is the team owner

      if (!teamMap.has(interestId)) {
        teamMap.set(interestId, {
          interest: relevantInterest,
          members: [],
          latestUpdate: match?.updatedAt || '',
          category: match?.toInterest?.category,
          ticketType: match?.toInterest?.ticketType,
        })
      }

      const team = teamMap.get(interestId)!
      if (partner) {
        team.members.push({
          ...partner,
          message: match?.message,
          phone: match?.phone,
          updatedAt: match?.updatedAt,
        })
      }

      // Keep the latest update time
      if (match?.updatedAt && match.updatedAt > team.latestUpdate) {
        team.latestUpdate = match.updatedAt
      }
    })

    return Array.from(teamMap.values()).sort(
      (a, b) => new Date(b.latestUpdate).getTime() - new Date(a.latestUpdate).getTime(),
    )
  }, [myMatches, currentUserId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">My Teams</CardTitle>
        <p className="text-sm text-muted-foreground">Partners you've formed teams with</p>
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
        ) : groupedTeams && groupedTeams.length > 0 ? (
          <div className="space-y-4">
            {groupedTeams.map((team, index) => {
              const teamStatus = team.interest?.status

              // Handle both category-based and ticket type-based interests
              let teamSize = 1
              let difficulty = null
              let gender = null
              let competitionTitle = 'Unknown Competition'

              if (team.category) {
                // Category-based interest
                teamSize = team.category.teamSize || 1
                difficulty = team.category.difficulty
                gender = team.category.gender
                competitionTitle =
                  team.category.directoryComp?.title || 'Unknown Competition'
              } else if (team.ticketType) {
                // Ticket type-based interest
                teamSize = team.ticketType.teamSize || 1
                competitionTitle = team.ticketType.competition?.name || 'Competition'
              }

              const teamMembers = team.interest?.teamMembers || []
              const activeTeamMembers = teamMembers.filter(
                (member) => member?.status === 'INVITED' || member?.status === 'ACCEPTED',
              )

              // Check if current user is the team owner
              const isUserTeamOwner = team.interest?.userId === currentUserId

              // For display purposes, we'll show the team status from the server
              const isPartiallyFilled = teamStatus === 'PARTIALLY_FILLED'
              const isFullyFormed = teamStatus === 'FILLED'

              const statusText = isPartiallyFilled
                ? 'Partially Formed'
                : isFullyFormed
                  ? 'Team Formed'
                  : 'Team Formed'

              const statusColor = isPartiallyFilled
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                : 'bg-green-600 text-white border-green-600'

              return (
                <div key={`team-${index}`} className="border rounded-lg p-6 bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* <h4 className="font-semibold text-base mb-1">
                        {difficulty && gender
                          ? `${difficulty} ${gender} Team`
                          : 'Competition Team'}
                      </h4> */}
                      <p className="text-sm text-muted-foreground mb-2">
                        {difficulty && gender && (
                          <>
                            <span className="font-medium text-foreground">
                              {difficulty} {gender}
                            </span>{' '}
                            •{' '}
                          </>
                        )}
                        {teamSize === 1 ? 'Individual' : `Team of ${teamSize}`}{' '}
                        {competitionTitle !== 'Unknown Competition' && (
                          <>
                            at{' '}
                            <span className="font-medium text-foreground">
                              {competitionTitle}
                            </span>
                          </>
                        )}
                      </p>

                      {/* Team Members List */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-foreground mb-2">
                          Team Members (
                          {team.members.length + activeTeamMembers.length + 1} of{' '}
                          {teamSize}):
                        </p>
                        <div className="space-y-2">
                          {/* Team owner */}
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">
                              {isUserTeamOwner
                                ? 'You'
                                : `${team.interest?.user?.firstName || 'Team Owner'}`}
                            </span>
                            {isUserTeamOwner && <span className="text-xs">(owner)</span>}
                          </div>

                          {/* Current user if not team owner */}
                          {!isUserTeamOwner && (
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-medium">You</span>
                            </div>
                          )}

                          {/* Other team members */}
                          {team.members.map((member, memberIndex) => {
                            const memberName =
                              `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
                              'Unknown User'
                            return (
                              <div
                                key={memberIndex}
                                className="flex items-center gap-3 text-sm"
                              >
                                <Avatar
                                  className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
                                  onClick={() => onUserClick(member)}
                                >
                                  <AvatarImage
                                    src={
                                      member.picture
                                        ? `${member.picture}?t=${Date.now()}`
                                        : undefined
                                    }
                                  />
                                  <AvatarFallback className="text-xs">
                                    {member.firstName?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <span className="font-medium">{memberName}</span>
                                  <div className="flex gap-2 mt-1">
                                    {member.email && (
                                      <a
                                        href={`mailto:${member.email}`}
                                        className="text-xs hover: hover:underline transition-colors"
                                      >
                                        📧 {member.email}
                                      </a>
                                    )}
                                    {member.phone && (
                                      <a
                                        href={`https://wa.me/${member.phone.replace(/[^\d]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs hover: hover:underline transition-colors"
                                      >
                                        💬 {member.phone}
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {/* Invited team members from teamMembers array */}
                          {activeTeamMembers.map((member, memberIndex) => (
                            <div
                              key={`invited-${memberIndex}`}
                              className="flex items-center gap-3 text-sm"
                            >
                              <Avatar className="w-8 h-8">
                                <AvatarImage
                                  src={
                                    member.user?.picture
                                      ? `${member.user.picture}?t=${Date.now()}`
                                      : undefined
                                  }
                                />
                                <AvatarFallback className="text-xs">
                                  {member.name?.[0] || member.user?.firstName?.[0] || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-xs ml-2">
                                  ({member.status?.toLowerCase()})
                                </span>
                                <div className="flex gap-2 mt-1">
                                  {member.email && (
                                    <a
                                      href={`mailto:${member.email}`}
                                      className="text-xs hover: hover:underline transition-colors"
                                    >
                                      📧 {member.email}
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Team formed {formatRequestTime(team.latestUpdate)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Badge variant="outline" className={statusColor}>
                        {statusText}
                      </Badge>
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
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-sm">
              When you accept requests or your requests get accepted, your teams will
              appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
