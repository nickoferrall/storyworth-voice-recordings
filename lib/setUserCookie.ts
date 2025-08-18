import { serialize } from 'cookie'

export const setUserCookie = (userId: string, res: any) => {
  res.setHeader(
    'Set-Cookie',
    serialize('userId', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    }),
  )
}
