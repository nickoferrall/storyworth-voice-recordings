import Redis, { RedisOptions } from 'ioredis'

let redis: Redis

const getRedis = () => {
  if (!redis) {
    const isProd = process.env.NODE_ENV === 'production'
    const redisOptions: RedisOptions = isProd
      ? {
          port: Number(process.env.UPSTASH_PORT),
          host: process.env.UPSTASH_HOST,
          password: process.env.UPSTASH_PASSWORD,
          tls: {
            rejectUnauthorized: false,
          },
        }
      : {
          port: 6379,
          host: '127.0.0.1',
        }

    redis = new Redis(redisOptions)

    redis.on('error', (error) => {
      console.error('Redis Error:', error)
    })
  }

  return redis
}

export default getRedis
