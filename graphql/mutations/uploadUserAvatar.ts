import { v2 as cloudinary } from 'cloudinary'
import { extendType, stringArg, nonNull } from 'nexus'
import { createClient } from '@supabase/supabase-js'
import getKysely from '../../src/db'
import { storeUser } from '../../lib/userInRedis'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)

export const UploadUserAvatar = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('uploadUserAvatar', {
      type: 'User',
      args: {
        image: nonNull(stringArg()),
      },
      resolve: async (_parent, { image }, ctx) => {
        if (!ctx.user) {
          throw new Error('Not authenticated')
        }

        const userId = ctx.user.id

        try {
          const publicId = `user_avatars/${userId}_${Date.now()}`

          const uploadResponse = await cloudinary.uploader.upload(image, {
            public_id: publicId,
          })

          const imageUrl = uploadResponse.secure_url
          console.log('🚀 ~ imageUrl:', imageUrl)

          // Get current user metadata
          const {
            data: { user: currentUser },
          } = await supabase.auth.admin.getUserById(userId)
          const currentMetadata = currentUser?.user_metadata || {}

          // Update UserProfile table in database
          const pg = getKysely()
          const updatedUser = await pg
            .updateTable('UserProfile')
            .set({
              picture: imageUrl,
              updatedAt: new Date(),
            })
            .where('id', '=', userId)
            .returningAll()
            .executeTakeFirstOrThrow()

          // Update Supabase metadata as well for consistency
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...currentMetadata,
              picture: imageUrl,
            },
          })

          // Update the Redis session with the new image
          await storeUser(updatedUser, ctx)

          // Return the updated user data
          return updatedUser
        } catch (error: any) {
          console.error('Error uploading to Cloudinary or updating in DB:', error)
          throw new Error('Failed to upload and update avatar')
        }
      },
    })
  },
})
