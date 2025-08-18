'use client'

import React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect } from 'react'

import { cn } from '../../src/lib/utils'
import { Button } from '../../src/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '../../src/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../../src/components/ui/popover'
import {
  useGetHeatByIdTicketSelectorQuery,
  useUpdateHeatMutation,
} from '../../src/generated/graphql'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '../../src/components/ui/dropdown-menu'

// Zod schema for form validation
const FormSchema = z.object({
  ticketTypes: z.array(
    z.string({
      required_error: 'Please select at least one ticket type.',
    }),
  ),
})

type Props = {
  heatId: string
}

const TicketSelector = (props: Props) => {
  const { heatId } = props
  const { data, loading } = useGetHeatByIdTicketSelectorQuery({
    variables: {
      id: heatId,
    },
  })
  const [updateHeat] = useUpdateHeatMutation()

  // Get all ticket types and sort them
  const allTicketTypes = data?.getHeatById?.allTicketTypes
    ?.slice()
    .sort((a, b) => a.name.localeCompare(b.name))

  // Get selected ticket types
  const selectedTicketTypes = data?.getHeatById?.ticketTypes

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ticketTypes: selectedTicketTypes?.map((t) => t.id) ?? [],
    },
  })

  // Watch the ticketTypes field
  const watchedTicketTypes = form.watch('ticketTypes')

  useEffect(() => {
    if (!selectedTicketTypes && allTicketTypes) {
      form.setValue(
        'ticketTypes',
        allTicketTypes.map((tt) => tt.id),
      )
    } else if (selectedTicketTypes) {
      form.setValue(
        'ticketTypes',
        selectedTicketTypes.map((t) => t.id),
      )
    }
  }, [selectedTicketTypes?.length, allTicketTypes?.length])

  const isSelected = (ticketTypeId: string) => watchedTicketTypes.includes(ticketTypeId)

  const toggleTicketType = async (ticketTypeId: string) => {
    const currentSelected = watchedTicketTypes
    const isIncluded = currentSelected.includes(ticketTypeId)

    let newSelected = isIncluded
      ? currentSelected.filter((id) => id !== ticketTypeId)
      : [...currentSelected, ticketTypeId]

    // Ensure at least one ticket type is always selected
    if (newSelected.length === 0 && allTicketTypes) {
      newSelected = allTicketTypes.map((tt) => tt.id)
    }

    // Set new values in the form
    form.setValue('ticketTypes', newSelected, { shouldValidate: true })

    // Update heat on the server
    try {
      await updateHeat({
        variables: {
          id: heatId,
          ticketTypeIds: newSelected,
        },
      })
    } catch (error) {
      console.error('Failed to update heat:', error)
      // Revert the form state if the server update fails
      form.setValue('ticketTypes', currentSelected, { shouldValidate: true })
    }
  }

  const title = loading
    ? 'Loading...'
    : watchedTicketTypes.length === 1
      ? allTicketTypes?.find((tt) => tt.id === watchedTicketTypes[0])?.name
      : `${watchedTicketTypes.length} ticket${watchedTicketTypes.length > 1 ? 's' : ''}`

  return (
    <div className="space-y-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              'w-[200px] justify-between truncate',
              !watchedTicketTypes?.length && 'text-muted-foreground',
            )}
          >
            <span className="truncate mr-2">{title}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 flex-none" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit max-h-none">
          {allTicketTypes?.map((ticketType) => (
            <DropdownMenuCheckboxItem
              key={ticketType.id}
              checked={isSelected(ticketType.id)}
              onCheckedChange={() => toggleTicketType(ticketType.id)}
            >
              {ticketType.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default TicketSelector
