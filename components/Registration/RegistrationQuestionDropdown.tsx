import React from 'react'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../src/components/ui/dropdown-menu'
import { Button } from '../../src/components/ui/button'
import {
  RequiredStatus,
  useUpdateRegistrationFieldMutation,
} from '../../src/generated/graphql'
import { upperFirst } from '../../lib/upperFirst'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'

type Props = {
  id: string
  isEditable?: boolean
  requiredStatus: RequiredStatus
}

const QuestionDropdown = ({ id, isEditable, requiredStatus }: Props) => {
  const [updateField] = useUpdateRegistrationFieldMutation()

  const handleSelect = async (option: RequiredStatus) => {
    await updateField({
      variables: {
        id,
        requiredStatus: option,
      },
    })
  }

  const button = (
    <Button
      variant="outline"
      size="sm"
      className={`text-xs font-medium ${
        isEditable ? 'hover:text-purple-700' : 'cursor-not-allowed'
      }`}
    >
      {upperFirst(requiredStatus)}
      {isEditable && <ChevronDown className="ml-1 h-4 w-4" />}
    </Button>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {requiredStatus === RequiredStatus.Required ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>This field is required for registration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          button
        )}
      </DropdownMenuTrigger>
      {isEditable && (
        <DropdownMenuContent align="end" className="bg-white text-gray-900">
          <DropdownMenuItem
            className="hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleSelect(RequiredStatus.Required)}
          >
            Required
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleSelect(RequiredStatus.Optional)}
          >
            Optional
          </DropdownMenuItem>
          <DropdownMenuItem
            className="hover:bg-gray-100 hover:text-gray-900"
            onClick={() => handleSelect(RequiredStatus.Off)}
          >
            Off
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}

export default QuestionDropdown
