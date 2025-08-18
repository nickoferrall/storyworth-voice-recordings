import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../src/components/ui/dialog'
import { Button } from '../../src/components/ui/button'
import { Input } from '../../src/components/ui/input'
import { Label } from '../../src/components/ui/label'
import {
  WhiteBgSelect,
  WhiteBgSelectContent,
  WhiteBgSelectItem,
  WhiteBgSelectTrigger,
  WhiteBgSelectValue,
} from '../../src/components/ui/white-bg-select'
import { RadioGroup, RadioGroupItem } from '../../src/components/ui/radio-group'
import { Checkbox } from '../../src/components/ui/checkbox'
import {
  GetRegistrationFieldsByCompetitionIdQuery,
  QuestionType,
  RequiredStatus,
  useCreateRegistrationFieldMutation,
  useGetTicketTypesIdAndNameByCompetitionIdQuery,
  useUpdateRegistrationFieldMutation,
} from '../../src/generated/graphql'
import useCompetitionId from '../../hooks/useCompetitionId'

export type CustomQuestionType = {
  id?: string
  question: string
  type: QuestionType
  requiredStatus: RequiredStatus
  options?: string[] | null
  repeatPerAthlete: boolean
  ticketTypeIds: string[]
}

type Props = {
  open: boolean
  onClose: () => void
  question?:
    | GetRegistrationFieldsByCompetitionIdQuery['getRegistrationFieldsByCompetitionId'][0]
    | null
  refetch: () => void
  isVolunteer?: boolean
}

