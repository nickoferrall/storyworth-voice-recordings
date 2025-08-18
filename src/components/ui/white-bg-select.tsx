import * as React from 'react'
import {
  Select as BaseSelect,
  SelectGroup,
  SelectValue as BaseSelectValue,
  SelectTrigger as BaseSelectTrigger,
  SelectContent as BaseSelectContent,
  SelectLabel,
  SelectItem as BaseSelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from './select'

import type { ComponentPropsWithoutRef, ForwardedRef } from 'react'
import { cn } from '../../lib/utils'

const WhiteBgSelect = BaseSelect
const WhiteBgSelectGroup = SelectGroup
const WhiteBgSelectLabel = SelectLabel
const WhiteBgSelectSeparator = SelectSeparator
const WhiteBgSelectScrollUpButton = SelectScrollUpButton
const WhiteBgSelectScrollDownButton = SelectScrollDownButton

const WhiteBgSelectTrigger = React.forwardRef<any, any>((props, ref) => (
  <BaseSelectTrigger
    ref={ref}
    {...props}
    className={cn('bg-white text-gray-900 border-gray-300', props.className)}
  />
))
WhiteBgSelectTrigger.displayName = 'WhiteBgSelectTrigger'

const WhiteBgSelectContent = React.forwardRef<any, any>((props, ref) => (
  <BaseSelectContent
    ref={ref}
    {...props}
    className={cn('bg-white text-gray-900', props.className)}
  />
))
WhiteBgSelectContent.displayName = 'WhiteBgSelectContent'

const WhiteBgSelectItem = React.forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof BaseSelectItem>
>((props, ref) => (
  <BaseSelectItem
    ref={ref}
    {...props}
    className={cn(
      'text-gray-900 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
      props.className,
    )}
  />
))
WhiteBgSelectItem.displayName = 'WhiteBgSelectItem'

const WhiteBgSelectValue = React.forwardRef<any, any>((props, ref) => (
  <BaseSelectValue
    ref={ref}
    {...props}
    className={cn('text-gray-900', props.className)}
  />
))
WhiteBgSelectValue.displayName = 'WhiteBgSelectValue'

export {
  WhiteBgSelect,
  WhiteBgSelectGroup,
  WhiteBgSelectTrigger,
  WhiteBgSelectContent,
  WhiteBgSelectLabel,
  WhiteBgSelectItem,
  WhiteBgSelectSeparator,
  WhiteBgSelectScrollUpButton,
  WhiteBgSelectScrollDownButton,
  WhiteBgSelectValue,
}
