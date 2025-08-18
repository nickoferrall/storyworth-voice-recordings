import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import CreateTicketTypeModal from '../TicketType/TicketTypeModal'
import { useGetTicketTypesByCompetitionIdQuery } from '../../src/generated/graphql'
import { useRouter } from 'next/router'
import TicketCard from './TicketCard'
import LoadingTickets from './LoadingTickets'
import { Button } from '../../src/components/ui/button'

const TicketTypes = () => {
 const [open, setOpen] = useState(false)
 const router = useRouter()
 const { data, refetch, loading } = useGetTicketTypesByCompetitionIdQuery({
  variables: { competitionId: router.query.id as string },
 })
 const ticketTypes = data?.getTicketTypesByCompetitionId

 const onClose = () => {
  setOpen(false)
 }

 const handleClick = () => {
  setOpen(true)
 }

 return (
  <>
   <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 w-full">
    <div className="flex justify-between items-center w-full pb-4">
     <h2 className="text-xl font-semibold">Tickets</h2>
     <Button variant="default" onClick={handleClick} className="font-semibold">
      <Plus className="mr-1 h-4 w-4" />
      Create Ticket
     </Button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
     {loading ? (
      <LoadingTickets />
     ) : (
      ticketTypes?.map((ticketType) => (
       <TicketCard
        key={ticketType?.id}
        ticketType={ticketType as any}
        refetch={refetch}
       />
      ))
     )}
    </div>
   </div>
   <CreateTicketTypeModal open={open} onClose={onClose} refetch={refetch} />
  </>
 )
}

export default TicketTypes
