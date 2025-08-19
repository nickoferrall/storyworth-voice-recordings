import type { NextApiRequest, NextApiResponse } from 'next'

// For demo: keep an in-memory map from call_id to transcript/recording
const memory: Record<string, { transcript?: string; audio_url?: string; status?: string }> = {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const event = req.body || {}
    const callId = event.call_id || event.id || 'unknown'
    const status = event.status || event.event
    const transcript = event.transcript || event.summary || event.full_transcript
    const audioUrl = event.recording_url || event.audio_url
    memory[callId] = {
      transcript: transcript ?? memory[callId]?.transcript,
      audio_url: audioUrl ?? memory[callId]?.audio_url,
      status,
    }
    res.json({ ok: true })
  } catch (e: any) {
    res.status(200).json({ ok: true })
  }
}

export function getRetellMemory() {
  return memory
}


