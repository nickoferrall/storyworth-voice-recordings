import getRedis from '../utils/getRedis'

export const clearDirectoryCompsCache = async () => {
  const redis = getRedis()
  await redis.del('directory_comps')
}
