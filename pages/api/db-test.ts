import type { NextApiRequest, NextApiResponse } from 'next'
import getPg from '../../lib/pgPool'
import { randomUUID } from 'crypto'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const pg = getPg()
    const anonKey = (req.query.anon as string) || randomUUID()
    const callId = `test_${Date.now()}`

    const anon = await pg.query(
      'insert into anonymous_user (anon_key) values ($1) on conflict (anon_key) do update set anon_key = excluded.anon_key returning id',
      [anonKey],
    )
    const anonUserId = anon.rows?.[0]?.id

    const now = new Date()
    await pg.query(
      `insert into call_log (retell_call_id, anon_user_id, phone_e164, status, audio_url, transcript, started_at, ended_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (retell_call_id) do update set anon_user_id = excluded.anon_user_id, status = excluded.status, started_at = excluded.started_at, ended_at = excluded.ended_at`,
      [callId, anonUserId, null, 'test', null, 'DB write test', now, now],
    )

    res.json({ ok: true, anonKey, anonUserId, callId })
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
}

