import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { useSendInvitationsMutation } from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'

type Props = {
  open: boolean
  handleClose: () => void
  refetch?: () => void
  eventLink: string | null
}

const InviteModal = (props: Props) => {
  const { open, handleClose, refetch, eventLink } = props
  const [emails, setEmails] = useState<string[]>([''])
  const [error, setError] = useState<string | null>(null)
  const [sendInvitations, { loading: isInviting }] = useSendInvitationsMutation()
  const competitionId = useCompetitionId()
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopyLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!eventLink) return
    navigator.clipboard.writeText(eventLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const handleAddEmailField = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setEmails([...emails, ''])
  }

  const handleRemoveEmailField = (index: number) => {
    const newEmails = emails.filter((_, i) => i !== index)
    setEmails(newEmails)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent submission while loading or if no competition ID
    if (isInviting || !competitionId) {
      if (!competitionId) {
        setError('Competition not found. Please try again.')
      }
      return
    }

    // Clear any existing errors
    setError(null)

    const isValid = emails.every((email) => validateEmail(email))
    if (!isValid) {
      setError('Please enter valid email addresses.')
      return
    }

    try {
      const res = await sendInvitations({
        variables: {
          emails,
          competitionId,
        },
      })
      refetch && refetch()
      setError(null)
      handleClose()
    } catch (error) {
      console.error('Error sending invitations:', error)
      setError('Failed to send invitations. Please try again.')
    }
  }

  const validateEmail = (email: string) => {
    // Basic email validation (can be improved)
    return /\S+@\S+\.\S+/.test(email)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
        </DialogHeader>
        <form className="w-full" onSubmit={handleSubmit}>
          {emails.map((email, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <Label htmlFor={`email-${index}`}>Email</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="Enter email"
                  disabled={isInviting}
                />
              </div>
              {emails.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveEmailField(index)}
                  className="mt-6"
                  disabled={isInviting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            onClick={handleAddEmailField}
            className="flex items-center text-sm"
            disabled={isInviting}
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            Add Email
          </Button>

          <div className="flex items-end gap-2 mt-4">
            <div className="flex-1">
              <Label htmlFor="share-link">Or share this link</Label>
              <Input id="share-link" value={eventLink ?? ''} readOnly />
            </div>
            <Button type="button" variant="secondary" onClick={handleCopyLink}>
              {linkCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting || !competitionId}>
              {isInviting ? 'Inviting...' : 'Invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default InviteModal
