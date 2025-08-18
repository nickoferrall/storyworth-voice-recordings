// components/AthleteHeader.tsx

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { useLogoutMutation, useSendLoginTokenMutation } from '../../src/generated/graphql'
import ErrorMessage from './ErrorMessage'
import { useUser } from '../../contexts/UserContext'
import { useApolloClient } from '@apollo/client'

const AthleteHeader = () => {
  const router = useRouter()
  const client = useApolloClient()
  const { user, setUser } = useUser()
  const [email, setEmail] = useState('')
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [showEmailSentMessage, setShowEmailSentMessage] = useState(false)
  const [logout] = useLogoutMutation()
  const [sendLoginToken] = useSendLoginTokenMutation()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  const onLogin = async (email: string) => {
    try {
      await sendLoginToken({
        variables: {
          input: {
            email,
            redirectPath: router.asPath, // Include the current path
          },
        },
      })
      setShowEmailSentMessage(true)
      setLoginError(null)
    } catch (error) {
      setLoginError('Failed to send login email. Please try again.')
    }
  }

  const onLogout = async () => {
    try {
      await logout()
      setUser(null) // Update the user context
      setIsLogoutDialogOpen(false)
      setLogoutError(null)
      router.push('/') // Redirect to home page after logout
    } catch (error) {
      setLogoutError('Failed to logout. Please try again.')
    }
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(email)
  }

  const handleDialogChange = (open: boolean) => {
    setIsLoginDialogOpen(open)
    if (!open) {
      setShowEmailSentMessage(false)
      setEmail('')
    }
  }

  return (
    <header className="absolute top-4 left-4 right-4 z-50">
      <div className="max-w-7xl mx-auto bg-transparent">
        <div className="container mx-auto py-3 px-4 flex justify-end items-center">
          {user ? (
            <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <DialogTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={undefined} alt={user.email} />
                  <AvatarFallback>{user.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>User Profile</DialogTitle>
                  <DialogDescription>Logged in as {user.email}</DialogDescription>
                </DialogHeader>
                <ErrorMessage error={logoutError} />
                <Button onClick={onLogout} variant="destructive">
                  Logout
                </Button>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isLoginDialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="outline">Login</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Login</DialogTitle>
                  <DialogDescription>
                    {showEmailSentMessage
                      ? "We've sent you an email with a link to log in."
                      : 'Enter your email address to log in'}
                  </DialogDescription>
                </DialogHeader>
                <ErrorMessage error={loginError} />
                {!showEmailSentMessage && (
                  <form onSubmit={handleLoginSubmit}>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <DialogFooter className="mt-4">
                      <Button type="submit">Continue</Button>
                    </DialogFooter>
                  </form>
                )}
                {showEmailSentMessage && (
                  <Button onClick={() => handleDialogChange(false)}>Close</Button>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  )
}

export default AthleteHeader
