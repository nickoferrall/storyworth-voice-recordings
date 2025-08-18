import dayjs, { Dayjs } from 'dayjs'
import React from 'react'
import { useGetCompetitionByIdQuery } from '../../src/generated/graphql'
import { CheckboxGroup } from '../Layout/CheckboxGroup'
import { useRouter } from 'next/router'
import TextInput from '../TextInput'
import DateTimePickers from '../DateTimePickers'
import { TicketTypeForm } from '../TicketType/TicketTypeModal'

type Props = {
  formData: TicketTypeForm
  setFormData: React.Dispatch<React.SetStateAction<TicketTypeForm>>
  isDisabled?: boolean
}

const EarlyBird = (props: Props) => {
  const { formData, setFormData, isDisabled } = props
  const router = useRouter()
  const { id } = router.query
  const { data } = useGetCompetitionByIdQuery({ variables: { id: id as string } })

  const earlyBirdDefault = {
    startDateTime: dayjs().format(),
    endDateTime: dayjs().add(1, 'day').format(),
    price: formData.price < 50 ? formData.price : 50,
    limit: 10,
  } as const

  const handleChangeStartDateTime = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newStart = date.hour(time.hour()).minute(time.minute())
      const newEnd = newStart.add(5, 'hour')
      setFormData({
        ...formData,
        earlyBird: {
          ...formData.earlyBird,
          startDateTime: newStart.format(),
          endDateTime: newEnd.format(),
          price: formData.earlyBird?.price ?? 0, // Provide default value
        },
      })
    }
  }

  const handleChangeEndDateTime = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newEnd = date.hour(time.hour()).minute(time.minute())
      const newStart = newEnd.subtract(1, 'hour')
      setFormData({
        ...formData,
        earlyBird: {
          ...formData.earlyBird,
          startDateTime: newStart.format(),
          endDateTime: newEnd.format(),
          price: formData.earlyBird?.price ?? 0, // Provide default value
        },
      })
    }
  }

  const handleToggleEarlyBird = (offerEarlyBird: boolean) => {
    setFormData((prev) => ({
      ...prev,
      offerEarlyBird,
      earlyBird: earlyBirdDefault,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'registrationLimit' || name === 'earlyBirdPrice') {
      const newValue = parseInt(value, 10) || 0
      const stateName = name === 'registrationLimit' ? 'limit' : 'price'
      setFormData((prev) => ({
        ...prev,
        earlyBird: {
          ...prev.earlyBird,
          [stateName]: newValue || 0, // Ensure newValue is always a number
          price: prev.earlyBird?.price ?? 0, // Ensure price is always a number
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        earlyBird: {
          ...prev.earlyBird,
          [name]: value,
          price: prev.earlyBird?.price ?? 0,
        },
      }))
    }
  }

  return (
    <>
      <CheckboxGroup
        title="Offer Early Bird Discount?"
        toggleItem={() => handleToggleEarlyBird(!formData.offerEarlyBird)}
        selectedItems={formData.offerEarlyBird ? ['Yes'] : ['No']}
        items={['Yes', 'No']}
        isDisabled={isDisabled}
      />
      {formData.offerEarlyBird && (
        <>
          <div className="flex justify-between">
            <TextInput
              label="Early Bird Price"
              name="earlyBirdPrice"
              value={formData.earlyBird?.price ?? 0}
              onChange={handleChange}
              className="flex-1 mr-2"
              required
            />
            <TextInput
              label="Registration Limit"
              name="registrationLimit"
              value={formData.earlyBird?.limit ?? 0}
              onChange={handleChange}
              className="flex-1 ml-2"
            />
          </div>
          <div className="pb-6">
            <DateTimePickers
              startDateTime={dayjs(formData.earlyBird?.startDateTime)}
              endDateTime={dayjs(formData.earlyBird?.endDateTime)}
              onChangeStart={handleChangeStartDateTime}
              onChangeEnd={handleChangeEndDateTime}
              timezone={data?.getCompetitionById?.timezone ?? 'UTC'}
              startLabel="Early Bird Start Date"
              endLabel="Early Bird End Date"
            />
          </div>
        </>
      )}
    </>
  )
}

export default EarlyBird
