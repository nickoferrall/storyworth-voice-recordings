import React from 'react'
import CustomizedTooltip from '../Tooltip'
import { Info } from 'lucide-react'
import { upperFirst } from '../../lib/upperFirst'
import clsx from 'clsx'

type Props = {
 title?: string
 className?: string
 items: string[]
 selectedItems: string[]
 toggleItem: (item: string) => void
 tooltipContent?: Record<string, string>
 threeColumns?: boolean
 titleTooltipContent?: string
 noStyleItems?: boolean
 isDisabled?: boolean
}

export const removeUnderscore = (str: string) => str.replace(/_/g, ' ')

export const CheckboxGroup = (props: Props) => {
 const {
  title,
  className,
  items,
  selectedItems = [],
  toggleItem,
  tooltipContent,
  threeColumns,
  titleTooltipContent,
  noStyleItems,
  isDisabled,
 } = props

 const handleToggle = (item: string) => {
  toggleItem(item)
 }

 const transformItem = (item: string) => {
  return noStyleItems ? item : upperFirst(removeUnderscore(item))
 }

 return (
  <>
   {title && (
    <div className="py-2 text-left text-sm font-medium tracking-wider">
     {title}
     {titleTooltipContent && (
      <CustomizedTooltip title={titleTooltipContent}>
       <Info className="ml-1 h-4 w-4" />
      </CustomizedTooltip>
     )}
    </div>
   )}
   <div className={clsx('flex flex-wrap pb-3', className)}>
    {items.map((item) => (
     <div
      key={item}
      className={clsx(
       'flex items-center hover:cursor-pointer pb-2 w-full',
       threeColumns ? 'sm:w-1/3' : 'sm:w-1/2',
       { 'opacity-50': isDisabled }, // Apply opacity if isDisabled is true
      )}
     >
      <input
       type="checkbox"
       id={`${title}-${item}`}
       checked={selectedItems.includes(item)}
       onChange={() => !isDisabled && handleToggle(item)}
       disabled={isDisabled}
       className="mr-2 text-purple-500 hover:cursor-pointer ring-0 focus:ring-0 selected:bg-purple-500 hover:text-purple-500 rounded-sm"
      />
      <label
       htmlFor={`${title}-${item}`}
       className={clsx(
        'text-sm flex items-center hover:cursor-pointer',
       )}
      >
       <span className="flex items-center">{transformItem(item)}</span>
      </label>
      {tooltipContent && (
       <CustomizedTooltip title={tooltipContent[item] || ''}>
        <Info className="ml-1 h-4 w-4" />
       </CustomizedTooltip>
      )}
     </div>
    ))}
   </div>
  </>
 )
}
