import { NextApiRequest, NextApiResponse } from 'next'

export type Context = {
  user: null
  req: NextApiRequest
  res: NextApiResponse
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
  return {
    user: null,
    req,
    res,
    resolvedUrl: req.url || '',
    query: req.query,
  } as any
}
