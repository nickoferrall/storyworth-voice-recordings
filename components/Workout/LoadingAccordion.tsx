import React from 'react'

const LoadingAccordion = () => {
  return (
    <div className="bg-white shadow-md p-4 rounded-lg mb-4 w-full">
      <div className="cursor-pointer flex justify-between items-center">
        <div className="flex items-center space-x-16">
          <div className="text-lg font-medium outline-none animate-pulse">Loading...</div>
        </div>
        <div className="transform transition-transform duration-200">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default LoadingAccordion
