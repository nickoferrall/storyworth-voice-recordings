// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://50abdbfa66e49fdd96553122ea268cc1@o4508246856957952.ingest.de.sentry.io/4508246858334288',

    integrations: [Sentry.replayIntegration()],

    // Production settings
    tracesSampleRate: 0.1, // Reduced sample rate for production
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // All sessions with errors

    debug: false,
    environment: 'production',
  })
}
