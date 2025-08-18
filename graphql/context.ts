import { NextApiRequest, NextApiResponse } from 'next'
import { createDataLoaders } from '../lib/dataloaders'
import { getUser } from '../lib/userInRedis'
import { UserProfile } from '../src/generated/database'
import { Selectable } from 'kysely'

export type Context = {
  user: Selectable<UserProfile> | null
  req: NextApiRequest
  res: NextApiResponse
  loaders: ReturnType<typeof createDataLoaders>
  resolvedUrl: string
  query: { [key: string]: string | string[] }
}

export async function createContext({
  req,
  res,
}: {
  req: NextApiRequest
  res: NextApiResponse
}): Promise<Context> {
  const context = { req, res } as Context
  const user = await getUser(context)

  const loaders = createDataLoaders(context)
  context.loaders = loaders

  return {
    user,
    req,
    res,
    loaders,
    resolvedUrl: req.url || '',
    query: req.query,
  } as any
}
