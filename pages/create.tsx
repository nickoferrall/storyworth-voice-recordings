import React, { useState, useEffect } from 'react'
import Signup from '../components/SignUp/SignUpModal'
import { useCreateCompMutation } from '../src/generated/graphql'
import { useRouter } from 'next/router'
import withAuth from '../utils/withAuth'
import { Context } from '../graphql/context'
import ErrorMessage from '../components/Layout/ErrorMessage'
import DateTimePickers from '../components/DateTimePickers'
import dayjs, { Dayjs } from 'dayjs'
import { Input } from '../src/components/ui/input'
import { Label } from '../src/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../src/components/ui/card'

export const getServerSideProps = withAuth(
  async function (context: Context) {
    return {
      props: { user: context.user },
    }
  },
  true,
  false,
)

const CompetitionForm = () => {
  const [name, setName] = useState('')
  const [numWorkouts, setNumWorkouts] = useState(4)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [startDateTime, setStartDateTime] = useState<Dayjs | null>(null)
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null)
  const [timezone, setTimezone] = useState<string>('UTC')
  const [showSignUp, setShowSignUp] = useState(false)
  const [createComp, { loading, error }] = useCreateCompMutation()
  const router = useRouter()

  // Initialize dates and timezone on client side only to avoid hydration mismatch
  useEffect(() => {
    const defaultStart = dayjs().add(1, 'day').hour(9).minute(0)
    const defaultEnd = dayjs().add(1, 'day').hour(15).minute(0)

    setStartDateTime(defaultStart)
    setEndDateTime(defaultEnd)
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const handleChangeStartDateTime = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newStart = date.hour(time.hour()).minute(time.minute())
      setStartDateTime(newStart)
      setEndDateTime((prevEnd) =>
        prevEnd && newStart.isAfter(prevEnd) ? newStart.add(1, 'day') : prevEnd,
      )
    }
  }

  const handleChangeEndDateTime = (date: Dayjs | null, time: Dayjs | null) => {
    if (date && time) {
      const newEnd = date.hour(time.hour()).minute(time.minute())
      setEndDateTime(newEnd)
      setStartDateTime((prevStart) =>
        prevStart && newEnd.isBefore(prevStart) ? newEnd.subtract(1, 'day') : prevStart,
      )
    }
  }

  const handleNumWorkoutsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (value > 10) {
      setErrorMessage('The number of workouts cannot exceed 10.')
    } else {
      setErrorMessage(null)
      setNumWorkouts(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (numWorkouts > 10) {
      setErrorMessage('The number of workouts cannot exceed 10.')
      return
    }

    if (!startDateTime || !endDateTime) {
      setErrorMessage('Please wait for the form to load completely.')
      return
    }

    try {
      const response = await createComp({
        variables: {
          name,
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          numberOfWorkouts: numWorkouts,
          timezone,
        },
      })
      if (response?.data?.createComp?.competition?.id) {
        router.push(`/${response.data.createComp.competition.id}/overview`)
      }
    } catch (error: any) {
      console.error('Error creating competition:', error)
    }
  }

  return (
    <div className="flex flex-col justify-start items-center xs:pt-5 md:pt-6 xl:pt-12 h-full">
      <Card className="sm:w-3/4 md:w-2/3 lg:w-3/5 xl:w-2/5">
        <CardHeader>
          <CardTitle className="text-center">Create Competition</CardTitle>
          <CardDescription className="text-center">
            Fill in the details below to create a new competition. You can edit this
            later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Competition Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="workouts">Number of Workouts</Label>
                <Input
                  id="workouts"
                  type="number"
                  value={numWorkouts}
                  onChange={handleNumWorkoutsChange}
                  required
                  max={10}
                />
              </div>

              {errorMessage && <ErrorMessage error={errorMessage} />}

              {startDateTime && endDateTime ? (
                <DateTimePickers
                  startDateTime={startDateTime}
                  endDateTime={endDateTime}
                  onChangeStart={handleChangeStartDateTime}
                  onChangeEnd={handleChangeEndDateTime}
                  timezone={timezone}
                />
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Loading date picker...
                </div>
              )}

              <div className="flex justify-end mt-4">
                <ErrorMessage error={error?.message} />
                <button
                  className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex justify-center items-center">
                      Creating<span className="animate-pulse">...</span>
                    </span>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <Signup open={showSignUp} onClose={() => setShowSignUp(false)} />
    </div>
  )
}

export default CompetitionForm
