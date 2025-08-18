import React, { useState, useEffect } from 'react'
import {
  useCreateRegistrationMutation,
  useGetTicketTypeByIdQuery,
  useGetInvitationByTokenQuery,
  RegistrationField,
} from '../../src/generated/graphql'
import { useRouter } from 'next/router'
import AnswerQuestion from '../../components/Event/AnswerQuestion'
import ErrorMessage from '../../components/Layout/ErrorMessage'

export type Answer = {
  registrationFieldId: string
  answer: string
}

const InviteeRegistrationPage = () => {
  const router = useRouter()
  const { id: ticketTypeId, token } = router.query

  const {
    data: ticketData,
    loading: ticketLoading,
    error: ticketError,
  } = useGetTicketTypeByIdQuery({
    variables: { ticketId: ticketTypeId as string },
    skip: !ticketTypeId,
  })

  const {
    data: invitationData,
    loading: invitationLoading,
    error: invitationError,
  } = useGetInvitationByTokenQuery({
    variables: { token: token as string },
    skip: !token,
  })
  const error =
    !ticketLoading && !invitationLoading ? ticketError || invitationError : null
  console.log('🚀 ~ error:', { error, ticketError, invitationError })

  const [answers, setAnswers] = useState<Answer[]>([])
  const [isWaiverChecked, setIsWaiverChecked] = useState(false)
  const [createRegistration, { loading: isSubmitting }] = useCreateRegistrationMutation()

  const [registrationError, setRegistrationError] = useState<string | null>(null)

  const ticketType = ticketData?.getTicketTypeById
  const competitionId = ticketType?.competitionId ?? ''
  const invitation = invitationData?.getInvitationByToken
  const teamName = invitation?.team?.name
  const captainName = invitation?.team?.teamCaptain?.name

  const filteredFields =
    ticketType?.registrationFields.filter((field) => field.repeatPerAthlete) || []

  useEffect(() => {
    if (invitation) {
      const emailField = filteredFields.find((field) => field.question === 'Your Email')
      const existingAnswer = answers.find(
        (answer) => answer.registrationFieldId === emailField?.id,
      )
      // Only update state if the email hasn't been set yet
      if (emailField && !existingAnswer && invitation.email) {
        setAnswers((prevAnswers) => [
          ...prevAnswers,
          { registrationFieldId: emailField.id, answer: invitation.email ?? '' },
        ])
      }
    }
  }, [invitation, filteredFields])

  const handleUpdate = (registrationFieldId: string, answer: string | string[]) => {
    const answerString = Array.isArray(answer) ? answer.join(', ') : answer
    setAnswers((prevAnswers) => {
      const answerIndex = prevAnswers.findIndex(
        (ans) => ans.registrationFieldId === registrationFieldId,
      )
      if (answerIndex !== -1) {
        const updatedAnswers = [...prevAnswers]
        updatedAnswers[answerIndex].answer = answerString
        return updatedAnswers
      } else {
        return [...prevAnswers, { registrationFieldId, answer: answerString }]
      }
    })
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Clear any previous errors
    setRegistrationError(null)

    const getFieldId = (question: string) =>
      filteredFields.find((field) => field.question === question)?.id
    const getAnswer = (fieldId: string | undefined) =>
      answers.find((answer) => answer.registrationFieldId === fieldId)?.answer

    const nameFieldId = getFieldId('Name')
    const emailFieldId = getFieldId('Your Email')

    const name = getAnswer(nameFieldId) as string
    const email = getAnswer(emailFieldId) as string

    try {
      const res = await createRegistration({
        variables: {
          input: {
            name,
            email,
            ticketTypeId: ticketTypeId as string,
            invitationToken: token as string,
            answers,
          },
        },
      })

      if (res.data?.createRegistration) {
        router.push(`/event/${competitionId}`)
      }
    } catch (err) {
      console.error('Registration failed:', err)
      setRegistrationError(
        (err as Error).message || 'Registration failed. Please try again.',
      )
    }
  }

  if (ticketLoading || invitationLoading) return <p>Loading...</p>
  // Only show error if queries are done loading AND there's actually an error
  if (
    !ticketLoading &&
    !invitationLoading &&
    (ticketError || invitationError || !ticketType)
  )
    return (
      <ErrorMessage
        error={
          ticketError?.message ||
          invitationError?.message ||
          'Ticket type or invitation not found.'
        }
      />
    )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-3xl font-semibold mb-2">Complete Your Registration</h1>
        {teamName && (
          <p className="text-md mb-4">
            You've been invited to join <strong>{teamName}</strong> by {captainName}.
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-8">
          {filteredFields.map((field) => (
            <AnswerQuestion
              key={field.id}
              handleUpdate={handleUpdate}
              field={field as RegistrationField}
              currentAnswer={
                answers.find((answer) => answer.registrationFieldId === field.id)
                  ?.answer ?? ''
              }
            />
          ))}
          <div className="my-4">
            <input
              type="checkbox"
              id="waiver"
              required
              checked={isWaiverChecked}
              onChange={() => setIsWaiverChecked(!isWaiverChecked)}
              className="mr-2 text-purple-500 ring-0 focus:ring-0 selected:bg-purple-500 hover:text-purple-500 rounded-sm hover:cursor-pointer"
            />
            <label htmlFor="waiver" className="">
              I agree to the{' '}
              <a href="/waiver" target="_blank" className="text-blue-500 underline">
                waiver terms and conditions
              </a>
              .
            </label>
          </div>
          <ErrorMessage error={registrationError || error?.message} />
          <button
            type="submit"
            className="mt-4 p-2 bg-purple-500 text-bold text-white rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500 mb-6"
            disabled={!isWaiverChecked || isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex justify-center items-center">
                Registering<span className="animate-pulse">...</span>
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default InviteeRegistrationPage
