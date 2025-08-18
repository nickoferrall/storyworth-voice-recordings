import { useRouter } from 'next/router'
import * as Sentry from '@sentry/nextjs'

const useCompetitionId = (): string | null => {
  const router = useRouter()
  const { id } = router.query

  // Early return for non-ready router (preserves original timing)
  if (!router.isReady || !id) {
    return null
  }

  // Handle case where id is an array (shouldn't happen but Next.js allows it)
  if (Array.isArray(id)) {
    const firstId = id[0]
    if (firstId) {
      Sentry.captureMessage('useCompetitionId received array of IDs', {
        extra: { ids: id, pathname: router.pathname, query: router.query },
      })
      return firstId
    }
    return null
  }

  // Validate it's a reasonable string
  if (typeof id === 'string' && id.length > 0) {
    // Additional validation - catch obviously wrong IDs
    if (id.length > 100 || id.includes('<') || id.includes('>')) {
      Sentry.captureMessage('useCompetitionId received suspicious ID format', {
        extra: { id, type: typeof id, pathname: router.pathname, query: router.query },
      })
      return null
    }
    return id
  }

  // Log unexpected cases
  Sentry.captureMessage('useCompetitionId received invalid ID format', {
    extra: { id, type: typeof id, pathname: router.pathname, query: router.query },
  })
  return null
}

export default useCompetitionId
