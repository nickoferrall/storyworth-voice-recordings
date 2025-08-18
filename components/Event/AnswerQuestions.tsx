import React, { useState, useEffect } from 'react'
import {
  useCreatePaymentLinkMutation,
  useCreateRegistrationMutation,
} from '../../src/generated/graphql'
import AnswerQuestion from './AnswerQuestion'
import { useUser } from '../../contexts/UserContext'
import ErrorMessage from '../Layout/ErrorMessage'
import { PartnerEmailQuestion } from '../../utils/constants'
import dayjs from 'dayjs'
import * as Sentry from '@sentry/nextjs'
import { usePostHog } from 'posthog-js/react'
import { TicketState } from './RegisterModal'
import { currencySymbols } from '../../utils/currencyMap'
import { useRouter } from 'next/router'
import useCompetitionId from '../../hooks/useCompetitionId'
import { QuestionType } from '../../src/generated/graphql'

export type Answer = {
  registrationFieldId: string
  answer: string
  integration?: IntegrationData
}

export type IntegrationData = {
  type: string
  accessToken: string
  refreshToken: string
  expiresAt: string
  athleteId: string
  athleteFirstname?: string | null
  athleteLastname?: string | null
  athleteProfile?: string | null
}

type Props = {
  fields: TicketState['registrationFields']
  selectedTicket: TicketState
  onClose: () => void
  selectedHeatId: string | null
  heatStartTime: string | null
}

