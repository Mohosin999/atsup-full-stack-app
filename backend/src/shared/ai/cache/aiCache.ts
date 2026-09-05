import crypto from "crypto";
import { getRedisClient } from "../../../lib/redis";
import { env } from "../../config/env";

const DEFAULT_TTL = env.aiCacheTtl || 7 * 24 * 60 * 60; // 7 days

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function normalizeJD(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[•\-–—]/g, " ")
    .replace(/\s*([.,;:!?])\s*/g, "$1 ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashJD(text: string): string {
  return crypto.createHash("sha256").update(normalizeJD(text)).digest("hex");
}

export function buildResumeKey(hash: string): string {
  return `ai:resume:${env.promptVersion}:${hash}`;
}

export function buildJDKey(hash: string): string {
  return `ai:jd:${env.promptVersion}:${hash}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const val = await redis.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch (err) {
    console.warn(`[cache] get failed for ${key}`, err);
    return null;
  }
}

export async function setCache(key: string, value: any, ttlSec = DEFAULT_TTL): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.setex(key, ttlSec, JSON.stringify(value));
  } catch (err) {
    console.warn(`[cache] set failed for ${key}`, err);
  }
}
