import React from 'react'
import { Currency } from '../../src/generated/graphql'
import { TicketState } from './RegisterModal'
import { AvailableHeat } from './SelectTicket'

type Props = {
  ticket: TicketState
  handleSelect: (id: string) => void
  selectedTicketId: string | null
  heats: AvailableHeat[]
}

// Mapping of Currency to Symbols
const currencySymbols: { [key in Currency]: string } = {
  AED: '$',
  AUD: 'A$',
  BRL: '$',
  CAD: '$',
  CHF: '$',
  CNY: '$',
  DKK: '$',
  EUR: '€',
  GBP: '£',
  HKD: '$',
  INR: '$',
  JPY: '¥',
  MXN: '$',
  NOK: '$',
  NZD: '$',
  SEK: '$',
  SGD: '$',
  SR: '$',
  THB: '$',
  USD: '$',
  ZAR: '$',
}

const Ticket: React.FC<Props> = ({ ticket, handleSelect, selectedTicketId, heats }) => {
  const symbol = currencySymbols[ticket.currency as Currency] || '$'
  const isFull = !ticket.hasAvailability

  return (
    <div
      key={ticket.id}
      className={`border p-4 mb-4 rounded-xl transition-colors duration-150
        ${isFull ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer'}
        ${
          ticket.id === selectedTicketId
            ? 'border-2 border-primary bg-primary/10 font-bold'
            : isFull
              ? 'border-gray-400'
              : 'border-gray-400 hover:border-primary hover:bg-primary/10'
        }
      `}
      onClick={() => !isFull && handleSelect(ticket.id)}
    >
      <div className="flex justify-between items-center">
        <div>
          <div
            className={`font-semibold ${isFull ? 'text-gray-800' : 'text-foreground'}`}
          >
            {ticket.name}
          </div>
        </div>
        <div className={`font-semibold ${isFull ? 'text-gray-800' : 'text-foreground'}`}>
          {isFull
            ? 'Sold Out'
            : ticket.price === 0
              ? 'Free'
              : `${symbol}${ticket.price.toFixed(2)}`}
        </div>
      </div>
      <div
        className={`transition-max-height duration-300 ease-in-out overflow-hidden ${
          ticket.id === selectedTicketId && ticket.description ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <div
          className={`mt-2 ${isFull ? 'text-gray-700' : 'text-foreground'} text-left text-sm`}
        >
          {ticket.description}
        </div>
      </div>
    </div>
  )
}

export default Ticket
