import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '../../src/components/ui/button'
import { useUser } from '../../contexts/UserContext'
import SignUpModal from '../../components/SignUp/SignUpModal'
import { useMutation, gql } from '@apollo/client'

const ACCEPT_TEAM_INVITATION = gql`
 mutation AcceptTeamInvitation($token: String!) {
  acceptTeamInvitation(token: $token) {
   id
   status
   partnerInterest {
    id
    user {
     firstName
     lastName
    }
    category {
     difficulty
     gender
     teamSize
     directoryComp {
      title
     }
    }
   }
  }
 }
`

const REJECT_TEAM_INVITATION = gql`
 mutation RejectTeamInvitation($token: String!) {
  rejectTeamInvitation(token: $token) {
   id
   status
  }
 }
`

export default function TeamInvitePage() {
 const router = useRouter()
 const { token } = router.query
 const { user } = useUser()
 const [showSignUp, setShowSignUp] = useState(false)
 const [invitationData, setInvitationData] = useState<any>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [success, setSuccess] = useState('')

 const [acceptInvitation] = useMutation(ACCEPT_TEAM_INVITATION)
 const [rejectInvitation] = useMutation(REJECT_TEAM_INVITATION)

 useEffect(() => {
  if (token && typeof token === 'string') {
   // For now, we'll just show the invitation interface
   // In a real implementation, you'd fetch invitation details
   setLoading(false)
  }
 }, [token])

 const handleAccept = async () => {
  if (!user) {
   setShowSignUp(true)
   return
  }

  try {
   const result = await acceptInvitation({
    variables: { token: token as string },
   })

   if (result.data?.acceptTeamInvitation) {
    setSuccess('Successfully joined the team!')
    setTimeout(() => {
     router.push('/partners')
    }, 2000)
   }
  } catch (error: any) {
   setError(error.message || 'Failed to accept invitation')
  }
 }

 const handleReject = async () => {
  try {
   await rejectInvitation({
    variables: { token: token as string },
   })

   setSuccess('Invitation declined.')
   setTimeout(() => {
    router.push('/')
   }, 2000)
  } catch (error: any) {
   setError(error.message || 'Failed to decline invitation')
  }
 }

 if (loading) {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
     <p>Loading invitation...</p>
    </div>
   </div>
  )
 }

 if (success) {
  return (
   <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
     <div className="text-green-600 text-6xl mb-4">✓</div>
     <h1 className="text-2xl font-bold mb-2">{success}</h1>
     <p className="">Redirecting...</p>
    </div>
   </div>
  )
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
   <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
    <div className="text-center mb-6">
     <h1 className="text-2xl font-bold mb-2">Team Invitation</h1>
     <p className="">
      You've been invited to join a team for a fitness competition!
     </p>
    </div>

    {error && (
     <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
      <p className="text-red-800 text-sm">{error}</p>
     </div>
    )}

    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
     <h3 className="font-semibold mb-2">Invitation Details</h3>
     <p className="text-sm mb-2">Competition: Loading...</p>
     <p className="text-sm mb-2">Team Captain: Loading...</p>
     <p className="text-sm">Category: Loading...</p>
    </div>

    {!user ? (
     <div className="space-y-3">
      <p className="text-sm text-center mb-4">
       You need to create an account or sign in to accept this invitation.
      </p>
      <Button onClick={() => setShowSignUp(true)} className="w-full">
       Create Account & Join Team
      </Button>
      <Button
       variant="outline"
       onClick={() => router.push('/login')}
       className="w-full"
      >
       Sign In
      </Button>
     </div>
    ) : (
     <div className="space-y-3">
      <Button onClick={handleAccept} className="w-full">
       Accept Invitation
      </Button>
      <Button variant="outline" onClick={handleReject} className="w-full">
       Decline Invitation
      </Button>
     </div>
    )}

    {showSignUp && (
     <SignUpModal
      open={showSignUp}
      onClose={() => setShowSignUp(false)}
      refetch={() => {
       // After signup, the user will be logged in and can accept
       setShowSignUp(false)
      }}
     />
    )}
   </div>
  </div>
 )
}
