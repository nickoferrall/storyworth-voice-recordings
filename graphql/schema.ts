import { connectionPlugin, extendType, makeSchema, objectType } from 'nexus'
import { join } from 'path'

import * as types from './types'
import { DuplicateTicketType } from './mutations/duplicateTicketType'

export const schema = makeSchema({
  types: [...Object.values(types), DuplicateTicketType],
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(process.cwd(), 'src', 'generated', 'nexus-typegen.ts'),
    schema: join(process.cwd(), 'graphql', 'schema.graphql'),
  },
  contextType: {
    export: 'Context',
    module: join(process.cwd(), 'graphql', 'context.ts'),
  },
})
