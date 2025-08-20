import React, { useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import {
  useStartVoiceStoryMutation,
  useRetellVoiceStoryQuery,
} from '../src/generated/graphql'
import ErrorMessage from '../components/Layout/ErrorMessage'
import { useRouter } from 'next/router'
import Equalizer from '../components/Call/Equalizer'

export default function HomePage() {
  const [phone, setPhone] = useState('')
  const [start, { data, loading, error }] = useStartVoiceStoryMutation()
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [callId, setCallId] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const router = useRouter()
  const redirectedRef = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {}, [router])

  useEffect(() => {
    if (data?.startVoiceStory?.id) {
      setCallId(data.startVoiceStory.id)
      setCallStatus((data.startVoiceStory as any)?.status ?? 'registered')
      try {
        localStorage.setItem('lastCallId', data.startVoiceStory.id)
      } catch (_) {}
    }
  }, [data])

  useEffect(() => {
    if (!callId) return
    let cancelled = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/retell-status?id=${encodeURIComponent(callId)}&t=${Date.now()}`,
        )
        const json = await res.json()
        if (cancelled) return
        if (json?.status) setCallStatus(json.status)
        if (json?.transcript) setTranscript(json.transcript)
        if (json?.audio_url) setAudioUrl(json.audio_url)
        if (
          json?.audio_url &&
          json?.status &&
          ['completed', 'finished', 'ended', 'agent_hangup', 'user_hangup'].includes(
            String(json.status),
          )
        ) {
          try {
            localStorage.setItem('lastCallId', callId)
          } catch (_) {}
          if (callId !== 'demo') router.push(`/call/${encodeURIComponent(callId)}`)
          clearInterval(interval)
        }
      } catch (_) {}
    }, 2000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [callId])

  useEffect(() => {
    if (redirectedRef.current) return
    if (!callId || callId === 'demo') return
    const endedStatuses = ['completed', 'finished', 'ended', 'agent_hangup', 'user_hangup']
    if (audioUrl && endedStatuses.includes(String(callStatus || '').toLowerCase())) {
      try {
        localStorage.setItem('lastCallId', callId)
      } catch (_) {}
      redirectedRef.current = true
      router.push(`/call/${encodeURIComponent(callId)}`)
    }
  }, [audioUrl, callStatus, callId, router])

  useEffect(() => {
    if (!(router as any).isReady) return
    if ((router.query as any)?.demo === '1' && !callId) {
      setCallId('demo')
      setCallStatus('connecting')
      let i = 0
      const sample = [
        'Storyworth: Hi! Ready to start?',
        'User: Yes, let’s begin.',
        'Storyworth: Tell me about your favorite memory.',
      ]
      const interval = setInterval(() => {
        setTranscript((prev) =>
          prev ? prev + '\n' + sample[i % sample.length] : sample[i % sample.length],
        )
        i += 1
      }, 1200)
      return () => clearInterval(interval)
    }
  }, [router, callId])

  const { data: retellData } = useRetellVoiceStoryQuery({
    variables: { id: callId || '' },
    skip: !callId,
    pollInterval: callId ? 2000 : undefined,
    fetchPolicy: 'network-only',
  })

  useEffect(() => {
    if (!retellData?.retellVoiceStory) return
    const r = retellData.retellVoiceStory
    if (r.status) setCallStatus(r.status || null)
    if (r.transcript) setTranscript(r.transcript || null)
    if (r.audioUrl) setAudioUrl(r.audioUrl || null)
  }, [retellData])

  const callEnded = useMemo(() => {
    if (audioUrl) return true
    if (transcript) return true
    const ended = ['completed', 'finished', 'ended', 'agent_hangup', 'user_hangup']
    return ended.includes(String(callStatus || '').toLowerCase())
  }, [audioUrl, transcript, callStatus])

  const isInProgress = !!(callId && !callEnded)
  const isFailure = useMemo(() => {
    const failures = [
      'failed',
      'busy',
      'no_answer',
      'not_reachable',
      'canceled',
      'cancelled',
      'error',
    ]
    return failures.includes(String(callStatus || '').toLowerCase())
  }, [callStatus])

  const triggerCall = () => {
    setSubmitted(true)
    const e164 = /^\+[1-9]\d{6,14}$/
    if (!phone) return
    const raw = phone.trim()
    const onlyDigits = raw.replace(/[^\d]/g, '')
    let normalized = raw
    if (!raw.startsWith('+')) {
      if (onlyDigits.length === 10) {
        normalized = `+1${onlyDigits}`
      } else if (onlyDigits.length === 11 && onlyDigits.startsWith('1')) {
        normalized = `+${onlyDigits}`
      }
    }
    if (!e164.test(normalized)) {
      setClientError(
        'Please enter a full phone number with country code, for example +15551234567',
      )
      return
    }
    setClientError(null)
    start({ variables: { phone: normalized } })
  }

  const renderTranscript = (t: string) => {
    const normalized = (t || '')
      .replaceAll('\nAgent:', '\nStoryworth:')
      .replace(/^Agent:/, 'Storyworth:')
    return normalized.split('\n').map((line, idx) => {
      const m = /^(Storyworth|User):\s?(.*)$/.exec(line)
      return (
        <div key={idx}>
          {m ? (
            <>
              <strong>{m[1] === 'User' ? 'You' : m[1]}:</strong> {m[2]}
            </>
          ) : (
            line
          )}
        </div>
      )
    })
  }

  return (
    <div className=" bg-white">
      <Head>
        <title>Record your story by phone</title>
      </Head>
      <div className="mx-auto min-h-screen max-w-3xl pt-10 pb-20">
        <div className="flex flex-col items-center">
          <Image
            src="/assets/storyworth-img.png"
            alt=""
            width={167}
            height={117}
            className="mb-8"
            aria-hidden
            priority
          />
        </div>
        <div
          className={`mx-auto w-full md:w-[741px] md:relative md:-mt-5 px-6 md:px-0 ${
            isInProgress ? '' : 'md:pl-6'
          }`}
        >
          {!isInProgress && (
            <h1 className="font-gtDisplay text-brand text-[36px] leading-[44px] font-normal">
              Record your voice over the phone and we’ll transcribe your story.
            </h1>
          )}

          {!isInProgress && (
            <>
              <label className="block text-brandSecondary mt-8 mb-2 font-gtText font-book text-label">
                Your phone number
              </label>
              <input
                className={`block w-full md:w-[50%] h-12 rounded-lg px-4 font-gtText text-[20px] leading-[28px] font-[350] placeholder:text-[#61706F] border focus:outline-none focus:ring-0 focus:border-[#12473A] ${
                  submitted && (!!clientError || !phone)
                    ? 'border-red-500'
                    : 'border-[#9FB5AF]'
                }`}
                placeholder="123-456-7890"
                type="tel"
                value={phone}
                onChange={(e) => {
                  const raw = e.target.value
                  if (raw.startsWith('+')) {
                    setPhone(raw)
                  } else {
                    const digits = raw.replace(/[^\d]/g, '').slice(0, 10)
                    let display = digits
                    if (digits.length > 3 && digits.length <= 6) {
                      display = `${digits.slice(0, 3)}-${digits.slice(3)}`
                    } else if (digits.length > 6) {
                      display = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
                    }
                    setPhone(display)
                  }
                  if (e.target.value) setSubmitted(false)
                  setClientError(null)
                }}
                onBlur={() => {
                  if (!phone) setSubmitted(false)
                }}
                aria-invalid={submitted && (!!clientError || !phone) ? 'true' : 'false'}
                autoFocus
                ref={inputRef}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    triggerCall()
                  }
                }}
              />
              <button
                className="mt-5 block w-[185px] h-[48px] bg-[#06949d] hover:brightness-95 text-white rounded-full shadow disabled:opacity-50 uppercase tracking-[0.1em] font-gtAmerica text-center"
                onClick={triggerCall}
                type="button"
                disabled={loading}
              >
                {loading ? 'Calling…' : 'Call me now'}
              </button>
              {(clientError || (error as any)?.message) && (
                <div className="mt-6 w-full md:w-1/2">
                  <ErrorMessage
                    error={(clientError as any) || ((error as any)?.message as any)}
                    className="w-full"
                  />
                </div>
              )}
              <hr className="my-10 mx-3 border-t border-slate-200" />
            </>
          )}
          {isInProgress && (
            <div className="mt-6 w-full flex justify-center">
              {!callEnded && !isFailure ? (
                <div className="mt-4 rounded-md border border-slate-200 p-4 bg-white max-w-xl w-full">
                  <div className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap font-gtText text-[16px] leading-6 text-brand">
                    {transcript ? (
                      renderTranscript(transcript || '')
                    ) : (
                      <div className="flex items-center gap-3 text-slate-400">
                        <Equalizer />
                        <span>Call in progress…</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {isFailure ? (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-700 max-w-xl w-full">
                      Couldn’t connect the call. Please check the number format and try
                      again.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-400" aria-hidden />
                      <p className="text-gray-700">Call complete</p>
                    </div>
                  )}
                  {audioUrl && (
                    <div className="mt-6">
                      <h3 className="font-gtAmerica uppercase text-[14px] leading-5 tracking-wide text-slate-700">
                        Call recording
                      </h3>
                      <audio className="mt-2 w-full" controls src={audioUrl} />
                    </div>
                  )}
                  {transcript && (
                    <div className="mt-4 rounded-md border border-slate-200 p-4 bg-white">
                      <h3 className="font-gtAmerica uppercase text-[14px] leading-5 tracking-wide text-slate-700">
                        Transcript
                      </h3>
                      <div className="mt-2 whitespace-pre-wrap font-gtText text-[16px] leading-6 text-brand">
                        {renderTranscript(transcript)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {!isInProgress && (
            <>
              <h2 className="font-gtAmerica uppercase font-medium text-[16px] leading-[20px] text-black">
                HOW IT WORKS
              </h2>
              <ol className="divide-y divide-slate-200 w-full">
                <li className="flex gap-6 items-baseline py-5">
                  <span className="font-gtText oldstyle-nums proportional-nums text-[26px] leading-[36px] tracking-[-0.01em] font-book text-[#000000] w-[30px] relative top-[1px]">
                    01
                  </span>
                  <p className="font-gtText font-book text-body text-brand">
                    Enter your phone number and Storyworth will call you to record your
                    story.
                  </p>
                </li>
                <li className="flex gap-7 items-baseline py-5">
                  <span className="font-gtText oldstyle-nums proportional-nums text-[26px] leading-[36px] tracking-[-0.01em] font-book text-[#000000] w-[30px] relative top-[1px]">
                    02
                  </span>
                  <p className="font-gtText font-book text-body text-brand">
                    During the call we’ll record your story over the phone.
                  </p>
                </li>
                <li className="flex gap-7 items-baseline py-5">
                  <span className="font-gtText oldstyle-nums proportional-nums text-[26px] leading-[36px] tracking-[-0.01em] font-book text-[#000000] w-[30px] relative top-[1px]">
                    03
                  </span>
                  <p className="font-gtText font-book text-body text-brand">
                    After the call, an audio clip of your recording will be uploaded to
                    your story where you can then request it to be transcribed.
                  </p>
                </li>
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
