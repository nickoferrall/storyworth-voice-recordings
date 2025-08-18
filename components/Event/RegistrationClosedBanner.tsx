import React from 'react'
import { AlertCircle } from 'lucide-react'

interface RegistrationClosedBannerProps {
  competitionName?: string
}

const RegistrationClosedBanner: React.FC<RegistrationClosedBannerProps> = ({
  competitionName = 'this competition',
}) => {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-red-300">Registration Closed</h3>
          <p className="text-sm text-red-200 mt-1">
            Registration for {competitionName} is currently closed. Please contact the
            organizers if you have any questions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegistrationClosedBanner
