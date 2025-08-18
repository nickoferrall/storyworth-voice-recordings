import React from 'react'

const LoadingTicket: React.FC = () => {
 return (
  <div className="border p-4 mb-4 rounded-xl cursor-pointer border-gray-400">
   <div className="flex justify-between items-center">
    <div className="font-semibold">
     Loading<span className="animate-pulse">...</span>
    </div>
   </div>
  </div>
 )
}

export default LoadingTicket
