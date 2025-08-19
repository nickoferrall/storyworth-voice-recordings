import React from 'react'
import '../styles/tailwind.css'
import { ApolloProvider } from '@apollo/client'
import { useApollo } from '../lib/apollo'
import { AppProps } from 'next/app'
import Head from 'next/head'

interface MyAppProps extends AppProps {}

function MyApp({ Component, pageProps }: MyAppProps) {
  const isHomePage = true

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Record your story by phone with Storyworth" />
        <title>Storyworth</title>
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

      <ApolloProvider client={useApollo(pageProps.initialApolloState)}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  )
}

export default MyApp
