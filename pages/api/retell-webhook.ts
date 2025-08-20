import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

// For demo: keep an in-memory map from call_id to transcript/recording
const memory: Record<
  string,
  { transcript?: string; audio_url?: string; status?: string }
> = {}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  try {
    const body = (req.body || {}) as any
    console.log('🚀 ~ body:', body)
    const data = (body && typeof body === 'object' && (body.call || body.data)) || body
    const call = (body && (body.call || body.data)) || body
    const callId = call?.call_id || call?.id || body?.call_id || body?.id || 'unknown'
    const status = body?.event || call?.status || call?.event || body?.status || null
    const transcript =
      call?.transcript ||
      call?.summary ||
      call?.full_transcript ||
      body?.transcript ||
      body?.summary ||
      body?.full_transcript ||
      null
    const audioUrl =
      call?.recording_url ||
      call?.audio_url ||
      body?.recording_url ||
      body?.audio_url ||
      null
    const metadata = call?.metadata || data?.metadata || body?.metadata || null
    const startedAtRaw = call?.start_timestamp || body?.start_timestamp || null
    const endedAtRaw = call?.end_timestamp || body?.end_timestamp || null
    const phoneRaw =
      call?.customer_number ||
      call?.to_number ||
      body?.customer_number ||
      body?.to_number ||
      null

    console.log('[retell webhook] received', {
      callId,
      status,
      hasMetadata: !!metadata,
      hasTranscript: !!transcript,
      hasAudio: !!audioUrl,
      bodyKeys: Object.keys(body || {}),
      dataKeys: data && data !== body ? Object.keys(data) : undefined,
    })
    memory[callId] = {
      transcript: transcript ?? memory[callId]?.transcript,
      audio_url: audioUrl ?? memory[callId]?.audio_url,
      status,
    }
    // Persist to DB via Supabase admin client
    try {
      if (callId === 'unknown') {
        console.error('[retell webhook] missing call_id; skipping DB write')
        return res.json({ ok: true })
      }
      const startedAt = startedAtRaw ? new Date(startedAtRaw) : null
      const endedAt = endedAtRaw ? new Date(endedAtRaw) : null
      const phone = phoneRaw
      // Optionally get anon key from metadata or query
      const anonKey =
        (metadata && (metadata as any).anon_key) ||
        (req.query?.anon as string | undefined)
      let anonUserId: string | undefined
      if (anonKey && supabaseAdmin) {
        const { data: anon, error: anonErr } = await (supabaseAdmin as any)
          .from('anonymous_user')
          .upsert({ anon_key: anonKey }, { onConflict: 'anon_key' })
          .select('id')
          .single()
        if (anonErr) {
          console.error('[retell webhook anon upsert error]', anonErr.message)
        }
        anonUserId = anon?.id
      }
      console.log('[retell webhook] upsert', {
        callId,
        status,
        hasTranscript: !!transcript,
        hasAudio: !!audioUrl,
        anonKey: anonKey || null,
        anonUserId: anonUserId || null,
      })
      if (supabaseAdmin) {
        const { error: callErr } = await (supabaseAdmin as any).from('call_log').upsert(
          {
            retell_call_id: callId,
            anon_user_id: anonUserId ?? null,
            phone_e164: phone ?? null,
            status: status ?? null,
            audio_url: audioUrl ?? null,
            transcript: transcript ?? null,
            started_at: startedAt ?? null,
            ended_at: endedAt ?? null,
          },
          { onConflict: 'retell_call_id' },
        )
        if (callErr) {
          console.error('[retell webhook call_log upsert error]', callErr.message)
        }
      }
    } catch (err: any) {
      console.error('[retell webhook db error]', err?.message || err, { callId, status })
    }

    res.json({ ok: true })
  } catch (e: any) {
    console.error('[retell webhook error]', e?.message || e, {
      body: req.body,
    })
    res.status(200).json({ ok: true })
  }
}

export function getRetellMemory() {
  return memory
}
