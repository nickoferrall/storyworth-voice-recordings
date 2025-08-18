import { extendType } from 'nexus'
import getKysely from '../../src/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: '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',
})

export const UpdateDirectoryCompStates = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.list.field('updateDirectoryCompStates', {
      type: 'DirectoryComp',
      resolve: async (_parent, _, ctx) => {
        const pg = getKysely()
        const updatedComps = []

        // Get all directory comps
        const comps = await pg
          .selectFrom('DirectoryComp')
          .select(['id', 'location', 'country'])
          .execute()

        for (const comp of comps) {
          console.log(`Processing: ${comp.location}, ${comp.country}`)

          const prompt = `Given the city "${comp.location}" in "${comp.country}", what is the state, province, or region? 
            For UK cities, use the constituent country (England, Scotland, Wales, Northern Ireland) or Greater London for London.
            For US cities, use the state name (e.g., "California" not "CA").
            Return ONLY the state/province/region name, nothing else.
            If you're not confident, return null.`

          try {
            const response = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1, // Lower temperature for more consistent results
            })

            let state: string = response.choices[0].message?.content?.trim() || ''

            console.log('🚀 ~ state:', state)
            // Handle "null" responses or empty responses
            if (state.toLowerCase() === 'null' || !state) {
              state = ''
            }

            console.log(`${comp.location}: ${state}`)

            // Update the database
            const updated = await pg
              .updateTable('DirectoryComp')
              .set({ state })
              .where('id', '=', comp.id)
              .returningAll()
              .executeTakeFirst()

            if (updated) {
              updatedComps.push(updated)
            }
            console.log('🚀 ~ updated:', updated)

            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 500))
          } catch (error) {
            console.error(`Error processing ${comp.location}:`, error)
            continue
          }
        }

        return updatedComps
      },
    })
  },
})
