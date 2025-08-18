import { connectionPlugin, makeSchema } from 'nexus'
import { join } from 'path'

import * as types from './types'

export const schema = makeSchema({
  types: [...Object.values(types)],
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
