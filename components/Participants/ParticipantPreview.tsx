import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../src/components/ui/select'
import { Trash2 } from 'lucide-react'
import { cn } from '../../src/lib/utils'
import { CsvRow } from './CsvUploader'
import { TicketTypeUploader } from './UploadParticipantsModal'

type Props = {
  csvData: CsvRow[]
  setCsvData: (data: CsvRow[]) => void
  selectedTicketType: TicketTypeUploader | null
  setSelectedTicketType: (tt: TicketTypeUploader) => void
  ticketTypesData: any
  isUploading: boolean
  setIsUploading: (loading: boolean) => void
  validationError: string
  setValidationError: (error: string) => void
  setCurrentStep: (step: 'upload' | 'teams') => void
  generateTeams: () => void
  isTeamTicket: boolean
  createBulkRegistrations: any
  onClose: () => void
}

export const ParticipantPreview = ({
  csvData,
  setCsvData,
  selectedTicketType,
  setSelectedTicketType,
  ticketTypesData,
  isUploading,
  setIsUploading,
  setValidationError,
  generateTeams,
  isTeamTicket,
  createBulkRegistrations,
  onClose,
}: Props) => {
  const hasEmptyNames = csvData.some(
    (row) => !row.firstName?.trim() && !row.lastName?.trim(),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <h3 className="font-medium">Preview Data</h3>
        <Select
          value={selectedTicketType?.id || ''}
          onValueChange={(ticketId) => {
            const ticket = ticketTypesData?.getTicketTypesByCompetitionId?.find(
              (t) => t.id === ticketId,
            )
            setSelectedTicketType(ticket || null)
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select ticket type" />
          </SelectTrigger>
          <SelectContent>
            {ticketTypesData?.getTicketTypesByCompetitionId?.map((type) => (
              <SelectItem
                key={type.id}
                value={type.id}
                className={cn(
                  type.name.toLowerCase().includes('standard') && 'font-medium',
                )}
              >
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isTeamTicket && selectedTicketType && (
        <p className="text-sm text-muted-foreground">
          This ticket type requires teams of {selectedTicketType?.teamSize} people. After
          clicking Next, you'll be able to generate and adjust teams.
        </p>
      )}

      <div className="max-h-[300px] overflow-auto rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-2 text-left text-sm font-medium">Name</th>
              <th className="h-10 px-2 text-left text-sm font-medium">Email</th>
              <th className="h-10 w-10 px-2 text-left text-sm font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b transition-colors',
                  row.error ? 'text-destructive' : '',
                )}
              >
                <td className="p-2">
                  <Input
                    type="text"
                    value={`${row.firstName || ''} ${row.lastName || ''}`}
                    onChange={(e) => {
                      const [firstName, ...lastNameParts] = e.target.value.split(' ')
                      const updatedCsvData = [...csvData]
                      updatedCsvData[index].firstName = firstName || ''
                      updatedCsvData[index].lastName = lastNameParts.join(' ') || ''
                      if (firstName || lastNameParts.join(' ')) {
                        delete updatedCsvData[index].error
                      }
                      setCsvData(updatedCsvData)
                    }}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="email"
                    value={row.email || ''}
                    placeholder="Will be auto-generated if empty"
                    onChange={(e) => {
                      const updatedCsvData = [...csvData]
                      updatedCsvData[index].email = e.target.value
                      setCsvData(updatedCsvData)
                    }}
                  />
                </td>
                <td className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updatedCsvData = csvData.filter((_, i) => i !== index)
                      setCsvData(updatedCsvData)
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => {
            setCsvData([])
            setValidationError('')
          }}
        >
          Clear
        </Button>
        <Button
          onClick={() => {
            if (isTeamTicket) {
              generateTeams()
            } else {
              // Add this part to handle regular uploads
              const registrations = csvData.map((participant) => ({
                firstName: participant.firstName,
                lastName: participant.lastName,
                email: participant.email,
                ticketTypeId: selectedTicketType,
              }))

              setIsUploading(true)
              createBulkRegistrations({
                variables: {
                  input: registrations,
                },
                refetchQueries: [
                  'GetRegistrationsByCompetitionId',
                  'GetHeatsByCompetitionId',
                  'GetUnassignedEntriesByCompetitionId',
                ],
              })
                .then(() => {
                  setCsvData([])
                  onClose()
                })
                .catch((error) => {
                  setValidationError(error.message || 'Failed to upload registrations')
                })
                .finally(() => {
                  setIsUploading(false)
                })
            }
          }}
          disabled={isUploading || !selectedTicketType || hasEmptyNames}
        >
          {isUploading ? 'Uploading...' : isTeamTicket ? 'Next' : 'Upload'}
        </Button>
      </div>
    </div>
  )
}
