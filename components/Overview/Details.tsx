import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Trophy, Calendar, MapPin } from 'lucide-react'
import { useRouter } from 'next/router'
import { useGetCompetitionByIdQuery } from '../../src/generated/graphql'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { Button } from '../../src/components/ui/button'

dayjs.extend(utc)
dayjs.extend(timezone)

const EditDetailsModal = dynamic(() => import('./EditDetailsModal'))
const EditImageModal = dynamic(() => import('./EditImageModal'))

const Details = () => {
  const router = useRouter()
  const { id } = router.query
  const { data, loading, refetch } = useGetCompetitionByIdQuery({
    variables: {
      id: id as string,
    },
  })
  const comp = data?.getCompetitionById
  const [modalOpen, setModalOpen] = useState(false)
  const [imgModalOpen, setImgModalOpen] = useState(false)

  const dateRange = dayjs
    .utc(comp?.startDateTime)
    .tz(comp?.timezone ?? 'UTC')
    .isSame(dayjs.utc(comp?.endDateTime).tz(comp?.timezone ?? 'UTC'), 'day')
    ? dayjs
        .utc(comp?.startDateTime)
        .tz(comp?.timezone ?? 'UTC')
        .format('MMMM D, YYYY')
    : `${dayjs
        .utc(comp?.startDateTime)
        .tz(comp?.timezone ?? 'UTC')
        .format('MMMM D, YYYY')} - ${dayjs
        .utc(comp?.endDateTime)
        .tz(comp?.timezone ?? 'UTC')
        .format('MMMM D, YYYY')}`
  const timeRange = `${dayjs
    .utc(comp?.startDateTime)
    .tz(comp?.timezone ?? 'UTC')
    .format('h:mm A')} - ${dayjs
    .utc(comp?.endDateTime)
    .tz(comp?.timezone ?? 'UTC')
    .format('h:mm A')}`
  const venue = comp?.address?.venue || 'Venue'
  const city = comp?.address?.city || 'City'
  const country = comp?.address?.country || 'Country'

  const handleClickEdit = () => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleOpenImageModal = () => {
    setImgModalOpen(true)
  }

  const handleCloseImageModal = () => {
    setImgModalOpen(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 w-full h-full">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full md:min-w-[600px]">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">
              Loading<span className="animate-pulse">...</span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!comp) return null

  return (
    <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 w-full h-full">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full">
        <div>
          <div className="mb-4">
            <div className="flex justify-center pt-0 md:pt-8">
              <div className="w-full flex-col md:flex-row flex items-start p-8">
                {/* <div className="flex-col md:flex-row relative group h-full w-full md:flex"> */}
                <div className="md:flex-row relative group h-full w-full md:flex">
                  <div className="relative mb-6 md:mb-0 w-[250px] h-[250px] rounded-xl overflow-hidden">
                    <img
                      src={comp.logo || '/assets/logos/organiser-logo.png'}
                      alt="Event Logo"
                      width={250}
                      height={250}
                      className="transition-transform duration-300 group-hover:scale-105 cursor-pointer object-cover w-full h-full"
                    />
                  </div>
                  <div
                    onClick={handleOpenImageModal}
                    className="absolute hover:cursor-pointer w-[250px] inset-0 bg-black  !text-white bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                  >
                    <span className="text-lg !text-white font-semibold">
                      Change Image
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between items-start h-full w-full pl-6">
                  <div>
                    <div className="flex items-center mb-4">
                      <Trophy className="text-purple-500 mr-3" size={28} />
                      <div>
                        <p className="text-md">{comp.name}</p>
                        <p className="text-sm">{comp.orgName || comp.org?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      <Calendar className="text-purple-500 mr-3" size={28} />
                      <div>
                        <p className="text-md">{dateRange}</p>
                        <p className="text-sm">{timeRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center mb-4">
                      <MapPin className="text-purple-500 mr-3" size={28} />
                      <div>
                        <p className="text-md">{venue}</p>
                        <p className="text-sm">{`${city}, ${country}`}</p>
                      </div>
                    </div>
                  </div>
                  {/* <button
          onClick={handleClickEdit}
          className="self-center w-full min-w-64 mt-4 px-4 py-1 border border-purple-600 text-purple-600 rounded-xl hover:bg-purple-400 hover:text-white transition duration-300"
         >
          Edit
         </button> */}
                  <Button
                    variant="default" // You can change the variant as needed
                    className="self-center w-full min-w-64 mt-4 px-4 py-1"
                    onClick={handleClickEdit}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <EditDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          comp={comp}
          refetch={refetch}
        />
      )}
      {imgModalOpen && (
        <EditImageModal
          competitionId={id as string}
          open={imgModalOpen}
          onClose={handleCloseImageModal}
          refetch={refetch}
        />
      )}
    </div>
  )
}

export default Details
