import { v2 as cloudinary } from 'cloudinary'
import { extendType, stringArg, nonNull } from 'nexus'
import getKysely from '../../src/db'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const UploadOrgImage = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('uploadOrgImage', {
      type: 'Org',
      args: {
        orgId: nonNull(stringArg()),
        image: nonNull(stringArg()),
      },
      resolve: async (_parent, { orgId, image }, ctx) => {
        // TODO: Remove this mutation after migration
        // Use uploadCompetitionLogo instead for competition-specific images
        throw new Error('This mutation is deprecated. Use uploadCompetitionLogo instead.')
      },
    })
  },
})
