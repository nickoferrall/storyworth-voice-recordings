// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://50abdbfa66e49fdd96553122ea268cc1@o4508246856957952.ingest.de.sentry.io/4508246858334288',

    // Define how likely traces are sampled. Adjust this value in production
    tracesSampleRate: 0.1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry
    debug: false,

    // Explicitly set the environment
    environment: 'production',
  })
}
