import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSignUpMutation, useGetViewerQuery } from '../../src/generated/graphql'
import { MinimalUser, useUser } from '../../contexts/UserContext'
import ErrorMessage from '../../components/Layout/ErrorMessage'

const SignUp = () => {
  const router = useRouter()
  const [isLoading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const { refetch } = useGetViewerQuery()
  const { user, setUser, loading: userLoading } = useUser()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [signUp] = useSignUpMutation({
    onCompleted: async (data) => {
      setLoading(false)

      if (data.signUp?.error) {
        setErrorMessage(data.signUp.error)
        return
      }

      if (data && data.signUp?.user) {
        // Refetch user data to update the context
        const { data: userData } = await refetch()

        // Update user context if we have user data
        if (userData && userData.getUser) {
          const newUser: MinimalUser = {
            id: userData.getUser.id,
            firstName: userData.getUser.firstName,
            lastName: userData.getUser.lastName,
            email: userData.getUser.email,
            isSuperUser: userData.getUser.isSuperUser,
            isVerified: userData.getUser.isVerified,
          }

          setUser(newUser)
        }

        router.push('/manage')
      }
    },
    onError: (error) => {
      setLoading(false)
      setErrorMessage(error.message || 'An error occurred during signup')
      console.error('Signup error:', error)
    },
  })

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setEmail(localStorage.getItem('email') || '')
      setPassword(localStorage.getItem('password') || '')
    }
  }, [])

  // Redirect to /manage if user is already logged in
  useEffect(() => {
    if (!userLoading && user) {
      router.push('/manage')
    }
  }, [user, userLoading, router])

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      await signUp({ variables: { email, password, firstName, lastName } })
    } catch (err: any) {
      setLoading(false)
      setErrorMessage(err.message || 'An error occurred during signup')
      console.error('Error signing up:', err)
    }
  }

  const navigateToLogin = () => {
    localStorage.setItem('email', email)
    localStorage.setItem('password', password)
    router.push('/login')
  }

  return (
    <div className="flex flex-col justify-start items-center pt-12">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 sm:w-3/4 md:w-1/2 lg:w-1/3"
        onSubmit={handleSignUp}
      >
        <h2 className="text-xl text-center font-semibold mb-4">Sign Up</h2>

        <div className="my-4 flex space-x-4">
          <div className="w-1/2">
            <label className="block text-sm font-bold mb-2">First Name</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
              type="text"
              placeholder="First Name"
              value={firstName}
              required
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-bold mb-2">Last Name</label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
              type="text"
              placeholder="Last Name"
              value={lastName}
              required
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
            type="email"
            placeholder={'example@email.com'}
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Password</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
            type="password"
            value={password}
            placeholder="********"
            required
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
          />
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <Link href="/login" onClick={navigateToLogin}>
            <div className="flex no-wrap">
              <div className="mb-4 mr-2 hover:">Already have an account?</div>
              <div className="mb-4 font-semi-bold hover:cursor-pointer text-purple-500 hover:text-purple-700">
                Log in
              </div>
            </div>
          </Link>
          <ErrorMessage error={errorMessage} />
          <button
            className="bg-purple-500 hover:cursor-pointer hover:bg-purple-700 text-white w-4/5 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SignUp

SignUp.isPublic = true
