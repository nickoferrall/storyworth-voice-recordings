import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../lib/supabaseAdmin'
import { randomUUID } from 'crypto'

export type Context = {
  user: null
  req: NextApiRequest
  res: NextApiResponse
  resolvedUrl: string
  query: { [key: string]: string | string[] }
  anonKey?: string
  anonUserId?: string
}

export async function createContext({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}): Promise<Context> {
  let anonKey = req.cookies?.sw_anon as string | undefined
  if (!anonKey) {
    anonKey = randomUUID()
    const isProd = process.env.NODE_ENV === 'production'
    const secure = isProd ? '; Secure' : ''
    res.setHeader(
      'Set-Cookie',
      `sw_anon=${anonKey}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly${secure}`,
    )
  }
  let anonUserId: string | undefined
  try {
    if (anonKey && supabaseAdmin) {
      const { data } = await (supabaseAdmin as any)
        .from('anonymous_user')
        .upsert({ anon_key: anonKey }, { onConflict: 'anon_key' })
        .select('id')
        .single()
      anonUserId = data?.id
    }
  } catch (_e) {}
  if (anonKey) {
    console.log('[context] anonKey present', { anonKey, anonUserId: anonUserId || null })
  } else {
    console.log('[context] anonKey missing')
  }
  return {
    user: null,
    req,
    res,
    resolvedUrl: req.url || '',
    query: req.query,
    anonKey,
    anonUserId,
  } as any
}
