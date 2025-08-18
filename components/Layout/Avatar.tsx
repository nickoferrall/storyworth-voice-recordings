import React from 'react'
import { Avatar as UIAvatar, AvatarFallback } from '../../src/components/ui/avatar'

type Props = {
  email?: string | null
}

const Avatar = ({ email }: Props) => {
  const initial = email ? email.charAt(0).toUpperCase() : '?'

  return (
    <UIAvatar className="h-7 w-7">
      <AvatarFallback className="bg-primary flex justify-center text-center text-primary-foreground">
        {initial}
      </AvatarFallback>
    </UIAvatar>
  )
}

export default Avatar
