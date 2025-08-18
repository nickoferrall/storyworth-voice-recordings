import React, { useState } from 'react'
import { Dialog, DialogContent } from '../../src/components/ui/dialog'
import SignUp from './SignUp'
import Login from './Login'

type Props = {
  open: boolean
  onClose: () => void
  refetch?: () => void
}

const Signup = (props: Props) => {
  const { open, onClose, refetch } = props
  const [showLogin, setShowLogin] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSubmit = () => {
    refetch && refetch()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {showLogin ? (
          <Login
            setShowLogin={setShowLogin}
            setPassword={setPassword}
            setEmail={setEmail}
            email={email}
            password={password}
            handleSubmit={handleSubmit}
          />
        ) : (
          <SignUp
            setShowLogin={setShowLogin}
            setPassword={setPassword}
            setEmail={setEmail}
            email={email}
            password={password}
            handleSubmit={handleSubmit}
            setFirstName={setFirstName}
            setLastName={setLastName}
            firstName={firstName}
            lastName={lastName}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default Signup

Signup.isPublic = true
