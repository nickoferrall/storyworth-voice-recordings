import { PostHog } from 'posthog-node'
import { getUser } from '../lib/userInRedis'
import { Context } from '../graphql/context'
import { checkCompetitionOwnership } from './checkCompetitionOwnership'

export default function withAuth(
  getServerSidePropsFunc: any,
  redirect: boolean | undefined = true,
  checkOwnership: boolean = false,
) {
  return async (context: Context) => {
    const redirectPath = '/signup'
    const { req, resolvedUrl, query } = context
    const user = await getUser(context)

    const host = req.headers.host || ''
    const subdomain = host.split('.')[0]

    if (user) {
      if (process.env.NODE_ENV === 'production') {
        const client = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
          host: process.env.NEXT_PUBLIC_POSTHOG_HOST || '',
        })
        if (user) {
          client.capture({
            distinctId: user.id,
            event: 'User Authenticated',
            properties: {
              $set: { name: user.firstName + ' ' + user.lastName, email: user.email },
            },
          })
          await client.shutdownAsync()
        }
      }
    }

    if (!user && redirect && resolvedUrl !== redirectPath) {
      return {
        redirect: {
          destination: redirectPath,
          permanent: false,
        },
      }
    }

    // Check competition ownership if required
    if (checkOwnership && user && query.id) {
      const competitionId = query.id as string

      // Create minimal context with user for the ownership check
      const ownershipResult = await checkCompetitionOwnership(competitionId, user.id, {
        user,
      } as any)

      if (!ownershipResult.hasAccess) {
        return {
          redirect: {
            destination: '/unauthorized',
            permanent: false,
          },
        }
      }
    }

    context.user = user

    // Ensure getServerSidePropsFunc always returns an object
    const getServerSidePropsResult = await getServerSidePropsFunc(context)
    if (!getServerSidePropsResult || typeof getServerSidePropsResult !== 'object') {
      console.error('getServerSideProps did not return an object')
      return { props: {} } // Default return object if getServerSidePropsFunc fails
    }

    return {
      ...getServerSidePropsResult,
      props: {
        user,
        subdomain,
      },
    }
  }
}
