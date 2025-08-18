import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../src/components/ui/button'
import { AlertTriangle, Home, ArrowLeft, LogIn } from 'lucide-react'
import withAuth from '../utils/withAuth'
import { Context } from '../graphql/context'
import { User } from '../src/generated/graphql'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  false, // Don't require auth - we want to show this page to anyone
)

type Props = {
  user: User | null
}

const Unauthorized = ({ user }: Props) => {
  useEffect(() => {
    // Prevent scrolling on this page
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    // Cleanup function to restore scrolling when leaving the page
    return () => {
      document.body.style.overflow = 'unset'
      document.documentElement.style.overflow = 'unset'
    }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-background flex flex-col justify-center items-center px-4"
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>

        <h1 className="text-xl font-bold text-foreground mb-3">Access Denied</h1>

        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          You don't have permission to access this competition. Only the competition
          creator and authorized users can manage this competition.
        </p>

        <div className="space-y-2">
          <Button asChild className="w-full text-sm">
            <Link href="/manage">
              <Home className="h-4 w-4 mr-2" />
              Go to My Competitions
            </Link>
          </Button>

          <Button variant="secondary" asChild className="w-full text-sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized

Unauthorized.isPublic = true
