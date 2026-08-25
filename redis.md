# Redis Implementation Guide - CVCoach (Koro AI)

## Priority Order

| Priority | Feature | Est. Impact |
|----------|---------|-------------|
| 1 | AI Response Caching | 50-70% AI call save |
| 2 | Rate Limiting (Redis-backed) | Security + reliability |
| 3 | Session/Token Store | Security + multi-device |
| 4 | Credit System Cache | Fast + atomic operations |
| 5 | Admin Metrics Cache | Dashboard speed |
| 6 | ATS Score Cache | Repeated analysis save |
| 7 | Scoring Cache | Unlimited ATS speed |
| 8 | Visitor Counter | Real-time accuracy |
| 9 | Resume Content Cache | Builder speed |
| 10 | JD Parse Cache | Minor optimization |

---

## 1 (Done). Session Store (JWT Token Management) - HIGH PRIORITY

- **Files:** `backend/src/shared/config/jwt.ts`, `backend/src/shared/middlewares/auth.ts`
- **Keno:** Ekhon refresh token database e save hoyna, cookie te thake. Redis e store korle:
  - Token blacklist kora jabe (logout e)
  - Session invalidation kora jabe admin diye
  - Multi-device login track kora jabe
  - Token expiry automatic cleanup hobe

---

## 2. Rate Limiting - HIGH PRIORITY

- **Files:** `backend/src/shared/middlewares/middlewareConfig.ts` (lines 49-81)
- **Keno:** Ekhon in-memory rate limiting, server restart e sob reset hoy. Redis diye:
  - Distributed rate limiting (multiple server instance e kaj korbe)
  - Persistent counting (server restart e o thakbe)
  - More accurate user tracking

---

## 3. AI Response Caching - HIGH PRIORITY

- **Files:** `backend/src/shared/ai/gemini/pdfResumeResearch.ts`, `backend/src/shared/ai/gemini/jobDescriptionResearch.ts`
- **Keno:** Gemini AI call expensive + slow. Same resume/JD repeat scan hole:
  - Cache result koro Redis e (TTL 1 hour rakhlo)
  - 50-70% AI calls save kora jabe
  - User experience fast hobe
  - Credit save hobe user er

---

## 4. Credit System Cache - MEDIUM PRIORITY

- **Files:** `backend/src/shared/utils/credits.ts`, user subscription JSON
- **Keno:** Daily credit reset + current credit count Redis e cache korle:
  - Fast credit check (DB query lagbe na)
  - Atomic increment operation (race condition solve)
  - Real-time credit usage tracking

---

## 5. ATS Score Cache - MEDIUM PRIORITY

- **Files:** `backend/src/modules/ats-score-check/services/history.service.ts`
- **Keno:** Same resume + same JD = same score. Cache korle:
  - Repeated analysis skip kora jabe
  - History page fast load hobe
  - Database load kombe

---

## 6. Scoring Engine Cache - MEDIUM PRIORITY

- **Files:** `backend/src/shared/scoring/index.ts` (287 lines)
- **Keno:** Dictionary-based scoring e same input = same output:
  - Resume text + JD text hash diye cache key banao
  - Deterministic results ta cache koro
  - Unlimited ATS check e beshi benefit

---

## 7. Admin Dashboard Metrics - MEDIUM PRIORITY

- **Files:** `backend/src/modules/admin-dashboard/admin-dashboard.service.ts` (333 lines)
- **Keno:** Metrics + growth data expensive query. Redis e:
  - Cache koro 30 second TTL diye
  - Real-time polling (10s interval) e fast response
  - Database load significantly kombe

---

## 8. Visitor Count Cache - LOW PRIORITY

- **Files:** `backend/src/modules/visitor/visitor.service.ts`
- **Keno:** Visitor count every page load e query hoy. Redis e:
  - Counter maintain koro
  - Atomic increment diye real-time tracking
  - Database write batching kora jabe

---

## 9. Resume Content Cache - LOW PRIORITY

- **Files:** `backend/src/modules/resume-builder/subservices/resumes.service.ts`
- **Keno:** Resume builder e autosave 10s interval e hoy:
  - Recent resume content cache koro
  - Dashboard page e fast load
  - Frequent DB read kombe

---

## 10. Job Description Parse Cache - LOW PRIORITY

- **Files:** `backend/src/modules/unlimited-ats-check/parsers/jdParser.ts`
- **Keno:** Dictionary-based parsing deterministic:
  - Same JD text = same parsed result
  - Cache koro with content hash
  - Repeated parse skip hobe

---

## Quick Implementation

```bash
# Redis client install
npm install redis

# Backend e add koro:
# backend/src/lib/redis.ts - Redis client setup
# backend/src/shared/middlewares/rateLimiter.ts - Redis-backed rate limiting
# backend/src/shared/ai/gemini/cacheService.ts - AI response caching
```
