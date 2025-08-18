import React from 'react'
import { useRouter } from 'next/router'
import { usePostHog } from 'posthog-js/react'
import StripeManager from '../lib/stripeManager'
import { createRegistration } from '../graphql/mutations/helpers/createRegistration'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { createDataLoaders } from '../lib/dataloaders'
import { Context } from '../graphql/context'
import getRedis from '../utils/getRedis'

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { query } = context
  const { session_id } = query

  if (!session_id || typeof session_id !== 'string') {
    return { props: { error: 'Invalid session ID' } }
  }

  try {
    const stripeManager = new StripeManager()
    const paymentStatus = await stripeManager.verifyPaymentSession(session_id)

    if (paymentStatus.success) {
      const redis = getRedis()
      const fullMetadataString = await redis.get(`checkout:${session_id}`)
      const fullMetadata = fullMetadataString ? JSON.parse(fullMetadataString) : {}
      const {
        name,
        ticketTypeId,
        answers,
        invitationToken,
        selectedHeatId,
        email,
        redirectTo,
      } = fullMetadata

      const parsedAnswers = answers || []

      const minimalContext = {
        loaders: createDataLoaders({ req: context.req, res: context.res } as any),
        req: context.req,
        res: context.res,
      } as Context

      const { updatedUser, competitionId } = await createRegistration({
        email,
        name,
        ticketTypeId,
        answers: parsedAnswers,
        selectedHeatId: selectedHeatId || null,
        invitationToken: invitationToken || null,
        context: minimalContext,
      })

      console.log('Thank you page - competitionId:', competitionId)
      console.log('Thank you page - redirectTo:', redirectTo)

      // Track successful payment completion (server-side)
      console.log('✅ Payment completed successfully:', {
        competitionId,
        ticketTypeId,
        userEmail: email,
        sessionId: session_id,
      })

      return {
        props: {
          paymentStatus,
          registrationComplete: true,
          user: JSON.parse(JSON.stringify(updatedUser)),
          competitionId: competitionId || null,
          redirectTo: redirectTo || null,
        },
      }
    }

    return { props: { paymentStatus } }
  } catch (error: any) {
    // console.error('Error verifying payment or creating registration:', error)
    return {
      props: {
        error: error.message || 'Failed to verify payment or complete registration',
      },
    }
  }
}

const ThankYouPage = ({
  paymentStatus,
  registrationComplete,
  user,
  competitionId,
  redirectTo,
  error,
}: {
  paymentStatus?: { success: boolean; sessionId: string }
  registrationComplete?: boolean
  user?: any
  competitionId?: string
  redirectTo?: string
  error?: string
}) => {
  const router = useRouter()
  const posthog = usePostHog()

  React.useEffect(() => {
    if (registrationComplete && user) {
      // Track successful registration completion (client-side)
      posthog?.capture('Registration Completed', {
        competitionId,
        registrationType: 'paid',
        paymentSessionId: paymentStatus?.sessionId,
      })

      const redirectTimeout = setTimeout(async () => {
        try {
          // Use custom redirect URL if provided, otherwise default to competition page or explore
          const targetUrl =
            redirectTo || (competitionId ? `/event/${competitionId}` : '/explore')
          console.log('Redirecting to:', targetUrl)
          await router.push(targetUrl)
        } catch (error) {
          console.error('Redirect failed:', error)
          // Fallback to explore page if redirect fails
          router.push('/explore')
        }
      }, 5000) // 5 seconds delay

      return () => clearTimeout(redirectTimeout)
    }
  }, [registrationComplete, user, router, competitionId, redirectTo])

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center pt-16 h-full">
        <h2 className="text-xl text-center text-destructive font-semibold mb-4">
          Payment Verification or Registration Error
        </h2>
        <p className="text-center text-muted-foreground">
          {error}. Sorry! Please contact hello@fitlo.co.
        </p>
      </div>
    )
  }

  const handleManualRedirect = () => {
    const targetUrl =
      redirectTo || (competitionId ? `/event/${competitionId}` : '/explore')
    router.push(targetUrl)
  }

  return (
    <div className="flex flex-col justify-center items-center pt-16 h-full">
      <h2 className="text-xl text-center text-white font-semibold mb-4">
        Thank You for Your Payment!
      </h2>

      {registrationComplete && (
        <>
          <p className="text-center text-muted-foreground mt-4 mb-6">
            Registration complete! You'll be redirected in 5 seconds.
          </p>
          <button
            onClick={handleManualRedirect}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Continue to Event
          </button>
        </>
      )}

      {!registrationComplete && paymentStatus?.success && (
        <p className="text-center text-muted-foreground mt-4">
          Processing your registration...
        </p>
      )}
    </div>
  )
}

export default ThankYouPage
