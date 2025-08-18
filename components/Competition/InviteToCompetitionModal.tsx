import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '../../src/components/ui/button'
import ErrorMessage from '../Layout/ErrorMessage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { useInviteToCompetitionMutation } from '../../src/generated/graphql'
import { toast } from '../../src/hooks/use-toast'

interface Props {
  open: boolean
  onClose: () => void
  competitionId: string
  competitionName: string
}

export const InviteToCompetitionModal: React.FC<Props> = ({
  open,
  onClose,
  competitionId,
  competitionName,
}) => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [inviteToCompetition, { loading }] = useInviteToCompetitionMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Clear any previous errors

    if (!email.trim()) {
      setError('Please enter an email address')
      return
    }

    try {
      await inviteToCompetition({
        variables: {
          competitionId,
          email: email.trim(),
        },
        notifyOnNetworkStatusChange: true,
      })

      toast({
        title: 'Invitation Sent',
        description: `An invitation to manage ${competitionName} has been sent to ${email}`,
      })

      setEmail('')
      setError('')

      // Small delay to ensure success state is processed
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (error: any) {
      // Extract the actual error message from GraphQL error
      const errorMessage =
        error.graphQLErrors?.[0]?.message || error.message || 'Something went wrong'
      setError(errorMessage)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Someone to Manage Competition</DialogTitle>
          <DialogDescription>
            Invite someone to help manage "{competitionName}". They'll be able to see all
            competition details, manage participants, and make changes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('') // Clear error when user types
                }}
                placeholder="Enter email address"
                className="col-span-3"
                required
              />
            </div>
          </div>

          <ErrorMessage error={error} className="w-full mx-auto" />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
