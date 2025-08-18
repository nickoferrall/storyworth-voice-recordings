import React, { useState } from 'react'
import ManageLayout from '../../components/Layout/ManageLayout'
import dayjs from 'dayjs'
import EmailModal from '../../components/Emails/EmailModal'
import {
  useGetSentEmailsQuery,
  useGetRegistrationEmailsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import withAuth from '../../utils/withAuth'
import { Context } from '../../graphql/context'
import { Button } from '../../src/components/ui/button'
import { Download } from 'lucide-react'
import CustomizedTooltips from '../../components/Tooltip'
import useCompetitionId from '../../hooks/useCompetitionId'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  true, // Enable ownership check
)

const Emails = () => {
  const [open, setOpen] = useState(false)
  const competitionId = useCompetitionId()
  const { data } = useGetSentEmailsQuery({
    variables: { compId: competitionId! },
    skip: !competitionId,
  })
  const { data: athleteEmailsData } = useGetRegistrationEmailsByCompetitionIdQuery({
    variables: { competitionId: competitionId! },
    skip: !competitionId,
  })

  const handleClickNewEmail = () => {
    setOpen(true)
  }

  const handleOpenEmailClient = () => {
    const emails =
      athleteEmailsData?.getRegistrationsByCompetitionId?.map((reg) => reg.user.email) ||
      []

    console.log('📧 Emails found:', emails.length, emails)

    if (emails.length === 0) {
      alert('No participant emails found')
      return
    }

    // Try multiple approaches since mailto can be unreliable
    if (emails.length <= 100) {
      // Increased limit since we're using BCC
      const mailtoLink = `mailto:?bcc=${emails.join(',')}`
      console.log('📧 Trying mailto link with BCC:', mailtoLink)

      try {
        // Try creating a hidden link and clicking it (more reliable than window.location)
        const link = document.createElement('a')
        link.href = mailtoLink
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Show success message
        setTimeout(() => {
          alert(
            `Opened email client with ${emails.length} recipients in BCC. If your email client didn't open, the emails have been copied to your clipboard.`,
          )
          copyEmailsToClipboard(emails)
        }, 1000)
      } catch (error) {
        console.error('Failed to open email client:', error)
        alert('Could not open email client. Copying emails to clipboard instead.')
        copyEmailsToClipboard(emails)
      }
    } else {
      // For very large lists, copy to clipboard instead
      alert(
        `Too many emails (${emails.length}) for mailto. Copying to clipboard instead.`,
      )
      copyEmailsToClipboard(emails)
    }
  }

  const copyEmailsToClipboard = async (emails: string[]) => {
    try {
      const emailString = emails.join(', ')
      await navigator.clipboard.writeText(emailString)
      console.log('📧 Copied emails to clipboard:', emailString)
      alert(
        `✅ Copied ${emails.length} email addresses to clipboard!\n\nYou can now paste them into your email client.`,
      )
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      // Fallback: show emails in a prompt for manual copying
      const emailList = emails.join(', ')
      const result = prompt(
        '📧 Copy these email addresses manually:\n\n(Ctrl+C or Cmd+C to copy)',
        emailList,
      )
      if (result === null) {
        alert('You can manually copy the emails from the browser console (F12)')
        console.log('📧 Participant emails:', emailList)
      }
    }
  }

  return (
    <ManageLayout>
      <div className="flex flex-col justify-start items-center h-full w-full overflow-scroll p-0 md:p-4">
        <div className="w-full max-w-5xl md:min-w-[600px] space-y-8 pb-12">
          <div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Emails</h2>
                <CustomizedTooltips title="Click here to open your email client with all participant emails">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenEmailClient}
                    className="ml-2 p-2"
                  >
                    <Download className="h-5 w-5" />
                  </Button>
                </CustomizedTooltips>
              </div>
              <div>
                <Button variant="default" onClick={handleClickNewEmail}>
                  New Email
                </Button>
              </div>
            </div>
            <p className="text-sm mb-4">
              Send updates and important information to your athletes
            </p>
          </div>
          <ul className="space-y-4">
            {data?.getSentEmails.map((email, index) => (
              <li key={email.id} className="bg-white shadow-md w-full rounded-xl p-6">
                <h3 className="text-lg font-semibold">{email.subject}</h3>
                <p className="text-sm">
                  {dayjs(email.sentAt).format('MMMM D, YYYY')} -{' '}
                  {email.recipients.join(', ')}
                </p>
                <p className="text-sm">{email.message}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <EmailModal open={open} onClose={() => setOpen(false)} />
    </ManageLayout>
  )
}

export default Emails
