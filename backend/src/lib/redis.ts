import Redis from "ioredis";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL!, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    redis.on("connect", () => {
      console.log("Connected to Redis");
    });
  }

  return redis;
}

const REFRESH_PREFIX = "refresh:";

export async function storeRefreshToken(
  token: string,
  userId: string,
  expiresInSec: number
): Promise<void> {
  const redis = getRedisClient();
  await redis.setex(
    `${REFRESH_PREFIX}${token}`,
    expiresInSec,
    JSON.stringify({ userId })
  );
}

export async function getRefreshToken(
  token: string
): Promise<{ userId: string } | null> {
  const redis = getRedisClient();
  const result = await redis.get(`${REFRESH_PREFIX}${token}`);
  if (!result) return null;
  try {
    return JSON.parse(result) as { userId: string };
  } catch {
    return null;
  }
}

export async function deleteRefreshToken(token: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(`${REFRESH_PREFIX}${token}`);
}

export async function deleteAllRefreshTokensForUser(
  userId: string
): Promise<void> {
  const redis = getRedisClient();
  const keys = await redis.keys(`${REFRESH_PREFIX}*`);
  if (keys.length === 0) return;

  const pipeline = redis.pipeline();
  for (const key of keys) {
    const value = await redis.get(key);
    if (value) {
      try {
        const parsed = JSON.parse(value) as { userId: string };
        if (parsed.userId === userId) {
          pipeline.del(key);
        }
      } catch {
        // skip invalid entries
      }
    }
  }
  await pipeline.exec();
}
