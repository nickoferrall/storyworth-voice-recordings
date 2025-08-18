import * as React from 'react'
import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuTrigger as BaseDropdownMenuTrigger,
  DropdownMenuContent as BaseDropdownMenuContent,
  DropdownMenuItem as BaseDropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './dropdown-menu'

const WhiteBgDropdownMenu = BaseDropdownMenu
const WhiteBgDropdownMenuTrigger = BaseDropdownMenuTrigger
const WhiteBgDropdownMenuCheckboxItem = DropdownMenuCheckboxItem
const WhiteBgDropdownMenuRadioItem = DropdownMenuRadioItem
const WhiteBgDropdownMenuLabel = DropdownMenuLabel
const WhiteBgDropdownMenuSeparator = DropdownMenuSeparator
const WhiteBgDropdownMenuShortcut = DropdownMenuShortcut
const WhiteBgDropdownMenuGroup = DropdownMenuGroup
const WhiteBgDropdownMenuPortal = DropdownMenuPortal
const WhiteBgDropdownMenuSub = DropdownMenuSub
const WhiteBgDropdownMenuSubContent = DropdownMenuSubContent
const WhiteBgDropdownMenuSubTrigger = DropdownMenuSubTrigger
const WhiteBgDropdownMenuRadioGroup = DropdownMenuRadioGroup

const WhiteBgDropdownMenuContent = React.forwardRef<any, any>((props, ref) => (
  <BaseDropdownMenuContent
    ref={ref}
    {...props}
    className={`bg-white text-gray-900 ${props.className || ''}`}
  />
))
WhiteBgDropdownMenuContent.displayName = 'WhiteBgDropdownMenuContent'

const WhiteBgDropdownMenuItem = React.forwardRef<any, any>((props, ref) => (
  <BaseDropdownMenuItem
    ref={ref}
    {...props}
    className={`text-gray-900 hover:bg-gray-100 hover:text-gray-900 ${props.className || ''}`}
  />
))
WhiteBgDropdownMenuItem.displayName = 'WhiteBgDropdownMenuItem'

export {
  WhiteBgDropdownMenu,
  WhiteBgDropdownMenuTrigger,
  WhiteBgDropdownMenuContent,
  WhiteBgDropdownMenuItem,
  WhiteBgDropdownMenuCheckboxItem,
  WhiteBgDropdownMenuRadioItem,
  WhiteBgDropdownMenuLabel,
  WhiteBgDropdownMenuSeparator,
  WhiteBgDropdownMenuShortcut,
  WhiteBgDropdownMenuGroup,
  WhiteBgDropdownMenuPortal,
  WhiteBgDropdownMenuSub,
  WhiteBgDropdownMenuSubContent,
  WhiteBgDropdownMenuSubTrigger,
  WhiteBgDropdownMenuRadioGroup,
}
