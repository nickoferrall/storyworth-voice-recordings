import React from 'react'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import getRedis from '../utils/getRedis'
import getKysely from '../src/db'
import { storeUser } from '../lib/userInRedis'
import { Context } from '../graphql/context'
import { useUser } from '../contexts/UserContext'

export const getServerSideProps: GetServerSideProps = async (
 context: GetServerSidePropsContext,
) => {
 const { query, req, res } = context
 const { token, redirectPath } = query

 if (!token || typeof token !== 'string') {
  return {
   props: {
    error: 'Invalid or missing token.',
   },
  }
 }

 try {
  const redis = getRedis()
  const pg = getKysely()

  // Retrieve the email associated with the token
  const email = await redis.get(`loginToken:${token}`)
  if (!email) {
   return {
    props: {
     error: 'Invalid or expired login link.',
    },
   }
  }

  // Token is valid; delete it to prevent reuse
  await redis.del(`loginToken:${token}`)

  // Get user from UserProfile table instead of auth.users metadata
  const userProfile = await pg
   .selectFrom('UserProfile')
   .where('email', '=', email)
   .selectAll()
   .executeTakeFirst()

  if (!userProfile) {
   return {
    props: {
     error: 'User profile not found.',
    },
   }
  }

  const minimalContext = {
   req,
   res,
  } as Context

  await storeUser(userProfile, minimalContext)

  // Pass redirectPath to props after validation
  let safeRedirectPath = '/'
  if (
   redirectPath &&
   typeof redirectPath === 'string' &&
   isValidRedirectPath(redirectPath)
  ) {
   safeRedirectPath = redirectPath
  }

  return {
   props: {
    user: JSON.parse(JSON.stringify(userProfile)),
    redirectPath: safeRedirectPath,
   },
  }
 } catch (error: any) {
  console.error('Error authenticating user:', error)
  return {
   props: {
    error: error.message || 'Failed to authenticate user.',
   },
  }
 }
}

// Helper function to validate redirectPath
function isValidRedirectPath(path: string) {
 // Ensure the path starts with a '/' and does not contain any protocol (e.g., http://)
 return path.startsWith('/') && !path.startsWith('//') && !path.includes('://')
}

const AuthenticatePage = ({
 user,
 redirectPath,
 error,
}: {
 user?: any
 redirectPath?: string
 error?: string
}) => {
 const router = useRouter()
 const { setUser } = useUser()

 React.useEffect(() => {
  if (user) {
   setUser(user)
   router.push(redirectPath || '/')
  }
 }, [user, router, redirectPath])

 if (error) {
  return (
   <div className="flex flex-col justify-center items-center pt-16 h-full">
    <h2 className="text-xl text-center text-red-600 font-semibold mb-4">
     Authentication Error
    </h2>
    <p className="text-center">
     {error}. Please try again or contact support.
    </p>
   </div>
  )
 }

 return (
  <div className="flex flex-col justify-center items-center pt-16 h-full">
   <h2 className="text-xl text-center font-semibold mb-4">
    Authenticating...
   </h2>
  </div>
 )
}

export default AuthenticatePage
