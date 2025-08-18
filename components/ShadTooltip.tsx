import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/ui/tooltip'

type Props = {
  copy: string | React.ReactNode
  trigger: React.ReactNode
}

const ShadTooltip = (props: Props) => {
  const { copy, trigger } = props
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="text-sm cursor-pointer">{trigger}</TooltipTrigger>
        <TooltipContent>{copy}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default ShadTooltip
