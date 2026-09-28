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
const USER_REFRESH_PREFIX = "refresh:user:";

export async function storeRefreshToken(
  token: string,
  userId: string,
  expiresInSec: number
): Promise<void> {
  const redis = getRedisClient();
  const pipeline = redis.pipeline();
  pipeline.setex(
    `${REFRESH_PREFIX}${token}`,
    expiresInSec,
    JSON.stringify({ userId })
  );
  pipeline.sadd(`${USER_REFRESH_PREFIX}${userId}`, token);
  pipeline.expire(`${USER_REFRESH_PREFIX}${userId}`, expiresInSec);
  await pipeline.exec();
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
  const raw = await redis.get(`${REFRESH_PREFIX}${token}`);
  const pipeline = redis.pipeline();
  pipeline.del(`${REFRESH_PREFIX}${token}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { userId: string };
      if (parsed.userId) {
        pipeline.srem(`${USER_REFRESH_PREFIX}${parsed.userId}`, token);
      }
    } catch {
    }
  }
  await pipeline.exec();
}

export async function deleteAllRefreshTokensForUser(
  userId: string
): Promise<void> {
  const redis = getRedisClient();
  const userKey = `${USER_REFRESH_PREFIX}${userId}`;
  const tokens = await redis.smembers(userKey);
  if (tokens.length > 0) {
    const pipeline = redis.pipeline();
    for (const t of tokens) {
      pipeline.del(`${REFRESH_PREFIX}${t}`);
    }
    pipeline.del(userKey);
    await pipeline.exec();
    return;
  }
  const keys = await redis.keys(`${REFRESH_PREFIX}*`);
  const tokenKeys = keys.filter((k) => !k.startsWith(USER_REFRESH_PREFIX));
  if (tokenKeys.length === 0) return;
  const pipeline = redis.pipeline();
  for (const key of tokenKeys) {
    const value = await redis.get(key);
    if (value) {
      try {
        const parsed = JSON.parse(value) as { userId: string };
        if (parsed.userId === userId) {
          pipeline.del(key);
        }
      } catch {
      }
    }
  }
  await pipeline.exec();
}

// ── Generic JSON cache (cache-aside) ─────────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await getRedisClient().get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSec: number
): Promise<void> {
  try {
    await getRedisClient().setex(key, ttlSec, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis setCache failed (${key}):`, err);
  }
}

export async function delCache(key: string): Promise<void> {
  try {
    await getRedisClient().del(key);
  } catch (err) {
    console.error(`Redis delCache failed (${key}):`, err);
  }
}
