import React, { useState } from 'react'
import { Pencil, Copy } from 'lucide-react'
import { TicketType } from '../../src/generated/graphql'
import { toReadablePrice } from '../../utils/toReadablePrice'
import TicketTypeModal from '../TicketType/TicketTypeModal'
import { Selectable } from 'kysely'
import { useDuplicateTicketTypeMutation } from '../../src/generated/graphql'

type Props = {
  ticketType: Selectable<TicketType> | null
  refetch: () => void
}

const TicketCard = (props: Props) => {
  const { ticketType, refetch } = props
  const [isEditing, setIsEditing] = useState(false)
  const [duplicateTicket, { loading: copying }] = useDuplicateTicketTypeMutation()
  if (!ticketType) return null
  const { name, price, registered, currency } = ticketType

  const handleClickEdit = () => {
    setIsEditing(true)
  }

  const handleClose = () => {
    setIsEditing(false)
  }

  const handleCopy = async () => {
    if (!ticketType?.id) return
    try {
      await duplicateTicket({ variables: { originalId: ticketType.id } })
      await refetch()
    } catch (e) {
      console.error('Failed to duplicate ticket type', e)
    }
  }

  const readablePrice = toReadablePrice(currency, price)

  return (
    <>
      <div className="relative bg-white shadow-md rounded-lg p-6 w-72 h-40">
        <button
          onClick={handleClickEdit}
          className="absolute top-4 right-4 hover: focus:outline-none"
        >
          <Pencil className="w-[18px] h-[18px]" />
        </button>
        <div className="mb-4 pr-8">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-md">{readablePrice}</p>
        </div>
        <div className="absolute bottom-2 right-2 text-sm">{registered} registered</div>
        <button
          onClick={handleCopy}
          disabled={copying}
          className="absolute bottom-2 left-2 text-sm inline-flex items-center gap-1 text-gray-500 hover:text-gray-600 disabled:opacity-50"
        >
          <Copy className="w-4 h-4" /> {copying ? 'Duplicating…' : 'Duplicate'}
        </button>
      </div>
      {isEditing && (
        <TicketTypeModal
          open={isEditing}
          onClose={handleClose}
          refetch={refetch}
          ticketType={ticketType}
        />
      )}
    </>
  )
}

export default TicketCard
