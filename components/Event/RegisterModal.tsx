import React, { useState } from 'react'
import { Dialog, DialogContent } from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import {
  useGetAvailableHeatsByCompetitionIdQuery,
  GetTicketTypesByCompetitionIdQuery,
} from '../../src/generated/graphql'
import SelectTicket from './SelectTicket'
import AnswerQuestions from './AnswerQuestions'
import SelectHeat from './SelectHeat'
import useCompetitionId from '../../hooks/useCompetitionId'
import { useRouter } from 'next/router'

type Props = {
  open: boolean
  handleClose: () => void
  ticketTypes: GetTicketTypesByCompetitionIdQuery['getTicketTypesByCompetitionId']
  loading: boolean
}

export type TicketState =
  GetTicketTypesByCompetitionIdQuery['getTicketTypesByCompetitionId'][number]

const RegisterModal = (props: Props) => {
  const { open, handleClose, ticketTypes, loading } = props
  const compId = useCompetitionId()
  const router = useRouter()
  const [selectedTicket, setSelectedTicket] = useState<TicketState | null>(null)
  const [selectedHeatId, setSelectedHeatId] = useState<string | null>(null) // Track the selected heat
  const [heatStartTime, setHeatStartTime] = useState<string | null>(null)

  const { data: heatsData, loading: loadingAvailableHeats } =
    useGetAvailableHeatsByCompetitionIdQuery({
      variables: { competitionId: compId, ticketTypeId: selectedTicket?.id ?? '' },
      skip: !selectedTicket?.allowHeatSelection || !selectedTicket,
    })

  const handleSaveSelectedTicketId = async (id: string) => {
    const selectedTicket = ticketTypes.find((ticket) => ticket?.id === id)
    if (!selectedTicket) return
    setSelectedTicket(selectedTicket as any)
  }

  const handleSaveSelectedHeat = (heatId: string) => {
    const heat = heatsData?.getAvailableHeatsByCompetitionId.find(
      (heat) => heat.id === heatId,
    )
    setSelectedHeatId(heatId)
    setHeatStartTime(heat?.startTime)
  }

  const onClose = () => {
    handleClose()
    setSelectedTicket(null)
    setSelectedHeatId(null)
    setHeatStartTime(null)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black bg-opacity-25">
        <div className="bg-background text-white p-6 relative flex flex-col items-center justify-center rounded-lg shadow-md w-[100vw] h-screen overflow-auto">
          <button
            className="absolute top-4 right-4 cursor-pointer text-white hover: z-[60]"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-h-[90vh] w-full">
            <button
              className="absolute top-4 right-4 cursor-pointer text-white hover:"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
            {!selectedTicket ? (
              <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 mx-auto text-center h-full md:h-fit">
                <SelectTicket
                  handleSave={handleSaveSelectedTicketId}
                  ticketTypes={ticketTypes}
                  loading={loading}
                  heats={heatsData?.getAvailableHeatsByCompetitionId || []}
                />
              </div>
            ) : selectedTicket.allowHeatSelection && !selectedHeatId ? (
              <div className="w-full md:w-1/2 lg:w-2/5 xl:w-1/3 mx-auto text-center h-full md:h-fit">
                <SelectHeat
                  heats={heatsData?.getAvailableHeatsByCompetitionId || []}
                  handleSave={handleSaveSelectedHeat}
                  loading={loadingAvailableHeats}
                />
              </div>
            ) : (
              <div className="w-full md:w-2/3 lg:w-2/5 xl:w-1/3 mx-auto h-full md:h-fit">
                <AnswerQuestions
                  selectedTicket={selectedTicket}
                  fields={selectedTicket?.registrationFields ?? []}
                  onClose={onClose}
                  selectedHeatId={selectedHeatId}
                  heatStartTime={heatStartTime}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RegisterModal
