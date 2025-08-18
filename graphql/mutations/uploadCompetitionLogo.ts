import { v2 as cloudinary } from 'cloudinary'
import { extendType, stringArg, nonNull } from 'nexus'
import getKysely from '../../src/db'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const UploadCompetitionLogo = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('uploadCompetitionLogo', {
      type: 'Competition',
      args: {
        competitionId: nonNull(stringArg()),
        image: nonNull(stringArg()),
      },
      resolve: async (_parent, { competitionId, image }, ctx) => {
        try {
          const publicId = `competition_logos/${competitionId}_${Date.now()}`

          const uploadResponse = await cloudinary.uploader.upload(image, {
            public_id: publicId,
          })

          const imageUrl = uploadResponse.secure_url
          const pg = getKysely()

          const updatedCompetition = await pg
            .updateTable('Competition')
            .set({ logo: imageUrl })
            .where('id', '=', competitionId)
            .returningAll()
            .executeTakeFirstOrThrow()

          return updatedCompetition
        } catch (error: any) {
          console.error('Error uploading to Cloudinary or updating in DB:', error)
          throw new Error('Failed to upload and update competition logo')
        }
      },
    })
  },
})
