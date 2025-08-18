import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { Badge } from '../../src/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../src/components/ui/command'
import { Textarea } from '../../src/components/ui/textarea'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import { toast } from '../../src/hooks/use-toast'
import {
  GetSentEmailsDocument,
  useGetRegistrationEmailsByCompetitionIdQuery,
  useSendEmailsMutation,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'

type Props = {
  open: boolean
  onClose: () => void
}

const EmailModal = (props: Props) => {
  const { open, onClose } = props
  const [recipients, setRecipients] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendEmails] = useSendEmailsMutation()
  const competitionId = useCompetitionId()
  const { data, loading } = useGetRegistrationEmailsByCompetitionIdQuery({
    variables: {
      competitionId,
    },
  })
  const athleteEmails =
    data?.getRegistrationsByCompetitionId?.map((reg) => reg.user.email) || []
  console.log('🚀 ~ athleteEmails:', { athleteEmails, recipients })

  const [inputValue, setInputValue] = useState('')

  const handleSelect = (currentValue: string) => {
    if (currentValue === 'All Athletes') {
      setRecipients(athleteEmails || [])
    } else if (!recipients.includes(currentValue)) {
      setRecipients([...recipients, currentValue])
    }
    setInputValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (recipients.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please add at least one recipient.',
      })
      return
    }
    try {
      const { data } = await sendEmails({
        variables: { recipients, subject, message, competitionId },
        refetchQueries: [{ query: GetSentEmailsDocument }],
      })
      if (data?.sendEmails) {
        toast({
          title: 'Success',
          description: 'Email sent successfully!',
        })
        setRecipients([])
        setSubject('')
        setMessage('')
        setTimeout(handleClose, 2000)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to send email.',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An error occurred while sending the email.',
      })
    }
  }

  const handleClose = () => {
    setRecipients([])
    setSubject('')
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Recipients</Label>
            <Command className="border rounded-lg">
              <CommandInput
                placeholder={loading ? 'Loading...' : 'Search recipients...'}
                value={inputValue}
                onValueChange={setInputValue}
                disabled={loading}
              />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty>
                  {loading ? 'Loading recipients...' : 'No recipients found.'}
                </CommandEmpty>
                <CommandGroup>
                  {!loading && (
                    <CommandItem onSelect={() => handleSelect('All Athletes')}>
                      All Athletes ({athleteEmails.length})
                    </CommandItem>
                  )}
                  {!loading &&
                    athleteEmails
                      .filter(
                        (email) =>
                          email.toLowerCase().includes(inputValue.toLowerCase()) &&
                          !recipients.includes(email),
                      )
                      .map((email) => (
                        <CommandItem key={email} onSelect={() => handleSelect(email)}>
                          {email}
                        </CommandItem>
                      ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipients.map((recipient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setRecipients(recipients.filter((_, i) => i !== index))}
                >
                  {recipient}
                  <span className="ml-1">×</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your message here"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmailModal
