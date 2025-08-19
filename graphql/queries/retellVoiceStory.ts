import { extendType, nonNull, stringArg, list, objectType } from 'nexus'
import { getRetellCall, listRetellCalls } from '../../lib/retell'

export const RetellVoiceStoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('retellVoiceStory', {
      type: 'VoiceStory',
      args: { id: nonNull(stringArg()) },
      resolve: async (_src, { id }) => {
        console.log('🚀 ~ id______:', id)
        const c: any = await getRetellCall(id)
        console.log('🚀 ~ c<><><>>:', c)
        return {
          id,
          phoneE164: null,
          status: c?.call_status || c?.status || null,
          audioUrl: c?.recording_url || c?.signed_recording_url || c?.audio_url || null,
          transcript:
            c?.transcript ||
            c?.summary ||
            (Array.isArray(c?.transcript_object)
              ? c.transcript_object
                  .map((t: any) => t?.content)
                  .filter(Boolean)
                  .join('\n')
              : null),
          createdAt: c?.start_timestamp ? new Date(c.start_timestamp) : null,
          updatedAt: c?.end_timestamp ? new Date(c.end_timestamp) : null,
        }
      },
    })
    t.field('retellCalls', {
      type: list('VoiceStory'),
      resolve: async () => {
        const resp: any = await listRetellCalls()
        const items = Array.isArray(resp?.data || resp?.items)
          ? resp.data || resp.items
          : resp
        return (items || []).map((c: any) => ({
          id: c?.call_id || c?.id,
          phoneE164: c?.to_number || null,
          status: c?.call_status || c?.status || null,
          audioUrl: c?.recording_url || c?.signed_recording_url || c?.audio_url || null,
          transcript: c?.transcript || c?.summary || null,
          createdAt: c?.start_timestamp ? new Date(c.start_timestamp) : null,
          updatedAt: c?.end_timestamp ? new Date(c.end_timestamp) : null,
        }))
      },
    })
  },
})
