import React, { useState } from 'react'
import Ticket from './Ticket'
import LoadingTicket from './LoadingTicket'
import { TicketState } from './RegisterModal'
import { GetAvailableHeatsByCompetitionIdQuery } from '../../src/generated/graphql'

export type AvailableHeat =
  GetAvailableHeatsByCompetitionIdQuery['getAvailableHeatsByCompetitionId'][number]

type Props = {
  ticketTypes: TicketState[]
  handleSave: (id: string) => void
  loading: boolean
  heats: AvailableHeat[]
}

const SelectTicket: React.FC<Props> = ({ handleSave, ticketTypes, loading, heats }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const availableHeatsByTicketId = heats.filter((heat) =>
    heat.ticketTypes?.some((tt) => tt.id === selectedTicketId),
  )

  const handleSelect = (id: string) => {
    setSelectedTicketId(id)
  }

  return (
    <div className="pb-24">
      <h1 className="text-3xl font-semibold text-white mb-4">Select Ticket</h1>
      {loading ? (
        <LoadingTicket />
      ) : (
        ticketTypes.map((ticketType) => (
          <Ticket
            key={ticketType.id}
            ticket={ticketType}
            handleSelect={handleSelect}
            selectedTicketId={selectedTicketId}
            heats={availableHeatsByTicketId}
          />
        ))
      )}
      <button
        onClick={() => handleSave(selectedTicketId!)}
        disabled={!selectedTicketId}
        className={`
        ${!selectedTicketId && 'cursor-not-allowed opacity-50'}
        mt-10 bg-purple-500 hover:bg-purple-600 !text-white font-bold py-2 px-4 rounded-xl w-full mb-4 sticky bottom-4`}
      >
        Save
      </button>
    </div>
  )
}

export default SelectTicket