const AnswerQuestions = (props: Props) => {
  const { fields, selectedTicket, onClose, selectedHeatId, heatStartTime } = props
  const competitionId = useCompetitionId()
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isWaiverChecked, setIsWaiverChecked] = useState(false)
  const isFree = selectedTicket.price === 0
  const [createRegistration, { loading, error }] = useCreateRegistrationMutation()
  const { setUser } = useUser()
  const router = useRouter()
  const teamSize = selectedTicket.teamSize
  const filteredFields = fields.filter((field) => {
    if (teamSize === 1 && (field as any).onlyTeams) return false
    if (teamSize === 1 && field.question === PartnerEmailQuestion) return false
    return true
  })
  const [createPaymentLink] = useCreatePaymentLinkMutation()
  const [canProceed, setCanProceed] = useState(false)
  const posthog = usePostHog()

  const [registrationError, setRegistrationError] = useState<string | null>(null)

  const handleUpdate = (
    registrationFieldId: string,
    answer: string | string[],
    integration?: IntegrationData,
  ) => {
    setAnswers((prevAnswers) => {
      const answerIndex = prevAnswers.findIndex(
        (ans) => ans.registrationFieldId === registrationFieldId,
      )
      const newAnswer = {
        registrationFieldId,
        answer: (Array.isArray(answer) ? answer.join(', ') : answer) as string,
        ...(integration && { integration }),
      }

      if (answerIndex !== -1) {
        const updatedAnswers = [...prevAnswers]
        updatedAnswers[answerIndex] = newAnswer
        return updatedAnswers
      } else {
        return [...prevAnswers, newAnswer]
      }
    })
  }

  useEffect(() => {
    const allRequiredAnswered = filteredFields.every((field) => {
      if (field.requiredStatus === 'REQUIRED') {
        // Statement fields are informational; do not block submit
        if ((field as any).type === QuestionType.Statement) return true
        const answer = answers.find((a) => a.registrationFieldId === field.id)
        if (!answer) return false
        if (Array.isArray(answer.answer)) {
          return answer.answer.length > 0 && answer.answer.some((a) => a.trim() !== '')
        }
        return (answer.answer as string)?.trim() !== ''
      }
      return true
    })
    setCanProceed(allRequiredAnswered && isWaiverChecked)
  }, [answers, isWaiverChecked, filteredFields])

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    event.stopPropagation()

    // Clear any previous errors
    setRegistrationError(null)

    const getFieldId = (question: string) =>
      fields.find((field) => field.question === question)?.id
    const getAnswer = (fieldId: string | undefined) =>
      answers.find((answer) => answer.registrationFieldId === fieldId)?.answer

    const nameFieldId = getFieldId('Full Name') ?? getFieldId('Name')
    const name = getAnswer(nameFieldId) as string
    const emailFieldId = getFieldId('Your Email')
    const email = getAnswer(emailFieldId) as string

    const answersWithRegFieldId = answers.map((answer) => {
      return {
        registrationFieldId: answer.registrationFieldId,
        answer: answer.answer,
        ...(answer.integration && { integration: answer.integration }),
      }
    })

    const input = {
      name,
      email,
      answers: answersWithRegFieldId,
      ticketTypeId: selectedTicket.id,
      selectedHeatId,
    }
    if (!isFree) {
      try {
        // Track payment flow start
        posthog?.capture('Registration Payment Started', {
          competitionId: competitionId || 'unknown',
          ticketTypeId: selectedTicket.id,
          ticketTypeName: selectedTicket.name,
          price: selectedTicket.price,
          currency: selectedTicket.currency,
        })

        const res = await createPaymentLink({
          variables: {
            input,
          },
        })

        // Redirect to payment link if it's available
        if (res.data?.createPaymentLink) {
          // Track successful payment link creation
          posthog?.capture('Payment Link Created', {
            competitionId: competitionId || 'unknown',
            ticketTypeId: selectedTicket.id,
            ticketTypeName: selectedTicket.name,
            price: selectedTicket.price,
            currency: selectedTicket.currency,
          })

          // Track redirect to Stripe
          posthog?.capture('Redirected to Stripe', {
            competitionId: competitionId || 'unknown',
            ticketTypeId: selectedTicket.id,
          })

          window.location.href = res.data.createPaymentLink
        } else {
          // Track payment link creation failure
          posthog?.capture('Payment Link Creation Failed', {
            competitionId: competitionId || 'unknown',
            ticketTypeId: selectedTicket.id,
            error: 'No payment link returned',
          })
          onClose()
        }
      } catch (paymentError: any) {
        // Track payment link errors
        posthog?.capture('Payment Link Error', {
          competitionId: competitionId || 'unknown',
          ticketTypeId: selectedTicket.id,
          error: paymentError.message,
        })

        console.error('Payment link creation failed:', paymentError)
        // Could show user-friendly error message here
        onClose()
      }
    } else {
      try {
        // Track free registration attempt
        posthog?.capture('Free Registration Started', {
          competitionId,
          ticketTypeId: selectedTicket.id,
          ticketTypeName: selectedTicket.name,
        })

        const res = await createRegistration({
          variables: {
            input,
          },
        })

        if (res.errors) {
          // Track registration errors
          posthog?.capture('Registration Error', {
            competitionId,
            ticketTypeId: selectedTicket.id,
            errors: res.errors.map((e) => e.message),
          })
          console.error(res.errors)
          setRegistrationError(
            res.errors[0]?.message || 'Registration failed. Please try again.',
          )
          return
        }

        // Track successful registration
        posthog?.capture('Registration Completed', {
          competitionId,
          ticketTypeId: selectedTicket.id,
          ticketTypeName: selectedTicket.name,
          registrationType: 'free',
        })

        setUser(res.data?.createRegistration as any)
        onClose()

        // Determine redirect URL based on current page
        const isExplorePage = router.pathname.startsWith('/explore/')
        if (isExplorePage) {
          // If on explore page, redirect to the actual competition page
          router.push(`/event/${competitionId}?sl=true`)
        } else {
          // If on event page, redirect to same page with ?sl=true
          router.push(`/event/${competitionId}?sl=true`)
        }
      } catch (error) {
        console.error('Failed to create registration:', error)

        // Ensure we have a proper Error object for Sentry
        const properError =
          error instanceof Error
            ? error
            : new Error(typeof error === 'string' ? error : JSON.stringify(error))

        // Track registration failure
        posthog?.capture('Registration Failed', {
          competitionId: competitionId || 'unknown',
          ticketTypeId: selectedTicket.id,
          error: properError.message,
          errorType: error instanceof Error ? 'Error' : typeof error,
        })

        // Show user-friendly error message
        setRegistrationError(
          properError.message || 'Registration failed. Please try again.',
        )

        // Ensure registration errors are tracked with proper Error object
        Sentry.captureException(properError, {
          tags: {
            component: 'AnswerQuestions',
            action: 'registration',
            competitionId: competitionId || 'unknown',
            ticketTypeId: selectedTicket.id,
            originalErrorType: error instanceof Error ? 'Error' : typeof error,
          },
          extra: {
            originalError: error,
            errorDetails:
              typeof error === 'object' ? JSON.stringify(error) : String(error),
          },
        })
      }
    }
  }

  const formattedHeatStartTime = heatStartTime
    ? dayjs(heatStartTime).format('MMMM D[th] [at] h:mm A')
    : null

  return (
    <div className="w-full z-10 pb-24">
      <h1 className="text-3xl font-semibold text-white mb-2">Register</h1>
      <div className="flex justify-between text-foreground items-center mb-2">
        {formattedHeatStartTime
          ? `${selectedTicket.name} starting on ${formattedHeatStartTime}`
          : selectedTicket.name}
        {selectedTicket.price === 0
          ? ''
          : `. Price: ${currencySymbols[selectedTicket.currency]}${selectedTicket.price}`}
      </div>
      {filteredFields.map((field) => (
        <AnswerQuestion key={field.id} handleUpdate={handleUpdate} field={field} />
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
        <label htmlFor="waiver" className="text-foreground">
          I agree to the{' '}
          <a href="/waiver" target="_blank" className="text-blue-500 underline">
            waiver terms and conditions
          </a>
          .
        </label>
      </div>
      {!isFree && (
        <button
          type="submit"
          onClick={handleSubmit}
          className="mt-4 p-2 bg-purple-500 text-bold text-white rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500 mb-6 disabled:opacity-50 disabled:cursor-not-allowed sticky bottom-4"
          disabled={!canProceed || loading}
        >
          {loading ? (
            <span className="flex justify-center items-center">
              Processing<span className="animate-pulse">...</span>
            </span>
          ) : (
            'Proceed to Payment'
          )}
        </button>
      )}
      {isFree && (
        <>
          <ErrorMessage error={registrationError || error?.message} />
          <button
            type="submit"
            onClick={handleSubmit}
            className="mt-4 p-2 bg-purple-500 text-bold text-white rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 focus:ring-purple-500 mb-6 disabled:opacity-50 disabled:cursor-not-allowed sticky bottom-4"
            disabled={!canProceed || loading}
          >
            {loading ? (
              <span className="flex justify-center items-center">
                Registering<span className="animate-pulse">...</span>
              </span>
            ) : (
              'Register'
            )}
          </button>
        </>
      )}
    </div>
  )
}

export default AnswerQuestions
