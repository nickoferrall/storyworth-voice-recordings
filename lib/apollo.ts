import { useMemo } from 'react'
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client'

let apolloClient: ApolloClient<InMemoryCache> | undefined

function createApolloClient(req: any) {
  const isServer = typeof window === 'undefined'
  const uri = isServer
    ? process.env.NODE_ENV === 'production'
      ? 'https://fitlo.co/api/graphql'
      : 'http://localhost:3000/api/graphql'
    : '/api/graphql'

  const httpLink = new HttpLink({
    uri,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const authLink = new ApolloLink((operation, forward) => {
    return forward(operation)
  })

  return new ApolloClient({
    ssrMode: typeof window === 'undefined', // Disables forceFetch on the server (so queries are only run once)
    link: authLink.concat(httpLink),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            links: {
              // your type policies
            },
            getDirectoryComps: {
              // Cache the full list of directory comps
              merge: false,
            },
          },
        },
      },
    }),
  })
}

export function initializeApollo(initialState = null, req = null) {
  const _apolloClient = apolloClient ?? createApolloClient(req)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state gets hydrated here
  if (initialState) {
    const existingCache = _apolloClient.extract()
    // Merge the existing cache into data passed from the getServerSideProps/getStaticProps inside your Next.js pages
    _apolloClient.cache.restore(Object.assign(existingCache, initialState))
  }

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient as ApolloClient<InMemoryCache>

  return _apolloClient
}
export function useApollo(initialState: any) {
  const store = useMemo(() => initializeApollo(initialState), [initialState])
  return store
}
