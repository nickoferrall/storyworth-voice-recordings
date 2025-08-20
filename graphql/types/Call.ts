import { objectType, extendType, list, nonNull } from 'nexus'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export const Call = objectType({
  name: 'Call',
  definition(t) {
    t.nonNull.string('id')
    t.string('retellCallId')
    t.string('phoneE164')
    t.string('status')
    t.string('audioUrl')
    t.string('transcript')
    t.field('startedAt', { type: 'DateTime' })
    t.field('endedAt', { type: 'DateTime' })
    t.field('createdAt', { type: 'DateTime' })
  },
})

export const CallQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('calls', {
      type: list('Call'),
      resolve: async (_src, _args, ctx: any) => {
        if (!ctx.anonUserId) return []
        const { data, error } = await (supabaseAdmin as any)
          .from('call_log')
          .select('*')
          .eq('anon_user_id', ctx.anonUserId)
          .order('started_at', { ascending: false })
        if (error) throw new Error(error.message)
        return (data || []).map((r: any) => ({
          id: r.id,
          retellCallId: r.retell_call_id,
          phoneE164: r.phone_e164,
          status: r.status,
          audioUrl: r.audio_url,
          transcript: r.transcript,
          startedAt: r.started_at,
          endedAt: r.ended_at,
          createdAt: r.created_at,
        }))
      },
    })
  },
})


