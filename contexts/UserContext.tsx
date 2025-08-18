import React, { createContext, useContext, useEffect, useState } from 'react'
import { useGetViewerQuery } from '../src/generated/graphql'

export interface MinimalUser {
  id: string
  email: string
  firstName: string
  lastName?: string | null
  picture?: string | null
  bio?: string | null
  isSuperUser: boolean
  isVerified: boolean
}

interface UserContextType {
  user: MinimalUser | null
  setUser: (user: MinimalUser | null) => void
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
})

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MinimalUser | null>(null)
  const { data, loading, error } = useGetViewerQuery()

  useEffect(() => {
    if (data?.getUser) {
      const { id, email, firstName, lastName, picture, bio, isSuperUser, isVerified } =
        data.getUser
      setUser({
        id,
        email,
        firstName,
        lastName,
        picture,
        bio,
        isSuperUser,
        isVerified,
      })
    } else if (!loading && !error) {
      // If query completed but no user data, set user to null
      setUser(null)
    }
  }, [data, loading, error])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)
