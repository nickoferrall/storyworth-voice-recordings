import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import ErrorMessage from '../components/Layout/ErrorMessage'
import { useRouter } from 'next/router'
import { useLoginMutation } from '../src/generated/graphql'
import { useUser } from '../contexts/UserContext'

const Login = () => {
  const [loginMutation, { error, loading }] = useLoginMutation()
  const router = useRouter()
  const { user, setUser, loading: userLoading } = useUser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message)
    } else {
      setErrorMessage(null)
    }
  }, [error])

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const res = await loginMutation({ variables: { email, password } })
      if (res.data?.login?.error) {
        setErrorMessage(res.data.login.error)
        return
      }
      if (res.data?.login?.user) {
        setUser(res.data.login.user)
        router.push('/manage')
      }
    } catch (err) {
      console.error('Error logging in:', err)
    }
  }

  const navigateToSignup = () => {
    localStorage.setItem('email', email)
    localStorage.setItem('password', password)
    router.push('/signup')
  }

  return (
    <div className="flex flex-col justify-start items-center pt-12">
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 sm:w-3/4 md:w-1/2 lg:w-1/3"
        onSubmit={handleLogin}
      >
        <h2 className="text-xl text-center font-semibold mb-4">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
            type="email"
            placeholder="example@email.com"
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
            placeholder="********"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex justify-end">
            <Link href="/forgot-password">
              <span className="text-sm text-purple-500 hover:text-purple-700">
                Forgot password?
              </span>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <Link href="/signup" onClick={navigateToSignup}>
            <div className="flex no-wrap">
              <div className="mb-4 mr-2 hover:">Don't have an account?</div>
              <div className="mb-4 font-semi-bold hover:cursor-pointer text-purple-500 hover:text-purple-700">
                Sign up
              </div>
            </div>
          </Link>
          <ErrorMessage error={errorMessage} />
          <button
            className="bg-purple-500 hover:bg-purple-700 text-white w-4/5 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Login

Login.isPublic = true
