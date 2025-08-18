import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'

interface UserProfileModalProps {
  user: {
    id: string
    name?: string
    firstName?: string
    lastName?: string
    picture?: string
    bio?: string
  } | null
  open: boolean
  onClose: () => void
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  open,
  onClose,
}) => {
  if (!user) return null

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={user.picture ? `${user.picture}?t=${Date.now()}` : undefined}
              alt={displayName}
            />
            <AvatarFallback className="text-2xl">
              {user.firstName?.[0] || user.name?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{displayName}</h3>
            {user.bio ? (
              <div className="mt-3 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground italic">"{user.bio}"</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">No bio available</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
