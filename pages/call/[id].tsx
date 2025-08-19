import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRetellVoiceStoryQuery } from '../../src/generated/graphql'

export default function CallPage() {
  const router = useRouter()
  const id = (router.query as any)?.id as string | undefined
  const { data, loading, startPolling, stopPolling } = useRetellVoiceStoryQuery({
    variables: { id: id || '' },
    skip: !id,
    fetchPolicy: 'network-only',
  })
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string | null>(null)
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

  useEffect(() => {
    if (!id) return
    startPolling(2000)
    return () => stopPolling()
  }, [id, startPolling, stopPolling])

  useEffect(() => {
    if (!data?.retellVoiceStory) return
    setAudioUrl(data.retellVoiceStory.audioUrl || null)
    const t = data.retellVoiceStory.transcript || ''
    setTranscript(
      t.replaceAll('\nAgent:', '\nStoryworth:').replace(/^Agent:/, 'Storyworth:'),
    )
  }, [data])

  return (
    <div className="bg-white min-h-screen">
      <Head>
        <title>Call Summary</title>
      </Head>
      <div className="mx-auto max-w-3xl px-6 pt-16 pb-14 ">
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
        <div className="mb-6 flex items-center text-sm text-slate-600">
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden />
          <Link href="/calls" className="text-blue-600 hover:underline">
            Calls
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>Call summary</span>
        </div>
        <h1 className="font-gtDisplay text-brand text-[36px] leading-[44px] font-normal">
          Call Summary
        </h1>
        {loading && <p className="text-slate-500 mt-4">Loading…</p>}
        {audioUrl && (
          <div className="mt-6">
            <h3 className="font-gtAmerica uppercase text-[14px] leading-5 tracking-wide text-slate-700">
              Recording
            </h3>
            <audio className="mt-2 w-full" controls src={audioUrl} />
          </div>
        )}
        {transcript && (
          <div className="mt-6 rounded-md border border-slate-200 p-4 bg-white">
            <h3 className="font-gtAmerica uppercase text-[14px] leading-5 tracking-wide text-slate-700">
              Transcript
            </h3>
            <div className="mt-2 whitespace-pre-wrap font-gtText text-[16px] leading-6 text-brand">
              {renderTranscript(transcript)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
