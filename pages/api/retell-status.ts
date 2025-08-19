import type { NextApiRequest, NextApiResponse } from 'next'
import { getRetellMemory } from './retell-webhook'
import { getRetellCall } from '../../lib/retell'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Missing id' })
  const mem = getRetellMemory()[String(id)] || {}
  if (mem && (mem.transcript || mem.audio_url || mem.status)) {
    return res.json({ id, ...mem })
  }
  getRetellCall(String(id))
    .then((c: any) => {
      const status = c?.call_status || c?.status
      const transcript =
        c?.transcript ||
        c?.summary ||
        (Array.isArray(c?.transcript_object)
          ? c.transcript_object
              .map((t: any) => t?.content)
              .filter(Boolean)
              .join('\n')
          : null)
      const audio = c?.recording_url || c?.signed_recording_url || c?.audio_url || null
      return res.json({ id, status, transcript, audio_url: audio })
    })
    .catch((_e) => res.json({ id }))
}
