import React, { useState } from 'react'
import {
  Phone,
  Trash2,
  Users,
  Pencil,
  Info,
  FileText,
  User,
  Mail,
  Smartphone,
  Plus,
  Heart,
  UserPlus,
} from 'lucide-react'
import DropdownMenu from './RegistrationQuestionDropdown'
import {
  GetRegistrationFieldsByCompetitionIdQuery,
  RegistrationField,
  useDeleteRegistrationFieldMutation,
  useGetRegistrationFieldsByCompetitionIdQuery,
} from '../../src/generated/graphql'
import { useRouter } from 'next/router'
import QuestionModal from './QuestionModal'
import { Button } from '../../src/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../src/components/ui/tooltip'
import { PartnerEmailQuestion } from '../../utils/constants'
import { upperFirst } from '../../lib/upperFirst'
import DeleteModal from '../DeleteModal'

const defaultQuestions = [
  'Name',
  'Email',
  'Your Email',
  'Team Name',
  'Phone Number',
  'Emergency Contact Name',
  'Emergency Contact Number',
  'Partner Emails',
]
type RegField =
  GetRegistrationFieldsByCompetitionIdQuery['getRegistrationFieldsByCompetitionId'][0]

const processRegistrationFields = (registrationFields: RegField[]) => {
  // Include Partner Email in settings so organisers can control its required status
  return registrationFields
}

const iconLookup = {
  ['Name']: <User className="text-purple-500 mr-3 h-5 w-5" />,
  ['Email']: <Mail className="text-purple-500 mr-3 h-5 w-5" />,
  ['Your Email']: <Mail className="text-purple-500 mr-3 h-5 w-5" />,
  ['Partner Emails']: <UserPlus className="text-purple-500 mr-3 h-5 w-5" />,
  ['Team Name']: <Users className="text-purple-500 mr-3 h-5 w-5" />,
  ['Phone Number']: <Smartphone className="text-purple-500 mr-3 h-5 w-5" />,
  ['Emergency Contact Name']: <Heart className="text-purple-500 mr-3 h-5 w-5" />,
  ['Emergency Contact Number']: <Phone className="text-purple-500 mr-3 h-5 w-5" />,
} as Record<string, JSX.Element>

const RegistrationQuestions = () => {
  const router = useRouter()
  const [deleteRegistrationField] = useDeleteRegistrationFieldMutation()
  const { id } = router.query
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<RegistrationField | null>(null)
  const { data, refetch } = useGetRegistrationFieldsByCompetitionIdQuery({
    variables: { competitionId: id as string },
  })
  const registrationFields = processRegistrationFields(
    data?.getRegistrationFieldsByCompetitionId ?? [],
  )

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
      <h2 className="text-xl text-left w-full font-semibold mb-">
        Registration Questions
      </h2>
      <p className="text-sm text-left w-full mb-4">
        These questions will be asked to each athlete when they sign-up for this
        competition.
      </p>
      {registrationFields.map((field) => (
        <div key={field.id} className="flex relative items-start justify-between py-2">
          <div className="flex items-start pr-28 max-w-[900px]">
            {iconLookup[field.question as string] ?? (
              <FileText className="text-purple-500 mr-3 h-5 w-5" />
            )}
            <span className="text-md break-words whitespace-pre-wrap leading-relaxed">
              {field.question}
              {(field.onlyTeams || field.question === PartnerEmailQuestion) && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-pointer">
                      <Info className=" ml-2 h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      This will only be shown for team tickets (team captain sees it). It
                      can be Optional or Required.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
          </div>
          {!defaultQuestions.includes(field.question) ? (
            <div className="absolute right-0 top-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(field.id)}
                className="p-1 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(field.id)}
                className="p-1 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="absolute right-0 top-1">
              <DropdownMenu
                id={field.id}
                isEditable={field.isEditable || field.question === PartnerEmailQuestion}
                requiredStatus={upperFirst(field.requiredStatus) as any}
              />
            </div>
          )}
        </div>
      ))}
      <div className="flex justify-start mt-4">
        <Button variant="outline" onClick={handleClick}>
          <Plus className="mr-1 h-4 w-4" />
          Add Custom Question
        </Button>
      </div>
      <QuestionModal
        open={showCustomQuestionModal}
        onClose={handleClose}
        refetch={refetch}
        question={selectedQuestion}
      />
      <DeleteModal
        open={showDeleteModal}
        id={selectedQuestion?.id ?? ''}
        onClose={handleClose}
        title="Confirm Deletion"
        description="Are you sure you want to delete this question?"
        handleDelete={() => handleConfirmDelete(selectedQuestion?.id ?? '')}
      />
    </div>
  )
}

export default RegistrationQuestions
