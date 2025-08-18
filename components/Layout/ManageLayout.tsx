import React from 'react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCompetition } from '../../contexts/CompetitionContext'
import { Button } from '../../src/components/ui/button'

const getTabs = (id: string) => {
  return [
    { label: 'Overview', path: `/${id}/overview` },
    { label: 'Registration', path: `/${id}/registration` },
    { label: 'Participants', path: `/${id}/participants` },
    { label: 'Workouts', path: `/${id}/workouts` },
    { label: 'Scores', path: `/${id}/scores` },
    { label: 'Emails', path: `/${id}/emails` },
    // { label: 'Insights', path: `/${id}/insights` },
  ]
}

const ManageLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const { id } = router.query
  const { competitionName, directoryCompId } = useCompetition()

  const tabs = getTabs(id as string)

  const currentPath = router.asPath
  const selectedTab = tabs.findIndex((tab) => currentPath.includes(tab.path))

  // Determine the correct event page URL
  const eventPageUrl = directoryCompId ? `/explore/${directoryCompId}` : `/event/${id}`

  return (
    <div className="flex flex-col items-center h-full w-full">
      <div className="w-full md:w-min flex justify-start items-center flex-wrap overflow-x-scroll">
        <div className="w-full py-4 flex justify-start items-center overflow-x-scroll">
          <div className="flex relative justify-between items-center w-full">
            <h1 className="text-2xl font-semibold flex-1">
              {competitionName ?? 'Example Comp'}
            </h1>

            <Button variant="outline" size="sm" className="rounded-3xl py-1 h-6" asChild>
              <a href={eventPageUrl} target="_blank" rel="noopener noreferrer">
                Event Page
                <ExternalLink className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="flex justify-start space-x-3 md:space-x-5 py-4 overflow-x-scroll">
          {tabs.map((tab, index) => (
            <Link
              href={tab.path}
              key={tab.path}
              className={`text-xs md:text-sm font-medium focus:outline-none ${
                selectedTab === index
                  ? 'border-b-2 border-white text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
      <hr className="border-gray-200 border w-full" />
      <div className="flex-grow py-6 md:p-6 w-full lg:w-auto">{children}</div>
    </div>
  )
}

export default ManageLayout
