import React, { useEffect, useState } from 'react'
import {
  Phone,
  Trash2,
  Users,
  Pencil,
  FileText,
  User,
  Mail,
  Smartphone,
  Plus,
  Stethoscope,
} from 'lucide-react'
import DropdownMenu from './RegistrationQuestionDropdown'
import {
  GetTicketTypesByCompetitionIdDocument,
  RegistrationField,
  useCreateVolunteerTicketTypeMutation,
  useDeleteRegistrationFieldMutation,
  useDeleteVolunteerTicketMutation,
  useGetRegistrationFieldsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import { useRouter } from 'next/router'
import { Switch } from '../../src/components/ui/switch'
import { Button } from '../../src/components/ui/button'
import { upperFirst } from '../../lib/upperFirst'
import QuestionModal from './QuestionModal'
import DeleteModal from '../DeleteModal'

const defaultQuestions = [
  'Name',
  'Email',
  'Your Email',
  'Team Name',
  'Phone Number',
  'Emergency Contact Name',
  'Emergency Contact Number',
]

const iconLookup = {
  ['Name']: <User className="h-4 w-4 text-purple-500 mr-3" />,
  ['Email']: <Mail className="h-4 w-4 text-purple-500 mr-3" />,
  ['Your Email']: <Mail className="h-4 w-4 text-purple-500 mr-3" />,
  ['Team Name']: <Users className="h-4 w-4 text-purple-500 mr-3" />,
  ['Phone Number']: <Smartphone className="h-4 w-4 text-purple-500 mr-3" />,
  ['Emergency Contact Name']: <Stethoscope className="h-4 w-4 text-purple-500 mr-3" />,
  ['Emergency Contact Number']: <Phone className="h-4 w-4 text-purple-500 mr-3" />,
} as Record<string, JSX.Element>

const VolunteerQuestions = () => {
  const router = useRouter()
  const { id } = router.query
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<RegistrationField | null>(null)
  const { data, refetch } = useGetRegistrationFieldsByCompetitionIdQuery({
    variables: { competitionId: id as string, isVolunteer: true },
  })
  const [deleteRegistrationField] = useDeleteRegistrationFieldMutation()
  const [createVolunteerTicket] = useCreateVolunteerTicketTypeMutation()
  const [deleteVolunteerTicket] = useDeleteVolunteerTicketMutation()
  const registrationFields = data?.getRegistrationFieldsByCompetitionId ?? []
  const [hasVolunteerTicket, setHasVolunteerTicket] = useState(
    registrationFields.length > 0,
  )

  useEffect(() => {
    setHasVolunteerTicket(registrationFields.length > 0)
  }, [registrationFields.length])

  const handleClose = () => {
    setShowCustomQuestionModal(false)
    setSelectedQuestion(null)
    setShowDeleteModal(false)
  }

  const handleClick = () => {
    setShowCustomQuestionModal(true)
  }

  const handleEdit = (fieldId: string) => {
    const field = registrationFields.find((field) => field.id === fieldId)
    if (!field) return
    setSelectedQuestion(field as any)
    setShowCustomQuestionModal(true)
  }

  const handleDelete = (fieldId: string) => {
    setShowDeleteModal(true)
    const field = registrationFields.find((field) => field.id === fieldId)
    if (!field) return
    setSelectedQuestion(field as any)
  }

  const handleSwitchChange = async (isChecked: boolean) => {
    if (isChecked) {
      await createVolunteerTicket({
        variables: { competitionId: id as string },
        refetchQueries: [
          {
            query: GetTicketTypesByCompetitionIdDocument,
            variables: { competitionId: id as string },
          },
        ],
      })
    } else {
      await deleteVolunteerTicket({
        variables: { competitionId: id as string },
        refetchQueries: [
          {
            query: GetTicketTypesByCompetitionIdDocument,
            variables: { competitionId: id as string },
          },
        ],
      })
    }
    refetch()
    setHasVolunteerTicket(isChecked) // Update state here
  }

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteRegistrationField({
        variables: {
          registrationFieldId: id,
        },
      })

      refetch()
      handleClose()
    } catch (error: any) {
      console.error('Error deleting custom registration field:', error)
    }
  }

  return (
    <div className="w-full pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-left font-semibold">Volunteer Questions</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Include Volunteer Form</span>
          <Switch checked={hasVolunteerTicket} onCheckedChange={handleSwitchChange} />
        </div>
      </div>
      <p className="text-sm text-left w-full mb-4">
        {hasVolunteerTicket
          ? 'These questions will be asked to volunteers when they sign-up for this competition.'
          : 'Volunteer tickets will not be included.'}
      </p>
      {hasVolunteerTicket && (
        <>
          {registrationFields.map((field) => (
            <div
              key={field.id}
              className="flex relative items-center justify-between py-1"
            >
              <div className="flex items-center">
                {iconLookup[field.question as string] ?? (
                  <FileText className="h-4 w-4 text-purple-500 mr-3" />
                )}
                <span className="text-md">{field.question}</span>
              </div>
              {!defaultQuestions.includes(field.question) ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(field.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4 hover:" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(field.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 hover:" />
                  </Button>
                </div>
              ) : (
                <DropdownMenu
                  id={field.id}
                  isEditable={field.isEditable}
                  requiredStatus={upperFirst(field.requiredStatus) as any}
                />
              )}
            </div>
          ))}
          <div className="flex justify-start mt-4">
            <Button variant="outline" onClick={handleClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Question
            </Button>
          </div>
          <QuestionModal
            open={showCustomQuestionModal}
            onClose={handleClose}
            refetch={refetch}
            question={selectedQuestion}
            isVolunteer
          />

          <DeleteModal
            open={showDeleteModal}
            id={selectedQuestion?.id ?? ''}
            onClose={handleClose}
            title="Confirm Deletion"
            description="Are you sure you want to delete this question?"
            handleDelete={() => handleConfirmDelete(selectedQuestion?.id ?? '')}
          />
        </>
      )}
    </div>
  )
}

export default VolunteerQuestions
