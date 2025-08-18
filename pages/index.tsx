import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import { useStartVoiceStoryMutation } from '../src/generated/graphql'
import ErrorMessage from '../components/Layout/ErrorMessage'

export default function HomePage() {
  const [phone, setPhone] = useState('')
  const [start, { data, loading, error }] = useStartVoiceStoryMutation()
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div className=" bg-white">
      <Head>
        <title>Record your story by phone</title>
      </Head>
      <div className="mx-auto min-h-screen max-w-3xl pt-10">
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
        <div className="mx-auto w-full md:w-[741px] md:relative md:-mt-5 pl-6">
          <h1 className="font-gtDisplay text-brand text-[36px] leading-[44px] font-normal">
            Record your voice over the phone and we’ll transcribe your story.
          </h1>

          <label className="block text-brandSecondary mt-8 mb-2 font-gtText font-book text-label">
            Your phone number
          </label>
          <input
            className={`block w-full md:w-[50%] h-12 rounded-lg px-4 font-gtText text-[20px] leading-[28px] font-[350] placeholder:text-[#61706F] border focus:outline-none focus:ring-0 focus:border-[#12473A] ${
              submitted && !phone ? 'border-red-500' : 'border-[#9FB5AF]'
            }`}
            placeholder="123-456-7890"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (e.target.value) setSubmitted(false)
            }}
            onBlur={() => {
              if (!phone) setSubmitted(false)
            }}
            aria-invalid={submitted && !phone ? 'true' : 'false'}
            autoFocus
            ref={inputRef}
          />
          <button
            className="mt-5 block w-[185px] h-[48px] bg-[#06949d] hover:brightness-95 text-white rounded-full shadow disabled:opacity-50 uppercase tracking-[0.1em] font-gtAmerica text-center"
            onClick={() => {
              setSubmitted(true)
              if (!phone) return
              start({ variables: { phone } })
            }}
            disabled={loading}
          >
            {loading ? 'Calling…' : 'Call me now'}
          </button>
          <hr className="my-10 mx-3 border-t border-slate-200" />
          <ErrorMessage error={(error as any)?.message} className="w-full md:w-1/2" />
          {data && (
            <p className="text-gray-700 mt-4">
              Started. Keep this tab open while we connect your call.
            </p>
          )}

          <h2 className="font-gtAmerica uppercase font-medium text-[16px] leading-[20px] text-black">
            HOW IT WORKS
          </h2>
          <ol className="divide-y divide-slate-200 w-full">
            <li className="flex gap-6 items-baseline py-5">
              <span className="font-gtText oldstyle-nums proportional-nums text-[26px] leading-[36px] tracking-[-0.01em] font-book text-[#000000] w-[30px] relative top-[1px]">
                01
              </span>
              <p className="font-gtText font-book text-body text-brand">
                Enter your phone number and Storyworth will call you to record your story.
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
                After the call, an audio clip of your recording will be uploaded to your
                story where you can then request it to be transcribed.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
