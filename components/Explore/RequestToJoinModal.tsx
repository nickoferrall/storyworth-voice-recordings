import React, { useState } from 'react'
import { Button } from '../../src/components/ui/button'
import { Label } from '../../src/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'

interface RequestToJoinModalProps {
  open: boolean
  onClose: () => void
  targetInterest: {
    id: string
    description?: string
    user?: {
      id: string
      firstName?: string
      lastName?: string
      picture?: string
      bio?: string
    }
    category?: {
      difficulty?: string
      gender?: string
      teamSize?: number
    }
    teamMembers?: Array<{
      name?: string
      email?: string
    }>
  }
  userHasInterest: boolean
  onCreateInterest: () => void
  onSendRequest: (message?: string, phone?: string, instagram?: string) => void
}

export const RequestToJoinModal: React.FC<RequestToJoinModalProps> = ({
  open,
  onClose,
  targetInterest,
  userHasInterest,
  onCreateInterest,
  onSendRequest,
}) => {
  const [message, setMessage] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [instagram, setInstagram] = useState('')

  if (!open) return null

  const handleSendRequest = async () => {
    setIsLoading(true)
    try {
      await onSendRequest(message, phone, instagram)
      onClose()
    } catch (error) {
      console.error('Failed to send request:', error)
      // You could add error state here if needed
      // For now, just reset loading state and keep modal open
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateInterest = () => {
    onCreateInterest()
    onClose()
  }

  const teamMembers = targetInterest.teamMembers?.filter((member) => member?.name) || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request to Join {targetInterest.user?.firstName}</DialogTitle>
        </DialogHeader>

        {targetInterest.user && (
          <div className="mb-4 p-3 bg-card rounded-lg text-white">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={
                    targetInterest.user.picture
                      ? `${targetInterest.user.picture}?t=${Date.now()}`
                      : undefined
                  }
                  alt={`${targetInterest.user.firstName} ${targetInterest.user.lastName}`}
                />
                <AvatarFallback>
                  {targetInterest.user.firstName?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  {targetInterest.user.firstName} {targetInterest.user.lastName}
                </h3>
                {targetInterest.user.bio ? (
                  <p className="text-sm italic text-white">"{targetInterest.user.bio}"</p>
                ) : (
                  <p className="text-sm text-white">No bio available</p>
                )}
              </div>
            </div>

            {(targetInterest.description || teamMembers.length > 0) && (
              <div className="border-t border-white/20 pt-3">
                {targetInterest.description && (
                  <>
                    <h4 className="text-sm font-medium mb-1">Looking for:</h4>
                    <p className="text-sm mb-2">"{targetInterest.description}"</p>
                  </>
                )}
                {teamMembers.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Team Members: </span>
                    {teamMembers.map((member, index) => (
                      <span key={index}>
                        {member.name}
                        {index < teamMembers.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* <div className="mb-4">
     <p className=" mb-2">
      Category: {targetInterest.category?.difficulty} •{' '}
      {targetInterest.category?.gender} •
      {targetInterest.category?.teamSize === 1
       ? ' Individual'
       : ` Team of ${targetInterest.category?.teamSize}`}
     </p>
    </div> */}

        {!userHasInterest ? (
          <div>
            <p className=" mb-4">
              To send a partner request, you need to create your own partner interest in
              this category first.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInterest} className="flex-1">
                Create My Interest
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <Label htmlFor="message">Add a message (optional)</Label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                rows={3}
                placeholder="Tell them about your fitness level, experience, or why you'd be a great partner..."
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="phone">Phone (optional)</Label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                placeholder="+1 (555) 123-4567"
              />
              <p className="text-xs mt-1">
                Share your phone number for easier coordination
              </p>
            </div>
            <div className="mb-4">
              <Label htmlFor="instagram">Instagram (optional)</Label>
              <input
                id="instagram"
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full p-2 border rounded mt-1"
                placeholder="@yourhandle or instagram.com/yourhandle"
              />
              <p className="text-xs mt-1">
                Include your Instagram to make it easier to connect
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 hover:bg-muted hover:text-foreground"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button onClick={handleSendRequest} className="flex-1" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
