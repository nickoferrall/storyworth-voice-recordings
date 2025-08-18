import React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  error?: string | null
  className?: string
}

const ErrorMessage = (props: Props) => {
  const { error, className } = props

  if (!error) return null

  const baseClasses =
    'mb-4 w-3/4 text-red-500 border-l-4 border-red-500 bg-red-100 px-4 py-2 rounded'

  return (
    <div className={twMerge(baseClasses, className)}>
      <p className="text-sm">{error}</p>
    </div>
  )
}

export default ErrorMessage
