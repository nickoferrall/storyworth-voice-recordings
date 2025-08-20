import { ApolloServer, ApolloServerPlugin, BaseContext } from '@apollo/server'
import { schema } from '../../graphql/schema'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { createContext } from '../../graphql/context'
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground'
import * as Sentry from '@sentry/nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const allowCors = (fn: any) => async (req: any, res: any) => {
  const allowedOrigins = [
    'https://storyworth-voice-recordings.fly.dev',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ]

  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }

  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  await fn(req, res)
}

// Determine if the environment is development or playground is explicitly enabled
const isDev = process.env.NODE_ENV === 'development'
const enablePlayground = isDev || process.env.ENABLE_PLAYGROUND === 'true'

// Configure Apollo Server
const apolloServer = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV === 'development', // Only enable introspection in development
  formatError: (err) => {
    // Log slow queries and return user-friendly errors
    if (err.message.includes('timeout') || err.message.includes('slow')) {
      Sentry.captureException(err, {
        tags: { source: 'graphql_timeout' },
      })
      return new Error('Request is taking longer than expected. Please try again.')
    }
    return err
  },
  plugins: [
    enablePlayground
      ? ApolloServerPluginLandingPageGraphQLPlayground({
          settings: {
            'request.credentials': 'include', // Include cookies for authentication
          },
        })
      : undefined,
    {
      requestDidStart: async () => ({
        willSendResponse: async ({ errors, response, request }: any) => {
          if (errors) {
            errors.forEach((error: any) => {
              Sentry.captureException(error, {
                tags: {
                  source: 'graphql_error',
                },
              })
            })
          }

          // Track slow GraphQL queries in production
          if (process.env.NODE_ENV === 'production' && response?.http?.body) {
            const executionTime = response.extensions?.tracing?.execution?.duration
            if (executionTime > 2000) {
              // Log queries slower than 2 seconds
              Sentry.captureMessage(`Slow GraphQL Query: ${request?.query}`, {
                level: 'warning',
                tags: {
                  source: 'slow_graphql_query',
                  execution_time: executionTime,
                },
              })
            }
          }
        },
      }),
    },
  ].filter(
    (plugin): plugin is ApolloServerPlugin<BaseContext> =>
      plugin !== null && plugin !== undefined,
  ),
})

const handler = startServerAndCreateNextHandler(apolloServer, {
  context: async (req, res) => {
    return createContext({ req, res })
  },
})

// Custom handler that checks for super user access to playground
const customHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // If it's a GET request (playground access) and we're in production
  if (req.method === 'GET' && process.env.NODE_ENV === 'production') {
    // Create context to check user permissions
    const context = await createContext({ req, res })

    // If user is not a super user, return 404
    if (!(context as any).user?.isSuperUser) {
      res.status(404).json({ error: 'Not Found' })
      return
    }
  }

  // Otherwise, proceed with normal handler
  return handler(req, res)
}

export default allowCors(customHandler)
