import React from 'react'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { HelpCircle } from 'lucide-react'
import { TicketTypeForm } from './TicketTypeModal'

type Props = {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  formData: TicketTypeForm
  setFormData: (data: TicketTypeForm) => void
  teamSizeInputRef: React.RefObject<HTMLInputElement>
}

const EntryInputs = ({
  handleChange,
  formData,
  setFormData,
  teamSizeInputRef,
}: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                The number of participants in each team. If this is an individual event,
                set this to "1"
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="teamSize"
          name="teamSize"
          type="number"
          value={formData.teamSize}
          onChange={handleChange}
          required
          ref={teamSizeInputRef}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Label htmlFor="maxEntries">Max Tickets Available</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                The maximum number of entries for this ticket. One team buys one ticket.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          id="maxEntries"
          name="maxEntries"
          type="number"
          value={formData.maxEntries}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  )
}

export default EntryInputs
