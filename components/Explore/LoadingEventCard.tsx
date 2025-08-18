import React from 'react'
import { Skeleton } from '../../src/components/ui/skeleton'

const LoadingEventCard = () => {
  return (
    <div className="flex items-start gap-5 p-5 rounded-2xl bg-gray-900 border border-gray-800">
      {/* Content Section - Left Side */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-3 bg-gray-700" />

        {/* Date and Location */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 bg-gray-700" />
            <Skeleton className="h-4 w-20 bg-gray-700" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 bg-gray-700" />
            <Skeleton className="h-4 w-24 bg-gray-700" />
          </div>
        </div>

        {/* Price */}
        <Skeleton className="h-4 w-16 bg-gray-700" />
      </div>

      {/* Square Image Section - Right Side */}
      <div className="flex-shrink-0">
        <Skeleton className="w-24 h-24 rounded-xl bg-gray-700" />
      </div>
    </div>
  )
}

export default LoadingEventCard
