# AI Caching Design — CVCoach (Resume + JD) - A to Z

> Goal: Same PDF / same JD bar bar Gemini te na pathiye Redis theke instant return. 50-70% AI call, cost, latency save + concurrent user e TPM quota bachbe.

---

## 1. Core Idea

- **PDF** = binary file → `SHA256(fileBuffer)` → hash same hole content 100% same.
- **JD** = text → normalize kore `SHA256(normalizedText)` → space/case/punctuation diff e o same dhora porbe.
- **Cache Key** e `PROMPT_VERSION` add → prompt/schema change hole purono cache auto stale hobe na.
- Redis e TTL diye store, hit hole AI call skip.

---

## 2. Cache Key Format

```ts
PROMPT_VERSION = "v1" // .env e thakbe, prompt update hole v2

resumeKey = `ai:resume:${PROMPT_VERSION}:${resumeHash}`
jdKey     = `ai:jd:${PROMPT_VERSION}:${jdHash}`
atsKey    = `ai:ats:${PROMPT_VERSION}:${resumeHash}:${jdHash}` // optional scoring cache
```

- `resumeHash` = `SHA256(fileBuffer)` hex (64 char)
- `jdHash` = `SHA256(normalizeJD(jdText))`

---

## 3. Normalize Logic

### PDF
- Kono normalize na, direct `fileBuffer` hash. 1 bit change = hash change.
- Note: PDF metadata (created date, producer) change hole hash miss hobe, fresh AI call jabe — eta bug na, expected (Claude point 1).

### JD
```ts
function normalizeJD(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")           // multiple space/newline -> single space
    .replace(/[•\-–—]/g, " ")       // bullet/dash normalize
    .replace(/\s*([.,;:!?])\s*/g, "$1 ") // punctuation spacing
    .replace(/\s+/g, " ")
    .trim();
}
```
- Claude point 2 cover: `"5+ years"` vs `"5 + years"` same hobe.

---

## 4. File Structure — Ki Create / Ki Modify

| Action | File Path | Kaj |
|--------|-----------|-----|
| **CREATE** | `backend/src/shared/ai/cache/aiCache.ts` | Hash + get/set + TTL handle |
| **MODIFY** | `backend/src/shared/ai/gemini/pdfResumeResearch.ts` | Cache check before/after AI |
| **MODIFY** | `backend/src/shared/ai/gemini/jobDescriptionResearch.ts` | Same |
| **MODIFY** | `backend/src/modules/ats-score-check/services/resumeParser.service.ts` | fileBuffer hash pass |
| **MODIFY** | `backend/src/modules/ats-score-check/services/jobDescription.service.ts` | JD hash pass |
| **MODIFY** | `backend/src/shared/config/env.ts` | PROMPT_VERSION, TTL add |
| **MODIFY** | `backend/src/modules/ats-score-check/atsScoreCheck.controller.ts` | Cache hit hole credit kata skip (optional) |
| **REUSE** | `backend/src/lib/redis.ts` | Existing `getRedisClient()` |

> Kono DB migration lagbe na. Redis already connected.

---

## 5. Code — `aiCache.ts` (Notun File)

```ts
// backend/src/shared/ai/cache/aiCache.ts
import crypto from "crypto";
import { getRedisClient } from "../../../lib/redis";
import { env } from "../../config/env";

export const PROMPT_VERSION = process.env.PROMPT_VERSION || "v1";
const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

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
  return `ai:resume:${PROMPT_VERSION}:${hash}`;
}

export function buildJDKey(hash: string): string {
  return `ai:jd:${PROMPT_VERSION}:${hash}`;
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const val = await redis.get(key);
    if (!val) return null;
    return JSON.parse(val) as T;
  } catch (err) {
    console.warn(`[cache] get failed for ${key}`, err);
    return null; // fail-open: Redis down hole AI call jabe
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
```

---

## 6. Code — `pdfResumeResearch.ts` Modify

```ts
// backend/src/shared/ai/gemini/pdfResumeResearch.ts
import { hashBuffer, buildResumeKey, getCache, setCache } from "../cache/aiCache";
import { genAI, GEMINI_MODEL } from "../../config/gemini";
import { throwIfQuotaError } from "./geminiErrors";

// signature update: fileBuffer add
export const researchResume = async (
  resumeText: string, // fallback only
  fileBase64?: string,
  mimeType?: string,
  fileBuffer?: Buffer, // <-- new for hashing
): Promise<AIResumeResearchResult> => {
  // 1. Cache check (PDF thakle)
  if (fileBuffer && fileBase64 && mimeType) {
    const hash = hashBuffer(fileBuffer);
    const key = buildResumeKey(hash);
    const cached = await getCache<AIResumeResearchResult>(key);
    if (cached) {
      console.log(`[cache] resume hit ${key}`);
      return cached;
    }
  }

  const parts: any[] = [];
  if (fileBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: fileBase64 } });
    parts.push({ text: RESEARCH_PROMPT }); // parsed.text skip -> ~900 token save
  } else {
    const textPart = `${RESEARCH_PROMPT}\n\nFULL RESUME CONTENT:\n${resumeText}\n\nResearch this resume thoroughly and return ONLY the valid JSON structure specified above.\n`;
    parts.push({ text: textPart });
  }

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format from AI");
    const raw = JSON.parse(jsonMatch[0]);
    const normalized = normalizeResearchResult(raw);

    // 2. Cache set
    if (fileBuffer) {
      const hash = hashBuffer(fileBuffer);
      const key = buildResumeKey(hash);
      await setCache(key, normalized);
    }
    return normalized;
  } catch (error) {
    console.error("Resume research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research resume");
  }
};
```

