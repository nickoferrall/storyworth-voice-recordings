import { extendType, nonNull, stringArg } from 'nexus'
import {
  startRetellOutboundCall,
  RETELL_AGENT_ID,
  RETELL_FROM_NUMBER,
} from '../../lib/retell'

export const StartVoiceStoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('startVoiceStory', {
      type: 'VoiceStory',
      args: { phone: nonNull(stringArg()) },
      resolve: async (_src, { phone }) => {
        if (!RETELL_AGENT_ID) {
          throw new Error('Missing RETELL_AGENT_ID')
        }
        let response: any
        try {
          response = await startRetellOutboundCall({
            customerNumber: phone,
            fromNumber: RETELL_FROM_NUMBER,
            agentId: RETELL_AGENT_ID,
          })
          console.log('🚀 ~ response__:', response)
        } catch (err: any) {
          console.error('[retell call error]', err?.message)
          throw new Error(err?.message || 'Retell call failed')
        }
        const retellId = response?.call_id || response?.id
        if (!retellId) {
          throw new Error('Missing retell call id')
        }
        return {
          id: String(retellId),
          phoneE164: phone,
          status: response?.call_status || response?.status || 'calling',
          audioUrl: null as any,
          transcript: null as any,
          createdAt: null as any,
          updatedAt: null as any,
        }
      },
    })
  },
})
