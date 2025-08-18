import React, { useState } from 'react'
import { QuestionType, RequiredStatus } from '../../src/generated/graphql'
import SelectInput from '../SelectInput'
import { CheckboxGroup } from '../Layout/CheckboxGroup'
import { PartnerEmailQuestion } from '../../utils/constants'
import { TicketState } from './RegisterModal'
import { IntegrationData } from './AnswerQuestions'

type Props = {
  field: TicketState['registrationFields'][number]
  handleUpdate: (
    questionId: string,
    answer: string | string[],
    integration?: IntegrationData,
  ) => void
  currentAnswer?: string
}

const AnswerQuestion = (props: Props) => {
  const { field, handleUpdate, currentAnswer } = props
  const { question, type, options, requiredStatus } = field
  const isRequired = requiredStatus === RequiredStatus.Required
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const displayQuestion = question === 'Name' ? 'Full Name' : question

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleUpdate(field.id, e.target.value)
  }

  const handleCheckboxChange = (item: string) => {
    let updatedSelectedItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item]

    if (type === QuestionType.MultipleChoiceSelectOne) {
      updatedSelectedItems = selectedItems.includes(item) ? [] : [item]
    }

    setSelectedItems(updatedSelectedItems)
    handleUpdate(field.id, updatedSelectedItems)
  }

  const label = (
    <label className={`block text-foreground text-sm pt-2 pb-1`} htmlFor="question">
      <span className="flex items-center justify-between">
        {displayQuestion}
        {!isRequired && ' (Optional)'}
      </span>
    </label>
  )

  return (
    <>
      {(type === QuestionType.Text || type === QuestionType.Email) && (
        <div>
          {label}
          <input
            onChange={handleChange}
            required={isRequired}
            value={currentAnswer}
            placeholder={
              question === PartnerEmailQuestion
                ? 'Enter the emails of your teammate(s) separated by commas'
                : ''
            }
            type={type === QuestionType.Email ? 'email' : 'text'}
            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500"
          />
        </div>
      )}
      {type === QuestionType.Statement && label}
      {(type === QuestionType.MultipleChoice ||
        type === QuestionType.MultipleChoiceSelectOne) && (
        <>
          {label}
          <CheckboxGroup
            className="pb-0"
            items={options ?? []}
            selectedItems={selectedItems}
            toggleItem={handleCheckboxChange}
            noStyleItems
          />
        </>
      )}
      {type === QuestionType.Dropdown && (
        <>
          {label}
          <SelectInput
            className="mb-0"
            value={currentAnswer || ''}
            options={options?.map((option) => ({ value: option, label: option })) ?? []}
            onChange={handleChange}
          />
        </>
      )}
    </>
  )
}

export default AnswerQuestion
