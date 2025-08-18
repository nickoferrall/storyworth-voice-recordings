// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://50abdbfa66e49fdd96553122ea268cc1@o4508246856957952.ingest.de.sentry.io/4508246858334288',

    // Production settings
    tracesSampleRate: 0.1, // Reduced sample rate for production

    debug: false,
    environment: 'production',
  })
}
