import { extendType, nonNull, stringArg } from 'nexus'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export const StartVoiceStoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('startVoiceStory', {
      type: 'VoiceStory',
      args: { phone: nonNull(stringArg()) },
      resolve: async (_src, { phone }) => {
        const { data, error } = await (supabaseAdmin as any)
          .from('voice_story')
          .insert({ phone_e164: phone, status: 'created' })
          .select('*')
          .single()
        if (error) throw new Error(error.message)
        return {
          id: data.id,
          phoneE164: data.phone_e164,
          status: data.status,
          audioUrl: data.audio_url,
          transcript: data.transcript,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }
      },
    })
  },
})
