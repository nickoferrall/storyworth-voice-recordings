import React, { useState } from 'react'
import { useForgotPasswordMutation } from '../src/generated/graphql'
import Link from 'next/link'
import ErrorMessage from '../components/Layout/ErrorMessage'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [forgotPassword, { loading }] = useForgotPasswordMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    try {
      const { data } = await forgotPassword({
        variables: { email },
      })

      if (data?.forgotPassword?.error) {
        setErrorMessage(data.forgotPassword.error)
      } else if (data?.forgotPassword?.success) {
        setIsSubmitted(true)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred. Please try again.')
      console.error('Forgot password error:', error)
    }
  }

  return (
    <div className="flex flex-col justify-start items-center pt-12">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="text-xl text-center font-semibold mb-4">Reset Your Password</h2>

        {isSubmitted ? (
          <div className="text-center">
            <div className="mb-4 text-green-600 font-medium">
              Password reset email sent!
            </div>
            <p className="mb-4">
              If an account exists with the email you provided, you'll receive
              instructions to reset your password.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-700 text-sm">
                💡 <strong>Tip:</strong> Reset links can only be used once for security.
                If you need another link, just come back to this page.
              </p>
            </div>
            <Link href="/login">
              <button className="text-purple-500 hover:text-purple-700 font-medium">
                Return to Login
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Email Address</label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm">
                Enter the email address associated with your account, and we'll send you a
                link to reset your password.
              </p>
            </div>

            <ErrorMessage error={errorMessage} />

            <div className="flex flex-col items-center justify-center w-full">
              <button
                className="bg-purple-500 hover:bg-purple-700 text-white w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="mt-4">
                <Link href="/login">
                  <span className="text-purple-500 hover:text-purple-700 font-medium">
                    Back to Login
                  </span>
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword

ForgotPassword.isPublic = true
