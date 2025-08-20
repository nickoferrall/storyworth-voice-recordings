import Retell from 'retell-sdk'
export const RETELL_API_KEY = process.env.RETELL_API_KEY
export const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID
export const APP_BASE_URL = process.env.APP_BASE_URL
export const RETELL_FROM_NUMBER =
  process.env.RETELL_FROM_NUMBER || process.env.TWILIO_CALLER_ID

type StartRetellCallArgs = {
  customerNumber: string
  fromNumber?: string
  agentId?: string
  metadata?: Record<string, any>
}

export type RetellCall = Retell.CallResponse

export async function startRetellOutboundCall({
  customerNumber,
  fromNumber,
  agentId,
  metadata,
}: StartRetellCallArgs) {
  if (!RETELL_API_KEY) throw new Error('Missing RETELL_API_KEY')
  const client = new Retell({ apiKey: RETELL_API_KEY })
  const payload: any = { to_number: customerNumber }
  if (fromNumber) payload.from_number = fromNumber
  if (agentId) payload.agent_id = agentId
  if (metadata) payload.metadata = metadata
  try {
    const resp = await client.call.createPhoneCall(payload)
    return resp as RetellCall
  } catch (e: any) {
    const status = e?.status || e?.response?.status
    const data = e?.data || e?.response?.data || e?.message
    if (status === 404 && agentId) {
      const fallbackPayload: any = { ...payload }
      delete fallbackPayload.agent_id
      const resp = await client.call.createPhoneCall(fallbackPayload)
      return resp as RetellCall
    }
    throw new Error(`${status || ''} ${data || 'Retell error'}`.trim())
  }
}

export async function getRetellCall(callId: string): Promise<RetellCall> {
  if (!RETELL_API_KEY) throw new Error('Missing RETELL_API_KEY')
  const client = new Retell({ apiKey: RETELL_API_KEY })
  try {
    const resp = (await (client as any).call.retrieve(callId)) as RetellCall
    return resp
  } catch (e: any) {
    try {
      const resp = (await (client as any).call.retrieve(callId)) as RetellCall
      return resp
    } catch (e2: any) {
      // HTTP fallbacks
      const headers = {
        Authorization: `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      }
      const res = await fetch(
        `https://api.retellai.com/v2/call/${encodeURIComponent(callId)}`,
        { method: 'GET', headers },
      )
      if (res.ok) {
        const json = (await res.json()) as RetellCall
        return json
      }
      const text = await res.text()
      throw new Error(`Retell get-call error (${res.status}): ${text}`)
    }
  }
}

export async function listRetellCalls(): Promise<RetellCall[]> {
  if (!RETELL_API_KEY) throw new Error('Missing RETELL_API_KEY')
  const client = new Retell({ apiKey: RETELL_API_KEY })
  try {
    const resp = await (client as any).call.list()
    const items = Array.isArray(resp?.data || resp?.items)
      ? resp.data || resp.items
      : Array.isArray(resp)
        ? resp
        : []
    return items as RetellCall[]
  } catch (e: any) {
    const headers = {
      Authorization: `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
    }
    const res = await fetch('https://api.retellai.com/v2/calls', {
      method: 'GET',
      headers,
    })
    if (res.ok) {
      const json = await res.json()
      const items = Array.isArray(json?.data || json?.items)
        ? json.data || json.items
        : Array.isArray(json)
          ? json
          : []
      return items as RetellCall[]
    }
    const text = await res.text()
    throw new Error(`Retell list-calls error (${res.status}): ${text}`)
  }
}
