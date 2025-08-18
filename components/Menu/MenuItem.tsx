import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import React from 'react'
import { twMerge } from 'tailwind-merge'

interface MenuItemProps {
  onClick: (event: Event) => void
  isDisabled?: boolean
  className?: string
  children: React.ReactNode
  onPointerDown?: (event: React.PointerEvent) => void
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  ({ onClick, isDisabled, className, children, onPointerDown }, ref) => {
    return (
      <DropdownMenu.Item
        className={twMerge(
          'flex w-full items-center rounded-md px-4 py-3 text-sm text-card-foreground outline-none hover:bg-card/80 focus:bg-card/80',
          isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          className,
        )}
        onSelect={onClick}
        onPointerDown={onPointerDown}
        ref={ref}
      >
        {children}
      </DropdownMenu.Item>
    )
  },
)
