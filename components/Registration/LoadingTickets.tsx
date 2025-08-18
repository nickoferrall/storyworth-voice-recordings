import React from 'react'

const LoadingTickets: React.FC = () => {
 return (
  <div className="relative bg-white shadow-md rounded-lg p-6 w-72 h-40 animate-pulse">
   <div className="mb-4">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
   </div>
   <div className="absolute bottom-2 right-2 flex items-center">
    <span className="text-lg font-semibold">Loading</span>
    <span className="ml-1 text-lg font-semibold animate-pulse">
     ...
    </span>
   </div>
  </div>
 )
}

export default LoadingTickets
