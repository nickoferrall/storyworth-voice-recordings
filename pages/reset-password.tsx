import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  useResetPasswordMutation,
  useForgotPasswordMutation,
} from '../src/generated/graphql'
import ErrorMessage from '../components/Layout/ErrorMessage'
import { createClient } from '@supabase/supabase-js'

// Create client inside a function so it runs at runtime, not build time
const getSupabase = () => {
  return createClient(
    'https://czbbldmexpsiebwhrxox.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6YmJsZG1leHBzaWVid2hyeG94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYzOTA4MTYsImV4cCI6MjAzMTk2NjgxNn0.41OpnR3bgJrUm0sjuSRZXUYCkL40auJp-C2Zw4NzOlI',
  )
}

const ResetPassword = () => {
  const router = useRouter()
  const [resetPasswordMutation, { loading }] = useResetPasswordMutation()
  const [forgotPasswordMutation, { loading: forgotLoading }] = useForgotPasswordMutation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [emailForNewLink, setEmailForNewLink] = useState('')
  const [showNewLinkForm, setShowNewLinkForm] = useState(false)
  const [newLinkMessage, setNewLinkMessage] = useState<string | null>(null)

  useEffect(() => {
    const handleHashChange = async () => {
      try {
        // Get supabase client at runtime
        const supabase = getSupabase()

        // Debug the raw hash
        const rawHash = window.location.hash
        console.log('Raw hash:', rawHash)
        console.log('Full URL:', window.location.href)

        if (!rawHash) {
          console.log('No hash found, showing resend form...')
          setShowNewLinkForm(true)
          setIsLoading(false)
          return
        }

        // Check for Supabase error in URL (expired/invalid links)
        const hashString = window.location.hash.substring(1)
        const hashParams = new URLSearchParams(hashString)

        const error = hashParams.get('error')
        const errorCode = hashParams.get('error_code')
        const errorDescription = hashParams.get('error_description')

        if (error === 'access_denied' && errorCode === 'otp_expired') {
          console.log('Reset link has expired')
          setErrorMessage('This reset link has expired. Please request a new one below.')
          setShowNewLinkForm(true)
          setIsLoading(false)
          return
        }

        if (error) {
          console.log('Other error in URL:', error, errorDescription)
          setErrorMessage('Invalid reset link. Please request a new one below.')
          setShowNewLinkForm(true)
          setIsLoading(false)
          return
        }

        console.log('Hash string:', hashString)

        // Debug all parameters
        console.log('All hash parameters:')
        for (const [key, value] of hashParams.entries()) {
          console.log(`${key}: ${value.substring(0, 10)}...`)
        }

        console.log('Hash parameters size:', hashParams.toString().length)

        const accessToken = hashParams.get('access_token')
        console.log('Access token:', accessToken ? 'Found' : 'Not found')

        const refreshTokenFromUrl = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        // Debug the type parameter
        console.log('Type parameter:', type)

        // Check if we have an access token (required)
        if (!accessToken) {
          setErrorMessage(
            'This reset link is invalid or has expired. Please request a new one.',
          )
          setIsLoading(false)
          return
        }

        // For Supabase, sometimes the type might not be included in the URL
        // We should proceed if we have a valid access token, even if type is missing
        if (type !== null && type !== 'recovery') {
          console.log('Type parameter is present but not"recovery":', type)
          setErrorMessage('Invalid reset link type. Please request a new one.')
          setIsLoading(false)
          return
        }

        // Store tokens for later use, but don't consume them yet
        console.log('Storing tokens for later use')
        setAccessToken(accessToken)
        setRefreshToken(refreshTokenFromUrl || '')
        setIsLoading(false)
      } catch (error) {
        console.error('Error processing reset link:', error)
        setErrorMessage('An error occurred. Please try again.')
        setIsLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      // Add a small delay to ensure the hash is available after client-side hydration
      setTimeout(() => {
        handleHashChange()
      }, 500) // Increased delay to 500ms to give more time for client-side hydration
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters')
      return
    }

    if (!accessToken) {
      setErrorMessage('Invalid reset link. Please request a new one.')
      return
    }

    try {
      // Now consume the tokens to get the user ID
      const supabase = getSupabase()
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError || !sessionData?.user) {
        setErrorMessage('Invalid or expired reset link. Please request a new one.')
        return
      }

      const { data } = await resetPasswordMutation({
        variables: { password, token: sessionData.user.id },
      })

      if (data?.resetPassword?.error) {
        setErrorMessage(data.resetPassword.error)
      } else {
        setSuccessMessage('Password updated successfully! Redirecting to login...')

        // Sign out after password reset
        await supabase.auth.signOut()

        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred. Please try again.')
    }
  }

  const handleRequestNewLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setNewLinkMessage(null)

    if (!emailForNewLink) {
      setNewLinkMessage('Please enter your email address.')
      return
    }

    try {
      const { data } = await forgotPasswordMutation({
        variables: { email: emailForNewLink },
      })

      if (data?.forgotPassword?.error) {
        setNewLinkMessage(data.forgotPassword.error)
      } else {
        setNewLinkMessage('New reset link sent! Please check your email.')
        setShowNewLinkForm(false)
      }
    } catch (error: any) {
      setNewLinkMessage(error.message || 'Failed to send new reset link.')
    }
  }

  return (
    <div className="flex flex-col justify-start items-center pt-12">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 sm:w-3/4 md:w-1/2 lg:w-1/3">
        <h2 className="text-xl text-center font-semibold mb-4">Reset Password</h2>

        {isLoading ? (
          <div className="text-center py-4">
            <p className="">Loading reset information...</p>
          </div>
        ) : successMessage ? (
          <div className="text-center">
            <p className="text-green-600 mb-4">{successMessage}</p>
          </div>
        ) : !accessToken ? (
          // Show resend form prominently when no valid token
          <div className="text-center">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Need a Reset Link?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Enter your email address and we'll send you a fresh password reset link.
              </p>

              <form onSubmit={handleRequestNewLink} className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={emailForNewLink}
                  onChange={(e) => setEmailForNewLink(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  required
                />
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
              </form>

              {newLinkMessage && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm ${newLinkMessage.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                >
                  {newLinkMessage}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">New Password</label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={!accessToken}
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-bold mb-2">Confirm Password</label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 leading-tight focus:outline-none focus:border-purple-500 focus:ring-purple-500"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={!accessToken}
              />
            </div>

            <div className="flex flex-col items-center justify-center">
              <button
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || !accessToken}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword

ResetPassword.isPublic = true
