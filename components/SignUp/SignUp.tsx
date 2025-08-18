import React, { useEffect, useState } from 'react'
import ErrorMessage from '../Layout/ErrorMessage'
import { useSignUpMutation, useGetViewerQuery } from '../../src/generated/graphql'
import { useUser } from '../../contexts/UserContext'

type Props = {
 setShowLogin: (showLogin: boolean) => void
 setPassword: (password: string) => void
 setEmail: (email: string) => void
 email: string
 password: string
 handleSubmit: () => void
 firstName: string
 lastName: string
 setFirstName: (firstName: string) => void
 setLastName: (lastName: string) => void
}

const SignUp = (props: Props) => {
 const {
  setShowLogin,
  setPassword,
  setEmail,
  email,
  password,
  handleSubmit,
  setFirstName,
  setLastName,
  firstName,
  lastName,
 } = props
 const [isLoading, setLoading] = useState(false)
 const { setUser } = useUser()
 const { refetch } = useGetViewerQuery()
 const [signUp, { error }] = useSignUpMutation({
  onCompleted: (data) => {
   setLoading(false)
   if (data?.signUp?.user) {
    setUser(data.signUp.user)
    handleSubmit()
   }
  },
 })

 useEffect(() => {
  if (typeof window !== 'undefined') {
   setEmail(localStorage.getItem('email') || '')
   setPassword(localStorage.getItem('password') || '')
  }
 }, [])

 useEffect(() => {
  const token = localStorage.getItem('token')
  if (token) {
   handleSubmit()
  }
 }, [])

 const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  setLoading(true)

  try {
   await signUp({ variables: { email, password, firstName, lastName } })
  } catch (err) {
   setLoading(false)
   console.error('Error signing up:', err)
  }
 }

 const navigateToLogin = () => {
  localStorage.setItem('email', email)
  localStorage.setItem('password', password)
  setShowLogin(true)
 }

 return (
  <form className="p-8" onSubmit={handleSignUp}>
   <h2 className="text-xl text-center font-semibold mb-6">
    Create a Free Account
   </h2>

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
    <div className="flex no-wrap">
     <div className="mb-4 mr-2">Already have an account?</div>
     <button
      type="button"
      onClick={navigateToLogin}
      className="mb-4 font-semi-bold hover:cursor-pointer text-purple-500 hover:text-purple-700"
     >
      Log in
     </button>
    </div>
    <ErrorMessage error={error?.message} />
    <button
     className="bg-purple-500 hover:cursor-pointer hover:bg-purple-700 text-white w-4/5 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
     type="submit"
    >
     {isLoading ? 'Signing Up...' : 'Sign Up'}
    </button>
   </div>
  </form>
 )
}

export default SignUp
