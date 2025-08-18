import { useState, useEffect } from 'react'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../src/components/ui/dialog'
import { Alert, AlertDescription } from '../../src/components/ui/alert'
import {
  useGetTicketTypesByCompetitionIdLazyQuery,
  useCreateBulkRegistrationsMutation,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'
import CsvUploader, { ColumnMapping, CsvRow } from './CsvUploader'
import { ParticipantPreview } from './ParticipantPreview'
import { TeamGenerator } from './TeamGenerator'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '../../src/components/ui/button'
import ManualParticipantForm from './ManualParticipantForm'

type Props = {
  open: boolean
  onClose: () => void
}

export type TicketTypeUploader = {
  id: string
  name: string
  teamSize: number
  isTeamNameRequired: boolean
}

const UploadParticipantsModal = ({ open, onClose }: Props) => {
  const competitionId = useCompetitionId()
  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({})
  const [isUploading, setIsUploading] = useState(false)
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeUploader | null>(
    null,
  )
  const [validationError, setValidationError] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<'upload' | 'teams' | 'manual'>('upload')
  const [teams, setTeams] = useState<
    Array<{ id: string; name: string; members: CsvRow[] }>
  >([])
  const [createBulkRegistrations] = useCreateBulkRegistrationsMutation()
  const [showTeamSizeWarning, setShowTeamSizeWarning] = useState(false)
  const [incompleteTeamMembers, setIncompleteTeamMembers] = useState<CsvRow[]>([])

  const [getTicketTypes, { data: ticketTypesData }] =
    useGetTicketTypesByCompetitionIdLazyQuery({
      variables: { competitionId },
      onCompleted: (data) => {
        // Select the first ticket type by default if none is selected
        if (data?.getTicketTypesByCompetitionId?.length && !selectedTicketType) {
          setSelectedTicketType(data.getTicketTypesByCompetitionId[0])
        }
      },
    })

  const isTeamTicket = (selectedTicketType?.teamSize || 0) > 1

  const resetState = () => {
    setCsvData([])
    setHeaders([])
    setColumnMapping({})
    setIsUploading(false)
    setSelectedTicketType(null)
    setValidationError('')
    setCurrentStep('upload')
    setTeams([])
    setShowTeamSizeWarning(false)
    setIncompleteTeamMembers([])
  }

  const generateTeams = () => {
    if (!selectedTicketType) return

    const teamSize = selectedTicketType.teamSize
    const shuffledParticipants = [...csvData].sort(() => Math.random() - 0.5)

    // Calculate how many complete teams we can make
    const completeTeamCount = Math.floor(shuffledParticipants.length / teamSize)

    // Create complete teams first
    const newTeams = Array.from({ length: completeTeamCount }, (_, index) => ({
      id: uuidv4(),
      name: `Team ${index + 1}`,
      members: shuffledParticipants.slice(index * teamSize, (index + 1) * teamSize),
    }))

    // Handle remaining participants
    const remainingParticipants = shuffledParticipants.slice(completeTeamCount * teamSize)

    // Set teams and move to teams step
    setTeams(newTeams)
    setCurrentStep('teams')

    // Store remaining participants but don't show warning yet
    if (remainingParticipants.length > 0) {
      setIncompleteTeamMembers(remainingParticipants)
    }
  }

  const handleUpload = async () => {
    if (!selectedTicketType) return

    setIsUploading(true)
    try {
      // Only process complete teams
      const registrations = teams.flatMap((team, index) =>
        team.members.map((member) => ({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          ticketTypeId: selectedTicketType.id,
          teamName: team.name || `Team ${index + 1}`,
          teamGroupId: team.id,
        })),
      )

      await createBulkRegistrations({
        variables: {
          input: registrations,
        },
        refetchQueries: [
          'GetRegistrationsByCompetitionId',
          'GetHeatsByCompetitionId',
          'GetUnassignedEntriesByCompetitionId',
        ],
      })

      resetState()
      onClose()
    } catch (error: any) {
      console.error('Error uploading registrations:', error)
      setValidationError(error.message || 'Failed to upload registrations')
    } finally {
      setIsUploading(false)
    }
  }

  // Also handle the case when the modal opens
  useEffect(() => {
    if (
      open &&
      ticketTypesData?.getTicketTypesByCompetitionId?.length &&
      !selectedTicketType
    ) {
      setSelectedTicketType(ticketTypesData.getTicketTypesByCompetitionId[0])
    }
  }, [open, ticketTypesData, selectedTicketType])

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isUploading && !showTeamSizeWarning) {
          resetState()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="sticky w-fit top-0 bg-background z-10 pb-4">
          <DialogTitle>
            {showTeamSizeWarning
              ? 'Warning: Incomplete Teams'
              : currentStep === 'upload'
                ? 'Upload Participants'
                : currentStep === 'manual'
                  ? 'Add Participants'
                  : 'Generate Teams'}
          </DialogTitle>
        </DialogHeader>

        {showTeamSizeWarning ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The following participants are unassigned or in incomplete teams and will
              not be registered:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              {incompleteTeamMembers.map((member, index) => (
                <li key={index} className="text-sm">
                  {member.firstName} {member.lastName} ({member.email})
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTeamSizeWarning(false)
                  setIncompleteTeamMembers([])
                }}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Continue with Complete Teams Only'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-line">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {currentStep === 'upload' ? (
              !csvData.length ? (
                <div className="space-y-4">
                  <div className="flex justify-start space-x-2 mb-4">
                    <Button variant="outline" onClick={() => setCurrentStep('manual')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Manually
                    </Button>
                  </div>
                  <CsvUploader
                    onUpload={(data, headers, mapping) => {
                      setCsvData(data)
                      setHeaders(headers)
                      setColumnMapping(mapping)
                    }}
                    getTicketTypes={getTicketTypes}
                  />
                </div>
              ) : (
                <ParticipantPreview
                  csvData={csvData}
                  setCsvData={setCsvData}
                  selectedTicketType={selectedTicketType}
                  setSelectedTicketType={setSelectedTicketType}
                  ticketTypesData={ticketTypesData}
                  isUploading={isUploading}
                  setIsUploading={setIsUploading}
                  setValidationError={setValidationError}
                  generateTeams={generateTeams}
                  isTeamTicket={isTeamTicket}
                  createBulkRegistrations={createBulkRegistrations}
                  onClose={onClose}
                />
              )
            ) : currentStep === 'manual' ? (
              <ManualParticipantForm
                onCancel={() => setCurrentStep('upload')}
                selectedTicketType={selectedTicketType}
                setSelectedTicketType={setSelectedTicketType}
                ticketTypesData={ticketTypesData}
                createBulkRegistrations={createBulkRegistrations}
                onClose={onClose}
              />
            ) : (
              <TeamGenerator
                teams={teams}
                setTeams={setTeams}
                selectedTicketType={selectedTicketType}
                onUpload={handleUpload}
                onShuffle={generateTeams}
                isUploading={isUploading}
              />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UploadParticipantsModal
