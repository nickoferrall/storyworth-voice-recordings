import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu'
import { MoreVertical } from 'lucide-react'
import { Button } from '../../src/components/ui/button'

const ParticipantDropdownMenu = () => {
  const handleClick = async () => {}

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white text-gray-900">
        <DropdownMenuItem
          className="hover:bg-gray-100 hover:text-gray-900"
          onClick={handleClick}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:bg-gray-100 hover:text-gray-900"
          onClick={handleClick}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ParticipantDropdownMenu
