import { extendType, nonNull, stringArg, list } from 'nexus'
import { getRetellCall, listRetellCalls, RetellCall } from '../../lib/retell'

export const RetellVoiceStoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('retellVoiceStory', {
      type: 'VoiceStory',
      args: { id: nonNull(stringArg()) },
      resolve: async (_src, { id }) => {
        const c: RetellCall = await getRetellCall(id)
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
        const items: RetellCall[] = await listRetellCalls()
        return (items || []).map((c) => ({
          id: c.call_id || c.id!,
          phoneE164: c.to_number || null,
          status: c.call_status || c.status || null,
          audioUrl: c.recording_url || c.signed_recording_url || c.audio_url || null,
          transcript: c.transcript || null,
          createdAt: c.start_timestamp ? new Date(c.start_timestamp) : null,
          updatedAt: c.end_timestamp ? new Date(c.end_timestamp) : null,
        }))
      },
    })
  },
})
