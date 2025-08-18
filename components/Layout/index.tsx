import { useRouter } from 'next/router'
import React from 'react'
import clsx from 'clsx'
import Header from './Header'
import { Inter, Lexend } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const lexend = Lexend({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lexend',
})

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const isHomePage = router.pathname === '/'

  if (isHomePage) {
    // Return the Salient-style layout for the home page
    return (
      <div
        lang="en"
        className={clsx(
          'h-full scroll-smooth bg-white antialiased',
          inter.variable,
          lexend.variable,
        )}
      >
        <main className="flex h-full flex-col">{children}</main>
      </div>
    )
  }

  // Return the existing layout for other pages
  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden min-h-screen bg-background text-foreground',
        {
          // Remove gradients
        },
      )}
    >
      <Header />
      <div
        className={clsx('flex flex-1 bg-transparent', {
          'mt-14 p-8': !isHomePage,
        })}
      >
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout
