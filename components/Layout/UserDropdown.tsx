import React from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../../contexts/UserContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components/ui/avatar'
import { LogOut, User } from 'lucide-react'

export const UserDropdown: React.FC = () => {
  const router = useRouter()
  const { user, setUser } = useUser()

  const handleLogout = () => {
    setUser(null)
    router.push('/login')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarImage src={user.picture || undefined} />
          <AvatarFallback>{user.firstName?.[0] || '?'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
