import { extendType, nonNull, inputObjectType } from 'nexus'
import { Gender } from '../types/Competition'
import MailgunManager from '../../lib/MailgunManager'
import getKysely from '../../src/db'
import { nanoid } from 'nanoid'

export const AddDirectoryCompCategoryInput = inputObjectType({
  name: 'AddDirectoryCompCategoryInput',
  definition(t) {
    t.nonNull.field('difficulty', { type: 'Difficulty' })
    t.nonNull.field('gender', { type: Gender })
    t.nonNull.int('teamSize')
    t.nonNull.boolean('isSoldOut')
  },
})

export const AddDirectoryCompInput = inputObjectType({
  name: 'AddDirectoryCompInput',
  definition(t) {
    t.nonNull.string('title')
    t.nonNull.string('organiserEmail')

    t.string('description')
    t.field('date', { type: 'DateTime' })
    t.field('endDate', { type: 'DateTime' })
    t.string('price')
    t.field('currency', { type: 'Currency' })
    t.string('location')
    t.string('country')
    t.string('eventType')
    t.string('format')
    t.list.nonNull.string('tags')
    t.string('websiteUrl')
    t.string('logo')
    t.list.nonNull.field('categories', { type: 'AddDirectoryCompCategoryInput' })
  },
})

export const AddDirectoryComp = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('addDirectoryComp', {
      type: 'Boolean',
      args: {
        input: nonNull(AddDirectoryCompInput),
      },
      resolve: async (_root, { input }, ctx) => {
        const mailgunManager = new MailgunManager()
        const pg = getKysely()

        const isSuperUser = ctx.user?.isSuperUser
        console.log('isSuperUser__', isSuperUser)

        if (isSuperUser) {
          const requiredFields = [
            'title',
            'date',
            'price',
            'currency',
            'location',
            'country',
            'eventType',
            'format',
            'categories',
            'organiserEmail',
          ]

          const missingFields = requiredFields.filter((field) => !input[field])
          if (missingFields.length > 0) {
            throw new Error(
              `Missing required fields for directory comp: ${missingFields.join(', ')}`,
            )
          }

          const directoryComp = await pg
            .insertInto('DirectoryComp')
            .values({
              id: nanoid(6),
              title: input.title,
              description: input.description!,
              startDate: new Date(input.date!),
              endDate: input.endDate ? new Date(input.endDate) : null,
              location: input.location!,
              country: input.country!,
              price: input.price!,
              currency: input.currency!,
              email: input.organiserEmail,
              website: input.websiteUrl || null,
              logo: input.logo || null,
            })
            .returning('id')
            .executeTakeFirst()
          console.log('🚀 ~ directoryComp:', directoryComp)

          if (directoryComp?.id && input.categories?.length) {
            await Promise.all(
              input.categories.map((category) =>
                pg
                  .insertInto('Category')
                  .values({
                    id: nanoid(12),
                    directoryCompId: directoryComp.id,
                    difficulty: category.difficulty,
                    gender: category.gender,
                    teamSize: category.teamSize,
                    isSoldOut: category.isSoldOut,
                  })
                  .execute(),
              ),
            )
          }
        }

        await mailgunManager.sendEmail({
          to: 'nickoferrall@gmail.com',
          subject: 'New Directory Competition Submission',
          html: `
            <h1>New Competition Submission</h1>
            <h2>${input.title}</h2>
            ${input.description ? `<p><strong>Description:</strong> ${input.description}</p>` : ''}
            ${input.date ? `<p><strong>Start Date:</strong> ${input.date}</p>` : ''}
            ${input.endDate ? `<p><strong>End Date:</strong> ${input.endDate}</p>` : ''}
            ${input.price ? `<p><strong>Price:</strong> ${input.price} ${input.currency}</p>` : ''}
            ${input.location ? `<p><strong>Location:</strong> ${input.location}${input.country ? `, ${input.country}` : ''}</p>` : ''}
            ${input.eventType ? `<p><strong>Event Type:</strong> ${input.eventType}</p>` : ''}
            ${input.format ? `<p><strong>Format:</strong> ${input.format}</p>` : ''}
            ${input.tags?.length ? `<p><strong>Tags:</strong> ${input.tags.join(', ')}</p>` : ''}
            <p><strong>Organiser Email:</strong> ${input.organiserEmail}</p>
            ${input.websiteUrl ? `<p><strong>Website:</strong> ${input.websiteUrl}</p>` : ''}
            ${
              input.categories?.length
                ? `
              <h3>Categories:</h3>
              <ul>
                ${input.categories
                  .map(
                    (cat) => `
                  <li>${cat.difficulty} ${cat.gender} ${cat.teamSize === 1 ? 'Individual' : `Team of ${cat.teamSize}`}</li>
                `,
                  )
                  .join('')}
              </ul>
            `
                : ''
            }
            ${input.logo ? `<p><strong>Logo URL:</strong> ${input.logo}</p>` : ''}
          `,
        })

        return true
      },
    })
  },
})
