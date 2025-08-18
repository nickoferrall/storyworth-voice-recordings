import React from 'react'
import {
  Avatar as UIAvatar,
  AvatarFallback,
  AvatarImage,
} from '../../src/components/ui/avatar'
import { Badge } from '../../src/components/ui/badge'
import { Pencil } from 'lucide-react'
import { Instagram } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { upperFirst } from '../../lib/upperFirst'
import { GetPartnerInterestsQuery } from '../../src/generated/graphql'

type PartnerInterest = NonNullable<
  NonNullable<GetPartnerInterestsQuery['getPartnerInterests']>[0]
>

interface PartnerInterestCardProps {
  interest: PartnerInterest
  currentUserId: string | null
  myInterest: PartnerInterest | null
  alreadyRequested: boolean
  hasAcceptedRequest: boolean
  isOwnInterest: boolean
  setEditInterest: (val: {
    id: string
    category?: { id: string }
    description?: string
  }) => void
  setShowAuthModal: (val: boolean) => void
  onRequestToJoin: (fromInterestId: string | null, toInterestId: string) => void
  loading: boolean
}

export function PartnerInterestCard({
  interest,
  currentUserId,
  myInterest,
  alreadyRequested,
  hasAcceptedRequest,
  isOwnInterest,
  setEditInterest,
  setShowAuthModal,
  onRequestToJoin,
  loading,
}: PartnerInterestCardProps) {
  const handleRequestClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (loading) return

    if (!currentUserId) {
      setShowAuthModal(true)
      return
    }

    const fromInterestId = myInterest?.id || null
    onRequestToJoin(fromInterestId, interest.id)
  }

  const teamMembers = interest.teamMembers || []
  const partnerRequests = interest.partnerRequests || []
  const teamSize = interest.ticketType?.teamSize || interest.category?.teamSize || 1
  const interestStatus = interest.status

  const cleanDescription = (interest.description || '').trim()

  const activeTeamMembers = teamMembers.filter(
    (member) => member?.status === 'INVITED' || member?.status === 'ACCEPTED',
  )

  const acceptedPartnerRequests = partnerRequests.filter(
    (request) => request?.status === 'ACCEPTED',
  )

  const currentTeamSize = 1 + activeTeamMembers.length + acceptedPartnerRequests.length

  const allTeamMemberNames: string[] = []

  activeTeamMembers.forEach((member) => {
    if (member?.name) {
      allTeamMemberNames.push(member.name)
    }
  })

  acceptedPartnerRequests.forEach((request) => {
    if (request?.fromUser) {
      const name =
        `${request.fromUser.firstName} ${request.fromUser.lastName || ''}`.trim()
      if (name) {
        allTeamMemberNames.push(name)
      }
    } else if (request?.fromInterest?.user) {
      const name =
        `${request.fromInterest.user.firstName} ${request.fromInterest.user.lastName || ''}`.trim()
      if (name) {
        allTeamMemberNames.push(name)
      }
    }
  })

  const isTeamFull = interestStatus === 'FILLED'
  const isPartiallyFilled = interestStatus === 'PARTIALLY_FILLED'
  const isActive = interestStatus === 'ACTIVE'

  const shouldShowCard = isActive || isPartiallyFilled || isTeamFull

  if (!shouldShowCard) {
    return null
  }

  const getButtonState = () => {
    if (isOwnInterest) return { show: false, text: '', disabled: false }
    if (hasAcceptedRequest) return { show: false, text: '', disabled: false }
    if (alreadyRequested) return { show: true, text: 'Request Pending', disabled: true }
    if (isTeamFull) return { show: true, text: 'Team Complete', disabled: true }
    if (isPartiallyFilled) return { show: true, text: 'Request to Join', disabled: false }
    return { show: true, text: 'Request to Join', disabled: false }
  }

  const buttonState = getButtonState()

  // Build subtitle with key info
  const buildSubtitle = () => {
    const parts: string[] = []

    // Show ticket type name or category info
    if (interest.ticketType?.name) {
      // For competition-based interests, show ticket type name with proper case
      parts.push(
        interest.ticketType.name.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase()),
      )
    } else if (interest.category) {
      // For directory comp interests, show category details
      if (teamSize > 1) {
        const spotsLeft = teamSize - currentTeamSize
        if (spotsLeft > 0) {
          parts.push(`Looking for ${spotsLeft} more`)
        } else {
          parts.push('Team complete')
        }
      } else {
        parts.push('Individual')
      }

      if (interest.category.difficulty) {
        parts.push(upperFirst(interest.category.difficulty.toLowerCase()))
      }

      if (interest.category.gender) {
        parts.push(upperFirst(interest.category.gender.toLowerCase()))
      }

      if (teamSize > 1) {
        parts.push(`Team of ${teamSize}`)
      }
    }

    return parts.join(' • ')
  }

  return (
    <div
      className={`bg-card border border-card rounded-lg p-4 transition-all hover:shadow-sm text-foreground ${
        isOwnInterest ? 'border-primary/50 bg-primary/10 cursor-pointer' : ''
      }`}
      onClick={
        isOwnInterest
          ? () =>
              setEditInterest({
                id: interest.id,
                category: interest.category ? { id: interest.category.id } : undefined,
                description: cleanDescription ?? undefined,
              })
          : undefined
      }
    >
      {/* Header: Avatar + Name + Action */}
      <div className="flex items-center gap-3 mb-2">
        {interest.user && (
          <UIAvatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage
              src={
                interest.user.picture
                  ? `${interest.user.picture}?t=${Date.now()}`
                  : undefined
              }
              className="object-cover"
            />
            <AvatarFallback className="text-sm font-medium">
              {interest.user.firstName?.[0] || '?'}
            </AvatarFallback>
          </UIAvatar>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">
            {interest.user?.firstName} {interest.user?.lastName}
          </div>
          <div className="text-sm truncate">{buildSubtitle()}</div>
        </div>
        {isOwnInterest && <Pencil className="w-4 h-4 text-primary transition-colors" />}
      </div>

      {/* Message */}
      {cleanDescription && (
        <div className="text-sm mb-3 leading-relaxed">"{cleanDescription}"</div>
      )}

      {/* Team Members (if any) */}
      {allTeamMemberNames.length > 0 && (
        <div className="text-sm mb-3">
          <span className="font-medium">Team: </span>
          {allTeamMemberNames.join(', ')}
        </div>
      )}

      {/* Status Badge + Action + Socials */}
      <div className="flex items-center justify-between gap-3">
        {/* Status Badge */}
        {isTeamFull && (
          <Badge
            variant="outline"
            className="text-xs bg-success text-success-foreground border-success"
          >
            Complete
          </Badge>
        )}
        {isPartiallyFilled && (
          <Badge
            variant="outline"
            className="text-xs bg-yellow-600 text-yellow-100 border-yellow-700"
          >
            {currentTeamSize}/{teamSize} filled
          </Badge>
        )}
        {isActive && teamSize > 1 && (
          <Badge
            variant="outline"
            className="text-xs !bg-secondary !text-secondary-foreground !border-secondary"
          >
            {currentTeamSize}/{teamSize} spots
          </Badge>
        )}
        {!isTeamFull && !isPartiallyFilled && !isActive && <div />}

        <div className="flex items-center gap-2">
          {interest.instagram && (
            <a
              href={
                interest.instagram.startsWith('http')
                  ? interest.instagram
                  : `https://instagram.com/${interest.instagram.replace(/^@/, '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:text-pink-600"
              onClick={(e) => e.stopPropagation()}
              aria-label="Instagram profile"
              title="Instagram profile"
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {buttonState.show && (
            <Button
              onClick={handleRequestClick}
              disabled={loading || buttonState.disabled}
              size="sm"
              variant={
                buttonState.text === 'Request Pending' || buttonState.disabled
                  ? 'outline'
                  : 'default'
              }
              className={buttonState.disabled ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {buttonState.text}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
