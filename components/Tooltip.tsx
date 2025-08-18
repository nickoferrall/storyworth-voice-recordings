import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/ui/tooltip'

type Props = {
  children: React.ReactNode
  title?: string
}

function CustomizedTooltips({ children, title }: Props) {
  if (!title) {
    return <>{children}</>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="text-sm">{title}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CustomizedTooltips
