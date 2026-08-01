# AI Work — File Location List

Serial-by-serial list of files changed for the AI work (keyword extraction,
job-description parsing, ATS scoring, job-match soft skills, and the frontend
match feedback UI).

## Backend Services

| # | File | Description |
|---|------|-------------|
| 1 | `backend/src/services/analysis/skillDefinitions.ts` | **NEW** — Single source of truth for all matching lists: `SKILLS` (technical skills grouped by category), `SOFT_SKILLS`, `ACTION_VERBS`, `KEYWORDS` (6 domains). Uses tuple format `(string \| string[])[]` where `[canonical, ...aliases]` (e.g. `["javascript", "js"]`). Everything else imports from here. |
| 2 | `backend/src/services/analysis/keywordExtractor.ts` | **REWRITTEN** — The matching engine. Provides `SKILL_TAXONOMY` (compat re-export built from `SKILLS` + `SOFT_SKILLS`), `matchSkillList()` / `matchActionVerbs()` (alias-aware, e.g. `js` matches `javascript`, verb suffixes ed/ing/es/s allowed), `extractSkillsFromResume()`, plus counting helpers `getSkillVariants()`, `countVariantsInText()`, `countSkillInText()`, `countActionVerbInText()`. Strict alias boundary regex prevents `js` matching inside `react.js`. |
| 3 | `backend/src/services/jdParser/index.ts` | **NEW** — `parseJobDescriptionToStructured()` converts a raw job description into a `StructuredJD` (jobTitle, hardSkills, softSkills, keywords, actionVerbs, educationRequirement, experienceYearsRequired). Exports `extractHardSoftSkills()`, `extractKeywordsFromText()`, `extractKeywordsList()` (list-based keyword matching, removed the old frequent-word/bigram heuristic). |
| 4 | `backend/src/services/atsScoreEngine/index.ts` | **NEW** — Local (non-AI) ATS scoring engine. `calculateLocalMatchScore(resume, structuredJD, rawJD)` scores hardSkills 35%, keywords 20%, softSkills 10%, actionVerbs 10%, education 15%, experience 10%. Returns `LocalAtsResult` with overallScore, sectionScores, spellingGrammar, atsFriendliness, suggestions, and a structured `matchBreakdown` (per-category matched/missing items; presence-based — one resume mention = matched, JD frequency ignored). Empty categories score 0 with no items. |
| 5 | `backend/src/services/atsScore/index.ts` | Persists ATS analysis to the DB (`prisma.atsScore`). Now stores `matchBreakdown` inside the `sectionScores` JSON. |
| 6 | `backend/src/services/atsScoreHistory/index.ts` | `createAtsScoreHistory()` runs the engine with the job description + structured JD and persists the analysis to `prisma.atsScoreHistory` (used by the /analyze endpoint and the ATS page). Stores `matchBreakdown` in `sectionScores`. |
| 7 | `backend/src/services/analysis/analysisService.ts` | Job-match scoring: jobMatch breakdown is now **skillsMatch 40% / keywordsMatch 40% / softSkillsMatch 20%** (was 50/50). `calculateJobMatchScore()` now also receives `jobDescription`; computes `softSkillsMatch` by comparing resume soft skills against the JD's soft skills. `calculateWeightedJobMatchScore()` includes the new component. |
| 8 | `backend/src/services/resumeParser/index.ts` | Resume parsing now also extracts and fills `hardSkills`, `softSkills`, `keywords` on `ResumeContent` using the jdParser extractors. Skill fallback scan uses word-boundary regex. Exports `parseTextToResume()`. |

## Backend Controllers & Routes

| # | File | Description |
|---|------|-------------|
| 9 | `backend/src/controllers/jobs/parseJobDescription.ts` | **NEW** — Controller for `POST /jobs/parse`. Validates the description (min 20 chars) and returns `parseJobDescriptionToStructured()` output. |
| 10 | `backend/src/controllers/jobs/index.ts` | Re-exports the new `parseJobDescription` controller. |
| 11 | `backend/src/routes/jobs.ts` | Adds the authenticated `POST /parse` route for job-description parsing. |
| 12 | `backend/src/controllers/atsScoreHistory/index.ts` | `analyzeAtsScore` now accepts `structuredJD` from the request body and forwards it to `createAtsScoreHistory()` (previously only the raw text was sent). |
| 13 | `backend/src/controllers/analysis/generateAnalysis.ts` | AI analysis response now surfaces `softSkillsMatch` (score + details) inside the jobMatch breakdown. |

## Backend Types

| # | File | Description |
|---|------|-------------|
| 14 | `backend/src/types/index.ts` | `ResumeContent` gained `hardSkills?`, `softSkills?`, `keywords?` arrays and `contact.phone` (renamed from `whatsapp`). `ScoreBreakdown.jobMatch` gained `softSkillsMatch: ScoreComponent`. |

## Frontend

| # | File | Description |
|---|------|-------------|
| 15 | `frontend/src/components/JobMatchBreakdown.tsx` | **NEW** — "Job Description Match" feedback panel: overall match %, verdict banner, "what you did well" / "how to improve" cards, and per-category cards (Hard Skills, Soft Skills, Keywords) with progress bar, matched/total count, and green (matched) / red (missing) chips. Hides empty categories; Action Verbs removed from UI. |
| 16 | `frontend/src/pages/AtsScore.tsx` | Sends `structuredJD` to the analyze endpoint and renders `JobMatchBreakdown` when the result includes a `matchBreakdown`. |
| 17 | `frontend/src/types/index.ts` | New types `MatchStatus`, `MatchItemResult`, `MatchCategoryResult`; `AtsScoreHistory.sectionScores` now includes optional `matchBreakdown`. |
| 18 | `frontend/src/api/api.ts` | `jobApi.parse()` calls `POST /jobs/parse`; `atsScoreApi.analyze()` now accepts `structuredJD`. |

## Supporting Changes (phone field rename, no AI logic)

| # | File | Description |
|---|------|-------------|
| 19 | `backend/src/services/resumeBuilder/index.ts` | `contact.whatsapp` → `contact.phone` in ATS-friendliness check. |
| 20 | `frontend/src/components/builder-editor/PersonalInfoEditor.tsx` | Phone input now reads/writes `contact.phone`. |
| 21 | `frontend/src/components/builder-live-preview/PersonalInfoPreview.tsx` | Live preview reads `contact.phone`. |
| 22 | `frontend/src/components/resume-preview/ResumePersonalInfo.tsx` | Final resume preview reads `contact.phone`. |
| 23 | `frontend/src/hooks/useResumeActions.ts` | Default resume content uses `phone`. |
| 24 | `frontend/src/hooks/useResumeContent.ts` | Field updater handles `phone`. |
| 25 | `frontend/src/pages/Builder.tsx` | Builder default content uses `phone`. |
| 26 | `frontend/src/utils/pdfExport.ts` | PDF export contact info uses `contact.phone`. |
