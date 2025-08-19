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
}

export async function startRetellOutboundCall({
  customerNumber,
  fromNumber,
  agentId,
}: StartRetellCallArgs) {
  if (!RETELL_API_KEY) throw new Error('Missing RETELL_API_KEY')
  const client = new Retell({ apiKey: RETELL_API_KEY })
  const payload: any = { to_number: customerNumber }
  if (fromNumber) payload.from_number = fromNumber
  if (agentId) payload.agent_id = agentId
  try {
    const resp = await client.call.createPhoneCall(payload)
    return resp as any
  } catch (e: any) {
    const status = e?.status || e?.response?.status
    const data = e?.data || e?.response?.data || e?.message
    if (status === 404 && agentId) {
      const fallbackPayload: any = { ...payload }
      delete fallbackPayload.agent_id
      const resp = await client.call.createPhoneCall(fallbackPayload)
      return resp as any
    }
    throw new Error(`${status || ''} ${data || 'Retell error'}`.trim())
  }
}

export async function getRetellCall(callId: string) {
  if (!RETELL_API_KEY) throw new Error('Missing RETELL_API_KEY')
  const client = new Retell({ apiKey: RETELL_API_KEY })
  try {
    const resp = await (client as any).call.retrieve(callId)
    return resp
  } catch (e: any) {
    try {
      const resp = await (client as any).call.retrieve(callId)
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
        return await res.json()
      }
      const text = await res.text()
      throw new Error(`Retell get-call error (${res.status}): ${text}`)
      const status = e2?.status || e2?.response?.status
      const data = e2?.data || e2?.response?.data || e2?.message
      throw new Error(`${status || ''} ${data || 'Retell error'}`.trim())
    }
  }
}
