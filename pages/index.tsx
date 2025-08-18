import React, { useState } from 'react'
import Head from 'next/head'
import { gql, useMutation } from '@apollo/client'

const START_VOICE_STORY = gql`
  mutation StartVoiceStory($phone: String!) {
    startVoiceStory(phone: $phone) {
      id
      status
    }
  }
`

export default function HomePage() {
  const [phone, setPhone] = useState('')
  const [start, { data, loading, error }] = useMutation(START_VOICE_STORY)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <Head>
        <title>Record your story by phone</title>
      </Head>
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-semibold text-gray-800 mb-6">
          Record your voice over the phone and we’ll transcribe your story.
        </h1>
        <label className="block text-gray-700 mb-2">Your phone number</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-3 text-lg"
          placeholder="123-456-7890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-full shadow disabled:opacity-50"
          onClick={() => start({ variables: { phone } })}
          disabled={!phone || loading}
        >
          {loading ? 'Calling…' : 'Call me now'}
        </button>
        {error && <p className="text-red-600 mt-3">{error.message}</p>}
        {data && (
          <p className="text-gray-700 mt-4">Started. Keep this tab open while we connect your call.</p>
        )}

        <hr className="my-10" />
        <h2 className="text-sm font-semibold tracking-widest text-gray-600">HOW IT WORKS</h2>
        <ol className="mt-4 space-y-6">
          <li className="flex gap-4">
            <span className="text-xl text-gray-500">01</span>
            <p className="text-gray-800">Enter your phone number and we’ll call you to record your story.</p>
          </li>
          <li className="flex gap-4">
            <span className="text-xl text-gray-500">02</span>
            <p className="text-gray-800">During the call we’ll record your story over the phone.</p>
          </li>
          <li className="flex gap-4">
            <span className="text-xl text-gray-500">03</span>
            <p className="text-gray-800">After the call, you’ll be able to listen back and read the transcript.</p>
          </li>
        </ol>
      </div>
    </div>
  )
}
