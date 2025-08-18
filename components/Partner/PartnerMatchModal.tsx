import React from 'react'
import { Button } from '../../src/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'

interface PartnerMatchModalProps {
  open: boolean
  onClose: () => void
  partner: {
    name?: string
    firstName?: string
    lastName?: string
    email?: string
    picture?: string
    bio?: string
  } | null
  phone?: string | null
  competition: {
    title?: string
    website?: string
    ticketWebsite?: string
  } | null
}

export const PartnerMatchModal: React.FC<PartnerMatchModalProps> = ({
  open,
  onClose,
  partner,
  phone,
  competition,
}) => {
  if (!partner) return null

  const displayName =
    partner.name || `${partner.firstName || ''} ${partner.lastName || ''}`.trim()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">🎉 You've Got a Partner!</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src={partner.picture ? `${partner.picture}?t=${Date.now()}` : undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-lg">
                {partner.firstName?.[0] || partner.name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{partner.email}</p>
            </div>
          </div>

          {partner.bio && (
            <div className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm italic">"{partner.bio}"</p>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Next Steps:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Contact {partner.firstName || 'your partner'} by email
                {phone ? ' or message them' : ''}
              </p>
              <p>• Coordinate your competition registration together</p>
              {competition?.website && (
                <p>
                  • Register for the competition:
                  <a
                    href={competition.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline ml-1"
                  >
                    {competition.title}
                  </a>
                </p>
              )}
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