---

## 7. Code — `jobDescriptionResearch.ts` Modify

```ts
// backend/src/shared/ai/gemini/jobDescriptionResearch.ts
import { hashJD, buildJDKey, getCache, setCache } from "../cache/aiCache";

export const researchJobDescription = async (jdText: string): Promise<AIJobResearchResult> => {
  const hash = hashJD(jdText);
  const key = buildJDKey(hash);
  const cached = await getCache<AIJobResearchResult>(key);
  if (cached) {
    console.log(`[cache] jd hit ${key}`);
    return cached;
  }

  const textPart = `${JD_RESEARCH_PROMPT}\n\nFULL JOB DESCRIPTION:\n${jdText}\n\nResearch this job description thoroughly and return ONLY the valid JSON structure specified above.\n`;

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: textPart }] }],
    });
    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid response format from AI");
    const raw = JSON.parse(jsonMatch[0]);
    const normalized = normalizeJDResearchResult(raw);
    await setCache(key, normalized);
    return normalized;
  } catch (error) {
    console.error("Job description research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research job description");
  }
};
```

---

## 8. Code — `resumeParser.service.ts` Modify

```ts
// backend/src/modules/ats-score-check/services/resumeParser.service.ts
import fs from "fs";
import { parseResumeFile } from "../../../shared/resume-parser";
import { researchResume } from "../../../shared/ai/gemini/pdfResumeResearch";

export const parseResume = async (filePath: string, originalName: string, mimetype: string) => {
  const parsed = await parseResumeFile(filePath, mimetype);
  const fileBuffer = fs.readFileSync(filePath);
  const fileBase64 = fileBuffer.toString("base64");

  let aiResearch = null;
  try {
    aiResearch = await researchResume(parsed.text, fileBase64, mimetype, fileBuffer);
  } catch (aiError: any) {
    console.error("AI research failed, falling back to parsed data:", aiError);
  }
  return { resumeName: originalName, aiResearch };
};
```

---

## 9. Code — `jobDescription.service.ts` Modify

```ts
// backend/src/modules/ats-score-check/services/jobDescription.service.ts
import { researchJobDescription } from "../../../shared/ai/gemini/jobDescriptionResearch";

export const parseJobDescription = async (description: string) => {
  return researchJobDescription(description.trim());
};
// normalize/hash logic aiCache.ts e, ekhane change lagbe na — researchJobDescription e handle hobe
```

---

## 10. Code — `env.ts` Add

```ts
// backend/src/shared/config/env.ts
export const env = {
  // ... existing
  promptVersion: process.env.PROMPT_VERSION || "v1",
  aiCacheTtl: getEnvNumber("AI_CACHE_TTL", 7 * 24 * 60 * 60),
};
```

`.env` e add:
```
PROMPT_VERSION=v1
AI_CACHE_TTL=604800
REDIS_URL=redis://localhost:6379
```

---

## 11. Optional — Credit Handling (Controller)

`backend/src/modules/ats-score-check/atsScoreCheck.controller.ts:178` e:

- `researchResume` / `researchJobDescription` theke `cached: boolean` return korle, `analyzeAtsScore` e cache hit hole credit deduct skip korte paro.
- Simple: `createAtsScoreHistory` er age check, na hole sob somoy 1 credit kata thakbe (safe default).

---

## 12. TTL & Invalidation

- Resume/JD: 7 days (604800 sec) — same file repeat user ra benefit pabe.
- ATS score: 24h (optional).
- Prompt change → `.env` e `PROMPT_VERSION=v2` → purono key auto miss, notun key create.
- Manual clear: `redis-cli DEL ai:resume:v1:*` ba `FLUSHDB` (dev only).

---

## 13. Failure & Concurrency

- Redis down → `getCache` null return, direct AI call (fail-open, user block na).
- Thundering herd → first request AI call, baki same hash er request queue e wait korbe na, but TTL set howar por hit pabe. Advanced: `SETNX` lock use korte paro (future).
- Token save: resume ~900 token, JD ~400 token per hit save → TPM limit e 2x concurrent user.

---

## 14. Testing Checklist

1. Same PDF 2 bar upload → 2nd bar log e `[cache] resume hit` asbe, AI call jabe na.
2. Same PDF re-export (metadata change) → hash change → cache miss → AI call (expected).
3. JD `"React, Node.js"` vs `"react  node.js "` → same hash → cache hit.
4. `PROMPT_VERSION=v2` kore same PDF → cache miss → new entry.
5. Redis stop kore upload → AI call success (no crash).

---

## 15. Summary Flow

```
[Upload PDF] -> hashBuffer -> get ai:resume:v1:hash -> hit? return : AI(PDF only) -> set cache -> return
[Send JD]    -> hashJD    -> get ai:jd:v1:hash     -> hit? return : AI -> set cache -> return
[Analyze]    -> ai:ats:v1:resumeHash:jdHash (optional) -> hit? skip scoring : scoring
```

> Ekhon sudhu md file e plan + code, actual code e hat dewa hoy nai. Confirm korle `aiCache.ts` create + 4 file edit kore implement kore dibo.