const QuestionModal = (props: Props) => {
  const { open, onClose, question, refetch, isVolunteer = false } = props
  const isEditing = !!question
  const competitionId = useCompetitionId()
  const { data: ticketTypeData } = useGetTicketTypesIdAndNameByCompetitionIdQuery({
    variables: { competitionId },
  })
  const ticketTypes =
    ticketTypeData?.getTicketTypesByCompetitionId.filter((ticketType) => {
      return ticketType.isVolunteer === isVolunteer
    }) ?? []

  const [formData, setFormData] = useState<CustomQuestionType>({
    id: question?.id ?? undefined,
    question: question?.question ?? '',
    type: question?.type ?? QuestionType.Text,
    requiredStatus: question?.requiredStatus ?? RequiredStatus.Required,
    options: question?.options ?? null,
    repeatPerAthlete: question?.repeatPerAthlete ?? false,
    ticketTypeIds: question?.ticketTypes.map((t) => t.id) ?? [ticketTypes[0]?.id], // Default to first ticket type if none is provided
  })

  useEffect(() => {
    if (question) {
      setFormData({
        id: question.id,
        question: question.question,
        type: question.type,
        requiredStatus: question.requiredStatus,
        options: question.options,
        repeatPerAthlete: question.repeatPerAthlete,
        ticketTypeIds: question?.ticketTypes.map((t) => t.id) ?? [ticketTypes[0]?.id],
      })
    }
  }, [question])

  useEffect(() => {
    if (ticketTypes.length > 0) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        ticketTypeIds: [ticketTypes[0]?.id],
      }))
    }
  }, [ticketTypes.length])

  // const [activeTab, setActiveTab] = useState<'new' | 'template'>('new')
  const [createRegistrationField] = useCreateRegistrationFieldMutation()
  const [updateRegistrationField] = useUpdateRegistrationFieldMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'options') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        options: value.split(','),
      }))
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    }
  }

  const handleTicketTypeChange = (ticketTypeName: string) => {
    const ticketTypeId = ticketTypes.find((ticket) => ticket.name === ticketTypeName)?.id

    if (!ticketTypeId) return
    setFormData((prevFormData) => ({
      ...prevFormData,
      ticketTypeIds: prevFormData.ticketTypeIds.includes(ticketTypeId)
        ? prevFormData.ticketTypeIds.filter((id) => id !== ticketTypeId)
        : [...prevFormData.ticketTypeIds, ticketTypeId],
    }))
  }

  const handleClose = () => {
    onClose()
    setFormData({
      question: '',
      type: QuestionType.Text,
      requiredStatus: RequiredStatus.Required,
      options: null,
      repeatPerAthlete: false,
      ticketTypeIds: [ticketTypes[0]?.id],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const variables = {
      id: formData.id!,
      question: formData.question,
      type: formData.type,
      requiredStatus: formData.requiredStatus,
      repeatPerAthlete: formData.repeatPerAthlete,
      options: formData.options ?? null,
    }

    if (isEditing) {
      const input = {
        ...variables,
        ticketTypeIds: formData.ticketTypeIds,
      }
      await updateRegistrationField({
        variables: { ...input },
      })
    } else {
      await createRegistrationField({
        variables: {
          ticketTypeIds: formData.ticketTypeIds,
          registrationField: variables,
        },
      })
    }

    refetch()
    handleClose()
  }

  const toggleRequiredCheckbox = (
    item: RequiredStatus.Required | RequiredStatus.Optional,
  ) => {
    setFormData({
      ...formData,
      requiredStatus: item,
    })
  }

  const toggleRepeatCheckbox = (item: string) => {
    const newRepeat = item === 'Yes' ? true : false
    setFormData({
      ...formData,
      repeatPerAthlete: newRepeat,
    })
  }

  const title = isEditing ? 'Edit Question' : 'Create Question'
  const questionsWithOptions = [
    QuestionType.MultipleChoice,
    QuestionType.MultipleChoiceSelectOne,
    QuestionType.Dropdown,
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {formData.type !== QuestionType.Integration && (
              <div className="grid gap-2">
                <Label htmlFor="question">
                  {formData.type === QuestionType.Statement
                    ? 'Statement'
                    : 'Question Text'}
                </Label>
                <Input
                  id="question"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  required
                  maxLength={200}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="type">Question Type</Label>
              <WhiteBgSelect
                name="type"
                value={formData.type}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'type', value } } as any)
                }
              >
                <WhiteBgSelectTrigger>
                  <WhiteBgSelectValue placeholder="Select a question type" />
                </WhiteBgSelectTrigger>
                <WhiteBgSelectContent>
                  <WhiteBgSelectItem value={QuestionType.Text}>
                    Text Input
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={QuestionType.MultipleChoice}>
                    Multiple Choice (Select Many)
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={QuestionType.MultipleChoiceSelectOne}>
                    Multiple Choice (Select One)
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={QuestionType.Dropdown}>
                    Dropdown
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={QuestionType.Statement}>
                    Statement
                  </WhiteBgSelectItem>
                  <WhiteBgSelectItem value={QuestionType.Integration}>
                    Integration
                  </WhiteBgSelectItem>
                </WhiteBgSelectContent>
              </WhiteBgSelect>
            </div>

            {formData.type === QuestionType.Integration ? (
              <div className="grid gap-2">
                <Label htmlFor="integration">Integration Type</Label>
                <WhiteBgSelect
                  name="question"
                  value={formData.question}
                  onValueChange={(value) =>
                    handleChange({ target: { name: 'question', value } } as any)
                  }
                >
                  <WhiteBgSelectTrigger>
                    <WhiteBgSelectValue placeholder="Select an integration" />
                  </WhiteBgSelectTrigger>
                  <WhiteBgSelectContent></WhiteBgSelectContent>
                </WhiteBgSelect>
              </div>
            ) : (
              <>
                {questionsWithOptions.includes(formData.type) && (
                  <div className="grid gap-2">
                    <Label htmlFor="options">Options</Label>
                    <Input
                      id="options"
                      name="options"
                      value={formData.options ? formData.options.join(',') : ''}
                      onChange={handleChange}
                      placeholder="Enter options separated by commas"
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Required Status</Label>
                  <RadioGroup
                    value={formData.requiredStatus}
                    onValueChange={(value) =>
                      toggleRequiredCheckbox(value as RequiredStatus.Required)
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={RequiredStatus.Required} id="required" />
                      <Label htmlFor="required">Required</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={RequiredStatus.Optional} id="optional" />
                      <Label htmlFor="optional">Optional</Label>
                    </div>
                  </RadioGroup>
                </div>

                {!isVolunteer && (
                  <>
                    <div className="grid gap-2">
                      <Label>Which ticket types does this question apply to?</Label>
                      <div className="space-y-2">
                        {ticketTypes.map((ticket) => (
                          <div key={ticket.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ticket-${ticket.id}`}
                              checked={formData.ticketTypeIds.includes(ticket.id)}
                              onCheckedChange={() => handleTicketTypeChange(ticket.name)}
                            />
                            <Label htmlFor={`ticket-${ticket.id}`}>{ticket.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Ask each athlete in a team this question?</Label>
                      <RadioGroup
                        value={formData.repeatPerAthlete ? 'Yes' : 'No'}
                        onValueChange={toggleRepeatCheckbox}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="yes" />
                          <Label htmlFor="yes">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="no" />
                          <Label htmlFor="no">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default QuestionModal
