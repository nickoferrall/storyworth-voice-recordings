import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '../../src/components/ui/button'
import { useUser } from '../../contexts/UserContext'
import SignUpModal from '../../components/SignUp/SignUpModal'
import {
  useAcceptCompetitionInvitationMutation,
  useGetCompetitionInvitationQuery,
} from '../../src/generated/graphql'
import { toast } from '../../src/hooks/use-toast'

export default function CompetitionInvitePage() {
  const router = useRouter()
  const { token } = router.query
  const { user } = useUser()
  const [showSignUp, setShowSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptInvitation] = useAcceptCompetitionInvitationMutation()

  // Get competition invitation details
  const { data: invitationData } = useGetCompetitionInvitationQuery({
    variables: { token: typeof token === 'string' ? token : '' },
    skip: !token || typeof token !== 'string',
  })

  useEffect(() => {
    if (!token || typeof token !== 'string') return

    if (!user) {
      setShowSignUp(true)
      return
    }

    setShowSignUp(false)
  }, [token, user])

  const handleAccept = async () => {
    if (!token || typeof token !== 'string') return

    setLoading(true)
    setError('')

    try {
      await acceptInvitation({
        variables: { token },
      })

      setSuccess('Successfully joined as competition manager!')

      toast({
        title: 'Invitation Accepted',
        description: 'You can now manage this competition from your dashboard.',
      })

      setTimeout(() => {
        router.push('/manage')
      }, 2000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to accept invitation'
      setError(errorMessage)

      toast({
        title: 'Failed to Accept Invitation',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = () => {
    router.push('/')
  }

  if (!token) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Invalid Invitation
              </h1>
              <p className="text-gray-600 mb-6">
                This invitation link is invalid or expired.
              </p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 flex flex-col justify-center px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Competition Management Invitation
            </h1>

            {!user ? (
              <div>
                <p className="text-gray-600 mb-6">
                  You've been invited to help manage a competition. Please sign up or log
                  in to accept this invitation.
                </p>
                <Button onClick={() => setShowSignUp(true)} className="w-full">
                  Sign Up / Log In
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">
                  You've been invited to help manage{' '}
                  {invitationData?.getCompetitionInvitation?.competition?.name ? (
                    <strong className="text-gray-900">
                      {invitationData.getCompetitionInvitation.competition.name}
                    </strong>
                  ) : (
                    'a competition'
                  )}
                  . As a manager, you'll be able to:
                </p>
                <ul className="text-left text-gray-600 mb-6 space-y-2">
                  <li>• View and manage competition details</li>
                  <li>• Manage participants and registrations</li>
                  <li>• Create and manage heats</li>
                  <li>• Enter scores and results</li>
                  <li>• Send emails to participants</li>
                </ul>

                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button onClick={handleDecline} variant="outline" className="flex-1">
                    Decline
                  </Button>
                  <Button onClick={handleAccept} disabled={loading} className="flex-1">
                    {loading ? 'Accepting...' : 'Accept Invitation'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSignUp && (
        <SignUpModal
          open={showSignUp}
          onClose={() => setShowSignUp(false)}
          refetch={() => {
            setShowSignUp(false)
          }}
        />
      )}
    </div>
  )
}
