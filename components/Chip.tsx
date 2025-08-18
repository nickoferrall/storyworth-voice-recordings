import React from 'react'
import clsx from 'clsx'
import { X } from 'lucide-react'

type Props = {
  label: string
  onDelete?: () => void
  className?: string
  secondary?: boolean
}

const Chip = (props: Props) => {
  const { label, onDelete, className, secondary } = props
  return (
    <div
      className={clsx(
        'flex items-center text-white rounded-full px-3 py-1 text-sm font-medium',
        secondary ? 'bg-sky-500' : 'bg-purple-500',
        className,
      )}
    >
      <span>{label}</span>
      {onDelete && (
        <button
          onClick={onDelete}
          className="ml-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default Chip
