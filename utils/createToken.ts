import { nanoid } from 'nanoid'
import crypto from 'crypto'

const generateToken = (email: string) => {
  const salt = nanoid()
  const hash = crypto
    .createHash('sha256')
    .update(email + salt)
    .digest('hex')
  return hash
}

export default generateToken
