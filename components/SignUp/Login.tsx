import React, { useEffect, useState } from 'react'
import ErrorMessage from '../Layout/ErrorMessage'
import { useLoginMutation } from '../../src/generated/graphql'
import { useUser } from '../../contexts/UserContext'

type Props = {
 setShowLogin: (showLogin: boolean) => void
 setPassword: (password: string) => void
 setEmail: (email: string) => void
 email: string
 password: string
 handleSubmit: () => void
}

const Login = (props: Props) => {
 const { setShowLogin, setPassword, setEmail, email, password, handleSubmit } = props
 const [isLoading, setIsLoading] = useState(false)
 const [errorMessage, setErrorMessage] = useState<string | null>(null)
 const { setUser } = useUser()
 const [login, { error }] = useLoginMutation({
  onCompleted: (data) => {
   setIsLoading(false)
   if (data.login?.error) {
    setErrorMessage(data.login.error)
    return
   }
   if (data.login?.user) {
    setUser(data.login.user)
    handleSubmit()
   }
  },
  onError: (error) => {
   setIsLoading(false)
   setErrorMessage(error.message)
  },
 })

 useEffect(() => {
  if (typeof window !== 'undefined') {
   setEmail(localStorage.getItem('email') || '')
   setPassword(localStorage.getItem('password') || '')
  }
 }, [])

 const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  setIsLoading(true)
  setErrorMessage(null)
  try {
   await login({ variables: { email, password } })
  } catch (err) {
   setIsLoading(false)
   console.error('Error logging in:', err)
  }
 }

 const navigateToSignup = () => {
  localStorage.setItem('email', email)
  localStorage.setItem('password', password)
  setShowLogin(false)
 }

 return (
  <form className="p-8" onSubmit={handleLogin}>
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
   </div>
   <div className="flex flex-col items-center justify-center w-full">
    <div className="flex no-wrap">
     <div className="mb-4 mr-2">Already have an account?</div>
     <button
      type="button"
      onClick={navigateToSignup}
      className="mb-4 font-semi-bold hover:cursor-pointer text-purple-500 hover:text-purple-700"
     >
      Sign Up
     </button>
    </div>
    <ErrorMessage error={errorMessage || error?.message} />
    <button
     className="bg-purple-500 hover:bg-purple-700 text-white w-4/5 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
     type="submit"
     disabled={isLoading}
    >
     {isLoading ? 'Logging in...' : 'Login'}
    </button>
   </div>
  </form>
 )
}

export default Login

Login.isPublic = true
