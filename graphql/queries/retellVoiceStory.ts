import { extendType, nonNull, stringArg } from 'nexus'
import { getRetellCall } from '../../lib/retell'

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
          createdAt: null,
          updatedAt: null,
        }
      },
    })
  },
})
