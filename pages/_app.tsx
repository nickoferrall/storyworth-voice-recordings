import React from 'react'
import '../styles/tailwind.css'
import DefaultLayout from '../components/Layout'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo'
import ErrorBoundary from '../lib/ErrorBoundary'
import { UserProvider } from '../contexts/UserContext'
import { AppProps } from 'next/app'
import { NextComponentType, NextPageContext } from 'next'
import { CompetitionProvider } from '../contexts/CompetitionContext'
import Head from 'next/head'
import Script from 'next/script'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

interface MyAppProps extends AppProps {
  Component: NextComponentType<NextPageContext, any, any> & {
    layout?: React.ComponentType
  }
  pageProps: {
    initialApolloState?: any
    user?: any
  }
}

function MyApp({ Component, pageProps }: MyAppProps) {
  const Layout = Component.layout || DefaultLayout
  const router = useRouter()

  useEffect(() => {
    // Initialize PostHog
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      posthog.init('phc_Fr9AtEgSPZ2Bj5P8nCW2lF1QzZjryHAl7mQwYuNILa7', {
        api_host: 'https://eu.i.posthog.com',
        capture_pageview: false, // We'll handle this manually
        autocapture: true,
      })
    }

    // Track page views
    const handleRouteChange = () => {
      if (process.env.NODE_ENV === 'production') {
        posthog.capture('$pageview')
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // Only apply global CSS for non-homepage routes
  const isHomePage = router.pathname === '/'

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="The home of functional fitness competitions" />
        <title>fitlo</title>
        {!isHomePage && (
          <style>{`
            /* Apply global dark theme only for non-homepage routes */
            :root {
              --background: 233 22% 18%; /* #23243a */
              --foreground: 0 0% 100%; /* #fff */
              --card: 232 19% 23%; /* #292B3E */
              --card-foreground: 0 0% 100%;
              --popover: 232 19% 23%;
              --popover-foreground: 0 0% 100%;
              --primary: 263 61% 63%; /* purple accent */
              --primary-foreground: 0 0% 98%;
              --secondary: 232 19% 28%;
              --secondary-foreground: 0 0% 100%;
              --muted: 232 10% 50%; /* #A1A1AA */
              --muted-foreground: 0 0% 80%;
              --accent: 263 61% 63%;
              --accent-foreground: 0 0% 100%;
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 210 40% 98%;
              --border: 232 19% 28%;
              --input: 232 19% 28%;
              --ring: 263 61% 63%;
              --radius: 0.5rem;
              --success: 142 76% 36%;
              --success-foreground: 0 0% 100%;
            }

            h1, h2, h3, h4, h5, h6 {
              @apply font-display text-white;
            }

            * {
              @apply border-border;
            }

            body {
              @apply bg-background text-foreground;
            }

            /* Form inputs should have white backgrounds and dark text by default */
            input, textarea, select {
              @apply bg-white text-gray-900 border-gray-300;
            }

            /* Override shadcn/ui transparent backgrounds for form elements */
            input.bg-transparent, textarea.bg-transparent, select.bg-transparent, [role='combobox'].bg-transparent, button.bg-transparent {
              background-color: white;
              color: #111827;
            }

            /* Ensure shadcn/ui select triggers are visible */
            [data-radix-select-trigger] {
              background-color: white;
              color: #111827;
            }

            /* White/light background containers should have dark text */
            .bg-white, .bg-white *:not(input):not(textarea):not(select):not(button),
            .bg-gray-50, .bg-gray-50 *:not(input):not(textarea):not(select):not(button),
            .bg-gray-100, .bg-gray-100 *:not(input):not(textarea):not(select):not(button),
            .bg-slate-50, .bg-slate-50 *:not(input):not(textarea):not(select):not(button),
            .bg-neutral-50, .bg-neutral-50 *:not(input):not(textarea):not(select):not(button),
            .bg-stone-50, .bg-stone-50 *:not(input):not(textarea):not(select):not(button) {
              color: #111827;
            }

            /* Tables and data display components */
            table, table *:not(input):not(textarea):not(select):not(button),
            .table, .table *:not(input):not(textarea):not(select):not(button),
            .data-table, .data-table *:not(input):not(textarea):not(select):not(button),
            [role='table'], [role='table'] *:not(input):not(textarea):not(select):not(button),
            [role='grid'], [role='grid'] *:not(input):not(textarea):not(select):not(button) {
              color: #111827;
            }

            /* Card components should have appropriate text colors */
            .bg-card, .bg-card *:not(input):not(textarea):not(select):not(button) {
              color: hsl(var(--card-foreground));
            }

            /* Override for specific UI components that should stay their intended colors */
            .bg-white .text-purple-500, .bg-gray-50 .text-purple-500, .bg-gray-100 .text-purple-500 {
              color: #8b5cf6;
            }

            .bg-white .text-primary, .bg-gray-50 .text-primary, .bg-gray-100 .text-primary {
              color: hsl(var(--primary));
            }

            /* Links within white containers */
            .bg-white a, .bg-gray-50 a, .bg-gray-100 a {
              color: #2563eb;
            }

            .bg-white a:hover, .bg-gray-50 a:hover, .bg-gray-100 a:hover {
              color: #1e40af;
            }

            /* Allow muted text for secondary content */
            .text-muted-foreground {
              color: hsl(var(--muted-foreground));
            }

            /* Allow destructive text for errors */
            .text-destructive {
              color: hsl(var(--destructive));
            }
          `}</style>
        )}
      </Head>

      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-32WFWB1LKN"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-32WFWB1LKN');
        `}
      </Script>

      <ApolloProvider client={useApollo(pageProps.initialApolloState)}>
        {/* <Layout user={pageProps.user}> */}
        <UserProvider>
          <Layout>
            {/* <UserProvider initialUser={pageProps.user}> */}
            <ErrorBoundary>
              <CompetitionProvider>
                <Component {...pageProps} />
              </CompetitionProvider>
            </ErrorBoundary>
          </Layout>
        </UserProvider>
      </ApolloProvider>
    </>
  )
}

export default MyApp
